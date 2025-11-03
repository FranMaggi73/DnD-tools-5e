// frontend/src/lib/api/inventory.ts

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
    weaponData?: any;
    armorData?: any;
    open5eSlug?: string;
    rarity?: string;
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
// REEMPLAZAR CON:
convertToInventoryItem: (open5eItem: any): Partial<InventoryItem> => {
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
      magicBonus: extractMagicBonus(name)
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
      magicBonus: extractMagicBonus(name)
    };
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