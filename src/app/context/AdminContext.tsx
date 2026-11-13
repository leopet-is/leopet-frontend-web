import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { storage } from "../lib/storage";
import { MOCK_SOLICITUDES } from "../../data/mockSolicitudes";
import { MOCK_DENUNCIAS } from "../../data/mockDenuncias";
import { MOCK_FUNDACIONES } from "../../data/mockFundaciones";
import type { User } from "../lib/types";
import { getUsuariosApi, updateUsuarioEstadoApi } from "../api/usuarios.api";


type Denuncia = typeof MOCK_DENUNCIAS[0];
type Fundacion = typeof MOCK_FUNDACIONES[0];

interface AdminContextType {
  solicitudes: typeof MOCK_SOLICITUDES;
  denuncias: Denuncia[];
  fundaciones: Fundacion[];
  usuarios: User[];
  isLoadingUsuarios: boolean;
  errorUsuarios: string | null;
  fetchUsuarios: () => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  setUserEstatus: (id: string, nuevoEstatus: User["estatus"]) => Promise<void>;
  revokeUserSession: (id: string) => void;
  toggleUserSession: (id: string) => void;
  updateUsuario: (id: string, updates: Partial<User>) => void;
  addSolicitud: (sol: typeof MOCK_SOLICITUDES[0]) => void;
  updateSolicitud: (id: string, updates: Partial<typeof MOCK_SOLICITUDES[0]>) => void;
  addDenuncia: (data: Omit<Denuncia, "id" | "ticket" | "estado" | "fecha" | "auditoria" | "createdAt" | "updatedAt">) => Denuncia;
  updateDenuncia: (id: number, updates: Partial<Denuncia>) => void;
  updateFundacion: (id: string, updates: Partial<Fundacion>) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [usuarios, setUsuarios] = useState<User[]>(() => storage.getUserList());
  const [isLoadingUsuarios, setIsLoadingUsuarios] = useState<boolean>(true);
  const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    const token = storage.getToken();
    if (!token) {
      setIsLoadingUsuarios(false);
      return;
    }
    try {
      setIsLoadingUsuarios(true);
      setErrorUsuarios(null);
      const data = await getUsuariosApi();
      setUsuarios(data);
      storage.setUserList(data);
    } catch (err: unknown) {
      console.error("Error cargando usuarios:", err);
      setErrorUsuarios((err as Error).message || "Error al conectar con el servidor");
      const stored = storage.getUserList();
      if (stored.length > 0) setUsuarios(stored);
    } finally {
      setIsLoadingUsuarios(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const toggleUserStatus = useCallback(async (id: string) => {
    const user = usuarios.find((u) => u.id === id);
    if (!user) return;

    const actualmenteActivo = user.estatus === "ACTIVO";
    const nuevoEstatus: User["estatus"] = actualmenteActivo ? "BLOQUEADO" : "ACTIVO";

    await updateUsuarioEstadoApi(id, nuevoEstatus);

    setUsuarios((prev) => {
      const updated = prev.map((u) => {
        if (u.id === id) {
          return {
            ...u,
            estatus: nuevoEstatus,
            estaActivo: !actualmenteActivo,
            sesionActiva: !actualmenteActivo ? u.sesionActiva : false,
          };
        }
        return u;
      });
      storage.setUserList(updated);
      return updated;
    });
  }, [usuarios]);

  const setUserEstatus = useCallback(async (id: string, nuevoEstatus: User["estatus"]) => {
    await updateUsuarioEstadoApi(id, nuevoEstatus);

    setUsuarios((prev) => {
      const updated = prev.map((u) => {
        if (u.id === id) {
          const isActivo = nuevoEstatus === "ACTIVO";
          return {
            ...u,
            estatus: nuevoEstatus,
            estaActivo: isActivo,
            sesionActiva: isActivo ? u.sesionActiva : false,
          };
        }
        return u;
      });
      storage.setUserList(updated);
      return updated;
    });
  }, []);

  const revokeUserSession = useCallback((id: string) => {
    setUsuarios((prev) => {
      const updated = prev.map((u) =>
        u.id === id ? { ...u, sesionActiva: false } : u
      );
      storage.setUserList(updated);
      return updated;
    });
  }, []);

  const toggleUserSession = useCallback((id: string) => {
    setUsuarios((prev) => {
      const updated = prev.map((u) => {
        if (u.id === id) {
          const nuevaSesion = !u.sesionActiva;
          return { ...u, sesionActiva: nuevaSesion };
        }
        return u;
      });
      storage.setUserList(updated);
      return updated;
    });
  }, []);

  const updateUsuario = useCallback((id: string, updates: Partial<User>) => {
    setUsuarios((prev) => {
      const updated = prev.map((u) => (u.id === id ? { ...u, ...updates } : u));
      storage.setUserList(updated);
      return updated;
    });
  }, []);

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
    <AdminContext.Provider
      value={{
        solicitudes,
        denuncias,
        fundaciones,
        usuarios,
        isLoadingUsuarios,
        errorUsuarios,
        fetchUsuarios,
        toggleUserStatus,
        setUserEstatus,
        revokeUserSession,
        toggleUserSession,
        updateUsuario,
        addSolicitud,
        updateSolicitud,
        addDenuncia,
        updateDenuncia,
        updateFundacion,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
