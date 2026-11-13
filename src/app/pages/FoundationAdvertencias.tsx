import React from "react";
import { AlertTriangle } from "lucide-react";
import { FoundationLayout } from "./FoundationLayout";

export function FoundationAdvertencias() {
  return (
    <FoundationLayout>
      <div role="status" className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <AlertTriangle size={40} className="mx-auto mb-4 text-amber-600" />
        <h2 className="text-lg font-bold text-[#004955]">Alertas no disponibles</h2>
        <p className="mt-2 text-sm text-gray-600">
          El backend aún no ofrece una API para consultar y responder alertas de fundación. No se muestran datos de ejemplo ni se guardan respuestas locales.
        </p>
      </div>
    </FoundationLayout>
  );
}
