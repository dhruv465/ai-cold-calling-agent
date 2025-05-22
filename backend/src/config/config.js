// src/config/config.js
require('dotenv').config();

module.exports = {
  app: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    webhookBaseUrl: process.env.WEBHOOK_BASE_URL || 'http://localhost:5000'
  },
  database: {
    name: process.env.DB_NAME || 'ai_cold_calling',
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    defaultModel: process.env.AI_DEFAULT_MODEL || 'gpt-4'
  }
};
