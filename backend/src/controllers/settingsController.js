const crypto = require('crypto');
const Settings = require('../models/Settings');
const { validateApiKey } = require('../services/apiConfigService');
const logger = require('../utils/logger');

/**
 * Settings Controller
 * Handles all API configuration and settings management
 */

// Encryption settings
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-please-change-in-production';
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';

// Helper function to encrypt sensitive data
const encryptData = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
};

// Helper function to decrypt sensitive data
const decryptData = (iv, encryptedData) => {
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM, 
    Buffer.from(ENCRYPTION_KEY), 
    Buffer.from(iv, 'hex')
  );
  let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

/**
 * Get all settings
 * Returns all settings with sensitive data masked
 */
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.find({ userId: req.user.id });
    
    // Mask sensitive data
    const maskedSettings = settings.map(setting => {
      const settingObj = setting.toObject();
      if (settingObj.isEncrypted && settingObj.value) {
        settingObj.value = '********';
      }
      return settingObj;
    });
    
    res.status(200).json({
      success: true,
      data: maskedSettings
    });
  } catch (error) {
    logger.error(`Error getting settings: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving settings'
    });
  }
};

/**
 * Get settings by category
 * Returns settings for a specific category with sensitive data masked
 */
exports.getSettingsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const settings = await Settings.find({ 
      userId: req.user.id,
      category
    });
    
    // Mask sensitive data
    const maskedSettings = settings.map(setting => {
      const settingObj = setting.toObject();
      if (settingObj.isEncrypted && settingObj.value) {
        settingObj.value = '********';
      }
      return settingObj;
    });
    
    res.status(200).json({
      success: true,
      data: maskedSettings
    });
  } catch (error) {
    logger.error(`Error getting settings by category: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error while retrieving settings'
    });
  }
};

/**
 * Update settings
 * Updates multiple settings at once
 */
exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        error: 'Settings must be provided as an array'
      });
    }
    
    const updatePromises = settings.map(async (setting) => {
      const { key, value, category, isEncrypted = false } = setting;
      
      if (!key || value === undefined || !category) {
        throw new Error('Missing required fields: key, value, or category');
      }
      
      let processedValue = value;
      let encryptionData = {};
      
      // Encrypt sensitive data if needed
      if (isEncrypted && value !== '********') {
        encryptionData = encryptData(value);
        processedValue = JSON.stringify(encryptionData);
      }
      
      // Update or create setting
      const updatedSetting = await Settings.findOneAndUpdate(
        { 
          userId: req.user.id,
          key,
          category
        },
        {
          userId: req.user.id,
          key,
          value: processedValue,
          category,
          isEncrypted,
          updatedAt: Date.now()
        },
        { 
          new: true, 
          upsert: true 
        }
      );
      
      return updatedSetting;
    });
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    logger.error(`Error updating settings: ${error.message}`);
    res.status(500).json({
      success: false,
      error: `Server error while updating settings: ${error.message}`
    });
  }
};

/**
 * Validate API key
 * Tests if an API key is valid for a specific service
 */
exports.validateApiKey = async (req, res) => {
  try {
    const { service, apiKey } = req.body;
    
    if (!service || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Service and API key are required'
      });
    }
    
    const validationResult = await validateApiKey(service, apiKey);
    
    res.status(200).json({
      success: validationResult.success,
      message: validationResult.message,
      data: validationResult.data
    });
  } catch (error) {
    logger.error(`Error validating API key: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error while validating API key'
    });
  }
};

/**
 * Delete setting
 * Removes a specific setting
 */
exports.deleteSetting = async (req, res) => {
  try {
    const { key, category } = req.params;
    
    const deletedSetting = await Settings.findOneAndDelete({
      userId: req.user.id,
      key,
      category
    });
    
    if (!deletedSetting) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting setting: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting setting'
    });
  }
};
