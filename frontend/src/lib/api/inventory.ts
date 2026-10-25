import { catalogApi } from './catalog';
import type { CatalogSource } from '$lib/types';
import { plainText } from '$lib/utils/plainText';
// ===========================
// TYPES
// ===========================

export interface InventoryItem {
  isMagical?: boolean;
  requiresAttunement?: boolean;
  id: string;
  characterId: string;
  campaignId: string;
  name: string;
  type: string;
  description?: string;
  quantity: number;
  value: number;
  weaponData?: WeaponData;
  armorData?: ArmorData;
  open5eSlug?: string;
  rarity?: string; // ✅ NUEVO
  createdAt: string;
  updatedAt: string;
}

export interface WeaponData {
  weaponType: string;
  damageDice: string;
  damageType: string;
  properties: WeaponProperties;
  magicBonus?: number;
  isMagical?: boolean;
  requiresAttunement?: boolean;
}

export interface WeaponProperties {
  light?: boolean;
  finesse?: boolean;
  thrown?: boolean;
  twoHanded?: boolean;
  versatile?: string;
  reach?: boolean;
  loading?: boolean;
  heavy?: boolean;
  ammunition?: boolean;
  range?: WeaponRange;
}

export interface WeaponRange {
  normal: number;
  max: number;
}

export interface ArmorData {
  armorType: string;
  baseAC: number;
  dexModifier?: string;
  strengthRequirement?: number;
  stealthDisadvantage?: boolean;
  magicBonus?: number;
  isMagical?: boolean;
  requiresAttunement?: boolean;
}

export interface Currency {
  copper: number;
  silver: number;
  gold: number;
  platinum: number;
}

export interface InventoryResponse {
  items: InventoryItem[];
  currency: Currency;
  totalValue: number;
}

export interface Open5eItem {
  weight?:string|number;
  weight_unit?:string;
  requires_attunement?:boolean|string;
  attunement_detail?:string|null;
  catalogData?: Partial<InventoryItem>;
  catalogSource?: CatalogSource;
  slug: string;
  name: string;
  type: string;
  desc: string;
  rarity?: string;
  cost?: string | number | { amount?: number; currency?: string };
  
  // Weapon
  damage?: string;
  damage_type?: string;
  weapon_range?: string;
  properties?: string[] | Array<{ name: string }>;
  category?: string;
  
  // Armor
  armor_class?: string | number | { base?: number };
  ac_string?: string;
  strength_requirement?: number;
  stealth_disadvantage?: boolean;
  
  document__slug?: string;
  source?: string;
}

export interface Open5eSearchResult {
  count: number;
  next: string | null;
  previous: string | null;
  results: Open5eItem[];
}

export { sparkInventory as inventoryApi } from './sparkInventory';

// Compatibility facade for existing forms; requests stay on our own origin.
export const open5eInventoryApi = {
  searchItems: catalogApi.searchItems,
  getItem: catalogApi.getItem,

  /**
   * ✅ MEJORADO: Conversión más robusta con mejor manejo de datos
   */
// REEMPLAZAR CON:
convertToInventoryItem: (open5eItem: any): Partial<InventoryItem> => {
  if (open5eItem.catalogData) return JSON.parse(JSON.stringify(open5eItem.catalogData));
  const name = open5eItem.name || '';
  const description = cleanDescription(open5eItem.desc || '', 1000);
  const value = parseCostRobust(open5eItem.cost);
  
  let inferredType: InventoryItem['type'] = 'other';
  
  // 🔥 FIX: Detectar armas PRIMERO (más específico)
  if (open5eItem.damage_dice || open5eItem.damage_type || open5eItem.damage) {
    inferredType = 'weapon';
  }
  // Armor: tiene armor_class o ac_string
  else if (open5eItem.armor_class || open5eItem.ac_string) {
    inferredType = 'armor';
  }
  // Shield: categoría específica
  else if (open5eItem.category && open5eItem.category.toLowerCase().includes('shield')) {
    inferredType = 'shield';
  }
  // Consumables
  else if (detectConsumable(name, description)) {
    inferredType = 'consumable';
  }
  // Tool
  else if (open5eItem.category && open5eItem.category.toLowerCase().includes('tool')) {
    inferredType = 'tool';
  }
  // Treasure
  else if (open5eItem.rarity && !['common', 'none'].includes(open5eItem.rarity.toLowerCase())) {
    inferredType = 'treasure';
  }

  const item: Partial<InventoryItem> = {
    name,
    description,
    quantity: 1,
    open5eSlug: open5eItem.slug,
    value,
    type: inferredType,
    rarity: open5eItem.rarity || 'common',
  };

  // ✅ Weapon data
  if (inferredType === 'weapon') {
    item.weaponData = {
      weaponType: open5eItem.category || 'simple',
      damageDice: open5eItem.damage_dice || open5eItem.damage || '1d4',
      damageType: open5eItem.damage_type || 'bludgeoning',
      properties: parseWeaponProperties(open5eItem.properties, open5eItem.desc),
      magicBonus: extractMagicBonus(name),
      isMagical: open5eItem.source === 'magicitems' || extractMagicBonus(name) > 0,
      requiresAttunement: !!open5eItem.requires_attunement
    };
  }

  // ✅ Armor data
  if (inferredType === 'armor' || inferredType === 'shield') {
    item.armorData = {
      armorType: open5eItem.category || 'light',
      baseAC: parseBaseAC(open5eItem.armor_class || open5eItem.ac_string),
      dexModifier: parseDexModifier(open5eItem),
      strengthRequirement: open5eItem.strength_requirement,
      stealthDisadvantage: open5eItem.stealth_disadvantage || false,
      magicBonus: extractMagicBonus(name),
      isMagical: open5eItem.source === 'magicitems' || extractMagicBonus(name) > 0,
      requiresAttunement: !!open5eItem.requires_attunement
    };
  }

  if(!['weapon','armor','shield'].includes(inferredType)) {
    item.isMagical=open5eItem.source==='magicitems';
    item.requiresAttunement=!!open5eItem.requires_attunement;
  }
  return item;
},

  cleanDescription: (html: string, maxLength: number = 200): string => {
    return cleanDescription(html, maxLength);
  }
};

// ===========================
// HELPER FUNCTIONS - MEJORADOS
// ===========================

// ✅ SOLO para consumibles (no hay campo directo en Open5e)
function detectConsumable(name: string, description: string): boolean {
  const nameLower = name.toLowerCase();
  const descLower = description.toLowerCase();
  
  const consumableKeywords = [
    'potion', 'elixir', 'oil', 'scroll', 
    'poison', 'antidote', 'philter'
  ];
  
  return consumableKeywords.some(keyword => 
    nameLower.includes(keyword) || descLower.includes(keyword)
  );
}

function cleanDescription(html: string, maxLength: number = 200): string {
  return plainText(html,maxLength);
}

/**
 * ✅ MEJORADO: Parser de costo robusto
 */
function parseCostRobust(cost: any): number {
  // ✅ Open5e puede devolver: "50 gp", {quantity: 50, unit: "gp"}, o 50
  
  if (typeof cost === 'number') {
    return cost;
  }
  
  if (!cost) return 0;
  
  // Formato objeto (algunos items)
  if (typeof cost === 'object') {
    const amount = parseFloat(cost.quantity || cost.amount || 0);
    const unit = (cost.unit || cost.currency || 'gp').toLowerCase();
    return convertToGold(amount, unit);
  }
  
  // Formato string: "50 gp"
  const costStr = String(cost).trim();
  const match = costStr.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)?$/i);
  
  if (match) {
    const amount = parseFloat(match[1]);
    const currency = (match[2] || 'gp').toLowerCase();
    return convertToGold(amount, currency);
  }
  
  return 0;
}

function convertToGold(amount: number, currency: string): number {
  const rates: Record<string, number> = {
    cp: 0.01,
    sp: 0.1,
    ep: 0.5,
    gp: 1,
    pp: 10
  };
  return amount * (rates[currency] || 1);
}

/**
 * ✅ MEJORADO: Parser de datos de arma más robusto
 */

function parseWeaponProperties(
  properties: any, 
  description?: string
): WeaponProperties {
  const props: WeaponProperties = {};
  
  if (!properties) return props;
  
  // ✅ Open5e devuelve array de objetos: [{name: "Light"}, {name: "Finesse"}]
  const propNames = Array.isArray(properties) 
    ? properties.map(p => typeof p === 'string' ? p : p.name)
    : [];
  
  // ✅ Map directo sin includes
  const propSet = new Set(propNames.map(p => p.toLowerCase()));
  
  props.light = propSet.has('light');
  props.finesse = propSet.has('finesse');
  props.thrown = propSet.has('thrown');
  props.twoHanded = propSet.has('two-handed');
  props.reach = propSet.has('reach');
  props.loading = propSet.has('loading');
  props.heavy = propSet.has('heavy');
  props.ammunition = propSet.has('ammunition');
  
  // ✅ VERSATILE: necesita parseo porque viene como "Versatile (1d10)"
  const versatileProp = propNames.find(p => 
    p.toLowerCase().startsWith('versatile')
  );
  if (versatileProp) {
    const match = versatileProp.match(/\(([0-9]+d[0-9]+)\)/);
    if (match) props.versatile = match[1];
  }
  
  return props;
}

function extractMagicBonus(name: string): number {
  const magicMatch = name.match(/\+(\d+)/);
  return magicMatch ? parseInt(magicMatch[1], 10) : 0;
}

/**
 * Parsea AC base de múltiples formatos
 */
function parseBaseAC(armorClass: any): number {
  // ✅ Open5e devuelve número directo o objeto {base: X}
  
  if (typeof armorClass === 'number') {
    return armorClass;
  }
  
  if (typeof armorClass === 'object' && armorClass?.base) {
    return armorClass.base;
  }
  
  // Solo como fallback si viene string
  if (typeof armorClass === 'string') {
    const num = parseInt(armorClass);
    if (!isNaN(num)) return num;
  }
  
  return 10; // Default
}

/**
 * Parsea modificador de DEX de la descripción
 */
function parseDexModifier(item: any): string {
  // ✅ Open5e tiene campo 'category' que define esto directamente
  const category = (item.category || '').toLowerCase();
  // Map directo sin includes
  const modifiers: Record<string, string> = {
    'Heavy Armor': 'none',
    'Medium Armor': 'max2',
    'Light Armor': 'full'
  };
  
  return modifiers[category] || 'full';
}
