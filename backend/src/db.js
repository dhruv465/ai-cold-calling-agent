const express = require('express');
const path = require('path');
const { sequelize } = require('./src/config/database');
const logger = require('./src/utils/logger');

// Import models
const User = require('./src/models/User');
const Lead = require('./src/models/Lead');
const Campaign = require('./src/models/Campaign');
const CampaignScript = require('./src/models/CampaignScript');
const CampaignLead = require('./src/models/CampaignLead');
const Call = require('./src/models/Call');
const Conversation = require('./src/models/Conversation');
const ConversationSegment = require('./src/models/ConversationSegment');
const Callback = require('./src/models/Callback');
const KnowledgeBase = require('./src/models/KnowledgeBase');
const Report = require('./src/models/Report');
const Notification = require('./src/models/Notification');
const AuditLog = require('./src/models/AuditLog');

// Define model associations
const setupAssociations = () => {
  // User associations
  User.hasMany(Campaign, { foreignKey: 'created_by' });
  User.hasMany(CampaignScript, { foreignKey: 'created_by' });
  User.hasMany(KnowledgeBase, { foreignKey: 'created_by' });
  User.hasMany(Report, { foreignKey: 'created_by' });
  User.hasMany(Notification, { foreignKey: 'user_id' });
  User.hasMany(AuditLog, { foreignKey: 'user_id' });

  // Campaign associations
  Campaign.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  Campaign.hasMany(CampaignScript, { foreignKey: 'campaign_id' });
  Campaign.hasMany(CampaignLead, { foreignKey: 'campaign_id' });
  Campaign.hasMany(Callback, { foreignKey: 'campaign_id' });

  // Lead associations
  Lead.hasMany(CampaignLead, { foreignKey: 'lead_id' });
  Lead.hasMany(Callback, { foreignKey: 'lead_id' });

  // CampaignLead associations
  CampaignLead.belongsTo(Campaign, { foreignKey: 'campaign_id' });
  CampaignLead.belongsTo(Lead, { foreignKey: 'lead_id' });
  CampaignLead.hasMany(Call, { foreignKey: 'campaign_lead_id' });

  // Call associations
  Call.belongsTo(CampaignLead, { foreignKey: 'campaign_lead_id' });
  Call.hasOne(Conversation, { foreignKey: 'call_id' });

  // Conversation associations
  Conversation.belongsTo(Call, { foreignKey: 'call_id' });
  Conversation.hasMany(ConversationSegment, { foreignKey: 'conversation_id' });

  // ConversationSegment associations
  ConversationSegment.belongsTo(Conversation, { foreignKey: 'conversation_id' });

  // Callback associations
  Callback.belongsTo(Lead, { foreignKey: 'lead_id' });
  Callback.belongsTo(Campaign, { foreignKey: 'campaign_id' });

  // Report associations
  Report.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
};

// Initialize database and sync models
const initializeDatabase = async () => {
  try {
    // Set up associations
    setupAssociations();

    // Sync models with database
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized successfully');

    // Create admin user if not exists
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password_hash: 'admin123', // Will be hashed by model hook
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_active: true
      });
      logger.info('Admin user created');
    }
  } catch (error) {
    logger.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase
};
