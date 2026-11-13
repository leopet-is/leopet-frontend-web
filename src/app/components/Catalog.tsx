import React, { useState, useMemo } from 'react';
import { motion } from "motion/react";
<<<<<<< Updated upstream
import { Search, ChevronLeft, ChevronRight, CheckCircle2, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
=======
import { ChevronLeft, ChevronRight, CheckCircle2, Heart, RotateCcw, Zap, CheckSquare, Square, Check, Layers } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
>>>>>>> Stashed changes
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useManada } from '../context/ManadaContext';
import { MOCK_PETS } from '../lib/mockData';
import { rankPets, isHighPriority, type ScoredPet } from '../lib/recommendation';

const PAGE_SIZE = 6;

type SortMode = "recomendado" | "recientes" | "nombre";

<<<<<<< Updated upstream
function PetCard({ pet, onApadrinar }: { pet: ScoredPet; onApadrinar: (pet: ScoredPet) => void }) {
=======
function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function PetCard({
  pet,
  isInManada,
  onApadrinar,
  isMultiSelectMode = false,
  isSelected = false,
  onToggleSelect,
}: {
  pet: ScoredPet;
  isInManada: boolean;
  onApadrinar: (pet: ScoredPet) => void;
  isMultiSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (pet: ScoredPet) => void;
}) {
>>>>>>> Stashed changes
  const urgent = isHighPriority(pet.score);

  const handleCardClick = () => {
    if (isMultiSelectMode && !isInManada && onToggleSelect) {
      onToggleSelect(pet);
    }
  };

  return (
<<<<<<< Updated upstream
    <div className={`bg-white rounded-[24px] overflow-hidden flex flex-col h-full group transition-shadow hover:shadow-lg border ${
      urgent ? "border-[#004955]/30" : "border-[#b1d0d5]"
    }`}>
      <Link to={`/mascota/${pet.id}`} className="relative h-[240px] overflow-hidden block">
        <ImageWithFallback src={pet.imagen} alt={pet.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-4 left-4 flex items-center gap-2">
=======
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-[24px] overflow-hidden flex flex-col h-full group transition-all duration-200 border ${
        isSelected
          ? "border-[#07c4e1] ring-2 ring-[#07c4e1]/50 shadow-lg bg-[#07c4e1]/[0.02]"
          : urgent
          ? "border-[#004955]/30 hover:shadow-lg"
          : "border-[#b1d0d5] hover:shadow-lg"
      } ${isMultiSelectMode && !isInManada ? "cursor-pointer" : ""}`}
    >
      <div className="relative h-[240px] overflow-hidden block">
        <Link
          to={isMultiSelectMode ? "#" : `/mascota/${pet.id}`}
          onClick={(e) => {
            if (isMultiSelectMode) {
              e.preventDefault();
              if (!isInManada && onToggleSelect) onToggleSelect(pet);
            }
          }}
          className="block w-full h-full"
        >
          <ImageWithFallback src={pet.imagen} alt={pet.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </Link>

        {/* Multi-Select Checkbox or Favorite Bookmark Button */}
        {isMultiSelectMode ? (
          isInManada ? (
            <span className="absolute top-4 right-4 bg-emerald-700/95 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-md z-10">
              <Check size={13} className="stroke-[3]" />
              En tu Manada
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSelect?.(pet);
              }}
              className={`absolute top-4 right-4 p-2 rounded-xl transition-all shadow-md z-10 flex items-center justify-center cursor-pointer ${
                isSelected
                  ? "bg-[#07c4e1] text-[#004955] ring-2 ring-[#004955] scale-105"
                  : "bg-white/95 text-gray-500 hover:text-[#004955] hover:bg-white"
              }`}
              aria-label={isSelected ? `Deseleccionar a ${pet.nombre}` : `Seleccionar a ${pet.nombre}`}
            >
              {isSelected ? <CheckSquare size={20} className="stroke-[2.5]" /> : <Square size={20} />}
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-[#004955] p-2 rounded-full transition-transform active:scale-95 shadow-md z-10 cursor-pointer"
            aria-label={isFav ? `Quitar a ${pet.nombre} de favoritos` : `Guardar a ${pet.nombre} en favoritos`}
          >
            <Heart
              size={18}
              className={isFav ? "fill-[#ee5871] text-[#ee5871]" : "text-gray-500 hover:text-[#ee5871]"}
            />
          </button>
        )}

        {/* Age and Urgency Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap pointer-events-none">
>>>>>>> Stashed changes
          <span className="bg-white/90 px-4 py-1 rounded-full text-[#66949b] text-sm font-medium">
            {pet.edad} {pet.edad === 1 ? "año" : "años"}
          </span>
        </div>
        {urgent && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#004955]" />
        )}
      </Link>
      <div className="p-8 flex flex-col gap-3 flex-grow">
        <div>
<<<<<<< Updated upstream
          <h3 className="text-[#004955] text-[28px] font-bold leading-tight">{pet.nombre}</h3>
=======
          <Link
            to={isMultiSelectMode ? "#" : `/mascota/${pet.id}`}
            onClick={(e) => {
              if (isMultiSelectMode) {
                e.preventDefault();
                if (!isInManada && onToggleSelect) onToggleSelect(pet);
              }
            }}
            className="hover:text-[#07c4e1] transition-colors block"
          >
            <h3 className="text-[#004955] text-[28px] font-bold leading-tight group-hover:text-[#00626d] transition-colors">{pet.nombre}</h3>
          </Link>
>>>>>>> Stashed changes
          <p className="text-[#66949b] text-[18px] font-light">{pet.raza}</p>
        </div>
        <p className="text-[#3e494a] text-sm leading-relaxed line-clamp-2">{pet.descripcion}</p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <span className="text-gray-500 text-sm">{pet.fundacionNombre}</span>
          {urgent && (
            <span className="text-[#004955] text-xs font-semibold">Necesita apoyo</span>
          )}
        </div>
<<<<<<< Updated upstream
        <button
          onClick={(e) => { e.preventDefault(); onApadrinar(pet); }}
          className="w-full bg-[#00626d] text-[#07c4e1] py-3 rounded-full text-[16px] font-medium tracking-wide hover:bg-[#004955] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Heart size={18} />
          Apadrinar
        </button>
=======

        {/* Action Button: in Multi-Select Mode vs Normal Mode */}
        {isMultiSelectMode ? (
          isInManada ? (
            <div className="w-full py-3 mt-2 rounded-full text-[15px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              Ya en tu Manada
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSelect?.(pet);
              }}
              className={`w-full py-3 mt-2 rounded-full text-[15px] font-medium tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSelected
                  ? "bg-[#07c4e1] text-[#004955] font-bold shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200 text-[#004955]"
              }`}
            >
              {isSelected ? (
                <>
                  <CheckSquare size={18} className="text-[#004955]" />
                  Seleccionada ✓
                </>
              ) : (
                <>
                  <Square size={18} className="text-gray-400" />
                  Seleccionar
                </>
              )}
            </button>
          )
        ) : (
          <button
            onClick={(e) => { e.preventDefault(); onApadrinar(pet); }}
            className={`w-full py-3 mt-2 rounded-full text-[16px] font-medium tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isInManada
                ? "bg-[#07c4e1]/15 text-[#00626d] border border-[#07c4e1]/40 hover:bg-[#07c4e1]/25"
                : "bg-[#00626d] text-[#07c4e1] hover:bg-[#004955]"
            }`}
            aria-label={isInManada ? `Ver a ${pet.nombre} en tu Manada` : `Apadrinar a ${pet.nombre}`}
          >
            {isInManada ? (
              <>
                <CheckCircle2 size={18} className="text-[#00626d]" />
                En tu Manada
              </>
            ) : (
              <>
                <Heart size={18} />
                Apadrinar
              </>
            )}
          </button>
        )}
>>>>>>> Stashed changes
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="px-2 text-gray-400 text-sm">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? "bg-[#004955] text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export function Catalog() {
  const navigate = useNavigate();
<<<<<<< Updated upstream
  const { addToManada, mascotas: manadaMascotas } = useManada();
  const [filter, setFilter] = useState<"todos" | "Perro" | "Gato">("todos");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("recomendado");
  const [page, setPage] = useState(1);
  const [addedId, setAddedId] = useState<number | null>(null);

  const ranked = useMemo(() => rankPets(MOCK_PETS), []);
=======
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToManada, addMultipleToManada, mascotas: manadaMascotas } = useManada();
  const foundationContext = useFoundation();

  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedPetIds, setSelectedPetIds] = useState<Set<number>>(new Set());

  // Live backend data state with fallback
  const [apiPets, setApiPets] = useState<Pet[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    getMascotasApi({ limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        setApiPets(res.mascotas);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = (err as Error).message || "No se pudo conectar con el servidor.";
        console.warn("API de mascotas no disponible, usando respaldo local:", msg);
        setLoadError(msg);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize state from URL params
  const speciesParam = searchParams.get("especie");
  const initialSpecies: SpeciesOption =
    speciesParam === "Perro" || speciesParam === "Gato" ? speciesParam : "todos";

  const [filter, setFilter] = useState<SpeciesOption>(initialSpecies);
  const [urgencyOnly, setUrgencyOnly] = useState(searchParams.get("urgente") === "true");
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sort, setSort] = useState<SortMode>(
    (searchParams.get("sort") as SortMode) || "recomendado"
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Debounce search input for URL synchronization
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync state with URL params (debounced on search)
  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== "todos") params.set("especie", filter);
    if (urgencyOnly) params.set("urgente", "true");
    if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());
    if (sort !== "recomendado") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [filter, urgencyOnly, debouncedSearch, sort, page, searchParams, setSearchParams]);

  // Handle browser Back/Forward navigation
  useEffect(() => {
    const sp = searchParams.get("especie");
    const validSp: SpeciesOption = sp === "Perro" || sp === "Gato" ? sp : "todos";
    setFilter(validSp);
    setUrgencyOnly(searchParams.get("urgente") === "true");
    setSearch(searchParams.get("q") || "");
    setSort((searchParams.get("sort") as SortMode) || "recomendado");
    setPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  // Priority: live backend pets -> shelter context -> mock data fallback
  const petsSource: Pet[] = useMemo(() => {
    if (apiPets && apiPets.length > 0) {
      return apiPets;
    }
    if (foundationContext?.mascotas && foundationContext.mascotas.length > 0) {
      return foundationContext.mascotas.map((m) => ({
        ...m,
        fundacionNombre: m.fundacionNombre || FOUNDATION_NAMES[m.fundacionId] || "Fundación Aliada",
      })) as Pet[];
    }
    return MOCK_PETS;
  }, [apiPets, foundationContext?.mascotas]);

  const ranked = useMemo(() => rankPets(petsSource), [petsSource]);

  // Contextual item counts (urgency count reflects selected species tab)
  const counts = useMemo(() => {
    const speciesSubset = filter === "todos" ? ranked : ranked.filter((p) => p.especie === filter);
    return {
      total: ranked.length,
      perros: ranked.filter((p) => p.especie === "Perro").length,
      gatos: ranked.filter((p) => p.especie === "Gato").length,
      urgentes: speciesSubset.filter((p) => isHighPriority(p.score)).length,
    };
  }, [ranked, filter]);

  const isFiltered = filter !== "todos" || search.trim() !== "" || urgencyOnly || sort !== "recomendado";

  const resetPage = () => setPage(1);

  const handleReset = () => {
    setFilter("todos");
    setUrgencyOnly(false);
    setSearch("");
    setDebouncedSearch("");
    setSort("recomendado");
    setPage(1);
    setSearchParams(new URLSearchParams(), { replace: true });
  };
>>>>>>> Stashed changes

  const filtered = useMemo(() => {
    let result = ranked;
    if (filter !== "todos") result = result.filter((p) => p.especie === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          (p.raza && p.raza.toLowerCase().includes(q)) ||
          (p.fundacionNombre && p.fundacionNombre.toLowerCase().includes(q))
      );
    }
    return result;
  }, [ranked, filter, search]);

  const sorted = useMemo(() => {
    if (sort === "recomendado") return filtered;
    const copy = [...filtered];
    if (sort === "nombre") copy.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (sort === "recientes") copy.sort((a, b) => (b.fechaRegistro || "").localeCompare(a.fechaRegistro || ""));
    return copy;
  }, [filtered, sort]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const handleApadrinar = (pet: ScoredPet) => {
    if (manadaMascotas.some((a) => a.animalId === String(pet.id))) {
      navigate("/mi-manada/configurar");
      return;
    }
    addToManada({
      id: `manada-animal-${pet.id}`,
      manadaId: "temp",
      animalId: String(pet.id),
      montoMensual: 25.00,
      nombre: pet.nombre,
      refugioNombre: pet.fundacionNombre || "",
      etiqueta: pet.status === "NO_APADRINADO" ? "SALUDABLE" : "ATENCIÓN",
      imagenUrl: pet.imagen,
    });
    setAddedId(pet.id);
    setTimeout(() => setAddedId(null), 2000);
  };

<<<<<<< Updated upstream
  const urgentCount = ranked.filter((p) => isHighPriority(p.score)).length;
=======
  const toggleSelectPet = (pet: ScoredPet) => {
    setSelectedPetIds((prev) => {
      const next = new Set(prev);
      if (next.has(pet.id)) {
        next.delete(pet.id);
      } else {
        next.add(pet.id);
      }
      return next;
    });
  };

  const eligiblePetsInPage = paginated.filter(
    (p) => !manadaMascotas.some((a) => a.animalId === String(p.id))
  );

  const allInPageSelected =
    eligiblePetsInPage.length > 0 &&
    eligiblePetsInPage.every((p) => selectedPetIds.has(p.id));

  const toggleSelectAllInPage = () => {
    setSelectedPetIds((prev) => {
      const next = new Set(prev);
      if (allInPageSelected) {
        eligiblePetsInPage.forEach((p) => next.delete(p.id));
      } else {
        eligiblePetsInPage.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const handleAddSelectedToManada = () => {
    const petsToAdd = sorted.filter((p) => selectedPetIds.has(p.id));
    if (petsToAdd.length === 0) return;

    const animalsToAdd = petsToAdd.map((p) => ({
      id: `manada-animal-${p.id}`,
      manadaId: "temp",
      animalId: String(p.id),
      montoMensual: 25.0,
      nombre: p.nombre,
      refugioNombre: p.fundacionNombre || "",
      etiqueta:
        p.status === "EN_TRATAMIENTO" || isHighPriority(p.score)
          ? "ATENCIÓN"
          : "SALUDABLE",
      imagenUrl: p.imagen,
    }));

    addMultipleToManada(animalsToAdd);

    toast.success(`¡${petsToAdd.length} mascotas agregadas a tu Manada!`, {
      description: "Tu aporte mensual se ha recalculado de forma equitativa.",
      action: {
        label: "Ver Manada",
        onClick: () => navigate("/mi-manada/configurar"),
      },
    });

    setSelectedPetIds(new Set());
    setIsMultiSelectMode(false);
  };
>>>>>>> Stashed changes

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="py-10 px-4 md:px-12 lg:px-[96px] bg-gray-50 border-b border-[#b1d0d5]/40">
        <div className="max-w-[1248px] mx-auto flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
            <div className="flex gap-2">
              {(["todos", "Perro", "Gato"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); resetPage(); }}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                    filter === f
                      ? "bg-[#004955] text-white"
                      : "text-[#004955] hover:bg-gray-200"
                  }`}
                >
                  {f === "todos" ? "Todos" : f === "Perro" ? "Perros" : "Gatos"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value as SortMode); resetPage(); }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-[#004955] bg-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-[#07c4e1]/50 cursor-pointer"
              >
                <option value="recomendado">Recomendados</option>
                <option value="recientes">Más recientes</option>
                <option value="nombre">Nombre A-Z</option>
              </select>

              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                  placeholder="Buscar..."
                  className="w-52 pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm text-[#333] placeholder:text-gray-400 outline-none focus:border-[#07c4e1]"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-sm">
            {sorted.length} mascotas disponibles
            {urgentCount > 0 && <> · <span className="text-[#004955] font-medium">{urgentCount} necesitan apoyo urgente</span></>}
          </p>
        </div>
      </div>

      <div className="max-w-[1248px] mx-auto px-4 md:px-[96px] mt-10">
<<<<<<< Updated upstream
        {addedId && (
          <div className="mb-6 bg-[#47f6a1]/15 border border-[#0d9955]/20 rounded-xl p-4 flex items-center gap-2 text-[#0d9955] font-medium text-sm">
            <CheckCircle2 size={18} />
            Mascota agregada a tu Manada
=======
        {/* Multi-Select Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsMultiSelectMode((prev) => !prev);
                if (isMultiSelectMode) setSelectedPetIds(new Set());
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-2xs cursor-pointer ${
                isMultiSelectMode
                  ? "bg-[#004955] text-[#07c4e1] ring-2 ring-[#07c4e1]"
                  : "bg-white border border-[#b1d0d5] text-[#004955] hover:bg-gray-50"
              }`}
            >
              <Layers size={16} />
              {isMultiSelectMode ? "Desactivar Selección Múltiple" : "Selección Múltiple"}
            </button>
            {isMultiSelectMode && (
              <span className="text-xs text-gray-500 font-medium">
                Marca varias mascotas para sumarlas juntas a tu Manada.
              </span>
            )}
          </div>
          {isMultiSelectMode && eligiblePetsInPage.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAllInPage}
              className="text-xs font-semibold text-[#00626d] hover:text-[#004955] underline self-start sm:self-auto cursor-pointer"
            >
              {allInPageSelected ? "Deseleccionar en esta página" : "Seleccionar todas en esta página"}
            </button>
          )}
        </div>

        {isLoading && !apiPets ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`sk-${idx}`}
                className="bg-white rounded-[24px] border border-gray-200 overflow-hidden flex flex-col h-[480px] animate-pulse"
              >
                <div className="h-[240px] bg-gray-200" />
                <div className="p-8 flex flex-col gap-4 flex-grow">
                  <div className="h-7 bg-gray-200 rounded-lg w-2/3" />
                  <div className="h-4 bg-gray-100 rounded-md w-1/3" />
                  <div className="h-10 bg-gray-100 rounded-md w-full" />
                  <div className="mt-auto h-12 bg-gray-200 rounded-full w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginated.map((pet, i) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <PetCard
                  pet={pet}
                  isInManada={manadaMascotas.some((a) => a.animalId === String(pet.id))}
                  onApadrinar={handleApadrinar}
                  isMultiSelectMode={isMultiSelectMode}
                  isSelected={selectedPetIds.has(pet.id)}
                  onToggleSelect={toggleSelectPet}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 sm:py-12 bg-gray-50/80 rounded-3xl border border-dashed border-gray-300 max-w-xl mx-auto px-6">
            <CatIcon className="mx-auto w-20 sm:w-24 h-auto text-[#004955]/45 mb-2 transition-transform hover:scale-105" />
            <h3 className="text-[#004955] font-bold text-lg mb-1">No se encontraron mascotas</h3>
            <p className="text-gray-500 text-sm mb-5">
              No hay mascotas que coincidan con los filtros seleccionados actualmente.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 bg-[#00626d] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#004955] transition-colors cursor-pointer shadow-sm"
            >
              <RotateCcw size={16} />
              Restablecer todos los filtros
            </button>
>>>>>>> Stashed changes
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginated.map((pet, i) => (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <PetCard pet={pet} onApadrinar={handleApadrinar} />
            </motion.div>
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No se encontraron mascotas con esos filtros.</p>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Floating Multi-Pet Batch Action Bar */}
      {isMultiSelectMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#003840] text-white rounded-2xl p-4 shadow-2xl border border-[#07c4e1]/40 flex items-center justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#07c4e1] text-[#004955] flex items-center justify-center font-extrabold text-lg flex-shrink-0">
                {selectedPetIds.size}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {selectedPetIds.size === 1
                    ? "1 mascota seleccionada"
                    : `${selectedPetIds.size} mascotas seleccionadas`}
                </p>
                <p className="text-xs text-gray-300">
                  {selectedPetIds.size === 0
                    ? "Haz clic en las mascotas que deseas sumar"
                    : "Listas para agregarse a tu Manada"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedPetIds(new Set());
                  setIsMultiSelectMode(false);
                }}
                className="px-3 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleAddSelectedToManada}
                disabled={selectedPetIds.size === 0}
                className="bg-[#07c4e1] hover:bg-[#06aec8] disabled:opacity-40 disabled:cursor-not-allowed text-[#004955] px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Heart size={16} className="fill-[#004955]" />
                Agregar a Mi Manada ({selectedPetIds.size})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
