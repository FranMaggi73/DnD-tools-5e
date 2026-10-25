import type { AbilityKey, CharacterForm, CatalogSource } from '$lib/types';
export interface OptionFeature {name:string;desc:string;type:string;levels:number[];table:Array<{level:number;column_value:string}>}
export interface CatalogReference {provider:string;url:string;revision:string;sourcePath:string;page?:number}
export interface CharacterOption {contentMode?:string;references?:CatalogReference[];castingAbility?:AbilityKey|'none';training?:{armor:string[];weapons:string[];tools:string[];skills:any[]};mechanics?:Record<string,any>;slug:string;name:string;type:string;parentKey:string;desc:string;catalogSource:CatalogSource;features:OptionFeature[];hitDie:number;saves:string[];casterType:string;prerequisite:string}
export interface CatalogSpell {contentMode?:string;references?:CatalogReference[];slug:string;name:string;type:string;desc:string;catalogSource:CatalogSource;level:number;school:string;classes:string[];castingTime:string;range:string;duration:string;components:string;concentration:boolean;ritual:boolean;higherLevel:string}
export interface BuildRef {key:string;name:string}
export interface LearnedSpell {key:string;name:string;level:number;prepared:boolean;desc:string}
export interface CharacterBuild {
  version:1;scope:'official'|'third-party'|'playtest'|'homebrew'|'all';edition:'2024'|'2014'|'all';species:BuildRef;variant:BuildRef;background:BuildRef;class:BuildRef;subclass:BuildRef;
  lineage:string;tools:string;weapons:string;armor:string;languages:string;choices:string;feats:BuildRef[];
  customFeatures:Array<{name:string;desc:string}>;spells:LearnedSpell[];castingAbility:AbilityKey|'none';
  slots:number[];pactSlots:number;pactLevel:number;hitDie:number;
}
const txt=(v:unknown,max=2000)=>typeof v==='string'?v.slice(0,max):'';
const ref=(v:any):BuildRef=>({key:txt(v?.key,200),name:txt(v?.name,100)});
const num=(v:unknown,min:number,max:number,fallback=0)=>typeof v==='number'&&Number.isInteger(v)&&v>=min&&v<=max?v:fallback;
export const abilities:AbilityKey[]=['strength','dexterity','constitution','intelligence','wisdom','charisma'];
export function normalizeBuild(input?:unknown):CharacterBuild {
 let v:any=input;
 if(typeof v==='string') {try {v=JSON.parse(v);}catch{v={};}}
 if(!v||typeof v!=='object'||Array.isArray(v))v={};
 return {version:1,scope:['official','third-party','playtest','homebrew','all'].includes(v.scope)?v.scope:'official',edition:['2024','2014','all'].includes(v.edition)?v.edition:'2024',species:ref(v.species),variant:ref(v.variant),background:ref(v.background),class:ref(v.class),subclass:ref(v.subclass),
  lineage:txt(v.lineage,200),tools:txt(v.tools),weapons:txt(v.weapons),armor:txt(v.armor),languages:txt(v.languages),choices:txt(v.choices,10000),
  feats:(Array.isArray(v.feats)?v.feats:[]).slice(0,30).map(ref),customFeatures:(Array.isArray(v.customFeatures)?v.customFeatures:[]).slice(0,30).map((x:any)=>({name:txt(x?.name,100),desc:txt(x?.desc,4000)})),
  spells:(Array.isArray(v.spells)?v.spells:[]).slice(0,200).map((x:any)=>({key:txt(x?.key,200),name:txt(x?.name,100),level:num(x?.level,0,9),prepared:x?.prepared===true,desc:txt(x?.desc,4000)})),
  castingAbility:abilities.includes(v.castingAbility)?v.castingAbility:'none',slots:Array.from({length:9},(_,i)=>num(v.slots?.[i],0,20)),pactSlots:num(v.pactSlots,0,20),pactLevel:num(v.pactLevel,0,9),hitDie:[6,8,10,12].includes(v.hitDie)?v.hitDie:8};
}
// Builder content is bounded, untrusted user text. It never grants permissions or replaces validated combat fields.
export function encodeBuild(input:unknown) {
 const raw=input as Partial<CharacterBuild>;
 if(raw?.slots?.some(v=>!Number.isInteger(v)||v<0||v>20)||raw?.spells?.some(v=>!Number.isInteger(v.level)||v.level<0||v.level>9))throw new Error('Revisá los niveles de hechizos y los espacios de conjuro.');
 const value=JSON.stringify(normalizeBuild(input));if(value.length>150000)throw new Error('La ficha ampliada supera el tamaño permitido.');return value;}
export function featuresAtLevel(option:CharacterOption,level:number) {return option.features.filter(f=>!f.table?.length&&(!f.levels?.length||f.levels.some(n=>n<=level)));}
export function tableAtLevel(option:CharacterOption,level:number) {return option.features.flatMap(f=>{const cell=f.table?.find(v=>v.level===level);return cell?[{name:f.name,value:cell.column_value}]:[];});}
export function averageHp(die:number,level:number,constitution:number,extraPerLevel=0) {const mod=Math.floor((constitution-10)/2);return Math.max(1,die+mod)+Math.max(0,level-1)*Math.max(1,die/2+1+mod)+level*extraPerLevel;}
export function pointCost(scores:number[]) {const costs:Record<number,number>={8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};return scores.every(v=>v in costs)?scores.reduce((sum,v)=>sum+costs[v],0):null;}
export function classSkillChoice(option:CharacterOption) {
 if(option.training?.skills?.length){const choice=option.training.skills.find(v=>v.choose)?.choose;return {count:choice?.count||0,text:choice?`Elegí ${choice.count}: ${(choice.from||[]).join(', ')}`:JSON.stringify(option.training.skills)};}
 const text=option.features.map(v=>v.desc).join('\n');const row=/\|Skill Proficiencies\|([^\n]+)/i.exec(text)?.[1]||'';
 return {count:Number(/Choose\s+(\d+)/i.exec(row)?.[1]||0),text:row.replace(/\|/g,'')};
}
export function applyClass(form:CharacterForm,option:CharacterOption) {
 const build=normalizeBuild(form.build);build.class={key:option.slug,name:option.name};build.subclass={key:'',name:''};build.hitDie=option.hitDie||build.hitDie;
 form.class=option.name;if(option.saves.length)form.savingThrows={strength:option.saves.includes('strength'),dexterity:option.saves.includes('dexterity'),constitution:option.saves.includes('constitution'),intelligence:option.saves.includes('intelligence'),wisdom:option.saves.includes('wisdom'),charisma:option.saves.includes('charisma')};
 for(const [field,heading] of [['weapons','Weapon Proficiencies'],['armor','Armor Training'],['tools','Tool Proficiencies']] as const) {
 const row=option.features.map(v=>v.desc).join('\n').split('\n').find(v=>v.includes(`|${heading}|`));if(row)build[field]=row.split('|')[2]||'';
 }
 if(option.training){build.weapons=option.training.weapons.join(', ');build.armor=option.training.armor.join(', ');build.tools=option.training.tools.join('; ');}
 const name=option.name.toLowerCase();build.castingAbility=option.castingAbility||(['wizard','artificer','artificiero'].includes(name)?'intelligence':['cleric','druid','ranger'].includes(name)?'wisdom':['bard','paladin','sorcerer','warlock'].includes(name)?'charisma':'none');
 form.build=build;
}
