import React from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { MapPin, Info, Heart, CheckCircle, CheckCircle2, Syringe, Pill, Stethoscope, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useManada } from '../context/ManadaContext';
import { useFoundation } from '../context/FoundationContext';
import { useFavoritos } from '../context/FavoritosContext';
import { MOCK_PETS } from '../lib/mockData';
import type { Pet } from '../lib/types';
import { getMascotaByIdApi } from '../api/mascotas.api';

const FOUNDATION_NAMES: Record<string, string> = {
  "fund-01": "Huellitas Felices",
  "fund-02": "Refugio Almas Peludas",
  "fund-03": "Amigos de Cuatro Patas",
};

const STATUS_LABELS: Record<string, string> = {
  NO_APADRINADO: "Disponible",
  REQUIERE_PADRINOS: "Disponible",
  APADRINADO: "Apadrinado",
  EN_PROCESO: "En Proceso",
  EN_TRATAMIENTO: "En Tratamiento",
  ADOPTADO: "Adoptado",
  FALLECIDO: "Fallecido",
  INACTIVO: "Inactivo",
};

export function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToManada, mascotas: manadaMascotas } = useManada();
  const foundationContext = useFoundation();
  const { isFavorito, toggleFavorito } = useFavoritos();

  const [remotePet, setRemotePet] = React.useState<Pet | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [hasFetched, setHasFetched] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);

    getMascotaByIdApi(id)
      .then((data) => {
        if (!isMounted) return;
        setRemotePet(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn("No se pudo obtener la mascota vía API, verificando respaldo:", err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
          setHasFetched(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Combine shelter context with mock data fallback
  const fallbackPet = React.useMemo(() => {
    if (foundationContext?.mascotas && foundationContext.mascotas.length > 0) {
      const match = foundationContext.mascotas.find((m) => String(m.id) === String(id));
      if (match) {
        return {
          ...match,
          fundacionNombre: match.fundacionNombre || FOUNDATION_NAMES[match.fundacionId] || "Fundación Aliada",
        } as Pet;
      }
    }
    return MOCK_PETS.find((p) => String(p.id) === String(id)) || null;
  }, [foundationContext?.mascotas, id]);

  const pet = remotePet || fallbackPet;

  const isFav = pet ? isFavorito(`pet-${pet.id}`) : false;

  const handleFavoriteClick = () => {
    if (!pet) return;
    toggleFavorito(`pet-${pet.id}`);
    if (!isFav) {
      toast.success(`${pet.nombre} fue guardado en tus favoritos`);
    } else {
      toast.info(`${pet.nombre} fue retirado de favoritos`);
    }
  };

  if (isLoading && !pet) {
    return (
      <div className="bg-white min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 border-4 border-[#00626d] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-[#004955] mb-1">Cargando información</h2>
        <p className="text-gray-500 text-sm">Obteniendo detalles de la mascota...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="bg-white min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <Info size={48} className="text-[#ee5871] mb-4" />
        <h1 className="text-2xl font-bold text-[#004955] mb-2">Mascota no encontrada</h1>
        <p className="text-gray-600 max-w-md mb-6 text-sm">
          La mascota solicitada no existe o no se encuentra disponible actualmente.
        </p>
        <Link
          to="/mascotas"
          className="inline-flex items-center gap-2 bg-[#00626d] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#004955] transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al catálogo de mascotas
        </Link>
      </div>
    );
  }

  const isInManada = manadaMascotas.some((a) => a.animalId === String(pet.id));
  const statusDisplay = (pet.status && STATUS_LABELS[pet.status]) || pet.status || "Disponible";

  const handleApadrinar = () => {
    if (isInManada) {
      navigate('/mi-manada/configurar');
      return;
    }
    addToManada({
      id: `manada-animal-${pet.id}`,
      manadaId: "temp",
      animalId: String(pet.id),
      montoMensual: 25.00,
      nombre: pet.nombre,
      refugioNombre: pet.fundacionNombre || "",
      etiqueta: pet.status === "EN_TRATAMIENTO" ? "ATENCIÓN" : "SALUDABLE",
      imagenUrl: pet.imagen,
    });

    toast.success(`¡${pet.nombre} fue agregado a tu Manada!`, {
      description: "Puedes revisar y configurar tu aporte en Mi Manada.",
      action: {
        label: "Ver Manada",
        onClick: () => navigate("/mi-manada/configurar"),
      },
    });
  };

  return (
    <div className="bg-white min-h-screen">
      <main className="pt-8">
        <section className="px-4 md:px-12 lg:px-[96px] mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto lg:h-[600px]">
            <div className="lg:col-span-2 relative rounded-[24px] overflow-hidden group shadow-lg min-h-[350px]">
              <ImageWithFallback src={pet.imagen} alt={pet.nombre} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute top-6 left-6 flex flex-wrap gap-3">
                <span className="bg-[#00626d]/90 backdrop-blur-md text-white px-4 py-1 rounded-full text-sm font-semibold tracking-wide">{statusDisplay}</span>
                {pet.ubicacion && (
                  <span className="bg-white/90 backdrop-blur-md text-[#3e494a] px-4 py-1 rounded-full text-sm font-semibold tracking-wide">Encontrado en {pet.ubicacion}</span>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#BDC8CA]/30 rounded-[24px] p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="text-[#1b1c1c] text-2xl sm:text-3xl md:text-[40px] font-semibold tracking-[1.6px]">{pet.nombre}</h1>
                  <button
                    type="button"
                    onClick={handleFavoriteClick}
                    className="p-2.5 rounded-full border border-gray-200 hover:border-[#ee5871] hover:bg-red-50 text-gray-500 transition-all cursor-pointer shadow-2xs"
                    aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                  >
                    <Heart
                      size={22}
                      className={isFav ? "fill-[#ee5871] text-[#ee5871]" : "hover:text-[#ee5871]"}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[#004955] mb-8">
                  <MapPin size={18} className="text-[#00626D]" />
                  <span className="text-sm font-semibold tracking-wide">{pet.fundacionNombre}</span>
                </div>

                <div className="grid grid-cols-2 gap-y-8">
                  <div>
                    <p className="text-[#6e797b] text-[12px] font-medium tracking-widest uppercase mb-1">Edad</p>
                    <p className="text-[#1b1c1c] text-[24px] font-bold">{pet.edad} {pet.edad === 1 ? "año" : "años"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#6e797b] text-[12px] font-medium tracking-widest uppercase mb-1">Raza</p>
                    <p className="text-[#1b1c1c] text-[24px] font-bold">{pet.raza || "N/D"}</p>
                  </div>
                  <div>
                    <p className="text-[#6e797b] text-[12px] font-medium tracking-widest uppercase mb-1">Sexo</p>
                    <p className="text-[#1b1c1c] text-[24px] font-bold">{pet.sexo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#6e797b] text-[12px] font-medium tracking-widest uppercase mb-1">Peso</p>
                    <p className="text-[#1b1c1c] text-[24px] font-bold">{pet.peso} kg</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  onClick={handleApadrinar}
                  className="w-full bg-[#00626d] text-[#07c4e1] py-4 rounded-full text-[20px] font-medium tracking-wide shadow-md hover:bg-[#004955] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Heart size={20} />
                  {isInManada ? "Ver en Mi Manada" : `Apadrinar ${pet.nombre}`}
                </button>
                <p className="text-xs text-center text-gray-500">
                  {isInManada ? "Esta mascota ya está en tu manada." : `Agrega a ${pet.nombre} a tu manada por defecto para su cuidado integral.`}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 md:px-12 lg:px-[96px] py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <div className="mb-12">
                <div className="flex items-center gap-6 mb-8">
                   <div className="w-1 bg-[#00626d] h-10 rounded-full" />
                    <h2 className="text-[#1b1c1c] text-xl sm:text-2xl md:text-[32px] font-bold tracking-tight">La historia de {pet.nombre}</h2>
                </div>
                <div className="text-[#3e494a] text-[18px] leading-[1.6] space-y-6 max-w-[800px]">
                  {(pet.historia || pet.descripcion || "").split('. ').reduce((acc: string[], sentence, i) => {
                    if (i % 2 === 0) acc.push(sentence);
                    else acc[acc.length - 1] += '. ' + sentence;
                    return acc;
                  }, []).map((paragraph, idx) => (
                    <p key={idx}>{paragraph}.</p>
                  ))}
                </div>
              </div>

              <div className="mt-16">
                <h3 className="text-[#1b1c1c] text-lg sm:text-[24px] font-bold tracking-wide mb-8">Estado de Salud</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-[#BDC8CA]/30 p-6 rounded-[12px] flex gap-4">
                    <div className="bg-[#004955]/10 p-3 rounded-lg flex-shrink-0">
                      <Syringe size={24} className="text-[#004955]" />
                    </div>
                    <div>
                      <h4 className="text-[#1b1c1c] text-sm font-bold tracking-wide mb-1">Vacunación</h4>
                      <p className="text-[#3e494a] text-sm leading-relaxed">{pet.vacunacion ? "Vacunado al día" : "Pendiente de vacunación"}</p>
                    </div>
                  </div>
                  <div className="bg-white border border-[#BDC8CA]/30 p-6 rounded-[12px] flex gap-4">
                    <div className="bg-[#004955]/10 p-3 rounded-lg flex-shrink-0">
                      <Stethoscope size={24} className="text-[#004955]" />
                    </div>
                    <div>
                      <h4 className="text-[#1b1c1c] text-sm font-bold tracking-wide mb-1">Esterilización</h4>
                      <p className="text-[#3e494a] text-sm leading-relaxed">{pet.esterilizacion ? "Esterilizado" : "No esterilizado"}</p>
                    </div>
                  </div>
                  <div className="bg-white border border-[#BDC8CA]/30 p-6 rounded-[12px] flex gap-4">
                    <div className="bg-[#004955]/10 p-3 rounded-lg flex-shrink-0">
                      <Pill size={24} className="text-[#004955]" />
                    </div>
                    <div>
                      <h4 className="text-[#1b1c1c] text-sm font-bold tracking-wide mb-1">Desparasitación</h4>
                      <p className="text-[#3e494a] text-sm leading-relaxed">{pet.desparasitacion ? "Desparasitado al día" : "Pendiente"}</p>
                    </div>
                  </div>
                  {pet.enfermedades && (
                    <div className="bg-white border border-[#BDC8CA]/30 p-6 rounded-[12px] flex gap-4">
                      <div className="bg-[#004955]/10 p-3 rounded-lg flex-shrink-0">
                        <Info size={24} className="text-[#004955]" />
                      </div>
                      <div>
                        <h4 className="text-[#1b1c1c] text-sm font-bold tracking-wide mb-1">Enfermedades</h4>
                        <p className="text-[#3e494a] text-sm leading-relaxed">{pet.enfermedades}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#004955] text-white p-8 rounded-[24px] shadow-sm space-y-4">
                <h3 className="text-2xl font-semibold text-[#07c4e1]">¿Por qué apadrinar?</h3>
                <p className="text-sm leading-relaxed text-gray-200">
                  El apadrinamiento permite cubrir los costos mensuales de alimento, salud y estancia de {pet.nombre} en la fundación sin tener que adoptarlo formalmente de inmediato.
                </p>
                <div className="pt-4 border-t border-white/20 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#07c4e1]" />
                    <span>Reportes mensuales con fotos y vídeos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#07c4e1]" />
                    <span>Visitas programadas al refugio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
