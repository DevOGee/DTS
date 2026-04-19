import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Users, DollarSign, X, Save } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { GROUPS, Group, Participant } from '../data/mockData';

const EMPTY: Omit<Participant, 'id'> = {
  name: '', email: '', role: 'Content Digitiser', group: 'A', dsaType: 'In-County', daysAttending: 7,
};

export function Participants() {
  const { user } = useAuth();
  const { participants, baseDailyRate, dsaRates, addParticipant, updateParticipant, removeParticipant } = useData();
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState<Group | 'all'>('all');
  const [filterDSA, setFilterDSA] = useState<'all' | 'In-County' | 'Out-County'>('all');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; data: Participant | null } | null>(null);
  const [form, setForm] = useState<Omit<Participant, 'id'>>(EMPTY);
  const [toast, setToast] = useState('');

  const canAdd = user?.role !== 'Viewer';
  const canEdit = (g: Group) => user?.role === 'System Admin' || user?.role === 'Programme Lead' || (user?.role === 'Group Leader' && user.group === g);
  const canDelete = () => user?.role === 'System Admin';

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const calcDSA = (p: Omit<Participant, 'id'>) => Math.round(p.daysAttending * baseDailyRate * dsaRates[p.dsaType]);

  const filtered = useMemo(() => participants.filter(p => {
    const s = search.toLowerCase();
    return (p.name.toLowerCase().includes(s) || p.email.toLowerCase().includes(s)) &&
      (filterGroup === 'all' || p.group === filterGroup) &&
      (filterDSA === 'all' || p.dsaType === filterDSA);
  }), [participants, search, filterGroup, filterDSA]);

  const totalDSA = participants.reduce((s, p) => s + calcDSA(p), 0);

  const openAdd = () => { setForm(EMPTY); setModal({ mode: 'add', data: null }); };
  const openEdit = (p: Participant) => { setForm({ ...p }); setModal({ mode: 'edit', data: p }); };
  const closeModal = () => setModal(null);

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) { showToast('⚠️ Name and email are required.'); return; }
    if (modal?.mode === 'add') {
      addParticipant({ ...form, id: `p-${Date.now()}` });
      showToast('✅ Participant added.');
    } else if (modal?.data) {
      updateParticipant({ ...form, id: modal.data.id });
      showToast('✅ Participant updated.');
    }
    closeModal();
  };

  const handleDelete = (p: Participant) => {
    if (confirm(`Remove "${p.name}"? Their attendance and payment records will also be removed.`)) {
      removeParticipant(p.id); showToast('🗑️ Participant removed.');
    }
  };

  const inCounty = participants.filter(p => p.dsaType === 'In-County').length;
  const outCounty = participants.filter(p => p.dsaType === 'Out-County').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <div className="toast">{toast}</div>}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold mb-1">Participant Management</h1>
          <p className="text-muted-foreground text-sm">Manage workshop participants and DSA allowances</p>
        </div>
        {canAdd && <button onClick={openAdd} className="btn btn-primary"><Plus className="w-4 h-4" /> Add Participant</button>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Participants', value: participants.length, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: DollarSign, label: 'In-County', value: inCounty, sub: `${dsaRates['In-County'] * 100}% rate`, color: 'text-chart-3', bg: 'bg-chart-3/10' },
          { icon: DollarSign, label: 'Out-County', value: outCounty, sub: `${dsaRates['Out-County'] * 100}% rate`, color: 'text-secondary', bg: 'bg-secondary/10' },
          { icon: DollarSign, label: 'Total DSA', value: `KES ${totalDSA.toLocaleString()}`, color: 'text-chart-5', bg: 'bg-chart-5/10' },
        ].map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl p-5 border border-border card-hover">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className={`stat-number ${typeof value === 'string' ? 'text-2xl' : ''}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{sub ?? label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input className="field pl-9" placeholder="Search participants…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="field sm:w-36" value={filterGroup} onChange={e => setFilterGroup(e.target.value as any)}>
              <option value="all">All Groups</option>
              {GROUPS.map(g => <option key={g} value={g}>Group {g}</option>)}
            </select>
            <select className="field sm:w-36" value={filterDSA} onChange={e => setFilterDSA(e.target.value as any)}>
              <option value="all">All DSA</option>
              <option value="In-County">In-County</option>
              <option value="Out-County">Out-County</option>
            </select>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Name', 'Role', 'Group', 'DSA Type', 'Days', 'DSA Amount', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => (
                <tr key={p.id} className="table-row-hover transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.email}</div>
                  </td>
                  <td className="py-3.5 px-4"><span className="badge badge-muted">{p.role}</span></td>
                  <td className="py-3.5 px-4"><span className="badge badge-primary">Group {p.group}</span></td>
                  <td className="py-3.5 px-4">
                    <span className={p.dsaType === 'In-County' ? 'badge badge-success' : 'badge badge-primary'}>{p.dsaType}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium">{p.daysAttending}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-primary">KES {calcDSA(p).toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex gap-1">
                      {canEdit(p.group) && <button onClick={() => openEdit(p)} className="btn-icon btn-icon-primary"><Edit className="w-4 h-4" /></button>}
                      {canDelete() && <button onClick={() => handleDelete(p)} className="btn-icon btn-icon-danger"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No participants found.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-border">
          {filtered.map(p => (
            <div key={p.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.email}</div>
                </div>
                <div className="flex gap-1">
                  {canEdit(p.group) && <button onClick={() => openEdit(p)} className="btn-icon btn-icon-primary"><Edit className="w-4 h-4" /></button>}
                  {canDelete() && <button onClick={() => handleDelete(p)} className="btn-icon btn-icon-danger"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-primary">Group {p.group}</span>
                <span className={p.dsaType === 'In-County' ? 'badge badge-success' : 'badge badge-primary'}>{p.dsaType}</span>
                <span className="badge badge-muted">{p.daysAttending} days</span>
              </div>
              <div className="text-sm font-mono font-semibold text-primary">DSA: KES {calcDSA(p).toLocaleString()}</div>
            </div>
          ))}
          {filtered.length === 0 && <div className="py-10 text-center text-muted-foreground text-sm">No participants found.</div>}
        </div>

        <div className="px-5 py-3 border-t border-border flex justify-between text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {participants.length}</span>
          <span>Base rate: KES {baseDailyRate.toLocaleString()}/day</span>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">{modal.mode === 'add' ? 'Add Participant' : 'Edit Participant'}</h2>
              <button onClick={closeModal} className="btn-icon p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block mb-1.5 text-sm font-medium">Full Name *</label>
                  <input className="field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-1.5 text-sm font-medium">Email *</label>
                  <input type="email" className="field" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@ouk.ac.ke" />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Role</label>
                  <select className="field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as any }))}>
                    <option value="Content Digitiser">Content Digitiser</option>
                    <option value="Multimedia Digitiser">Multimedia Digitiser</option>
                    <option value="Group Leader">Group Leader</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Group</label>
                  <select className="field" value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value as Group }))}>
                    {GROUPS.map(g => <option key={g} value={g}>Group {g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">DSA Type</label>
                  <select className="field" value={form.dsaType} onChange={e => setForm(f => ({ ...f, dsaType: e.target.value as any }))}>
                    <option value="In-County">In-County ({dsaRates['In-County'] * 100}%)</option>
                    <option value="Out-County">Out-County ({dsaRates['Out-County'] * 100}%)</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Days Attending</label>
                  <input type="number" className="field" min={1} max={30} value={form.daysAttending}
                    onChange={e => setForm(f => ({ ...f, daysAttending: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="bg-primary/8 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm font-medium">Estimated DSA</span>
                <span className="text-xl font-bold text-primary font-mono">KES {calcDSA(form).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button onClick={closeModal} className="btn btn-muted">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
