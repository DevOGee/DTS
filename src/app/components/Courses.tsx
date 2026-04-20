import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { Search, Edit, Trash2, Plus, ExternalLink, X, Save, BookOpen, Target, TrendingUp, CheckCircle2, Upload, Download, FileText, AlertCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { GROUPS, Group, mockProgrammes, Course } from '../data/mockData';
import { PaginationControls } from './ui/PaginationControls';
import { usePagination } from '../hooks/usePagination';

const EMPTY: Omit<Course, 'id'> = {
  code: '', name: '', programmeId: mockProgrammes[0]?.id ?? '', level: '',
  courseType: 'Technical', assignedGroup: 'A', completedModules: 0, totalModules: 10,
  sourceDocLink: '', lmsLink: '',
};

export function Courses() {
  const { user } = useAuth();
  const { courses, addCourse, updateCourse, removeCourse } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState<Group | 'all'>('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'Technical' | 'Non-Technical'>('all');
  const [form, setForm] = useState<Omit<Course, 'id'>>(EMPTY);
  const [toast, setToast] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL-based state management
  const locationPath = location.pathname;
  const isAddMode = locationPath === '/courses/add-course';
  const isEditMode = locationPath.startsWith('/courses/edit/') && locationPath.split('/')[3];
  const isViewMode = !isAddMode && !isEditMode;

  const canEdit = user?.role !== 'Viewer/Digitiser';
  const canDelete = user?.role === 'System Admin';

  const levels = useMemo(() => Array.from(new Set(courses.map(c => c.level))).filter(Boolean), [courses]);

  const filtered = useMemo(() => courses.filter(c => {
    const s = search.toLowerCase();
    return (c.name.toLowerCase().includes(s) || c.code.toLowerCase().includes(s)) &&
      (filterGroup === 'all' || c.assignedGroup === filterGroup) &&
      (filterLevel === 'all' || c.level === filterLevel) &&
      (filterType === 'all' || c.courseType === filterType);
  }), [courses, search, filterGroup, filterLevel, filterType]);

  const totalModules = courses.reduce((s, c) => s + c.totalModules, 0);
  const pagination = usePagination(filtered.length, 10);
  const paginatedCourses = useMemo(
    () => filtered.slice(pagination.offset, pagination.offset + pagination.limit),
    [filtered, pagination.offset, pagination.limit]
  );

  const completedModules = courses.reduce((s, c) => s + c.completedModules, 0);
  const completionPct = totalModules ? Math.round(completedModules / totalModules * 100) : 0;
  const techCount = courses.filter(c => c.courseType === 'Technical').length;
  const nonTechCount = courses.filter(c => c.courseType === 'Non-Technical').length;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // URL-based navigation functions
  const openAdd = () => navigate('/courses/add-course');
  const openEdit = (c: Course) => navigate(`/courses/edit/${c.id}`);
  const closeForm = () => navigate('/courses');

  // Initialize form based on URL mode
  useEffect(() => {
    if (isAddMode) {
      setForm(EMPTY);
    } else if (isEditMode) {
      const courseId = locationPath.split('/')[3];
      const course = courses.find(c => c.id === courseId);
      if (course) {
        setForm({ ...course });
      }
    }
  }, [locationPath, courses, isAddMode, isEditMode]);

  // CSV Export Function
  const exportToCSV = () => {
    const headers = ['Course Code', 'Course Name', 'Programme', 'Level', 'Course Type', 'Assigned Group', 'Completed Modules', 'Total Modules', 'Source Doc Link', 'LMS Link'];
    const csvData = filtered.map(course => {
      const programme = mockProgrammes.find(p => p.id === course.programmeId);
      return [
        course.code,
        course.name,
        programme?.name || '',
        course.level,
        course.courseType,
        course.assignedGroup,
        course.completedModules,
        course.totalModules,
        course.sourceDocLink || '',
        course.lmsLink || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `courses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Courses exported successfully!');
  };

  // Download Template Function
  const downloadTemplate = () => {
    const headers = ['Course Code*', 'Course Name*', 'Programme*', 'Level*', 'Course Type*', 'Assigned Group*', 'Completed Modules', 'Total Modules', 'Source Doc Link', 'LMS Link'];
    const sampleData = [
      ['COURSE101', 'Introduction to Programming', 'Bachelor of Science in Computer Science', 'Level 1.1', 'Technical', 'A', '0', '10', '', ''],
      ['COURSE102', 'Advanced Mathematics', 'Bachelor of Mathematics and Computing', 'Level 2.1', 'Technical', 'B', '5', '10', '', '']
    ];

    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'courses_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Template downloaded successfully!');
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
      const expectedHeaders = ['Course Code*', 'Course Name*', 'Programme*', 'Level*', 'Course Type*', 'Assigned Group*', 'Completed Modules', 'Total Modules', 'Source Doc Link', 'LMS Link'];
      
      // Validate headers
      const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        setUploadErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
        return;
      }

      const newCourses: Course[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const rowData: any = {};
          
          headers.forEach((header, index) => {
            rowData[header] = values[index] || '';
          });

          // Validate required fields
          if (!rowData['Course Code*'] || !rowData['Course Name*'] || !rowData['Programme*'] || !rowData['Level*'] || !rowData['Course Type*'] || !rowData['Assigned Group*']) {
            errors.push(`Row ${i + 1}: Missing required fields`);
            continue;
          }

          // Find programme
          const programme = mockProgrammes.find(p => p.name === rowData['Programme*']);
          if (!programme) {
            errors.push(`Row ${i + 1}: Programme "${rowData['Programme*']}" not found`);
            continue;
          }

          // Validate group
          if (!GROUPS.includes(rowData['Assigned Group*'])) {
            errors.push(`Row ${i + 1}: Invalid group "${rowData['Assigned Group*']}"`);
            continue;
          }

          // Validate course type
          if (!['Technical', 'Non-Technical'].includes(rowData['Course Type*'])) {
            errors.push(`Row ${i + 1}: Invalid course type "${rowData['Course Type*']}"`);
            continue;
          }

          const newCourse: Course = {
            id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            code: rowData['Course Code*'],
            name: rowData['Course Name*'],
            programmeId: programme.id,
            level: rowData['Level*'],
            courseType: rowData['Course Type*'] as 'Technical' | 'Non-Technical',
            assignedGroup: rowData['Assigned Group*'] as Group,
            completedModules: parseInt(rowData['Completed Modules']) || 0,
            totalModules: parseInt(rowData['Total Modules']) || 10,
            sourceDocLink: rowData['Source Doc Link'],
            lmsLink: rowData['LMS Link']
          };

          newCourses.push(newCourse);
        } catch (error) {
          errors.push(`Row ${i + 1}: Error processing row - ${error}`);
        }
      }

      if (errors.length > 0) {
        setUploadErrors(errors);
      } else {
        // Add all courses
        for (const course of newCourses) {
          addCourse(course);
        }
        showToast(`Successfully imported ${newCourses.length} courses!`);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      setUploadErrors([`Error reading file: ${error}`]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (!form.code.trim() || !form.name.trim()) { showToast('Course code and name are required.'); return; }
    if (isAddMode) {
      addCourse({ ...form, id: `c-${Date.now()}` });
      showToast('Course added successfully.');
    } else if (isEditMode) {
      const courseId = locationPath.split('/')[3];
      updateCourse({ ...form, id: courseId });
      showToast('Course updated successfully.');
    }
    closeForm();
  };

  const handleDelete = (c: Course) => {
    if (confirm(`Delete "${c.name}"?`)) { 
      removeCourse(c.id, user?.name || 'Unknown'); 
      showToast('Course moved to recycle bin.'); 
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <div className="toast">{toast}</div>}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage course information and track progress</p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
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
                <Plus className="w-4 h-4" /> Add Course
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
          { icon: BookOpen, label: 'Total Courses', value: courses.length, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Target, label: 'Total Modules', value: totalModules, color: 'text-secondary', bg: 'bg-secondary/10' },
          { icon: TrendingUp, label: 'Technical', value: techCount, color: 'text-chart-5', bg: 'bg-chart-5/10' },
          { icon: CheckCircle2, label: 'Non-Technical', value: nonTechCount, color: 'text-chart-4', bg: 'bg-chart-4/10' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl p-5 border border-border card-hover">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="stat-number">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Overall Module Completion</span>
          <span className="text-sm font-semibold text-primary">{completedModules}/{totalModules}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div className="progress-bar" style={{ width: `${completionPct}%` }} />
        </div>
      </div>

      {/* Table card */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input className="field pl-9" placeholder="Search by code or name" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="field sm:w-36" value={filterGroup} onChange={e => setFilterGroup(e.target.value as any)}>
              <option value="all">All Groups</option>
              {GROUPS.map(g => <option key={g} value={g}>Group {g}</option>)}
            </select>
            <select className="field sm:w-36" value={filterType} onChange={e => setFilterType(e.target.value as any)}>
              <option value="all">All Types</option>
              <option value="Technical">Technical</option>
              <option value="Non-Technical">Non-Technical</option>
            </select>
            <select className="field sm:w-36" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
              <option value="all">All Levels</option>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-semibold text-sm">Code</th>
                <th className="text-left p-4 font-semibold text-sm">Course</th>
                <th className="text-left p-4 font-semibold text-sm">Level</th>
                <th className="text-left p-4 font-semibold text-sm">Type</th>
                <th className="text-left p-4 font-semibold text-sm">Group</th>
                <th className="text-left p-4 font-semibold text-sm">Progress</th>
                <th className="text-left p-4 font-semibold text-sm">Links</th>
                <th className="text-left p-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedCourses.map(course => {
                const prog = mockProgrammes.find(p => p.id === course.programmeId);
                const pct = Math.round(course.completedModules / course.totalModules * 100);
                return (
                  <tr key={course.id} className="table-row-hover transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-primary">{course.code}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium">{course.name}</div>
                      <div className="text-xs text-muted-foreground">{prog?.name}</div>
                    </td>
                    <td className="py-3.5 px-4"><span className="badge badge-muted">L{course.level}</span></td>
                    <td className="py-3.5 px-4">
                      <span className={course.courseType === 'Technical' ? 'badge badge-primary' : 'badge badge-muted'}>
                        {course.courseType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4"><span className="badge badge-primary">Grp {course.assignedGroup}</span></td>
                    <td className="py-3.5 px-4 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div className="progress-bar" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium w-16 text-right">{course.completedModules}/{course.totalModules}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-2">
                        {course.sourceDocLink && <a href={course.sourceDocLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-70" title="Source Doc"><ExternalLink className="w-4 h-4" /></a>}
                        {course.lmsLink && <a href={course.lmsLink} target="_blank" rel="noopener noreferrer" className="text-secondary hover:opacity-70" title="LMS"><ExternalLink className="w-4 h-4" /></a>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1">
                        {canEdit && <button onClick={() => openEdit(course)} className="btn-icon btn-icon-primary"><Edit className="w-4 h-4" /></button>}
                        {canDelete && <button onClick={() => handleDelete(course)} className="btn-icon btn-icon-danger"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedCourses.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">No courses match your filters.</td></tr>
              )}
            </tbody>
          </table>
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
          <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">{isAddMode ? 'Add Course' : 'Edit Course'}</h2>
              <button onClick={closeForm} className="btn-icon p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-sm font-medium">Course Code *</label>
                <input className="field" value={form.code} onChange={set('code')} placeholder="e.g. HCT 100" />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium">Course Name *</label>
                <input className="field" value={form.name} onChange={set('name')} placeholder="Course name" />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium">Programme *</label>
                <select className="field" value={form.programmeId} onChange={set('programmeId')}>
                  {mockProgrammes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium">Level *</label>
                <input className="field" value={form.level} onChange={set('level')} placeholder="e.g. 1.1" />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium">Course Type *</label>
                <select className="field" value={form.courseType} onChange={set('courseType')}>
                  <option value="Technical">Technical</option>
                  <option value="Non-Technical">Non-Technical</option>
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium">Assigned Group *</label>
                <select className="field" value={form.assignedGroup} onChange={set('assignedGroup')}>
                  {GROUPS.map(g => <option key={g} value={g}>Group {g}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium">Completed Modules</label>
                <input type="number" className="field" value={form.completedModules} onChange={e => setForm(f => ({ ...f, completedModules: Number(e.target.value) }))} min={0} max={form.totalModules} />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium">Total Modules</label>
                <input type="number" className="field" value={form.totalModules} onChange={e => setForm(f => ({ ...f, totalModules: Number(e.target.value) }))} min={1} />
              </div>
              <div className="sm:col-span-2">
                <label className="block mb-1.5 text-sm font-medium">Source Document Link</label>
                <input className="field" value={form.sourceDocLink} onChange={set('sourceDocLink')} placeholder="https://drive.google.com/..." />
              </div>
              <div className="sm:col-span-2">
                <label className="block mb-1.5 text-sm font-medium">LMS Link</label>
                <input className="field" value={form.lmsLink} onChange={set('lmsLink')} placeholder="https://lms.ouk.ac.ke/..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button onClick={closeForm} className="btn btn-muted">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary">
                <Save className="w-4 h-4" />
                {isAddMode ? 'Add Course' : 'Update Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
