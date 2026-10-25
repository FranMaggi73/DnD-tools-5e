// Open5e V2's legacy full-caster tables contain a duplicate level-4 cell,
// with the value belonging to level 3. Never silently resolve duplicate rows.
export function correctKnownTables(options) {
 const corrected=[];
 for(const key of ['srd_bard','srd_cleric','srd_druid','srd_sorcerer','srd_wizard']) {
  const option=options.find(v=>v.slug===key);if(!option)continue;
  const feature=option.features.find(v=>v.type==='SPELL_SLOTS'&&v.name==='2nd');if(!feature)throw new Error(`Falta la tabla que se esperaba corregir: ${key}`);
  const cells=feature.table.filter(v=>[3,4].includes(v.level));
  const signature=cells.map(v=>`${v.level}:${v.column_value}`).sort().join(',');
  if(signature==='3:2,4:3')continue;
  if(signature!=='4:2,4:3')throw new Error(`La tabla de origen cambió: revisar corrección de ${key}`);
  feature.table=feature.table.filter(v=>![3,4].includes(v.level)).concat([{level:3,column_value:'2'},{level:4,column_value:'3'}]).sort((a,b)=>a.level-b.level);
  corrected.push({key,field:'Espacios de conjuro de nivel 2',before:cells,after:[{level:3,value:2},{level:4,value:3}],source:'https://www.dndbeyond.com/attachments/39j2li89/SRD5.1-CCBY4.0License.pdf'});
 }
 return corrected;
}
