import React, { useState, useMemo, useEffect } from 'react';
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, CheckCircle2, Heart, RotateCcw, Zap, CheckSquare, Square, Layers, Check } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useManada } from '../context/ManadaContext';
import { useFoundation } from '../context/FoundationContext';
import { useFavoritos } from '../context/FavoritosContext';
import { MOCK_PETS } from '../lib/mockData';
import { rankPets, isHighPriority, type ScoredPet } from '../lib/recommendation';
import type { Pet } from '../lib/types';
import { getMascotasApi } from '../api/mascotas.api';
import { PetFilterBar, type SpeciesOption, type SortMode } from './PetFilterBar';
import { CatIcon } from './icons/CatIcon';

const PAGE_SIZE = 6;

const FOUNDATION_NAMES: Record<string, string> = {
  "fund-01": "Huellitas Felices",
  "fund-02": "Refugio Almas Peludas",
  "fund-03": "Amigos de Cuatro Patas",
};

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
  const urgent = isHighPriority(pet.score);
  const { isFavorito, toggleFavorito } = useFavoritos();
  const isFav = isFavorito(`pet-${pet.id}`);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorito(`pet-${pet.id}`);
    if (!isFav) {
      toast.success(`${pet.nombre} fue guardado en tus favoritos`);
    } else {
      toast.info(`${pet.nombre} fue retirado de favoritos`);
    }
  };

  return (
    <div
      onClick={() => {
        if (isMultiSelectMode && !isInManada) {
          onToggleSelect?.(pet);
        }
      }}
      className={`bg-white rounded-[24px] overflow-hidden flex flex-col h-full group transition-all hover:shadow-lg border ${
        isSelected
          ? "border-[#07c4e1] ring-2 ring-[#07c4e1]/50 shadow-md"
          : urgent
          ? "border-[#004955]/30"
          : "border-[#b1d0d5]"
      } ${isMultiSelectMode && !isInManada ? "cursor-pointer" : ""}`}
    >
      <div className="relative h-[240px] overflow-hidden block">
        <Link
          to={`/mascota/${pet.id}`}
          onClick={(e) => {
            if (isMultiSelectMode) e.preventDefault();
          }}
          className="block w-full h-full"
        >
          <ImageWithFallback src={pet.imagen} alt={pet.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </Link>

        {/* Multi-Select Checkbox Trigger */}
        {isMultiSelectMode && !isInManada && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSelect?.(pet);
            }}
            className={`absolute top-4 left-4 z-20 p-2 rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer ${
              isSelected
                ? "bg-[#07c4e1] text-[#004955] ring-2 ring-white"
                : "bg-white/95 text-gray-500 hover:text-[#004955] hover:bg-white"
            }`}
            aria-label={isSelected ? `Deseleccionar a ${pet.nombre}` : `Seleccionar a ${pet.nombre}`}
          >
            {isSelected ? <CheckSquare size={20} className="stroke-[2.5]" /> : <Square size={20} />}
          </button>
        )}

        {/* Favorite Bookmark Button */}
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

        {/* Age and Urgency Badges */}
        <div className={`absolute top-4 flex items-center gap-2 flex-wrap pointer-events-none transition-all ${
          isMultiSelectMode && !isInManada ? "left-16" : "left-4"
        }`}>
          <span className="bg-white/90 px-4 py-1 rounded-full text-[#66949b] text-sm font-medium">
            {pet.edad} {pet.edad === 1 ? "año" : "años"}
          </span>
          {urgent && (
            <span className="bg-[#004955] text-[#07c4e1] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
              <Zap size={12} className="fill-[#07c4e1]" />
              Urgente
            </span>
          )}
        </div>
        {urgent && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#004955] pointer-events-none" />
        )}
      </div>

      <div className="p-8 flex flex-col gap-3 flex-grow">
        <div>
          <Link
            to={`/mascota/${pet.id}`}
            onClick={(e) => {
              if (isMultiSelectMode) e.preventDefault();
            }}
            className="hover:text-[#07c4e1] transition-colors block"
          >
            <h3 className="text-[#004955] text-[28px] font-bold leading-tight group-hover:text-[#00626d] transition-colors">{pet.nombre}</h3>
          </Link>
          <p className="text-[#66949b] text-[18px] font-light">{pet.raza}</p>
        </div>
        <p className="text-[#3e494a] text-sm leading-relaxed line-clamp-2">{pet.descripcion}</p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <span className="text-gray-500 text-sm">{pet.fundacionNombre}</span>
          {urgent && (
            <span className="text-[#004955] text-xs font-semibold flex items-center gap-1">
              <Zap size={12} className="text-amber-500 fill-amber-500" />
              Necesita apoyo
            </span>
          )}
        </div>

        {isMultiSelectMode ? (
          isInManada ? (
            <button
              disabled
              className="w-full py-3 mt-2 rounded-full text-[16px] font-medium tracking-wide bg-[#07c4e1]/15 text-[#00626d] border border-[#07c4e1]/40 flex items-center justify-center gap-2 cursor-default"
            >
              <CheckCircle2 size={18} className="text-[#00626d]" />
              En tu Manada
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSelect?.(pet);
              }}
              className={`w-full py-3 mt-2 rounded-full text-[16px] font-medium tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSelected
                  ? "bg-[#07c4e1] text-[#004955] font-bold shadow-sm hover:bg-[#06aec8]"
                  : "bg-gray-100 text-[#004955] hover:bg-gray-200 border border-gray-200"
              }`}
              aria-label={isSelected ? `Deseleccionar a ${pet.nombre}` : `Seleccionar a ${pet.nombre}`}
            >
              {isSelected ? (
                <>
                  <CheckSquare size={18} />
                  Seleccionada
                </>
              ) : (
                <>
                  <Square size={18} />
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
        aria-label="Página anterior"
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
            aria-label={`Ir a la página ${p}`}
            aria-current={p === page ? "page" : undefined}
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
        aria-label="Página siguiente"
        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export function Catalog() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToManada, addMultipleToManada, mascotas: manadaMascotas } = useManada();
  const foundationContext = useFoundation();

  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedPetIds, setSelectedPetIds] = useState<Set<number>>(new Set());

  // Live backend data state with fallback
  const [apiPets, setApiPets] = useState<Pet[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getMascotasApi({ limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        setApiPets(res.mascotas);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = (err as Error).message || "No se pudo conectar con el servidor.";
        console.warn("API de mascotas no disponible, usando respaldo local:", msg);
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
    (searchParams.get("sort") as SortMode) ||
      (searchParams.get("urgente") === "true" ? "recomendado" : "recientes")
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
    const defaultSort = urgencyOnly ? "recomendado" : "recientes";
    if (sort !== defaultSort) params.set("sort", sort);
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
    setSort(
      (searchParams.get("sort") as SortMode) ||
        (searchParams.get("urgente") === "true" ? "recomendado" : "recientes")
    );
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

  const isFiltered =
    filter !== "todos" ||
    search.trim() !== "" ||
    urgencyOnly ||
    sort !== (urgencyOnly ? "recomendado" : "recientes");

  const resetPage = () => setPage(1);

  const handleReset = () => {
    setFilter("todos");
    setUrgencyOnly(false);
    setSearch("");
    setDebouncedSearch("");
    setSort("recientes");
    setPage(1);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const filtered = useMemo(() => {
    let result = ranked;

    // Filter by urgency tag
    if (urgencyOnly) {
      result = result.filter((p) => isHighPriority(p.score));
    }

    // Filter by species
    if (filter !== "todos") {
      result = result.filter((p) => p.especie === filter);
    }

    // Filter by text search with accent-insensitivity (diacritics normalization)
    if (search.trim()) {
      const q = normalizeText(search.trim());
      result = result.filter(
        (p) =>
          normalizeText(p.nombre).includes(q) ||
          (p.raza && normalizeText(p.raza).includes(q)) ||
          (p.fundacionNombre && normalizeText(p.fundacionNombre).includes(q))
      );
    }

    return result;
  }, [ranked, urgencyOnly, filter, search]);

  const sorted = useMemo(() => {
    if (sort === "recomendado") return filtered;
    const copy = [...filtered];
    if (sort === "nombre") copy.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (sort === "recientes") copy.sort((a, b) => (b.fechaRegistro || "").localeCompare(a.fechaRegistro || ""));
    return copy;
  }, [filtered, sort]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  // Safe page clamping prevents empty renders if URL specifies an out-of-range page number
  const safePage = sorted.length > 0 ? Math.min(Math.max(1, page), Math.max(1, totalPages)) : 1;
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
      etiqueta: pet.status === "EN_TRATAMIENTO" || isHighPriority(pet.score) ? "ATENCIÓN" : "SALUDABLE",
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

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="py-8 px-4 md:px-12 lg:px-[96px] bg-gray-50 border-b border-[#b1d0d5]/40">
        <div className="max-w-[1248px] mx-auto">
          <PetFilterBar
            species={filter}
            onSpeciesChange={(s) => { setFilter(s); resetPage(); }}
            urgencyOnly={urgencyOnly}
            onUrgencyToggle={() => {
              const nextUrgencyOnly = !urgencyOnly;
              setUrgencyOnly(nextUrgencyOnly);
              setSort(nextUrgencyOnly ? "recomendado" : "recientes");
              resetPage();
            }}
            search={search}
            onSearchChange={(q) => { setSearch(q); resetPage(); }}
            sort={sort}
            onSortChange={(s) => { setSort(s); resetPage(); }}
            isFiltered={isFiltered}
            onReset={handleReset}
            counts={{
              total: sorted.length,
              perros: counts.perros,
              gatos: counts.gatos,
              urgentes: counts.urgentes,
            }}
          />
        </div>
      </div>

      <div className="max-w-[1248px] mx-auto px-4 md:px-[96px] mt-8">
        {/* Multi-Select & Results Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#004955]">
              {sorted.length} {sorted.length === 1 ? "mascota disponible" : "mascotas disponibles"}
            </span>
            {isMultiSelectMode && (
              <span className="text-xs bg-[#07c4e1]/20 text-[#004955] px-2.5 py-1 rounded-full font-bold">
                Modo Selección Múltiple
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isMultiSelectMode && eligiblePetsInPage.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAllInPage}
                className="text-xs font-semibold text-[#00626d] hover:text-[#004955] underline cursor-pointer"
              >
                {allInPageSelected ? "Deseleccionar en esta página" : "Seleccionar todas en esta página"}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (isMultiSelectMode) {
                  setSelectedPetIds(new Set());
                }
                setIsMultiSelectMode((prev) => !prev);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isMultiSelectMode
                  ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                  : "bg-[#004955] text-white hover:bg-[#00626d] shadow-xs"
              }`}
            >
              {isMultiSelectMode ? (
                <>
                  <Square size={14} />
                  Salir de selección
                </>
              ) : (
                <>
                  <Layers size={14} />
                  Selección múltiple
                </>
              )}
            </button>
          </div>
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
          </div>
        )}

        <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
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
                disabled={selectedPetIds.size === 0}
                onClick={handleAddSelectedToManada}
                className="bg-[#07c4e1] hover:bg-[#06aec8] disabled:opacity-50 disabled:cursor-not-allowed text-[#004955] font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Check size={16} />
                Agregar a mi Manada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
