import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Search, Plus, Edit, Trash2, Users, DollarSign, X, Save, Upload, Download, FileText, AlertCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Group, Participant } from '../data/mockData';
import { PaginationControls } from './ui/PaginationControls';
import { usePagination } from '../hooks/usePagination';

const EMPTY: Omit<Participant, 'id'> = {
  name: '', email: '', role: 'Content Digitiser', group: 'A', dsaType: 'In-County', daysAttending: 7,
};

export function Participants() {
  const { user } = useAuth();
  const { groups, participants, baseDailyRate, dsaRates, addParticipant, updateParticipant, removeParticipant } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState<Group | 'all'>('all');
  const [filterDSA, setFilterDSA] = useState<'all' | 'In-County' | 'Out-County'>('all');
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [form, setForm] = useState<Omit<Participant, 'id'>>(EMPTY);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL-based state management
  const locationPath = location.pathname;
  const isAddMode = locationPath === '/participants/add-participant';
  const isEditMode = locationPath.startsWith('/participants/edit/') && locationPath.split('/')[3];
  const isViewMode = !isAddMode && !isEditMode;

  const canAdd = user?.role !== 'Viewer/Digitiser';
  const canEdit = (g: Group) => user?.role === 'System Admin' || user?.role === 'Programme Lead' || (user?.role === 'Group Leader' && user.group === g);
  const canDelete = () => user?.role === 'System Admin';
  const { success, error, warning } = useToast();
  const calcDSA = (p: Omit<Participant, 'id'>) => Math.round(p.daysAttending * baseDailyRate * dsaRates[p.dsaType]);

  // CSV Export Function
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Group', 'DSA Type', 'Days Attending', 'DSA Amount'];
    const csvData = filtered.map(participant => [
      participant.name,
      participant.email,
      participant.role,
      participant.group,
      participant.dsaType,
      participant.daysAttending,
      calcDSA(participant)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `participants_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success(`${filtered.length} participant(s) exported successfully.`, 'Export Complete');
  };

  // Download Template Function
  const downloadTemplate = () => {
    const headers = ['Name*', 'Email*', 'Role*', 'Group*', 'DSA Type*', 'Days Attending'];
    const sampleData = [
      ['John Doe', 'john.doe@ouk.ac.ke', 'Content Digitiser', 'A', 'In-County', '7'],
      ['Jane Smith', 'jane.smith@ouk.ac.ke', 'Multimedia Digitiser', 'B', 'Out-County', '5']
    ];

    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'participants_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Participant CSV template downloaded.', 'Template Downloaded');
  };

  // CSV Upload Function
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadErrors([]);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setUploadErrors(['CSV file must contain at least a header row and one data row']);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const expectedHeaders = ['Name*', 'Email*', 'Role*', 'Group*', 'DSA Type*', 'Days Attending'];
      
      // Validate headers
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        setUploadErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
        return;
      }

      const newParticipants: Participant[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const rowData: any = {};
          
          headers.forEach((header, index) => {
            rowData[header] = values[index] || '';
          });

          // Validate required fields
          if (!rowData['Name*'] || !rowData['Email*'] || !rowData['Role*'] || !rowData['Group*'] || !rowData['DSA Type*']) {
            errors.push(`Row ${i + 1}: Missing required fields`);
            continue;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(rowData['Email*'])) {
            errors.push(`Row ${i + 1}: Invalid email format`);
            continue;
          }

          // Validate group
          if (!groups.includes(rowData['Group*'])) {
            errors.push(`Row ${i + 1}: Invalid group "${rowData['Group*']}"`);
            continue;
          }

          // Validate DSA type
          if (!['In-County', 'Out-County'].includes(rowData['DSA Type*'])) {
            errors.push(`Row ${i + 1}: Invalid DSA type "${rowData['DSA Type*']}"`);
            continue;
          }

          // Validate role
          const validRoles = ['Content Digitiser', 'Multimedia Digitiser', 'Group Leader', 'Programme Lead', 'System Admin', 'Viewer/Digitiser'];
          if (!validRoles.includes(rowData['Role*'])) {
            errors.push(`Row ${i + 1}: Invalid role "${rowData['Role*']}"`);
            continue;
          }

          const newParticipant: Participant = {
            id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: rowData['Name*'],
            email: rowData['Email*'],
            role: rowData['Role*'],
            group: rowData['Group*'] as Group,
            dsaType: rowData['DSA Type*'] as 'In-County' | 'Out-County',
            daysAttending: parseInt(rowData['Days Attending']) || 7
          };

          newParticipants.push(newParticipant);
        } catch (error) {
          errors.push(`Row ${i + 1}: Error processing row - ${error}`);
        }
      }

      if (errors.length > 0) {
        setUploadErrors(errors);
      } else {
        // Add all participants
        for (const participant of newParticipants) {
          addParticipant(participant);
        }
        success(`${newParticipants.length} participant(s) imported successfully.`, 'Import Complete');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploadErrors([`Error reading file: ${error}`]);
    } finally {
      setIsUploading(false);
    }
  };

  const filtered = useMemo(() => participants.filter(p => {
    const s = search.toLowerCase();
    return (p.name.toLowerCase().includes(s) || p.email.toLowerCase().includes(s)) &&
      (filterGroup === 'all' || p.group === filterGroup) &&
      (filterDSA === 'all' || p.dsaType === filterDSA);
  }), [participants, search, filterGroup, filterDSA]);

  const totalDSA = participants.reduce((s, p) => s + calcDSA(p), 0);
  const pagination = usePagination(filtered.length, 10);
  const paginatedParticipants = useMemo(
    () => filtered.slice(pagination.offset, pagination.offset + pagination.limit),
    [filtered, pagination.offset, pagination.limit]
  );

  // URL-based navigation functions
  const openAdd = () => navigate('/participants/add-participant');
  const openEdit = (p: Participant) => navigate(`/participants/edit/${p.id}`);
  const closeForm = () => navigate('/participants');

  // Initialize form based on URL mode
  useEffect(() => {
    if (isAddMode) {
      setForm(EMPTY);
    } else if (isEditMode) {
      const participantId = locationPath.split('/')[3];
      const participant = participants.find(p => p.id === participantId);
      if (participant) {
        setForm({ ...participant });
        setEditingParticipant(participant);
      }
    }
  }, [locationPath, participants, isAddMode, isEditMode]);

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) { error('Name and email are required fields.', 'Validation Error'); return; }
    if (isAddMode) {
      addParticipant({ ...form, id: `p-${Date.now()}` });
      success(`${form.name} has been added as a participant in Group ${form.group}.`, 'Participant Added');
    } else if (isEditMode) {
      const participantId = locationPath.split('/')[3];
      updateParticipant({ ...form, id: participantId });
      success(`${form.name}'s details have been updated.`, 'Participant Updated');
    }
    closeForm();
  };

  const handleDelete = (p: Participant) => {
    if (confirm(`Remove "${p.name}"? Their attendance and payment records will also be removed.`)) {
      removeParticipant(p.id);
      warning(`${p.name} and all associated records have been removed.`, 'Participant Removed');
    }
  };

  const inCounty = participants.filter(p => p.dsaType === 'In-County').length;
  const outCounty = participants.filter(p => p.dsaType === 'Out-County').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold mb-1">Participant Management</h1>
          <p className="text-muted-foreground text-sm">Manage workshop participants and DSA allowances</p>
        </div>
        <div className="flex gap-2">
          {canAdd && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button onClick={() => fileInputRef.current?.click()} className="btn btn-muted" disabled={isUploading}>
                <Upload className="w-4 h-4" />
                {isUploading ? 'Uploading...' : 'Bulk Upload'}
              </button>
              <button onClick={downloadTemplate} className="btn btn-muted">
                <FileText className="w-4 h-4" />
                Template
              </button>
              <button onClick={exportToCSV} className="btn btn-muted">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button onClick={openAdd} className="btn btn-primary">
                <Plus className="w-4 h-4" /> Add Participant
              </button>
            </>
          )}
        </div>
      </div>

      {/* Upload Errors */}
      {uploadErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">Upload Errors</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {uploadErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Participants', value: participants.length, color: 'text-blue-600', gradient: 'from-blue-500/10 to-cyan-500/10', borderHover: 'hover:border-blue-300/50' },
          { icon: DollarSign, label: 'In-County', value: inCounty, sub: `${dsaRates['In-County'] * 100}% rate`, color: 'text-teal-600', gradient: 'from-teal-500/10 to-emerald-500/10', borderHover: 'hover:border-teal-300/50' },
          { icon: DollarSign, label: 'Out-County', value: outCounty, sub: `${dsaRates['Out-County'] * 100}% rate`, color: 'text-amber-600', gradient: 'from-amber-500/10 to-orange-500/10', borderHover: 'hover:border-amber-300/50' },
          { icon: DollarSign, label: 'Total DSA', value: `KES ${totalDSA.toLocaleString()}`, color: 'text-purple-600', gradient: 'from-purple-500/10 to-fuchsia-500/10', borderHover: 'hover:border-purple-300/50' },
        ].map(({ icon: Icon, label, value, sub, color, gradient, borderHover }) => (
          <div key={label} className={`relative group bg-card/40 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${borderHover} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[140px]`}>
            {/* Subtle Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0`} />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="text-sm font-medium tracking-wide text-muted-foreground uppercase">{label}</div>
                <div className="rounded-xl border border-white/20 bg-background/50 shadow-sm p-2 group-hover:scale-110 transition-transform duration-300">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
              </div>
              <div>
                <div className="text-4xl font-light tracking-tight mb-1">{value}</div>
                {sub && <div className={`text-sm font-medium ${color.replace('text-', 'text-').replace('-600', '-500')} opacity-90`}>{sub}</div>}
              </div>
            </div>
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
            <select className="field sm:w-36" value={filterGroup} onChange={e => setFilterGroup(e.target.value as Group | 'all')}>
              <option value="all">All Groups</option>
              {groups.map(g => <option key={g} value={g}>Group {g}</option>)}
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
              {paginatedParticipants.map(p => (
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
              {paginatedParticipants.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No participants found.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-border">
          {paginatedParticipants.map(p => (
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
          {paginatedParticipants.length === 0 && <div className="py-10 text-center text-muted-foreground text-sm">No participants found.</div>}
        </div>
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          pageSizeOptions={pagination.pageSizeOptions}
          from={pagination.from}
          to={pagination.to}
          totalItems={filtered.length}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      </div>

      {/* Add/Edit Form - URL-based */}
      {(isAddMode || isEditMode) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={e => e.target === e.currentTarget && closeForm()}>
          <div className="bg-card rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">{isAddMode ? 'Add Participant' : 'Edit Participant'}</h2>
              <button onClick={closeForm} className="btn-icon p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
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
                    {groups.map(g => <option key={g} value={g}>Group {g}</option>)}
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
              <button onClick={closeForm} className="btn btn-muted">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
