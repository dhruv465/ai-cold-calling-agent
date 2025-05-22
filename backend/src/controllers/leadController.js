const Lead = require('../models/Lead');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');
const AuditLog = require('../models/AuditLog');
const fs = require('fs');
const csv = require('csv-parser');
const axios = require('axios');
const config = require('../config/config');

// Create a new lead
exports.createLead = async (req, res) => {
  try {
    const { first_name, last_name, phone_number, email, language_preference, lead_source, notes } = req.body;

    // Validate phone number (basic validation for Indian numbers)
    const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Create lead
    const lead = await Lead.create({
      first_name,
      last_name,
      phone_number,
      email,
      language_preference: language_preference || 'english',
      lead_source,
      notes,
      status: 'new'
    });

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'CREATE_LEAD',
      entity_type: 'Lead',
      entity_id: lead.id,
      details: { first_name, last_name, phone_number, email, lead_source },
      ip_address: req.ip
    });

    res.status(201).json({
      message: 'Lead created successfully',
      lead
    });
  } catch (error) {
    logger.error('Create lead error:', error);
    res.status(500).json({ message: 'Error creating lead', error: error.message });
  }
};

// Get all leads with pagination and filtering
exports.getAllLeads = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, source, language, search } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where clause for filtering
    const whereClause = {};
    if (status) whereClause.status = status;
    if (source) whereClause.lead_source = source;
    if (language) whereClause.language_preference = language;
    if (search) {
      whereClause[sequelize.Op.or] = [
        { first_name: { [sequelize.Op.like]: `%${search}%` } },
        { last_name: { [sequelize.Op.like]: `%${search}%` } },
        { phone_number: { [sequelize.Op.like]: `%${search}%` } },
        { email: { [sequelize.Op.like]: `%${search}%` } }
      ];
    }

    // Get leads with pagination
    const { count, rows: leads } = await Lead.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      leads,
      totalLeads: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    logger.error('Get all leads error:', error);
    res.status(500).json({ message: 'Error fetching leads', error: error.message });
  }
};

// Get lead by ID
exports.getLeadById = async (req, res) => {
  try {
    const leadId = req.params.id;
    
    const lead = await Lead.findByPk(leadId);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json(lead);
  } catch (error) {
    logger.error('Get lead by ID error:', error);
    res.status(500).json({ message: 'Error fetching lead', error: error.message });
  }
};

// Update lead
exports.updateLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const { first_name, last_name, phone_number, email, language_preference, lead_source, status, notes } = req.body;

    const lead = await Lead.findByPk(leadId);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Validate phone number if provided
    if (phone_number) {
      const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
      if (!phoneRegex.test(phone_number)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }
    }

    // Update fields
    if (first_name) lead.first_name = first_name;
    if (last_name) lead.last_name = last_name;
    if (phone_number) lead.phone_number = phone_number;
    if (email) lead.email = email;
    if (language_preference) lead.language_preference = language_preference;
    if (lead_source) lead.lead_source = lead_source;
    if (status) lead.status = status;
    if (notes) lead.notes = notes;

    await lead.save();

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'UPDATE_LEAD',
      entity_type: 'Lead',
      entity_id: leadId,
      details: { updated: { first_name, last_name, phone_number, email, language_preference, lead_source, status, notes } },
      ip_address: req.ip
    });

    res.status(200).json({
      message: 'Lead updated successfully',
      lead
    });
  } catch (error) {
    logger.error('Update lead error:', error);
    res.status(500).json({ message: 'Error updating lead', error: error.message });
  }
};

// Delete lead
exports.deleteLead = async (req, res) => {
  try {
    const leadId = req.params.id;

    const lead = await Lead.findByPk(leadId);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    await lead.destroy();

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'DELETE_LEAD',
      entity_type: 'Lead',
      entity_id: leadId,
      details: { phone_number: lead.phone_number, email: lead.email },
      ip_address: req.ip
    });

    res.status(200).json({ message: 'Lead deleted successfully' });
  } catch (error) {
    logger.error('Delete lead error:', error);
    res.status(500).json({ message: 'Error deleting lead', error: error.message });
  }
};

// Import leads from CSV
exports.importLeadsFromCSV = async (req, res) => {
  try {
    if (!req.files || !req.files.csv) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    const csvFile = req.files.csv;
    const uploadPath = `/tmp/${Date.now()}_${csvFile.name}`;

    // Save the file temporarily
    await csvFile.mv(uploadPath);

    const results = [];
    const errors = [];
    let successCount = 0;

    // Process CSV file
    fs.createReadStream(uploadPath)
      .pipe(csv())
      .on('data', async (data) => {
        try {
          // Validate required fields
          if (!data.phone_number) {
            errors.push({ row: data, error: 'Phone number is required' });
            return;
          }

          // Validate phone number
          const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
          if (!phoneRegex.test(data.phone_number)) {
            errors.push({ row: data, error: 'Invalid phone number format' });
            return;
          }

          // Check for duplicate
          const existingLead = await Lead.findOne({ where: { phone_number: data.phone_number } });
          if (existingLead) {
            errors.push({ row: data, error: 'Lead with this phone number already exists' });
            return;
          }

          // Create lead
          const lead = await Lead.create({
            first_name: data.first_name || null,
            last_name: data.last_name || null,
            phone_number: data.phone_number,
            email: data.email || null,
            language_preference: data.language_preference || 'english',
            lead_source: data.lead_source || 'csv_import',
            notes: data.notes || null,
            status: 'new'
          });

          results.push(lead);
          successCount++;
        } catch (error) {
          errors.push({ row: data, error: error.message });
        }
      })
      .on('end', async () => {
        // Clean up temp file
        fs.unlinkSync(uploadPath);

        // Log the action
        await AuditLog.create({
          user_id: req.user.id,
          action: 'IMPORT_LEADS_CSV',
          entity_type: 'Lead',
          entity_id: null,
          details: { 
            filename: csvFile.name, 
            total_processed: results.length + errors.length,
            success_count: successCount,
            error_count: errors.length
          },
          ip_address: req.ip
        });

        res.status(200).json({
          message: 'CSV import completed',
          success_count: successCount,
          error_count: errors.length,
          errors: errors.length > 0 ? errors : undefined
        });
      });
  } catch (error) {
    logger.error('Import leads from CSV error:', error);
    res.status(500).json({ message: 'Error importing leads from CSV', error: error.message });
  }
};

// Import leads from external API
exports.importLeadsFromAPI = async (req, res) => {
  try {
    const { api_url, api_key, params } = req.body;

    if (!api_url) {
      return res.status(400).json({ message: 'API URL is required' });
    }

    // Set up request headers
    const headers = {};
    if (api_key) {
      headers['Authorization'] = `Bearer ${api_key}`;
    }

    // Make API request
    const response = await axios.get(api_url, {
      headers,
      params
    });

    if (!response.data || !Array.isArray(response.data)) {
      return res.status(400).json({ message: 'Invalid API response format' });
    }

    const results = [];
    const errors = [];
    let successCount = 0;

    // Process leads from API
    for (const item of response.data) {
      try {
        // Map API response to lead fields (adjust based on actual API response structure)
        const leadData = {
          first_name: item.first_name || item.firstName || null,
          last_name: item.last_name || item.lastName || null,
          phone_number: item.phone_number || item.phoneNumber || item.phone || null,
          email: item.email || null,
          language_preference: item.language || item.language_preference || 'english',
          lead_source: item.source || 'api_import',
          notes: item.notes || null
        };

        // Validate required fields
        if (!leadData.phone_number) {
          errors.push({ data: item, error: 'Phone number is required' });
          continue;
        }

        // Validate phone number
        const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
        if (!phoneRegex.test(leadData.phone_number)) {
          errors.push({ data: item, error: 'Invalid phone number format' });
          continue;
        }

        // Check for duplicate
        const existingLead = await Lead.findOne({ where: { phone_number: leadData.phone_number } });
        if (existingLead) {
          errors.push({ data: item, error: 'Lead with this phone number already exists' });
          continue;
        }

        // Create lead
        const lead = await Lead.create({
          ...leadData,
          status: 'new'
        });

        results.push(lead);
        successCount++;
      } catch (error) {
        errors.push({ data: item, error: error.message });
      }
    }

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'IMPORT_LEADS_API',
      entity_type: 'Lead',
      entity_id: null,
      details: { 
        api_url, 
        total_processed: results.length + errors.length,
        success_count: successCount,
        error_count: errors.length
      },
      ip_address: req.ip
    });

    res.status(200).json({
      message: 'API import completed',
      success_count: successCount,
      error_count: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    logger.error('Import leads from API error:', error);
    res.status(500).json({ message: 'Error importing leads from API', error: error.message });
  }
};

// Check DND status for a single lead
exports.checkDNDStatus = async (req, res) => {
  try {
    const { lead_id, phone_number } = req.body;

    if (!lead_id && !phone_number) {
      return res.status(400).json({ message: 'Either lead_id or phone_number is required' });
    }

    let lead;
    if (lead_id) {
      lead = await Lead.findByPk(lead_id);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }
    } else {
      lead = await Lead.findOne({ where: { phone_number } });
      if (!lead) {
        return res.status(404).json({ message: 'Lead with this phone number not found' });
      }
    }

    // Mock DND check for now (in production, this would call the actual DND registry API)
    // In a real implementation, you would use the config.dndRegistryApiUrl and config.dndRegistryApiKey
    const isDndRegistered = await mockDndCheck(lead.phone_number);

    // Update lead with DND status
    lead.dnd_status = isDndRegistered;
    lead.dnd_checked_at = new Date();
    await lead.save();

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'CHECK_DND_STATUS',
      entity_type: 'Lead',
      entity_id: lead.id,
      details: { phone_number: lead.phone_number, dnd_status: isDndRegistered },
      ip_address: req.ip
    });

    res.status(200).json({
      message: 'DND status checked successfully',
      lead_id: lead.id,
      phone_number: lead.phone_number,
      dnd_status: isDndRegistered,
      checked_at: lead.dnd_checked_at
    });
  } catch (error) {
    logger.error('Check DND status error:', error);
    res.status(500).json({ message: 'Error checking DND status', error: error.message });
  }
};

// Batch check DND status for multiple leads
exports.batchCheckDNDStatus = async (req, res) => {
  try {
    const { lead_ids } = req.body;

    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return res.status(400).json({ message: 'Valid lead_ids array is required' });
    }

    const results = [];
    const errors = [];

    // Process leads in batches to avoid overloading the DND API
    const batchSize = 10;
    for (let i = 0; i < lead_ids.length; i += batchSize) {
      const batch = lead_ids.slice(i, i + batchSize);
      
      // Get leads for this batch
      const leads = await Lead.findAll({
        where: {
          id: {
            [sequelize.Op.in]: batch
          }
        }
      });

      // Check DND status for each lead in the batch
      for (const lead of leads) {
        try {
          // Mock DND check (in production, this would call the actual DND registry API)
          const isDndRegistered = await mockDndCheck(lead.phone_number);

          // Update lead with DND status
          lead.dnd_status = isDndRegistered;
          lead.dnd_checked_at = new Date();
          await lead.save();

          results.push({
            lead_id: lead.id,
            phone_number: lead.phone_number,
            dnd_status: isDndRegistered
          });
        } catch (error) {
          errors.push({
            lead_id: lead.id,
            phone_number: lead.phone_number,
            error: error.message
          });
        }
      }

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < lead_ids.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'BATCH_CHECK_DND_STATUS',
      entity_type: 'Lead',
      entity_id: null,
      details: { 
        total_processed: results.length + errors.length,
        success_count: results.length,
        error_count: errors.length
      },
      ip_address: req.ip
    });

    res.status(200).json({
      message: 'Batch DND status check completed',
      success_count: results.length,
      error_count: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    logger.error('Batch check DND status error:', error);
    res.status(500).json({ message: 'Error checking batch DND status', error: error.message });
  }
};

// Mock function for DND check (replace with actual API call in production)
async function mockDndCheck(phoneNumber) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // For testing purposes, consider numbers ending with 0, 1, or 2 as DND registered
  const lastDigit = phoneNumber.slice(-1);
  return ['0', '1', '2'].includes(lastDigit);
}
