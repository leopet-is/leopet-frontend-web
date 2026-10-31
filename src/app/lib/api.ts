import { GLOBALCONFIG } from "./config";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url =`${GLOBALCONFIG.EndpointBackHost}${endpoint}`; 

  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('leopet_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('leopet_token');
    }

    const contentType = response.headers.get("content-type");
    let errorMessage: string;

    if (contentType && contentType.includes("application/json")) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch {
        errorMessage = "Error parseando la respuesta JSON del servidor";
      }
    } else {
      errorMessage = await response.text();
    }

    throw new Error(errorMessage);
  }

  return response.json();
}