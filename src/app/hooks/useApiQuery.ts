import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Role, User, Workshop, Participant, Group } from '../data/mockData';

// Simple toast notification hook
function useToast() {
  const [toast, setToast] = useState<string>('');
  
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };
  
  return { toast, showToast };
}

// API simulation functions (in real app, these would be actual API calls)
const api = {
  // Users
  getUsers: async (): Promise<User[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // In real app, this would be: fetch('/api/users')
    return [];
  },
  
  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulate API call
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`
    };
    return newUser;
  },
  
  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulate API call
    const updatedUser: User = {
      id,
      name: userData.name || '',
      username: userData.username || '',
      email: userData.email || '',
      password: userData.password || '',
      role: userData.role || 'Viewer/Digitiser',
      group: userData.group
    };
    return updatedUser;
  },
  
  deleteUser: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simulate API call
    return;
  },

  // Workshops
  getWorkshops: async (): Promise<Workshop[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [];
  },
  
  createWorkshop: async (workshopData: Omit<Workshop, 'id'>): Promise<Workshop> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newWorkshop: Workshop = {
      ...workshopData,
      id: `workshop-${Date.now()}`
    };
    return newWorkshop;
  },
  
  updateWorkshop: async (id: string, workshopData: Partial<Workshop>): Promise<Workshop> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const updatedWorkshop: Workshop = {
      id,
      name: workshopData.name || '',
      startDate: workshopData.startDate || new Date(),
      endDate: workshopData.endDate || new Date(),
      venue: workshopData.venue || '',
      numberOfDays: workshopData.numberOfDays || 1,
      status: workshopData.status || 'Upcoming'
    };
    return updatedWorkshop;
  },

  // Participants
  getParticipants: async (): Promise<Participant[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [];
  },
  
  createParticipant: async (participantData: Omit<Participant, 'id'>): Promise<Participant> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newParticipant: Participant = {
      ...participantData,
      id: `participant-${Date.now()}`
    };
    return newParticipant;
  },

  // Groups
  getGroups: async (): Promise<Group[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [];
  }
};

// Query keys for React Query
export const queryKeys = {
  users: ['users'] as QueryKey,
  workshops: ['workshops'] as QueryKey,
  participants: ['participants'] as QueryKey,
  groups: ['groups'] as QueryKey,
  user: (id: string) => ['users', id] as QueryKey,
  workshop: (id: string) => ['workshops', id] as QueryKey,
  participant: (id: string) => ['participants', id] as QueryKey,
};

// Custom hooks for data operations
export function useUsers() {
  const { user } = useAuth();
  const { users } = useData();
  
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: api.getUsers,
    initialData: users,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: api.createUser,
    onMutate: async (newUser) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users });
      
      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(queryKeys.users);
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.users, (old: User[] = []) => [...old, newUser]);
      
      // Return a context object with the snapshotted value
      return { previousUsers };
    },
    onError: (err, newUser, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(queryKeys.users, context?.previousUsers);
      showToast('Failed to create user');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
    onSuccess: () => {
      showToast('User created successfully');
    }
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: Partial<User> }) => 
      api.updateUser(id, userData),
    onMutate: async ({ id, userData }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users });
      await queryClient.cancelQueries({ queryKey: queryKeys.user(id) });
      
      const previousUsers = queryClient.getQueryData(queryKeys.users);
      const previousUser = queryClient.getQueryData(queryKeys.user(id));
      
      // Optimistically update user in list
      queryClient.setQueryData(queryKeys.users, (old: User[] = []) =>
        old.map(user => user.id === id ? { ...user, ...userData } : user)
      );
      
      // Optimistically update individual user
      queryClient.setQueryData(queryKeys.user(id), (old: User) => 
        ({ ...old, ...userData })
      );
      
      return { previousUsers, previousUser };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKeys.users, context?.previousUsers);
      queryClient.setQueryData(queryKeys.user(variables.id), context?.previousUser);
      showToast('Failed to update user');
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.id) });
    },
    onSuccess: () => {
      showToast('User updated successfully');
    }
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: api.deleteUser,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users });
      
      const previousUsers = queryClient.getQueryData(queryKeys.users);
      
      queryClient.setQueryData(queryKeys.users, (old: User[] = []) =>
        old.filter(user => user.id !== id)
      );
      
      return { previousUsers };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(queryKeys.users, context?.previousUsers);
      showToast('Failed to delete user');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
    onSuccess: () => {
      showToast('User deleted successfully');
    }
  });
}

export function useWorkshops() {
  const { user } = useAuth();
  const { workshop } = useData();
  
  return useQuery({
    queryKey: queryKeys.workshops,
    queryFn: api.getWorkshops,
    initialData: [workshop],
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });
}

export function useCreateWorkshop() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: api.createWorkshop,
    onMutate: async (newWorkshop) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.workshops });
      
      const previousWorkshops = queryClient.getQueryData(queryKeys.workshops);
      
      queryClient.setQueryData(queryKeys.workshops, (old: Workshop[] = []) => [...old, newWorkshop]);
      
      return { previousWorkshops };
    },
    onError: (err, newWorkshop, context) => {
      queryClient.setQueryData(queryKeys.workshops, context?.previousWorkshops);
      showToast('Failed to create workshop');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workshops });
    },
    onSuccess: () => {
      showToast('Workshop created successfully');
    }
  });
}

export function useParticipants() {
  const { user } = useAuth();
  const { participants } = useData();
  
  return useQuery({
    queryKey: queryKeys.participants,
    queryFn: api.getParticipants,
    initialData: participants,
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });
}

export function useGroups() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.groups,
    queryFn: api.getGroups,
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
    initialData: [], // Empty array as initial data
  });
}

// Hook for optimistic updates with rollback
export function useOptimisticMutation<TData, TVariables, TError = Error>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  queryKey: QueryKey,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
    updateFn?: (oldData: TData | undefined, variables: TVariables) => TData;
  }
) {
  const queryClient = useQueryClient();
  const { showToast } = useData();
  
  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      
      const previousData = queryClient.getQueryData(queryKey);
      
      if (options?.updateFn) {
        queryClient.setQueryData(queryKey, (old: TData | undefined) => 
          options.updateFn(old, variables)
        );
      }
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousData);
      options?.onError?.(error as any, variables);
      showToast('Operation failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: (data, variables) => {
      options?.onSuccess?.(data, variables);
      showToast('Operation completed successfully');
    }
  });
}
