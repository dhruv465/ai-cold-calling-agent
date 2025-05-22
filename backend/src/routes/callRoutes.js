const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const router = express.Router();

// Import controllers (to be implemented)
const callController = require('../controllers/callController');

// Protected routes
router.post('/calls/initiate', verifyToken, authorize(['admin', 'manager']), callController.initiateCall);
router.get('/calls', verifyToken, callController.getAllCalls);
router.get('/calls/:id', verifyToken, callController.getCallById);
router.post('/calls/:id/hangup', verifyToken, authorize(['admin', 'manager']), callController.hangupCall);

// Call recordings
router.get('/calls/:id/recording', verifyToken, callController.getCallRecording);

// Twilio webhook endpoints (public)
router.post('/twilio/voice', callController.twilioVoiceWebhook);
router.post('/twilio/status', callController.twilioStatusCallback);

// Conversation endpoints
router.get('/calls/:id/conversation', verifyToken, callController.getCallConversation);
router.get('/calls/:id/transcript', verifyToken, callController.getCallTranscript);

module.exports = router;
