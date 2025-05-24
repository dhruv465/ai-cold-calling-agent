// src/api/apiConfigApi.ts
import axios from './axios';

export const apiConfigApi = {
  /**
   * Get API credentials
   * @returns {Promise<any>} API credentials
   */
  getApiCredentials: async () => {
    try {
      const response = await axios.get('/api/settings/api-credentials');
      return response.data;
    } catch (error) {
      console.error('Error getting API credentials:', error);
      throw error;
    }
  },

  /**
   * Save API credentials for a service
   * @param {string} service - Service name
   * @param {object} credentials - Service credentials
   * @returns {Promise<any>} Save result
   */
  saveCredentials: async (service: string, credentials: any) => {
    try {
      const response = await axios.post('/api/settings/api-credentials', {
        service,
        credentials
      });
      return response.data;
    } catch (error) {
      console.error(`Error saving ${service} credentials:`, error);
      throw error;
    }
  },

  /**
   * Validate API credentials for a service
   * @param {string} service - Service name
   * @param {object} credentials - Service credentials to validate
   * @returns {Promise<any>} Validation result
   */
  validateCredentials: async (service: string, credentials: any) => {
    try {
      const response = await axios.post('/api/settings/validate-credentials', {
        service,
        credentials
      });
      return response.data;
    } catch (error) {
      console.error(`Error validating ${service} credentials:`, error);
      throw error;
    }
  },

  /**
   * Create backup of API credentials
   * @returns {Promise<any>} Backup result
   */
  createBackup: async () => {
    try {
      const response = await axios.post('/api/settings/create-backup');
      return response.data;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  },

  /**
   * Get available backups
   * @returns {Promise<any>} Available backups
   */
  getAvailableBackups: async () => {
    try {
      const response = await axios.get('/api/settings/available-backups');
      return response.data;
    } catch (error) {
      console.error('Error getting available backups:', error);
      throw error;
    }
  },

  /**
   * Restore from backup
   * @param {string} backupPath - Path to backup file
   * @returns {Promise<any>} Restore result
   */
  restoreFromBackup: async (backupPath: string) => {
    try {
      const response = await axios.post('/api/settings/restore-backup', {
        backupPath
      });
      return response.data;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw error;
    }
  }
};
