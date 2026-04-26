// Frontend Migration - React Query Integration
// src/services/apiService.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = 10000; // 10 seconds

// Request/Response interfaces
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  error?: string;
  code?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface LoginRequest {
  identifier: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    group_id?: string;
  };
  permissions: Array<{
    name: string;
    module: string;
    action: string;
  }>;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  group_id?: string;
  group?: {
    id: string;
    name: string;
    color: string;
  };
  created_at: string;
  last_login?: string;
}

interface Group {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
  created_at: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  programme_id: string;
  level: string;
  course_type: 'Technical' | 'Non-Technical';
  assigned_group_id: string;
  completed_modules: number;
  total_modules: number;
  source_doc_link?: string;
  lms_link?: string;
  created_at: string;
  updated_at: string;
}

class ApiService {
  private api: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for adding auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling token refresh
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized responses
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Attempt to refresh token
            const response = await axios.post(
              `${API_BASE_URL}/auth/refresh`,
              {},
              { withCredentials: true }
            );

            const { accessToken } = response.data;
            localStorage.setItem('accessToken', accessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            
            // Only redirect if not already on login page
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
            
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.api.post('/auth/login', credentials, {
        withCredentials: true
      });

      const data = response.data;
      
      // Store tokens
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout', {}, { withCredentials: true });
    } finally {
      // Clear all auth-related storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // Generic CRUD operations
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`GET ${endpoint} error:`, error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.api.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`POST ${endpoint} error:`, error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.api.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`PUT ${endpoint} error:`, error);
      throw error;
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.api.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${endpoint} error:`, error);
      throw error;
    }
  }

  // Paginated get
  async getPaginated<T>(endpoint: string, params?: Record<string, any>): Promise<PaginatedResponse<T>> {
    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`GET ${endpoint} error:`, error);
      throw error;
    }
  }

  // Data fetching methods
  async getGroups(): Promise<Group[]> {
    return this.get<Group[]>('/data/groups');
  }

  async getUsers(params?: Record<string, any>): Promise<PaginatedResponse<User>> {
    return this.getPaginated<User>('/users', params);
  }

  async getCourses(params?: Record<string, any>): Promise<PaginatedResponse<Course>> {
    return this.getPaginated<Course>('/courses', params);
  }

  async getWorkshops(params?: Record<string, any>): Promise<any> {
    return this.get('/workshops', params);
  }

  async getParticipants(params?: Record<string, any>): Promise<any> {
    return this.get('/participants', params);
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setStoredUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearStoredUser(): void {
    localStorage.removeItem('user');
  }
}

export default new ApiService();

// src/hooks/useApiQuery.ts
import { useQuery, useMutation, useQueryClient, QueryClient, UseQueryOptions } from '@tanstack/react-query';
import apiService from '../services/apiService';

// Query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
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
      const { user, permissions, accessToken } = data;
      
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

export const useUsers = (params?: Record<string, any>, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => apiService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: apiService.isAuthenticated(),
    ...options,
  });
};

export const useCourses = (params?: Record<string, any>, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => apiService.getCourses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: apiService.isAuthenticated(),
    ...options,
  });
};

export const useWorkshops = (params?: Record<string, any>, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['workshops', params],
    queryFn: () => apiService.getWorkshops(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: apiService.isAuthenticated(),
    ...options,
  });
};

export const useParticipants = (params?: Record<string, any>, options?: UseQueryOptions) => {
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
      queryKey: Array.isArray(queryKey) ? queryKey : [QueryKey],
      queryFn,
      staleTime: 0 // Immediately consider it stale
    });
  };
};
