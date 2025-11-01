// frontend/src/lib/utils/inventory-validation.ts

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
  
  return { valid: true };
}

export function validateItemQuantity(quantity: number): ValidationResult {
  if (quantity < 1) {
    return { valid: false, error: 'La cantidad mínima es 1' };
  }
  
  if (quantity > 999) {
    return { valid: false, error: 'La cantidad máxima es 999' };
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
  
  if (value > 999999) {
    return { valid: false, error: 'El valor máximo es 999,999 gp' };
  }
  
  return { valid: true };
}

export function validateItemDescription(description: string): ValidationResult {
  if (description.length > 1000) {
    return { valid: false, error: 'La descripción no puede tener más de 1000 caracteres' };
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
  
  if (currency > 999999) {
    return { valid: false, error: 'El máximo es 999,999' };
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