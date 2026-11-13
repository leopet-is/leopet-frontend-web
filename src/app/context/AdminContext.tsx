import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { storage } from "../lib/storage";
import { MOCK_DENUNCIAS } from "../../data/mockDenuncias";
import { MOCK_FUNDACIONES } from "../../data/mockFundaciones";
import type { User } from "../lib/types";
import { getUsuariosApi, updateUsuarioEstadoApi } from "../api/usuarios.api";
import {
  aprobarSolicitudFundacionApi,
  getSolicitudesFundacionApi,
  rechazarSolicitudFundacionApi,
  type SolicitudFundacionAdmin,
} from "../api/fundaciones.api";


type Denuncia = typeof MOCK_DENUNCIAS[0];
type Fundacion = typeof MOCK_FUNDACIONES[0];

interface AdminContextType {
  solicitudes: SolicitudFundacionAdmin[];
  isLoadingSolicitudes: boolean;
  errorSolicitudes: string | null;
  fetchSolicitudes: () => Promise<void>;
  aprobarSolicitud: (id: string) => Promise<string>;
  rechazarSolicitud: (id: string, motivo: string) => Promise<string>;
  denuncias: Denuncia[];
  fundaciones: Fundacion[];
  usuarios: User[];
  isLoadingUsuarios: boolean;
  errorUsuarios: string | null;
  fetchUsuarios: () => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  setUserEstatus: (id: string, nuevoEstatus: User["estatus"]) => Promise<void>;
  updateUsuario: (id: string, updates: Partial<User>) => void;
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

  const [solicitudes, setSolicitudes] = useState<SolicitudFundacionAdmin[]>([]);
  const [isLoadingSolicitudes, setIsLoadingSolicitudes] = useState(true);
  const [errorSolicitudes, setErrorSolicitudes] = useState<string | null>(null);

  const fetchSolicitudes = useCallback(async () => {
    if (!storage.getToken()) {
      setIsLoadingSolicitudes(false);
      return;
    }
    setIsLoadingSolicitudes(true);
    setErrorSolicitudes(null);
    try {
      setSolicitudes(await getSolicitudesFundacionApi());
    } catch (err) {
      setErrorSolicitudes(err instanceof Error ? err.message : "No se pudieron cargar las solicitudes");
    } finally {
      setIsLoadingSolicitudes(false);
    }
  }, []);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const aprobarSolicitud = useCallback(async (id: string) => {
    const message = await aprobarSolicitudFundacionApi(id);
    await fetchSolicitudes();
    return message;
  }, [fetchSolicitudes]);

  const rechazarSolicitud = useCallback(async (id: string, motivo: string) => {
    const message = await rechazarSolicitudFundacionApi(id, motivo);
    await fetchSolicitudes();
    return message;
  }, [fetchSolicitudes]);

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
          };
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

  const [denuncias, setDenuncias] = useState<Denuncia[]>(() => {
    const stored = storage.getDenuncias();
    return stored.length > 0 ? stored : MOCK_DENUNCIAS;
  });

  const [fundaciones, setFundaciones] = useState<Fundacion[]>(() => {
    const stored = storage.getFundaciones();
    return stored.length > 0 ? stored : MOCK_FUNDACIONES;
  });

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
        isLoadingSolicitudes,
        errorSolicitudes,
        fetchSolicitudes,
        aprobarSolicitud,
        rechazarSolicitud,
        denuncias,
        fundaciones,
        usuarios,
        isLoadingUsuarios,
        errorUsuarios,
        fetchUsuarios,
        toggleUserStatus,
        setUserEstatus,
        updateUsuario,
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
