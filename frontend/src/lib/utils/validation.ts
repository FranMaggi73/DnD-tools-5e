export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ===== VALIDACIÓN DE CAMPAÑAS =====
export function validateCampaignName(name: string): ValidationResult {
  if (!name || !name.trim()) {
    return { valid: false, error: 'El nombre no puede estar vacío' };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'El nombre no puede tener más de 100 caracteres' };
  }
  
  if (/[<>{}[\]\\]/.test(trimmed)) {
    return { valid: false, error: 'El nombre contiene caracteres no permitidos' };
  }
  
  return { valid: true };
}

// ===== VALIDACIÓN DE PERSONAJES =====
export function validateCharacterName(name: string): ValidationResult {
  if (!name || !name.trim()) {
    return { valid: false, error: 'El nombre no puede estar vacío' };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'El nombre no puede tener más de 50 caracteres' };
  }
  
  return { valid: true };
}

export function validateCharacterClass(className: string): ValidationResult {
  if (!className || !className.trim()) {
    return { valid: false, error: 'La clase no puede estar vacía' };
  }
  
  const trimmed = className.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'La clase debe tener al menos 2 caracteres' };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'La clase no puede tener más de 50 caracteres' };
  }
  
  return { valid: true };
}

export function validateLevel(level: number): ValidationResult {
  if (level < 1) {
    return { valid: false, error: 'El nivel mínimo es 1' };
  }
  
  if (level > 20) {
    return { valid: false, error: 'El nivel máximo es 20' };
  }
  
  return { valid: true };
}

export function validateHP(hp: number, max?: number): ValidationResult {
  if (hp < 0) {
    return { valid: false, error: 'Los HP no pueden ser negativos' };
  }
  
  if (hp > 999) {
    return { valid: false, error: 'Los HP no pueden ser mayores a 999' };
  }
  
  if (max !== undefined && hp > max) {
    return { valid: false, error: 'Los HP no pueden ser mayores que el máximo' };
  }
  
  return { valid: true };
}

export function validateArmorClass(ac: number): ValidationResult {
  if (ac < 1) {
    return { valid: false, error: 'La CA mínima es 1' };
  }
  
  if (ac > 30) {
    return { valid: false, error: 'La CA máxima es 30' };
  }
  
  return { valid: true };
}

export function validateInitiative(initiative: number): ValidationResult {
  if (initiative < -5) {
    return { valid: false, error: 'La iniciativa mínima es -5' };
  }
  
  if (initiative > 15) {
    return { valid: false, error: 'La iniciativa máxima es +15' };
  }
  
  return { valid: true };
}

// ===== VALIDACIÓN DE ENCUENTROS =====
export function validateEncounterName(name: string): ValidationResult {
  if (!name || !name.trim()) {
    return { valid: false, error: 'El nombre no puede estar vacío' };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'El nombre no puede tener más de 100 caracteres' };
  }
  
  return { valid: true };
}

// ===== VALIDACIÓN DE NOTAS =====
export function validateNoteTitle(title: string): ValidationResult {
  if (!title || !title.trim()) {
    return { valid: false, error: 'El título no puede estar vacío' };
  }
  
  const trimmed = title.trim();
  
  if (trimmed.length > 200) {
    return { valid: false, error: 'El título no puede tener más de 200 caracteres' };
  }
  
  return { valid: true };
}

export function validateNoteContent(content: string): ValidationResult {
  if (content.length > 10000) {
    return { valid: false, error: 'El contenido no puede tener más de 10,000 caracteres' };
  }
  
  return { valid: true };
}

export function validateNoteTags(tags: string[]): ValidationResult {
  if (tags.length > 10) {
    return { valid: false, error: 'No puedes tener más de 10 etiquetas' };
  }
  
  for (const tag of tags) {
    if (tag.length > 30) {
      return { valid: false, error: 'Las etiquetas no pueden tener más de 30 caracteres' };
    }
  }
  
  return { valid: true };
}

// ===== HELPER GENERAL =====
export function validateAll(...validations: ValidationResult[]): ValidationResult {
  for (const validation of validations) {
    if (!validation.valid) {
      return validation;
    }
  }
  
  return { valid: true };
}
