# Complete Migration Guide - OUK Digital Training System

## Overview
This guide provides step-by-step instructions for migrating from mock data to a secure, production-ready PERN stack implementation.

## Prerequisites
- Node.js 16+ and npm installed
- PostgreSQL 12+ installed and running
- Git for version control
- Docker (optional but recommended for production)

## Step 1: Database Setup

### Install PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create Database and User
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE ouk_training_system;

# Create user with password
CREATE USER ouk_admin WITH PASSWORD 'your_secure_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ouk_training_system TO ouk_admin;

# Exit PostgreSQL
\q
```

### Run Schema
```bash
# Connect to your new database
psql -d ouk_training_system -U ouk_admin -h localhost

# Run the schema
\i 01-database-schema.sql

# Verify tables were created
\dt
```

## Step 2: Backend Setup

### Create Backend Directory
```bash
mkdir ouk-training-backend
cd ouk-training-backend
```

### Initialize Project
```bash
# Create package.json
npm init -y

# Install dependencies
npm install express pg bcrypt jsonwebtoken joi helmet cors express-rate-limit winston dotenv uuid express-validator compression

# Install dev dependencies
npm install --save-dev nodemon jest supertest eslint @types/jest @types/node
```

### Setup Environment Variables
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual values
nano .env
```

### Create Backend Structure
```bash
# Create directories
mkdir -p src/{controllers,middleware,models,routes,services,utils,config,scripts}
mkdir -p tests/{unit,integration,fixtures}
mkdir -p logs docs
```

### Copy Implementation Files
```bash
# Copy all backend files to your project
cp /Users/apple/Downloads/DTD/02-backend-structure.md ./docs/
cp /Users/apple/Downloads/DTD/03-authentication-system.js ./src/services/
cp /Users/apple/Downloads/DTD/04-rbac-middleware.js ./src/middleware/
cp /Users/apple/Downloads/DTD/05-api-endpoints.js ./src/routes/
cp /Users/apple/Downloads/DTD/06-environment-config.js ./src/config/
cp /Users/apple/Downloads/DTD/08-security-measures.js ./src/middleware/
cp /Users/apple/Downloads/DTD/01-database-schema.sql ./scripts/
```

### Create Additional Files
```bash
# Create main server file
cat > server.js << 'EOF'
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const pool = require('./src/config/database');
const securityConfig = require('./src/middleware/security');

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const courseRoutes = require('./src/routes/courses');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(securityConfig);
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF

# Create package.json
cat > package.json << 'EOF'
{
  "name": "ouk-training-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "migrate": "node src/scripts/migrate.js"
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
  }
}
EOF
```

## Step 3: Frontend Migration

### Install React Query Dependencies
```bash
cd /Users/apple/Downloads/DTS  # Navigate to your React project

# Install required packages
npm install @tanstack/react-query @tanstack/react-query-devtools axios
```

### Update Package.json Scripts
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "dev": "react-scripts start"
  }
}
```

### Copy Frontend Implementation
```bash
# Copy API service
cp /Users/apple/Downloads/DTD/07-frontend-migration.ts ./src/services/apiService.ts

# Copy React Query hooks
cp /Users/apple/Downloads/DTD/07-frontend-migration.ts ./src/hooks/useApiQuery.ts

# Update App.tsx to use React Query
# You'll need to manually update your App.tsx to include QueryClientProvider
```

### Update Environment Variables for Frontend
```bash
# Create .env file for frontend
cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
EOF
```

## Step 4: Component Migration Examples

### Before (Mock Data)
```typescript
// src/components/Courses.tsx
import { useData } from '../contexts/DataContext';

export function Courses() {
  const { courses, addCourse } = useData();
  
  const handleAddCourse = (courseData) => {
    addCourse(courseData);
  };

  return (
    <div>
      <h1>Courses</h1>
      {/* Course list using mock data */}
      {courses.map(course => (
        <div key={course.id}>
          <h3>{course.name}</h3>
          <button onClick={() => handleAddCourse(course)}>
            Add Course
          </button>
        </div>
      ))}
    </div>
  );
}
```

### After (API with React Query)
```typescript
// src/components/Courses.tsx
import { useCourses, useCreateMutation } from '../hooks/useApiQuery';

export function Courses() {
  const { data: courses, isLoading, error } = useCourses();
  const createCourse = useCreateMutation('/courses');

  const handleAddCourse = (courseData) => {
    createCourse.mutate(courseData);
  };

  if (isLoading) return <div>Loading courses...</div>;
  if (error) return <div>Error loading courses: {error.message}</div>;

  return (
    <div>
      <h1>Courses</h1>
      {/* Course list using API */}
      {courses?.map(course => (
        <div key={course.id}>
          <h3>{course.name}</h3>
          <button onClick={() => handleAddCourse(course)}>
            Add Course
          </button>
        </div>
      ))}
      
      {createCourse.isLoading && <div>Adding course...</div>}
      {createCourse.error && <div>Error adding course: {createCourse.error.message}</div>}
    </div>
  );
}
```

### Update AuthContext
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLogin, useLogout, useCurrentUser } from '../hooks/useApiQuery';

// Replace existing mock-based auth with API-based auth
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (currentUser && !isLoading) {
      setUser(currentUser);
    }
  }, [currentUser, isLoading]);

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

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

## Step 5: Testing

### Backend Testing
```bash
# Run tests
cd ouk-training-backend
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Frontend Testing
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Run tests
npm test
```

## Step 6: Deployment

### Using Docker (Recommended)
```bash
# Build and start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Manual Deployment
```bash
# Backend
cd ouk-training-backend
npm install --production
npm start

# Frontend
cd /Users/apple/Downloads/DTS
npm run build
# Serve build files with nginx or similar
```

## Step 7: Environment Configuration

### Development Environment
```env
# .env (Backend)
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ouk_training_system
DB_USER=ouk_admin
DB_PASSWORD=dev_password_123
JWT_SECRET=dev_jwt_secret_key_minimum_32_characters
REFRESH_TOKEN_SECRET=dev_refresh_secret_key
PORT=5000
FRONTEND_URL=http://localhost:3000

# .env (Frontend)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### Production Environment
```env
# .env (Backend)
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=ouk_training_system
DB_USER=ouk_admin
DB_PASSWORD=your_production_secure_password
JWT_SECRET=your_production_jwt_secret_minimum_32_characters_long
REFRESH_TOKEN_SECRET=your_production_refresh_secret_key_long
PORT=5000
FRONTEND_URL=https://ouk-training.ouk.ac.ke

# .env (Frontend)
REACT_APP_API_URL=https://api.ouk-training.ouk.ac.ke
REACT_APP_ENV=production
```

## Step 8: Security Checklist

### ✅ Pre-Deployment Security Checklist
- [ ] Database credentials are strong and unique
- [ ] JWT secrets are at least 32 characters long
- [ ] HTTPS is enabled in production
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] SQL injection prevention is in place
- [ ] XSS protection is enabled
- [ ] Security headers are configured
- [ ] Error handling doesn't leak sensitive information
- [ ] Logging is enabled and secure
- [ ] Environment variables are used (no hardcoded secrets)

### 🔒 Production Security Measures
1. **Database Security**:
   - Use strong passwords (16+ characters)
   - Enable SSL/TLS connections
   - Limit database user privileges
   - Regular security updates

2. **API Security**:
   - HTTPS only in production
   - Validate all inputs
   - Rate limiting on all endpoints
   - API versioning
   - Security headers (HSTS, CSP, etc.)

3. **Frontend Security**:
   - No sensitive data in localStorage
   - Use HTTP-only cookies
   - CSP headers
   - Input sanitization
   - Environment-based configuration

## Step 9: Monitoring and Maintenance

### Health Checks
```bash
# Backend health check
curl http://localhost:5000/api/health

# Should return:
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600.123,
  "database": "connected"
}
```

### Log Monitoring
```bash
# View application logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log

# Monitor database connections
psql -d ouk_training_system -U ouk_admin -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"
```

### Backup Strategy
```bash
# Database backup
pg_dump -h localhost -U ouk_admin -d ouk_training_system > backup_$(date +%Y%m%d_%H%M%S).sql

# Application backup
tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz src/ logs/ .env*
```

## Step 10: Troubleshooting

### Common Issues and Solutions

#### Database Connection Issues
```bash
# Check PostgreSQL status
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql  # Linux

# Check connection
psql -h localhost -U ouk_admin -d ouk_training_system -c "SELECT 1;"

# Common solutions:
# 1. Ensure PostgreSQL is running
# 2. Check firewall settings
# 3. Verify database name and user credentials
# 4. Check SSL configuration
```

#### JWT Token Issues
```bash
# Test JWT generation
node -e "console.log(require('jsonwebtoken').sign({userId: 'test'}, 'your-secret', {expiresIn: '1h'}))"

# Common solutions:
# 1. Verify secret is at least 32 characters
# 2. Check token expiration settings
# 3. Ensure consistent secret between access and refresh tokens
```

#### CORS Issues
```bash
# Test CORS preflight
curl -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS http://localhost:5000/api/auth/login

# Common solutions:
# 1. Verify FRONTEND_URL matches your frontend URL
# 2. Ensure credentials: true in CORS config
# 3. Check for conflicting CORS middleware
```

## Step 11: Performance Optimization

### Database Optimization
```sql
-- Add indexes for better query performance
CREATE INDEX CONCURRENTLY idx_users_email_active ON users(email) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_courses_programme_active ON courses(programme_id) WHERE created_at > NOW() - INTERVAL '30 days';
CREATE INDEX CONCURRENTLY idx_attendance_date ON attendance(recorded_at);

-- Analyze slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE query LIKE '%users%' AND mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;
```

### API Caching
```javascript
// Implement Redis caching (optional)
const redis = require('redis');
const client = redis.createClient();

// Cache user permissions for 5 minutes
const cacheUserPermissions = async (userId, permissions) => {
  const key = `user_permissions_${userId}`;
  await client.setex(key, 300, JSON.stringify(permissions));
};

// Get cached permissions
const getCachedPermissions = async (userId) => {
  const key = `user_permissions_${userId}`;
  const cached = await client.get(key);
  return cached ? JSON.parse(cached) : null;
};
```

## Step 12: Rollback Strategy

### Database Rollback
```bash
# Create backup before major changes
pg_dump -h localhost -U ouk_admin -d ouk_training_system > rollback_backup.sql

# Rollback if needed
psql -h localhost -U ouk_admin -d ouk_training_system < rollback_backup.sql
```

### Application Rollback
```bash
# Use Git for version control
git log --oneline -10  # View recent commits
git checkout <commit-hash>  # Rollback to specific commit
git revert HEAD  # Revert last commit
```

## Conclusion

This migration guide provides a complete path from mock data to a production-ready PERN stack system. Follow these steps systematically:

1. **Setup Database**: Install PostgreSQL and run the schema
2. **Configure Backend**: Set up Express server with security
3. **Implement Authentication**: JWT with refresh tokens and RBAC
4. **Create API Endpoints**: RESTful services for all data operations
5. **Migrate Frontend**: Replace mock data with React Query
6. **Test Thoroughly**: Unit tests, integration tests, and security testing
7. **Deploy Securely**: Use environment variables and security best practices
8. **Monitor Continuously**: Health checks, logging, and performance monitoring

The system will be secure, scalable, and production-ready with proper authentication, authorization, and data management capabilities.
