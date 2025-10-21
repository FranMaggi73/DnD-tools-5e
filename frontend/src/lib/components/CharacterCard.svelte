<script lang="ts">
  import type { Character } from '$lib/types';
  import { createEventDispatcher } from 'svelte';

  export let character: Character;
  export let isOwner: boolean = false;

  const dispatch = createEventDispatcher();

  $: hpPercentage = (character.currentHp / character.maxHp) * 100;
  $: hpColor = hpPercentage > 50 ? 'success' : hpPercentage > 25 ? 'warning' : 'error';

  function handleEdit() {
    dispatch('edit', character);
  }

  function handleDelete() {
    dispatch('delete', character);
  }
</script>

<div class="card-parchment card-hover corner-ornament">
  <div class="card-body p-5">
    <!-- Header con avatar -->
    <div class="flex items-start gap-4 mb-4">
      <div class="avatar">
        <div class="w-20 h-20 rounded-full ring-2 ring-secondary ring-offset-2 ring-offset-[#f4e4c1]">
            <div class="bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span class="text-3xl">🧙‍♂️</span>
            </div>
        </div>
      </div>

      <div class="flex-1">
        <h3 class="text-2xl font-medieval font-bold text-neutral mb-1">{character.name}</h3>
        <p class="text-sm text-neutral/70 font-body">{character.class} - Nivel {character.level}</p>
      </div>

      {#if isOwner}
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-sm btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </label>
          <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-neutral rounded-box w-52 border-2 border-secondary">
            <li><a on:click={handleEdit} class="text-secondary">✏️ Editar</a></li>
            <li><a on:click={handleDelete} class="text-error">🗑️ Eliminar</a></li>
          </ul>
        </div>
      {/if}
    </div>

    <div class="divider my-2">⚔️</div>

    <!-- Stats principales -->
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-gradient-to-br from-primary/20 to-accent/20 p-3 rounded-lg border border-primary/30 text-center">
        <p class="text-xs font-medieval text-neutral/60 mb-1">NIVEL</p>
        <p class="text-2xl font-bold text-neutral">{character.level}</p>
      </div>
      
      <div class="bg-gradient-to-br from-info/20 to-success/20 p-3 rounded-lg border border-info/30 text-center">
        <p class="text-xs font-medieval text-neutral/60 mb-1">CA</p>
        <p class="text-2xl font-bold text-neutral">{character.armorClass}</p>
      </div>
      
      <div class="bg-gradient-to-br from-warning/20 to-error/20 p-3 rounded-lg border border-warning/30 text-center">
        <p class="text-xs font-medieval text-neutral/60 mb-1">INIT</p>
        <p class="text-2xl font-bold text-neutral">+{character.initiative}</p>
      </div>
    </div>

    <!-- HP -->
    <div class="bg-gradient-to-r from-success/10 to-error/10 p-3 rounded-lg border border-success/30">
      <div class="flex justify-between items-center mb-2">
        <span class="text-xs font-medieval text-neutral/70">PUNTOS DE VIDA</span>
        <span class="font-bold text-neutral text-lg">{character.currentHp}/{character.maxHp}</span>
      </div>
      <progress 
        class="progress progress-{hpColor} w-full h-3" 
        value={character.currentHp} 
        max={character.maxHp}
      ></progress>
    </div>

    <!-- Footer -->
    <div class="text-xs text-neutral/50 text-center mt-3 italic font-body">
      Creado {new Date(character.createdAt).toLocaleDateString()}
    </div>
  </div>
</div>
