# Backend Structure - OUK Digital Training System

## Folder Structure
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
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── security.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Role.js
│   │   ├── Course.js
│   │   ├── Workshop.js
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
│   │   ├── emailService.js
│   │   └── auditService.js
│   ├── utils/
│   │   ├── database.js
│   │   ├── logger.js
│   │   ├── validators.js
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── config/
│   │   ├── database.js
│   │   ├── jwt.js
│   │   ├── cors.js
│   │   └── environment.js
│   └── scripts/
│       ├── migrate.js
│       └── seed.js
├── tests/
│   ├── unit/
│   │   ├── auth.test.js
│   │   ├── users.test.js
│   │   └── courses.test.js
│   ├── integration/
│   │   ├── auth.test.js
│   │   └── api.test.js
│   └── fixtures/
│       ├── users.json
│       └── courses.json
├── logs/
├── docs/
│   ├── api.md
│   └── deployment.md
├── package.json
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── jest.config.js
└── server.js
```

## Package Configuration
```json
{
  "name": "ouk-training-backend",
  "version": "1.0.0",
  "description": "Secure backend for OUK Digital Training System",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "migrate": "node src/scripts/migrate.js",
    "seed": "node src/scripts/seed.js",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
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
    "uuid": "^9.0.0",
    "express-validator": "^7.0.1",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3",
    "eslint": "^8.45.0",
    "@types/jest": "^29.5.2"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
```

## Environment Configuration
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ouk_training_system
DB_USER=ouk_admin
DB_PASSWORD=your_secure_password_here
DB_SSL=true
DB_MAX_CONNECTIONS=20

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
AUTH_RATE_LIMIT_MAX=5

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret_here

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=logs/

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Security Configuration
```javascript
// backend/src/config/security.js
const helmet = require('helmet');

const securityConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  ieNoOpen: true,
  frameguard: { action: 'deny' },
  crossOriginEmbedderPolicy: { policy: 'require-corp' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

module.exports = securityConfig;
```

## Database Configuration
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
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  statement_timeout: 10000,
  query_timeout: 10000,
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Handle pool connection events
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('remove', () => {
  console.log('Client removed from connection pool');
});

module.exports = pool;
```

## Main Server Setup
```javascript
// backend/server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const pool = require('./src/config/database');
const securityConfig = require('./src/config/security');
const logger = require('./src/utils/logger');

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const courseRoutes = require('./src/routes/courses');
const workshopRoutes = require('./src/routes/workshops');
const participantRoutes = require('./src/routes/participants');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(securityConfig);

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Body parsing middleware with limits
app.use(express.json({ 
  limit: '10mb',
  strict: true 
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/participants', participantRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  pool.query('SELECT NOW()', (err, result) => {
    if (err) {
      return res.status(500).json({ 
        status: 'ERROR', 
        timestamp: new Date().toISOString(),
        database: 'disconnected'
      });
    }
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      serverTime: result.rows[0].now
    });
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'OUK Digital Training System API',
    version: '1.0.0',
    description: 'Secure API for university training management',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      courses: '/api/courses',
      workshops: '/api/workshops',
      participants: '/api/participants'
    },
    documentation: '/api/docs'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: ['/api/auth', '/api/users', '/api/courses', '/api/workshops', '/api/participants']
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(error.status || 500).json({
    error: isDevelopment ? error.message : 'Internal server error',
    ...(isDevelopment && { stack: error.stack })
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    await pool.end();
    console.log('Database connections closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OUK Training System Server`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
});
```

## Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: ouk-postgres
    environment:
      POSTGRES_DB: ouk_training_system
      POSTGRES_USER: ouk_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./01-database-schema.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - ouk-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ouk_admin -d ouk_training_system"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: .
    container_name: ouk-backend
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ouk_training_system
      DB_USER: ouk_admin
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      REFRESH_TOKEN_SECRET: ${REFRESH_TOKEN_SECRET}
      FRONTEND_URL: https://ouk-training.ouk.ac.ke
      RATE_LIMIT_MAX_REQUESTS: 200
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "5000:5000"
    networks:
      - ouk-network
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: ouk-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    networks:
      - ouk-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  ouk-network:
    driver: bridge
```

## Development Setup Commands
```bash
# Clone and setup
git clone <repository-url>
cd ouk-training-backend
cp .env.example .env

# Install dependencies
npm install

# Setup database
createdb ouk_training_system
psql -d ouk_training_system -f ../01-database-schema.sql

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Production Deployment Commands
```bash
# Using Docker Compose (Recommended)
docker-compose up -d

# Manual deployment
npm install --production
npm start

# Database migration
npm run migrate

# Seed initial data
npm run seed
```

## Security Features Implemented
- ✅ **Input Validation**: Joi schemas for all endpoints
- ✅ **SQL Injection Prevention**: Parameterized queries
- ✅ **XSS Protection**: Content Security Policy
- ✅ **Rate Limiting**: Configurable limits per endpoint
- ✅ **Password Security**: bcrypt with 12 rounds
- ✅ **JWT Security**: Access and refresh tokens
- ✅ **CORS**: Proper cross-origin configuration
- ✅ **Security Headers**: Helmet.js protection
- ✅ **Audit Logging**: Comprehensive request logging
- ✅ **Error Handling**: Secure error responses
- ✅ **Graceful Shutdown**: Proper cleanup
- ✅ **Health Checks**: Database and API monitoring
- ✅ **Docker Support**: Containerized deployment
- ✅ **Environment Variables**: No hardcoded secrets
