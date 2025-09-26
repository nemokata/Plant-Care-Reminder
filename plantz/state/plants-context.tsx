import React, { createContext, useContext, useMemo, useState } from 'react';

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
  addPlant: (p: Omit<SavedPlant, 'id'>) => void;
  removePlant: (id: string) => void;
  markWatered: (id: string, when?: Date) => void;
};

const PlantsContext = createContext<PlantsContextValue | undefined>(undefined);

function uid() { return Math.random().toString(36).slice(2, 10); }

export function PlantsProvider({ children }: { children: React.ReactNode }) {
  const [plants, setPlants] = useState<SavedPlant[]>([]);

  const addPlant = (p: Omit<SavedPlant, 'id'>) => {
    setPlants((prev) => [{ id: uid(), ...p }, ...prev]);
  };
  const removePlant = (id: string) => setPlants((prev) => prev.filter((p) => p.id !== id));
  const markWatered = (id: string, when = new Date()) =>
    setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, lastWateredAt: when.toISOString() } : p)));

  const value = useMemo(() => ({ plants, addPlant, removePlant, markWatered }), [plants]);
  return <PlantsContext.Provider value={value}>{children}</PlantsContext.Provider>;
}

export function usePlants() {
  const ctx = useContext(PlantsContext);
  if (!ctx) throw new Error('usePlants must be used within PlantsProvider');
  return ctx;
}
