// src/controllers/multiLingualVoiceController.js
const multiLingualVoiceService = require('../services/multiLingualVoiceService');
const logger = require('../utils/logger');

/**
 * Controller for handling multi-lingual voice interactions
 */
class MultiLingualVoiceController {
  /**
   * Initialize a multi-lingual voice call
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @returns {Promise<void>}
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
      
      if (!phoneNumber || !campaignId) {
        return res.status(400).json({
          success: false,
          message: 'Phone number and campaign ID are required'
        });
      }
      
      const callResult = await multiLingualVoiceService.initiateMultiLingualCall({
        phoneNumber,
        campaignId,
        leadId,
        voiceType,
        personality,
        language,
        callbackUrl: req.body.callbackUrl
      });
      
      return res.status(200).json({
        success: true,
        call: callResult.call,
        conversation: callResult.conversation,
        audio: callResult.audio
      });
    } catch (error) {
      logger.error('Error initiating multi-lingual voice call:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate call',
        error: error.message
      });
    }
  }

  /**
   * Handle customer response
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @returns {Promise<void>}
   */
  async handleResponse(req, res) {
    try {
      const {
        callId,
        conversationId,
        speechResult,
        audioInput,
        confidence
      } = req.body;
      
      if (!callId || !conversationId || !speechResult) {
        return res.status(400).json({
          success: false,
          message: 'Call ID, conversation ID, and speech result are required'
        });
      }
      
      const responseResult = await multiLingualVoiceService.handleMultiLingualResponse({
        callId,
        conversationId,
        speechResult,
        audioInput,
        confidence
      });
      
      return res.status(200).json({
        success: true,
        audio: responseResult.audio,
        analysis: responseResult.analysis,
        languageSwitch: responseResult.languageSwitch,
        nextAction: responseResult.nextAction
      });
    } catch (error) {
      logger.error('Error handling multi-lingual response:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to handle response',
        error: error.message
      });
    }
  }

  /**
   * Get supported languages
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @returns {Promise<void>}
   */
  async getSupportedLanguages(req, res) {
    try {
      const languages = multiLingualVoiceService.supportedLanguages;
      
      return res.status(200).json({
        success: true,
        languages
      });
    } catch (error) {
      logger.error('Error getting supported languages:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get supported languages',
        error: error.message
      });
    }
  }
}

module.exports = new MultiLingualVoiceController();
