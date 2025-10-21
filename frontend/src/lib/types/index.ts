export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: string;
  campaignCount: number;
}

export interface Campaign {
  id: string;
  name: string;
  dmId: string;
  dmName: string;
  dmPhoto: string;
  createdAt: string;
  playerIds: string[];
}

export interface CampaignMember {
  campaignId: string;
  userId: string;
  role: 'dm' | 'player';
  userName: string;
  userPhoto: string;
  joinedAt: string;
}

export interface CampaignMembers {
  dm: CampaignMember | null;
  players: CampaignMember[];
}

export interface Invitation {
  id: string;
  campaignId: string;
  campaignName: string;
  fromUserId: string;
  fromName: string;
  fromPhoto: string;
  toUserId: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string;
}

// ===========================
// NUEVOS TIPOS PARA COMBATE
// ===========================

export interface Character {
  id: string;
  campaignId: string;
  userId: string;
  name: string;
  class: string;
  level: number;
  maxHp: number;
  currentHp: number;
  armorClass: number;
  initiative: number; // Bonus de iniciativa
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

  export interface CharacterForm {
    name: string;
    maxHp: number;
    armorClass: number;
  }

export interface Encounter {
  id: string;
  campaignId: string;
  name: string;
  isActive: boolean;
  round: number;
  turnIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Combatant {
  id: string;
  encounterId: string;
  type: 'character' | 'creature';
  characterId?: string;
  name: string;
  initiative: number; // Valor tirado
  maxHp: number;
  currentHp: number;
  armorClass: number;
  conditions: string[];
  imageUrl: string;
  isNpc: boolean;
  creatureSource?: string;
  createdAt: string;
}

export interface Monster {
  slug: string;
  name: string;
  size: string;
  type: string;
  subtype?: string;
  alignment: string;
  armor_class: number;
  hit_points: number;
  hit_dice: string;
  challenge_rating: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  speed: {
    walk?: number;
    swim?: number;
    fly?: number;
    burrow?: number;
  };
  document__slug?: string;
}

export interface MonsterSearchResult {
  count: number;
  next: string | null;
  previous: string | null;
  results: Monster[];
}