import React from 'react';
import { PawPrint } from 'lucide-react';

interface PetDetailSkeletonProps {
  isAdmin?: boolean;
}

export function PetDetailSkeleton({ isAdmin = false }: PetDetailSkeletonProps) {
  return (
    <div
      className="bg-white min-h-screen"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Cargando perfil de la mascota...</span>

      <main className="pt-8">
        {/* Top Hero Section: Photo + Main Summary Card */}
        <section className="px-4 md:px-12 lg:px-[96px] mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto lg:h-[600px]">
            {/* Left 2 Cols: Pet Image Placeholder */}
            <div className="lg:col-span-2 relative rounded-[24px] overflow-hidden shadow-lg min-h-[350px] bg-gray-200 animate-pulse flex flex-col justify-between p-6 sm:p-8">
              {/* Top badges placeholder */}
              <div className="flex flex-wrap gap-3">
                <div className="h-7 w-28 bg-gray-300/80 rounded-full" />
                <div className="h-7 w-44 bg-gray-300/60 rounded-full" />
              </div>

              {/* Center subtle paw icon */}
              <div className="self-center my-auto flex flex-col items-center justify-center text-gray-400/40">
                <PawPrint size={56} className="opacity-30" />
              </div>

              {/* Bottom spacer to preserve layout balance */}
              <div className="h-4" />
            </div>

            {/* Right Col: Details Card Placeholder */}
            <div className="bg-white border border-[#BDC8CA]/30 rounded-[24px] p-8 shadow-sm flex flex-col justify-between h-full">
              <div>
                {/* Pet Name & Favorite Button */}
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="h-9 sm:h-10 w-44 bg-gray-200 rounded-xl animate-pulse" />
                  <div className="w-11 h-11 rounded-full border border-gray-200 bg-gray-100 animate-pulse flex-shrink-0" />
                </div>

                {/* Foundation / Location */}
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-36 bg-gray-200 rounded-md animate-pulse" />
                </div>

                {/* 2x2 Stats Grid: Edad, Raza, Sexo, Peso/Tamaño */}
                <div className="grid grid-cols-2 gap-y-8">
                  <div>
                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-7 w-20 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-7 w-24 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                  <div>
                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-7 w-16 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-7 w-24 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Bottom Action Button & Subtext */}
              <div className="mt-8 space-y-3">
                <div className="w-full h-14 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-3.5 w-60 mx-auto bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Section: Story & Health + Side Cards */}
        <section className="px-4 md:px-12 lg:px-[96px] py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left 8 Cols: Story & Health Status */}
            <div className="lg:col-span-8">
              {/* Pet Story */}
              <div className="mb-12">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-1 bg-[#00626d]/30 h-10 rounded-full" />
                  <div className="h-8 w-60 sm:w-72 bg-gray-200 rounded-xl animate-pulse" />
                </div>
                <div className="space-y-3 max-w-[800px]">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-[96%] bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-[90%] bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-[75%] bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse pt-2" />
                  <div className="h-4 w-[92%] bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-[60%] bg-gray-200 rounded animate-pulse" />
                </div>
              </div>

              {/* Health Status: 2x2 Card Grid */}
              <div className="mt-16">
                <div className="h-7 w-48 bg-gray-200 rounded-xl animate-pulse mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white border border-[#BDC8CA]/30 p-6 rounded-[12px] flex gap-4"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg animate-pulse flex-shrink-0" />
                      <div className="space-y-2 flex-1 pt-1">
                        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3.5 w-36 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Side Cards */}
            <div className="lg:col-span-4 space-y-6">
              {/* Optional Admin Restricted Data Card Skeleton */}
              {isAdmin && (
                <div className="bg-[#003840]/30 border border-[#07c4e1]/20 p-6 rounded-[24px] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-[#07c4e1]/20 animate-pulse" />
                      <div className="h-5 w-36 bg-gray-200/40 rounded animate-pulse" />
                    </div>
                    <div className="h-5 w-28 rounded-full bg-amber-400/20 animate-pulse" />
                  </div>
                  <div className="h-3 w-4/5 bg-gray-200/20 rounded animate-pulse" />
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                    <div className="bg-white/5 p-3 rounded-xl space-y-2">
                      <div className="h-3 w-16 bg-gray-400/30 rounded animate-pulse" />
                      <div className="h-6 w-20 bg-gray-400/40 rounded animate-pulse" />
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl space-y-2">
                      <div className="h-3 w-16 bg-gray-400/30 rounded animate-pulse" />
                      <div className="h-6 w-20 bg-gray-400/40 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-3 w-32 bg-gray-400/20 rounded animate-pulse pt-1" />
                </div>
              )}

              {/* "Why Sponsor" Card Skeleton */}
              <div className="bg-[#004955] p-8 rounded-[24px] shadow-sm space-y-4">
                <div className="h-7 w-48 bg-white/20 rounded-lg animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-white/10 rounded animate-pulse" />
                  <div className="h-3.5 w-[90%] bg-white/10 rounded animate-pulse" />
                  <div className="h-3.5 w-[75%] bg-white/10 rounded animate-pulse" />
                </div>
                <div className="pt-4 border-t border-white/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-white/20 animate-pulse" />
                    <div className="h-3.5 w-52 bg-white/15 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-white/20 animate-pulse" />
                    <div className="h-3.5 w-44 bg-white/15 rounded animate-pulse" />
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

