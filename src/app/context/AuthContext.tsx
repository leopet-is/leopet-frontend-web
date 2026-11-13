import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

import { storage } from "../lib/storage";
import {
  login as loginRequest,
  register as registerRequest,
  type AuthUser as ApiAuthUser,
} from "../api/auth.api";

export interface AuthUser {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  cedula: string;
  rol: "donador" | "fundacion" | "admin";
  estaActivo: boolean;
  fundacionId?: number | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (correo: string, password: string) => Promise<AuthUser>;
  register: (
    nombre: string,
    apellido: string,
    correo: string,
    password: string,
    telefono: string,
    cedula: string,
  ) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapApiUserToAuthUser(apiUser: ApiAuthUser): AuthUser {
  let rol: AuthUser["rol"];

  if (apiUser.role === 1) {
    rol = "admin";
  } else if (apiUser.role === 2) {
    rol = "fundacion";
  } else {
    rol = "donador";
  }

  return {
    id: String(apiUser.id),
    nombre: apiUser.nombres,
    apellido: apiUser.apellidos,
    correo: apiUser.email,
    cedula: apiUser.cedula,
    rol,
    estaActivo: apiUser.estado === "ACTIVO",
    fundacionId: apiUser.fundacionId,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = storage.getUser();
    const storedToken = storage.getToken();
    // Evita sesiones "fantasma" donde el usuario existe en localStorage pero no hay token JWT real
    if (storedUser && !storedToken) {
      storage.setUser(null);
      return null;
    }
    return storedUser;
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      storage.setUser(null);
      storage.setToken(null);
    };
    window.addEventListener("leopet:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("leopet:unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(
    async (correo: string, password: string): Promise<AuthUser> => {
      const response = await loginRequest({
        email: correo,
        password,
      });

      const apiUser = response.result;

      const authUser = mapApiUserToAuthUser(apiUser);

      setUser(authUser);

      storage.setUser(authUser);

      storage.setToken(apiUser.token);

      return authUser;
    },
    []
  );

  

  const register = useCallback(
    async (
      nombre: string,
      apellido: string,
      correo: string,
      password: string,
      telefono: string,
      cedula: string
    ): Promise<AuthUser> => {
      const response = await registerRequest({
        cedula: cedula,
        nombres: nombre,
        apellidos: apellido,
        telefono: telefono,
        direccion: "",
        email: correo,
        password,
        role: 3,
      });

      const apiUser = response.result;

      const authUser = mapApiUserToAuthUser(apiUser);

      setUser(authUser);

      storage.setUser(authUser);

      storage.setToken(apiUser.token);

      return authUser;
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);

    storage.setUser(null);
    storage.setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}