// src/routes/twilioRoutes.js
const express = require('express');
const router = express.Router();
const twilioController = require('../controllers/twilioController');
const { authenticate } = require('../middleware/auth');

// Protected routes (require authentication)
router.post('/initiate-call', authenticate, twilioController.initiateCall);
router.post('/schedule-callback', authenticate, twilioController.scheduleCallback);

// Webhook routes (no authentication required, but should validate Twilio signatures in production)
router.post('/voice-response', twilioController.handleVoiceWebhook);
router.post('/speech-result', twilioController.handleSpeechResult);
router.post('/call-status', twilioController.handleStatusCallback);
router.post('/recording-callback', twilioController.handleRecordingCallback);

module.exports = router;
