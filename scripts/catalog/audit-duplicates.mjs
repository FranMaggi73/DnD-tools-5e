import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../../',import.meta.url));
const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const ignored=new Set(['slug','open5eSlug','catalogSource','references','source','document__slug','document__title']);
function content(value) {
 if(Array.isArray(value))return value.map(content);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).filter(key=>!ignored.has(key)).sort().map(key=>[key,content(value[key])]));
 return value;
}
const hash=value=>createHash('sha256').update(JSON.stringify(content(value))).digest('hex');
function grouped(rows,key) {const groups=new Map();for(const row of rows){const id=key(row);if(!groups.has(id))groups.set(id,[]);groups.get(id).push(row);}return [...groups.values()].filter(group=>group.length>1);}
export async function auditDuplicates(staticRoot=join(root,'frontend/static')) {
 const manifest=JSON.parse(await readFile(join(staticRoot,'catalog/manifest.json'),'utf8'));
 const datasets={};
 for(const kind of ['monsters','items','options','spells']){
  const index=JSON.parse(await readFile(join(staticRoot,manifest[kind].index),'utf8'));
  datasets[kind]=[];
  for(const path of index.packs)datasets[kind].push(...Object.values(JSON.parse(await readFile(join(staticRoot,path),'utf8'))));
 }
 const all=[...Object.values(datasets)].flat();const byKey=new Map(all.map(row=>[row.slug,row]));
 const summary={version:manifest.version,totalRecords:all.length,datasets:{},repeatedIds:[],samePublication:[],sameEditionAcrossPublications:[],acrossEditions:[]};
 const describe=row=>({key:row.slug,name:row.name,source:row.catalogSource.key,publication:manifest.sourceLabels[row.catalogSource.key]?.name||row.catalogSource.name,edition:row.catalogSource.edition,parent:row.parentKey||'',mode:row.contentMode||'open-text'});
 for(const [kind,records] of Object.entries(datasets)) {
  const category=row=>row.catalogData?.type||row.type||kind;
  const parent=row=>row.parentKey?fold(byKey.get(row.parentKey)?.name||row.parentKey):'';
  const sameName=row=>[category(row),fold(row.name),parent(row)].join('|');
  const ids=grouped(records,row=>row.slug);summary.repeatedIds.push(...ids.map(group=>({kind,entries:group.map(describe)})));
  const within=grouped(records,row=>[row.catalogSource.key,sameName(row)].join('|'));
  summary.samePublication.push(...within.map(group=>({kind,identical:group.every(row=>hash(row)===hash(group[0])),entries:group.map(describe)})));
  const sameEdition=grouped(records,row=>[row.catalogSource.edition,sameName(row)].join('|')).filter(group=>new Set(group.map(row=>row.catalogSource.key)).size>1);
  for(const group of sameEdition){const fingerprints=grouped(group,hash);summary.sameEditionAcrossPublications.push({kind,name:group[0].name,identicalContentGroups:fingerprints.map(entries=>entries.map(v=>v.slug)),entries:group.map(describe)});}
  const editions=grouped(records,sameName).filter(group=>new Set(group.map(row=>row.catalogSource.edition)).size>1);
  summary.acrossEditions.push(...editions.map(group=>({kind,name:group[0].name,entries:group.map(describe)})));
  summary.datasets[kind]={records:records.length,repeatedIds:ids.length,samePublication:within.length,sameEditionAcrossPublications:sameEdition.length,acrossEditions:editions.length};
 }
 return summary;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 const audit=await auditDuplicates();const folder=join(root,'.tools');await mkdir(folder,{recursive:true});
 await writeFile(join(folder,'catalog-duplicates.json'),JSON.stringify(audit,null,2));
 const headings={monsters:'Monstruos',items:'Objetos',options:'Opciones de personaje',spells:'Hechizos'};
 const lines=['# Auditoría de duplicados del catálogo','',`Versión: ${audit.version}. Registros: ${audit.totalRecords}.`,'','El análisis no modifica el catálogo ni los datos de campañas. Un nombre compartido no prueba que dos reglas sean equivalentes.','',
 '| Categoría | Registros | IDs repetidos | Misma publicación y nombre | Nombre compartido en otras publicaciones de la misma edición | Nombre compartido entre ediciones |','|---|---:|---:|---:|---:|---:|'];
 for(const [kind,row] of Object.entries(audit.datasets))lines.push(`| ${headings[kind]} | ${row.records} | ${row.repeatedIds} | ${row.samePublication} | ${row.sameEditionAcrossPublications} | ${row.acrossEditions} |`);
 lines.push('','## Mismo contenido completo entre publicaciones','', 'La comparación ignora identificadores y procedencia, pero conserva los campos de reglas y descripciones. La igualdad puede indicar una reedición; no autoriza a perder la procedencia ni las licencias.','');
 const identical=audit.sameEditionAcrossPublications.filter(group=>group.identicalContentGroups.length);
 for(const group of identical){lines.push(`- **${group.name}** (${headings[group.kind]}):`);for(const ids of group.identicalContentGroups){lines.push(`  - ${ids.map(id=>{const row=group.entries.find(v=>v.key===id);return `${row.publication} — ${id}`;}).join('; ')}`);}}
 if(!identical.length)lines.push('No se encontraron contenidos completos idénticos dentro de los grupos comparados.');
 lines.push('','## Nombres compartidos por varias publicaciones','', 'Se conservan como variantes de fuente hasta una revisión de equivalencia. El informe JSON contiene todos los campos de identificación.','');
 for(const group of audit.sameEditionAcrossPublications)lines.push(`- **${group.name}** (${headings[group.kind]}): ${group.entries.map(v=>`${v.publication} [${v.edition}]`).join('; ')}`);
 lines.push('','## Nombres compartidos entre ediciones','', 'Se conservan por separado: pueden cambiar mecánicas, requisitos y progresiones.','');
 for(const group of audit.acrossEditions)lines.push(`- **${group.name}** (${headings[group.kind]}): ${[...new Set(group.entries.map(v=>v.edition))].join('; ')}`);
 await writeFile(join(folder,'catalog-duplicates.md'),lines.join('\n')+'\n');
 console.log(JSON.stringify({total:audit.totalRecords,datasets:audit.datasets,identicalContentGroups:identical.reduce((sum,v)=>sum+v.identicalContentGroups.length,0)},null,2));
}
