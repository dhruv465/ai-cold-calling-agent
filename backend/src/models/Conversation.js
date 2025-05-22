const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  call_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Calls',
      key: 'id'
    }
  },
  transcript: {
    type: DataTypes.TEXT
  },
  sentiment_score: {
    type: DataTypes.FLOAT
  },
  intent_detected: {
    type: DataTypes.STRING
  },
  key_points: {
    type: DataTypes.TEXT
  },
  ai_analysis: {
    type: DataTypes.TEXT
  }
});

module.exports = Conversation;
