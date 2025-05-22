// src/services/twilioService.js
const twilio = require('twilio');
const config = require('../config/config');
const logger = require('../utils/logger');
const { Call, CampaignLead, Lead, Campaign } = require('../models');

// Initialize Twilio client
const client = twilio(config.twilio.accountSid, config.twilio.authToken);

/**
 * Service for handling Twilio telephony operations
 */
class TwilioService {
  /**
   * Initialize a new outbound call
   * @param {number} campaignLeadId - The ID of the campaign lead to call
   * @returns {Promise<object>} - The created call object
   */
  async initiateOutboundCall(campaignLeadId) {
    try {
      // Get campaign lead with related data
      const campaignLead = await CampaignLead.findByPk(campaignLeadId, {
        include: [
          { model: Lead },
          { model: Campaign }
        ]
      });

      if (!campaignLead) {
        throw new Error(`Campaign lead with ID ${campaignLeadId} not found`);
      }

      // Check if lead is on DND registry
      if (campaignLead.Lead.dnd_status) {
        logger.warn(`Lead ${campaignLead.Lead.id} is on DND registry, skipping call`);
        
        // Update campaign lead status
        await campaignLead.update({
          status: 'failed',
          attempts: campaignLead.attempts + 1,
          last_attempt: new Date(),
          notes: campaignLead.notes ? `${campaignLead.notes}\nSkipped due to DND status` : 'Skipped due to DND status'
        });
        
        return {
          success: false,
          message: 'Lead is on DND registry',
          campaignLeadId
        };
      }

      // Create a new call record
      const call = await Call.create({
        campaign_lead_id: campaignLeadId,
        status: 'initiated',
        start_time: new Date()
      });

      // Make the Twilio call
      const twilioCall = await client.calls.create({
        url: `${config.app.webhookBaseUrl}/api/twilio/voice-response?callId=${call.id}`,
        to: campaignLead.Lead.phone_number,
        from: config.twilio.phoneNumber,
        statusCallback: `${config.app.webhookBaseUrl}/api/twilio/call-status?callId=${call.id}`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
        record: true
      });

      // Update call with Twilio SID
      await call.update({
        twilio_call_sid: twilioCall.sid
      });

      // Update campaign lead
      await campaignLead.update({
        status: 'in_progress',
        attempts: campaignLead.attempts + 1,
        last_attempt: new Date()
      });

      logger.info(`Initiated call to ${campaignLead.Lead.phone_number} with Twilio SID ${twilioCall.sid}`);

      return {
        success: true,
        call,
        twilioSid: twilioCall.sid
      };
    } catch (error) {
      logger.error('Error initiating outbound call:', error);
      throw error;
    }
  }

  /**
   * Generate TwiML for voice response
   * @param {number} callId - The ID of the call
   * @param {string} scriptContent - The script content to read
   * @returns {string} - TwiML response
   */
  generateVoiceResponse(callId, scriptContent) {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    // Add Gather for capturing customer input
    const gather = response.gather({
      input: 'speech',
      action: `${config.app.webhookBaseUrl}/api/twilio/speech-result?callId=${callId}`,
      method: 'POST',
      speechTimeout: 'auto',
      language: 'en-IN' // Can be dynamically set based on lead preference
    });

    // Add Say for TTS
    gather.say({
      voice: 'Polly.Aditi', // Indian English voice
      language: 'en-IN'
    }, scriptContent);

    // If no input is received, redirect to the same endpoint
    response.redirect({
      method: 'POST'
    }, `${config.app.webhookBaseUrl}/api/twilio/voice-response?callId=${callId}&retry=true`);

    return response.toString();
  }

  /**
   * Process speech recognition results
   * @param {number} callId - The ID of the call
   * @param {string} speechResult - The speech recognition result
   * @returns {string} - TwiML response for next action
   */
  processSpeechResult(callId, speechResult) {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    // In a real implementation, this would analyze the speech result
    // and determine the appropriate response based on AI analysis
    
    // For now, we'll just acknowledge and end the call
    response.say({
      voice: 'Polly.Aditi',
      language: 'en-IN'
    }, 'Thank you for your response. We will process this information.');

    // Record the conversation
    response.record({
      action: `${config.app.webhookBaseUrl}/api/twilio/recording-callback?callId=${callId}`,
      method: 'POST',
      maxLength: 120,
      playBeep: false
    });

    response.hangup();

    return response.toString();
  }

  /**
   * Handle call status updates from Twilio
   * @param {number} callId - The ID of the call
   * @param {string} status - The call status from Twilio
   * @param {object} statusData - Additional status data
   * @returns {Promise<object>} - Updated call object
   */
  async handleCallStatusUpdate(callId, status, statusData) {
    try {
      const call = await Call.findByPk(callId);
      
      if (!call) {
        throw new Error(`Call with ID ${callId} not found`);
      }

      let callStatus;
      switch (status) {
        case 'initiated':
        case 'ringing':
          callStatus = 'in-progress';
          break;
        case 'in-progress':
          callStatus = 'in-progress';
          break;
        case 'completed':
          callStatus = 'completed';
          break;
        case 'busy':
        case 'failed':
        case 'no-answer':
          callStatus = 'failed';
          break;
        default:
          callStatus = status;
      }

      // Update call record
      const updateData = {
        status: callStatus
      };

      if (status === 'completed') {
        updateData.end_time = new Date();
        
        // Calculate duration if we have start and end times
        if (call.start_time) {
          const duration = Math.round((new Date() - new Date(call.start_time)) / 1000);
          updateData.duration = duration;
        }
      }

      // Update recording URL if available
      if (statusData && statusData.recordingUrl) {
        updateData.recording_url = statusData.recordingUrl;
      }

      await call.update(updateData);

      // Update campaign lead status
      if (call.campaign_lead_id) {
        const campaignLead = await CampaignLead.findByPk(call.campaign_lead_id);
        if (campaignLead) {
          await campaignLead.update({
            status: callStatus === 'completed' ? 'completed' : 'failed',
            next_attempt: callStatus === 'failed' ? this.calculateNextAttemptTime(campaignLead) : null
          });
        }
      }

      logger.info(`Updated call ${callId} status to ${callStatus}`);

      return call;
    } catch (error) {
      logger.error('Error handling call status update:', error);
      throw error;
    }
  }

  /**
   * Calculate the next attempt time based on campaign settings
   * @param {object} campaignLead - The campaign lead object
   * @returns {Date} - The next attempt time
   */
  calculateNextAttemptTime(campaignLead) {
    // In a real implementation, this would use the campaign's retry interval
    // For now, we'll just add 1 hour
    const nextAttempt = new Date();
    nextAttempt.setHours(nextAttempt.getHours() + 1);
    return nextAttempt;
  }

  /**
   * Schedule a callback for a lead
   * @param {object} callbackData - The callback data
   * @returns {Promise<object>} - The created callback object
   */
  async scheduleCallback(callbackData) {
    try {
      // This would create a Callback record and potentially
      // schedule a task in a queue system for execution at the specified time
      
      // For now, we'll just log the callback
      logger.info(`Scheduled callback for lead ${callbackData.lead_id} at ${callbackData.scheduled_time}`);
      
      return {
        success: true,
        message: 'Callback scheduled successfully',
        callbackData
      };
    } catch (error) {
      logger.error('Error scheduling callback:', error);
      throw error;
    }
  }
}

module.exports = new TwilioService();
