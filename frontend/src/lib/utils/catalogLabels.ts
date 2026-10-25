import type {CharacterOption} from '$lib/rules/characterBuilder';
export const statusLabel=(value='')=>({official:'Oficial',playtest:'Pruebas',homebrew:'Homebrew','third-party':'Terceros'} as Record<string,string>)[value]||'Sin clasificar';
const ability:Record<string,string>={str:'Fuerza',dex:'Destreza',con:'Constitución',int:'Inteligencia',wis:'Sabiduría',cha:'Carisma'};
export const abilityKey:Record<string,string>={str:'strength',dex:'dexterity',con:'constitution',int:'intelligence',wis:'wisdom',cha:'charisma'};
export function fixedChoices(values:any[]=[]):string[] {
 // Only a single alternative grants fixed training. Multiple alternatives require a user choice.
 return values.length===1?Object.entries(values[0]||{}).filter(([,v])=>v===true).map(([key])=>key):[];
}
function choices(values:any[]=[]) {return values.map(value=>Object.entries(value||{}).filter(([key])=>key!=='hidden').map(([key,v]:[string,any])=>{
 if(key==='choose'){const from=v.from||v.weighted?.from||[];const amount=v.weighted?.weights?.join('/')||v.amount||v.count||1;return `Elegir ${amount}: ${from.map((n:string)=>ability[n]||n).join(', ')}`;}
 return v===true?key:typeof v==='number'?`${ability[key]||key} ${v>0?'+':''}${v}`:'';
 }).filter(Boolean).join('; ')).filter(Boolean).join(' o ');}
export function mechanicalLines(option:CharacterOption):string[] {
 const m=option.mechanics;if(!m)return [];
 const lines:string[]=[];
 if(m.speed)lines.push(`Velocidad: ${typeof m.speed==='number'?m.speed: m.speed.walk||'según modo'} pies`);
 if(m.size?.length)lines.push(`Tamaño: ${m.size.map((v:string)=>({S:'Pequeño',M:'Mediano',L:'Grande'} as Record<string,string>)[v]||v).join(' / ')}`);
 for(const [key,label] of [['ability','Características'],['skills','Habilidades'],['tools','Herramientas'],['languages','Idiomas'],['feats','Dotes']] as const)if(m[key]?.length){const text=choices(m[key]);if(text)lines.push(`${label}: ${text}`);}
 for(const requirement of m.prerequisite||[]){if(requirement.level)lines.push(`Requisito: nivel ${typeof requirement.level==='number'?requirement.level:requirement.level.level}`);if(requirement.ability)lines.push(`Requisito: ${choices(requirement.ability)}`);if(requirement.spellcasting||requirement.spellcasting2020)lines.push('Requisito: lanzamiento de conjuros');}
 return lines;
}
