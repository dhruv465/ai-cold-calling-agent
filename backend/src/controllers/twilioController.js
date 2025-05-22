// src/controllers/twilioController.js
const twilioService = require('../services/twilioService');
const { Call, Conversation, ConversationSegment } = require('../models');
const logger = require('../utils/logger');

/**
 * Controller for handling Twilio-related requests
 */
class TwilioController {
  /**
   * Initiate an outbound call
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async initiateCall(req, res) {
    try {
      const { campaignLeadId } = req.body;
      
      if (!campaignLeadId) {
        return res.status(400).json({ error: 'Campaign lead ID is required' });
      }
      
      const result = await twilioService.initiateOutboundCall(campaignLeadId);
      
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error initiating call:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Handle Twilio voice webhook
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async handleVoiceWebhook(req, res) {
    try {
      const { callId, retry } = req.query;
      
      if (!callId) {
        return res.status(400).send('Call ID is required');
      }
      
      // Get the call and related data
      const call = await Call.findByPk(callId, {
        include: [
          {
            model: 'CampaignLead',
            include: [
              { model: 'Campaign' },
              { model: 'Lead' }
            ]
          }
        ]
      });
      
      if (!call) {
        return res.status(404).send('Call not found');
      }
      
      // Get appropriate script based on campaign, lead, and call status
      // In a real implementation, this would use AI to determine the best script
      const scriptContent = retry 
        ? "I'm sorry, I didn't hear your response. Could you please tell me if you're interested in our product?"
        : "Hello, this is an automated call from Example Company. We're calling about our new insurance plan that offers great benefits. Are you interested in learning more?";
      
      // Generate TwiML response
      const twiml = twilioService.generateVoiceResponse(callId, scriptContent);
      
      // Log the conversation segment
      await ConversationSegment.create({
        conversation_id: call.Conversation?.id,
        speaker: 'system',
        content: scriptContent,
        timestamp: new Date(),
        sequence_number: 1
      });
      
      res.type('text/xml');
      return res.send(twiml);
    } catch (error) {
      logger.error('Error handling voice webhook:', error);
      return res.status(500).send('An error occurred');
    }
  }

  /**
   * Handle speech recognition results
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async handleSpeechResult(req, res) {
    try {
      const { callId } = req.query;
      const { SpeechResult } = req.body;
      
      if (!callId) {
        return res.status(400).send('Call ID is required');
      }
      
      // Get the call
      const call = await Call.findByPk(callId);
      
      if (!call) {
        return res.status(404).send('Call not found');
      }
      
      // Get or create conversation
      let conversation = await Conversation.findOne({ where: { call_id: callId } });
      
      if (!conversation) {
        conversation = await Conversation.create({
          call_id: callId,
          transcript: SpeechResult || ''
        });
      } else {
        // Update transcript
        await conversation.update({
          transcript: conversation.transcript 
            ? `${conversation.transcript}\nCustomer: ${SpeechResult}` 
            : `Customer: ${SpeechResult}`
        });
      }
      
      // Log the conversation segment
      await ConversationSegment.create({
        conversation_id: conversation.id,
        speaker: 'customer',
        content: SpeechResult || '',
        timestamp: new Date(),
        sequence_number: 2 // This would be dynamically determined in a real implementation
      });
      
      // Process the speech result
      const twiml = twilioService.processSpeechResult(callId, SpeechResult);
      
      res.type('text/xml');
      return res.send(twiml);
    } catch (error) {
      logger.error('Error handling speech result:', error);
      return res.status(500).send('An error occurred');
    }
  }

  /**
   * Handle call status callbacks from Twilio
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async handleStatusCallback(req, res) {
    try {
      const { callId } = req.query;
      const { CallStatus, CallDuration, RecordingUrl } = req.body;
      
      if (!callId) {
        return res.status(400).json({ error: 'Call ID is required' });
      }
      
      // Update call status
      await twilioService.handleCallStatusUpdate(callId, CallStatus, {
        duration: CallDuration,
        recordingUrl: RecordingUrl
      });
      
      return res.status(200).send('Status updated');
    } catch (error) {
      logger.error('Error handling status callback:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Handle recording callbacks from Twilio
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async handleRecordingCallback(req, res) {
    try {
      const { callId } = req.query;
      const { RecordingUrl, RecordingSid } = req.body;
      
      if (!callId) {
        return res.status(400).json({ error: 'Call ID is required' });
      }
      
      // Update call with recording URL
      const call = await Call.findByPk(callId);
      
      if (call) {
        await call.update({
          recording_url: RecordingUrl
        });
      }
      
      return res.status(200).send('Recording processed');
    } catch (error) {
      logger.error('Error handling recording callback:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Schedule a callback for a lead
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async scheduleCallback(req, res) {
    try {
      const { callId, scheduledTime, notes } = req.body;
      
      if (!callId || !scheduledTime) {
        return res.status(400).json({ error: 'Call ID and scheduled time are required' });
      }
      
      // Get the call and related data
      const call = await Call.findByPk(callId, {
        include: [
          {
            model: 'CampaignLead',
            include: [
              { model: 'Campaign' },
              { model: 'Lead' }
            ]
          }
        ]
      });
      
      if (!call) {
        return res.status(404).json({ error: 'Call not found' });
      }
      
      // Schedule the callback
      const result = await twilioService.scheduleCallback({
        call_id: callId,
        lead_id: call.CampaignLead.Lead.id,
        campaign_id: call.CampaignLead.Campaign.id,
        scheduled_time: scheduledTime,
        notes: notes,
        created_by: req.user.id
      });
      
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error scheduling callback:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new TwilioController();
