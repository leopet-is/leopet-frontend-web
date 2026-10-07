// src/vite-env.d.ts
/// <reference types="vite/client" />
export const GLOBALCONFIG = {
  EndpointBackHost: import.meta.env.VITE_API_URL || 'https://leopet-backend.onrender.com',
};