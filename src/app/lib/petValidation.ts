// src/app/lib/petValidation.ts
/**
 * Logica de validacion para el registro de mascotas en dos niveles:
 * 1. validatePetDraft: Permisiva para guardar borradores en progreso.
 * 2. validatePetPublish: Estricta para publicar oficialmente en el catalogo.
 */

export interface PetFormData {
  nombre: string;
  raza?: string;
  edad: number;
  sexo: "Macho" | "Hembra" | string;
  peso: number;
  especie: "Perro" | "Gato" | string;
  descripcion: string;
  historia?: string;
  imagen: string;
  galeria?: string[];
  visible?: boolean;
  status?: string;
  esterilizacion?: boolean | null;
  vacunacion?: boolean | null;
  desparasitacion?: boolean | null;
  enfermedades?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validacion permisiva para guardar un Borrador.
 * Solo exige el nombre basico para identificar el registro; el resto puede estar incompleto.
 */
export function validatePetDraft(data: Partial<PetFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  const nombre = (data.nombre || "").trim();
  if (!nombre) {
    errors.nombre = "Ingresa al menos el nombre para guardar un borrador";
  } else if (nombre.length < 2) {
    errors.nombre = "El nombre debe tener al menos 2 caracteres";
  } else if (nombre.length > 100) {
    errors.nombre = "El nombre no puede exceder 100 caracteres";
  }

  if (data.peso !== undefined && data.peso !== null && Number(data.peso) < 0) {
    errors.peso = "El peso no puede ser negativo";
  }

  if (data.edad !== undefined && data.edad !== null && Number(data.edad) < 0) {
    errors.edad = "La edad no puede ser negativa";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validacion estricta para Publicar una mascota en el catalogo publico.
 * Requiere fotos, descripcion detallada, historia, datos medicos y atributos completos.
 */
export function validatePetPublish(data: Partial<PetFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  // 1. Nombre
  const nombre = (data.nombre || "").trim();
  if (!nombre) {
    errors.nombre = "El nombre es obligatorio para publicar";
  } else if (nombre.length < 2) {
    errors.nombre = "El nombre debe tener al menos 2 caracteres";
  } else if (nombre.length > 100) {
    errors.nombre = "El nombre no puede exceder 100 caracteres";
  }

  // 2. Especie
  if (!data.especie || (data.especie !== "Perro" && data.especie !== "Gato" && data.especie !== "PERRO" && data.especie !== "GATO" && data.especie !== "OTRO")) {
    errors.especie = "Debes seleccionar una especie valida";
  }

  // 3. Sexo
  if (!data.sexo || (data.sexo !== "Macho" && data.sexo !== "Hembra" && data.sexo !== "MACHO" && data.sexo !== "HEMBRA")) {
    errors.sexo = "Debes seleccionar el sexo de la mascota";
  }

  // 4. Descripcion general
  const descripcion = (data.descripcion || "").trim();
  if (!descripcion) {
    errors.descripcion = "La descripcion es obligatoria para publicar";
  } else if (descripcion.length < 15) {
    errors.descripcion = "La descripcion debe tener al menos 15 caracteres";
  }

  // 5. Historia / Rescate
  const historia = (data.historia || "").trim();
  if (!historia) {
    errors.historia = "La historia o motivo de rescate es obligatoria para publicar";
  } else if (historia.length < 20) {
    errors.historia = "La historia debe tener al menos 20 caracteres";
  }

  // 6. Imagen
  const imagen = (data.imagen || "").trim();
  if (!imagen) {
    errors.imagen = "Debes seleccionar o cargar al menos una imagen principal";
  }

  // 7. Peso y Edad
  if (data.peso === undefined || data.peso === null || Number(data.peso) <= 0) {
    errors.peso = "Ingresa un peso valido mayor a 0 kg";
  }

  if (data.edad === undefined || data.edad === null || Number(data.edad) < 0) {
    errors.edad = "Ingresa una edad valida mayor o igual a 0 años";
  }

  // 8. Estado de salud (se requiere definir al menos uno)
  if (data.vacunacion === null || data.vacunacion === undefined) {
    errors.vacunacion = "Indica si la mascota cuenta con vacunación";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Calcula los campos pendientes para completar un borrador.
 * Util para mostrar etiquetas o barras de progreso en el panel.
 */
export function getMissingDraftFields(data: Partial<PetFormData>): string[] {
  const missing: string[] = [];
  if (!data.imagen || !data.imagen.trim()) missing.push("Foto principal");
  if (!data.descripcion || data.descripcion.trim().length < 15) missing.push("Descripción");
  if (!data.historia || data.historia.trim().length < 20) missing.push("Historia");
  if (!data.peso || Number(data.peso) <= 0) missing.push("Peso");
  if (data.vacunacion === null || data.vacunacion === undefined) missing.push("Estado de vacunación");
  return missing;
}

