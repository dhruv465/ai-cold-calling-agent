// src/services/languageDetectionService.js
const config = require('../config/config');
const logger = require('../utils/logger');
const { KnowledgeBase } = require('../models');

/**
 * Service for real-time language detection and adaptation
 */
class LanguageDetectionService {
  constructor() {
    // Supported languages with their codes and confidence thresholds
    this.supportedLanguages = {
      'english': { code: 'en-IN', threshold: 0.6 },
      'hindi': { code: 'hi-IN', threshold: 0.6 },
      'tamil': { code: 'ta-IN', threshold: 0.7 },
      'telugu': { code: 'te-IN', threshold: 0.7 },
      'bengali': { code: 'bn-IN', threshold: 0.7 },
      'marathi': { code: 'mr-IN', threshold: 0.7 },
      'gujarati': { code: 'gu-IN', threshold: 0.7 },
      'kannada': { code: 'kn-IN', threshold: 0.7 },
      'malayalam': { code: 'ml-IN', threshold: 0.7 },
      'punjabi': { code: 'pa-IN', threshold: 0.7 },
      'odia': { code: 'or-IN', threshold: 0.7 },
      'assamese': { code: 'as-IN', threshold: 0.7 }
    };
    
    // Language detection cache for performance optimization
    this.detectionCache = new Map();
    
    // Context window for continuous monitoring
    this.contextWindowSize = 5;
  }

  /**
   * Initialize the language detection service with API credentials
   * @param {object} credentials - API credentials from settings
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(credentials) {
    try {
      this.apiCredentials = credentials;
      
      // Load language models and patterns from knowledge base
      const languagePatterns = await KnowledgeBase.findOne({
        where: { type: 'language_patterns' }
      });
      
      if (languagePatterns) {
        this.languagePatterns = JSON.parse(languagePatterns.content);
      } else {
        // Initialize with default patterns if not found
        this.languagePatterns = this.getDefaultLanguagePatterns();
        
        // Save default patterns to knowledge base
        await KnowledgeBase.create({
          type: 'language_patterns',
          name: 'Language Detection Patterns',
          content: JSON.stringify(this.languagePatterns),
          created_at: new Date()
        });
      }
      
      logger.info('Language detection service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing language detection service:', error);
      return false;
    }
  }

  /**
   * Detect language from text with high accuracy
   * @param {string} text - Text to analyze
   * @param {object} options - Detection options
   * @returns {Promise<object>} - Detection result
   */
  async detectLanguage(text, options = {}) {
    try {
      const {
        previousLanguage = null,
        conversationContext = [],
        minConfidence = 0.6
      } = options;
      
      // Check cache for identical text to optimize performance
      const cacheKey = `${text}_${previousLanguage || 'none'}`;
      if (this.detectionCache.has(cacheKey)) {
        return this.detectionCache.get(cacheKey);
      }
      
      // In a production environment, this would call a sophisticated
      // language detection API. For now, we'll use pattern matching
      // and simulate API behavior.
      
      // Prepare context for analysis
      const contextualText = [
        ...conversationContext.slice(-this.contextWindowSize),
        text
      ].join(' ');
      
      // Detect language using patterns
      const detectionResult = this.detectLanguageFromPatterns(text);
      
      // Apply contextual analysis for improved accuracy
      const contextualResult = this.applyContextualAnalysis(
        detectionResult,
        previousLanguage,
        conversationContext
      );
      
      // Apply confidence threshold
      if (contextualResult.confidence < minConfidence) {
        // Fall back to previous language if confidence is too low
        if (previousLanguage && this.supportedLanguages[previousLanguage]) {
          contextualResult.language = previousLanguage;
          contextualResult.code = this.supportedLanguages[previousLanguage].code;
          contextualResult.confidence = 0.8; // Assume high confidence for continuity
          contextualResult.fallback = true;
        }
      }
      
      // Store in cache for future use (with 5-minute expiration)
      this.detectionCache.set(cacheKey, contextualResult);
      setTimeout(() => this.detectionCache.delete(cacheKey), 5 * 60 * 1000);
      
      return contextualResult;
    } catch (error) {
      logger.error('Error detecting language:', error);
      
      // Fallback to safe default
      return {
        language: 'english',
        code: 'en-IN',
        confidence: 0.8,
        fallback: true,
        error: error.message
      };
    }
  }

  /**
   * Detect language switches within a conversation
   * @param {string} text - Current text
   * @param {string} previousLanguage - Previous detected language
   * @param {array} conversationHistory - Previous conversation segments
   * @returns {Promise<object>} - Language switch detection result
   */
  async detectLanguageSwitch(text, previousLanguage, conversationHistory) {
    try {
      // Detect current language
      const currentLanguageResult = await this.detectLanguage(text, {
        previousLanguage,
        conversationContext: conversationHistory.map(segment => segment.content)
      });
      
      // Check if language has changed
      const hasLanguageSwitched = previousLanguage && 
                                 currentLanguageResult.language !== previousLanguage &&
                                 currentLanguageResult.confidence >= this.supportedLanguages[currentLanguageResult.language].threshold;
      
      return {
        detected: hasLanguageSwitched,
        from: previousLanguage,
        to: currentLanguageResult.language,
        confidence: currentLanguageResult.confidence,
        currentLanguage: currentLanguageResult
      };
    } catch (error) {
      logger.error('Error detecting language switch:', error);
      return {
        detected: false,
        error: error.message
      };
    }
  }

  /**
   * Monitor conversation for language switches in real-time
   * @param {object} params - Monitoring parameters
   * @returns {Promise<object>} - Monitoring result
   */
  async monitorConversation(params) {
    try {
      const {
        conversationId,
        currentSegment,
        previousSegments = [],
        currentLanguage
      } = params;
      
      // Extract text content
      const text = currentSegment.content;
      
      // Detect language switch
      const switchResult = await this.detectLanguageSwitch(
        text,
        currentLanguage,
        previousSegments
      );
      
      // If language switch detected, update conversation language
      if (switchResult.detected) {
        logger.info(`Language switch detected in conversation ${conversationId}: ${switchResult.from} -> ${switchResult.to}`);
        
        // In a production system, this would update the conversation record
        // and trigger appropriate adaptations
      }
      
      return {
        ...switchResult,
        conversationId
      };
    } catch (error) {
      logger.error('Error monitoring conversation:', error);
      return {
        detected: false,
        error: error.message
      };
    }
  }

  /**
   * Detect language from patterns (simulating API call)
   * @param {string} text - Text to analyze
   * @returns {object} - Detection result
   */
  detectLanguageFromPatterns(text) {
    // Initialize scores for each language
    const scores = {};
    Object.keys(this.supportedLanguages).forEach(lang => {
      scores[lang] = 0;
    });
    
    // Normalize text for analysis
    const normalizedText = text.toLowerCase();
    
    // Check for language-specific patterns
    Object.entries(this.languagePatterns).forEach(([language, patterns]) => {
      patterns.forEach(pattern => {
        if (normalizedText.includes(pattern.toLowerCase())) {
          scores[language] += 1;
        }
      });
    });
    
    // Check for script-based indicators (simplified)
    if (/[\u0900-\u097F]/.test(text)) { // Devanagari script (Hindi)
      scores.hindi += 5;
    } else if (/[\u0980-\u09FF]/.test(text)) { // Bengali script
      scores.bengali += 5;
    } else if (/[\u0A80-\u0AFF]/.test(text)) { // Gujarati script
      scores.gujarati += 5;
    } else if (/[\u0B00-\u0B7F]/.test(text)) { // Odia script
      scores.odia += 5;
    } else if (/[\u0A00-\u0A7F]/.test(text)) { // Gurmukhi script (Punjabi)
      scores.punjabi += 5;
    } else if (/[\u0C00-\u0C7F]/.test(text)) { // Telugu script
      scores.telugu += 5;
    } else if (/[\u0C80-\u0CFF]/.test(text)) { // Kannada script
      scores.kannada += 5;
    } else if (/[\u0D00-\u0D7F]/.test(text)) { // Malayalam script
      scores.malayalam += 5;
    } else if (/[\u0B80-\u0BFF]/.test(text)) { // Tamil script
      scores.tamil += 5;
    } else if (/[\u0D80-\u0DFF]/.test(text)) { // Sinhala script
      scores.sinhala += 5;
    } else if (/[a-zA-Z]/.test(text)) { // Latin script (English)
      scores.english += 3;
    }
    
    // Find language with highest score
    let highestScore = 0;
    let detectedLanguage = 'english'; // Default to English
    
    Object.entries(scores).forEach(([language, score]) => {
      if (score > highestScore) {
        highestScore = score;
        detectedLanguage = language;
      }
    });
    
    // Calculate confidence based on score difference and text length
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const confidence = totalScore > 0 ? 
                      Math.min(0.5 + (highestScore / totalScore) * 0.5, 0.99) : 
                      0.5;
    
    return {
      language: detectedLanguage,
      code: this.supportedLanguages[detectedLanguage].code,
      confidence,
      scores
    };
  }

  /**
   * Apply contextual analysis to improve detection accuracy
   * @param {object} initialResult - Initial detection result
   * @param {string} previousLanguage - Previous language
   * @param {array} conversationContext - Conversation history
   * @returns {object} - Enhanced detection result
   */
  applyContextualAnalysis(initialResult, previousLanguage, conversationContext) {
    let result = { ...initialResult };
    
    // If previous language exists and confidence is moderate, boost confidence
    if (previousLanguage && 
        previousLanguage === result.language && 
        result.confidence >= 0.4 && 
        result.confidence < 0.8) {
      result.confidence = Math.min(result.confidence + 0.2, 0.95);
      result.contextBoosted = true;
    }
    
    // If language differs from previous with low confidence, reduce confidence
    if (previousLanguage && 
        previousLanguage !== result.language && 
        result.confidence < 0.7) {
      result.confidence = result.confidence * 0.8;
      result.contextReduced = true;
    }
    
    // Analyze conversation history for language patterns
    if (conversationContext && conversationContext.length > 0) {
      // This would be more sophisticated in production
      // For now, just a simple implementation
    }
    
    return result;
  }

  /**
   * Get default language patterns for detection
   * @returns {object} - Default language patterns
   */
  getDefaultLanguagePatterns() {
    return {
      english: [
        'hello', 'yes', 'no', 'thank', 'please', 'sorry',
        'good', 'bad', 'what', 'when', 'where', 'how',
        'who', 'why', 'the', 'and', 'but', 'or', 'if',
        'because', 'although', 'however', 'therefore'
      ],
      hindi: [
        'नमस्ते', 'हां', 'नहीं', 'धन्यवाद', 'कृपया', 'माफ़',
        'अच्छा', 'बुरा', 'क्या', 'कब', 'कहां', 'कैसे',
        'कौन', 'क्यों', 'और', 'लेकिन', 'या', 'अगर',
        'क्योंकि', 'हालांकि', 'इसलिए'
      ],
      tamil: [
        'வணக்கம்', 'ஆம்', 'இல்லை', 'நன்றி', 'தயவுசெய்து',
        'மன்னிக்கவும்', 'நல்லது', 'கெட்டது', 'என்ன', 'எப்போது',
        'எங்கே', 'எப்படி', 'யார்', 'ஏன்', 'மற்றும்', 'ஆனால்'
      ],
      telugu: [
        'నమస్కారం', 'అవును', 'కాదు', 'ధన్యవాదాలు', 'దయచేసి',
        'క్షమించండి', 'మంచిది', 'చెడ్డది', 'ఏమిటి', 'ఎప్పుడు',
        'ఎక్కడ', 'ఎలా', 'ఎవరు', 'ఎందుకు', 'మరియు', 'కానీ'
      ],
      bengali: [
        'নমস্কার', 'হ্যাঁ', 'না', 'ধন্যবাদ', 'দয়া করে',
        'দুঃখিত', 'ভালো', 'খারাপ', 'কি', 'কখন',
        'কোথায়', 'কিভাবে', 'কে', 'কেন', 'এবং', 'কিন্তু'
      ],
      marathi: [
        'नमस्कार', 'हो', 'नाही', 'धन्यवाद', 'कृपया',
        'माफ करा', 'चांगले', 'वाईट', 'काय', 'केव्हा',
        'कुठे', 'कसे', 'कोण', 'का', 'आणि', 'परंतु'
      ],
      gujarati: [
        'નમસ્તે', 'હા', 'ના', 'આભાર', 'કૃપા કરીને',
        'માફ કરશો', 'સારું', 'ખરાબ', 'શું', 'ક્યારે',
        'ક્યાં', 'કેવી રીતે', 'કોણ', 'કેમ', 'અને', 'પરંતુ'
      ],
      kannada: [
        'ನಮಸ್ಕಾರ', 'ಹೌದು', 'ಇಲ್ಲ', 'ಧನ್ಯವಾದಗಳು', 'ದಯವಿಟ್ಟು',
        'ಕ್ಷಮಿಸಿ', 'ಒಳ್ಳೆಯದು', 'ಕೆಟ್ಟದು', 'ಏನು', 'ಯಾವಾಗ',
        'ಎಲ್ಲಿ', 'ಹೇಗೆ', 'ಯಾರು', 'ಏಕೆ', 'ಮತ್ತು', 'ಆದರೆ'
      ],
      malayalam: [
        'നമസ്കാരം', 'അതെ', 'അല്ല', 'നന്ദി', 'ദയവായി',
        'ക്ഷമിക്കണം', 'നല്ലത്', 'മോശം', 'എന്ത്', 'എപ്പോൾ',
        'എവിടെ', 'എങ്ങനെ', 'ആര്', 'എന്തുകൊണ്ട്', 'കൂടാതെ', 'പക്ഷേ'
      ],
      punjabi: [
        'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'ਹਾਂ', 'ਨਹੀਂ', 'ਧੰਨਵਾਦ', 'ਕਿਰਪਾ ਕਰਕੇ',
        'ਮਾਫ ਕਰਨਾ', 'ਚੰਗਾ', 'ਮਾੜਾ', 'ਕੀ', 'ਕਦੋਂ',
        'ਕਿੱਥੇ', 'ਕਿਵੇਂ', 'ਕੌਣ', 'ਕਿਉਂ', 'ਅਤੇ', 'ਪਰ'
      ],
      odia: [
        'ନମସ୍କାର', 'ହଁ', 'ନା', 'ଧନ୍ୟବାଦ', 'ଦୟାକରି',
        'କ୍ଷମା କରନ୍ତୁ', 'ଭଲ', 'ଖରାପ', 'କଣ', 'କେବେ',
        'କେଉଁଠାରେ', 'କିପରି', 'କିଏ', 'କାହିଁକି', 'ଏବଂ', 'କିନ୍ତୁ'
      ],
      assamese: [
        'নমস্কাৰ', 'হয়', 'নহয়', 'ধন্যবাদ', 'অনুগ্ৰহ কৰি',
        'ক্ষমা কৰিব', 'ভাল', 'বেয়া', 'কি', 'কেতিয়া',
        'ক'ত', 'কেনেকৈ', 'কোন', 'কিয়', 'আৰু', 'কিন্তু'
      ]
    };
  }

  /**
   * Validate API credentials
   * @param {object} credentials - API credentials to validate
   * @returns {Promise<object>} - Validation result
   */
  async validateCredentials(credentials) {
    try {
      // In a production environment, this would make a test API call
      // For now, we'll simulate validation
      
      const isValid = credentials && 
                     credentials.apiKey && 
                     credentials.apiKey.length > 10;
      
      return {
        valid: isValid,
        message: isValid ? 'API credentials validated successfully' : 'Invalid API credentials'
      };
    } catch (error) {
      logger.error('Error validating API credentials:', error);
      return {
        valid: false,
        message: `Validation error: ${error.message}`
      };
    }
  }
}

module.exports = new LanguageDetectionService();
