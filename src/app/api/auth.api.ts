import { apiFetch } from "../lib/api";

export interface AuthUser {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  direccion: string;
  email: string;
  role: number;
  estado: string;
  fundacionId: number | null;
  createdAt: string;
  updatedAt: string;
  token: string;
}

export interface AuthResponse {
  result: AuthUser;
  expiresIn: number;
  tokenType: string;
}

export interface RegisterRequest {
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  direccion: string;
  email: string;
  password: string;
  role: number;
  fundacionId?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * POST /auth/register
 */
export async function register(
  data: RegisterRequest
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * POST /auth/login
 */
export async function login(
  data: LoginRequest
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}