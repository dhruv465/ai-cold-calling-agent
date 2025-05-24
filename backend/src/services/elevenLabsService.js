// src/services/elevenLabsService.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../utils/logger');
const encryption = require('../utils/encryption');

/**
 * Service for ElevenLabs voice synthesis integration
 */
class ElevenLabsService {
  constructor() {
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.apiKey = null;
    this.voiceOptions = {
      male: {
        english: {
          professional: 'pNInz6obpgDQGcFmaJgB', // Adam
          friendly: 'ErXwobaYiN019PkySvjV',     // Antoni
          empathetic: 'VR6AewLTigWG4xSOukaG'    // Arnold
        },
        hindi: {
          professional: 'custom-hindi-male-professional',
          friendly: 'custom-hindi-male-friendly',
          empathetic: 'custom-hindi-male-empathetic'
        }
      },
      female: {
        english: {
          professional: 'EXAVITQu4vr4xnSDxMaL', // Bella
          friendly: '21m00Tcm4TlvDq8ikWAM',     // Rachel
          empathetic: 'D38z5RcWu1voky8WS1ja'    // Domi
        },
        hindi: {
          professional: 'custom-hindi-female-professional',
          friendly: 'custom-hindi-female-friendly',
          empathetic: 'custom-hindi-female-empathetic'
        }
      }
    };
    
    // Voice settings presets
    this.voiceSettings = {
      default: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      },
      clear: {
        stability: 0.7,
        similarity_boost: 0.8,
        style: 0.0,
        use_speaker_boost: true
      },
      expressive: {
        stability: 0.4,
        similarity_boost: 0.6,
        style: 0.5,
        use_speaker_boost: true
      }
    };
    
    // Cache for voice models to improve performance
    this.voiceModelsCache = new Map();
    
    // Cache for audio files to reduce API calls
    this.audioCache = new Map();
    
    // Create cache directory if it doesn't exist
    this.cacheDir = path.join(__dirname, '../../cache/elevenlabs');
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Initialize the service with API credentials
   * @param {object} credentials - API credentials from settings
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(credentials) {
    try {
      if (!credentials || !credentials.apiKey) {
        logger.error('ElevenLabs API key not provided');
        return false;
      }
      
      // Decrypt API key if encrypted
      this.apiKey = credentials.apiKey.startsWith('enc:') 
        ? encryption.decrypt(credentials.apiKey.substring(4))
        : credentials.apiKey;
      
      // Test API connection
      const isValid = await this.validateApiKey();
      
      if (isValid) {
        logger.info('ElevenLabs service initialized successfully');
        
        // Load available voices
        await this.loadVoiceModels();
        
        return true;
      } else {
        logger.error('Invalid ElevenLabs API key');
        return false;
      }
    } catch (error) {
      logger.error('Error initializing ElevenLabs service:', error);
      return false;
    }
  }

  /**
   * Validate API key with ElevenLabs
   * @returns {Promise<boolean>} - Validation result
   */
  async validateApiKey() {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      
      return response.status === 200;
    } catch (error) {
      logger.error('Error validating ElevenLabs API key:', error);
      return false;
    }
  }

  /**
   * Load available voice models from ElevenLabs
   * @returns {Promise<Array>} - List of available voices
   */
  async loadVoiceModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      
      if (response.status === 200 && response.data.voices) {
        // Cache voice models
        response.data.voices.forEach(voice => {
          this.voiceModelsCache.set(voice.voice_id, {
            id: voice.voice_id,
            name: voice.name,
            description: voice.description,
            preview_url: voice.preview_url,
            labels: voice.labels || {}
          });
        });
        
        logger.info(`Loaded ${response.data.voices.length} voice models from ElevenLabs`);
        return response.data.voices;
      }
      
      return [];
    } catch (error) {
      logger.error('Error loading ElevenLabs voice models:', error);
      return [];
    }
  }

  /**
   * Get voice ID based on type, language, and personality
   * @param {string} voiceType - Voice type (male/female)
   * @param {string} language - Language (english/hindi/etc)
   * @param {string} personality - Personality (professional/friendly/empathetic)
   * @returns {string} - ElevenLabs voice ID
   */
  getVoiceId(voiceType, language, personality) {
    // Default to English professional female if not found
    return this.voiceOptions[voiceType]?.[language]?.[personality] || 
           this.voiceOptions.female.english.professional;
  }

  /**
   * Generate speech from text
   * @param {object} params - Speech generation parameters
   * @returns {Promise<object>} - Speech generation result
   */
  async generateSpeech(params) {
    try {
      const {
        text,
        voiceId,
        voiceType = 'female',
        language = 'english',
        personality = 'professional',
        settings = 'default',
        outputFormat = 'mp3',
        cacheKey = null
      } = params;
      
      // Check if API key is available
      if (!this.apiKey) {
        throw new Error('ElevenLabs API key not initialized');
      }
      
      // Generate cache key if not provided
      const speechCacheKey = cacheKey || this.generateCacheKey(text, voiceId || this.getVoiceId(voiceType, language, personality), settings);
      
      // Check cache first
      const cachedAudio = await this.getFromCache(speechCacheKey);
      if (cachedAudio) {
        logger.info(`Using cached audio for key: ${speechCacheKey}`);
        return {
          success: true,
          audioUrl: cachedAudio.url,
          duration: cachedAudio.duration,
          fromCache: true
        };
      }
      
      // Determine voice ID
      const finalVoiceId = voiceId || this.getVoiceId(voiceType, language, personality);
      
      // Get voice settings
      const voiceSettings = this.voiceSettings[settings] || this.voiceSettings.default;
      
      // Make API request to ElevenLabs
      const response = await axios({
        method: 'post',
        url: `${this.baseUrl}/text-to-speech/${finalVoiceId}`,
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        data: {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings
        },
        responseType: 'arraybuffer'
      });
      
      if (response.status === 200) {
        // Save audio to cache
        const audioFilePath = path.join(this.cacheDir, `${speechCacheKey}.${outputFormat}`);
        fs.writeFileSync(audioFilePath, response.data);
        
        // Estimate duration (rough estimate based on text length)
        const duration = this.estimateSpeechDuration(text);
        
        // Save to memory cache
        this.audioCache.set(speechCacheKey, {
          url: audioFilePath,
          duration,
          createdAt: new Date()
        });
        
        return {
          success: true,
          audioUrl: audioFilePath,
          duration,
          fromCache: false
        };
      } else {
        throw new Error(`ElevenLabs API returned status ${response.status}`);
      }
    } catch (error) {
      logger.error('Error generating speech with ElevenLabs:', error);
      throw error;
    }
  }

  /**
   * Generate cache key for speech
   * @param {string} text - Text content
   * @param {string} voiceId - Voice ID
   * @param {string} settings - Voice settings preset
   * @returns {string} - Cache key
   */
  generateCacheKey(text, voiceId, settings) {
    // Create a hash of the text to use as cache key
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(text).digest('hex');
    return `${voiceId}_${settings}_${hash}`;
  }

  /**
   * Get audio from cache
   * @param {string} cacheKey - Cache key
   * @returns {Promise<object|null>} - Cached audio or null
   */
  async getFromCache(cacheKey) {
    // Check memory cache first
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey);
    }
    
    // Check file cache
    const audioFilePath = path.join(this.cacheDir, `${cacheKey}.mp3`);
    if (fs.existsSync(audioFilePath)) {
      // Estimate duration (will be approximate)
      const stats = fs.statSync(audioFilePath);
      const fileSizeInBytes = stats.size;
      // Rough estimate: ~12KB per second for MP3 at 128kbps
      const duration = Math.ceil(fileSizeInBytes / 12000);
      
      // Add to memory cache
      const cacheEntry = {
        url: audioFilePath,
        duration,
        createdAt: stats.mtime
      };
      
      this.audioCache.set(cacheKey, cacheEntry);
      return cacheEntry;
    }
    
    return null;
  }

  /**
   * Estimate speech duration in seconds
   * @param {string} text - Text to speak
   * @returns {number} - Estimated duration in seconds
   */
  estimateSpeechDuration(text) {
    // Average speaking rate is about 150 words per minute
    // So about 2.5 words per second
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 2.5);
  }

  /**
   * Get available voice models
   * @returns {Promise<Array>} - List of available voices
   */
  async getAvailableVoices() {
    try {
      // If cache is empty, load voices
      if (this.voiceModelsCache.size === 0) {
        await this.loadVoiceModels();
      }
      
      return Array.from(this.voiceModelsCache.values());
    } catch (error) {
      logger.error('Error getting available voices:', error);
      return [];
    }
  }

  /**
   * Get voice settings presets
   * @returns {object} - Voice settings presets
   */
  getVoiceSettingsPresets() {
    return this.voiceSettings;
  }

  /**
   * Clean up old cache files
   * @param {number} maxAgeHours - Maximum age in hours
   * @returns {Promise<number>} - Number of files deleted
   */
  async cleanupCache(maxAgeHours = 24) {
    try {
      const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
      const now = new Date();
      let deletedCount = 0;
      
      // Clean memory cache
      for (const [key, entry] of this.audioCache.entries()) {
        if (now - entry.createdAt > maxAgeMs) {
          this.audioCache.delete(key);
          deletedCount++;
        }
      }
      
      // Clean file cache
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        const filePath = path.join(this.cacheDir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtime > maxAgeMs) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
      
      logger.info(`Cleaned up ${deletedCount} old cache files`);
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up cache:', error);
      return 0;
    }
  }
}

module.exports = new ElevenLabsService();
