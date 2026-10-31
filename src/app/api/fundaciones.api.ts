import { apiFetch } from "../lib/api";

export interface SolicitudRequest {
  ruc: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email_contacto: string;
  cedula_contacto: string;
  nombre_contacto: string;
  apellido_contacto: string;
  comentarios?: string; 
}

export interface Solicitud {
  id: number;
  ruc: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email_contacto: string;
  cedula_contacto: string;
  nombre_contacto: string;
  apellido_contacto: string;
  estado: string; 
  ready_for_creation: boolean;
  notas_admin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SolicitudResponse {
  mensaje: string;
  result: Solicitud;
}
/**
 * POST /public/solicitudes
 * Crea una nueva solicitud para registrar una fundación
 */
export async function crearSolicitud(
  data: SolicitudRequest
): Promise<SolicitudResponse> {
  return apiFetch<SolicitudResponse>("/public/solicitudes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export interface ApiFundacion {
  id: number;
  nombre: string;
  ruc?: string;
  direccion: string;
  telefono: string;
  logo?: string | null;
  descripcion?: string | null;
  aprobado?: boolean;
  cantidadMascotasCuidado?: number;
  createdAt?: string;
  updatedAt?: string;
  cuentaBancaria?: unknown;
  user?: {
    id?: number;
    email?: string;
    nombres?: string;
    apellidos?: string;
    telefono?: string;
  };
}

export interface GetFundacionResponse {
  result: ApiFundacion;
}

export interface GetFundacionesResponse {
  limit: number;
  page: number;
  totalPages: number;
  count: number;
  result: ApiFundacion[];
}

export interface FundacionFrontend {
  id: string;
  nombre: string;
  ruc: string;
  correo: string;
  telefono: string;
  direccion: string;
  ubicacion: string;
  descripcionCorta: string; // Misión / descripción principal
  historia?: string;
  logoUrl: string;
  portadaUrl: string;
  estadoSolicitud: "Aprobada" | "Pendiente" | "Rechazada";
  estado: "Activa" | "Deshabilitada";
  cantidadMascotasCuidado: number;
}

const DEFAULT_PORTADA = "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&auto=format&fit=crop&q=80";
const DEFAULT_LOGO = "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&auto=format&fit=crop&q=80";

/**
 * Función adaptadora para traducir el modelo del backend al modelo usado por las vistas
 */
export function mapApiFundacionToFrontend(apiFundacion: ApiFundacion): FundacionFrontend {
  const isAprobado = apiFundacion.aprobado !== false;

  return {
    id: String(apiFundacion.id),
    nombre: apiFundacion.nombre || "Fundación",
    ruc: apiFundacion.ruc || "",
    correo: apiFundacion.user?.email || "",
    telefono: apiFundacion.telefono || "",
    direccion: apiFundacion.direccion || "",
    ubicacion: apiFundacion.direccion || "Ecuador",
    descripcionCorta: apiFundacion.descripcion || "Organización dedicada al rescate, cuidado y bienestar de mascotas.",
    historia: undefined,
    logoUrl: apiFundacion.logo && apiFundacion.logo.trim() !== "" ? apiFundacion.logo : DEFAULT_LOGO,
    portadaUrl: DEFAULT_PORTADA,
    estadoSolicitud: isAprobado ? "Aprobada" : "Pendiente",
    estado: isAprobado ? "Activa" : "Deshabilitada",
    cantidadMascotasCuidado: apiFundacion.cantidadMascotasCuidado ?? 0,
  };
}

/**
 * GET /fundacion/:id
 * Obtiene el detalle de una fundación por su ID
 */
export async function getFundacionByIdApi(id: string | number): Promise<FundacionFrontend> {
  const response = await apiFetch<GetFundacionResponse>(`/fundacion/${id}`, {
    method: "GET",
  });
  return mapApiFundacionToFrontend(response.result);
}

/**
 * GET /fundacion
 * Obtiene el listado de fundaciones desde el backend
 */
export async function getFundacionesApi(limit = 100, page = 1): Promise<FundacionFrontend[]> {
  const response = await apiFetch<GetFundacionesResponse>(`/fundacion?limit=${limit}&page=${page}`, {
    method: "GET",
  });
  return (response.result || []).map(mapApiFundacionToFrontend);
}