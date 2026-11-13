// src/app/api/mascotas.api.ts
import { apiFetch } from "../lib/api";

export interface ApiAnimal {
  id: number;
  nombre: string;
  status: "BORRADOR" | "REQUIERE_PADRINOS" | "APADRINADO" | "EN_TRATAMIENTO" | "FALLECIDO" | "INACTIVO" | string;
  especie: string;
  raza?: string;
  descripcion?: string;
  imagen?: string;
  galeria?: string[] | { fotos: string[] };
  fundacion_id: number;
  fundacion?: string;
  sexo?: "MACHO" | "HEMBRA" | string;
  fecha_nacimiento_estimada?: string;
  peso?: number;
  monto_meta_mensual?: number;
  monto_recaudado_actual?: number;
  visible?: boolean;
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

export interface MascotaFrontend {
  id: number;
  nombre: string;
  status: string; // Mantiene el valor directo del backend: REQUIERE_PADRINOS, APADRINADO, etc.
  especie: string;
  raza: string;
  descripcion: string;
  imagen: string;
  galeria: string[];
  fundacionId: string;
  fundacionNombre?: string;
  edad: number;
  sexo: string;
  ubicacion: string;
  fecha_nacimiento_estimada?: string;
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
 * Función adaptadora para traducir el modelo del backend al modelo usado por las vistas frontend,
 * manteniendo el campo status coincidente con los valores del backend.
 */
export function mapApiAnimalToFrontend(apiAnimal: ApiAnimal): MascotaFrontend {
  const sexoFormateado = apiAnimal.sexo
    ? apiAnimal.sexo.charAt(0).toUpperCase() + apiAnimal.sexo.slice(1).toLowerCase()
    : "Desconocido";

  return {
    id: apiAnimal.id,
    nombre: apiAnimal.nombre || "Sin nombre",
    status: apiAnimal.status, // Coincide con el backend (ej. REQUIERE_PADRINOS)
    especie: apiAnimal.especie || "OTRO",
    raza: apiAnimal.raza || "Mestizo",
    descripcion: apiAnimal.descripcion || "Sin descripción disponible.",
    imagen: apiAnimal.imagen && apiAnimal.imagen.trim() !== "" ? apiAnimal.imagen : DEFAULT_ANIMAL_IMAGE,
    galeria: normalizarGaleria(apiAnimal.galeria),
    fundacionId: String(apiAnimal.fundacion_id),
    fundacionNombre: apiAnimal.fundacion,
    edad: calcularEdad(apiAnimal.fecha_nacimiento_estimada),
    sexo: sexoFormateado,
    ubicacion: apiAnimal.fundacion || "Ecuador",
    fecha_nacimiento_estimada: apiAnimal.fecha_nacimiento_estimada,
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
): Promise<MascotaFrontend[]> {
  const response = await apiFetch<GetMascotasResponse>(
    `/animal/app/fundacion/${fundacionId}?limit=${limit}&page=${page}`,
    {
      method: "GET",
    }
  );
  return (response.result || []).map(mapApiAnimalToFrontend);
}

/**
 * GET /animal/:animalId
 * Obtiene el detalle de un animal por su ID
 */
export async function getMascotaByIdApi(animalId: string | number): Promise<MascotaFrontend | null> {
  const response = await apiFetch<{ result: ApiAnimal | [] }>(`/animal/${animalId}`, {
    method: "GET",
  });
  if (!response.result || Array.isArray(response.result)) {
    return null;
  }
  return mapApiAnimalToFrontend(response.result as ApiAnimal);
}
