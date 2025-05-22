const Call = require('../models/Call');
const CampaignLead = require('../models/CampaignLead');
const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');
const Conversation = require('../models/Conversation');
const ConversationSegment = require('../models/ConversationSegment');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');
const AuditLog = require('../models/AuditLog');
const config = require('../config/config');
const twilio = require('twilio')(config.twilioAccountSid, config.twilioAuthToken);
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: config.awsRegion });

// Initiate a new call
exports.initiateCall = async (req, res) => {
  try {
    const { campaign_lead_id } = req.body;

    // Validate campaign lead
    const campaignLead = await CampaignLead.findByPk(campaign_lead_id, {
      include: [
        { model: Lead },
        { model: Campaign }
      ]
    });

    if (!campaignLead) {
      return res.status(404).json({ message: 'Campaign lead not found' });
    }

    // Check if campaign is active
    if (campaignLead.Campaign.status !== 'active') {
      return res.status(400).json({ message: 'Cannot initiate call for inactive campaign' });
    }

    // Check if lead is on DND
    if (campaignLead.Lead.dnd_status) {
      return res.status(400).json({ message: 'Cannot call lead on DND registry' });
    }

    // Check if there's already an active call for this lead
    const activeCall = await Call.findOne({
      where: {
        campaign_lead_id,
        status: {
          [sequelize.Op.in]: ['initiated', 'ringing', 'in-progress']
        }
      }
    });

    if (activeCall) {
      return res.status(400).json({ message: 'Active call already exists for this lead' });
    }

    // Create call record
    const call = await Call.create({
      campaign_lead_id,
      status: 'initiated',
      start_time: new Date()
    });

    // Update campaign lead status
    campaignLead.status = 'called';
    await campaignLead.save();

    // Initiate Twilio call
    const twilioCall = await twilio.calls.create({
      url: `${req.protocol}://${req.get('host')}/api/calls/twilio/voice?call_id=${call.id}`,
      to: campaignLead.Lead.phone_number,
      from: config.twilioPhoneNumber,
      statusCallback: `${req.protocol}://${req.get('host')}/api/calls/twilio/status?call_id=${call.id}`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      record: true
    });

    // Update call with Twilio ID
    call.twilio_call_id = twilioCall.sid;
    await call.save();

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'INITIATE_CALL',
      entity_type: 'Call',
      entity_id: call.id,
      details: { 
        campaign_id: campaignLead.Campaign.id, 
        lead_id: campaignLead.Lead.id,
        phone_number: campaignLead.Lead.phone_number,
        twilio_call_id: twilioCall.sid
      },
      ip_address: req.ip
    });

    res.status(200).json({
      message: 'Call initiated successfully',
      call: {
        id: call.id,
        campaign_lead_id: call.campaign_lead_id,
        twilio_call_id: call.twilio_call_id,
        status: call.status,
        start_time: call.start_time
      }
    });
  } catch (error) {
    logger.error('Initiate call error:', error);
    res.status(500).json({ message: 'Error initiating call', error: error.message });
  }
};

// Get all calls with pagination and filtering
exports.getAllCalls = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, campaign_id, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where clause for filtering
    const whereClause = {};
    if (status) whereClause.status = status;
    
    // Date range filter
    if (start_date || end_date) {
      whereClause.start_time = {};
      if (start_date) whereClause.start_time[sequelize.Op.gte] = new Date(start_date);
      if (end_date) whereClause.start_time[sequelize.Op.lte] = new Date(end_date);
    }

    // Campaign filter
    const includeClause = [
      {
        model: CampaignLead,
        include: [
          { model: Lead },
          { model: Campaign }
        ]
      }
    ];

    if (campaign_id) {
      includeClause[0].where = { campaign_id };
    }

    // Get calls with pagination
    const { count, rows: calls } = await Call.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['start_time', 'DESC']],
      include: includeClause
    });

    res.status(200).json({
      calls,
      totalCalls: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    logger.error('Get all calls error:', error);
    res.status(500).json({ message: 'Error fetching calls', error: error.message });
  }
};

// Get call by ID
exports.getCallById = async (req, res) => {
  try {
    const callId = req.params.id;
    
    const call = await Call.findByPk(callId, {
      include: [
        {
          model: CampaignLead,
          include: [
            { model: Lead },
            { model: Campaign }
          ]
        }
      ]
    });

    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    res.status(200).json(call);
  } catch (error) {
    logger.error('Get call by ID error:', error);
    res.status(500).json({ message: 'Error fetching call', error: error.message });
  }
};

// Hangup call
exports.hangupCall = async (req, res) => {
  try {
    const callId = req.params.id;
    
    const call = await Call.findByPk(callId);

    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    // Check if call is active
    if (!['initiated', 'ringing', 'in-progress'].includes(call.status)) {
      return res.status(400).json({ message: 'Call is not active' });
    }

    // Hangup Twilio call
    await twilio.calls(call.twilio_call_id).update({ status: 'completed' });

    // Update call status
    call.status = 'completed';
    call.end_time = new Date();
    if (call.start_time) {
      call.duration = Math.round((call.end_time - call.start_time) / 1000);
    }
    await call.save();

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'HANGUP_CALL',
      entity_type: 'Call',
      entity_id: callId,
      details: { twilio_call_id: call.twilio_call_id },
      ip_address: req.ip
    });

    res.status(200).json({
      message: 'Call hung up successfully',
      call: {
        id: call.id,
        status: call.status,
        end_time: call.end_time,
        duration: call.duration
      }
    });
  } catch (error) {
    logger.error('Hangup call error:', error);
    res.status(500).json({ message: 'Error hanging up call', error: error.message });
  }
};

// Get call recording
exports.getCallRecording = async (req, res) => {
  try {
    const callId = req.params.id;
    
    const call = await Call.findByPk(callId);

    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    if (!call.recording_url) {
      return res.status(404).json({ message: 'No recording available for this call' });
    }

    // If recording is stored in S3
    if (call.recording_url.startsWith('s3://')) {
      const s3Path = call.recording_url.replace('s3://', '');
      const [bucket, ...keyParts] = s3Path.split('/');
      const key = keyParts.join('/');

      const s3Params = {
        Bucket: bucket,
        Key: key,
        Expires: 60 * 5 // URL expires in 5 minutes
      };

      const signedUrl = s3.getSignedUrl('getObject', s3Params);
      
      return res.status(200).json({
        recording_url: signedUrl,
        expires_in: '5 minutes'
      });
    }

    // If recording is stored in Twilio
    res.status(200).json({
      recording_url: call.recording_url
    });
  } catch (error) {
    logger.error('Get call recording error:', error);
    res.status(500).json({ message: 'Error fetching call recording', error: error.message });
  }
};

// Twilio voice webhook
exports.twilioVoiceWebhook = async (req, res) => {
  try {
    const callId = req.query.call_id;
    
    if (!callId) {
      logger.error('Twilio voice webhook: No call_id provided');
      return res.status(400).send('No call_id provided');
    }

    const call = await Call.findByPk(callId, {
      include: [
        {
          model: CampaignLead,
          include: [
            { model: Lead },
            { 
              model: Campaign,
              include: [
                {
                  model: sequelize.models.CampaignScript,
                  where: {
                    is_active: true
                  },
                  required: false
                }
              ]
            }
          ]
        }
      ]
    });

    if (!call) {
      logger.error(`Twilio voice webhook: Call ${callId} not found`);
      return res.status(404).send('Call not found');
    }

    // Get lead language preference
    const languagePreference = call.CampaignLead.Lead.language_preference || 'english';

    // Find appropriate script
    const scripts = call.CampaignLead.Campaign.CampaignScripts;
    let script = scripts.find(s => s.language === languagePreference);
    
    // Fallback to English if preferred language not available
    if (!script && languagePreference !== 'english') {
      script = scripts.find(s => s.language === 'english');
    }

    // Generate TwiML response
    const twiml = new twilio.twiml.VoiceResponse();

    if (script) {
      // Use script content
      twiml.say({
        voice: languagePreference === 'hindi' ? 'Polly.Aditi' : 'Polly.Joanna',
        language: languagePreference === 'hindi' ? 'hi-IN' : 'en-US'
      }, script.script_content);

      // Add pause for customer response
      twiml.pause({ length: 2 });

      // Record the conversation
      twiml.record({
        action: `${req.protocol}://${req.get('host')}/api/calls/twilio/recording?call_id=${callId}`,
        transcribe: true,
        transcribeCallback: `${req.protocol}://${req.get('host')}/api/calls/twilio/transcript?call_id=${callId}`,
        maxLength: 300, // 5 minutes
        playBeep: false
      });

      // Add a goodbye message
      twiml.say({
        voice: languagePreference === 'hindi' ? 'Polly.Aditi' : 'Polly.Joanna',
        language: languagePreference === 'hindi' ? 'hi-IN' : 'en-US'
      }, languagePreference === 'hindi' ? 'धन्यवाद, अलविदा!' : 'Thank you, goodbye!');
    } else {
      // No script found, use default message
      twiml.say({
        voice: 'Polly.Joanna',
        language: 'en-US'
      }, 'Hello, this is an automated call. Unfortunately, we do not have a script prepared for this call. Goodbye.');
    }

    // Send TwiML response
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    logger.error('Twilio voice webhook error:', error);
    
    // Generate error TwiML
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({
      voice: 'Polly.Joanna',
      language: 'en-US'
    }, 'We are experiencing technical difficulties. Please try again later.');
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
};

// Twilio status callback
exports.twilioStatusCallback = async (req, res) => {
  try {
    const callId = req.query.call_id;
    const callStatus = req.body.CallStatus;
    const callDuration = req.body.CallDuration;
    
    if (!callId) {
      logger.error('Twilio status callback: No call_id provided');
      return res.status(400).send('No call_id provided');
    }

    const call = await Call.findByPk(callId);

    if (!call) {
      logger.error(`Twilio status callback: Call ${callId} not found`);
      return res.status(404).send('Call not found');
    }

    // Map Twilio status to our status
    let status;
    switch (callStatus) {
      case 'initiated':
        status = 'initiated';
        break;
      case 'ringing':
        status = 'ringing';
        break;
      case 'in-progress':
        status = 'in-progress';
        break;
      case 'completed':
        status = 'completed';
        break;
      case 'busy':
      case 'no-answer':
        status = 'no-answer';
        break;
      case 'failed':
      case 'canceled':
        status = 'failed';
        break;
      default:
        status = 'failed';
    }

    // Update call record
    call.status = status;
    
    if (status === 'completed' || status === 'no-answer' || status === 'failed') {
      call.end_time = new Date();
      
      // If duration is provided by Twilio, use it
      if (callDuration) {
        call.duration = parseInt(callDuration);
      } 
      // Otherwise calculate it if we have start_time
      else if (call.start_time) {
        call.duration = Math.round((call.end_time - call.start_time) / 1000);
      }
    }

    await call.save();

    // Update campaign lead status
    if (status === 'completed' || status === 'no-answer' || status === 'failed') {
      const campaignLead = await CampaignLead.findByPk(call.campaign_lead_id);
      if (campaignLead) {
        campaignLead.status = 'completed';
        await campaignLead.save();
      }
    }

    res.status(200).send('Status updated');
  } catch (error) {
    logger.error('Twilio status callback error:', error);
    res.status(500).send('Error processing status callback');
  }
};

// Get call conversation
exports.getCallConversation = async (req, res) => {
  try {
    const callId = req.params.id;
    
    const conversation = await Conversation.findOne({
      where: { call_id: callId },
      include: [
        {
          model: sequelize.models.ConversationSegment,
          order: [['start_time', 'ASC']]
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found for this call' });
    }

    res.status(200).json(conversation);
  } catch (error) {
    logger.error('Get call conversation error:', error);
    res.status(500).json({ message: 'Error fetching call conversation', error: error.message });
  }
};

// Get call transcript
exports.getCallTranscript = async (req, res) => {
  try {
    const callId = req.params.id;
    
    const conversation = await Conversation.findOne({
      where: { call_id: callId },
      include: [
        {
          model: sequelize.models.ConversationSegment,
          order: [['start_time', 'ASC']]
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Transcript not found for this call' });
    }

    // Format transcript
    const transcript = conversation.ConversationSegments.map(segment => {
      const speaker = segment.speaker === 'agent' ? 'Agent' : 'Customer';
      return `[${speaker}]: ${segment.content}`;
    }).join('\n\n');

    res.status(200).json({
      call_id: callId,
      transcript,
      segments: conversation.ConversationSegments
    });
  } catch (error) {
    logger.error('Get call transcript error:', error);
    res.status(500).json({ message: 'Error fetching call transcript', error: error.message });
  }
};
