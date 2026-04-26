const pool = require('../config/database');
const authService = require('../services/authService');
const logger = require('../utils/logger');

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const clientInfo = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };

    // Find user by email or username
    const userQuery = `
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE (u.email = $1 OR u.username = $1) 
      AND u.is_active = true
    `;
    
    const userResult = await pool.query(userQuery, [identifier]);
    
    if (userResult.rows.length === 0) {
      logger.warn(`Login attempt for non-existent user: ${identifier}`, clientInfo);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isPasswordValid = await authService.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      logger.warn(`Invalid password for user: ${identifier}`, clientInfo);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Get user permissions
    const permissionsQuery = `
      SELECT p.name, p.module, p.action 
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1
    `;
    
    const permissionsResult = await pool.query(permissionsQuery, [user.role_id]);
    const permissions = permissionsResult.rows;

    // Create tokens
    const { accessToken, refreshToken } = await authService.createTokens(user.id);

    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    logger.info(`User logged in: ${user.username}`, clientInfo);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role_name,
        group_id: user.group_id
      },
      permissions,
      accessToken,
      expiresIn: process.env.JWT_EXPIRES_IN
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    // Verify refresh token
    const decoded = await authService.verifyRefreshToken(refreshToken);
    
    // Get user info
    const userQuery = `
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.id = $1 AND u.is_active = true
    `;
    
    const userResult = await pool.query(userQuery, [decoded.userId]);
    const user = userResult.rows[0];

    // Get permissions
    const permissionsQuery = `
      SELECT p.name, p.module, p.action 
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1
    `;
    
    const permissionsResult = await pool.query(permissionsQuery, [user.role_id]);
    const permissions = permissionsResult.rows;

    // Create new tokens
    const { accessToken, refreshToken: newRefreshToken } = await authService.createTokens(user.id);

    // Revoke old refresh token
    await authService.revokeRefreshToken(refreshToken);

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role_name,
        group_id: user.group_id
      },
      permissions,
      accessToken,
      expiresIn: process.env.JWT_EXPIRES_IN
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      // Revoke refresh token
      await authService.revokeRefreshToken(refreshToken);
    }

    // Clear cookie
    res.clearCookie('refreshToken', { path: '/' });
    
    res.json({ message: 'Logged out successfully' });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  login,
  refresh,
  logout
};
