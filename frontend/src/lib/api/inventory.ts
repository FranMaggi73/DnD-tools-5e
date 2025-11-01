// frontend/src/lib/api/inventory.ts
// ✨ CORREGIDO: Mejor parsing, manejo de errores, cache de búsquedas

import { get } from 'svelte/store';
import { tokenStore } from '$lib/stores/authStore';

const API_BASE_URL = import.meta.env.MODE === 'development'
  ? 'http://localhost:8080/api'
  : (import.meta.env.VITE_API_URL || 'https://dm-events-backend-858373640437.us-central1.run.app/api');

// ===========================
// TYPES
// ===========================

export interface InventoryItem {
  id: string;
  characterId: string;
  campaignId: string;
  name: string;
  type: string;
  description?: string;
  quantity: number;
  value: number;
  weight?: number; // ✅ NUEVO
  equipped?: boolean; // ✅ NUEVO
  weaponData?: WeaponData;
  armorData?: ArmorData;
  open5eSlug?: string;
  rarity?: string; // ✅ NUEVO
  attunement?: boolean; // ✅ NUEVO
  attuned?: boolean; // ✅ NUEVO
  createdAt: string;
  updatedAt: string;
}

export interface WeaponData {
  weaponType: string;
  damageDice: string;
  damageType: string;
  properties: WeaponProperties;
  magicBonus?: number;
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
  slug: string;
  name: string;
  type: string;
  desc: string;
  rarity?: string;
  cost?: string | number | { amount?: number; currency?: string };
  weight?: string | number;
  requires_attunement?: boolean | string;
  
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

// ===========================
// CACHE DE BÚSQUEDAS
// ===========================

interface SearchCache {
  query: string;
  results: Open5eSearchResult;
  timestamp: number;
}

const searchCache = new Map<string, SearchCache>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

function getCachedSearch(query: string): Open5eSearchResult | null {
  const cached = searchCache.get(query.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.results;
  }
  searchCache.delete(query.toLowerCase());
  return null;
}

function setCachedSearch(query: string, results: Open5eSearchResult): void {
  searchCache.set(query.toLowerCase(), {
    query,
    results,
    timestamp: Date.now()
  });
}

// ===========================
// API FUNCTIONS
// ===========================

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = get(tokenStore);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error en la petición' }));
    throw new Error(error.error || 'Error en la petición');
  }

  return response.json();
}

export const inventoryApi = {
  getInventory: (characterId: string) =>
    fetchWithAuth<InventoryResponse>(`/characters/${characterId}/inventory`),

  createItem: (characterId: string, data: {
    name: string;
    type: string;
    description?: string;
    quantity: number;
    value: number;
    weight?: number;
    weaponData?: any;
    armorData?: any;
    open5eSlug?: string;
    rarity?: string;
    attunement?: boolean;
  }) =>
    fetchWithAuth<InventoryItem>(`/characters/${characterId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateItem: (itemId: string, data: {
    name?: string;
    description?: string;
    quantity?: number;
    value?: number;
    equipped?: boolean;
    attuned?: boolean;
  }) =>
    fetchWithAuth<InventoryItem>(`/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteItem: (itemId: string) =>
    fetchWithAuth<{ message: string }>(`/items/${itemId}`, {
      method: 'DELETE',
    }),

  updateCurrency: (characterId: string, currency: Partial<Currency>) =>
    fetchWithAuth<Currency>(`/characters/${characterId}/currency`, {
      method: 'PUT',
      body: JSON.stringify(currency),
    }),
};

// ===========================
// OPEN5E API - MEJORADO
// ===========================

// ✅ Controller para cancelar búsquedas anteriores
let currentSearchController: AbortController | null = null;

export const open5eInventoryApi = {
  /**
   * ✅ MEJORADO: Búsqueda con cache y cancelación
   */
  searchItems: async (query: string, type?: string): Promise<Open5eSearchResult> => {
    const searchQuery = query.trim().toLowerCase();
    
    // ✅ Verificar cache primero
    const cached = getCachedSearch(searchQuery);
    if (cached) {
      console.log('📦 Using cached search results for:', searchQuery);
      return cached;
    }

    // ✅ Cancelar búsqueda anterior
    if (currentSearchController) {
      currentSearchController.abort();
    }
    currentSearchController = new AbortController();
    
    try {
      const [magicItems, weapons, armor, gear] = await Promise.all([
        fetch(`https://api.open5e.com/v1/magicitems/?search=${encodeURIComponent(searchQuery)}&limit=20`, {
          signal: currentSearchController.signal
        }).then(r => r.json()).catch(() => ({ results: [] })),
        
        fetch(`https://api.open5e.com/v1/weapons/?search=${encodeURIComponent(searchQuery)}&limit=20`, {
          signal: currentSearchController.signal
        }).then(r => r.json()).catch(() => ({ results: [] })),
        
        fetch(`https://api.open5e.com/v1/armor/?search=${encodeURIComponent(searchQuery)}&limit=20`, {
          signal: currentSearchController.signal
        }).then(r => r.json()).catch(() => ({ results: [] })),
        
        fetch(`https://api.open5e.com/v1/gear/?search=${encodeURIComponent(searchQuery)}&limit=20`, {
          signal: currentSearchController.signal
        }).then(r => r.json()).catch(() => ({ results: [] }))
      ]);
      
      const allResults = [
        ...(magicItems.results || []).map((item: any) => ({ ...item, source: 'magicitems' })),
        ...(weapons.results || []).map((item: any) => ({ ...item, source: 'weapons' })),
        ...(armor.results || []).map((item: any) => ({ ...item, source: 'armor' })),
        ...(gear.results || []).map((item: any) => ({ ...item, source: 'gear' }))
      ];
      
      const filtered = allResults
        .filter((item: any) => {
          const name = item.name.toLowerCase();
          return name.includes(searchQuery);
        })
        .sort((a: any, b: any) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aStarts = aName.startsWith(searchQuery);
          const bStarts = bName.startsWith(searchQuery);
          
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          
          return aName.length - bName.length;
        })
        .slice(0, 30);
      
      const result: Open5eSearchResult = {
        count: filtered.length,
        next: null,
        previous: null,
        results: filtered
      };

      // ✅ Guardar en cache
      setCachedSearch(searchQuery, result);
      
      return result;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🚫 Search cancelled');
        throw error;
      }
      console.error('Error searching Open5e:', error);
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }
  },

  getItem: async (slug: string, category: string = 'magicitems'): Promise<Open5eItem> => {
    const response = await fetch(`https://api.open5e.com/v1/${category}/${slug}/`);
    if (!response.ok) throw new Error('Error obteniendo item');
    return response.json();
  },

  /**
   * ✅ MEJORADO: Conversión más robusta con mejor manejo de datos
   */
  convertToInventoryItem: (open5eItem: any): Partial<InventoryItem> => {
    // Helper para extraer valor seguro
    const getSafe = (obj: any, ...keys: string[]): any => {
      for (const key of keys) {
        const val = obj?.[key];
        if (val !== undefined && val !== null && val !== '') return val;
      }
      return undefined;
    };

    // Descripción limpia
    const descriptionRaw = getSafe(open5eItem, 'desc', 'description', 'long_description', 'text');
    const description = cleanDescription(descriptionRaw || '', 1000);

    // ✅ MEJORADO: Parser de costo más robusto
    const costRaw = getSafe(open5eItem, 'cost', 'price', 'cost_string', 'value', 'cost_text');
    const value = parseCostRobust(costRaw);

    // ✅ MEJORADO: Peso
    const weightRaw = getSafe(open5eItem, 'weight');
    const weight = parseWeight(weightRaw);

    // Detectar origen/categoría
    const sourceField = String(getSafe(open5eItem, 'source', 'category', 'type', 'document__slug') || '').toLowerCase();
    const name = String(open5eItem.name || open5eItem.title || '').trim();
    const nameLower = name.toLowerCase();

    // ✅ MEJORADO: Detección de tipo
    let inferredType: InventoryItem['type'] = 'other';
    if (sourceField.includes('weapon') || open5eItem.damage || open5eItem.damage_type || nameLower.match(/sword|axe|bow|mace|spear|dagger/)) {
      inferredType = 'weapon';
    } else if (sourceField.includes('armor') || open5eItem.armor_class || open5eItem.ac_string || nameLower.includes('armor') || nameLower.includes('armour')) {
      if (nameLower.includes('shield') || sourceField.includes('shield')) {
        inferredType = 'shield';
      } else {
        inferredType = 'armor';
      }
    } else if (nameLower.match(/potion|elixir|scroll|oil/) || (open5eItem.subtype && open5eItem.subtype.toLowerCase().includes('consumable'))) {
      inferredType = 'consumable';
    } else if (open5eItem.rarity && !['common', 'none'].includes(String(open5eItem.rarity).toLowerCase())) {
      inferredType = 'treasure';
    }

    // ✅ MEJORADO: Attunement detection
    const attuneRaw = getSafe(open5eItem, 'requires_attunement', 'attunement', 'requiresAttunement');
    let attunement = false;
    if (attuneRaw !== undefined) {
      const attuneStr = String(attuneRaw).toLowerCase();
      attunement = attuneStr.includes('yes') || attuneStr.includes('requires') || attuneRaw === true;
    }

    // Crear objeto base
    const item: Partial<InventoryItem> = {
      name,
      description,
      quantity: 1,
      open5eSlug: getSafe(open5eItem, 'slug', 'document__slug', 'id'),
      value,
      weight,
      type: inferredType,
      rarity: open5eItem.rarity || 'common',
      attunement,
    };

    // Parsear datos específicos
    try {
      if (inferredType === 'weapon') {
        item.weaponData = parseWeaponDataRobust(open5eItem);
      } else if (inferredType === 'armor' || inferredType === 'shield') {
        item.armorData = parseArmorDataRobust(open5eItem);
      }
    } catch (err) {
      console.warn('Error parsing weapon/armor data:', err);
    }

    // Detectar magic bonus en el nombre
    const magicMatch = name.match(/\+(\d+)/);
    if (magicMatch) {
      const bonus = parseInt(magicMatch[1], 10);
      if (!isNaN(bonus)) {
        if (item.weaponData) item.weaponData.magicBonus = bonus;
        if (item.armorData) item.armorData.magicBonus = bonus;
      }
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

function cleanDescription(html: string, maxLength: number = 200): string {
  if (!html) return '';
  
  const temp = document.createElement('div');
  temp.innerHTML = html;
  let text = temp.textContent || temp.innerText || '';
  
  text = text.replace(/\s+/g, ' ').trim();
  
  if (text.length > maxLength) {
    text = text.substring(0, maxLength).trim() + '...';
  }
  
  return text;
}

/**
 * ✅ MEJORADO: Parser de costo robusto
 */
function parseCostRobust(cost: any): number {
  if (typeof cost === 'number') return Math.max(0, cost);
  if (!cost) return 0;
  
  // ✅ Si es objeto {amount: 50, currency: "gp"}
  if (typeof cost === 'object' && cost.amount !== undefined) {
    const amount = parseFloat(cost.amount);
    const currency = (cost.currency || 'gp').toLowerCase();
    return convertToGold(amount, currency);
  }
  
  const costStr = String(cost).toLowerCase();
  
  // ✅ Buscar patrón: número + moneda
  const match = costStr.match(/(\d+(?:[.,]\d+)?)\s*(?:pieces?\s+of\s+)?(cp|sp|ep|gp|pp|copper|silver|electrum|gold|platinum)/);
  if (match) {
    const amount = parseFloat(match[1].replace(',', '.'));
    let currency = match[2];
    
    // Normalizar nombres largos
    if (currency === 'copper') currency = 'cp';
    if (currency === 'silver') currency = 'sp';
    if (currency === 'electrum') currency = 'ep';
    if (currency === 'gold') currency = 'gp';
    if (currency === 'platinum') currency = 'pp';
    
    return convertToGold(amount, currency);
  }
  
  // ✅ Si solo hay número, asumir GP
  const numMatch = costStr.match(/(\d+(?:[.,]\d+)?)/);
  if (numMatch) {
    return parseFloat(numMatch[1].replace(',', '.'));
  }
  
  return 0;
}

function convertToGold(amount: number, currency: string): number {
  const conversions: Record<string, number> = {
    cp: 0.01,
    sp: 0.1,
    ep: 0.5,
    gp: 1,
    pp: 10
  };
  
  return amount * (conversions[currency] || 1);
}

/**
 * ✅ NUEVO: Parser de peso
 */
function parseWeight(weight: any): number {
  if (typeof weight === 'number') return weight;
  if (!weight) return 0;
  
  const weightStr = String(weight).toLowerCase();
  const match = weightStr.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds)?/);
  
  if (match) {
    return parseFloat(match[1]);
  }
  
  return 0;
}

/**
 * ✅ MEJORADO: Parser de datos de arma más robusto
 */
function parseWeaponDataRobust(item: any): WeaponData {
  const weaponData: WeaponData = {
    weaponType: item.category || 'simple_melee',
    damageDice: item.damage || '1d4',
    damageType: item.damage_type || 'bludgeoning',
    properties: parseWeaponProperties(item),
  };
  
  const magicMatch = item.name.match(/\+(\d+)/);
  if (magicMatch) {
    weaponData.magicBonus = parseInt(magicMatch[1]);
  }
  
  return weaponData;
}

function parseWeaponProperties(item: any): WeaponProperties {
  const props: WeaponProperties = {};
  
  const properties = item.properties || [];
  
  if (Array.isArray(properties)) {
    properties.forEach((prop: any) => {
      const p = (typeof prop === 'string' ? prop : prop.name || '').toLowerCase();
      
      if (p.includes('light')) props.light = true;
      if (p.includes('finesse')) props.finesse = true;
      if (p.includes('thrown')) props.thrown = true;
      if (p.includes('two-handed') || p.includes('two handed')) props.twoHanded = true;
      if (p.includes('reach')) props.reach = true;
      if (p.includes('loading')) props.loading = true;
      if (p.includes('heavy')) props.heavy = true;
      if (p.includes('ammunition')) props.ammunition = true;
      
      const versatileMatch = p.match(/versatile\s*\(([^)]+)\)/);
      if (versatileMatch) {
        props.versatile = versatileMatch[1];
      }
    });
  }
  
  if (item.weapon_range || item.range) {
    const rangeStr = item.weapon_range || item.range;
    const rangeMatch = String(rangeStr).match(/(\d+)(?:\/(\d+))?/);
    if (rangeMatch) {
      props.range = {
        normal: parseInt(rangeMatch[1]),
        max: rangeMatch[2] ? parseInt(rangeMatch[2]) : parseInt(rangeMatch[1]) * 3
      };
    }
  }
  
  return props;
}

/**
 * ✅ MEJORADO: Parser de armadura más robusto
 */
function parseArmorDataRobust(item: any): ArmorData {
  const armor: ArmorData = {
    armorType: detectArmorType(item.name),
    baseAC: 10,
    dexModifier: 'full',
  };
  
  // ✅ MEJORADO: Parsear AC desde múltiples fuentes
  let acValue = 10;
  
  if (typeof item.armor_class === 'number') {
    acValue = item.armor_class;
  } else if (typeof item.armor_class === 'object' && item.armor_class?.base) {
    acValue = item.armor_class.base;
  } else if (typeof item.armor_class === 'string') {
    const acMatch = item.armor_class.match(/(\d+)/);
    if (acMatch) acValue = parseInt(acMatch[1]);
  } else if (item.ac_string) {
    const acMatch = String(item.ac_string).match(/(\d+)/);
    if (acMatch) acValue = parseInt(acMatch[1]);
  }
  
  // ✅ Para shields, valor por defecto es +2 si no se especifica
  if (detectArmorType(item.name) === 'shield' && acValue === 10) {
    acValue = 2;
  }
  
  armor.baseAC = acValue;
  
  // Detectar modificador de DEX
  const acStr = String(item.armor_class || item.ac_string || '').toLowerCase();
  if (acStr.includes('dex modifier')) {
    armor.dexModifier = 'full';
  } else if (acStr.includes('max 2') || acStr.includes('maximum of 2')) {
    armor.dexModifier = 'max2';
  } else if (!acStr.includes('dex') && armor.armorType !== 'light') {
    armor.dexModifier = 'none';
  }
  
  if (item.strength_requirement) {
    armor.strengthRequirement = item.strength_requirement;
  }
  
  if (item.stealth_disadvantage) {
    armor.stealthDisadvantage = true;
  }
  
  const magicMatch = item.name.match(/\+(\d+)/);
  if (magicMatch) {
    armor.magicBonus = parseInt(magicMatch[1]);
  }
  
  return armor;
}

function detectArmorType(name: string): string {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('shield')) return 'shield';
  
  if (nameLower.match(/leather|padded|studded/)) {
    return 'light';
  }
  
  if (nameLower.match(/plate|chain mail|splint|ring mail/)) {
    return 'heavy';
  }
  
  if (nameLower.match(/chain|scale|breastplate|half plate/)) {
    return 'medium';
  }
  
  return 'light';
}