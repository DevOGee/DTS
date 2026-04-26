const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const pool = require('../config/database');
const logger = require('../utils/logger');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
    this.refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  }

  // Hash password with salt
  async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(this.bcryptRounds);
      const hash = await bcrypt.hash(password, salt);
      return { hash, salt };
    } catch (error) {
      logger.error('Password hashing error:', error);
      throw new Error('Password hashing failed');
    }
  }

  // Verify password against hash
  async verifyPassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      logger.error('Password verification error:', error);
      throw new Error('Password verification failed');
    }
  }

  // Generate JWT access token
  generateAccessToken(userId) {
    return jwt.sign(
      { userId, type: 'access' },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );
  }

  // Generate JWT refresh token
  async generateRefreshToken(userId) {
    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      this.refreshSecret,
      { expiresIn: this.refreshExpiresIn }
    );

    // Store refresh token in database
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    return pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) 
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    ).then(() => refreshToken);
  }

  // Create both access and refresh tokens
  async createTokens(userId) {
    try {
      const accessToken = this.generateAccessToken(userId);
      const refreshToken = await this.generateRefreshToken(userId);
      
      logger.info(`Tokens created for user: ${userId}`);
      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('Token creation error:', error);
      throw new Error('Token creation failed');
    }
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      logger.error('Access token verification error:', error);
      throw new Error('Invalid access token');
    }
  }

  // Verify refresh token
  async verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.refreshSecret);
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Check if token exists and is not revoked
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const tokenQuery = `
        SELECT * FROM refresh_tokens 
        WHERE user_id = $1 AND token_hash = $2 AND is_revoked = false 
        AND expires_at > CURRENT_TIMESTAMP
      `;
      
      const result = await pool.query(tokenQuery, [decoded.userId, tokenHash]);
      
      if (result.rows.length === 0) {
        throw new Error('Refresh token not found or expired');
      }

      return decoded;
    } catch (error) {
      logger.error('Refresh token verification error:', error);
      throw new Error('Invalid refresh token');
    }
  }

  // Revoke all refresh tokens for a user
  async revokeRefreshTokens(userId) {
    try {
      await pool.query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1',
        [userId]
      );
      
      logger.info(`All refresh tokens revoked for user: ${userId}`);
    } catch (error) {
      logger.error('Token revocation error:', error);
      throw new Error('Token revocation failed');
    }
  }

  // Revoke specific refresh token
  async revokeRefreshToken(token) {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await pool.query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE token_hash = $1',
        [tokenHash]
      );
      
      logger.info('Refresh token revoked');
    } catch (error) {
      logger.error('Token revocation error:', error);
      throw new Error('Token revocation failed');
    }
  }
}

module.exports = new AuthService();
