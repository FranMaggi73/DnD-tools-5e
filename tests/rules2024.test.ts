import { describe, expect, test } from 'vitest';
import { advanceEffects, applyHealthAction as apply, effectiveSpeed, hasJackOfAllTrades, initiativeModifier,
  encodeRules, normalizeRules, rest, skillBonus, type HealthState, type TimedEffect } from '../frontend/src/lib/rules/2024';

function state(patch: Partial<HealthState> = {}): HealthState {
  const base = { maxHp: 20, currentHp: 20, temporaryHp: 0, conditions: [], deathSaves: { successes: 0, failures: 0 } };
  return { ...base, rules: normalizeRules({ ...base, class: 'Guerrero' }), ...patch };
}
const effect = (id: string, rounds: number | null, expires: 'start' | 'end' = 'end'): TimedEffect => ({ id, condition: 'Poisoned', source: 'Veneno', rounds, expires });

describe('2024 proficiency and movement', () => {
  test.each([[false,false,3],[true,false,5],[true,true,7]])('proficient=%s expertise=%s -> %s', (proficient, expertise, expected) => {
    expect(skillBonus(16, { proficient, expertise }, 2)).toBe(expected);
  });
  test('expertise without proficiency never doubles the bonus', () => expect(skillBonus(16, { proficient: false, expertise: true }, 2)).toBe(3));
  test('Jack of All Trades is half rounded down, only for untrained skills', () => {
    expect(hasJackOfAllTrades('Bardo', 2)).toBe(true);
    expect(hasJackOfAllTrades('Bardo', 1)).toBe(false);
    expect(skillBonus(16, { proficient: false, expertise: false }, 3, true)).toBe(4);
    expect(skillBonus(16, { proficient: true, expertise: false }, 3, true)).toBe(6);
  });
  test('exhaustion subtracts twice the level from checks', () => expect(skillBonus(16, { proficient: true, expertise: true }, 3, false, 2)).toBe(5));
  test('initiative derives from Dexterity with a separate bonus', () => expect(initiativeModifier({ strength:10,dexterity:8,constitution:10,intelligence:10,wisdom:10,charisma:10 }, 2)).toBe(1));
  test('exhaustion reduces speed and Grappled sets it to zero', () => {
    const s = state(); s.rules.exhaustion = 2;
    expect(effectiveSpeed(30, s.rules, [])).toBe(20);
    expect(effectiveSpeed(30, s.rules, ['Grappled'])).toBe(0);
  });
});
describe('2024 damage, recovery and dying', () => {
  test('resistance rounds down before temporary HP are used', () => {
    const s = state({ temporaryHp: 2 }); s.rules.resistances = ['fire'];
    const next = apply(s, { type: 'damage', amount: 9, damageType: 'fire' });
    expect(next.currentHp).toBe(18); expect(next.temporaryHp).toBe(0);
    expect(s.currentHp).toBe(20); expect(s.temporaryHp).toBe(2);
  });
  test('immunity overrides vulnerability', () => {
    const s = state(); s.rules.immunities = ['fire']; s.rules.vulnerabilities = ['fire'];
    expect(apply(s, { type:'damage', amount:100, damageType:'fire' }).currentHp).toBe(20);
  });
  test('resistance and vulnerability apply in order', () => {
    const s = state(); s.rules.resistances = ['fire']; s.rules.vulnerabilities = ['fire'];
    expect(apply(s, { type:'damage', amount:9, damageType:'fire' }).currentHp).toBe(12);
  });
  test('Petrified grants damage resistance and poison immunity', () => {
    expect(apply(state({conditions:['Petrified']}), {type:'damage',amount:10,damageType:'slashing'}).currentHp).toBe(15);
    expect(apply(state({conditions:['Petrified']}), {type:'damage',amount:10,damageType:'poison'}).currentHp).toBe(20);
  });
  test('temporary HP replace rather than stack or heal', () => {
    const s = state({currentHp:0,temporaryHp:5}); s.rules.lifeState='unconscious';
    const next = apply(s,{type:'temporary',amount:10});
    expect(next.temporaryHp).toBe(10); expect(next.currentHp).toBe(0); expect(next.rules.lifeState).toBe('unconscious');
  });
  test('dropping to zero means unconscious, not automatically dead', () => {
    const next=apply(state(),{type:'damage',amount:20});
    expect(next.currentHp).toBe(0); expect(next.rules.lifeState).toBe('unconscious');
  });
  test('massive damage causes instant death', () => expect(apply(state(),{type:'damage',amount:40}).rules.lifeState).toBe('dead'));
  test('critical damage at zero counts as two failures', () => {
    const s=apply(state(),{type:'damage',amount:20});
    expect(apply(s,{type:'damage',amount:1,critical:true}).deathSaves.failures).toBe(2);
  });
  test('damage absorbed by temporary HP still counts as damage taken at zero', () => {
    const s=apply(state(),{type:'damage',amount:20}); s.temporaryHp=5;
    const next=apply(s,{type:'damage',amount:1});
    expect(next.deathSaves.failures).toBe(1); expect(next.temporaryHp).toBe(4);
  });
  test('natural 1 causes two failures and natural 20 restores 1 HP', () => {
    const s=apply(state(),{type:'damage',amount:20});
    expect(apply(s,{type:'deathSave',roll:1}).deathSaves.failures).toBe(2);
    const next=apply(s,{type:'deathSave',roll:20});
    expect(next.currentHp).toBe(1); expect(next.rules.lifeState).toBe('alive');
  });
  test('three successes stabilize and clear both counters', () => {
    let s=apply(state(),{type:'damage',amount:20});
    for(let i=0;i<3;i++) s=apply(s,{type:'deathSave',roll:10});
    expect(s.rules.lifeState).toBe('stable'); expect(s.deathSaves).toEqual({successes:0,failures:0});
    expect(()=>apply(s,{type:'deathSave',roll:10})).toThrow();
  });
  test('healing resets counters; damage ends stability', () => {
    const s=apply(state(),{type:'damage',amount:20}); s.deathSaves.failures=2;
    expect(apply(s,{type:'heal',amount:1}).deathSaves).toEqual({successes:0,failures:0});
    expect(apply(apply(s,{type:'stabilize'}),{type:'damage',amount:1}).rules.lifeState).toBe('unconscious');
  });
  test('exhaustion also penalizes death saving throws', () => {
    const s=apply(state(),{type:'damage',amount:20}); s.rules.exhaustion=1;
    expect(apply(s,{type:'deathSave',roll:11}).deathSaves.failures).toBe(1);
  });
  test('six exhaustion levels cause death; ordinary healing cannot revive', () => {
    const dead=apply(state(),{type:'exhaustion',level:6});
    expect(dead.rules.lifeState).toBe('dead'); expect(dead.currentHp).toBe(0);
    expect(()=>apply(dead,{type:'heal',amount:10})).toThrow();
    expect(()=>apply(dead,{type:'revive',amount:1})).toThrow();
    expect(apply(apply(dead,{type:'exhaustion',level:5}),{type:'revive',amount:1}).currentHp).toBe(1);
  });
});
describe('concentration, timed effects and rests', () => {
  test('effect persistence preserves Unicode sources and manual duration', () => {
    const s=state(); s.rules.effects=[{...effect('uno',null),source:'Maldición 🐉'}];
    expect(normalizeRules({...s,rules:encodeRules(s.rules)}).effects).toEqual(s.rules.effects);
  });
  test('short rest needs positive HP and each die heals at least one', () => {
    expect(()=>rest(apply(state(),{type:'damage',amount:20}),1,10,'short',[1])).toThrow();
    expect(rest(state({currentHp:1}),1,3,'short',[1]).currentHp).toBe(2);
  });
  test('damage to temporary HP triggers a concentration save, capped at DC 30', () => {
    const s=state({temporaryHp:100}); s.rules.concentration='Conjuro';
    expect(apply(s,{type:'damage',amount:70}).rules.concentrationSaveDC).toBe(30);
  });
  test('separate damage sources require separate concentration saves', () => {
    const s=state(); s.rules.concentration='Conjuro';
    const pending=apply(s,{type:'damage',amount:1});
    expect(()=>apply(pending,{type:'damage',amount:1})).toThrow('pendiente');
    expect(apply(apply(pending,{type:'concentrationResult',success:true}),{type:'damage',amount:1}).currentHp).toBe(18);
  });
  test('incapacitation, zero HP and a failed save end concentration', () => {
    const s=state(); s.rules.concentration='Conjuro';
    expect(apply(s,{type:'damage',amount:20}).rules.concentration).toBe('');
    expect(apply({...s,conditions:['Stunned']},{type:'inspiration',value:true}).rules.concentration).toBe('');
    expect(apply(s,{type:'concentrationResult',success:false}).rules.concentration).toBe('');
  });
  test('timers decrement only at the chosen boundary', () => {
    const s=state({conditions:['Poisoned']}); s.rules.effects=[effect('one',1,'end')];
    expect(advanceEffects(s,'start').conditions).toContain('Poisoned');
    expect(advanceEffects(s,'end').conditions).not.toContain('Poisoned');
  });
  test('overlapping sources preserve a condition until the last source ends', () => {
    const s=state({conditions:['Poisoned']}); s.rules.effects=[effect('one',1),effect('two',null)];
    const next=advanceEffects(s,'end'); expect(next.conditions).toContain('Poisoned'); expect(next.rules.effects).toHaveLength(1);
  });
  test('short rest spends Hit Dice and applies Constitution per die', () => {
    const s=state({currentHp:1}); s.rules.hitDieSize=10;
    const next=rest(s,3,14,'short',[2,3]);
    expect(next.currentHp).toBe(10); expect(next.rules.hitDiceSpent).toBe(2);
    expect(()=>rest(next,3,14,'short',[2,3])).toThrow();
  });
  test('long rest recovers all Hit Dice, HP, and one exhaustion level', () => {
    const s=state({currentHp:1,temporaryHp:5,conditions:['Poisoned']}); s.rules.hitDiceSpent=3; s.rules.exhaustion=2;
    const next=rest(s,3,10,'long');
    expect(next.currentHp).toBe(20); expect(next.temporaryHp).toBe(0);
    expect(next.rules.hitDiceSpent).toBe(0); expect(next.rules.exhaustion).toBe(1);
    expect(next.conditions).toContain('Poisoned');
  });
  test('rest advances timed effects without curing indefinite conditions', () => {
    const s=state({conditions:['Poisoned']}); s.rules.effects=[effect('one',600)];
    expect(rest(s,1,10,'short').conditions).toEqual([]);
  });
  test('long rest cannot begin at zero HP', () => {
    const s=apply(state(),{type:'damage',amount:20}); expect(()=>rest(s,1,10,'long')).toThrow();
  });
});
