import type {CharacterOption,CatalogSpell} from '$lib/rules/characterBuilder';
import type { CatalogSource, Monster, MonsterSummary, MonsterSearchResult } from '$lib/types';
import type { Open5eItem, Open5eSearchResult } from './inventory';

interface CatalogRow {key:string;name:string;type:string;sourceKey:string;source:string;cr?:string;rarity?:string;desc:string;pack:number;parentKey?:string;level?:number;classes?:string[];school?:string;edition?:string;status?:string;contentMode?:string;aliases?:string[];sourceLabel?:string;published?:string}
interface CatalogIndex {rows:CatalogRow[];packs:string[];aliases:Record<string,string>}
export interface CatalogManifest {
  audit?:{mechanicalChecks:number;conflicts:unknown[];corrections:Array<{key:string;field:string;source:string}>;excludedReferences:number;referenceRevision:string};
  schemaVersion:number;version:string;generatedAt:string;
  monsters:{count:number;index:string;packs:number};items:{count:number;index:string;packs:number};
  options:{count:number;index:string;packs:number};spells:{count:number;index:string;packs:number};
  sources:string;notice:string;sourceLabels:Record<string,CatalogSource>;
}
export interface CatalogCredits {
  origin:string;modifications:string;srd2024Attribution:string;referenceRevision?:string;
  sources:Array<{key:string;name:string;display_name?:string;author?:string;copyright?:string;attribution?:string;permalink?:string;status?:string;published?:string;contentMode?:string;gamesystem?:{name:string};licenses:Array<{key:string;name:string}>}>;
  licenses:Array<{key:string;name:string;desc:string}>;
  legacyCopyrightNotices:Array<{title:string;copyright:string;license:string;url:string}>;
}
const fold=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
async function json<T>(path:string,immutable=true):Promise<T> {
  if(!path.startsWith('/catalog/') || path.includes('..')) throw new Error('Ruta de catálogo inválida.');
  const response=await fetch(path,{cache:immutable?'force-cache':'no-cache'});
  if(!response.ok) throw new Error('No se pudo cargar el catálogo propio. Volvé a intentarlo.');
  return response.json();
}
let manifestPromise:Promise<CatalogManifest>|undefined;
function manifest() {
  return manifestPromise ||= json<CatalogManifest>('/catalog/manifest.json',false).then(value=>{
    if(value.schemaVersion!==1) throw new Error('Actualizá la página para cargar el catálogo.');
    return value;
  }).catch(error=>{manifestPromise=undefined;throw error;});
}
const indexes=new Map<string,Promise<CatalogIndex>>();
const packs=new Map<string,Promise<Record<string,Monster|Open5eItem|CharacterOption|CatalogSpell>>>();
async function index(kind:'monsters'|'items'|'options'|'spells') {
  const config=await manifest(); const path=config[kind].index;
  if(!indexes.has(path)) indexes.set(path,json<CatalogIndex>(path).catch(error=>{indexes.delete(path);throw error;}));
  return {config,data:await indexes.get(path)!};
}
function rank(rows:CatalogRow[],query:string,labels:Record<string,CatalogSource>,type?:string) {
  const q=fold(query.trim()); if(!q) return [];
  const terms=q.split(/\s+/);
  return rows.filter(row=>(!type || type==='other' || row.type===type)&&terms.every(term=>fold(`${row.name} ${row.type} ${(row.aliases||[]).join(' ')}`).includes(term)))
    .sort((a,b)=>{
      const score=(row:CatalogRow)=>Number(fold(row.name)===q)*100+Number(fold(row.name).startsWith(q))*20+Number(labels[row.sourceKey]?.edition==='5th Edition 2024')*5;
      return score(b)-score(a)||a.name.length-b.name.length||a.key.localeCompare(b.key);
    });
}
async function entry<T>(kind:'monsters'|'items'|'options'|'spells',key:string,category='magicitems'):Promise<T> {
  const {data,config}=await index(kind);
  const canonical=data.rows.some(row=>row.key===key)?key:data.aliases[kind==='monsters'?key:`${category}:${key}`];
  const row=data.rows.find(row=>row.key===canonical);
  if(!row) throw new Error('Esta referencia no está en el catálogo propio. Podés buscarla por nombre.');
  const path=data.packs[row.pack];
  if(!packs.has(path)) {
    if(packs.size>=8) packs.delete(packs.keys().next().value!);
    packs.set(path,json<Record<string,Monster|Open5eItem|CharacterOption|CatalogSpell>>(path).catch(error=>{packs.delete(path);throw error;}));
  }
  const record=(await packs.get(path)!)[row.key];
  if(!record) throw new Error('La ficha del catálogo está incompleta.');
  const copy=JSON.parse(JSON.stringify(record));
  copy.catalogSource={...config.sourceLabels[copy.catalogSource.key],...copy.catalogSource};
  return copy as T;
}
export const catalogApi={
  manifest,
  async credits() {const config=await manifest();return json<CatalogCredits>(config.sources);},
  async sourceForItem(key:string):Promise<CatalogSource|null> {
    const {config,data}=await index('items');
    const row=data.rows.find(v=>v.key===key || ['magicitems','weapons','armor','gear'].some(category=>data.aliases[`${category}:${key}`]===v.key));
    return row?config.sourceLabels[row.sourceKey]:null;
  },
  async searchMonsters(query:string):Promise<MonsterSearchResult> {
    const {config,data}=await index('monsters'); const rows=rank(data.rows,query,config.sourceLabels);
    const results:MonsterSummary[]=rows.slice(0,30).map(row=>({slug:row.key,name:row.name,type:row.type,challenge_rating:row.cr || '—',
      document__slug:row.sourceKey,document__title:config.sourceLabels[row.sourceKey]?.name,catalogSource:config.sourceLabels[row.sourceKey]}));
    return {count:rows.length,next:null,previous:null,results};
  },
  async searchOptions(query:string,type:string,edition='2024',parentKey='',scope='official') {
    const {config,data}=await index('options');
    return query.trim() ? filterOptionRows(rank(data.rows,query,config.sourceLabels),config,type,edition,parentKey,scope) : filterOptionRows(data.rows,config,type,edition,parentKey,scope);
  },
  getOption:(key:string)=>entry<CharacterOption>('options',key),
  async searchSpells(query:string,edition='2024',level=-1,classKey='',scope='official') {
    const {config,data}=await index('spells');
    const rows=query.trim()?rank(data.rows,query,config.sourceLabels):data.rows;
    return rows.filter(row=>(edition==='all'||row.edition?.includes(edition))&&(level<0||row.level===level)&&(!classKey||row.classes?.includes(classKey))&&(scope==='all'||config.sourceLabels[row.sourceKey]?.status===scope)).slice(0,40).map(row=>decorate(row,config));
  },
  getSpell:(key:string)=>entry<CatalogSpell>('spells',key),
  getMonster:(key:string)=>entry<Monster>('monsters',key),
  async searchItems(query:string,type?:string):Promise<Open5eSearchResult> {
    const {config,data}=await index('items'); const rows=rank(data.rows,query,config.sourceLabels,type);
    const results:Open5eItem[]=rows.slice(0,30).map(row=>({slug:row.key,name:row.name,type:row.type,desc:row.desc,rarity:row.rarity,
      source:row.source,catalogSource:config.sourceLabels[row.sourceKey]}));
    return {count:rows.length,next:null,previous:null,results};
  },
  getItem:(key:string,category='magicitems')=>entry<Open5eItem>('items',key,category)
};

function filterOptionRows(rows:CatalogRow[],config:CatalogManifest,type:string,edition:string,parentKey:string,scope:string) {
 return rows.filter(row=>row.type===type&&(edition==='all'||config.sourceLabels[row.sourceKey]?.edition.includes(edition))&&(!parentKey||row.parentKey===parentKey||row.parentKey===parentKey.replace('srd-2014_','srd_'))&&(scope==='all'||config.sourceLabels[row.sourceKey]?.status===scope)).sort((a,b)=>a.name.localeCompare(b.name)||a.key.localeCompare(b.key)).slice(0,60).map(row=>decorate(row,config));
}

function decorate(row:CatalogRow,config:CatalogManifest) {const label=config.sourceLabels[row.sourceKey];return {...row,sourceLabel:label?.name||row.sourceKey,status:label?.status,published:label?.published,edition:label?.edition};}
