import { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, Download, UserCheck, X, Save } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Group } from '../data/mockData';

export function Attendance() {
  const { user } = useAuth();
  const { groups, participants, attendance, workshop, toggleAttendance, markAttendanceDayPresent } = useData();
  const { success, info } = useToast();
  const [selectedDay, setSelectedDay] = useState(1);
  const [filterGroup, setFilterGroup] = useState<Group | 'all'>('all');
  const [editingNote, setEditingNote] = useState<{ pid: string; day: number } | null>(null);

  const canMark = (g: Group) => user?.role === 'System Admin' || user?.role === 'Programme Lead' || (user?.role === 'Group Leader' && user.group === g);
  const canMarkAll = user?.role === 'System Admin' || user?.role === 'Programme Lead';

  const filteredParts = useMemo(() =>
    participants.filter(p => filterGroup === 'all' || p.group === filterGroup), [participants, filterGroup]);

  const getRecord = (pid: string, day: number) => attendance.find(a => a.participantId === pid && a.day === day);

  const dayStats = useMemo(() => Array.from({ length: workshop.numberOfDays }, (_, i) => {
    const day = i + 1;
    const recs = attendance.filter(a => a.day === day);
    const present = recs.filter(a => a.status === 'Present').length;
    return { day, present, total: recs.length, pct: recs.length ? Math.round(present / recs.length * 100) : 0 };
  }), [attendance, workshop.numberOfDays]);

  const overallPct = (pid: string) => {
    const recs = attendance.filter(a => a.participantId === pid);
    return recs.length ? Math.round(recs.filter(a => a.status === 'Present').length / recs.length * 100) : 0;
  };

  const cur = dayStats[selectedDay - 1];
  const overallPresent = attendance.filter(a => a.status === 'Present').length;
  const overallTotal = attendance.length;
  const overallRate = overallTotal ? Math.round(overallPresent / overallTotal * 100) : 0;

  const exportCSV = () => {
    const days = Array.from({ length: workshop.numberOfDays }, (_, i) => `Day ${i + 1}`);
    const rows = participants.map(p => [
      p.name, `Group ${p.group}`,
      ...days.map((_, i) => attendance.find(a => a.participantId === p.id && a.day === i + 1)?.status === 'Present' ? 'P' : 'A'),
      `${overallPct(p.id)}%`,
    ]);
    const csv = [['Name', 'Group', ...days, 'Overall %'], ...rows].map(r => r.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'attendance.csv'; a.click();
    URL.revokeObjectURL(url);
    success(`Attendance exported — ${participants.length} participant(s), ${workshop.numberOfDays} day(s).`, 'Export Complete');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold mb-1">Attendance Tracking</h1>
          <p className="text-muted-foreground text-sm">Mark and monitor daily participant attendance</p>
        </div>
        <button onClick={exportCSV} className="btn btn-muted"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Rate', value: `${overallRate}%`, sub: `${overallPresent}/${overallTotal} records`, color: 'text-chart-3', bg: 'bg-chart-3/10' },
          { label: 'Day Rate', value: `${cur?.pct ?? 0}%`, sub: `Day ${selectedDay}: ${cur?.present}/${cur?.total}`, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Participants', value: participants.length, sub: `${groups.length} groups`, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'Workshop Days', value: workshop.numberOfDays, sub: 'Total days', color: 'text-chart-4', bg: 'bg-chart-4/10' },
        ].map(({ label, value, sub, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl p-5 border border-border card-hover">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <UserCheck className={`w-5 h-5 ${color}`} />
            </div>
            <div className={`stat-number ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Day picker */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-base font-semibold">Select Day</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <select className="field sm:w-36" value={filterGroup} onChange={e => setFilterGroup(e.target.value as any)}>
              <option value="all">All Groups</option>
              {groups.map(g => <option key={g} value={g}>Group {g}</option>)}
            </select>
            {canMarkAll && (
              <button onClick={() => {
                markAttendanceDayPresent(selectedDay, filterGroup);
                info(
                  `All ${filterGroup === 'all' ? '' : `Group ${filterGroup} `}participants marked Present for Day ${selectedDay}.`,
                  'Attendance Marked'
                );
              }} className="btn btn-secondary btn-sm">
                ✓ Mark All Present
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dayStats.map(({ day, pct, present, total }) => (
            <button key={day} onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl border-2 text-center transition-all min-w-[72px] ${
                selectedDay === day
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'bg-background border-border hover:border-primary/50'
              }`}>
              <div className="text-xs mb-1 font-medium">Day {day}</div>
              <div className="text-xl font-bold leading-none">{pct}%</div>
              <div className="text-[10px] mt-1 opacity-70">{present}/{total}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Attendance table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Day {selectedDay} · {cur?.present ?? 0} Present / {cur?.total ?? 0} Participants</h2>
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Name', 'Group', 'Role', `Day ${selectedDay}`, 'Overall', 'All Days'].map(h => (
                  <th key={h} className={`py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide ${h === `Day ${selectedDay}` || h === 'Overall' ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredParts.map(p => {
                const rec = getRecord(p.id, selectedDay);
                const present = rec?.status === 'Present';
                const pct = overallPct(p.id);
                const allDays = Array.from({ length: workshop.numberOfDays }, (_, i) => {
                  const r = getRecord(p.id, i + 1);
                  return r?.status === 'Present';
                });
                return (
                  <tr key={p.id} className="table-row-hover transition-colors">
                    <td className="py-3.5 px-4 font-medium">{p.name}</td>
                    <td className="py-3.5 px-4"><span className="badge badge-primary">Group {p.group}</span></td>
                    <td className="py-3.5 px-4 text-muted-foreground text-xs">{p.role}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => canMark(p.group) && toggleAttendance(p.id, selectedDay)}
                        disabled={!canMark(p.group)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          present ? 'bg-chart-3/10 text-chart-3 hover:bg-chart-3/20' : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                        } ${!canMark(p.group) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        {present ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {present ? 'Present' : 'Absent'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 75 ? 'bg-chart-3' : pct >= 50 ? 'bg-chart-4' : 'bg-destructive'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium">{pct}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-0.5">
                        {allDays.map((isP, i) => (
                          <div key={i} title={`Day ${i + 1}: ${isP ? 'Present' : 'Absent'}`}
                            className={`w-4 h-4 rounded-sm ${i + 1 === selectedDay ? 'ring-2 ring-primary' : ''} ${isP ? 'bg-chart-3' : 'bg-destructive/30'}`} />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-border">
          {filteredParts.map(p => {
            const rec = getRecord(p.id, selectedDay);
            const present = rec?.status === 'Present';
            const pct = overallPct(p.id);
            return (
              <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge badge-primary text-xs">Group {p.group}</span>
                    <span className="text-xs text-muted-foreground">{pct}% overall</span>
                  </div>
                </div>
                <button
                  onClick={() => canMark(p.group) && toggleAttendance(p.id, selectedDay)}
                  disabled={!canMark(p.group)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    present ? 'bg-chart-3/10 text-chart-3' : 'bg-destructive/10 text-destructive'
                  } disabled:opacity-50`}>
                  {present ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {present ? 'Present' : 'Absent'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
          {filteredParts.length} participants{filterGroup !== 'all' ? ` in Group ${filterGroup}` : ''}
        </div>
      </div>
    </div>
  );
}
