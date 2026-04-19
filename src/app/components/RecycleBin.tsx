import { useState, useMemo } from 'react';
import { Trash2, RotateCcw, Search, Filter, AlertTriangle, Clock, Calendar, User, Package, DollarSign, CheckSquare, Building, GraduationCap } from 'lucide-react';
import { useRecycleBin } from '../contexts/RecycleBinContext';
import { useAuth } from '../contexts/AuthContext';
import { RecyclableItem, RecyclableItemType, formatDeletionDate, getDaysUntilExpiration, isItemExpired, isItemExpiringSoon } from '../data/recycleBinData';

const TYPE_ICONS: Record<RecyclableItemType, any> = {
  course: Package,
  participant: User,
  user: User,
  payment: DollarSign,
  attendance: CheckSquare,
  checklist: CheckSquare,
  workshop: Building,
  programme: GraduationCap,
};

const TYPE_COLORS: Record<RecyclableItemType, string> = {
  course: 'text-blue-600',
  participant: 'text-green-600',
  user: 'text-purple-600',
  payment: 'text-yellow-600',
  attendance: 'text-orange-600',
  checklist: 'text-pink-600',
  workshop: 'text-indigo-600',
  programme: 'text-teal-600',
};

export function RecycleBin() {
  const { user } = useAuth();
  const { recycledItems, stats, restoreFromRecycleBin, permanentlyDelete, emptyRecycleBin, cleanupExpiredItems } = useRecycleBin();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<RecyclableItemType | 'all'>('all');
  const [showConfirmDialog, setShowConfirmDialog] = useState<{ type: 'restore' | 'delete' | 'empty'; item?: RecyclableItem } | null>(null);

  const canManage = user?.role === 'System Admin' || user?.role === 'Programme Lead';

  // Filter items
  const filteredItems = useMemo(() => {
    return recycledItems.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.data.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.data.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.originalId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || item.type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [recycledItems, searchTerm, filterType]);

  const handleRestore = (item: RecyclableItem) => {
    if (isItemExpired(item.deletedAt)) {
      alert('This item has expired and cannot be restored.');
      return;
    }
    setShowConfirmDialog({ type: 'restore', item });
  };

  const handlePermanentDelete = (item: RecyclableItem) => {
    setShowConfirmDialog({ type: 'delete', item });
  };

  const handleEmptyRecycleBin = () => {
    setShowConfirmDialog({ type: 'empty' });
  };

  const executeAction = () => {
    if (!showConfirmDialog) return;

    switch (showConfirmDialog.type) {
      case 'restore':
        if (showConfirmDialog.item) {
          restoreFromRecycleBin(showConfirmDialog.item.id);
        }
        break;
      case 'delete':
        if (showConfirmDialog.item) {
          permanentlyDelete(showConfirmDialog.item.id);
        }
        break;
      case 'empty':
        emptyRecycleBin();
        break;
    }
    setShowConfirmDialog(null);
  };

  const getItemDisplayName = (item: RecyclableItem): string => {
    const data = item.data;
    switch (item.type) {
      case 'course':
        return data.name || data.code || `Course ${item.originalId}`;
      case 'participant':
        return data.name || `Participant ${item.originalId}`;
      case 'user':
        return data.name || `User ${item.originalId}`;
      case 'payment':
        return `Payment for ${data.participantId || item.originalId}`;
      case 'attendance':
        return `Attendance record ${item.originalId}`;
      case 'checklist':
        return data.title || `Checklist ${item.originalId}`;
      case 'workshop':
        return data.name || `Workshop ${item.originalId}`;
      case 'programme':
        return data.name || `Programme ${item.originalId}`;
      default:
        return `Item ${item.originalId}`;
    }
  };

  const getItemDetails = (item: RecyclableItem): string[] => {
    const data = item.data;
    const details: string[] = [];
    
    switch (item.type) {
      case 'course':
        if (data.code) details.push(`Code: ${data.code}`);
        if (data.level) details.push(`Level: ${data.level}`);
        if (data.courseType) details.push(`Type: ${data.courseType}`);
        break;
      case 'participant':
        if (data.role) details.push(`Role: ${data.role}`);
        if (data.group) details.push(`Group: ${data.group}`);
        if (data.email) details.push(`Email: ${data.email}`);
        break;
      case 'user':
        if (data.role) details.push(`Role: ${data.role}`);
        if (data.email) details.push(`Email: ${data.email}`);
        break;
      case 'payment':
        if (data.amount) details.push(`Amount: ${data.amount}`);
        if (data.status) details.push(`Status: ${data.status}`);
        break;
    }
    
    return details;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold mb-1 flex items-center gap-2">
            <Trash2 className="w-8 h-8 text-red-500" />
            Recycle Bin
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage deleted items - Items are automatically deleted after 60 days
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <button
              onClick={() => cleanupExpiredItems()}
              className="btn btn-muted btn-sm"
              disabled={stats.expiredItems === 0}
            >
              <Clock className="w-4 h-4" />
              Clean Expired ({stats.expiredItems})
            </button>
            <button
              onClick={handleEmptyRecycleBin}
              className="btn btn-danger btn-sm"
              disabled={recycledItems.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              Empty All
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary">{stats.totalItems}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
            <Trash2 className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-500">{stats.itemsExpiringSoon}</div>
              <div className="text-sm text-muted-foreground">Expiring Soon</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-500">{stats.expiredItems}</div>
              <div className="text-sm text-muted-foreground">Expired</div>
            </div>
            <Clock className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-500">
                {Math.max(0, stats.totalItems - stats.expiredItems)}
              </div>
              <div className="text-sm text-muted-foreground">Restorable</div>
            </div>
            <RotateCcw className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search deleted items..."
              className="field pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="field sm:w-48"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">All Types</option>
            <option value="course">Courses</option>
            <option value="participant">Participants</option>
            <option value="user">Users</option>
            <option value="payment">Payments</option>
            <option value="attendance">Attendance</option>
            <option value="checklist">Checklists</option>
            <option value="workshop">Workshops</option>
            <option value="programme">Programmes</option>
          </select>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4">Item</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Deleted By</th>
                <th className="text-left py-3 px-4">Deleted At</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item) => {
                const Icon = TYPE_ICONS[item.type];
                const isExpired = isItemExpired(item.deletedAt);
                const isExpiring = isItemExpiringSoon(item.deletedAt);
                const daysLeft = getDaysUntilExpiration(item.deletedAt);
                
                return (
                  <tr key={item.id} className={`hover:bg-muted/50 ${isExpired ? 'opacity-50' : ''}`}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${TYPE_COLORS[item.type]}`} />
                        <div>
                          <div className="font-medium">{getItemDisplayName(item)}</div>
                          {getItemDetails(item).map((detail, idx) => (
                            <div key={idx} className="text-xs text-muted-foreground">{detail}</div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="badge badge-muted capitalize">{item.type}</span>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">{item.deletedBy}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {formatDeletionDate(item.deletedAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      {isExpired ? (
                        <span className="badge badge-danger">Expired</span>
                      ) : isExpiring ? (
                        <span className="badge badge-warning">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          {daysLeft} days left
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          {daysLeft} days left
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1">
                        {canManage && !isExpired && (
                          <button
                            onClick={() => handleRestore(item)}
                            className="btn-icon btn-icon-primary"
                            title="Restore Item"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {canManage && (
                          <button
                            onClick={() => handlePermanentDelete(item)}
                            className="btn-icon btn-icon-danger"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    {recycledItems.length === 0 ? 'Recycle bin is empty' : 'No items match your filters'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowConfirmDialog(null)}>
          <div className="modal-box max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {showConfirmDialog.type === 'restore' && 'Restore Item'}
                {showConfirmDialog.type === 'delete' && 'Delete Permanently'}
                {showConfirmDialog.type === 'empty' && 'Empty Recycle Bin'}
              </h3>
              
              <p className="text-muted-foreground mb-6">
                {showConfirmDialog.type === 'restore' && (
                  <>
                    Are you sure you want to restore "{showConfirmDialog.item ? getItemDisplayName(showConfirmDialog.item) : ''}"?
                    This will add it back to the system.
                  </>
                )}
                {showConfirmDialog.type === 'delete' && (
                  <>
                    Are you sure you want to permanently delete "{showConfirmDialog.item ? getItemDisplayName(showConfirmDialog.item) : ''}"?
                    This action cannot be undone.
                  </>
                )}
                {showConfirmDialog.type === 'empty' && (
                  <>
                    Are you sure you want to empty the recycle bin? This will permanently delete all {recycledItems.length} items.
                    This action cannot be undone.
                  </>
                )}
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmDialog(null)}
                  className="btn btn-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  className={`btn ${
                    showConfirmDialog.type === 'restore' ? 'btn-primary' : 'btn-danger'
                  }`}
                >
                  {showConfirmDialog.type === 'restore' && 'Restore'}
                  {showConfirmDialog.type === 'delete' && 'Delete Permanently'}
                  {showConfirmDialog.type === 'empty' && 'Empty Bin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
