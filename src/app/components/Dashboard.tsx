import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Calendar, Users, BookOpen, Target, TrendingUp, Clock, MapPin } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { GROUPS, Group, mockProgrammes } from '../data/mockData';

export function Dashboard() {
  const { user } = useAuth();
  const { courses, participants, workshop, attendance } = useData();
  const [timeRemaining, setTimeRemaining] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | 'all'>('all');
  const [selectedProgramme, setSelectedProgramme] = useState<string>('all');

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
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: workshop.numberOfDays }, (_, i) => {
            const day = i + 1;
            const target = stats.dailyTarget * day;
            const isCurrent = day === stats.currentDay;
            const isPast = day < stats.currentDay;
            const progress = isPast || isCurrent ? Math.min(stats.completedModules, target) : 0;
            const pct = target ? Math.round((progress / target) * 100) : 0;
            return (
              <div key={i} className={`p-4 rounded-lg border ${isCurrent ? 'bg-primary/10 border-primary' : isPast ? 'bg-muted/50 border-border' : 'bg-background border-border/50'}`}>
                <div className="text-sm mb-2">Day {day}</div>
                <div className="text-2xl mb-1">{pct}%</div>
                <div className="text-xs text-muted-foreground">{progress}/{target}</div>
                {isCurrent && <div className="mt-2 text-xs text-primary">Today</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-6 border border-border col-span-1">
          <h2 className="text-lg mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Participants</h2>
          <div className="text-4xl mb-1">{participants.length}</div>
          <div className="text-sm text-muted-foreground">Across {GROUPS.length} groups</div>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border col-span-2">
          <h2 className="text-lg mb-4">Group Leaderboard</h2>
          <div className="space-y-2">
            {[...groupStats].sort((a, b) => b.completionPercentage - a.completionPercentage).slice(0, 3).map((g, i) => (
              <div key={g.group} className="flex items-center gap-3">
                <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: `${g.completionPercentage}%` }} />
                </div>
                <span className="text-sm font-medium w-16 text-right">Grp {g.group} · {g.completionPercentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
