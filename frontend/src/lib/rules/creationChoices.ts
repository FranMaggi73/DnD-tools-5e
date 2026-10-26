import type {CharacterForm} from '$lib/types';import {normalizeBuild,featuresAtLevel,tableAtLevel,classSkillChoice,type CharacterOption} from './characterBuilder';
export interface CreationTask {id:string;label:string;detail:string;done:boolean;manual:boolean}
const idFor=(text:string)=>{let value=2166136261;for(let i=0;i<text.length;i++)value=Math.imul(value^text.charCodeAt(i),16777619);return `choice_${(value>>>0).toString(36)}`;};
export function creationTasks(form:CharacterForm,options:CharacterOption[]):CreationTask[] {
 const build=normalizeBuild(form.build);const tasks:CreationTask[]=[];
 function task(id:string,label:string,detail:string,done:boolean,manual=false){tasks.push({id,label,detail,done:manual?build.choiceChecks.includes(id):done,manual});}
 task('class','Clase','Elegí una opción del catálogo o indicá una clase personalizada.',!!form.class.trim());
 task('species','Especie / raza','Elegí una especie o completá el nombre personalizado.',!!build.species.name.trim());
 task('background','Trasfondo','Elegí un trasfondo o completá el nombre personalizado.',!!build.background.name.trim());
 const option=options.find(v=>v.slug===build.class.key);const className=(option?.name||form.class).toLowerCase();
 const oldLevel:Record<string,number>={artificer:3,barbarian:3,bard:3,cleric:1,druid:2,fighter:3,monk:3,paladin:3,ranger:3,rogue:3,sorcerer:1,warlock:1,wizard:2};
 const subclassLevel=build.edition==='2024'?3:oldLevel[className];
 if(subclassLevel&&form.level>=subclassLevel)task(`subclass:${build.class.key||className}`,'Subclase',`Se elige desde nivel ${subclassLevel}; comprobá la revisión de la clase.`,!!build.subclass.name.trim());
 if(option){const skills=classSkillChoice(option);if(skills.count)task(idFor(`${option.slug}:skills`),`Elegir ${skills.count} habilidades de clase`,`${skills.text}. Hay ${form.skills.filter(s=>s.proficient).length} habilidades competentes en total, contando todos los orígenes.`,false,true);
  const table=tableAtLevel(option,form.level);const cantrips=Number(table.find(v=>/^Cantrips( Known)?$/.test(v.name))?.value);const limit=Number(table.find(v=>v.name==='Prepared Spells')?.value);const prepared=build.spells.filter(s=>s.level>0&&s.prepared).length;
  if(cantrips>0)task('cantrips',`Trucos (${build.spells.filter(s=>s.level===0).length}/${cantrips})`,'Revisá por separado los trucos concedidos por especie, trasfondo o dotes.',build.spells.filter(s=>s.level===0).length>=cantrips);
  if(limit>0)task('prepared',`Hechizos preparados (${prepared}/${limit})`,'La tabla indica el máximo/base de clase; los rasgos pueden conceder excepciones.',prepared>=limit);
 }
 for(const source of options){for(const feature of featuresAtLevel(source,form.level)){
  if(feature.table.length||!(/choose|choice|select|eleg[ií]/i.test(feature.desc)||/Weapon Mastery|Ability Score Improvement|Fighting Style|Eldritch Invocation|Replicate Magic Item|Draconic Ancestry|Elven Lineage|Gnomish Lineage|Fiendish Legacy/.test(feature.name)))continue;
  if(/Subclass|Specialist/.test(feature.name))continue;
  const levels=feature.levels.length?feature.levels.filter(n=>n<=form.level):[0];for(const level of levels)task(idFor(`${source.slug}:${feature.name}:${level}`),`${feature.name}${level?` · nivel ${level}`:''}`,`${source.name}: revisá la elección y registrá su resultado en la ficha, Rasgos, Hechizos o Inventario.`,false,true);
 }}
 if(build.background.name)task(idFor(`${build.background.key||build.background.name}:background-choice`),'Beneficios del trasfondo','Revisá competencias, dote, equipo y, en 2024, aumentos de características.',false,true);
 return tasks;
}
