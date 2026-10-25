import type { ArmorData } from '$lib/api/inventory';

export interface ArmorForm {
  baseAC: number;
  magicBonus: number;
  isMagical: boolean;
  requiresAttunement: boolean;
}
export function armorFormFromData(data?: ArmorData, type = 'armor'): ArmorForm {
  return {
    baseAC: data?.baseAC ?? (type === 'shield' ? 2 : 10),
    magicBonus: data?.magicBonus ?? 0,
    isMagical: data?.isMagical ?? ((data?.magicBonus ?? 0) > 0 || data?.requiresAttunement === true),
    requiresAttunement: data?.requiresAttunement ?? false
  };
}
export function validateArmorForm(form: ArmorForm): string {
  if (!Number.isInteger(form.baseAC) || form.baseAC < 0 || form.baseAC > 99) return 'La CA base debe ser un entero entre 0 y 99.';
  if (!Number.isInteger(form.magicBonus) || form.magicBonus < 0 || form.magicBonus > 3) return 'El bono de CA debe ser un entero entre +0 y +3.';
  if (!form.isMagical && form.magicBonus !== 0) return 'Una armadura no mágica debe tener bono +0.';
  if (!form.isMagical && form.requiresAttunement) return 'La sintonización requiere marcar el objeto como mágico.';
  return '';
}
export function armorDataFromForm(form: ArmorForm, original?: ArmorData, type = 'armor'): ArmorData {
  const error = validateArmorForm(form);
  if (error) throw new Error(error);
  return { ...original, armorType: type === 'shield' ? 'Shield' : original?.armorType || 'Light Armor', ...form };
}
