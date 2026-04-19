export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export type Group = typeof GROUPS[number];

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
    view_workshops: true,
    create_workshops: true,
    view_courses: true,
    edit_courses: true,
    delete_courses: true,
    view_groups: true,
    view_multimedia: true,
    edit_multimedia: true,
    view_participants: true,
    edit_participants: true,
    view_payments: true,
    edit_payments: true,
    view_checklist: true,
    mark_attendance: true,
    role_management: true,
    admin_settings: true,
  },
  'Programme Lead': {
    view_dashboard: true,
    view_workshops: true,
    create_workshops: true,
    view_courses: true,
    edit_courses: true,
    delete_courses: true,
    view_groups: true,
    view_multimedia: true,
    edit_multimedia: true,
    view_participants: true,
    edit_participants: true,
    view_payments: true,
    edit_payments: true,
    view_checklist: true,
    mark_attendance: true,
    role_management: false,
    admin_settings: false,
  },
  'Group Leader': {
    view_dashboard: true,
    view_workshops: true,
    create_workshops: false,
    view_courses: true,
    edit_courses: true,
    delete_courses: false,
    view_groups: true,
    view_multimedia: true,
    edit_multimedia: true,
    view_participants: true,
    edit_participants: true,
    view_payments: false,
    edit_payments: false,
    view_checklist: true,
    mark_attendance: true,
    role_management: false,
    admin_settings: false,
  },
  'Viewer/Digitiser': {
    view_dashboard: true,
    view_workshops: true,
    create_workshops: false,
    view_courses: true,
    edit_courses: false,
    delete_courses: false,
    view_groups: true,
    view_multimedia: true,
    edit_multimedia: false,
    view_participants: true,
    edit_participants: false,
    view_payments: false,
    edit_payments: false,
    view_checklist: true,
    mark_attendance: false,
    role_management: false,
    admin_settings: false,
  },
};

// Mock workshop
export const mockWorkshop: Workshop = {
  id: 'w1',
  name: 'OUK Digitisation Workshop 2026',
  venue: 'JKUAT Main Campus',
  startDate: new Date('2026-03-22'),
  numberOfDays: 7,
  endDate: new Date('2026-03-28'),
  status: 'Active',
};

// Mock programmes
export const mockProgrammes: Programme[] = [
  { id: 'p1', name: 'Bachelor of Science in Information Technology', awardType: 'Degree', currentLevel: '3.2' },
  { id: 'p2', name: 'Diploma in Business Management', awardType: 'Diploma', currentLevel: '2.2' },
  { id: 'p3', name: 'Certificate in Computer Applications', awardType: 'Certificate', currentLevel: '1' },
  { id: 'p4', name: 'Master of Business Administration', awardType: 'Postgraduate', currentLevel: 'Year 2' },
  { id: 'p5', name: 'Bachelor of Education (Arts)', awardType: 'Degree', currentLevel: '4.1' },
];

// Mock courses
export const mockCourses: Course[] = [
  {
    id: 'c1',
    code: 'BIT301',
    name: 'Database Management Systems',
    programmeId: 'p1',
    level: '3.2',
    courseType: 'Technical',
    assignedGroup: 'A',
    completedModules: 8,
    totalModules: 10,
    sourceDocLink: 'https://drive.google.com/...',
    lmsLink: 'https://lms.ouk.ac.ke/...',
  },
  {
    id: 'c2',
    code: 'BIT302',
    name: 'Software Engineering',
    programmeId: 'p1',
    level: '1.0',
    courseType: 'Technical',
    assignedGroup: 'A',
    completedModules: 10,
    totalModules: 10,
  },
  {
    id: 'c3',
    code: 'BIT303',
    name: 'Web Development',
    programmeId: 'p1',
    level: '1.0',
    courseType: 'Technical',
    assignedGroup: 'B',
    completedModules: 10,
    totalModules: 10,
  },
  {
    id: 'c4',
    code: 'DBM201',
    name: 'Financial Accounting',
    programmeId: 'p2',
    level: '1.0',
    courseType: 'Non-Technical',
    assignedGroup: 'C',
    completedModules: 10,
    totalModules: 10,
  },
  {
    id: 'c5',
    code: 'DBM202',
    name: 'Marketing Principles',
    programmeId: 'p2',
    level: '1.0',
    courseType: 'Non-Technical',
    assignedGroup: 'C',
    completedModules: 10,
    totalModules: 10,
  },
  {
    id: 'c6',
    code: 'CCA101',
    name: 'Introduction to Computing',
    programmeId: 'p3',
    level: '1.0',
    courseType: 'Technical',
    assignedGroup: 'D',
    completedModules: 10,
    totalModules: 10,
  },
  {
    id: 'c7',
    code: 'MBA501',
    name: 'Strategic Management',
    programmeId: 'p4',
    level: '1.0',
    courseType: 'Non-Technical',
    assignedGroup: 'E',
    completedModules: 10,
    totalModules: 10,
  },
  {
    id: 'c8',
    code: 'BED401',
    name: 'Educational Psychology',
    programmeId: 'p5',
    level: '1.0',
    courseType: 'Non-Technical',
    assignedGroup: 'F',
    completedModules: 10,
    totalModules: 10,
  },
];

// Generate additional mock courses to reach 56 total
const additionalCourses: Course[] = [];
const courseNames = [
  'Data Structures', 'Computer Networks', 'Operating Systems', 'Artificial Intelligence',
  'Mobile App Development', 'Cyber Security', 'Cloud Computing', 'Machine Learning',
  'Human Resource Management', 'Organizational Behavior', 'Business Law', 'Economics',
  'Statistics', 'Research Methods', 'Project Management', 'Quality Management',
  'Supply Chain Management', 'E-Commerce', 'Digital Marketing', 'Corporate Finance',
  'Entrepreneurship', 'Business Ethics', 'International Business', 'Risk Management',
  'Customer Relationship Management', 'Operations Management', 'Leadership', 'Negotiation Skills',
  'Public Relations', 'Brand Management', 'Consumer Behavior', 'Sales Management',
  'Educational Technology', 'Curriculum Development', 'Assessment Methods', 'Classroom Management',
  'Child Psychology', 'Special Education', 'Educational Leadership', 'Mathematics Education',
  'Science Education', 'Language Teaching', 'History of Education', 'Philosophy of Education',
  'Sociology of Education', 'Comparative Education', 'Educational Research', 'Educational Policy'
];

let courseIndex = 9;
for (let i = 0; i < 48; i++) {
  const programmeId = mockProgrammes[i % mockProgrammes.length].id;
  const group = GROUPS[i % GROUPS.length];

  additionalCourses.push({
    id: `c${courseIndex}`,
    code: `CRS${1000 + courseIndex}`,
    name: courseNames[i % courseNames.length],
    programmeId,
    level: '1.0',
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
