import {test,expect,vi,afterEach} from 'vitest';import {readFile} from 'node:fs/promises';import {resolve} from 'node:path';
import {extractFacts,sourceStatus,mergeReferences} from '../scripts/catalog/reference.mjs';import {correctKnownTables} from '../scripts/catalog/corrections.mjs';
import {applyClass,normalizeBuild,tableAtLevel} from '../frontend/src/lib/rules/characterBuilder';import {createEmptyCharacterForm} from '../frontend/src/lib/types';import {fixedChoices} from '../frontend/src/lib/utils/catalogLabels';
afterEach(()=>vi.unstubAllGlobals());
async function catalog(){vi.stubGlobal('fetch',async(path:string)=>{if(!path.startsWith('/catalog/'))throw Error('External network disabled');return new Response(await readFile(resolve('frontend/static',`.${path}`),'utf8'));});return (await import('../frontend/src/lib/api/catalog')).catalogApi;}
test('reference extractor retains facts but discards descriptions, illustrations and reaction conditions',()=>{
 const prose='PROTECTED_EDITORIAL_TEXT';const facts=extractFacts({spell:[{name:'Sample',source:'XPHB',entries:[prose],desc:prose,fluff:{entries:[prose]},time:[{number:1,unit:'reaction',condition:prose}],components:{v:true,m:prose},level:1,school:'A'}]},'spell');
 expect(JSON.stringify(facts)).not.toContain(prose);expect(facts[0].components.m).toBe(true);expect(facts[0].time[0]).toEqual({number:1,unit:'reaction'});
 expect(sourceStatus('UA2025',{author:'Wizards RPG Team'})).toBe('playtest');expect(sourceStatus('AU',{author:'Wizards RPG Team'})).toBe('official');expect(sourceStatus('UNKNOWN',{})).toBe('unclassified');
});
test('Artificer 2014 and 2024 remain separate and Spanish search resolves both versions',async()=>{
 const api=await catalog();const modern=await api.searchOptions('artificiero','class','2024');const classic=await api.searchOptions('artificer','class','2014');
 expect(modern.map(v=>v.key)).toEqual(['ref-efa_class-artificer']);expect(classic.map(v=>v.key)).toEqual(['ref-tce_class-artificer']);
 const option=await api.getOption(modern[0].key);expect(option.catalogSource.status).toBe('official');expect(option.catalogSource.published).toBe('2025-12-09');expect(option.catalogSource.licenses).toEqual([]);expect(option.contentMode).toBe('mechanics');expect(option.desc).toBe('');expect(option.features.every(v=>v.desc==='')).toBe(true);
 const form=createEmptyCharacterForm();applyClass(form,option);expect(form.build?.hitDie).toBe(8);expect(form.build?.castingAbility).toBe('intelligence');expect(form.savingThrows.constitution&&form.savingThrows.intelligence).toBe(true);expect(form.build?.tools.toLowerCase()).toContain("tinker's tools");
 expect(tableAtLevel(option,5).find(v=>v.name==='1')?.value).toBe('4');expect(tableAtLevel(option,5).find(v=>v.name==='2')?.value).toBe('2');
});
test('subclasses bind to the actual parent revision and display their own book',async()=>{
 const api=await catalog();const modern=await api.searchOptions('','subclass','2024','ref-efa_class-artificer');
 expect(modern.filter(v=>v.sourceKey==='book-efa').map(v=>v.name).sort()).toEqual(['Alchemist','Armorer','Artillerist','Battle Smith','Cartographer']);expect(modern.every(v=>v.parentKey==='ref-efa_class-artificer'&&v.edition?.includes('2024'))).toBe(true);
 const classic=await api.searchOptions('','subclass','2014','ref-tce_class-artificer');expect(classic).toHaveLength(4);expect(classic.some(v=>v.name==='Cartographer')).toBe(false);
});
test('official is the default; A5E and other third-party classes require an explicit scope',async()=>{
 const api=await catalog();const official=await api.searchOptions('','class','all');expect(official.every(v=>v.status==='official')).toBe(true);expect(official.some(v=>v.name==='Marshal')).toBe(false);
 const thirdParty=await api.searchOptions('','class','all','','third-party');expect(thirdParty.some(v=>v.name==='Marshal')).toBe(true);expect(thirdParty.every(v=>v.status==='third-party')).toBe(true);expect(normalizeBuild().scope).toBe('official');
});
test('Artificer spell list uses the mapped class, not every Intelligence-based spell',async()=>{
 const api=await catalog();expect((await api.searchSpells('cure wounds','2024',1,'ref-efa_class-artificer')).length).toBeGreaterThan(0);expect(await api.searchSpells('fireball','2024',3,'ref-efa_class-artificer')).toHaveLength(0);
});
test('all five legacy full-caster tables have unique level 3 and 4 spell-slot values',async()=>{
 const api=await catalog();for(const name of ['bard','cleric','druid','sorcerer','wizard']){const option=await api.getOption(`srd_${name}`);const table=option.features.find(v=>v.type==='SPELL_SLOTS'&&v.name==='2nd')!.table;expect(table.filter(v=>v.level===3)).toEqual([{level:3,column_value:'2'}]);expect(table.filter(v=>v.level===4)).toEqual([{level:4,column_value:'3'}]);}
 const fighter=await api.getOption('srd-2024_fighter');const table=fighter.features.find(v=>v.name==='Weapon Mastery'&&v.table.length)!.table;expect(new Set(table.map(v=>v.level)).size).toBe(table.length);
});
test('known correction accepts an upstream fix, rejects new ambiguity and is idempotent',()=>{
 const options=[{slug:'srd_wizard',features:[{type:'SPELL_SLOTS',name:'2nd',table:[{level:4,column_value:'2'},{level:4,column_value:'3'}]}]}];expect(correctKnownTables(options)).toHaveLength(1);expect(correctKnownTables(options)).toHaveLength(0);
 options[0].features[0].table.push({level:4,column_value:'7'});expect(()=>correctKnownTables(options)).toThrow('cambió');
});
test('audit reports scalar disagreements instead of silently overwriting licensed data',()=>{
 const option={slug:'srd-2024_wizard',name:'Wizard',type:'class',catalogSource:{key:'srd-2024'},hitDie:8,features:[]};
 const facts={revision:'test',books:{XPHB:{name:'PHB',author:'Wizards RPG Team',published:'2024-09-17'}},records:[{kind:'class',source:'XPHB',name:'Wizard',hitDie:6,features:[]}],spellClasses:{}};
 const report=mergeReferences(facts,[option],[],new Map());expect(report.conflicts).toHaveLength(1);expect(option.hitDie).toBe(8);
});
test('fixed background training never grants both alternatives of a choice',()=>{
 expect(fixedChoices([{arcana:true},{history:true}])).toEqual([]);expect(fixedChoices([{arcana:true,choose:{from:['history','religion'],count:1}}])).toEqual(['arcana']);
});
