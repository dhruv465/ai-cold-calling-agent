const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const router = express.Router();

// Import controllers (to be implemented)
const campaignController = require('../controllers/campaignController');

// Protected routes
router.post('/campaigns', verifyToken, authorize(['admin', 'manager']), campaignController.createCampaign);
router.get('/campaigns', verifyToken, campaignController.getAllCampaigns);
router.get('/campaigns/:id', verifyToken, campaignController.getCampaignById);
router.put('/campaigns/:id', verifyToken, authorize(['admin', 'manager']), campaignController.updateCampaign);
router.delete('/campaigns/:id', verifyToken, authorize(['admin']), campaignController.deleteCampaign);

// Campaign scripts
router.post('/campaigns/:id/scripts', verifyToken, authorize(['admin', 'manager']), campaignController.addCampaignScript);
router.get('/campaigns/:id/scripts', verifyToken, campaignController.getCampaignScripts);
router.put('/campaigns/:id/scripts/:scriptId', verifyToken, authorize(['admin', 'manager']), campaignController.updateCampaignScript);

// Campaign leads
router.post('/campaigns/:id/leads', verifyToken, authorize(['admin', 'manager']), campaignController.addLeadsToCampaign);
router.get('/campaigns/:id/leads', verifyToken, campaignController.getCampaignLeads);
router.delete('/campaigns/:id/leads/:leadId', verifyToken, authorize(['admin', 'manager']), campaignController.removeLeadFromCampaign);

// Campaign analytics
router.get('/campaigns/:id/analytics', verifyToken, campaignController.getCampaignAnalytics);
router.get('/campaigns/:id/performance', verifyToken, campaignController.getCampaignPerformance);

module.exports = router;
