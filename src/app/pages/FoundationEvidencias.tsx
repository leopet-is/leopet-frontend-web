import React, { useRef, useState } from "react";
import { Plus, Search, Camera, Star, X, Image, ChevronDown, Upload } from "lucide-react";
import { useFoundation } from "../context/FoundationContext";
import { useAuth } from "../context/AuthContext";
import { FoundationLayout } from "./FoundationLayout";
import { uploadFileApi } from "../api/archivos.api";
import { crearActualizacionApi } from "../api/actualizaciones.api";

const INPUT_CLASS = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#07c4e1]/50 focus:border-[#07c4e1] transition-colors";

export function FoundationEvidencias() {
  const {
    mascotas,
    evidencias,
    refreshEvidencias,
    isLoadingEvidencias,
    errorEvidencias,
  } = useFoundation();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [mascotaId, setMascotaId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estadoSalud, setEstadoSalud] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const misEvidencias = evidencias.filter((evidencia) => {
    const query = search.trim().toLowerCase();
    return !query || evidencia.titulo.toLowerCase().includes(query)
      || evidencia.mascotaNombre.toLowerCase().includes(query);
  });

  const resetForm = () => {
    setMascotaId("");
    setTitulo("");
    setDescripcion("");
    setEstadoSalud("");
    setArchivo(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePublish = async () => {
    const fundacionId = user?.rol === "fundacion" ? user.fundacionId : null;
    const mascota = mascotas.find((item) => String(item.id) === mascotaId);
    if (!fundacionId || !mascota) {
      setError("Selecciona una mascota de esta fundación.");
      return;
    }
    if (!titulo.trim() || !descripcion.trim() || !estadoSalud.trim() || !archivo) {
      setError("Completa todos los campos y selecciona una imagen.");
      return;
    }
    if (estadoSalud.trim().length > 50) {
      setError("El estado de salud no puede superar 50 caracteres.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const imagen = await uploadFileApi(archivo);
      await crearActualizacionApi({
        mascotaId: mascota.id,
        fundacionId,
        titulo,
        descripcion,
        estadoSalud,
        imagen,
      });
      await refreshEvidencias();
      setShowModal(false);
      resetForm();
      setToast("Evidencia publicada y notificación enviada a sus padrinos.");
      setTimeout(() => setToast(""), 3500);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo publicar la evidencia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FoundationLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título o mascota..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#07c4e1]/50 focus:border-[#07c4e1] transition-colors"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#07c4e1] text-[#004955] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#06aec8] transition-colors"
          >
            <Plus size={18} />
            Nueva Evidencia
          </button>
        </div>

        {errorEvidencias && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <p>No se pudieron cargar las evidencias: {errorEvidencias}</p>
            <button type="button" onClick={() => void refreshEvidencias()} className="mt-2 font-semibold underline">
              Reintentar
            </button>
          </div>
        )}
        {isLoadingEvidencias && <p className="py-8 text-center text-sm text-gray-500">Cargando evidencias...</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {!errorEvidencias && misEvidencias.map((evidencia) => (
            <div key={evidencia.id} className="bg-white rounded-2xl border border-[#BDC8CA]/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-44 overflow-hidden relative">
                {evidencia.tipo === "video" ? (
                  <video src={evidencia.imagenUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={evidencia.imagenUrl} alt={evidencia.titulo} className="w-full h-full object-cover" />
                )}
                <span className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                  <Image size={12} />
                  {evidencia.tipo === "foto" ? "Foto" : "Video"}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-[#004955] font-bold text-base">{evidencia.titulo}</h3>
                <p className="text-gray-500 text-sm">{evidencia.mascotaNombre} · {evidencia.fecha}</p>
                <p className="text-gray-600 text-sm line-clamp-2">{evidencia.descripcion}</p>
                <p className="text-gray-500 text-xs">Estado de salud: {evidencia.estadoSalud}</p>
                {evidencia.calificacionPromedio != null && (
                  <div className="flex items-center gap-1 pt-1">
                    <Star size={14} className="text-[#ffac13] fill-[#ffac13]" />
                    <span className="text-sm font-medium text-[#004955]">{evidencia.calificacionPromedio}</span>
                    <span className="text-gray-400 text-xs">/ 5</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {!isLoadingEvidencias && !errorEvidencias && misEvidencias.length === 0 && (
          <div className="text-center py-12">
            <Camera size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay evidencias para mostrar</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => !isSubmitting && setShowModal(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex-shrink-0 border-b border-gray-100 px-5 sm:px-6 py-4 flex items-center justify-between">
              <h2 className="text-[#004955] text-lg sm:text-xl font-bold">Nueva Evidencia</h2>
              <button onClick={() => setShowModal(false)} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mascota *</label>
                <select value={mascotaId} onChange={(event) => setMascotaId(event.target.value)} className={`${INPUT_CLASS} appearance-none pr-10`}>
                  <option value="">Seleccionar mascota</option>
                  {mascotas.filter((mascota) => mascota.visible !== false).map((mascota) => (
                    <option key={mascota.id} value={mascota.id}>{mascota.nombre}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-[38px] text-gray-400 pointer-events-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Título *</label>
                <input value={titulo} onChange={(event) => setTitulo(event.target.value)} className={INPUT_CLASS} maxLength={100} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Descripción *</label>
                <textarea value={descripcion} onChange={(event) => setDescripcion(event.target.value)} rows={3} className={`${INPUT_CLASS} resize-none`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Estado de salud *</label>
                <input value={estadoSalud} onChange={(event) => setEstadoSalud(event.target.value)} className={INPUT_CLASS} maxLength={50} />
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(event) => setArchivo(event.target.files?.[0] ?? null)}
                  className="hidden"
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50">
                  <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600">{archivo?.name ?? "Seleccionar imagen real"}</span>
                </button>
              </div>
              {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
            </div>
            <div className="flex-shrink-0 border-t border-gray-100 px-5 sm:px-6 py-4 flex gap-3">
              <button onClick={() => setShowModal(false)} disabled={isSubmitting} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => void handlePublish()} disabled={isSubmitting || mascotas.length === 0} className="flex-1 px-4 py-2.5 bg-[#07c4e1] text-[#004955] rounded-xl text-sm font-semibold hover:bg-[#06aec8] disabled:opacity-50">
                {isSubmitting ? "Publicando..." : "Publicar Evidencia"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#004955] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </FoundationLayout>
  );
}
