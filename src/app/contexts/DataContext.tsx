import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  User,
  mockUsers,
  GROUP_COLORS,
  GROUPS as DEFAULT_GROUPS,
  mockWorkshop,
  mockProgrammes,
  allMockCourses,
  mockParticipants,
  mockAttendance,
  mockPaymentSchedules,
  DSA_RATES,
  BASE_DAILY_RATE,
  DEFAULT_ROLE_PERMISSIONS,
  Role,
  Group,
  Workshop,
  Programme,
  Course,
  Participant,
  Attendance,
  PaymentSchedule,
  mockWorkshops,
} from '../data/mockData';
import { mockChecklistItems, ChecklistItem } from '../data/checklistData';
import { mockVideoLogs, mockGroupVideoStats, VideoLog, GroupVideoStats } from '../data/multimediaData';
import { useRecycleBin } from './RecycleBinContext';
import { validateWorkshop } from '../utils/workshopValidation';
import { useUsers, useGroups, useCourses } from '../../hooks/useApiQuery';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'dts_app_state';
const DATA_VERSION = '2.1'; // Increment to force cache refresh

export interface DataContextType {
  users: User[];
  groups: string[];
  workshop: Workshop;
  workshops: Workshop[];
  programmes: Programme[];
  courses: Course[];
  participants: Participant[];
  attendance: Attendance[];
  paymentSchedules: PaymentSchedule[];
  checklistItems: ChecklistItem[];
  groupColors: Record<string, string>;
  permissions: Record<Role, Record<string, boolean>>;
  baseDailyRate: number;
  dsaRates: typeof DSA_RATES;
  videoLogs: VideoLog[];
  groupVideoStats: GroupVideoStats[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  removeUser: (userId: string, deletedBy?: string) => void;
  restoreUser: (user: User) => void;
  addGroup: (name: string) => void;
  removeGroup: (name: string, deletedBy?: string) => void;
  restoreGroup: (group: { name: string; courses: Course[]; participants: Participant[] }) => void;
  renameGroup: (oldName: string, newName: string) => void;
  setWorkshop: (workshop: Workshop) => void;
  setWorkshops: (workshops: Workshop[]) => void;
  addWorkshop: (workshop: Omit<Workshop, 'id'>) => void;
  updateWorkshop: (workshop: Workshop) => void;
  removeWorkshop: (workshopId: string, deletedBy?: string) => void;
  activateWorkshop: (workshopId: string) => void;
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  removeCourse: (courseId: string, deletedBy?: string) => void;
  restoreCourse: (course: Course) => void;
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  updateParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string, deletedBy?: string) => void;
  restoreParticipant: (participant: Participant) => void;
  setAttendance: (attendance: Attendance[]) => void;
  toggleAttendance: (participantId: string, day: number) => void;
  markAttendanceDayPresent: (day: number, group: string) => void;
  setPaymentSchedules: (payments: PaymentSchedule[]) => void;
  updatePaymentSchedule: (payment: PaymentSchedule) => void;
  setChecklistItems: (items: ChecklistItem[]) => void;
  updateChecklistItem: (item: ChecklistItem) => void;
  setGroupColor: (group: string, color: string) => void;
  setPermissions: (permissions: Record<Role, Record<string, boolean>>) => void;
  setDSAConfig: (baseRate: number, rates: typeof DSA_RATES) => void;
  setVideoLogs: (logs: VideoLog[]) => void;
  setGroupVideoStats: (stats: GroupVideoStats[]) => void;
  exportState: () => void;
  resetState: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const normalizeSavedState = (saved: any) => {
  if (!saved) return null;
  try {
    const workshop = saved.workshop
      ? {
          ...saved.workshop,
          startDate: new Date(saved.workshop.startDate),
          endDate: new Date(saved.workshop.endDate),
        }
      : mockWorkshop;
    return {
      users: saved.users ?? mockUsers,
      groups: saved.groups ?? [...DEFAULT_GROUPS],
      workshop,
      workshops: saved.workshops ?? mockWorkshops,
      programmes: saved.programmes ?? mockProgrammes,
      courses: saved.courses ?? allMockCourses,
      participants: saved.participants ?? mockParticipants,
      attendance: saved.attendance ?? mockAttendance,
      paymentSchedules: saved.paymentSchedules ?? mockPaymentSchedules,
      checklistItems: saved.checklistItems ?? mockChecklistItems,
      groupColors: saved.groupColors ?? { ...GROUP_COLORS },
      permissions: saved.permissions ?? DEFAULT_ROLE_PERMISSIONS,
      baseDailyRate: saved.baseDailyRate ?? BASE_DAILY_RATE,
      dsaRates: saved.dsaRates ?? DSA_RATES,
      videoLogs: saved.videoLogs ?? mockVideoLogs,
      groupVideoStats: saved.groupVideoStats ?? mockGroupVideoStats,
    };
  } catch {
    return null;
  }
};

const loadInitialState = () => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const saved = JSON.parse(raw);
  
  // Check if cached data version matches current version
  if (saved.version !== DATA_VERSION) {
    console.log('Data version changed, clearing cache');
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
  
  return normalizeSavedState(saved);
};

export function DataProvider({ children }: { children: ReactNode }) {
  const initialState = loadInitialState();
  const { addToRecycleBin } = useRecycleBin();
  const { isAuthenticated } = useAuth();

  // React Query Hooks
  const { data: apiUsersData } = useUsers(undefined, { enabled: isAuthenticated });
  const { data: apiGroupsData } = useGroups();
  const { data: apiCoursesData } = useCourses(undefined, { enabled: isAuthenticated });

  const [users, setUsers] = useState<User[]>(initialState?.users ?? mockUsers);
  const [groups, setGroups] = useState<string[]>(initialState?.groups ?? [...DEFAULT_GROUPS]);
  const [courses, setCourses] = useState<Course[]>(initialState?.courses ?? allMockCourses);

  // Sync API data to state when it arrives
  useEffect(() => {
    if (apiUsersData && (apiUsersData as any).data) {
      const transformed = (apiUsersData as any).data.map((u: any) => ({
        ...u,
        group: u.group?.name || u.group_id // Support both structures
      }));
      setUsers(transformed);
    }
  }, [apiUsersData]);

  useEffect(() => {
    if (apiGroupsData) {
      setGroups(apiGroupsData.map((g: any) => g.name));
    }
  }, [apiGroupsData]);

  useEffect(() => {
    if (apiCoursesData && (apiCoursesData as any).data) {
      const transformed = (apiCoursesData as any).data.map((c: any) => ({
        ...c,
        completedModules: c.completed_modules,
        totalModules: c.total_modules,
        assignedGroup: c.assigned_group?.name || c.assigned_group_id || 'A'
      }));
      setCourses(transformed);
    }
  }, [apiCoursesData]);

  const [workshop, setWorkshop] = useState<Workshop>(initialState?.workshop ?? mockWorkshop);
  const [workshops, setWorkshops] = useState<Workshop[]>(initialState?.workshops ?? mockWorkshops);
  const [programmes, setProgrammes] = useState<Programme[]>(initialState?.programmes ?? mockProgrammes);
  const [participants, setParticipants] = useState<Participant[]>(initialState?.participants ?? mockParticipants);
  const [attendance, setAttendance] = useState<Attendance[]>(initialState?.attendance ?? mockAttendance);
  const [paymentSchedules, setPaymentSchedules] = useState<PaymentSchedule[]>(initialState?.paymentSchedules ?? mockPaymentSchedules);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(initialState?.checklistItems ?? mockChecklistItems);
  const [groupColors, setGroupColors] = useState<Record<string, string>>(initialState?.groupColors ?? { ...GROUP_COLORS });
  const [permissions, setPermissions] = useState<Record<Role, Record<string, boolean>>>(initialState?.permissions ?? DEFAULT_ROLE_PERMISSIONS);
  const [baseDailyRate, setBaseDailyRate] = useState<number>(initialState?.baseDailyRate ?? BASE_DAILY_RATE);
  const [dsaRates, setDsaRates] = useState<typeof DSA_RATES>(initialState?.dsaRates ?? DSA_RATES);
  const [videoLogs, setVideoLogs] = useState<VideoLog[]>(initialState?.videoLogs ?? mockVideoLogs);
  const [groupVideoStats, setGroupVideoStats] = useState<GroupVideoStats[]>(initialState?.groupVideoStats ?? mockGroupVideoStats);

  useEffect(() => {
    const payload = {
      version: DATA_VERSION,
      users,
      groups,
      workshop,
      programmes,
      courses,
      participants,
      attendance,
      paymentSchedules,
      checklistItems,
      groupColors,
      permissions,
      baseDailyRate,
      dsaRates,
      videoLogs,
      groupVideoStats,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [users, groups, workshop, programmes, courses, participants, attendance, paymentSchedules, checklistItems, groupColors, permissions, baseDailyRate, dsaRates, videoLogs, groupVideoStats]);

  const restoreCourse = (course: Course) => {
    setCourses((prev) => [...prev, course]);
  };

  const restoreParticipant = (participant: Participant) => {
    setParticipants((prev) => [...prev, participant]);
  };

  const restoreUser = (user: User) => {
    setUsers((prev) => [...prev, user]);
  };

  const restoreGroup = (data: { name: string; courses: Course[]; participants: Participant[] }) => {
    setGroups((prev) => [...prev, data.name]);
    setCourses((prev) => [...prev, ...data.courses]);
    setParticipants((prev) => [...prev, ...data.participants]);
  };

  // Listen for restore events from recycle bin
  useEffect(() => {
    const handleRestore = (event: CustomEvent) => {
      const item = event.detail;
      if (item.type === 'course') {
        restoreCourse(item.data);
      } else if (item.type === 'participant') {
        restoreParticipant(item.data);
      } else if (item.type === 'user') {
        restoreUser(item.data);
      } else if (item.type === 'group') {
        restoreGroup(item.data);
      }
    };

    window.addEventListener('restoreFromRecycleBin', handleRestore as EventListener);
    return () => window.removeEventListener('restoreFromRecycleBin', handleRestore as EventListener);
  }, [restoreCourse, restoreParticipant, restoreUser, restoreGroup]);

  const addUser = (user: User) => setUsers((prev) => [...prev, user]);
  const updateUser = (user: User) => setUsers((prev) => prev.map((item) => (item.id === user.id ? user : item)));

  const addGroup = (name: string) => {
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) return;
    setGroups((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    // Assign a default color if not already present
    setGroupColors((prev) => (prev[trimmed] ? prev : { ...prev, [trimmed]: '#037b90' }));
  };

  const removeGroup = (name: string, deletedBy?: string) => {
    const groupCourses = courses.filter((c) => c.assignedGroup === name);
    const groupParticipants = participants.filter((p) => p.group === name);

    addToRecycleBin({
      type: 'group',
      originalId: name,
      data: {
        name,
        courses: groupCourses,
        participants: groupParticipants,
      },
      deletedBy: deletedBy || 'Unknown',
      moduleName: 'Group Management',
    });

    setGroups((prev) => prev.filter((g) => g !== name));
    setCourses((prev) => prev.filter((c) => c.assignedGroup !== name));
    setParticipants((prev) => prev.filter((p) => p.group !== name));
  };

  const removeUser = (userId: string, deletedBy?: string) => {
    const userToRemove = users.find((u) => u.id === userId);
    if (userToRemove) {
      addToRecycleBin({
        type: 'user',
        originalId: userId,
        data: userToRemove,
        deletedBy: deletedBy || 'Unknown',
        moduleName: 'User Management',
      });
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const renameGroup = (oldName: string, newName: string) => {
    const trimmed = newName.trim().toUpperCase();
    if (!trimmed || trimmed === oldName) return;
    setGroups((prev) => prev.map((g) => (g === oldName ? trimmed : g)));
    setCourses((prev) => prev.map((c) => (c.assignedGroup === oldName ? { ...c, assignedGroup: trimmed as Group } : c)));
    setParticipants((prev) => prev.map((p) => (p.group === oldName ? { ...p, group: trimmed as Group } : p)));
    setGroupColors((prev) => {
      const next = { ...prev };
      if (next[oldName]) { next[trimmed] = next[oldName]; delete next[oldName]; }
      return next;
    });
  };

  const addWorkshop = (workshopData: Omit<Workshop, 'id'>) => {
    const newWorkshop: Workshop = { ...workshopData, id: `w-${Date.now()}` };
    const errors = validateWorkshop(newWorkshop, workshops);
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
    setWorkshops((prev) => [...prev, newWorkshop]);
    if (newWorkshop.status === 'Active') {
      setWorkshop(newWorkshop);
    }
  };

  const updateWorkshop = (updatedWorkshop: Workshop) => {
    const errors = validateWorkshop(updatedWorkshop, workshops.filter(w => w.id !== updatedWorkshop.id));
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }
    setWorkshops((prev) => prev.map((w) => (w.id === updatedWorkshop.id ? updatedWorkshop : w)));
    if (updatedWorkshop.status === 'Active') {
      setWorkshop(updatedWorkshop);
    } else if (workshop.id === updatedWorkshop.id) {
      // Find the earliest upcoming workshop or default to mock
      const active = workshops.find(w => w.id !== updatedWorkshop.id && w.status === 'Active');
      if (active) setWorkshop(active);
    }
  };

  const removeWorkshop = (workshopId: string, deletedBy?: string) => {
    const wToRemove = workshops.find((w) => w.id === workshopId);
    if (wToRemove) {
      addToRecycleBin({
        type: 'workshop',
        originalId: workshopId,
        data: wToRemove,
        deletedBy: deletedBy || 'Unknown',
        moduleName: 'Workshop Management',
      });
    }
    setWorkshops((prev) => prev.filter((w) => w.id !== workshopId));
  };

  const activateWorkshop = (workshopId: string) => {
    const target = workshops.find(w => w.id === workshopId);
    if (!target) return;

    const updated = { ...target, status: 'Active' as const };
    const errors = validateWorkshop(updated, []); // no existing active if we clear them
    if (errors.length > 0 && errors[0] !== `Another workshop "${target.name}" is already active. Only one active workshop is allowed.`) {
       throw new Error(errors.join('\n'));
    }

    setWorkshops(prev => prev.map(w => {
      if (w.id === workshopId) return updated;
      if (w.status === 'Active') return { ...w, status: 'Upcoming' };
      return w;
    }));
    setWorkshop(updated);
    
    // Dispatch custom event for real-time sync
    window.dispatchEvent(new CustomEvent('workshopStatusChanged', { detail: { workshopId } }));
  };

  const addCourse = (course: Course) => setCourses((prev) => [...prev, course]);
  const updateCourse = (course: Course) => setCourses((prev) => prev.map((item) => (item.id === course.id ? course : item)));
  const removeCourse = (courseId: string, deletedBy?: string) => {
    const courseToRemove = courses.find(course => course.id === courseId);
    if (courseToRemove) {
      addToRecycleBin({
        type: 'course',
        originalId: courseId,
        data: courseToRemove,
        deletedBy: deletedBy || 'Unknown',
        moduleName: 'Course Management',
      });
    }
    setCourses((prev) => prev.filter((course) => course.id !== courseId));
  };

  const addParticipant = (participant: Participant) => setParticipants((prev) => [...prev, participant]);
  const updateParticipant = (participant: Participant) => setParticipants((prev) => prev.map((item) => (item.id === participant.id ? participant : item)));
  const removeParticipant = (participantId: string, deletedBy?: string) => {
    const participantToRemove = participants.find(participant => participant.id === participantId);
    if (participantToRemove) {
      addToRecycleBin({
        type: 'participant',
        originalId: participantId,
        data: participantToRemove,
        deletedBy: deletedBy || 'Unknown',
        moduleName: 'Participant Management',
      });
    }
    setParticipants((prev) => prev.filter((item) => item.id !== participantId));
    setAttendance((prev) => prev.filter((record) => record.participantId !== participantId));
    setPaymentSchedules((prev) => prev.filter((schedule) => schedule.participantId !== participantId));
  };

  const toggleAttendance = (participantId: string, day: number) => {
    setAttendance((prev) => prev.map((record) => {
      if (record.participantId === participantId && record.day === day) {
        return { ...record, status: record.status === 'Present' ? 'Absent' : 'Present' };
      }
      return record;
    }));
  };

  const markAttendanceDayPresent = (day: number, group: string) => {
    setAttendance((prev) => prev.map((record) => {
      if (record.day !== day) return record;
      const participant = participants.find((p) => p.id === record.participantId);
      if (!participant) return record;
      if (group !== 'all' && participant.group !== group) return record;
      return { ...record, status: 'Present' };
    }));
  };

  const updatePaymentSchedule = (payment: PaymentSchedule) => setPaymentSchedules((prev) => prev.map((item) => (item.id === payment.id ? payment : item)));
  const updateChecklistItem = (item: ChecklistItem) => setChecklistItems((prev) => prev.map((existing) => (existing.id === item.id ? item : existing)));

  const setGroupColor = (group: string, color: string) => setGroupColors((prev) => ({ ...prev, [group]: color }));
  const setDSAConfig = (baseRate: number, rates: typeof DSA_RATES) => {
    setBaseDailyRate(baseRate);
    setDsaRates(rates);
  };

  const exportState = () => {
    const payload = {
      users,
      groups,
      workshop,
      programmes,
      courses,
      participants,
      attendance,
      paymentSchedules,
      checklistItems,
      groupColors,
      permissions,
      baseDailyRate,
      dsaRates,
      videoLogs,
      groupVideoStats,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dts-state-export.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetState = () => {
    setUsers(mockUsers);
    setGroups([...DEFAULT_GROUPS]);
    setWorkshop(mockWorkshop);
    setProgrammes(mockProgrammes);
    setCourses(allMockCourses);
    setParticipants(mockParticipants);
    setAttendance(mockAttendance);
    setPaymentSchedules(mockPaymentSchedules);
    setChecklistItems(mockChecklistItems);
    setGroupColors({ ...GROUP_COLORS });
    setPermissions(DEFAULT_ROLE_PERMISSIONS);
    setBaseDailyRate(BASE_DAILY_RATE);
    setDsaRates(DSA_RATES);
    setVideoLogs(mockVideoLogs);
    setGroupVideoStats(mockGroupVideoStats);
  };

  const value = useMemo(
    () => ({
      users,
      groups,
      workshop,
      workshops,
      programmes,
      courses,
      participants,
      attendance,
      paymentSchedules,
      checklistItems,
      groupColors,
      permissions,
      baseDailyRate,
      dsaRates,
      videoLogs,
      groupVideoStats,
      setUsers,
      addUser,
      updateUser,
      removeUser,
      restoreUser,
      addGroup,
      removeGroup,
      renameGroup,
      setWorkshop,
      setWorkshops,
      addWorkshop,
      updateWorkshop,
      removeWorkshop,
      activateWorkshop,
      setCourses,
      addCourse,
      updateCourse,
      removeCourse,
      restoreCourse,
      setParticipants,
      addParticipant,
      updateParticipant,
      removeParticipant,
      restoreParticipant,
      restoreGroup,
      setAttendance,
      toggleAttendance,
      markAttendanceDayPresent,
      setPaymentSchedules,
      updatePaymentSchedule,
      setChecklistItems,
      updateChecklistItem,
      setGroupColor,
      setPermissions,
      setDSAConfig,
      setVideoLogs,
      setGroupVideoStats,
      exportState,
      resetState,
    }),
    [
      users,
      groups,
      workshop,
      workshops,
      programmes,
      courses,
      participants,
      attendance,
      paymentSchedules,
      checklistItems,
      groupColors,
      permissions,
      baseDailyRate,
      dsaRates,
      videoLogs,
      groupVideoStats,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
