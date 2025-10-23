<script lang="ts">
  import type { Combatant } from '$lib/types';
  import { createEventDispatcher } from 'svelte';

  export let combatant: Combatant;
  export let isCurrentTurn: boolean = false;
  export let isDM: boolean = false;

  const dispatch = createEventDispatcher();

  $: hpPercentage = (combatant.currentHp / combatant.maxHp) * 100;
  $: hpColor = hpPercentage > 50 ? 'success' : hpPercentage > 25 ? 'warning' : 'error';
  $: isDead = combatant.currentHp <= 0;

  function handleUpdateHP() {
    dispatch('updateHP', combatant);
  }

  function handleAddCondition() {
    dispatch('addCondition', combatant);
  }

  function handleRemove() {
    dispatch('remove', combatant);
  }
</script>

<div 
  class="card-parchment corner-ornament relative {isCurrentTurn ? 'ring-4 ring-secondary animate-pulse' : ''} {isDead ? 'opacity-50' : ''}"
>
  {#if isCurrentTurn}
    <div class="absolute -top-3 -right-3 badge badge-ornate text-lg animate-bounce z-10">
      ⚔️ SU TURNO
    </div>
  {/if}

  {#if isDead}
    <div class="absolute inset-0 bg-error/20 flex items-center justify-center -z-10 rounded-lg">
      <span class="text-6xl">💀</span>
    </div>
  {/if}

  <div class="card-body p-4">
    <!-- Header -->
    <div class="flex items-start gap-3">
      <div class="avatar">
        <div class="w-16 h-16 rounded-full ring-2 {isCurrentTurn ? 'ring-secondary' : 'ring-primary/50'}">
            <div class="bg-primary/20 flex items-center justify-center">
              <span class="text-2xl">{combatant.isNpc ? '👹' : '🧙‍♂️'}</span>
            </div>
        </div>
      </div>

      <div class="flex-1">
        <h3 class="font-medieval text-lg text-neutral font-bold">{combatant.name}</h3>
        <div class="flex gap-2 mt-1">
          <div class="badge badge-sm bg-primary/30 text-neutral border-primary/50">
            🎲 {combatant.initiative}
          </div>
          <div class="badge badge-sm bg-info/30 text-neutral border-info/50">
            🛡️ AC {combatant.armorClass}
          </div>
          {#if combatant.isNpc}
            <div class="badge badge-sm badge-error">NPC</div>
          {/if}
        </div>
      </div>

      {#if isDM}
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-xs btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </label>
          <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-neutral rounded-box w-52 border-2 border-secondary">
            <li><a on:click={handleRemove} class="text-error">🗑️ Eliminar</a></li>
          </ul>
        </div>
      {/if}
    </div>

    <!-- HP Bar -->
    <div class="mt-3">
      <div class="flex justify-between items-center mb-1">
        <span class="text-xs font-medieval text-neutral/70">Puntos de Vida</span>
        <span class="font-bold text-neutral">{combatant.currentHp}/{combatant.maxHp}</span>
      </div>
      <progress 
        class="progress progress-{hpColor} w-full" 
        value={combatant.currentHp} 
        max={combatant.maxHp}
      ></progress>
    </div>

    <!-- Conditions -->
    {#if combatant.conditions && combatant.conditions.length > 0}
      <div class="flex flex-wrap gap-1 mt-2">
        {#each combatant.conditions as condition}
          <div class="badge badge-sm badge-warning text-xs">{condition}</div>
        {/each}
      </div>
    {/if}

    <!-- Actions (DM only) -->
    {#if isDM}
      <div class="flex gap-2 mt-3">
        <button 
          on:click={handleUpdateHP}
          class="btn btn-xs btn-success flex-1"
        >
          💚 HP
        </button>
        <button 
          on:click={handleAddCondition}
          class="btn btn-xs btn-warning flex-1"
        >
          ⚠️ Estado
        </button>
      </div>
    {/if}
  </div>
</div>