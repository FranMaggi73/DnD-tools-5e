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
// PERSONAJES - ✅ NIVEL 1 COMPLETO
// ===========================

export interface AbilityScores {
  strength: number;     // STR
  dexterity: number;    // DEX
  constitution: number; // CON
  intelligence: number; // INT
  wisdom: number;       // WIS
  charisma: number;     // CHA
}

export interface SavingThrows {
  strength: boolean;
  dexterity: boolean;
  constitution: boolean;
  intelligence: boolean;
  wisdom: boolean;
  charisma: boolean;
}

export interface Skill {
  name: string;       // Ej: "Acrobatics"
  ability: AbilityKey; // <- más seguro que string
  proficient: boolean;
  expertise: boolean; // x2 proficiency
}


export interface Character {
  id: string;
  campaignId: string;
  userId: string;
  name: string;
  class: string;
  level: number;
  
  // Combat stats
  maxHp: number;
  currentHp: number;
  armorClass: number;
  initiative: number;
  speed: number;        // ✅ NUEVO
  conditions: string[];
  
  // ✅ NUEVO: Ability Scores
  abilityScores: AbilityScores;
  
  // ✅ NUEVO: Proficiencies
  proficiencyBonus: number;
  savingThrows: SavingThrows;
  skills: Skill[];
  
  // Metadata
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

// ===== FORM TYPES =====

export interface CharacterForm {
  // Básico
  name: string;
  class: string;
  level: number;
  
  // Combat
  maxHp: number;
  armorClass: number;
  initiative: number;
  speed: number; // ✅ NUEVO
  
  // ✅ NUEVO: Ability Scores
  abilityScores: AbilityScores;
  
  // ✅ NUEVO: Proficiencies
  savingThrows: SavingThrows;
  skills: Skill[];
}

// ===== HELPER TYPE: Habilidades para calcular modificadores =====
export type AbilityKey = keyof AbilityScores;

// ===========================
// ENCUENTROS
// ===========================

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
  type: 'character' | 'creature' | 'player';
  characterId?: string;
  name: string;
  initiative: number;
  maxHp: number;
  currentHp: number;
  armorClass: number;
  conditions: string[];
  isNpc: boolean;
  creatureSource?: string;
  createdAt: string;
}

// ===========================
// OPEN5E API
// ===========================

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

export interface Condition {
  slug: string;
  name: string;
  desc: string;
}

export interface ConditionSearchResult {
  count: number;
  next: string | null;
  previous: string | null;
  results: Condition[];
}

// ===========================
// NOTAS
// ===========================

export interface Note {
  id: string;
  campaignId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  isShared: boolean;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ===========================
// UTILITY FUNCTIONS (para usar en componentes)
// ===========================

/**
 * Calcula el modificador de una habilidad
 * Formula: floor((score - 10) / 2)
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Formatea el modificador para mostrar (+X o -X)
 */
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Calcula el proficiency bonus según el nivel
 */
export function getProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}

/**
 * Calcula el bonus total de un saving throw
 */
export function getSavingThrowBonus(
  abilityScore: number,
  isProficient: boolean,
  proficiencyBonus: number
): number {
  const modifier = getAbilityModifier(abilityScore);
  return modifier + (isProficient ? proficiencyBonus : 0);
}

/**
 * Calcula el bonus total de una skill
 */
export function getSkillBonus(
  abilityScore: number,
  proficient: boolean,
  expertise: boolean,
  proficiencyBonus: number
): number {
  const modifier = getAbilityModifier(abilityScore);
  let bonus = modifier;
  
  if (expertise) {
    bonus += proficiencyBonus * 2;
  } else if (proficient) {
    bonus += proficiencyBonus;
  }
  
  return bonus;
}

/**
 * Lista de skills de D&D 5e con su habilidad asociada
 */
// Lista de skills de D&D 5e con su habilidad asociada (añadimos label)
export const DND_SKILLS: Array<{ name: string; ability: AbilityKey; label: string }> = [
  { name: 'Acrobatics', ability: 'dexterity', label: 'Acrobatics' },
  { name: 'Animal Handling', ability: 'wisdom', label: 'Animal Handling' },
  { name: 'Arcana', ability: 'intelligence', label: 'Arcana' },
  { name: 'Athletics', ability: 'strength', label: 'Athletics' },
  { name: 'Deception', ability: 'charisma', label: 'Deception' },
  { name: 'History', ability: 'intelligence', label: 'History' },
  { name: 'Insight', ability: 'wisdom', label: 'Insight' },
  { name: 'Intimidation', ability: 'charisma', label: 'Intimidation' },
  { name: 'Investigation', ability: 'intelligence', label: 'Investigation' },
  { name: 'Medicine', ability: 'wisdom', label: 'Medicine' },
  { name: 'Nature', ability: 'intelligence', label: 'Nature' },
  { name: 'Perception', ability: 'wisdom', label: 'Perception' },
  { name: 'Performance', ability: 'charisma', label: 'Performance' },
  { name: 'Persuasion', ability: 'charisma', label: 'Persuasion' },
  { name: 'Religion', ability: 'intelligence', label: 'Religion' },
  { name: 'Sleight of Hand', ability: 'dexterity', label: 'Sleight of Hand' },
  { name: 'Stealth', ability: 'dexterity', label: 'Stealth' },
  { name: 'Survival', ability: 'wisdom', label: 'Survival' },
];
