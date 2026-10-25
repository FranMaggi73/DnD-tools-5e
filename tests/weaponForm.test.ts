import { expect, test } from 'vitest';
import { weaponFormFromData, weaponDataFromForm, validateWeaponForm } from '../frontend/src/lib/utils/weaponForm';

test('creation and editing round-trip all weapon fields and preserve catalog properties', () => {
  const original = { weaponType:'martial', damageDice:'1d8', damageType:'slashing', properties:{finesse:true,versatile:'1d10'},magicBonus:0 };
  const form = {...weaponFormFromData(original),diceCount:2,dieSize:6,damageType:'fire' as const,isMagical:true,magicBonus:2,requiresAttunement:true};
  const stored = weaponDataFromForm(form,original);
  expect(stored).toMatchObject({damageDice:'2d6',damageType:'fire',isMagical:true,magicBonus:2,requiresAttunement:true,properties:original.properties});
  expect(weaponFormFromData(stored)).toEqual(form);
});
test('magical weapons may have +0 and old +N weapons are recognized as magical', () => {
  expect(validateWeaponForm({...weaponFormFromData(),isMagical:true})).toBe('');
  expect(validateWeaponForm({...weaponFormFromData(),isMagical:true,requiresAttunement:true})).toBe('');
  expect(weaponFormFromData({weaponType:'simple',damageDice:'1d4',damageType:'piercing',properties:{},magicBonus:1}).isMagical).toBe(true);
});
test('invalid dice, bonuses and a nonmagical bonus are rejected before saving', () => {
  for (const patch of [{diceCount:0},{diceCount:1.5},{dieSize:7},{magicBonus:6,isMagical:true},{magicBonus:1,isMagical:false},{isMagical:false,requiresAttunement:true}]) {
    expect(validateWeaponForm({...weaponFormFromData(),...patch})).not.toBe('');
  }
});
test('versatile weapons preserve independent damage dice for each mode', () => {
  const form = {...weaponFormFromData(),handling:'versatile' as const,diceCount:1,dieSize:8,twoHandedDiceCount:2,twoHandedDieSize:6};
  const stored=weaponDataFromForm(form);
  expect(stored.damageDice).toBe('1d8');
  expect(stored.properties).toMatchObject({twoHanded:false,versatile:'2d6'});
  expect(weaponFormFromData(stored)).toEqual(form);
});
test('switching away from versatile clears its alternate damage and preserves other properties', () => {
  const original={weaponType:'martial',damageDice:'1d8',damageType:'slashing',properties:{versatile:'1d10',finesse:true}};
  for(const handling of ['one-handed','two-handed'] as const) {
    const stored=weaponDataFromForm({...weaponFormFromData(original),handling},original);
    expect(stored.properties.versatile).toBeUndefined();
    expect(stored.properties.twoHanded).toBe(handling==='two-handed');
    expect(stored.properties.finesse).toBe(true);
    expect(weaponFormFromData(stored).handling).toBe(handling);
  }
});
test('alternate damage is validated only when the weapon is versatile', () => {
  const form={...weaponFormFromData(),twoHandedDiceCount:0,twoHandedDieSize:7};
  expect(validateWeaponForm(form)).toBe('');
  expect(validateWeaponForm({...form,handling:'versatile'})).not.toBe('');
});
test('fixed damage catalog weapons are preserved rather than turned into dice rolls', () => {
  for(const damageDice of ['0','1','12']) {
    const form=weaponFormFromData({weaponType:'simple',damageDice,damageType:'piercing',properties:{}});
    expect(form.damageMode).toBe('fixed');expect(weaponDataFromForm(form).damageDice).toBe(damageDice);
  }
});
