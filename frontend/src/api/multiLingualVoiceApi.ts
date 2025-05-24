import axios from './axios';

export const multiLingualVoiceApi = {
  /**
   * Initiate a multi-lingual voice call
   * @param {object} params - Call parameters
   * @returns {Promise<any>} Call result
   */
  initiateCall: async (params: any) => {
    try {
      const response = await axios.post('/api/voice/initiate-call', params);
      return response.data;
    } catch (error) {
      console.error('Error initiating multi-lingual voice call:', error);
      throw error;
    }
  },

  /**
   * Handle customer response
   * @param {object} params - Response parameters
   * @returns {Promise<any>} Response result
   */
  handleResponse: async (params: any) => {
    try {
      const response = await axios.post('/api/voice/handle-response', params);
      return response.data;
    } catch (error) {
      console.error('Error handling multi-lingual response:', error);
      throw error;
    }
  },

  /**
   * Get supported languages
   * @returns {Promise<any>} Supported languages
   */
  getSupportedLanguages: async () => {
    try {
      const response = await axios.get('/api/voice/supported-languages');
      return response.data;
    } catch (error) {
      console.error('Error getting supported languages:', error);
      throw error;
    }
  }
};
