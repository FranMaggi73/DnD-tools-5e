<script lang="ts">
 import {onDestroy} from 'svelte';import {collection,query,where,onSnapshot,doc,deleteDoc} from 'firebase/firestore';import {db} from '$lib/firebase';import {fromDoc} from '$lib/api/firestore';import {api} from '$lib/api/api';import type {Combatant,Encounter} from '$lib/types';
 export let campaignId:string;export let encounter:Encounter|null=null;export let combatants:Combatant[]=[];let rows:any[]=[];let name='';let roll=false;let error='';let busy=false;let unsubscribe:()=>void;let current='';
 $: if(campaignId!==current){current=campaignId;unsubscribe?.();unsubscribe=onSnapshot(query(collection(db,'encounter_templates'),where('campaignId','==',campaignId)),snapshot=>rows=snapshot.docs.map(d=>fromDoc<any>(d)).sort((a,b)=>a.name.localeCompare(b.name)),cause=>error=cause.message);}
 async function save(){if(busy)return;busy=true;error='';try{await api.saveEncounterTemplate(campaignId,name,combatants.filter(c=>c.type==='creature').map(c=>({...c,initiativeBonus:c.initiativeBonus||0})));name='';}catch(cause){error=cause instanceof Error?cause.message:'No se pudo guardar.';}finally{busy=false;}}
 async function start(id:string){if(busy)return;busy=true;error='';try{await api.startEncounterTemplate(id,roll);}catch(cause){error=cause instanceof Error?cause.message:'No se pudo iniciar.';}finally{busy=false;}}
 async function remove(id:string){if(!confirm('¿Eliminar esta plantilla?'))return;try{await deleteDoc(doc(db,'encounter_templates',id));}catch(cause){error=cause instanceof Error?cause.message:'No se pudo quitar.';}}
 onDestroy(()=>unsubscribe?.());
</script>
<details class="card-parchment p-3 text-neutral"><summary class="cursor-pointer font-medieval font-bold">Plantillas de encuentros ({rows.length})</summary><div class="space-y-2 mt-3">
 <p class="text-xs">Las plantillas guardan las criaturas y la preparación del DM, con su vida completa. Los personajes se agregan desde la campaña al iniciar.</p>
 {#if error}<p class="text-error text-sm" role="alert">{error}</p>{/if}
 {#if encounter}<label class="block text-sm">Guardar las criaturas del encuentro<input class="input input-bordered input-sm w-full" bind:value={name} minlength="3" maxlength="100" placeholder="Nombre de la plantilla"/></label><button class="btn btn-sm" disabled={busy||name.trim().length<3||!combatants.some(c=>c.type==='creature')} on:click={save}>Guardar plantilla</button>{/if}
 <label class="flex gap-2 items-center text-sm"><input class="checkbox checkbox-sm border-neutral/70 text-primary bg-white/30 shrink-0" type="checkbox" bind:checked={roll}/>Tirar iniciativas al iniciar</label>
 {#each rows as row}<div class="flex items-center gap-2 border-t border-primary/20 pt-2"><span class="text-sm flex-1">{row.name}</span><button class="btn btn-xs" disabled={busy||!!encounter} on:click={()=>start(row.id)}>Iniciar</button><button class="btn btn-xs btn-outline text-neutral" disabled={busy} aria-label={`Eliminar plantilla ${row.name}`} on:click={()=>remove(row.id)}>✕</button></div>{/each}{#if !rows.length}<p class="text-sm">Todavía no hay plantillas.</p>{/if}
</div></details>
<style>.input{color:#f7ecd8;background:#2d241c;}</style>
