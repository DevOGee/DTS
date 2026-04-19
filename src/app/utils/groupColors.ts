import { Group } from '../data/mockData';

export const GROUP_COLORS: Record<Group, { bg: string; text: string; border: string }> = {
  A: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  B: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  C: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  D: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  E: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300' },
  F: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' },
};

export const getGroupColor = (group: Group) => GROUP_COLORS[group];
