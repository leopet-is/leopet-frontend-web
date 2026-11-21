import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit2,
  PawPrint,
  X,
  Camera,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  AlertCircle,
  Upload,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useFoundation } from '../context/FoundationContext';
import { useAuth } from '../context/AuthContext';
import { FoundationLayout } from './FoundationLayout';
import { createMascotaApi, getMascotasByFundacionApi, MAX_UPLOAD_IMAGE_SIZE, updateMascotaApi, uploadFileApi } from '../api/mascotas.api';
import type { Pet } from '../lib/types';
import {
  validatePetDraft,
  validatePetPublish,
  getMissingDraftFields,
  type PetFormData,
} from '../lib/petValidation';
import { storage } from '../lib/storage';

export type TabOption = 'todas' | 'publicadas' | 'borradores';

const EMPTY_FORM: PetFormData = {
  nombre: "",
  raza: "",
  edad: 0,
  sexo: "Macho",
  peso: 0,
  especie: "Perro",
  descripcion: "",
  historia: "",
  imagen: "",
  galeria: [],
  visible: true,
  status: "NO_APADRINADO",
  esterilizacion: null,
  vacunacion: null,
  desparasitacion: null,
  enfermedades: "",
};

const INPUT_CLASS = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#07c4e1]/50 focus:border-[#07c4e1] transition-colors";
const SELECT_CLASS = `${INPUT_CLASS} appearance-none pr-10`;

const statusLabel: Record<string, string> = {
  BORRADOR: "Borrador",
  NO_APADRINADO: "Disponible",
  REQUIERE_PADRINOS: "Requiere Padrinos",
  APADRINADO: "Apadrinado",
  EN_PROCESO: "En Proceso",
  ADOPTADO: "Adoptado",
  EN_TRATAMIENTO: "En Tratamiento",
};

const statusBadgeClass: Record<string, string> = {
  BORRADOR: "bg-amber-100 text-amber-900 border border-amber-300 font-bold",
  NO_APADRINADO: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold",
  REQUIERE_PADRINOS: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold",
  APADRINADO: "bg-sky-50 text-sky-700 border border-sky-200 font-semibold",
  EN_PROCESO: "bg-[#004955]/10 text-[#004955] font-semibold",
  ADOPTADO: "bg-gray-100 text-gray-500 font-medium",
  EN_TRATAMIENTO: "bg-rose-50 text-rose-700 border border-rose-200 font-semibold",
};

export function FoundationMascotas() {
  const { mascotas, addMascota, updateMascota } = useFoundation();
  const { user } = useAuth();
  const [apiMascotas, setApiMascotas] = useState<Pet[] | null>(null);
  const [isLoadingMascotas, setIsLoadingMascotas] = useState(false);
  const [mascotasLoadError, setMascotasLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabOption>('todas');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<PetFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [validationBanner, setValidationBanner] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'amber' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mascotasRequestIdRef = useRef(0);

  const apiFundacionId = user?.fundacionId;
  const fundacionId = apiFundacionId != null
    ? String(apiFundacionId)
    : (user?.id === "usr-fund1" ? "fund-01" : user?.id === "usr-fund2" ? "fund-02" : user?.id === "usr-fund3" ? "fund-03" : "");

  const reloadMascotas = useCallback(async () => {
    if (apiFundacionId == null) {
      setApiMascotas(null);
      setIsLoadingMascotas(false);
      return;
    }

    const requestId = ++mascotasRequestIdRef.current;
    setIsLoadingMascotas(true);
    setMascotasLoadError(null);
    try {
      const result = await getMascotasByFundacionApi(apiFundacionId);
      if (requestId === mascotasRequestIdRef.current) {
        setApiMascotas(result);
      }
    } catch (error) {
      if (requestId === mascotasRequestIdRef.current) {
        console.error("Error al cargar las mascotas de la fundación:", error);
        setMascotasLoadError(error instanceof Error ? error.message : "No se pudieron cargar las mascotas.");
      }
    } finally {
      if (requestId === mascotasRequestIdRef.current) {
        setIsLoadingMascotas(false);
      }
    }
  }, [apiFundacionId]);

  useEffect(() => {
    void reloadMascotas();
    return () => {
      mascotasRequestIdRef.current += 1;
    };
  }, [reloadMascotas]);

  const localFoundationMascotas = mascotas.filter((m) => m.fundacionId === fundacionId);
  const foundationMascotas: Pet[] = apiMascotas
    ? [
        ...apiMascotas,
        ...localFoundationMascotas.filter(
          (m) => m.id >= 1_000_000_000_000 && !apiMascotas.some((apiPet) => apiPet.id === m.id)
        ),
      ]
    : localFoundationMascotas;

  const counts = {
    todas: foundationMascotas.length,
    publicadas: foundationMascotas.filter((m) => m.status !== 'BORRADOR').length,
    borradores: foundationMascotas.filter((m) => m.status === 'BORRADOR').length,
  };

  const filteredMascotas = foundationMascotas.filter((m) => {
    if (activeTab === 'publicadas' && m.status === 'BORRADOR') return false;
    if (activeTab === 'borradores' && m.status !== 'BORRADOR') return false;
    if (search && !m.nombre.toLowerCase().includes(search.toLowerCase()) && !(m.raza && m.raza.toLowerCase().includes(search.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const showToast = (message: string, type: 'success' | 'amber' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const clearFieldError = (field: string) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
    setValidationBanner(null);
  };

  const openCreate = () => {
    setEditingId(null);
    setStep(1);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setValidationBanner(null);
    setShowModal(true);
  };

  const openEdit = (mascota: Pet) => {
    setEditingId(mascota.id);
    setStep(1);
    setForm({
      nombre: mascota.nombre,
      raza: mascota.raza || "",
      edad: mascota.edad || 0,
      sexo: mascota.sexo || "Macho",
      peso: mascota.peso || 0,
      especie: mascota.especie || "Perro",
      descripcion: mascota.descripcion || "",
      historia: mascota.historia || "",
      imagen: mascota.imagen || "",
      galeria: mascota.galeria || [],
      visible: mascota.visible !== false,
      status: mascota.status || "NO_APADRINADO",
      esterilizacion: mascota.esterilizacion ?? null,
      vacunacion: mascota.vacunacion ?? null,
      desparasitacion: mascota.desparasitacion ?? null,
      enfermedades: mascota.enfermedades || "",
    });
    setFormErrors({});
    setValidationBanner(null);
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({ ...prev, imagen: "Por favor selecciona un archivo de imagen válido." }));
      e.target.value = "";
      return;
    }

    if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
      setFormErrors((prev) => ({ ...prev, imagen: "La imagen no puede superar los 10 MB." }));
      e.target.value = "";
      return;
    }

    setIsUploadingImage(true);
    try {
      const imageUrl = await uploadFileApi(file);
      setForm((prev) => ({ ...prev, imagen: imageUrl }));
      clearFieldError("imagen");
      showToast("Imagen subida correctamente.");
    } catch (error) {
      console.error("Error al subir imagen de mascota:", error);
      setFormErrors((prev) => ({
        ...prev,
        imagen: error instanceof Error ? error.message : "No se pudo subir la imagen.",
      }));
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  const buildApiPayload = (data: PetFormData, status: string, visible: boolean) => {
    const estimatedBirthDate = new Date();
    estimatedBirthDate.setFullYear(
      estimatedBirthDate.getFullYear() - Math.max(0, data.edad)
    );

    return {
      nombre: data.nombre.trim(),
      raza: data.raza,
      descripcion: data.descripcion,
      historia: data.historia,
      especie: data.especie,
      sexo: data.sexo,
      peso: data.peso,
      imagen: data.imagen,
      galeria: data.galeria,
      status,
      visible,
      fecha_nacimiento_estimada: estimatedBirthDate.toISOString().slice(0, 10),
      enfermedades: data.enfermedades,
      esterilizacion: data.esterilizacion === true,
      vacunacion: data.vacunacion === true,
      desparasitacion: data.desparasitacion === true,
    };
  };

  const handleNextStep = () => {
    setValidationBanner(null);
    if (step === 1) {
      const nombre = (form.nombre || "").trim();
      if (!nombre) {
        setFormErrors((prev) => ({ ...prev, nombre: "Ingresa el nombre de la mascota para continuar" }));
        return;
      }
      if (nombre.length < 2) {
        setFormErrors((prev) => ({ ...prev, nombre: "El nombre debe tener al menos 2 caracteres" }));
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setValidationBanner(null);
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  // Guardar como Borrador (Validación Permisiva)
  const handleSaveDraft = async () => {
    const validation = validatePetDraft(form);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      setValidationBanner("Corrige el nombre antes de guardar el borrador.");
      return;
    }

    const draftData = {
      ...form,
      status: "BORRADOR",
      visible: false,
    };

    setIsSubmitting(true);
    try {
      const token = storage.getToken();
      if (token) {
        const payload = buildApiPayload(draftData, "BORRADOR", false);
        const apiPet = editingId !== null
          ? await updateMascotaApi(editingId, payload)
          : await createMascotaApi(payload);
        const savedPet: Pet = {
          ...apiPet,
          ...draftData,
          id: apiPet.id,
          fundacionId: apiPet.fundacionId || fundacionId,
        };

        if (editingId !== null) {
          updateMascota(editingId, savedPet);
        } else {
          addMascota(savedPet);
        }
        setApiMascotas((current) => [
          savedPet,
          ...(current || []).filter((pet) => pet.id !== savedPet.id),
        ]);
        showToast(editingId !== null ? "Borrador actualizado en el servidor." : "Borrador registrado en el servidor.", "amber");
      } else {
        if (editingId !== null) {
          updateMascota(editingId, draftData);
        } else {
          const now = new Date().toISOString();
          addMascota({
            ...draftData,
            id: Date.now(),
            fundacionId,
            createdAt: now,
            updatedAt: now,
            fechaRegistro: now.split("T")[0],
            ubicacion: "Guayaquil",
          });
        }
        showToast("Borrador guardado localmente.", "amber");
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error al guardar borrador de mascota:", error);
      showToast(error instanceof Error ? error.message : "No se pudo guardar el borrador.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Publicar Mascota (Validación Estricta)
  const handlePublish = async () => {
    const validation = validatePetPublish(form);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      setValidationBanner("Faltan campos obligatorios para publicar. Revisa los campos resaltados.");
      if (validation.errors.nombre || validation.errors.especie || validation.errors.sexo || validation.errors.peso || validation.errors.edad) {
        setStep(1);
      } else if (validation.errors.imagen || validation.errors.descripcion || validation.errors.historia) {
        setStep(2);
      } else {
        setStep(3);
      }
      return;
    }

    const publishData = {
      ...form,
      status: "REQUIERE_PADRINOS",
      visible: true,
    };

    setIsSubmitting(true);
    try {
      const token = storage.getToken();
      if (token) {
        const payload = buildApiPayload(publishData, "REQUIERE_PADRINOS", true);
        const apiPet = editingId !== null
          ? await updateMascotaApi(editingId, payload)
          : await createMascotaApi(payload);
        const savedPet: Pet = {
          ...apiPet,
          ...publishData,
          id: apiPet.id,
          fundacionId: apiPet.fundacionId || fundacionId,
        };

        if (editingId !== null) {
          updateMascota(editingId, savedPet);
        } else {
          addMascota(savedPet);
        }
        setApiMascotas((current) => [
          savedPet,
          ...(current || []).filter((pet) => pet.id !== savedPet.id),
        ]);
        showToast(editingId !== null ? "Mascota actualizada y publicada." : "Mascota registrada y publicada en el catálogo.", "success");
      } else {
        if (editingId !== null) {
          updateMascota(editingId, publishData);
        } else {
          const now = new Date().toISOString();
          addMascota({
            ...publishData,
            id: Date.now(),
            fundacionId,
            createdAt: now,
            updatedAt: now,
            fechaRegistro: now.split("T")[0],
            ubicacion: "Guayaquil",
          });
        }
        showToast("Mascota publicada localmente.", "success");
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error al guardar cambios de mascota:", error);
      showToast(error instanceof Error ? error.message : "No se pudo guardar la mascota.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVisibility = async (pet: Pet) => {
    const visible = pet.visible === false;
    if (apiFundacionId != null && apiMascotas?.some((apiPet) => apiPet.id === pet.id)) {
      try {
        const updatedPet = await updateMascotaApi(pet.id, { visible });
        setApiMascotas((current) =>
          current?.map((apiPet) => (apiPet.id === pet.id ? { ...apiPet, ...updatedPet } : apiPet)) ?? current
        );
        updateMascota(pet.id, { visible });
      } catch (error) {
        console.error("Error al actualizar la visibilidad de la mascota:", error);
        showToast("No se pudo actualizar la visibilidad de la mascota.", "error");
        return;
      }
    } else {
      updateMascota(pet.id, { visible });
    }
    showToast(`Mascota ${visible ? "mostrada" : "ocultada"} en el catálogo`);
  };

  return (
    <FoundationLayout>
      <div className="space-y-6">
        {/* Cabecera y botón principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#004955]">Gestión de Mascotas</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Registra animales, administra borradores en curso y publica mascotas para adopción o apadrinamiento.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 bg-[#07c4e1] text-[#004955] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#06aec8] transition-colors shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#07c4e1]"
          >
            <Plus size={18} />
            Registrar Mascota
          </button>
        </div>

        {/* Pestañas de filtrado (Todas, Publicadas, Borradores) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('todas')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'todas'
                  ? 'bg-[#004955] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todas ({counts.todas})
            </button>
            <button
              onClick={() => setActiveTab('publicadas')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'publicadas'
                  ? 'bg-[#004955] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Publicadas ({counts.publicadas})
            </button>
            <button
              onClick={() => setActiveTab('borradores')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'borradores'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <FileText size={14} />
              Borradores ({counts.borradores})
            </button>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o raza..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${INPUT_CLASS} pl-9 py-2 border-gray-200`}
            />
          </div>
        </div>

        {/* Cuadrícula de Mascotas */}
        {mascotasLoadError && (
          <div role="alert" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-800">
            <p>No se pudieron cargar las mascotas desde el servidor: {mascotasLoadError}</p>
            <button
              type="button"
              onClick={() => void reloadMascotas()}
              className="px-4 py-2 rounded-lg bg-white border border-rose-200 font-semibold hover:bg-rose-100 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}
        {isLoadingMascotas && (
          <p role="status" className="text-center text-sm text-gray-500 py-8">
            Cargando mascotas de la fundación...
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {!isLoadingMascotas && filteredMascotas.map((mascota) => {
            const isDraft = mascota.status === 'BORRADOR';
            const missing = isDraft ? getMissingDraftFields(mascota) : [];

            return (
              <div
                key={mascota.id}
                className={`bg-white rounded-2xl border transition-all shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  isDraft
                    ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20'
                    : 'border-[#BDC8CA]/40'
                } ${mascota.visible === false && !isDraft ? "opacity-60" : ""}`}
              >
                <div>
                  {/* Foto o Placeholder */}
                  <div className="h-64 overflow-hidden relative bg-gray-100 flex items-center justify-center">
                    {mascota.imagen ? (
                      <img src={mascota.imagen} alt={mascota.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 gap-1.5 p-4 text-center">
                        <Camera size={32} className="text-amber-400" />
                        <span className="text-xs font-semibold text-gray-500">Sin foto asignada</span>
                      </div>
                    )}
                    {mascota.status !== "REQUIERE_PADRINOS" && (
                      <div className="absolute top-2 right-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs ${statusBadgeClass[mascota.status] || "bg-gray-100 text-gray-600"}`}>
                          {statusLabel[mascota.status] || mascota.status}
                        </span>
                      </div>
                    )}

                    {isDraft && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          <FileText size={10} />
                          Ficha en curso
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-[#004955] font-bold text-lg leading-tight flex items-center gap-2">
                          {mascota.nombre}
                          {isDraft && (
                            <span className="text-[11px] font-normal text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              No publicada
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-500 text-sm mt-0.5">
                          {mascota.raza || "Sin raza especificada"} · {mascota.edad ? `${mascota.edad} ${mascota.edad === 1 ? 'año' : 'años'}` : 'Edad pendiente'} · {mascota.sexo}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2">
                      {mascota.descripcion || <span className="italic text-gray-400">Sin descripción ingresada aún</span>}
                    </p>

                    {/* Resumen de Faltantes para Borradores */}
                    {isDraft && missing.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5">
                        <p className="text-[11px] font-semibold text-amber-900 mb-1 flex items-center gap-1">
                          <AlertCircle size={12} className="text-amber-600" />
                          Pendiente para publicar ({missing.length}):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {missing.map((item, idx) => (
                            <span key={idx} className="bg-white border border-amber-200 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => openEdit(mascota)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        isDraft
                          ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                          : "bg-gray-100 hover:bg-gray-200 text-[#004955]"
                      }`}
                    >
                      <Edit2 size={13} />
                      {isDraft ? "Completar Ficha" : "Editar"}
                    </button>
                    {!isDraft && (
                      <button
                        onClick={() => void toggleVisibility(mascota)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          mascota.visible !== false
                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            : "bg-[#07c4e1]/10 text-[#00626d] hover:bg-[#07c4e1]/20 font-semibold"
                        }`}
                      >
                        {mascota.visible !== false ? <><EyeOff size={13} /> Ocultar</> : <><Eye size={13} /> Mostrar</>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!isLoadingMascotas && filteredMascotas.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200/70 p-8">
            <PawPrint size={48} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">No se encontraron mascotas</h3>
            <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
              {activeTab === 'borradores'
                ? "No tienes borradores pendientes. Guarda una ficha como borrador para continuarla después."
                : "No hay registros que coincidan con la búsqueda actual."}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Registro / Edición con Wizard de 3 Pasos */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => { if (!isUploadingImage) setShowModal(false); }}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header del Modal */}
            <div className="flex-shrink-0 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-[#004955] text-lg sm:text-xl font-bold">
                  {editingId ? "Editar Ficha de Mascota" : "Registrar Nueva Mascota"}
                </h2>
                <p className="text-xs text-gray-400">
                  {step === 1 && "Paso 1 de 3: Identidad y datos generales"}
                  {step === 2 && "Paso 2 de 3: Foto e historia de rescate"}
                  {step === 3 && "Paso 3 de 3: Estado médico y previsualización"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Stepper Header (3 Pasos) */}
            <div className="flex items-center justify-between px-6 py-3 bg-gray-50/70 border-b border-gray-100 gap-2">
              {[
                { num: 1, title: "1. Identidad", desc: "Datos generales" },
                { num: 2, title: "2. Historia y Foto", desc: "Narrativa e imagen" },
                { num: 3, title: "3. Salud y Publicación", desc: "Estado y revisión" },
              ].map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(s.num as 1 | 2 | 3)}
                  className={`flex-1 flex items-center gap-2 py-1.5 px-2 rounded-lg text-left transition-all cursor-pointer ${
                    step === s.num
                      ? "bg-white shadow-xs border border-[#07c4e1]/40 ring-1 ring-[#07c4e1]/20"
                      : step > s.num
                      ? "hover:bg-gray-100 opacity-90"
                      : "hover:bg-gray-100 opacity-60"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      step === s.num
                        ? "bg-[#07c4e1] text-[#004955]"
                        : step > s.num
                        ? "bg-[#004955] text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step > s.num ? <Check size={13} className="stroke-[3]" /> : s.num}
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <p className={`text-xs font-bold leading-tight truncate ${step === s.num ? "text-[#004955]" : "text-gray-600"}`}>
                      {s.title}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Banner de Validación si hubo error */}
            {validationBanner && (
              <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center gap-2 text-rose-800 text-xs font-semibold">
                <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
                <span>{validationBanner}</span>
              </div>
            )}

            {/* Contenido scrolleable del formulario dividido en 3 pasos */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* PASO 1: Identidad Básica */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-200/80 flex items-start gap-2.5">
                    <FileText size={18} className="text-[#07c4e1] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#004955]">Datos Generales</h4>
                      <p className="text-[11px] text-gray-500">
                        Ingresa al menos el nombre de la mascota. Con esto ya puedes guardar un borrador en cualquier momento.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Nombre de la Mascota * <span className="text-[#00626d] font-normal lowercase">(requerido)</span>
                      </label>
                      <input
                        type="text"
                        value={form.nombre}
                        onChange={(e) => {
                          setForm({ ...form, nombre: e.target.value });
                          clearFieldError("nombre");
                        }}
                        placeholder="Ej: Pluto, Luna, Rex..."
                        className={`${INPUT_CLASS} ${formErrors.nombre ? "border-rose-400 bg-rose-50/20" : ""}`}
                        autoFocus
                      />
                      {formErrors.nombre && <p className="text-rose-500 text-xs mt-1 font-medium">{formErrors.nombre}</p>}
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Especie *</label>
                      <select
                        value={form.especie}
                        onChange={(e) => {
                          setForm({ ...form, especie: e.target.value });
                          clearFieldError("especie");
                        }}
                        className={`${SELECT_CLASS} ${formErrors.especie ? "border-rose-400" : ""}`}
                      >
                        <option value="Perro">Perro</option>
                        <option value="Gato">Gato</option>
                        <option value="OTRO">Otro</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-[38px] text-gray-400 pointer-events-none" />
                      {formErrors.especie && <p className="text-rose-500 text-xs mt-1">{formErrors.especie}</p>}
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Sexo *</label>
                      <select
                        value={form.sexo}
                        onChange={(e) => {
                          setForm({ ...form, sexo: e.target.value as "Macho" | "Hembra" });
                          clearFieldError("sexo");
                        }}
                        className={`${SELECT_CLASS} ${formErrors.sexo ? "border-rose-400" : ""}`}
                      >
                        <option value="Macho">Macho</option>
                        <option value="Hembra">Hembra</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-[38px] text-gray-400 pointer-events-none" />
                      {formErrors.sexo && <p className="text-rose-500 text-xs mt-1">{formErrors.sexo}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Raza</label>
                      <input
                        type="text"
                        value={form.raza}
                        onChange={(e) => setForm({ ...form, raza: e.target.value })}
                        placeholder="Ej: Mestizo, Beagle Mix..."
                        className={INPUT_CLASS}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Edad estimada (años)</label>
                      <input
                        type="number"
                        min={0}
                        value={form.edad || ""}
                        onChange={(e) => {
                          setForm({ ...form, edad: parseInt(e.target.value) || 0 });
                          clearFieldError("edad");
                        }}
                        placeholder="Ej: 3"
                        className={`${INPUT_CLASS} ${formErrors.edad ? "border-rose-400" : ""}`}
                      />
                      {formErrors.edad && <p className="text-rose-500 text-xs mt-1">{formErrors.edad}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                        Peso estimado (kg) * <span className="text-amber-700 font-normal">(confidencial para padrinos)</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={form.peso || ""}
                        onChange={(e) => {
                          setForm({ ...form, peso: parseFloat(e.target.value) || 0 });
                          clearFieldError("peso");
                        }}
                        placeholder="Ej: 9.5"
                        className={`${INPUT_CLASS} ${formErrors.peso ? "border-rose-400 bg-rose-50/20" : ""}`}
                      />
                      {formErrors.peso && <p className="text-rose-500 text-xs mt-1">{formErrors.peso}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: Multimedia e Historia */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Foto de la Mascota */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Foto Principal {formErrors.imagen && <span className="text-rose-500 lowercase font-normal">(* Requerida para publicar)</span>}
                    </label>

                    <div className="space-y-3">
                      <div className="relative w-full max-w-sm aspect-[1/0.85] mx-auto rounded-xl overflow-hidden border-2 border-dashed flex items-center justify-center bg-gray-50">
                        {form.imagen ? (
                          <img src={form.imagen} alt="Vista previa" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-3 text-gray-400">
                            <Camera size={28} className="mx-auto mb-1 text-gray-300" />
                            <p className="text-[10px] font-medium">Sin foto asignada</p>
                          </div>
                        )}
                      </div>

                      <div className="w-full space-y-1.5">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          disabled={isUploadingImage}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-[#004955] rounded-xl text-sm font-semibold transition-colors border border-gray-200 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                        >
                          <Upload size={14} />
                          {isUploadingImage ? "Subiendo imagen..." : "Subir foto desde este equipo"}
                        </button>
                        <p className="text-center text-[10px] text-gray-400">Tamaño máximo: 10 MB por imagen.</p>
                      </div>
                    </div>

                    {formErrors.imagen && <p className="text-rose-500 text-xs mt-1.5 font-medium">{formErrors.imagen}</p>}
                  </div>

                  {/* Descripción Corta */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                      Descripción Resumida * <span className="text-gray-400 font-normal">(mínimo 15 caracteres para publicar)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      value={form.descripcion}
                      onChange={(e) => {
                        setForm({ ...form, descripcion: e.target.value });
                        clearFieldError("descripcion");
                      }}
                      placeholder="Una línea describiendo su personalidad, dócil con niños, enérgico..."
                      className={`${INPUT_CLASS} ${formErrors.descripcion ? "border-rose-400 bg-rose-50/20" : ""}`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {formErrors.descripcion ? (
                        <p className="text-rose-500 text-xs">{formErrors.descripcion}</p>
                      ) : (
                        <span />
                      )}
                      <p className="text-[10px] text-gray-400">{form.descripcion.length}/200</p>
                    </div>
                  </div>

                  {/* Historia */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                      Historia Completa / Motivo de Rescate * <span className="text-gray-400 font-normal">(mínimo 20 caracteres para publicar)</span>
                    </label>
                    <textarea
                      value={form.historia}
                      onChange={(e) => {
                        setForm({ ...form, historia: e.target.value });
                        clearFieldError("historia");
                      }}
                      rows={4}
                      placeholder="Cuenta cómo fue rescatada la mascota, qué cuidados especiales requiere y por qué busca padrino..."
                      className={`${INPUT_CLASS} resize-none ${formErrors.historia ? "border-rose-400 bg-rose-50/20" : ""}`}
                    />
                    {formErrors.historia && <p className="text-rose-500 text-xs mt-1">{formErrors.historia}</p>}
                  </div>
                </div>
              )}

              {/* PASO 3: Estado de Salud y Previsualización */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Salud */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Estado de Salud {formErrors.vacunacion && <span className="text-rose-500 font-normal lowercase">(* Indica estado de vacunación)</span>}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <label className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
                        <input
                          type="checkbox"
                          checked={form.vacunacion === true}
                          onChange={(e) => {
                            setForm({ ...form, vacunacion: e.target.checked });
                            clearFieldError("vacunacion");
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-[#07c4e1] focus:ring-[#07c4e1]"
                        />
                        <span className="text-xs font-semibold text-gray-700">Vacunado</span>
                      </label>
                      <label className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
                        <input
                          type="checkbox"
                          checked={form.esterilizacion === true}
                          onChange={(e) => setForm({ ...form, esterilizacion: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-[#07c4e1] focus:ring-[#07c4e1]"
                        />
                        <span className="text-xs font-semibold text-gray-700">Esterilizado</span>
                      </label>
                      <label className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
                        <input
                          type="checkbox"
                          checked={form.desparasitacion === true}
                          onChange={(e) => setForm({ ...form, desparasitacion: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-[#07c4e1] focus:ring-[#07c4e1]"
                        />
                        <span className="text-xs font-semibold text-gray-700">Desparasitado</span>
                      </label>
                    </div>

                    <div className="mt-2.5">
                      <input
                        type="text"
                        value={form.enfermedades}
                        onChange={(e) => setForm({ ...form, enfermedades: e.target.value })}
                        placeholder="Enfermedades o tratamientos conocidos (opcional)"
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>

                  {/* Previsualización en Vivo de la Ficha */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Eye size={14} className="text-[#07c4e1]" />
                      Previsualización de la ficha en Catálogo
                    </p>
                    <div className="flex gap-4 items-center bg-white rounded-xl p-3 border border-gray-200/80 shadow-xs">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {form.imagen ? (
                          <img src={form.imagen} alt={form.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Camera size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#004955] text-base truncate">{form.nombre || "Sin nombre"}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            Listo para catálogo
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {form.especie} · {form.raza || "Mestizo"} · {form.edad || 0} {form.edad === 1 ? "año" : "años"} · {form.sexo}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-1 mt-1">{form.descripcion || "Sin descripción corta todavía"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer con Navegación del Wizard y Acciones Diferenciadas */}
            <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 rounded-b-2xl">
              <div>
                {step > 1 ? (
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={handlePrevStep}
                    className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft size={14} />
                    Anterior
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2">
                {/* Botón Guardar Borrador (Siempre accesible) */}
                <button
                  type="button"
                  disabled={isSubmitting || isUploadingImage}
                  onClick={handleSaveDraft}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Guarda el avance con lo que lleves completado"
                >
                  <FileText size={15} />
                  {isSubmitting ? "Guardando..." : "Guardar Borrador"}
                </button>

                {/* Siguiente o Publicar */}
                {step < 3 ? (
                  <button
                    type="button"
                    disabled={isUploadingImage}
                    onClick={handleNextStep}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-[#004955] hover:bg-[#00626d] text-white rounded-xl text-xs font-extrabold transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting || isUploadingImage}
                    onClick={handlePublish}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-[#07c4e1] hover:bg-[#06aec8] disabled:opacity-50 text-[#004955] rounded-xl text-xs font-extrabold transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    {isSubmitting ? "Publicando..." : (editingId ? "Guardar y Publicar" : "Publicar Mascota")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificación Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            toast.type === 'amber'
              ? 'bg-amber-600 text-white'
              : toast.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-[#004955] text-white'
          }`}
        >
          {toast.type === 'amber' ? <FileText size={16} /> : <CheckCircle2 size={16} />}
          {toast.message}
        </div>
      )}
    </FoundationLayout>
  );
}
