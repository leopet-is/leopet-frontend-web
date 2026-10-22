import React, { useState } from 'react';
import { Gavel, DollarSign, CheckCircle2, Star, X, Scale, MessageSquare } from 'lucide-react';
import { usePagos } from '../context/PagoContext';
import { useNotifications } from '../context/NotificationContext';
import { AdminLayout } from './AdminLayout';
import { ESCENARIOS_CALIFICACION } from '../lib/pagos';

const ESTADO_LABEL: Record<string, string> = {
  pendiente_desembolso: "Pendiente de desembolso",
  apelada: "Apelada",
  mediada: "Mediada",
  desembolsada: "Desembolsada",
};

const ESTADO_STYLE: Record<string, string> = {
  pendiente_desembolso: "bg-amber-50 text-amber-700 border-amber-200",
  apelada: "bg-red-50 text-red-600 border-red-200",
  mediada: "bg-sky-50 text-sky-700 border-sky-200",
  desembolsada: "bg-[#004955]/10 text-[#004955] border-[#004955]/20",
};

function Stars({ value, size }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size ?? 14}
          className={s <= value ? "fill-[#ffac13] text-[#ffac13]" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

export function AdminApelaciones() {
  const { pagos, mediarPago, aprobarDesembolso } = usePagos();
  const { agregarNotificacion } = useNotifications();
  const [filtro, setFiltro] = useState<"todas" | "apelada" | "pendiente_desembolso" | "mediada" | "desembolsada">("todas");
  const [mediando, setMediando] = useState<number | null>(null);
  const [nuevaCal, setNuevaCal] = useState(3);
  const [comentario, setComentario] = useState("");
  const [toast, setToast] = useState("");

  const apeladas = pagos.filter((p) => p.estado === "apelada").length;
  const pendientes = pagos.filter((p) => p.estado === "pendiente_desembolso").length;

  const lista = filtro === "todas" ? pagos : pagos.filter((p) => p.estado === filtro);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const abrirMediacion = (id: number) => {
    setMediando(id);
    setNuevaCal(3);
    setComentario("");
  };

  const aplicarMediacion = () => {
    if (mediando === null || !comentario.trim()) return;
    const target = pagos.find((p) => p.id === mediando);
    mediarPago(mediando, nuevaCal, comentario.trim());
    if (target) {
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
        mensaje: `Mediación aplicada a la liquidación ${target.numero}. Monto recalculado automáticamente.`,
        es_admin_mensaje: true,
      });
    }
    setMediando(null);
    setComentario("");
    showToast("Mediación aplicada — monto recalculado");
  };

  const aprobar = (id: number) => {
    aprobarDesembolso(id);
    showToast("Desembolso aprobado");
  };

  const mediandoPago = mediando !== null ? pagos.find((p) => p.id === mediando) : null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {toast && (
          <div className="bg-[#004955]/10 border border-[#004955]/20 rounded-xl p-4 flex items-center gap-3 text-[#004955] font-medium animate-in fade-in slide-in-from-top-2 duration-300" role="status">
            <CheckCircle2 size={20} />
            {toast}
          </div>
        )}

        <div>
          <h2 className="text-[#004955] text-2xl font-semibold">Liquidaciones y Apelaciones</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-5 flex items-center gap-4 shadow-sm">
            <div className="bg-red-50 p-3 rounded-xl"><Gavel size={24} className="text-red-500" /></div>
            <div>
              <p className="text-[#3e494a] text-xs font-medium">Apelaciones en espera</p>
              <p className="text-[#004955] text-2xl font-bold">{apeladas}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-5 flex items-center gap-4 shadow-sm">
            <div className="bg-amber-50 p-3 rounded-xl"><DollarSign size={24} className="text-amber-600" /></div>
            <div>
              <p className="text-[#3e494a] text-xs font-medium">Pendientes de desembolso</p>
              <p className="text-[#004955] text-2xl font-bold">{pendientes}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-5 flex items-center gap-4 shadow-sm">
            <div className="bg-[#004955]/10 p-3 rounded-xl"><Scale size={24} className="text-[#004955]" /></div>
            <div>
              <p className="text-[#3e494a] text-xs font-medium">Mediadas</p>
              <p className="text-[#004955] text-2xl font-bold">{pagos.filter((p) => p.estado === "mediada").length}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {([
            ["todas", "Todas"],
            ["apelada", `Apeladas (${apeladas})`],
            ["pendiente_desembolso", `Pendientes (${pendientes})`],
            ["mediada", "Mediadas"],
            ["desembolsada", "Desembolsadas"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filtro === key ? "bg-[#004955] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#BDC8CA]/40 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Liquidación</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Evidencia / Donador</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Calificación</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lista.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-[#004955] font-semibold text-sm">{pago.numero}</p>
                      <p className="text-gray-400 text-xs">{pago.fecha.split("T")[0]}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700 font-medium">{pago.mascotaNombre} · {pago.fundacionNombre}</p>
                      <p className="text-gray-400 text-xs max-w-[240px] truncate">{pago.evidenciaTitulo}</p>
                      <p className="text-gray-400 text-[11px]">Donador: {pago.donadorNombre}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Stars value={pago.mediacionCalificacion ?? pago.calificacion} />
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        {(ESCENARIOS_CALIFICACION[pago.mediacionCalificacion ?? pago.calificacion])?.porcentaje}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[#00626d] font-bold text-sm">${pago.montoReembolso.toFixed(2)}</p>
                      {pago.montoAnterior != null && (
                        <p className="text-gray-400 text-[11px]">antes ${pago.montoAnterior.toFixed(2)}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${ESTADO_STYLE[pago.estado]}`}>
                        {ESTADO_LABEL[pago.estado]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {pago.estado === "apelada" && (
                          <button
                            onClick={() => abrirMediacion(pago.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#004955] text-white text-xs font-medium hover:bg-[#00626d] transition-colors"
                          >
                            <span className="flex items-center gap-1"><Scale size={12} /> Mediar</span>
                          </button>
                        )}
                        {(pago.estado === "pendiente_desembolso" || pago.estado === "mediada") && (
                          <button
                            onClick={() => aprobar(pago.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#004955]/10 text-[#004955] text-xs font-medium hover:bg-[#004955]/20 transition-colors"
                          >
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} /> Aprobar desembolso</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {lista.length === 0 && (
            <div className="text-center py-12">
              <Gavel size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay liquidaciones en esta categoría</p>
            </div>
          )}
        </div>

        {mediandoPago && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setMediando(null)} role="dialog" aria-modal="true" aria-label="Mediar apelación">
            <div className="bg-white rounded-[24px] max-w-2xl w-full p-8 shadow-xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setMediando(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1" aria-label="Cerrar">
                <X size={24} />
              </button>
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-[#004955]/10 p-2.5 rounded-xl">
                  <Scale size={22} className="text-[#004955]" />
                </div>
                <h2 className="text-[#004955] text-xl font-bold">Mediación técnica — {mediandoPago.numero}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Evidencia vs. Comentario del donador</p>
                  <p className="text-[#004955] font-semibold text-sm">{mediandoPago.evidenciaTitulo}</p>
                  <p className="text-gray-500 text-xs mt-1">{mediandoPago.mascotaNombre} · {mediandoPago.evidenciaFecha}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-gray-500">Calificación del donador:</span>
                    <Stars value={mediandoPago.calificacion} />
                  </div>
                  {mediandoPago.comentarioDonador && (
                    <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-600 bg-white rounded-lg p-2.5 border border-gray-100">
                      <MessageSquare size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      {mediandoPago.comentarioDonador}
                    </div>
                  )}
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-1.5">Apelación de la fundación</p>
                  <p className="text-xs text-gray-700 bg-white rounded-lg p-2.5 border border-red-100">
                    {mediandoPago.apelacionComentario}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Nueva calificación (mediación)</p>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() => setNuevaCal(s)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            size={24}
                            className={s > 0 && s <= nuevaCal ? "fill-[#ffac13] text-[#ffac13]" : s === 0 ? "text-gray-300" : "text-gray-300"}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {nuevaCal === 0 ? "0 estrellas — Penalización Total ($0)" : `${nuevaCal} estrellas — ${ESCENARIOS_CALIFICACION[nuevaCal].porcentaje}`}
                    </p>
                    <p className="text-sm font-semibold text-[#00626d] mt-1">
                      Nuevo monto estimado: ${((mediandoPago.subtotalNetoPorMascota * (nuevaCal === 0 ? 0 : nuevaCal === 1 ? 0.8 : nuevaCal === 2 ? 1 / 1.5 : nuevaCal === 3 ? 1 / 1.75 : 1))).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Resolución de la mediación *</label>
                    <textarea
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      rows={4}
                      placeholder="Justifica la calificación técnica asignada..."
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#07c4e1] outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setMediando(null)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={aplicarMediacion}
                  disabled={!comentario.trim()}
                  className={`flex-1 py-2.5 rounded-full font-medium transition-colors ${
                    comentario.trim()
                      ? "bg-[#004955] text-white hover:bg-[#00626d]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Aplicar mediación y recalcular
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
