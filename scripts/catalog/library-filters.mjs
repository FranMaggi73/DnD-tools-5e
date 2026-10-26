// Only structured catalog facts are indexed; descriptions are never used to guess rules.
export function libraryFields(record, kind) {
  if (kind === 'spells') return {
    concentration: record.concentration,
    ritual: record.ritual,
    castingTime: record.castingTime || ''
  };
  if (kind !== 'items') return {};
  const data = record.catalogData || {};
  const weapon = data.weaponData;
  const armor = data.armorData;
  const properties = weapon?.properties || {};
  const armorType = armor?.armorType?.toLowerCase() || '';
  return {
    magical: weapon?.isMagical ?? armor?.isMagical ?? data.isMagical ?? record.source === 'magicitems',
    attunement: weapon?.requiresAttunement ?? armor?.requiresAttunement ?? data.requiresAttunement ?? record.requires_attunement,
    weaponType: weapon?.weaponType,
    damageType: weapon?.damageType,
    weaponProperties: weapon ? Object.keys(properties).filter(key => properties[key] && key !== 'range') : undefined,
    hands: weapon ? properties.twoHanded ? 'two' : properties.versatile ? 'versatile' : 'one' : undefined,
    armorType: armor ? /shield/i.test(record.name) || armorType.includes('shield') ? 'shield' : armorType.includes('light') ? 'light' : armorType.includes('medium') ? 'medium' : armorType.includes('heavy') ? 'heavy' : undefined : undefined,
    stealthDisadvantage: armor?.stealthDisadvantage
  };
}
