import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { storage } from "../lib/storage";
import type { ManadaAnimal } from "../lib/types";

const round2 = (n: number) => Math.round(n * 100) / 100;
const DEFAULT_MONTO = 50;

interface ManadaContextType {
  mascotas: ManadaAnimal[];
  nombre: string;
  setNombre: (name: string) => void;
  addToManada: (animal: ManadaAnimal) => void;
  addMultipleToManada: (animals: ManadaAnimal[]) => void;
  removeFromManada: (animalId: string) => void;
  clearManada: () => void;
  montoGlobal: number;
  setMontoGlobal: (amount: number) => void;
  totalMonthly: number;
}

const ManadaContext = createContext<ManadaContextType | null>(null);

export function ManadaProvider({ children }: { children: ReactNode }) {
  const [mascotas, setMascotas] = useState<ManadaAnimal[]>(() => storage.getManadaCart());
  const [nombre, setNombreState] = useState<string>(() => storage.getManadaNombre() || "Mi Manada");
  const [montoGlobal, setMontoGlobalState] = useState<number>(() => storage.getManadaMonto() ?? DEFAULT_MONTO);

  const persistMascotas = (updated: ManadaAnimal[]) => {
    setMascotas(updated);
    storage.setManadaCart(updated);
  };

  const setNombre = useCallback((name: string) => {
    setNombreState(name);
    storage.setManadaNombre(name);
  }, []);

  const addToManada = useCallback((animal: ManadaAnimal) => {
    setMascotas((prev) => {
      if (prev.some((a) => a.animalId === animal.animalId)) return prev;
      const share = round2(montoGlobal / (prev.length + 1));
      const updated = [...prev, { ...animal, montoMensual: share }];
      storage.setManadaCart(updated);
      return updated;
    });
  }, [montoGlobal]);

  const addMultipleToManada = useCallback((animals: ManadaAnimal[]) => {
    setMascotas((prev) => {
      const existingIds = new Set(prev.map((a) => a.animalId));
      const novel = animals.filter((a) => !existingIds.has(a.animalId));
      if (novel.length === 0) return prev;
      const combined = [...prev, ...novel];
      const share = round2(montoGlobal / Math.max(combined.length, 1));
      const updated = combined.map((a) => ({ ...a, montoMensual: share }));
      storage.setManadaCart(updated);
      return updated;
    });
  }, [montoGlobal]);

  const removeFromManada = useCallback((animalId: string) => {
    setMascotas((prev) => {
      const updated = prev.filter((a) => a.animalId !== animalId);
      const rebalanced = updated.map((a) => ({ ...a, montoMensual: round2(montoGlobal / Math.max(updated.length, 1)) }));
      storage.setManadaCart(rebalanced);
      return rebalanced;
    });
  }, [montoGlobal]);

  const setMontoGlobal = useCallback((amount: number) => {
    setMontoGlobalState(amount);
    storage.setManadaMonto(amount);
    setMascotas((prev) => {
      const rebalanced = prev.map((a) => ({ ...a, montoMensual: round2(amount / Math.max(prev.length, 1)) }));
      storage.setManadaCart(rebalanced);
      return rebalanced;
    });
  }, []);

  const clearManada = useCallback(() => {
    persistMascotas([]);
    setNombreState("Mi Manada");
    storage.setManadaNombre("Mi Manada");
  }, []);

  const totalMonthly = montoGlobal;

  return (
    <ManadaContext.Provider value={{ mascotas, nombre, setNombre, addToManada, addMultipleToManada, removeFromManada, clearManada, montoGlobal, setMontoGlobal, totalMonthly }}>
      {children}
    </ManadaContext.Provider>
  );
}

export function useManada() {
  const ctx = useContext(ManadaContext);
  if (!ctx) throw new Error("useManada must be used within ManadaProvider");
  return ctx;
}
