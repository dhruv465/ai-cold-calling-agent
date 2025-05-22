// src/routes/advancedVoiceRoutes.js
const express = require('express');
const router = express.Router();
const advancedVoiceController = require('../controllers/advancedVoiceController');
const { authenticate } = require('../middleware/auth');

// Public routes for Twilio webhooks
router.post('/response', advancedVoiceController.handleResponse);
router.post('/no-response', advancedVoiceController.handleNoResponse);
router.post('/end-call', advancedVoiceController.endCallNoResponse);
router.post('/status', advancedVoiceController.handleStatus);
router.post('/recording', advancedVoiceController.handleRecording);

// Protected routes
router.post('/initiate', authenticate, advancedVoiceController.initiateCall);
router.get('/options', authenticate, advancedVoiceController.getVoiceOptions);
router.get('/call/:callId', authenticate, advancedVoiceController.getCallDetails);

module.exports = router;
