const mongoose = require('mongoose');

/**
 * Settings Schema
 * Stores all configurable settings for the application
 * Includes API keys, service configurations, and user preferences
 */
const SettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  key: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['elevenlabs', 'language_detection', 'twilio', 'general', 'notification', 'compliance']
  },
  isEncrypted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure uniqueness of settings per user
SettingsSchema.index({ userId: 1, key: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Settings', SettingsSchema);
