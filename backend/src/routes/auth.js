const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, refresh, logout } = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { 
    error: 'Too many login attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login endpoint
router.post('/login', authLimiter, async (req, res) => {
  try {
    await login(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    await refresh(req, res);
  } catch (error) {
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    await logout(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user endpoint
router.get('/me', authenticate, async (req, res) => {
  try {
    const userQuery = `
      SELECT u.id, u.username, u.email, u.name, u.created_at, u.last_login,
             r.name as role_name, g.name as group_name, g.color as group_color
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE u.id = $1 AND u.is_active = true
    `;
    
    const pool = require('../config/database');
    const result = await pool.query(userQuery, [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    
    logger.info(`User info accessed: ${user.username}`);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role_name,
        group: user.group_name ? {
          id: user.group_id,
          name: user.group_name,
          color: user.group_color
        } : null,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    logger.error('Get user info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
