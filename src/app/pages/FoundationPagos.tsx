import React, { useState } from 'react';
import { DollarSign, Wallet, Gavel, CheckCircle2, Clock, X, Star, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePagos } from '../context/PagoContext';
import { useNotifications } from '../context/NotificationContext';
import { FoundationLayout } from './FoundationLayout';
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

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= value ? "fill-[#ffac13] text-[#ffac13]" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

export function FoundationPagos() {
  const { user } = useAuth();
  const { pagos, apelarPago } = usePagos();
  const { agregarNotificacion } = useNotifications();
  const [apelando, setApelando] = useState<number | null>(null);
  const [motivo, setMotivo] = useState("");
  const [toast, setToast] = useState("");

  const fundacionId = user?.id === "usr-fund1" ? "fund-01" : user?.id === "usr-fund2" ? "fund-02" : "fund-03";

  const misPagos = pagos.filter((p) => p.fundacionId === fundacionId);
  const pendiente = misPagos.filter((p) => p.estado === "pendiente_desembolso" || p.estado === "apelada" || p.estado === "mediada");
  const desembolsado = misPagos
    .filter((p) => p.estado === "desembolsada")
    .reduce((sum, p) => sum + p.montoReembolso, 0);
  const montoPendiente = pendiente.reduce((sum, p) => sum + p.montoReembolso, 0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const enviarApelacion = () => {
    if (apelando === null || !motivo.trim()) return;
    const target = pagos.find((p) => p.id === apelando);
    apelarPago(apelando, motivo.trim());
    if (target) {
      agregarNotificacion({
        tipo: "admin_mensaje",
        actualizacion_id: null,
        usuario_id: target.donadorId,
        fundacion_id: fundacionId,
        animal_id: null,
        visible: true,
        leido: false,
        fecha_leido: null,
        calificacion: null,
        fecha_calificacion: null,
        es_alerta_salud: false,
        descripcion_alerta: null,
        mensaje: `Tu apelación de la liquidación ${target.numero} fue enviada al administrador para mediación.`,
        es_admin_mensaje: true,
      });
    }
    setApelando(null);
    setMotivo("");
    showToast("Apelación enviada al administrador");
  };

  return (
    <FoundationLayout>
      <div className="space-y-6">
        {toast && (
          <div className="bg-[#004955]/10 border border-[#004955]/20 rounded-xl p-4 flex items-center gap-3 text-[#004955] font-medium animate-in fade-in slide-in-from-top-2 duration-300" role="status">
            <CheckCircle2 size={20} />
            {toast}
          </div>
        )}

        <div>
          <h2 className="text-[#004955] text-2xl font-semibold">Pagos y Desembolsos</h2>
          <p className="text-[#3e494a] text-sm mt-1">
            Liquidaciones generadas por la calificación de tus evidencias. Revisa el monto final y apela si consideras que la calificación fue injusta.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-5 flex items-center gap-4 shadow-sm">
            <div className="bg-amber-50 p-3 rounded-xl"><Clock size={24} className="text-amber-600" /></div>
            <div>
              <p className="text-[#3e494a] text-xs font-medium">Pendiente de desembolso</p>
              <p className="text-[#004955] text-2xl font-bold">${montoPendiente.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-5 flex items-center gap-4 shadow-sm">
            <div className="bg-[#004955]/10 p-3 rounded-xl"><DollarSign size={24} className="text-[#004955]" /></div>
            <div>
              <p className="text-[#3e494a] text-xs font-medium">Total desembolsado</p>
              <p className="text-[#004955] text-2xl font-bold">${desembolsado.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-5 flex items-center gap-4 shadow-sm">
            <div className="bg-red-50 p-3 rounded-xl"><Gavel size={24} className="text-red-500" /></div>
            <div>
              <p className="text-[#3e494a] text-xs font-medium">Apeladas</p>
              <p className="text-[#004955] text-2xl font-bold">{misPagos.filter((p) => p.estado === "apelada").length}</p>
            </div>
          </div>
        </div>

        {misPagos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#BDC8CA]/40">
            <Wallet size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">Aún no tienes liquidaciones</p>
            <p className="text-gray-400 text-sm mt-1">Las liquidaciones se generan cuando un donador califica tus evidencias.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#BDC8CA]/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Liquidación</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Evidencia</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Calificación</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal neto</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto final</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {misPagos.map((pago) => {
                    const escenario = ESCENARIOS_CALIFICACION[pago.mediacionCalificacion ?? pago.calificacion];
                    return (
                      <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-[#004955] font-semibold text-sm">{pago.numero}</p>
                          <p className="text-gray-400 text-xs">{pago.fecha.split("T")[0]}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-gray-700 font-medium">{pago.mascotaNombre}</p>
                          <p className="text-gray-400 text-xs max-w-[220px] truncate">{pago.evidenciaTitulo}</p>
                        </td>
                        <td className="px-5 py-4">
                          <Stars value={pago.mediacionCalificacion ?? pago.calificacion} />
                          <p className="text-gray-400 text-[11px] mt-0.5">
                            {pago.mediacionCalificacion != null && pago.mediacionCalificacion !== pago.calificacion
                              ? `Ajustada por mediación (era ${pago.calificacion})`
                              : escenario?.etiqueta}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[#004955] font-semibold text-sm">${pago.subtotalNetoPorMascota.toFixed(2)}</p>
                          <p className="text-gray-400 text-[11px]">-${pago.comisionPorMascota.toFixed(2)} comisión</p>
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
                          {pago.estado === "pendiente_desembolso" && (
                            <button
                              onClick={() => { setApelando(pago.id); setMotivo(""); }}
                              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors"
                            >
                              Apelar calificación
                            </button>
                          )}
                          {pago.estado === "apelada" && (
                            <span className="text-xs text-red-400 font-medium flex items-center gap-1">
                              <Gavel size={12} />
                              En mediación
                            </span>
                          )}
                          {pago.estado === "mediada" && pago.mediacionComentario && (
                            <span className="text-xs text-sky-600 font-medium flex items-center gap-1" title={pago.mediacionComentario}>
                              <Info size={12} />
                              Mediación aplicada
                            </span>
                          )}
                          {pago.estado === "desembolsada" && (
                            <span className="text-xs text-[#004955] font-medium flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              Pagado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {apelando !== null && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setApelando(null)} role="dialog" aria-modal="true" aria-label="Apelar calificación">
            <div className="bg-white rounded-[24px] max-w-lg w-full p-8 shadow-xl relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setApelando(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1" aria-label="Cerrar">
                <X size={24} />
              </button>
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-red-50 p-2.5 rounded-xl">
                  <Gavel size={22} className="text-red-500" />
                </div>
                <h2 className="text-[#004955] text-xl font-bold">Apelar calificación</h2>
              </div>

              <p className="text-gray-500 text-sm mt-2 mb-5">
                Explica por qué consideras que la calificación no refleja el cuidado brindado. El administrador revisará la evidencia y el comentario del donador para mediar.
              </p>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Motivo de apelación *</label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={4}
                  placeholder="Describe tu inconformidad con la calificación recibida..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#07c4e1] outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setApelando(null)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={enviarApelacion}
                  disabled={!motivo.trim()}
                  className={`flex-1 py-2.5 rounded-full font-medium transition-colors ${
                    motivo.trim()
                      ? "bg-[#ee5871] text-white hover:bg-[#d94a63]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Enviar apelación
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FoundationLayout>
  );
}
