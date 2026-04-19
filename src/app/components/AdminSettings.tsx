import { useState } from 'react';
import { Settings, Users, DollarSign, Calendar, Database, Shield, LogIn, Save, Palette } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../data/mockData';

const PERMISSIONS = [
  { id: 'view_dashboard', label: 'View Dashboard' },
  { id: 'view_workshops', label: 'View DT Workshops' },
  { id: 'create_workshops', label: 'Create/Edit Workshops' },
  { id: 'view_courses', label: 'View Courses' },
  { id: 'edit_courses', label: 'Edit/Add Courses' },
  { id: 'delete_courses', label: 'Delete Courses' },
  { id: 'view_groups', label: 'View Groups' },
  { id: 'view_multimedia', label: 'View Multimedia' },
  { id: 'edit_multimedia', label: 'Add/Edit Videos' },
  { id: 'view_participants', label: 'View Participants' },
  { id: 'edit_participants', label: 'Edit Participants' },
  { id: 'view_payments', label: 'View DSA Payments' },
  { id: 'edit_payments', label: 'Edit Payment Schedule' },
  { id: 'view_checklist', label: 'Phase Checklist' },
  { id: 'mark_attendance', label: 'Attendance (Mark)' },
  { id: 'role_management', label: 'Role Management' },
  { id: 'admin_settings', label: 'Admin Settings' },
];

const ROLES: Role[] = ['System Admin', 'Programme Lead', 'Group Leader', 'Viewer'];
const GROUP_LIST = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

export function AdminSettings() {
  const { user: currentUser } = useAuth();
  const { users, workshop, setWorkshop, permissions, setPermissions, baseDailyRate, dsaRates, setDSAConfig, groupColors, setGroupColor, exportState, resetState } = useData();

  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'permissions' | 'dsa' | 'data'>('general');
  const [toast, setToast] = useState('');
  const [loginAsUser, setLoginAsUser] = useState('');

  // Local form states
  const [wForm, setWForm] = useState({ startDate: new Date(workshop.startDate).toISOString().split('T')[0], numberOfDays: String(workshop.numberOfDays), venue: workshop.venue });
  const [dsaForm, setDsaForm] = useState({ base: String(baseDailyRate), inCounty: String(dsaRates['In-County'] * 100), outCounty: String(dsaRates['Out-County'] * 100) });
  const [localPerms, setLocalPerms] = useState(permissions);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

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
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
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
            <h2 className="text-xl mb-6">System Users</h2>
            <div className="space-y-3">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50">
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-sm text-muted-foreground">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{u.role}</span>
                    {u.group && <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm">Group {u.group}</span>}
                    {u.id === currentUser?.id && <span className="text-xs text-chart-3">● You</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Permissions */}
      {activeTab === 'permissions' && (
        <div className="bg-card rounded-xl p-6 border border-border overflow-x-auto">
          <h2 className="text-xl mb-2">Permission Matrix</h2>
          <p className="text-sm text-muted-foreground mb-6">System Admin is always fully allowed (locked). Changes save immediately.</p>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm text-muted-foreground">Permission</th>
                {ROLES.map(r => <th key={r} className="text-center py-3 px-4 text-sm text-muted-foreground">{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map(p => (
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
          <button onClick={savePermissions} className="mt-6 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Permissions
          </button>
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
    </div>
  );
}
