<script lang="ts">
 import type {Character} from '$lib/types';import type {PublicCombatant} from '$lib/rules/tablePlay';import {normalizeBuild} from '$lib/rules/characterBuilder';import {api} from '$lib/api/api';import type {HealthAction} from '$lib/rules/2024';import ResourcePanel from './ResourcePanel.svelte';import ConditionBadge from './ConditionBadge.svelte';import HealthControls from './HealthControls.svelte';import CharacterSpellbook from './CharacterSpellbook.svelte';
 export let character:Character;export let fighter:PublicCombatant|null=null;export let currentId='';let busy=false;let error='';let dice=1;
 $: build=normalizeBuild(character.build);$: preparedBuild={...build,spells:build.spells.filter(s=>s.prepared||s.level===0)};
 async function health(event:CustomEvent<HealthAction>){if(busy)return;busy=true;error='';try{await api.applyCharacterHealth(character.id,event.detail);}catch(cause){error=cause instanceof Error?cause.message:'No se pudo guardar.';}finally{busy=false;}}
 async function rest(kind:'short'|'long'){if(busy)return;if(!confirm(`¿Completar un descanso ${kind==='short'?'corto':'largo'} y recuperar los recursos configurados?`))return;busy=true;error='';try{await api.restCharacter(character.id,kind,kind==='short'?dice:0);}catch(cause){error=cause instanceof Error?cause.message:'No se pudo descansar.';}finally{busy=false;}}
</script>
<section class="space-y-3 text-neutral">
 <div class="flex flex-wrap items-center gap-2"><p class="text-sm flex-1">{character.class} · nivel {character.level}</p>{#if fighter?.id===currentId}<span class="badge badge-success">¡Es tu turno!</span>{:else if fighter}<span class="badge badge-outline">En combate</span>{/if}</div>
 <div class="grid grid-cols-3 gap-2 text-center"><div class="border border-primary/30 rounded p-2"><span class="text-xs block">Vida</span><strong>{character.currentHp}/{character.maxHp}</strong></div><div class="border border-primary/30 rounded p-2"><span class="text-xs block">Temporales</span><strong>{character.temporaryHp}</strong></div><div class="border border-primary/30 rounded p-2"><span class="text-xs block">CA</span><strong>{character.armorClass}</strong></div></div>
 <div class="flex flex-wrap gap-1 min-h-7">{#each character.conditions as condition}<ConditionBadge {condition}/>{/each}{#if !character.conditions.length}<span class="text-sm">Sin condiciones</span>{/if}{#if character.rules.concentration}<span class="badge badge-info" title={character.rules.concentration}>🔮 {character.rules.concentration}</span>{/if}{#if character.rules.heroicInspiration}<span class="badge badge-warning">✨ Inspiración</span>{/if}{#if character.rules.exhaustion}<span class="badge badge-error">Agotamiento {character.rules.exhaustion}</span>{/if}</div>
 {#if error}<p role="alert" class="text-error text-sm">{error}</p>{/if}
 {#if !fighter}<details><summary class="cursor-pointer font-semibold text-sm">Vida y estados</summary><HealthControls target={character} {busy} on:health={health}/></details>{:else}<p class="text-xs">La vida y los estados siguen el combate que gestiona el DM.</p>{/if}
 <ResourcePanel {character}/>
 <details class="rest-controls border-t border-primary/20 pt-2"><summary class="cursor-pointer font-semibold">Descansos</summary><p class="text-xs my-2">Fuera del combate. Se recuperan vida/dados según las reglas y los contadores configurados para ese descanso.</p><label class="text-sm">Dados a gastar en descanso corto<input type="number" class="input input-bordered input-sm w-full" min="0" max="20" bind:value={dice}/></label><div class="flex gap-2 mt-2"><button class="btn btn-sm flex-1" disabled={busy||!!fighter} on:click={()=>rest('short')}>Descanso corto</button><button class="btn btn-sm flex-1" disabled={busy||!!fighter} on:click={()=>rest('long')}>Descanso largo</button></div></details>
 <details class="border-t border-primary/20 pt-2"><summary class="cursor-pointer font-semibold">Hechizos preparados y trucos ({preparedBuild.spells.length})</summary><CharacterSpellbook build={preparedBuild} level={character.level} abilityScores={character.abilityScores} editable={false}/></details>
</section>

<style>
 .rest-controls .input {
  color: #f7ecd8;
  background-color: #2d241c;
  caret-color: #f7ecd8;
 }
 .rest-controls .btn:disabled {
  color: #594c39;
  background-color: #d8c9aa;
  border-color: #9e8a69;
  opacity: 1;
 }
</style>
