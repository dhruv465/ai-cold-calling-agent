const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CampaignScript = sequelize.define('CampaignScript', {
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
  language: {
    type: DataTypes.STRING,
    defaultValue: 'english'
  },
  script_type: {
    type: DataTypes.ENUM('introduction', 'pitch', 'objection_handling', 'closing', 'callback'),
    defaultValue: 'introduction'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
});

module.exports = CampaignScript;
