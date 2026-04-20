import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Settings, Users, DollarSign, Calendar, Database, Shield, LogIn, Save, Palette, Plus, Edit, Trash2, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Role, User, Group } from '../data/mockData';
import { usePagination } from '../hooks/usePagination';
import { PaginationControls } from './ui/PaginationControls';

const PERMISSIONS = [
  // Dashboard & Overview
  { id: 'view_dashboard', label: 'View Dashboard', category: 'Dashboard' },
  { id: 'view_reports', label: 'View Reports', category: 'Dashboard' },
  { id: 'view_analytics', label: 'View Analytics', category: 'Dashboard' },
  
  // Workshop Management
  { id: 'view_workshops', label: 'View Workshops', category: 'Workshops' },
  { id: 'create_workshops', label: 'Create/Edit Workshops', category: 'Workshops' },
  { id: 'delete_workshops', label: 'Delete Workshops', category: 'Workshops' },
  { id: 'workshop_bulk_operations', label: 'Bulk Workshop Operations', category: 'Workshops' },
  
  // Course Management
  { id: 'view_courses', label: 'View Courses', category: 'Courses' },
  { id: 'edit_courses', label: 'Edit/Add Courses', category: 'Courses' },
  { id: 'delete_courses', label: 'Delete Courses', category: 'Courses' },
  { id: 'course_bulk_upload', label: 'Bulk Upload Courses', category: 'Courses' },
  { id: 'course_csv_export', label: 'Export Courses (CSV)', category: 'Courses' },
  
  // Participant Management
  { id: 'view_participants', label: 'View Participants', category: 'Participants' },
  { id: 'edit_participants', label: 'Edit Participants', category: 'Participants' },
  { id: 'delete_participants', label: 'Delete Participants', category: 'Participants' },
  { id: 'participant_bulk_upload', label: 'Bulk Upload Participants', category: 'Participants' },
  { id: 'participant_csv_export', label: 'Export Participants (CSV)', category: 'Participants' },
  
  // Group Management
  { id: 'view_groups', label: 'View Groups', category: 'Groups' },
  { id: 'edit_groups', label: 'Edit Groups', category: 'Groups' },
  { id: 'create_groups', label: 'Create Groups', category: 'Groups' },
  { id: 'delete_groups', label: 'Delete Groups', category: 'Groups' },
  
  // Attendance Management
  { id: 'view_attendance', label: 'View Attendance', category: 'Attendance' },
  { id: 'mark_attendance', label: 'Mark Attendance', category: 'Attendance' },
  { id: 'attendance_bulk_upload', label: 'Bulk Upload Attendance', category: 'Attendance' },
  { id: 'attendance_csv_export', label: 'Export Attendance (CSV)', category: 'Attendance' },
  
  // Payment Management
  { id: 'view_payments', label: 'View DSA Payments', category: 'Payments' },
  { id: 'edit_payments', label: 'Edit Payment Schedule', category: 'Payments' },
  { id: 'approve_payments', label: 'Approve Payments', category: 'Payments' },
  { id: 'payment_bulk_upload', label: 'Bulk Upload Payments', category: 'Payments' },
  { id: 'payment_csv_export', label: 'Export Payments (CSV)', category: 'Payments' },
  
  // Recycle Bin & Data Management
  { id: 'view_recycle_bin', label: 'View Recycle Bin', category: 'Data Management' },
  { id: 'restore_deleted', label: 'Restore Deleted Items', category: 'Data Management' },
  { id: 'permanent_delete', label: 'Permanent Delete', category: 'Data Management' },
  { id: 'data_export', label: 'Export All Data', category: 'Data Management' },
  { id: 'data_import', label: 'Import Data', category: 'Data Management' },
  
  // Multimedia & Content
  { id: 'view_multimedia', label: 'View Multimedia', category: 'Content' },
  { id: 'edit_multimedia', label: 'Add/Edit Videos', category: 'Content' },
  { id: 'upload_content', label: 'Upload Content', category: 'Content' },
  { id: 'manage_content', label: 'Manage Content Library', category: 'Content' },
  
  // System Administration
  { id: 'view_checklist', label: 'View Phase Checklist', category: 'System' },
  { id: 'manage_checklist', label: 'Manage Checklist', category: 'System' },
  { id: 'view_logs', label: 'View System Logs', category: 'System' },
  { id: 'manage_logging', label: 'Manage Logging Settings', category: 'System' },
  { id: 'system_backup', label: 'System Backup', category: 'System' },
  
  // User & Role Management
  { id: 'view_users', label: 'View Users', category: 'User Management' },
  { id: 'create_users', label: 'Create Users', category: 'User Management' },
  { id: 'edit_users', label: 'Edit Users', category: 'User Management' },
  { id: 'delete_users', label: 'Delete Users', category: 'User Management' },
  { id: 'role_management', label: 'Role Management', category: 'User Management' },
  { id: 'permission_management', label: 'Permission Management', category: 'User Management' },
  
  // Feedback & Communication
  { id: 'view_feedback', label: 'View Feedback', category: 'Communication' },
  { id: 'manage_feedback', label: 'Manage Feedback', category: 'Communication' },
  { id: 'send_notifications', label: 'Send Notifications', category: 'Communication' },
  
  // Settings & Configuration
  { id: 'admin_settings', label: 'Admin Settings', category: 'Settings' },
  { id: 'system_settings', label: 'System Settings', category: 'Settings' },
  { id: 'feature_toggles', label: 'Feature Toggles', category: 'Settings' },
];

const ROLES: Role[] = ['System Admin', 'Programme Lead', 'Group Leader', 'Viewer/Digitiser'];
const GROUP_LIST = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

export function AdminSettings() {
  const { user: currentUser } = useAuth();
  const { users, workshop, setWorkshop, permissions, setPermissions, baseDailyRate, dsaRates, setDSAConfig, groupColors, setGroupColor, exportState, resetState } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  // URL-based tab management
  const locationPath = location.pathname;
  const getActiveTabFromPath = (): 'general' | 'users' | 'permissions' | 'dsa' | 'data' | 'features' | 'system' => {
    if (locationPath.includes('/settings/general/user-mgt')) return 'users';
    if (locationPath.includes('/settings/general/permissions')) return 'permissions';
    if (locationPath.includes('/settings/general/dsa-rates')) return 'dsa';
    if (locationPath.includes('/settings/general/data-mgt')) return 'data';
    if (locationPath.includes('/settings/general/features')) return 'features';
    if (locationPath.includes('/settings/general/system')) return 'system';
    if (locationPath.includes('/settings/general')) return 'general';
    return 'general';
  };

  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'permissions' | 'dsa' | 'data' | 'features' | 'system'>(getActiveTabFromPath());
  const [toast, setToast] = useState('');
  const [loginAsUser, setLoginAsUser] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);

  // Update URL when tab changes
  useEffect(() => {
    const tabPathMap = {
      general: '/settings/general',
      users: '/settings/general/user-mgt',
      permissions: '/settings/general/permissions',
      dsa: '/settings/general/dsa-rates',
      data: '/settings/general/data-mgt',
      features: '/settings/general/features',
      system: '/settings/general/system'
    };
    
    const currentPath = tabPathMap[activeTab];
    if (locationPath !== currentPath) {
      navigate(currentPath, { replace: true });
    }
  }, [activeTab, navigate, locationPath]);

  // Update tab when URL changes
  useEffect(() => {
    const newTab = getActiveTabFromPath();
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [locationPath, activeTab]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    username: '',
    email: '',
    role: 'Viewer/Digitiser' as Role,
    group: 'A' as Group,
    password: ''
  });

  // Local form states
  const [wForm, setWForm] = useState({ startDate: new Date(workshop.startDate).toISOString().split('T')[0], numberOfDays: String(workshop.numberOfDays), venue: workshop.venue });
  const [dsaForm, setDsaForm] = useState({ base: String(baseDailyRate), inCounty: String(dsaRates['In-County'] * 100), outCounty: String(dsaRates['Out-County'] * 100) });
  const [localPerms, setLocalPerms] = useState(permissions);
  const userPagination = usePagination(users.length, 10);
  const paginatedUsers = useMemo(
    () => users.slice(userPagination.offset, userPagination.offset + userPagination.limit),
    [users, userPagination.offset, userPagination.limit]
  );

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // User management functions
  const handleCreateUser = () => {
    if (!userForm.name || !userForm.username || !userForm.email || !userForm.password) {
      showToast('Please fill in all required fields');
      return;
    }

    // Check if email already exists
    if (users.some(u => u.email === userForm.email)) {
      showToast('A user with this email already exists');
      return;
    }

    // Check if username already exists
    if (users.some(u => u.username === userForm.username)) {
      showToast('A user with this username already exists');
      return;
    }

    // In a real implementation, this would save to the data context
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userForm.name,
      username: userForm.username,
      email: userForm.email,
      password: userForm.password,
      role: userForm.role,
      group: userForm.role === 'Group Leader' ? userForm.group : undefined
    };

    showToast(`User "${newUser.name}" created successfully`);
    setShowCreateUser(false);
    setUserForm({
      name: '',
      username: '',
      email: '',
      role: 'Viewer/Digitiser',
      group: 'A',
      password: ''
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      group: user.group || 'A',
      password: ''
    });
    setShowCreateUser(true);
  };

  const handleUpdateUser = () => {
    if (!userForm.name || !userForm.username || !userForm.email) {
      showToast('Please fill in all required fields');
      return;
    }

    // In a real implementation, this would update the user in the data context
    showToast(`User "${userForm.name}" updated successfully`);
    setShowCreateUser(false);
    setEditingUser(null);
    setUserForm({
      name: '',
      username: '',
      email: '',
      role: 'Viewer/Digitiser',
      group: 'A',
      password: ''
    });
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser?.id) {
      showToast('You cannot delete your own account');
      return;
    }

    if (confirm(`Are you sure you want to delete "${user.name}"? This action cannot be undone.`)) {
      // In a real implementation, this would remove the user from the data context
      showToast(`User "${user.name}" deleted successfully`);
    }
  };

  const resetUserForm = () => {
    setUserForm({
      name: '',
      username: '',
      email: '',
      role: 'Viewer/Digitiser',
      group: 'A',
      password: ''
    });
    setEditingUser(null);
    setShowCreateUser(false);
  };

  const saveWorkshop = () => {
    const start = new Date(wForm.startDate);
    const days = parseInt(wForm.numberOfDays) || 7;
    const end = new Date(start); end.setDate(end.getDate() + days - 1);
    setWorkshop({ ...workshop, startDate: start, endDate: end, numberOfDays: days, venue: wForm.venue });
    showToast('✅ Workshop configuration saved.');
  };

  const saveDSA = () => {
    const base = Number(dsaForm.base);
    const inC = Number(dsaForm.inCounty) / 100;
    const outC = Number(dsaForm.outCounty) / 100;
    setDSAConfig(base, { 'In-County': inC, 'Out-County': outC });
    showToast('✅ DSA rates saved.');
  };

  const savePermissions = () => { setPermissions(localPerms); showToast('✅ Permissions saved.'); };

  const togglePerm = (role: Role, permId: string) => {
    if (role === 'System Admin') return;
    setLocalPerms(prev => ({ ...prev, [role]: { ...prev[role], [permId]: !prev[role]?.[permId] } }));
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'users' as const, label: 'User Management', icon: Users },
    { id: 'permissions' as const, label: 'Permissions', icon: Shield },
    { id: 'dsa' as const, label: 'DSA Rates', icon: DollarSign },
    { id: 'data' as const, label: 'Data Management', icon: Database },
    { id: 'features' as const, label: 'Features', icon: Settings },
    { id: 'system' as const, label: 'System', icon: Database },
  ];

  const endDate = (() => {
    const d = new Date(wForm.startDate);
    d.setDate(d.getDate() + (parseInt(wForm.numberOfDays) || 7) - 1);
    return d.toISOString().split('T')[0];
  })();

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-6 right-6 z-50 bg-card border border-border shadow-xl rounded-xl px-6 py-4 text-sm font-medium">{toast}</div>}

      <div>
        <h1 className="text-4xl mb-2">Admin Settings</h1>
        <p className="text-muted-foreground">Configure system settings and permissions</p>
      </div>

      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const tabPathMap = {
            general: '/settings/general',
            users: '/settings/general/user-mgt',
            permissions: '/settings/general/permissions',
            dsa: '/settings/general/dsa-rates',
            data: '/settings/general/data-mgt',
            features: '/settings/general/features',
            system: '/settings/general/system'
          };
          
          return (
            <button 
              key={id} 
              onClick={() => navigate(tabPathMap[id])}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          );
        })}
      </div>

      {/* General */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-6"><Calendar className="w-6 h-6 text-primary" /><h2 className="text-xl">Workshop Configuration</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm">Start Date</label>
                <input type="date" value={wForm.startDate} onChange={e => setWForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block mb-2 text-sm">Number of Days</label>
                <input type="number" value={wForm.numberOfDays} min={1} max={30} onChange={e => setWForm(f => ({ ...f, numberOfDays: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block mb-2 text-sm">End Date (Auto-calculated)</label>
                <input type="date" value={endDate} disabled className="w-full px-4 py-2 rounded-lg bg-muted border border-border" />
              </div>
              <div>
                <label className="block mb-2 text-sm">Venue</label>
                <input type="text" value={wForm.venue} onChange={e => setWForm(f => ({ ...f, venue: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <button onClick={saveWorkshop} className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Workshop Config
            </button>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-6"><Palette className="w-6 h-6 text-secondary" /><h2 className="text-xl">Group Colors</h2></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GROUP_LIST.map(g => (
                <div key={g} className="flex items-center gap-3">
                  <input type="color" value={groupColors[g]} onChange={e => setGroupColor(g, e.target.value)} className="w-12 h-12 rounded cursor-pointer border border-border" />
                  <div>
                    <div className="font-medium">Group {g}</div>
                    <div className="text-xs text-muted-foreground">{groupColors[g]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-6"><LogIn className="w-6 h-6 text-primary" /><h2 className="text-xl">Login As (Dev Mode)</h2></div>
            <div className="flex gap-4">
              <select value={loginAsUser} onChange={e => setLoginAsUser(e.target.value)} className="flex-1 px-4 py-2 rounded-lg bg-input-background border border-border">
                <option value="">Select a user...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} – {u.role}</option>)}
              </select>
              <button onClick={() => { if (loginAsUser) { const u = users.find(x => x.id === loginAsUser); showToast(`🔐 Switched to ${u?.name} (${u?.role})`); } }}
                disabled={!loginAsUser} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50">
                Login As
              </button>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl">System Users</h2>
              <button onClick={() => setShowCreateUser(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add User
              </button>
            </div>
            <div className="space-y-3">
              {paginatedUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50">
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-sm text-muted-foreground">{u.email}</div>
                    <div className="text-xs text-muted-foreground">@{u.username}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{u.role}</span>
                    {u.group && <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm">Group {u.group}</span>}
                    {u.id === currentUser?.id && <span className="text-xs text-chart-3">? You</span>}
                    <div className="flex gap-1">
                      <button onClick={() => handleEditUser(u)} className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                        <Edit className="w-3 h-3" />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button onClick={() => handleDeleteUser(u)} className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <PaginationControls
              currentPage={userPagination.currentPage}
              totalPages={userPagination.totalPages}
              pageSize={userPagination.pageSize}
              pageSizeOptions={userPagination.pageSizeOptions}
              from={userPagination.from}
              to={userPagination.to}
              totalItems={users.length}
              onPageChange={userPagination.setPage}
              onPageSizeChange={userPagination.setPageSize}
            />
          </div>

          {/* User Creation/Edit Modal */}
          {showCreateUser && (
            <div className="modal-backdrop" onClick={e => {
              if (e.target === e.currentTarget) {
                resetUserForm();
              }
            }}>
              <div className="modal-box max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-xl font-semibold">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h2>
                  <button onClick={resetUserForm} className="btn-icon p-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1.5 text-sm font-medium">Full Name *</label>
                      <input
                        type="text"
                        className="field"
                        value={userForm.name}
                        onChange={e => setUserForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-sm font-medium">Username *</label>
                      <input
                        type="text"
                        className="field"
                        value={userForm.username}
                        onChange={e => setUserForm(f => ({ ...f, username: e.target.value }))}
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-sm font-medium">Email *</label>
                      <input
                        type="email"
                        className="field"
                        value={userForm.email}
                        onChange={e => setUserForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-sm font-medium">Password *</label>
                      <input
                        type="password"
                        className="field"
                        value={userForm.password}
                        onChange={e => setUserForm(f => ({ ...f, password: e.target.value }))}
                        placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                      />
                    </div>
                    <div>
                      <label className="block mb-1.5 text-sm font-medium">Role *</label>
                      <select 
                        className="field" 
                        value={userForm.role}
                        onChange={e => setUserForm(f => ({ ...f, role: e.target.value as Role }))}
                      >
                        <option value="Viewer/Digitiser">Viewer/Digitiser</option>
                        <option value="Group Leader">Group Leader</option>
                        <option value="Programme Lead">Programme Lead</option>
                        <option value="System Admin">System Admin</option>
                      </select>
                    </div>
                    {userForm.role === 'Group Leader' && (
                      <div>
                        <label className="block mb-1.5 text-sm font-medium">Group *</label>
                        <select 
                          className="field" 
                          value={userForm.group}
                          onChange={e => setUserForm(f => ({ ...f, group: e.target.value as Group }))}
                        >
                          <option value="A">Group A</option>
                          <option value="B">Group B</option>
                          <option value="C">Group C</option>
                          <option value="D">Group D</option>
                          <option value="E">Group E</option>
                          <option value="F">Group F</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-border">
                  <button onClick={resetUserForm} className="btn btn-muted">
                    Cancel
                  </button>
                  <button 
                    onClick={editingUser ? handleUpdateUser : handleCreateUser} 
                    className="btn btn-primary"
                  >
                    <Save className="w-4 h-4" />
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Permissions */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl mb-2">Permission Matrix</h2>
            <p className="text-sm text-muted-foreground mb-6">System Admin is always fully allowed (locked). Changes save immediately.</p>
            
            {/* Group permissions by category */}
            {Array.from(new Set(PERMISSIONS.map(p => p.category))).map(category => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-primary">{category}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm text-muted-foreground">Permission</th>
                        {ROLES.map(r => <th key={r} className="text-center py-3 px-4 text-sm text-muted-foreground">{r}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {PERMISSIONS.filter(p => p.category === category).map(p => (
                        <tr key={p.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4 text-sm">{p.label}</td>
                          {ROLES.map(role => (
                            <td key={role} className="py-3 px-4 text-center">
                              <input type="checkbox" checked={role === 'System Admin' ? true : (localPerms[role]?.[p.id] ?? false)}
                                disabled={role === 'System Admin'} onChange={() => togglePerm(role, p.id)}
                                className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary disabled:opacity-50 cursor-pointer" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            
            <button onClick={savePermissions} className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Permissions
            </button>
          </div>
        </div>
      )}

      {/* DSA Rates */}
      {activeTab === 'dsa' && (
        <div className="bg-card rounded-xl p-6 border border-border max-w-md">
          <h2 className="text-xl mb-6">DSA Rate Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm">Base Daily Rate (KES)</label>
              <input type="number" value={dsaForm.base} onChange={e => setDsaForm(f => ({ ...f, base: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block mb-2 text-sm">In-County Rate (%)</label>
              <input type="number" value={dsaForm.inCounty} min={0} max={100} onChange={e => setDsaForm(f => ({ ...f, inCounty: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
              <p className="text-xs text-muted-foreground mt-1">Preview: KES {Math.round(Number(dsaForm.base) * Number(dsaForm.inCounty) / 100).toLocaleString()} / day</p>
            </div>
            <div>
              <label className="block mb-2 text-sm">Out-County Rate (%)</label>
              <input type="number" value={dsaForm.outCounty} min={0} max={100} onChange={e => setDsaForm(f => ({ ...f, outCounty: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
              <p className="text-xs text-muted-foreground mt-1">Preview: KES {Math.round(Number(dsaForm.base) * Number(dsaForm.outCounty) / 100).toLocaleString()} / day</p>
            </div>
            <button onClick={saveDSA} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2">
              <Save className="w-4 h-4" /> Save DSA Rates
            </button>
          </div>
        </div>
      )}

      {/* Data Management */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl mb-6">Data Management</h2>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-2">Export All Data</h3>
                <p className="text-sm text-muted-foreground mb-4">Download a complete JSON backup of all system data.</p>
                <button onClick={() => { exportState(); showToast('✅ Data exported.'); }} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-all">
                  Export JSON
                </button>
              </div>
              <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                <h3 className="font-medium mb-2 text-destructive">Reset to Defaults</h3>
                <p className="text-sm text-muted-foreground mb-4">Reset all data to mock defaults. This cannot be undone.</p>
                <button onClick={() => { if (confirm('Reset ALL data to defaults? This cannot be undone.')) { resetState(); showToast('↩️ System reset to defaults.'); } }}
                  className="bg-destructive text-destructive-foreground px-6 py-2 rounded-lg hover:bg-destructive/90 transition-all">
                  Reset System
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      {activeTab === 'features' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl mb-6">Feature Toggles</h2>
            <div className="space-y-6">
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-2">Bulk Upload & CSV Export</h3>
                <p className="text-sm text-muted-foreground mb-4">Enable bulk upload and CSV export functionality for courses, participants, attendance, and payments.</p>
                <div className="space-y-3">
                  {['Courses', 'Participants', 'Attendance', 'Payments'].map(module => (
                    <div key={module} className="flex items-center justify-between">
                      <span className="text-sm">{module} Module</span>
                      <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Enabled</button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-2">Workshop Management</h3>
                <p className="text-sm text-muted-foreground mb-4">Advanced workshop management features including dynamic URLs and tab interface.</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dynamic Workshop URLs</span>
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Enabled</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tab Interface</span>
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Enabled</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Workshop Status Tracking</span>
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Enabled</button>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-2">Data Management</h3>
                <p className="text-sm text-muted-foreground mb-4">Recycle bin and data recovery features.</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Recycle Bin</span>
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Enabled</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Recovery</span>
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Enabled</button>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-2">Communication</h3>
                <p className="text-sm text-muted-foreground mb-4">Feedback and notification systems.</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Feedback System</span>
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Enabled</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Activity Logging</span>
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Enabled</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl mb-6">System Configuration</h2>
            <div className="space-y-6">
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-2">Level Naming Convention</h3>
                <p className="text-sm text-muted-foreground mb-4">Current system uses 8-semester sequence (Level 1.1 - Level 4.2).</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Level Format</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">Level X.Y</span>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-2">Activity Logging</h3>
                <p className="text-sm text-muted-foreground mb-4">System activity and audit log configuration.</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">IP Address Tracking</span>
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Enabled</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Detailed Timestamps</span>
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Enabled</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Action Logging</span>
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Enabled</button>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-2">System Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version:</span>
                    <span>2.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Environment:</span>
                    <span>Development</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Database:</span>
                    <span>Local Storage</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-2">Performance Monitoring</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cache Management</span>
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Clear Cache</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Logs</span>
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">View Logs</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Health Check</span>
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Healthy</button>
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
