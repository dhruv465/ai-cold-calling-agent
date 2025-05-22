const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const router = express.Router();

// Import controllers (to be implemented)
const analyticsController = require('../controllers/analyticsController');

// Protected routes
router.get('/analytics/dashboard', verifyToken, analyticsController.getDashboardMetrics);
router.get('/analytics/calls', verifyToken, analyticsController.getCallMetrics);
router.get('/analytics/leads', verifyToken, analyticsController.getLeadMetrics);
router.get('/analytics/agents', verifyToken, analyticsController.getAgentPerformance);
router.get('/analytics/campaigns', verifyToken, analyticsController.getCampaignComparison);
router.get('/analytics/regions', verifyToken, analyticsController.getRegionalDistribution);

// Report generation
router.post('/analytics/reports/generate', verifyToken, authorize(['admin', 'manager']), analyticsController.generateReport);
router.get('/analytics/reports', verifyToken, analyticsController.getReports);
router.get('/analytics/reports/:id', verifyToken, analyticsController.getReportById);

module.exports = router;
