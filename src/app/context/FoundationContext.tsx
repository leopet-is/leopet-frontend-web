import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { getActualizacionesFundacionApi, type EvidenciaFundacion } from "../api/actualizaciones.api";
import { getMascotasByFundacionApi } from "../api/mascotas.api";
import { getPadrinosFundacionApi, type PadrinoFundacion } from "../api/fundaciones.api";
import { useAuth } from "./AuthContext";
import type { Pet } from "../lib/types";

interface Advertencia {
  id: string;
  fundacionId: string;
  fundacionNombre: string;
  denunciaId: string;
  evidenciaId: string;
  motivo: string;
  mensajeAdmin: string;
  fecha: string;
  estado: "pendiente" | "atendida";
  respuestaFundacion?: string;
  fechaRespuesta?: string;
}

interface FoundationContextType {
  mascotas: Pet[];
  evidencias: EvidenciaFundacion[];
  advertencias: Advertencia[];
  padrinos: PadrinoFundacion[];
  isLoadingMascotas: boolean;
  isLoadingEvidencias: boolean;
  isLoadingPadrinos: boolean;
  errorMascotas: string | null;
  errorEvidencias: string | null;
  errorPadrinos: string | null;
  advertenciasAvailable: boolean;
  refreshMascotas: () => Promise<void>;
  refreshEvidencias: () => Promise<void>;
  refreshPadrinos: () => Promise<void>;
  addMascota: (mascota: Pet) => void;
  updateMascota: (id: number, updates: Partial<Pet>) => void;
  updateEvidencia: (id: string, updates: Partial<EvidenciaFundacion>) => void;
}

const FoundationContext = createContext<FoundationContextType | null>(null);

export function FoundationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const fundacionId = user?.rol === "fundacion" ? user.fundacionId : null;
  const [mascotas, setMascotas] = useState<Pet[]>([]);
  const [evidencias, setEvidencias] = useState<EvidenciaFundacion[]>([]);
  const [padrinos, setPadrinos] = useState<PadrinoFundacion[]>([]);
  const [isLoadingMascotas, setIsLoadingMascotas] = useState(false);
  const [isLoadingEvidencias, setIsLoadingEvidencias] = useState(false);
  const [isLoadingPadrinos, setIsLoadingPadrinos] = useState(false);
  const [errorMascotas, setErrorMascotas] = useState<string | null>(null);
  const [errorEvidencias, setErrorEvidencias] = useState<string | null>(null);
  const [errorPadrinos, setErrorPadrinos] = useState<string | null>(null);

  const refreshMascotas = useCallback(async () => {
    if (!fundacionId) {
      setMascotas([]);
      setErrorMascotas(null);
      return;
    }
    setIsLoadingMascotas(true);
    setErrorMascotas(null);
    try {
      setMascotas(await getMascotasByFundacionApi(fundacionId));
    } catch (error) {
      setErrorMascotas(error instanceof Error ? error.message : "No se pudieron cargar las mascotas.");
    } finally {
      setIsLoadingMascotas(false);
    }
  }, [fundacionId]);

  const refreshEvidencias = useCallback(async () => {
    if (!fundacionId) {
      setEvidencias([]);
      setErrorEvidencias(null);
      return;
    }
    setIsLoadingEvidencias(true);
    setErrorEvidencias(null);
    try {
      setEvidencias(await getActualizacionesFundacionApi(fundacionId));
    } catch (error) {
      setErrorEvidencias(error instanceof Error ? error.message : "No se pudieron cargar las evidencias.");
    } finally {
      setIsLoadingEvidencias(false);
    }
  }, [fundacionId]);

  const refreshPadrinos = useCallback(async () => {
    if (!fundacionId) {
      setPadrinos([]);
      setErrorPadrinos(null);
      return;
    }
    setIsLoadingPadrinos(true);
    setErrorPadrinos(null);
    try {
      setPadrinos(await getPadrinosFundacionApi(fundacionId));
    } catch (error) {
      setErrorPadrinos(error instanceof Error ? error.message : "No se pudieron cargar los padrinos.");
    } finally {
      setIsLoadingPadrinos(false);
    }
  }, [fundacionId]);

  useEffect(() => {
    void refreshMascotas();
    void refreshEvidencias();
    void refreshPadrinos();
  }, [refreshMascotas, refreshEvidencias, refreshPadrinos]);

  const addMascota = useCallback((mascota: Pet) => {
    setMascotas((prev) => [...prev, mascota]);
  }, []);

  const updateMascota = useCallback((id: number, updates: Partial<Pet>) => {
    setMascotas((prev) => prev.map((mascota) => (mascota.id === id ? { ...mascota, ...updates } : mascota)));
  }, []);

  const updateEvidencia = useCallback((id: string, updates: Partial<EvidenciaFundacion>) => {
    setEvidencias((prev) => prev.map((evidencia) => (
      evidencia.id === id ? { ...evidencia, ...updates } : evidencia
    )));
  }, []);

  return (
    <FoundationContext.Provider value={{
      mascotas,
      evidencias,
      advertencias: [],
      padrinos,
      isLoadingMascotas,
      isLoadingEvidencias,
      isLoadingPadrinos,
      errorMascotas,
      errorEvidencias,
      errorPadrinos,
      advertenciasAvailable: false,
      refreshMascotas,
      refreshEvidencias,
      refreshPadrinos,
      addMascota,
      updateMascota,
      updateEvidencia,
    }}>
      {children}
    </FoundationContext.Provider>
  );
}

export function useFoundation() {
  const ctx = useContext(FoundationContext);
  if (!ctx) throw new Error("useFoundation must be used within FoundationProvider");
  return ctx;
}
