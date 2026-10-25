import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

export const REFERENCE_REVISION='8790755429c346d20020eed7826d312d484c393f';
const origin=`https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/${REFERENCE_REVISION}/`;
export const cleanName=value=>String(value||'').replace(/\{@\w+ ([^{}]+)}/g,(_,body)=>body.split('|')[0]).replace(/<[^>]*>/g,'').trim();
const simple=value=>typeof value==='number'||typeof value==='boolean'?value:typeof value==='string'?cleanName(value).slice(0,180):undefined;
const pick=(value,keys)=>Object.fromEntries(keys.filter(key=>value?.[key]!==undefined).map(key=>[key,value[key]]));
const ability={str:'strength',dex:'dexterity',con:'constitution',int:'intelligence',wis:'wisdom',cha:'charisma'};
export function sourceStatus(code,book) {
 if(/^UA/i.test(code))return 'playtest';
 if(book?.author==='Wizards RPG Team')return 'official';
 return 'unclassified';
}
// Only identifiers, numeric tables and structured mechanics enter the cache.
// No descriptions, entries, fluff, illustrations or book chapters are retained.
export function extractFacts(data,kind) {
 const rows=[];
 for(const raw of data[kind]||[]) {
  const row={name:cleanName(raw.name),source:raw.source,edition:raw.edition,page:raw.page,copy:raw._copy?pick(raw._copy,['name','source','raceName','raceSource','className','classSource']):undefined};
  if(kind==='class')Object.assign(row,{hitDie:raw.hd?.faces,saves:(raw.proficiency||[]).map(v=>ability[v]).filter(Boolean),castingAbility:ability[raw.spellcastingAbility],casterProgression:raw.casterProgression,
   training:{armor:(raw.startingProficiencies?.armor||[]).filter(v=>typeof v==='string').map(cleanName),weapons:(raw.startingProficiencies?.weapons||[]).filter(v=>typeof v==='string').map(cleanName),tools:(raw.startingProficiencies?.tools||[]).map(cleanName),skills:raw.startingProficiencies?.skills||[]},
   features:(raw.classFeatures||[]).map(v=>typeof v==='string'?v:v.classFeature).filter(Boolean),
   tables:(raw.classTableGroups||[]).map(v=>({labels:(v.colLabels||[]).map(cleanName),spellSlots:!!v.rowsSpellProgression,rows:(v.rowsSpellProgression||v.rows||[]).map(r=>r.map(simple))}))});
  if(kind==='subclass')Object.assign(row,{className:raw.className,classSource:raw.classSource,features:raw.subclassFeatures||[]});
  if(kind==='race'||kind==='subrace')Object.assign(row,{parentName:raw.raceName||raw._copy?.raceName,parentSource:raw.raceSource||raw._copy?.raceSource,speed:raw.speed,size:raw.size,
   ability:raw.ability,skills:raw.skillProficiencies,tools:raw.toolProficiencies,languages:raw.languageProficiencies,
   traits:(raw.entries||[]).filter(v=>v&&typeof v==='object'&&v.name).map(v=>cleanName(v.name))});
  if(kind==='background')Object.assign(row,{skills:raw.skillProficiencies,tools:raw.toolProficiencies,languages:raw.languageProficiencies,ability:raw.ability,
   feats:raw.feats,traitNames:(raw.entries||[]).filter(v=>v&&typeof v==='object'&&v.name).map(v=>cleanName(v.name))});
  if(kind==='feat')Object.assign(row,{category:raw.category,ability:raw.ability,prerequisite:(raw.prerequisite||[]).map(v=>pick(v,['level','ability','spellcasting','spellcasting2020','pactMagic','feat','proficiency'])),benefitNames:(raw.entries||[]).filter(v=>v&&typeof v==='object'&&v.name).map(v=>cleanName(v.name))});
  if(kind==='spell')Object.assign(row,{level:raw.level,school:raw.school,time:(raw.time||[]).map(v=>pick(v,['number','unit'])),range:raw.range,duration:(raw.duration||[]).map(v=>pick(v,['type','duration','concentration'])),components:{v:!!raw.components?.v,s:!!raw.components?.s,m:!!raw.components?.m},ritual:!!raw.meta?.ritual});
  rows.push(row);
 }
 return rows;
}
export async function referenceFacts(cache,refresh=false) {
 const file=join(cache,`reference-${REFERENCE_REVISION}-facts.json`);
 if(!refresh){try{return JSON.parse(await readFile(file,'utf8'));}catch{}}
 async function get(path){for(let attempt=0;attempt<3;attempt++){try{const response=await fetch(origin+path,{signal:AbortSignal.timeout(60000)});if(!response.ok)throw new Error(`HTTP ${response.status}: ${path}`);return await response.json();}catch(error){if(attempt===2)throw error;}}}
 const bookData=await get('data/books.json');
 const books=Object.fromEntries(bookData.book.map(v=>[v.id,pick(v,['id','name','source','published','author'])]));
 const classIndex=await get('data/class/index.json');const spellIndex=await get('data/spells/index.json');
 const jobs=[...Object.values(classIndex).map(v=>({path:`data/class/${v}`,kinds:['class','subclass']})),
 ...Object.values(spellIndex).map(v=>({path:`data/spells/${v}`,kinds:['spell']})),
 {path:'data/races.json',kinds:['race','subrace']},{path:'data/backgrounds.json',kinds:['background']},{path:'data/feats.json',kinds:['feat']}];
 const records=[];
 for(let i=0;i<jobs.length;i+=2)for(const group of await Promise.all(jobs.slice(i,i+2).map(async job=>{const data=await get(job.path);return job.kinds.flatMap(kind=>extractFacts(data,kind).map(v=>({...v,kind,path:job.path})));})))records.push(...group);
 const lookup=await get('data/generated/gendata-spell-source-lookup.json');
 const spellClasses={};
 for(const [source,spells] of Object.entries(lookup))for(const [name,links] of Object.entries(spells))spellClasses[`${source}|${name}`]=Object.entries(links.class||{}).flatMap(([source,classes])=>Object.keys(classes).map(name=>({source,name})));
 const result={revision:REFERENCE_REVISION,books,records,spellClasses};
 await writeFile(file,JSON.stringify(result));return result;
}
const slug=value=>cleanName(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function referenceKey(kind,source,name,parent=''){return `ref-${source.toLowerCase()}_${kind}-${slug(name)}${parent?`-${slug(parent)}`:''}`;}
const fold=value=>slug(value).replace(/-/g,'');
const school={A:'Abjuration',C:'Conjuration',D:'Divination',E:'Enchantment',V:'Evocation',I:'Illusion',N:'Necromancy',T:'Transmutation'};
export function mergeReferences(facts,options,spells,sources) {
 const report={revision:facts.revision,mechanicalChecks:0,conflicts:[],addedOptions:0,addedSpells:0,matchedOpenRecords:0,skipped:[],sourceCount:0};
 const matching=(rows,name,source,type,parentKey)=>rows.find(v=>fold(v.name)===fold(name)&&v.type===type&&v.catalogSource.key===source&&(!parentKey||v.parentKey===parentKey));
 const coreSource=code=>code==='PHB'?'srd-2014':code==='XPHB'?'srd-2024':null;
 const editionOf=(row)=>row.edition==='one'?'2024':row.edition==='classic'?'2014':facts.books[row.source]?.published?(facts.books[row.source].published>='2024-09-17'?'2024':'2014'):'unknown';
 const refUrl=(kind,row)=>`https://5e.tools/${kind==='class'||kind==='subclass'?'classes':kind==='race'||kind==='subrace'?'races':kind==='background'?'backgrounds':kind==='feat'?'feats':'spells'}.html#${encodeURIComponent((kind==='subclass'?row.className:row.name).toLowerCase())}_${encodeURIComponent((kind==='subclass'?row.classSource:row.source).toLowerCase())}`;
 const officialUrl=code=>code==='EFA'?'https://www.dndbeyond.com/sources/dnd/efota':code==='TCE'?'https://www.dndbeyond.com/sources/dnd/tcoe':undefined;
 function metadata(row){const key=`book-${row.source.toLowerCase()}`;const book=facts.books[row.source];const edition=editionOf(row);const status=sourceStatus(row.source,book);
  if(!sources.has(key))sources.set(key,{key,name:book?.name||row.source,display_name:book?.name||row.source,author:book?.author||'',publisher:{name:status==='official'?'Wizards of the Coast':''},gamesystem:{name:`5th Edition ${edition}`},licenses:[],published:book?.published||'',status,contentMode:'mechanics',permalink:officialUrl(row.source)||`https://5e.tools/book.html#${encodeURIComponent(row.source.toLowerCase())}`,attribution:'Se incluyen identificadores y datos mecánicos normalizados. Los textos, ilustraciones y demás contenido editorial de la publicación no se distribuyen en este catálogo. Los derechos de la publicación pertenecen a sus titulares.'});
  const source=sources.get(key);return {key,name:source.name,edition:`5th Edition ${edition}`,licenses:[],status,published:book?.published||'',contentMode:'mechanics'};
 }
 const classKeys=new Map(),raceKeys=new Map();
 const usable=facts.records.filter(row=>{if(!row.name){report.skipped.push({kind:row.kind,source:row.source,reason:'Registro sin nombre propio'});return false;}if(sourceStatus(row.source,facts.books[row.source])==='unclassified'){report.skipped.push({kind:row.kind,name:row.name,source:row.source,reason:'Publicación sin clasificación verificada'});return false;}return true;});
 function option(row,type,parentKey='') {
  const existing=coreSource(row.source)&&matching(options,row.name,coreSource(row.source),type,parentKey);
  const source=metadata(row);const references=[{provider:'5etools',url:refUrl(row.kind,row),revision:facts.revision,sourcePath:row.path,page:row.page}];
  if(existing){
   existing.references=references;
   if(row.kind==='class'){
    if(existing.hitDie&&row.hitDie){report.mechanicalChecks++;if(existing.hitDie!==row.hitDie)report.conflicts.push({key:existing.slug,field:'hitDie',open:existing.hitDie,reference:row.hitDie});}
    if(row.training)existing.training=row.training;if(row.castingAbility)existing.castingAbility=row.castingAbility;
    for(const table of (row.tables||[]).filter(v=>v.spellSlots))for(let n=0;n<table.labels.length;n++) {
     const feature=existing.features.find(v=>v.type==='SPELL_SLOTS'&&Number.parseInt(v.name)===n+1);
     if(feature)for(const cell of feature.table){const expected=table.rows[cell.level-1]?.[n];const actual=Number(cell.column_value);if(typeof expected==='number'&&Number.isFinite(actual)){report.mechanicalChecks++;if(actual!==expected)report.conflicts.push({key:existing.slug,field:`slots-${n+1}-level-${cell.level}`,open:actual,reference:expected});}}
    }
   }
   if(row.kind==='class')for(const table of (row.tables||[]).filter(v=>!v.spellSlots))for(let n=0;n<table.labels.length;n++) {
    const feature=existing.features.find(v=>v.table.length&&fold(v.name)===fold(table.labels[n]));
    if(feature)for(const cell of feature.table){const expected=table.rows[cell.level-1]?.[n];const actual=cell.column_value;if((typeof expected==='number'||/^[0-9]+d[0-9]+$/.test(String(expected)))&&actual!==undefined){report.mechanicalChecks++;if(String(actual).toLowerCase().replace(/^(\d+)(st|nd|rd|th)$/,'$1')!==String(expected).toLowerCase())report.conflicts.push({key:existing.slug,field:`${feature.name}-level-${cell.level}`,open:actual,reference:expected});}}
   }
   existing.mechanics=pick(row,['speed','size','ability','skills','tools','languages','feats','prerequisite','category']);
   report.matchedOpenRecords++;return existing;
  }
  const key=referenceKey(row.kind,row.source,row.name,parentKey);
  const features=(row.features||[]).map(uid=>{const parts=(typeof uid==='string'?uid:uid.subclassFeature||'').split('|');return {name:parts[0]||'',desc:'',type:'REFERENCE_FEATURE',levels:[Number(parts[type==='subclass'?5:3])].filter(n=>n>=1&&n<=20),table:[]};});
  const traits=row.traits||row.traitNames||row.benefitNames||[];features.push(...traits.map(name=>({name,desc:'',type:'REFERENCE_FEATURE',levels:[],table:[]})));
  for(const table of row.tables||[])for(let i=0;i<table.labels.length;i++){const name=table.spellSlots?String(i+1):table.labels[i];features.push({name,desc:'',type:table.spellSlots?'SPELL_SLOTS':'CLASS_TABLE_DATA',levels:[],table:table.rows.flatMap((values,n)=>values[i]!==null&&values[i]!==undefined?[{level:n+1,column_value:String(values[i])}]:[])});}
  const value={slug:key,name:row.name,type,parentKey,desc:'',catalogSource:source,features,hitDie:row.hitDie||0,saves:row.saves||[],casterType:row.casterProgression||'NONE',castingAbility:row.castingAbility||'none',training:row.training,mechanics:pick(row,['speed','size','ability','skills','tools','languages','feats','prerequisite','category']),prerequisite:'',references,contentMode:row.copy?'reference':'mechanics'};
  options.push(value);report.addedOptions++;return value;
 }
 for(const row of usable.filter(v=>v.kind==='class'&&[6,8,10,12].includes(v.hitDie)))classKeys.set(`${row.source}|${fold(row.name)}`,option(row,'class').slug);
 for(const row of usable.filter(v=>v.kind==='class'&&![6,8,10,12].includes(v.hitDie)))report.skipped.push({name:row.name,source:row.source,reason:'Clase especial sin dado de golpe fijo; no se asume una clase de jugador'});
 for(const row of usable.filter(v=>v.kind==='race'))raceKeys.set(`${row.source}|${fold(row.name)}`,option(row,'species').slug);
 for(const row of usable.filter(v=>v.kind==='subclass')){const parent=classKeys.get(`${row.classSource}|${fold(row.className)}`);if(!parent){report.skipped.push({name:row.name,source:row.source,reason:'Clase padre ausente'});continue;}if(row.classSource!==row.source&&editionOf(row)!==editionOf({source:row.classSource})){report.skipped.push({name:row.name,source:row.source,reason:'Adaptación entre ediciones no importada automáticamente'});continue;}option(row,'subclass',parent);}
 for(const row of usable.filter(v=>v.kind==='subrace')){const parent=raceKeys.get(`${row.parentSource}|${fold(row.parentName)}`);if(parent)option(row,'subspecies',parent);else report.skipped.push({name:row.name,source:row.source,reason:'Especie padre ausente'});}
 for(const row of usable.filter(v=>v.kind==='background'||v.kind==='feat'))option(row,row.kind);
 for(const row of usable.filter(v=>v.kind==='spell')) {
  const classes=(facts.spellClasses[`${row.source.toLowerCase()}|${row.name.toLowerCase()}`]||[]).map(v=>classKeys.get(`${v.source}|${fold(v.name)}`)).filter(Boolean);
  let existing=coreSource(row.source)&&matching(spells,row.name,coreSource(row.source),'spell');
  if(!existing){const edition=editionOf(row);const matches=spells.filter(v=>fold(v.name)===fold(row.name)&&v.catalogSource.edition?.includes(edition)&&v.catalogSource.key.startsWith('srd-'));if(matches.length===1)existing=matches[0];}
  const references=[{provider:'5etools',url:refUrl('spell',row),revision:facts.revision,sourcePath:row.path,page:row.page}];
  if(existing){report.mechanicalChecks++;if(existing.level!==row.level)report.conflicts.push({key:existing.slug,field:'spellLevel',open:existing.level,reference:row.level});existing.classes=[...new Set([...existing.classes,...classes])];existing.references=references;report.matchedOpenRecords++;continue;}
  const duration=row.duration?.[0];const distance=row.range?.distance;const time=row.time?.[0];
  spells.push({slug:referenceKey('spell',row.source,row.name),name:row.name,type:'spell',desc:'',catalogSource:metadata(row),level:row.level,school:school[row.school]||row.school,classes,
   castingTime:time?`${time.number||1} ${time.unit}`:'',range:distance?`${distance.amount||''} ${distance.type}`.trim():'',duration:duration?.duration?`${duration.duration.amount} ${duration.duration.type}`:duration?.type||'',
   concentration:!!duration?.concentration,ritual:!!row.ritual,components:Object.entries(row.components||{}).filter(([,v])=>v).map(([key])=>key.toUpperCase()).join(', '),higherLevel:'',references,contentMode:'mechanics'});report.addedSpells++;
 }
 report.sourceCount=[...sources.values()].filter(s=>s.contentMode==='mechanics').length;return report;
}
