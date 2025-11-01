// frontend/src/lib/api/inventory.ts

import { get } from 'svelte/store';
import { tokenStore } from '$lib/stores/authStore';

const API_BASE_URL = import.meta.env.MODE === 'development'
  ? 'http://localhost:8080/api'
  : (import.meta.env.VITE_API_URL || 'https://dm-events-backend-858373640437.us-central1.run.app/api');

// ===========================
// TYPES (desde equipment.ts)
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
  weaponData?: any;
  armorData?: any;
  open5eSlug?: string;
  createdAt: string;
  updatedAt: string;
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

// ===========================
// OPEN5E TYPES
// ===========================

export interface Open5eItem {
  slug: string;
  name: string;
  type: string;
  desc: string;
  rarity: string;
  weight?: number;
  cost?: string; // Ej: "10 gp"
  
  // Weapon
  damage?: string; // Ej: "1d8"
  damage_type?: string;
  weapon_range?: string;
  properties?: string[];
  category?: string;
  
  // Armor
  armor_class?: string; // Ej: "11 + Dex modifier"
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
  // ===== INVENTORY ITEMS =====
  
  /**
   * Obtener inventario completo de un personaje
   */
  getInventory: (characterId: string) =>
    fetchWithAuth<InventoryResponse>(`/characters/${characterId}/inventory`),

  /**
   * Crear nuevo item en el inventario
   */
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

  /**
   * Actualizar item (cantidad, equipped, attuned)
   */
  updateItem: (itemId: string, data: {
    quantity?: number;
    equipped?: boolean;
    attuned?: boolean;
  }) =>
    fetchWithAuth<InventoryItem>(`/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /**
   * Eliminar item del inventario
   */
  deleteItem: (itemId: string) =>
    fetchWithAuth<{ message: string }>(`/items/${itemId}`, {
      method: 'DELETE',
    }),

  // ===== CURRENCY =====
  
  /**
   * Actualizar moneda del personaje
   */
  updateCurrency: (characterId: string, currency: Partial<Currency>) =>
    fetchWithAuth<Currency>(`/characters/${characterId}/currency`, {
      method: 'PUT',
      body: JSON.stringify(currency),
    }),
};

// ===========================
// OPEN5E API
// ===========================

export const open5eInventoryApi = {
  /**
   * Buscar items en Open5e (weapons, armor, gear)
   */
  searchItems: async (query: string, type?: string): Promise<Open5eSearchResult> => {
    const searchQuery = query.trim().toLowerCase();
    
    // Construir URL con filtros
    let url = `https://api.open5e.com/v1/magicitems/?search=${encodeURIComponent(searchQuery)}&limit=50`;
    
    // También buscar en weapons y armor
    const [magicItems, weapons, armor] = await Promise.all([
      fetch(url).then(r => r.json()),
      fetch(`https://api.open5e.com/v1/weapons/?search=${encodeURIComponent(searchQuery)}&limit=20`).then(r => r.json()),
      fetch(`https://api.open5e.com/v1/armor/?search=${encodeURIComponent(searchQuery)}&limit=20`).then(r => r.json())
    ]);
    
    // Combinar resultados
    const allResults = [
      ...(magicItems.results || []),
      ...(weapons.results || []),
      ...(armor.results || [])
    ];
    
    // Filtrar y ordenar por relevancia
    const filtered = allResults
      .filter((item: Open5eItem) => {
        const name = item.name.toLowerCase();
        return name.includes(searchQuery);
      })
      .sort((a: Open5eItem, b: Open5eItem) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStarts = aName.startsWith(searchQuery);
        const bStarts = bName.startsWith(searchQuery);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        return aName.length - bName.length;
      })
      .slice(0, 20);
    
    return {
      count: filtered.length,
      next: null,
      previous: null,
      results: filtered
    };
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
   * Convertir item de Open5e a formato de inventario
   */
  convertToInventoryItem: (open5eItem: Open5eItem): Partial<InventoryItem> => {
    const item: Partial<InventoryItem> = {
      name: open5eItem.name,
      description: open5eItem.desc,
      weight: open5eItem.weight || 0,
      quantity: 1,
      equipped: false,
      open5eSlug: open5eItem.slug,
    };

    // Parsear costo (ej: "10 gp" -> 10)
    if (open5eItem.cost) {
      const costMatch = open5eItem.cost.match(/(\d+)\s*(cp|sp|ep|gp|pp)/i);
      if (costMatch) {
        const amount = parseInt(costMatch[1]);
        const currency = costMatch[2].toLowerCase();
        
        // Convertir a GP
        const conversions: Record<string, number> = {
          cp: 0.01,
          sp: 0.1,
          ep: 0.5,
          gp: 1,
          pp: 10
        };
        
        item.value = amount * (conversions[currency] || 1);
      }
    }

    // Detectar tipo y parsear datos específicos
    if (open5eItem.damage || open5eItem.weapon_range) {
      item.type = 'weapon';
      item.weaponData = {
        weaponType: open5eItem.category || 'simple_melee',
        damageDice: open5eItem.damage || '1d4',
        damageType: open5eItem.damage_type || 'bludgeoning',
        properties: parseWeaponProperties(open5eItem),
      };
    } else if (open5eItem.armor_class) {
      item.type = 'armor';
      item.armorData = parseArmorData(open5eItem);
    } else {
      item.type = 'other';
    }

    return item;
  },

  /**
   * Limpiar descripción HTML
   */
  cleanDescription: (html: string, maxLength: number = 200): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    let text = temp.textContent || temp.innerText || '';
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }
    return text;
  }
};

// ===========================
// HELPERS
// ===========================

function parseWeaponProperties(item: Open5eItem): any {
  const props: any = {};
  
  if (item.properties) {
    item.properties.forEach(prop => {
      const p = prop.toLowerCase();
      if (p.includes('light')) props.light = true;
      if (p.includes('finesse')) props.finesse = true;
      if (p.includes('thrown')) props.thrown = true;
      if (p.includes('two-handed')) props.twoHanded = true;
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
  if (item.weapon_range) {
    const rangeMatch = item.weapon_range.match(/(\d+)\/(\d+)/);
    if (rangeMatch) {
      props.range = {
        normal: parseInt(rangeMatch[1]),
        max: parseInt(rangeMatch[2])
      };
    }
  }
  
  return props;
}

function parseArmorData(item: Open5eItem): any {
  const armor: any = {
    baseAC: 10,
    dexModifier: 'full',
  };
  
  // Parsear AC (ej: "11 + Dex modifier")
  if (item.armor_class) {
    const acMatch = item.armor_class.match(/(\d+)/);
    if (acMatch) {
      armor.baseAC = parseInt(acMatch[1]);
    }
    
    if (item.armor_class.includes('Dex modifier')) {
      armor.dexModifier = 'full';
    } else if (item.armor_class.includes('max 2')) {
      armor.dexModifier = 'max2';
    } else if (!item.armor_class.includes('Dex')) {
      armor.dexModifier = 'none';
    }
  }
  
  // Tipo de armor
  const name = item.name.toLowerCase();
  if (name.includes('shield')) {
    armor.armorType = 'shield';
  } else if (name.includes('leather') || name.includes('padded') || name.includes('studded')) {
    armor.armorType = 'light';
  } else if (name.includes('chain') && !name.includes('mail')) {
    armor.armorType = 'medium';
  } else if (name.includes('plate') || name.includes('chain mail') || name.includes('splint')) {
    armor.armorType = 'heavy';
  } else {
    armor.armorType = 'light';
  }
  
  if (item.strength_requirement) {
    armor.strengthRequirement = item.strength_requirement;
  }
  
  if (item.stealth_disadvantage) {
    armor.stealthDisadvantage = true;
  }
  
  return armor;
}