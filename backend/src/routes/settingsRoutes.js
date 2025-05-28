const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get all settings
router.get('/', settingsController.getAllSettings);

// Get settings by category
router.get('/:category', settingsController.getSettingsByCategory);

// Update settings (batch update)
router.put('/', settingsController.updateSettings);

// Validate API key
router.post('/validate-api-key', settingsController.validateApiKey);

// Delete setting
router.delete('/:category/:key', settingsController.deleteSetting);

module.exports = router;
