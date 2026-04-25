import React from 'react';
import { Role } from '../data/mockData';

export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  requiredRole?: Role;
  permissions?: string[];
  title: string;
  description?: string;
}

export const DYNAMIC_ROUTES: RouteConfig[] = [
  // Dashboard routes
  {
    path: '/dashboard',
    component: React.lazy(() => import('../components/Dashboard').then(module => ({ default: module.Dashboard }))),
    permissions: ['view_dashboard'],
    title: 'Dashboard',
    description: 'System overview and analytics'
  },
  {
    path: '/dashboard/update-profile',
    component: React.lazy(() => import('../components/Dashboard').then(module => ({ default: module.Dashboard }))),
    permissions: ['view_dashboard'],
    title: 'Update Profile',
    description: 'Update user profile details'
  },
  {
    path: '/dashboard/change-password',
    component: React.lazy(() => import('../components/Dashboard').then(module => ({ default: module.Dashboard }))),
    permissions: ['view_dashboard'],
    title: 'Change Password',
    description: 'Change user password'
  },

  // Course routes
  {
    path: '/courses',
    component: React.lazy(() => import('../components/Courses').then(module => ({ default: module.Courses }))),
    permissions: ['view_courses'],
    title: 'Courses',
    description: 'Course management and content'
  },
  {
    path: '/courses/add-course',
    component: React.lazy(() => import('../components/Courses').then(module => ({ default: module.Courses }))),
    permissions: ['edit_courses'],
    title: 'Add Course',
    description: 'Add new course to the system'
  },
  {
    path: '/courses/edit/:id',
    component: React.lazy(() => import('../components/Courses').then(module => ({ default: module.Courses }))),
    permissions: ['edit_courses'],
    title: 'Edit Course',
    description: 'Modify existing course details'
  },

  // Workshop routes
  {
    path: '/workshops',
    component: React.lazy(() => import('../components/WorkshopsDashboard').then(module => ({ default: module.WorkshopsDashboard }))),
    permissions: ['view_workshops'],
    title: 'Workshops',
    description: 'Workshop management and scheduling'
  },
  {
    path: '/workshops/active',
    component: React.lazy(() => import('../components/WorkshopsDashboard').then(module => ({ default: module.WorkshopsDashboard }))),
    permissions: ['view_workshops'],
    title: 'Active Workshops',
  },
  {
    path: '/workshops/upcoming',
    component: React.lazy(() => import('../components/WorkshopsDashboard').then(module => ({ default: module.WorkshopsDashboard }))),
    permissions: ['view_workshops'],
    title: 'Upcoming Workshops',
  },
  {
    path: '/workshops/completed',
    component: React.lazy(() => import('../components/WorkshopsDashboard').then(module => ({ default: module.WorkshopsDashboard }))),
    permissions: ['view_workshops'],
    title: 'Completed Workshops',
  },
  {
    path: '/workshops/all',
    component: React.lazy(() => import('../components/WorkshopsDashboard').then(module => ({ default: module.WorkshopsDashboard }))),
    permissions: ['view_workshops'],
    title: 'All Workshops',
  },
  {
    path: '/workshops/add-workshop',
    component: React.lazy(() => import('../components/WorkshopsDashboard').then(module => ({ default: module.WorkshopsDashboard }))),
    permissions: ['create_workshops'],
    title: 'Add Workshop',
    description: 'Schedule new workshop'
  },
  {
    path: '/workshops/edit/:id',
    component: React.lazy(() => import('../components/WorkshopsDashboard').then(module => ({ default: module.WorkshopsDashboard }))),
    permissions: ['create_workshops'],
    title: 'Edit Workshop',
    description: 'Modify workshop details'
  },
  // Participant routes
  {
    path: '/participants',
    component: React.lazy(() => import('../components/Participants').then(module => ({ default: module.Participants }))),
    permissions: ['view_participants'],
    title: 'Participants',
    description: 'Participant management and tracking'
  },
  {
    path: '/participants/add-participant',
    component: React.lazy(() => import('../components/Participants').then(module => ({ default: module.Participants }))),
    permissions: ['edit_participants'],
    title: 'Add Participant',
    description: 'Register new participant'
  },
  {
    path: '/participants/edit/:id',
    component: React.lazy(() => import('../components/Participants').then(module => ({ default: module.Participants }))),
    permissions: ['edit_participants'],
    title: 'Edit Participant',
    description: 'Update participant information'
  },
  // Group routes
  {
    path: '/groups',
    component: React.lazy(() => import('../components/Groups').then(module => ({ default: module.Groups }))),
    permissions: ['view_groups'],
    title: 'Groups',
    description: 'Group management and statistics'
  },
  {
    path: '/groups/add-group',
    component: React.lazy(() => import('../components/Groups').then(module => ({ default: module.Groups }))),
    permissions: ['view_groups'],
    title: 'Add Group',
    description: 'Create new group'
  },
  {
    path: '/groups/edit/:groupId',
    component: React.lazy(() => import('../components/Groups').then(module => ({ default: module.Groups }))),
    permissions: ['view_groups'],
    title: 'Edit Group',
    description: 'Modify group details'
  },

  // Settings routes
  {
    path: '/settings',
    component: React.lazy(() => import('../components/AdminSettings').then(module => ({ default: module.AdminSettings }))),
    permissions: ['admin_settings'],
    title: 'Settings',
    description: 'System configuration and administration'
  },
  {
    path: '/settings/general',
    component: React.lazy(() => import('../components/AdminSettings').then(module => ({ default: module.AdminSettings }))),
    permissions: ['admin_settings'],
    title: 'General Settings',
    description: 'General system configuration'
  },
  {
    path: '/settings/general/user-mgt',
    component: React.lazy(() => import('../components/AdminSettings').then(module => ({ default: module.AdminSettings }))),
    permissions: ['view_users'],
    title: 'User Management',
    description: 'Manage system users and permissions'
  },
  {
    path: '/settings/general/permissions',
    component: React.lazy(() => import('../components/AdminSettings').then(module => ({ default: module.AdminSettings }))),
    permissions: ['permission_management'],
    title: 'Permissions',
    description: 'Manage role-based permissions'
  },
  {
    path: '/settings/general/dsa-rates',
    component: React.lazy(() => import('../components/AdminSettings').then(module => ({ default: module.AdminSettings }))),
    permissions: ['admin_settings'],
    title: 'DSA Rates',
    description: 'Configure DSA payment rates'
  },
  {
    path: '/settings/general/data-mgt',
    component: React.lazy(() => import('../components/AdminSettings').then(module => ({ default: module.AdminSettings }))),
    permissions: ['admin_settings'],
    title: 'Data Management',
    description: 'Data export and system reset'
  },
  {
    path: '/settings/general/features',
    component: React.lazy(() => import('../components/AdminSettings').then(module => ({ default: module.AdminSettings }))),
    permissions: ['feature_toggles'],
    title: 'Features',
    description: 'Feature toggles and system options'
  },
  {
    path: '/settings/general/system',
    component: React.lazy(() => import('../components/AdminSettings').then(module => ({ default: module.AdminSettings }))),
    permissions: ['system_settings'],
    title: 'System Settings',
    description: 'System configuration and monitoring'
  },

  // Other resource routes
  {
    path: '/attendance',
    component: React.lazy(() => import('../components/Attendance').then(module => ({ default: module.Attendance }))),
    permissions: ['view_attendance'],
    title: 'Attendance',
    description: 'Attendance tracking and management'
  },
  {
    path: '/payments',
    component: React.lazy(() => import('../components/Payments').then(module => ({ default: module.Payments }))),
    permissions: ['view_payments'],
    title: 'Payments',
    description: 'DSA payment management'
  },
  {
    path: '/multimedia',
    component: React.lazy(() => import('../components/MultimediaTracker').then(module => ({ default: module.MultimediaTracker }))),
    permissions: ['view_multimedia'],
    title: 'Multimedia',
    description: 'Multimedia content tracking'
  },
  {
    path: '/multimedia/log-video',
    component: React.lazy(() => import('../components/MultimediaTracker').then(module => ({ default: module.MultimediaTracker }))),
    permissions: ['view_multimedia'],
    title: 'Log Video',
    description: 'Create multimedia log'
  },
  {
    path: '/multimedia/log-video/:groupId',
    component: React.lazy(() => import('../components/MultimediaTracker').then(module => ({ default: module.MultimediaTracker }))),
    permissions: ['view_multimedia'],
    title: 'Log Video by Group',
    description: 'Create multimedia log for selected group'
  },
  {
    path: '/multimedia/edit-group/:groupId',
    component: React.lazy(() => import('../components/MultimediaTracker').then(module => ({ default: module.MultimediaTracker }))),
    permissions: ['view_multimedia'],
    title: 'Edit Group Stats',
    description: 'Edit multimedia statistics for group'
  },
  {
    path: '/reports',
    component: React.lazy(() => import('../components/Reports').then(module => ({ default: module.Reports }))),
    permissions: ['view_reports'],
    title: 'Reports',
    description: 'System reports and analytics'
  },
  {
    path: '/checklist',
    component: React.lazy(() => import('../components/PhaseChecklist').then(module => ({ default: module.PhaseChecklist }))),
    permissions: ['view_checklist'],
    title: 'Checklist',
    description: 'Phase completion checklist'
  },
  {
    path: '/requests',
    component: React.lazy(() => import('../components/RequestManagement').then(module => ({ default: module.default }))),
    permissions: ['view_requests'],
    title: 'Requests',
    description: 'Request management system'
  },
  {
    path: '/feedback',
    component: React.lazy(() => import('../components/Feedback').then(module => ({ default: module.Feedback }))),
    permissions: ['view_feedback'],
    title: 'Feedback',
    description: 'User feedback and communication'
  },
  {
    path: '/recycle-bin',
    component: React.lazy(() => import('../components/RecycleBin').then(module => ({ default: module.RecycleBin }))),
    permissions: ['view_recycle_bin'],
    title: 'Recycle Bin',
    description: 'Deleted items recovery'
  }
];

// Helper function to check if user has access to route
export function hasRouteAccess(route: RouteConfig, userRole?: Role, userPermissions?: string[]): boolean {
  if (userRole === 'System Admin') {
    return true;
  }

  // Check role requirement
  if (route.requiredRole && userRole !== route.requiredRole) {
    return false;
  }

  // Check permission requirements - be more permissive for basic routes
  if (route.permissions && userPermissions) {
    // If user has no permissions, deny access to protected routes
    if (userPermissions.length === 0) {
      return false;
    }
    // For routes with permissions, user must have at least one of the required permissions
    return route.permissions.some(perm => userPermissions.includes(perm));
  }

  return true;
}

// Get route by path pattern
export function getRouteByPath(path: string): RouteConfig | undefined {
  return DYNAMIC_ROUTES.find(route => {
    // Convert route pattern to regex for dynamic matching
    const routePattern = route.path
      .replace(/:[^/]+/g, '[^/]+')
      .replace(/\//g, '\\/');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(path);
  });
}

// Extract parameters from URL path
export function extractRouteParams(path: string, routePath: string): Record<string, string> {
  const routeSegments = routePath.split('/');
  const pathSegments = path.split('/');
  const params: Record<string, string> = {};

  routeSegments.forEach((segment, index) => {
    if (segment.startsWith(':')) {
      const paramName = segment.slice(1);
      params[paramName] = pathSegments[index] || '';
    }
  });

  return params;
}
