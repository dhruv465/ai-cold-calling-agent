// src/services/apiConfigService.js
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../utils/logger');
const encryption = require('../utils/encryption');
const { KnowledgeBase } = require('../models');

/**
 * Service for managing dynamic API configurations
 */
class ApiConfigService {
  constructor() {
    this.configPath = path.join(__dirname, '../../config/api_credentials.json');
    this.credentials = {};
    this.serviceStatus = {};
    
    // Create config directory if it doesn't exist
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Initialize with empty config if file doesn't exist
    if (!fs.existsSync(this.configPath)) {
      this.saveCredentials({});
    }
  }

  /**
   * Initialize the service and load credentials
   * @returns {Promise<boolean>} - Success status
   */
  async initialize() {
    try {
      await this.loadCredentials();
      logger.info('API configuration service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing API configuration service:', error);
      return false;
    }
  }

  /**
   * Load API credentials from storage
   * @returns {Promise<object>} - Loaded credentials
   */
  async loadCredentials() {
    try {
      // Load from file
      if (fs.existsSync(this.configPath)) {
        const fileContent = fs.readFileSync(this.configPath, 'utf8');
        this.credentials = JSON.parse(fileContent);
      } else {
        this.credentials = {};
      }
      
      // Load additional credentials from database
      const dbCredentials = await KnowledgeBase.findOne({
        where: { type: 'api_credentials' }
      });
      
      if (dbCredentials) {
        const dbContent = JSON.parse(dbCredentials.content);
        // Merge with file credentials, database takes precedence
        this.credentials = { ...this.credentials, ...dbContent };
      }
      
      return this.credentials;
    } catch (error) {
      logger.error('Error loading API credentials:', error);
      throw error;
    }
  }

  /**
   * Save API credentials to storage
   * @param {object} credentials - API credentials to save
   * @returns {Promise<boolean>} - Success status
   */
  async saveCredentials(credentials) {
    try {
      // Update in-memory credentials
      this.credentials = { ...this.credentials, ...credentials };
      
      // Save to file
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(this.credentials, null, 2),
        'utf8'
      );
      
      // Save to database for redundancy
      const dbCredentials = await KnowledgeBase.findOne({
        where: { type: 'api_credentials' }
      });
      
      if (dbCredentials) {
        await dbCredentials.update({
          content: JSON.stringify(this.credentials),
          updated_at: new Date()
        });
      } else {
        await KnowledgeBase.create({
          type: 'api_credentials',
          name: 'API Credentials',
          content: JSON.stringify(this.credentials),
          created_at: new Date()
        });
      }
      
      logger.info('API credentials saved successfully');
      return true;
    } catch (error) {
      logger.error('Error saving API credentials:', error);
      return false;
    }
  }

  /**
   * Get credentials for a specific service
   * @param {string} service - Service name
   * @returns {object|null} - Service credentials or null if not found
   */
  getServiceCredentials(service) {
    return this.credentials[service] || null;
  }

  /**
   * Set credentials for a specific service
   * @param {string} service - Service name
   * @param {object} credentials - Service credentials
   * @param {boolean} encrypt - Whether to encrypt sensitive values
   * @returns {Promise<boolean>} - Success status
   */
  async setServiceCredentials(service, credentials, encrypt = true) {
    try {
      // Encrypt sensitive values if requested
      const processedCredentials = encrypt ? 
        this.encryptSensitiveValues(credentials) : 
        credentials;
      
      // Update credentials for the service
      this.credentials[service] = processedCredentials;
      
      // Save updated credentials
      await this.saveCredentials(this.credentials);
      
      return true;
    } catch (error) {
      logger.error(`Error setting credentials for service ${service}:`, error);
      return false;
    }
  }

  /**
   * Encrypt sensitive values in credentials
   * @param {object} credentials - Credentials object
   * @returns {object} - Credentials with encrypted sensitive values
   */
  encryptSensitiveValues(credentials) {
    const sensitiveKeys = ['apiKey', 'secret', 'password', 'token', 'accessToken'];
    const result = { ...credentials };
    
    for (const [key, value] of Object.entries(result)) {
      if (sensitiveKeys.includes(key) && value && typeof value === 'string' && !value.startsWith('enc:')) {
        result[key] = `enc:${encryption.encrypt(value)}`;
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.encryptSensitiveValues(value);
      }
    }
    
    return result;
  }

  /**
   * Decrypt sensitive values in credentials
   * @param {object} credentials - Credentials object
   * @returns {object} - Credentials with decrypted sensitive values
   */
  decryptSensitiveValues(credentials) {
    const result = { ...credentials };
    
    for (const [key, value] of Object.entries(result)) {
      if (typeof value === 'string' && value.startsWith('enc:')) {
        result[key] = encryption.decrypt(value.substring(4));
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.decryptSensitiveValues(value);
      }
    }
    
    return result;
  }

  /**
   * Delete credentials for a specific service
   * @param {string} service - Service name
   * @returns {Promise<boolean>} - Success status
   */
  async deleteServiceCredentials(service) {
    try {
      if (this.credentials[service]) {
        delete this.credentials[service];
        await this.saveCredentials(this.credentials);
      }
      
      return true;
    } catch (error) {
      logger.error(`Error deleting credentials for service ${service}:`, error);
      return false;
    }
  }

  /**
   * Validate credentials for a specific service
   * @param {string} service - Service name
   * @param {object} credentials - Service credentials to validate
   * @returns {Promise<object>} - Validation result
   */
  async validateServiceCredentials(service, credentials) {
    try {
      // Decrypt credentials if encrypted
      const decryptedCredentials = this.decryptSensitiveValues(credentials);
      
      // Validate based on service type
      switch (service) {
        case 'elevenlabs':
          const elevenLabsService = require('./elevenLabsService');
          return await elevenLabsService.validateApiKey(decryptedCredentials.apiKey);
          
        case 'languageDetection':
          const languageDetectionService = require('./languageDetectionService');
          return await languageDetectionService.validateCredentials(decryptedCredentials);
          
        default:
          // Generic validation - just check if required fields exist
          const hasRequiredFields = this.checkRequiredFields(service, decryptedCredentials);
          return {
            valid: hasRequiredFields,
            message: hasRequiredFields ? 
              'Credentials structure appears valid' : 
              'Missing required fields for this service'
          };
      }
    } catch (error) {
      logger.error(`Error validating credentials for service ${service}:`, error);
      return {
        valid: false,
        message: `Validation error: ${error.message}`
      };
    }
  }

  /**
   * Check if credentials have required fields for a service
   * @param {string} service - Service name
   * @param {object} credentials - Service credentials
   * @returns {boolean} - Whether credentials have required fields
   */
  checkRequiredFields(service, credentials) {
    const requiredFields = {
      elevenlabs: ['apiKey'],
      languageDetection: ['apiKey'],
      twilio: ['accountSid', 'authToken', 'phoneNumber'],
      aws: ['accessKeyId', 'secretAccessKey', 'region']
    };
    
    const fields = requiredFields[service] || ['apiKey'];
    
    return fields.every(field => 
      credentials[field] !== undefined && 
      credentials[field] !== null && 
      credentials[field] !== ''
    );
  }

  /**
   * Create backup of current credentials
   * @returns {Promise<string>} - Backup file path
   */
  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(
        path.dirname(this.configPath),
        `api_credentials_backup_${timestamp}.json`
      );
      
      fs.writeFileSync(
        backupPath,
        JSON.stringify(this.credentials, null, 2),
        'utf8'
      );
      
      logger.info(`API credentials backup created at ${backupPath}`);
      return backupPath;
    } catch (error) {
      logger.error('Error creating API credentials backup:', error);
      throw error;
    }
  }

  /**
   * Restore credentials from backup
   * @param {string} backupPath - Path to backup file
   * @returns {Promise<boolean>} - Success status
   */
  async restoreFromBackup(backupPath) {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }
      
      const backupContent = fs.readFileSync(backupPath, 'utf8');
      const backupCredentials = JSON.parse(backupContent);
      
      await this.saveCredentials(backupCredentials);
      
      logger.info(`API credentials restored from ${backupPath}`);
      return true;
    } catch (error) {
      logger.error('Error restoring API credentials from backup:', error);
      return false;
    }
  }

  /**
   * Get list of available backups
   * @returns {Promise<Array>} - List of backup files
   */
  async getAvailableBackups() {
    try {
      const configDir = path.dirname(this.configPath);
      const files = fs.readdirSync(configDir);
      
      const backups = files
        .filter(file => file.startsWith('api_credentials_backup_'))
        .map(file => {
          const filePath = path.join(configDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            path: filePath,
            filename: file,
            created: stats.mtime,
            size: stats.size
          };
        })
        .sort((a, b) => b.created - a.created); // Sort by date, newest first
      
      return backups;
    } catch (error) {
      logger.error('Error getting available backups:', error);
      return [];
    }
  }

  /**
   * Update service status
   * @param {string} service - Service name
   * @param {object} status - Service status
   * @returns {void}
   */
  updateServiceStatus(service, status) {
    this.serviceStatus[service] = {
      ...status,
      lastUpdated: new Date()
    };
  }

  /**
   * Get status for all services
   * @returns {object} - Service status map
   */
  getAllServiceStatus() {
    return this.serviceStatus;
  }

  /**
   * Get status for a specific service
   * @param {string} service - Service name
   * @returns {object|null} - Service status or null if not found
   */
  getServiceStatus(service) {
    return this.serviceStatus[service] || null;
  }
}

module.exports = new ApiConfigService();
