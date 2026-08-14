import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { storage } from "../lib/storage";
import { MOCK_SOLICITUDES } from "../../data/mockSolicitudes";
import { MOCK_DENUNCIAS } from "../../data/mockDenuncias";
import { MOCK_FUNDACIONES } from "../../data/mockFundaciones";

type Denuncia = typeof MOCK_DENUNCIAS[0];
type Fundacion = typeof MOCK_FUNDACIONES[0];

interface AdminContextType {
  solicitudes: typeof MOCK_SOLICITUDES;
  denuncias: Denuncia[];
  fundaciones: Fundacion[];
  addSolicitud: (sol: typeof MOCK_SOLICITUDES[0]) => void;
  updateSolicitud: (id: string, updates: Partial<typeof MOCK_SOLICITUDES[0]>) => void;
  addDenuncia: (data: Omit<Denuncia, "id" | "ticket" | "estado" | "fecha" | "auditoria" | "createdAt" | "updatedAt">) => Denuncia;
  updateDenuncia: (id: number, updates: Partial<Denuncia>) => void;
  updateFundacion: (id: string, updates: Partial<Fundacion>) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [solicitudes, setSolicitudes] = useState(() => {
    const stored = storage.getSolicitudes();
    return stored.length > 0 ? stored : MOCK_SOLICITUDES;
  });

  const [denuncias, setDenuncias] = useState<Denuncia[]>(() => {
    const stored = storage.getDenuncias();
    return stored.length > 0 ? stored : MOCK_DENUNCIAS;
  });

  const [fundaciones, setFundaciones] = useState<Fundacion[]>(() => {
    const stored = storage.getFundaciones();
    return stored.length > 0 ? stored : MOCK_FUNDACIONES;
  });

  const addSolicitud = useCallback((sol: typeof MOCK_SOLICITUDES[0]) => {
    setSolicitudes((prev) => {
      const updated = [sol, ...prev];
      storage.setSolicitudes(updated);
      return updated;
    });
  }, []);

  const updateSolicitud = useCallback((id: string, updates: Partial<typeof MOCK_SOLICITUDES[0]>) => {
    setSolicitudes((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      storage.setSolicitudes(updated);
      return updated;
    });
  }, []);

  const addDenuncia = useCallback<AdminContextType["addDenuncia"]>(
    (data) => {
      const now = new Date().toISOString();
      const newId = denuncias.length > 0 ? Math.max(...denuncias.map((d) => d.id)) + 1 : 1;
      const created: Denuncia = {
        ...data,
        id: newId,
        ticket: `LP-${String(newId).padStart(4, "0")}`,
        estado: "pendiente",
        fecha: now,
        auditoria: [
          { accion: "Denuncia creada", fecha: now, detalle: "Estado: pendiente · Ticket asignado" },
        ],
        createdAt: now,
        updatedAt: now,
      };
      setDenuncias((prev) => {
        const updated = [created, ...prev];
        storage.setDenuncias(updated);
        return updated;
      });
      return created;
    },
    [denuncias]
  );

  const updateDenuncia = useCallback((id: number, updates: Partial<Denuncia>) => {
    setDenuncias((prev) => {
      const updated = prev.map((d) =>
        d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
      );
      storage.setDenuncias(updated);
      return updated;
    });
  }, []);

  const updateFundacion = useCallback((id: string, updates: Partial<Fundacion>) => {
    setFundaciones((prev) => {
      const updated = prev.map((f) => (f.id === id ? { ...f, ...updates } : f));
      storage.setFundaciones(updated);
      return updated;
    });
  }, []);

  return (
    <AdminContext.Provider value={{ solicitudes, denuncias, fundaciones, addSolicitud, updateSolicitud, addDenuncia, updateDenuncia, updateFundacion }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
