import type { WeaponData } from '$lib/api/inventory';
import { DAMAGE_TYPES, type DamageType } from '$lib/rules/2024';

export const DAMAGE_LABELS: Record<DamageType, string> = {
  acid: 'Ácido', bludgeoning: 'Contundente', cold: 'Frío', fire: 'Fuego', force: 'Fuerza',
  lightning: 'Relámpago', necrotic: 'Necrótico', piercing: 'Perforante', poison: 'Veneno',
  psychic: 'Psíquico', radiant: 'Radiante', slashing: 'Cortante', thunder: 'Trueno'
};
export const WEAPON_DICE = [4, 6, 8, 10, 12, 20];
export type WeaponHandling = 'one-handed' | 'two-handed' | 'versatile';
export interface WeaponForm {
  damageMode: 'dice' | 'fixed';
  fixedDamage: number;
  handling: WeaponHandling;
  diceCount: number;
  dieSize: number;
  twoHandedDiceCount: number;
  twoHandedDieSize: number;
  damageType: DamageType;
  magicBonus: number;
  isMagical: boolean;
  requiresAttunement: boolean;
}
export function weaponFormFromData(data?: WeaponData): WeaponForm {
  const dice = /^(\d+)d(\d+)$/i.exec(data?.damageDice?.trim() || '1d6');
  const versatile = /^(\d+)d(\d+)$/i.exec(data?.properties?.versatile?.trim() || '');
  const damageType = data?.damageType?.toLowerCase() as DamageType;
  return {
    damageMode: /^\d+$/.test(data?.damageDice || '') ? 'fixed' : 'dice',
    fixedDamage: /^\d+$/.test(data?.damageDice || '') ? Number(data?.damageDice) : 0,
    handling: data?.properties?.twoHanded ? 'two-handed' : versatile ? 'versatile' : 'one-handed',
    diceCount: dice ? Number(dice[1]) : 1,
    dieSize: dice ? Number(dice[2]) : 6,
    twoHandedDiceCount: versatile ? Number(versatile[1]) : dice ? Number(dice[1]) : 1,
    twoHandedDieSize: versatile ? Number(versatile[2]) : 8,
    damageType: DAMAGE_TYPES.includes(damageType) ? damageType : 'slashing',
    magicBonus: data?.magicBonus ?? 0,
    isMagical: data?.isMagical ?? ((data?.magicBonus ?? 0) > 0 || data?.requiresAttunement === true),
    requiresAttunement: data?.requiresAttunement ?? false
  };
}
export function validateWeaponForm(form: WeaponForm): string {
  if (!['one-handed','two-handed','versatile'].includes(form.handling)) return 'Elegí cómo se usa el arma.';
  if (form.damageMode === 'fixed') {
    if(!Number.isInteger(form.fixedDamage) || form.fixedDamage<0 || form.fixedDamage>999) return 'El daño fijo debe ser un entero entre 0 y 999.';
  } else if(form.damageMode === 'dice') {
    if (!Number.isInteger(form.diceCount) || form.diceCount < 1 || form.diceCount > 100) return 'La cantidad de dados debe ser un entero entre 1 y 100.';
    if (!WEAPON_DICE.includes(form.dieSize)) return 'Elegí un dado de daño válido.';
  } else return 'Elegí el modo de daño.';
  if (form.handling === 'versatile') {
    if (!Number.isInteger(form.twoHandedDiceCount) || form.twoHandedDiceCount < 1 || form.twoHandedDiceCount > 100) return 'La cantidad de dados a dos manos debe ser un entero entre 1 y 100.';
    if (!WEAPON_DICE.includes(form.twoHandedDieSize)) return 'Elegí un dado válido para el daño a dos manos.';
  }
  if (!DAMAGE_TYPES.includes(form.damageType)) return 'Elegí un tipo de daño válido.';
  if (!Number.isInteger(form.magicBonus) || form.magicBonus < 0 || form.magicBonus > 5) return 'El bono del arma debe ser un entero entre +0 y +5.';
  if (!form.isMagical && form.magicBonus !== 0) return 'Un arma no mágica debe tener bono +0.';
  if (!form.isMagical && form.requiresAttunement) return 'La sintonización requiere marcar el arma como mágica.';
  return '';
}
export function weaponDataFromForm(form: WeaponForm, original?: WeaponData): WeaponData {
  const error = validateWeaponForm(form);
  if (error) throw new Error(error);
  const properties = { ...original?.properties, twoHanded: form.handling === 'two-handed' };
  if (form.handling === 'versatile') properties.versatile = `${form.twoHandedDiceCount}d${form.twoHandedDieSize}`;
  else delete properties.versatile;
  return {
    ...original, weaponType: original?.weaponType || 'simple', properties,
    damageDice: form.damageMode==='fixed'?String(form.fixedDamage):`${form.diceCount}d${form.dieSize}`, damageType: form.damageType,
    magicBonus: form.magicBonus, isMagical: form.isMagical, requiresAttunement: form.requiresAttunement
  };
}
