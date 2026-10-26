<script lang="ts">
 import {createEventDispatcher} from 'svelte';
 import type {Character} from '$lib/types';
 import type {PublicCombatant} from '$lib/rules/tablePlay';
 import CombatCharacterPanel from './CombatCharacterPanel.svelte';
 export let character:Character;
 export let fighter:PublicCombatant|null=null;
 export let currentId='';
 const dispatch=createEventDispatcher();
</script>

<svelte:window on:keydown={event=>{if(event.key==='Escape')dispatch('close');}}/>
<div class="modal modal-open z-[60]" role="dialog" aria-modal="true" aria-labelledby="character-play-title">
 <div class="card-parchment border-2 border-secondary w-full max-w-2xl max-h-[92dvh] flex flex-col !overflow-hidden text-neutral">
  <header class="p-3 border-b border-primary/30 shrink-0 flex items-center gap-2">
   <h2 id="character-play-title" class="font-medieval text-lg min-w-0 flex-1 break-words">📋 Ficha: {character.name}</h2>
   <button class="btn btn-sm btn-circle btn-ghost shrink-0" aria-label="Cerrar ficha" on:click={()=>dispatch('close')}>✕</button>
  </header>
  <div class="min-h-0 overflow-y-auto p-3 space-y-3">
   <CombatCharacterPanel {character} {fighter} {currentId}/>
   <a class="btn btn-sm btn-outline text-neutral w-full" href={`/campaigns/${character.campaignId}/characters`}>Consultar personaje completo</a>
  </div>
 </div>
</div>
