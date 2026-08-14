export const COMISION_PLATAFORMA = 0.15;

export const FACTORES_CALIFICACION: Record<number, number> = {
  0: 0,        // Penalización total (Reembolso = $0)
  1: 1 / 1.25, // 80% del subtotal
  2: 1 / 1.5,  // ~67% del subtotal
  3: 1 / 1.75, // ~57% del subtotal
  4: 1,        // 100% del subtotal
  5: 1,        // 100% del subtotal
};

export const ESCENARIOS_CALIFICACION: Record<number, { etiqueta: string; porcentaje: string }> = {
  0: { etiqueta: "Penalización Total", porcentaje: "0%" },
  1: { etiqueta: "Reembolso 80%", porcentaje: "80%" },
  2: { etiqueta: "Reembolso 67%", porcentaje: "67%" },
  3: { etiqueta: "Reembolso 57%", porcentaje: "57%" },
  4: { etiqueta: "Reembolso 100%", porcentaje: "100%" },
  5: { etiqueta: "Reembolso 100%", porcentaje: "100%" },
};

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function factorDeCalificacion(calificacion: number): number {
  return FACTORES_CALIFICACION[calificacion] ?? 0;
}

export interface Liquidacion {
  montoBrutoPorMascota: number;
  comisionPorMascota: number;
  subtotalNetoPorMascota: number;
  factor: number;
  montoReembolso: number;
  porcentaje: string;
}

/**
 * Calcula la liquidación de una evidencia según la calificación del donador (HU11).
 * El monto es global a la manada y se distribuye de forma equitativa entre sus mascotas.
 */
export function calcularLiquidacion(montoGlobal: number, mascotasCount: number, calificacion: number): Liquidacion {
  const count = Math.max(mascotasCount, 1);
  const montoBrutoPorMascota = round2(montoGlobal / count);
  const comisionPorMascota = round2(montoBrutoPorMascota * COMISION_PLATAFORMA);
  const subtotalNetoPorMascota = round2(montoBrutoPorMascota - comisionPorMascota);
  const factor = factorDeCalificacion(calificacion);
  const montoReembolso = round2(subtotalNetoPorMascota * factor);
  return {
    montoBrutoPorMascota,
    comisionPorMascota,
    subtotalNetoPorMascota,
    factor,
    montoReembolso,
    porcentaje: ESCENARIOS_CALIFICACION[calificacion]?.porcentaje ?? "0%",
  };
}
