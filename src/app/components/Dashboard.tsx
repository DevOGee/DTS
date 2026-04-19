import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Area, AreaChart } from 'recharts';
import { Calendar, Users, User, BookOpen, Target, TrendingUp, Clock, MapPin, Activity, CheckCircle, AlertCircle, Zap, FileText, X, BarChart3, PieChart as PieChartIcon, TrendingDown, Award } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { GROUPS, Group, mockProgrammes } from '../data/mockData';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, participants, workshop, attendance } = useData();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | 'all'>('all');
  const [selectedProgramme, setSelectedProgramme] = useState<string>('all');
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(workshop.endDate).getTime() - Date.now();
      if (diff <= 0) { setTimeRemaining('Workshop Completed'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${d}d ${h}h ${m}m ${s}s`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [workshop]);

  const stats = useMemo(() => {
    const totalModules = courses.length * 10;
    const completedModules = courses.reduce((s, c) => s + c.completedModules, 0);
    const dailyTarget = Math.ceil(totalModules / workshop.numberOfDays);
    const now = Date.now();
    const start = new Date(workshop.startDate).getTime();
    const currentDay = Math.min(Math.floor((now - start) / 86400000) + 1, workshop.numberOfDays);
    const expectedProgress = Math.min(dailyTarget * currentDay, totalModules);
    return {
      totalCourses: courses.length,
      totalModules,
      completedModules,
      completionPercentage: totalModules ? Math.round((completedModules / totalModules) * 100) : 0,
      dailyTarget,
      currentDay: Math.max(1, currentDay),
      expectedProgress,
      isOnTrack: completedModules >= expectedProgress,
    };
  }, [courses, workshop]);

  const groupStats = useMemo(() => GROUPS.map(group => {
    const gc = courses.filter(c => c.assignedGroup === group);
    const total = gc.length * 10;
    const completed = gc.reduce((s, c) => s + c.completedModules, 0);
    return {
      name: `Group ${group}`, group,
      totalCourses: gc.length, totalModules: total,
      completedModules: completed,
      remaining: total - completed,
      completionPercentage: total ? Math.round((completed / total) * 100) : 0,
    };
  }), [courses]);

  const filteredStats = useMemo(() => {
    if (selectedGroup !== 'all') return groupStats.find(g => g.group === selectedGroup) ?? stats;
    if (selectedProgramme !== 'all') {
      const pc = courses.filter(c => c.programmeId === selectedProgramme);
      const total = pc.length * 10;
      const completed = pc.reduce((s, c) => s + c.completedModules, 0);
      return { totalModules: total, completedModules: completed, completionPercentage: total ? Math.round((completed / total) * 100) : 0 };
    }
    return stats;
  }, [selectedGroup, selectedProgramme, groupStats, stats, courses]);

  const pieData = [
    { name: 'Completed', value: filteredStats.completedModules, color: '#037b90' },
    { name: 'Remaining', value: filteredStats.totalModules - filteredStats.completedModules, color: '#e5e7eb' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl mb-2">{workshop.name}</h1>
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
            <div className="news-ticker flex items-center gap-1.5 flex-1 max-w-md">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="news-ticker-content text-sm font-medium text-primary">📍 {workshop.venue}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-1">Time Remaining</div>
          <div className="text-2xl font-mono bg-primary/10 text-primary px-4 py-2 rounded-lg inline-flex items-center gap-2">
            <Clock className="w-5 h-5" />{timeRemaining}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Courses', value: stats.totalCourses, sub: `${mockProgrammes.length} programmes`, icon: BookOpen, color: 'text-primary' },
          { label: 'Total Modules', value: stats.totalModules, sub: `${stats.completedModules} completed`, icon: Target, color: 'text-secondary' },
          { label: 'Duration', value: `${workshop.numberOfDays} Days`, sub: `Day ${stats.currentDay} of ${workshop.numberOfDays}`, icon: Calendar, color: 'text-chart-3' },
          { label: 'Daily Target', value: stats.dailyTarget, sub: stats.isOnTrack ? '✓ On Track' : 'Behind Schedule', icon: TrendingUp, color: stats.isOnTrack ? 'text-chart-3' : 'text-destructive' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">{label}</div>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-3xl mb-1">{value}</div>
            <div className={`text-xs ${color === 'text-destructive' && !stats.isOnTrack && label === 'Daily Target' ? 'text-destructive' : 'text-muted-foreground'}`}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl">Overall Progress</h2>
            <div className="flex gap-2">
              <select value={selectedGroup} onChange={e => { setSelectedGroup(e.target.value as Group | 'all'); setSelectedProgramme('all'); }}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm">
                <option value="all">All Groups</option>
                {GROUPS.map(g => <option key={g} value={g}>Group {g}</option>)}
              </select>
              <select value={selectedProgramme} onChange={e => { setSelectedProgramme(e.target.value); setSelectedGroup('all'); }}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm">
                <option value="all">All Programmes</option>
                {mockProgrammes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-1">{filteredStats.completionPercentage}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center"><div className="text-2xl">{filteredStats.completedModules}</div><div className="text-sm text-muted-foreground">Completed</div></div>
            <div className="text-center"><div className="text-2xl">{filteredStats.totalModules - filteredStats.completedModules}</div><div className="text-sm text-muted-foreground">Remaining</div></div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-xl mb-6">Progress by Group</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={groupStats}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="completedModules" fill="#037b90" name="Completed" radius={[8, 8, 0, 0]} />
              <Bar dataKey="remaining" fill="#e5e7eb" name="Remaining" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-xl mb-6">Daily Progress Tracker</h2>
        <div className="mb-4 text-sm text-muted-foreground">
          Current Day: {stats.currentDay} of {workshop.numberOfDays} · Daily Target: {stats.dailyTarget} modules
        </div>
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: workshop.numberOfDays }, (_, i) => {
            const day = i + 1;
            const target = stats.dailyTarget * day;
            const isCurrent = day === stats.currentDay;
            const isPast = day < stats.currentDay;
            const isFuture = day > stats.currentDay;
            const progress = !isFuture ? Math.min(stats.completedModules, target) : 0;
            const pct = target ? Math.round((progress / target) * 100) : 0;
            
            return (
              <div 
                key={i} 
                className={`p-4 rounded-lg border transition-all ${
                  isCurrent 
                    ? 'bg-primary/20 border-primary shadow-md scale-105' 
                    : isPast 
                      ? 'bg-muted/50 border-border' 
                      : 'bg-background border-border/50 opacity-60'
                }`}
              >
                <div className="text-sm mb-2 font-medium">
                  Day {day}
                  {isCurrent && <span className="ml-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">TODAY</span>}
                </div>
                <div className={`text-2xl mb-1 font-bold ${isCurrent ? 'text-primary' : ''}`}>{pct}%</div>
                <div className="text-xs text-muted-foreground">{progress}/{target}</div>
                {isCurrent && (
                  <div className="mt-2 text-xs text-primary font-medium">
                    {stats.isOnTrack ? 'On Track' : 'Behind Schedule'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <h2 className="text-xl mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> 
            Participants
          </h2>
          <div className="text-5xl font-bold mb-2 text-primary">{participants.length}</div>
          <div className="text-sm text-muted-foreground">Across {GROUPS.length} groups</div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-semibold text-chart-3">{GROUPS.length}</div>
                <div className="text-xs text-muted-foreground">Active Groups</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-chart-1">{stats.completionPercentage}%</div>
                <div className="text-xs text-muted-foreground">Avg Progress</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Group Leaderboard
            </h2>
            <div className="text-sm text-muted-foreground">
              Top 3 performing groups
            </div>
          </div>
          <div className="space-y-4">
            {[...groupStats].sort((a, b) => b.completionPercentage - a.completionPercentage).slice(0, 3).map((g, i) => (
              <div key={g.group} className={`flex items-center gap-4 p-4 rounded-xl border ${
                i === 0 ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200' :
                i === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200' :
                'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'
              }`}>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md">
                  <span className="text-2xl">{i === 0 ? '' : i === 1 ? '' : ''}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">Group {g.group}</span>
                    <span className="text-sm font-medium bg-white px-3 py-1 rounded-full shadow-sm">
                      {g.completionPercentage}%
                    </span>
                  </div>
                  <div className="bg-white/50 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ease-out ${
                        i === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                        i === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        'bg-gradient-to-r from-orange-400 to-orange-500'
                      }`} 
                      style={{ width: `${g.completionPercentage}%` }} 
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{g.completedModules} modules completed</span>
                    <span>{g.remaining} remaining</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Progress Across All Groups</span>
              <span className="font-semibold text-primary">{stats.completionPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Overview Widget */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Attendance Overview
          </h2>
          <div className="text-sm text-muted-foreground">Today's attendance</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">87%</div>
            <div className="text-sm text-muted-foreground">Overall Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500">42</div>
            <div className="text-sm text-muted-foreground">Present</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500">6</div>
            <div className="text-sm text-muted-foreground">Absent</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500">48</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
        </div>
        <div className="space-y-3">
          {GROUPS.map(group => {
            const attendanceRate = Math.floor(Math.random() * 20) + 75; // Mock data
            return (
              <div key={group} className="flex items-center gap-3">
                <span className="text-sm font-medium w-16">Group {group}</span>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      attendanceRate >= 90 ? 'bg-green-500' :
                      attendanceRate >= 80 ? 'bg-blue-500' :
                      attendanceRate >= 70 ? 'bg-amber-500' :
                      'bg-red-500'
                    }`} 
                    style={{ width: `${attendanceRate}%` }} 
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">{attendanceRate}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Real-time Activity Feed
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { 
                icon: CheckCircle, 
                color: 'text-green-500', 
                message: 'Course "Database Management Systems" completed', 
                time: '2 min ago', 
                user: 'Group A',
                ipAddress: '192.168.1.105',
                minutesAgo: 2
              },
              { 
                icon: Users, 
                color: 'text-blue-500', 
                message: '3 participants marked present', 
                time: '5 min ago', 
                user: 'System',
                ipAddress: '192.168.1.100',
                minutesAgo: 5
              },
              { 
                icon: FileText, 
                color: 'text-purple-500', 
                message: 'New course "Web Development" added', 
                time: '12 min ago', 
                user: 'Admin',
                ipAddress: '192.168.1.102',
                minutesAgo: 12
              },
              { 
                icon: Zap, 
                color: 'text-amber-500', 
                message: 'Daily target achieved for Group B', 
                time: '18 min ago', 
                user: 'System',
                ipAddress: '192.168.1.101',
                minutesAgo: 18
              },
              { 
                icon: AlertCircle, 
                color: 'text-orange-500', 
                message: 'Low attendance in Group C', 
                time: '25 min ago', 
                user: 'Alert',
                ipAddress: '192.168.1.103',
                minutesAgo: 25
              },
            ].map((activity, index) => {
              const fullTime = new Date(Date.now() - activity.minutesAgo * 60 * 1000).toLocaleTimeString();
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border-l-4 border-l-primary/20">
                  <activity.icon className={`w-5 h-5 ${activity.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{activity.message}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {activity.user}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {fullTime}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono bg-background px-1.5 py-0.5 rounded">
                        <MapPin className="w-3 h-3" />
                        {activity.ipAddress}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{activity.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Quick Actions
            </h2>
            <div className="text-sm text-muted-foreground">Common tasks</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/courses')}
              className="flex flex-col items-center gap-2 p-4 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
            >
              <BookOpen className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Add Course</span>
            </button>
            <button 
              onClick={() => navigate('/attendance')}
              className="flex flex-col items-center gap-2 p-4 bg-chart-1/10 rounded-xl hover:bg-chart-1/20 transition-colors"
            >
              <Users className="w-6 h-6 text-chart-1" />
              <span className="text-sm font-medium">Mark Attendance</span>
            </button>
            <button 
              onClick={() => navigate('/reports')}
              className="flex flex-col items-center gap-2 p-4 bg-chart-2/10 rounded-xl hover:bg-chart-2/20 transition-colors"
            >
              <FileText className="w-6 h-6 text-chart-2" />
              <span className="text-sm font-medium">Generate Report</span>
            </button>
            <button 
              onClick={() => setShowAnalyticsModal(true)}
              className="flex flex-col items-center gap-2 p-4 bg-chart-3/10 rounded-xl hover:bg-chart-3/20 transition-colors"
            >
              <TrendingUp className="w-6 h-6 text-chart-3" />
              <span className="text-sm font-medium">View Analytics</span>
            </button>
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="font-medium text-amber-800">Pending Tasks</span>
            </div>
            <div className="text-sm text-amber-700">
              <ul className="space-y-1">
                <li>3 courses pending review</li>
                <li>2 attendance reports to approve</li>
                <li>5 participants awaiting verification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-7 h-7 text-primary" />
                  Comprehensive Analytics Dashboard
                </h2>
                <button 
                  onClick={() => setShowAnalyticsModal(false)}
                  className="btn-icon p-2 hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Key Metrics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Overall Progress</span>
                  </div>
                  <div className="text-3xl font-bold text-green-700">{stats.completionPercentage}%</div>
                  <div className="text-xs text-green-600 mt-1">{stats.isOnTrack ? 'On Track' : 'Behind Schedule'}</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Active Users</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-700">{participants.length}</div>
                  <div className="text-xs text-blue-600 mt-1">Across {GROUPS.length} groups</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Courses</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-700">{stats.totalCourses}</div>
                  <div className="text-xs text-purple-600 mt-1">{mockProgrammes.length} programmes</div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Top Group</span>
                  </div>
                  <div className="text-3xl font-bold text-amber-700">
                    {[...groupStats].sort((a, b) => b.completionPercentage - a.completionPercentage)[0]?.group || '-'}
                  </div>
                  <div className="text-xs text-amber-600 mt-1">
                    {[...groupStats].sort((a, b) => b.completionPercentage - a.completionPercentage)[0]?.completionPercentage || 0}%
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Progress Trend Chart */}
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Progress Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={Array.from({ length: 7 }, (_, i) => ({
                      day: `Day ${i + 1}`,
                      progress: Math.min(100, (i + 1) * 15 + Math.random() * 10)
                    }))}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="progress" stroke="#037b90" fill="#037b90" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Group Performance Comparison */}
                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Group Performance
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={groupStats}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completionPercentage" fill="#037b90" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Programme Distribution */}
              <div className="bg-card p-6 rounded-xl border border-border mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-primary" />
                  Programme Distribution
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={mockProgrammes.map(p => ({
                          name: p.name.split(' in ')[0] || p.name.split(' of ')[0] || p.name,
                          value: courses.filter(c => c.programmeId === p.id).length
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockProgrammes.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#037b90', '#ff7f50', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 6]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {mockProgrammes.slice(0, 5).map((programme, index) => (
                      <div key={programme.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm font-medium">{programme.name.split(' in ')[0] || programme.name.split(' of ')[0]}</span>
                        <span className="text-sm text-muted-foreground">
                          {courses.filter(c => c.programmeId === programme.id).length} courses
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Insights */}
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Performance Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Strengths</span>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>High overall completion rate</li>
                      <li>Consistent daily progress</li>
                      <li>Strong group collaboration</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <span className="font-medium text-amber-800">Areas for Improvement</span>
                    </div>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>Some groups lagging behind</li>
                      <li>Attendance variability</li>
                      <li>Course completion gaps</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Recommendations</span>
                    </div>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>Focus on underperforming groups</li>
                      <li>Increase attendance monitoring</li>
                      <li>Provide additional support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
