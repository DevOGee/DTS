import { useState, useMemo } from 'react';
import { Search, Edit, Trash2, Plus, ExternalLink, X, Save, BookOpen, Target, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { GROUPS, Group, mockProgrammes, Course } from '../data/mockData';

const EMPTY: Omit<Course, 'id'> = {
  code: '', name: '', programmeId: mockProgrammes[0]?.id ?? '', level: '',
  courseType: 'Technical', assignedGroup: 'A', completedModules: 0, totalModules: 10,
  sourceDocLink: '', lmsLink: '',
};

export function Courses() {
  const { user } = useAuth();
  const { courses, addCourse, updateCourse, removeCourse } = useData();
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState<Group | 'all'>('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'Technical' | 'Non-Technical'>('all');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; data: Course | null } | null>(null);
  const [form, setForm] = useState<Omit<Course, 'id'>>(EMPTY);
  const [toast, setToast] = useState('');

  const canEdit = user?.role !== 'Viewer';
  const canDelete = user?.role === 'System Admin';

  const levels = useMemo(() => Array.from(new Set(courses.map(c => c.level))).filter(Boolean), [courses]);

  const filtered = useMemo(() => courses.filter(c => {
    const s = search.toLowerCase();
    return (c.name.toLowerCase().includes(s) || c.code.toLowerCase().includes(s)) &&
      (filterGroup === 'all' || c.assignedGroup === filterGroup) &&
      (filterLevel === 'all' || c.level === filterLevel) &&
      (filterType === 'all' || c.courseType === filterType);
  }), [courses, search, filterGroup, filterLevel, filterType]);

  const totalModules = courses.reduce((s, c) => s + c.totalModules, 0);
  const completedModules = courses.reduce((s, c) => s + c.completedModules, 0);
  const completionPct = totalModules ? Math.round(completedModules / totalModules * 100) : 0;
  const techCount = courses.filter(c => c.courseType === 'Technical').length;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openAdd = () => { setForm(EMPTY); setModal({ mode: 'add', data: null }); };
  const openEdit = (c: Course) => { setForm({ ...c }); setModal({ mode: 'edit', data: c }); };
  const closeModal = () => setModal(null);

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) { showToast('⚠️ Course code and name are required.'); return; }
    if (modal?.mode === 'add') {
      addCourse({ ...form, id: `c-${Date.now()}` });
      showToast('✅ Course added successfully.');
    } else if (modal?.data) {
      updateCourse({ ...form, id: modal.data.id });
      showToast('✅ Course updated successfully.');
    }
    closeModal();
  };

  const handleDelete = (c: Course) => {
    if (confirm(`Delete "${c.name}"?`)) { removeCourse(c.id); showToast('🗑️ Course deleted.'); }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <div className="toast">{toast}</div>}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold mb-1">Course Management</h1>
          <p className="text-muted-foreground text-sm">Track digitisation progress across all programmes</p>
        </div>
        {canEdit && (
          <button onClick={openAdd} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add Course
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'Total Courses', value: courses.length, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Target, label: 'Total Modules', value: totalModules, color: 'text-secondary', bg: 'bg-secondary/10' },
          { icon: TrendingUp, label: 'Technical', value: techCount, color: 'text-chart-5', bg: 'bg-chart-5/10' },
          { icon: CheckCircle2, label: 'Completion', value: `${completionPct}%`, color: 'text-chart-3', bg: 'bg-chart-3/10' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl p-5 border border-border card-hover">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="stat-number">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Overall Module Completion</span>
          <span className="text-sm font-semibold text-primary">{completedModules}/{totalModules}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div className="progress-bar" style={{ width: `${completionPct}%` }} />
        </div>
      </div>

      {/* Table card */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input className="field pl-9" placeholder="Search by code or name…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="field sm:w-36" value={filterGroup} onChange={e => setFilterGroup(e.target.value as any)}>
              <option value="all">All Groups</option>
              {GROUPS.map(g => <option key={g} value={g}>Group {g}</option>)}
            </select>
            <select className="field sm:w-36" value={filterType} onChange={e => setFilterType(e.target.value as any)}>
              <option value="all">All Types</option>
              <option value="Technical">Technical</option>
              <option value="Non-Technical">Non-Technical</option>
            </select>
            <select className="field sm:w-36" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
              <option value="all">All Levels</option>
              {levels.map(l => <option key={l} value={l}>Level {l}</option>)}
            </select>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Code', 'Course Name', 'Level', 'Type', 'Group', 'Progress', 'Links', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(course => {
                const prog = mockProgrammes.find(p => p.id === course.programmeId);
                const pct = Math.round(course.completedModules / course.totalModules * 100);
                return (
                  <tr key={course.id} className="table-row-hover transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-primary">{course.code}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium">{course.name}</div>
                      <div className="text-xs text-muted-foreground">{prog?.name}</div>
                    </td>
                    <td className="py-3.5 px-4"><span className="badge badge-muted">L{course.level}</span></td>
                    <td className="py-3.5 px-4">
                      <span className={course.courseType === 'Technical' ? 'badge badge-primary' : 'badge badge-muted'}>
                        {course.courseType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4"><span className="badge badge-primary">Grp {course.assignedGroup}</span></td>
                    <td className="py-3.5 px-4 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div className="progress-bar" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium w-16 text-right">{course.completedModules}/{course.totalModules}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-2">
                        {course.sourceDocLink && <a href={course.sourceDocLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-70" title="Source Doc"><ExternalLink className="w-4 h-4" /></a>}
                        {course.lmsLink && <a href={course.lmsLink} target="_blank" rel="noopener noreferrer" className="text-secondary hover:opacity-70" title="LMS"><ExternalLink className="w-4 h-4" /></a>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1">
                        {canEdit && <button onClick={() => openEdit(course)} className="btn-icon btn-icon-primary"><Edit className="w-4 h-4" /></button>}
                        {canDelete && <button onClick={() => handleDelete(course)} className="btn-icon btn-icon-danger"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">No courses match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border">
          {filtered.map(course => {
            const pct = Math.round(course.completedModules / course.totalModules * 100);
            return (
              <div key={course.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{course.name}</div>
                    <div className="text-xs font-mono text-primary mt-0.5">{course.code}</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {canEdit && <button onClick={() => openEdit(course)} className="btn-icon btn-icon-primary"><Edit className="w-4 h-4" /></button>}
                    {canDelete && <button onClick={() => handleDelete(course)} className="btn-icon btn-icon-danger"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="badge badge-primary">Grp {course.assignedGroup}</span>
                  <span className={course.courseType === 'Technical' ? 'badge badge-primary' : 'badge badge-muted'}>{course.courseType}</span>
                  <span className="badge badge-muted">L{course.level}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span>Progress</span><span>{course.completedModules}/{course.totalModules} ({pct}%)</span></div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden"><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="py-10 text-center text-muted-foreground text-sm">No courses match your filters.</div>}
        </div>

        <div className="px-5 py-3 border-t border-border flex justify-between text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {courses.length} courses</span>
          <span>{completedModules} modules complete</span>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box max-w-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">{modal.mode === 'add' ? 'Add Course' : 'Edit Course'}</h2>
              <button onClick={closeModal} className="btn-icon p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium">Course Code *</label>
                <input className="field" value={form.code} onChange={set('code')} placeholder="e.g. HCT 100" />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium">Level</label>
                <input className="field" value={form.level} onChange={set('level')} placeholder="e.g. 100" />
              </div>
              <div className="sm:col-span-2">
                <label className="block mb-1.5 text-sm font-medium">Course Name *</label>
                <input className="field" value={form.name} onChange={set('name')} placeholder="Full course name" />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium">Programme</label>
                <select className="field" value={form.programmeId} onChange={set('programmeId')}>
                  {mockProgrammes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium">Type</label>
                <select className="field" value={form.courseType} onChange={set('courseType')}>
                  <option value="Technical">Technical</option>
                  <option value="Non-Technical">Non-Technical</option>
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium">Assigned Group</label>
                <select className="field" value={form.assignedGroup} onChange={set('assignedGroup')}>
                  {GROUPS.map(g => <option key={g} value={g}>Group {g}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium">Completed Modules (0–10)</label>
                <input type="number" className="field" min={0} max={10} value={form.completedModules}
                  onChange={e => setForm(f => ({ ...f, completedModules: Math.min(10, Math.max(0, Number(e.target.value))) }))} />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium">Source Doc Link</label>
                <input className="field" value={form.sourceDocLink} onChange={set('sourceDocLink')} placeholder="https://…" />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium">LMS Link</label>
                <input className="field" value={form.lmsLink} onChange={set('lmsLink')} placeholder="https://…" />
              </div>
              {/* Progress preview */}
              <div className="sm:col-span-2 bg-primary/5 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress preview</span>
                  <span className="font-semibold text-primary">{form.completedModules}/10 modules · {form.completedModules * 10}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden"><div className="progress-bar" style={{ width: `${form.completedModules * 10}%` }} /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button onClick={closeModal} className="btn btn-muted">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary"><Save className="w-4 h-4" /> Save Course</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
