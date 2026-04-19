# Logging System Setup

This project now includes a comprehensive logging system with geo-location tracking and real-time monitoring.

## Files Added

1. **`logging_server.py`** - Flask backend server with logging functionality
2. **`src/services/loggingService.ts`** - TypeScript service for frontend integration
3. **`requirements.txt`** - Python dependencies for the logging server

## Features

- **Real-time Activity Logging**: Captures user actions with timestamps
- **Geo-location Tracking**: IP-based location detection (country, city, coordinates)
- **Log Levels**: Support for info, warning, and error logs
- **Pagination**: Efficient log browsing with pagination
- **Statistics**: Real-time log statistics and metrics
- **CORS Support**: Enabled for React frontend integration

## Quick Start

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the Logging Server
```bash
python logging_server.py
```
The server will start on `http://localhost:5000`

### 3. Start the React App
```bash
npm run dev
```

### 4. Access the Reports Dashboard
Navigate to `http://localhost:5173/reports` to see the live logging dashboard

## API Endpoints

### POST `/action`
Log a new action with geo-location data.

**Request:**
```json
{
  "action": "User logged in",
  "status": "info"
}
```

**Response:**
```json
{
  "status": "Logged",
  "captured_data": {
    "timestamp": "2026-04-19T23:15:10Z",
    "action": "User logged in",
    "status": "info",
    "network": {"ip": "102.135.168.2"},
    "geo_location": {"country": "Kenya", "city": "Nairobi", "lat": -1.28, "lon": 36.82},
    "user_agent": "Mozilla/5.0..."
  }
}
```

### GET `/logs`
Retrieve paginated logs.

**Query Parameters:**
- `limit`: Number of logs to return (default: 50)
- `offset`: Number of logs to skip (default: 0)

**Response:**
```json
{
  "logs": [
    {
      "time": "Just now",
      "level": "info",
      "message": "User logged in to dashboard",
      "user": "System",
      "timestamp": "2026-04-19T23:15:10Z",
      "ip": "102.135.168.2",
      "geo_location": {"country": "Kenya", "city": "Nairobi"},
      "user_agent": "Mozilla/5.0..."
    }
  ]
}
```

### GET `/logs/statistics`
Get logging statistics.

**Response:**
```json
{
  "total_logs": 247,
  "today_errors": 3,
  "today_warnings": 1,
  "today_info": 45,
  "capture_status": "Active",
  "capture_interval": "5s",
  "retention_days": 30
}
```

## Frontend Integration

The Reports component now automatically:
- Fetches and displays real-time logs
- Shows geo-location data when available
- Displays log statistics
- Logs page access events
- Provides pagination for large log sets

## Log File

All logs are stored in `activity_audit.log` in JSON format:
```json
{"timestamp": "2026-04-19T23:15:10Z", "action": "FILE_UPLOAD", "status": "info", "network": {"ip": "102.135.168.2"}, "geo_location": {"country": "Kenya", "city": "Nairobi", "lat": -1.28, "lon": 36.82}, "user_agent": "Mozilla/5.0..."}
```

## Usage Examples

### Logging Custom Actions
```typescript
import { loggingService } from '../services/loggingService';

// Log user actions
await loggingService.logUserLogin('user123');
await loggingService.logPageAccess('Dashboard');
await loggingService.logError('Database connection failed');
await loggingService.logWarning('High memory usage detected');
await loggingService.logSystemAction('Backup completed');
```

### Custom Logging
```typescript
await loggingService.logAction('Custom action', 'warning');
```

## Security Notes

- MAC addresses are intentionally not captured (as requested)
- IP addresses are logged for geo-location purposes
- User agents are captured for browser/device analytics
- All data is stored locally in the log file
- CORS is enabled for development (restrict in production)

## Development

The logging system is designed to be:
- **Non-intrusive**: Works alongside existing application code
- **Fallback-friendly**: Shows default data if server is unavailable
- **Performant**: Efficient pagination and lazy loading
- **Extensible**: Easy to add new log types and actions
