const express = require('express');
const authenticate = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get all groups
router.get('/groups', authenticate, async (req, res) => {
  try {
    const pool = require('../config/database');
    const query = `
      SELECT id, name, color, is_active, created_at
      FROM groups
      WHERE is_active = true
      ORDER BY name
    `;
    
    const result = await pool.query(query);
    
    logger.info(`Groups list accessed by user: ${req.user.username}`);
    
    res.json({
      groups: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    logger.error('Get groups error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all roles
router.get('/roles', authenticate, async (req, res) => {
  try {
    const pool = require('../config/database');
    const query = `
      SELECT r.*, 
             COUNT(rp.permission_id) as permission_count
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id, r.name, r.description, r.created_at
      ORDER BY r.name
    `;
    
    const result = await pool.query(query);
    
    logger.info(`Roles list accessed by user: ${req.user.username}`);
    
    res.json({
      roles: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    logger.error('Get roles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all permissions
router.get('/permissions', authenticate, async (req, res) => {
  try {
    const pool = require('../config/database');
    const query = `
      SELECT * FROM permissions
      ORDER BY module, action
    `;
    
    const result = await pool.query(query);
    
    logger.info(`Permissions list accessed by user: ${req.user.username}`);
    
    res.json({
      permissions: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    logger.error('Get permissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
