import { expect, test } from 'vitest';
import { armorFormFromData, armorDataFromForm, validateArmorForm } from '../frontend/src/lib/utils/armorForm';

test('armor creation and editing retain magical status, bonus and attunement', () => {
  const original={armorType:'Heavy Armor',baseAC:18,strengthRequirement:15,stealthDisadvantage:true};
  const form={...armorFormFromData(original),isMagical:true,magicBonus:2,requiresAttunement:true};
  const stored=armorDataFromForm(form,original);
  expect(stored).toMatchObject({...original,isMagical:true,magicBonus:2,requiresAttunement:true});
  expect(armorFormFromData(stored)).toEqual(form);
});
test('magical +0 armor may require attunement and legacy bonuses imply magical status', () => {
  expect(validateArmorForm({...armorFormFromData(),isMagical:true,requiresAttunement:true})).toBe('');
  expect(armorFormFromData({armorType:'light',baseAC:12,magicBonus:1}).isMagical).toBe(true);
  expect(armorDataFromForm(armorFormFromData(undefined,'shield'),undefined,'shield')).toMatchObject({armorType:'Shield',baseAC:2});
});
test('nonmagical bonus, nonmagical attunement and invalid armor numbers are rejected', () => {
  for (const patch of [{magicBonus:1},{requiresAttunement:true},{baseAC:-1},{baseAC:12.5},{isMagical:true,magicBonus:4}]) {
    expect(validateArmorForm({...armorFormFromData(),...patch})).not.toBe('');
  }
});
