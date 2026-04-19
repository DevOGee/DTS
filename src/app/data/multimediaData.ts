import { Group } from './mockData';

export interface VideoLog {
  id: string;
  courseCode: string;
  module: string;
  group: Group;
  title: string;
  duration: string;
  recorded: boolean;
  edited: boolean;
  status: 'Complete' | 'In Progress' | 'Pending';
}

export interface GroupVideoStats {
  group: Group;
  videosComplete: number;
  totalVideos: number;
  digitiser: string;
  courses: string[];
  completionPercentage: number;
  trackedVideos: number;
}

export const mockVideoLogs: VideoLog[] = [
  {
    id: 'v1',
    courseCode: 'FRE 101',
    module: 'Mod 1',
    group: 'A',
    title: 'Mod 1 – Intro to French',
    duration: '48 min',
    recorded: true,
    edited: true,
    status: 'Complete',
  },
  {
    id: 'v2',
    courseCode: 'MMI 801',
    module: 'Mod 1',
    group: 'B',
    title: 'Mod 1 – Educational Innovation',
    duration: '55 min',
    recorded: true,
    edited: true,
    status: 'Complete',
  },
  {
    id: 'v3',
    courseCode: 'GER 101',
    module: 'Mod 1',
    group: 'C',
    title: 'Mod 1 – German Language Basics',
    duration: '42 min',
    recorded: true,
    edited: false,
    status: 'In Progress',
  },
  {
    id: 'v4',
    courseCode: 'PCM 101',
    module: 'Mod 1',
    group: 'D',
    title: 'Mod 1 – Human Communication',
    duration: '38 min',
    recorded: false,
    edited: false,
    status: 'Pending',
  },
  {
    id: 'v5',
    courseCode: 'BPA 106',
    module: 'Mod 1',
    group: 'E',
    title: 'Mod 1 – Constitutional Processes',
    duration: '50 min',
    recorded: true,
    edited: true,
    status: 'Complete',
  },
  {
    id: 'v6',
    courseCode: 'ISM 101',
    module: 'Mod 1',
    group: 'F',
    title: 'Mod 1 – Intro to Hadithi',
    duration: '45 min',
    recorded: true,
    edited: true,
    status: 'Complete',
  },
];

export const mockGroupVideoStats: GroupVideoStats[] = [
  {
    group: 'A',
    videosComplete: 1,
    totalVideos: 10,
    digitiser: 'Mark Griffin',
    courses: ['BPA 101', 'BPA 102', 'BPA 105', 'EDU 101', 'EDU 103', 'FRE 101', 'FRE 102', 'FRE 103', 'EDU 102', 'EDU 104'],
    completionPercentage: 10,
    trackedVideos: 1,
  },
  {
    group: 'B',
    videosComplete: 1,
    totalVideos: 10,
    digitiser: 'Paul Mwaniki',
    courses: ['MMI 801', 'MMI 802', 'MMI 803', 'MMI 804', 'MMI 805', 'MMI 806', 'MMI 807', 'MMI 808', 'MMI 809', 'MMI 810'],
    completionPercentage: 10,
    trackedVideos: 1,
  },
  {
    group: 'C',
    videosComplete: 0,
    totalVideos: 9,
    digitiser: 'Edwin Muthomi',
    courses: ['GER 101', 'GER 103', 'LIT 101', 'BPA 103', 'PPM 304', 'GER 102', 'LIT 102', 'BPA 104', 'PPM 305'],
    completionPercentage: 0,
    trackedVideos: 1,
  },
  {
    group: 'D',
    videosComplete: 0,
    totalVideos: 9,
    digitiser: 'Moses Marwa',
    courses: ['STM 302', 'ENG 201', 'GEO 101', 'GEO 102', 'ENG 101', 'STM 303', 'ENG 202', 'GEO 103', 'ENG 102'],
    completionPercentage: 0,
    trackedVideos: 1,
  },
  {
    group: 'E',
    videosComplete: 1,
    totalVideos: 9,
    digitiser: 'Marian Nthambi',
    courses: ['BPA 106', 'BPA 108', 'PCM 104', 'PCM 105', 'PCM 106', 'BPA 107', 'PCM 101', 'PCM 102', 'PCM 103'],
    completionPercentage: 11,
    trackedVideos: 1,
  },
  {
    group: 'F',
    videosComplete: 1,
    totalVideos: 9,
    digitiser: 'Gift Kibet',
    courses: ['ISM 104', 'ISM 103', 'ARB 101', 'ARB 102', 'ARB 103', 'ISM 101', 'ISM 102', 'ARB 104', 'ARB 105'],
    completionPercentage: 11,
    trackedVideos: 1,
  },
];

export const getMultimediaOverview = () => {
  const totalVideos = mockGroupVideoStats.reduce((sum, group) => sum + group.totalVideos, 0);
  const completedVideos = mockGroupVideoStats.reduce((sum, group) => sum + group.videosComplete, 0);
  const totalCourses = 56;

  return {
    totalVideos,
    completedVideos,
    totalCourses,
    groups: mockGroupVideoStats.length,
  };
};
