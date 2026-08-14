import React, { useState } from 'react';
import { Link } from 'react-router';
import { AlertTriangle, CheckCircle2, XCircle, Search, FileText, RotateCcw, Star } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from './DashboardLayout';

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

export function DashboardDenuncias() {
  const { denuncias } = useAdmin();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todas" | "abiertas" | "resueltas" | "rechazadas">("todas");

  const misDenuncias = denuncias.filter((d) => d.usuarioId === user?.id);

  const filtered = misDenuncias.filter((d) => {
    if (filter === "abiertas" && d.estado !== "pendiente" && d.estado !== "investigando") return false;
    if (filter === "resueltas" && d.estado !== "resuelta") return false;
    if (filter === "rechazadas" && d.estado !== "rechazada") return false;
    if (search && !d.motivo.toLowerCase().includes(search.toLowerCase()) && !d.fundacionNombre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const abiertas = misDenuncias.filter((d) => d.estado === "pendiente" || d.estado === "investigando").length;
  const resueltas = misDenuncias.filter((d) => d.estado === "resuelta").length;
  const rechazadas = misDenuncias.filter((d) => d.estado === "rechazada").length;

  const Resolucion = ({ d }: { d: typeof misDenuncias[0] }) => {
    if (d.revertida) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3 flex items-start gap-2">
          <RotateCcw size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-600">Decisión revertida</p>
            <p className="text-xs text-amber-600/80 mt-0.5">La resolución fue corregida y los estados previos fueron restaurados.</p>
          </div>
        </div>
      );
    }
    if (d.estado === "resuelta" && d.resolucionTipo === "sancion_estrellas") {
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mt-3 space-y-1.5">
          <p className="text-xs font-semibold text-emerald-600">Sanción de estrellas aplicada</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700">
            <Star size={12} className="fill-[#ffac13] text-[#ffac13]" />
            Calificación {d.calificacionAnterior} → {d.calificacionNueva} estrellas
          </div>
          <p className="text-xs text-emerald-700">
            Aporte mensual: ${d.montoOriginal?.toFixed(2)} → ${d.montoAjustado?.toFixed(2)} (factor 0.67)
          </p>
          {d.resolucionAdmin && <p className="text-xs text-emerald-600/80 italic">{d.resolucionAdmin}</p>}
        </div>
      );
    }
    if (d.estado === "resuelta" && d.resolucionTipo === "deshabilitacion") {
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mt-3">
          <p className="text-xs font-semibold text-emerald-600">Sanción máxima — Cuenta de fundación deshabilitada</p>
          {d.resolucionAdmin && <p className="text-xs text-emerald-600/80 mt-0.5 italic">{d.resolucionAdmin}</p>}
        </div>
      );
    }
    if (d.estado === "rechazada") {
      return (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mt-3">
          <p className="text-xs text-red-500 leading-relaxed">{d.resolucionAdmin || "La denuncia fue rechazada por falta de mérito."}</p>
        </div>
      );
    }
    return null;
  };

  const stats = [
    { label: "Abiertas", value: abiertas, icon: <AlertTriangle size={20} className="text-[#004955]" />, color: "bg-[#004955]/10" },
    { label: "Resueltas", value: resueltas, icon: <CheckCircle2 size={20} className="text-emerald-500" />, color: "bg-emerald-50" },
    { label: "Rechazadas", value: rechazadas, icon: <XCircle size={20} className="text-red-400" />, color: "bg-red-50" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-[#004955] text-2xl font-semibold">Mis Denuncias</h2>
            <p className="text-[#3e494a] text-sm mt-1">
              Da seguimiento al estado y la resolución de tus reportes sobre evidencias inadecuadas.
            </p>
          </div>
          <Link
            to="/dashboard/evidencias"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#004955] hover:bg-[#00626d] transition-colors"
          >
            <FileText size={16} />
            Nueva denuncia
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-5 flex items-center gap-4 shadow-sm">
              <div className={`${s.color} p-3 rounded-xl`}>{s.icon}</div>
              <div>
                <p className="text-[#3e494a] text-xs font-medium">{s.label}</p>
                <p className="text-[#004955] text-2xl font-bold">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {(["todas", "abiertas", "resueltas", "rechazadas"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === f ? "bg-[#004955] text-white" : "bg-gray-200 text-[#004955] hover:bg-gray-300"
                }`}
              >
                {f === "todas" ? "Todas" : f === "abiertas" ? "Abiertas" : f === "resueltas" ? "Resueltas" : "Rechazadas"}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por motivo o fundación..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#07c4e1] outline-none"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#BDC8CA]/40">
            <AlertTriangle size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">No se encontraron denuncias</p>
            <p className="text-gray-400 text-sm mt-1">
              Cuando reportes una evidencia, aparecerá aquí con su número de ticket.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="bg-[#004955] text-[#07c4e1] px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wider">
                        {d.ticket}
                      </span>
                      <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${estadoBadge[d.estado]}`}>
                        {estadoLabel[d.estado]}
                      </span>
                      {d.revertida && (
                        <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-600">
                          Revertida
                        </span>
                      )}
                    </div>
                    <h3 className="text-[#004955] font-semibold text-sm">{d.fundacionNombre}</h3>
                    <p className="text-[#3e494a] text-sm leading-relaxed mt-1">{d.motivo}</p>
                    <p className="text-gray-400 text-xs mt-2">{d.fecha.split("T")[0]}</p>
                  </div>
                </div>
                <Resolucion d={d} />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
