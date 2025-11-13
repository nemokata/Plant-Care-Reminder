import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Scheme = 'light' | 'dark';
type ThemeContextValue = { scheme: Scheme; toggle: () => void; setScheme: (s: Scheme) => void };

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const KEY = 'pref:theme:scheme';

export function ThemeProviderLocal({ children }: { children: React.ReactNode }) {
  const [scheme, setSchemeState] = useState<Scheme>('light');
  useEffect(() => {
    AsyncStorage.getItem(KEY).then(v => {
      if (v === 'light' || v === 'dark') setSchemeState(v);
    }).catch(() => {});
  }, []);
  const setScheme = useCallback((s: Scheme) => {
    setSchemeState(s);
    AsyncStorage.setItem(KEY, s).catch(() => {});
  }, []);
  const toggle = useCallback(() => setScheme(scheme === 'light' ? 'dark' : 'light'), [scheme, setScheme]);
  const value = useMemo(() => ({ scheme, toggle, setScheme }), [scheme, toggle, setScheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemePreference() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('ThemeProviderLocal missing');
  return ctx;
}
