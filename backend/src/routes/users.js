const express = require('express');
const authenticate = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticate, async (req, res) => {
  try {
    const pool = require('../config/database');
    const query = `
      SELECT u.id, u.username, u.email, u.name, u.is_active, u.created_at, u.last_login,
             r.name as role_name, g.name as group_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN groups g ON u.group_id = g.id
      ORDER BY u.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    logger.info(`Users list accessed by: ${req.user.username}`);
    
    res.json({
      users: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
