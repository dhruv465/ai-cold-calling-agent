const Campaign = require('../models/Campaign');
const CampaignScript = require('../models/CampaignScript');
const CampaignLead = require('../models/CampaignLead');
const Lead = require('../models/Lead');
const Call = require('../models/Call');
const Conversation = require('../models/Conversation');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');
const AuditLog = require('../models/AuditLog');

// Create a new campaign
exports.createCampaign = async (req, res) => {
  try {
    const { name, description, goal, start_date, end_date, status } = req.body;

    // Create campaign
    const campaign = await Campaign.create({
      name,
      description,
      goal,
      start_date,
      end_date,
      status: status || 'draft',
      created_by: req.user.id
    });

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'CREATE_CAMPAIGN',
      entity_type: 'Campaign',
      entity_id: campaign.id,
      details: { name, goal, start_date, end_date, status },
      ip_address: req.ip
    });

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign
    });
  } catch (error) {
    logger.error('Create campaign error:', error);
    res.status(500).json({ message: 'Error creating campaign', error: error.message });
  }
};

// Get all campaigns with pagination and filtering
exports.getAllCampaigns = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where clause for filtering
    const whereClause = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause[sequelize.Op.or] = [
        { name: { [sequelize.Op.like]: `%${search}%` } },
        { description: { [sequelize.Op.like]: `%${search}%` } },
        { goal: { [sequelize.Op.like]: `%${search}%` } }
      ];
    }

    // Get campaigns with pagination
    const { count, rows: campaigns } = await Campaign.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: sequelize.models.User,
          as: 'creator',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name']
        }
      ]
    });

    res.status(200).json({
      campaigns,
      totalCampaigns: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    logger.error('Get all campaigns error:', error);
    res.status(500).json({ message: 'Error fetching campaigns', error: error.message });
  }
};

// Get campaign by ID
exports.getCampaignById = async (req, res) => {
  try {
    const campaignId = req.params.id;
    
    const campaign = await Campaign.findByPk(campaignId, {
      include: [
        {
          model: sequelize.models.User,
          as: 'creator',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name']
        }
      ]
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.status(200).json(campaign);
  } catch (error) {
    logger.error('Get campaign by ID error:', error);
    res.status(500).json({ message: 'Error fetching campaign', error: error.message });
  }
};

// Update campaign
exports.updateCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { name, description, goal, start_date, end_date, status } = req.body;

    const campaign = await Campaign.findByPk(campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Update fields
    if (name) campaign.name = name;
    if (description !== undefined) campaign.description = description;
    if (goal) campaign.goal = goal;
    if (start_date) campaign.start_date = start_date;
    if (end_date !== undefined) campaign.end_date = end_date;
    if (status) campaign.status = status;

    await campaign.save();

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'UPDATE_CAMPAIGN',
      entity_type: 'Campaign',
      entity_id: campaignId,
      details: { updated: { name, description, goal, start_date, end_date, status } },
      ip_address: req.ip
    });

    res.status(200).json({
      message: 'Campaign updated successfully',
      campaign
    });
  } catch (error) {
    logger.error('Update campaign error:', error);
    res.status(500).json({ message: 'Error updating campaign', error: error.message });
  }
};

// Delete campaign
exports.deleteCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;

    const campaign = await Campaign.findByPk(campaignId);

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if campaign has active calls
    const activeCalls = await Call.findOne({
      include: [
        {
          model: CampaignLead,
          where: { campaign_id: campaignId },
          required: true
        }
      ],
      where: {
        status: {
          [sequelize.Op.in]: ['initiated', 'ringing', 'in-progress']
        }
      }
    });

    if (activeCalls) {
      return res.status(400).json({ message: 'Cannot delete campaign with active calls' });
    }

    // Instead of hard delete, set status to 'completed'
    campaign.status = 'completed';
    await campaign.save();

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'DELETE_CAMPAIGN',
      entity_type: 'Campaign',
      entity_id: campaignId,
      details: { name: campaign.name },
      ip_address: req.ip
    });

    res.status(200).json({ message: 'Campaign marked as completed' });
  } catch (error) {
    logger.error('Delete campaign error:', error);
    res.status(500).json({ message: 'Error deleting campaign', error: error.message });
  }
};

// Add campaign script
exports.addCampaignScript = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { language, script_content, version, is_active } = req.body;

    // Check if campaign exists
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Create script
    const script = await CampaignScript.create({
      campaign_id: campaignId,
      language,
      script_content,
      version: version || 1,
      is_active: is_active !== undefined ? is_active : true,
      created_by: req.user.id
    });

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'ADD_CAMPAIGN_SCRIPT',
      entity_type: 'CampaignScript',
      entity_id: script.id,
      details: { campaign_id: campaignId, language, version },
      ip_address: req.ip
    });

    res.status(201).json({
      message: 'Campaign script added successfully',
      script
    });
  } catch (error) {
    logger.error('Add campaign script error:', error);
    res.status(500).json({ message: 'Error adding campaign script', error: error.message });
  }
};

// Get campaign scripts
exports.getCampaignScripts = async (req, res) => {
  try {
    const campaignId = req.params.id;
    
    // Check if campaign exists
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Get scripts
    const scripts = await CampaignScript.findAll({
      where: { campaign_id: campaignId },
      order: [['language', 'ASC'], ['version', 'DESC']]
    });

    res.status(200).json(scripts);
  } catch (error) {
    logger.error('Get campaign scripts error:', error);
    res.status(500).json({ message: 'Error fetching campaign scripts', error: error.message });
  }
};

// Update campaign script
exports.updateCampaignScript = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const scriptId = req.params.scriptId;
    const { script_content, version, is_active } = req.body;

    // Check if campaign exists
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Find script
    const script = await CampaignScript.findOne({
      where: {
        id: scriptId,
        campaign_id: campaignId
      }
    });

    if (!script) {
      return res.status(404).json({ message: 'Campaign script not found' });
    }

    // Update fields
    if (script_content) script.script_content = script_content;
    if (version) script.version = version;
    if (is_active !== undefined) script.is_active = is_active;

    await script.save();

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'UPDATE_CAMPAIGN_SCRIPT',
      entity_type: 'CampaignScript',
      entity_id: scriptId,
      details: { campaign_id: campaignId, updated: { script_content, version, is_active } },
      ip_address: req.ip
    });

    res.status(200).json({
      message: 'Campaign script updated successfully',
      script
    });
  } catch (error) {
    logger.error('Update campaign script error:', error);
    res.status(500).json({ message: 'Error updating campaign script', error: error.message });
  }
};

// Add leads to campaign
exports.addLeadsToCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { lead_ids, priority, scheduled_time } = req.body;

    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return res.status(400).json({ message: 'Valid lead_ids array is required' });
    }

    // Check if campaign exists
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if campaign is active or draft
    if (!['active', 'draft'].includes(campaign.status)) {
      return res.status(400).json({ message: 'Cannot add leads to a completed or paused campaign' });
    }

    // Get existing campaign leads to avoid duplicates
    const existingCampaignLeads = await CampaignLead.findAll({
      where: {
        campaign_id: campaignId,
        lead_id: {
          [sequelize.Op.in]: lead_ids
        }
      },
      attributes: ['lead_id']
    });

    const existingLeadIds = existingCampaignLeads.map(cl => cl.lead_id);
    const newLeadIds = lead_ids.filter(id => !existingLeadIds.includes(id));

    if (newLeadIds.length === 0) {
      return res.status(400).json({ message: 'All leads are already in this campaign' });
    }

    // Add leads to campaign
    const campaignLeads = [];
    for (const leadId of newLeadIds) {
      // Check if lead exists
      const lead = await Lead.findByPk(leadId);
      if (!lead) {
        continue; // Skip non-existent leads
      }

      // Check DND status
      if (lead.dnd_status) {
        continue; // Skip DND registered leads
      }

      const campaignLead = await CampaignLead.create({
        campaign_id: campaignId,
        lead_id: leadId,
        status: 'pending',
        priority: priority || 0,
        scheduled_time: scheduled_time || null
      });

      campaignLeads.push(campaignLead);
    }

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'ADD_LEADS_TO_CAMPAIGN',
      entity_type: 'Campaign',
      entity_id: campaignId,
      details: { 
        total_leads: lead_ids.length,
        added_leads: campaignLeads.length,
        skipped_leads: lead_ids.length - campaignLeads.length
      },
      ip_address: req.ip
    });

    res.status(200).json({
      message: 'Leads added to campaign successfully',
      total_leads: lead_ids.length,
      added_leads: campaignLeads.length,
      skipped_leads: lead_ids.length - campaignLeads.length
    });
  } catch (error) {
    logger.error('Add leads to campaign error:', error);
    res.status(500).json({ message: 'Error adding leads to campaign', error: error.message });
  }
};

// Get campaign leads
exports.getCampaignLeads = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    // Check if campaign exists
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Build where clause for filtering
    const whereClause = { campaign_id: campaignId };
    if (status) whereClause.status = status;

    // Get campaign leads with pagination
    const { count, rows: campaignLeads } = await CampaignLead.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['priority', 'DESC'], ['created_at', 'ASC']],
      include: [
        {
          model: Lead,
          attributes: ['id', 'first_name', 'last_name', 'phone_number', 'email', 'language_preference', 'dnd_status']
        }
      ]
    });

    res.status(200).json({
      campaignLeads,
      totalLeads: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    logger.error('Get campaign leads error:', error);
    res.status(500).json({ message: 'Error fetching campaign leads', error: error.message });
  }
};

// Remove lead from campaign
exports.removeLeadFromCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const leadId = req.params.leadId;

    // Check if campaign exists
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Find campaign lead
    const campaignLead = await CampaignLead.findOne({
      where: {
        campaign_id: campaignId,
        lead_id: leadId
      }
    });

    if (!campaignLead) {
      return res.status(404).json({ message: 'Lead not found in this campaign' });
    }

    // Check if there are active calls for this campaign lead
    const activeCalls = await Call.findOne({
      where: {
        campaign_lead_id: campaignLead.id,
        status: {
          [sequelize.Op.in]: ['initiated', 'ringing', 'in-progress']
        }
      }
    });

    if (activeCalls) {
      return res.status(400).json({ message: 'Cannot remove lead with active calls' });
    }

    // Remove lead from campaign
    await campaignLead.destroy();

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'REMOVE_LEAD_FROM_CAMPAIGN',
      entity_type: 'CampaignLead',
      entity_id: campaignLead.id,
      details: { campaign_id: campaignId, lead_id: leadId },
      ip_address: req.ip
    });

    res.status(200).json({ message: 'Lead removed from campaign successfully' });
  } catch (error) {
    logger.error('Remove lead from campaign error:', error);
    res.status(500).json({ message: 'Error removing lead from campaign', error: error.message });
  }
};

// Get campaign analytics
exports.getCampaignAnalytics = async (req, res) => {
  try {
    const campaignId = req.params.id;

    // Check if campaign exists
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Get campaign leads count
    const totalLeads = await CampaignLead.count({
      where: { campaign_id: campaignId }
    });

    // Get leads by status
    const leadsByStatus = await CampaignLead.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { campaign_id: campaignId },
      group: ['status']
    });

    // Get call statistics
    const callStats = await Call.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('duration')), 'avg_duration']
      ],
      include: [
        {
          model: CampaignLead,
          where: { campaign_id: campaignId },
          attributes: []
        }
      ],
      group: ['status']
    });

    // Get conversation outcomes
    const conversationOutcomes = await Conversation.findAll({
      attributes: [
        'outcome',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      include: [
        {
          model: Call,
          attributes: [],
          include: [
            {
              model: CampaignLead,
              where: { campaign_id: campaignId },
              attributes: []
            }
          ]
        }
      ],
      group: ['outcome']
    });

    // Calculate conversion rate
    const interestedCount = conversationOutcomes.find(o => o.outcome === 'interested')?.count || 0;
    const conversionRate = totalLeads > 0 ? (interestedCount / totalLeads) * 100 : 0;

    res.status(200).json({
      campaign_id: campaignId,
      campaign_name: campaign.name,
      total_leads: totalLeads,
      leads_by_status: leadsByStatus,
      call_statistics: callStats,
      conversation_outcomes: conversationOutcomes,
      conversion_rate: conversionRate.toFixed(2) + '%'
    });
  } catch (error) {
    logger.error('Get campaign analytics error:', error);
    res.status(500).json({ message: 'Error fetching campaign analytics', error: error.message });
  }
};

// Get campaign performance over time
exports.getCampaignPerformance = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { timeframe = 'daily' } = req.query;

    // Check if campaign exists
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Define time grouping based on timeframe
    let timeGroup;
    switch (timeframe) {
      case 'hourly':
        timeGroup = "DATE_FORMAT(calls.created_at, '%Y-%m-%d %H:00:00')";
        break;
      case 'daily':
        timeGroup = "DATE(calls.created_at)";
        break;
      case 'weekly':
        timeGroup = "DATE_FORMAT(calls.created_at, '%Y-%u')";
        break;
      case 'monthly':
        timeGroup = "DATE_FORMAT(calls.created_at, '%Y-%m')";
        break;
      default:
        timeGroup = "DATE(calls.created_at)";
    }

    // Get call performance over time
    const callPerformance = await sequelize.query(`
      SELECT 
        ${timeGroup} as time_period,
        COUNT(calls.id) as total_calls,
        SUM(CASE WHEN calls.status = 'completed' THEN 1 ELSE 0 END) as completed_calls,
        SUM(CASE WHEN calls.status = 'no-answer' THEN 1 ELSE 0 END) as no_answer_calls,
        SUM(CASE WHEN calls.status = 'failed' THEN 1 ELSE 0 END) as failed_calls,
        AVG(calls.duration) as avg_duration
      FROM calls
      JOIN campaign_leads ON calls.campaign_lead_id = campaign_leads.id
      WHERE campaign_leads.campaign_id = :campaignId
      GROUP BY time_period
      ORDER BY time_period ASC
    `, {
      replacements: { campaignId },
      type: sequelize.QueryTypes.SELECT
    });

    // Get conversation outcomes over time
    const conversationPerformance = await sequelize.query(`
      SELECT 
        ${timeGroup} as time_period,
        SUM(CASE WHEN conversations.outcome = 'interested' THEN 1 ELSE 0 END) as interested,
        SUM(CASE WHEN conversations.outcome = 'not-interested' THEN 1 ELSE 0 END) as not_interested,
        SUM(CASE WHEN conversations.outcome = 'callback' THEN 1 ELSE 0 END) as callback,
        SUM(CASE WHEN conversations.outcome = 'disconnected' THEN 1 ELSE 0 END) as disconnected,
        AVG(conversations.sentiment_score) as avg_sentiment
      FROM conversations
      JOIN calls ON conversations.call_id = calls.id
      JOIN campaign_leads ON calls.campaign_lead_id = campaign_leads.id
      WHERE campaign_leads.campaign_id = :campaignId
      GROUP BY time_period
      ORDER BY time_period ASC
    `, {
      replacements: { campaignId },
      type: sequelize.QueryTypes.SELECT
    });

    res.status(200).json({
      campaign_id: campaignId,
      campaign_name: campaign.name,
      timeframe,
      call_performance: callPerformance,
      conversation_performance: conversationPerformance
    });
  } catch (error) {
    logger.error('Get campaign performance error:', error);
    res.status(500).json({ message: 'Error fetching campaign performance', error: error.message });
  }
};
