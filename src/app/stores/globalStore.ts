import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Programme, Course, User, Workshop, Participant } from '../data/mockData';

// Academic Levels Configuration
export const ACADEMIC_LEVELS = [
  'Level 1.1', 'Level 1.2', 'Level 1.3', 'Level 1.4',
  'Level 2.1', 'Level 2.2', 'Level 2.3', 'Level 2.4',
  'Level 3.1', 'Level 3.2', 'Level 3.3', 'Level 3.4',
  'Level 4.1', 'Level 4.2'
] as const;

export type AcademicLevel = typeof ACADEMIC_LEVELS[number];

// Course Types
export const COURSE_TYPES = {
  TECHNICAL: 'Technical',
  NON_TECHNICAL: 'Non-Technical'
} as const;

export type CourseType = typeof COURSE_TYPES[keyof typeof COURSE_TYPES];

// Global Store Interface
interface GlobalStore {
  // Academic Data
  academicLevels: AcademicLevel[];
  programmes: Programme[];
  courses: Course[];
  
  // User Data
  users: User[];
  currentUser: User | null;
  
  // Workshop Data
  workshops: Workshop[];
  
  // Participant Data
  participants: Participant[];
  
  // System State
  isLoading: boolean;
  lastSync: Date | null;
  
  // Actions
  setAcademicLevels: (levels: AcademicLevel[]) => void;
  setProgrammes: (programmes: Programme[]) => void;
  setCourses: (courses: Course[]) => void;
  setUsers: (users: User[]) => void;
  setCurrentUser: (user: User | null) => void;
  setWorkshops: (workshops: Workshop[]) => void;
  setParticipants: (participants: Participant[]) => void;
  
  // CRUD Operations
  addProgramme: (programme: Programme) => void;
  updateProgramme: (id: string, updates: Partial<Programme>) => void;
  deleteProgramme: (id: string) => void;
  
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  addWorkshop: (workshop: Workshop) => void;
  updateWorkshop: (id: string, updates: Partial<Workshop>) => void;
  deleteWorkshop: (id: string) => void;
  
  addParticipant: (participant: Participant) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;
  
  // Utility Actions
  setLoading: (loading: boolean) => void;
  updateLastSync: () => void;
  resetStore: () => void;
  
  // Computed Values
  getProgrammesByLevel: (level: AcademicLevel) => Programme[];
  getCoursesByLevel: (level: AcademicLevel) => Course[];
  getParticipantsByGroup: (group: string) => Participant[];
  getWorkshopsByStatus: (status: string) => Workshop[];
}

// Initial State
const initialState = {
  academicLevels: ACADEMIC_LEVELS,
  programmes: [],
  courses: [],
  users: [],
  currentUser: null,
  workshops: [],
  participants: [],
  isLoading: false,
  lastSync: null,
};

// Create the store
export const useGlobalStore = create<GlobalStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Setters
      setAcademicLevels: (levels) => set({ academicLevels: levels }),
      setProgrammes: (programmes) => set({ programmes }),
      setCourses: (courses) => set({ courses }),
      setUsers: (users) => set({ users }),
      setCurrentUser: (currentUser) => set({ currentUser }),
      setWorkshops: (workshops) => set({ workshops }),
      setParticipants: (participants) => set({ participants }),
      
      // Programme CRUD
      addProgramme: (programme) => set((state) => ({
        programmes: [...state.programmes, programme]
      })),
      
      updateProgramme: (id, updates) => set((state) => ({
        programmes: state.programmes.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      
      deleteProgramme: (id) => set((state) => ({
        programmes: state.programmes.filter(p => p.id !== id)
      })),
      
      // Course CRUD
      addCourse: (course) => set((state) => ({
        courses: [...state.courses, course]
      })),
      
      updateCourse: (id, updates) => set((state) => ({
        courses: state.courses.map(c => 
          c.id === id ? { ...c, ...updates } : c
        )
      })),
      
      deleteCourse: (id) => set((state) => ({
        courses: state.courses.filter(c => c.id !== id)
      })),
      
      // User CRUD
      addUser: (user) => set((state) => ({
        users: [...state.users, user]
      })),
      
      updateUser: (id, updates) => set((state) => ({
        users: state.users.map(u => 
          u.id === id ? { ...u, ...updates } : u
        ),
        currentUser: state.currentUser?.id === id 
          ? { ...state.currentUser, ...updates } 
          : state.currentUser
      })),
      
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id),
        currentUser: state.currentUser?.id === id ? null : state.currentUser
      })),
      
      // Workshop CRUD
      addWorkshop: (workshop) => set((state) => ({
        workshops: [...state.workshops, workshop]
      })),
      
      updateWorkshop: (id, updates) => set((state) => ({
        workshops: state.workshops.map(w => 
          w.id === id ? { ...w, ...updates } : w
        )
      })),
      
      deleteWorkshop: (id) => set((state) => ({
        workshops: state.workshops.filter(w => w.id !== id)
      })),
      
      // Participant CRUD
      addParticipant: (participant) => set((state) => ({
        participants: [...state.participants, participant]
      })),
      
      updateParticipant: (id, updates) => set((state) => ({
        participants: state.participants.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      
      deleteParticipant: (id) => set((state) => ({
        participants: state.participants.filter(p => p.id !== id)
      })),
      
      // Utility Actions
      setLoading: (isLoading) => set({ isLoading }),
      updateLastSync: () => set({ lastSync: new Date() }),
      resetStore: () => set(initialState),
      
      // Computed Values
      getProgrammesByLevel: (level) => {
        const state = get();
        return state.programmes.filter(p => p.currentLevel === level);
      },
      
      getCoursesByLevel: (level) => {
        const state = get();
        return state.courses.filter(c => c.level === level);
      },
      
      getParticipantsByGroup: (group) => {
        const state = get();
        return state.participants.filter(p => p.group === group);
      },
      
      getWorkshopsByStatus: (status) => {
        const state = get();
        return state.workshops.filter(w => w.status === status);
      },
    }),
    {
      name: 'dts-global-store',
      partialize: (state) => ({
        // Only persist essential data
        programmes: state.programmes,
        courses: state.courses,
        users: state.users,
        workshops: state.workshops,
        participants: state.participants,
        lastSync: state.lastSync,
      }),
    }
  )
);

// Hooks for specific data types
export function useAcademicData() {
  const store = useGlobalStore();
  
  return {
    academicLevels: store.academicLevels,
    programmes: store.programmes,
    courses: store.courses,
    getProgrammesByLevel: store.getProgrammesByLevel,
    getCoursesByLevel: store.getCoursesByLevel,
    setProgrammes: store.setProgrammes,
    setCourses: store.setCourses,
    addProgramme: store.addProgramme,
    updateProgramme: store.updateProgramme,
    deleteProgramme: store.deleteProgramme,
    addCourse: store.addCourse,
    updateCourse: store.updateCourse,
    deleteCourse: store.deleteCourse,
  };
}

export function useUserData() {
  const store = useGlobalStore();
  
  return {
    users: store.users,
    currentUser: store.currentUser,
    setCurrentUser: store.setCurrentUser,
    setUsers: store.setUsers,
    addUser: store.addUser,
    updateUser: store.updateUser,
    deleteUser: store.deleteUser,
  };
}

export function useWorkshopData() {
  const store = useGlobalStore();
  
  return {
    workshops: store.workshops,
    setWorkshops: store.setWorkshops,
    addWorkshop: store.addWorkshop,
    updateWorkshop: store.updateWorkshop,
    deleteWorkshop: store.deleteWorkshop,
    getWorkshopsByStatus: store.getWorkshopsByStatus,
  };
}

export function useParticipantData() {
  const store = useGlobalStore();
  
  return {
    participants: store.participants,
    setParticipants: store.setParticipants,
    addParticipant: store.addParticipant,
    updateParticipant: store.updateParticipant,
    deleteParticipant: store.deleteParticipant,
    getParticipantsByGroup: store.getParticipantsByGroup,
  };
}

export function useSystemState() {
  const store = useGlobalStore();
  
  return {
    isLoading: store.isLoading,
    lastSync: store.lastSync,
    setLoading: store.setLoading,
    updateLastSync: store.updateLastSync,
    resetStore: store.resetStore,
  };
}

// Utility functions
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatAcademicLevel(level: AcademicLevel): string {
  return level.replace('Level ', 'L');
}

export function getLevelNumber(level: AcademicLevel): number {
  const match = level.match(/Level (\d)\.(\d)/);
  if (match) {
    return parseInt(match[1]) * 10 + parseInt(match[2]);
  }
  return 0;
}

export function sortAcademicLevels(levels: AcademicLevel[]): AcademicLevel[] {
  return levels.sort((a, b) => getLevelNumber(a) - getLevelNumber(b));
}

// Validation functions
export function validateAcademicLevel(level: string): level is AcademicLevel {
  return ACADEMIC_LEVELS.includes(level as AcademicLevel);
}

export function validateCourseType(type: string): type is CourseType {
  return Object.values(COURSE_TYPES).includes(type as CourseType);
}
