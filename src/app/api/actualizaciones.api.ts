import { apiFetch } from "../lib/api";

export interface EvidenciaFundacion {
  id: string;
  mascotaId: string;
  mascotaNombre: string;
  fundacionId: string;
  fundacionNombre: string;
  tipo: "foto" | "video";
  titulo: string;
  descripcion: string;
  estadoSalud: string;
  imagenUrl: string;
  fecha: string;
  calificacionPromedio?: number;
  estado: "publicada" | "en_revision";
}

interface ApiActualizacion {
  id: number;
  fecha: string;
  descripcion: string;
  estado_salud: string;
  imagen: string;
  calificacion?: number;
  fundacion_id: number;
  galeria?: unknown;
  animal?: { id: number; nombre: string } | null;
  fundacion?: { nombre: string } | null;
}

interface ActualizacionesResponse {
  totalPages: number;
  result: ApiActualizacion[];
}

function mapActualizacion(actualizacion: ApiActualizacion): EvidenciaFundacion {
  const [titulo, ...descripcion] = actualizacion.descripcion.split("\n");
  return {
    id: String(actualizacion.id),
    mascotaId: String(actualizacion.animal?.id ?? ""),
    mascotaNombre: actualizacion.animal?.nombre ?? "Mascota",
    fundacionId: String(actualizacion.fundacion_id),
    fundacionNombre: actualizacion.fundacion?.nombre ?? "Fundación",
    tipo: /\.(mp4|webm|mov)(\?|$)/i.test(actualizacion.imagen) ? "video" : "foto",
    titulo: titulo || actualizacion.descripcion,
    descripcion: descripcion.join("\n").trim() || actualizacion.descripcion,
    estadoSalud: actualizacion.estado_salud,
    imagenUrl: actualizacion.imagen,
    fecha: actualizacion.fecha?.slice(0, 10) ?? "",
    calificacionPromedio: actualizacion.calificacion,
    estado: "publicada",
  };
}

export async function getActualizacionesFundacionApi(
  fundacionId: string | number,
  limit = 100,
): Promise<EvidenciaFundacion[]> {
  const all: EvidenciaFundacion[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const response = await apiFetch<ActualizacionesResponse>(
      `/actualizacion?fundacion_id=${fundacionId}&limit=${limit}&page=${page}`,
      { method: "GET" },
    );
    all.push(...response.result.map(mapActualizacion));
    totalPages = response.totalPages;
    page += 1;
  } while (page <= totalPages);
  return all;
}

export async function crearActualizacionApi(input: {
  mascotaId: number;
  fundacionId: number;
  titulo: string;
  descripcion: string;
  estadoSalud: string;
  imagen: string;
}): Promise<EvidenciaFundacion> {
  const response = await apiFetch<{ result: ApiActualizacion }>("/actualizacion", {
    method: "POST",
    body: JSON.stringify({
      animal_id: input.mascotaId,
      fundacion_id: input.fundacionId,
      descripcion: `${input.titulo.trim()}\n${input.descripcion.trim()}`,
      estado_salud: input.estadoSalud.trim(),
      fecha: new Date().toISOString().slice(0, 10),
      imagen: input.imagen,
      galeria: [],
    }),
  });
  return mapActualizacion(response.result);
}
