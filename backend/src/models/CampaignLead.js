const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CampaignLead = sequelize.define('CampaignLead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  campaign_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Campaigns',
      key: 'id'
    }
  },
  lead_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Leads',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed', 'scheduled'),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  scheduled_time: {
    type: DataTypes.DATE
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_attempt: {
    type: DataTypes.DATE
  },
  next_attempt: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT
  }
});

module.exports = CampaignLead;
