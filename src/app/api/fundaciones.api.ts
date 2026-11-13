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

export interface SolicitudFundacionAdmin {
  id: string;
  fundacionNombre: string;
  ruc: string;
  correo: string;
  representanteLegal: string;
  telefono: string;
  direccion: string;
  ubicacion: string;
  fechaSolicitud: string;
  estado: "Pendiente" | "Aprobada" | "Rechazada";
  motivoRechazo?: string;
  documentosUrls: string[];
}

interface SolicitudesResponse {
  totalPages: number;
  result: Solicitud[];
}

function mapSolicitud(solicitud: Solicitud): SolicitudFundacionAdmin {
  const estado = solicitud.estado.toLowerCase();
  return {
    id: String(solicitud.id),
    fundacionNombre: solicitud.nombre,
    ruc: solicitud.ruc,
    correo: solicitud.email_contacto,
    representanteLegal: `${solicitud.nombre_contacto} ${solicitud.apellido_contacto}`.trim(),
    telefono: solicitud.telefono,
    direccion: solicitud.direccion,
    ubicacion: solicitud.direccion,
    fechaSolicitud: solicitud.createdAt.split("T")[0],
    estado: estado === "aprobada" ? "Aprobada" : estado === "rechazada" ? "Rechazada" : "Pendiente",
    motivoRechazo: solicitud.notas_admin,
    documentosUrls: [],
  };
}

export async function getSolicitudesFundacionApi(): Promise<SolicitudFundacionAdmin[]> {
  const all: SolicitudFundacionAdmin[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const response = await apiFetch<SolicitudesResponse>(`/admin/solicitudes?limit=100&page=${page}`, {
      method: "GET",
    });
    all.push(...response.result.map(mapSolicitud));
    totalPages = response.totalPages;
    page += 1;
  } while (page <= totalPages);
  return all;
}

interface SolicitudActionResponse {
  mensaje: string;
}

export async function aprobarSolicitudFundacionApi(id: string): Promise<string> {
  const response = await apiFetch<SolicitudActionResponse>(`/admin/solicitudes/${id}/aprobar`, { method: "PUT" });
  return response.mensaje;
}

export async function rechazarSolicitudFundacionApi(id: string, notas_admin: string): Promise<string> {
  const response = await apiFetch<SolicitudActionResponse>(`/admin/solicitudes/${id}/rechazar`, {
    method: "PUT",
    body: JSON.stringify({ notas_admin }),
  });
  return response.mensaje;
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

export interface PadrinoFundacion {
  id: string;
  animalId: number;
  manadaId: number;
  mascotaNombre: string;
  donadorNombre: string;
  manadaNombre: string;
  montoMensual: number;
  estado: "activo" | "pausado";
  fechaInicio?: string;
}

export async function getPadrinosFundacionApi(fundacionId: string | number): Promise<PadrinoFundacion[]> {
  const response = await apiFetch<{ result: Array<{
    id: string;
    animalId: number;
    manadaId: number;
    nombre: string;
    padrinoNombre: string;
    padrinoApellido: string;
    manadaNombre: string;
    montoMensual: number;
    estado: "activo" | "pausado";
    fechaInicio?: string;
  }> }>(`/fundacion/padrinos/${fundacionId}?limit=100&page=1`, { method: "GET" });
  return response.result.map((padrino) => ({
    id: padrino.id,
    animalId: padrino.animalId,
    manadaId: padrino.manadaId,
    mascotaNombre: padrino.nombre,
    donadorNombre: [padrino.padrinoNombre, padrino.padrinoApellido].filter(Boolean).join(" "),
    manadaNombre: padrino.manadaNombre,
    montoMensual: Number(padrino.montoMensual),
    estado: padrino.estado,
    fechaInicio: padrino.fechaInicio,
  }));
}