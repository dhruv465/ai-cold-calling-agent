const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Call = sequelize.define('Call', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  campaign_lead_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'CampaignLeads',
      key: 'id'
    }
  },
  twilio_call_sid: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('initiated', 'in-progress', 'completed', 'failed', 'no-answer'),
    defaultValue: 'initiated'
  },
  start_time: {
    type: DataTypes.DATE
  },
  end_time: {
    type: DataTypes.DATE
  },
  duration: {
    type: DataTypes.INTEGER
  },
  recording_url: {
    type: DataTypes.STRING
  },
  outcome: {
    type: DataTypes.ENUM('interested', 'not-interested', 'callback', 'disconnected', 'other'),
    allowNull: true
  },
  agent_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    },
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT
  }
});

module.exports = Call;
