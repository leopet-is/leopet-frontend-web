/**
 * @typedef {Object} AuditoriaDenuncia
 * @property {string} accion                 // Descripción de la acción administrativa (HU6)
 * @property {string} fecha                  // Fecha ISO de la acción
 * @property {string} [detalle]              // Detalle / resultado de la acción
 */

/**
 * @typedef {Object} Denuncia
 * @property {number} id                     // PK auto-increment
 * @property {string} ticket                 // Nro. de Ticket público (ej: 'LP-0001')
 * @property {string} motivo                 // Motivo (Fraude, Maltrato, Calidad insuficiente...)
 * @property {string} descripcion            // Explicación detallada del donador
 * @property {string[]} [pruebasUrls]        // Archivos / evidencias adjuntos
 * @property {string} [evidenciaId]          // FK -> evidencia cuestionada
 * @property {string} usuarioId              // FK -> usuario.id (donador)
 * @property {string} donadorNombre          // Nombre del donador (display)
 * @property {string} fundacionId            // FK -> fundacion.id
 * @property {string} fundacionNombre        // Nombre de la fundación (display)
 * @property {'pendiente' | 'investigando' | 'resuelta' | 'rechazada'} estado
 * @property {'sancion_estrellas' | 'deshabilitacion' | null} [resolucionTipo]
 * @property {number} [calificacionAnterior] // Escenario A: estrellas previas de la evidencia
 * @property {number} [calificacionNueva]    // Escenario A: estrellas ajustadas
 * @property {number} [montoOriginal]        // Escenario A: monto antes de la sanción
 * @property {number} [montoAjustado]        // Escenario A: monto tras factor 0.67
 * @property {string} [resolucionAdmin]      // Comentario final del administrador
 * @property {AuditoriaDenuncia[]} auditoria // Log de acciones administrativas (HU6)
 * @property {boolean} [revertida]           // TRUE si se revirtió la decisión (HU10)
 * @property {string} fecha                  // Fecha de la denuncia
 * @property {string} [createdAt]            // Fecha de creación
 * @property {string} [updatedAt]            // Fecha de actualización
 */
