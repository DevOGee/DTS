import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  User,
  mockUsers,
  GROUP_COLORS,
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
} from '../data/mockData';
import { mockChecklistItems, ChecklistItem } from '../data/checklistData';
import { mockVideoLogs, mockGroupVideoStats, VideoLog, GroupVideoStats } from '../data/multimediaData';

const STORAGE_KEY = 'dts_app_state';

export interface DataContextType {
  users: User[];
  workshop: Workshop;
  programmes: Programme[];
  courses: Course[];
  participants: Participant[];
  attendance: Attendance[];
  paymentSchedules: PaymentSchedule[];
  checklistItems: ChecklistItem[];
  groupColors: Record<Group, string>;
  permissions: Record<Role, Record<string, boolean>>;
  baseDailyRate: number;
  dsaRates: typeof DSA_RATES;
  videoLogs: VideoLog[];
  groupVideoStats: GroupVideoStats[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  setWorkshop: (workshop: Workshop) => void;
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  removeCourse: (courseId: string) => void;
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  updateParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string) => void;
  setAttendance: (attendance: Attendance[]) => void;
  toggleAttendance: (participantId: string, day: number) => void;
  markAttendanceDayPresent: (day: number, group: Group | 'all') => void;
  setPaymentSchedules: (payments: PaymentSchedule[]) => void;
  updatePaymentSchedule: (payment: PaymentSchedule) => void;
  setChecklistItems: (items: ChecklistItem[]) => void;
  updateChecklistItem: (item: ChecklistItem) => void;
  setGroupColor: (group: Group, color: string) => void;
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
      workshop,
      programmes: saved.programmes ?? mockProgrammes,
      courses: saved.courses ?? allMockCourses,
      participants: saved.participants ?? mockParticipants,
      attendance: saved.attendance ?? mockAttendance,
      paymentSchedules: saved.paymentSchedules ?? mockPaymentSchedules,
      checklistItems: saved.checklistItems ?? mockChecklistItems,
      groupColors: saved.groupColors ?? GROUP_COLORS,
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
  return normalizeSavedState(saved);
};

export function DataProvider({ children }: { children: ReactNode }) {
  const initialState = loadInitialState();

  const [users, setUsers] = useState<User[]>(initialState?.users ?? mockUsers);
  const [workshop, setWorkshop] = useState<Workshop>(initialState?.workshop ?? mockWorkshop);
  const [programmes, setProgrammes] = useState<Programme[]>(initialState?.programmes ?? mockProgrammes);
  const [courses, setCourses] = useState<Course[]>(initialState?.courses ?? allMockCourses);
  const [participants, setParticipants] = useState<Participant[]>(initialState?.participants ?? mockParticipants);
  const [attendance, setAttendance] = useState<Attendance[]>(initialState?.attendance ?? mockAttendance);
  const [paymentSchedules, setPaymentSchedules] = useState<PaymentSchedule[]>(initialState?.paymentSchedules ?? mockPaymentSchedules);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(initialState?.checklistItems ?? mockChecklistItems);
  const [groupColors, setGroupColors] = useState<Record<Group, string>>(initialState?.groupColors ?? GROUP_COLORS);
  const [permissions, setPermissions] = useState<Record<Role, Record<string, boolean>>>(initialState?.permissions ?? DEFAULT_ROLE_PERMISSIONS);
  const [baseDailyRate, setBaseDailyRate] = useState<number>(initialState?.baseDailyRate ?? BASE_DAILY_RATE);
  const [dsaRates, setDsaRates] = useState<typeof DSA_RATES>(initialState?.dsaRates ?? DSA_RATES);
  const [videoLogs, setVideoLogs] = useState<VideoLog[]>(initialState?.videoLogs ?? mockVideoLogs);
  const [groupVideoStats, setGroupVideoStats] = useState<GroupVideoStats[]>(initialState?.groupVideoStats ?? mockGroupVideoStats);

  useEffect(() => {
    const payload = {
      users,
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
  }, [users, workshop, programmes, courses, participants, attendance, paymentSchedules, checklistItems, groupColors, permissions, baseDailyRate, dsaRates, videoLogs, groupVideoStats]);

  const addUser = (user: User) => setUsers((prev) => [...prev, user]);
  const updateUser = (user: User) => setUsers((prev) => prev.map((item) => (item.id === user.id ? user : item)));

  const addCourse = (course: Course) => setCourses((prev) => [...prev, course]);
  const updateCourse = (course: Course) => setCourses((prev) => prev.map((item) => (item.id === course.id ? course : item)));
  const removeCourse = (courseId: string) => setCourses((prev) => prev.filter((course) => course.id !== courseId));

  const addParticipant = (participant: Participant) => setParticipants((prev) => [...prev, participant]);
  const updateParticipant = (participant: Participant) => setParticipants((prev) => prev.map((item) => (item.id === participant.id ? participant : item)));
  const removeParticipant = (participantId: string) => {
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

  const markAttendanceDayPresent = (day: number, group: Group | 'all') => {
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

  const setGroupColor = (group: Group, color: string) => setGroupColors((prev) => ({ ...prev, [group]: color }));
  const setDSAConfig = (baseRate: number, rates: typeof DSA_RATES) => {
    setBaseDailyRate(baseRate);
    setDsaRates(rates);
  };

  const exportState = () => {
    const payload = {
      users,
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
    setWorkshop(mockWorkshop);
    setProgrammes(mockProgrammes);
    setCourses(allMockCourses);
    setParticipants(mockParticipants);
    setAttendance(mockAttendance);
    setPaymentSchedules(mockPaymentSchedules);
    setChecklistItems(mockChecklistItems);
    setGroupColors(GROUP_COLORS);
    setPermissions(DEFAULT_ROLE_PERMISSIONS);
    setBaseDailyRate(BASE_DAILY_RATE);
    setDsaRates(DSA_RATES);
    setVideoLogs(mockVideoLogs);
    setGroupVideoStats(mockGroupVideoStats);
  };

  const value = useMemo(
    () => ({
      users,
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
      setUsers,
      addUser,
      updateUser,
      setWorkshop,
      setCourses,
      addCourse,
      updateCourse,
      removeCourse,
      setParticipants,
      addParticipant,
      updateParticipant,
      removeParticipant,
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
