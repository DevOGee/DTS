import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Users, TrendingUp, BookOpen, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { PaginationControls } from './ui/PaginationControls';
import { usePagination } from '../hooks/usePagination';

export function Groups() {
  const { user } = useAuth();
  const { groups, courses, participants, groupColors, addGroup, removeGroup, renameGroup } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const { success, error } = useToast();

  // URL-based state management
  const locationPath = location.pathname;
  const isAddMode = locationPath === '/groups/add-group';
  const editMatch = locationPath.match(/^\/groups\/edit\/(.+)$/);
  const isEditMode = !!editMatch;

  useEffect(() => {
    if (editMatch?.[1]) {
      const urlGroup = decodeURIComponent(editMatch[1]).toUpperCase();
      if (groups.includes(urlGroup)) {
        setEditingGroup(urlGroup);
        setNewGroupName(urlGroup);
      }
    }
  }, [editMatch, groups]);

  const openAddGroup = () => {
    setNewGroupName('');
    navigate('/groups/add-group');
  };

  const openEditGroup = (group: string) => {
    setEditingGroup(group);
    setNewGroupName(group);
    navigate(`/groups/edit/${encodeURIComponent(group.toLowerCase())}`);
  };

  const closeForm = () => {
    setEditingGroup(null);
    setNewGroupName('');
    navigate('/groups');
  };

  const handleAddGroup = () => {
    const trimmed = newGroupName.trim().toUpperCase();
    if (!trimmed) { error('Group name cannot be empty.', 'Validation Error'); return; }
    if (groups.includes(trimmed)) { error(`Group "${trimmed}" already exists.`, 'Duplicate Group'); return; }
    addGroup(trimmed);
    success(`Group "${trimmed}" has been created.`, 'Group Added');
    closeForm();
  };

  const handleSaveGroup = () => {
    const trimmed = newGroupName.trim().toUpperCase();
    if (!trimmed) { error('Group name cannot be empty.', 'Validation Error'); return; }
    if (editingGroup && trimmed !== editingGroup && groups.includes(trimmed)) {
      error(`Group "${trimmed}" already exists.`, 'Duplicate Group');
      return;
    }
    if (editingGroup) {
      renameGroup(editingGroup, trimmed);
      success(`Group "${editingGroup}" has been renamed to "${trimmed}".`, 'Group Renamed');
    }
    closeForm();
  };

  const handleDeleteGroup = (group: string) => {
    const participantCount = participants.filter(p => p.group === group).length;
    const courseCount = courses.filter(c => c.assignedGroup === group).length;
    const message = `Delete Group ${group}? This will also remove ${courseCount} course(s) and ${participantCount} participant(s) assigned to it.`;
    if (confirm(message)) {
      removeGroup(group, user?.name);
      success(`Group ${group} and its ${courseCount} course(s) / ${participantCount} participant(s) have been moved to the Recycle Bin.`, 'Group Deleted');
    }
  };

  const isAdmin = user?.role === 'System Admin';
  const canEditGroups = true;

  const groupData = useMemo(() =>
    groups.map(group => {
      const gc = courses.filter(c => c.assignedGroup === group);
      const totalModules = gc.reduce((s, c) => s + c.totalModules, 0);
      const completedModules = gc.reduce((s, c) => s + c.completedModules, 0);
      const technicalCourses = gc.filter(c => c.courseType === 'Technical').length;
      const nonTechnicalCourses = gc.filter(c => c.courseType === 'Non-Technical').length;
      const completionPercentage = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;
      const participantCount = participants.filter(p => p.group === group).length;
      return { group, totalCourses: gc.length, totalModules, completedModules, technicalCourses, nonTechnicalCourses, completionPercentage, participantCount };
    }), [groups, courses, participants]);

  const sorted = useMemo(() =>
    [...groupData].sort((a, b) => b.completionPercentage - a.completionPercentage),
    [groupData]);
  const pagination = usePagination(groupData.length, 10);
  const paginatedGroupData = useMemo(
    () => groupData.slice(pagination.offset, pagination.offset + pagination.limit),
    [groupData, pagination.offset, pagination.limit]
  );

  const modalGroupName = isEditMode && editMatch ? decodeURIComponent(editMatch[1]).toUpperCase() : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl mb-2">Group Management</h1>
          <p className="text-muted-foreground">Track progress and performance across all digitisation groups</p>
        </div>
        {canEditGroups && (
          <button onClick={openAddGroup} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Add Group
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedGroupData.map(({ group, totalCourses, totalModules, completedModules, technicalCourses, nonTechnicalCourses, completionPercentage, participantCount }) => (
          <div key={group} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6 text-white relative" style={{ background: `linear-gradient(135deg, ${groupColors[group] ?? '#037b90'}, ${groupColors[group] ?? '#037b90'}cc)` }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl">Group {group}</h2>
                <Users className="w-8 h-8 opacity-80" />
              </div>
              {canEditGroups && (
                <div className="absolute top-4 right-4 flex gap-1">
                  <button
                    onClick={() => openEditGroup(group)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="Rename group"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                    title="Delete group"
                  >
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
      <div className="bg-card rounded-xl border border-border">
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          pageSizeOptions={pagination.pageSizeOptions}
          from={pagination.from}
          to={pagination.to}
          totalItems={groupData.length}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      </div>

      {groups.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-xl">No groups yet</p>
          {canEditGroups && <p className="text-sm mt-1">Click "Add Group" to create the first group.</p>}
        </div>
      )}

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

      {/* Edit / Add Group Modal */}
      {(isAddMode || isEditMode) && (
        <div className="modal-backdrop" onClick={e => {
          if (e.target === e.currentTarget) closeForm();
        }}>
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">
                {isEditMode ? `Rename Group ${modalGroupName}` : 'Add New Group'}
              </h2>
              <button onClick={closeForm} className="btn-icon p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block mb-1.5 text-sm font-medium">Group Name</label>
              <input
                type="text"
                className="field"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value.toUpperCase())}
                placeholder="Enter group name (e.g., G)"
                maxLength={4}
                onKeyDown={e => {
                  if (e.key === 'Enter') isEditMode ? handleSaveGroup() : handleAddGroup();
                  if (e.key === 'Escape') closeForm();
                }}
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Short identifier for the group (e.g., A, B, G1)
              </p>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button onClick={closeForm} className="btn btn-muted">
                Cancel
              </button>
              <button
                onClick={isEditMode ? handleSaveGroup : handleAddGroup}
                className="btn btn-primary"
              >
                <Save className="w-4 h-4" />
                {isEditMode ? 'Save Changes' : 'Add Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
