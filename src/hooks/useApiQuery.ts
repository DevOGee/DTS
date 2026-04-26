import { useQuery, useMutation, useQueryClient, QueryClient, UseQueryOptions } from '@tanstack/react-query';
import apiService, { LoginRequest, User, Group, Course, PaginatedResponse } from '../services/apiService';

// Query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Auth hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => apiService.login(credentials),
    onSuccess: (data) => {
      const { user, permissions } = data;
      
      // Store user data
      apiService.setStoredUser(user);
      
      // Invalidate any cached user data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.setQueryData(['currentUser'], user);
      queryClient.setQueryData(['permissions'], permissions);
    },
    onError: (error) => {
      console.error('Login failed:', error);
      // Clear any existing user data on failed login
      apiService.clearStoredUser();
      queryClient.clear();
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiService.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Redirect to login page
      window.location.href = '/login';
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiService.getCurrentUser(),
    enabled: apiService.isAuthenticated(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry auth requests
  });
};

// Data hooks
export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => apiService.getGroups(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: apiService.isAuthenticated(),
  });
};

export const useUsers = (params?: Record<string, any>, options?: any) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => apiService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: apiService.isAuthenticated(),
    ...options,
  });
};

export const useCourses = (params?: Record<string, any>, options?: any) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => apiService.getCourses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: apiService.isAuthenticated(),
    ...options,
  });
};

export const useWorkshops = (params?: Record<string, any>, options?: any) => {
  return useQuery({
    queryKey: ['workshops', params],
    queryFn: () => apiService.getWorkshops(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: apiService.isAuthenticated(),
    ...options,
  });
};

export const useParticipants = (params?: Record<string, any>, options?: any) => {
  return useQuery({
    queryKey: ['participants', params],
    queryFn: () => apiService.getParticipants(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: apiService.isAuthenticated(),
    ...options,
  });
};

// Generic mutation hooks
export const useCreateMutation = (endpoint: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiService.post(endpoint, data),
    onSuccess: () => {
      // Invalidate relevant queries
      const resourceType = endpoint.split('/')[0];
      queryClient.invalidateQueries({ queryKey: [resourceType] });
    },
    onError: (error) => {
      console.error(`Create ${endpoint} error:`, error);
    },
  });
};

export const useUpdateMutation = (endpoint: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiService.put(`${endpoint}/${id}`, data),
    onSuccess: () => {
      // Invalidate relevant queries
      const resourceType = endpoint.split('/')[0];
      queryClient.invalidateQueries({ queryKey: [resourceType] });
    },
    onError: (error) => {
      console.error(`Update ${endpoint} error:`, error);
    },
  });
};

export const useDeleteMutation = (endpoint: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.delete(`${endpoint}/${id}`),
    onSuccess: () => {
      // Invalidate relevant queries
      const resourceType = endpoint.split('/')[0];
      queryClient.invalidateQueries({ queryKey: [resourceType] });
    },
    onError: (error) => {
      console.error(`Delete ${endpoint} error:`, error);
    },
  });
};

// Utility hooks
export const useInvalidateQuery = () => {
  const queryClient = useQueryClient();
  
  return (queryKey: string | string[]) => {
    queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
  };
};

export const usePrefetchQuery = () => {
  const queryClient = useQueryClient();
  
  return (queryKey: string | string[], queryFn: () => any) => {
    queryClient.prefetchQuery({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
      queryFn,
      staleTime: 0 // Immediately consider it stale
    });
  };
};
