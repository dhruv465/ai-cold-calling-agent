// src/services/advancedVoiceService.js
const twilio = require('twilio');
const config = require('../config/config');
const logger = require('../utils/logger');
const aiService = require('./aiService');
const { Call, Conversation, ConversationSegment } = require('../models');

/**
 * Service for handling advanced voice interactions
 */
class AdvancedVoiceService {
  constructor() {
    this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
    this.voiceOptions = {
      male: {
        english: {
          professional: 'en-US-Neural2-D',
          friendly: 'en-US-Neural2-A',
          empathetic: 'en-US-Neural2-F'
        },
        hindi: {
          professional: 'hi-IN-Neural2-B',
          friendly: 'hi-IN-Neural2-A',
          empathetic: 'hi-IN-Neural2-D'
        }
      },
      female: {
        english: {
          professional: 'en-US-Neural2-C',
          friendly: 'en-US-Neural2-E',
          empathetic: 'en-US-Neural2-G'
        },
        hindi: {
          professional: 'hi-IN-Neural2-A',
          friendly: 'hi-IN-Neural2-C',
          empathetic: 'hi-IN-Neural2-D'
        }
      }
    };
    
    // Emotion detection thresholds
    this.emotionThresholds = {
      anger: 0.6,
      frustration: 0.5,
      interest: 0.7,
      confusion: 0.6,
      satisfaction: 0.7
    };
  }

  /**
   * Initialize a voice call with advanced features
   * @param {object} params - Call parameters
   * @returns {Promise<object>} - Call result
   */
  async initiateAdvancedCall(params) {
    try {
      const {
        phoneNumber,
        campaignId,
        leadId,
        voiceType = 'female',
        personality = 'professional',
        language = 'english',
        callbackUrl
      } = params;
      
      logger.info(`Initiating advanced voice call to ${phoneNumber} for campaign ${campaignId}`);
      
      // Select voice based on parameters
      const voice = this.getVoice(voiceType, language, personality);
      
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
        started_at: new Date()
      });
      
      // Generate initial script
      const scriptResult = await aiService.generateScript({
        campaignId,
        scriptType: 'introduction',
        language,
        leadInfo: { phoneNumber }
      });
      
      // Create TwiML for the call
      const twiml = new twilio.twiml.VoiceResponse();
      
      // Add advanced voice parameters
      twiml.say({
        voice,
        language: language === 'english' ? 'en-US' : 'hi-IN',
        prosody: { rate: '0.9', pitch: '0', volume: 'medium' }
      }, scriptResult.script.content);
      
      // Add gather for capturing response with speech recognition
      const gather = twiml.gather({
        input: 'speech',
        language: language === 'english' ? 'en-US' : 'hi-IN',
        speechTimeout: 'auto',
        enhanced: true,
        speechModel: 'phone_call',
        actionOnEmptyResult: true,
        action: `${callbackUrl || config.app.webhookBaseUrl}/api/voice/response?callId=${call.id}&conversationId=${conversation.id}`,
        method: 'POST'
      });
      
      // Add pause for natural conversation flow
      gather.pause({ length: 1 });
      
      // Add fallback in case of no response
      twiml.redirect({
        method: 'POST'
      }, `${callbackUrl || config.app.webhookBaseUrl}/api/voice/no-response?callId=${call.id}&conversationId=${conversation.id}`);
      
      // Save initial conversation segment
      await ConversationSegment.create({
        conversation_id: conversation.id,
        segment_type: 'agent',
        content: scriptResult.script.content,
        sequence: 1,
        duration: this.estimateSpeechDuration(scriptResult.script.content),
        created_at: new Date()
      });
      
      // Make the call
      const twilioCall = await this.client.calls.create({
        to: phoneNumber,
        from: config.twilio.phoneNumber,
        twiml: twiml.toString(),
        statusCallback: `${callbackUrl || config.app.webhookBaseUrl}/api/voice/status?callId=${call.id}`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
        record: true,
        recordingStatusCallback: `${callbackUrl || config.app.webhookBaseUrl}/api/voice/recording?callId=${call.id}`,
        recordingStatusCallbackMethod: 'POST'
      });
      
      // Update call record with Twilio SID
      await call.update({
        twilio_sid: twilioCall.sid,
        status: 'initiated'
      });
      
      return {
        success: true,
        call: {
          id: call.id,
          twilioSid: twilioCall.sid,
          status: 'initiated'
        },
        conversation: {
          id: conversation.id
        }
      };
    } catch (error) {
      logger.error('Error initiating advanced voice call:', error);
      throw error;
    }
  }

  /**
   * Handle customer response with advanced processing
   * @param {object} params - Response parameters
   * @returns {Promise<object>} - Response result with TwiML
   */
  async handleAdvancedResponse(params) {
    try {
      const {
        callId,
        conversationId,
        speechResult,
        confidence,
        callbackUrl
      } = params;
      
      logger.info(`Handling advanced response for call ${callId}: "${speechResult}" (confidence: ${confidence})`);
      
      // Get call and conversation details
      const call = await Call.findByPk(callId);
      const conversation = await Conversation.findByPk(conversationId);
      
      if (!call || !conversation) {
        throw new Error('Call or conversation not found');
      }
      
      // Save customer response as conversation segment
      const lastSegment = await ConversationSegment.findOne({
        where: { conversation_id: conversationId },
        order: [['sequence', 'DESC']]
      });
      
      const customerSegment = await ConversationSegment.create({
        conversation_id: conversationId,
        segment_type: 'customer',
        content: speechResult,
        sequence: (lastSegment?.sequence || 0) + 1,
        confidence: parseFloat(confidence) || 0.8,
        created_at: new Date()
      });
      
      // Analyze response with emotion detection
      const analysisResult = await this.analyzeResponseWithEmotion(speechResult, call.campaign_id);
      
      // Determine next action based on analysis
      let nextAction = analysisResult.nextAction;
      let responseContent = '';
      
      // Generate appropriate response based on next action
      switch (nextAction) {
        case 'pitch':
          const pitchResult = await aiService.generateScript({
            campaignId: call.campaign_id,
            scriptType: 'pitch',
            language: call.language,
            leadInfo: { phoneNumber: call.phone_number, emotion: analysisResult.emotion }
          });
          responseContent = pitchResult.script.content;
          break;
          
        case 'answer_question':
          const questionResponse = await aiService.generateQuestionResponse(speechResult, call.campaign_id);
          responseContent = questionResponse.response;
          break;
          
        case 'handle_objection':
          const objectionResponse = await aiService.handleObjection(speechResult, call.campaign_id);
          responseContent = objectionResponse.response;
          break;
          
        case 'schedule_callback':
          const callbackResponse = await aiService.generateScript({
            campaignId: call.campaign_id,
            scriptType: 'callback',
            language: call.language,
            leadInfo: { phoneNumber: call.phone_number, emotion: analysisResult.emotion }
          });
          responseContent = callbackResponse.script.content;
          break;
          
        case 'end_call':
          const closingResponse = await aiService.generateScript({
            campaignId: call.campaign_id,
            scriptType: 'closing',
            language: call.language,
            leadInfo: { phoneNumber: call.phone_number, emotion: analysisResult.emotion }
          });
          responseContent = closingResponse.script.content;
          break;
          
        default:
          // Default to continuing the conversation
          const continuationResponse = await aiService.generateScript({
            campaignId: call.campaign_id,
            scriptType: 'continuation',
            language: call.language,
            leadInfo: { phoneNumber: call.phone_number, emotion: analysisResult.emotion }
          });
          responseContent = continuationResponse.script.content;
      }
      
      // Save agent response as conversation segment
      await ConversationSegment.create({
        conversation_id: conversationId,
        segment_type: 'agent',
        content: responseContent,
        sequence: customerSegment.sequence + 1,
        duration: this.estimateSpeechDuration(responseContent),
        created_at: new Date()
      });
      
      // Create TwiML for the response
      const twiml = new twilio.twiml.VoiceResponse();
      
      // Select voice based on emotion
      const voice = this.getVoiceForEmotion(
        call.voice_type,
        call.language,
        call.voice_personality,
        analysisResult.emotion
      );
      
      // Adjust speech parameters based on emotion
      const speechParams = this.getSpeechParamsForEmotion(analysisResult.emotion);
      
      // Add natural pause before responding
      twiml.pause({ length: 1 });
      
      // Add the response with appropriate voice and parameters
      twiml.say({
        voice,
        language: call.language === 'english' ? 'en-US' : 'hi-IN',
        prosody: speechParams
      }, responseContent);
      
      // If ending the call
      if (nextAction === 'end_call') {
        twiml.pause({ length: 1 });
        twiml.hangup();
        
        // Update call and conversation status
        await call.update({ status: 'completed', ended_at: new Date() });
        await conversation.update({ status: 'completed', ended_at: new Date() });
      } else {
        // Add gather for next response
        const gather = twiml.gather({
          input: 'speech',
          language: call.language === 'english' ? 'en-US' : 'hi-IN',
          speechTimeout: 'auto',
          enhanced: true,
          speechModel: 'phone_call',
          actionOnEmptyResult: true,
          action: `${callbackUrl || config.app.webhookBaseUrl}/api/voice/response?callId=${callId}&conversationId=${conversationId}`,
          method: 'POST'
        });
        
        // Add pause for natural conversation flow
        gather.pause({ length: 1 });
        
        // Add fallback in case of no response
        twiml.redirect({
          method: 'POST'
        }, `${callbackUrl || config.app.webhookBaseUrl}/api/voice/no-response?callId=${callId}&conversationId=${conversationId}`);
      }
      
      return {
        success: true,
        twiml: twiml.toString(),
        analysis: analysisResult,
        nextAction
      };
    } catch (error) {
      logger.error('Error handling advanced response:', error);
      throw error;
    }
  }

  /**
   * Analyze customer response with emotion detection
   * @param {string} response - Customer response
   * @param {number} campaignId - Campaign ID
   * @returns {Promise<object>} - Analysis result with emotion
   */
  async analyzeResponseWithEmotion(response, campaignId) {
    try {
      // Get basic intent analysis
      const basicAnalysis = await aiService.analyzeResponse(response);
      
      // In a production environment, this would call a more sophisticated
      // emotion detection API or model. For now, we'll use keyword matching.
      
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
        if (score > highestScore && score >= this.emotionThresholds[emotion]) {
          highestScore = score;
          primaryEmotion = emotion;
        }
      }
      
      // Adjust next action based on emotion
      let nextAction = basicAnalysis.nextAction;
      
      if (primaryEmotion === 'anger' && emotions.anger > 0.7) {
        nextAction = 'end_call';
      } else if (primaryEmotion === 'frustration' && emotions.frustration > 0.7) {
        nextAction = 'schedule_callback';
      } else if (primaryEmotion === 'confusion' && emotions.confusion > 0.6) {
        nextAction = 'clarify';
      }
      
      return {
        ...basicAnalysis,
        emotion: primaryEmotion,
        emotionScores: emotions,
        nextAction
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
   * Get voice based on type, language, and personality
   * @param {string} voiceType - Voice type (male/female)
   * @param {string} language - Language (english/hindi)
   * @param {string} personality - Personality (professional/friendly/empathetic)
   * @returns {string} - Twilio voice identifier
   */
  getVoice(voiceType, language, personality) {
    return this.voiceOptions[voiceType]?.[language]?.[personality] || 
           this.voiceOptions.female.english.professional;
  }

  /**
   * Get voice based on emotion
   * @param {string} voiceType - Voice type (male/female)
   * @param {string} language - Language (english/hindi)
   * @param {string} basePersonality - Base personality
   * @param {string} emotion - Detected emotion
   * @returns {string} - Twilio voice identifier
   */
  getVoiceForEmotion(voiceType, language, basePersonality, emotion) {
    // Map emotions to appropriate voice personalities
    const emotionToPersonality = {
      anger: 'empathetic',
      frustration: 'empathetic',
      interest: 'friendly',
      confusion: 'professional',
      satisfaction: 'friendly',
      neutral: basePersonality
    };
    
    const personality = emotionToPersonality[emotion] || basePersonality;
    return this.getVoice(voiceType, language, personality);
  }

  /**
   * Get speech parameters based on emotion
   * @param {string} emotion - Detected emotion
   * @returns {object} - Speech parameters
   */
  getSpeechParamsForEmotion(emotion) {
    // Adjust speech parameters based on emotion
    switch (emotion) {
      case 'anger':
        return { rate: '0.8', pitch: '-2%', volume: 'medium' };
      case 'frustration':
        return { rate: '0.85', pitch: '-1%', volume: 'medium' };
      case 'interest':
        return { rate: '0.95', pitch: '+1%', volume: 'medium' };
      case 'confusion':
        return { rate: '0.9', pitch: '0%', volume: 'medium' };
      case 'satisfaction':
        return { rate: '1.0', pitch: '+2%', volume: 'medium' };
      default:
        return { rate: '0.9', pitch: '0%', volume: 'medium' };
    }
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
   * Handle no response from customer
   * @param {object} params - Parameters
   * @returns {Promise<object>} - Result with TwiML
   */
  async handleNoResponse(params) {
    try {
      const { callId, conversationId, callbackUrl } = params;
      
      logger.info(`Handling no response for call ${callId}`);
      
      // Get call and conversation details
      const call = await Call.findByPk(callId);
      const conversation = await Conversation.findByPk(conversationId);
      
      if (!call || !conversation) {
        throw new Error('Call or conversation not found');
      }
      
      // Get last agent segment
      const lastAgentSegment = await ConversationSegment.findOne({
        where: { 
          conversation_id: conversationId,
          segment_type: 'agent'
        },
        order: [['sequence', 'DESC']]
      });
      
      // Generate prompt for no response
      const promptResult = await aiService.generateScript({
        campaignId: call.campaign_id,
        scriptType: 'no_response',
        language: call.language,
        leadInfo: { phoneNumber: call.phone_number }
      });
      
      const responseContent = promptResult.script.content;
      
      // Save as conversation segment
      await ConversationSegment.create({
        conversation_id: conversationId,
        segment_type: 'agent',
        content: responseContent,
        sequence: (lastAgentSegment?.sequence || 0) + 1,
        duration: this.estimateSpeechDuration(responseContent),
        created_at: new Date()
      });
      
      // Create TwiML for the response
      const twiml = new twilio.twiml.VoiceResponse();
      
      // Add natural pause before responding
      twiml.pause({ length: 1 });
      
      // Add the response
      twiml.say({
        voice: this.getVoice(call.voice_type, call.language, call.voice_personality),
        language: call.language === 'english' ? 'en-US' : 'hi-IN',
        prosody: { rate: '0.9', pitch: '0%', volume: 'medium' }
      }, responseContent);
      
      // Add gather for next response
      const gather = twiml.gather({
        input: 'speech',
        language: call.language === 'english' ? 'en-US' : 'hi-IN',
        speechTimeout: 'auto',
        enhanced: true,
        speechModel: 'phone_call',
        actionOnEmptyResult: true,
        action: `${callbackUrl || config.app.webhookBaseUrl}/api/voice/response?callId=${callId}&conversationId=${conversationId}`,
        method: 'POST'
      });
      
      // Add pause for natural conversation flow
      gather.pause({ length: 1 });
      
      // Add fallback for repeated no response - end call after second attempt
      twiml.redirect({
        method: 'POST'
      }, `${callbackUrl || config.app.webhookBaseUrl}/api/voice/end-call?callId=${callId}&conversationId=${conversationId}`);
      
      return {
        success: true,
        twiml: twiml.toString()
      };
    } catch (error) {
      logger.error('Error handling no response:', error);
      throw error;
    }
  }

  /**
   * End call due to no response
   * @param {object} params - Parameters
   * @returns {Promise<object>} - Result with TwiML
   */
  async endCallNoResponse(params) {
    try {
      const { callId, conversationId } = params;
      
      logger.info(`Ending call ${callId} due to no response`);
      
      // Get call and conversation details
      const call = await Call.findByPk(callId);
      const conversation = await Conversation.findByPk(conversationId);
      
      if (!call || !conversation) {
        throw new Error('Call or conversation not found');
      }
      
      // Generate closing message
      const closingResult = await aiService.generateScript({
        campaignId: call.campaign_id,
        scriptType: 'closing_no_response',
        language: call.language,
        leadInfo: { phoneNumber: call.phone_number }
      });
      
      const closingContent = closingResult.script.content;
      
      // Save as conversation segment
      await ConversationSegment.create({
        conversation_id: conversationId,
        segment_type: 'agent',
        content: closingContent,
        sequence: 999, // High sequence number to ensure it's last
        duration: this.estimateSpeechDuration(closingContent),
        created_at: new Date()
      });
      
      // Update call and conversation status
      await call.update({ status: 'completed', ended_at: new Date() });
      await conversation.update({ status: 'completed', ended_at: new Date() });
      
      // Create TwiML for the closing
      const twiml = new twilio.twiml.VoiceResponse();
      
      // Add the closing message
      twiml.say({
        voice: this.getVoice(call.voice_type, call.language, call.voice_personality),
        language: call.language === 'english' ? 'en-US' : 'hi-IN',
        prosody: { rate: '0.9', pitch: '0%', volume: 'medium' }
      }, closingContent);
      
      // Hang up
      twiml.pause({ length: 1 });
      twiml.hangup();
      
      return {
        success: true,
        twiml: twiml.toString()
      };
    } catch (error) {
      logger.error('Error ending call due to no response:', error);
      throw error;
    }
  }
}

module.exports = new AdvancedVoiceService();
