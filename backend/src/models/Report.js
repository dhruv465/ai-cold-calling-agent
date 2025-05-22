const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  report_type: {
    type: DataTypes.ENUM('call_metrics', 'lead_metrics', 'agent_performance', 'campaign_performance', 'custom'),
    allowNull: false
  },
  parameters: {
    type: DataTypes.JSON
  },
  schedule: {
    type: DataTypes.STRING
  },
  last_generated: {
    type: DataTypes.DATE
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  recipients: {
    type: DataTypes.TEXT
  },
  file_path: {
    type: DataTypes.STRING
  }
});

module.exports = Report;
