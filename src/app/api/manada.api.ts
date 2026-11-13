import { apiFetch } from "../lib/api";

export interface ApiManada {
  id: number;
  nombre: string;
  userId?: number | string;
  monto?: number;
  status?: number | boolean;
  statusSubscription?: boolean;
  apadrinados?: number;
  galeria?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateManadaPayload {
  nombre: string;
  monto?: number;
}

export interface GetManadasParams {
  q?: string;
  page?: number;
  limit?: number;
}

export interface GetManadasResponse {
  limit: number;
  page: number;
  totalPages: number;
  count: number;
  result: ApiManada[];
}

export interface AddAnimalsManadaResponse {
  mensaje: string;
  data: Array<{
    manada_id: number;
    animal_id: number;
    mensaje?: string;
  }>;
}

/**
 * POST /manada
 * Crea una nueva manada para el donador autenticado
 */
export async function createManadaApi(payload: CreateManadaPayload): Promise<{ mensaje: string; manada: ApiManada }> {
  return apiFetch<{ mensaje: string; manada: ApiManada }>("/manada", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * GET /manada
 * Obtiene las manadas del donador actual con paginación
 */
export async function getManadasApi(params: GetManadasParams = {}): Promise<GetManadasResponse> {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiFetch<GetManadasResponse>(`/manada${query}`, {
    method: "GET",
  });
}

/**
 * POST /manada/:manadaId/animals
 * Asocia una lista de animales (IDs) a una manada existente
 */
export async function addAnimalsToManadaApi(
  manadaId: number | string,
  animalIds: (number | string)[]
): Promise<AddAnimalsManadaResponse> {
  const numericIds = animalIds
    .map((id) => Number(id))
    .filter((id) => !isNaN(id));

  return apiFetch<AddAnimalsManadaResponse>(`/manada/${manadaId}/animals`, {
    method: "POST",
    body: JSON.stringify({ animalId: numericIds }),
  });
}

/**
 * GET /manada/:manadaId/animals
 * Obtiene los animales asociados a una manada
 */
export async function getAnimalsFromManadaApi(manadaId: number | string): Promise<{ result: unknown[] }> {
  return apiFetch<{ result: unknown[] }>(`/manada/${manadaId}/animals`, {
    method: "GET",
  });
}

/**
 * DELETE /manada/:manadaId/animals/:animalId
 * Elimina una mascota de una manada
 */
export async function deleteAnimalFromManadaApi(
  manadaId: number | string,
  animalId: number | string
): Promise<{ mensaje: string }> {
  return apiFetch<{ mensaje: string }>(`/manada/${manadaId}/animals/${animalId}`, {
    method: "DELETE",
  });
}

/**
 * DELETE /manada/:manadaId
 * Elimina lógicamente una manada
 */
export async function deleteManadaApi(manadaId: number | string): Promise<{ mensaje: string }> {
  return apiFetch<{ mensaje: string }>(`/manada/${manadaId}`, {
    method: "DELETE",
  });
}

