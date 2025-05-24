// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/config');
const logger = require('./utils/logger');

// Import routes
const userRoutes = require('./routes/userRoutes');
const leadRoutes = require('./routes/leadRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const callRoutes = require('./routes/callRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const twilioRoutes = require('./routes/twilioRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const multiLingualVoiceRoutes = require('./routes/multiLingualVoiceRoutes');

// Import services for initialization
const apiConfigService = require('./services/apiConfigService');
const elevenLabsService = require('./services/elevenLabsService');
const languageDetectionService = require('./services/languageDetectionService');
const multiLingualVoiceService = require('./services/multiLingualVoiceService');

// Create Express app
const app = express();

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/twilio', twilioRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/voice', multiLingualVoiceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Initialize services
(async () => {
  try {
    // Initialize API configuration service
    await apiConfigService.initialize();
    
    // Load API credentials
    const credentials = await apiConfigService.loadCredentials();
    
    // Initialize ElevenLabs service if credentials exist
    if (credentials.elevenlabs) {
      await elevenLabsService.initialize(credentials.elevenlabs);
    }
    
    // Initialize language detection service if credentials exist
    if (credentials.languageDetection) {
      await languageDetectionService.initialize(credentials.languageDetection);
    }
    
    // Initialize multi-lingual voice service
    await multiLingualVoiceService.initialize();
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Error initializing services:', error);
  }
})();

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: config.env === 'development' ? err.message : undefined
  });
});

module.exports = app;
