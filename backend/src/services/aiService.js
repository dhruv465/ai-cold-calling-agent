// src/services/aiService.js
const config = require('../config/config');
const logger = require('../utils/logger');
const { KnowledgeBase, CampaignScript } = require('../models');

/**
 * Service for handling AI conversation operations
 */
class AIService {
  /**
   * Generate a conversation script based on campaign goals and context
   * @param {object} params - Script generation parameters
   * @returns {Promise<object>} - The generated script
   */
  async generateScript(params) {
    try {
      const { campaignId, scriptType, language, leadInfo } = params;
      
      logger.info(`Generating ${scriptType} script for campaign ${campaignId} in ${language}`);
      
      // In a production environment, this would call OpenAI or another LLM API
      // For now, we'll return template scripts based on the script type
      
      let scriptContent = '';
      
      switch (scriptType) {
        case 'introduction':
          scriptContent = this.generateIntroductionScript(leadInfo, language);
          break;
        case 'pitch':
          scriptContent = this.generatePitchScript(leadInfo, language);
          break;
        case 'objection_handling':
          scriptContent = this.generateObjectionHandlingScript(leadInfo, language);
          break;
        case 'closing':
          scriptContent = this.generateClosingScript(leadInfo, language);
          break;
        case 'callback':
          scriptContent = this.generateCallbackScript(leadInfo, language);
          break;
        default:
          scriptContent = this.generateIntroductionScript(leadInfo, language);
      }
      
      // Save the generated script to the database
      const script = await CampaignScript.create({
        campaign_id: campaignId,
        language,
        script_type: scriptType,
        content: scriptContent,
        is_active: true,
        created_by: params.userId || 1,
        version: 1
      });
      
      return {
        success: true,
        script
      };
    } catch (error) {
      logger.error('Error generating script:', error);
      throw error;
    }
  }
  
  /**
   * Generate an introduction script
   * @param {object} leadInfo - Information about the lead
   * @param {string} language - The language to generate the script in
   * @returns {string} - The generated script
   */
  generateIntroductionScript(leadInfo, language) {
    const name = leadInfo?.name || 'there';
    
    if (language === 'hindi') {
      return `नमस्ते ${name}, मैं [कंपनी का नाम] से बात कर रहा हूं। क्या आप बात करने के लिए उपलब्ध हैं?`;
    }
    
    return `Hello ${name}, this is an automated call from [Company Name]. We're reaching out to tell you about our exciting new insurance plan that offers comprehensive coverage at affordable rates. Do you have a moment to discuss how this could benefit you?`;
  }
  
  /**
   * Generate a pitch script
   * @param {object} leadInfo - Information about the lead
   * @param {string} language - The language to generate the script in
   * @returns {string} - The generated script
   */
  generatePitchScript(leadInfo, language) {
    if (language === 'hindi') {
      return `हमारी नई बीमा योजना आपको कम प्रीमियम पर व्यापक कवरेज प्रदान करती है। इसमें चिकित्सा, दुर्घटना और जीवन बीमा शामिल है। क्या आप इसके बारे में अधिक जानना चाहेंगे?`;
    }
    
    return `Our new insurance plan offers you comprehensive coverage at a low premium. It includes medical, accident, and life insurance. The monthly premium starts at just ₹500, and you can customize the coverage based on your needs. Would you like to know more about the specific benefits?`;
  }
  
  /**
   * Generate an objection handling script
   * @param {object} leadInfo - Information about the lead
   * @param {string} language - The language to generate the script in
   * @returns {string} - The generated script
   */
  generateObjectionHandlingScript(leadInfo, language) {
    if (language === 'hindi') {
      return `मैं आपकी चिंता समझता हूं। हालांकि, हमारी योजना अन्य बीमा योजनाओं से अलग है क्योंकि यह अधिक लाभ कम कीमत पर प्रदान करती है। क्या मैं आपको कुछ विशिष्ट लाभों के बारे में बता सकता हूं?`;
    }
    
    return `I understand your concern. However, our plan is different from other insurance plans because it offers more benefits at a lower cost. We also have a no-questions-asked claim process and 24/7 customer support. Would you like me to explain some specific benefits that might address your concerns?`;
  }
  
  /**
   * Generate a closing script
   * @param {object} leadInfo - Information about the lead
   * @param {string} language - The language to generate the script in
   * @returns {string} - The generated script
   */
  generateClosingScript(leadInfo, language) {
    if (language === 'hindi') {
      return `आपके समय के लिए धन्यवाद। हम आपको अधिक जानकारी के साथ एक ईमेल भेजेंगे। क्या हम आपसे फिर से बात करने के लिए एक समय निर्धारित कर सकते हैं?`;
    }
    
    return `Thank you for your time. We'll send you an email with more information about the plan. One of our representatives will call you back to answer any questions you might have. Is there a specific time that would be convenient for you to receive this call?`;
  }
  
  /**
   * Generate a callback script
   * @param {object} leadInfo - Information about the lead
   * @param {string} language - The language to generate the script in
   * @returns {string} - The generated script
   */
  generateCallbackScript(leadInfo, language) {
    if (language === 'hindi') {
      return `हम आपसे फिर से बात करने के लिए उत्सुक हैं। क्या आप हमें बता सकते हैं कि आपके लिए कौन सा समय सबसे अच्छा रहेगा?`;
    }
    
    return `We're looking forward to speaking with you again. Could you please let us know what time would be best for you? Our representatives are available from 9 AM to 6 PM, Monday to Saturday.`;
  }
  
  /**
   * Analyze customer response to determine intent
   * @param {string} response - The customer's response
   * @returns {Promise<object>} - The analysis result
   */
  async analyzeResponse(response) {
    try {
      logger.info(`Analyzing customer response: ${response}`);
      
      // In a production environment, this would call OpenAI or another LLM API
      // For now, we'll use simple keyword matching
      
      const lowerResponse = response.toLowerCase();
      
      let intent = 'unknown';
      let sentiment = 'neutral';
      let nextAction = 'continue';
      
      // Check for positive intent
      if (
        lowerResponse.includes('yes') ||
        lowerResponse.includes('sure') ||
        lowerResponse.includes('interested') ||
        lowerResponse.includes('tell me more')
      ) {
        intent = 'interested';
        sentiment = 'positive';
        nextAction = 'pitch';
      }
      // Check for negative intent
      else if (
        lowerResponse.includes('no') ||
        lowerResponse.includes('not interested') ||
        lowerResponse.includes('busy') ||
        lowerResponse.includes('don\'t call')
      ) {
        intent = 'not_interested';
        sentiment = 'negative';
        nextAction = 'end_call';
      }
      // Check for callback request
      else if (
        lowerResponse.includes('call back') ||
        lowerResponse.includes('call later') ||
        lowerResponse.includes('another time') ||
        lowerResponse.includes('not now')
      ) {
        intent = 'callback_requested';
        sentiment = 'neutral';
        nextAction = 'schedule_callback';
      }
      // Check for questions
      else if (
        lowerResponse.includes('how') ||
        lowerResponse.includes('what') ||
        lowerResponse.includes('when') ||
        lowerResponse.includes('why') ||
        lowerResponse.includes('?')
      ) {
        intent = 'question';
        sentiment = 'neutral';
        nextAction = 'answer_question';
      }
      
      return {
        intent,
        sentiment,
        nextAction,
        confidence: 0.8 // In a real implementation, this would be provided by the AI model
      };
    } catch (error) {
      logger.error('Error analyzing response:', error);
      throw error;
    }
  }
  
  /**
   * Generate a response to a customer question
   * @param {string} question - The customer's question
   * @param {number} campaignId - The ID of the campaign
   * @returns {Promise<object>} - The generated response
   */
  async generateQuestionResponse(question, campaignId) {
    try {
      logger.info(`Generating response to question: ${question} for campaign ${campaignId}`);
      
      // In a production environment, this would search the knowledge base
      // and use an LLM to generate a response
      
      // For now, we'll return a generic response
      const response = "That's a great question. Our insurance plan offers comprehensive coverage including medical, accident, and life insurance. The monthly premium starts at just ₹500, and you can customize the coverage based on your needs. Would you like to know more about any specific aspect of the plan?";
      
      return {
        response,
        source: 'knowledge_base',
        confidence: 0.9
      };
    } catch (error) {
      logger.error('Error generating question response:', error);
      throw error;
    }
  }
  
  /**
   * Handle an objection from a customer
   * @param {string} objection - The customer's objection
   * @param {number} campaignId - The ID of the campaign
   * @returns {Promise<object>} - The generated response
   */
  async handleObjection(objection, campaignId) {
    try {
      logger.info(`Handling objection: ${objection} for campaign ${campaignId}`);
      
      // In a production environment, this would categorize the objection
      // and use an LLM to generate a response
      
      // For now, we'll return a generic response
      const response = "I understand your concern. Our plan is designed to be affordable while providing comprehensive coverage. We also offer flexible payment options and a no-questions-asked claim process. Would you like to hear about some specific benefits that might address your concerns?";
      
      return {
        response,
        objectionType: 'price',
        confidence: 0.8
      };
    } catch (error) {
      logger.error('Error handling objection:', error);
      throw error;
    }
  }
}

module.exports = new AIService();
