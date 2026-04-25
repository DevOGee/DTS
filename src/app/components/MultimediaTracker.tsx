import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Video, Plus, Edit2, Trash2, CheckCircle, XCircle, X, Save } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { VideoLog, GroupVideoStats } from '../data/multimediaData';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './ui/PaginationControls';

const EMPTY_LOG: Omit<VideoLog, 'id'> = {
  courseCode: '', module: 'Mod 1', group: 'A', title: '',
  duration: '', recorded: false, edited: false, status: 'Pending',
};

export function MultimediaTracker() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupId } = useParams();
  const { user } = useAuth();
  const { groups, videoLogs, groupVideoStats, setVideoLogs, setGroupVideoStats, renameGroup, removeGroup } = useData();
  const [editTarget, setEditTarget] = useState<VideoLog | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Omit<VideoLog, 'id'>>(EMPTY_LOG);
  const [editGroupStatsTarget, setEditGroupStatsTarget] = useState<GroupVideoStats | null>(null);
  const [groupStatsForm, setGroupStatsForm] = useState<Partial<GroupVideoStats>>({});
  const canEdit = true;
  const { success, error, warning } = useToast();

  const totalVideos = groupVideoStats.reduce((s, g) => s + g.totalVideos, 0);
  const completedVideos = groupVideoStats.reduce((s, g) => s + g.videosComplete, 0);
  const pagination = usePagination(videoLogs.length, 10);
  const paginatedVideoLogs = useMemo(
    () => videoLogs.slice(pagination.offset, pagination.offset + pagination.limit),
    [videoLogs, pagination.offset, pagination.limit]
  );

  const isLogMode = location.pathname.startsWith('/multimedia/log-video');
  const isEditGroupMode = location.pathname.startsWith('/multimedia/edit-group');
  const selectedGroup = groupId ? decodeURIComponent(groupId).replace(/^group-/, '').toUpperCase() : null;

  useEffect(() => {
    if (isEditGroupMode && selectedGroup) {
      const gs = groupVideoStats.find(s => s.group === selectedGroup);
      if (gs) {
        setEditGroupStatsTarget(gs);
        setGroupStatsForm(gs);
      }
    } else if (!isLogMode) {
      setEditGroupStatsTarget(null);
    }
  }, [isEditGroupMode, selectedGroup, groupVideoStats, isLogMode]);

  useEffect(() => {
    if (isLogMode && !editTarget) {
      setIsNew(true);
      setForm(selectedGroup ? { ...EMPTY_LOG, group: selectedGroup as any } : EMPTY_LOG);
    }
  }, [isLogMode, selectedGroup, editTarget]);

  const openNew = () => {
    setForm(selectedGroup ? { ...EMPTY_LOG, group: selectedGroup as any } : EMPTY_LOG);
    setIsNew(true);
    setEditTarget(null);
    navigate(selectedGroup ? `/multimedia/log-video/group-${selectedGroup.toLowerCase()}` : '/multimedia/log-video');
  };
  const openEdit = (v: VideoLog) => { setForm({ ...v }); setEditTarget(v); setIsNew(false); navigate('/multimedia/log-video'); };
  const closeModal = () => { setIsNew(false); setEditTarget(null); navigate('/multimedia'); };

  const handleSave = () => {
    if (!form.courseCode || !form.title) { error('Course code and title are both required.', 'Validation Error'); return; }
    const status: VideoLog['status'] = form.recorded && form.edited ? 'Complete' : form.recorded ? 'In Progress' : 'Pending';
    if (isNew) {
      setVideoLogs([...videoLogs, { ...form, status, id: `v-${Date.now()}` }]);
      success(`Video "${form.title}" for Group ${form.group} has been logged (${status}).`, 'Video Log Added');
    } else if (editTarget) {
      setVideoLogs(videoLogs.map(v => v.id === editTarget.id ? { ...form, status, id: editTarget.id } : v));
      success(`Video log "${form.title}" has been updated — Status: ${status}.`, 'Video Log Updated');
    }
    closeModal();
  };

  const openEditGroupStats = (gs: GroupVideoStats) => {
    navigate(`/multimedia/edit-group/group-${gs.group.toLowerCase()}`);
  };

  const closeGroupStatsModal = () => {
    setEditGroupStatsTarget(null);
    navigate('/multimedia');
  };

  const handleSaveGroupStats = () => {
    if (!editGroupStatsTarget) return;
    
    // Check if group name changed
    if (groupStatsForm.group && groupStatsForm.group !== editGroupStatsTarget.group) {
        renameGroup(editGroupStatsTarget.group, groupStatsForm.group);
    }

    const nextStats = { ...editGroupStatsTarget, ...groupStatsForm } as GroupVideoStats;
    let exists = false;
    const nextGroupStats = groupVideoStats.map(gs => {
      if (gs.group === editGroupStatsTarget.group) {
        exists = true;
        return nextStats;
      }
      return gs;
    });

    if (!exists) {
      nextGroupStats.push(nextStats);
    }
    
    setGroupVideoStats(nextGroupStats);
    success(`Group ${editGroupStatsTarget.group} stats updated — ${nextStats.videosComplete}/${nextStats.totalVideos} videos complete.`, 'Stats Updated');
    closeGroupStatsModal();
  };

  const handleGroupDelete = (g: string) => {
    if (confirm(`Delete group ${g}?`)) {
      removeGroup(g);
      warning(`Group ${g} has been removed from Multimedia Tracker.`, 'Group Deleted');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this video log?')) {
      setVideoLogs(videoLogs.filter(v => v.id !== id));
      warning('The video log entry has been permanently deleted.', 'Log Deleted');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl mb-2">Multimedia Tracker</h1>
          <p className="text-muted-foreground">Track video digitisation across all groups</p>
        </div>
        {canEdit && (
          <button onClick={openNew} className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-all shadow-lg inline-flex items-center gap-2">
            <Plus className="w-5 h-5" /> Log Video
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Needed', value: totalVideos, color: 'text-primary' },
          { label: 'Completed', value: completedVideos, color: 'text-chart-3' },
          { label: 'In Progress', value: videoLogs.filter(v => v.status === 'In Progress').length, color: 'text-chart-4' },
          { label: 'Logs Recorded', value: videoLogs.length, color: 'text-secondary' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card rounded-xl p-6 border border-border">
            <div className="text-sm text-muted-foreground mb-2">{label}</div>
            <div className={`text-3xl ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Group Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(g => {
          const gs = groupVideoStats.find(s => s.group === g) || { group: g, digitiser: 'Unassigned', totalVideos: 0, videosComplete: 0, completionPercentage: 0, courses: [] as string[], trackedVideos: 0 };
          return (
          <div key={gs.group} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-medium">Group {gs.group}</div>
                  {canEdit && (
                    <button onClick={() => openEditGroupStats(gs as GroupVideoStats)} className="p-1 hover:bg-black/10 rounded text-primary transition-colors" title="Edit Group">
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="text-2xl font-bold text-primary">
                  {gs.totalVideos > 0 ? Math.round((gs.videosComplete / gs.totalVideos) * 100) : 0}%
                </div>
              </div>
              <div className="text-sm text-muted-foreground mb-3">{gs.videosComplete} done / {gs.totalVideos} needed</div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-secondary h-full" style={{ width: `${gs.totalVideos > 0 ? (gs.videosComplete / gs.totalVideos) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3"><Video className="w-4 h-4 text-secondary" /><span className="font-medium">{gs.digitiser}</span></div>
              <div className="flex flex-wrap gap-1">
                {gs.courses.slice(0, 5).map((c, i) => <span key={i} className="px-2 py-1 bg-muted rounded text-xs">{c}</span>)}
                {gs.courses.length > 5 && <span className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs">+{gs.courses.length - 5}</span>}
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* Video Log Table */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-xl mb-4">Video Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Course', 'Module', 'Group', 'Title', 'Duration', 'Recorded', 'Edited', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-sm text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedVideoLogs.map(v => (
                <tr key={v.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-sm">{v.courseCode}</td>
                  <td className="py-3 px-4 text-sm">{v.module}</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-accent text-accent-foreground rounded-full text-xs">Grp {v.group}</span></td>
                  <td className="py-3 px-4 text-sm">{v.title}</td>
                  <td className="py-3 px-4 text-sm">{v.duration}</td>
                  <td className="py-3 px-4">{v.recorded ? <CheckCircle className="w-5 h-5 text-chart-3" /> : <XCircle className="w-5 h-5 text-destructive" />}</td>
                  <td className="py-3 px-4">{v.edited ? <CheckCircle className="w-5 h-5 text-chart-3" /> : <XCircle className="w-5 h-5 text-destructive" />}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${v.status === 'Complete' ? 'bg-chart-3/10 text-chart-3' : v.status === 'In Progress' ? 'bg-chart-4/10 text-chart-4' : 'bg-muted text-muted-foreground'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {canEdit && <button onClick={() => openEdit(v)} className="p-1.5 hover:bg-primary/10 rounded text-primary"><Edit2 className="w-4 h-4" /></button>}
                      {canEdit && <button onClick={() => handleDelete(v.id)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          pageSizeOptions={pagination.pageSizeOptions}
          from={pagination.from}
          to={pagination.to}
          totalItems={videoLogs.length}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      </div>

      {(isNew || editTarget || isLogMode) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="bg-card rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-border mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">{isNew ? 'Log Video' : 'Edit Video Log'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {([['Course Code', 'courseCode'], ['Module', 'module'], ['Title', 'title'], ['Duration', 'duration']] as [string, keyof typeof form][]).map(([label, key]) => (
                <div key={key} className={key === 'title' ? 'col-span-2' : ''}>
                  <label className="block mb-1 text-sm text-muted-foreground">{label}</label>
                  <input type="text" value={form[key] as string} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              ))}
              <div>
                <label className="block mb-1 text-sm text-muted-foreground">Group</label>
                <select value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value as any }))} className="w-full px-4 py-2 rounded-lg border border-border bg-background">
                  {groups.map(g => <option key={g} value={g}>Group {g}</option>)}
                </select>
              </div>
              <div className="col-span-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.recorded} onChange={e => setForm(f => ({ ...f, recorded: e.target.checked }))} className="w-5 h-5 rounded" />
                  <span className="text-sm">Recorded</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.edited} onChange={e => setForm(f => ({ ...f, edited: e.target.checked }))} className="w-5 h-5 rounded" />
                  <span className="text-sm">Edited</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeModal} className="px-6 py-2 rounded-lg bg-muted hover:bg-muted/80">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {editGroupStatsTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && closeGroupStatsModal()}>
          <div className="bg-card rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-border mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl">Edit Group {editGroupStatsTarget.group} Details</h2>
              <button onClick={closeGroupStatsModal} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm text-muted-foreground">Total Videos Needed</label>
                <input type="number" value={groupStatsForm.totalVideos || 0} onChange={e => setGroupStatsForm((f: Partial<GroupVideoStats>) => ({ ...f, totalVideos: Number(e.target.value) }))} className="w-full px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block mb-1 text-sm text-muted-foreground">Videos Completed</label>
                <input type="number" value={groupStatsForm.videosComplete || 0} onChange={e => setGroupStatsForm((f: Partial<GroupVideoStats>) => ({ ...f, videosComplete: Number(e.target.value) }))} className="w-full px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block mb-1 text-sm text-muted-foreground">Courses (comma separated)</label>
                <input type="text" value={groupStatsForm.courses?.join(', ') || ''} onChange={e => setGroupStatsForm((f: Partial<GroupVideoStats>) => ({ ...f, courses: e.target.value.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '') }))} className="w-full px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeGroupStatsModal} className="px-6 py-2 rounded-lg bg-muted hover:bg-muted/80">Cancel</button>
              <button onClick={handleSaveGroupStats} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
