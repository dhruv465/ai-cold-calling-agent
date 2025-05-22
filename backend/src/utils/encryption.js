// src/utils/encryption.js
const crypto = require('crypto');
const config = require('../config/config');
const logger = require('./logger');

/**
 * Utility for handling encryption and decryption
 */
class EncryptionUtil {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.tagLength = 16; // 128 bits
    this.encryptionKey = config.encryption?.key || process.env.ENCRYPTION_KEY;
    
    // If no encryption key is provided, generate one and log a warning
    if (!this.encryptionKey) {
      this.encryptionKey = crypto.randomBytes(this.keyLength).toString('hex');
      logger.warn('No encryption key provided. Generated a temporary key. This is not secure for production use.');
    }
  }

  /**
   * Encrypt sensitive data
   * @param {string} text - Text to encrypt
   * @returns {string} - Encrypted text in format: iv:tag:encrypted
   */
  encrypt(text) {
    try {
      if (!text) return '';
      
      const iv = crypto.randomBytes(this.ivLength);
      const key = Buffer.from(this.encryptionKey, 'hex');
      
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag().toString('hex');
      
      // Format: iv:tag:encrypted
      return `${iv.toString('hex')}:${tag}:${encrypted}`;
    } catch (error) {
      logger.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   * @param {string} encryptedText - Encrypted text in format: iv:tag:encrypted
   * @returns {string} - Decrypted text
   */
  decrypt(encryptedText) {
    try {
      if (!encryptedText) return '';
      
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted text format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const tag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      const key = Buffer.from(this.encryptionKey, 'hex');
      
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash a password
   * @param {string} password - Password to hash
   * @returns {string} - Hashed password
   */
  hashPassword(password) {
    try {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      
      return `${salt}:${hash}`;
    } catch (error) {
      logger.error('Password hashing error:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify a password against a hash
   * @param {string} password - Password to verify
   * @param {string} hashedPassword - Hashed password in format: salt:hash
   * @returns {boolean} - Whether the password matches the hash
   */
  verifyPassword(password, hashedPassword) {
    try {
      const parts = hashedPassword.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid hashed password format');
      }
      
      const salt = parts[0];
      const storedHash = parts[1];
      
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      
      return storedHash === hash;
    } catch (error) {
      logger.error('Password verification error:', error);
      throw new Error('Failed to verify password');
    }
  }

  /**
   * Generate a secure random token
   * @param {number} length - Length of the token in bytes
   * @returns {string} - Random token in hex format
   */
  generateToken(length = 32) {
    try {
      return crypto.randomBytes(length).toString('hex');
    } catch (error) {
      logger.error('Token generation error:', error);
      throw new Error('Failed to generate token');
    }
  }
}

module.exports = new EncryptionUtil();
