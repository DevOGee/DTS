import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router';
import { MapPin, Calendar, Clock, Users, Activity, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Workshop } from '../data/mockData';

export function Workshops() {
  const { user } = useAuth();
  const { workshop, courses, participants } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const { success } = useToast();
  
  // URL-based state management
  const locationPath = location.pathname;
  const isAddMode = locationPath === '/workshops/add-workshop';
  const isEditMode = locationPath.startsWith('/workshops/edit/') && locationPath.split('/')[3];
  const isViewMode = !isAddMode && !isEditMode;
  
  // Get filter status from URL parameters
  const urlStatus = searchParams.get('status') as 'all' | 'active' | 'upcoming' | 'completed' | null;
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'upcoming' | 'completed'>(urlStatus || 'all');

  const isAdmin = user?.role === 'System Admin';
  const canEditWorkshops = isAdmin;


  // Update URL when filter changes
  useEffect(() => {
    if (filterStatus !== 'all') {
      setSearchParams({ status: filterStatus });
    } else {
      setSearchParams({});
    }
  }, [filterStatus, setSearchParams]);

  // Initialize from URL on mount
  useEffect(() => {
    if (urlStatus && ['all', 'active', 'upcoming', 'completed'].includes(urlStatus)) {
      setFilterStatus(urlStatus);
    }
  }, [urlStatus]);

  // URL-based navigation functions
  const openAddWorkshop = () => navigate('/workshops/add-workshop');
  const openEditWorkshop = (workshop: Workshop) => navigate(`/workshops/edit/${workshop.id}`);
  const closeForm = () => navigate('/workshops');

  const handleEditWorkshop = (workshop: Workshop) => {
    openEditWorkshop(workshop);
  };

  const handleSaveWorkshop = (updatedWorkshop: Workshop) => {
    success(`Workshop "${updatedWorkshop.name}" has been updated successfully.`, 'Workshop Updated');
    closeForm();
  };

  const handleDeleteWorkshop = (workshop: Workshop) => {
    if (confirm(`Are you sure you want to delete "${workshop.name}"? This action cannot be undone.`)) {
      success(`Workshop "${workshop.name}" has been deleted.`, 'Workshop Deleted');
    }
  };

  const handleAddWorkshop = (newWorkshop: Omit<Workshop, 'id'>) => {
    const workshopWithId: Workshop = { ...newWorkshop, id: `w-${Date.now()}` };
    success(`Workshop "${workshopWithId.name}" has been added to the schedule.`, 'Workshop Added');
    closeForm();
  };

  // Real workshop data for all statuses
  const allWorkshops: Workshop[] = [
    // Active/In Progress Workshop (Current)
    workshop,
    
    // Additional Active/In Progress Workshops
    {
      id: 'w2',
      name: 'OUK Content Digitisation Phase 2',
      venue: 'JKUAT Main Campus - ICT Building',
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Started 2 days ago
      numberOfDays: 10,
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // Ends in 8 days
      status: 'Active'
    },
    {
      id: 'w3',
      name: 'OUK STEM Digitisation Workshop',
      venue: 'JKUAT Main Campus - Engineering Block',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Started 5 days ago
      numberOfDays: 14,
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // Ends in 9 days
      status: 'Active'
    },
    
    // Upcoming Workshops
    {
      id: 'w4',
      name: 'OUK Advanced Digitisation Workshop 2026',
      venue: 'JKUAT Main Campus - Library',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      numberOfDays: 5,
      endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000), // 11 days from now
      status: 'Upcoming'
    },
    {
      id: 'w5',
      name: 'OUK Multimedia Production Workshop',
      venue: 'JKUAT Main Campus - Media Center',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      numberOfDays: 7,
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      status: 'Upcoming'
    },
    {
      id: 'w6',
      name: 'OUK Digital Assessment Workshop',
      venue: 'JKUAT Main Campus - Conference Hall',
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      numberOfDays: 3,
      endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000), // 23 days from now
      status: 'Upcoming'
    },
    
    // Completed Workshops
    {
      id: 'w7',
      name: 'OUK Foundation Digitisation Workshop 2025',
      venue: 'JKUAT Main Campus - Main Hall',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      numberOfDays: 7,
      endDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000), // 24 days ago
      status: 'Completed'
    },
    {
      id: 'w8',
      name: 'OUK Pilot Digitisation Programme',
      venue: 'JKUAT Main Campus - ICT Lab',
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      numberOfDays: 5,
      endDate: new Date(Date.now() - 41 * 24 * 60 * 60 * 1000), // 41 days ago
      status: 'Completed'
    },
    {
      id: 'w9',
      name: 'OUK Technical Training Workshop',
      venue: 'JKUAT Main Campus - Training Center',
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      numberOfDays: 10,
      endDate: new Date(Date.now() - 51 * 24 * 60 * 60 * 1000), // 51 days ago
      status: 'Completed'
    }
  ];

  const getWorkshopStatus = (workshop: Workshop) => {
    const now = Date.now();
    const start = new Date(workshop.startDate).getTime();
    const end = new Date(workshop.endDate).getTime();
    
    if (now >= start && now <= end) return 'Active/In Progress';
    if (now < start) return 'Upcoming';
    return 'Completed';
  };

  const filteredWorkshops = allWorkshops.filter(w => {
    if (filterStatus === 'all') return true;
    const status = getWorkshopStatus(w);
    if (filterStatus === 'active') return status === 'Active/In Progress';
    if (filterStatus === 'upcoming') return status === 'Upcoming';
    if (filterStatus === 'completed') return status === 'Completed';
    return true;
  }).sort((a, b) => {
    // If not "all" filter, don't apply special sorting
    if (filterStatus !== 'all') return 0;
    
    // Get statuses for sorting
    const statusA = getWorkshopStatus(a);
    const statusB = getWorkshopStatus(b);
    
    // Define priority order
    const priority = {
      'Active/In Progress': 1,
      'Upcoming': 2,
      'Completed': 3
    };
    
    // Sort by priority first
    const priorityDiff = priority[statusA] - priority[statusB];
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same status, sort by start date (earliest first for active, latest first for upcoming/completed)
    if (statusA === 'Active/In Progress') {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    } else if (statusA === 'Upcoming') {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    } else {
      // For completed, show most recent first
      return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
    }
  });

  const stats = useMemo(() => {
    const totalModules = courses.length * 10;
    const completedModules = courses.reduce((s, c) => s + c.completedModules, 0);
    const dailyTarget = Math.ceil(totalModules / workshop.numberOfDays);
    const now = Date.now();
    const start = new Date(workshop.startDate).getTime();
    const currentDay = Math.min(Math.max(Math.floor((now - start) / 86400000) + 1, 1), workshop.numberOfDays);
    const completionPercentage = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;
    return { totalCourses: courses.length, completionPercentage, currentDay, dailyTarget, isOnTrack: completedModules >= dailyTarget * currentDay };
  }, [courses, workshop]);

  const startDate = new Date(workshop.startDate);
  const endDate = new Date(workshop.endDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl mb-2">Workshop Management</h1>
          <p className="text-muted-foreground">Manage digitisation workshops and timelines</p>
        </div>
        <div className="flex gap-2">
          {canEditWorkshops && (
            <button onClick={openAddWorkshop} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Add Workshop
            </button>
          )}
        </div>
      </div>

      {/* Workshop Status Tabs */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex space-x-1 p-1">
          {[
            { value: 'all', label: 'All Workshops', count: allWorkshops.length },
            { value: 'active', label: 'Active/In Progress', count: allWorkshops.filter(w => getWorkshopStatus(w) === 'Active/In Progress').length },
            { value: 'upcoming', label: 'Upcoming', count: allWorkshops.filter(w => getWorkshopStatus(w) === 'Upcoming').length },
            { value: 'completed', label: 'Completed', count: allWorkshops.filter(w => getWorkshopStatus(w) === 'Completed').length }
          ].map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => setFilterStatus(value as any)}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                filterStatus === value
                  ? 'bg-background text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                filterStatus === value
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="bg-card rounded-xl border border-border">
        {/* Tab Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {filterStatus === 'all' && 'All Workshops'}
              {filterStatus === 'active' && 'Active/In Progress Workshops'}
              {filterStatus === 'upcoming' && 'Upcoming Workshops'}
              {filterStatus === 'completed' && 'Completed Workshops'}
            </h2>
            <div className="text-sm text-muted-foreground">
              {filteredWorkshops.length} workshop{filteredWorkshops.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <div className="grid gap-6">
            {filteredWorkshops.map((currentWorkshop) => {
          const workshopStatus = getWorkshopStatus(currentWorkshop);
          const workshopStartDate = new Date(currentWorkshop.startDate);
          const workshopEndDate = new Date(currentWorkshop.endDate);
          
          // Calculate realistic stats for each workshop
          const workshopStats = useMemo(() => {
            if (currentWorkshop.id === workshop.id) {
              return stats;
            }
            
            // Generate realistic stats for other workshops based on status
            const workshopStatus = getWorkshopStatus(currentWorkshop);
            const now = Date.now();
            const start = new Date(currentWorkshop.startDate).getTime();
            const end = new Date(currentWorkshop.endDate).getTime();
            
            let totalCourses = Math.floor(Math.random() * 15) + 5; // 5-20 courses
            let completionPercentage = 0;
            let currentDay = 0;
            let dailyTarget = 0;
            let isOnTrack = false;
            
            if (workshopStatus === 'Active/In Progress') {
              // Active workshops have varying progress
              const progress = Math.random() * 80 + 10; // 10-90% complete
              completionPercentage = Math.round(progress);
              currentDay = Math.min(Math.max(Math.floor((now - start) / 86400000) + 1, 1), currentWorkshop.numberOfDays);
              dailyTarget = Math.ceil(totalCourses * 10 / currentWorkshop.numberOfDays);
              isOnTrack = progress > (currentDay / currentWorkshop.numberOfDays) * 100;
            } else if (workshopStatus === 'Completed') {
              // Completed workshops are mostly done
              completionPercentage = Math.floor(Math.random() * 20) + 80; // 80-100% complete
              currentDay = currentWorkshop.numberOfDays;
              dailyTarget = Math.ceil(totalCourses * 10 / currentWorkshop.numberOfDays);
              isOnTrack = true;
            } else {
              // Upcoming workshops have no progress
              completionPercentage = 0;
              currentDay = 0;
              dailyTarget = Math.ceil(totalCourses * 10 / currentWorkshop.numberOfDays);
              isOnTrack = false;
            }
            
            return { totalCourses, completionPercentage, currentDay, dailyTarget, isOnTrack };
          }, [currentWorkshop.id, currentWorkshop.numberOfDays, currentWorkshop.startDate, currentWorkshop.endDate, stats]);

          const getStatusColor = (status: string) => {
            switch (status) {
              case 'Active/In Progress': return 'bg-green-100 text-green-700';
              case 'Upcoming': return 'bg-blue-100 text-blue-700';
              case 'Completed': return 'bg-gray-100 text-gray-700';
              default: return 'bg-muted text-muted-foreground';
            }
          };

          return (
            <div key={currentWorkshop.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white relative">
                <div className="flex items-start justify-between">
                  <div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${getStatusColor(workshopStatus)} text-white`}>
                      {workshopStatus}
                    </div>
                    <h2 className="text-3xl mb-2">{currentWorkshop.name}</h2>
                    <div className="flex items-center gap-6 text-white/90 flex-wrap">
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{currentWorkshop.venue}</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {workshopStartDate.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })} -{' '}
                        {workshopEndDate.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{currentWorkshop.numberOfDays} Days</div>
                    </div>
                  </div>
                  {canEditWorkshops && (
                    <div className="absolute top-4 right-4 flex gap-1">
                      <button onClick={() => handleEditWorkshop(currentWorkshop)} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteWorkshop(currentWorkshop)} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8">
                {/* Calculate realistic participant count for each workshop */}
                {(() => {
                  const workshopParticipants = currentWorkshop.id === workshop.id 
                    ? participants.length 
                    : Math.floor(Math.random() * 30) + 15; // 15-45 participants for other workshops
                  
                  const workshopPrograms = Math.floor(Math.random() * 3) + 3; // 3-6 programmes

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                      {[
                        { label: 'Participants', value: workshopParticipants, sub: `Across ${Math.floor(workshopParticipants/5)} groups`, icon: Users, color: 'text-primary' },
                        { label: 'Total Courses', value: workshopStats.totalCourses, sub: `${workshopPrograms} programmes`, icon: Activity, color: 'text-secondary' },
                        { label: 'Completion', value: `${workshopStats.completionPercentage}%`, sub: workshopStats.isOnTrack ? 'On Track' : 'Behind Schedule', icon: Activity, color: 'text-chart-3' },
                        { label: 'Current Day', value: workshopStats.currentDay, sub: `of ${currentWorkshop.numberOfDays} days`, icon: Clock, color: 'text-chart-4' },
                      ].map(({ label, value, sub, icon: Icon, color }) => (
                        <div key={label} className="bg-muted/50 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg"><Icon className={`w-5 h-5 ${color}`} /></div>
                            <div className="text-sm text-muted-foreground">{label}</div>
                          </div>
                          <div className="text-3xl">{value}</div>
                          <div className={`text-sm mt-1 ${sub.includes('Behind') ? 'text-destructive' : color}`}>{sub}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {currentWorkshop.id === workshop.id && (
                  <div>
                    <h3 className="text-xl mb-4">Workshop Timeline</h3>
                    <div className="space-y-3">
                      {Array.from({ length: currentWorkshop.numberOfDays }, (_, i) => {
                        const dayNum = i + 1;
                        const isCurrent = dayNum === workshopStats.currentDay;
                        const isPast = dayNum < workshopStats.currentDay;
                        const dayDate = new Date(workshopStartDate);
                        dayDate.setDate(workshopStartDate.getDate() + i);
                        return (
                          <div key={i} className={`p-4 rounded-lg border-l-4 ${isCurrent ? 'bg-primary/10 border-primary' : isPast ? 'bg-muted/50 border-border' : 'bg-background border-border/50'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${isCurrent ? 'bg-primary text-white' : isPast ? 'bg-muted text-muted-foreground' : 'bg-background border-2 border-border text-muted-foreground'}`}>
                                  {dayNum}
                                </div>
                                <div>
                                  <div className="font-medium">Day {dayNum}{isCurrent && <span className="ml-2 text-primary text-sm">(Today)</span>}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">Daily Target</div>
                                <div className="text-xl font-semibold">{workshopStats.dailyTarget} modules</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
          </div>
        </div>
      </div>

      {/* Edit/Add Workshop Modal */}
      {(isAddMode || isEditMode) && (
        <div className="modal-backdrop" onClick={e => {
          if (e.target === e.currentTarget) {
            setEditingWorkshop(null);
            closeForm();
          }
        }}>
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">
                {editingWorkshop !== null ? 'Edit Workshop' : 'Add New Workshop'}
              </h2>
              <button 
                onClick={closeForm}
                className="btn-icon p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block mb-1.5 text-sm font-medium">Workshop Name</label>
                  <input
                    type="text"
                    className="field"
                    defaultValue={editingWorkshop?.name || ''}
                    placeholder="e.g., OUK Digitisation Workshop 2026"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Venue</label>
                  <input
                    type="text"
                    className="field"
                    defaultValue={editingWorkshop?.venue || ''}
                    placeholder="e.g., JKUAT Main Campus"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Duration (Days)</label>
                  <input
                    type="number"
                    className="field"
                    defaultValue={editingWorkshop?.numberOfDays || 7}
                    min={1}
                    max={30}
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    className="field"
                    defaultValue={editingWorkshop ? new Date(editingWorkshop.startDate).toISOString().split('T')[0] : ''}
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    className="field"
                    defaultValue={editingWorkshop ? new Date(editingWorkshop.endDate).toISOString().split('T')[0] : ''}
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Status</label>
                  <select className="field" defaultValue={editingWorkshop?.status || 'Active'}>
                    <option value="Active">Active</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button 
                onClick={closeForm}
                className="btn btn-muted"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (editingWorkshop) {
                    handleSaveWorkshop(editingWorkshop);
                  } else {
                    // Handle add workshop - in real implementation would collect form data
                    handleAddWorkshop({
                      name: 'New Workshop',
                      venue: 'JKUAT Main Campus',
                      startDate: new Date(),
                      numberOfDays: 7,
                      endDate: new Date(),
                      status: 'Active'
                    });
                  }
                }} 
                className="btn btn-primary"
              >
                <Save className="w-4 h-4" />
                {editingWorkshop !== null ? 'Save Changes' : 'Add Workshop'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
