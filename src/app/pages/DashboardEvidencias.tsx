import React, { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useManada } from '../context/ManadaContext';
import { useFavoritos } from '../context/FavoritosContext';
import { useAdmin } from '../context/AdminContext';
import { useNotifications } from '../context/NotificationContext';
import { useSubscriptions } from '../context/SubscriptionContext';
import { usePagos } from '../context/PagoContext';
import { DashboardLayout } from './DashboardLayout';
import { EvidenceCard } from '../components/EvidenceCard';
import { MOCK_EVIDENCE } from '../lib/mockData';
import { PawPrint, Heart, AlertTriangle, X, CheckCircle2, Upload, Ticket } from 'lucide-react';

const DENUNCIA_MOTIVOS = [
  "Fraude",
  "Maltrato animal",
  "Foto duplicada",
  "No corresponde a la mascota",
  "Calidad insuficiente",
  "Otro",
];

export function DashboardEvidencias() {
  const { user } = useAuth();
  const { mascotas } = useManada();
  const { subscriptions } = useSubscriptions();
  const { favoritos } = useFavoritos();
  const { denuncias, addDenuncia } = useAdmin();
  const { agregarNotificacion } = useNotifications();
  const { pagos, registrarCalificacion } = usePagos();
  const [tab, setTab] = useState<"apadrinados" | "favoritas">("apadrinados");

  const [reportEvidencia, setReportEvidencia] = useState<typeof MOCK_EVIDENCE[0] | null>(null);
  const [motivo, setMotivo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivos, setArchivos] = useState<string[]>([]);
  const [ticketModal, setTicketModal] = useState<{ ticket: string; motivo: string; fundacionNombre: string } | null>(null);
  const [toast, setToast] = useState("");

  const sponsoredIds = new Set([
    ...mascotas.map((a) => a.animalId),
    ...subscriptions.flatMap((s) => s.pets.map((p) => p.petId)),
  ]);

  const misApadrinados = MOCK_EVIDENCE.filter((ev) => sponsoredIds.has(ev.mascotaId));
  const deFavoritas = MOCK_EVIDENCE.filter(
    (ev) => favoritos.includes(ev.fundacionId) && !sponsoredIds.has(ev.mascotaId)
  );

  const activeList = tab === "apadrinados" ? misApadrinados : deFavoritas;

  const misDenunciasAbiertas = denuncias.filter(
    (d) => d.usuarioId === user?.id && (d.estado === "pendiente" || d.estado === "investigando")
  );
  const evidenciaEnRevision = new Set(misDenunciasAbiertas.map((d) => d.evidenciaId));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleRate = (ev: typeof MOCK_EVIDENCE[0], calificacion: number, comentario: string) => {
    if (!user) return;
    const sub = subscriptions.find((s) => s.pets.some((p) => p.petId === ev.mascotaId));
    const donadorNombre = `${user.nombre || ""} ${user.apellido || ""}`.trim() || "Donador";
    const pago = registrarCalificacion({
      evidenciaId: ev.id,
      evidenciaTitulo: ev.titulo,
      evidenciaFecha: ev.fecha,
      mascotaId: ev.mascotaId,
      mascotaNombre: ev.mascotaNombre,
      fundacionId: ev.fundacionId,
      fundacionNombre: ev.fundacionNombre,
      donadorId: user.id,
      donadorNombre,
      montoGlobal: sub?.montoMensual ?? sub?.totalMonthly ?? 50,
      mascotasCount: sub?.pets.length ?? 1,
      calificacion,
      comentario: comentario.trim() || undefined,
    });
    showToast(`Calificación registrada — Liquidación ${pago.numero} por $${pago.montoReembolso.toFixed(2)}`);
  };

  const openReport = (ev: typeof MOCK_EVIDENCE[0]) => {
    setReportEvidencia(ev);
    setMotivo("");
    setDescripcion("");
    setArchivos([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setArchivos(files.map((f) => f.name));
  };

  const enviarDenuncia = () => {
    if (!reportEvidencia || !motivo || !descripcion.trim()) return;
    const donadorNombre = `${user?.nombre || ""} ${user?.apellido || ""}`.trim();
    const denuncia = addDenuncia({
      motivo: descripcion.toLowerCase().startsWith(motivo.toLowerCase())
        ? descripcion.trim()
        : `${motivo} — ${descripcion.trim()}`,
      descripcion: descripcion.trim(),
      pruebasUrls: archivos,
      evidenciaId: reportEvidencia.id,
      usuarioId: user?.id || "",
      donadorNombre: donadorNombre || "Donador",
      fundacionId: reportEvidencia.fundacionId,
      fundacionNombre: reportEvidencia.fundacionNombre,
    });

    agregarNotificacion({
      tipo: "admin_mensaje",
      actualizacion_id: null,
      usuario_id: user?.id || "",
      fundacion_id: reportEvidencia.fundacionId,
      animal_id: null,
      visible: true,
      leido: false,
      fecha_leido: null,
      calificacion: null,
      fecha_calificacion: null,
      es_alerta_salud: false,
      descripcion_alerta: null,
      mensaje: `Nueva denuncia ${denuncia.ticket} de ${denuncia.donadorNombre} contra ${denuncia.fundacionNombre}: ${denuncia.motivo}`,
      es_admin_mensaje: true,
    });

    setTicketModal({
      ticket: denuncia.ticket,
      motivo: denuncia.motivo,
      fundacionNombre: denuncia.fundacionNombre,
    });
    setReportEvidencia(null);
    showToast("Denuncia registrada correctamente");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {toast && (
          <div className="bg-[#004955]/10 border border-[#004955]/20 rounded-xl p-4 flex items-center gap-3 text-[#004955] font-medium animate-in fade-in slide-in-from-top-2 duration-300" role="status">
            <CheckCircle2 size={20} />
            {toast}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-[#004955] text-2xl font-semibold">Evidencias Recibidas</h2>
            <p className="text-[#3e494a] text-sm mt-1">
              Califica las fotos y videos enviados por las fundaciones de tus mascotas apadrinadas.
            </p>
          </div>
          <Link
            to="/dashboard/denuncias"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[#004955] bg-[#004955]/10 hover:bg-[#004955]/20 transition-colors"
          >
            <AlertTriangle size={16} />
            Mis denuncias ({misDenunciasAbiertas.length} abierta{misDenunciasAbiertas.length !== 1 ? "s" : ""})
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTab("apadrinados")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              tab === "apadrinados"
                ? "bg-[#004955] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <PawPrint size={14} />
            Mis apadrinados ({misApadrinados.length})
          </button>
          <button
            onClick={() => setTab("favoritas")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              tab === "favoritas"
                ? "bg-[#ee5871] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Heart size={14} className={tab === "favoritas" ? "fill-white" : ""} />
            Favoritas ({deFavoritas.length})
          </button>
        </div>

        {tab === "favoritas" && deFavoritas.length > 0 && (
          <p className="text-xs text-gray-400 italic">
            Estas evidencias son de solo lectura. Para calificar o reportar, apadrina la mascota directamente.
          </p>
        )}

        {activeList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#BDC8CA]/40">
            <PawPrint size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">
              {tab === "apadrinados"
                ? "Aún no tienes evidencias de tus apadrinados"
                : "Aún no hay evidencias de tus fundaciones favoritas"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {tab === "apadrinados"
                ? "Las fundaciones enviarán fotos y videos pronto."
                : "Las fundaciones favoritas publicarán avances pronto."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeList.map((ev) => {
              const enRevision = evidenciaEnRevision.has(ev.id);
              const pago = pagos.find((p) => p.evidenciaId === ev.id && p.estado !== "desembolsada");
              const reembolsoLabel = pago
                ? `Liquidación ${pago.numero}: $${pago.montoReembolso.toFixed(2)} (${pago.calificacion} ★ · ${(pago.factor * 100).toFixed(0)}%)`
                : undefined;
              return (
                <EvidenceCard
                  key={ev.id}
                  id={ev.id}
                  mascotaNombre={ev.mascotaNombre}
                  fundacionNombre={ev.fundacionNombre}
                  tipo={ev.tipo}
                  titulo={ev.titulo}
                  descripcion={ev.descripcion}
                  imagenUrl={ev.imagenUrl}
                  fecha={ev.fecha}
                  canRate={tab === "apadrinados"}
                  canReport={tab === "apadrinados" && !enRevision}
                  calificacion={ev.calificacion}
                  comentario={ev.comentario}
                  estado={enRevision ? "en_revision" : ev.estado}
                  onRate={tab === "apadrinados" ? (cal, com) => handleRate(ev, cal, com) : undefined}
                  onReport={tab === "apadrinados" ? () => openReport(ev) : undefined}
                  reembolsoLabel={tab === "apadrinados" ? reembolsoLabel : undefined}
                />
              );
            })}
          </div>
        )}

        {reportEvidencia && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setReportEvidencia(null)} role="dialog" aria-modal="true" aria-label="Reportar inconsistencia">
            <div className="bg-white rounded-[24px] max-w-lg w-full p-8 shadow-xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setReportEvidencia(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1" aria-label="Cerrar">
                <X size={24} />
              </button>
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-[#ee5871]/10 p-2.5 rounded-xl">
                  <AlertTriangle size={22} className="text-[#ee5871]" />
                </div>
                <h2 className="text-[#004955] text-xl font-bold">Reportar inconsistencia</h2>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-5 flex items-center gap-3">
                <img src={reportEvidencia.imagenUrl} alt={reportEvidencia.titulo} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[#004955] font-semibold text-sm truncate">{reportEvidencia.titulo}</p>
                  <p className="text-gray-500 text-xs">{reportEvidencia.mascotaNombre} · {reportEvidencia.fundacionNombre}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Motivo *</label>
                  <div className="flex flex-wrap gap-2">
                    {DENUNCIA_MOTIVOS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMotivo(m)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          motivo === m
                            ? "bg-[#ee5871] text-white"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-[#ee5871]"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Descripción *</label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={4}
                    placeholder="Explica por qué la evidencia no es adecuada..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#07c4e1] outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Archivos / evidencias de respaldo</label>
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-5 cursor-pointer hover:border-[#07c4e1] transition-colors">
                    <Upload size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-500">{archivos.length > 0 ? `${archivos.length} archivo(s) adjunto(s)` : "Adjuntar capturas o archivos (simulado)"}</span>
                    <input type="file" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                  {archivos.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {archivos.map((a) => (
                        <li key={a} className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Upload size={12} className="text-[#07c4e1]" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setReportEvidencia(null)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={enviarDenuncia}
                  disabled={!motivo || !descripcion.trim()}
                  className={`flex-1 py-2.5 rounded-full font-medium transition-colors ${
                    motivo && descripcion.trim()
                      ? "bg-[#ee5871] text-white hover:bg-[#d94a63]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Enviar denuncia
                </button>
              </div>
            </div>
          </div>
        )}

        {ticketModal && (
          <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setTicketModal(null)} role="dialog" aria-modal="true" aria-label="Denuncia recibida">
            <div className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-xl relative text-center" onClick={(e) => e.stopPropagation()}>
              <div className="w-16 h-16 bg-[#004955]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-[#004955]" />
              </div>
              <h2 className="text-[#004955] text-xl font-bold mb-1">Denuncia recibida</h2>
              <p className="text-gray-500 text-sm mb-5">
                Tu reporte fue registrado y el administrador ha sido notificado.
              </p>

              <div className="bg-[#004955] text-white rounded-2xl p-5 mb-5">
                <div className="flex items-center justify-center gap-2 text-[#07c4e1] text-xs font-medium uppercase tracking-wider mb-1">
                  <Ticket size={14} />
                  Nro. de Ticket
                </div>
                <p className="text-3xl font-bold tracking-wider">{ticketModal.ticket}</p>
              </div>

              <div className="text-left space-y-2 text-sm mb-6">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Fundación</span>
                  <span className="text-[#004955] font-medium text-right">{ticketModal.fundacionNombre}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Motivo</span>
                  <span className="text-[#004955] font-medium text-right line-clamp-2">{ticketModal.motivo}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Estado</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#004955]/10 text-[#004955]">Pendiente</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setTicketModal(null)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-full font-medium hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <Link
                  to="/dashboard/denuncias"
                  onClick={() => setTicketModal(null)}
                  className="flex-1 bg-[#00626d] hover:bg-[#004955] text-[#07c4e1] py-2.5 rounded-full font-medium transition-colors text-center"
                >
                  Ver mis denuncias
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
