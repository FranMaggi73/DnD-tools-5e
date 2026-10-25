import type { Character, Combatant } from '$lib/types';

export function isLinkedCharacter(combatant: Combatant, character: Character): boolean {
  if (combatant.characterId !== character.id) return false;
  const identity = character.instanceId || character.createdAt;
  return combatant.characterInstanceId ? combatant.characterInstanceId === identity :
    new Date(character.createdAt).getTime() <= new Date(combatant.createdAt).getTime();
}
export function characterInCombat(character: Character, combatant: Combatant): Character {
  return { ...character, currentHp: combatant.currentHp, maxHp: combatant.maxHp, armorClass: combatant.armorClass,
    temporaryHp: combatant.temporaryHp, deathSaves: combatant.deathSaves, conditions: combatant.conditions, rules: combatant.rules };
}
