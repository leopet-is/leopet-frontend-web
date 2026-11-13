import React, { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

interface PayPalCheckoutProps {
  amount: number;
  onCheckout: () => Promise<void>;
  onCancel: () => void;
}

export function PayPalCheckout({ amount, onCheckout, onCancel }: PayPalCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onCheckout();
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "No se pudo iniciar el pago.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <button
        onClick={() => void startCheckout()}
        disabled={isLoading}
        className="w-full bg-[#0070ba] hover:bg-[#005ea6] disabled:opacity-60 text-white font-semibold py-3.5 px-6 rounded-full transition-colors flex items-center justify-center gap-3 shadow-md"
      >
        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <span aria-hidden="true">PayPal</span>}
        {isLoading ? "Conectando con PayPal…" : `Continuar a PayPal · $${amount.toFixed(2)} USD/mes`}
      </button>
      <button
        onClick={onCancel}
        disabled={isLoading}
        className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium py-2 transition-colors"
      >
        Cancelar
      </button>
    </div>
  );
}
