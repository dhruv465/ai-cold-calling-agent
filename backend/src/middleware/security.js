// src/middleware/security.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../utils/logger');
const { AuditLog } = require('../models');

/**
 * Security middleware for handling various security aspects
 */

// Rate limiting configuration
const rateLimits = {
  login: { windowMs: 15 * 60 * 1000, max: 10 }, // 10 attempts per 15 minutes
  api: { windowMs: 60 * 1000, max: 100 }, // 100 requests per minute
  webhooks: { windowMs: 60 * 1000, max: 200 } // 200 requests per minute for webhooks
};

// CORS configuration
const corsOptions = {
  origin: config.app.allowedOrigins || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

/**
 * Authenticate user using JWT
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }
    
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      
      req.user = decoded;
      next();
    });
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Check if user has required role
 * @param {string[]} roles - Array of allowed roles
 * @returns {function} - Express middleware function
 */
const authorize = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      return res.status(500).json({ error: 'Authorization failed' });
    }
  };
};

/**
 * Log audit events
 * @param {string} action - The action being performed
 * @returns {function} - Express middleware function
 */
const auditLog = (action) => {
  return async (req, res, next) => {
    try {
      const originalSend = res.send;
      
      // Override res.send to capture response
      res.send = function (body) {
        res.responseBody = body;
        return originalSend.call(this, body);
      };
      
      // Continue with request
      next();
      
      // After response is sent, log the audit event
      res.on('finish', async () => {
        try {
          const userId = req.user?.id;
          const entityType = req.baseUrl.split('/').pop();
          const entityId = req.params.id;
          const details = JSON.stringify({
            method: req.method,
            path: req.path,
            query: req.query,
            body: req.body,
            statusCode: res.statusCode
          });
          
          await AuditLog.create({
            user_id: userId,
            action: action || req.method,
            entity_type: entityType,
            entity_id: entityId,
            details,
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
          });
        } catch (error) {
          logger.error('Error creating audit log:', error);
        }
      });
    } catch (error) {
      logger.error('Audit logging error:', error);
      next();
    }
  };
};

/**
 * Validate Twilio request signature
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const validateTwilioSignature = (req, res, next) => {
  try {
    const twilio = require('twilio');
    const twilioSignature = req.headers['x-twilio-signature'];
    const url = config.app.webhookBaseUrl + req.originalUrl;
    
    // Skip validation in development mode if configured
    if (config.app.env === 'development' && config.app.skipTwilioValidation) {
      return next();
    }
    
    if (!twilioSignature) {
      return res.status(403).send('No Twilio signature found');
    }
    
    const isValid = twilio.validateRequest(
      config.twilio.authToken,
      twilioSignature,
      url,
      req.body
    );
    
    if (!isValid) {
      logger.warn('Invalid Twilio signature:', {
        signature: twilioSignature,
        url,
        body: req.body
      });
      return res.status(403).send('Invalid Twilio signature');
    }
    
    next();
  } catch (error) {
    logger.error('Twilio signature validation error:', error);
    return res.status(500).send('Signature validation failed');
  }
};

/**
 * Sanitize user input to prevent XSS attacks
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const sanitizeInput = (req, res, next) => {
  try {
    const xss = require('xss');
    
    // Sanitize request body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = xss(req.body[key]);
        }
      });
    }
    
    // Sanitize request query
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = xss(req.query[key]);
        }
      });
    }
    
    // Sanitize request params
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = xss(req.params[key]);
        }
      });
    }
    
    next();
  } catch (error) {
    logger.error('Input sanitization error:', error);
    next();
  }
};

/**
 * Check if phone number is on DND registry
 * @param {string} phoneNumber - The phone number to check
 * @returns {Promise<boolean>} - Whether the number is on DND registry
 */
const checkDndRegistry = async (phoneNumber) => {
  try {
    // In a production environment, this would call the actual DND registry API
    // For now, we'll simulate the check
    
    logger.info(`Checking DND status for ${phoneNumber}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For testing, we'll consider numbers ending with '0000' as DND
    const isDnd = phoneNumber.endsWith('0000');
    
    logger.info(`DND status for ${phoneNumber}: ${isDnd ? 'Registered' : 'Not registered'}`);
    
    return isDnd;
  } catch (error) {
    logger.error('DND registry check error:', error);
    throw error;
  }
};

module.exports = {
  authenticate,
  authorize,
  auditLog,
  validateTwilioSignature,
  sanitizeInput,
  checkDndRegistry,
  rateLimits,
  corsOptions
};
