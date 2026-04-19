# X Digitisation Tracking System

[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.1.12-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)


A comprehensive web application for tracking, managing, and optimising academic content digitisation at Institution X. Built with React, TypeScript, and PostgreSQL, the system handles complex academic hierarchies, real-time progress tracking, and detailed financial/attendance management.

## System Architecture

```mermaid
graph TB
    A[User Interface] --> B[React Frontend]
    B --> C[Express API]
    C --> D[PostgreSQL Database]
    
    E[Role-Based Access] --> F[System Admin]
    E --> G[Programme Lead]
    E --> H[Group Leader]
    E --> I[Viewer/Digitiser]
    
    J[Core Modules] --> K[Dashboard]
    J --> L[Course Management]
    J --> M[Attendance Tracking]
    J --> N[Financial Management]
    J --> O[Admin Settings]
```

## Quick Start

### 1. Launch the Application

```bash
# Navigate to project directory
cd DTS

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 2. Access the System

**Local URL**: `http://localhost:5173`

```
   X Digitisation Tracking System
   ===============================
   
   Server running at: http://localhost:5173
   Press Ctrl+C to stop
   
   Login Credentials:
   -------------------
   System Admin: admin / admin123
   Programme Lead: plead / pleas123
   Group Leader: gleader / gleader123
   Viewer/Digitiser: viewer / viewer123
```

### 3. First Login

1. Open your browser and navigate to `http://localhost:5173`
2. Click "Sign In" button
3. Enter credentials (e.g., `admin` / `admin123`)
4. Access the dashboard and explore features

## Visual Overview

### Dashboard Interface
```
+------------------------------------------------------+
|  X Digitisation Tracking System      [Logout] [User] |
+------------------------------------------------------+
| [Navigation Menu]         | Main Content Area       |
| - Dashboard                |                         |
| - Courses                  |   Progress Metrics      |
| - Groups                   |   Attendance Stats      |
| - Participants             |   Financial Overview    |
| - Multimedia               |                         |
| - Attendance               |   Interactive Charts     |
| - Payments                 |                         |
| - Checklist                |   Quick Actions         |
| - Reports                  |                         |
| - Workshops                |                         |
+------------------------------------------------------+
```

### User Workflow
```mermaid
flowchart LR
    A[Login] --> B{Select Role}
    B -->|System Admin| C[Full Access]
    B -->|Programme Lead| D[Content Management]
    B -->|Group Leader| E[Group Data Only]
    B -->|Viewer| F[Read-Only]
    
    C --> G[Admin Settings]
    D --> H[Course Management]
    E --> I[Attendance Tracking]
    F --> J[Reports & Analytics]
```

## Table of Contents

- [System Overview](#system-overview)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [User Roles & Access Control](#user-roles--access-control)
- [Module Usage](#module-usage)
- [Bulk Operations](#bulk-operations)
- [Support & Troubleshooting](#support--troubleshooting)

## System Overview

The X Digitisation Tracking System is designed to manage the complete digitisation workflow across multiple academic programmes, groups, and participants. The system provides real-time visibility into digitisation progress, attendance tracking, and financial management.

### Key Architecture Components

- **Frontend**: React 18 with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with hierarchical data structures
- **Authentication**: Role-based access control (RBAC)
- **File Management**: CSV bulk upload/download capabilities

### Academic Hierarchy Support

- **Programmes**: Degree, TVET, Post-Grad qualifications
- **Levels**: Dynamic level transitions (e.g., 3.2 to 4.1)
- **Groups**: A through F with customisable colour coding
- **Courses**: Technical and Non-Technical classifications
- **Modules**: 10 modules per course with individual tracking

## Features

### Core Functionality
- **100% CRUD Operations**: Full create, read, update, delete capabilities
- **Real-time Progress Tracking**: Live updates on digitisation status
- **Role-Based Access Control**: Four-tier permission system
- **Bulk Data Operations**: CSV upload/download with preview
- **Dynamic UI Elements**: Customisable group colours and themes

### Module Highlights
- **Dashboard**: Comprehensive overview with metrics and KPIs
- **Course Management**: Hierarchical course and module tracking
- **Attendance System**: Daily attendance with DSA calculations
- **Financial Management**: Payment schedules and DSA rate configuration
- **Admin Settings**: System configuration and user management
- **Reporting**: Detailed analytics and export capabilities

## Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn package manager

### Quick Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd DTS
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```sql
   -- Create PostgreSQL database
   CREATE DATABASE x_digitisation_system;
   
   -- Run migration scripts
   \i database/migrations/001_initial_schema.sql
   \i database/migrations/002_sample_data.sql
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the Application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

6. **Access the System**
   - Open `http://localhost:5173` in your browser
   - Use default login credentials (see User Roles section)

## Configuration

### Environment Variables

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5173/x_digitisation_system
DB_HOST=localhost
DB_PORT=5432
DB_NAME=x_digitisation_system
DB_USER=your_username
DB_PASSWORD=your_password

# Application Configuration
NODE_ENV=development
PORT=5173
SESSION_SECRET=your_session_secret

# File Upload Configuration
MAX_FILE_SIZE=10MB
UPLOAD_PATH=./uploads
```

### Database Schema

The system uses PostgreSQL with the following key tables:

- **programmes**: Academic programme definitions
- **courses**: Course catalog with programme associations
- **modules**: Individual module tracking (10 per course)
- **users**: System user accounts and roles
- **participants**: Workshop participants and group assignments
- **attendance**: Daily attendance records
- **payment_schedules**: DSA payment tracking

## User Roles & Access Control

The system implements a four-tier role-based access control system:

### System Admin
- **Credentials**: `admin` / `admin123`
- **Access**: Full system access
- **Capabilities**: 
  - User management (create, edit, delete users)
  - Admin Settings access
  - Full CRUD operations on all modules
  - System configuration and data management
  - Bulk operations and data exports

### Programme Lead
- **Credentials**: `plead` / `plead123`
- **Access**: Content management
- **Capabilities**:
  - View and edit all content
  - Manage courses and modules
  - Attendance and payment management
  - Reporting and analytics
  - **No access to**: Admin Settings panel

### Group Leader
- **Credentials**: `gleader` / `gleader123`
- **Access**: Group-specific management
- **Capabilities**:
  - View and edit data for assigned group only
  - Manage participants within group
  - Track group progress and attendance
  - **Restrictions**: Cannot delete records, cannot access other groups

### Viewer/Digitiser
- **Credentials**: `viewer` / `viewer123`
- **Access**: Read-only
- **Capabilities**:
  - View all data and reports
  - Download exports
  - **Restrictions**: No edit, delete, or add capabilities

## Module Usage

### Dashboard Module
- **Purpose**: Central overview of system status
- **Key Metrics**: 
  - Total participants (X: Y Internal + Z External)
  - Course count (X courses, Y modules)
  - Overall completion percentage
  - Daily progress targets
- **Features**: Real-time updates, progress visualisations, quick navigation

### Admin Settings Module
- **Workshop Configuration**:
  - Start Date: Default configurable start date
  - Number of Days: Auto-calculates End Date
  - Venue: Institution Y Main Campus
- **User Management**: Add, edit, delete system users
- **DSA Rate Configuration**: 
  - In-County: X% of base rate
  - Out-County: Y% of base rate
- **Group Colour Configuration**: Custom colours for Groups A-F
- **Data Management**: Export/reset functionality

### Course Management
- **Hierarchical Structure**: Programme > Course > Module
- **Level Transitions**: Automatic 3.2 to 4.1 transition logic
- **Status Tracking**: Real-time digitisation progress
- **Group Assignment**: Automatic group-based workload distribution

### Attendance System
- **Daily Tracking**: Per-participant daily attendance with QR code check-in
- **QR Code Integration**: 
  - Generate unique QR codes for each participant
  - Mobile-friendly QR scanning for quick attendance
  - Automatic timestamp recording on scan
- **Unique Links**: 
  - Generate secure attendance links per session
  - Email/SMS integration for remote attendance
  - Expiring links with configurable time windows
- **DSA Calculations**: Automatic rate calculations based on verified attendance
- **Bulk Operations**: CSV upload/download for attendance data
- **Reporting**: Attendance summaries and analytics
- **Features**:
  - Real-time attendance dashboard
  - Attendance heat maps and patterns
  - Automated absence notifications
  - Export to multiple formats (CSV, PDF, Excel)

### Request Management
- **Conference Facility Requests**: 
  - Request conference facilities and meals for digitisation workshops
  - Automated reference generation (e.g., OUK/ICT/REQ/187)
  - Participant count and duration tracking
  - Facility requirements specification
- **Digitisation Approval Requests**:
  - Content digitisation approval for semester courses
  - Cost estimation and budget approval workflows
  - Team composition and role assignments
  - Timeline and milestone planning
- **Course Listing Management**:
  - Complete list of courses to be digitised
  - Course code, title, and programme mapping
  - Bulk course import via CSV
  - Programme-based course categorisation
- **Financial Costing**:
  - Detailed DSA rate calculations by role
  - External vs internal staff cost breakdown
  - Conference facility costing
  - Grand total computation with sub-totals
  - Export to multiple formats (CSV, PDF, Excel)
- **Features**:
  - Request status tracking (Pending, Approved, Rejected)
  - Automated approval workflows
  - PDF generation for official requests
  - Search and filter capabilities
  - Request history and audit trail

### Financial Management
- **Payment Schedules**: DSA payment tracking
- **Rate Management**: Configurable DSA rates
- **Bank Integration**: Payment processing records
- **Financial Reporting**: Expenditure tracking and forecasts

## Bulk Operations

### CSV Upload Process
1. **Navigate** to the desired module
2. **Drag and Drop** CSV file onto upload area
3. **Preview** first 5 rows of data
4. **Validate** column mappings and data types
5. **Confirm** import to update database

### CSV Templates
Each module provides downloadable CSV templates:
- **Field Headers**: Pre-defined column names
- **Data Formats**: Expected data types and formats
- **Sample Data**: Example rows for reference
- **Validation Rules**: Required vs optional fields

### Supported Operations
- **Bulk Insert**: Add multiple records simultaneously
- **Bulk Update**: Update existing records from CSV
- **Bulk Delete**: Remove multiple records (admin only)
- **Data Validation**: Automatic error checking and reporting

## Support & Troubleshooting

### Common Issues

#### Login Problems
- **Issue**: Unable to login with credentials
- **Solution**: Verify user exists in database, check password hash
- **Command**: `SELECT username, role FROM users WHERE username='admin';`

#### Database Connection
- **Issue**: "Database connection failed"
- **Solution**: Check PostgreSQL service status and credentials
- **Command**: `pg_isready -h localhost -p 5432`

#### File Upload Errors
- **Issue**: CSV upload fails validation
- **Solution**: Verify file format, check required columns
- **Tip**: Use provided templates for correct formatting

#### Performance Issues
- **Issue**: Slow loading times
- **Solution**: Check database indexes, clear browser cache
- **Command**: `ANALYZE;` in PostgreSQL

### Error Messages

#### Success Messages
- "Data saved successfully"
- "Bulk import completed: X records processed"
- "User account created successfully"

#### Error Messages
- "Invalid file format. Please use CSV template"
- "Permission denied: insufficient role access"
- "Database error: Please contact administrator"

### Getting Help

#### Documentation Resources
- **User Manual**: Detailed step-by-step guides
- **API Documentation**: Technical integration guides
- **Database Schema**: Complete data structure reference

#### Support Channels
- **Email Support**: digitisation-support@x.edu
- **Phone Support**: +XXX-XXX-XXXXXXX
- **Office Hours**: Monday-Friday, 8:00 AM - 5:00 PM

#### System Maintenance
- **Backup Schedule**: Daily automated backups at 2:00 AM
- **Update Window**: Sundays 6:00 AM - 8:00 AM
- **Emergency Contact**: system-admin@x.edu

### Best Practices

#### Data Management
- **Regular Backups**: Export data weekly
- **Validation**: Always preview CSV imports
- **User Training**: Conduct regular user training sessions

#### Security
- **Password Policy**: Change passwords every 90 days
- **Access Review**: Quarterly role audits
- **Session Management**: Log out when finished

#### Performance
- **Browser Cache**: Clear regularly for best performance
- **Data Limits**: Avoid bulk operations >10,000 records
- **Concurrent Users**: System supports up to 50 concurrent users

---

## Version History

### v4.0 (Current)
- Complete PostgreSQL migration
- Enhanced RBAC system
- Bulk CSV operations
- Real-time progress tracking
- Mobile responsive design

### Previous Versions
- v3.x: Mock data system
- v2.x: Basic tracking only
- v1.x: Initial prototype

---

**© 2026 Institution X. Digital Transformation Initiative.**

For technical support or system inquiries, please contact the IT Support Team at digitisation-support@institutionX.edu
