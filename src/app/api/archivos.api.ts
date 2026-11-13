import { apiFetch } from "../lib/api";

export async function uploadFileApi(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiFetch<{ fotos: string[] }>("/otros/uploadFile", {
    method: "POST",
    body: formData,
  });
  const [url] = response.fotos;
  if (!url) throw new Error("El servidor no devolvió la URL del archivo cargado.");
  return url;
}
