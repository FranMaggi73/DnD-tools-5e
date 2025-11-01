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
  weight: number;
  value: number;
  equipped: boolean;
  attuned?: boolean;
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
  carryingCapacity: number;
  totalWeight: number;
  totalValue: number;
  encumbered: boolean;
  heavilyEncumbered: boolean;
}

export interface Open5eItem {
  slug: string;
  name: string;
  type: string;
  desc: string;
  rarity: string;
  weight?: number;
  cost?: string;
  
  // Weapon
  damage?: string;
  damage_type?: string;
  weapon_range?: string;
  properties?: string[];
  category?: string;
  
  // Armor
  armor_class?: string;
  strength_requirement?: number;
  stealth_disadvantage?: boolean;
  
  document__slug?: string;
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
    weight: number;
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
    quantity?: number;
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

export const open5eInventoryApi = {
  /**
   * Buscar items en Open5e con mejor manejo de categorías
   */
  searchItems: async (query: string, type?: string): Promise<Open5eSearchResult> => {
    const searchQuery = query.trim().toLowerCase();
    
    try {
      // Buscar en paralelo en múltiples endpoints
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
      
      // Combinar y etiquetar resultados
      const allResults = [
        ...(magicItems.results || []).map((item: any) => ({ ...item, source: 'magicitems' })),
        ...(weapons.results || []).map((item: any) => ({ ...item, source: 'weapons' })),
        ...(armor.results || []).map((item: any) => ({ ...item, source: 'armor' })),
        ...(gear.results || []).map((item: any) => ({ ...item, source: 'gear' }))
      ];
      
      // Filtrar y ordenar por relevancia
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

  /**
   * Obtener item específico por slug
   */
  getItem: async (slug: string, category: string = 'magicitems'): Promise<Open5eItem> => {
    const response = await fetch(`https://api.open5e.com/v1/${category}/${slug}/`);
    if (!response.ok) throw new Error('Error obteniendo item');
    return response.json();
  },

  /**
   * ✨ MEJORADO: Convertir item de Open5e a formato de inventario
   */
  convertToInventoryItem: (open5eItem: any): Partial<InventoryItem> => {
    const item: Partial<InventoryItem> = {
      name: open5eItem.name,
      description: cleanDescription(open5eItem.desc || open5eItem.description || ''),
      weight: parseWeight(open5eItem.weight),
      quantity: 1,
      equipped: false,
      open5eSlug: open5eItem.slug,
    };

    // Parsear costo
    item.value = parseCost(open5eItem.cost);

    // Detectar tipo y parsear datos específicos
    const source = open5eItem.source || '';
    
    if (source === 'weapons' || open5eItem.damage || open5eItem.damage_type) {
      item.type = 'weapon';
      item.weaponData = parseWeaponData(open5eItem);
    } else if (source === 'armor' || open5eItem.armor_class) {
      item.type = 'armor';
      item.armorData = parseArmorData(open5eItem);
    } else if (open5eItem.type?.toLowerCase().includes('potion') || 
               open5eItem.name.toLowerCase().includes('potion')) {
      item.type = 'consumable';
    } else if (open5eItem.rarity && open5eItem.rarity !== 'common') {
      item.type = 'treasure';
    } else {
      item.type = 'other';
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

/**
 * ✨ NUEVO: Limpiar descripción HTML mejorado
 */
function cleanDescription(html: string, maxLength: number = 200): string {
  if (!html) return '';
  
  const temp = document.createElement('div');
  temp.innerHTML = html;
  let text = temp.textContent || temp.innerText || '';
  
  // Limpiar espacios extra
  text = text.replace(/\s+/g, ' ').trim();
  
  if (text.length > maxLength) {
    text = text.substring(0, maxLength).trim() + '...';
  }
  
  return text;
}

/**
 * ✨ NUEVO: Parsear peso con múltiples formatos
 */
function parseWeight(weight: any): number {
  if (typeof weight === 'number') return weight;
  if (!weight) return 0;
  
  // Manejar strings como "1 lb" o "0.5"
  const match = String(weight).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

/**
 * ✨ MEJORADO: Parsear costo con más formatos
 */
function parseCost(cost: any): number {
  if (typeof cost === 'number') return cost;
  if (!cost) return 0;
  
  const costStr = String(cost).toLowerCase();
  
  // Buscar patrón: número + moneda
  const match = costStr.match(/(\d+(?:\.\d+)?)\s*(cp|sp|ep|gp|pp)/);
  if (!match) return 0;
  
  const amount = parseFloat(match[1]);
  const currency = match[2];
  
  // Convertir a GP
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
 * ✨ MEJORADO: Parsear datos de arma
 */
function parseWeaponData(item: any): WeaponData {
  const weaponData: WeaponData = {
    weaponType: item.category || 'simple_melee',
    damageDice: item.damage || '1d4',
    damageType: item.damage_type || 'bludgeoning',
    properties: parseWeaponProperties(item),
  };
  
  // Detectar bonus mágico
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
      
      // Versatile (ej: "versatile (1d10)")
      const versatileMatch = p.match(/versatile\s*\(([^)]+)\)/);
      if (versatileMatch) {
        props.versatile = versatileMatch[1];
      }
    });
  }
  
  // Range
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
  
  // Parsear AC
  if (item.armor_class) {
    const acStr = String(item.armor_class);
    const acMatch = acStr.match(/(\d+)/);
    if (acMatch) {
      armor.baseAC = parseInt(acMatch[1]);
    }
    
    // Detectar modificador de DEX
    if (acStr.toLowerCase().includes('dex modifier')) {
      armor.dexModifier = 'full';
    } else if (acStr.toLowerCase().includes('max 2') || acStr.toLowerCase().includes('maximum of 2')) {
      armor.dexModifier = 'max2';
    } else if (!acStr.toLowerCase().includes('dex')) {
      armor.dexModifier = 'none';
    }
  }
  
  // Requisito de fuerza
  if (item.strength_requirement) {
    armor.strengthRequirement = item.strength_requirement;
  }
  
  // Desventaja en sigilo
  if (item.stealth_disadvantage) {
    armor.stealthDisadvantage = true;
  }
  
  // Bonus mágico
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
  
  // Light armor
  if (nameLower.includes('leather') || 
      nameLower.includes('padded') || 
      nameLower.includes('studded')) {
    return 'light';
  }
  
  // Heavy armor
  if (nameLower.includes('plate') || 
      nameLower.includes('chain mail') || 
      nameLower.includes('splint') || 
      nameLower.includes('ring mail')) {
    return 'heavy';
  }
  
  // Medium armor (por defecto si no es light ni heavy)
  if (nameLower.includes('chain') || 
      nameLower.includes('scale') || 
      nameLower.includes('breastplate') || 
      nameLower.includes('half plate')) {
    return 'medium';
  }
  
  return 'light'; // Default
}