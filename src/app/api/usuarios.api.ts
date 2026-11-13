// src/app/api/usuarios.api.ts
import { apiFetch } from "../lib/api";
import type { User } from "../lib/types";

export interface ApiUsuario {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  direccion: string;
  email: string;
  role: number; // 1: admin, 2: fundacion, 3: donador
  estado: "ACTIVO" | "INACTIVO" | "BLOQUEADO" | "PENDIENTE_ACTIVACION";
  createdAt: string;
  updatedAt: string;
}

export interface GetAllUsersResponse {
  result: ApiUsuario[];
  totalRows: number;
  totalPages: number;
  page: number;
  limit: number;
  adminCount: number;
  fundacionCount: number;
  donadorCount: number;
}

/**
 * Función adaptadora para traducir el modelo del backend al modelo usado por las vistas
 */
export function mapApiUserToFrontend(apiUser: ApiUsuario): User {
  let rol: User["rol"] = "donador";
  if (apiUser.role === 1) rol = "admin";
  else if (apiUser.role === 2) rol = "fundacion";

  return {
    id: String(apiUser.id),
    nombre: apiUser.nombres,
    apellido: apiUser.apellidos,
    correo: apiUser.email,
    cedula: apiUser.cedula,
    telefono: apiUser.telefono,
    rol,
    estatus: apiUser.estado,
    estaActivo: apiUser.estado === "ACTIVO",
    createdAt: apiUser.createdAt ? apiUser.createdAt.split("T")[0] : undefined,
  };
}

/**
 * Obtiene el listado de usuarios desde el backend
 */
export async function getUsuariosApi(): Promise<User[]> {
  const response = await apiFetch<GetAllUsersResponse>("/usuario?limit=500", {
    method: "GET",
  });
  return (response.result || [])
    .filter((apiUser) => apiUser.role !== 1)
    .map(mapApiUserToFrontend);
}

/**
 * Actualiza el estado de un usuario (ACTIVO, BLOQUEADO, INACTIVO, etc.)
 */
export async function updateUsuarioEstadoApi(
  usuarioId: string,
  estado: User["estatus"]
): Promise<void> {
  await apiFetch(`/usuario/${usuarioId}/status`, {
    method: "PUT",
    body: JSON.stringify({ estado }),
  });
}
