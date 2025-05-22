const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const router = express.Router();

// Import controllers (to be implemented)
const userController = require('../controllers/userController');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.get('/users', verifyToken, authorize(['admin']), userController.getAllUsers);
router.get('/users/:id', verifyToken, authorize(['admin', 'manager']), userController.getUserById);
router.put('/users/:id', verifyToken, authorize(['admin']), userController.updateUser);
router.delete('/users/:id', verifyToken, authorize(['admin']), userController.deleteUser);

module.exports = router;
