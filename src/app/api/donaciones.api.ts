import { apiFetch } from "../lib/api";

export async function getPayPalAvailabilityApi(): Promise<{ available: boolean; message?: string }> {
  return apiFetch<{ available: boolean; message?: string }>("/paypal/availability", { method: "GET" });
}

export async function crearEnlaceDonacionApi(manadaId: number | string): Promise<string> {
  const response = await apiFetch<{ result: string }>("/donacion", {
    method: "POST",
    body: JSON.stringify({ manadaId: Number(manadaId) }),
  });
  if (!response.result || !URL.canParse(response.result)) {
    throw new Error("El servidor no devolvió un enlace de aprobación válido de PayPal.");
  }
  const approvalUrl = new URL(response.result);
  if (approvalUrl.protocol !== "https:" || !approvalUrl.hostname.endsWith("paypal.com")) {
    throw new Error("PayPal devolvió un enlace de aprobación no seguro.");
  }
  return approvalUrl.toString();
}
