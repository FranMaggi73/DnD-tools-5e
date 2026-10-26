import {beforeEach,afterEach,expect,test,vi} from 'vitest';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {checkCatalog} from '../scripts/catalog/check.mjs';
import {normalizeMonster,normalizeItem} from '../scripts/catalog/normalize.mjs';
import {plainText} from '../frontend/src/lib/utils/plainText';

const files=resolve('frontend/static');
const requested:string[]=[];
beforeEach(()=>{
  vi.resetModules();requested.length=0;
  vi.stubGlobal('fetch',vi.fn(async(path:string)=>{
    requested.push(path);
    if(!path.startsWith('/catalog/')||path.includes('..')) throw new Error('External network is disabled in this test');
    return new Response(await readFile(resolve(files,`.${path}`),'utf8'),{status:200,headers:{'Content-Type':'application/json'}});
  }));
});
afterEach(()=>vi.unstubAllGlobals());

test('every generated entry, legacy alias, source and license resolves within the hosted catalog',async()=>{
  const counts=await checkCatalog();
  expect(counts.monsters).toBeGreaterThan(3000);expect(counts.items).toBeGreaterThan(3000);
});
test('legacy monster identifiers resolve locally and returned sheets cannot mutate the shared cache',async()=>{
  const {catalogApi}=await import('../frontend/src/lib/api/catalog');
  const results=await catalogApi.searchMonsters('goblin');
  expect(results.results.length).toBeGreaterThan(0);
  const first=await catalogApi.getMonster('goblin');
  expect(first.document__slug).toBe('srd-2014');expect(first.actions?.length).toBeGreaterThan(0);
  first.strength=999;
  expect((await catalogApi.getMonster('goblin')).strength).not.toBe(999);
  expect(requested.filter(path=>path.includes('monsters-index'))).toHaveLength(1);
  expect(requested.filter(path=>/monsters-\d+-/.test(path))).toHaveLength(1);
  expect(requested.every(path=>path.startsWith('/catalog/'))).toBe(true);
});
test('item searches filter independently by type and preserve old weapons and their versatile damage',async()=>{
  const {catalogApi}=await import('../frontend/src/lib/api/catalog');
  const weapons=await catalogApi.searchItems('longsword','weapon');
  const armor=await catalogApi.searchItems('longsword','armor');
  expect(weapons.results.length).toBeGreaterThan(0);expect(weapons.results.every(v=>v.type==='weapon')).toBe(true);
  expect(armor.results).toHaveLength(0);
  const sword=await catalogApi.getItem('longsword','weapons');
  expect(sword.catalogData?.weaponData).toMatchObject({damageDice:'1d8',properties:{versatile:'1d10'}});
  expect(sword.catalogSource?.licenses.length).toBeGreaterThan(0);
});
test('catalog preserves fixed damage, generic attunement and 2024 weapon mastery descriptions',async()=>{
  const {catalogApi}=await import('../frontend/src/lib/api/catalog');
  const blowgun=await catalogApi.getItem('blowgun','weapons');
  expect(blowgun.catalogData?.weaponData?.damageDice).toBe('1');
  const net=await catalogApi.getItem('net','weapons');
  expect(net.catalogData?.weaponData?.damageDice).toBe('0');
  const ring=(await catalogApi.searchItems('ring of protection')).results[0];
  expect((await catalogApi.getItem(ring.slug)).catalogData).toMatchObject({isMagical:true,requiresAttunement:true});
  const battleaxe=await catalogApi.getItem('srd-2024_battleaxe','weapons');
  expect(battleaxe.desc).toContain('Topple');expect(battleaxe.catalogData?.weaponData?.properties.versatile).toBe('1d10');
});
test('failed index requests can be retried without using the upstream API',async()=>{
  const mocked=vi.mocked(fetch);mocked.mockRejectedValueOnce(new Error('offline'));
  const {catalogApi}=await import('../frontend/src/lib/api/catalog');
  await expect(catalogApi.searchMonsters('goblin')).rejects.toThrow('offline');
  expect((await catalogApi.searchMonsters('goblin')).results.length).toBeGreaterThan(0);
});
test('monster normalization preserves limited-use and legendary-action information',()=>{
  const source={key:'sample',name:'Sample',licenses:[{key:'cc-by-40'}],gamesystem:{name:'5e'}};
  const raw={key:'sample_monster',name:'Sample Monster',size:{name:'Medium'},type:{name:'Beast'},hit_points:10,armor_class:12,
    ability_scores:{strength:10,dexterity:10,constitution:10,intelligence:10,wisdom:10,charisma:10},
    actions:[{name:'Special action',desc:'Test effect.',action_type:'LEGENDARY_ACTION',legendary_action_cost:2,usage_limits:{type:'PER_DAY',param:1}}]};
  const result=normalizeMonster(raw,source);
  expect(result.legendary_actions[0].desc).toContain('2 acciones legendarias');expect(result.legendary_actions[0].desc).toContain('1/día');
});
test('generic catalog objects retain attunement restrictions without needing armor or weapon data',()=>{
  const source={key:'sample',name:'Sample',licenses:[{key:'cc-by-40'}],gamesystem:{name:'5e'}};
  const result=normalizeItem({key:'sample_ring',name:'Test ring',desc:'Test effect.',category:{key:'ring'},requires_attunement:true,attunement_detail:'by a wizard'},source,new Map(),new Map(),true);
  expect(result.catalogData).toMatchObject({type:'other',isMagical:true,requiresAttunement:true});expect(result.desc).toContain('by a wizard');
});
test('catalog excerpts are converted to plain text without creating DOM elements or loading images',()=>{
  expect(plainText('<img src="https://example.test/image">A &amp; B &#65;')).toBe('A & B A');
});

test('library weapon subfilters apply before limiting results and use indexed facts without loading sheets',async()=>{
 const {catalogApi}=await import('../frontend/src/lib/api/catalog');
 const rows=await catalogApi.librarySearch({kind:'items',query:'',edition:'2024',scope:'official',source:'srd-2024',type:'weapon',filters:{weaponType:'martial',hands:'versatile',damageType:'slashing',magic:'no'}});
 expect(rows.some(row=>row.key==='srd-2024_longsword')).toBe(true);
 expect(rows.every(row=>row.hands==='versatile'&&row.damageType==='slashing'&&row.magical===false)).toBe(true);
 const bows=await catalogApi.librarySearch({kind:'items',query:'',edition:'2024',scope:'official',source:'srd-2024',type:'weapon',filters:{property:'ammunition',hands:'two'}});
 expect(bows.some(row=>row.key==='srd-2024_shortbow')).toBe(true);
 expect(requested.some(path=>/items-\d+-/.test(path))).toBe(false);
});

test('library armor filters separate shields from heavy armor and combine magic, rarity and stealth',async()=>{
 const {catalogApi}=await import('../frontend/src/lib/api/catalog');
 const base={kind:'items' as const,query:'',edition:'2024',scope:'official',source:'srd-2024',type:'armor'};
 const shields=await catalogApi.librarySearch({...base,filters:{armorType:'shield',magic:'no'}});
 expect(shields.some(row=>row.key==='srd-2024_shield')).toBe(true);
 const heavy=await catalogApi.librarySearch({...base,filters:{armorType:'heavy',stealth:'yes',magic:'no',rarity:'common'}});
 expect(heavy.length).toBeGreaterThan(0);expect(heavy.some(row=>row.key==='srd-2024_shield')).toBe(false);
});

test('spell library combines class, level, school, concentration and ritual across source class keys',async()=>{
 const {catalogApi}=await import('../frontend/src/lib/api/catalog');
 const filters={spellLevel:'1',spellClass:'Wizard',school:'Divination',concentration:'yes',ritual:'yes'};
 const rows=await catalogApi.librarySearch({kind:'spells',query:'',edition:'2024',scope:'official',source:'srd-2024',type:'',filters});
 expect(rows.some(row=>row.key==='srd-2024_detect-magic')).toBe(true);
 expect(rows.every(row=>row.level===1&&row.school==='Divination'&&row.ritual===true&&row.concentration===true)).toBe(true);
 const facets=await catalogApi.libraryFacets('spells');expect(facets.classes).toContain('Wizard');expect(facets.classes).toContain('Artificer');
 expect(requested.some(path=>/spells-\d+-/.test(path))).toBe(false);
});

test('inventory lookup accepts an empty name, applies subfilters and preserves the full item reference',async()=>{
 const {catalogApi}=await import('../frontend/src/lib/api/catalog');
 const result=await catalogApi.searchInventoryItems({query:'',type:'weapon',edition:'2024',scope:'official',source:'srd-2024',filters:{hands:'versatile',damageType:'slashing',magic:'no'}});
 const sword=result.results.find(item=>item.slug==='srd-2024_longsword');expect(sword).toBeDefined();
 expect(sword?.source).toBe('weapons');expect(sword?.catalogSource?.key).toBe('srd-2024');
 const full=await catalogApi.getItem(sword!.slug,sword!.source);
 expect(full.catalogData?.weaponData).toMatchObject({damageDice:'1d8',properties:{versatile:'1d10'}});
 const shields=await catalogApi.searchInventoryItems({query:'',type:'armor',edition:'2024',scope:'official',source:'srd-2024',filters:{armorType:'shield',magic:'no'}});
 expect(shields.results.some(item=>item.slug==='srd-2024_shield')).toBe(true);
});
