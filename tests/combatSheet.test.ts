import { expect, test } from 'vitest';
import { createEmptyCharacterForm, type Character, type Combatant } from '../frontend/src/lib/types';
import { normalizeRules } from '../frontend/src/lib/rules/2024';
import { characterInCombat, isLinkedCharacter } from '../frontend/src/lib/utils/combatSheet';

function fixtures() {
  const character: Character = {...createEmptyCharacterForm(),id:'char',campaignId:'campaign',userId:'player',name:'Hero',
    currentHp:10,temporaryHp:0,conditions:[],deathSaves:{successes:0,failures:0},imageUrl:'',
    createdAt:'2026-01-01T00:00:00.000Z',updatedAt:'2026-01-01T00:00:00.000Z',instanceId:'original',
    initiative:3,proficiencyBonus:2,rules:normalizeRules({currentHp:10})};
  const fighter: Combatant={id:'fighter',encounterId:'encounter',type:'character',characterId:character.id,
    characterInstanceId:'original',name:'Hero',initiative:17,maxHp:10,currentHp:4,armorClass:15,
    temporaryHp:2,conditions:['Poisoned'],deathSaves:{successes:0,failures:0},rules:character.rules,isNpc:false,
    createdAt:'2026-01-02T00:00:00.000Z'};
  return {character,fighter};
}
test('the combat sheet uses current encounter health but preserves character initiative modifier and abilities', () => {
  const {character,fighter}=fixtures();
  const sheet=characterInCombat(character,fighter);
  expect(sheet).toMatchObject({currentHp:4,temporaryHp:2,armorClass:15,conditions:['Poisoned'],initiative:3});
  expect(sheet.abilityScores).toEqual(character.abilityScores);
  expect(character.currentHp).toBe(10);
});
test('a recreated character with the same document ID is not presented as the original fighter', () => {
  const {character,fighter}=fixtures();
  expect(isLinkedCharacter(fighter,character)).toBe(true);
  expect(isLinkedCharacter(fighter,{...character,instanceId:'replacement'})).toBe(false);
  expect(isLinkedCharacter(fighter,{...character,id:'other'})).toBe(false);
});
test('legacy links only match characters created before that combatant', () => {
  const {character,fighter}=fixtures();
  const legacy={...fighter,characterInstanceId:undefined};
  expect(isLinkedCharacter(legacy,character)).toBe(true);
  expect(isLinkedCharacter(legacy,{...character,createdAt:'2026-01-03T00:00:00.000Z'})).toBe(false);
});
