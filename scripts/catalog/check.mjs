import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,sep} from 'node:path';
import {createHash} from 'node:crypto';
const staticRoot=fileURLToPath(new URL('../../frontend/static/',import.meta.url));
const folder=resolve(staticRoot,'catalog');
const read=async path=>{
  const target=resolve(staticRoot,`.${path}`);
  if(!target.startsWith(folder+sep)) throw new Error(`Ruta fuera del catálogo: ${path}`);
  const body=await readFile(target,'utf8');
  const expected=/-([a-f0-9]{16})\.json$/.exec(path)?.[1];
  if(expected && createHash('sha256').update(body).digest('hex').slice(0,16)!==expected) throw new Error(`Hash de catálogo inválido: ${path}`);
  return JSON.parse(body);
};
export async function checkCatalog() {
  const manifest=await read('/catalog/manifest.json');
  if(manifest.schemaVersion!==1) throw new Error('Versión de catálogo no compatible');
  const counts={};
  const classKeys=new Set();
  for(const kind of ['monsters','items','options','spells']) {
    const index=await read(manifest[kind].index);
    if(index.rows.length!==manifest[kind].count || new Set(index.rows.map(v=>v.key)).size!==index.rows.length) throw new Error(`Índice incompleto: ${kind}`);
    const keys=new Set(index.rows.map(v=>v.key));
    for(const [alias,key] of Object.entries(index.aliases)) if(!keys.has(key)) throw new Error(`Alias roto: ${alias}`);
    const packs=await Promise.all(index.packs.map(read));
    if(kind==='options')for(const row of index.rows)if(['class','subclass'].includes(row.type))classKeys.add(row.key);
    for(const row of index.rows) {
      if(!manifest.sourceLabels[row.sourceKey]) throw new Error(`Fuente desconocida: ${row.key}`);
      const record=packs[row.pack]?.[row.key];
      if(!record || record.slug!==row.key || !record.name) throw new Error(`Ficha ausente: ${row.key}`);
      if(['monsters','options','spells'].includes(kind) && !/^[A-Za-z0-9_-]{1,200}$/.test(row.key)) throw new Error(`Identificador incompatible: ${row.key}`);
      if(kind==='spells'&&(record.classes||[]).some(key=>!classKeys.has(key)))throw new Error(`Clase de hechizo ausente: ${row.key}`);
    }
    if(kind==='options')for(const record of packs.flatMap(p=>Object.values(p))) {
      if(record.parentKey&&!keys.has(record.parentKey))throw new Error(`Padre de opción ausente: ${record.slug}`);
      for(const feature of record.features||[])if(new Set((feature.table||[]).map(c=>c.level)).size!==(feature.table||[]).length)throw new Error(`Tabla ambigua: ${record.slug} ${feature.name}`);
      if(record.contentMode&&record.features?.some(f=>f.desc))throw new Error(`Texto editorial inesperado: ${record.slug}`);
    }
    counts[kind]=keys.size;
  }
  if(!classKeys.has('ref-efa_class-artificer')||!classKeys.has('ref-tce_class-artificer'))throw new Error('Faltan las revisiones esperadas de Artificer');
  if(manifest.audit?.conflicts?.length)throw new Error('Catálogo con discrepancias pendientes');
  const credits=await read(manifest.sources);
  if(!credits.licenses.length || !credits.sources.length || !credits.srd2024Attribution.includes('Creative Commons')) throw new Error('Faltan atribuciones');
  const notice=resolve(staticRoot,`.${manifest.notice}`);
  if(!notice.startsWith(folder+sep) || !(await readFile(notice,'utf8')).includes('COPYRIGHT')) throw new Error('Faltan avisos de copyright');
  return counts;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const counts=await checkCatalog(); console.log(`Catálogo: ${counts.monsters} monstruos y ${counts.items} objetos; archivos, fuentes y aliases OK.`);
}
