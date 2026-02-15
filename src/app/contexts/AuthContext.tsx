// Authentication Context Provider
// Manages authentication state across the application

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '../types';
import {
  loginUser,
  registerUser,
  signOut,
  onAuthStateChange,
  getCurrentUserData,
} from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: 'user' | 'owner'
  ) => Promise<void>;
  logout: () => Promise<void>;
  isOwner: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const userData = await getCurrentUserData(fbUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const userData = await loginUser(email, password);
    setUser(userData);
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: 'user' | 'owner'
  ) => {
    const userData = await registerUser(email, password, name, role);
    setUser(userData);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setFirebaseUser(null);
  };

  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin';

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    login,
    register,
    logout,
    isOwner,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
