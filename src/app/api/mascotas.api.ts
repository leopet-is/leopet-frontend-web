// src/app/api/mascotas.api.ts
import { apiFetch } from "../lib/api";
import { GLOBALCONFIG } from "../lib/config";
import type { Pet } from "../lib/types";

export interface ApiAnimal {
  id: number;
  nombre: string;
  status: "REQUIERE_PADRINOS" | "APADRINADO" | "EN_TRATAMIENTO" | "FALLECIDO" | "INACTIVO" | string;
  especie: string;
  raza?: string;
  descripcion?: string;
  imagen?: string;
  galeria?: string[] | { fotos: string[] };
  fundacion_id: number;
  fundacion?: string;
  sexo?: "MACHO" | "HEMBRA" | string;
  fecha_nacimiento_estimada?: string;
  peso?: number | string;
  monto_meta_mensual?: number | string;
  monto_recaudado_actual?: number | string;
  visible?: boolean;
  enfermedades?: string;
  esterilizacion?: boolean | null;
  vacunacion?: boolean | null;
  desparasitacion?: boolean | null;
  fecha_rescate?: string;
  fecha_registro?: string;
  historia?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetMascotasResponse {
  limit: number;
  page: number;
  totalPages: number;
  total: number;
  result: ApiAnimal[];
}

export type MascotaFrontend = Pet;

export interface GetMascotasParams {
  especie?: string; // "todos" | "Perro" | "Gato" | "PERRO" | "GATO"
  q?: string;
  page?: number;
  limit?: number;
  fundacionId?: string | number;
}

export interface MascotasPaginatedResult {
  mascotas: Pet[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export const MAX_UPLOAD_IMAGE_SIZE = 10 * 1024 * 1024;

interface UploadFileResponse {
  fotos?: string[];
  url?: string;
  fileUrl?: string;
  imageUrl?: string;
  result?: string | {
    url?: string;
    fileUrl?: string;
    imageUrl?: string;
  };
}

const DEFAULT_ANIMAL_IMAGE =
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80";

/**
 * Calcula la edad en años a partir de la fecha de nacimiento estimada (YYYY-MM-DD)
 */
export function calcularEdad(fechaNacimientoEstimada?: string | null): number {
  if (!fechaNacimientoEstimada) return 0;
  const birth = new Date(fechaNacimientoEstimada);
  if (isNaN(birth.getTime())) return 0;
  const diffMs = Date.now() - birth.getTime();
  const age = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  return Math.max(0, age);
}

function normalizarGaleria(galeria: unknown): string[] {
  if (Array.isArray(galeria)) return galeria;
  if (galeria && typeof galeria === "object" && "fotos" in galeria && Array.isArray((galeria as { fotos: unknown[] }).fotos)) {
    return (galeria as { fotos: string[] }).fotos;
  }
  return [];
}

/**
 * Función adaptadora para traducir el modelo del backend al modelo Pet usado por el frontend.
 */
export function mapApiAnimalToFrontend(apiAnimal: ApiAnimal): Pet {
  const rawSexo = (apiAnimal.sexo || "").toUpperCase();
  const sexoFormateado: "Macho" | "Hembra" | string =
    rawSexo === "MACHO" ? "Macho" : rawSexo === "HEMBRA" ? "Hembra" : "Macho";

  const rawEspecie = (apiAnimal.especie || "").toUpperCase();
  const especieFormateada =
    rawEspecie === "PERRO" ? "Perro" : rawEspecie === "GATO" ? "Gato" : "Otro";

  return {
    id: apiAnimal.id,
    nombre: apiAnimal.nombre || "Sin nombre",
    status: apiAnimal.status || "REQUIERE_PADRINOS",
    especie: especieFormateada,
    raza: apiAnimal.raza || "Mestizo",
    descripcion: apiAnimal.descripcion || "Sin descripción disponible.",
    historia: apiAnimal.historia || apiAnimal.descripcion || "Sin historia disponible.",
    imagen: apiAnimal.imagen && apiAnimal.imagen.trim() !== "" ? apiAnimal.imagen : DEFAULT_ANIMAL_IMAGE,
    galeria: normalizarGaleria(apiAnimal.galeria),
    fundacionId: String(apiAnimal.fundacion_id || ""),
    fundacionNombre: apiAnimal.fundacion,
    edad: calcularEdad(apiAnimal.fecha_nacimiento_estimada),
    peso: apiAnimal.peso != null ? Number(apiAnimal.peso) : undefined,
    sexo: sexoFormateado,
    ubicacion: apiAnimal.fundacion || "Ecuador",
    visible: apiAnimal.visible !== false,
    esterilizacion: typeof apiAnimal.esterilizacion === "boolean" ? apiAnimal.esterilizacion : null,
    vacunacion: typeof apiAnimal.vacunacion === "boolean" ? apiAnimal.vacunacion : null,
    desparasitacion: typeof apiAnimal.desparasitacion === "boolean" ? apiAnimal.desparasitacion : null,
    enfermedades: apiAnimal.enfermedades || "",
    fechaRegistro: apiAnimal.fecha_registro || apiAnimal.createdAt,
    fechaRescate: apiAnimal.fecha_rescate,
    fecha_nacimiento_estimada: apiAnimal.fecha_nacimiento_estimada,
    monto_meta_mensual: apiAnimal.monto_meta_mensual != null ? Number(apiAnimal.monto_meta_mensual) : undefined,
    monto_recaudado_actual: apiAnimal.monto_recaudado_actual != null ? Number(apiAnimal.monto_recaudado_actual) : undefined,
    createdAt: apiAnimal.createdAt,
    updatedAt: apiAnimal.updatedAt,
  };
}

/**
 * GET /animal
 * Consulta paginada y filtrada del catálogo general de animales.
 */
export async function getMascotasApi(
  params: GetMascotasParams = {}
): Promise<MascotasPaginatedResult> {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  // El backend usa limit=1 por defecto si no se especifica; fijamos un límite adecuado
  query.set("limit", String(params.limit || 50));

  if (params.especie && params.especie.toLowerCase() !== "todos") {
    query.set("especie", params.especie.toUpperCase());
  }

  if (params.q && params.q.trim()) {
    query.set("q", params.q.trim());
  }

  if (params.fundacionId) {
    query.set("fundacionId", String(params.fundacionId));
  }

  const response = await apiFetch<GetMascotasResponse>(`/animal?${query.toString()}`, {
    method: "GET",
  });

  return {
    mascotas: (response.result || []).map(mapApiAnimalToFrontend),
    total: response.total ?? (response.result || []).length,
    totalPages: response.totalPages ?? 1,
    page: response.page ?? 1,
    limit: response.limit ?? 50,
  };
}

/**
 * GET /animal/app/fundacion/:fundacionId?limit=:limit&page=:page
 * Obtiene el catálogo de mascotas asociadas a una fundación
 */
export async function getMascotasByFundacionApi(
  fundacionId: string | number,
  limit = 100,
  page = 1
): Promise<Pet[]> {
  const firstPage = await apiFetch<GetMascotasResponse>(
    `/animal/app/fundacion/${fundacionId}?limit=${limit}&page=${page}`,
    {
      method: "GET",
    }
  );

  const remainingPages = Array.from(
    { length: Math.max(0, (firstPage.totalPages || 1) - 1) },
    (_, index) => page + index + 1
  );
  const remainingResults = await Promise.all(
    remainingPages.map((currentPage) =>
      apiFetch<GetMascotasResponse>(
        `/animal/app/fundacion/${fundacionId}?limit=${limit}&page=${currentPage}`,
        { method: "GET" }
      )
    )
  );

  return [firstPage, ...remainingResults].flatMap((response) =>
    (response.result || []).map(mapApiAnimalToFrontend)
  );
}

/**
 * POST /otros/uploadFile
 * Sube un archivo y devuelve su URL pública.
 */
export async function uploadFileApi(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo seleccionado no es una imagen válida.");
  }
  if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
    throw new Error("La imagen no puede superar los 10 MB.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch<UploadFileResponse>("/otros/uploadFile", {
    method: "POST",
    body: formData,
  });
  const uploadedUrl = typeof response?.result === "string"
    ? response.result
    : response?.result && typeof response.result === "object"
      ? response.result.url || response.result.fileUrl || response.result.imageUrl
      : response?.fotos?.[0] || response?.url || response?.fileUrl || response?.imageUrl;

  if (!uploadedUrl) {
    throw new Error("El servidor no devolvió la URL de la imagen subida.");
  }

  return new URL(uploadedUrl, GLOBALCONFIG.EndpointBackHost).toString();
}

/**
 * GET /animal/:animalId
 * Obtiene el detalle de un animal por su ID
 */
export async function getMascotaByIdApi(animalId: string | number): Promise<Pet | null> {
  const response = await apiFetch<{ result: ApiAnimal | [] }>(`/animal/${animalId}`, {
    method: "GET",
  });
  if (!response.result || Array.isArray(response.result)) {
    return null;
  }
  return mapApiAnimalToFrontend(response.result as ApiAnimal);
}

/**
 * POST /animal
 * Crea un nuevo animal (requiere token de administrador de fundación)
 */
export async function createMascotaApi(data: Partial<ApiAnimal>): Promise<Pet> {
  const payload = {
    ...data,
    especie: data.especie ? data.especie.toUpperCase() : "PERRO",
    sexo: data.sexo ? data.sexo.toUpperCase() : "MACHO",
  };
  const response = await apiFetch<{ mensaje: string; result: ApiAnimal }>("/animal", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapApiAnimalToFrontend(response.result);
}

/**
 * PUT /animal/:animalId
 * Actualiza un animal existente (requiere token de administrador de fundación)
 */
export async function updateMascotaApi(
  animalId: number | string,
  data: Partial<ApiAnimal>
): Promise<Pet> {
  const payload: Partial<ApiAnimal> = { ...data };
  if (payload.especie) payload.especie = payload.especie.toUpperCase();
  if (payload.sexo) payload.sexo = payload.sexo.toUpperCase();

  const response = await apiFetch<{ mensaje: string; result: ApiAnimal }>(
    `/animal/${animalId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
  return mapApiAnimalToFrontend(response.result);
}

/**
 * DELETE /animal/:animalId
 * Elimina un animal existente (requiere token de administrador de fundación)
 */
export async function deleteMascotaApi(animalId: number | string): Promise<{ mensaje: string }> {
  return apiFetch<{ mensaje: string }>(`/animal/${animalId}`, {
    method: "DELETE",
  });
}
