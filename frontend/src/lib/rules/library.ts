export type LibraryKind='monsters'|'items'|'options'|'spells';
export interface Favorite {kind:LibraryKind;key:string;name:string}
export interface LibraryFilters {
 weaponType?:string;damageType?:string;property?:string;hands?:string;armorType?:string;
 magic?:string;attunement?:string;rarity?:string;stealth?:string;
 spellLevel?:string;school?:string;spellClass?:string;concentration?:string;ritual?:string;castingTime?:string;
}
export interface LibrarySearch {kind:LibraryKind;query:string;edition:string;scope:string;source:string;type:string;filters?:LibraryFilters}
export interface LibraryPreferences {favorites:Favorite[];recent:LibrarySearch[]}
const kinds=['monsters','items','options','spells'];
export function libraryFilters(raw:unknown):LibraryFilters {
 if(!raw||typeof raw!=='object')return {};
 const result:LibraryFilters={};
 for(const key of ['weaponType','damageType','property','hands','armorType','magic','attunement','rarity','stealth','spellLevel','school','spellClass','concentration','ritual','castingTime'] as const){
  const value=(raw as LibraryFilters)[key];if(typeof value==='string'&&value.length>0&&value.length<=100)result[key]=value;
 }
 return result;
}
export function matchesLibraryFilters(row:any,filters:LibraryFilters={},classNames:Map<string,string>=new Map()):boolean {
 const bool=(value:unknown,filter?:string)=>!filter||typeof value==='boolean'&&value===(filter==='yes');
 if(!bool(row.magical,filters.magic)||!bool(row.attunement,filters.attunement)||!bool(row.stealthDisadvantage,filters.stealth)||!bool(row.concentration,filters.concentration)||!bool(row.ritual,filters.ritual))return false;
 for(const [filter,field] of [['weaponType','weaponType'],['damageType','damageType'],['hands','hands'],['armorType','armorType'],['rarity','rarity'],['school','school']] as const){if(filters[filter]&&String(row[field]||'').toLowerCase()!==filters[filter]!.toLowerCase())return false;}
 if(filters.property&&!row.weaponProperties?.includes(filters.property))return false;
 if(filters.spellLevel!==undefined&&row.level!==Number(filters.spellLevel))return false;
 if(filters.spellClass&&!row.classes?.some((key:string)=>classNames.get(key)?.toLowerCase()===filters.spellClass?.toLowerCase()))return false;
 if(filters.castingTime){
  const time=String(row.castingTime||'').toLowerCase();
  const category=/bonus/.test(time)?'bonus':/reaction/.test(time)?'reaction':/^(1 )?action$/.test(time)?'action':time?'long':'';
  if(category!==filters.castingTime)return false;
 }
 return true;
}
export function libraryPreferences(raw:unknown):LibraryPreferences {let v:any=raw;if(typeof raw==='string'){try{v=JSON.parse(raw);}catch{v={};}}if(!v||typeof v!=='object')v={};return {favorites:(Array.isArray(v.favorites)?v.favorites:[]).slice(0,200).filter((f:any)=>f&&kinds.includes(f.kind)&&typeof f.key==='string'&&f.key.length<=200&&typeof f.name==='string').map((f:any)=>({kind:f.kind,key:f.key,name:f.name.slice(0,100)})),recent:(Array.isArray(v.recent)?v.recent:[]).slice(0,12).filter((r:any)=>r&&kinds.includes(r.kind)&&typeof r.query==='string').map((r:any)=>({kind:r.kind,query:r.query.slice(0,100),edition:['all','2024','2014'].includes(r.edition)?r.edition:'2024',scope:['all','official','third-party','homebrew','playtest'].includes(r.scope)?r.scope:'official',source:typeof r.source==='string'?r.source.slice(0,100):'',type:typeof r.type==='string'?r.type.slice(0,50):'',filters:libraryFilters(r.filters)}))};}
