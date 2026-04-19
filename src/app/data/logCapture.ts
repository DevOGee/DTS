export interface LogCaptureConfig {
  enabled: boolean;
  captureInterval: number; // in seconds
  retentionDays: number;
  captureTypes: string[];
  autoCleanup: boolean;
}

export interface LiveLogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  category: string;
  message: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  component: string;
  action: string;
  metadata?: Record<string, any>;
}

export class LogCaptureService {
  private static instance: LogCaptureService;
  private config: LogCaptureConfig;
  public isCapturing: boolean = false;
  private captureBuffer: LiveLogEntry[] = [];
  private captureTimer: any = null;

  private constructor(config: LogCaptureConfig) {
    this.config = config;
  }

  static getInstance(config?: LogCaptureConfig): LogCaptureService {
    if (!LogCaptureService.instance) {
      LogCaptureService.instance = new LogCaptureService(config || {
        enabled: true,
        captureInterval: 5, // 5 seconds
        retentionDays: 30,
        captureTypes: ['user_action', 'system_event', 'error', 'performance'],
        autoCleanup: true,
      });
    }
    return LogCaptureService.instance;
  }

  // Start capturing logs
  startCapture(): void {
    if (this.config.enabled && !this.isCapturing) {
      this.isCapturing = true;
      this.scheduleNextCapture();
      console.log('📋 Log capture started');
    }
  }

  // Stop capturing logs
  stopCapture(): void {
    this.isCapturing = false;
    if (this.captureTimer) {
      clearTimeout(this.captureTimer);
      this.captureTimer = null;
    }
    console.log('⏹️ Log capture stopped');
  }

  // Capture a single log entry
  captureLog(entry: Omit<LiveLogEntry, 'id'>): void {
    const logEntry: LiveLogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.captureBuffer.push(logEntry);
    
    // Trigger real-time updates
    this.notifyListeners(logEntry);
    
    // Auto-cleanup old logs
    if (this.config.autoCleanup) {
      this.cleanupOldLogs();
    }
  }

  // Schedule next capture cycle
  private scheduleNextCapture(): void {
    if (this.captureTimer) {
      clearTimeout(this.captureTimer);
    }
    
    this.captureTimer = setTimeout(() => {
      if (this.isCapturing) {
        this.performCapture();
        this.scheduleNextCapture(); // Schedule next Capture
      }
    }, this.config.captureInterval * 1000);
  }

  // Perform actual capture (collect system data)
  private performCapture(): void {
    // Capture user actions
    this.captureUserActions();
    
    // Capture system events
    this.captureSystemEvents();
    
    // Capture performance metrics
    this.capturePerformanceMetrics();
    
    // Capture errors
    this.captureErrors();
  }

  private captureUserActions(): void {
    // This would integrate with actual user activity tracking
    // For now, simulate some user actions
    const userActions = [
      'User logged in',
      'Page navigation',
      'Form submitted',
      'Data exported',
      'Settings updated',
    ];

    userActions.forEach(action => {
      if (Math.random() > 0.7) { // Simulate occasional activity
        this.captureLog({
          level: 'info',
          category: 'user_action',
          message: action,
          userId: 'current_user',
          component: 'UserInterface',
          action: 'user_interaction',
        });
      }
    });
  }

  private captureSystemEvents(): void {
    // Capture system-level events
    const systemEvents = [
      'Database backup completed',
      'Cache cleared',
      'Service started',
      'Service stopped',
      'Configuration updated',
    ];

    systemEvents.forEach(event => {
      if (Math.random() > 0.8) { // Simulate occasional system events
        this.captureLog({
          level: 'info',
          category: 'system_event',
          message: event,
          component: 'SystemService',
          action: 'system_operation',
        });
      }
    });
  }

  private capturePerformanceMetrics(): void {
    // Capture performance-related data
    const metrics = [
      { metric: 'Page load time', value: Math.random() * 1000 + 500, unit: 'ms' },
      { metric: 'Memory usage', value: Math.random() * 100, unit: 'MB' },
      { metric: 'CPU usage', value: Math.random() * 100, unit: '%' },
      { metric: 'Active connections', value: Math.floor(Math.random() * 50), unit: 'count' },
    ];

    metrics.forEach(metric => {
      if (Math.random() > 0.6) { // Simulate occasional performance logging
        this.captureLog({
          level: 'info',
          category: 'performance',
          message: `${metric.metric}: ${metric.value}${metric.unit}`,
          component: 'PerformanceMonitor',
          action: 'metric_collection',
          metadata: { metric: metric.metric, value: metric.value, unit: metric.unit },
        });
      }
    });
  }

  private captureErrors(): void {
    // Capture error events (simulated for demo)
    const errorTypes = [
      'Network timeout',
      'Database connection failed',
      'API rate limit exceeded',
      'Memory allocation failed',
    ];

    errorTypes.forEach(error => {
      if (Math.random() > 0.95) { // Simulate rare errors
        this.captureLog({
          level: 'error',
          category: 'error',
          message: error,
          component: 'ErrorHandler',
          action: 'error_occurred',
        });
      }
    });
  }

  // Clean up old logs based on retention policy
  private cleanupOldLogs(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
    
    const initialBufferLength = this.captureBuffer.length;
    this.captureBuffer = this.captureBuffer.filter(log => 
      log.timestamp > cutoffDate
    );
    
    const cleanedCount = initialBufferLength - this.captureBuffer.length;
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old log entries`);
    }
  }

  // Get captured logs
  getCapturedLogs(): LiveLogEntry[] {
    return [...this.captureBuffer];
  }

  // Get logs by category
  getLogsByCategory(category: string): LiveLogEntry[] {
    return this.captureBuffer.filter(log => log.category === category);
  }

  // Get logs by level
  getLogsByLevel(level: string): LiveLogEntry[] {
    return this.captureBuffer.filter(log => log.level === level);
  }

  // Export logs to various formats
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.captureBuffer, null, 2);
      case 'csv':
        const headers = ['ID', 'Timestamp', 'Level', 'Category', 'Message', 'User ID', 'Component', 'Action'];
        const csvContent = [
          headers.join(','),
          ...this.captureBuffer.map(log => [
            log.id,
            log.timestamp.toISOString(),
            log.level,
            log.category,
            log.message,
            log.userId || '',
            log.component,
            log.action,
          ].join(','))
        ].join('\n');
        return csvContent;
      default:
        return JSON.stringify(this.captureBuffer, null, 2);
    }
  }

  // Clear all logs
  clearLogs(): void {
    this.captureBuffer = [];
    console.log('🗑️ All logs cleared');
  }

  // Setup event listeners for real-time updates
  private notifyListeners(logEntry: LiveLogEntry): void {
    // This would trigger real-time UI updates
    window.dispatchEvent(new CustomEvent('newLogEntry', {
      detail: logEntry
    }));
  }

  // Get capture statistics
  getCaptureStats(): {
    totalLogs: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
    recentActivity: LiveLogEntry[];
  } {
    const byLevel = this.captureBuffer.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = this.captureBuffer.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentActivity = this.captureBuffer
      .filter(log => log.timestamp > new Date(Date.now() - 5 * 60 * 1000)) // Last 5 minutes
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      totalLogs: this.captureBuffer.length,
      byLevel,
      byCategory,
      recentActivity,
    };
  }
}

// Cron job simulation (in a real app, this would be server-side)
export class CronJobManager {
  static scheduleLogCapture(): void {
    // This would typically be handled by a server-side cron job
    console.log('⏰ Cron job scheduled: Log capture every 5 minutes');
    
    // Simulate cron job execution
    setInterval(() => {
      const logCapture = LogCaptureService.getInstance();
      if (logCapture.isCapturing()) {
        console.log('🔄 Executing scheduled log capture...');
        // In real implementation, this would trigger actual log collection
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  static setupLogRotation(): void {
    console.log('📅 Log rotation configured: Keep logs for 30 days');
    console.log('🗂️ Auto-cleanup: Remove logs older than 30 days');
  }
}
