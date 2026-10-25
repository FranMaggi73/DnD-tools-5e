import {correctKnownTables} from './corrections.mjs';
import {referenceFacts,mergeReferences} from './reference.mjs';
import {characterOption,characterSpell} from './characters.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {normalizeMonster,normalizeLegacyMonster,normalizeItem,normalizeLegacyItem,legacySourceKey,fold} from './normalize.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const cache=join(root,'.tools/catalog-raw');
const output=join(root,'frontend/static/catalog');
const refresh=process.argv.includes('--refresh');
const hash=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex').slice(0,16);
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
await mkdir(cache,{recursive:true});
async function request(url) {
  const parsed=new URL(url);
  if(parsed.origin!=='https://api.open5e.com') throw new Error('Origen de API inesperado');
  for(let attempt=0;attempt<5;attempt++) {
    try {
      const response=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(60000)});
      if(!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
      return await response.json();
    } catch(error) { if(attempt===4) throw error; await pause(1000*2**attempt); }
  }
}
async function dataset(version,endpoint) {
  const file=join(cache,`${version}-${endpoint}.json`);
  if(!refresh) { try {const value=JSON.parse(await readFile(file,'utf8')); console.log(`Cache ${version}/${endpoint}: ${value.length}`); return value;} catch{} }
  let next=`https://api.open5e.com/${version}/${endpoint}/?limit=500&ordering=${version==='v1'?'slug':'key'}`;
  const result=[]; const visited=new Set(); let expected;
  while(next) {
    if(visited.has(next)||visited.size>100) throw new Error(`Paginación circular: ${endpoint}`);
    visited.add(next);
    const page=await request(next);
    if(!Array.isArray(page.results)) throw new Error(`Página inválida: ${endpoint}`);
    expected ??= page.count; result.push(...page.results); next=page.next;
    if(next) await pause(150);
  }
  if(result.length!==expected) throw new Error(`Catálogo incompleto ${endpoint}: ${result.length}/${expected}`);
  const ids=result.map(v=>v.key || v.slug);
  if(new Set(ids).size!==ids.length) throw new Error(`Identificadores repetidos: ${version}/${endpoint}`);
  await writeFile(file,JSON.stringify(result));
  console.log(`Descargado ${version}/${endpoint}: ${result.length}`);
  return result;
}
const [documents,licenses,v1Documents]=await Promise.all([dataset('v2','documents'),dataset('v2','licenses'),dataset('v1','documents')]);
const allowed=new Set(['cc-by-40','cc0','ogl-10a']);
const sources=new Map(documents.filter(v=>v.licenses.some(l=>allowed.has(l.key))).map(v=>[v.key,{...v,attribution:'',copyright:''}]));
for(const legacy of v1Documents) {
  const key=legacySourceKey(legacy);
  if(sources.has(key)) sources.get(key).copyright=legacy.copyright || '';
  else {
    const license=/creative commons/i.test(legacy.license)?'cc-by-40':/open gaming/i.test(legacy.license)?'ogl-10a':null;
    if(license) sources.set(key,{key,name:legacy.title,display_name:legacy.title,author:legacy.author,publisher:{name:legacy.organization},
      gamesystem:{key:'5e-2014',name:'5th Edition 2014'},permalink:legacy.url,licenses:[{key:license,name:legacy.license}],copyright:legacy.copyright || ''});
  }
}
const v1Source=new Map(v1Documents.map(v=>[v.slug,legacySourceKey(v)]));
const jobs=[['v2','species'],['v2','classes'],['v2','backgrounds'],['v2','feats'],['v2','spells'],['v2','creatures'],['v2','items'],['v2','magicitems'],['v2','weapons'],['v2','armor'],
  ['v1','monsters'],['v1','magicitems'],['v1','weapons'],['v1','armor']];
const data=new Map();
for(let i=0;i<jobs.length;i+=2) await Promise.all(jobs.slice(i,i+2).map(async([version,name])=>data.set(`${version}/${name}`,await dataset(version,name))));
const monsters=new Map(),items=new Map(),monsterAliases={},itemAliases={},skipped=[];
for(const raw of data.get('v2/creatures')) {
  const source=sources.get(raw.document?.key);
  if(!source) {skipped.push({key:raw.key,reason:'Fuente sin licencia compatible registrada'});continue;}
  monsters.set(raw.key,normalizeMonster(raw,source));
}
const weapons=new Map(data.get('v2/weapons').map(v=>[v.key,v]));
const armor=new Map(data.get('v2/armor').map(v=>[v.key,v]));
for(const [endpoint,magical] of [['items',false],['magicitems',true]]) for(const raw of data.get(`v2/${endpoint}`)) {
  const source=sources.get(raw.document?.key);
  if(!source) {skipped.push({key:raw.key,reason:'Fuente sin licencia compatible registrada'});continue;}
  items.set(raw.key,normalizeItem(raw,source,weapons,armor,magical));
}
for(const raw of [...weapons.values(),...armor.values()]) if(!items.has(raw.key)&&sources.has(raw.document?.key)) {
  items.set(raw.key,normalizeItem(raw,sources.get(raw.document.key),weapons,armor));
}
const options=[],spells=[];
for(const endpoint of ['species','classes','backgrounds','feats','spells']) for(const raw of data.get(`v2/${endpoint}`)) {
 const source=sources.get(raw.document?.key);
 if(!source) {skipped.push({key:raw.key,reason:'Fuente sin licencia compatible registrada'});continue;}
 if(endpoint==='spells') spells.push(characterSpell(raw,source));else options.push(characterOption(raw,source,endpoint));
}
const corrections=correctKnownTables(options);
const supplemental=await referenceFacts(cache,refresh);
const referenceReport=mergeReferences(supplemental,options,spells,sources);
await writeFile(join(cache,'reference-report.json'),JSON.stringify(referenceReport,null,2));
if(referenceReport.conflicts.length) throw new Error('Hay discrepancias mecánicas entre fuentes. Revisá reference-report.json antes de publicar.');
options.sort((a,b)=>a.slug.localeCompare(b.slug));spells.sort((a,b)=>a.slug.localeCompare(b.slug));
function replacement(raw,records,sourceKey) {
  const converted=raw.v2_converted_path?.split('/').filter(Boolean).at(-1);
  if(converted&&records.has(converted)) return converted;
  if(converted?.startsWith('srd_')&&records.has(converted.replace(/^srd_/,'srd-2014_'))) return converted.replace(/^srd_/,'srd-2014_');
  const matches=[...records.values()].filter(v=>fold(v.name)===fold(raw.name)&&v.catalogSource.key===sourceKey);
  return matches.length===1 ? matches[0].slug : null;
}
for(const raw of data.get('v1/monsters')) {
  const key=v1Source.get(raw.document__slug); const source=sources.get(key);
  if(!source) {skipped.push({key:raw.slug,reason:'Fuente legacy sin licencia compatible registrada'});continue;}
  let id=replacement(raw,monsters,key);
  if(!id) {id=`legacy-${raw.document__slug}_${raw.slug}`;monsters.set(id,normalizeLegacyMonster(raw,source,id));}
  monsterAliases[raw.slug]=id;
}
for(const category of ['magicitems','weapons','armor']) for(const raw of data.get(`v1/${category}`)) {
  const key=v1Source.get(raw.document__slug || 'wotc-srd'); const source=sources.get(key);
  if(!source) {skipped.push({key:`${category}:${raw.slug}`,reason:'Fuente legacy sin licencia compatible registrada'});continue;}
  let id=replacement(raw,items,key);
  if(!id) {id=`legacy-${category}_${raw.slug}`;items.set(id,normalizeLegacyItem(raw,source,id,category));}
  itemAliases[`${category}:${raw.slug}`]=id;
}
// Source attribution is distributed alongside the game data, independently of app code.
let legalInfo='';
if(!refresh) {try {legalInfo=await readFile(join(cache,'srd2024-legal.md'),'utf8');}catch{}}
if(!legalInfo) {
  const response=await fetch('https://raw.githubusercontent.com/open5e/open5e-api/staging/data/raw_sources/srd_5_2/sections/01_legal_information.md');
  if(!response.ok) throw new Error('No se pudo descargar la atribución SRD 5.2');
  legalInfo=await response.text();
  await writeFile(join(cache,'srd2024-legal.md'),legalInfo);
}
if(!legalInfo.includes('Creative Commons')) throw new Error('No se pudo obtener la atribución SRD 5.2');
for(const source of sources.values()) {
 source.status ||= ['srd-2014','srd-2024'].includes(source.key)?'official':source.key==='open5e'?'homebrew':'third-party';
 source.contentMode ||= 'open-text';
 source.attribution ||= source.key==='srd-2024'?legalInfo:`${source.name} — ${source.author || source.publisher?.name || ''}. ${source.permalink || ''}\n${source.copyright || ''}`;
}
const orderedMonsters=[...monsters.values()].sort((a,b)=>a.slug.localeCompare(b.slug));
const orderedItems=[...items.values()].sort((a,b)=>a.slug.localeCompare(b.slug));
const catalogAudit={mechanicalChecks:referenceReport.mechanicalChecks,conflicts:referenceReport.conflicts,corrections,excludedReferences:referenceReport.skipped.length,referenceRevision:supplemental.revision};
const attribution={catalogAudit,origin:'https://open5e.com; https://5e.tools',referenceRevision:supplemental.revision,importedAt:new Date().toISOString(),
  modifications:'Datos normalizados para DnD Tools. Los textos abiertos proceden de Open5e. Las referencias adicionales incluyen solo identificadores y datos mecánicos; no se redistribuyen descripciones editoriales de los libros. No se incluyen ilustraciones ni se implica aprobación de los autores.',
  sources:[...sources.values()].filter(source=>[...monsters.values(),...items.values(),...options,...spells].some(v=>v.catalogSource.key===source.key)),
  licenses,legacyCopyrightNotices:v1Documents.map(v=>({title:v.title,copyright:v.copyright,license:v.license,url:v.url})),srd2024Attribution:legalInfo};
const version=hash({options,spells,monsters:orderedMonsters,items:orderedItems,monsterAliases,itemAliases,attribution:{...attribution,importedAt:null}});
const folder=join(output,version); await mkdir(folder,{recursive:true});
async function publishDataset(kind,records,aliases) {
  const rows=[]; const packs=[];
  for(let offset=0;offset<records.length;offset+=50) {
    const group=records.slice(offset,offset+50);
    const payload=Object.fromEntries(group.map(v=>[v.slug,v]));
    const name=`${kind}-${offset/50}-${hash(payload)}.json`;
    await writeFile(join(folder,name),JSON.stringify(payload)); packs.push(`/catalog/${version}/${name}`);
    for(const v of group) rows.push({key:v.slug,name:v.name,type:v.catalogData?.type || v.catalogItemType || v.type,
      sourceKey:v.catalogSource.key,source:v.source || '',cr:v.challenge_rating,rarity:v.rarity,parentKey:v.parentKey,level:v.level,classes:v.classes,school:v.school,edition:v.catalogSource.edition,status:v.catalogSource.status||sources.get(v.catalogSource.key)?.status,contentMode:v.contentMode||'open-text',aliases:v.name==='Artificer'?['Artificiero']:[],
      desc:(v.desc || '').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').slice(0,180),pack:packs.length-1});
  }
  const index={rows,packs,aliases}; const name=`${kind}-index-${hash(index)}.json`;
  await writeFile(join(folder,name),JSON.stringify(index));
  return {count:records.length,index:`/catalog/${version}/${name}`,packs:packs.length};
}
const monsterInfo=await publishDataset('monsters',orderedMonsters,monsterAliases);
const itemInfo=await publishDataset('items',orderedItems,itemAliases);
const optionInfo=await publishDataset('options',options,{});
const spellInfo=await publishDataset('spells',spells,{});
const {importedAt:ignoredImportTime,...publishedAttribution}=attribution;
await writeFile(join(folder,'sources.json'),JSON.stringify(publishedAttribution));
const notice=['DnD Tools — Catálogo de monstruos y objetos','Fuentes de datos: Open5e (https://open5e.com) y referencias mecánicas de 5etools (https://5e.tools)' ,attribution.modifications,
  legalInfo,...attribution.sources.map(v=>v.attribution),'AVISOS DE COPYRIGHT DE LAS FUENTES LEGACY',
  ...attribution.legacyCopyrightNotices.map(v=>`${v.title}\n${v.copyright || ''}`),
  'LICENCIAS COMPLETAS',...licenses.map(v=>`${v.name}\n${v.desc}`)].join('\n\n');
await writeFile(join(folder,'NOTICE.txt'),notice);
const manifest={schemaVersion:1,version,generatedAt:attribution.importedAt,monsters:monsterInfo,items:itemInfo,options:optionInfo,spells:spellInfo,
  audit:catalogAudit,sources:`/catalog/${version}/sources.json`,notice:`/catalog/${version}/NOTICE.txt`,
  sourceLabels:Object.fromEntries(attribution.sources.map(v=>[v.key,{key:v.key,name:v.display_name || v.name,edition:v.gamesystem?.name || '5e',licenses:v.licenses.map(l=>l.key),status:v.status,published:v.published||'',contentMode:v.contentMode}]))};
await mkdir(output,{recursive:true});
await writeFile(join(output,'manifest.json'),JSON.stringify(manifest));
await writeFile(join(cache,'import-report.json'),JSON.stringify({version,monsters:monsterInfo,items:itemInfo,skipped,referenceReport},null,2));
console.log(JSON.stringify({version,monsters:monsterInfo.count,items:itemInfo.count,options:options.length,spells:spells.length,legacyMonsterAliases:Object.keys(monsterAliases).length,legacyItemAliases:Object.keys(itemAliases).length,sources:attribution.sources.length,skipped:skipped.length,referenceSkipped:referenceReport.skipped.length},null,2));
