import type { User, ManadaAnimal, Subscription } from "./types";

type StoredPago = (typeof import("../../data/mockPagos").MOCK_PAGOS)[number];
type StoredSolicitud = (typeof import("../../data/mockSolicitudes").MOCK_SOLICITUDES)[number];
type StoredDenuncia = (typeof import("../../data/mockDenuncias").MOCK_DENUNCIAS)[number];
type StoredFundacion = (typeof import("../../data/mockFundaciones").MOCK_FUNDACIONES)[number];
type StoredMascota = (typeof import("../../data/mockMascotas").MOCK_MASCOTAS)[number];
type StoredEvidencia = (typeof import("../../data/mockEvidencias").MOCK_EVIDENCIAS)[number];
type StoredAdvertencia = (typeof import("../../data/mockAdvertencias").MOCK_ADVERTENCIAS)[number];
type StoredNotificacion = (typeof import("../../data/mockNotificaciones").MOCK_NOTIFICACIONES)[number];

export interface StoredAuthUser {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  cedula: string;
  rol: "donador" | "fundacion" | "admin";
  estaActivo: boolean;
  fundacionId?: number | null;
}

function getArray<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) as T[] : [];
  } catch {
    return [];
  }
}

const KEYS = {
  MANADA_CART: "leopet_manada_cart",
  MANADA_NOMBRE: "leopet_manada_nombre",
  MANADA_MONTO: "leopet_manada_monto",
  PAGOS: "leopet_pagos",
  USER: "leopet_user",
  TOKEN: "leopet_token",
  SUBSCRIPTIONS: "leopet_subscriptions",
  FAVORITOS: "leopet_favoritos",
  ADMIN_SOLICITUDES: "leopet_admin_solicitudes",
  ADMIN_DENUNCIAS: "leopet_admin_denuncias",
  ADMIN_FUNDACIONES: "leopet_admin_fundaciones",
  FOUNDATION_MASCOTAS: "leopet_fundacion_mascotas",
  FOUNDATION_EVIDENCIAS: "leopet_fundacion_evidencias",
  FOUNDATION_ADVERTENCIAS: "leopet_fundacion_advertencias",
  NOTIFICACIONES: "leopet_notificaciones",
  ADMIN_USUARIOS: "leopet_admin_usuarios",
} as const;

export const storage = {
  getManadaCart: (): ManadaAnimal[] => getArray<ManadaAnimal>(KEYS.MANADA_CART),

  setManadaCart: (cart: ManadaAnimal[]) => {
    localStorage.setItem(KEYS.MANADA_CART, JSON.stringify(cart));
  },

  getManadaNombre: (): string | null => {
    return localStorage.getItem(KEYS.MANADA_NOMBRE);
  },

  setManadaNombre: (nombre: string) => {
    localStorage.setItem(KEYS.MANADA_NOMBRE, nombre);
  },

  getManadaMonto: (): number | null => {
    const data = localStorage.getItem(KEYS.MANADA_MONTO);
    const parsed = data ? Number(data) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  },

  setManadaMonto: (monto: number) => {
    localStorage.setItem(KEYS.MANADA_MONTO, String(monto));
  },

  getPagos: (): StoredPago[] => getArray<StoredPago>(KEYS.PAGOS),

  setPagos: (pagos: StoredPago[]) => {
    localStorage.setItem(KEYS.PAGOS, JSON.stringify(pagos));
  },

  getUser: (): StoredAuthUser | null => {
    try {
      const data = localStorage.getItem(KEYS.USER);
      return data ? JSON.parse(data) as StoredAuthUser : null;
    } catch {
      return null;
    }
  },

  setUser: (user: StoredAuthUser | null) => {
    if (user) {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.USER);
    }
  },

  getUserList: (): User[] => {
    try {
      const data = localStorage.getItem(KEYS.ADMIN_USUARIOS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setUserList: (users: User[]) => {
    localStorage.setItem(KEYS.ADMIN_USUARIOS, JSON.stringify(users));
  },
  
  getToken: (): string | null => {
    try {
      return localStorage.getItem(KEYS.TOKEN);
    } catch {
      return null;
    }
  },

  setToken: (token: string | null) => {
    if (token) {
      localStorage.setItem(KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(KEYS.TOKEN);
    }
  },

  getSubscriptions: (): Subscription[] => getArray<Subscription>(KEYS.SUBSCRIPTIONS),

  setSubscriptions: (subs: Subscription[]) => {
    localStorage.setItem(KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
  },

  getFavoritos: (): string[] => {
    try {
      const data = localStorage.getItem(KEYS.FAVORITOS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setFavoritos: (ids: string[]) => {
    localStorage.setItem(KEYS.FAVORITOS, JSON.stringify(ids));
  },

  getSolicitudes: (): StoredSolicitud[] => getArray<StoredSolicitud>(KEYS.ADMIN_SOLICITUDES),

  setSolicitudes: (solicitudes: StoredSolicitud[]) => {
    localStorage.setItem(KEYS.ADMIN_SOLICITUDES, JSON.stringify(solicitudes));
  },

  getDenuncias: (): StoredDenuncia[] => getArray<StoredDenuncia>(KEYS.ADMIN_DENUNCIAS),

  setDenuncias: (denuncias: StoredDenuncia[]) => {
    localStorage.setItem(KEYS.ADMIN_DENUNCIAS, JSON.stringify(denuncias));
  },

  getFundaciones: (): StoredFundacion[] => getArray<StoredFundacion>(KEYS.ADMIN_FUNDACIONES),

  setFundaciones: (fundaciones: StoredFundacion[]) => {
    localStorage.setItem(KEYS.ADMIN_FUNDACIONES, JSON.stringify(fundaciones));
  },

  getFoundationMascotas: (): StoredMascota[] => getArray<StoredMascota>(KEYS.FOUNDATION_MASCOTAS),

  setFoundationMascotas: (mascotas: StoredMascota[]) => {
    localStorage.setItem(KEYS.FOUNDATION_MASCOTAS, JSON.stringify(mascotas));
  },

  getFoundationEvidencias: (): StoredEvidencia[] => getArray<StoredEvidencia>(KEYS.FOUNDATION_EVIDENCIAS),

  setFoundationEvidencias: (evidencias: StoredEvidencia[]) => {
    localStorage.setItem(KEYS.FOUNDATION_EVIDENCIAS, JSON.stringify(evidencias));
  },

  getFoundationAdvertencias: (): StoredAdvertencia[] => getArray<StoredAdvertencia>(KEYS.FOUNDATION_ADVERTENCIAS),

  setFoundationAdvertencias: (advertencias: StoredAdvertencia[]) => {
    localStorage.setItem(KEYS.FOUNDATION_ADVERTENCIAS, JSON.stringify(advertencias));
  },

  getNotificaciones: (): StoredNotificacion[] => getArray<StoredNotificacion>(KEYS.NOTIFICACIONES),

  setNotificaciones: (notificaciones: StoredNotificacion[]) => {
    localStorage.setItem(KEYS.NOTIFICACIONES, JSON.stringify(notificaciones));
  },
};
