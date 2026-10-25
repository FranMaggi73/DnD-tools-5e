import type { AbilityScores, DeathSaves, Skill } from '$lib/types';

export const DAMAGE_TYPES = ['acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder'] as const;
export type DamageType = typeof DAMAGE_TYPES[number];
export const CONDITION_NAMES = ['Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious'] as const;
export type ConditionName = typeof CONDITION_NAMES[number];
export const CONDITION_ICONS: Record<ConditionName, string> = {
  Blinded: '🙈', Charmed: '💘', Deafened: '🙉', Frightened: '😨',
  Grappled: '🤼', Incapacitated: '🚫', Invisible: '👻', Paralyzed: '🧊',
  Petrified: '🗿', Poisoned: '🤢', Prone: '⬇️', Restrained: '⛓️',
  Stunned: '💫', Unconscious: '💤'
};
export const conditionIcon = (name: string) => CONDITION_ICONS[name as ConditionName] || '❔';
export const conditionLabel = (name: string) => CONDITION_INFO[name as ConditionName]?.label || name;
export const CONDITION_INFO: Record<ConditionName, { label: string; description: string }> = {
  Blinded: { label: 'Cegado', description: 'No ve. Falla pruebas que requieren vista; sus ataques tienen desventaja y los ataques contra él, ventaja.' },
  Charmed: { label: 'Hechizado', description: 'No puede atacar ni dañar al hechizador. Este tiene ventaja al interactuar socialmente con él.' },
  Deafened: { label: 'Ensordecido', description: 'No oye. Falla pruebas que requieren audición.' },
  Frightened: { label: 'Asustado', description: 'Con el origen del miedo a la vista, tiene desventaja en pruebas y ataques; no puede acercarse voluntariamente a ese origen.' },
  Grappled: { label: 'Agarrado', description: 'Velocidad 0. Desventaja al atacar a alguien distinto del agarrador; puede ser arrastrado según las reglas de agarre.' },
  Incapacitated: { label: 'Incapacitado', description: 'No puede realizar acciones, acciones adicionales ni reacciones; pierde concentración y no puede hablar.' },
  Invisible: { label: 'Invisible', description: 'Sus efectos dependen de si los demás pueden verlo. Puede obtener ventaja en iniciativa y ataques, y desventaja en ataques contra él.' },
  Paralyzed: { label: 'Paralizado', description: 'Incapacitado y velocidad 0. Falla salvaciones de Fuerza y Destreza; ataques contra él con ventaja y críticos si impactan desde 5 pies.' },
  Petrified: { label: 'Petrificado', description: 'Incapacitado, velocidad 0 y transformado. Falla salvaciones de Fuerza/Destreza; tiene resistencia al daño e inmunidad a Veneno.' },
  Poisoned: { label: 'Envenenado', description: 'Desventaja en tiradas de ataque y pruebas de característica.' },
  Prone: { label: 'Derribado', description: 'Sus ataques tienen desventaja. Los ataques contra él tienen ventaja desde 5 pies y desventaja desde más lejos.' },
  Restrained: { label: 'Apresado', description: 'Velocidad 0, ataques con desventaja y ataques contra él con ventaja; desventaja en salvaciones de Destreza.' },
  Stunned: { label: 'Aturdido', description: 'Incapacitado. Falla salvaciones de Fuerza y Destreza; ataques contra él con ventaja.' },
  Unconscious: { label: 'Inconsciente', description: 'Incapacitado, velocidad 0 y sin consciencia del entorno; normalmente cae derribado. Falla salvaciones de Fuerza/Destreza; impactos desde 5 pies son críticos.' }
};

export type LifeState = 'alive' | 'unconscious' | 'stable' | 'dead';
export interface TimedEffect { id: string; condition: ConditionName; source: string; rounds: number | null; expires: 'start' | 'end' }
export interface CharacterRules {
  lifeState: LifeState;
  exhaustion: number;
  heroicInspiration: boolean;
  concentration: string;
  concentrationSaveDC: number | null;
  hitDieSize: number;
  hitDiceSpent: number;
  resistances: DamageType[];
  vulnerabilities: DamageType[];
  immunities: DamageType[];
  effects: TimedEffect[];
}
export interface HealthState {
  maxHp: number; currentHp: number; temporaryHp: number; deathSaves: DeathSaves;
  conditions: string[]; rules: CharacterRules;
}
export function encodeRules(rules: CharacterRules) {
  return { ...rules, effects: rules.effects.map(effect => {
    const source = btoa(String.fromCharCode(...new TextEncoder().encode(effect.source))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${effect.id}|${effect.condition}|${source}|${effect.rounds ?? 0}|${effect.expires === 'start' ? 'S' : 'E'}`;
  }) };
}
function decodeEffects(value: unknown): TimedEffect[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 10).flatMap(entry => {
    try {
      let effect: TimedEffect;
      if (typeof entry === 'string') {
        const [id, condition, encoded, remaining, expiry, ...extra] = entry.split('|');
        if (extra.length || !['S', 'E'].includes(expiry)) return [];
        const source = new TextDecoder().decode(Uint8Array.from(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))).slice(0, 100);
        effect = { id, condition: condition as ConditionName, source, rounds: Number(remaining) === 0 ? null : Number(remaining), expires: expiry === 'S' ? 'start' : 'end' };
      } else effect = entry;
      return effect && typeof effect.id === 'string' && CONDITION_NAMES.includes(effect.condition) && typeof effect.source === 'string' &&
        (effect.rounds === null || Number.isInteger(effect.rounds) && effect.rounds > 0 && effect.rounds <= 1000000) && ['start', 'end'].includes(effect.expires) ? [effect] : [];
    } catch { return []; }
  });
}
export type HealthAction =
  | { type: 'damage'; amount: number; damageType?: DamageType; critical?: boolean }
  | { type: 'heal'; amount: number }
  | { type: 'temporary'; amount: number }
  | { type: 'deathSave'; roll: number; modifier?: number }
  | { type: 'stabilize' }
  | { type: 'revive'; amount: number }
  | { type: 'concentration'; name: string }
  | { type: 'concentrationResult'; success: boolean }
  | { type: 'exhaustion'; level: number }
  | { type: 'inspiration'; value: boolean };

export function defaultHitDie(className = ''): number {
  const name = className.trim().toLowerCase();
  if (['barbarian', 'bárbaro', 'barbaro'].includes(name)) return 12;
  if (['fighter', 'guerrero', 'paladin', 'paladín', 'ranger', 'explorador'].includes(name)) return 10;
  if (['wizard', 'mago', 'sorcerer', 'hechicero'].includes(name)) return 6;
  return 8;
}
export function normalizeRules(data: any): CharacterRules {
  const r = data.rules || {};
  const lifeState = r.lifeState || (data.currentHp > 0 ? 'alive' : data.deathSaves?.failures >= 3 ? 'dead' : data.deathSaves?.successes >= 3 ? 'stable' : 'unconscious');
  return {
    lifeState, exhaustion: r.exhaustion ?? 0, heroicInspiration: r.heroicInspiration ?? false,
    concentration: r.concentration || '', concentrationSaveDC: r.concentrationSaveDC ?? null,
    hitDieSize: r.hitDieSize || defaultHitDie(data.class), hitDiceSpent: r.hitDiceSpent || 0,
    resistances: r.resistances || [], vulnerabilities: r.vulnerabilities || [], immunities: r.immunities || [],
    effects: decodeEffects(r.effects)
  };
}
export function hasJackOfAllTrades(className: string, level: number) {
  return ['bard', 'bardo'].includes(className.trim().toLowerCase()) && level >= 2;
}
export function skillBonus(score: number, skill: Pick<Skill, 'proficient' | 'expertise'>, proficiency: number, half = false, exhaustion = 0) {
  const training = skill.proficient ? proficiency * (skill.expertise ? 2 : 1) : half ? Math.floor(proficiency / 2) : 0;
  return Math.floor((score - 10) / 2) + training - 2 * exhaustion;
}
export function effectiveSpeed(speed: number, rules: CharacterRules, conditions: string[]) {
  if (rules.lifeState !== 'alive' || conditions.some(c => ['Grappled', 'Paralyzed', 'Petrified', 'Restrained', 'Unconscious'].includes(c))) return 0;
  return Math.max(0, speed - 5 * rules.exhaustion);
}
export function isIncapacitated(state: HealthState) {
  return state.rules.lifeState !== 'alive' || state.conditions.some(c => ['Incapacitated', 'Paralyzed', 'Petrified', 'Stunned', 'Unconscious'].includes(c));
}
function amount(value: number, max = 999999) {
  if (!Number.isInteger(value) || value < 0 || value > max) throw new Error(`Usá un entero entre 0 y ${max}.`);
  return value;
}
export function normalizeHealth(state: HealthState): HealthState {
  const next = { ...state, deathSaves: { ...state.deathSaves }, conditions: [...state.conditions], rules: { ...state.rules, effects: [...state.rules.effects] } };
  if (next.rules.exhaustion >= 6) {
    next.currentHp = 0; next.rules.lifeState = 'dead';
  } else if (next.currentHp > 0 && next.rules.lifeState !== 'dead') {
    next.rules.lifeState = 'alive';
    next.deathSaves = { successes: 0, failures: 0 };
  } else if (next.deathSaves.failures >= 3 || next.rules.exhaustion >= 6) {
    next.currentHp = 0; next.rules.lifeState = 'dead';
  } else if (next.deathSaves.successes >= 3) {
    next.rules.lifeState = 'stable'; next.deathSaves = { successes: 0, failures: 0 };
  } else if (next.currentHp === 0 && next.rules.lifeState === 'alive') next.rules.lifeState = 'unconscious';
  if (isIncapacitated(next)) { next.rules.concentration = ''; next.rules.concentrationSaveDC = null; }
  return next;
}
export function applyHealthAction(state: HealthState, action: HealthAction): HealthState {
  let next = normalizeHealth(state);
  const r = next.rules;
  if (action.type === 'damage') {
    let damage = amount(action.amount);
    if (action.damageType) {
      if (r.immunities.includes(action.damageType) || action.damageType === 'poison' && next.conditions.includes('Petrified')) damage = 0;
      else {
        if (r.resistances.includes(action.damageType) || next.conditions.includes('Petrified')) damage = Math.floor(damage / 2);
        if (r.vulnerabilities.includes(action.damageType)) damage *= 2;
      }
    } else if (next.conditions.includes('Petrified')) damage = Math.floor(damage / 2);
    if (damage === 0 || r.lifeState === 'dead') return next;
    if (r.concentration) {
      if (r.concentrationSaveDC !== null) throw new Error('Resolvé la salvación de concentración pendiente antes de aplicar otra fuente de daño.');
      r.concentrationSaveDC = Math.min(30, Math.max(10, Math.floor(damage / 2)));
    }
    const remaining = Math.max(0, damage - next.temporaryHp);
    next.temporaryHp = Math.max(0, next.temporaryHp - damage);
    if (remaining - next.currentHp >= next.maxHp) { next.currentHp = 0; r.lifeState = 'dead'; }
    else if (next.currentHp === 0) {
      r.lifeState = 'unconscious';
      next.deathSaves.failures = Math.min(3, next.deathSaves.failures + (action.critical ? 2 : 1));
    } else { next.currentHp = Math.max(0, next.currentHp - remaining); }
  } else if (action.type === 'heal' || action.type === 'revive') {
    const healing = amount(action.amount, 9999);
    if (r.lifeState === 'dead' && action.type !== 'revive') throw new Error('La curación no revive a un personaje muerto. Usá Revivir tras resolverlo con el DM.');
    if (action.type === 'revive' && healing < 1) throw new Error('Revivir requiere al menos 1 HP.');
    next.currentHp = Math.min(next.maxHp, next.currentHp + healing);
    if (action.type === 'revive') {
      if (r.exhaustion >= 6) throw new Error('El DM debe resolver primero el agotamiento de nivel 6.');
      r.lifeState = 'alive';
    }
  } else if (action.type === 'temporary') next.temporaryHp = amount(action.amount, 9999);
  else if (action.type === 'deathSave') {
    if (next.currentHp !== 0 || r.lifeState !== 'unconscious') throw new Error('Solo se tiran salvaciones de muerte estando a 0 HP, sin estabilizar.');
    if (!Number.isInteger(action.roll) || action.roll < 1 || action.roll > 20) throw new Error('Indicá el resultado natural del d20 (1–20).');
    if (!Number.isInteger(action.modifier ?? 0) || Math.abs(action.modifier ?? 0) > 100) throw new Error('Modificador de salvación inválido.');
    if (action.roll === 20) return applyHealthAction(next, { type: 'heal', amount: 1 });
    if (action.roll === 1) next.deathSaves.failures = Math.min(3, next.deathSaves.failures + 2);
    else if (action.roll + (action.modifier || 0) - 2 * r.exhaustion >= 10) next.deathSaves.successes++;
    else next.deathSaves.failures++;
  } else if (action.type === 'stabilize') {
    if (next.currentHp !== 0 || r.lifeState === 'dead') throw new Error('Solo se puede estabilizar a una criatura viva a 0 HP.');
    r.lifeState = 'stable'; next.deathSaves = { successes: 0, failures: 0 };
  } else if (action.type === 'concentration') {
    if (isIncapacitated(next) && action.name.trim()) throw new Error('No puede concentrarse estando incapacitado.');
    r.concentration = action.name.trim(); r.concentrationSaveDC = null;
  } else if (action.type === 'concentrationResult') {
    if (!action.success) r.concentration = '';
    r.concentrationSaveDC = null;
  } else if (action.type === 'exhaustion') r.exhaustion = amount(action.level, 6);
  else if (action.type === 'inspiration') r.heroicInspiration = action.value;
  return normalizeHealth(next);
}

export function advanceEffects(state: HealthState, boundary: 'start' | 'end') {
  const expired = state.rules.effects.filter(e => e.expires === boundary && e.rounds === 1);
  const effects = state.rules.effects.filter(e => !expired.includes(e)).map(e => e.expires === boundary && e.rounds !== null ? { ...e, rounds: e.rounds - 1 } : e);
  const conditions = state.conditions.filter(name => !expired.some(e => e.condition === name) || effects.some(e => e.condition === name));
  return normalizeHealth({ ...state, conditions, rules: { ...state.rules, effects } });
}

export function rest(state: HealthState, level: number, constitution: number, kind: 'short' | 'long', rolls: number[] = []) {
  let next = normalizeHealth(state);
  if (next.rules.lifeState === 'dead') throw new Error('Un descanso no revive a una criatura muerta.');
  if (next.currentHp === 0) throw new Error('Para iniciar un descanso se requiere al menos 1 HP.');
  if (kind === 'long') {
    if (next.currentHp === 0) throw new Error('El descanso largo requiere al menos 1 HP al iniciarlo.');
    next.currentHp = next.maxHp; next.temporaryHp = 0;
    next.rules.hitDiceSpent = 0; next.rules.exhaustion = Math.max(0, next.rules.exhaustion - 1);
    next.rules.concentration = ''; next.rules.concentrationSaveDC = null;
  } else {
    if (rolls.length > level - next.rules.hitDiceSpent) throw new Error('No quedan suficientes dados de golpe.');
    for (const roll of rolls) {
      if (!Number.isInteger(roll) || roll < 1 || roll > next.rules.hitDieSize) throw new Error('Resultado de dado de golpe inválido.');
      next = applyHealthAction(next, { type: 'heal', amount: Math.max(1, roll + Math.floor((constitution - 10) / 2)) });
    }
    next.rules.hitDiceSpent += rolls.length;
  }
  const elapsed = kind === 'short' ? 600 : 4800;
  const expired = next.rules.effects.filter(effect => effect.rounds !== null && effect.rounds <= elapsed);
  next.rules.effects = next.rules.effects.filter(effect => !expired.includes(effect))
    .map(effect => effect.rounds === null ? effect : { ...effect, rounds: effect.rounds - elapsed });
  next.conditions = next.conditions.filter(name => !expired.some(effect => effect.condition === name) || next.rules.effects.some(effect => effect.condition === name));
  return normalizeHealth(next);
}

export function initiativeModifier(scores: AbilityScores, extra = 0) { return Math.floor((scores.dexterity - 10) / 2) + extra; }
