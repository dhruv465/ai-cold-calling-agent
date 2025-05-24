// src/controllers/settingsController.js
const apiConfigService = require('../services/apiConfigService');
const elevenLabsService = require('../services/elevenLabsService');
const languageDetectionService = require('../services/languageDetectionService');
const logger = require('../utils/logger');

/**
 * Controller for handling API configuration settings
 */
class SettingsController {
  /**
   * Get API credentials
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @returns {Promise<void>}
   */
  async getApiCredentials(req, res) {
    try {
      const credentials = await apiConfigService.loadCredentials();
      
      // Get service status
      const status = apiConfigService.getAllServiceStatus();
      
      return res.status(200).json({
        success: true,
        credentials,
        status
      });
    } catch (error) {
      logger.error('Error getting API credentials:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get API credentials',
        error: error.message
      });
    }
  }

  /**
   * Save API credentials for a service
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @returns {Promise<void>}
   */
  async saveCredentials(req, res) {
    try {
      const { service, credentials } = req.body;
      
      if (!service || !credentials) {
        return res.status(400).json({
          success: false,
          message: 'Service name and credentials are required'
        });
      }
      
      const result = await apiConfigService.setServiceCredentials(service, credentials);
      
      if (result) {
        // Initialize service with new credentials if applicable
        switch (service) {
          case 'elevenlabs':
            await elevenLabsService.initialize(credentials);
            break;
          case 'languageDetection':
            await languageDetectionService.initialize(credentials);
            break;
        }
        
        return res.status(200).json({
          success: true,
          message: `${service} credentials saved successfully`
        });
      } else {
        return res.status(500).json({
          success: false,
          message: `Failed to save ${service} credentials`
        });
      }
    } catch (error) {
      logger.error('Error saving API credentials:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save API credentials',
        error: error.message
      });
    }
  }

  /**
   * Validate API credentials for a service
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @returns {Promise<void>}
   */
  async validateCredentials(req, res) {
    try {
      const { service, credentials } = req.body;
      
      if (!service || !credentials) {
        return res.status(400).json({
          success: false,
          message: 'Service name and credentials are required'
        });
      }
      
      const result = await apiConfigService.validateServiceCredentials(service, credentials);
      
      // Update service status
      apiConfigService.updateServiceStatus(service, {
        valid: result.valid,
        message: result.message,
        lastChecked: new Date().toISOString()
      });
      
      return res.status(200).json({
        success: true,
        valid: result.valid,
        message: result.message
      });
    } catch (error) {
      logger.error('Error validating API credentials:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to validate API credentials',
        error: error.message
      });
    }
  }

  /**
   * Create backup of API credentials
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @returns {Promise<void>}
   */
  async createBackup(req, res) {
    try {
      const backupPath = await apiConfigService.createBackup();
      
      return res.status(200).json({
        success: true,
        message: 'Backup created successfully',
        backupPath
      });
    } catch (error) {
      logger.error('Error creating backup:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create backup',
        error: error.message
      });
    }
  }

  /**
   * Get available backups
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @returns {Promise<void>}
   */
  async getAvailableBackups(req, res) {
    try {
      const backups = await apiConfigService.getAvailableBackups();
      
      return res.status(200).json({
        success: true,
        backups
      });
    } catch (error) {
      logger.error('Error getting available backups:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get available backups',
        error: error.message
      });
    }
  }

  /**
   * Restore from backup
   * @param {object} req - Request object
   * @param {object} res - Response object
   * @returns {Promise<void>}
   */
  async restoreFromBackup(req, res) {
    try {
      const { backupPath } = req.body;
      
      if (!backupPath) {
        return res.status(400).json({
          success: false,
          message: 'Backup path is required'
        });
      }
      
      const result = await apiConfigService.restoreFromBackup(backupPath);
      
      if (result) {
        // Reload credentials and reinitialize services
        const credentials = await apiConfigService.loadCredentials();
        
        if (credentials.elevenlabs) {
          await elevenLabsService.initialize(credentials.elevenlabs);
        }
        
        if (credentials.languageDetection) {
          await languageDetectionService.initialize(credentials.languageDetection);
        }
        
        return res.status(200).json({
          success: true,
          message: 'Credentials restored successfully from backup'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to restore from backup'
        });
      }
    } catch (error) {
      logger.error('Error restoring from backup:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to restore from backup',
        error: error.message
      });
    }
  }
}

module.exports = new SettingsController();
