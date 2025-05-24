// src/routes/settingsRoutes.js
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');

// Get API credentials
router.get('/api-credentials', auth, settingsController.getApiCredentials);

// Save API credentials
router.post('/api-credentials', auth, settingsController.saveCredentials);

// Validate API credentials
router.post('/validate-credentials', auth, settingsController.validateCredentials);

// Create backup
router.post('/create-backup', auth, settingsController.createBackup);

// Get available backups
router.get('/available-backups', auth, settingsController.getAvailableBackups);

// Restore from backup
router.post('/restore-backup', auth, settingsController.restoreFromBackup);

module.exports = router;
