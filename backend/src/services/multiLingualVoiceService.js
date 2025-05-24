// src/services/multiLingualVoiceService.js
const elevenLabsService = require('./elevenLabsService');
const languageDetectionService = require('./languageDetectionService');
const apiConfigService = require('./apiConfigService');
const logger = require('../utils/logger');
const { Call, Conversation, ConversationSegment } = require('../models');

/**
 * Service for handling multi-lingual voice interactions with real-time language detection
 */
class MultiLingualVoiceService {
  constructor() {
    this.initialized = false;
    this.supportedLanguages = [
      'english', 'hindi', 'tamil', 'telugu', 'bengali', 
      'marathi', 'gujarati', 'kannada', 'malayalam', 
      'punjabi', 'odia', 'assamese'
    ];
    
    // Context window for conversation history
    this.contextWindowSize = 5;
    
    // Voice settings presets
    this.voiceSettings = {
      default: 'default',
      clear: 'clear',
      expressive: 'expressive'
    };
  }

  /**
   * Initialize the service
   * @returns {Promise<boolean>} - Success status
   */
  async initialize() {
    try {
      // Load API credentials
      const credentials = await apiConfigService.loadCredentials();
      
      // Initialize ElevenLabs service
      const elevenLabsInitialized = await elevenLabsService.initialize(
        credentials.elevenlabs || {}
      );
      
      // Initialize language detection service
      const languageDetectionInitialized = await languageDetectionService.initialize(
        credentials.languageDetection || {}
      );
      
      this.initialized = elevenLabsInitialized && languageDetectionInitialized;
      
      if (this.initialized) {
        logger.info('Multi-lingual voice service initialized successfully');
      } else {
        logger.warn('Multi-lingual voice service initialization incomplete');
      }
      
      return this.initialized;
    } catch (error) {
      logger.error('Error initializing multi-lingual voice service:', error);
      return false;
    }
  }

  /**
   * Initialize a voice call with multi-lingual support
   * @param {object} params - Call parameters
   * @returns {Promise<object>} - Call result
   */
  async initiateMultiLingualCall(params) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      const {
        phoneNumber,
        campaignId,
        leadId,
        voiceType = 'female',
        personality = 'professional',
        language = 'english',
        callbackUrl
      } = params;
      
      logger.info(`Initiating multi-lingual voice call to ${phoneNumber} for campaign ${campaignId}`);
      
      // Create call record
      const call = await Call.create({
        campaign_id: campaignId,
        lead_id: leadId,
        phone_number: phoneNumber,
        status: 'initiating',
        direction: 'outbound',
        voice_type: voiceType,
        voice_personality: personality,
        language,
        initiated_at: new Date()
      });
      
      // Create conversation record
      const conversation = await Conversation.create({
        call_id: call.id,
        status: 'active',
        started_at: new Date(),
        current_language: language
      });
      
      // Generate initial script
      const scriptResult = await this.generateScript({
        campaignId,
        scriptType: 'introduction',
        language,
        leadInfo: { phoneNumber }
      });
      
      // Generate speech using ElevenLabs
      const speechResult = await elevenLabsService.generateSpeech({
        text: scriptResult.script.content,
        voiceType,
        language,
        personality,
        settings: this.voiceSettings.default,
        cacheKey: `intro_${campaignId}_${language}`
      });
      
      // Save initial conversation segment
      await ConversationSegment.create({
        conversation_id: conversation.id,
        segment_type: 'agent',
        content: scriptResult.script.content,
        language,
        sequence: 1,
        duration: speechResult.duration,
        audio_url: speechResult.audioUrl,
        created_at: new Date()
      });
      
      // In a real implementation, this would initiate a call using a telephony service
      // For now, we'll return the call details and audio URL
      
      // Update call record with status
      await call.update({
        status: 'initiated'
      });
      
      return {
        success: true,
        call: {
          id: call.id,
          status: 'initiated'
        },
        conversation: {
          id: conversation.id,
          language
        },
        audio: {
          url: speechResult.audioUrl,
          duration: speechResult.duration
        }
      };
    } catch (error) {
      logger.error('Error initiating multi-lingual voice call:', error);
      throw error;
    }
  }

  /**
   * Handle customer response with language detection and adaptation
   * @param {object} params - Response parameters
   * @returns {Promise<object>} - Response result
   */
  async handleMultiLingualResponse(params) {
    try {
      const {
        callId,
        conversationId,
        speechResult,
        audioInput,
        confidence
      } = params;
      
      // Get call and conversation details
      const call = await Call.findByPk(callId);
      const conversation = await Conversation.findByPk(conversationId);
      
      if (!call || !conversation) {
        throw new Error('Call or conversation not found');
      }
      
      // Get previous conversation segments for context
      const previousSegments = await ConversationSegment.findAll({
        where: { conversation_id: conversationId },
        order: [['sequence', 'DESC']],
        limit: this.contextWindowSize
      });
      
      // Detect language from speech result
      const languageResult = await languageDetectionService.detectLanguage(
        speechResult,
        {
          previousLanguage: conversation.current_language,
          conversationContext: previousSegments.map(segment => segment.content),
          minConfidence: 0.6
        }
      );
      
      logger.info(`Detected language: ${languageResult.language} (confidence: ${languageResult.confidence})`);
      
      // Check for language switch
      const languageSwitch = conversation.current_language !== languageResult.language &&
                            languageResult.confidence >= 0.7;
      
      // Save customer response as conversation segment
      const lastSegment = previousSegments[0];
      
      const customerSegment = await ConversationSegment.create({
        conversation_id: conversationId,
        segment_type: 'customer',
        content: speechResult,
        language: languageResult.language,
        sequence: (lastSegment?.sequence || 0) + 1,
        confidence: parseFloat(confidence) || languageResult.confidence,
        created_at: new Date()
      });
      
      // Analyze response with emotion detection
      const analysisResult = await this.analyzeResponseWithEmotion(
        speechResult,
        call.campaign_id,
        languageResult.language
      );
      
      // If language has switched, update conversation record
      if (languageSwitch) {
        await conversation.update({
          current_language: languageResult.language
        });
        
        logger.info(`Language switched from ${conversation.current_language} to ${languageResult.language}`);
      }
      
      // Generate appropriate response based on analysis
      const responseContent = await this.generateResponseContent(
        analysisResult,
        call,
        languageResult.language
      );
      
      // Generate speech using ElevenLabs
      const speechResult = await elevenLabsService.generateSpeech({
        text: responseContent,
        voiceType: call.voice_type,
        language: languageResult.language,
        personality: this.getPersonalityForEmotion(call.voice_personality, analysisResult.emotion),
        settings: this.getVoiceSettingsForEmotion(analysisResult.emotion)
      });
      
      // Save agent response as conversation segment
      await ConversationSegment.create({
        conversation_id: conversationId,
        segment_type: 'agent',
        content: responseContent,
        language: languageResult.language,
        sequence: customerSegment.sequence + 1,
        duration: speechResult.duration,
        audio_url: speechResult.audioUrl,
        created_at: new Date()
      });
      
      // If ending the call
      if (analysisResult.nextAction === 'end_call') {
        // Update call and conversation status
        await call.update({ status: 'completed', ended_at: new Date() });
        await conversation.update({ status: 'completed', ended_at: new Date() });
      }
      
      return {
        success: true,
        audio: {
          url: speechResult.audioUrl,
          duration: speechResult.duration
        },
        analysis: {
          ...analysisResult,
          languageDetection: languageResult
        },
        languageSwitch,
        nextAction: analysisResult.nextAction
      };
    } catch (error) {
      logger.error('Error handling multi-lingual response:', error);
      throw error;
    }
  }

  /**
   * Generate script content
   * @param {object} params - Script parameters
   * @returns {Promise<object>} - Script result
   */
  async generateScript(params) {
    try {
      const { campaignId, scriptType, language, leadInfo } = params;
      
      // In a production environment, this would call an AI service
      // For now, we'll use predefined scripts based on language and type
      
      const scripts = {
        english: {
          introduction: `Hello, this is an AI assistant calling from campaign ${campaignId}. How are you doing today?`,
          pitch: `I'm calling to tell you about our amazing new product that can help you save time and money.`,
          closing: `Thank you for your time. Have a great day!`
        },
        hindi: {
          introduction: `नमस्ते, मैं कैंपेन ${campaignId} से एक AI सहायक बोल रहा हूँ। आप आज कैसे हैं?`,
          pitch: `मैं आपको हमारे अद्भुत नए उत्पाद के बारे में बताने के लिए कॉल कर रहा हूँ जो आपको समय और पैसा बचाने में मदद कर सकता है।`,
          closing: `आपके समय के लिए धन्यवाद। आपका दिन शुभ हो!`
        },
        tamil: {
          introduction: `வணக்கம், நான் பிரச்சாரத்திலிருந்து ${campaignId} ஒரு AI உதவியாளர் அழைக்கிறேன். இன்று நீங்கள் எப்படி இருக்கிறீர்கள்?`,
          pitch: `உங்கள் நேரத்தையும் பணத்தையும் சேமிக்க உதவும் எங்கள் அற்புதமான புதிய தயாரிப்பைப் பற்றி உங்களுக்குச் சொல்ல நான் அழைக்கிறேன்.`,
          closing: `உங்கள் நேரத்திற்கு நன்றி. உங்கள் நாள் இனிமையாக இருக்கட்டும்!`
        }
      };
      
      // Default to English if language not supported
      const languageScripts = scripts[language] || scripts.english;
      const content = languageScripts[scriptType] || languageScripts.introduction;
      
      return {
        success: true,
        script: {
          content,
          language,
          type: scriptType
        }
      };
    } catch (error) {
      logger.error('Error generating script:', error);
      throw error;
    }
  }

  /**
   * Analyze customer response with emotion detection
   * @param {string} response - Customer response
   * @param {number} campaignId - Campaign ID
   * @param {string} language - Detected language
   * @returns {Promise<object>} - Analysis result with emotion
   */
  async analyzeResponseWithEmotion(response, campaignId, language) {
    try {
      // In a production environment, this would call a sophisticated
      // emotion detection API or model. For now, we'll use keyword matching.
      
      // Basic intent detection
      let intent = 'neutral';
      let nextAction = 'continue';
      
      if (response.toLowerCase().includes('interest') || 
          response.toLowerCase().includes('tell me more')) {
        intent = 'interested';
        nextAction = 'pitch';
      } else if (response.toLowerCase().includes('question') || 
                response.toLowerCase().includes('how')) {
        intent = 'question';
        nextAction = 'answer_question';
      } else if (response.toLowerCase().includes('no') || 
                response.toLowerCase().includes('not interested')) {
        intent = 'rejection';
        nextAction = 'handle_objection';
      } else if (response.toLowerCase().includes('later') || 
                response.toLowerCase().includes('call back')) {
        intent = 'postpone';
        nextAction = 'schedule_callback';
      } else if (response.toLowerCase().includes('bye') || 
                response.toLowerCase().includes('goodbye')) {
        intent = 'end';
        nextAction = 'end_call';
      }
      
      // Detect emotions from text
      const emotions = {
        anger: this.detectEmotion(response, [
          'angry', 'upset', 'furious', 'mad', 'annoyed', 'irritated',
          'frustrated', 'stop calling', 'leave me alone', 'don\'t call'
        ]),
        frustration: this.detectEmotion(response, [
          'frustrated', 'annoying', 'waste of time', 'not interested',
          'busy', 'already told you', 'keep calling', 'again'
        ]),
        interest: this.detectEmotion(response, [
          'interested', 'tell me more', 'sounds good', 'curious',
          'like to know', 'benefits', 'features', 'how much', 'details'
        ]),
        confusion: this.detectEmotion(response, [
          'confused', 'don\'t understand', 'what do you mean', 'unclear',
          'explain', 'not sure', 'could you repeat', 'didn\'t get that'
        ]),
        satisfaction: this.detectEmotion(response, [
          'great', 'excellent', 'good', 'perfect', 'wonderful',
          'happy', 'satisfied', 'thank you', 'appreciate', 'helpful'
        ])
      };
      
      // Determine primary emotion
      let primaryEmotion = 'neutral';
      let highestScore = 0;
      
      for (const [emotion, score] of Object.entries(emotions)) {
        if (score > highestScore && score >= 0.6) {
          highestScore = score;
          primaryEmotion = emotion;
        }
      }
      
      // Adjust next action based on emotion
      if (primaryEmotion === 'anger' && emotions.anger > 0.7) {
        nextAction = 'end_call';
      } else if (primaryEmotion === 'frustration' && emotions.frustration > 0.7) {
        nextAction = 'schedule_callback';
      } else if (primaryEmotion === 'confusion' && emotions.confusion > 0.6) {
        nextAction = 'clarify';
      }
      
      return {
        intent,
        emotion: primaryEmotion,
        emotionScores: emotions,
        nextAction,
        language
      };
    } catch (error) {
      logger.error('Error analyzing response with emotion:', error);
      throw error;
    }
  }

  /**
   * Detect emotion based on keywords
   * @param {string} text - Text to analyze
   * @param {string[]} keywords - Keywords to match
   * @returns {number} - Emotion score (0-1)
   */
  detectEmotion(text, keywords) {
    const lowerText = text.toLowerCase();
    let matches = 0;
    
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matches++;
      }
    }
    
    return matches > 0 ? Math.min(matches / 3, 1) : 0;
  }

  /**
   * Generate response content based on analysis
   * @param {object} analysisResult - Analysis result
   * @param {object} call - Call record
   * @param {string} language - Detected language
   * @returns {Promise<string>} - Response content
   */
  async generateResponseContent(analysisResult, call, language) {
    try {
      // Generate appropriate response based on next action
      switch (analysisResult.nextAction) {
        case 'pitch':
          const pitchResult = await this.generateScript({
            campaignId: call.campaign_id,
            scriptType: 'pitch',
            language,
            leadInfo: { phoneNumber: call.phone_number, emotion: analysisResult.emotion }
          });
          return pitchResult.script.content;
          
        case 'answer_question':
          // In a production environment, this would use a knowledge base
          return language === 'hindi' ? 
            'यह एक अच्छा सवाल है। मैं आपको विस्तार से बताता हूँ।' :
            'That\'s a good question. Let me explain in detail.';
          
        case 'handle_objection':
          return language === 'hindi' ? 
            'मैं आपकी चिंता समझता हूँ। क्या मैं आपको कुछ अतिरिक्त जानकारी दे सकता हूँ?' :
            'I understand your concern. Can I provide you with some additional information?';
          
        case 'schedule_callback':
          return language === 'hindi' ? 
            'कोई बात नहीं। मैं आपको बाद में कॉल कर सकता हूँ। आपके लिए कौन सा समय सुविधाजनक होगा?' :
            'No problem. I can call you back later. What time would be convenient for you?';
          
        case 'end_call':
          const closingResult = await this.generateScript({
            campaignId: call.campaign_id,
            scriptType: 'closing',
            language,
            leadInfo: { phoneNumber: call.phone_number, emotion: analysisResult.emotion }
          });
          return closingResult.script.content;
          
        case 'clarify':
          return language === 'hindi' ? 
            'मुझे खेद है कि मैं स्पष्ट नहीं था। मैं फिर से समझाता हूँ।' :
            'I\'m sorry I wasn\'t clear. Let me explain again.';
          
        default:
          // Default to continuing the conversation
          return language === 'hindi' ? 
            'समझ गया। कृपया मुझे और बताएं।' :
            'I understand. Please tell me more.';
      }
    } catch (error) {
      logger.error('Error generating response content:', error);
      throw error;
    }
  }

  /**
   * Get personality based on emotion
   * @param {string} basePersonality - Base personality
   * @param {string} emotion - Detected emotion
   * @returns {string} - Adjusted personality
   */
  getPersonalityForEmotion(basePersonality, emotion) {
    // Map emotions to appropriate voice personalities
    const emotionToPersonality = {
      anger: 'empathetic',
      frustration: 'empathetic',
      interest: 'friendly',
      confusion: 'professional',
      satisfaction: 'friendly',
      neutral: basePersonality
    };
    
    return emotionToPersonality[emotion] || basePersonality;
  }

  /**
   * Get voice settings based on emotion
   * @param {string} emotion - Detected emotion
   * @returns {string} - Voice settings preset
   */
  getVoiceSettingsForEmotion(emotion) {
    // Map emotions to appropriate voice settings
    const emotionToSettings = {
      anger: 'clear',
      frustration: 'clear',
      interest: 'expressive',
      confusion: 'clear',
      satisfaction: 'expressive',
      neutral: 'default'
    };
    
    return this.voiceSettings[emotionToSettings[emotion] || 'default'];
  }
}

module.exports = new MultiLingualVoiceService();
