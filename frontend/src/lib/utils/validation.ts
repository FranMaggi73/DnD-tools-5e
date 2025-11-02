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
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ===== VALIDACIÓN DE ITEMS =====

export function validateItemName(name: string): ValidationResult {
  if (!name || !name.trim()) {
    return { valid: false, error: 'El nombre no puede estar vacío' };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 1) {
    return { valid: false, error: 'El nombre debe tener al menos 1 carácter' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'El nombre no puede tener más de 100 caracteres' };
  }
  
  // ✅ NUEVO: Validar caracteres especiales peligrosos
  if (/[<>{}[\]\\]/.test(trimmed)) {
    return { valid: false, error: 'El nombre contiene caracteres no permitidos' };
  }
  
  return { valid: true };
}

export function validateItemQuantity(quantity: number): ValidationResult {
  if (quantity < 0) {
    return { valid: false, error: 'La cantidad no puede ser negativa' };
  }
  
  if (quantity > 9999) {
    return { valid: false, error: 'La cantidad máxima es 9,999' };
  }
  
  if (!Number.isInteger(quantity)) {
    return { valid: false, error: 'La cantidad debe ser un número entero' };
  }
  
  return { valid: true };
}

export function validateItemValue(value: number): ValidationResult {
  if (value < 0) {
    return { valid: false, error: 'El valor no puede ser negativo' };
  }
  
  // ✅ CORREGIDO: Límite realista para items legendarios
  if (value > 9999999) {
    return { valid: false, error: 'El valor máximo es 9,999,999 gp' };
  }
  
  // ✅ NUEVO: Advertencia para valores muy altos (no error, solo warning)
  if (value > 500000) {
    return { 
      valid: true, 
      error: '⚠️ Valor muy alto - Verifica que sea correcto' 
    };
  }
  
  return { valid: true };
}

export function validateItemDescription(description: string): ValidationResult {
  if (description.length > 2000) {
    return { valid: false, error: 'La descripción no puede tener más de 2000 caracteres' };
  }
  
  return { valid: true };
}

// ===== VALIDACIÓN DE CURRENCY =====

export function validateCurrency(currency: number): ValidationResult {
  if (currency < 0) {
    return { valid: false, error: 'La moneda no puede ser negativa' };
  }
  
  if (!Number.isInteger(currency)) {
    return { valid: false, error: 'La moneda debe ser un número entero' };
  }
  
  // ✅ CORREGIDO: Límite más realista
  if (currency > 999999999) {
    return { valid: false, error: 'El máximo es 999,999,999' };
  }
  
  // ✅ NUEVO: Advertencia para cantidades muy altas
  if (currency > 100000) {
    return { 
      valid: true, 
      error: '⚠️ Cantidad muy alta - Verifica que sea correcta' 
    };
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

// ===== VALIDACIÓN COMPLETA DE ITEM =====

export interface CreateItemData {
  name: string;
  type: string;
  description?: string;
  quantity: number;
  value: number;
}

export function validateCompleteItem(data: CreateItemData): ValidationResult {
  const nameValidation = validateItemName(data.name);
  if (!nameValidation.valid) return nameValidation;
  
  const quantityValidation = validateItemQuantity(data.quantity);
  if (!quantityValidation.valid) return quantityValidation;
  
  const valueValidation = validateItemValue(data.value);
  if (!valueValidation.valid) return valueValidation;
  
  if (data.description) {
    const descValidation = validateItemDescription(data.description);
    if (!descValidation.valid) return descValidation;
  }
  
  return { valid: true };
}

// ✅ NUEVO: Convertir monedas a GP
export function convertToGold(currency: { copper: number; silver: number; gold: number; platinum: number }): number {
  return (
    currency.copper * 0.01 +
    currency.silver * 0.1 +
    currency.gold +
    currency.platinum * 10
  );
}

// ✅ NUEVO: Convertir GP a monedas óptimas
export function optimizeCurrency(goldAmount: number): { copper: number; silver: number; gold: number; platinum: number } {
  let remaining = Math.round(goldAmount * 100); // Convertir a copper
  
  const platinum = Math.floor(remaining / 1000);
  remaining -= platinum * 1000;
  
  const gold = Math.floor(remaining / 100);
  remaining -= gold * 100;
  
  const silver = Math.floor(remaining / 10);
  remaining -= silver * 10;
  
  return {
    platinum,
    gold,
    silver,
    copper: remaining
  };
}