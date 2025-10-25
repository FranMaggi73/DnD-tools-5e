<script lang="ts">
  import type { Character } from '$lib/types';
  import { createEventDispatcher } from 'svelte';

  export let character: Character;
  export let isOwner: boolean = false;

  const dispatch = createEventDispatcher();

  $: hpPercentage = (character.currentHp / character.maxHp) * 100;
  $: hpColor = hpPercentage > 50 ? 'success' : hpPercentage > 25 ? 'warning' : 'error';
  $: hasConditions = Array.isArray(character.conditions) && character.conditions.length > 0;

  function handleEdit() {
    dispatch('edit', character);
  }

  function handleDelete() {
    dispatch('delete', character);
  }
</script>

<div class="card-parchment card-hover corner-ornament w-full max-w-md mx-auto">
  <div class="card-body p-4 sm:p-5">
    <!-- Header: avatar + name + class + owner menu -->
    <div class="flex items-center justify-between mb-4 flex-wrap">
        <div class="flex items-center gap-4 min-w-0">
          <!-- Avatar -->
          <div class="avatar flex-shrink-0">
            <div class="w-20 h-20 rounded-full ring-2 ring-secondary ring-offset-2 ring-offset-[#f4e4c1]">
              <div class="bg-gradient-to-br from-primary to-accent flex items-center justify-center w-full h-full">
                <span class="text-3xl">🧙‍♂️</span>
              </div>
            </div>
          </div>

          <!-- Nombre y clase -->
          <div class="flex-1 min-w-0">
            <h3 class="text-xl sm:text-2xl font-medieval font-bold text-neutral mb-1 break-normal whitespace-normal">
              {character.name}
            </h3>
            <p class="text-sm sm:text-base text-neutral/70 font-body whitespace-normal">{character.class}</p>
          </div>
        </div>
        {#if isOwner}
          <!-- Botón dropdown siempre al costado -->
          <div class="mt-2 sm:mt-0 flex-shrink-0">
            <div class="dropdown dropdown-end">
              <label tabindex="0" class="btn btn-ghost btn-sm btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </label>
              <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-neutral rounded-box w-40 sm:w-52 border-2 border-secondary">
                <li><a on:click={handleEdit} class="text-secondary">✏️ Editar</a></li>
                <li><a on:click={handleDelete} class="text-error">🗑️ Eliminar</a></li>
              </ul>
            </div>
          </div>
        {/if}
      </div>

    <!-- Stats principales -->
    <div class="grid grid-cols-2 sm:grid-cols-2 gap-3 mb-4 text-center">
      <div class="bg-gradient-to-br from-info/20 to-success/20 p-2 sm:p-3 rounded-lg border border-info/30">
        <p class="text-xs sm:text-sm font-medieval text-neutral/60 mb-1">CA</p>
        <p class="text-xl sm:text-2xl font-bold text-neutral">{character.armorClass}</p>
      </div>
      <div class="bg-gradient-to-br from-warning/20 to-error/20 p-2 sm:p-3 rounded-lg border border-warning/30">
        <p class="text-xs sm:text-sm font-medieval text-neutral/60 mb-1">INIT</p>
        <p class="text-xl sm:text-2xl font-bold text-neutral">+{character.initiative}</p>
      </div>
    </div>

    <!-- HP -->
    <div class="bg-gradient-to-r from-success/10 to-error/10 p-2 sm:p-3 rounded-lg border border-success/30 mb-3">
      <div class="flex justify-between items-center mb-2 text-sm sm:text-base">
        <span class="font-medieval text-neutral/70">PUNTOS DE VIDA</span>
        <span class="font-bold text-neutral">{character.currentHp}/{character.maxHp}</span>
      </div>
      <progress class="progress progress-{hpColor} w-full h-3 sm:h-4" value={character.currentHp} max={character.maxHp}></progress>
    </div>

    <!-- Condiciones -->
    {#if hasConditions}
      <div class="bg-warning/10 p-2 sm:p-3 rounded-lg border border-warning/30">
        <p class="text-xs sm:text-sm font-medieval text-neutral/60 mb-2">⚠️ CONDICIONES ACTIVAS</p>
        <div class="flex flex-wrap gap-1">
          {#each character.conditions as condition}
            <div class="badge badge-warning badge-sm">{condition}</div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
