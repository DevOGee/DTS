import { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
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
  FileSpreadsheet,
  Image,
  FileImage,
} from 'lucide-react';
import { Button } from './ui/button';

const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

export function Reports() {
  const { user } = useAuth();
  const { participants, attendance, paymentSchedules, workshop, courses, programmes } = useData();
  const { success, info } = useToast();
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
  const [isLiveRefresh, setIsLiveRefresh] = useState(false);

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

  // Live refresh effect
  useEffect(() => {
    if (!isLiveRefresh) return;

    const interval = setInterval(async () => {
      try {
        const [logsData, statsData] = await Promise.all([
          loggingService.getLogs(logsPerPage, (currentPage - 1) * logsPerPage),
          loggingService.getLogStatistics()
        ]);
        setLogs(logsData);
        setLogStats(statsData);
      } catch (error) {
        console.error('Live refresh failed:', error);
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [isLiveRefresh, currentPage, logsPerPage]);

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

  // Export Summary function
  const exportSummary = () => {
    const summaryData = {
      workshop: {
        name: workshop.name,
        numberOfDays: workshop.numberOfDays,
        startDate: workshop.startDate.toISOString(),
        endDate: workshop.endDate.toISOString(),
        venue: workshop.venue,
      },
      participants: {
        total: totalParticipants,
        groups: [...new Set(participants.map((p: any) => p.group))].length,
        averageAttendance: attendanceTotals.attendanceRate,
      },
      courses: {
        total: totalCourses,
        totalModules: totalModules,
        completedModules: completedModules,
        completionPercentage: completionPercentage,
      },
      payments: {
        total: paymentTotals.total,
        processed: paymentTotals.processed,
        pending: paymentTotals.pending,
        averagePerParticipant: totalParticipants ? Math.round(paymentTotals.total / totalParticipants) : 0,
      },
      attendance: {
        present: attendanceTotals.present,
        absent: attendanceTotals.absent,
        total: attendanceTotals.total,
        rate: attendanceTotals.attendanceRate,
      },
      generatedAt: new Date().toISOString(),
    };

    const csv = [
      ['Workshop Summary Report'],
      [`Generated: ${new Date().toLocaleString()}`],
      [''],
      ['Workshop Details'],
      ['Name', workshop.name],
      ['Duration', `${workshop.numberOfDays} days`],
      ['Start Date', workshop.startDate.toLocaleDateString()],
      ['End Date', workshop.endDate.toLocaleDateString()],
      ['Venue', workshop.venue],
      [''],
      ['Participant Statistics'],
      ['Total Participants', totalParticipants],
      ['Number of Groups', [...new Set(participants.map((p: any) => p.group))].length],
      ['Average Attendance Rate', `${attendanceTotals.attendanceRate}%`],
      [''],
      ['Course Statistics'],
      ['Total Courses', totalCourses],
      ['Total Modules', totalModules],
      ['Completed Modules', completedModules],
      ['Completion Percentage', `${completionPercentage}%`],
      [''],
      ['Payment Summary'],
      ['Total DSA Amount', formatCurrency(paymentTotals.total)],
      ['Processed Amount', formatCurrency(paymentTotals.processed)],
      ['Pending Amount', formatCurrency(paymentTotals.pending)],
      ['Average Per Participant', formatCurrency(totalParticipants ? Math.round(paymentTotals.total / totalParticipants) : 0)],
      [''],
      ['Attendance Summary'],
      ['Total Present', attendanceTotals.present],
      ['Total Absent', attendanceTotals.absent],
      ['Total Records', attendanceTotals.total],
      ['Overall Attendance Rate', `${attendanceTotals.attendanceRate}%`],
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workshop-summary-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    success('Workshop summary exported successfully!', 'Export Complete');
  };

  // Download Charts function
  const downloadCharts = () => {
    const chartsContainer = document.getElementById('charts-container');
    if (!chartsContainer) {
      info('Charts container not found. Please try again.', 'Error');
      return;
    }

    // Create a canvas to combine charts
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 800;
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Workshop Analytics Report', 50, 50);
    ctx.font = '16px Arial';
    ctx.fillText(`Generated: ${new Date().toLocaleString()}`, 50, 80);

    // Add attendance chart placeholder
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(50, 120, 500, 300);
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText('Attendance Overview Chart', 200, 270);
    
    // Add payment chart placeholder
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(600, 120, 500, 300);
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Payment Status Chart', 750, 270);

    // Add summary statistics
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Key Metrics', 50, 480);
    ctx.font = '14px Arial';
    ctx.fillText(`Total Participants: ${totalParticipants}`, 50, 520);
    ctx.fillText(`Overall Attendance: ${attendanceTotals.attendanceRate}%`, 50, 550);
    ctx.fillText(`Total DSA: ${formatCurrency(paymentTotals.total)}`, 50, 580);
    ctx.fillText(`Completion Rate: ${completionPercentage}%`, 50, 610);

    // Convert to image and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workshop-charts-${new Date().toISOString().split('T')[0]}.png`;
        a.click();
        URL.revokeObjectURL(url);
        
        success('Charts exported successfully!', 'Export Complete');
      }
    }, 'image/png');
  };

  // Live refresh function
  const toggleLiveRefresh = () => {
    setIsLiveRefresh(!isLiveRefresh);
    if (!isLiveRefresh) {
      success('Live refresh enabled - Feed will update automatically', 'Live Refresh Active');
    } else {
      info('Live refresh disabled', 'Live Refresh Stopped');
    }
  };

  // Export logs function
  const exportLogs = () => {
    const logData = logs.map(log => [
      log.time,
      log.level,
      log.user,
      log.message,
      log.ip,
      log.geo_location?.city || '',
      log.geo_location?.country || '',
      log.timestamp,
      log.user_agent
    ]);

    const csv = [
      ['Time', 'Level', 'User', 'Message', 'IP Address', 'City', 'Country', 'Timestamp', 'User Agent'],
      ...logData
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    success(`${logs.length} log entries exported successfully!`, 'Export Complete');
  };

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
    {
      id: 'post-digitization',
      label: 'Post-Digitization',
      icon: FileImage,
      description: 'Digitized reports and document processing',
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
    } else if (path.startsWith('/reports/post-digitization')) {
      setActiveSection('post-digitization');
    }
  }, [location.pathname]);

  if (!canView) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access the Reports module.</p>
          <div className="mt-4">
            <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  // Render post-digitization screen
  if (activeSection === 'post-digitization') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl mb-2">Post-Digitization</h1>
            <p className="text-muted-foreground max-w-2xl">
              Process and manage digitized reports, scanned documents, and automated data extraction.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button>
              <FileSpreadsheet className="w-4 h-4" /> Process Documents
            </Button>
            <Button variant="secondary">
              <Image className="w-4 h-4" /> View Scans
            </Button>
          </div>
        </div>

        {/* Document Processing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <div className="text-sm text-muted-foreground">Documents Processed</div>
            </div>
            <div className="text-3xl font-semibold">1,247</div>
            <div className="text-sm text-muted-foreground">Total digitized documents</div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-5 h-5 text-chart-3" />
              <div className="text-sm text-muted-foreground">Processing Success</div>
            </div>
            <div className="text-3xl font-semibold">98.5%</div>
            <div className="text-sm text-muted-foreground">Successful extraction rate</div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-chart-4" />
              <div className="text-sm text-muted-foreground">Manual Review</div>
            </div>
            <div className="text-3xl font-semibold">23</div>
            <div className="text-sm text-muted-foreground">Documents requiring review</div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-secondary" />
              <div className="text-sm text-muted-foreground">Avg Processing Time</div>
            </div>
            <div className="text-3xl font-semibold">2.3s</div>
            <div className="text-sm text-muted-foreground">Per document</div>
          </div>
        </div>

        {/* Recent Digitizations */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Recent Digitizations</h2>
              <p className="text-sm text-muted-foreground">Latest processed documents and their status</p>
            </div>
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4" /> Export All
            </Button>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Workshop Attendance Report', type: 'PDF', status: 'Completed', time: '2 hours ago', accuracy: '99.2%', pages: 15 },
              { name: 'Participant Roster', type: 'Excel', status: 'Processing', time: '5 hours ago', accuracy: '97.8%', pages: 8 },
              { name: 'Payment Schedule', type: 'PDF', status: 'Review Required', time: '1 day ago', accuracy: '95.1%', pages: 12 },
              { name: 'Course Completion Report', type: 'Word', status: 'Completed', time: '2 days ago', accuracy: '98.9%', pages: 24 },
            ].map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    doc.type === 'PDF' ? 'bg-red-100' :
                    doc.type === 'Excel' ? 'bg-green-100' :
                    doc.type === 'Word' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <FileSpreadsheet className={`w-5 h-5 ${
                      doc.type === 'PDF' ? 'text-red-600' :
                      doc.type === 'Excel' ? 'text-green-600' :
                      doc.type === 'Word' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-sm text-muted-foreground">{doc.type} • {doc.pages} pages</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'Completed' ? 'bg-chart-3/10 text-chart-3' :
                      doc.status === 'Processing' ? 'bg-chart-4/10 text-chart-4' :
                      'bg-chart-5/10 text-chart-5'
                    }`}>
                      {doc.status}
                    </div>
                    <div className="text-xs text-muted-foreground">{doc.time}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                    <div className="font-semibold">{doc.accuracy}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <Button onClick={exportSummary}>
              <BookOpen className="w-4 h-4" /> Export Summary
            </Button>
            <Button variant="secondary" onClick={downloadCharts}>
              <BarChart3 className="w-4 h-4" /> Download Charts
            </Button>
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
              <Button 
                variant={isLiveRefresh ? "default" : "secondary"} 
                size="sm"
                onClick={toggleLiveRefresh}
                className={isLiveRefresh ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <RefreshCw className={`w-4 h-4 ${isLiveRefresh ? "animate-spin" : ""}`} />
                {isLiveRefresh ? "Live Refresh ON" : "Live Refresh OFF"}
              </Button>
              <Button size="sm" onClick={exportLogs}>
                <Download className="w-4 h-4" />
                Export Logs
              </Button>
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted-foreground">Recent Activity</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalLogPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalLogPages, currentPage + 1))}
                    disabled={currentPage === totalLogPages}
                  >
                    Next
                  </Button>
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
        <div id="charts-container" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-gradient-to-br from-card to-card/50 rounded-xl p-6 border border-border shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Attendance Overview</h2>
                <p className="text-sm text-muted-foreground">Daily participation trends and insights</p>
              </div>
              <div className="text-center bg-gradient-to-br from-chart-3/10 to-chart-3/5 rounded-xl p-4 border border-chart-3/20">
                <div className="text-4xl font-bold text-chart-3">{attendanceTotals.attendanceRate}%</div>
                <div className="text-sm text-chart-3 font-medium">Average Present Rate</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 rounded-xl p-4 border border-chart-3/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-chart-3" />
                  <div className="text-sm text-chart-3 font-medium">Present</div>
                </div>
                <div className="text-3xl font-bold text-chart-3">{attendanceTotals.present}</div>
                <div className="text-xs text-chart-3/70">Total present days</div>
              </div>
              <div className="bg-gradient-to-br from-chart-4/5 to-chart-4/10 rounded-xl p-4 border border-chart-4/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-chart-4" />
                  <div className="text-sm text-chart-4 font-medium">Absent</div>
                </div>
                <div className="text-3xl font-bold text-chart-4">{attendanceTotals.absent}</div>
                <div className="text-xs text-chart-4/70">Total absent days</div>
              </div>
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20 sm:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <div className="text-sm text-primary font-medium">Total Records</div>
                </div>
                <div className="text-3xl font-bold text-primary">{attendanceTotals.total}</div>
                <div className="text-xs text-primary/70">All attendance entries</div>
              </div>
            </div>

            <div className="bg-card/50 rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Daily Attendance Pattern</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-chart-3"></div>
                  <span>Present</span>
                  <div className="w-3 h-3 rounded-full bg-chart-4"></div>
                  <span>Absent</span>
                </div>
              </div>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart data={attendanceDayData} margin={{ left: -16, right: 0, top: 20, bottom: 20 }}>
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#f8fafc'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="rect"
                    />
                    <Bar 
                      dataKey="Present" 
                      fill="#22c55e" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={60}
                    />
                    <Bar 
                      dataKey="Absent" 
                      fill="#f59e0b" 
                      radius={[8, 8, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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