export const text = value => typeof value === 'string' ? value : value?.name || '';
export const fold = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const abilities = ['strength','dexterity','constitution','intelligence','wisdom','charisma'];
const bonus = name => Number(/\+([1-5])\b/.exec(name)?.[1] || 0);
const clean = value => JSON.parse(JSON.stringify(value));
const sourceMeta = source => ({key:source.key,name:source.display_name || source.name,edition:source.gamesystem?.name || '5e',licenses:source.licenses.map(v=>v.key)});
export function normalizeMonster(raw, source) {
  const defenses=raw.resistances_and_immunities || {};
  const ordered=[...(raw.actions || [])].sort((a,b)=>(a.order_in_statblock || 0)-(b.order_in_statblock || 0));
  const action=v=>{
    const notes=[];
    if(v.legendary_action_cost>1) notes.push(`Coste: ${v.legendary_action_cost} acciones legendarias.`);
    if(v.usage_limits) notes.push(v.usage_limits.type==='PER_DAY'?`${v.usage_limits.param}/día.`:`Recarga: ${v.usage_limits.param || v.usage_limits.type}.`);
    if(v.limited_to_form) notes.push(`Forma: ${v.limited_to_form}.`);
    return {name:v.name,desc:[...notes,v.desc || ''].join('\n')};
  };
  const actions=type=>ordered.filter(v=>v.action_type===type).map(action);
  const extras=ordered.filter(v=>!['ACTION','BONUS_ACTION','REACTION','LEGENDARY_ACTION'].includes(v.action_type)).map(v=>({name:`${v.action_type || 'Rasgo'}: ${v.name}`,desc:v.desc || ''}));
  const cr={0.125:'1/8',0.25:'1/4',0.5:'1/2'}[raw.challenge_rating] || String(raw.challenge_rating ?? '—');
  const senses=[['darkvision_range','darkvision'],['blindsight_range','blindsight'],['tremorsense_range','tremorsense'],['truesight_range','truesight']]
    .filter(([key])=>raw[key]>0).map(([key,label])=>`${label} ${raw[key]} ft.`);
  if(raw.passive_perception!=null) senses.push(`passive Perception ${raw.passive_perception}`);
  const result={slug:raw.key,name:raw.name,size:text(raw.size),type:text(raw.type),subtype:raw.subcategory || '',alignment:text(raw.alignment),
    armor_class:raw.armor_class,armor_desc:raw.armor_detail || '',hit_points:raw.hit_points,hit_dice:raw.hit_dice || '',challenge_rating:cr,
    speed:Object.fromEntries(Object.entries(raw.speed || {}).filter(([key,value])=>['walk','fly','swim','burrow','climb'].includes(key)&&typeof value==='number')),
    skills:raw.skill_bonuses || {},languages:raw.languages?.as_string || '',senses:senses.join(', '),
    damage_vulnerabilities:defenses.damage_vulnerabilities_display || '',damage_resistances:defenses.damage_resistances_display || '',
    damage_immunities:defenses.damage_immunities_display || '',condition_immunities:defenses.condition_immunities_display || '',
    actions:actions('ACTION'),bonus_actions:actions('BONUS_ACTION'),reactions:actions('REACTION'),legendary_actions:actions('LEGENDARY_ACTION'),
    special_abilities:[...(raw.traits || []).map(v=>({name:v.name,desc:v.desc || ''})),...extras],
    document__slug:source.key,document__title:source.display_name || source.name,catalogSource:sourceMeta(source)};
  for(const key of abilities) { result[key]=raw.ability_scores?.[key]; result[`${key}_save`]=raw.saving_throws?.[key] ?? null; }
  if(!result.slug || !result.name || !Number.isFinite(result.hit_points) || !Number.isFinite(result.armor_class) || abilities.some(k=>!Number.isFinite(result[k]))) throw new Error(`Ficha incompleta: ${raw.key}`);
  return clean(result);
}
export function normalizeLegacyMonster(raw, source, key) {
  const {img_main,v2_converted_path,...data}=raw;
  return clean({...data,slug:key,document__slug:source.key,document__title:source.display_name || source.name,catalogSource:sourceMeta(source)});
}
export function weaponProperties(raw) {
  const props={};
  const flags={light:'light',finesse:'finesse',thrown:'thrown','two-handed':'twoHanded',reach:'reach',loading:'loading',heavy:'heavy',ammunition:'ammunition'};
  for(const entry of raw.properties || []) {
    const name=fold(text(entry.property || entry));
    if(flags[name]) props[flags[name]]=true;
    if(name==='versatile') { const dice=/\d+d\d+/.exec(entry.detail || ''); if(dice) props.versatile=dice[0]; }
  }
  if(raw.range>0) props.range={normal:Number(raw.range),max:Number(raw.long_range || raw.range)};
  return props;
}
export function itemType(raw) {
  const category=fold(raw.category?.key || raw.category || raw.type);
  if(raw.armor?.category==='shield' || category.includes('shield')) return 'shield';
  if(raw.weapon || /weapon/.test(category)) return 'weapon';
  if(raw.armor || /armor|armour/.test(category)) return 'armor';
  if(/potion|scroll|consumable|poison/.test(category) || /^(potion|scroll|elixir|antitoxin|acid|alchemist.s fire)\b/i.test(raw.name)) return 'consumable';
  if(/tool|instrument|kit/.test(category)) return 'tool';
  if(/treasure|gem|trade-good/.test(category)) return 'treasure';
  return 'other';
}
export function normalizeItem(raw, source, weaponMap, armorMap, magical=false) {
  const weapon=raw.weapon ? {...weaponMap.get(raw.weapon.key),...raw.weapon} : weaponMap.get(raw.key);
  const armor=raw.armor ? {...armorMap.get(raw.armor.key),...raw.armor} : armorMap.get(raw.key);
  const type=itemType({...raw,weapon,armor});
  const magicBonus=magical ? bonus(raw.name) : 0;
  const requiresAttunement=Boolean(raw.requires_attunement);
  const propertyText=(weapon?.properties || []).map(v=>`${text(v.property || v)}${v.detail?` (${v.detail})`:''}: ${v.property?.desc || ''}`).join('\n\n');
  const description=[raw.desc || '',requiresAttunement?`Requiere sintonización${raw.attunement_detail?`: ${raw.attunement_detail}`:''}.`:'',propertyText].filter(Boolean).join('\n\n');
  const catalogData={name:raw.name,type,description,quantity:1,value:Number(raw.cost) || 0,
    rarity:raw.rarity?.key || 'common',...(!['weapon','armor','shield'].includes(type)?{isMagical:magical,requiresAttunement}:{})};
  if(weapon?.damage_dice) catalogData.weaponData={weaponType:weapon.is_simple ? 'simple' : 'martial',damageDice:weapon.damage_dice,
    damageType:weapon.damage_type?.key || 'bludgeoning',properties:weaponProperties(weapon),magicBonus,isMagical:magical,requiresAttunement};
  if(armor) {
    const categories={light:'Light Armor',medium:'Medium Armor',heavy:'Heavy Armor',shield:'Shield'};
    catalogData.armorData={armorType:categories[armor.category] || armor.category || 'Light Armor',baseAC:armor.ac_base,
      dexModifier:armor.ac_add_dexmod ? (armor.ac_cap_dexmod==null?'full':`max${armor.ac_cap_dexmod}`) : 'none',
      ...(armor.strength_score_required!=null?{strengthRequirement:armor.strength_score_required}:{}),
      stealthDisadvantage:!!armor.grants_stealth_disadvantage,magicBonus,isMagical:magical,requiresAttunement};
  }
  return clean({slug:raw.key,name:raw.name,type,desc:description,rarity:catalogData.rarity,cost:catalogData.value,
    weight:raw.weight,weight_unit:raw.weight_unit,requires_attunement:requiresAttunement,attunement_detail:raw.attunement_detail,
    source:magical?'magicitems':weapon?'weapons':armor?'armor':'gear',category:raw.category?.name || raw.category || type,
    catalogData,catalogSource:sourceMeta(source)});
}
export function normalizeLegacyItem(raw, source, key, category) {
  // Keep old catalog entries usable through the established v1 converter.
  return clean({...raw,slug:key,source:category,catalogItemType:category==='weapons'?'weapon':category==='armor'?(/shield/i.test(raw.name)?'shield':'armor'):itemType(raw),catalogSource:sourceMeta(source)});
}
export function legacySourceKey(document) {
  const aliases={srd:'srd-2014',a5e:'a5e-ag'};
  return aliases[document.v2_related_key] || document.v2_related_key || `legacy-${document.slug}`;
}
