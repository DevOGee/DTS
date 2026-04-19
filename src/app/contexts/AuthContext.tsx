import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../data/mockData';
import { useData } from './DataContext';

const AUTH_STORAGE_KEY = 'dts_auth_user_id';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => boolean;
  impersonate: (userId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { users } = useData();

  // Restore session from localStorage on mount
  const [user, setUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!savedId) return null;
    // users may not be loaded yet from localStorage — parse directly
    const raw = localStorage.getItem('dts_app_state');
    if (!raw) return null;
    try {
      const state = JSON.parse(raw);
      return (state.users as User[])?.find((u: User) => u.id === savedId) ?? null;
    } catch {
      return null;
    }
  });

  // Keep localStorage in sync whenever the user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, user.id);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = (identifier: string, password: string) => {
    const foundUser = users.find(
      (u) => (u.username === identifier || u.email === identifier) && u.password === password
    );
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const impersonate = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) setUser(target);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, impersonate, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
