// src/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

// All AI routes require authentication
router.use(authenticate);

// Script generation
router.post('/generate-script', aiController.generateScript);

// Response analysis
router.post('/analyze-response', aiController.analyzeResponse);

// Question handling
router.post('/generate-question-response', aiController.generateQuestionResponse);

// Objection handling
router.post('/handle-objection', aiController.handleObjection);

// Knowledge base
router.get('/knowledge-base/:campaignId', aiController.getKnowledgeBase);
router.post('/knowledge-base', aiController.createKnowledgeBaseEntry);

module.exports = router;
