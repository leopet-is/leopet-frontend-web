# RESTRICCIONES DE PANTALLAS Y ENTIDADES (DOCUMENTO OFICIAL)

## Reglas Generales
1. **Uso de Entidades:** Usar **ÚNICAMENTE** las propiedades definidas en `src/types/`. No inventar nuevos campos sin autorización.
2. **Formulario de Registro de Usuario:** Los campos obligatorios al registrarse como Donador son: `nombre`, `apellido`, `correo` y `password`. Opcionales: `telefono` y `cedula`.
3. **Atributos Virtuales vs BD:** Campos como `refugioNombre`, `historia` o `ubicacion` en Mascota son computados para la interfaz del prototipo y no existen como columnas directas en la base de datos relacional.
4. **Persistencia Local:** Todo estado mutable (sesión de usuario simulada, carrito/manada, calificaciones de evidencias, estado de reportes) se mantendrá en `localStorage` usando las funciones centralizadas de `src/app/lib/storage.ts` bajo la clave `leopet_manada_cart` y `leopet_user_session`.

---

## Especificación de Entidades

### Usuario (`src/types/usuario.js`)
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | Prefijo `usr-` (UUID en BD) |
| `nombre` | string | Sí | Nombres del usuario |
| `apellido` | string | Sí | Apellidos del usuario |
| `correo` | string | Sí | Email (identificador único / login) |
| `password` | string | No | Contraseña (solo envío de formularios) |
| `telefono` | string | No | Teléfono celular |
| `cedula` | string | No | Identificación / Cédula |
| `rol` | enum | Sí | `'donador'` \| `'fundacion'` \| `'admin'` |
| `fotoUrl` | string | No | Avatar opcional de perfil |
| `estaActivo` | boolean | Sí | Estado de la cuenta |

### Fundación (`src/types/fundacion.js`)
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | Prefijo `fund-` |
| `nombre` | string | Sí | Nombre oficial de la fundación |
| `ruc` | string | Sí | RUC (13 dígitos) - Requerido en BD |
| `correo` | string | Sí | Correo de contacto/auth - Requerido en BD |
| `telefono` | string | Sí | Teléfono de contacto - Requerido en BD |
| `direccion` | string | Sí | Dirección física - Requerido en BD |
| `ubicacion` | string | Sí | Ciudad, País (para UI) |
| `descripcionCorta` | string | Sí | Resumen para tarjetas |
| `historia` | string | No | Narrativa ampliada |
| `logoUrl` | string | Sí | URL/import del logo |
| `portadaUrl` | string | Sí | URL/import de portada |
| `estadoSolicitud` | enum | Sí | `'Aprobada'` \| `'Pendiente'` \| `'Rechazada'` |
| `estado` | enum | Sí | `'Activa'` \| `'Deshabilitada'` — Estado de la cuenta (solicitudes aprobadas inician `'Activa'`; el Admin puede deshabilitarla como Sanción Máxima) |
| `cantidadMascotasCuidado` | number | Sí | Número de mascotas bajo cuidado |

### Mascota (`src/types/mascota.js`)
**Tabla: `animal` (MySQL) — Reflejada en el frontend como `Mascota`**
| Campo | Tipo DB | Tipo TS | Requerido | Descripción |
|-------|---------|---------|-----------|-------------|
| `id` | INT PK AI | number | Sí | Auto-increment |
| `nombre` | VARCHAR(191) | string | Sí | Nombre de la mascota |
| `status` | VARCHAR | enum | Sí | `'NO_APADRINADO'` \| `'APADRINADO'` \| `'EN_PROCESO'` \| `'ADOPTADO'` — Estado de apadrinamiento/adopción |
| `especie` | VARCHAR(191) | string | Sí | Perro, Gato, Conejo, etc. (reemplaza `categoria`) |
| `raza` | VARCHAR(191) | string | No | Raza o mixtura |
| `descripcion` | VARCHAR(200) | string | Sí | Descripción en una línea (reemplaza `descripcionCorta`) |
| `imagen` | VARCHAR(500) | string | Sí | URL/import de imagen principal (reemplaza `imagenUrl`) |
| `galeria` | JSON | string[] | No | URLs de fotos adicionales (reemplaza `galeriaUrls`) |
| `fundacion_id` | INT FK | string | Sí | FK a la fundación propietaria |
| `visible` | TINYINT(1) default 1 | boolean | No | 1=Visible en catálogo, 0=Oculto (default: true) |
| `created_at` | DATETIME | string | No | Fecha de creación (ISO) |
| `updated_at` | DATETIME | string | No | Fecha de actualización (ISO) |
| `edad` | INT | number | No | Edad en años (entero) — reemplaza string "3 años" |
| `peso` | DECIMAL(10,0) | number | No | Peso en kg (entero) — reemplaza string "9 Kg" |
| `sexo` | VARCHAR | enum | No | `'Macho'` \| `'Hembra'` |
| `esterilizacion` | TINYINT | boolean \| null | No | 1=Esterilizado, 0=No, NULL=Desconocido (reemplaza `estadoSaludDetallado`) |
| `vacunacion` | TINYINT | boolean \| null | No | 1=Vacunado, 0=No, NULL=Desconocido |
| `desparasitacion` | TINYINT | boolean \| null | No | 1=Desparasitado, 0=No, NULL=Desconocido |
| `enfermedades` | VARCHAR(45) | string | No | Enfermedades conocidas |
| `fecha_registro` | DATE | string | No | Fecha de registro en el sistema |
| `fecha_rescate` | DATE | string | No | Fecha de rescate del animal |
| `historia` | — | string | No | **Virtual UI:** Narrativa ampliada (no está en BD) |
| `ubicacion` | — | string | No | **Virtual UI:** Ciudad (no está en BD, derivada de fundación) |

**Notas de migración:**
- `edad` y `peso` cambiaron de `string` a `number` (entero sin unidades en BD).
- `estadoSalud` fue reemplazado por `status` (estado de apadrinamiento/adopción).
- `estadoSaludDetallado` fue reemplazado por los campos individuales: `esterilizacion`, `vacunacion`, `desparasitacion`, `enfermedades`.
- `categoria` fue reemplazado por `especie` (nombres con mayúscula: "Perro", "Gato").
- `imagenUrl` → `imagen`, `galeriaUrls` → `galeria`, `descripcionCorta` → `descripcion`.
- Los IDs de tipo `number` se pasan como `string` al `ManadaPet` (manada context) para compatibilidad.

### Manada (`src/types/manada.js`)
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | Identificador único |
| `nombre` | string | Sí | Nombre de la manada (ej: "Mi Primera Manada") |
| `mascotas` | ManadaMascota[] | Sí | Lista de mascotas en la manada |
| `monto` | number | Sí | **Monto global mensual** de la manada (persistido en `leopet_manada_monto`; default 50 USD) |

> **Regla de monto global (corrección HU8/HU11):** el aporte mensual pertenece a la **manada completa**, no a cada mascota. En cada cambio (agregar/remover mascota o editar monto) se recalcula el reparto equitativo: `montoPorMascota = round2(monto / mascotas.length)`. `totalMonthly` de la manada = `monto` global.

### ManadaMascota (`src/types/manada.js`)
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | ID de la relación manada-mascota |
| `mascotaId` | string | Sí | FK a Mascota |
| `nombre` | string | Sí | Nombre de la mascota |
| `refugioNombre` | string | Sí | Atributo virtual UI (obtenido via JOIN) |
| `etiqueta` | string | Sí | Atributo virtual UI (ej: "SALUDABLE") |
| `montoMensual` | number | Sí | Monto aportado en USD |
| `categoria` | string | Sí | Tipo de cuidado (ej: "Alimentación Canina") |
| `imagenUrl` | string | Sí | Imagen de la mascota |

### Evidencia (`src/types/evidencia.js`)
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | Prefijo `ev-` |
| `mascotaId` | string | Sí | ID de la mascota asociada |
| `mascotaNombre` | string | Sí | Nombre de la mascota |
| `fundacionNombre` | string | Sí | Nombre de la fundación remitente |
| `tipo` | enum | Sí | `'foto'` \| `'video'` |
| `titulo` | string | Sí | Título de la evidencia |
| `descripcion` | string | Sí | Descripción del contenido |
| `imagenUrl` | string | Sí | URL/import de imagen |
| `fecha` | string | Sí | Fecha en formato `YYYY-MM-DD` |
| `calificacion` | number | No | 1-5 estrellas (calificación del padrino) |
| `comentario` | string | No | Comentario opcional del padrino |
| `estado` | enum | No | `'publicada'` \| `'en_revision'` (para reportes) |

---

## Especificación de Pantallas y Modales de Auth

### Modal / Pantalla de Registro de Usuario (`/registro` o Modal Rápido)
- **Campos requeridos:** Nombre, Apellido, Cédula (10 dígitos), Correo Electrónico, Contraseña (mín. 8 caracteres), Confirmar contraseña.
- **Requisitos adicionales:** Aceptación obligatoria de Términos y Condiciones y Política de Privacidad.
- **UX:** Indicador de fuerza de contraseña, validación inline por campo, botón para mostrar/ocultar contraseña, spinner de carga al enviar.
- Al registrarse exitosamente en el prototipo, guarda el objeto `Usuario` en `localStorage` (`leopet_user_session`), mantiene los ítems activos en `leopet_manada_cart` y redirige directamente al flujo de Checkout de PayPal.

### `/mascotas` — Catálogo de Mascotas
- **Estado:** IMPLEMENTADA
- Muestra grid de tarjetas con datos de `Mascota`.
- Filtros por especie (`Perro` / `Gato`) y búsqueda por nombre o raza.
- Botón **"Apadrinar"**: agrega la mascota a la "Manada por Defecto" (`"Mi Primera Manada"`) en `localStorage`.

### `/mascota/:id` — Detalle de Mascota
- **Estado:** IMPLEMENTADA
- Muestra ficha completa: nombre, fundación, edad (number + "años"), raza, sexo, peso (number + "kg").
- Historia narrativa y estado de salud con campos individuales (vacunación, esterilización, desparasitación, enfermedades).
- Botón **"Apadrinar"**: sincroniza con `localStorage`.

### `/fundaciones` — Listado de Fundaciones
- **Estado:** IMPLEMENTADA
- Muestra grid de fundaciones aprobadas.
- **NO IMPLEMENTAR:** Formularios de donación directa a la fundación ni chats.

### `/fundaciones/:id` — Detalle de Fundación
- **Estado:** IMPLEMENTADA
- Muestra datos generales (nombre, logo, ubicación, historia) y la lista de mascotas filtradas por `fundacionId`.
- **NO IMPLEMENTAR:** Formularios de donación directa a la fundación ni chats.

### `/mi-manada/configurar` — Carrito / Configurador de Manada
- **Estado:** IMPLEMENTADA
- Muestra las mascotas guardadas en `localStorage` con el desglose del **monto global de la manada**: slider único `$20–$200` (paso 5), reparto equitativo por mascota, comisión de plataforma (15%) y subtotal neto por mascota.
- Botón **"Confirmar Apadrinamiento"**:
  - Si no está autenticado → Despliega Modal de Login/Registro Rápido con los campos oficiales (`nombre`, `apellido`, `correo`, `password`), preservando el carrito intacto en `localStorage`.
  - Si está autenticado → Carga el botón interactivo de PayPal Sandbox (cobra el monto global). Al confirmar crea la `Suscripcion` con `montoMensual = monto global`, `comision`/`subtotalNeto` y pets con `monthlyAmount = montoPorMascota`.

### `/dashboard` — Panel del Padrino
- **Estado:** IMPLEMENTADA
- Resumen de mascotas apadrinadas, datos de perfil del `Usuario` logueado y aportes activos.

### `/dashboard/evidencias` — Gestión y Calificación de Evidencias
- **Estado:** IMPLEMENTADA
- Renderiza la lista de evidencias asociadas.
- Permite calificar con 1-5 estrellas y agregar comentario. **Al calificar (HU11)** se genera o actualiza el `Pago` de la mascota/evidencia con estado `pendiente_desembolso` y se notifica a la fundación con el monto de liquidación.
- Cada tarjeta muestra el badge de reembolso si existe un pago aún no desembolsado.
- Botón **"Reportar inconsistencia"** (HU12): abre modal con motivo (Fraude, Maltrato animal, Foto duplicada, No corresponde a la mascota, Calidad insuficiente, Otro), descripción obligatoria y carga de archivos adjuntos.
- Al enviar: registra la `Denuncia` en `leopet_admin_denuncias` con estado `pendiente` y Nro. de Ticket `LP-####`, notifica al administrador y muestra confirmación con el ticket.
- La evidencia reportada cambia a estado `en_revision` mientras exista una denuncia abierta.

### `/dashboard/denuncias` — Mis Denuncias (HU12/HU9)
- **Estado:** IMPLEMENTADA
- Resumen de denuncias abiertas, resueltas y rechazadas del donador logueado.
- Lista de denuncias con ticket, fundación, motivo, estado y fecha.
- Muestra la resolución: Sanción de Estrellas (estrellas y monto recalculado con factor 0.67), Deshabilitación de Cuenta o Rechazo, con el comentario del administrador.
- Muestra el aviso **"Decisión revertida"** cuando el Admin revierte la resolución (HU10).
- Botón **"Nueva denuncia"**: redirige a `/dashboard/evidencias`.

### `/dashboard/manada` — Gestión de Suscripción
- **Estado:** IMPLEMENTADA
- Permite pausar cobro por 30 días, **editar el monto global de la manada**, ajustar montos de suscripciones o eliminar mascotas (siempre con reparto equitativo recalculado) en `localStorage`.

---

## Módulo Admin

### Credenciales de Prueba
- **Correo:** `admin@leopet.com`
- **Contraseña:** `Admin123!`
- Solo usuarios con `rol === 'admin'` pueden acceder. El enlace "Admin" aparece en el navbar al iniciar sesión con estas credenciales.

### SolicitudFundacion (`src/types/solicitudFundacion.js`)
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | Prefijo `sol-` |
| `fundacionNombre` | string | Sí | Nombre de la fundación |
| `ruc` | string | Sí | RUC (13 dígitos) |
| `correo` | string | Sí | Correo de contacto oficial |
| `representanteLegal` | string | Sí | Nombres completos del representante |
| `telefono` | string | Sí | Teléfono de contacto |
| `direccion` | string | Sí | Dirección física |
| `ubicacion` | string | Sí | Ciudad, País |
| `fechaSolicitud` | string | Sí | Formato `YYYY-MM-DD` |
| `estado` | enum | Sí | `'Pendiente'` \| `'Aprobada'` \| `'Rechazada'` |
| `motivoRechazo` | string | No | Motivo en caso de rechazo |
| `documentosUrls` | string[] | Sí | Archivos adjuntos (RUC, estatutos) |

### Denuncia (`src/types/denuncia.js`)
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | number | Sí | PK auto-increment |
| `ticket` | string | Sí | Nro. de Ticket público (`LP-0001`) asignado al crear (HU12) |
| `motivo` | string | Sí | Motivo del reporte (Fraude, Maltrato animal, Calidad insuficiente...) |
| `descripcion` | string | Sí | Explicación detallada del donador (HU12) |
| `pruebasUrls` | string[] | No | Archivos / capturas de respaldo (HU12) |
| `evidenciaId` | string | No | FK a la evidencia cuestionada (vista unificada HU8/HU9) |
| `usuarioId` | string | Sí | FK al usuario donador |
| `donadorNombre` | string | Sí | Nombre del donador (display) |
| `fundacionId` | string | Sí | FK a la Fundación reportada |
| `fundacionNombre` | string | Sí | Nombre de la Fundación (display) |
| `estado` | enum | Sí | `'pendiente'` \| `'investigando'` \| `'resuelta'` \| `'rechazada'` |
| `resolucionTipo` | enum | No | `'sancion_estrellas'` \| `'deshabilitacion'` — Escenario aplicado |
| `calificacionAnterior` | number | No | Escenario A: estrellas previas de la evidencia |
| `calificacionNueva` | number | No | Escenario A: estrellas ajustadas |
| `montoOriginal` | number | No | Escenario A: aporte antes de la sanción |
| `montoAjustado` | number | No | Escenario A: aporte tras factor 0.67 |
| `resolucionAdmin` | string | No | Comentario final del administrador |
| `auditoria` | AuditoriaDenuncia[] | Sí | Log de acciones (HU6) |
| `revertida` | boolean | No | TRUE si la decisión fue revertida (HU10) |
| `fecha` | string | Sí | Fecha de la denuncia (ISO) |

**AuditoriaDenuncia:** `{ accion: string, fecha: string, detalle?: string }` — registro cronológico de la
creación, investigación, sanción/rechazo y reversión de cada denuncia (HU6).

### Pago (`src/app/lib/pagos.ts` + `src/context/PagoContext.tsx`)
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | UUID interno |
| `numero` | string | Sí | Nro. público (`PAY-####`) |
| `evidenciaId` | string | Sí | FK a la Evidencia calificada |
| `mascotaId` | string | Sí | Mascota asociada |
| `usuarioId` | string | Sí | Donador que calificó |
| `fundacionId` | string | Sí | Fundación beneficiaria |
| `estado` | enum | Sí | `'pendiente_desembolso'` \| `'apelada'` \| `'mediada'` \| `'desembolsada'` |
| `calificacion` | number | Sí | 0-5 estrellas otorgadas |
| `montoBrutoPorMascota` | number | Sí | Reparto equitativo global (`montoGlobal / mascotas`) |
| `comisionPlataforma` | number | Sí | 15% del monto bruto |
| `subtotalNeto` | number | Sí | `bruto − comisión` (monto desembolsable antes de factor) |
| `factor` | number | Sí | Factor HU11 según estrellas |
| `montoReembolso` | number | Sí | `subtotalNeto × factor` (monto final a la fundación) |
| `montoAnterior` | number | No | Subtotal previo a la mediación (para comparativa) |
| `montoReembolsoAnterior` | number | No | Monto final previo a la mediación |
| `mediacionCalificacion` | number | No | Estrellas fijadas por el admin al mediar |
| `mediacionComentario` | string | No | Comentario de la mediación |
| `comentario` | string | No | Comentario del donador al calificar |
| `auditoria` | AuditoriaPago[] | Sí | Log de acciones (HU6) |
| `fecha` | string | Sí | Fecha (ISO) |

**Escenarios HU11 (factor sobre subtotal neto por mascota):** 4-5★ → `1.0` (100%), 3★ → `1/1.75` (~57%), 2★ → `1/1.5` (~67%), 1★ → `1/1.25` (80%), 0★ → `0` (penalización total).
**Comisión de plataforma:** 15% del monto bruto. **Flujo:** donador califica → `Pago` `pendiente_desembolso` → fundación apela (`apelada`) → admin media (`mediada`, recalcula automático con `subtotal × factor`) → admin aprueba (`desembolsada`). Persistencia en `leopet_pagos`.

### `/admin` — Dashboard del Administrador
- **Estado:** IMPLEMENTADA
- Muestra 4 tarjetas de métricas: Aprobadas, Pendientes, Denuncias Abiertas, Resueltas.
- Accesos rápidos a `/admin/solicitudes` y `/admin/denuncias`.
- Lista de solicitudes pendientes recientes con botón de acción rápida.
- Requiere `rol === 'admin'`; redirige a `/` si el usuario no tiene permisos.

### `/admin/solicitudes` — Gestión de Solicitudes de Fundaciones
- **Estado:** IMPLEMENTADA
- Tabla con todas las solicitudes de fundaciones.
- Filtros: Todas, Pendientes, Aprobadas, Rechazadas.
- Búsqueda por nombre de fundación o RUC.
- Modal de detalle con todos los campos de la solicitud + documentos.
- Botón **"Aprobar"**: cambia estado a `Aprobada` + toast de confirmación.
- Botón **"Rechazar"**: abre modal con campo obligatorio de motivo, cambia estado a `Rechazada` + toast.
- Persistencia: `localStorage` clave `leopet_admin_solicitudes`.

### `/admin/denuncias` — Moderación de Denuncias (HU8/HU9/HU6/HU10)
- **Estado:** IMPLEMENTADA
- Grid de tarjetas con todas las denuncias (ticket, fundación, donador, motivo y estado).
- Filtros: Todas, Pendiente, En investigación, Resuelta, Rechazada (con contadores).
- Búsqueda por motivo, nombre de fundación o ticket.
- **Vista unificada "Evidencia vs. Denuncia"** (HU8/HU9): modal de detalle que compara la evidencia original (imagen, estrellas, título, mascota) con el sustento de la denuncia (motivo, descripción, adjuntos, donador).
- **Investigar** (HU8): pasa la denuncia a `investigando` y la registra en auditoría.
- **Escenario A — Sanción Manual (Ajuste de Estrellas):** el Admin ajusta la calificación de la evidencia (ej. 5 → 2); el sistema recalcula el reembolso (`Monto × Factor 0.67`) y actualiza el monto final del aporte. Estado → `resuelta` (`resolucionTipo: sancion_estrellas`).
- **Escenario B — Deshabilitación de Cuenta (HU4):** confirma falta gravísima, cambia la `Fundacion.estado` a `Deshabilitada` y marca la denuncia como `resuelta` (`resolucionTipo: deshabilitacion`, "Válida — Sanción Máxima").
- **Escenario C — Rechazo:** con motivo obligatorio, estado → `rechazada`.
- **Auditoría (HU6):** cada acción queda registrada con fecha y detalle en `denuncia.auditoria`.
- **Notificaciones (HU9):** al resolver o revertir se notifica al donador y a la fundación (medida tomada + derecho a apelación).
- **Reversión por Error Administrativo (HU10):** botón **"Revertir decisión"** en denuncias resueltas/rechazadas; restaura los estados previos (cuenta de la fundación → `Activa`, calificación de la evidencia → anterior, monto → original), marca `revertida` y notifica el cambio.
- Persistencia: `localStorage` clave `leopet_admin_denuncias` y `leopet_admin_fundaciones`.

### `/admin/apelaciones` — Mediación y Aprobación de Desembolsos (HU8/HU11)
- **Estado:** IMPLEMENTADA
- Filtros por estado: Todas, Apeladas, Pendientes de desembolso, Mediadas, Desembolsadas (con contadores).
- Tabla de liquidaciones con donador, evidencia, fundación, estrellas, escenario, subtotal neto y monto final.
- Botón **"Mediar"**: modal con selector 0-5 estrellas y comentario obligatorio; muestra el "Nuevo monto estimado" en vivo y aplica `mediarPago` (recalcula `subtotalNeto × factor`, registra `montoAnterior`/`mediacionCalificacion`/`mediacionComentario` y notifica a donador y fundación). Estado → `mediada`.
- Botón **"Aprobar desembolso"**: aplica `aprobarDesembolso` → estado `desembolsada` + notificación a la fundación.

---

## Módulo Fundación (`/fundacion`)

### Credenciales de Prueba
| Cuenta | Correo | Contraseña | Fundación Asociada |
|--------|--------|------------|---------------------|
| Fundación 1 | `fundacion1@leopet.com` | `Fundacion123!` | Huellitas Felices (fund-01) |
| Fundación 2 | `fundacion2@leopet.com` | `Fundacion123!` | Refugio Almas Peludas (fund-02) |
| Fundación 3 | `fundacion3@leopet.com` | `Fundacion123!` | Huellitas Sanas (fund-03) |

Solo usuarios con `rol === 'fundacion'` pueden acceder. El enlace "Panel Fundación" aparece en el navbar al iniciar sesión con estas credenciales.

### Reglas Generales de Persistencia Fundación
- **Persistencia Local:** Las mascotas creadas, evidencias publicadas y advertencias atendidas se sincronizan en `localStorage` bajo las claves `leopet_fundacion_mascotas`, `leopet_fundacion_evidencias` y `leopet_fundacion_advertencias`.
- **Autenticación Fundación:** Las rutas `/fundacion/*` requieren que el usuario logueado en `leopet_user` tenga el rol `'fundacion'`.
- **Cuenta deshabilitada (Escenario B / Sanción Máxima):** si la `Fundacion.estado` es `Deshabilitada`, el panel `/fundacion/*` muestra una pantalla de acceso restringido con aviso de apelación.

### Advertencia (`src/types/advertencia.js`)
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | Prefijo `adv-` |
| `fundacionId` | string | Sí | FK a la Fundación |
| `fundacionNombre` | string | Sí | Nombre de la fundación |
| `denunciaId` | string | Sí | FK a la denuncia que originó la alerta |
| `evidenciaId` | string | Sí | FK a la evidencia cuestionada |
| `motivo` | string | Sí | Motivo de la alerta |
| `mensajeAdmin` | string | Sí | Indicaciones del Admin |
| `fecha` | string | Sí | Formato `YYYY-MM-DD` |
| `estado` | enum | Sí | `'pendiente'` \| `'atendida'` |
| `respuestaFundacion` | string | No | Respuesta de la fundación |
| `fechaRespuesta` | string | No | Fecha de la respuesta |

### `/fundacion` — Dashboard de Fundación
- **Estado:** IMPLEMENTADA
- Muestra 4 tarjetas de métricas: Mascotas, Evidencias Publicadas, Padrinos Activos, Aporte Mensual.
- Accesos rápidos a `/fundacion/mascotas`, `/fundacion/evidencias`, `/fundacion/advertencias` y **`/fundacion/pagos`** (muestra el monto pendiente de desembolso de la fundación).
- Lista de evidencias recientes con estado.
- Requiere `rol === 'fundacion'`; muestra pantalla de acceso restringido si no tiene permisos.

### `/fundacion/mascotas` — Gestión de Catálogo de Mascotas
- **Estado:** IMPLEMENTADA
- Grid de tarjetas con las mascotas de la fundación.
- Búsqueda por nombre o raza.
- Botón **"Registrar Mascota"**: abre modal con formulario completo (nombre, raza, edad [number], sexo, peso [number], especie [Perro/Gato], estado [Disponible/Apadrinado/etc.], descripción, historia, salud [vacunado/esterilizado/desparasitado checkboxes + enfermedades], imagen).
- **Acciones en tarjeta:** Botón "Editar" (abre modal con datos existentes) y botón "Ocultar/Mostrar" (toggle visibilidad en catálogo).
- Persistencia: `localStorage` clave `leopet_fundacion_mascotas`.

### `/fundacion/evidencias` — Publicación y Muro de Evidencias
- **Estado:** IMPLEMENTADA
- Grid de tarjetas con evidencias publicadas por la fundación.
- Búsqueda por título o nombre de mascota.
- Muestra calificación promedio (1-5 estrellas) y tipo (foto/video).
- Botón **"Nueva Evidencia"**: formulario con selección de mascota, tipo (foto/video), título, descripción y carga de archivo (simulada).
- Persistencia: `localStorage` clave `leopet_fundacion_evidencias`.

### `/fundacion/padrinos` — Consulta de Padrinos
- **Estado:** IMPLEMENTADA
- 3 tarjetas de resumen: Padrinos Activos, Aporte Mensual, Pausados.
- Tabla con todos los padrinos de la fundación: nombre, correo, mascota, monto mensual, estado, fecha de inicio.
- Búsqueda por nombre o mascota.

### `/fundacion/pagos` — Pagos y Apelación de Liquidaciones (HU8/HU11)
- **Estado:** IMPLEMENTADA
- Stats: pendiente de desembolso, desembolsado, apeladas (de la fundación logueada).
- Tabla de liquidaciones: número, fecha, mascota/evidencia, estrellas, escenario, subtotal neto − comisión, monto final y estado.
- Botón **"Apelar"** (solo en `pendiente_desembolso`): modal con motivo obligatorio → `apelarPago` (estado `apelada`) + notificación al donador.

### `/fundacion/advertencias` — Centro de Resolución de Reportes
- **Estado:** IMPLEMENTADA
- Banner de alerta si hay advertencias pendientes.
- Filtros: Todas, Pendientes, Atendidas.
- Búsqueda por motivo.
- Tarjetas con motivo, mensaje del admin, estado y fecha.
- Botón **"Responder"**: abre modal con textarea para describir acciones tomadas + opción de subir evidencia corregida (simulada).
- Al enviar: cambia estado a `atendida`, registra respuesta y fecha.
- Persistencia: `localStorage` clave `leopet_fundacion_advertencias`.
