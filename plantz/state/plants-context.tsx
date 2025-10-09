import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/state/auth-context';
import { db } from '@/services/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc, serverTimestamp } from 'firebase/firestore';

export type SavedPlant = {
  id: string;
  name: string;
  species?: string;
  imageUri?: string;
  wateringIntervalDays?: number;
  lastWateredAt?: string; // ISO
  source?: 'api' | 'manual';
};

type PlantsContextValue = {
  plants: SavedPlant[];
  addPlant: (p: Omit<SavedPlant, 'id'>) => Promise<void>;
  removePlant: (id: string) => Promise<void>;
  markWatered: (id: string, when?: Date) => Promise<void>;
};

const PlantsContext = createContext<PlantsContextValue | undefined>(undefined);

function uid() { return Math.random().toString(36).slice(2, 10); }

export function PlantsProvider({ children }: { children: React.ReactNode }) {
  const [plants, setPlants] = useState<SavedPlant[]>([]);
  const { user } = useAuth();

  // Firestore collection ref for current user
  const colRef = user ? collection(db, 'users', user.uid, 'plants') : null;

  useEffect(() => {
    if (!user || !colRef) { setPlants([]); return; }
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: SavedPlant[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      setPlants(list);
    });
    return () => unsub();
  }, [user]);

  const addPlant = async (p: Omit<SavedPlant, 'id'>) => {
    if (!colRef) {
      // Fall back to local-only state if not signed in
      setPlants((prev) => [{ id: uid(), ...p }, ...prev]);
      return;
    }
    await addDoc(colRef, { ...p, createdAt: serverTimestamp() });
  };
  const removePlant = async (id: string) => {
    if (!user) { setPlants((prev) => prev.filter((x) => x.id !== id)); return; }
    await deleteDoc(doc(db, 'users', user.uid, 'plants', id));
  };
  const markWatered = async (id: string, when = new Date()) => {
    if (!user) { setPlants((prev) => prev.map((x) => x.id === id ? { ...x, lastWateredAt: when.toISOString() } : x)); return; }
    await updateDoc(doc(db, 'users', user.uid, 'plants', id), { lastWateredAt: when.toISOString() });
  };

  const value = useMemo(() => ({ plants, addPlant, removePlant, markWatered }), [plants]);
  return <PlantsContext.Provider value={value}>{children}</PlantsContext.Provider>;
}

export function usePlants() {
  const ctx = useContext(PlantsContext);
  if (!ctx) throw new Error('usePlants must be used within PlantsProvider');
  return ctx;
}
