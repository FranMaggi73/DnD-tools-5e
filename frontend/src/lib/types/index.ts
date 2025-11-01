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
export const DND_SKILLS: Array<{ name: string; ability: AbilityKey; label: string }> = [
  { name: 'Acrobatics', ability: 'dexterity', label: 'Acrobacias' },
  { name: 'Animal Handling', ability: 'wisdom', label: 'Trato con Animales' },
  { name: 'Arcana', ability: 'intelligence', label: 'Arcano' },
  { name: 'Athletics', ability: 'strength', label: 'Atletismo' },
  { name: 'Deception', ability: 'charisma', label: 'Engaño' },
  { name: 'History', ability: 'intelligence', label: 'Historia' },
  { name: 'Insight', ability: 'wisdom', label: 'Perspicacia' },
  { name: 'Intimidation', ability: 'charisma', label: 'Intimidación' },
  { name: 'Investigation', ability: 'intelligence', label: 'Investigación' },
  { name: 'Medicine', ability: 'wisdom', label: 'Medicina' },
  { name: 'Nature', ability: 'intelligence', label: 'Naturaleza' },
  { name: 'Perception', ability: 'wisdom', label: 'Percepción' },
  { name: 'Performance', ability: 'charisma', label: 'Interpretación' },
  { name: 'Persuasion', ability: 'charisma', label: 'Persuasión' },
  { name: 'Religion', ability: 'intelligence', label: 'Religión' },
  { name: 'Sleight of Hand', ability: 'dexterity', label: 'Juego de Manos' },
  { name: 'Stealth', ability: 'dexterity', label: 'Sigilo' },
  { name: 'Survival', ability: 'wisdom', label: 'Supervivencia' },
];

/**
 * Crea un formulario vacío de personaje con todos los campos inicializados
 */
export function createEmptyCharacterForm(): CharacterForm {
  return {
    name: '',
    class: 'Aventurero',
    level: 1,
    maxHp: 10,
    armorClass: 10,
    initiative: 0,
    speed: 30,
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    savingThrows: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false
    },
    skills: DND_SKILLS.map(skill => ({
      name: skill.name,
      ability: skill.ability,
      proficient: false,
      expertise: false
    }))
  };
}

/**
 * Convierte un Character a CharacterForm para edición
 */
export function characterToForm(character: Character): CharacterForm {
  return {
    name: character.name,
    class: character.class,
    level: character.level,
    maxHp: character.maxHp,
    armorClass: character.armorClass,
    initiative: character.initiative,
    speed: character.speed,
    abilityScores: { ...character.abilityScores },
    savingThrows: { ...character.savingThrows },
    skills: character.skills.map(s => ({ ...s }))
  };
}