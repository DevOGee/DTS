import { useState, useMemo } from 'react';
import { Search, Filter, Download, Calendar, User, AlertTriangle, CheckCircle, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LogEntry {
  id: string;
  time: string;
  userFullName: string;
  affectedUser: string;
  eventContext: string;
  component: string;
  eventName: string;
  description: string;
  origin: string;
  ipAddress: string;
}

// Mock log data - in real implementation, this would come from backend API
const mockLogs: LogEntry[] = [
  {
    id: '1',
    time: '2024-01-15 09:30:45',
    userFullName: 'John Smith',
    affectedUser: 'Jane Doe',
    eventContext: 'Course Management',
    component: 'Courses',
    eventName: 'Course Deletion',
    description: 'Deleted course "Introduction to Programming" (C101)',
    origin: 'Web Interface',
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    time: '2024-01-15 09:25:12',
    userFullName: 'John Smith',
    affectedUser: 'Mike Johnson',
    eventContext: 'User Management',
    component: 'Participants',
    eventName: 'User Creation',
    description: 'Created new participant "Mike Johnson" in Group A',
    origin: 'Web Interface',
    ipAddress: '192.168.1.100'
  },
  {
    id: '3',
    time: '2024-01-15 09:15:30',
    userFullName: 'Sarah Wilson',
    affectedUser: 'System',
    eventContext: 'Authentication',
    component: 'Login',
    eventName: 'Failed Login Attempt',
    description: 'Failed login attempt for user "admin" - invalid password',
    origin: 'Web Interface',
    ipAddress: '192.168.1.105'
  },
  {
    id: '4',
    time: '2024-01-15 08:45:22',
    userFullName: 'John Smith',
    affectedUser: 'All Participants',
    eventContext: 'Attendance Management',
    component: 'Attendance',
    eventName: 'Bulk Attendance Update',
    description: 'Updated attendance for 25 participants in Group B',
    origin: 'Mobile App',
    ipAddress: '192.168.1.200'
  },
  {
    id: '5',
    time: '2024-01-15 08:30:15',
    userFullName: 'Jane Doe',
    affectedUser: 'Payment System',
    component: 'Payments',
    eventName: 'Payment Processing',
    description: 'Processed DSA payment for 15 participants - Group C',
    origin: 'Automated System',
    ipAddress: 'system-service'
  },
];

export function LiveLogs() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSite, setSelectedSite] = useState('OUK Digitisation (Site)');
  const [selectedParticipants, setSelectedParticipants] = useState('All participants');
  const [selectedDays, setSelectedDays] = useState('All days');
  const [selectedActivities, setSelectedActivities] = useState('All activities');
  const [selectedActions, setSelectedActions] = useState('All actions');
  const [selectedSources, setSelectedSources] = useState('All sources');
  const [selectedEvents, setSelectedEvents] = useState('All events');

  const canManage = user?.role === 'System Admin' || user?.role === 'Programme Lead';

  // Filter logs based on selected criteria
  const filteredLogs = useMemo(() => {
    return mockLogs.filter(log => {
      const matchesSearch = searchTerm === '' || 
        log.userFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.affectedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSite = selectedSite === 'All' || log.eventContext.includes(selectedSite);
      const matchesParticipants = selectedParticipants === 'All' || log.affectedUser.includes(selectedParticipants);
      const matchesDays = selectedDays === 'All' || log.time.includes('15'); // Example filtering logic
      const matchesActivities = selectedActivities === 'All' || log.component.includes(selectedActivities);
      const matchesActions = selectedActions === 'All' || log.eventName.includes(selectedActions);
      const matchesSources = selectedSources === 'All' || log.origin.includes(selectedSources);
      const matchesEvents = selectedEvents === 'All' || log.eventName.includes(selectedEvents);

      return matchesSearch && matchesSite && matchesParticipants && matchesDays && 
             matchesActivities && matchesActions && matchesSources && matchesEvents;
    });
  }, [searchTerm, selectedSite, selectedParticipants, selectedDays, selectedActivities, selectedActions, selectedSources, selectedEvents]);

  const handleExport = () => {
    const csvContent = [
      'Time,User Full Name,Affected User,Event Context,Component,Event Name,Description,Origin,IP Address',
      ...filteredLogs.map(log => [
        log.time,
        log.userFullName,
        log.affectedUser,
        log.eventContext,
        log.component,
        log.eventName,
        log.description,
        log.origin,
        log.ipAddress
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    // In real implementation, this would fetch fresh data from backend
    console.log('Refreshing logs...');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold mb-1 flex items-center gap-2">
            <Clock className="w-8 h-8 text-primary" />
            Live Logs
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time system activity monitoring and event tracking
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="btn btn-muted btn-sm"
            disabled={!canManage}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="btn btn-primary btn-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Site Filter */}
          <div>
            <label className="block mb-1.5 text-sm font-medium">OUK Digitisation (Site)</label>
            <select
              className="field"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
            >
              <option value="OUK Digitisation (Site)">OUK Digitisation (Site)</option>
              <option value="All">All</option>
            </select>
          </div>

          {/* Participants Filter */}
          <div>
            <label className="block mb-1.5 text-sm font-medium">All participants</label>
            <select
              className="field"
              value={selectedParticipants}
              onChange={(e) => setSelectedParticipants(e.target.value)}
            >
              <option value="All participants">All participants</option>
              <option value="John Smith">John Smith</option>
              <option value="Jane Doe">Jane Doe</option>
              <option value="Mike Johnson">Mike Johnson</option>
            </select>
          </div>

          {/* Days Filter */}
          <div>
            <label className="block mb-1.5 text-sm font-medium">All days</label>
            <select
              className="field"
              value={selectedDays}
              onChange={(e) => setSelectedDays(e.target.value)}
            >
              <option value="All days">All days</option>
              <option value="15">Day 15</option>
              <option value="14">Day 14</option>
              <option value="13">Day 13</option>
            </select>
          </div>

          {/* Activities Filter */}
          <div>
            <label className="block mb-1.5 text-sm font-medium">All activities</label>
            <select
              className="field"
              value={selectedActivities}
              onChange={(e) => setSelectedActivities(e.target.value)}
            >
              <option value="All activities">All activities</option>
              <option value="Courses">Courses</option>
              <option value="Participants">Participants</option>
              <option value="Attendance">Attendance</option>
              <option value="Payments">Payments</option>
            </select>
          </div>

          {/* Actions Filter */}
          <div>
            <label className="block mb-1.5 text-sm font-medium">All actions</label>
            <select
              className="field"
              value={selectedActions}
              onChange={(e) => setSelectedActions(e.target.value)}
            >
              <option value="All actions">All actions</option>
              <option value="Creation">Creation</option>
              <option value="Deletion">Deletion</option>
              <option value="Update">Update</option>
              <option value="Login">Login</option>
            </select>
          </div>

          {/* Sources Filter */}
          <div>
            <label className="block mb-1.5 text-sm font-medium">All sources</label>
            <select
              className="field"
              value={selectedSources}
              onChange={(e) => setSelectedSources(e.target.value)}
            >
              <option value="All sources">All sources</option>
              <option value="Web Interface">Web Interface</option>
              <option value="Mobile App">Mobile App</option>
              <option value="API">API</option>
              <option value="System">System</option>
            </select>
          </div>

          {/* Events Filter */}
          <div>
            <label className="block mb-1.5 text-sm font-medium">All events</label>
            <select
              className="field"
              value={selectedEvents}
              onChange={(e) => setSelectedEvents(e.target.value)}
            >
              <option value="All events">All events</option>
              <option value="Course Deletion">Course Deletion</option>
              <option value="User Creation">User Creation</option>
              <option value="Failed Login Attempt">Failed Login Attempt</option>
              <option value="Attendance Update">Attendance Update</option>
              <option value="Payment Processing">Payment Processing</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search logs..."
              className="field pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground uppercase tracking-wide">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground uppercase tracking-wide">User Full Name</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground uppercase tracking-wide">Affected User</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground uppercase tracking-wide">Event Context</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground uppercase tracking-wide">Component</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground uppercase tracking-wide">Event Name</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground uppercase tracking-wide">Description</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground uppercase tracking-wide">Origin</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground uppercase tracking-wide">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                  <td className="py-3.5 px-4 text-muted-foreground font-mono">{log.time}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-medium">{log.userFullName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">{log.affectedUser}</td>
                  <td className="py-3.5 px-4">
                    <span className="badge badge-muted">{log.eventContext}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="badge badge-muted">{log.component}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.eventName}</span>
                      {log.eventName.includes('Failed') && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      {log.eventName.includes('Success') && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="text-xs text-muted-foreground line-clamp-2">{log.description}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="badge badge-muted">{log.origin}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-muted-foreground">{log.ipAddress}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No logs match your current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} of {mockLogs.length} entries
          </div>
          <div className="flex gap-2">
            <button className="btn btn-muted btn-sm" disabled>
              Previous
            </button>
            <button className="btn btn-primary btn-sm">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
