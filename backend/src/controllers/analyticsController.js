const Call = require('../models/Call');
const CampaignLead = require('../models/CampaignLead');
const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Report = require('../models/Report');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');
const AuditLog = require('../models/AuditLog');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// Get dashboard metrics
exports.getDashboardMetrics = async (req, res) => {
  try {
    // Get date range (default to last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Get call metrics
    const callMetrics = await Call.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      },
      group: ['status']
    });

    // Calculate total calls
    const totalCalls = callMetrics.reduce((sum, metric) => sum + parseInt(metric.dataValues.count), 0);

    // Get successful connections (completed calls)
    const successfulConnections = callMetrics.find(m => m.status === 'completed')?.dataValues.count || 0;

    // Get average call duration
    const avgDurationResult = await Call.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('duration')), 'avg_duration']
      ],
      where: {
        duration: {
          [sequelize.Op.not]: null
        },
        created_at: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      }
    });
    
    const avgDuration = avgDurationResult.dataValues.avg_duration || 0;

    // Get conversation outcomes
    const conversationOutcomes = await Conversation.findAll({
      attributes: [
        'outcome',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      },
      group: ['outcome']
    });

    // Get lead metrics
    const totalLeads = await Lead.count({
      where: {
        created_at: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      }
    });

    const leadsByStatus = await Lead.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      },
      group: ['status']
    });

    // Get lead sources
    const leadSources = await Lead.findAll({
      attributes: [
        'lead_source',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [sequelize.Op.between]: [startDate, endDate]
        },
        lead_source: {
          [sequelize.Op.not]: null
        }
      },
      group: ['lead_source']
    });

    // Get active campaigns
    const activeCampaigns = await Campaign.count({
      where: {
        status: 'active'
      }
    });

    // Get recent calls
    const recentCalls = await Call.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: CampaignLead,
          include: [
            { model: Lead, attributes: ['first_name', 'last_name', 'phone_number'] },
            { model: Campaign, attributes: ['name'] }
          ]
        }
      ]
    });

    res.status(200).json({
      call_metrics: {
        total_calls: totalCalls,
        successful_connections: parseInt(successfulConnections),
        avg_duration: Math.round(avgDuration),
        call_statuses: callMetrics,
        conversation_outcomes: conversationOutcomes
      },
      lead_metrics: {
        total_leads: totalLeads,
        leads_by_status: leadsByStatus,
        lead_sources: leadSources
      },
      campaign_metrics: {
        active_campaigns: activeCampaigns
      },
      recent_activity: {
        recent_calls: recentCalls
      }
    });
  } catch (error) {
    logger.error('Get dashboard metrics error:', error);
    res.status(500).json({ message: 'Error fetching dashboard metrics', error: error.message });
  }
};

// Get call metrics
exports.getCallMetrics = async (req, res) => {
  try {
    const { start_date, end_date, campaign_id } = req.query;
    
    // Set default date range if not provided (last 30 days)
    const endDate = end_date ? new Date(end_date) : new Date();
    const startDate = start_date ? new Date(start_date) : new Date();
    if (!start_date) {
      startDate.setDate(startDate.getDate() - 30);
    }

    // Build where clause
    const whereClause = {
      created_at: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    };

    // Campaign filter
    let campaignFilter = {};
    if (campaign_id) {
      campaignFilter = { campaign_id };
    }

    // Get call metrics by day
    const callsByDay = await sequelize.query(`
      SELECT 
        DATE(calls.created_at) as date,
        COUNT(calls.id) as total_calls,
        SUM(CASE WHEN calls.status = 'completed' THEN 1 ELSE 0 END) as completed_calls,
        SUM(CASE WHEN calls.status = 'no-answer' THEN 1 ELSE 0 END) as no_answer_calls,
        SUM(CASE WHEN calls.status = 'failed' THEN 1 ELSE 0 END) as failed_calls,
        AVG(calls.duration) as avg_duration
      FROM calls
      JOIN campaign_leads ON calls.campaign_lead_id = campaign_leads.id
      WHERE calls.created_at BETWEEN :startDate AND :endDate
      ${campaign_id ? 'AND campaign_leads.campaign_id = :campaignId' : ''}
      GROUP BY date
      ORDER BY date ASC
    `, {
      replacements: { 
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        campaignId: campaign_id
      },
      type: sequelize.QueryTypes.SELECT
    });

    // Get call duration distribution
    const durationDistribution = await sequelize.query(`
      SELECT 
        CASE 
          WHEN duration < 30 THEN '0-30 sec'
          WHEN duration BETWEEN 30 AND 60 THEN '30-60 sec'
          WHEN duration BETWEEN 61 AND 120 THEN '1-2 min'
          WHEN duration BETWEEN 121 AND 300 THEN '2-5 min'
          ELSE '5+ min'
        END as duration_range,
        COUNT(*) as count
      FROM calls
      WHERE duration IS NOT NULL
      AND calls.created_at BETWEEN :startDate AND :endDate
      JOIN campaign_leads ON calls.campaign_lead_id = campaign_leads.id
      ${campaign_id ? 'AND campaign_leads.campaign_id = :campaignId' : ''}
      GROUP BY duration_range
      ORDER BY 
        CASE duration_range
          WHEN '0-30 sec' THEN 1
          WHEN '30-60 sec' THEN 2
          WHEN '1-2 min' THEN 3
          WHEN '2-5 min' THEN 4
          WHEN '5+ min' THEN 5
        END
    `, {
      replacements: { 
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        campaignId: campaign_id
      },
      type: sequelize.QueryTypes.SELECT
    });

    // Get call outcomes
    const callOutcomes = await Conversation.findAll({
      attributes: [
        'outcome',
        [sequelize.fn('COUNT', sequelize.col('conversations.id')), 'count']
      ],
      include: [
        {
          model: Call,
          attributes: [],
          include: [
            {
              model: CampaignLead,
              attributes: [],
              where: campaignFilter,
              required: true
            }
          ],
          where: {
            created_at: {
              [sequelize.Op.between]: [startDate, endDate]
            }
          },
          required: true
        }
      ],
      group: ['outcome']
    });

    // Get hourly distribution
    const hourlyDistribution = await sequelize.query(`
      SELECT 
        HOUR(calls.created_at) as hour,
        COUNT(calls.id) as total_calls,
        SUM(CASE WHEN calls.status = 'completed' THEN 1 ELSE 0 END) as completed_calls
      FROM calls
      JOIN campaign_leads ON calls.campaign_lead_id = campaign_leads.id
      WHERE calls.created_at BETWEEN :startDate AND :endDate
      ${campaign_id ? 'AND campaign_leads.campaign_id = :campaignId' : ''}
      GROUP BY hour
      ORDER BY hour ASC
    `, {
      replacements: { 
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        campaignId: campaign_id
      },
      type: sequelize.QueryTypes.SELECT
    });

    res.status(200).json({
      date_range: {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      },
      calls_by_day: callsByDay,
      duration_distribution: durationDistribution,
      call_outcomes: callOutcomes,
      hourly_distribution: hourlyDistribution
    });
  } catch (error) {
    logger.error('Get call metrics error:', error);
    res.status(500).json({ message: 'Error fetching call metrics', error: error.message });
  }
};

// Get lead metrics
exports.getLeadMetrics = async (req, res) => {
  try {
    const { start_date, end_date, campaign_id } = req.query;
    
    // Set default date range if not provided (last 30 days)
    const endDate = end_date ? new Date(end_date) : new Date();
    const startDate = start_date ? new Date(start_date) : new Date();
    if (!start_date) {
      startDate.setDate(startDate.getDate() - 30);
    }

    // Get leads by source
    const leadsBySource = await Lead.findAll({
      attributes: [
        'lead_source',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [sequelize.Op.between]: [startDate, endDate]
        },
        lead_source: {
          [sequelize.Op.not]: null
        }
      },
      group: ['lead_source']
    });

    // Get leads by status
    const leadsByStatus = await Lead.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      },
      group: ['status']
    });

    // Get leads by day
    const leadsByDay = await sequelize.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(id) as count
      FROM leads
      WHERE created_at BETWEEN :startDate AND :endDate
      GROUP BY date
      ORDER BY date ASC
    `, {
      replacements: { 
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      },
      type: sequelize.QueryTypes.SELECT
    });

    // Get conversion rates by source
    const conversionRatesBySource = await sequelize.query(`
      SELECT 
        leads.lead_source,
        COUNT(DISTINCT leads.id) as total_leads,
        COUNT(DISTINCT CASE WHEN conversations.outcome = 'interested' THEN leads.id END) as converted_leads,
        (COUNT(DISTINCT CASE WHEN conversations.outcome = 'interested' THEN leads.id END) * 100.0 / COUNT(DISTINCT leads.id)) as conversion_rate
      FROM leads
      LEFT JOIN campaign_leads ON leads.id = campaign_leads.lead_id
      LEFT JOIN calls ON campaign_leads.id = calls.campaign_lead_id
      LEFT JOIN conversations ON calls.id = conversations.call_id
      WHERE leads.created_at BETWEEN :startDate AND :endDate
      AND leads.lead_source IS NOT NULL
      ${campaign_id ? 'AND campaign_leads.campaign_id = :campaignId' : ''}
      GROUP BY leads.lead_source
      HAVING COUNT(DISTINCT leads.id) > 0
      ORDER BY conversion_rate DESC
    `, {
      replacements: { 
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        campaignId: campaign_id
      },
      type: sequelize.QueryTypes.SELECT
    });

    // Get DND statistics
    const dndStats = await Lead.findAll({
      attributes: [
        'dnd_status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [sequelize.Op.between]: [startDate, endDate]
        },
        dnd_checked_at: {
          [sequelize.Op.not]: null
        }
      },
      group: ['dnd_status']
    });

    res.status(200).json({
      date_range: {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      },
      leads_by_source: leadsBySource,
      leads_by_status: leadsByStatus,
      leads_by_day: leadsByDay,
      conversion_rates_by_source: conversionRatesBySource,
      dnd_statistics: dndStats
    });
  } catch (error) {
    logger.error('Get lead metrics error:', error);
    res.status(500).json({ message: 'Error fetching lead metrics', error: error.message });
  }
};

// Get agent performance
exports.getAgentPerformance = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // Set default date range if not provided (last 30 days)
    const endDate = end_date ? new Date(end_date) : new Date();
    const startDate = start_date ? new Date(start_date) : new Date();
    if (!start_date) {
      startDate.setDate(startDate.getDate() - 30);
    }

    // Get agent performance metrics
    const agentPerformance = await sequelize.query(`
      SELECT 
        users.id as agent_id,
        users.username,
        CONCAT(users.first_name, ' ', users.last_name) as agent_name,
        COUNT(DISTINCT calls.id) as total_calls,
        SUM(CASE WHEN calls.status = 'completed' THEN 1 ELSE 0 END) as completed_calls,
        AVG(calls.duration) as avg_call_duration,
        COUNT(DISTINCT CASE WHEN conversations.outcome = 'interested' THEN calls.id END) as successful_calls,
        (COUNT(DISTINCT CASE WHEN conversations.outcome = 'interested' THEN calls.id END) * 100.0 / 
          NULLIF(SUM(CASE WHEN calls.status = 'completed' THEN 1 ELSE 0 END), 0)) as success_rate,
        AVG(conversations.sentiment_score) as avg_sentiment
      FROM users
      JOIN campaigns ON users.id = campaigns.created_by
      JOIN campaign_leads ON campaigns.id = campaign_leads.campaign_id
      JOIN calls ON campaign_leads.id = calls.campaign_lead_id
      LEFT JOIN conversations ON calls.id = conversations.call_id
      WHERE calls.created_at BETWEEN :startDate AND :endDate
      GROUP BY users.id, users.username, agent_name
      ORDER BY success_rate DESC
    `, {
      replacements: { 
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      type: sequelize.QueryTypes.SELECT
    });

    // Get agent call volume by day
    const agentCallVolume = await sequelize.query(`
      SELECT 
        users.id as agent_id,
        users.username,
        DATE(calls.created_at) as date,
        COUNT(calls.id) as call_count
      FROM users
      JOIN campaigns ON users.id = campaigns.created_by
      JOIN campaign_leads ON campaigns.id = campaign_leads.campaign_id
      JOIN calls ON campaign_leads.id = calls.campaign_lead_id
      WHERE calls.created_at BETWEEN :startDate AND :endDate
      GROUP BY users.id, users.username, date
      ORDER BY date ASC, users.id ASC
    `, {
      replacements: { 
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      },
      type: sequelize.QueryTypes.SELECT
    });

    res.status(200).json({
      date_range: {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      },
      agent_performance: agentPerformance,
      agent_call_volume: agentCallVolume
    });
  } catch (error) {
    logger.error('Get agent performance error:', error);
    res.status(500).json({ message: 'Error fetching agent performance', error: error.message });
  }
};

// Get campaign comparison
exports.getCampaignComparison = async (req, res) => {
  try {
    const { campaign_ids, start_date, end_date } = req.query;
    
    // Set default date range if not provided (last 90 days)
    const endDate = end_date ? new Date(end_date) : new Date();
    const startDate = start_date ? new Date(start_date) : new Date();
    if (!start_date) {
      startDate.setDate(startDate.getDate() - 90);
    }

    // Parse campaign IDs
    let campaignIdsArray = [];
    if (campaign_ids) {
      campaignIdsArray = campaign_ids.split(',').map(id => parseInt(id.trim()));
    }

    // Build where clause for campaigns
    const campaignWhereClause = campaignIdsArray.length > 0 
      ? { id: { [sequelize.Op.in]: campaignIdsArray } }
      : {};

    // Get campaigns
    const campaigns = await Campaign.findAll({
      where: campaignWhereClause,
      attributes: ['id', 'name', 'goal', 'start_date', 'end_date', 'status']
    });

    if (campaigns.length === 0) {
      return res.status(404).json({ message: 'No campaigns found' });
    }

    // Get campaign IDs for query
    const campaignIds = campaigns.map(c => c.id);

    // Get campaign performance metrics
    const campaignMetrics = await sequelize.query(`
      SELECT 
        campaigns.id as campaign_id,
        campaigns.name as campaign_name,
        COUNT(DISTINCT campaign_leads.lead_id) as total_leads,
        COUNT(DISTINCT calls.id) as total_calls,
        SUM(CASE WHEN calls.status = 'completed' THEN 1 ELSE 0 END) as completed_calls,
        AVG(calls.duration) as avg_call_duration,
        COUNT(DISTINCT CASE WHEN conversations.outcome = 'interested' THEN calls.id END) as successful_calls,
        (COUNT(DISTINCT CASE WHEN conversations.outcome = 'interested' THEN calls.id END) * 100.0 / 
          NULLIF(COUNT(DISTINCT campaign_leads.lead_id), 0)) as conversion_rate,
        AVG(conversations.sentiment_score) as avg_sentiment
      FROM campaigns
      LEFT JOIN campaign_leads ON campaigns.id = campaign_leads.campaign_id
      LEFT JOIN calls ON campaign_leads.id = calls.campaign_lead_id
      LEFT JOIN conversations ON calls.id = conversations.call_id
      WHERE campaigns.id IN (:campaignIds)
      AND (calls.created_at IS NULL OR calls.created_at BETWEEN :startDate AND :endDate)
      GROUP BY campaigns.id, campaigns.name
      ORDER BY conversion_rate DESC
    `, {
      replacements: { 
        campaignIds: campaignIds,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      type: sequelize.QueryTypes.SELECT
    });

    // Get daily performance for each campaign
    const dailyPerformance = await sequelize.query(`
      SELECT 
        campaigns.id as campaign_id,
        campaigns.name as campaign_name,
        DATE(calls.created_at) as date,
        COUNT(calls.id) as call_count,
        COUNT(DISTINCT CASE WHEN conversations.outcome = 'interested' THEN calls.id END) as successful_calls
      FROM campaigns
      JOIN campaign_leads ON campaigns.id = campaign_leads.campaign_id
      JOIN calls ON campaign_leads.id = calls.campaign_lead_id
      LEFT JOIN conversations ON calls.id = conversations.call_id
      WHERE campaigns.id IN (:campaignIds)
      AND calls.created_at BETWEEN :startDate AND :endDate
      GROUP BY campaigns.id, campaigns.name, date
      ORDER BY date ASC, campaigns.id ASC
    `, {
      replacements: { 
        campaignIds: campaignIds,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      },
      type: sequelize.QueryTypes.SELECT
    });

    res.status(200).json({
      date_range: {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      },
      campaigns: campaigns,
      campaign_metrics: campaignMetrics,
      daily_performance: dailyPerformance
    });
  } catch (error) {
    logger.error('Get campaign comparison error:', error);
    res.status(500).json({ message: 'Error fetching campaign comparison', error: error.message });
  }
};

// Get regional distribution
exports.getRegionalDistribution = async (req, res) => {
  try {
    // This is a mock implementation since we don't have actual geographical data
    // In a real implementation, you would extract region from phone numbers or have a separate field
    
    // Mock data for demonstration
    const regionalDistribution = [
      { region: 'Delhi', lead_count: 245, call_count: 198, success_rate: 18.2 },
      { region: 'Mumbai', lead_count: 312, call_count: 287, success_rate: 22.3 },
      { region: 'Bangalore', lead_count: 189, call_count: 156, success_rate: 19.8 },
      { region: 'Chennai', lead_count: 142, call_count: 118, success_rate: 15.3 },
      { region: 'Kolkata', lead_count: 167, call_count: 143, success_rate: 17.5 },
      { region: 'Hyderabad', lead_count: 203, call_count: 178, success_rate: 20.2 },
      { region: 'Pune', lead_count: 156, call_count: 132, success_rate: 16.7 },
      { region: 'Ahmedabad', lead_count: 124, call_count: 98, success_rate: 14.3 },
      { region: 'Jaipur', lead_count: 98, call_count: 76, success_rate: 13.2 },
      { region: 'Lucknow', lead_count: 87, call_count: 65, success_rate: 12.3 }
    ];

    res.status(200).json({
      regional_distribution: regionalDistribution
    });
  } catch (error) {
    logger.error('Get regional distribution error:', error);
    res.status(500).json({ message: 'Error fetching regional distribution', error: error.message });
  }
};

// Generate report
exports.generateReport = async (req, res) => {
  try {
    const { name, description, report_type, parameters, schedule, recipients } = req.body;

    // Validate report type
    const validReportTypes = ['call_metrics', 'lead_metrics', 'agent_performance', 'campaign_comparison'];
    if (!validReportTypes.includes(report_type)) {
      return res.status(400).json({ message: 'Invalid report type' });
    }

    // Create report
    const report = await Report.create({
      name,
      description,
      report_type,
      parameters: parameters || {},
      created_by: req.user.id,
      schedule: schedule || 'none',
      recipients: recipients || null
    });

    // Generate report data
    let reportData;
    switch (report_type) {
      case 'call_metrics':
        reportData = await generateCallMetricsReport(parameters);
        break;
      case 'lead_metrics':
        reportData = await generateLeadMetricsReport(parameters);
        break;
      case 'agent_performance':
        reportData = await generateAgentPerformanceReport(parameters);
        break;
      case 'campaign_comparison':
        reportData = await generateCampaignComparisonReport(parameters);
        break;
      default:
        reportData = { message: 'Report type not implemented' };
    }

    // Update report with last run time
    report.last_run_at = new Date();
    await report.save();

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'GENERATE_REPORT',
      entity_type: 'Report',
      entity_id: report.id,
      details: { report_type, parameters },
      ip_address: req.ip
    });

    res.status(200).json({
      message: 'Report generated successfully',
      report: {
        id: report.id,
        name: report.name,
        report_type: report.report_type,
        created_at: report.created_at,
        last_run_at: report.last_run_at
      },
      data: reportData
    });
  } catch (error) {
    logger.error('Generate report error:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

// Get all reports
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json(reports);
  } catch (error) {
    logger.error('Get reports error:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

// Get report by ID
exports.getReportById = async (req, res) => {
  try {
    const reportId = req.params.id;
    
    const report = await Report.findByPk(reportId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name']
        }
      ]
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Generate report data
    let reportData;
    switch (report.report_type) {
      case 'call_metrics':
        reportData = await generateCallMetricsReport(report.parameters);
        break;
      case 'lead_metrics':
        reportData = await generateLeadMetricsReport(report.parameters);
        break;
      case 'agent_performance':
        reportData = await generateAgentPerformanceReport(report.parameters);
        break;
      case 'campaign_comparison':
        reportData = await generateCampaignComparisonReport(report.parameters);
        break;
      default:
        reportData = { message: 'Report type not implemented' };
    }

    res.status(200).json({
      report,
      data: reportData
    });
  } catch (error) {
    logger.error('Get report by ID error:', error);
    res.status(500).json({ message: 'Error fetching report', error: error.message });
  }
};

// Helper functions for report generation
async function generateCallMetricsReport(parameters) {
  // Extract parameters
  const { start_date, end_date, campaign_id } = parameters || {};
  
  // Set default date range if not provided (last 30 days)
  const endDate = end_date ? new Date(end_date) : new Date();
  const startDate = start_date ? new Date(start_date) : new Date();
  if (!start_date) {
    startDate.setDate(startDate.getDate() - 30);
  }

  // Build where clause
  const whereClause = {
    created_at: {
      [sequelize.Op.between]: [startDate, endDate]
    }
  };

  // Campaign filter
  let campaignFilter = {};
  if (campaign_id) {
    campaignFilter = { campaign_id };
  }

  // Get call metrics
  const callMetrics = await Call.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: whereClause,
    group: ['status']
  });

  // Calculate total calls
  const totalCalls = callMetrics.reduce((sum, metric) => sum + parseInt(metric.dataValues.count), 0);

  // Get successful connections (completed calls)
  const successfulConnections = callMetrics.find(m => m.status === 'completed')?.dataValues.count || 0;

  // Get average call duration
  const avgDurationResult = await Call.findOne({
    attributes: [
      [sequelize.fn('AVG', sequelize.col('duration')), 'avg_duration']
    ],
    where: {
      ...whereClause,
      duration: {
        [sequelize.Op.not]: null
      }
    }
  });
  
  const avgDuration = avgDurationResult.dataValues.avg_duration || 0;

  // Get conversation outcomes
  const conversationOutcomes = await Conversation.findAll({
    attributes: [
      'outcome',
      [sequelize.fn('COUNT', sequelize.col('conversations.id')), 'count']
    ],
    include: [
      {
        model: Call,
        attributes: [],
        include: [
          {
            model: CampaignLead,
            attributes: [],
            where: campaignFilter,
            required: true
          }
        ],
        where: whereClause,
        required: true
      }
    ],
    group: ['outcome']
  });

  return {
    date_range: {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    },
    summary: {
      total_calls: totalCalls,
      successful_connections: parseInt(successfulConnections),
      avg_duration: Math.round(avgDuration),
      success_rate: totalCalls > 0 ? (parseInt(successfulConnections) / totalCalls * 100).toFixed(2) + '%' : '0%'
    },
    call_statuses: callMetrics,
    conversation_outcomes: conversationOutcomes
  };
}

async function generateLeadMetricsReport(parameters) {
  // Extract parameters
  const { start_date, end_date } = parameters || {};
  
  // Set default date range if not provided (last 30 days)
  const endDate = end_date ? new Date(end_date) : new Date();
  const startDate = start_date ? new Date(start_date) : new Date();
  if (!start_date) {
    startDate.setDate(startDate.getDate() - 30);
  }

  // Build where clause
  const whereClause = {
    created_at: {
      [sequelize.Op.between]: [startDate, endDate]
    }
  };

  // Get total leads
  const totalLeads = await Lead.count({
    where: whereClause
  });

  // Get leads by source
  const leadsBySource = await Lead.findAll({
    attributes: [
      'lead_source',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: {
      ...whereClause,
      lead_source: {
        [sequelize.Op.not]: null
      }
    },
    group: ['lead_source']
  });

  // Get leads by status
  const leadsByStatus = await Lead.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: whereClause,
    group: ['status']
  });

  // Get DND statistics
  const dndStats = await Lead.findAll({
    attributes: [
      'dnd_status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: {
      ...whereClause,
      dnd_checked_at: {
        [sequelize.Op.not]: null
      }
    },
    group: ['dnd_status']
  });

  return {
    date_range: {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    },
    summary: {
      total_leads: totalLeads,
      leads_by_status: leadsByStatus,
      leads_by_source: leadsBySource,
      dnd_statistics: dndStats
    }
  };
}

async function generateAgentPerformanceReport(parameters) {
  // Extract parameters
  const { start_date, end_date } = parameters || {};
  
  // Set default date range if not provided (last 30 days)
  const endDate = end_date ? new Date(end_date) : new Date();
  const startDate = start_date ? new Date(start_date) : new Date();
  if (!start_date) {
    startDate.setDate(startDate.getDate() - 30);
  }

  // Get agent performance metrics
  const agentPerformance = await sequelize.query(`
    SELECT 
      users.id as agent_id,
      users.username,
      CONCAT(users.first_name, ' ', users.last_name) as agent_name,
      COUNT(DISTINCT calls.id) as total_calls,
      SUM(CASE WHEN calls.status = 'completed' THEN 1 ELSE 0 END) as completed_calls,
      AVG(calls.duration) as avg_call_duration,
      COUNT(DISTINCT CASE WHEN conversations.outcome = 'interested' THEN calls.id END) as successful_calls,
      (COUNT(DISTINCT CASE WHEN conversations.outcome = 'interested' THEN calls.id END) * 100.0 / 
        NULLIF(SUM(CASE WHEN calls.status = 'completed' THEN 1 ELSE 0 END), 0)) as success_rate,
      AVG(conversations.sentiment_score) as avg_sentiment
    FROM users
    JOIN campaigns ON users.id = campaigns.created_by
    JOIN campaign_leads ON campaigns.id = campaign_leads.campaign_id
    JOIN calls ON campaign_leads.id = calls.campaign_lead_id
    LEFT JOIN conversations ON calls.id = conversations.call_id
    WHERE calls.created_at BETWEEN :startDate AND :endDate
    GROUP BY users.id, users.username, agent_name
    ORDER BY success_rate DESC
  `, {
    replacements: { 
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    },
    type: sequelize.QueryTypes.SELECT
  });

  return {
    date_range: {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    },
    agent_performance: agentPerformance
  };
}

async function generateCampaignComparisonReport(parameters) {
  // Extract parameters
  const { campaign_ids, start_date, end_date } = parameters || {};
  
  // Set default date range if not provided (last 90 days)
  const endDate = end_date ? new Date(end_date) : new Date();
  const startDate = start_date ? new Date(start_date) : new Date();
  if (!start_date) {
    startDate.setDate(startDate.getDate() - 90);
  }

  // Parse campaign IDs
  let campaignIdsArray = [];
  if (campaign_ids) {
    if (Array.isArray(campaign_ids)) {
      campaignIdsArray = campaign_ids.map(id => parseInt(id));
    } else {
      campaignIdsArray = campaign_ids.split(',').map(id => parseInt(id.trim()));
    }
  }

  // Build where clause for campaigns
  const campaignWhereClause = campaignIdsArray.length > 0 
    ? { id: { [sequelize.Op.in]: campaignIdsArray } }
    : {};

  // Get campaigns
  const campaigns = await Campaign.findAll({
    where: campaignWhereClause,
    attributes: ['id', 'name', 'goal', 'start_date', 'end_date', 'status']
  });

  if (campaigns.length === 0) {
    return { message: 'No campaigns found' };
  }

  // Get campaign IDs for query
  const campaignIds = campaigns.map(c => c.id);

  // Get campaign performance metrics
  const campaignMetrics = await sequelize.query(`
    SELECT 
      campaigns.id as campaign_id,
      campaigns.name as campaign_name,
      COUNT(DISTINCT campaign_leads.lead_id) as total_leads,
      COUNT(DISTINCT calls.id) as total_calls,
      SUM(CASE WHEN calls.status = 'completed' THEN 1 ELSE 0 END) as completed_calls,
      AVG(calls.duration) as avg_call_duration,
      COUNT(DISTINCT CASE WHEN conversations.outcome = 'interested' THEN calls.id END) as successful_calls,
      (COUNT(DISTINCT CASE WHEN conversations.outcome = 'interested' THEN calls.id END) * 100.0 / 
        NULLIF(COUNT(DISTINCT campaign_leads.lead_id), 0)) as conversion_rate,
      AVG(conversations.sentiment_score) as avg_sentiment
    FROM campaigns
    LEFT JOIN campaign_leads ON campaigns.id = campaign_leads.campaign_id
    LEFT JOIN calls ON campaign_leads.id = calls.campaign_lead_id
    LEFT JOIN conversations ON calls.id = conversations.call_id
    WHERE campaigns.id IN (:campaignIds)
    AND (calls.created_at IS NULL OR calls.created_at BETWEEN :startDate AND :endDate)
    GROUP BY campaigns.id, campaigns.name
    ORDER BY conversion_rate DESC
  `, {
    replacements: { 
      campaignIds: campaignIds,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    },
    type: sequelize.QueryTypes.SELECT
  });

  return {
    date_range: {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    },
    campaigns: campaigns,
    campaign_metrics: campaignMetrics
  };
}
