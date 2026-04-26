import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLogin, useLogout, useCurrentUser } from '../../hooks/useApiQuery';
import { User } from '../../services/apiService';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser]);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync({ identifier, password });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    logoutMutation.mutate();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading: isLoading || loginMutation.isPending
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
