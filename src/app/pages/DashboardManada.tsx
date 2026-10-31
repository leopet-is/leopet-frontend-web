import React, { useState } from 'react';
import { Link } from 'react-router';
import { Trash2, Pause, Play, AlertCircle, X, Pencil, Check } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useSubscriptions, montoGlobalDe } from '../context/SubscriptionContext';
import { useManada } from '../context/ManadaContext';
import { DashboardLayout } from './DashboardLayout';

const round2 = (n: number) => Math.round(n * 100) / 100;

export function DashboardManada() {
  const { subscriptions, pauseSubscription, resumeSubscription, cancelSubscription, removePetFromSubscription, updateSubscriptionAmount } = useSubscriptions();
  const { mascotas, removeFromManada, montoGlobal, setMontoGlobal } = useManada();
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<{ subId: string; amount: number } | null>(null);

  const shareGlobal = mascotas.length > 0 ? round2(montoGlobal / mascotas.length) : 0;

  const saveSubEdit = () => {
    if (editingSub) {
      updateSubscriptionAmount(editingSub.subId, editingSub.amount);
      setEditingSub(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-[#004955] text-2xl font-semibold">Gestionar Manada</h2>
          <p className="text-[#3e494a] text-sm mt-1">
            El monto se asigna a tu manada y se reparte equitativamente entre sus mascotas.
          </p>
        </div>

        {mascotas.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#004955] text-lg font-semibold">Manada Pendiente de Pago</h3>
              <Link to="/mi-manada/configurar" className="text-[#07c4e1] text-sm font-medium hover:underline">
                Configurar →
              </Link>
            </div>
            <div className="space-y-3">
              {mascotas.map((animal) => (
                <div key={animal.animalId} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback src={animal.imagenUrl} alt={animal.nombre} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#004955] font-medium text-sm">{animal.nombre}</p>
                    <p className="text-gray-400 text-xs">Reparto equitativo · ${shareGlobal.toFixed(2)}/mes</p>
                  </div>
                  <button
                    onClick={() => removeFromManada(animal.animalId)}
                    className="text-red-400 hover:text-red-600 p-1 transition-colors"
                    aria-label={`Eliminar ${animal.nombre}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[#004955] font-semibold">Monto mensual de la manada</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={20}
                  max={200}
                  step={5}
                  value={montoGlobal}
                  onChange={(e) => setMontoGlobal(Number(e.target.value))}
                  className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-[#07c4e1] outline-none"
                />
                <span className="text-xs text-gray-500">/mes</span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-400">Total pendiente</span>
              <span className="text-[#004955] font-bold text-lg">${montoGlobal.toFixed(2)}/mes</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#BDC8CA]/40 p-6 shadow-sm">
          <h3 className="text-[#004955] text-lg font-semibold mb-4">Suscripciones Activas</h3>

          {subscriptions.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">Aún no tienes suscripciones activas</p>
              <Link to="/mascotas" className="text-[#07c4e1] text-sm font-medium hover:underline">Explorar mascotas</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub) => {
                const global = montoGlobalDe(sub);
                const share = round2(global / Math.max(sub.pets.length, 1));
                const isEditing = editingSub?.subId === sub.id;
                return (
                  <div key={sub.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#004955] font-semibold">
                          {sub.pets.map((p) => p.name).join(", ")}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Creada: {new Date(sub.createdAt).toLocaleDateString("es-EC")} · {sub.pets.length} mascota{sub.pets.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          sub.status === "active" ? "bg-[#004955]/10 text-[#004955]" : "bg-gray-100 text-gray-500"
                        }`}>
                          {sub.status === "active" ? "Activa" : "Pausada"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {sub.pets.map((pet) => (
                        <div key={pet.petId} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            <ImageWithFallback src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#004955]">{pet.name}</p>
                            <p className="text-gray-400 text-[11px]">Reparto equitativo · ${share.toFixed(2)}/mes</p>
                          </div>
                          <button
                            onClick={() => removePetFromSubscription(sub.id, pet.petId)}
                            className="text-red-400 hover:text-red-600 p-1 transition-colors"
                            title="Eliminar de suscripción"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Monto mensual:</span>
                          <input
                            type="number"
                            min={20}
                            max={200}
                            step={5}
                            value={editingSub.amount}
                            onChange={(e) => setEditingSub({ subId: sub.id, amount: Number(e.target.value) })}
                            className="w-24 px-2 py-1 border border-[#07c4e1] rounded-lg text-sm text-center focus:ring-2 focus:ring-[#07c4e1] outline-none"
                            autoFocus
                          />
                          <button onClick={saveSubEdit} className="text-[#004955] hover:text-[#00626d] p-1" aria-label="Guardar monto">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditingSub(null)} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Cancelar edición">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-[#004955]">${global.toFixed(2)}/mes</span>
                          <button
                            onClick={() => setEditingSub({ subId: sub.id, amount: global })}
                            className="text-gray-400 hover:text-[#004955] p-1 transition-colors"
                            title="Editar monto de la manada"
                          >
                            <Pencil size={12} />
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {sub.status === "active" ? (
                          <button
                            onClick={() => pauseSubscription(sub.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors"
                          >
                            <Pause size={14} />
                            Pausar 30 días
                          </button>
                        ) : (
                          <button
                            onClick={() => resumeSubscription(sub.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#004955]/10 text-[#004955] text-xs font-medium hover:bg-[#004955]/20 transition-colors"
                          >
                            <Play size={14} />
                            Reanudar
                          </button>
                        )}
                        {confirmCancel === sub.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-red-500 font-medium">¿Cancelar?</span>
                            <button
                              onClick={() => { cancelSubscription(sub.id); setConfirmCancel(null); }}
                              className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                            >
                              Sí
                            </button>
                            <button
                              onClick={() => setConfirmCancel(null)}
                              className="px-2 py-1 rounded-lg bg-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-300 transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmCancel(sub.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors"
                          >
                            <X size={14} />
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
