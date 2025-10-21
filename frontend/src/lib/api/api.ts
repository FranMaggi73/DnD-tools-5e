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
  MonsterSearchResult
} from '$lib/types';

const API_BASE_URL = 'http://localhost:8080/api';

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

  // ===========================
  // PERSONAJES
  // ===========================
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

  // ===========================
  // ENCUENTROS
  // ===========================
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

  // ===========================
  // COMBATIENTES
  // ===========================
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

  // ===========================
  // TURNOS
  // ===========================
  nextTurn: (encounterId: string) =>
    fetchWithAuth<Encounter>(`/encounters/${encounterId}/next-turn`, {
      method: 'POST',
    }),
};


function getInitiativeModifier(dex: number): number {
  return Math.floor((dex - 10) / 2);
}

// API de Open5e
export const open5eApi = {
  searchMonsters: async (query: string): Promise<MonsterSearchResult> => {
    const response = await fetch(
      `https://api.open5e.com/v1/monsters/?search=${encodeURIComponent(query)}&limit=20`
    );
    if (!response.ok) throw new Error('Error buscando criaturas');
    return response.json();
  },

  getMonster: async (slug: string): Promise<Monster> => {
    const response = await fetch(`https://api.open5e.com/v1/monsters/${slug}/`);
    if (!response.ok) throw new Error('Error obteniendo criatura');
    return response.json();
  },

  // Convertir Monster a formato Combatant
  monsterToCombatant: (monster: Monster, initiative: number) => ({
    type: 'creature' as const,
    name: monster.name,
    initiative,
    maxHp: monster.hit_points,
    currentHp: monster.hit_points,
    armorClass: monster.armor_class,
    isNpc: true,
    creatureSource: 'open5e'
  })
};