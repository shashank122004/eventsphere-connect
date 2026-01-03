import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/lib/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'eventify_current_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { token, user } = await api.login(email, password);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      toast({ title: 'Welcome back!', description: `Logged in as ${user.name}` });
      return true;
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.message || 'Invalid credentials', variant: 'destructive' });
      return false;
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    try {
      const { token, user } = await api.signup(name, email, phone, password);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      toast({ title: 'Welcome to Eventify!', description: 'Your account has been created successfully' });
      return true;
    } catch (err: any) {
      toast({ title: 'Signup failed', description: err.message || 'Signup failed', variant: 'destructive' });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('eventify_token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
