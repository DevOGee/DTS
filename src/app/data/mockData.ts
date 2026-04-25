export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export type Group = string;

export const ROLES = ['System Admin', 'Programme Lead', 'Group Leader', 'Viewer/Digitiser'] as const;
export type Role = typeof ROLES[number];

export const AWARD_TYPES = ['Certificate', 'Diploma', 'Degree', 'Postgraduate'] as const;
export type AwardType = typeof AWARD_TYPES[number];

export const COURSE_TYPES = ['Technical', 'Non-Technical'] as const;
export type CourseType = typeof COURSE_TYPES[number];

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: Role;
  group?: Group;
}

export interface Participant {
  id: string;
  name: string;
  role: 'Content Digitiser' | 'Multimedia Digitiser' | 'Group Leader';
  group: Group;
  dsaType: 'In-County' | 'Out-County';
  daysAttending: number;
  email: string;
}

export interface Workshop {
  id: string;
  name: string;
  venue: string;
  startDate: Date;
  numberOfDays: number;
  endDate: Date;
  status: 'Active' | 'Upcoming' | 'Completed';
}

export interface Programme {
  id: string;
  name: string;
  awardType: AwardType;
  currentLevel: string;
}

export interface Module {
  id: string;
  courseId: string;
  moduleNumber: number;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  programmeId: string;
  level: string;
  courseType: CourseType;
  sourceDocLink?: string;
  lmsLink?: string;
  assignedGroup: Group;
  completedModules: number;
  totalModules: number;
}

export interface Attendance {
  id: string;
  participantId: string;
  day: number;
  status: 'Present' | 'Absent';
}

export interface PaymentSchedule {
  id: string;
  participantId: string;
  amount: number;
  bankName: string;
  branch: string;
  bankCode: string;
  accountNumber: string;
  status: 'Pending' | 'Processed' | 'Paid';
}

// DSA Configuration
export const DSA_RATES = {
  'In-County': 0.35,
  'Out-County': 1.0,
};

export const BASE_DAILY_RATE = 5000; // KES per day

// Mock users
export const mockUsers: User[] = [
  { id: '1', username: 'admin', name: 'Dr. Sarah Mwangi', email: 'admin@ouk.ac.ke', password: 'admin123', role: 'System Admin' },
  { id: '2', username: 'plead', name: 'Prof. James Omondi', email: 'plead@ouk.ac.ke', password: 'plead123', role: 'Programme Lead' },
  { id: '3', username: 'gleader', name: 'Mary Wanjiku', email: 'gleader@ouk.ac.ke', password: 'gleader123', role: 'Group Leader', group: 'A' },
  { id: '4', username: 'viewer', name: 'Grace Akinyi', email: 'viewer@ouk.ac.ke', password: 'viewer123', role: 'Viewer/Digitiser', group: 'A' },
];

export const GROUP_COLORS: Record<Group, string> = {
  A: '#3b82f6',
  B: '#10b981',
  C: '#f59e0b',
  D: '#8b5cf6',
  E: '#ec4899',
  F: '#6366f1',
};

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Record<string, boolean>> = {
  'System Admin': {
    view_dashboard: true,
    view_reports: true,
    view_requests: true,
    view_feedback: true,
    view_recycle_bin: true,
    view_workshops: true,
    create_workshops: true,
    view_courses: true,
    edit_courses: true,
    delete_courses: true,
    view_groups: true,
    create_groups: true,
    edit_groups: true,
    view_multimedia: true,
    edit_multimedia: true,
    view_attendance: true,
    view_participants: true,
    edit_participants: true,
    view_payments: true,
    edit_payments: true,
    view_checklist: true,
    mark_attendance: true,
    role_management: true,
    admin_settings: true,
    feature_toggles: true,
    system_settings: true,
    view_users: true,
    create_users: true,
    edit_users: true,
    delete_users: true,
    permission_management: true,
  },
  'Programme Lead': {
    view_dashboard: true,
    view_reports: true,
    view_requests: true,
    view_feedback: true,
    view_recycle_bin: true,
    view_workshops: true,
    create_workshops: true,
    view_courses: true,
    edit_courses: true,
    delete_courses: true,
    view_groups: true,
    create_groups: true,
    edit_groups: true,
    view_multimedia: true,
    edit_multimedia: true,
    view_attendance: true,
    view_participants: true,
    edit_participants: true,
    view_payments: true,
    edit_payments: true,
    view_checklist: true,
    mark_attendance: true,
    role_management: false,
    admin_settings: false,
    feature_toggles: false,
    system_settings: false,
    view_users: false,
    create_users: false,
    edit_users: false,
    delete_users: false,
    permission_management: false,
  },
  'Group Leader': {
    view_dashboard: true,
    view_reports: true,
    view_requests: true,
    view_feedback: true,
    view_recycle_bin: false,
    view_workshops: true,
    create_workshops: false,
    view_courses: true,
    edit_courses: true,
    delete_courses: false,
    view_groups: true,
    create_groups: false,
    edit_groups: false,
    view_multimedia: true,
    edit_multimedia: true,
    view_attendance: true,
    view_participants: true,
    edit_participants: true,
    view_payments: false,
    edit_payments: false,
    view_checklist: true,
    mark_attendance: true,
    role_management: false,
    admin_settings: false,
    feature_toggles: false,
    system_settings: false,
    view_users: false,
    create_users: false,
    edit_users: false,
    delete_users: false,
    permission_management: false,
  },
  'Viewer/Digitiser': {
    view_dashboard: true,
    view_reports: true,
    view_requests: false,
    view_feedback: true,
    view_recycle_bin: false,
    view_workshops: true,
    create_workshops: false,
    view_courses: true,
    edit_courses: false,
    delete_courses: false,
    view_groups: true,
    create_groups: false,
    edit_groups: false,
    view_multimedia: true,
    edit_multimedia: false,
    view_attendance: true,
    view_participants: true,
    edit_participants: false,
    view_payments: false,
    edit_payments: false,
    view_checklist: true,
    mark_attendance: false,
    role_management: false,
    admin_settings: false,
    feature_toggles: false,
    system_settings: false,
    view_users: false,
    create_users: false,
    edit_users: false,
    delete_users: false,
    permission_management: false,
  },
};

// Mock workshop
export const mockWorkshop: Workshop = {
  id: 'w1',
  name: 'OUK Digitisation Workshop 2026',
  venue: 'JKUAT Main Campus',
  startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Started 3 days ago
  numberOfDays: 7,
  endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Ends in 4 days
  status: 'Active',
};

// Mock multiple workshops
export const mockWorkshops: Workshop[] = [
  mockWorkshop,
  {
    id: 'w2',
    name: 'OUK Content Digitisation Phase 2',
    venue: 'JKUAT Main Campus - ICT Building',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    numberOfDays: 10,
    endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    status: 'Upcoming' // Only one active allowed!
  },
  {
    id: 'w4',
    name: 'OUK Advanced Digitisation Workshop 2026',
    venue: 'JKUAT Main Campus - Library',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    numberOfDays: 5,
    endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
    status: 'Upcoming'
  },
  {
    id: 'w7',
    name: 'OUK Foundation Digitisation Workshop 2025',
    venue: 'JKUAT Main Campus - Main Hall',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    numberOfDays: 7,
    endDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
    status: 'Completed'
  }
];

// Mock programmes - System-wide replacement with finalized programme list
export const mockProgrammes: Programme[] = [
  // School of Science and Technology (10 Programmes)
  { id: 'p1', name: 'Bachelor of Science in Interactive Media Technologies', awardType: 'Degree', currentLevel: 'Level 2.1' },
  { id: 'p2', name: 'Bachelor of Mathematics and Computing', awardType: 'Degree', currentLevel: 'Level 3.1' },
  { id: 'p3', name: 'Master of Science in Digital Services Management', awardType: 'Postgraduate', currentLevel: 'Level 4.1' },
  { id: 'p4', name: 'Master of Science in Artificial Intelligence', awardType: 'Postgraduate', currentLevel: 'Level 4.2' },
  { id: 'p5', name: 'Bachelor of Agri-Technology and Food Systems', awardType: 'Degree', currentLevel: 'Level 2.2' },
  { id: 'p6', name: 'Master of Science in Cybersecurity and Digital Forensics', awardType: 'Postgraduate', currentLevel: 'Level 4.1' },
  { id: 'p7', name: 'Bachelor of Science in Cybersecurity and Digital Forensics', awardType: 'Degree', currentLevel: 'Level 3.2' },
  { id: 'p8', name: 'Bachelor of Data Science', awardType: 'Degree', currentLevel: 'Level 2.1' },
  { id: 'p9', name: 'Bachelor of Science in Computer Science', awardType: 'Degree', currentLevel: 'Level 3.1' },
  { id: 'p10', name: 'Master of Data Science', awardType: 'Postgraduate', currentLevel: 'Level 4.2' },
  
  // School of Education (7 Programmes)
  { id: 'p11', name: 'Postgraduate Diploma in Education', awardType: 'Postgraduate', currentLevel: 'Level 4.1' },
  { id: 'p12', name: 'Master in Learning Design and Technology (MLDT)', awardType: 'Postgraduate', currentLevel: 'Level 4.2' },
  { id: 'p13', name: 'Doctor of Philosophy in Educational Leadership and Policy', awardType: 'Postgraduate', currentLevel: 'Level 4.2' },
  { id: 'p14', name: 'Masters of Technology Education', awardType: 'Postgraduate', currentLevel: 'Level 4.1' },
  { id: 'p15', name: 'Master of Education in Educational Leadership and Policy', awardType: 'Postgraduate', currentLevel: 'Level 4.2' },
  { id: 'p16', name: 'Postgraduate Diploma in Learning Design and Technology', awardType: 'Postgraduate', currentLevel: 'Level 4.1' },
  { id: 'p17', name: 'Bachelor of Technology Education', awardType: 'Degree', currentLevel: 'Level 3.1' },
  
  // School of Business and Economics (7 Programmes)
  { id: 'p18', name: 'Doctor of Philosophy in Business Management', awardType: 'Postgraduate', currentLevel: 'Level 4.2' },
  { id: 'p19', name: 'Master of Business Administration', awardType: 'Postgraduate', currentLevel: 'Level 4.2' },
  { id: 'p20', name: 'Postgraduate Diploma in Leadership and Accountability', awardType: 'Postgraduate', currentLevel: 'Level 4.1' },
  { id: 'p21', name: 'Bachelor of Business and Entrepreneurship', awardType: 'Degree', currentLevel: 'Level 2.1' },
  { id: 'p22', name: 'Bachelor of Economics and Statistics', awardType: 'Degree', currentLevel: 'Level 3.1' },
  { id: 'p23', name: 'Bachelor of Economics and Data Science', awardType: 'Degree', currentLevel: 'Level 3.2' },
  { id: 'p24', name: 'Bachelor of Commerce', awardType: 'Degree', currentLevel: 'Level 2.2' },
];

// Mock courses - Updated to align with new programme structure
export const mockCourses: Course[] = [
  // School of Science and Technology courses
  {
    id: 'c1',
    code: 'IMT301',
    name: 'Interactive Media Design',
    programmeId: 'p1',
    level: 'Level 2.1',
    courseType: 'Technical',
    assignedGroup: 'A',
    completedModules: 8,
    totalModules: 10,
    sourceDocLink: 'https://drive.google.com/...',
    lmsLink: 'https://lms.ouk.ac.ke/...',
  },
  {
    id: 'c2',
    code: 'BMC302',
    name: 'Advanced Mathematics',
    programmeId: 'p2',
    level: 'Level 3.1',
    courseType: 'Technical',
    assignedGroup: 'B',
    completedModules: 10,
    totalModules: 10,
  },
  {
    id: 'c3',
    code: 'DSM401',
    name: 'Digital Service Architecture',
    programmeId: 'p3',
    level: 'Level 4.1',
    courseType: 'Technical',
    assignedGroup: 'C',
    completedModules: 7,
    totalModules: 10,
  },
  {
    id: 'c4',
    code: 'AI402',
    name: 'Machine Learning Fundamentals',
    programmeId: 'p4',
    level: 'Level 4.2',
    courseType: 'Technical',
    assignedGroup: 'D',
    completedModules: 9,
    totalModules: 10,
  },
  {
    id: 'c5',
    code: 'ATF201',
    name: 'Agricultural Technology Systems',
    programmeId: 'p5',
    level: 'Level 2.2',
    courseType: 'Technical',
    assignedGroup: 'E',
    completedModules: 10,
    totalModules: 10,
  },
  {
    id: 'c6',
    code: 'CDF401',
    name: 'Cybersecurity Principles',
    programmeId: 'p6',
    level: 'Level 4.1',
    courseType: 'Technical',
    assignedGroup: 'F',
    completedModules: 8,
    totalModules: 10,
  },
  {
    id: 'c7',
    code: 'CSD302',
    name: 'Digital Forensics Investigation',
    programmeId: 'p7',
    level: 'Level 3.2',
    courseType: 'Technical',
    assignedGroup: 'A',
    completedModules: 6,
    totalModules: 10,
  },
  {
    id: 'c8',
    code: 'DS201',
    name: 'Data Analytics Fundamentals',
    programmeId: 'p8',
    level: 'Level 2.1',
    courseType: 'Technical',
    assignedGroup: 'B',
    completedModules: 10,
    totalModules: 10,
  },
  
  // School of Education courses
  {
    id: 'c9',
    code: 'PDE401',
    name: 'Educational Theory and Practice',
    programmeId: 'p11',
    level: 'Level 4.1',
    courseType: 'Non-Technical',
    assignedGroup: 'C',
    completedModules: 7,
    totalModules: 10,
  },
  {
    id: 'c10',
    code: 'LDT402',
    name: 'Learning Design Methodology',
    programmeId: 'p12',
    level: 'Level 4.2',
    courseType: 'Non-Technical',
    assignedGroup: 'D',
    completedModules: 8,
    totalModules: 10,
  },
  {
    id: 'c11',
    code: 'ELP501',
    name: 'Educational Leadership Research',
    programmeId: 'p13',
    level: 'Level 4.2',
    courseType: 'Non-Technical',
    assignedGroup: 'E',
    completedModules: 5,
    totalModules: 10,
  },
  {
    id: 'c12',
    code: 'TE401',
    name: 'Technology Education Methods',
    programmeId: 'p14',
    level: 'Level 4.1',
    courseType: 'Non-Technical',
    assignedGroup: 'F',
    completedModules: 9,
    totalModules: 10,
  },
  
  // School of Business and Economics courses
  {
    id: 'c13',
    code: 'MBA501',
    name: 'Strategic Business Management',
    programmeId: 'p19',
    level: 'Level 4.2',
    courseType: 'Non-Technical',
    assignedGroup: 'A',
    completedModules: 10,
    totalModules: 10,
  },
  {
    id: 'c14',
    code: 'BE201',
    name: 'Entrepreneurship Fundamentals',
    programmeId: 'p21',
    level: 'Level 2.1',
    courseType: 'Non-Technical',
    assignedGroup: 'B',
    completedModules: 7,
    totalModules: 10,
  },
  {
    id: 'c15',
    code: 'ES301',
    name: 'Economic Analysis',
    programmeId: 'p22',
    level: 'Level 3.1',
    courseType: 'Non-Technical',
    assignedGroup: 'C',
    completedModules: 8,
    totalModules: 10,
  },
  {
    id: 'c16',
    code: 'EDS302',
    name: 'Data Science for Economics',
    programmeId: 'p23',
    level: 'Level 3.2',
    courseType: 'Technical',
    assignedGroup: 'D',
    completedModules: 6,
    totalModules: 10,
  },
];

// Generate additional mock courses to reach 56 total
const additionalCourses: Course[] = [];
const courseNames = [
  // Science and Technology courses
  'Interactive Media Development', 'Computational Mathematics', 'Digital Transformation', 'Neural Networks',
  'Mobile Application Design', 'Network Security', 'Cloud Architecture', 'Deep Learning',
  'Agricultural Systems Design', 'Digital Forensics Analysis', 'Data Mining', 'Software Architecture',
  'Web Application Security', 'Database Systems', 'Algorithm Design', 'Computer Graphics',
  'Information Security', 'Data Visualization', 'Artificial Intelligence Ethics', 'IoT Systems',
  
  // Education courses
  'Educational Assessment', 'Curriculum Design', 'Learning Analytics', 'Educational Technology',
  'Instructional Design', 'Educational Psychology', 'Teacher Development', 'Learning Environments',
  'Educational Policy Analysis', 'Special Education Methods', 'Educational Research Methods', 'Academic Leadership',
  'Technology Enhanced Learning', 'Digital Pedagogy', 'Educational Innovation', 'Learning Management Systems',
  
  // Business and Economics courses
  'Financial Management', 'Business Analytics', 'Marketing Strategy', 'Economic Modeling',
  'Business Intelligence', 'Corporate Governance', 'Investment Analysis', 'Market Research',
  'Business Law', 'Economic Policy', 'Data-Driven Decision Making', 'Strategic Planning',
  'Business Process Management', 'Digital Business Models', 'Financial Accounting', 'Managerial Economics',
  'Supply Chain Analytics', 'E-Commerce Strategy', 'Digital Marketing Analytics', 'Corporate Finance',
  'Business Innovation', 'Entrepreneurial Strategy', 'Global Business Management', 'Financial Risk Management'
];

// Complete Level X.Y sequence
const levelSequence = ['Level 1.1', 'Level 1.2', 'Level 2.1', 'Level 2.2', 'Level 3.1', 'Level 3.2', 'Level 4.1', 'Level 4.2'];

let courseIndex = 9;
for (let i = 0; i < 48; i++) {
  const programmeId = mockProgrammes[i % mockProgrammes.length].id;
  const group = GROUPS[i % GROUPS.length];
  const level = levelSequence[i % levelSequence.length];

  additionalCourses.push({
    id: `c${courseIndex}`,
    code: `CRS${1000 + courseIndex}`,
    name: courseNames[i % courseNames.length],
    programmeId,
    level,
    courseType: i % 3 === 0 ? 'Technical' : 'Non-Technical',
    assignedGroup: group,
    completedModules: 10,
    totalModules: 10,
  });
  courseIndex++;
}

export const allMockCourses = [...mockCourses, ...additionalCourses];

// Calculate statistics
export const getStatistics = () => {
  const totalCourses = allMockCourses.length;
  const totalModules = totalCourses * 10;
  const completedModules = allMockCourses.reduce((sum, course) => sum + course.completedModules, 0);
  const completionPercentage = Math.round((completedModules / totalModules) * 100);

  const dailyTarget = Math.ceil(totalModules / mockWorkshop.numberOfDays);
  const currentDay = Math.floor((Date.now() - mockWorkshop.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const expectedProgress = Math.min(dailyTarget * currentDay, totalModules);

  return {
    totalCourses,
    totalModules,
    completedModules,
    completionPercentage,
    dailyTarget,
    currentDay: Math.min(currentDay, mockWorkshop.numberOfDays),
    expectedProgress,
    isOnTrack: completedModules >= expectedProgress,
  };
};

// Get statistics by group
export const getStatisticsByGroup = (group: Group) => {
  const groupCourses = allMockCourses.filter(c => c.assignedGroup === group);
  const totalModules = groupCourses.length * 10;
  const completedModules = groupCourses.reduce((sum, course) => sum + course.completedModules, 0);

  return {
    totalCourses: groupCourses.length,
    totalModules,
    completedModules,
    completionPercentage: Math.round((completedModules / totalModules) * 100),
  };
};

// Get statistics by programme
export const getStatisticsByProgramme = (programmeId: string) => {
  const programmeCourses = allMockCourses.filter(c => c.programmeId === programmeId);
  const totalModules = programmeCourses.length * 10;
  const completedModules = programmeCourses.reduce((sum, course) => sum + course.completedModules, 0);

  return {
    totalCourses: programmeCourses.length,
    totalModules,
    completedModules,
    completionPercentage: Math.round((completedModules / totalModules) * 100),
  };
};

// Mock participants
const participantNames = [
  'Mary Wanjiku', 'Peter Kamau', 'Jane Akinyi', 'David Otieno', 'Sarah Muthoni',
  'John Kariuki', 'Grace Njeri', 'James Odhiambo', 'Lucy Wambui', 'Michael Kipchoge',
  'Ruth Chepkwony', 'Daniel Mutua', 'Esther Wangari', 'Samuel Kimani', 'Catherine Nyambura',
  'Patrick Omondi', 'Alice Chebet', 'Joseph Mwangi', 'Nancy Njoki', 'Benjamin Kiptoo',
  'Angela Wanjiru', 'Victor Mutinda', 'Faith Auma', 'Thomas Njoroge', 'Rebecca Moraa',
  'Steven Kibet', 'Charity Wairimu', 'Kenneth Owino', 'Monica Kerubo', 'Francis Ochieng',
  'Helen Waweru', 'Robert Kimathi', 'Fiona Ndegwa', 'Paul Njoroge', 'Jane Wairimu',
  'Peter Munene', 'Lucy Mwende', 'David Kiprono', 'Susan Odhiambo', 'Moses Otieno',
  'Grace Mutua', 'Alice Wanjiru', 'John Mwangi', 'Esther Nduta', 'Patrick Karanja',
  'Mary Nyakina', 'James Mwangi', 'Ann Njeri', 'Timothy Ouma', 'Ruth Wekesa',
  'Norman Awuor', 'Faith Muthoni', 'Eric Ndung’u', 'Christine Mburu', 'Mark Muriuki',
  'Esther Kihara', 'Kenneth Njagi', 'Mercy Wanjiru', 'Dennis Kipkoech', 'Joyce Achieng',
  'Kevin Oduor', 'Caroline Njeri', 'Wilson Muchiri', 'Alice Mathu', 'Ken Mburu',
  'Rose Wambui', 'Chris Makori', 'Nancy Njenga', 'Philip Ouko', 'Helen Wanjiru',
  'Sandra Kirui', 'Tom Rotich', 'Anna Musyoka', 'Fredrick Ombati', 'Mercy Chepkemoi',
  'Samuel Kariuki', 'Esther Jepkoech'
];

const participantRoles = ['Content Digitiser', 'Multimedia Digitiser'] as const;

export const mockParticipants: Participant[] = participantNames.map((name, index) => {
  const group = GROUPS[index % GROUPS.length];
  const isLeader = index % 14 === 0;
  const role = isLeader ? 'Group Leader' : participantRoles[index % participantRoles.length];
  const dsaType = index < 45 ? 'In-County' : 'Out-County';
  const daysAttending = 5 + (index % 3);

  return {
    id: `p${index + 1}`,
    name,
    role,
    group,
    dsaType,
    daysAttending,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@ouk.ac.ke`,
  };
});

// Mock attendance data
export const mockAttendance: Attendance[] = [];

// Generate attendance for all participants across all days
mockParticipants.forEach(participant => {
  for (let day = 1; day <= mockWorkshop.numberOfDays; day++) {
    const isPresent = day <= participant.daysAttending;
    mockAttendance.push({
      id: `att-${participant.id}-day${day}`,
      participantId: participant.id,
      day,
      status: isPresent ? 'Present' : 'Absent',
    });
  }
});

// Mock payment schedules
export const mockPaymentSchedules: PaymentSchedule[] = mockParticipants.map(participant => {
  const dsaRate = DSA_RATES[participant.dsaType];
  const amount = participant.daysAttending * BASE_DAILY_RATE * dsaRate;

  return {
    id: `pay-${participant.id}`,
    participantId: participant.id,
    amount: Math.round(amount),
    bankName: ['KCB', 'Equity', 'Co-operative', 'NCBA', 'Absa'][Math.floor(Math.random() * 5)],
    branch: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'][Math.floor(Math.random() * 5)],
    bankCode: `${Math.floor(Math.random() * 90 + 10)}`,
    accountNumber: `${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    status: Math.random() > 0.5 ? 'Processed' : 'Pending',
  };
});

// Calculate DSA payment for a participant
export const calculateDSA = (participant: Participant): number => {
  const dsaRate = DSA_RATES[participant.dsaType];
  return participant.daysAttending * BASE_DAILY_RATE * dsaRate;
};
