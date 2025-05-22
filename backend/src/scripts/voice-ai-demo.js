// src/scripts/voice-ai-demo.js
const advancedVoiceService = require('../services/advancedVoiceService');
const logger = require('../utils/logger');
const { Call, Conversation, ConversationSegment, Lead, Campaign } = require('../models');
const fs = require('fs');
const path = require('path');

/**
 * Script for demonstrating and validating the advanced voice AI capabilities
 */

// Test scenarios
const testScenarios = [
  {
    name: 'interested_customer',
    description: 'Customer who shows interest in the product',
    language: 'english',
    voiceType: 'female',
    personality: 'professional',
    responses: [
      'Hi, yes I can hear you',
      'That sounds interesting, can you tell me more about it?',
      'What are the main benefits?',
      'How much does it cost?',
      'That sounds good, I might be interested',
      'When can I start?',
      'Great, thank you for the information'
    ]
  },
  {
    name: 'objection_handling',
    description: 'Customer who raises objections',
    language: 'english',
    voiceType: 'male',
    personality: 'friendly',
    responses: [
      'Hello, who is this?',
      'I\'m not really interested right now',
      'It\'s too expensive for me',
      'I need to think about it',
      'Can you call me back next week?',
      'OK, thanks for understanding'
    ]
  },
  {
    name: 'confused_customer',
    description: 'Customer who is confused about the offering',
    language: 'hindi',
    voiceType: 'female',
    personality: 'empathetic',
    responses: [
      'हां, मैं सुन सकता हूं', // Yes, I can hear you
      'मुझे समझ नहीं आया, आप क्या बेच रहे हैं?', // I don't understand, what are you selling?
      'क्या आप इसे फिर से समझा सकते हैं?', // Can you explain it again?
      'अच्छा, अब मुझे समझ आया', // OK, now I understand
      'मुझे और जानकारी चाहिए', // I need more information
      'धन्यवाद, मैं इस पर विचार करूंगा' // Thank you, I will consider it
    ]
  },
  {
    name: 'angry_customer',
    description: 'Customer who is angry about being called',
    language: 'english',
    voiceType: 'male',
    personality: 'professional',
    responses: [
      'Yes, who is this?',
      'How did you get my number?',
      'I\'m not interested in your product',
      'Please remove me from your calling list',
      'I don\'t want to be called again',
      'Thank you for removing me'
    ]
  },
  {
    name: 'no_response',
    description: 'Customer who doesn\'t respond',
    language: 'english',
    voiceType: 'female',
    personality: 'friendly',
    responses: [
      '', // No response
      '', // No response
      'Oh, sorry, I was distracted',
      'Can you repeat that?',
      '', // No response
      'I have to go now, goodbye'
    ]
  }
];

/**
 * Run a voice AI demonstration
 * @param {string} scenarioName - Name of the scenario to run
 * @returns {Promise<object>} - Test results
 */
async function runDemo(scenarioName) {
  try {
    // Find scenario
    const scenario = testScenarios.find(s => s.name === scenarioName);
    
    if (!scenario) {
      throw new Error(`Scenario "${scenarioName}" not found`);
    }
    
    logger.info(`Running voice AI demo for scenario: ${scenario.name} - ${scenario.description}`);
    
    // Create test campaign if it doesn't exist
    let campaign = await Campaign.findOne({
      where: { name: 'Voice AI Demo Campaign' }
    });
    
    if (!campaign) {
      campaign = await Campaign.create({
        name: 'Voice AI Demo Campaign',
        description: 'Campaign for testing advanced voice AI capabilities',
        status: 'active',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        created_by: 'system'
      });
    }
    
    // Create test lead if it doesn't exist
    let lead = await Lead.findOne({
      where: { phone_number: '+15551234567' }
    });
    
    if (!lead) {
      lead = await Lead.create({
        first_name: 'Test',
        last_name: 'Customer',
        phone_number: '+15551234567',
        email: 'test@example.com',
        source: 'Demo',
        language_preference: scenario.language,
        status: 'active',
        created_by: 'system'
      });
    }
    
    // Simulate call initiation
    logger.info('Initiating test call...');
    
    const callResult = await advancedVoiceService.initiateAdvancedCall({
      phoneNumber: lead.phone_number,
      campaignId: campaign.id,
      leadId: lead.id,
      voiceType: scenario.voiceType,
      personality: scenario.personality,
      language: scenario.language,
      callbackUrl: 'http://localhost:5000'
    });
    
    logger.info(`Call initiated with ID: ${callResult.call.id}`);
    
    // Simulate conversation
    const conversationId = callResult.conversation.id;
    let lastTwiml = null;
    
    // Process each customer response
    for (let i = 0; i < scenario.responses.length; i++) {
      const response = scenario.responses[i];
      logger.info(`Processing customer response ${i + 1}: "${response}"`);
      
      if (response === '') {
        // Simulate no response
        logger.info('Simulating no response...');
        
        const noResponseResult = await advancedVoiceService.handleNoResponse({
          callId: callResult.call.id,
          conversationId,
          callbackUrl: 'http://localhost:5000'
        });
        
        lastTwiml = noResponseResult.twiml;
      } else {
        // Simulate customer response
        const responseResult = await advancedVoiceService.handleAdvancedResponse({
          callId: callResult.call.id,
          conversationId,
          speechResult: response,
          confidence: 0.9,
          callbackUrl: 'http://localhost:5000'
        });
        
        lastTwiml = responseResult.twiml;
        
        logger.info(`Response analysis: ${JSON.stringify(responseResult.analysis)}`);
        logger.info(`Next action: ${responseResult.nextAction}`);
      }
    }
    
    // End the call
    await Call.update(
      { status: 'completed', ended_at: new Date() },
      { where: { id: callResult.call.id } }
    );
    
    await Conversation.update(
      { status: 'completed', ended_at: new Date() },
      { where: { id: conversationId } }
    );
    
    // Get conversation transcript
    const segments = await ConversationSegment.findAll({
      where: { conversation_id: conversationId },
      order: [['sequence', 'ASC']]
    });
    
    const transcript = segments.map(segment => {
      return {
        speaker: segment.segment_type === 'agent' ? 'AI Agent' : 'Customer',
        text: segment.content,
        sequence: segment.sequence
      };
    });
    
    // Save transcript to file
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const transcriptPath = path.join(reportsDir, `voice-ai-demo-${scenario.name}-transcript.json`);
    fs.writeFileSync(transcriptPath, JSON.stringify({
      scenario: scenario.name,
      description: scenario.description,
      language: scenario.language,
      voiceType: scenario.voiceType,
      personality: scenario.personality,
      transcript
    }, null, 2));
    
    logger.info(`Demo completed for scenario: ${scenario.name}`);
    logger.info(`Transcript saved to: ${transcriptPath}`);
    
    return {
      success: true,
      scenario: scenario.name,
      callId: callResult.call.id,
      conversationId,
      transcript,
      transcriptPath
    };
  } catch (error) {
    logger.error(`Error running voice AI demo for scenario: ${scenarioName}`, error);
    throw error;
  }
}

/**
 * Run all demo scenarios
 * @returns {Promise<object>} - Test results
 */
async function runAllDemos() {
  const results = {};
  
  logger.info('Starting voice AI demos for all scenarios...');
  
  for (const scenario of testScenarios) {
    try {
      results[scenario.name] = await runDemo(scenario.name);
    } catch (error) {
      results[scenario.name] = {
        success: false,
        error: error.message
      };
    }
  }
  
  // Generate summary report
  const summaryPath = path.join(__dirname, '../reports/voice-ai-demo-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));
  
  logger.info(`All voice AI demos completed. Summary saved to: ${summaryPath}`);
  
  return {
    success: true,
    results,
    summaryPath
  };
}

// Execute demos if script is run directly
if (require.main === module) {
  const scenarioName = process.argv[2];
  
  if (scenarioName && scenarioName !== 'all') {
    runDemo(scenarioName)
      .then(result => {
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
      })
      .catch(error => {
        console.error('Demo failed:', error);
        process.exit(1);
      });
  } else {
    runAllDemos()
      .then(result => {
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
      })
      .catch(error => {
        console.error('Demos failed:', error);
        process.exit(1);
      });
  }
}

module.exports = {
  runDemo,
  runAllDemos
};
