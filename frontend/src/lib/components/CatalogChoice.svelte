<script lang="ts">
 import {createEventDispatcher,onDestroy} from 'svelte';
 import {catalogApi} from '$lib/api/catalog';
 import type {BuildRef} from '$lib/rules/characterBuilder';
 export let label=''; export let type='class';export let edition='2024';export let scope='official';export let parentKey='';export let value:BuildRef={key:'',name:''};
 function statusLabel(value=''){return ({official:'Oficial',playtest:'Pruebas',homebrew:'Homebrew','third-party':'Terceros'} as Record<string,string>)[value]||'Sin clasificar';}
 const dispatch=createEventDispatcher();let query='';let rows:Array<{key:string;name:string;sourceKey:string;sourceLabel?:string;edition?:string;status?:string;contentMode?:string;published?:string}>=[];let error='';let loading=false;let open=false;let generation=0;let timer:ReturnType<typeof setTimeout>;
 $: schedule(query,type,edition,parentKey,scope,open);
 function schedule(q:string,t:string,e:string,p:string,s:string,visible:boolean){clearTimeout(timer);const id=++generation;if(!visible)return;timer=setTimeout(async()=>{loading=true;error='';try{const results=await catalogApi.searchOptions(q,t,e,p,s);if(id===generation)rows=results;}catch{if(id===generation)error='No se pudo cargar. Volvé a abrir el buscador para reintentar.';}finally{if(id===generation)loading=false;}},150);}
 async function choose(key:string){loading=true;error='';try{const option=await catalogApi.getOption(key);value={key:option.slug,name:option.name};open=false;query='';dispatch('choose',option);}catch{error='No se pudo cargar la opción completa. Reintentá.';}finally{loading=false;}}
 onDestroy(()=>{clearTimeout(timer);generation++;});
</script>
<div class="space-y-2 border border-primary/30 rounded-lg p-2">
 <div class="flex gap-2 items-center"><span class="font-medieval font-bold flex-1">{label}</span><button type="button" class="btn btn-xs" on:click={()=>open=!open}>{open?'Cerrar':'Buscar'}</button><button type="button" class="btn btn-xs btn-outline text-neutral" on:click={()=>{value={key:'',name:''};open=false;dispatch('custom');}}>Custom</button></div>
 {#if value.key}<p class="text-sm font-semibold">{value.name}</p><button type="button" class="link text-xs" on:click={()=>{value={key:'',name:''};dispatch('clear');}}>Quitar selección</button>
 {:else}<input aria-label={`${label} personalizada`} class="input input-bordered input-sm w-full" bind:value={value.name} maxlength={type==='class'?50:100} placeholder="Nombre personalizado u opcional"/>{/if}
 {#if open}
  <input aria-label={`Buscar ${label}`} class="input input-bordered input-sm w-full" bind:value={query} placeholder="Buscar por nombre…"/>
  {#if loading}<p class="text-xs" role="status">Cargando…</p>{/if}
  {#if !loading&&!rows.length&&!error}<p class="text-xs">No hay opciones para esta edición y selección. Podés usar Custom.</p>{/if}
  <div class="max-h-56 overflow-y-auto space-y-1">{#each rows as row}<button type="button" disabled={loading} class="w-full text-left border border-primary/20 rounded p-2 hover:bg-primary/10" on:click={()=>choose(row.key)}><span class="block text-sm font-bold">{row.name}</span><span class="text-xs opacity-70">{row.sourceLabel||row.sourceKey} · {row.edition}{row.published?` · ${row.published.slice(0,4)}`:''}<br/>{statusLabel(row.status)} · {row.contentMode==='open-text'?'Texto abierto':row.contentMode==='reference'?'Referencia':'Datos mecánicos'}</span></button>{/each}</div>
 {/if}
 {#if error}<p role="alert" class="text-error text-xs">{error}</p>{/if}
</div>
