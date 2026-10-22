import React, { useState } from 'react';
import {
  Search, Eye, AlertTriangle, X, CheckCircle2, Bell, ShieldBan, Star,
  RotateCcw, Paperclip, History, Gavel, FileText, SearchX,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useFoundation } from '../context/FoundationContext';
import { useNotifications } from '../context/NotificationContext';
import { MOCK_PADRINOS } from '../../data/mockPadrinos';
import { AdminLayout } from './AdminLayout';

type Denuncia = ReturnType<typeof useAdmin>["denuncias"][0];

const FOUNDATION_USER: Record<string, string> = {
  "fund-01": "usr-fund1",
  "fund-02": "usr-fund2",
  "fund-03": "usr-fund3",
};

const FACTOR_SANCION = 0.67;

const estadoBadge: Record<string, string> = {
  pendiente: "bg-[#004955]/10 text-[#004955]",
  investigando: "bg-amber-50 text-amber-600",
  resuelta: "bg-emerald-50 text-emerald-600",
  rechazada: "bg-red-50 text-red-500",
};

const estadoLabel: Record<string, string> = {
  pendiente: "Pendiente",
  investigando: "En investigación",
  resuelta: "Resuelta",
  rechazada: "Rechazada",
};

export function AdminDenuncias() {
  const { denuncias, updateDenuncia, updateFundacion } = useAdmin();
  const { evidencias, updateEvidencia } = useFoundation();
  const { agregarNotificacion } = useNotifications();

  const [filter, setFilter] = useState<"todas" | "pendiente" | "investigando" | "resuelta" | "rechazada">("todas");
  const [search, setSearch] = useState("");
  const [selectedDen, setSelectedDen] = useState<Denuncia | null>(null);
  const [action, setAction] = useState<null | "investigar" | "sancion" | "deshabilitar" | "rechazar" | "revertir">(null);
  const [nuevaEstrellas, setNuevaEstrellas] = useState(2);
  const [resolucionText, setResolucionText] = useState("");
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "warn" | "error" } | null>(null);

  const filtered = denuncias.filter((d) => {
    if (filter !== "todas" && d.estado !== filter) return false;
    if (
      search &&
      !d.motivo.toLowerCase().includes(search.toLowerCase()) &&
      !d.fundacionNombre.toLowerCase().includes(search.toLowerCase()) &&
      !d.ticket.toLowerCase().includes(search.toLowerCase())
    ) return false;
    return true;
  });

  const counts: Record<string, number> = {
    pendiente: denuncias.filter((d) => d.estado === "pendiente").length,
    investigando: denuncias.filter((d) => d.estado === "investigando").length,
    resuelta: denuncias.filter((d) => d.estado === "resuelta").length,
    rechazada: denuncias.filter((d) => d.estado === "rechazada").length,
  };

  const showToast = (msg: string, tipo: "ok" | "warn" | "error" = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const evidenciaDe = (den: Denuncia) => evidencias.find((e) => e.id === den.evidenciaId);
  const montoOriginalDe = (den: Denuncia) => {
    const ev = evidenciaDe(den);
    return MOCK_PADRINOS.find((p) => p.mascotaId === ev?.mascotaId)?.montoMensual ?? 25;
  };

  const notificar = (usuarioId: string, fundacionId: string, mensaje: string) => {
    agregarNotificacion({
      tipo: "admin_mensaje",
      actualizacion_id: null,
      usuario_id: usuarioId,
      fundacion_id: fundacionId,
      animal_id: null,
      visible: true,
      leido: false,
      fecha_leido: null,
      calificacion: null,
      fecha_calificacion: null,
      es_alerta_salud: false,
      descripcion_alerta: null,
      mensaje,
      es_admin_mensaje: true,
    });
  };

  const notificarResolucion = (den: Denuncia, mensajeDonador: string, mensajeFundacion: string) => {
    notificar(den.usuarioId, den.fundacionId, mensajeDonador);
    notificar(FOUNDATION_USER[den.fundacionId] || "", den.fundacionId, mensajeFundacion);
  };

  const closeAction = () => {
    setAction(null);
    setResolucionText("");
    setNuevaEstrellas(2);
  };

  const handleInvestigar = () => {
    if (!selectedDen) return;
    updateDenuncia(selectedDen.id, {
      estado: "investigando",
      auditoria: [
        ...selectedDen.auditoria,
        {
          accion: "Investigación iniciada",
          fecha: new Date().toISOString(),
          detalle: "Evaluación de gravedad y veracidad de las pruebas",
        },
      ],
    });
    setSelectedDen(null);
    showToast("Investigación iniciada — se comparó la evidencia original con el reporte");
  };

  const handleSancion = () => {
    if (!selectedDen) return;
    const ev = evidenciaDe(selectedDen);
    const calificacionAnterior = ev?.calificacionPromedio ?? 5;
    const montoOriginal = montoOriginalDe(selectedDen);
    const montoAjustado = Math.round(montoOriginal * FACTOR_SANCION * 100) / 100;
    const ahora = new Date().toISOString();

    updateEvidencia(ev?.id || "", { calificacionPromedio: nuevaEstrellas });
    updateDenuncia(selectedDen.id, {
      estado: "resuelta",
      resolucionTipo: "sancion_estrellas",
      calificacionAnterior,
      calificacionNueva: nuevaEstrellas,
      montoOriginal,
      montoAjustado,
      resolucionAdmin: resolucionText.trim() || undefined,
      auditoria: [
        ...selectedDen.auditoria,
        {
          accion: "Sanción de estrellas aplicada",
          fecha: ahora,
          detalle: `Calificación ${calificacionAnterior} → ${nuevaEstrellas} · Monto $${montoOriginal.toFixed(2)} → $${montoAjustado.toFixed(2)} (factor ${FACTOR_SANCION})`,
        },
      ],
    });

    notificarResolucion(
      selectedDen,
      `Tu denuncia ${selectedDen.ticket} fue resuelta con sanción: la evidencia de ${selectedDen.fundacionNombre} fue recalificada de ${calificacionAnterior} a ${nuevaEstrellas} estrellas y tu aporte mensual se ajustó a $${montoAjustado.toFixed(2)}.`,
      `Medida aplicada sobre tu fundación: la evidencia ${ev?.titulo || ""} fue recalificada a ${nuevaEstrellas} estrellas y el aporte mensual ajustado a $${montoAjustado.toFixed(2)}. Tienes derecho a apelación en los próximos 10 días.`
    );

    setSelectedDen(null);
    closeAction();
    showToast("Sanción económica aplicada — monto recalculado con factor 0.67");
  };

  const handleDeshabilitar = () => {
    if (!selectedDen) return;
    const ahora = new Date().toISOString();

    updateFundacion(selectedDen.fundacionId, { estado: "Deshabilitada" });
    updateDenuncia(selectedDen.id, {
      estado: "resuelta",
      resolucionTipo: "deshabilitacion",
      resolucionAdmin: resolucionText.trim() || undefined,
      auditoria: [
        ...selectedDen.auditoria,
        {
          accion: "Cuenta de fundación deshabilitada",
          fecha: ahora,
          detalle: "Denuncia marcada como Válida — Sanción Máxima",
        },
      ],
    });

    notificarResolucion(
      selectedDen,
      `Tu denuncia ${selectedDen.ticket} fue resuelta con sanción máxima: la cuenta de ${selectedDen.fundacionNombre} fue deshabilitada.`,
      `Sanción máxima aplicada: la cuenta de tu fundación fue deshabilitada por falta gravísima (${selectedDen.motivo}). Tienes derecho a apelación en los próximos 10 días.`
    );

    setSelectedDen(null);
    closeAction();
    showToast("Cuenta de fundación deshabilitada — denuncia marcada como Válida · Sanción Máxima", "error");
  };

  const handleRechazar = () => {
    if (!selectedDen || !resolucionText.trim()) return;
    updateDenuncia(selectedDen.id, {
      estado: "rechazada",
      resolucionAdmin: resolucionText.trim(),
      auditoria: [
        ...selectedDen.auditoria,
        {
          accion: "Denuncia rechazada",
          fecha: new Date().toISOString(),
          detalle: resolucionText.trim(),
        },
      ],
    });

    notificarResolucion(
      selectedDen,
      `Tu denuncia ${selectedDen.ticket} fue rechazada por falta de mérito. Motivo: ${resolucionText.trim()}`,
      `La denuncia ${selectedDen.ticket} sobre tu fundación fue rechazada por falta de mérito.`
    );

    setSelectedDen(null);
    closeAction();
    showToast("Denuncia rechazada por falta de mérito", "warn");
  };

  const handleRevertir = () => {
    if (!selectedDen) return;
    const ahora = new Date().toISOString();

    if (selectedDen.resolucionTipo === "deshabilitacion") {
      updateFundacion(selectedDen.fundacionId, { estado: "Activa" });
    }
    if (selectedDen.resolucionTipo === "sancion_estrellas" && selectedDen.calificacionAnterior != null) {
      updateEvidencia(selectedDen.evidenciaId || "", { calificacionPromedio: selectedDen.calificacionAnterior });
    }

    updateDenuncia(selectedDen.id, {
      revertida: true,
      estado: "investigando",
      resolucionAdmin: resolucionText.trim() || selectedDen.resolucionAdmin,
      auditoria: [
        ...selectedDen.auditoria,
        {
          accion: "Decisión revertida por error administrativo",
          fecha: ahora,
          detalle: "Estados previos restaurados (cuenta / monto / denuncia)",
        },
      ],
    });

    notificarResolucion(
      selectedDen,
      `Se revirtió la resolución de tu denuncia ${selectedDen.ticket}. El caso vuelve a estar en investigación y los estados previos fueron restaurados.`,
      `Se revirtió la medida aplicada sobre tu fundación (${selectedDen.fundacionNombre}). Tu cuenta fue rehabilitada y los montos restaurados.`
    );

    setSelectedDen(null);
    closeAction();
    showToast("Decisión revertida — estados previos restaurados");
  };

  const renderActions = (den: Denuncia) => {
    if (den.revertida) {
      return (
        <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-600 flex items-center gap-1.5">
          <RotateCcw size={14} />
          Decisión revertida
        </span>
      );
    }
    if (den.estado === "pendiente") {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAction("investigar")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#004955] bg-[#004955]/10 hover:bg-[#004955]/20 transition-colors"
          >
            <Bell size={14} />
            Investigar
          </button>
          <button
            onClick={() => { setAction("rechazar"); setResolucionText(""); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <SearchX size={14} />
            Rechazar
          </button>
        </div>
      );
    }
    if (den.estado === "investigando") {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setAction("sancion"); setNuevaEstrellas(2); setResolucionText(""); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#00626d] bg-[#07c4e1]/15 hover:bg-[#07c4e1]/25 transition-colors"
          >
            <Star size={14} />
            Sanción de estrellas
          </button>
          <button
            onClick={() => { setAction("deshabilitar"); setResolucionText(""); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#ee5871] bg-[#ee5871]/10 hover:bg-[#ee5871]/20 transition-colors"
          >
            <ShieldBan size={14} />
            Deshabilitar cuenta
          </button>
          <button
            onClick={() => { setAction("rechazar"); setResolucionText(""); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <SearchX size={14} />
            Rechazar
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => { setAction("revertir"); setResolucionText(""); }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
      >
        <RotateCcw size={14} />
        Revertir decisión
      </button>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {toast && (
          <div
            className={`rounded-xl p-4 flex items-center gap-3 font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${
              toast.tipo === "ok"
                ? "bg-[#004955]/10 border border-[#004955]/20 text-[#004955]"
                : toast.tipo === "warn"
                  ? "bg-amber-50 border border-amber-200 text-amber-600"
                  : "bg-red-50 border border-red-200 text-red-500"
            }`}
            role="status"
          >
            {toast.tipo === "ok" ? <CheckCircle2 size={20} /> : toast.tipo === "warn" ? <AlertTriangle size={20} /> : <ShieldBan size={20} />}
            {toast.msg}
          </div>
        )}

        <div>
          <h2 className="text-[#004955] text-2xl font-semibold">Denuncias y Reportes</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {(["todas", "pendiente", "investigando", "resuelta", "rechazada"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === f ? "bg-[#004955] text-white" : "bg-gray-200 text-[#004955] hover:bg-gray-300"
                }`}
              >
                {f === "todas" ? "Todas" : estadoLabel[f]}
                {f !== "todas" && ` (${counts[f]})`}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por motivo, fundación o ticket..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#07c4e1] outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((den) => (
            <div key={den.id} className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="bg-[#004955] text-[#07c4e1] px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wider">
                      {den.ticket}
                    </span>
                    <AlertTriangle size={16} className="text-[#004955]" />
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoBadge[den.estado]}`}>
                      {estadoLabel[den.estado]}
                    </span>
                  </div>
                  <h3 className="text-[#004955] font-semibold text-sm">{den.fundacionNombre}</h3>
                  <p className="text-gray-500 text-xs">{den.donadorNombre} · {den.fecha.split("T")[0]}</p>
                </div>
              </div>

              <p className="text-[#3e494a] text-sm leading-relaxed line-clamp-3 mb-3">{den.motivo}</p>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100 flex-wrap">
                <button
                  onClick={() => setSelectedDen(den)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Eye size={14} />
                  Ver detalle
                </button>
                {renderActions(den)}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#BDC8CA]/40">
            <AlertTriangle size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">No se encontraron denuncias</p>
            <p className="text-gray-400 text-sm mt-1">No hay reportes que coincidan con los filtros seleccionados.</p>
          </div>
        )}

        {selectedDen && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedDen(null)} role="dialog" aria-modal="true" aria-label="Detalle de denuncia">
            <div className="bg-white rounded-[24px] max-w-3xl w-full p-8 shadow-xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedDen(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1" aria-label="Cerrar">
                <X size={24} />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#004955] text-[#07c4e1] px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wider">{selectedDen.ticket}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoBadge[selectedDen.estado]}`}>
                  {estadoLabel[selectedDen.estado]}
                </span>
                {selectedDen.revertida && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-600">Revertida</span>
                )}
              </div>
              <h2 className="text-[#004955] text-xl font-bold mb-1">Mediación Técnica: Evidencia vs. Denuncia</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="border border-[#BDC8CA]/40 rounded-2xl overflow-hidden">
                  <div className="bg-[#004955] px-4 py-2.5 flex items-center gap-2">
                    <FileText size={16} className="text-[#07c4e1]" />
                    <h3 className="text-white text-sm font-semibold">Evidencia original</h3>
                  </div>
                  {(() => {
                    const ev = evidenciaDe(selectedDen);
                    return ev ? (
                      <div className="p-4 space-y-3">
                        <img src={ev.imagenUrl} alt={ev.titulo} className="w-full h-36 object-cover rounded-xl" />
                        <div>
                          <p className="text-[#004955] font-semibold text-sm">{ev.titulo}</p>
                          <p className="text-gray-500 text-xs">{ev.mascotaNombre} · {ev.tipo} · {ev.fecha}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={16}
                              className={
                                (selectedDen.estado === "resuelta" && selectedDen.resolucionTipo === "sancion_estrellas"
                                  ? s <= (selectedDen.calificacionNueva || 0)
                                  : s <= Math.round(ev.calificacionPromedio || 0))
                                  ? "fill-[#ffac13] text-[#ffac13]"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-2">
                            {selectedDen.estado === "resuelta" && selectedDen.resolucionTipo === "sancion_estrellas"
                              ? `${selectedDen.calificacionAnterior} → ${selectedDen.calificacionNueva} estrellas`
                              : `${ev.calificacionPromedio ?? "—"}/5`}
                          </span>
                        </div>
                        {selectedDen.resolucionTipo === "sancion_estrellas" && (
                          <div className="bg-emerald-50 rounded-xl p-3 text-xs text-emerald-700 space-y-1">
                            <p className="font-semibold">Recálculo de aporte (factor {FACTOR_SANCION})</p>
                            <p>${selectedDen.montoOriginal?.toFixed(2)} → ${selectedDen.montoAjustado?.toFixed(2)} / mes</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="p-4 text-sm text-gray-400">Evidencia no encontrada.</p>
                    );
                  })()}
                </div>

                <div className="border border-[#BDC8CA]/40 rounded-2xl overflow-hidden">
                  <div className="bg-[#ee5871] px-4 py-2.5 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-white" />
                    <h3 className="text-white text-sm font-semibold">Sustento de la denuncia</h3>
                  </div>
                  <div className="p-4 space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Donador</p>
                        <p className="text-[#004955] font-medium">{selectedDen.donadorNombre}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Fundación</p>
                        <p className="text-[#004955] font-medium">{selectedDen.fundacionNombre}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Motivo</p>
                      <p className="text-[#3e494a]">{selectedDen.motivo}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Descripción</p>
                      <p className="text-[#3e494a] leading-relaxed">{selectedDen.descripcion || "—"}</p>
                    </div>
                    {selectedDen.pruebasUrls && selectedDen.pruebasUrls.length > 0 && (
                      <div>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Adjuntos</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedDen.pruebasUrls.map((p) => (
                            <span key={p} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs">
                              <Paperclip size={12} />
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedDen.estado === "investigando" && (
                      <p className="text-xs text-amber-600 italic">Caso en evaluación de gravedad y veracidad.</p>
                    )}
                    {selectedDen.resolucionAdmin && selectedDen.estado !== "investigando" && (
                      <div className={`rounded-xl p-3 ${selectedDen.estado === "rechazada" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-700"}`}>
                        <p className="text-xs font-semibold mb-0.5">Resolución del administrador</p>
                        <p className="text-xs">{selectedDen.resolucionAdmin}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedDen.auditoria.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[#004955] font-semibold text-sm mb-2 flex items-center gap-2">
                    <History size={16} />
                    Auditoría de acciones
                  </h3>
                  <div className="space-y-2">
                    {selectedDen.auditoria.map((a, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <span className="w-2 h-2 rounded-full bg-[#07c4e1] mt-1.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[#004955] font-medium text-xs">{a.accion}</p>
                            <p className="text-gray-400 text-[11px] flex-shrink-0">{new Date(a.fecha).toLocaleString("es-EC")}</p>
                          </div>
                          {a.detalle && <p className="text-gray-500 text-xs mt-0.5">{a.detalle}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 mb-2">Evaluar gravedad y veracidad de las pruebas para elegir el escenario:</p>
                {renderActions(selectedDen)}
              </div>
            </div>
          </div>
        )}

        {action === "sancion" && selectedDen && (
          <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeAction} role="dialog" aria-modal="true" aria-label="Sanción de estrellas">
            <div className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-xl relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={closeAction} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1" aria-label="Cerrar">
                <X size={24} />
              </button>
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-[#07c4e1]/15 p-2.5 rounded-xl"><Gavel size={22} className="text-[#00626d]" /></div>
                <h3 className="text-[#004955] text-lg font-bold">Escenario A — Sanción Manual</h3>
              </div>
              <p className="text-gray-500 text-sm mb-5">
                La evidencia no es óptima pero no amerita cierre de cuenta. Ajusta la calificación de estrellas.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 font-medium mb-2">Nueva calificación de la evidencia</p>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setNuevaEstrellas(s)} className="transition-transform hover:scale-110">
                      <Star
                        size={30}
                        className={s <= nuevaEstrellas ? "fill-[#ffac13] text-[#ffac13]" : "text-gray-300"}
                      />
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-2 font-medium">{nuevaEstrellas}/5</span>
                </div>
              </div>

              <div className="bg-[#004955]/5 rounded-xl p-4 mb-4 space-y-2">
                <p className="text-xs font-semibold text-[#004955]">Recálculo de reembolso (Monto × Factor {FACTOR_SANCION})</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Monto actual</span>
                  <span className="text-[#004955] font-bold">${montoOriginalDe(selectedDen).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Nuevo monto</span>
                  <span className="text-[#ee5871] font-bold">
                    ${(Math.round(montoOriginalDe(selectedDen) * FACTOR_SANCION * 100) / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <textarea
                value={resolucionText}
                onChange={(e) => setResolucionText(e.target.value)}
                placeholder="Comentario de la sanción (opcional)..."
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#07c4e1] outline-none resize-none mb-5"
              />

              <div className="flex gap-3">
                <button onClick={closeAction} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSancion} className="flex-1 bg-[#00626d] hover:bg-[#004955] text-[#07c4e1] py-2.5 rounded-full font-medium transition-colors">
                  Aplicar sanción
                </button>
              </div>
            </div>
          </div>
        )}

        {action === "deshabilitar" && selectedDen && (
          <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeAction} role="dialog" aria-modal="true" aria-label="Deshabilitar cuenta">
            <div className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-xl relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={closeAction} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1" aria-label="Cerrar">
                <X size={24} />
              </button>
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <ShieldBan size={28} className="text-[#ee5871]" />
              </div>
              <h3 className="text-[#004955] text-lg font-bold mb-1">Escenario B — Deshabilitación de Cuenta</h3>
              <p className="text-gray-500 text-sm mb-5">
                Se confirma falta gravísima (Maltrato o Fraude recurrente). La cuenta de{" "}
                <strong>{selectedDen.fundacionNombre}</strong> será deshabilitada y la denuncia marcada como{" "}
                <strong>"Válida — Sanción Máxima"</strong>.
              </p>
              <textarea
                value={resolucionText}
                onChange={(e) => setResolucionText(e.target.value)}
                placeholder="Comentario de la sanción (opcional)..."
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#07c4e1] outline-none resize-none mb-5"
              />
              <div className="flex gap-3">
                <button onClick={closeAction} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleDeshabilitar} className="flex-1 bg-[#ee5871] hover:bg-[#d94a63] text-white py-2.5 rounded-full font-medium transition-colors">
                  Confirmar bloqueo
                </button>
              </div>
            </div>
          </div>
        )}

        {action === "rechazar" && selectedDen && (
          <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeAction} role="dialog" aria-modal="true" aria-label="Rechazar denuncia">
            <div className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-xl relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={closeAction} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1" aria-label="Cerrar">
                <X size={24} />
              </button>
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <SearchX size={28} className="text-[#ee5871]" />
              </div>
              <h3 className="text-[#004955] text-lg font-bold mb-1">Escenario C — Rechazo de Denuncia</h3>
              <p className="text-gray-500 text-sm mb-5">
                La denuncia carece de mérito. Indica el motivo del rechazo para notificar al donador.
              </p>
              <textarea
                value={resolucionText}
                onChange={(e) => setResolucionText(e.target.value)}
                placeholder="Motivo del rechazo (obligatorio)..."
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#07c4e1] outline-none resize-none mb-5"
              />
              <div className="flex gap-3">
                <button onClick={closeAction} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleRechazar}
                  disabled={!resolucionText.trim()}
                  className={`flex-1 py-2.5 rounded-full font-medium transition-colors ${
                    resolucionText.trim() ? "bg-[#ee5871] hover:bg-[#d94a63] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Confirmar rechazo
                </button>
              </div>
            </div>
          </div>
        )}

        {action === "revertir" && selectedDen && (
          <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeAction} role="dialog" aria-modal="true" aria-label="Revertir decisión">
            <div className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-xl relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={closeAction} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1" aria-label="Cerrar">
                <X size={24} />
              </button>
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                <RotateCcw size={28} className="text-amber-500" />
              </div>
              <h3 className="text-[#004955] text-lg font-bold mb-1">HU10 — Reversión por Error Administrativo</h3>
              <p className="text-gray-500 text-sm mb-5">
                Se restaurarán los estados previos:{" "}
                <strong>
                  {selectedDen.resolucionTipo === "deshabilitacion" && "cuenta de la fundación → Activa"}
                  {selectedDen.resolucionTipo === "sancion_estrellas" && `calificación de evidencia → ${selectedDen.calificacionAnterior} estrellas`}
                  {!selectedDen.resolucionTipo && "monto y estado de la denuncia"}
                </strong>
                . Se notificará el cambio de decisión.
              </p>
              <textarea
                value={resolucionText}
                onChange={(e) => setResolucionText(e.target.value)}
                placeholder="Motivo de la reversión (opcional)..."
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#07c4e1] outline-none resize-none mb-5"
              />
              <div className="flex gap-3">
                <button onClick={closeAction} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleRevertir} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-full font-medium transition-colors">
                  Revertir decisión
                </button>
              </div>
            </div>
          </div>
        )}

        {action === "investigar" && selectedDen && (
          <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeAction} role="dialog" aria-modal="true" aria-label="Investigar denuncia">
            <div className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-xl relative text-center" onClick={(e) => e.stopPropagation()}>
              <button onClick={closeAction} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1" aria-label="Cerrar">
                <X size={24} />
              </button>
              <div className="w-14 h-14 bg-[#004955]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={28} className="text-[#004955]" />
              </div>
              <h3 className="text-[#004955] text-lg font-bold mb-1">Iniciar investigación</h3>
              <p className="text-gray-500 text-sm mb-6">
                La denuncia pasará a estado <strong>"En investigación"</strong> y se evaluará gravedad y veracidad
                de las pruebas contra la evidencia original.
              </p>
              <div className="flex gap-3">
                <button onClick={closeAction} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleInvestigar} className="flex-1 bg-[#00626d] hover:bg-[#004955] text-[#07c4e1] py-2.5 rounded-full font-medium transition-colors">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
