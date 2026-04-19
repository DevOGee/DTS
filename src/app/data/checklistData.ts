export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  category: 'pre-flight' | 'close-out';
}

export const mockChecklistItems: ChecklistItem[] = [
  // Pre-Flight (Before) - 73% complete
  {
    id: 'pf1',
    title: 'Finalise template and optimise DIG LMS',
    description: 'LMS platform configuration complete',
    isComplete: true,
    category: 'pre-flight',
  },
  {
    id: 'pf2',
    title: 'Categories creation – Short Courses',
    description: 'Configure short course category structure',
    isComplete: true,
    category: 'pre-flight',
  },
  {
    id: 'pf3',
    title: 'Categories creation – Main Courses',
    description: 'Configure main course category structure',
    isComplete: true,
    category: 'pre-flight',
  },
  {
    id: 'pf4',
    title: 'Load templates – Short & Main Courses',
    description: 'Upload standardised module templates',
    isComplete: true,
    category: 'pre-flight',
  },
  {
    id: 'pf5',
    title: 'Loading all 56 courses into LMS',
    description: 'Full course structure upload',
    isComplete: true,
    category: 'pre-flight',
  },
  {
    id: 'pf6',
    title: 'Group accounts creation in LMS',
    description: 'Create all 6 group accounts A–F',
    isComplete: true,
    category: 'pre-flight',
  },
  {
    id: 'pf7',
    title: 'Google Sheet allocations for all groups',
    description: 'Facilitator assignment spreadsheet',
    isComplete: true,
    category: 'pre-flight',
  },
  {
    id: 'pf8',
    title: 'Content confirmation for all schools',
    description: 'Sign-off from all programme schools',
    isComplete: true,
    category: 'pre-flight',
  },
  {
    id: 'pf9',
    title: 'Dispatch invites – External',
    description: 'External facilitator email dispatch for 39 participants',
    isComplete: false,
    category: 'pre-flight',
  },
  {
    id: 'pf10',
    title: 'Dispatch invites – Internal Admins',
    description: 'Internal administrative staff',
    isComplete: false,
    category: 'pre-flight',
  },
  {
    id: 'pf11',
    title: 'Dispatch invites – Internal Management',
    description: 'VC, DVCs and Directors',
    isComplete: false,
    category: 'pre-flight',
  },
  // Close-Out (After) - 38% complete
  {
    id: 'co1',
    title: 'Digitisation Report',
    description: 'Comprehensive post-event report',
    isComplete: true,
    category: 'close-out',
  },
  {
    id: 'co2',
    title: 'Digitisation Memo',
    description: 'Official institutional memorandum',
    isComplete: true,
    category: 'close-out',
  },
  {
    id: 'co3',
    title: 'Invitation Letters – Internal & External',
    description: 'Formal letters for all 84 participants',
    isComplete: true,
    category: 'close-out',
  },
  {
    id: 'co4',
    title: 'Appointment Letters',
    description: 'Facilitator appointment documentation',
    isComplete: false,
    category: 'close-out',
  },
  {
    id: 'co5',
    title: 'Digitisation Schedule',
    description: 'Archived final post-event schedule record',
    isComplete: false,
    category: 'close-out',
  },
  {
    id: 'co6',
    title: 'OUK Attendance List',
    description: 'Signed attendance sheets for all participants',
    isComplete: false,
    category: 'close-out',
  },
  {
    id: 'co7',
    title: 'Hotel / Accommodation List',
    description: 'External participant accommodation records',
    isComplete: false,
    category: 'close-out',
  },
  {
    id: 'co8',
    title: 'Preparation of Payment Schedule',
    description: 'Final payment schedule for all DSA claims',
    isComplete: false,
    category: 'close-out',
  },
];

export const getChecklistProgress = (category: 'pre-flight' | 'close-out') => {
  const items = mockChecklistItems.filter(item => item.category === category);
  const completed = items.filter(item => item.isComplete).length;
  return Math.round((completed / items.length) * 100);
};
