// src/controllers/aiController.js
const aiService = require('../services/aiService');
const { Campaign, CampaignScript, Lead, KnowledgeBase } = require('../models');
const logger = require('../utils/logger');

/**
 * Controller for handling AI-related requests
 */
class AIController {
  /**
   * Generate a conversation script
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async generateScript(req, res) {
    try {
      const { campaignId, scriptType, language, leadInfo } = req.body;
      
      if (!campaignId || !scriptType) {
        return res.status(400).json({ error: 'Campaign ID and script type are required' });
      }
      
      // Check if campaign exists
      const campaign = await Campaign.findByPk(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      // Generate the script
      const result = await aiService.generateScript({
        campaignId,
        scriptType,
        language: language || campaign.default_language || 'english',
        leadInfo,
        userId: req.user.id
      });
      
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error generating script:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Analyze customer response
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async analyzeResponse(req, res) {
    try {
      const { response, callId } = req.body;
      
      if (!response) {
        return res.status(400).json({ error: 'Response is required' });
      }
      
      // Analyze the response
      const result = await aiService.analyzeResponse(response);
      
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error analyzing response:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Generate a response to a customer question
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async generateQuestionResponse(req, res) {
    try {
      const { question, campaignId } = req.body;
      
      if (!question || !campaignId) {
        return res.status(400).json({ error: 'Question and campaign ID are required' });
      }
      
      // Generate the response
      const result = await aiService.generateQuestionResponse(question, campaignId);
      
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error generating question response:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Handle an objection from a customer
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async handleObjection(req, res) {
    try {
      const { objection, campaignId } = req.body;
      
      if (!objection || !campaignId) {
        return res.status(400).json({ error: 'Objection and campaign ID are required' });
      }
      
      // Handle the objection
      const result = await aiService.handleObjection(objection, campaignId);
      
      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error handling objection:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get knowledge base entries for a campaign
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getKnowledgeBase(req, res) {
    try {
      const { campaignId } = req.params;
      
      if (!campaignId) {
        return res.status(400).json({ error: 'Campaign ID is required' });
      }
      
      // Get knowledge base entries
      const entries = await KnowledgeBase.findAll({
        where: {
          campaign_id: campaignId,
          is_active: true
        }
      });
      
      return res.status(200).json(entries);
    } catch (error) {
      logger.error('Error getting knowledge base:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create a knowledge base entry
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async createKnowledgeBaseEntry(req, res) {
    try {
      const { campaignId, title, category, content, keywords, language } = req.body;
      
      if (!campaignId || !title || !category || !content) {
        return res.status(400).json({ error: 'Campaign ID, title, category, and content are required' });
      }
      
      // Create the entry
      const entry = await KnowledgeBase.create({
        campaign_id: campaignId,
        title,
        category,
        content,
        keywords,
        language: language || 'english',
        is_active: true,
        created_by: req.user.id
      });
      
      return res.status(201).json(entry);
    } catch (error) {
      logger.error('Error creating knowledge base entry:', error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AIController();
