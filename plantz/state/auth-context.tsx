import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '@/services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  lastEmail?: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastEmail, setLastEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log('Auth state changed:', u ? `${u.uid} ${u.email}` : 'signed out');
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // load stored last email for convenience
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem('lastUserEmail').then((v) => { if (!cancelled) setLastEmail(v); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    try { await AsyncStorage.setItem('lastUserEmail', email); setLastEmail(email); } catch {}
  };
  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
    try { await AsyncStorage.setItem('lastUserEmail', email); setLastEmail(email); } catch {}
  };
  const signOutUser = async () => {
    await signOut(auth);
  };

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOutUser, lastEmail }), [user, loading, lastEmail]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
