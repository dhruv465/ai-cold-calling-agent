const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ConversationSegment = sequelize.define('ConversationSegment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Conversations',
      key: 'id'
    }
  },
  speaker: {
    type: DataTypes.ENUM('system', 'agent', 'customer'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  sentiment_score: {
    type: DataTypes.FLOAT
  },
  intent: {
    type: DataTypes.STRING
  },
  sequence_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = ConversationSegment;
