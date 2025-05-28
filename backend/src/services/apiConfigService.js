const axios = require('axios');
const logger = require('../utils/logger');

/**
 * API Configuration Service
 * Handles validation and interaction with external APIs
 */

// Validate API key for different services
exports.validateApiKey = async (service, apiKey) => {
  try {
    switch (service.toLowerCase()) {
      case 'elevenlabs':
        return await validateElevenLabsApiKey(apiKey);
      case 'language_detection':
        return await validateLanguageDetectionApiKey(apiKey);
      case 'twilio':
        return await validateTwilioApiKey(apiKey);
      default:
        return {
          success: false,
          message: `Unsupported service: ${service}`
        };
    }
  } catch (error) {
    logger.error(`API validation error for ${service}: ${error.message}`);
    return {
      success: false,
      message: `Error validating API key: ${error.message}`
    };
  }
};

// Validate ElevenLabs API key
const validateElevenLabsApiKey = async (apiKey) => {
  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey
      }
    });
    
    if (response.status === 200) {
      // Return a subset of the data for UI display
      const voiceCount = response.data.voices ? response.data.voices.length : 0;
      
      return {
        success: true,
        message: `ElevenLabs API key is valid. Found ${voiceCount} voices.`,
        data: {
          voiceCount,
          availableVoices: response.data.voices ? response.data.voices.map(voice => ({
            id: voice.voice_id,
            name: voice.name
          })) : []
        }
      };
    }
    
    return {
      success: false,
      message: 'Invalid ElevenLabs API key'
    };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return {
        success: false,
        message: 'Invalid ElevenLabs API key'
      };
    }
    
    throw error;
  }
};

// Validate Language Detection API key
const validateLanguageDetectionApiKey = async (apiKey) => {
  try {
    // This is a placeholder - in a real implementation, you would validate against your actual language detection API
    // For demo purposes, we'll simulate a successful validation
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'Language detection API key is valid',
      data: {
        supportedLanguages: [
          { code: 'en', name: 'English' },
          { code: 'hi', name: 'Hindi' },
          { code: 'ta', name: 'Tamil' },
          { code: 'te', name: 'Telugu' },
          { code: 'bn', name: 'Bengali' },
          { code: 'mr', name: 'Marathi' },
          { code: 'gu', name: 'Gujarati' },
          { code: 'kn', name: 'Kannada' },
          { code: 'ml', name: 'Malayalam' },
          { code: 'pa', name: 'Punjabi' },
          { code: 'ur', name: 'Urdu' },
          { code: 'or', name: 'Odia' }
        ]
      }
    };
  } catch (error) {
    throw error;
  }
};

// Validate Twilio API key
const validateTwilioApiKey = async (apiKey) => {
  try {
    // Parse the apiKey which should be in format "accountSid:authToken"
    const [accountSid, authToken] = apiKey.split(':');
    
    if (!accountSid || !authToken) {
      return {
        success: false,
        message: 'Invalid Twilio credentials format. Expected "accountSid:authToken"'
      };
    }
    
    // Make a request to Twilio API to validate credentials
    const response = await axios.get(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
      auth: {
        username: accountSid,
        password: authToken
      }
    });
    
    if (response.status === 200) {
      return {
        success: true,
        message: 'Twilio credentials are valid',
        data: {
          accountType: response.data.type,
          accountStatus: response.data.status
        }
      };
    }
    
    return {
      success: false,
      message: 'Invalid Twilio credentials'
    };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return {
        success: false,
        message: 'Invalid Twilio credentials'
      };
    }
    
    throw error;
  }
};

// Get API configuration for a service
exports.getApiConfig = async (userId, service) => {
  try {
    // This would typically fetch from the database
    // For now, we'll return placeholder data
    return {
      success: true,
      data: {
        service,
        configured: false,
        message: 'API configuration not found. Please configure in settings.'
      }
    };
  } catch (error) {
    logger.error(`Error getting API config for ${service}: ${error.message}`);
    return {
      success: false,
      message: `Error retrieving API configuration: ${error.message}`
    };
  }
};
