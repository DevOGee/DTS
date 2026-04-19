import { useMemo } from 'react';
import { MapPin, Calendar, Clock, Users, Activity } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export function Workshops() {
  const { workshop, courses, participants } = useData();

  const stats = useMemo(() => {
    const totalModules = courses.length * 10;
    const completedModules = courses.reduce((s, c) => s + c.completedModules, 0);
    const dailyTarget = Math.ceil(totalModules / workshop.numberOfDays);
    const now = Date.now();
    const start = new Date(workshop.startDate).getTime();
    const currentDay = Math.min(Math.max(Math.floor((now - start) / 86400000) + 1, 1), workshop.numberOfDays);
    const completionPercentage = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;
    return { totalCourses: courses.length, completionPercentage, currentDay, dailyTarget, isOnTrack: completedModules >= dailyTarget * currentDay };
  }, [courses, workshop]);

  const startDate = new Date(workshop.startDate);
  const endDate = new Date(workshop.endDate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl mb-2">Workshop Management</h1>
        <p className="text-muted-foreground">Current digitisation workshop details and timeline</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mb-4">{workshop.status}</div>
              <h2 className="text-3xl mb-2">{workshop.name}</h2>
              <div className="flex items-center gap-6 text-white/90 flex-wrap">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{workshop.venue}</div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {startDate.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })} –{' '}
                  {endDate.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{workshop.numberOfDays} Days</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Participants', value: participants.length, sub: 'Across 6 groups', icon: Users, color: 'text-primary' },
              { label: 'Total Courses', value: stats.totalCourses, sub: '5 programmes', icon: Activity, color: 'text-secondary' },
              { label: 'Completion', value: `${stats.completionPercentage}%`, sub: stats.isOnTrack ? '✓ On Track' : 'Behind Schedule', icon: Activity, color: 'text-chart-3' },
              { label: 'Current Day', value: stats.currentDay, sub: `of ${workshop.numberOfDays} days`, icon: Clock, color: 'text-chart-4' },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className="bg-muted/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Icon className={`w-5 h-5 ${color}`} /></div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
                <div className="text-3xl">{value}</div>
                <div className={`text-sm mt-1 ${sub.includes('Behind') ? 'text-destructive' : color}`}>{sub}</div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-xl mb-4">Workshop Timeline</h3>
            <div className="space-y-3">
              {Array.from({ length: workshop.numberOfDays }, (_, i) => {
                const dayNum = i + 1;
                const isCurrent = dayNum === stats.currentDay;
                const isPast = dayNum < stats.currentDay;
                const dayDate = new Date(startDate);
                dayDate.setDate(startDate.getDate() + i);
                return (
                  <div key={i} className={`p-4 rounded-lg border-l-4 ${isCurrent ? 'bg-primary/10 border-primary' : isPast ? 'bg-muted/50 border-border' : 'bg-background border-border/50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${isCurrent ? 'bg-primary text-white' : isPast ? 'bg-muted text-muted-foreground' : 'bg-background border-2 border-border text-muted-foreground'}`}>
                          {dayNum}
                        </div>
                        <div>
                          <div className="font-medium">Day {dayNum}{isCurrent && <span className="ml-2 text-primary text-sm">(Today)</span>}</div>
                          <div className="text-sm text-muted-foreground">
                            {dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Daily Target</div>
                        <div className="text-xl font-semibold">{stats.dailyTarget} modules</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
