const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^\+?[0-9]{10,15}$/
    }
  },
  lead_source: {
    type: DataTypes.STRING
  },
  language_preference: {
    type: DataTypes.STRING,
    defaultValue: 'english'
  },
  status: {
    type: DataTypes.ENUM('new', 'contacted', 'qualified', 'converted', 'rejected'),
    defaultValue: 'new'
  },
  dnd_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  dnd_checked_at: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

module.exports = Lead;
