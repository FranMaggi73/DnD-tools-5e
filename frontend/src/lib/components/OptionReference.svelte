<script lang="ts">
 import {catalogApi} from '$lib/api/catalog';import {featuresAtLevel,tableAtLevel,type CharacterOption} from '$lib/rules/characterBuilder';
 import {mechanicalLines,statusLabel} from '$lib/utils/catalogLabels';
 const columnLabel=(name:string)=>/^[1-9](st|nd|rd|th)?$/.test(name)?`Espacios nivel ${parseInt(name)}`:name;
 export let optionKey='';export let level=1;let option:CharacterOption|null=null;let error='';let current='';
 $: if(optionKey!==current){current=optionKey;load(optionKey);}
 async function load(key:string){option=null;error='';if(!key)return;try{const result=await catalogApi.getOption(key);if(current===key)option=result;}catch{if(current===key)error='No se pudo cargar la referencia.';}}
</script>
{#if error}<p class="text-error text-sm">{error} <button type="button" class="link" on:click={()=>load(optionKey)}>Reintentar</button></p>{/if}
{#if option}
 <details class="border border-primary/30 rounded p-2">
  <summary class="cursor-pointer font-semibold">{option.name} · rasgos y reglas</summary>
  <a class="link text-xs" href={`/sources#${option.catalogSource.key}`} target="_blank" rel="noreferrer">{option.catalogSource.name} · {option.catalogSource.edition}</a>
  <p class="text-xs mt-1">{statusLabel(option.catalogSource.status)}{option.catalogSource.published?` · ${option.catalogSource.published}`:''} · {option.contentMode==='reference'?'Referencia':option.contentMode==='mechanics'?'Datos mecánicos':'Texto abierto'}</p>
  {#if option.contentMode}<p class="text-xs mt-2">Esta ficha incluye datos y referencias; las descripciones y elecciones completas se consultan en la publicación.</p>{/if}
  {#each option.references||[] as ref}<a class="link text-xs block mt-1" href={ref.url} target="_blank" rel="noreferrer">Consultar en {ref.provider}{ref.page?` · página ${ref.page}`:''}</a>{/each}
  {#each mechanicalLines(option) as line}<p class="text-sm mt-1">{line}</p>{/each}
  {#if option.desc}<p class="whitespace-pre-wrap break-words text-sm mt-2">{option.desc}</p>{/if}
  {#if option.prerequisite}<p class="text-sm mt-2">Requisitos: {option.prerequisite}</p>{/if}
  {#if tableAtLevel(option,level).length}<dl class="grid grid-cols-2 gap-1 text-xs my-2">{#each tableAtLevel(option,level) as cell}<dt>{columnLabel(cell.name)}</dt><dd class="font-bold">{cell.value}</dd>{/each}</dl>{/if}
  {#each featuresAtLevel(option,level) as feature}{#if feature.desc}<details class="my-2 border-t border-primary/20 pt-2"><summary class="cursor-pointer text-sm font-semibold">{feature.name}{feature.levels.length?` · nivel ${feature.levels.filter(n=>n<=level).join(', ')}`:''}</summary><p class="whitespace-pre-wrap break-words text-sm mt-2">{feature.desc}</p></details>{:else}<p class="text-sm border-t border-primary/20 mt-2 pt-2">{feature.name}{feature.levels.length?` · nivel ${feature.levels.join(', ')}`:''}</p>{/if}{/each}
 </details>
{/if}
