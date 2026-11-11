import React, { useState, useMemo, useEffect } from 'react';
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, CheckCircle2, Heart, RotateCcw, Zap } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useManada } from '../context/ManadaContext';
import { useFoundation } from '../context/FoundationContext';
import { useFavoritos } from '../context/FavoritosContext';
import { MOCK_PETS } from '../lib/mockData';
import { rankPets, isHighPriority, type ScoredPet } from '../lib/recommendation';
import type { Pet } from '../lib/types';
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
}: {
  pet: ScoredPet;
  isInManada: boolean;
  onApadrinar: (pet: ScoredPet) => void;
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
    <div className={`bg-white rounded-[24px] overflow-hidden flex flex-col h-full group transition-shadow hover:shadow-lg border ${
      urgent ? "border-[#004955]/30" : "border-[#b1d0d5]"
    }`}>
      <div className="relative h-[240px] overflow-hidden block">
        <Link to={`/mascota/${pet.id}`} className="block w-full h-full">
          <ImageWithFallback src={pet.imagen} alt={pet.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </Link>

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
        <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap pointer-events-none">
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
          <Link to={`/mascota/${pet.id}`} className="hover:text-[#07c4e1] transition-colors block">
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
  const { addToManada, mascotas: manadaMascotas } = useManada();
  const foundationContext = useFoundation();

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

  // Combine shelter context with mock data fallback
  const petsSource: Pet[] = useMemo(() => {
    if (foundationContext?.mascotas && foundationContext.mascotas.length > 0) {
      return foundationContext.mascotas.map((m) => ({
        ...m,
        fundacionNombre: m.fundacionNombre || FOUNDATION_NAMES[m.fundacionId] || "Fundación Aliada",
      })) as Pet[];
    }
    return MOCK_PETS;
  }, [foundationContext?.mascotas]);

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
      etiqueta: pet.status === "NO_APADRINADO" ? "SALUDABLE" : "ATENCIÓN",
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
    <div className="bg-white min-h-screen pb-20">
      <div className="py-8 px-4 md:px-12 lg:px-[96px] bg-gray-50 border-b border-[#b1d0d5]/40">
        <div className="max-w-[1248px] mx-auto">
          <PetFilterBar
            species={filter}
            onSpeciesChange={(s) => { setFilter(s); resetPage(); }}
            urgencyOnly={urgencyOnly}
            onUrgencyToggle={() => { setUrgencyOnly((prev) => !prev); resetPage(); }}
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

      <div className="max-w-[1248px] mx-auto px-4 md:px-[96px] mt-10">
        {sorted.length > 0 ? (
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
    </div>
  );
}
