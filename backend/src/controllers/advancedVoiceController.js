// src/controllers/advancedVoiceController.js
const advancedVoiceService = require('../services/advancedVoiceService');
const logger = require('../utils/logger');
const { Call, Conversation, ConversationSegment } = require('../models');

/**
 * Controller for handling advanced voice interactions
 */
class AdvancedVoiceController {
  /**
   * Initiate an advanced voice call
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async initiateCall(req, res) {
    try {
      const {
        phoneNumber,
        campaignId,
        leadId,
        voiceType,
        personality,
        language
      } = req.body;
      
      if (!phoneNumber || !campaignId || !leadId) {
        return res.status(400).json({ error: 'Phone number, campaign ID, and lead ID are required' });
      }
      
      // Get callback URL from request
      const callbackUrl = req.protocol + '://' + req.get('host');
      
      // Initiate call
      const result = await advancedVoiceService.initiateAdvancedCall({
        phoneNumber,
        campaignId,
        leadId,
        voiceType,
        personality,
        language,
        callbackUrl
      });
      
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error initiating advanced voice call:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Handle voice response webhook
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async handleResponse(req, res) {
    try {
      const { callId, conversationId } = req.query;
      const { SpeechResult, Confidence } = req.body;
      
      if (!callId || !conversationId) {
        return res.status(400).json({ error: 'Call ID and conversation ID are required' });
      }
      
      // Get callback URL from request
      const callbackUrl = req.protocol + '://' + req.get('host');
      
      // Handle response
      const result = await advancedVoiceService.handleAdvancedResponse({
        callId,
        conversationId,
        speechResult: SpeechResult,
        confidence: Confidence,
        callbackUrl
      });
      
      // Return TwiML response
      res.type('text/xml');
      return res.send(result.twiml);
    } catch (error) {
      logger.error('Error handling voice response:', error);
      
      // Return error TwiML
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say('Sorry, there was an error processing your response. Please try again later.');
      twiml.hangup();
      
      res.type('text/xml');
      return res.send(twiml.toString());
    }
  }

  /**
   * Handle no response webhook
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async handleNoResponse(req, res) {
    try {
      const { callId, conversationId } = req.query;
      
      if (!callId || !conversationId) {
        return res.status(400).json({ error: 'Call ID and conversation ID are required' });
      }
      
      // Get callback URL from request
      const callbackUrl = req.protocol + '://' + req.get('host');
      
      // Handle no response
      const result = await advancedVoiceService.handleNoResponse({
        callId,
        conversationId,
        callbackUrl
      });
      
      // Return TwiML response
      res.type('text/xml');
      return res.send(result.twiml);
    } catch (error) {
      logger.error('Error handling no response:', error);
      
      // Return error TwiML
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say('Sorry, there was an error processing your call. Please try again later.');
      twiml.hangup();
      
      res.type('text/xml');
      return res.send(twiml.toString());
    }
  }

  /**
   * End call due to no response
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async endCallNoResponse(req, res) {
    try {
      const { callId, conversationId } = req.query;
      
      if (!callId || !conversationId) {
        return res.status(400).json({ error: 'Call ID and conversation ID are required' });
      }
      
      // End call
      const result = await advancedVoiceService.endCallNoResponse({
        callId,
        conversationId
      });
      
      // Return TwiML response
      res.type('text/xml');
      return res.send(result.twiml);
    } catch (error) {
      logger.error('Error ending call due to no response:', error);
      
      // Return error TwiML
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say('Sorry, there was an error processing your call. Goodbye.');
      twiml.hangup();
      
      res.type('text/xml');
      return res.send(twiml.toString());
    }
  }

  /**
   * Handle call status webhook
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async handleStatus(req, res) {
    try {
      const { callId } = req.query;
      const { CallStatus, CallDuration } = req.body;
      
      if (!callId) {
        return res.status(400).json({ error: 'Call ID is required' });
      }
      
      // Get call
      const call = await Call.findByPk(callId);
      
      if (!call) {
        return res.status(404).json({ error: 'Call not found' });
      }
      
      // Update call status
      await call.update({
        status: CallStatus.toLowerCase(),
        duration: CallDuration ? parseInt(CallDuration) : null,
        ended_at: ['completed', 'failed', 'busy', 'no-answer', 'canceled'].includes(CallStatus.toLowerCase()) ? new Date() : null
      });
      
      // If call ended, update conversation status
      if (['completed', 'failed', 'busy', 'no-answer', 'canceled'].includes(CallStatus.toLowerCase())) {
        const conversation = await Conversation.findOne({
          where: { call_id: callId }
        });
        
        if (conversation) {
          await conversation.update({
            status: 'completed',
            ended_at: new Date()
          });
        }
      }
      
      return res.status(200).send('OK');
    } catch (error) {
      logger.error('Error handling call status:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Handle recording webhook
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async handleRecording(req, res) {
    try {
      const { callId } = req.query;
      const { RecordingUrl, RecordingSid, RecordingDuration } = req.body;
      
      if (!callId) {
        return res.status(400).json({ error: 'Call ID is required' });
      }
      
      // Get call
      const call = await Call.findByPk(callId);
      
      if (!call) {
        return res.status(404).json({ error: 'Call not found' });
      }
      
      // Update call with recording info
      await call.update({
        recording_url: RecordingUrl,
        recording_sid: RecordingSid,
        recording_duration: RecordingDuration ? parseInt(RecordingDuration) : null
      });
      
      return res.status(200).send('OK');
    } catch (error) {
      logger.error('Error handling recording:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get call details
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getCallDetails(req, res) {
    try {
      const { callId } = req.params;
      
      if (!callId) {
        return res.status(400).json({ error: 'Call ID is required' });
      }
      
      // Get call with conversation and segments
      const call = await Call.findByPk(callId, {
        include: [
          {
            model: Conversation,
            include: [
              {
                model: ConversationSegment,
                order: [['sequence', 'ASC']]
              }
            ]
          }
        ]
      });
      
      if (!call) {
        return res.status(404).json({ error: 'Call not found' });
      }
      
      return res.status(200).json(call);
    } catch (error) {
      logger.error('Error getting call details:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get voice options
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getVoiceOptions(req, res) {
    try {
      return res.status(200).json(advancedVoiceService.voiceOptions);
    } catch (error) {
      logger.error('Error getting voice options:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AdvancedVoiceController();
