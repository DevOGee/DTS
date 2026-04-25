import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router';
import { MapPin, Calendar, Clock, Users, Activity, Edit, Save, X, Plus, Trash2, Power } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Workshop } from '../data/mockData';

export function WorkshopsDashboard() {
  const { user } = useAuth();
  const { workshop: activeWorkshop, workshops, courses, participants, addWorkshop, updateWorkshop, removeWorkshop, activateWorkshop } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const { success, error } = useToast();
  
  // URL-based state management
  const locationPath = location.pathname;
  const isAddMode = locationPath === '/workshops/add-workshop';
  const isEditMode = locationPath.startsWith('/workshops/edit/') && locationPath.split('/')[3];
  
  // Get filter status from URL path
  const currentTab = useMemo(() => {
    if (locationPath.includes('/active')) return 'Active';
    if (locationPath.includes('/upcoming')) return 'Upcoming';
    if (locationPath.includes('/completed')) return 'Completed';
    return 'All';
  }, [locationPath]);

  const isAdmin = user?.role === 'System Admin';
  const canEditWorkshops = isAdmin;

  // URL-based navigation functions
  const openAddWorkshop = () => navigate('/workshops/add-workshop');
  const openEditWorkshop = (workshop: Workshop) => navigate(`/workshops/edit/${workshop.id}`);
  const closeForm = () => navigate(`/workshops/${currentTab.toLowerCase()}`);
  const changeTab = (tab: string) => navigate(`/workshops/${tab.toLowerCase()}`);

  const handleEditWorkshop = (workshop: Workshop) => {
    openEditWorkshop(workshop);
  };

  const handleSaveWorkshop = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      venue: formData.get('venue') as string,
      numberOfDays: parseInt(formData.get('numberOfDays') as string, 10),
      startDate: new Date(formData.get('startDate') as string),
      endDate: new Date(formData.get('endDate') as string),
      status: formData.get('status') as 'Active' | 'Upcoming' | 'Completed'
    };

    try {
      if (editingWorkshop) {
        updateWorkshop({ ...editingWorkshop, ...data });
        success(`Workshop "${data.name}" has been updated successfully.`, 'Workshop Updated');
      } else {
        addWorkshop(data);
        success(`Workshop "${data.name}" has been added to the schedule.`, 'Workshop Added');
      }
      closeForm();
    } catch (err: any) {
      error(err.message, 'Validation Error');
    }
  };

  const handleDeleteWorkshop = (workshop: Workshop) => {
    if (confirm(`Are you sure you want to delete "${workshop.name}"? This action cannot be undone.`)) {
      removeWorkshop(workshop.id, user?.name);
      success(`Workshop "${workshop.name}" has been deleted.`, 'Workshop Deleted');
    }
  };

  const handleActivateWorkshop = (workshopId: string) => {
    try {
      activateWorkshop(workshopId);
      const w = workshops.find(w => w.id === workshopId);
      success(`Workshop "${w?.name}" is now active.`, 'Workshop Updated');
    } catch (err: any) {
      error(err.message, 'Validation Error');
    }
  };

  const filteredWorkshops = useMemo(() => {
    const list = [...workshops].sort((a, b) => {
      const priority = { 'Active': 1, 'Upcoming': 2, 'Completed': 3 };
      const priorityDiff = priority[a.status] - priority[b.status];
      if (priorityDiff !== 0) return priorityDiff;
      if (a.status === 'Active' || a.status === 'Upcoming') {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
      return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
    });

    if (currentTab === 'All') return list;
    return list.filter(w => w.status === currentTab);
  }, [workshops, currentTab]);

  const stats = useMemo(() => {
    const totalModules = courses.length * 10;
    const completedModules = courses.reduce((s, c) => s + c.completedModules, 0);
    const dailyTarget = Math.ceil(totalModules / (activeWorkshop?.numberOfDays || 1));
    const now = Date.now();
    const start = activeWorkshop ? new Date(activeWorkshop.startDate).getTime() : now;
    const currentDay = activeWorkshop ? Math.min(Math.max(Math.floor((now - start) / 86400000) + 1, 1), activeWorkshop.numberOfDays) : 0;
    const completionPercentage = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;
    return { totalCourses: courses.length, completionPercentage, currentDay, dailyTarget, isOnTrack: completedModules >= dailyTarget * currentDay };
  }, [courses, activeWorkshop]);

  return (
    <div className="space-y-6 font-inter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl mb-2 font-light">Workshop Management</h1>
          <p className="text-muted-foreground">Manage digitisation workshops and timelines</p>
        </div>
        <div className="flex gap-2">
          {canEditWorkshops && (
            <button onClick={openAddWorkshop} className="btn btn-primary shadow-sm hover:shadow-md transition-shadow">
              <Plus className="w-4 h-4" /> Add Workshop
            </button>
          )}
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-1">
        <div className="flex space-x-1">
          {['Active', 'Upcoming', 'Completed', 'All'].map((tab) => {
            const count = tab === 'All' ? workshops.length : workshops.filter(w => w.status === tab).length;
            const isActive = currentTab === tab;
            return (
              <button
                key={tab}
                onClick={() => changeTab(tab)}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-background text-foreground shadow-sm border border-border scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab === 'Active' && 'Active/In Progress'}
                {tab !== 'Active' && tab}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? tab === 'Active' ? 'bg-teal-100 text-teal-700' :
                      tab === 'Upcoming' ? 'bg-amber-100 text-amber-700' :
                      tab === 'Completed' ? 'bg-gray-100 text-gray-700' :
                      'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Content Area */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        {filteredWorkshops.map((currentWorkshop) => {
          const workshopStatus = currentWorkshop.status;
          const workshopStartDate = new Date(currentWorkshop.startDate);
          const workshopEndDate = new Date(currentWorkshop.endDate);
          
          const getStatusBadge = (status: string) => {
            switch (status) {
              case 'Active': return <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Active</span>;
              case 'Upcoming': return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Upcoming</span>;
              case 'Completed': return <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Completed</span>;
              default: return null;
            }
          };

          return (
            <div key={currentWorkshop.id} className="relative bg-card/40 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group flex flex-col">
              {/* Teal & Coral Gold Gradient Background Layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-orange-400/15 pointer-events-none z-0" />
              
              <div className="p-6 flex-grow relative z-10">
                <div className="flex justify-between items-start mb-4">
                  {getStatusBadge(workshopStatus)}
                  {canEditWorkshops && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {workshopStatus !== 'Active' && (
                        <button onClick={() => handleActivateWorkshop(currentWorkshop.id)} className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Activate Workshop">
                          <Power className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleEditWorkshop(currentWorkshop)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteWorkshop(currentWorkshop)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <h2 className="text-2xl font-semibold mb-4 leading-tight">{currentWorkshop.name}</h2>
                
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{currentWorkshop.venue}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>
                      {workshopStartDate.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })} -{' '}
                      {workshopEndDate.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{currentWorkshop.numberOfDays} Days Duration</span>
                  </div>
                </div>
              </div>

              <div className="bg-background/40 backdrop-blur-md p-6 border-t border-border/20 relative z-10">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{currentWorkshop.id === activeWorkshop?.id ? participants.length : Math.floor(Math.random() * 30) + 15} Participants</span>
                  </div>
                  {currentWorkshop.status === 'Active' && (
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-teal-500" />
                      <span className="text-teal-600 font-medium">{stats.completionPercentage}% Complete</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredWorkshops.length === 0 && (
        <div className="text-center py-20 bg-card/50 rounded-xl border border-border border-dashed">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-foreground mb-2">No workshops found</h3>
          <p className="text-muted-foreground">There are no {currentTab !== 'All' ? currentTab.toLowerCase() : ''} workshops to display.</p>
        </div>
      )}

      {/* Edit/Add Workshop Modal */}
      {(isAddMode || isEditMode) && (() => {
        const w = isEditMode ? workshops.find(w => w.id === locationPath.split('/')[3]) : null;
        if (isEditMode && !w && workshops.length > 0) {
           setEditingWorkshop(null); // or redirect
        } else if (isEditMode && w && w !== editingWorkshop) {
           setEditingWorkshop(w);
        }

        return (
        <div className="modal-backdrop bg-background/80 backdrop-blur-sm" onClick={e => {
          if (e.target === e.currentTarget) {
            setEditingWorkshop(null);
            closeForm();
          }
        }}>
          <div className="modal-box max-w-2xl bg-card shadow-2xl border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">
                {editingWorkshop ? 'Edit Workshop' : 'Add New Workshop'}
              </h2>
              <button onClick={closeForm} className="btn-icon p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveWorkshop}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block mb-1.5 text-sm font-medium">Workshop Name</label>
                    <input name="name" type="text" className="field bg-background focus:ring-2 focus:ring-primary/20" required defaultValue={editingWorkshop?.name || ''} placeholder="e.g., OUK Digitisation Workshop 2026" />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">Venue</label>
                    <input name="venue" type="text" className="field bg-background focus:ring-2 focus:ring-primary/20" required defaultValue={editingWorkshop?.venue || ''} placeholder="e.g., JKUAT Main Campus" />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">Duration (Days, max 15)</label>
                    <input name="numberOfDays" type="number" className="field bg-background focus:ring-2 focus:ring-primary/20" required defaultValue={editingWorkshop?.numberOfDays || 7} min={1} max={15} />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">Start Date</label>
                    <input name="startDate" type="date" className="field bg-background focus:ring-2 focus:ring-primary/20" required defaultValue={editingWorkshop ? new Date(editingWorkshop.startDate).toISOString().split('T')[0] : ''} />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">End Date</label>
                    <input name="endDate" type="date" className="field bg-background focus:ring-2 focus:ring-primary/20" required defaultValue={editingWorkshop ? new Date(editingWorkshop.endDate).toISOString().split('T')[0] : ''} />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm font-medium">Status</label>
                    <select name="status" className="field bg-background focus:ring-2 focus:ring-primary/20" required defaultValue={editingWorkshop?.status || 'Active'}>
                      <option value="Active">Active</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-border bg-muted/30">
                <button type="button" onClick={closeForm} className="btn bg-background border border-border hover:bg-muted">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary shadow-sm hover:shadow-md transition-all">
                  <Save className="w-4 h-4" />
                  {editingWorkshop ? 'Save Changes' : 'Add Workshop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
      })()}
    </div>
  );
}
