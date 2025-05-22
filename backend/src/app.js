const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const path = require('path');
const config = require('./src/config/config');
const logger = require('./src/utils/logger');
const { testConnection } = require('./src/config/database');

// Import routes
const userRoutes = require('./src/routes/userRoutes');
const leadRoutes = require('./src/routes/leadRoutes');
const campaignRoutes = require('./src/routes/campaignRoutes');
const callRoutes = require('./src/routes/callRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const aiRoutes = require('./src/routes/aiRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  abortOnLimit: true
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: config.nodeEnv });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
  
  // Test database connection
  const dbConnected = await testConnection();
  if (dbConnected) {
    logger.info('Database connection established');
  } else {
    logger.error('Unable to connect to database');
  }
});

module.exports = app;
