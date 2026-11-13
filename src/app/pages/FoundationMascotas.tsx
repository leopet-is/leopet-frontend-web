<<<<<<< Updated upstream
import React, { useState } from 'react';
import { Plus, Search, Edit2, PawPrint, X, Check, Camera, ChevronDown, Trash2, Eye, EyeOff } from 'lucide-react';
=======
import React, { useState, useRef } from 'react';
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
  Lock,
  FileText,
  AlertCircle,
  Upload,
  Check,
  CheckCircle2
} from 'lucide-react';
>>>>>>> Stashed changes
import { useFoundation } from '../context/FoundationContext';
import { useAuth } from '../context/AuthContext';
import { FoundationLayout } from './FoundationLayout';
import {
  validatePetDraft,
  validatePetPublish,
  getMissingDraftFields,
  type PetFormData
} from '../lib/petValidation';
import { createMascotaApi, updateMascotaApi } from '../api/mascotas.api';
import { storage } from '../lib/storage';

import imgMain from "../../imports/DetalleDeMascotaLeoPet/b5e67b3823fbd4287dcd8b82dc791a0d64b1d4a9.png";
import imgFood from "../../imports/DetalleDeMascotaLeoPet/9ec279e8e0b77d8a1cef5b76d12950fe70e8b841.png";
import imgPlay from "../../imports/DetalleDeMascotaLeoPet/bd95c8085784a9dd890c235868f306b717608099.png";
import imgPluto from "../../imports/Catalog/7abaafcc2a09d50e0fc877db77c9c704cd360ae6.png";
import imgJasper from "../../imports/Manada/05315c921ffb0646b298e09ecd7293761ebbf584.png";

const IMAGENES_MOCK = [imgMain, imgFood, imgPlay, imgPluto, imgJasper];

type TabType = 'todas' | 'publicadas' | 'borradores';

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
  status: "BORRADOR",
  esterilizacion: null,
  vacunacion: null,
  desparasitacion: null,
  enfermedades: "",
};

const INPUT_CLASS = "w-full px-3 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#07c4e1]/50 focus:border-[#07c4e1] transition-colors";
const SELECT_CLASS = `${INPUT_CLASS} appearance-none pr-10`;

const statusLabel: Record<string, string> = {
  BORRADOR: "Borrador",
  NO_APADRINADO: "Disponible",
  APADRINADO: "Apadrinado",
  EN_PROCESO: "En Proceso",
  ADOPTADO: "Adoptado",
  REQUIERE_PADRINOS: "Requiere Padrinos",
  EN_TRATAMIENTO: "En Tratamiento",
  INACTIVO: "Inactivo",
  FALLECIDO: "Fallecido",
};

const statusBadgeClass: Record<string, string> = {
  BORRADOR: "bg-amber-100 text-amber-800 border border-amber-300",
  NO_APADRINADO: "bg-emerald-100 text-emerald-800",
  REQUIERE_PADRINOS: "bg-emerald-100 text-emerald-800",
  APADRINADO: "bg-blue-100 text-blue-800",
  EN_PROCESO: "bg-[#004955]/10 text-[#004955]",
  ADOPTADO: "bg-purple-100 text-purple-800",
  EN_TRATAMIENTO: "bg-orange-100 text-orange-800",
  INACTIVO: "bg-gray-100 text-gray-500",
  FALLECIDO: "bg-rose-100 text-rose-700",
};

export function FoundationMascotas() {
  const { mascotas, addMascota, updateMascota } = useFoundation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('todas');
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PetFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [validationBanner, setValidationBanner] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'amber' | 'error' } | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fundacionId = user?.fundacionId
    ? String(user.fundacionId)
    : (user?.id === "usr-fund1" ? "fund-01" : user?.id === "usr-fund2" ? "fund-02" : "fund-03");

  // Mascotas de esta fundación
  const foundationMascotas = mascotas.filter((m) => {
    return (
      m.fundacionId === fundacionId ||
      String(m.fundacionId) === String(user?.fundacionId) ||
      (user?.id === "usr-fund1" && m.fundacionId === "fund-01")
    );
  });

  // Conteos para pestañas
  const counts = {
    todas: foundationMascotas.length,
    publicadas: foundationMascotas.filter((m) => m.status !== 'BORRADOR').length,
    borradores: foundationMascotas.filter((m) => m.status === 'BORRADOR').length,
  };

  // Filtrado final
  const filteredMascotas = foundationMascotas.filter((m) => {
    // Filtro por pestaña
    if (activeTab === 'publicadas' && m.status === 'BORRADOR') return false;
    if (activeTab === 'borradores' && m.status !== 'BORRADOR') return false;

    // Filtro por búsqueda
    if (search) {
      const q = search.toLowerCase();
      const matchName = m.nombre?.toLowerCase().includes(q);
      const matchRaza = m.raza?.toLowerCase().includes(q);
      if (!matchName && !matchRaza) return false;
    }
    return true;
  });

  const showToast = (message: string, type: 'success' | 'amber' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const clearFieldError = (field: string) => {
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (validationBanner) setValidationBanner(null);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setValidationBanner(null);
    setImageUrlInput("");
    setShowImagePicker(false);
    setShowModal(true);
  };

  const openEdit = (mascota: typeof mascotas[0]) => {
    setEditingId(mascota.id);
    setForm({
      nombre: mascota.nombre,
      raza: mascota.raza || "",
      edad: mascota.edad || 0,
      sexo: mascota.sexo || "Macho",
      peso: mascota.peso || 0,
      especie: (mascota.especie === "Gato" ? "Gato" : "Perro") as "Perro" | "Gato",
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
    setImageUrlInput(mascota.imagen || "");
    setFormErrors({});
    setValidationBanner(null);
    setShowImagePicker(false);
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setFormErrors((prev) => ({ ...prev, imagen: "Por favor selecciona un archivo de imagen válido" }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setForm((prev) => ({ ...prev, imagen: result }));
        setImageUrlInput("");
        clearFieldError("imagen");
      };
<<<<<<< Updated upstream
      addMascota(newMascota as any);
      showToast("Mascota registrada con éxito");
=======
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrlInput(url);
    setForm((prev) => ({ ...prev, imagen: url }));
    clearFieldError("imagen");
  };

  // Guardar como Borrador (Permisivo)
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
      if (token && editingId && typeof editingId === 'number' && editingId < 1000000000000) {
        try {
          const apiPet = await updateMascotaApi(editingId, {
            nombre: draftData.nombre,
            raza: draftData.raza,
            descripcion: draftData.descripcion,
            especie: draftData.especie,
            sexo: draftData.sexo,
            peso: draftData.peso,
            imagen: draftData.imagen,
            status: "BORRADOR",
            visible: false,
          });
          updateMascota(editingId, { ...draftData, ...apiPet });
          showToast("Borrador guardado en la base de datos", "amber");
        } catch (apiErr) {
          console.warn("Backend update notice, fallback local:", apiErr);
          updateMascota(editingId, draftData);
          showToast("Borrador guardado localmente", "amber");
        }
      } else if (token && !editingId) {
        try {
          const apiPet = await createMascotaApi({
            nombre: draftData.nombre,
            raza: draftData.raza,
            descripcion: draftData.descripcion,
            especie: draftData.especie,
            sexo: draftData.sexo,
            peso: draftData.peso,
            imagen: draftData.imagen,
            status: "BORRADOR",
            visible: false,
          });
          addMascota({
            ...draftData,
            ...apiPet,
            fundacionId: apiPet.fundacionId || fundacionId,
          });
          showToast("Borrador registrado en la base de datos", "amber");
        } catch (apiErr) {
          console.warn("Backend create notice, fallback local:", apiErr);
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
          showToast("Borrador guardado localmente", "amber");
        }
      } else {
        if (editingId) {
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
        showToast("Borrador guardado exitosamente", "amber");
      }
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Publicar Mascota (Estricto)
  const handlePublish = async () => {
    const validation = validatePetPublish(form);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      setValidationBanner("Faltan campos obligatorios para publicar. Revisa los campos resaltados.");
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
      if (token && editingId && typeof editingId === 'number' && editingId < 1000000000000) {
        try {
          const apiPet = await updateMascotaApi(editingId, {
            nombre: publishData.nombre,
            raza: publishData.raza,
            descripcion: publishData.descripcion,
            especie: publishData.especie,
            sexo: publishData.sexo,
            peso: publishData.peso,
            imagen: publishData.imagen,
            status: "REQUIERE_PADRINOS",
            visible: true,
            enfermedades: publishData.enfermedades,
            esterilizacion: publishData.esterilizacion,
            vacunacion: publishData.vacunacion,
            desparasitacion: publishData.desparasitacion,
          });
          updateMascota(editingId, { ...publishData, ...apiPet });
          showToast("¡Mascota publicada en la base de datos!", "success");
        } catch (apiErr) {
          console.warn("Backend update notice, fallback local:", apiErr);
          updateMascota(editingId, publishData);
          showToast("¡Mascota publicada con éxito!", "success");
        }
      } else if (token && !editingId) {
        try {
          const apiPet = await createMascotaApi({
            nombre: publishData.nombre,
            raza: publishData.raza,
            descripcion: publishData.descripcion,
            especie: publishData.especie,
            sexo: publishData.sexo,
            peso: publishData.peso,
            imagen: publishData.imagen,
            status: "REQUIERE_PADRINOS",
            visible: true,
            enfermedades: publishData.enfermedades,
            esterilizacion: publishData.esterilizacion,
            vacunacion: publishData.vacunacion,
            desparasitacion: publishData.desparasitacion,
          });
          addMascota({
            ...publishData,
            ...apiPet,
            fundacionId: apiPet.fundacionId || fundacionId,
          });
          showToast("¡Mascota publicada en la base de datos!", "success");
        } catch (apiErr) {
          console.warn("Backend create notice, fallback local:", apiErr);
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
          showToast("¡Mascota publicada con éxito en el catálogo!", "success");
        }
      } else {
        if (editingId) {
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
        showToast("¡Mascota publicada con éxito en el catálogo!", "success");
      }
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
>>>>>>> Stashed changes
    }
  };

  const toggleVisibility = (id: number, currentVisible: boolean) => {
    updateMascota(id, { visible: !currentVisible });
    showToast(`Mascota ${currentVisible ? "ocultada" : "mostrada"} en el catálogo`, "success");
  };

  const isDraftForm = !editingId || form.status === 'BORRADOR';

  return (
    <FoundationLayout>
      <div className="space-y-6">
        {/* Cabecera y botón principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#004955]">Gestión de Mascotas</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Registra, publica o gestiona los animales bajo el cuidado de tu fundación.
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

<<<<<<< Updated upstream
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMascotas.map((mascota) => (
            <div key={mascota.id} className={`bg-white rounded-2xl border border-[#BDC8CA]/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${mascota.visible === false ? "opacity-60" : ""}`}>
              <div className="h-40 overflow-hidden relative">
                <img src={mascota.imagen} alt={mascota.nombre} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass[mascota.status] || "bg-gray-100 text-gray-600"}`}>
                    {statusLabel[mascota.status] || mascota.status}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[#004955] font-bold text-lg">{mascota.nombre}</h3>
                    <p className="text-gray-500 text-sm">{mascota.raza || "Sin raza"} · {mascota.edad} {mascota.edad === 1 ? "año" : "años"} · {mascota.sexo}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">{mascota.descripcion}</p>
                <div className="flex flex-wrap gap-1.5">
                  {mascota.vacunacion === true && mascota.esterilizacion === true && mascota.desparasitacion === true && !mascota.enfermedades && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-medium">Salud al día</span>
                  )}
                  {mascota.enfermedades && (
                    <span className="px-2 py-0.5 bg-[#004955]/10 text-[#004955] rounded text-[10px] font-medium">{mascota.enfermedades}</span>
                  )}
                  {mascota.peso > 0 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-medium">{mascota.peso} kg</span>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => openEdit(mascota)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-[#004955] rounded-lg text-xs font-medium transition-colors"
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                  <button
                    onClick={() => toggleVisibility(mascota.id, mascota.visible !== false)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      mascota.visible !== false
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-[#07c4e1]/10 text-[#00626d] hover:bg-[#07c4e1]/20"
                    }`}
                  >
                    {mascota.visible !== false ? <><EyeOff size={14} /> Ocultar</> : <><Eye size={14} /> Mostrar</>}
                  </button>
                </div>
              </div>
            </div>
          ))}
=======
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
>>>>>>> Stashed changes
        </div>

        {/* Cuadrícula de Mascotas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMascotas.map((mascota) => {
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
                  <div className="h-44 overflow-hidden relative bg-gray-100 flex items-center justify-center">
                    {mascota.imagen ? (
                      <img src={mascota.imagen} alt={mascota.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 gap-1.5 p-4 text-center">
                        <Camera size={32} className="text-amber-400" />
                        <span className="text-xs font-semibold text-gray-500">Sin foto asignada</span>
                        <span className="text-[10px] text-gray-400">Requerida para publicar</span>
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${statusBadgeClass[mascota.status] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabel[mascota.status] || mascota.status}
                      </span>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-[#004955] font-bold text-lg leading-tight flex items-center gap-1.5">
                          {mascota.nombre}
                          {isDraft && <span className="text-xs text-amber-600 font-semibold">[En progreso]</span>}
                        </h3>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {mascota.especie} · {mascota.raza || "Sin raza"} · {mascota.edad ? `${mascota.edad} ${mascota.edad === 1 ? "año" : "años"}` : "Edad no def."} · {mascota.sexo}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-600 text-xs line-clamp-2 min-h-[32px]">
                      {mascota.descripcion || <span className="italic text-gray-400">Sin descripción agregada aún...</span>}
                    </p>

                    {/* Resumen de salud */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mascota.vacunacion === true && mascota.esterilizacion === true && mascota.desparasitacion === true && !mascota.enfermedades && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-semibold">Salud al día</span>
                      )}
                      {mascota.enfermedades && (
                        <span className="px-2 py-0.5 bg-[#004955]/10 text-[#004955] rounded text-[10px] font-medium">{mascota.enfermedades}</span>
                      )}
                      {mascota.peso > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/80 rounded text-[10px] font-medium">
                          <Lock size={10} /> {mascota.peso} kg (Privado)
                        </span>
                      )}
                    </div>

                    {/* Pendientes en caso de borrador */}
                    {isDraft && missing.length > 0 && (
                      <div className="bg-amber-100/60 border border-amber-200 rounded-lg p-2 mt-2">
                        <p className="text-[11px] font-semibold text-amber-900 flex items-center gap-1">
                          <AlertCircle size={12} className="text-amber-700 flex-shrink-0" />
                          Pendiente para publicar:
                        </p>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          {missing.join(" · ")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="p-4 pt-0">
                  {isDraft ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(mascota)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                      >
                        <Edit2 size={14} />
                        Completar Registro
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(mascota)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-[#004955] rounded-xl text-xs font-semibold transition-colors"
                      >
                        <Edit2 size={14} />
                        Editar
                      </button>
                      <button
                        onClick={() => toggleVisibility(mascota.id, mascota.visible !== false)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          mascota.visible !== false
                            ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            : "bg-[#07c4e1]/10 text-[#00626d] hover:bg-[#07c4e1]/20"
                        }`}
                      >
                        {mascota.visible !== false ? <><EyeOff size={14} /> Ocultar</> : <><Eye size={14} /> Mostrar</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Estado vacío */}
        {filteredMascotas.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <PawPrint size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 font-semibold">
              {activeTab === 'borradores'
                ? "No tienes ningún borrador pendiente"
                : "No se encontraron mascotas en esta sección"}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {activeTab === 'borradores'
                ? "Los registros incompletos que guardes como borrador aparecerán aquí."
                : "Usa el botón de Registrar Mascota para agregar una nueva."}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Registro / Edición */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-150" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-gray-100" onClick={(e) => e.stopPropagation()}>
            {/* Encabezado del Modal */}
            <div className="flex-shrink-0 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-[#004955] text-lg font-bold">
                  {editingId
                    ? form.status === 'BORRADOR'
                      ? `Completar Borrador: ${form.nombre || "Sin nombre"}`
                      : `Editar Mascota: ${form.nombre}`
                    : "Registrar Nueva Mascota"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {form.status === 'BORRADOR'
                    ? "Puedes guardar cambios como borrador o completar todos los requisitos para publicar."
                    : "Completa la ficha técnica y médica para el apadrinamiento."}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Banner de Validación */}
            {validationBanner && (
              <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-medium">
                <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-900">Atención:</p>
                  <p>{validationBanner}</p>
                </div>
              </div>
            )}

            {/* Cuerpo del Formulario */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Sección de Imagen */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Foto Principal de la Mascota {form.status !== 'BORRADOR' && <span className="text-rose-500">*</span>}
                </label>

                {/* Previsualización actual */}
                <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                  {form.imagen ? (
                    <>
                      <img src={form.imagen} alt="Vista previa" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, imagen: "" }));
                          setImageUrlInput("");
                        }}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg transition-colors"
                        title="Quitar foto"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                      <Camera size={36} className="text-gray-300 mb-1" />
                      <p className="text-xs font-medium text-gray-600">Sube una foto o ingresa una URL</p>
                      <p className="text-[11px] text-gray-400">Requerida para publicar en el catálogo</p>
                    </div>
                  )}
                </div>
                {formErrors.imagen && <p className="text-rose-500 text-xs mt-1 font-medium">{formErrors.imagen}</p>}

                {/* Opciones de carga: Archivo o URL */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-[#004955] rounded-xl text-xs font-semibold transition-colors border border-gray-200"
                  >
                    <Upload size={14} />
                    Subir foto desde este equipo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(!showImagePicker)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold transition-colors border border-gray-200"
                  >
                    <Camera size={14} />
                    Seleccionar de la galería
                  </button>
                </div>

                {/* Entrada de URL manual */}
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="O pega directamente una URL de imagen (https://...)"
                    value={imageUrlInput}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className={`${INPUT_CLASS} py-2 text-xs border-gray-200`}
                  />
                </div>

                {/* Selector de presets */}
                {showImagePicker && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 mt-2">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Galería de fotos de muestra:</p>
                    <div className="grid grid-cols-5 gap-2">
                      {IMAGENES_MOCK.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, imagen: img }));
                            setImageUrlInput("");
                            clearFieldError("imagen");
                            setShowImagePicker(false);
                          }}
                          className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            form.imagen === img
                              ? "border-[#07c4e1] ring-2 ring-[#07c4e1]/30"
                              : "border-transparent hover:border-gray-300"
                          }`}
                        >
                          <img src={img} alt={`Opción ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Información Básica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Nombre <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => {
                      setForm({ ...form, nombre: e.target.value });
                      clearFieldError("nombre");
                    }}
                    placeholder="Ej: Bobby"
                    className={`${INPUT_CLASS} ${formErrors.nombre ? "border-rose-400 focus:ring-rose-400" : "border-gray-200"}`}
                  />
                  {formErrors.nombre && <p className="text-rose-500 text-xs mt-1 font-medium">{formErrors.nombre}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Raza
                  </label>
                  <input
                    type="text"
                    value={form.raza}
                    onChange={(e) => setForm({ ...form, raza: e.target.value })}
                    placeholder="Ej: Beagle Mix / Mestizo"
                    className={`${INPUT_CLASS} border-gray-200`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Edad estimada (años) {form.status !== 'BORRADOR' && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.edad || ""}
                    onChange={(e) => {
                      setForm({ ...form, edad: parseInt(e.target.value) || 0 });
                      clearFieldError("edad");
                    }}
                    placeholder="Ej: 2"
                    className={`${INPUT_CLASS} ${formErrors.edad ? "border-rose-400 focus:ring-rose-400" : "border-gray-200"}`}
                  />
                  {formErrors.edad && <p className="text-rose-500 text-xs mt-1 font-medium">{formErrors.edad}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Peso (kg) {form.status !== 'BORRADOR' && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={form.peso || ""}
                    onChange={(e) => {
                      setForm({ ...form, peso: parseFloat(e.target.value) || 0 });
                      clearFieldError("peso");
                    }}
                    placeholder="Ej: 8.5"
                    className={`${INPUT_CLASS} ${formErrors.peso ? "border-rose-400 focus:ring-rose-400" : "border-gray-200"}`}
                  />
                  {formErrors.peso && <p className="text-rose-500 text-xs mt-1 font-medium">{formErrors.peso}</p>}
                </div>
              </div>

              {/* Especie y Sexo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Especie <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.especie}
                    onChange={(e) => {
                      setForm({ ...form, especie: e.target.value as "Perro" | "Gato" });
                      clearFieldError("especie");
                    }}
                    className={`${SELECT_CLASS} border-gray-200`}
                  >
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-[38px] text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Sexo <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.sexo}
                    onChange={(e) => {
                      setForm({ ...form, sexo: e.target.value as "Macho" | "Hembra" });
                      clearFieldError("sexo");
                    }}
                    className={`${SELECT_CLASS} border-gray-200`}
                  >
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-[38px] text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Descripción breve */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Descripción Corta {form.status !== 'BORRADOR' && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="text"
                  maxLength={200}
                  value={form.descripcion}
                  onChange={(e) => {
                    setForm({ ...form, descripcion: e.target.value });
                    clearFieldError("descripcion");
                  }}
                  placeholder="Una frase llamativa describiendo a la mascota (mínimo 15 caracteres)"
                  className={`${INPUT_CLASS} ${formErrors.descripcion ? "border-rose-400 focus:ring-rose-400" : "border-gray-200"}`}
                />
                <div className="flex justify-between items-center mt-1">
                  {formErrors.descripcion ? (
                    <p className="text-rose-500 text-xs font-medium">{formErrors.descripcion}</p>
                  ) : (
                    <span className="text-[11px] text-gray-400">Resumen visible en tarjetas del catálogo</span>
                  )}
                  <p className="text-[10px] text-gray-400">{form.descripcion.length}/200</p>
                </div>
              </div>

              {/* Historia completa */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Historia de Rescate y Personalidad {form.status !== 'BORRADOR' && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  value={form.historia}
                  onChange={(e) => {
                    setForm({ ...form, historia: e.target.value });
                    clearFieldError("historia");
                  }}
                  rows={4}
                  placeholder="Cuenta cómo fue rescatado, su temperamento, necesidades especiales y por qué necesita padrinos..."
                  className={`${INPUT_CLASS} resize-none ${formErrors.historia ? "border-rose-400 focus:ring-rose-400" : "border-gray-200"}`}
                />
                {formErrors.historia && <p className="text-rose-500 text-xs mt-1 font-medium">{formErrors.historia}</p>}
              </div>

              {/* Estado de Salud */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
                  Estado Médico y Sanitario {form.status !== 'BORRADOR' && <span className="text-rose-500">*</span>}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-gray-100 transition-colors">
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

                  <label className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={form.esterilizacion === true}
                      onChange={(e) => setForm({ ...form, esterilizacion: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[#07c4e1] focus:ring-[#07c4e1]"
                    />
                    <span className="text-xs font-semibold text-gray-700">Esterilizado</span>
                  </label>

                  <label className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={form.desparasitacion === true}
                      onChange={(e) => setForm({ ...form, desparasitacion: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[#07c4e1] focus:ring-[#07c4e1]"
                    />
                    <span className="text-xs font-semibold text-gray-700">Desparasitado</span>
                  </label>
                </div>
                {formErrors.vacunacion && <p className="text-rose-500 text-xs mt-1 font-medium">{formErrors.vacunacion}</p>}

                <div className="mt-3">
                  <input
                    type="text"
                    value={form.enfermedades}
                    onChange={(e) => setForm({ ...form, enfermedades: e.target.value })}
                    placeholder="Enfermedades o tratamientos en curso (opcional)"
                    className={`${INPUT_CLASS} border-gray-200`}
                  />
                </div>
              </div>
            </div>

            {/* Acciones en el pie del Modal (Doble CTA) */}
            <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>

              <div className="w-full sm:w-auto flex-1 flex flex-col sm:flex-row gap-2.5 sm:justify-end">
                {isDraftForm ? (
                  <>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSaveDraft}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileText size={15} />
                      {isSubmitting ? "Guardando..." : "Guardar como Borrador"}
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handlePublish}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-[#07c4e1] hover:bg-[#06aec8] disabled:opacity-50 text-[#004955] rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={16} />
                      {isSubmitting ? "Publicando..." : "Publicar Mascota"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handlePublish}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#004955] hover:bg-[#003842] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Check size={16} />
                    {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notificación */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2 ${
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
