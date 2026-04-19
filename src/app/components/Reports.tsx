import { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { loggingService, LogEntry, LogStatistics } from '../../services/loggingService';
import {
  FileText,
  MessageSquare,
  Database,
  TrendingUp,
  Activity,
  Shield,
  Server,
  Settings,
  Clock,
  Filter,
  Search,
  Download,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  BookOpen,
  Users,
  DollarSign,
  MapPin,
} from 'lucide-react';

const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

export function Reports() {
  const { user } = useAuth();
  const { participants, attendance, paymentSchedules, workshop, courses, programmes } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLogsExpanded, setIsLogsExpanded] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logStats, setLogStats] = useState<LogStatistics | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [totalLogPages, setTotalLogPages] = useState(1);

  // Fetch logs and statistics
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoadingLogs(true);
      try {
        const [logsData, statsData] = await Promise.all([
          loggingService.getLogs(logsPerPage, (currentPage - 1) * logsPerPage),
          loggingService.getLogStatistics()
        ]);
        setLogs(logsData);
        setLogStats(statsData);
        setTotalLogPages(Math.ceil(statsData.total_logs / logsPerPage));
      } catch (error) {
        console.error('Failed to fetch logs:', error);
        // Set default data if API fails
        setLogs([
          { time: 'Just now', level: 'info', message: 'User logged in to dashboard', user: 'System', timestamp: '', ip: '', geo_location: {}, user_agent: '' },
          { time: '2 min ago', level: 'info', message: 'Reports page accessed', user: 'John Smith', timestamp: '', ip: '', geo_location: {}, user_agent: '' },
          { time: '5 min ago', level: 'warning', message: 'High memory usage detected', user: 'System', timestamp: '', ip: '', geo_location: {}, user_agent: '' },
          { time: '10 min ago', level: 'error', message: 'Database connection timeout', user: 'System', timestamp: '', ip: '', geo_location: {}, user_agent: '' },
        ]);
        setLogStats({
          total_logs: 247,
          today_errors: 3,
          today_warnings: 1,
          today_info: 0,
          capture_status: 'Active',
          capture_interval: '5s',
          retention_days: 30
        });
        setTotalLogPages(1);
      } finally {
        setIsLoadingLogs(false);
      }
    };

    fetchLogs();
  }, [currentPage, logsPerPage]);

  // Log page access
  useEffect(() => {
    if (user) {
      loggingService.logPageAccess('Reports Dashboard');
    }
  }, [user]);

  const canView = user?.role !== 'Viewer/Digitiser';
  const canManage = user?.role === 'System Admin' || user?.role === 'Programme Lead';

  // Calculate original dashboard metrics
  const totalCourses = courses.length;
  const totalParticipants = participants.length;
  const totalModules = courses.reduce((sum: number, course: any) => sum + course.totalModules, 0);
  const completedModules = courses.reduce((sum: number, course: any) => sum + course.completedModules, 0);
  const completionPercentage = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;

  const paymentTotals = useMemo(() => {
    const total = paymentSchedules.reduce((sum: number, schedule: any) => sum + schedule.amount, 0);
    const processed = paymentSchedules
      .filter((schedule: any) => schedule.status === 'Processed' || schedule.status === 'Paid')
      .reduce((sum: number, schedule: any) => sum + schedule.amount, 0);
    const pending = paymentSchedules
      .filter((schedule: any) => schedule.status === 'Pending')
      .reduce((sum: number, schedule: any) => sum + schedule.amount, 0);
    return { total, processed, pending };
  }, [paymentSchedules]);

  const attendanceTotals = useMemo(() => {
    const present = attendance.filter((record: any) => record.status === 'Present').length;
    const absent = attendance.filter((record: any) => record.status === 'Absent').length;
    const total = present + absent;
    return {
      present,
      absent,
      total,
      attendanceRate: total ? Math.round((present / total) * 100) : 0,
    };
  }, [attendance]);

  const paymentStatusData = useMemo(
    () => [
      { name: 'Processed', value: paymentTotals.processed, color: '#22c55e' },
      { name: 'Pending', value: paymentTotals.pending, color: '#f59e0b' },
    ],
    [paymentTotals]
  );

  const attendanceDayData = useMemo(() => {
    return Array.from({ length: workshop.numberOfDays }, (_, idx) => {
      const day = idx + 1;
      const presentCount = attendance.filter((record: any) => record.day === day && record.status === 'Present').length;
      const absentCount = attendance.filter((record: any) => record.day === day && record.status === 'Absent').length;
      return {
        day: `Day ${day}`,
        Present: presentCount,
        Absent: absentCount,
      };
    });
  }, [attendance, workshop.numberOfDays]);

  const reportSections = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Overview of system metrics and analytics',
    },
    {
      id: 'logs',
      label: 'Logs',
      icon: FileText,
      description: 'View system activity logs and events',
      subItems: [
        { id: 'live-logs', label: 'Live Logs' },
        { id: 'system-logs', label: 'System Logs' },
        { id: 'user-logs', label: 'User Activity' },
        { id: 'error-logs', label: 'Error Logs' },
      ]
    },
    {
      id: 'comments',
      label: 'Comments',
      icon: MessageSquare,
      description: 'Manage and review user comments',
    },
    {
      id: 'backups',
      label: 'Backups',
      icon: Database,
      description: 'View and manage system backups',
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: TrendingUp,
      description: 'Analytics and performance insights',
    },
    {
      id: 'performance',
      label: 'Performance Overview',
      icon: Activity,
      description: 'System performance metrics and monitoring',
    },
    {
      id: 'security',
      label: 'Security Checks',
      icon: Shield,
      description: 'Security audit and compliance checks',
    },
    {
      id: 'status',
      label: 'System Status',
      icon: Server,
      description: 'Current system status and health',
    },
    {
      id: 'monitoring',
      label: 'Event Monitoring Rules',
      icon: Settings,
      description: 'Configure event monitoring and alerts',
    },
  ];

  // Determine active section based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path === '/reports' || path === '/reports/') {
      setActiveSection('dashboard');
    } else if (path.startsWith('/reports/logs')) {
      setActiveSection('logs');
    } else if (path.startsWith('/reports/comments')) {
      setActiveSection('comments');
    } else if (path.startsWith('/reports/backups')) {
      setActiveSection('backups');
    } else if (path.startsWith('/reports/insights')) {
      setActiveSection('insights');
    } else if (path.startsWith('/reports/performance')) {
      setActiveSection('performance');
    } else if (path.startsWith('/reports/security')) {
      setActiveSection('security');
    } else if (path.startsWith('/reports/status')) {
      setActiveSection('status');
    } else if (path.startsWith('/reports/monitoring')) {
      setActiveSection('monitoring');
    }
  }, [location.pathname]);

  if (!canView) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access the Reports module.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-4">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render dashboard with all sections
  if (activeSection === 'dashboard') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl mb-2">Reports</h1>
            <p className="text-muted-foreground max-w-2xl">
              {user?.name ? `Hello ${user.name}, here are the latest workshop analytics:` : 'Consolidated workshop analytics for progress, attendance, DSA disbursements, programme performance, and group delivery.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-lg hover:bg-primary/90 transition-all">
              <BookOpen className="w-4 h-4" /> Export Summary
            </button>
            <button className="inline-flex items-center gap-2 bg-muted text-foreground px-5 py-3 rounded-lg hover:bg-muted/80 transition-all">
              <BarChart3 className="w-4 h-4" /> Download Charts
            </button>
          </div>
        </div>

        {/* Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-5 h-5 text-primary" />
              <div className="text-sm text-muted-foreground">Participants</div>
            </div>
            <div className="text-3xl font-semibold">{totalParticipants}</div>
            <div className="text-sm text-muted-foreground">Total enrolled participants</div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-5 h-5 text-secondary" />
              <div className="text-sm text-muted-foreground">Courses</div>
            </div>
            <div className="text-3xl font-semibold">{totalCourses}</div>
            <div className="text-sm text-muted-foreground">Active courses in workshop</div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-5 h-5 text-chart-3" />
              <div className="text-sm text-muted-foreground">Overall Completion</div>
            </div>
            <div className="text-3xl font-semibold">{completionPercentage}%</div>
            <div className="text-sm text-muted-foreground">Modules completed vs target</div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <div className="text-sm text-muted-foreground">DSA Payouts</div>
            </div>
            <div className="text-3xl font-semibold">{formatCurrency(paymentTotals.total)}</div>
            <div className="text-sm text-muted-foreground">Estimated total DSA liability</div>
          </div>
        </div>

        {/* Real-time Log Feed */}
        <div className="bg-card rounded-xl p-6 border border-border mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Live Log Feed
              </h2>
              <p className="text-sm text-muted-foreground">Real-time system activity monitoring</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn btn-muted btn-sm">
                <RefreshCw className="w-4 h-4" />
                Refresh Feed
              </button>
              <button className="btn btn-primary btn-sm">
                <Download className="w-4 h-4" />
                Export Logs
              </button>
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Recent Activity</div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-muted btn-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalLogPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(Math.min(totalLogPages, currentPage + 1))}
                    disabled={currentPage === totalLogPages}
                    className="btn btn-muted btn-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {isLoadingLogs ? (
                  <div className="flex items-center justify-center p-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading logs...</span>
                  </div>
                ) : logs.length > 0 ? (
                  logs.map((log, index) => {
                    const fullTime = new Date(log.timestamp).toLocaleTimeString();
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border-l-4 border-l-primary/20">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            log.level === 'error' ? 'bg-red-500' :
                            log.level === 'warning' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{log.message}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {log.user}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {fullTime}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-mono bg-background px-1.5 py-0.5 rounded">
                              <MapPin className="w-3 h-3" />
                              {log.ip}
                            </span>
                          </div>
                          {log.geo_location && log.geo_location.city && (
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {log.geo_location.city}, {log.geo_location.country}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-0.5">{log.time}</div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                          log.level === 'error' ? 'bg-red-100 text-red-700' :
                          log.level === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {log.level.toUpperCase()}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    No logs available. Start the logging server to see real-time data.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Attendance Overview</h2>
                <p className="text-sm text-muted-foreground">Daily participation across event.</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-semibold">{attendanceTotals.attendanceRate}%</div>
                <div className="text-sm text-muted-foreground">Average present rate</div>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <div className="flex-1 bg-muted/50 rounded-xl p-4">
                <div className="text-sm text-muted-foreground">Present</div>
                <div className="text-2xl font-semibold">{attendanceTotals.present}</div>
              </div>
              <div className="flex-1 bg-muted/50 rounded-xl p-4">
                <div className="text-sm text-muted-foreground">Absent</div>
                <div className="text-2xl font-semibold">{attendanceTotals.absent}</div>
              </div>
            </div>

            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={attendanceDayData} margin={{ left: -16, right: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Present" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Absent" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Payment Status</h2>
            <div className="space-y-4">
              {paymentStatusData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: entry.color }} />
                    <div>
                      <div className="font-medium">{entry.name}</div>
                      <div className="text-sm text-muted-foreground">{entry.name === 'Processed' ? 'Confirmed / Paid' : 'Awaiting bank processing'}</div>
                    </div>
                  </div>
                  <div className="font-semibold">{formatCurrency(entry.value)}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <div className="text-sm text-muted-foreground">Estimated average per participant</div>
              <div className="text-2xl font-semibold">{formatCurrency(totalParticipants ? Math.round(paymentTotals.total / totalParticipants) : 0)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 bg-card border-r border-border flex-shrink-0">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Reports
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            System reporting and analytics
          </p>
        </div>

        <nav className="p-4 space-y-1">
          {reportSections.map((section) => (
            <div key={section.id} className="mb-2">
              <div
                onClick={() => {
                  setActiveSection(section.id);
                  if (section.id === 'logs') {
                    navigate('/reports/logs/live-logs');
                  } else {
                    navigate(`/reports/${section.id}`);
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 cursor-pointer ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <section.icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{section.label}</div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {section.description}
                  </div>
                </div>
                {activeSection === section.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents navigation when clicking the arrow
                      if (section.id === 'logs') setIsLogsExpanded(!isLogsExpanded);
                    }}
                    className="w-4 h-4 text-muted-foreground hover:text-foreground"
                  >
                    {section.id === 'logs' ? (
                      isLogsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {activeSection === 'logs' && section.subItems && isLogsExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {section.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => navigate(`/reports/logs/${subItem.id}`)}
                      className={`w-full text-left px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                        location.pathname.endsWith(subItem.id)
                          ? 'bg-primary/20 text-primary font-medium'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}