// src/routes/multiLingualVoiceRoutes.js
const express = require('express');
const router = express.Router();
const multiLingualVoiceController = require('../controllers/multiLingualVoiceController');
const auth = require('../middleware/auth');

// Initialize a multi-lingual voice call
router.post('/initiate-call', auth, multiLingualVoiceController.initiateCall);

// Handle customer response
router.post('/handle-response', auth, multiLingualVoiceController.handleResponse);

// Get supported languages
router.get('/supported-languages', auth, multiLingualVoiceController.getSupportedLanguages);

module.exports = router;
