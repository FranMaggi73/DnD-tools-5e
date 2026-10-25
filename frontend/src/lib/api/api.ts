export { sparkApi as api } from './spark';
import type { Monster, MonsterSearchResult, Condition, ConditionSearchResult } from '$lib/types';
import { catalogApi } from './catalog';
import { CONDITION_NAMES, CONDITION_INFO } from '$lib/rules/2024';
import { plainText } from '$lib/utils/plainText';

// Compatibility facade: all data now comes from our hosted catalog.
export const open5eApi = {
  searchMonsters: catalogApi.searchMonsters,
  getMonster: catalogApi.getMonster,

  monsterToCombatant: (monster: Monster, initiative: number) => ({
    type: 'creature' as const,
    name: monster.name,
    initiative,
    maxHp: monster.hit_points,
    currentHp: monster.hit_points,
    armorClass: monster.armor_class,
    isNpc: true,
    creatureSource: 'open5e',
    monsterSlug: monster.slug
  }),

  searchConditions: async (query: string): Promise<ConditionSearchResult> => {
    const q=query.trim().toLowerCase();
    const results=CONDITION_NAMES.filter(name=>`${name} ${CONDITION_INFO[name].label}`.toLowerCase().includes(q))
      .map(name=>({slug:name.toLowerCase(),name,desc:CONDITION_INFO[name].description}));
    return {count:results.length,next:null,previous:null,results};
  },
  getCondition: async (slug: string): Promise<Condition> => {
    const name=CONDITION_NAMES.find(name=>name.toLowerCase()===slug.toLowerCase());
    if(!name) throw new Error('Condición no encontrada');
    return {slug:name.toLowerCase(),name,desc:CONDITION_INFO[name].description};
  },

  cleanDescription: (html: string, maxLength: number = 150): string => {
    return plainText(html,maxLength);
  }
};
