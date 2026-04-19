import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BookOpen, CheckCircle2, DollarSign, Calendar, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GROUPS, GROUP_COLORS, calculateDSA } from '../data/mockData';
import { useData } from '../contexts/DataContext';

const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

export function Reports() {
  const { user } = useAuth();
  const { participants, attendance, paymentSchedules, workshop, courses, programmes } = useData();

  const totalCourses = courses.length;
  const totalParticipants = participants.length;
  const totalModules = courses.reduce((sum, course) => sum + course.totalModules, 0);
  const completedModules = courses.reduce((sum, course) => sum + course.completedModules, 0);
  const completionPercentage = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;

  const paymentTotals = useMemo(() => {
    const total = paymentSchedules.reduce((sum, schedule) => sum + schedule.amount, 0);
    const processed = paymentSchedules
      .filter((schedule) => schedule.status === 'Processed' || schedule.status === 'Paid')
      .reduce((sum, schedule) => sum + schedule.amount, 0);
    const pending = paymentSchedules
      .filter((schedule) => schedule.status === 'Pending')
      .reduce((sum, schedule) => sum + schedule.amount, 0);
    return { total, processed, pending };
  }, [paymentSchedules]);

  const attendanceTotals = useMemo(() => {
    const present = attendance.filter((record) => record.status === 'Present').length;
    const absent = attendance.filter((record) => record.status === 'Absent').length;
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
      const presentCount = attendance.filter((record) => record.day === day && record.status === 'Present').length;
      const absentCount = attendance.filter((record) => record.day === day && record.status === 'Absent').length;
      return {
        day: `Day ${day}`,
        Present: presentCount,
        Absent: absentCount,
      };
    });
  }, [attendance, workshop.numberOfDays]);

  const groupProgress = useMemo(() => {
    return GROUPS.map((group) => {
      const groupCourses = courses.filter((course) => course.assignedGroup === group);
      const total = groupCourses.length;
      const completed = groupCourses.reduce((sum, course) => sum + course.completedModules, 0);
      const totalModules = groupCourses.reduce((sum, course) => sum + course.totalModules, 0);
      return {
        group,
        completion: totalModules ? Math.round((completed / totalModules) * 100) : 0,
        courses: total,
        modules: totalModules,
      };
    });
  }, [courses]);

  const programmeDetails = useMemo(() => {
    return programmes.map((programme) => {
      const programmeCourses = courses.filter((course) => course.programmeId === programme.id);
      const total = programmeCourses.length;
      const completed = programmeCourses.reduce((sum, course) => sum + course.completedModules, 0);
      const totalModules = programmeCourses.reduce((sum, course) => sum + course.totalModules, 0);
      return {
        id: programme.id,
        name: programme.name,
        awardType: programme.awardType,
        currentLevel: programme.currentLevel,
        courses: total,
        completion: totalModules ? Math.round((completed / totalModules) * 100) : 0,
      };
    });
  }, [programmes, courses]);

  const topGroupsByAttendance = useMemo(() => {
    return GROUPS.map((group) => {
      const participantsInGroup = participants.filter((participant) => participant.group === group);
      const totalRecords = attendance.filter((record) => participantsInGroup.some((participant) => participant.id === record.participantId)).length;
      const presentRecords = attendance.filter(
        (record) => record.status === 'Present' && participantsInGroup.some((participant) => participant.id === record.participantId)
      ).length;
      return {
        group,
        attendanceRate: totalRecords ? Math.round((presentRecords / totalRecords) * 100) : 0,
      };
    })
      .sort((a, b) => b.attendanceRate - a.attendanceRate);
  }, [attendance, participants]);

  const dsaByType = useMemo(() => {
    const types = ['In-County', 'Out-County'] as const;
    return types.map((type) => {
      const participantSubset = participants.filter((participant) => participant.dsaType === type);
      const total = participantSubset.reduce((sum, participant) => sum + calculateDSA(participant), 0);
      return {
        type,
        count: participantSubset.length,
        amount: total,
      };
    });
  }, [participants]);

  return (
    <div className="space-y-6">
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
          <div className="text-sm text-muted-foreground">Active courses in the workshop</div>
        </div>
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-5 h-5 text-chart-3" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Attendance Overview</h2>
              <p className="text-sm text-muted-foreground">Daily participation across the event.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Group Progress</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groupProgress.map((group) => (
              <div key={group.group} className="rounded-2xl border border-border p-4 bg-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold">Group {group.group}</div>
                    <div className="text-sm text-muted-foreground">{group.courses} courses</div>
                  </div>
                  <span className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: GROUP_COLORS[group.group] }}>
                    {group.completion}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-background overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${group.completion}%`, background: GROUP_COLORS[group.group] }} />
                </div>
                <div className="mt-3 text-sm text-muted-foreground">{group.modules} modules total</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-5 h-5 text-secondary" />
            <h2 className="text-xl font-semibold">Top Attendance Groups</h2>
          </div>
          <div className="space-y-3">
            {topGroupsByAttendance.slice(0, 4).map((group) => (
              <div key={group.group} className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
                <div>
                  <div className="font-medium">Group {group.group}</div>
                  <div className="text-sm text-muted-foreground">Attendance rate</div>
                </div>
                <div className="text-lg font-semibold">{group.attendanceRate}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Programme Performance</h2>
            <p className="text-sm text-muted-foreground">Completion rates and active course coverage by programme.</p>
          </div>
          <div className="text-sm text-muted-foreground">{programmes.length} programmes tracked</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm text-muted-foreground">Programme</th>
                <th className="text-left py-3 px-4 text-sm text-muted-foreground">Award Type</th>
                <th className="text-left py-3 px-4 text-sm text-muted-foreground">Courses</th>
                <th className="text-left py-3 px-4 text-sm text-muted-foreground">Completion</th>
              </tr>
            </thead>
            <tbody>
              {programmeDetails.map((programme) => (
                <tr key={programme.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4 font-medium">{programme.name}</td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{programme.awardType}</td>
                  <td className="py-4 px-4">{programme.courses}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{programme.completion}%</div>
                      <div className="h-2 flex-1 rounded-full bg-background overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${programme.completion}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
