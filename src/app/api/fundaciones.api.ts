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