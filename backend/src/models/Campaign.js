const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Campaign = sequelize.define('Campaign', {
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
  goal: {
    type: DataTypes.STRING,
    allowNull: false
  },
  target_audience: {
    type: DataTypes.TEXT
  },
  start_date: {
    type: DataTypes.DATE
  },
  end_date: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'paused', 'completed'),
    defaultValue: 'draft'
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  default_language: {
    type: DataTypes.STRING,
    defaultValue: 'english'
  },
  call_limit_per_day: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  call_time_start: {
    type: DataTypes.TIME,
    defaultValue: '09:00:00'
  },
  call_time_end: {
    type: DataTypes.TIME,
    defaultValue: '18:00:00'
  },
  retry_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  retry_interval_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  }
});

module.exports = Campaign;
