import { get } from 'svelte/store';
import { tokenStore } from '$lib/stores/authStore';
import type { 
  Campaign, 
  CampaignMembers, 
  Invitation,
  Character,
  Encounter,
  Combatant,
  Monster,
  MonsterSearchResult,
  ConditionSearchResult,
  Condition,
} from '$lib/types';

// ✅ DETECCIÓN AUTOMÁTICA: usa localhost en desarrollo, producción en build
const API_BASE_URL = import.meta.env.MODE === 'development'
  ? 'http://localhost:8080/api'
  : (import.meta.env.VITE_API_URL || 'https://dm-events-backend-858373640437.us-central1.run.app/api');

console.log('🔧 Entorno:', import.meta.env.MODE);
console.log('🌐 API URL:', API_BASE_URL);

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

export const api = {
  // Campañas
  createCampaign: (data: { name: string }) =>
    fetchWithAuth<Campaign>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCampaigns: () => fetchWithAuth<Campaign[]>('/campaigns'),

  getCampaign: (id: string) => fetchWithAuth<Campaign>(`/campaigns/${id}`),

  deleteCampaign: (id: string) =>
    fetchWithAuth<{ message: string }>(`/campaigns/${id}`, { method: 'DELETE' }),

  getCampaignMembers: (id: string) => fetchWithAuth<CampaignMembers>(`/campaigns/${id}/members`),

  invitePlayer: (campaignId: string, userEmail: string) =>
    fetchWithAuth<{ message: string; invitation: Invitation }>(`/campaigns/${campaignId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ userEmail }),
    }),

  removePlayer: (campaignId: string, userId: string) =>
    fetchWithAuth<{ message: string }>(`/campaigns/${campaignId}/players/${userId}`, {
      method: 'DELETE',
    }),

  // Invitaciones
  getMyInvitations: () => fetchWithAuth<Invitation[]>('/invitations'),

  respondToInvitation: (invitationId: string, action: 'accept' | 'reject') =>
    fetchWithAuth<{ message: string }>(`/invitations/${invitationId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  // Personajes
  createCharacter: (campaignId: string, data: {
    name: string;
    class: string;
    level: number;
    maxHp: number;
    armorClass: number;
    initiative: number;
    imageUrl?: string;
  }) =>
    fetchWithAuth<Character>(`/campaigns/${campaignId}/characters`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCampaignCharacters: (campaignId: string) => 
    fetchWithAuth<Character[]>(`/campaigns/${campaignId}/characters`),

  updateCharacter: (characterId: string, data: {
    name: string;
    class: string;
    level: number;
    maxHp: number;
    armorClass: number;
    initiative: number;
    imageUrl?: string;
  }) =>
    fetchWithAuth<Character>(`/characters/${characterId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCharacter: (characterId: string) =>
    fetchWithAuth<{ message: string }>(`/characters/${characterId}`, {
      method: 'DELETE',
    }),

  // Encuentros
  createEncounter: (campaignId: string, name: string) =>
    fetchWithAuth<Encounter>(`/campaigns/${campaignId}/encounters`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  getActiveEncounter: (campaignId: string) =>
    fetchWithAuth<Encounter>(`/campaigns/${campaignId}/encounters/active`),

  endEncounter: (encounterId: string) =>
    fetchWithAuth<{ message: string }>(`/encounters/${encounterId}`, {
      method: 'DELETE',
    }),

  resetEncounter: (encounterId: string) =>
    fetchWithAuth<{ message: string }>(`/encounters/${encounterId}/reset`, {
      method: 'POST',
    }),

  // Combatientes
  addCombatant: (encounterId: string, data: {
    type: 'character' | 'creature';
    characterId?: string;
    name?: string;
    initiative: number;
    maxHp: number;
    currentHp?: number;
    armorClass: number;
    imageUrl?: string;
    isNpc?: boolean;
  }) =>
    fetchWithAuth<Combatant>(`/encounters/${encounterId}/combatants`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCombatants: (encounterId: string) =>
    fetchWithAuth<Combatant[]>(`/encounters/${encounterId}/combatants`),

  updateCombatant: (combatantId: string, data: {
    currentHp?: number;
    conditions?: string[];
    initiative?: number;
  }) =>
    fetchWithAuth<Combatant>(`/combatants/${combatantId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  removeCombatant: (combatantId: string) =>
    fetchWithAuth<{ message: string }>(`/combatants/${combatantId}`, {
      method: 'DELETE',
    }),

  // Turnos
  nextTurn: (encounterId: string) =>
    fetchWithAuth<Encounter>(`/encounters/${encounterId}/next-turn`, {
      method: 'POST',
    }),
};

// API de Open5e
export const open5eApi = {
  searchMonsters: async (query: string): Promise<MonsterSearchResult> => {
    // Búsqueda mejorada: más resultados y búsqueda por nombre
    const searchQuery = query.trim().toLowerCase();
    const response = await fetch(
      `https://api.open5e.com/v1/monsters/?search=${encodeURIComponent(searchQuery)}&limit=50`
    );
    if (!response.ok) throw new Error('Error buscando criaturas');
    const data = await response.json();
    
    // Filtrar y ordenar resultados por relevancia
    if (data.results) {
      data.results = data.results
        .filter((m: Monster) => {
          const name = m.name.toLowerCase();
          const type = m.type?.toLowerCase() || '';
          return name.includes(searchQuery) || type.includes(searchQuery);
        })
        .sort((a: Monster, b: Monster) => {
          // Priorizar coincidencias exactas al inicio del nombre
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aStarts = aName.startsWith(searchQuery);
          const bStarts = bName.startsWith(searchQuery);
          
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          
          // Luego por longitud de nombre (más cortos primero)
          return aName.length - bName.length;
        })
        .slice(0, 20); // Limitar a 20 resultados relevantes
    }
    
    return data;
  },
  getMonster: async (slug: string): Promise<Monster> => {
    const response = await fetch(`https://api.open5e.com/v1/monsters/${slug}/`);
    if (!response.ok) throw new Error('Error obteniendo criatura');
    return response.json();
  },

  monsterToCombatant: (monster: Monster, initiative: number) => ({
    type: 'creature' as const,
    name: monster.name,
    initiative,
    maxHp: monster.hit_points,
    currentHp: monster.hit_points,
    armorClass: monster.armor_class,
    isNpc: true,
    creatureSource: 'open5e'
  }),

  searchConditions: async (query: string): Promise<ConditionSearchResult> => {
    const response = await fetch(
      `https://api.open5e.com/v1/conditions/?search=${encodeURIComponent(query)}&limit=5`
    );
    if (!response.ok) throw new Error('Error buscando condiciones');
    return response.json();
  },

  getCondition: async (slug: string): Promise<Condition> => {
    const response = await fetch(`https://api.open5e.com/v1/conditions/${slug}/`);
    if (!response.ok) throw new Error('Error obteniendo condición');
    return response.json();
  },

  cleanDescription: (html: string, maxLength: number = 150): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    let text = temp.textContent || temp.innerText || '';
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }
    return text;
  }
};