import React, { useState } from "react";
import { Star, AlertTriangle, MessageSquare, BadgeCheck } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface EvidenceCardProps {
  id: string;
  mascotaNombre: string;
  fundacionNombre: string;
  tipo: "foto" | "video";
  titulo: string;
  descripcion: string;
  imagenUrl: any;
  fecha: string;
  canRate?: boolean;
  canReport?: boolean;
  calificacion?: number | null;
  comentario?: string | null;
  estado?: "publicada" | "en_revision";
  onRate?: (calificacion: number, comentario: string) => void;
  onReport?: () => void;
  reembolsoLabel?: string;
}

export function EvidenceCard({
  id,
  mascotaNombre,
  fundacionNombre,
  tipo,
  titulo,
  descripcion,
  imagenUrl,
  fecha,
  canRate = true,
  canReport = true,
  calificacion: initialCalificacion,
  comentario: initialComentario,
  estado,
  onRate,
  onReport,
  reembolsoLabel,
}: EvidenceCardProps) {
  const [calificacion, setCalificacion] = useState(initialCalificacion || 0);
  const [comentario, setComentario] = useState(initialComentario || "");
  const [hoverCalificacion, setHoverCalificacion] = useState(0);

  const reported = estado === "en_revision" || !canReport;

  const handleRate = (value: number) => {
    setCalificacion(value);
    onRate?.(value, comentario);
  };

  const handleComment = (value: string) => {
    setComentario(value);
  };

  return (
    <div className="bg-white border border-[#BDC8CA]/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <ImageWithFallback src={imagenUrl} alt={titulo} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tipo === "video" ? "bg-[#004955]/10 text-[#004955]" : "bg-gray-100 text-gray-600"}`}>
            {tipo === "video" ? "Video" : "Foto"}
          </span>
          <span className="bg-white/90 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
            {fecha}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[#004955] font-semibold text-lg">{titulo}</h3>
            <p className="text-gray-500 text-xs">{mascotaNombre} · {fundacionNombre}</p>
          </div>
        </div>

        <p className="text-[#3e494a] text-sm leading-relaxed">{descripcion}</p>

        <div className="border-t border-gray-100 pt-3 space-y-3">
          {canRate ? (
            <>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverCalificacion(star)}
                    onMouseLeave={() => setHoverCalificacion(0)}
                    onClick={() => handleRate(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={22}
                      className={`transition-colors ${
                        star <= (hoverCalificacion || calificacion)
                          ? "fill-[#ffac13] text-[#ffac13]"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                {calificacion > 0 && <span className="text-xs text-gray-500 ml-2">{calificacion}/5</span>}
              </div>

              <div className="flex items-start gap-2">
                <MessageSquare size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                <textarea
                  value={comentario}
                  onChange={(e) => handleComment(e.target.value)}
                  placeholder="Comentario opcional..."
                  rows={2}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#07c4e1] outline-none resize-none"
                />
              </div>

              {reembolsoLabel && (
                <p className="text-xs text-[#00626d] font-medium flex items-center gap-1 bg-[#07c4e1]/5 border border-[#07c4e1]/15 rounded-lg px-3 py-2">
                  <BadgeCheck size={14} />
                  {reembolsoLabel}
                </p>
              )}

              {reported ? (
                <p className="text-xs text-[#ffac13] font-medium flex items-center gap-1">
                  <AlertTriangle size={14} />
                  Reporte enviado — En revisión
                </p>
              ) : (
                <button
                  onClick={onReport}
                  className="text-xs text-gray-400 hover:text-[#ee5871] font-medium flex items-center gap-1 transition-colors"
                >
                  <AlertTriangle size={14} />
                  Reportar inconsistencia
                </button>
              )}
            </>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Solo los padrinos de esta mascota pueden calificar y reportar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
