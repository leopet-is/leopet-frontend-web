import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { storage } from "../lib/storage";
import { useNotifications } from "./NotificationContext";
import { useFoundation } from "./FoundationContext";
import { MOCK_PAGOS } from "../../data/mockPagos";
import { calcularLiquidacion, factorDeCalificacion, round2, ESCENARIOS_CALIFICACION } from "../lib/pagos";

type Pago = (typeof MOCK_PAGOS)[number];

export interface RegistrarCalificacionInput {
  evidenciaId: string;
  evidenciaTitulo: string;
  evidenciaFecha: string;
  mascotaId: string;
  mascotaNombre: string;
  fundacionId: string;
  fundacionNombre: string;
  donadorId: string;
  donadorNombre: string;
  montoGlobal: number;
  mascotasCount: number;
  calificacion: number;
  comentario?: string;
}

interface PagoContextType {
  pagos: Pago[];
  registrarCalificacion: (input: RegistrarCalificacionInput) => Pago;
  apelarPago: (pagoId: number, comentario: string) => void;
  mediarPago: (pagoId: number, nuevaCalificacion: number, comentarioAdmin: string) => void;
  aprobarDesembolso: (pagoId: number) => void;
}

const PagoContext = createContext<PagoContextType | null>(null);

const ahora = () => new Date().toISOString();

export function PagoProvider({ children }: { children: ReactNode }) {
  const [pagos, setPagos] = useState<Pago[]>(() => {
    const stored = storage.getPagos();
    return stored.length > 0 ? stored : MOCK_PAGOS;
  });

  const persist = (updated: Pago[]) => {
    setPagos(updated);
    storage.setPagos(updated);
  };

  const { agregarNotificacion } = useNotifications();
  const { updateEvidencia } = useFoundation();

  const registrarCalificacion = useCallback((input: RegistrarCalificacionInput): Pago => {
    const liquidacion = calcularLiquidacion(input.montoGlobal, input.mascotasCount, input.calificacion);
    const escenario = ESCENARIOS_CALIFICACION[input.calificacion];

    const existente = pagos.find((p) => p.evidenciaId === input.evidenciaId && p.estado !== "desembolsada");

    let updated: Pago[];
    let resultado: Pago;

    if (existente) {
      resultado = {
        ...existente,
        calificacion: input.calificacion,
        factor: liquidacion.factor,
        montoReembolso: liquidacion.montoReembolso,
        comentarioDonador: input.comentario || existente.comentarioDonador,
        auditoria: [
          ...existente.auditoria,
          { accion: "Calificación actualizada", fecha: ahora(), detalle: `${input.calificacion} estrellas — ${escenario?.porcentaje}` },
        ],
      };
      updated = pagos.map((p) => (p.id === existente.id ? resultado : p));
    } else {
      const nextId = pagos.length > 0 ? Math.max(...pagos.map((p) => p.id)) + 1 : 1;
      resultado = {
        id: nextId,
        numero: `PAY-${String(nextId).padStart(4, "0")}`,
        evidenciaId: input.evidenciaId,
        evidenciaTitulo: input.evidenciaTitulo,
        evidenciaFecha: input.evidenciaFecha,
        mascotaId: input.mascotaId,
        mascotaNombre: input.mascotaNombre,
        donadorId: input.donadorId,
        donadorNombre: input.donadorNombre,
        fundacionId: input.fundacionId,
        fundacionNombre: input.fundacionNombre,
        montoBrutoPorMascota: liquidacion.montoBrutoPorMascota,
        comisionPorMascota: liquidacion.comisionPorMascota,
        subtotalNetoPorMascota: liquidacion.subtotalNetoPorMascota,
        calificacion: input.calificacion,
        factor: liquidacion.factor,
        montoReembolso: liquidacion.montoReembolso,
        estado: "pendiente_desembolso",
        comentarioDonador: input.comentario,
        fecha: ahora(),
        auditoria: [
          { accion: "Calificación registrada", fecha: ahora(), detalle: `${input.calificacion} estrellas — ${escenario?.porcentaje}` },
        ],
      };
      updated = [resultado, ...pagos];
    }

    persist(updated);

    updateEvidencia(input.evidenciaId, {
      calificacion: input.calificacion,
      comentario: input.comentario,
    } as never);

    agregarNotificacion({
      tipo: "evidencia",
      actualizacion_id: null,
      usuario_id: input.donadorId,
      fundacion_id: input.fundacionId,
      animal_id: null,
      visible: true,
      leido: false,
      fecha_leido: null,
      calificacion: input.calificacion,
      fecha_calificacion: new Date().toISOString().split("T")[0],
      es_alerta_salud: false,
      descripcion_alerta: null,
      mensaje: `Liquidación ${resultado.numero}: la evidencia "${input.evidenciaTitulo}" de ${input.mascotaNombre} fue calificada con ${input.calificacion} estrella(s) (${escenario?.porcentaje}). Monto final a recibir: $${resultado.montoReembolso.toFixed(2)}.`,
      es_admin_mensaje: false,
    });

    return resultado;
  }, [pagos, agregarNotificacion, updateEvidencia]);

  const apelarPago = useCallback((pagoId: number, comentario: string) => {
    const target = pagos.find((p) => p.id === pagoId);
    if (!target) return;

    const updated = pagos.map((p) =>
      p.id === pagoId
        ? {
            ...p,
            estado: "apelada",
            apelacionComentario: comentario,
            auditoria: [...p.auditoria, { accion: "Apelación recibida", fecha: ahora(), detalle: comentario }],
          }
        : p
    );
    persist(updated);

    agregarNotificacion({
      tipo: "admin_mensaje",
      actualizacion_id: null,
      usuario_id: target.donadorId,
      fundacion_id: target.fundacionId,
      animal_id: null,
      visible: true,
      leido: false,
      fecha_leido: null,
      calificacion: null,
      fecha_calificacion: null,
      es_alerta_salud: false,
      descripcion_alerta: null,
      mensaje: `Apelación de ${target.fundacionNombre}: la fundación apeló la calificación de la liquidación ${target.numero} (${target.mascotaNombre}). Requiere mediación.`,
      es_admin_mensaje: true,
    });
  }, [pagos, agregarNotificacion]);

  const mediarPago = useCallback((pagoId: number, nuevaCalificacion: number, comentarioAdmin: string) => {
    const target = pagos.find((p) => p.id === pagoId);
    if (!target) return;

    const factor = factorDeCalificacion(nuevaCalificacion);
    const escenario = ESCENARIOS_CALIFICACION[nuevaCalificacion];
    const nuevoMonto = round2(target.subtotalNetoPorMascota * factor);
    const montoAnterior = target.montoReembolso;

    const updated = pagos.map((p) =>
      p.id === pagoId
        ? {
            ...p,
            factor,
            montoReembolso: nuevoMonto,
            montoAnterior,
            mediacionCalificacion: nuevaCalificacion,
            mediacionComentario: comentarioAdmin,
            estado: "mediada",
            auditoria: [
              ...p.auditoria,
              { accion: "Mediación técnica", fecha: ahora(), detalle: `Calificación ajustada a ${nuevaCalificacion} estrellas (${escenario?.porcentaje}). Nuevo monto: $${nuevoMonto.toFixed(2)}.` },
            ],
          }
        : p
    );
    persist(updated);

    agregarNotificacion({
      tipo: "evidencia",
      actualizacion_id: null,
      usuario_id: target.donadorId,
      fundacion_id: target.fundacionId,
      animal_id: null,
      visible: true,
      leido: false,
      fecha_leido: null,
      calificacion: nuevaCalificacion,
      fecha_calificacion: new Date().toISOString().split("T")[0],
      es_alerta_salud: false,
      descripcion_alerta: null,
      mensaje: `Mediación de la liquidación ${target.numero}: el administrador ajustó la calificación a ${nuevaCalificacion} estrella(s). Nuevo monto aprobado: $${nuevoMonto.toFixed(2)} (antes $${montoAnterior.toFixed(2)}).`,
      es_admin_mensaje: false,
    });
    agregarNotificacion({
      tipo: "admin_mensaje",
      actualizacion_id: null,
      usuario_id: target.donadorId,
      fundacion_id: target.fundacionId,
      animal_id: null,
      visible: true,
      leido: false,
      fecha_leido: null,
      calificacion: null,
      fecha_calificacion: null,
      es_alerta_salud: false,
      descripcion_alerta: null,
      mensaje: `Mediación resuelta: tu calificación de la evidencia "${target.evidenciaTitulo}" fue ajustada a ${nuevaCalificacion} estrella(s) tras la apelación de ${target.fundacionNombre}.`,
      es_admin_mensaje: true,
    });
  }, [pagos, agregarNotificacion]);

  const aprobarDesembolso = useCallback((pagoId: number) => {
    const target = pagos.find((p) => p.id === pagoId);
    if (!target) return;

    const updated = pagos.map((p) =>
      p.id === pagoId
        ? {
            ...p,
            estado: "desembolsada",
            auditoria: [...p.auditoria, { accion: "Desembolso aprobado", fecha: ahora(), detalle: `Liquidación ${p.numero} liberada` }],
          }
        : p
    );
    persist(updated);

    agregarNotificacion({
      tipo: "admin_mensaje",
      actualizacion_id: null,
      usuario_id: target.donadorId,
      fundacion_id: target.fundacionId,
      animal_id: null,
      visible: true,
      leido: false,
      fecha_leido: null,
      calificacion: null,
      fecha_calificacion: null,
      es_alerta_salud: false,
      descripcion_alerta: null,
      mensaje: `Desembolso aprobado: la liquidación ${target.numero} (${target.mascotaNombre}) fue liberada por $${target.montoReembolso.toFixed(2)}.`,
      es_admin_mensaje: true,
    });
  }, [pagos, agregarNotificacion]);

  return (
    <PagoContext.Provider value={{ pagos, registrarCalificacion, apelarPago, mediarPago, aprobarDesembolso }}>
      {children}
    </PagoContext.Provider>
  );
}

export function usePagos() {
  const ctx = useContext(PagoContext);
  if (!ctx) throw new Error("usePagos must be used within PagoProvider");
  return ctx;
}
