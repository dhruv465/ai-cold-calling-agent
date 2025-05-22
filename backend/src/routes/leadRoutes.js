const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const router = express.Router();

// Import controllers (to be implemented)
const leadController = require('../controllers/leadController');

// Protected routes
router.post('/leads', verifyToken, authorize(['admin', 'manager']), leadController.createLead);
router.get('/leads', verifyToken, leadController.getAllLeads);
router.get('/leads/:id', verifyToken, leadController.getLeadById);
router.put('/leads/:id', verifyToken, authorize(['admin', 'manager']), leadController.updateLead);
router.delete('/leads/:id', verifyToken, authorize(['admin']), leadController.deleteLead);

// Lead import
router.post('/leads/import/csv', verifyToken, authorize(['admin', 'manager']), leadController.importLeadsFromCSV);
router.post('/leads/import/api', verifyToken, authorize(['admin', 'manager']), leadController.importLeadsFromAPI);

// DND check
router.post('/leads/dnd-check', verifyToken, authorize(['admin', 'manager']), leadController.checkDNDStatus);
router.post('/leads/batch-dnd-check', verifyToken, authorize(['admin', 'manager']), leadController.batchCheckDNDStatus);

module.exports = router;
