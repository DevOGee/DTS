import { useState, useMemo } from 'react';
import { Search, Download, DollarSign, CheckCircle, Clock, Edit, X, Save, TrendingUp } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Group, PaymentSchedule } from '../data/mockData';

export function Payments() {
  const { user } = useAuth();
  const { groups, participants, paymentSchedules, baseDailyRate, dsaRates, updatePaymentSchedule } = useData();
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState<Group | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Processed' | 'Paid'>('all');
  const [editing, setEditing] = useState<PaymentSchedule | null>(null);
  const [editForm, setEditForm] = useState<Partial<PaymentSchedule>>({});
  const { success } = useToast();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const canEdit = (g: Group) => user?.role === 'System Admin' || user?.role === 'Programme Lead' || (user?.role === 'Group Leader' && user.group === g);

  const participantOf = (ps: PaymentSchedule) => participants.find(p => p.id === ps.participantId);

  const filtered = useMemo(() => paymentSchedules.filter(ps => {
    const p = participantOf(ps);
    if (!p) return false;
    const s = search.toLowerCase();
    return (p.name.toLowerCase().includes(s) || ps.bankName.toLowerCase().includes(s) || ps.accountNumber.includes(s)) &&
      (filterGroup === 'all' || p.group === filterGroup) &&
      (filterStatus === 'all' || ps.status === filterStatus);
  }), [paymentSchedules, participants, search, filterGroup, filterStatus]);

  // Pagination logic
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / recordsPerPage);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [search, filterGroup, filterStatus]);

  const totalAmt = filtered.reduce((s, ps) => s + ps.amount, 0);
  const processedAmt = filtered.filter(ps => ps.status !== 'Pending').reduce((s, ps) => s + ps.amount, 0);
  const pendingAmt = filtered.filter(ps => ps.status === 'Pending').reduce((s, ps) => s + ps.amount, 0);
  const paidCount = paymentSchedules.filter(ps => ps.status === 'Paid').length;

  const openEdit = (ps: PaymentSchedule) => { setEditing(ps); setEditForm({ ...ps }); };
  const closeEdit = () => { setEditing(null); setEditForm({}); };
  const saveEdit = () => {
    if (editing) {
      const updated = { ...editing, ...editForm } as PaymentSchedule;
      updatePaymentSchedule(updated);
      const p = participantOf(updated);
      success(`Payment for ${p?.name ?? 'participant'} updated — Status: ${updated.status}, Amount: KES ${updated.amount.toLocaleString()}.`, 'Payment Updated');
    }
    closeEdit();
  };

  const exportCSV = () => {
    const rows = filtered.map(ps => {
      const p = participantOf(ps)!;
      return [p.name, `Group ${p.group}`, p.dsaType, p.daysAttending, ps.amount, ps.bankName, ps.branch, ps.accountNumber, ps.bankCode, ps.status].join(',');
    });
    const csv = ['Name,Group,DSA Type,Days,Amount,Bank,Branch,Account No,Bank Code,Status', ...rows].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'dsa_payments.csv'; a.click();
    URL.revokeObjectURL(url);
    success(`${filtered.length} payment record(s) exported as dsa_payments.csv.`, 'Export Complete');
  };

  const statusClass = (s: string) =>
    s === 'Paid' ? 'badge badge-success' : s === 'Processed' ? 'badge badge-primary' : 'badge badge-warning';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold mb-1">DSA Payment Schedule</h1>
          <p className="text-muted-foreground text-sm">Daily Subsistence Allowance management</p>
        </div>
        <button onClick={exportCSV} className="btn btn-muted"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: 'Total DSA', value: `KES ${totalAmt.toLocaleString()}`, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: CheckCircle, label: 'Processed', value: `KES ${processedAmt.toLocaleString()}`, color: 'text-chart-3', bg: 'bg-chart-3/10' },
          { icon: Clock, label: 'Pending', value: `KES ${pendingAmt.toLocaleString()}`, color: 'text-chart-4', bg: 'bg-chart-4/10' },
          { icon: TrendingUp, label: 'Paid', value: `${paidCount} of ${paymentSchedules.length}`, color: 'text-secondary', bg: 'bg-secondary/10' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl p-5 border border-border card-hover">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className={`font-bold text-xl leading-none ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* DSA rate info */}
      <div className="bg-gradient-to-r from-primary/8 to-secondary/8 border border-primary/20 rounded-2xl p-5 flex flex-wrap gap-6">
        <div><div className="text-xs text-muted-foreground mb-1">Base Daily Rate</div><div className="text-2xl font-bold text-primary">KES {baseDailyRate.toLocaleString()}</div></div>
        <div><div className="text-xs text-muted-foreground mb-1">In-County</div><div className="text-2xl font-bold text-chart-3">{dsaRates['In-County'] * 100}%</div></div>
        <div><div className="text-xs text-muted-foreground mb-1">Out-County</div><div className="text-2xl font-bold text-secondary">{dsaRates['Out-County'] * 100}%</div></div>
        <div><div className="text-xs text-muted-foreground mb-1">In-County Daily</div><div className="text-xl font-bold">KES {Math.round(baseDailyRate * dsaRates['In-County']).toLocaleString()}</div></div>
        <div><div className="text-xs text-muted-foreground mb-1">Out-County Daily</div><div className="text-xl font-bold">KES {Math.round(baseDailyRate * dsaRates['Out-County']).toLocaleString()}</div></div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input className="field pl-9" placeholder="Search by name, bank, or account…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="field sm:w-36" value={filterGroup} onChange={e => setFilterGroup(e.target.value as any)}>
              <option value="all">All Groups</option>
              {groups.map(g => <option key={g} value={g}>Group {g}</option>)}
            </select>
            <select className="field sm:w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processed">Processed</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Name', 'Group', 'DSA Type', 'Days', 'Amount', 'Bank Details', 'Status', 'Edit'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedPayments.map(ps => {
                const p = participantOf(ps);
                if (!p) return null;
                return (
                  <tr key={ps.id} className="table-row-hover transition-colors">
                    <td className="py-3.5 px-4 font-medium">{p.name}</td>
                    <td className="py-3.5 px-4"><span className="badge badge-primary">Group {p.group}</span></td>
                    <td className="py-3.5 px-4">
                      <span className={p.dsaType === 'In-County' ? 'badge badge-success' : 'badge badge-primary'}>{p.dsaType}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium">{p.daysAttending}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-primary">KES {ps.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs">
                        <div className="font-semibold">{ps.bankName}</div>
                        <div className="text-muted-foreground">{ps.branch} · {ps.bankCode}</div>
                        <div className="font-mono text-muted-foreground">A/C: {ps.accountNumber}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4"><span className={statusClass(ps.status)}>{ps.status}</span></td>
                    <td className="py-3.5 px-4">
                      {canEdit(p.group) && <button onClick={() => openEdit(ps)} className="btn-icon btn-icon-primary"><Edit className="w-4 h-4" /></button>}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">No records match your filters.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-border">
          {paginatedPayments.map(ps => {
            const p = participantOf(ps);
            if (!p) return null;
            return (
              <div key={ps.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-lg font-bold text-primary font-mono mt-0.5">KES {ps.amount.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={statusClass(ps.status)}>{ps.status}</span>
                    {canEdit(p.group) && <button onClick={() => openEdit(ps)} className="btn-icon btn-icon-primary"><Edit className="w-4 h-4" /></button>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="badge badge-primary">Group {p.group}</span>
                  <span className={p.dsaType === 'In-County' ? 'badge badge-success' : 'badge badge-primary'}>{p.dsaType}</span>
                  <span className="badge badge-muted">{p.daysAttending} days</span>
                </div>
                <div className="text-xs text-muted-foreground">{ps.bankName} · {ps.branch} · A/C {ps.accountNumber}</div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
          Showing {((currentPage - 1) * recordsPerPage) + 1}-{Math.min(currentPage * recordsPerPage, filtered.length)} of {filtered.length} payment records • Total: KES {totalAmt.toLocaleString()}
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border hover:bg-muted'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && closeEdit()}>
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-semibold">Edit Payment</h2>
                <p className="text-sm text-muted-foreground">{participantOf(editing)?.name}</p>
              </div>
              <button onClick={closeEdit} className="btn-icon p-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {([['Bank Name', 'bankName'], ['Branch', 'branch'], ['Bank Code', 'bankCode'], ['Account Number', 'accountNumber']] as [string, keyof PaymentSchedule][]).map(([label, key]) => (
                <div key={key}>
                  <label className="block mb-1.5 text-sm font-medium">{label}</label>
                  <input className="field" value={(editForm[key] as string) ?? ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="block mb-1.5 text-sm font-medium">Payment Status</label>
                <select className="field" value={editForm.status ?? editing.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as any }))}>
                  <option value="Pending">Pending</option>
                  <option value="Processed">Processed</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div className="bg-muted/50 rounded-xl px-4 py-3 flex justify-between text-sm">
                <span className="text-muted-foreground">DSA Amount</span>
                <span className="font-bold font-mono text-primary">KES {editing.amount.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button onClick={closeEdit} className="btn btn-muted">Cancel</button>
              <button onClick={saveEdit} className="btn btn-primary"><Save className="w-4 h-4" /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
