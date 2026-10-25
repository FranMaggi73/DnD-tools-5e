<script lang="ts">
 import type {CharacterForm} from '$lib/types';import {normalizeBuild,type BuildRef} from '$lib/rules/characterBuilder';import CatalogChoice from './CatalogChoice.svelte';import OptionReference from './OptionReference.svelte';
 export let form:CharacterForm;let feat:BuildRef={key:'',name:''};
 $: if(!form.build)form.build=normalizeBuild();
 function addFeat(){if(!form.build||!feat.name.trim()||form.build.feats.length>=30)return;if(feat.key&&form.build.feats.some(f=>f.key===feat.key))return;form.build.feats=[...form.build.feats,{...feat}];feat={key:'',name:''};}
</script>
{#if form.build}<div class="space-y-3">
 <h4 class="font-medieval text-lg font-bold">Rasgos, dotes y elecciones</h4>
 <p class="text-xs">Las referencias muestran las reglas de tu nivel. Registrá las opciones elegidas: linajes, invocaciones, maestrías, estilos de combate, talentos y equipo inicial. Los efectos que dependen de elecciones se ajustan en la ficha.</p>
 {#each [form.build.class,form.build.subclass,form.build.species,form.build.variant,form.build.background,...form.build.feats] as ref}{#if ref.key}<OptionReference optionKey={ref.key} level={form.level}/>{/if}{/each}
 <CatalogChoice label="Dote" type="feat" edition={form.build.edition} scope={form.build.scope} bind:value={feat}/><button type="button" class="btn btn-sm" disabled={!feat.name.trim()||form.build.feats.length>=30} on:click={addFeat}>Agregar dote</button>
 {#each form.build.feats as item,i}<div class="flex justify-between gap-2 text-sm"><span>{item.name}</span><button type="button" aria-label={`Quitar dote ${item.name}`} on:click={()=>{if(form.build)form.build.feats=form.build.feats.filter((_,n)=>n!==i);}}>Quitar</button></div>{/each}
 <label class="block text-sm">Elecciones y notas<textarea aria-label="Elecciones y notas" class="textarea textarea-bordered w-full" bind:value={form.build.choices} maxlength="10000" placeholder="Ej.: ascendencia roja; Magic Initiate: Wisdom, Guidance, Sacred Flame, Cure Wounds…"/></label>
 <h5 class="font-semibold">Rasgos personalizados</h5>
 {#each form.build.customFeatures as feature,i}<div class="space-y-2 border border-primary/30 rounded p-2"><input aria-label={`Nombre del rasgo ${i+1}`} class="input input-bordered input-sm w-full" bind:value={feature.name} maxlength="100" placeholder="Nombre del rasgo"/><textarea aria-label={`Descripción del rasgo ${i+1}`} class="textarea textarea-bordered w-full" bind:value={feature.desc} maxlength="4000" placeholder="Reglas y efectos"/><button type="button" class="link text-xs" on:click={()=>{if(form.build)form.build.customFeatures=form.build.customFeatures.filter((_,n)=>n!==i);}}>Quitar rasgo</button></div>{/each}
 <button type="button" class="btn btn-sm" disabled={form.build.customFeatures.length>=30} on:click={()=>{if(form.build)form.build.customFeatures=[...form.build.customFeatures,{name:'',desc:''}];}}>Agregar rasgo personalizado</button>
 </div>{/if}
