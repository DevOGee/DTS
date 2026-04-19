import { useMemo, useState } from 'react';
import { Users, TrendingUp, BookOpen, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { GROUPS, Group } from '../data/mockData';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

export function Groups() {
  const { user } = useAuth();
  const { courses, participants, groupColors } = useData();
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [toast, setToast] = useState('');

  const isAdmin = user?.role === 'System Admin';
  const canEditGroups = isAdmin;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setNewGroupName(group);
  };

  const handleSaveGroup = () => {
    if (!newGroupName.trim()) {
      showToast('Group name cannot be empty');
      return;
    }
    // Note: In a real implementation, this would update the GROUPS array
    // For now, we'll just show a success message
    showToast(`Group "${editingGroup}" updated to "${newGroupName}"`);
    setEditingGroup(null);
    setNewGroupName('');
  };

  const handleDeleteGroup = (group: Group) => {
    if (confirm(`Are you sure you want to delete Group ${group}? This will also remove all associated courses and participants.`)) {
      // Note: In a real implementation, this would remove the group and update all associated records
      showToast(`Group ${group} deleted successfully`);
    }
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      showToast('Group name cannot be empty');
      return;
    }
    // Note: In a real implementation, this would add to the GROUPS array
    showToast(`Group "${newGroupName}" added successfully`);
    setNewGroupName('');
    setShowAddGroup(false);
  };

  const groupData = useMemo(() =>
    GROUPS.map(group => {
      const gc = courses.filter(c => c.assignedGroup === group);
      const totalModules = gc.reduce((s, c) => s + c.totalModules, 0);
      const completedModules = gc.reduce((s, c) => s + c.completedModules, 0);
      const technicalCourses = gc.filter(c => c.courseType === 'Technical').length;
      const nonTechnicalCourses = gc.filter(c => c.courseType === 'Non-Technical').length;
      const completionPercentage = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;
      const participantCount = participants.filter(p => p.group === group).length;
      return { group, totalCourses: gc.length, totalModules, completedModules, technicalCourses, nonTechnicalCourses, completionPercentage, participantCount };
    }), [courses, participants]);

  const sorted = useMemo(() => [...groupData].sort((a, b) => b.completionPercentage - a.completionPercentage), [groupData]);

  return (
    <div className="space-y-6">
      {toast && <div className="toast">{toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl mb-2">Group Management</h1>
          <p className="text-muted-foreground">Track progress and performance across all digitisation groups</p>
        </div>
        {canEditGroups && (
          <div className="flex gap-2">
            <button onClick={() => setShowAddGroup(true)} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Add Group
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupData.map(({ group, totalCourses, totalModules, completedModules, technicalCourses, nonTechnicalCourses, completionPercentage, participantCount }) => (
          <div key={group} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6 text-white relative" style={{ background: `linear-gradient(135deg, ${groupColors[group] ?? '#037b90'}, ${groupColors[group] ?? '#037b90'}cc)` }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl">Group {group}</h2>
                <Users className="w-8 h-8 opacity-80" />
              </div>
              {canEditGroups && (
                <div className="absolute top-4 right-4 flex gap-1">
                  <button onClick={() => handleEditGroup(group)} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteGroup(group)} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="text-5xl mb-2">{completionPercentage}%</div>
              <div className="text-white/80">Overall Progress</div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-4 overflow-hidden">
                <div className="bg-white h-full transition-all" style={{ width: `${completionPercentage}%` }} />
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground"><BookOpen className="w-4 h-4" /><span className="text-sm">Courses</span></div>
                <div className="text-2xl">{totalCourses}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="w-4 h-4" /><span className="text-sm">Modules</span></div>
                <div className="text-xl">{completedModules}/{totalModules}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground"><Users className="w-4 h-4" /><span className="text-sm">Participants</span></div>
                <div className="text-xl">{participantCount}</div>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="text-sm text-muted-foreground mb-2">Course Mix</div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-primary/10 text-primary px-3 py-2 rounded-lg text-center">
                    <div className="text-lg">{technicalCourses}</div>
                    <div className="text-xs">Technical</div>
                  </div>
                  <div className="flex-1 bg-secondary/10 text-secondary px-3 py-2 rounded-lg text-center">
                    <div className="text-lg">{nonTechnicalCourses}</div>
                    <div className="text-xs">Non-Technical</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-xl mb-6">🏆 Group Leaderboard</h2>
        <div className="space-y-3">
          {sorted.map((item, index) => (
            <div key={item.group} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                index === 1 ? 'bg-gray-100 text-gray-600' :
                index === 2 ? 'bg-orange-100 text-orange-600' :
                'bg-muted text-muted-foreground'
              }`}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium">Group {item.group}</div>
                <div className="text-sm text-muted-foreground">{item.completedModules} of {item.totalModules} modules · {item.participantCount} participants</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${item.completionPercentage}%`, background: groupColors[item.group] ?? '#037b90' }} />
                </div>
                <div className="text-2xl font-semibold w-16 text-right">{item.completionPercentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit/Add Group Modal */}
      {(editingGroup !== null || showAddGroup) && (
        <div className="modal-backdrop" onClick={e => {
          if (e.target === e.currentTarget) {
            setEditingGroup(null);
            setShowAddGroup(false);
          }
        }}>
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">
                {editingGroup !== null ? 'Edit Group' : 'Add New Group'}
              </h2>
              <button 
                onClick={() => {
                  setEditingGroup(null);
                  setShowAddGroup(false);
                }} 
                className="btn-icon p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div>
                <label className="block mb-1.5 text-sm font-medium">Group Name</label>
                <input
                  type="text"
                  className="field"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name (e.g., D)"
                  maxLength={1}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Single character group identifier (A-Z)
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button 
                onClick={() => {
                  setEditingGroup(null);
                  setShowAddGroup(false);
                }} 
                className="btn btn-muted"
              >
                Cancel
              </button>
              <button 
                onClick={editingGroup !== null ? handleSaveGroup : handleAddGroup} 
                className="btn btn-primary"
              >
                <Save className="w-4 h-4" />
                {editingGroup !== null ? 'Save Changes' : 'Add Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
