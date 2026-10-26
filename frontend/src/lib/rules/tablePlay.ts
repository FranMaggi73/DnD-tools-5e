import type {CharacterOption,CharacterBuild} from './characterBuilder';
import {tableAtLevel} from './characterBuilder';
export type Recovery='short'|'long'|'manual';
export interface ResourcePool {id:string;name:string;current:number;max:number;recovery:Recovery}
export interface ActivityEntry {id:string;campaignId:string;actorId:string;actorName:string;message:string;visibility:'public'|'dm';createdAt:string}
export interface PublicCombatant {id:string;encounterId:string;name:string;initiative:number;characterId:string;type:string;conditions:string[];currentHp:number|null;maxHp:number|null;armorClass:number|null}
export interface CreatureSpec {name:string;initiative:number;initiativeBonus:number;maxHp:number;armorClass:number;monsterSlug:string;creatureSource:string;hidden:boolean;hideStats:boolean;notes:string}
const integer=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isInteger(v)&&v>=min&&v<=max;
export function resourcePools(raw:unknown):ResourcePool[] {
 let v:any=raw;if(typeof raw==='string'){try{v=JSON.parse(raw);}catch{return [];}}
 if(!Array.isArray(v))return [];
 const ids=new Set();return v.slice(0,40).filter(p=>p&&typeof p.id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(p.id)&&!ids.has(p.id)&&ids.add(p.id)&&typeof p.name==='string'&&p.name.trim().length>0&&p.name.length<=100&&integer(p.max,0,9999)&&integer(p.current,0,p.max)&&['short','long','manual'].includes(p.recovery)).map(p=>({id:p.id,name:p.name.trim(),max:p.max,current:p.current,recovery:p.recovery}));
}
export function encodePools(pools:ResourcePool[]) {const normalized=resourcePools(pools);if(normalized.length!==pools.length)throw Error('Revisá nombres, cantidades y recuperación de los recursos.');return JSON.stringify(normalized);}
export function recoverPools(pools:ResourcePool[],kind:'short'|'long') {return pools.map(p=>({...p,current:p.recovery===kind||(kind==='long'&&p.recovery==='short')?p.max:p.current}));}
export function resourceSuggestions(build:CharacterBuild,option:CharacterOption|null,level:number):Omit<ResourcePool,'id'>[] {
 const result:Omit<ResourcePool,'id'>[]=[];
 build.slots.forEach((max,i)=>{if(max)result.push({name:`Espacios nivel ${i+1}`,max,current:max,recovery:'long'});});
 if(build.pactSlots)result.push({name:`Pacto · nivel ${build.pactLevel}`,max:build.pactSlots,current:build.pactSlots,recovery:'short'});
 if(option)for(const cell of tableAtLevel(option,level)){if(!/^(Rages|Second Wind|Bardic Inspiration|Focus Points|Discipline Points|Sorcery Points|Channel Divinity|Wild Shape|Action Surge)$/i.test(cell.name))continue;const max=Number(cell.value);if(integer(max,1,9999))result.push({name:cell.name,max,current:max,recovery:'manual'});}
 return result;
}
export function creatureSpec(value:any):CreatureSpec {
 if(!value||typeof value.name!=='string'||!value.name.trim()||value.name.length>100||!integer(value.initiative,-100,100)||!integer(value.maxHp,1,9999)||!integer(value.armorClass,1,99))throw Error('La plantilla contiene una criatura inválida.');
 return {name:value.name.trim(),initiative:value.initiative,initiativeBonus:integer(value.initiativeBonus,-30,30)?value.initiativeBonus:0,maxHp:value.maxHp,armorClass:value.armorClass,monsterSlug:typeof value.monsterSlug==='string'?value.monsterSlug.slice(0,200):'',creatureSource:typeof value.creatureSource==='string'?value.creatureSource.slice(0,100):'',hidden:value.hidden===true,hideStats:value.hideStats===true,notes:typeof value.notes==='string'?value.notes.slice(0,4000):''};
}
export function templateCreatures(raw:unknown):CreatureSpec[] {let rows:any=raw;if(typeof raw==='string'){try{rows=JSON.parse(raw);}catch{throw Error('La plantilla no es válida.');}}if(!Array.isArray(rows)||!rows.length||rows.length>50)throw Error('La plantilla debe tener entre 1 y 50 criaturas.');return rows.map(creatureSpec);}
export function publicCombatant(f:any):PublicCombatant {const hiddenStats=f.hideStats===true;return {id:f.id,encounterId:f.encounterId,name:f.name,initiative:f.initiative,characterId:f.characterId||'',type:f.type,conditions:f.conditions||[],currentHp:hiddenStats?null:f.currentHp,maxHp:hiddenStats?null:f.maxHp,armorClass:hiddenStats?null:f.armorClass};}
