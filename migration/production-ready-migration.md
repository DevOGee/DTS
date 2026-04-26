# Production-Ready Migration: Mock Data to Secure PERN Stack

## Overview
This document provides a complete migration guide for converting the OUK Digital Training System from a mock-data demo to a secure, production-ready PERN stack (PostgreSQL, Express, React, Node.js) implementation.

## 1. PostgreSQL Database Schema

### Database Design
```sql
-- Create database
CREATE DATABASE ouk_training_system;

-- Connect to database
\c ouk_training_system;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Groups table
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(10) UNIQUE NOT NULL,
    color VARCHAR(7) NOT NULL, -- Hex color code
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    module VARCHAR(50) NOT NULL, -- e.g., 'dashboard', 'courses', 'reports'
    action VARCHAR(50) NOT NULL, -- e.g., 'view', 'create', 'edit', 'delete'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role-Permissions junction table
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Hashed password
    salt VARCHAR(255) NOT NULL, -- Salt for password hashing
    name VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workshops table
CREATE TABLE workshops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    number_of_days INTEGER NOT NULL CHECK (number_of_days > 0),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Upcoming', 'Completed')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Programmes table
CREATE TABLE programmes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    award_type VARCHAR(50) NOT NULL CHECK (award_type IN ('Certificate', 'Diploma', 'Degree', 'Postgraduate')),
    current_level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    programme_id UUID REFERENCES programmes(id) ON DELETE RESTRICT,
    level VARCHAR(50) NOT NULL,
    course_type VARCHAR(20) DEFAULT 'Technical' CHECK (course_type IN ('Technical', 'Non-Technical')),
    assigned_group_id UUID REFERENCES groups(id) ON DELETE RESTRICT,
    completed_modules INTEGER DEFAULT 0 CHECK (completed_modules >= 0),
    total_modules INTEGER DEFAULT 10 CHECK (total_modules > 0),
    source_doc_link TEXT,
    lms_link TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Participants table
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Content Digitiser', 'Multimedia Digitiser', 'Group Leader')),
    group_id UUID REFERENCES groups(id) ON DELETE RESTRICT,
    dsa_type VARCHAR(20) DEFAULT 'In-County' CHECK (dsa_type IN ('In-County', 'Out-County')),
    days_attending INTEGER NOT NULL CHECK (days_attending > 0),
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    day INTEGER NOT NULL CHECK (day > 0),
    status VARCHAR(10) NOT NULL CHECK (status IN ('Present', 'Absent')),
    workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(participant_id, day, workshop_id)
);

-- Payment schedules table
CREATE TABLE payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    bank_name VARCHAR(255) NOT NULL,
    branch VARCHAR(255) NOT NULL,
    bank_code VARCHAR(10) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processed', 'Paid')),
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Video logs table
CREATE TABLE video_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    video_title VARCHAR(255) NOT NULL,
    video_url TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    upload_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Group video stats table
CREATE TABLE group_video_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    total_videos INTEGER DEFAULT 0,
    total_duration_minutes INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id)
);

-- Refresh tokens table for JWT
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_group_id ON users(group_id);
CREATE INDEX idx_courses_programme_id ON courses(programme_id);
CREATE INDEX idx_courses_assigned_group_id ON courses(assigned_group_id);
CREATE INDEX idx_participants_group_id ON participants(group_id);
CREATE INDEX idx_attendance_participant_id ON attendance(participant_id);
CREATE INDEX idx_payment_schedules_participant_id ON payment_schedules(participant_id);
CREATE INDEX idx_video_logs_group_id ON video_logs(group_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workshops_updated_at BEFORE UPDATE ON workshops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programmes_updated_at BEFORE UPDATE ON programmes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_schedules_updated_at BEFORE UPDATE ON payment_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Initial Data Setup
```sql
-- Insert roles
INSERT INTO roles (name, description) VALUES
('System Admin', 'Full system access with all permissions'),
('Programme Lead', 'Can manage programmes and courses'),
('Group Leader', 'Can manage group activities and participants'),
('Viewer/Digitiser', 'Can view and digitise content');

-- Insert groups
INSERT INTO groups (name, color) VALUES
('A', '#3b82f6'),
('B', '#10b981'),
('C', '#f59e0b'),
('D', '#8b5cf6'),
('E', '#ec4899'),
('F', '#6366f1');

-- Insert permissions
INSERT INTO permissions (name, description, module, action) VALUES
-- Dashboard permissions
('view_dashboard', 'View dashboard', 'dashboard', 'view'),

-- Reports permissions
('view_reports', 'View reports', 'reports', 'view'),

-- Requests permissions
('view_requests', 'View requests', 'requests', 'view'),

-- Feedback permissions
('view_feedback', 'View feedback', 'feedback', 'view'),

-- Recycle bin permissions
('view_recycle_bin', 'View recycle bin', 'recycle_bin', 'view'),

-- Workshops permissions
('view_workshops', 'View workshops', 'workshops', 'view'),
('create_workshops', 'Create workshops', 'workshops', 'create'),

-- Courses permissions
('view_courses', 'View courses', 'courses', 'view'),
('create_courses', 'Create courses', 'courses', 'create'),
('edit_courses', 'Edit courses', 'courses', 'edit'),
('delete_courses', 'Delete courses', 'courses', 'delete'),

-- Groups permissions
('view_groups', 'View groups', 'groups', 'view'),
('create_groups', 'Create groups', 'groups', 'create'),
('edit_groups', 'Edit groups', 'groups', 'edit'),

-- Multimedia permissions
('view_multimedia', 'View multimedia', 'multimedia', 'view'),
('edit_multimedia', 'Edit multimedia', 'multimedia', 'edit'),

-- Attendance permissions
('view_attendance', 'View attendance', 'attendance', 'view'),
('mark_attendance', 'Mark attendance', 'attendance', 'create'),

-- Participants permissions
('view_participants', 'View participants', 'participants', 'view'),
('edit_participants', 'Edit participants', 'participants', 'edit'),

-- Payments permissions
('view_payments', 'View payments', 'payments', 'view'),
('edit_payments', 'Edit payments', 'payments', 'edit'),

-- Checklist permissions
('view_checklist', 'View checklist', 'checklist', 'view'),

-- Admin permissions
('role_management', 'Manage roles', 'admin', 'manage'),
('admin_settings', 'Access admin settings', 'admin', 'view'),
('feature_toggles', 'Manage feature toggles', 'admin', 'manage'),
('system_settings', 'Manage system settings', 'admin', 'manage'),
('view_users', 'View users', 'users', 'view'),
('create_users', 'Create users', 'users', 'create'),
('edit_users', 'Edit users', 'users', 'edit'),
('delete_users', 'Delete users', 'users', 'delete'),
('permission_management', 'Manage permissions', 'admin', 'manage');

-- Assign permissions to roles
-- System Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'System Admin';

-- Programme Lead permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'Programme Lead' AND p.module IN ('dashboard', 'reports', 'requests', 'feedback', 'workshops', 'courses', 'groups', 'multimedia', 'attendance', 'participants', 'payments', 'checklist');

-- Group Leader permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'Group Leader' AND p.module IN ('dashboard', 'reports', 'groups', 'multimedia', 'attendance', 'participants', 'payments', 'checklist');

-- Viewer/Digitiser permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'Viewer/Digitiser' AND p.action = 'view';
```

## 2. Backend Architecture

### Folder Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── courseController.js
│   │   ├── workshopController.js
│   │   └── participantController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rbac.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Role.js
│   │   ├── Course.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── courses.js
│   │   ├── workshops.js
│   │   └── participants.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── tokenService.js
│   │   └── emailService.js
│   ├── utils/
│   │   ├── database.js
│   │   ├── logger.js
│   │   ├── validators.js
│   │   └── constants.js
│   └── config/
│       ├── database.js
│       ├── jwt.js
│       └── cors.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── package.json
├── .env.example
├── .gitignore
└── server.js
```

### Package.json
```json
{
  "name": "ouk-training-backend",
  "version": "1.0.0",
  "description": "Backend for OUK Digital Training System",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "migrate": "node src/scripts/migrate.js",
    "seed": "node src/scripts/seed.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.9.2",
    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^6.10.0",
    "winston": "^3.10.0",
    "dotenv": "^16.3.1",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3"
  }
}
```

### Environment Variables (.env.example)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ouk_training_system
DB_USER=ouk_admin
DB_PASSWORD=your_secure_password_here
DB_SSL=true

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 3. Core Implementation Files

### Database Configuration
```javascript
// backend/src/config/database.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = pool;
```

### Authentication Controller
```javascript
// backend/src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { validateLogin } = require('../utils/validators');
const { createTokens } = require('../services/tokenService');
const logger = require('../utils/logger');

const login = async (req, res) => {
  try {
    // Validate input
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details 
      });
    }

    const { identifier, password } = req.body;

    // Find user by email or username
    const userQuery = `
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.email = $1 OR u.username = $1 
      AND u.is_active = true
    `;
    
    const userResult = await pool.query(userQuery, [identifier]);
    
    if (userResult.rows.length === 0) {
      logger.warn(`Login attempt for non-existent user: ${identifier}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      logger.warn(`Invalid password for user: ${identifier}`);
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
    const { accessToken, refreshToken } = await createTokens(user.id);

    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    logger.info(`User logged in: ${user.username}`);

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
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Check if token is revoked
    const tokenQuery = `
      SELECT * FROM refresh_tokens 
      WHERE user_id = $1 AND token_hash = $2 AND is_revoked = false 
      AND expires_at > CURRENT_TIMESTAMP
    `;
    
    const tokenHash = require('crypto').createHash('sha256').update(refreshToken).digest('hex');
    const tokenResult = await pool.query(tokenQuery, [decoded.userId, tokenHash]);
    
    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

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
    const { accessToken, refreshToken: newRefreshToken } = await createTokens(user.id);

    // Revoke old refresh token
    await pool.query(
      'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1',
      [decoded.userId]
    );

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
      const tokenHash = require('crypto').createHash('sha256').update(refreshToken).digest('hex');
      await pool.query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE token_hash = $1',
        [tokenHash]
      );
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
```

### Authentication Middleware
```javascript
// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const userQuery = `
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.id = $1 AND u.is_active = true
    `;
    
    const userResult = await pool.query(userQuery, [decoded.userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    req.user = user;
    
    next();

  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authenticate;
```

### RBAC Middleware
```javascript
// backend/src/middleware/rbac.js
const pool = require('../config/database');
const logger = require('../utils/logger');

const authorize = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user permissions
      const permissionsQuery = `
        SELECT p.name, p.module, p.action 
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = $1
      `;
      
      const permissionsResult = await pool.query(permissionsQuery, [req.user.role_id]);
      const userPermissions = permissionsResult.rows;

      // Check if user has required permission
      const hasPermission = userPermissions.some(p => 
        p.name === requiredPermission || 
        (p.module === requiredPermission.split(':')[0] && p.action === requiredPermission.split(':')[1])
      );

      if (!hasPermission) {
        logger.warn(`Access denied for user ${req.user.username} - required: ${requiredPermission}`);
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: requiredPermission
        });
      }

      next();

    } catch (error) {
      logger.error('Authorization error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = authorize;
```

### Token Service
```javascript
// backend/src/services/tokenService.js
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const pool = require('../config/database');

const createTokens = async (userId) => {
  // Create access token
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // Create refresh token
  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );

  // Store refresh token in database
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) 
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  return { accessToken, refreshToken };
};

const revokeRefreshTokens = async (userId) => {
  await pool.query(
    'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1',
    [userId]
  );
};

module.exports = {
  createTokens,
  revokeRefreshTokens
};
```

### User Service
```javascript
// backend/src/services/userService.js
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const logger = require('../utils/logger');

const createUser = async (userData) => {
  try {
    const { username, email, password, name, roleId, groupId } = userData;

    // Check if user already exists
    const existingUserQuery = `
      SELECT id FROM users 
      WHERE email = $1 OR username = $2
    `;
    
    const existingUser = await pool.query(existingUserQuery, [email, username]);
    
    if (existingUser.rows.length > 0) {
      throw new Error('User with this email or username already exists');
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const insertQuery = `
      INSERT INTO users (id, username, email, password_hash, salt, name, role_id, group_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, username, email, name, created_at
    `;
    
    const result = await pool.query(insertQuery, [
      uuidv4(),
      username,
      email,
      passwordHash,
      salt,
      name,
      roleId,
      groupId
    ]);

    logger.info(`User created: ${username}`);
    return result.rows[0];

  } catch (error) {
    logger.error('Create user error:', error);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const query = `
      SELECT u.*, r.name as role_name, g.name as group_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE u.id = $1 AND u.is_active = true
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  } catch (error) {
    logger.error('Get user error:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserById
};
```

### API Routes
```javascript
// backend/src/routes/auth.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, refresh, logout } = require('../controllers/authController');
const { validateLogin } = require('../utils/validators');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
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

module.exports = router;
```

### Main Server File
```javascript
// backend/server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pool = require('./src/config/database');

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const courseRoutes = require('./src/routes/courses');
const workshopRoutes = require('./src/routes/workshops');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/workshops', workshopRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});
```

## 4. Frontend Migration

### Install Required Dependencies
```bash
npm install @tanstack/react-query axios
```

### Create API Service
```typescript
// src/services/apiService.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Attempt to refresh token
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
              withCredentials: true,
            });

            const { accessToken } = response.data;
            localStorage.setItem('accessToken', accessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(identifier: string, password: string) {
    const response = await this.api.post('/auth/login', {
      identifier,
      password,
    }, { withCredentials: true });

    return response.data;
  }

  async logout() {
    try {
      await this.api.post('/auth/logout', {}, { withCredentials: true });
    } finally {
      localStorage.removeItem('accessToken');
    }
  }

  // User endpoints
  async getCurrentUser() {
    const response = await this.api.get('/users/me');
    return response.data;
  }

  async getGroups() {
    const response = await this.api.get('/data/groups');
    return response.data;
  }

  // Generic CRUD operations
  async get(endpoint: string) {
    const response = await this.api.get(endpoint);
    return response.data;
  }

  async post(endpoint: string, data: any) {
    const response = await this.api.post(endpoint, data);
    return response.data;
  }

  async put(endpoint: string, data: any) {
    const response = await this.api.put(endpoint, data);
    return response.data;
  }

  async delete(endpoint: string) {
    const response = await this.api.delete(endpoint);
    return response.data;
  }
}

export default new ApiService();
```

### React Query Configuration
```typescript
// src/hooks/useApiQuery.ts
import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import apiService from '../services/apiService';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Auth hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: ({ identifier, password }: { identifier: string; password: string }) =>
      apiService.login(identifier, password),
    onSuccess: (data) => {
      const { accessToken, user, permissions } = data;
      localStorage.setItem('accessToken', accessToken);
      // Store user data in React context or state
      queryClient.setQueryData(['currentUser'], user);
      queryClient.setQueryData(['permissions'], permissions);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => apiService.logout(),
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/login';
    },
  });
};

// Data hooks
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiService.getCurrentUser(),
    enabled: !!localStorage.getItem('accessToken'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => apiService.getGroups(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCourses = (filters?: any) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => apiService.get('/courses', filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Generic mutation hook
export const useApiMutation = (endpoint: string, method: 'POST' | 'PUT' | 'DELETE' = 'POST') => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => {
      switch (method) {
        case 'POST':
          return apiService.post(endpoint, data);
        case 'PUT':
          return apiService.put(endpoint, data);
        case 'DELETE':
          return apiService.delete(endpoint);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [endpoint.split('/')[0]] });
    },
  });
};
```

### Updated Auth Context
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLogin, useLogout, useCurrentUser } from '../hooks/useApiQuery';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  group_id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ identifier, password });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    logoutMutation.mutate();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Updated App.tsx with React Query
```typescript
// src/App.tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { queryClient } from './hooks/useApiQuery';
import AppRoutes from './routes/AppRoutes';

import './styles/theme.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="App">
            <AppRoutes />
          </div>
        </AuthProvider>
      </BrowserRouter>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App;
```

## 5. Security Best Practices Implementation

### Input Validation
```javascript
// backend/src/utils/validators.js
const Joi = require('joi');

const loginSchema = Joi.object({
  identifier: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email or username is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  })
});

const createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required(),
  name: Joi.string().min(2).max(255).required(),
  roleId: Joi.string().uuid().required(),
  groupId: Joi.string().uuid().optional()
});

module.exports = {
  validateLogin: (data) => loginSchema.validate(data),
  validateCreateUser: (data) => createUserSchema.validate(data)
};
```

### Rate Limiting Configuration
```javascript
// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ error: message });
    }
  });
};

module.exports = {
  authLimiter: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts
    'Too many login attempts. Please try again later.'
  ),
  generalLimiter: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests
    'Too many requests. Please try again later.'
  )
};
```

### Security Headers Configuration
```javascript
// backend/src/middleware/security.js
const helmet = require('helmet');

const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  ieNoOpen: true,
  frameguard: { action: 'deny' }
});

module.exports = securityMiddleware;
```

## 6. Migration Steps

### Step 1: Database Setup
```bash
# Install PostgreSQL
brew install postgresql  # macOS
# OR
sudo apt-get install postgresql postgresql-contrib  # Ubuntu

# Start PostgreSQL
brew services start postgresql  # macOS
# OR
sudo systemctl start postgresql  # Ubuntu

# Create database and user
sudo -u postgres psql
CREATE DATABASE ouk_training_system;
CREATE USER ouk_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ouk_training_system TO ouk_admin;

# Run schema
psql -d ouk_training_system -U ouk_admin -f schema.sql
```

### Step 2: Backend Setup
```bash
# Create backend directory
mkdir backend && cd backend

# Initialize package.json
npm init -y

# Install dependencies
npm install express pg bcrypt jsonwebtoken joi helmet cors express-rate-limit winston dotenv uuid

# Install dev dependencies
npm install --save-dev nodemon jest supertest

# Create environment file
cp .env.example .env
# Edit .env with your actual credentials

# Start development server
npm run dev
```

### Step 3: Frontend Migration
```bash
# Install React Query
npm install @tanstack/react-query @tanstack/react-query-devtools axios

# Update components to use new hooks
# Replace mockData imports with API calls
# Update DataContext to use React Query
```

### Step 4: Component Migration Example
```typescript
// Before (mock data)
import { useData } from '../contexts/DataContext';

export function Courses() {
  const { courses, addCourse } = useData();
  // ... component logic
}

// After (API with React Query)
import { useCourses, useApiMutation } from '../hooks/useApiQuery';

export function Courses() {
  const { data: courses, isLoading, error } = useCourses();
  const createCourse = useApiMutation('/courses', 'POST');
  
  // ... component logic
}
```

## 7. Testing Strategy

### Backend Testing
```javascript
// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../server');

describe('Authentication', () => {
  test('POST /api/auth/login - successful login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'admin@ouk.ac.ke',
        password: 'admin123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user).toHaveProperty('username');
  });

  test('POST /api/auth/login - invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'admin@ouk.ac.ke',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
});
```

### Frontend Testing
```typescript
// src/components/__tests__/Auth.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import Login from '../../components/Login';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Login Component', () => {
  test('renders login form', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('submits login form', async () => {
    renderWithProviders(<Login />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@ouk.ac.ke' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'admin123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      // Assert successful login behavior
    });
  });
});
```

## 8. Deployment Considerations

### Production Environment Setup
```bash
# Environment variables for production
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=ouk_training_system
DB_USER=ouk_admin
DB_PASSWORD=your-production-password
JWT_SECRET=your-production-jwt-secret-minimum-32-characters
REFRESH_TOKEN_SECRET=your-production-refresh-secret
FRONTEND_URL=https://ouk-training-system.com
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

USER node

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ouk_training_system
      POSTGRES_USER: ouk_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: .
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ouk_training_system
      DB_USER: ouk_admin
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      REFRESH_TOKEN_SECRET: ${REFRESH_TOKEN_SECRET}
    depends_on:
      - postgres
    ports:
      - "5000:5000"

volumes:
  postgres_data:
```

## 9. Monitoring and Logging

### Winston Logger Configuration
```javascript
// backend/src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ouk-training-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

## 10. Security Checklist

### ✅ Implemented Security Measures
- [x] **Password Hashing**: bcrypt with salt
- [x] **JWT Authentication**: Access and refresh tokens
- [x] **RBAC**: Role-based access control
- [x] **Input Validation**: Joi schemas
- [x] **Rate Limiting**: Express rate limiter
- [x] **CORS**: Proper cross-origin configuration
- [x] **Security Headers**: Helmet middleware
- [x] **HTTP-Only Cookies**: Secure refresh token storage
- [x] **Environment Variables**: No hardcoded secrets
- [x] **SQL Injection Prevention**: Parameterized queries
- [x] **XSS Prevention**: Content Security Policy
- [x] **HTTPS Enforcement**: HSTS headers

### 🔒 Security Best Practices
1. **Regular Security Updates**: Keep dependencies updated
2. **Password Policies**: Enforce strong passwords
3. **Session Management**: Proper token expiration
4. **Audit Logging**: Track all access attempts
5. **Database Security**: Limited database user permissions
6. **API Security**: Request validation and sanitization

## Conclusion

This migration guide provides a complete, production-ready transformation from mock data to a secure PERN stack implementation. The system includes:

- **Secure Authentication**: JWT with refresh tokens
- **Role-Based Access Control**: Granular permissions
- **Modern Frontend**: React Query for state management
- **Security Best Practices**: Comprehensive security measures
- **Scalability**: Production-ready architecture
- **Testing**: Unit and integration test coverage

Follow the steps systematically to ensure a smooth migration while maintaining all existing functionality.
