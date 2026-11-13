import React from 'react';
import { Link } from 'react-router';
import { PawPrint, Camera, Users, ArrowRight, DollarSign, Wallet } from 'lucide-react';
import { useFoundation } from '../context/FoundationContext';
import { useAuth } from '../context/AuthContext';
import { usePagos } from '../context/PagoContext';
import { FoundationLayout } from './FoundationLayout';

export function FoundationDashboard() {
  const {
    mascotas,
    evidencias,
    padrinos,
    isLoadingMascotas,
    isLoadingEvidencias,
    isLoadingPadrinos,
    errorMascotas,
    errorEvidencias,
    errorPadrinos,
  } = useFoundation();
  const { user } = useAuth();
  const { pagos } = usePagos();

  const fundacionId = user?.fundacionId ? String(user.fundacionId) : "";

  const totalMascotas = mascotas.length;
  const totalEvidencias = evidencias.length;
  const padrinosActivos = new Set(padrinos.filter((p) => p.estado === "activo").map((p) => p.manadaId)).size;
  const aporteMensual = padrinos
    .filter((p) => p.estado === "activo")
    .reduce((sum, p) => sum + p.montoMensual, 0);

  const misPagos = pagos.filter((p) => p.fundacionId === fundacionId);
  const montoPendiente = misPagos
    .filter((p) => p.estado === "pendiente_desembolso" || p.estado === "apelada" || p.estado === "mediada")
    .reduce((sum, p) => sum + p.montoReembolso, 0);

  const stats = [
    { label: "Mascotas", value: isLoadingMascotas ? "…" : errorMascotas ? "—" : totalMascotas, icon: <PawPrint size={24} className="text-[#004955]" />, color: "bg-[#004955]/10" },
    { label: "Evidencias Publicadas", value: isLoadingEvidencias ? "…" : errorEvidencias ? "—" : totalEvidencias, icon: <Camera size={24} className="text-[#004955]" />, color: "bg-[#004955]/10" },
    { label: "Padrinos Activos", value: isLoadingPadrinos ? "…" : errorPadrinos ? "—" : padrinosActivos, icon: <Users size={24} className="text-[#004955]" />, color: "bg-[#004955]/10" },
    { label: "Aporte Mensual", value: isLoadingPadrinos ? "…" : errorPadrinos ? "—" : `$${aporteMensual}`, icon: <DollarSign size={24} className="text-[#004955]" />, color: "bg-[#004955]/10" },
  ];

  return (
    <FoundationLayout>
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-5 flex items-center gap-4 shadow-sm">
              <div className={`${stat.color} p-3 rounded-xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[#3e494a] text-xs font-medium">{stat.label}</p>
                <p className="text-[#004955] text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-6 shadow-sm">
            <h3 className="text-[#004955] text-lg font-semibold mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Link to="/fundacion/mascotas" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="bg-[#004955]/10 p-2 rounded-lg"><PawPrint size={18} className="text-[#004955]" /></div>
                <div className="flex-1">
                  <p className="text-[#004955] font-medium text-sm">Gestionar Mascotas</p>
                  <p className="text-gray-500 text-xs">{totalMascotas} mascota{totalMascotas !== 1 ? "s" : ""} bajo cuidado</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-[#07c4e1] transition-colors" />
              </Link>
              <Link to="/fundacion/evidencias" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="bg-[#004955]/10 p-2 rounded-lg"><Camera size={18} className="text-[#004955]" /></div>
                <div className="flex-1">
                  <p className="text-[#004955] font-medium text-sm">Publicar Evidencia</p>
                  <p className="text-gray-500 text-xs">{totalEvidencias} evidencia{totalEvidencias !== 1 ? "s" : ""} publicada{totalEvidencias !== 1 ? "s" : ""}</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-[#07c4e1] transition-colors" />
              </Link>
              <Link to="/fundacion/pagos" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="bg-[#004955]/10 p-2 rounded-lg"><Wallet size={18} className="text-[#004955]" /></div>
                <div className="flex-1">
                  <p className="text-[#004955] font-medium text-sm">Pagos y Desembolsos</p>
                  <p className={`text-xs font-medium ${montoPendiente > 0 ? "text-amber-600" : "text-gray-500"}`}>
                    {montoPendiente > 0 ? `$${montoPendiente.toFixed(2)} pendiente de desembolso` : "Sin montos pendientes"}
                  </p>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-[#07c4e1] transition-colors" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-6 shadow-sm">
            <h3 className="text-[#004955] text-lg font-semibold mb-4">Resumen de Actividad</h3>
            <div className="space-y-3">
              {evidencias.slice(0, 4).map((ev) => (
                <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-[#004955] font-medium text-sm truncate">{ev.titulo}</p>
                    <p className="text-gray-500 text-xs">{ev.mascotaNombre} · {ev.fecha}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 ml-3 flex-shrink-0">
                    Publicada
                  </span>
                </div>
              ))}
              {evidencias.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No hay evidencias publicadas</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </FoundationLayout>
  );
}
