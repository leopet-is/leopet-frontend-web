/**
 * @typedef {Object} AuditoriaPago
 * @property {string} accion            // Acción registrada (creación, calificación, apelación, mediación, desembolso)
 * @property {string} fecha             // Fecha ISO de la acción
 * @property {string} [detalle]         // Detalle de la acción
 */

/**
 * @typedef {Object} Pago
 * @property {number} id                 // PK auto-increment
 * @property {string} numero             // Nro. de Liquidación (`PAY-####`)
 * @property {string} evidenciaId        // FK a la evidencia calificada
 * @property {string} evidenciaTitulo    // Título de la evidencia (display)
 * @property {string} evidenciaFecha     // Fecha de la evidencia
 * @property {string} mascotaId          // FK a la mascota apadrinada
 * @property {string} mascotaNombre      // Nombre de la mascota (display)
 * @property {string} donadorId          // FK al usuario donador
 * @property {string} donadorNombre      // Nombre del donador (display)
 * @property {string} fundacionId        // FK a la fundación
 * @property {string} fundacionNombre    // Nombre de la fundación (display)
 * @property {number} montoBrutoPorMascota   // Aporte equitativo por mascota (antes de comisión)
 * @property {number} comisionPorMascota     // Comisión plataforma 15%
 * @property {number} subtotalNetoPorMascota // Subtotal neto por mascota (bruto - comisión)
 * @property {number} calificacion       // Calificación del donador (0-5)
 * @property {number} factor             // Factor según escenario HU11 (0 | 0.8 | 0.67 | 0.57 | 1)
 * @property {number} montoReembolso     // Monto final a desembolsar = subtotal neto x factor
 * @property {'pendiente_desembolso' | 'apelada' | 'mediada' | 'desembolsada'} estado
 * @property {string} [comentarioDonador]    // Comentario del donador al calificar
 * @property {string} [apelacionComentario]  // Motivo de apelación de la fundación
 * @property {number} [mediacionCalificacion]// Calificación corregida por el administrador
 * @property {string} [mediacionComentario]  // Resolución de la mediación
 * @property {number} [montoAnterior]         // Monto antes de la mediación
 * @property {string} fecha               // Fecha de creación ISO
 * @property {AuditoriaPago[]} auditoria // Historial de acciones
 */

/**
 * @type {Pago[]}
 */
export const MOCK_PAGOS = [
  {
    id: 1,
    numero: "PAY-0001",
    evidenciaId: "ev-01",
    evidenciaTitulo: "Pluto disfrutando de su almuerzo especial",
    evidenciaFecha: "2026-07-20",
    mascotaId: "1",
    mascotaNombre: "Pluto",
    donadorId: "usr-010",
    donadorNombre: "Pedro José Lara Mena",
    fundacionId: "fund-01",
    fundacionNombre: "Huellitas Felices",
    montoBrutoPorMascota: 25,
    comisionPorMascota: 3.75,
    subtotalNetoPorMascota: 21.25,
    calificacion: 5,
    factor: 1,
    montoReembolso: 21.25,
    estado: "desembolsada",
    comentarioDonador: "¡Qué alegría verlo tan activo! Sigan así.",
    fecha: "2026-07-22T09:00:00",
    auditoria: [
      { accion: "Calificación registrada", fecha: "2026-07-22T09:00:00", detalle: "5 estrellas — Reembolso 100%" },
      { accion: "Desembolso aprobado", fecha: "2026-07-25T11:00:00", detalle: "Liquidación PAY-0001 liberada" },
    ],
  },
  {
    id: 2,
    numero: "PAY-0002",
    evidenciaId: "ev-02",
    evidenciaTitulo: "Sesión de juego en el patio",
    evidenciaFecha: "2026-07-18",
    mascotaId: "1",
    mascotaNombre: "Pluto",
    donadorId: "usr-010",
    donadorNombre: "Pedro José Lara Mena",
    fundacionId: "fund-01",
    fundacionNombre: "Huellitas Felices",
    montoBrutoPorMascota: 25,
    comisionPorMascota: 3.75,
    subtotalNetoPorMascota: 21.25,
    calificacion: 4,
    factor: 1,
    montoReembolso: 21.25,
    estado: "pendiente_desembolso",
    comentarioDonador: "Muy bien la terapia articular.",
    fecha: "2026-07-19T10:00:00",
    auditoria: [
      { accion: "Calificación registrada", fecha: "2026-07-19T10:00:00", detalle: "4 estrellas — Reembolso 100%" },
    ],
  },
  {
    id: 3,
    numero: "PAY-0003",
    evidenciaId: "ev-03",
    evidenciaTitulo: "Luna explorando su nuevo rincón",
    evidenciaFecha: "2026-07-19",
    mascotaId: "2",
    mascotaNombre: "Luna",
    donadorId: "usr-015",
    donadorNombre: "Daniela Estefanía Castillo Ríos",
    fundacionId: "fund-02",
    fundacionNombre: "Refugio Almas Peludas",
    montoBrutoPorMascota: 20,
    comisionPorMascota: 3,
    subtotalNetoPorMascota: 17,
    calificacion: 3,
    factor: 0.57,
    montoReembolso: 9.71,
    estado: "apelada",
    comentarioDonador: "Se nota el avance pero faltó evidencia de la alimentación.",
    apelacionComentario: "El video muestra el seguimiento veterinario y su nuevo hábitat. Solicitamos revisión de la calificación.",
    fecha: "2026-07-20T14:00:00",
    auditoria: [
      { accion: "Calificación registrada", fecha: "2026-07-20T14:00:00", detalle: "3 estrellas — Reembolso 57%" },
      { accion: "Apelación recibida", fecha: "2026-07-21T09:30:00", detalle: "La fundación solicita mediación" },
    ],
  },
  {
    id: 4,
    numero: "PAY-0004",
    evidenciaId: "ev-04",
    evidenciaTitulo: "Toby en su sesión de rehabilitación",
    evidenciaFecha: "2026-07-17",
    mascotaId: "3",
    mascotaNombre: "Toby",
    donadorId: "usr-020",
    donadorNombre: "Andrea Carolina Ponce Salazar",
    fundacionId: "fund-03",
    fundacionNombre: "Huellitas Sanas",
    montoBrutoPorMascota: 30,
    comisionPorMascota: 4.5,
    subtotalNetoPorMascota: 25.5,
    calificacion: 1,
    factor: 0.8,
    montoReembolso: 20.4,
    estado: "pendiente_desembolso",
    comentarioDonador: "La foto no muestra claramente la sesión.",
    fecha: "2026-07-18T08:00:00",
    auditoria: [
      { accion: "Calificación registrada", fecha: "2026-07-18T08:00:00", detalle: "1 estrella — Reembolso 80%" },
    ],
  },
];
