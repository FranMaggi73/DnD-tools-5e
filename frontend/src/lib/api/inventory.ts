// frontend/src/lib/api/inventory.ts
// ✨ MEJORAS: Mejor parsing de datos de Open5e

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
  weaponData?: WeaponData;
  armorData?: ArmorData;
  open5eSlug?: string;
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
  rarity: string;
  cost?: string;
  
  // Weapon
  damage?: string;
  damage_type?: string;
  weapon_range?: string;
  properties?: string[];
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
    weaponData?: any;
    armorData?: any;
    open5eSlug?: string;
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

export const open5eInventoryApi = {
  /**
   * Buscar items en Open5e con mejor manejo de categorías
   */
  searchItems: async (query: string, type?: string): Promise<Open5eSearchResult> => {
    const searchQuery = query.trim().toLowerCase();
    
    try {
      const [magicItems, weapons, armor, gear] = await Promise.all([
        fetch(`https://api.open5e.com/v1/magicitems/?search=${encodeURIComponent(searchQuery)}&limit=20`)
          .then(r => r.json()).catch(() => ({ results: [] })),
        fetch(`https://api.open5e.com/v1/weapons/?search=${encodeURIComponent(searchQuery)}&limit=20`)
          .then(r => r.json()).catch(() => ({ results: [] })),
        fetch(`https://api.open5e.com/v1/armor/?search=${encodeURIComponent(searchQuery)}&limit=20`)
          .then(r => r.json()).catch(() => ({ results: [] })),
        fetch(`https://api.open5e.com/v1/gear/?search=${encodeURIComponent(searchQuery)}&limit=20`)
          .then(r => r.json()).catch(() => ({ results: [] }))
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
      
      return {
        count: filtered.length,
        next: null,
        previous: null,
        results: filtered
      };
    } catch (error) {
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
   * ✨ MEJORADO: Convertir item de Open5e a formato de inventario
   */
    convertToInventoryItem: (open5eItem: any): Partial<InventoryItem> => {
    console.log('🔍 Converting item:', open5eItem);

    // helpers locales para intentar extraer distintos nombres de campo
    const pickFirst = (...vals: any[]) => {
        for (const v of vals) if (v !== undefined && v !== null && v !== '') return v;
        return undefined;
    };

    // Descripción limpia (usa tu cleanDescription existente)
    const descriptionRaw = pickFirst(open5eItem.desc, open5eItem.description, open5eItem.long_description, open5eItem.text);
    const description = cleanDescription(descriptionRaw || '', 1000);

    // Costo: revisar variantes
    const costRaw = pickFirst(
        open5eItem.cost,
        open5eItem.price,
        open5eItem.cost_string,
        open5eItem.value,
        open5eItem.cost_text
    );
    const value = parseCost(costRaw);

    // Detectar origen/categoría (viene de tu searchItems con source a menudo)
    const sourceField = String(pickFirst(open5eItem.source, open5eItem.category, open5eItem.type, open5eItem.document__slug || '') || '').toLowerCase();
    const name = String(open5eItem.name || open5eItem.title || '').trim();
    const nameLower = name.toLowerCase();

    // Detección de tipo más tolerante
    let inferredType: InventoryItem['type'] = 'other';
    if (sourceField.includes('weapon') || open5eItem.damage || open5eItem.damage_type || nameLower.includes('sword') || nameLower.includes('bow')) {
        inferredType = 'weapon';
    } else if (sourceField.includes('armor') || open5eItem.armor_class || open5eItem.ac_string || nameLower.includes('armor') || nameLower.includes('armour')) {
        // shield detection
        if (nameLower.includes('shield') || sourceField.includes('shield')) {
        inferredType = 'shield';
        } else {
        inferredType = 'armor';
        }
    } else if (nameLower.includes('potion') || nameLower.includes('scroll') || (open5eItem.subtype && open5eItem.subtype.toLowerCase().includes('consumable'))) {
        inferredType = 'consumable';
    } else if (open5eItem.rarity && String(open5eItem.rarity).toLowerCase() !== 'common') {
        inferredType = 'treasure';
    } else {
        // si category explícita como 'gear' -> other/tool
        if (sourceField.includes('gear') || sourceField.includes('equipment')) inferredType = 'other';
    }

    // Crear objeto base
    const item: Partial<InventoryItem> = {
        name,
        description,
        quantity: 1,
        open5eSlug: pickFirst(open5eItem.slug, open5eItem.document__slug, open5eItem.id),
        value,
        type: inferredType,
    };

    // Attunement detection (algunos registros usan 'requires_attunement' o 'attunement')
    const attuneRaw = pickFirst(open5eItem.requires_attunement, open5eItem.attunement, open5eItem.requiresAttunement);
    if (attuneRaw !== undefined) {
        // puede ser 'Yes'/'No' o booleano o 'requires attunement'
        const att = (String(attuneRaw).toLowerCase().includes('yes') || String(attuneRaw).toLowerCase().includes('requires') || attuneRaw === true);
        (item as any).attuned = att;
    }

    // Parsear datos específicos de arma/armadura
    try {
        if (inferredType === 'weapon') {
        item.weaponData = parseWeaponData(open5eItem);
        // Si parseWeaponData no puso damage dice, intentar tomar de campos alternativos
        if (!item.weaponData?.damageDice && (open5eItem.damage || open5eItem.damage_dice)) {
            (item.weaponData as any).damageDice = open5eItem.damage || open5eItem.damage_dice;
        }
        } else if (inferredType === 'armor' || inferredType === 'shield') {
        item.armorData = parseArmorData(open5eItem);
        }
    } catch (err) {
        console.warn('Error parsing weapon/armor data:', err);
    }

    // Extras: detectar magic bonus en el nombre (Ej: "Longsword +1")
    const magicMatch = name.match(/\+(\d+)/);
    if (magicMatch) {
        const bonus = parseInt(magicMatch[1], 10);
        if (!isNaN(bonus)) {
        if (item.weaponData) item.weaponData.magicBonus = bonus;
        if (item.armorData) item.armorData.magicBonus = bonus;
        }
    }

    // Si no hay peso ni valor, dejar 0 explícito (evita undefined)
    item.value = typeof item.value === 'number' ? item.value : 0;

    console.log('✅ Converted item:', item);
    return item;
    },


  cleanDescription: (html: string, maxLength: number = 200): string => {
    return cleanDescription(html, maxLength);
  }
};

// ===========================
// HELPER FUNCTIONS - MEJORADOS
// ===========================

/**
 * ✨ MEJORADO: Limpiar descripción HTML
 */
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
 * ✨ MEJORADO: Parsear costo con más formatos
 */
function parseCost(cost: any): number {
  if (typeof cost === 'number') return cost;
  if (!cost) return 0;
  
  const costStr = String(cost).toLowerCase();
  
  // ✅ FIX: Buscar patrón: número + moneda
  const match = costStr.match(/(\d+(?:[.,]\d+)?)\s*(cp|sp|ep|gp|pp)/);
  if (!match) {
    // ✅ FIX: Si solo hay un número, asumir que es GP
    const numMatch = costStr.match(/(\d+(?:[.,]\d+)?)/);
    if (numMatch) {
      const parsed = parseFloat(numMatch[1].replace(',', '.'));
      console.log(`💰 Parsed cost (assumed GP): "${cost}" → ${parsed}`);
      return parsed;
    }
    return 0;
  }
  
  const amount = parseFloat(match[1].replace(',', '.'));
  const currency = match[2];
  
  // Convertir a GP
  const conversions: Record<string, number> = {
    cp: 0.01,
    sp: 0.1,
    ep: 0.5,
    gp: 1,
    pp: 10
  };
  
  const converted = amount * (conversions[currency] || 1);
  console.log(`💰 Parsed cost: "${cost}" → ${converted} GP`);
  return converted;
}

/**
 * ✨ MEJORADO: Parsear datos de arma
 */
function parseWeaponData(item: any): WeaponData {
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

/**
 * ✨ MEJORADO: Parsear propiedades de arma
 */
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
 * ✨ MEJORADO: Parsear datos de armadura
 */
function parseArmorData(item: any): ArmorData {
  const armor: ArmorData = {
    armorType: detectArmorType(item.name),
    baseAC: 10,
    dexModifier: 'full',
  };
  
  // ✅ FIX: Parsear AC desde múltiples fuentes
  let acValue = 10;
  
  if (typeof item.armor_class === 'number') {
    acValue = item.armor_class;
  } else if (typeof item.armor_class === 'object' && item.armor_class.base) {
    acValue = item.armor_class.base;
  } else if (typeof item.armor_class === 'string') {
    const acMatch = item.armor_class.match(/(\d+)/);
    if (acMatch) acValue = parseInt(acMatch[1]);
  } else if (item.ac_string) {
    const acMatch = String(item.ac_string).match(/(\d+)/);
    if (acMatch) acValue = parseInt(acMatch[1]);
  }
  
  armor.baseAC = acValue;
  console.log(`🛡️ Parsed AC: ${acValue}`);
  
  // Detectar modificador de DEX
  const acStr = String(item.armor_class || item.ac_string || '').toLowerCase();
  if (acStr.includes('dex modifier')) {
    armor.dexModifier = 'full';
  } else if (acStr.includes('max 2') || acStr.includes('maximum of 2')) {
    armor.dexModifier = 'max2';
  } else if (!acStr.includes('dex')) {
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

/**
 * ✨ NUEVO: Detectar tipo de armadura por nombre
 */
function detectArmorType(name: string): string {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('shield')) return 'shield';
  
  if (nameLower.includes('leather') || 
      nameLower.includes('padded') || 
      nameLower.includes('studded')) {
    return 'light';
  }
  
  if (nameLower.includes('plate') || 
      nameLower.includes('chain mail') || 
      nameLower.includes('splint') || 
      nameLower.includes('ring mail')) {
    return 'heavy';
  }
  
  if (nameLower.includes('chain') || 
      nameLower.includes('scale') || 
      nameLower.includes('breastplate') || 
      nameLower.includes('half plate')) {
    return 'medium';
  }
  
  return 'light';
}