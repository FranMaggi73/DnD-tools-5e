export function characterOption(raw,source,kind) {
  const label={key:source.key,name:source.display_name||source.name,edition:source.gamesystem?.name||'5e',licenses:source.licenses.map(v=>v.key)};
  const features=(raw.features||raw.traits||raw.benefits||[]).map(v=>({name:v.name||'Benefit',desc:v.desc||'',type:v.feature_type||v.type||'',levels:(v.gained_at||[]).map(x=>x.level),table:[...new Map((v.data_for_class_table||[]).map(c=>[`${c.level}:${c.column_value}`,c])).values()]}));
  return {slug:raw.key,name:raw.name,type:kind==='classes'?(raw.subclass_of?'subclass':'class'):kind==='species'?(raw.is_subspecies?'subspecies':'species'):kind==='backgrounds'?'background':'feat',
    parentKey:raw.subclass_of?.key||raw.subspecies_of||'',desc:raw.desc||'',catalogSource:label,features,
    hitDie:Number((raw.hit_dice||'').replace(/\D/g,''))||0,saves:(raw.saving_throws||[]).map(v=>v.name.toLowerCase()),casterType:raw.caster_type||'NONE',prerequisite:raw.prerequisite||''};
}
export function characterSpell(raw,source) {
  return {slug:raw.key,name:raw.name,type:'spell',desc:raw.desc||'',catalogSource:{key:source.key,name:source.display_name||source.name,edition:source.gamesystem?.name||'5e',licenses:source.licenses.map(v=>v.key)},
    level:raw.level,school:raw.school?.name||'',classes:(raw.classes||[]).map(v=>v.key),castingTime:raw.casting_time||'',range:raw.range_text||'',duration:raw.duration||'',
    concentration:!!raw.concentration,ritual:!!raw.ritual,components:[raw.verbal?'V':'',raw.somatic?'S':'',raw.material?`M (${raw.material_specified||'material'})`:''].filter(Boolean).join(', '),higherLevel:raw.higher_level||''};
}
