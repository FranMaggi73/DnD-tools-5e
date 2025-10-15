<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Character } from '$lib/types';

  export let isOpen: boolean = false;
  export let characters: Character[] = [];

  const dispatch = createEventDispatcher();

  let tab: 'character' | 'creature' = 'character';
  let selectedCharacterId = '';
  let creatureName = '';
  let initiative = 0;
  let maxHp = 0;
  let armorClass = 10;
  let imageUrl = '';

  function resetForm() {
    selectedCharacterId = '';
    creatureName = '';
    initiative = 0;
    maxHp = 0;
    armorClass = 10;
    imageUrl = '';
  }

  function handleSubmit() {
    if (tab === 'character') {
      if (!selectedCharacterId) return;
      dispatch('add', {
        type: 'character',
        characterId: selectedCharacterId,
        initiative,
      });
    } else {
      if (!creatureName || !maxHp) return;
      dispatch('add', {
        type: 'creature',
        name: creatureName,
        initiative,
        maxHp,
        armorClass,
        imageUrl,
        isNpc: true,
      });
    }
    resetForm();
  }

  function handleClose() {
    resetForm();
    dispatch('close');
  }
</script>

{#if isOpen}
  <div class="modal modal-open">
    <div class="modal-box card-parchment max-w-2xl border-4 border-secondary">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" on:click={handleClose}>✕</button>
      
      <h3 class="font-bold text-2xl font-medieval text-neutral mb-4 text-center">
        ⚔️ Agregar al Combate
      </h3>

      <!-- Tabs -->
      <div class="tabs tabs-boxed bg-primary/20 mb-4">
        <a 
          class="tab {tab === 'character' ? 'tab-active bg-secondary text-neutral' : 'text-neutral/70'} font-medieval"
          on:click={() => tab = 'character'}
        >
          🧙‍♂️ Personaje
        </a>
        <a 
          class="tab {tab === 'creature' ? 'tab-active bg-secondary text-neutral' : 'text-neutral/70'} font-medieval"
          on:click={() => tab = 'creature'}
        >
          👹 Criatura
        </a>
      </div>

      {#if tab === 'character'}
        <!-- Agregar Personaje -->
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Seleccionar Personaje</span>
            </label>
            <select bind:value={selectedCharacterId} class="select select-bordered bg-[#2d241c] text-base-content border-primary/50">
              <option value="">Selecciona un personaje...</option>
              {#each characters as char}
                <option value={char.id}>{char.name} - {char.class} Nv. {char.level}</option>
              {/each}
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Iniciativa (tirada)</span>
            </label>
            <input 
              type="number" 
              bind:value={initiative}
              placeholder="Ej: 18"
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            />
            <label class="label">
              <span class="label-text-alt text-neutral/60 italic">Valor de iniciativa que sacó en el dado</span>
            </label>
          </div>
        </div>
      {:else}
        <!-- Agregar Criatura -->
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Nombre</span>
            </label>
            <input 
              type="text" 
              bind:value={creatureName}
              placeholder="Ej: Orco Guerrero"
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medieval text-neutral">Iniciativa</span>
              </label>
              <input 
                type="number" 
                bind:value={initiative}
                class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medieval text-neutral">HP Máximo</span>
              </label>
              <input 
                type="number" 
                bind:value={maxHp}
                class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
              />
            </div>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Clase de Armadura (AC)</span>
            </label>
            <input 
              type="number" 
              bind:value={armorClass}
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">URL de Imagen (opcional)</span>
            </label>
            <input 
              type="text" 
              bind:value={imageUrl}
              placeholder="https://..."
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            />
          </div>
        </div>
      {/if}

      <div class="modal-action justify-center gap-4">
        <button on:click={handleClose} class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval">
          Cancelar
        </button>
        <button 
          on:click={handleSubmit} 
          class="btn btn-dnd"
          disabled={tab === 'character' ? !selectedCharacterId || !initiative : !creatureName || !maxHp || !initiative}
        >
          <span class="text-xl">⚔️</span>
          Agregar al Combate
        </button>
      </div>
    </div>
  </div>
{/if}