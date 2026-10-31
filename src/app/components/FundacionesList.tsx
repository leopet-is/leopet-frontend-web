import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { motion } from "motion/react";
import { MapPin, PawPrint, Building2, Heart, ShieldBan } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useFavoritos } from '../context/FavoritosContext';
import { getFundacionesApi, type FundacionFrontend } from '../api/fundaciones.api';

export function FundacionesList() {
  const { isFavorito, toggleFavorito } = useFavoritos();
  const [fundaciones, setFundaciones] = useState<FundacionFrontend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "favoritas">("todas");

  const loadFundaciones = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getFundacionesApi(100, 1);
      setFundaciones(data);
    } catch (err: unknown) {
      console.error("Error al cargar fundaciones:", err);
      setError((err as Error).message || "Error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFundaciones();
  }, [loadFundaciones]);

  const fundacionesFiltradas = filtro === "favoritas"
    ? fundaciones.filter((f) => isFavorito(f.id))
    : fundaciones;

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="py-10 px-4 md:px-12 lg:px-[96px] bg-gray-50 border-b border-[#07c4e1]/20">
        <div className="max-w-[1248px] mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Building2 size={32} className="text-[#004955]" />
            <h1 className="text-[#004955] text-2xl sm:text-3xl md:text-[40px] font-bold">Fundaciones Aliadas</h1>
          </div>
          <p className="text-[#3e494a] text-sm sm:text-[18px] ml-0 sm:ml-12">
            Conoce las organizaciones que cuidan de nuestras mascotas apadrinadas.
          </p>
        </div>
      </div>

      <div className="max-w-[1248px] mx-auto px-4 md:px-[96px] mt-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setFiltro("todas")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filtro === "todas"
                ? "bg-[#004955] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro("favoritas")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              filtro === "favoritas"
                ? "bg-[#ee5871] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Heart size={14} className={filtro === "favoritas" ? "fill-white" : ""} />
            Favoritas
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#07c4e1] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[#004955] font-semibold text-base">Cargando fundaciones...</p>
          </div>
        ) : error && fundaciones.length === 0 ? (
          <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-200 p-8">
            <p className="text-[#ee5871] font-semibold mb-2">No se pudieron cargar las fundaciones</p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={loadFundaciones}
              className="bg-[#00626d] text-white px-5 py-2 rounded-full text-xs font-semibold hover:bg-[#004955] transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : fundacionesFiltradas.length === 0 && filtro === "favoritas" ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#BDC8CA]/40">
            <Heart size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">Aún no tienes fundaciones favoritas</p>
            <p className="text-gray-400 text-sm mt-1">Marca una fundación con el corazón para guardarla aquí.</p>
          </div>
        ) : fundacionesFiltradas.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">No se encontraron fundaciones registradas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fundacionesFiltradas.map((fundacion, i) => (
              <motion.div
                key={fundacion.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="bg-white rounded-[24px] border border-[#b1d0d5] overflow-hidden flex flex-col h-full group transition-shadow hover:shadow-lg relative">
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorito(fundacion.id); }}
                    className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                      isFavorito(fundacion.id)
                        ? "bg-[#ee5871] text-white"
                        : "bg-white/80 text-gray-400 hover:bg-white hover:text-[#ee5871]"
                    }`}
                    aria-label={isFavorito(fundacion.id) ? "Quitar de favoritas" : "Marcar como favorita"}
                  >
                    <Heart size={16} className={isFavorito(fundacion.id) ? "fill-white" : ""} />
                  </button>

                  {fundacion.estado === "Deshabilitada" && (
                    <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ee5871] text-white text-xs font-semibold">
                      <ShieldBan size={14} />
                      Cuenta deshabilitada
                    </span>
                  )}

                  {fundacion.estado === "Deshabilitada" ? (
                    <div className="block opacity-70 pointer-events-none">
                      <div className="relative h-[220px] overflow-hidden">
                        <ImageWithFallback
                          src={fundacion.portadaUrl}
                          alt={fundacion.nombre}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white flex-shrink-0 bg-white">
                              <ImageWithFallback
                                src={fundacion.logoUrl}
                                alt={`Logo ${fundacion.nombre}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="text-white text-xl font-bold leading-tight">{fundacion.nombre}</h3>
                              <div className="flex items-center gap-1 text-white/80 text-xs">
                                <MapPin size={12} />
                                {fundacion.ubicacion}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col gap-4 flex-grow">
                        <p className="text-[#3e494a] text-sm leading-relaxed line-clamp-2">
                          {fundacion.descripcionCorta}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                          <div className="flex items-center gap-2 text-[#004955]">
                            <PawPrint size={16} />
                            <span className="text-sm font-semibold">
                              {fundacion.cantidadMascotasCuidado} mascotas
                            </span>
                          </div>
                          <span className="text-[#ee5871] text-sm font-semibold">
                            Bloqueada
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                  <Link
                    to={`/fundaciones/${fundacion.id}`}
                    className="block"
                  >
                    <div className="relative h-[220px] overflow-hidden">
                      <ImageWithFallback
                        src={fundacion.portadaUrl}
                        alt={fundacion.nombre}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white flex-shrink-0 bg-white">
                            <ImageWithFallback
                              src={fundacion.logoUrl}
                              alt={`Logo ${fundacion.nombre}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-white text-xl font-bold leading-tight">{fundacion.nombre}</h3>
                            <div className="flex items-center gap-1 text-white/80 text-xs">
                              <MapPin size={12} />
                              {fundacion.ubicacion}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col gap-4 flex-grow">
                      <p className="text-[#3e494a] text-sm leading-relaxed line-clamp-2">
                        {fundacion.descripcionCorta}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                        <div className="flex items-center gap-2 text-[#004955]">
                          <PawPrint size={16} />
                          <span className="text-sm font-semibold">
                            {fundacion.cantidadMascotasCuidado} mascotas
                          </span>
                        </div>
                        <span className="text-[#07c4e1] text-sm font-semibold group-hover:underline">
                          Ver detalle →
                        </span>
                      </div>
                    </div>
                  </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
