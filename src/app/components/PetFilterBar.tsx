import React from 'react';
import { Search, X, RotateCcw, Zap } from 'lucide-react';

export type SpeciesOption = "todos" | "Perro" | "Gato";
export type SortMode = "recomendado" | "recientes" | "nombre";

export interface PetFilterCounts {
  total: number;
  perros: number;
  gatos: number;
  urgentes: number;
}

export interface PetFilterBarProps {
  species: SpeciesOption;
  onSpeciesChange: (species: SpeciesOption) => void;
  urgencyOnly: boolean;
  onUrgencyToggle: () => void;
  search: string;
  onSearchChange: (search: string) => void;
  sort: SortMode;
  onSortChange: (sort: SortMode) => void;
  isFiltered: boolean;
  onReset: () => void;
  counts: PetFilterCounts;
}

export function PetFilterBar({
  species,
  onSpeciesChange,
  urgencyOnly,
  onUrgencyToggle,
  search,
  onSearchChange,
  sort,
  onSortChange,
  isFiltered,
  onReset,
  counts,
}: PetFilterBarProps) {
  const speciesOptions: { key: SpeciesOption; label: string; count: number }[] = [
    { key: "todos", label: "Todos", count: counts.total },
    { key: "Perro", label: "Perros", count: counts.perros },
    { key: "Gato", label: "Gatos", count: counts.gatos },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Primary Toolbar: Filters, Urgency Tag, Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Species Segmented Buttons + Urgency Tag */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Species Pills */}
          <div
            className="inline-flex p-1 bg-gray-200/70 rounded-full"
            role="group"
            aria-label="Filtrar por especie"
          >
            {speciesOptions.map((opt) => {
              const active = species === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onSpeciesChange(opt.key)}
                  aria-pressed={active}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? "bg-[#004955] text-white shadow-sm"
                      : "text-[#004955] hover:text-[#002e36] hover:bg-white/60"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-white text-gray-500"
                    }`}
                  >
                    {opt.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Urgency Tag Filter Chip */}
          <button
            type="button"
            onClick={onUrgencyToggle}
            aria-pressed={urgencyOnly}
            aria-label="Filtrar por casos urgentes que necesitan apoyo"
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
              urgencyOnly
                ? "bg-[#004955] text-[#07c4e1] border-[#07c4e1] shadow-sm ring-2 ring-[#07c4e1]/30"
                : "bg-white text-[#004955] border-gray-300 hover:border-[#004955]/40 hover:bg-gray-50"
            }`}
          >
            <Zap
              size={14}
              className={urgencyOnly ? "fill-[#07c4e1] text-[#07c4e1]" : "text-amber-500 fill-amber-500"}
            />
            <span>Necesitan apoyo</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                urgencyOnly
                  ? "bg-[#07c4e1]/20 text-[#07c4e1]"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {counts.urgentes}
            </span>
          </button>
        </div>

        {/* Right Side: Reset Button (only shown when dirty) */}
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-500 hover:text-[#ee5871] bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer"
            aria-label="Restablecer todos los filtros"
          >
            <RotateCcw size={14} />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Secondary Row: Sorting & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Status Count Summary */}
        <p className="text-gray-500 text-xs sm:text-sm order-2 sm:order-1">
          Mostrando <span className="font-semibold text-[#004955]">{counts.total}</span> mascotas
          {urgencyOnly && (
            <span className="text-[#004955] font-medium"> (solo casos prioritarios)</span>
          )}
          {species !== "todos" && (
            <span className="text-gray-600"> · Especie: {species === "Perro" ? "Perros" : "Gatos"}</span>
          )}
          {search && (
            <span className="text-gray-600"> · Coincidencia con &quot;{search}&quot;</span>
          )}
        </p>

        {/* Controls: Sort Dropdown + Search Box */}
        <div className="flex items-center gap-3 order-1 sm:order-2">
          {/* Sort Select */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortMode)}
              aria-label="Ordenar listado de mascotas"
              className="px-3 sm:px-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm text-[#004955] bg-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-[#07c4e1]/50 cursor-pointer shadow-2xs"
            >
              <option value="recomendado">Recomendados</option>
              <option value="recientes">Más recientes</option>
              <option value="nombre">Nombre A-Z</option>
            </select>
          </div>

          {/* Search Box with Clear Button */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre, raza..."
              aria-label="Buscar mascotas por nombre, raza o refugio"
              className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm text-[#333] placeholder:text-gray-400 outline-none focus:border-[#07c4e1] focus:ring-2 focus:ring-[#07c4e1]/20 bg-white shadow-2xs"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Borrar búsqueda"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

