const API_BASE_URL = 'http://localhost:5000';

export interface LogEntry {
  time: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  user: string;
  timestamp: string;
  ip: string;
  geo_location: {
    country?: string;
    city?: string;
    lat?: number;
    lon?: number;
    note?: string;
    error?: string;
  };
  user_agent: string;
}

export interface LogStatistics {
  total_logs: number;
  today_errors: number;
  today_warnings: number;
  today_info: number;
  capture_status: string;
  capture_interval: string;
  retention_days: number;
}

export interface LogResponse {
  logs: LogEntry[];
}

class LoggingService {
  async logAction(action: string, status: 'info' | 'warning' | 'error' = 'info'): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          status
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to log action:', error);
      throw error;
    }
  }

  async getLogs(limit: number = 50, offset: number = 0): Promise<LogEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/logs?limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: LogResponse = await response.json();
      return data.logs;
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      throw error;
    }
  }

  async getLogStatistics(): Promise<LogStatistics> {
    try {
      const response = await fetch(`${API_BASE_URL}/logs/statistics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch log statistics:', error);
      throw error;
    }
  }

  // Convenience methods for common actions
  async logUserLogin(userId: string): Promise<void> {
    await this.logAction(`User logged in: ${userId}`, 'info');
  }

  async logPageAccess(page: string): Promise<void> {
    await this.logAction(`Page accessed: ${page}`, 'info');
  }

  async logError(error: string): Promise<void> {
    await this.logAction(`Error: ${error}`, 'error');
  }

  async logWarning(warning: string): Promise<void> {
    await this.logAction(`Warning: ${warning}`, 'warning');
  }

  async logSystemAction(action: string): Promise<void> {
    await this.logAction(`System: ${action}`, 'info');
  }
}

export const loggingService = new LoggingService();
