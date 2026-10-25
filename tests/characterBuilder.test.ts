import {expect,test,vi,afterEach} from 'vitest';
import {readFile} from 'node:fs/promises';import {resolve} from 'node:path';
import {normalizeBuild,encodeBuild,averageHp,pointCost,featuresAtLevel,applyClass} from '../frontend/src/lib/rules/characterBuilder';
import {createEmptyCharacterForm} from '../frontend/src/lib/types';
afterEach(()=>vi.unstubAllGlobals());
async function catalog(){vi.stubGlobal('fetch',async(path:string)=>{if(!path.startsWith('/catalog/'))throw new Error('External network disabled');return new Response(await readFile(resolve('frontend/static',`.${path}`),'utf8'));});return (await import('../frontend/src/lib/api/catalog')).catalogApi;}
test('builder normalizes missing, malformed and hostile saved text without crashing sheets',()=>{
 expect(normalizeBuild('{')).toEqual(normalizeBuild());expect(normalizeBuild(null).spells).toEqual([]);
 const value=normalizeBuild({species:{name:'A'.repeat(200)},slots:[-1,100,'4'],spells:[null,{level:40,prepared:'yes'}],customFeatures:[null]});
 expect(value.species.name).toHaveLength(100);expect(value.slots).toEqual(Array(9).fill(0));expect(value.spells[1].prepared).toBe(false);
 expect(encodeBuild(value)).toBe(JSON.stringify(normalizeBuild(value)));
});
test('builder rejects invalid user input and oversized text before Firestore writes',()=>{
 expect(()=>encodeBuild({...normalizeBuild(),slots:[-1]})).toThrow('espacios');
 expect(()=>encodeBuild({...normalizeBuild(),customFeatures:Array.from({length:30},()=>({name:'Rasgo',desc:'x'.repeat(4000)})),spells:Array.from({length:30},()=>({name:'Custom',key:'',level:1,prepared:false,desc:'x'.repeat(4000)}))})).toThrow('tamaño');
});
test('point buy and average HP implement actual creation costs and minimum per level',()=>{
 expect(pointCost([15,15,15,8,8,8])).toBe(27);expect(pointCost([16,8,8,8,8,8])).toBe(null);
 expect(averageHp(6,3,14)).toBe(20);expect(averageHp(6,3,1)).toBe(3);expect(averageHp(10,1,14)).toBe(12);
});
test('class selection sets canonical identity, real hit die, saves and casting ability without inventing skill choices',async()=>{
 const api=await catalog();const wizard=await api.getOption('srd-2024_wizard');const form=createEmptyCharacterForm();applyClass(form,wizard);
 expect(form.class).toBe('Wizard');expect(form.build?.hitDie).toBe(6);expect(form.savingThrows.intelligence).toBe(true);expect(form.savingThrows.wisdom).toBe(true);expect(form.savingThrows.strength).toBe(false);expect(form.build?.castingAbility).toBe('intelligence');expect(form.skills.some(s=>s.proficient)).toBe(false);
 expect(featuresAtLevel(wizard,1).some(f=>f.name==='Spell Mastery')).toBe(false);expect(featuresAtLevel(wizard,18).some(f=>f.name==='Spell Mastery')).toBe(true);
});
test('catalog filters subclass and subspecies by parent and preserves the full original traits',async()=>{
 const api=await catalog();const classes=await api.searchOptions('','class','2024');expect(classes).toHaveLength(13);
 const subclasses=await api.searchOptions('','subclass','2024','srd-2024_wizard');expect(subclasses.length).toBeGreaterThan(0);expect(subclasses.every(s=>s.parentKey==='srd-2024_wizard')).toBe(true);
 const species=await api.getOption('srd-2024_dragonborn');expect(species.features.some(f=>f.name==='Draconic Ancestry'&&f.desc.includes('Dragon'))).toBe(true);
 const bg=await api.getOption('srd-2024_acolyte');expect(bg.features.find(f=>f.type==='ability_score')?.desc).toContain('Wisdom');
});
test('spell filters use the class mapping and preserve components, scaling, ritual and concentration',async()=>{
 const api=await catalog();const spells=await api.searchSpells('','2024',0,'srd-2024_wizard');expect(spells.length).toBeGreaterThan(0);expect(spells.every(s=>s.level===0&&s.classes?.includes('srd-2024_wizard'))).toBe(true);
 const spell=await api.getSpell('srd-2024_detect-magic');expect(spell.ritual).toBe(true);expect(spell.concentration).toBe(true);expect(spell.components).toContain('V');expect(spell.desc.length).toBeGreaterThan(100);
});
