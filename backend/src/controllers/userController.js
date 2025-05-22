const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const logger = require('../utils/logger');
const AuditLog = require('../models/AuditLog');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { 
        [sequelize.Op.or]: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password_hash: password, // Will be hashed by model hook
      first_name,
      last_name,
      role: role || 'agent', // Default role
      is_active: true
    });

    // Log the action
    await AuditLog.create({
      user_id: null, // System action
      action: 'REGISTER',
      entity_type: 'User',
      entity_id: user.id,
      details: { username, email, role },
      ip_address: req.ip
    });

    // Generate token
    const token = generateToken(user);

    // Return user info and token
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is disabled' });
    }

    // Check password
    const isPasswordValid = await user.checkPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    // Log the action
    await AuditLog.create({
      user_id: user.id,
      action: 'LOGIN',
      entity_type: 'User',
      entity_id: user.id,
      details: { email },
      ip_address: req.ip
    });

    // Return user info and token
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, password } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (password) user.password_hash = password;

    await user.save();

    // Log the action
    await AuditLog.create({
      user_id: userId,
      action: 'UPDATE_PROFILE',
      entity_type: 'User',
      entity_id: userId,
      details: { updated: { first_name, last_name, password: password ? '[REDACTED]' : undefined } },
      ip_address: req.ip
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] }
    });

    res.status(200).json(users);
  } catch (error) {
    logger.error('Get all users error:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get user by ID (admin and manager only)
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, first_name, last_name, role, is_active, password } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (role) user.role = role;
    if (is_active !== undefined) user.is_active = is_active;
    if (password) user.password_hash = password;

    await user.save();

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'UPDATE_USER',
      entity_type: 'User',
      entity_id: userId,
      details: { 
        updated: { 
          username, 
          email, 
          first_name, 
          last_name, 
          role, 
          is_active, 
          password: password ? '[REDACTED]' : undefined 
        } 
      },
      ip_address: req.ip
    });

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active
      }
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Instead of hard delete, set is_active to false
    user.is_active = false;
    await user.save();

    // Log the action
    await AuditLog.create({
      user_id: req.user.id,
      action: 'DELETE_USER',
      entity_type: 'User',
      entity_id: userId,
      details: { username: user.username, email: user.email },
      ip_address: req.ip
    });

    res.status(200).json({ message: 'User deactivated successfully' });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deactivating user', error: error.message });
  }
};
