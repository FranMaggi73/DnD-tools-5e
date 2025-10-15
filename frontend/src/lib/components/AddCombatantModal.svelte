<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Character } from '$lib/types';
  import MonsterSearchModal from './MonsterSearchModal.svelte';

  export let isOpen: boolean = false;
  export let characters: Character[] = [];

  const dispatch = createEventDispatcher();

  let tab: 'character' | 'creature' | 'search' = 'character';
  let selectedCharacterId = '';
  let creatureName = '';
  let initiative = 0;
  let maxHp = 0;
  let armorClass = 10;
  let imageUrl = '';
  
  let showMonsterSearch = false;

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

  function handleMonsterAdd(event: CustomEvent) {
    dispatch('add', event.detail);
    showMonsterSearch = false;
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
          class="tab {tab === 'search' ? 'tab-active bg-secondary text-neutral' : 'text-neutral/70'} font-medieval"
          on:click={() => { tab = 'search'; showMonsterSearch = true; }}
        >
          🐉 Buscar Online
        </a>
        <a 
          class="tab {tab === 'creature' ? 'tab-active bg-secondary text-neutral' : 'text-neutral/70'} font-medieval"
          on:click={() => tab = 'creature'}
        >
          👹 Manual
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
      {:else if tab === 'search'}
        <!-- Buscar Online - Redirige al modal -->
        <div class="text-center py-12">
          <div class="text-6xl mb-4">🐉</div>
          <h3 class="text-2xl font-medieval text-neutral mb-3">Buscar en Open5e</h3>
          <p class="text-neutral/70 font-body mb-6">
            Busca entre más de 2000 criaturas del SRD de D&D 5e
          </p>
          <button 
            on:click={() => showMonsterSearch = true}
            class="btn btn-dnd btn-lg"
          >
            <span class="text-2xl">🔍</span>
            Abrir Buscador
          </button>
        </div>
      {:else}
        <!-- Agregar Criatura Manual -->
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

      {#if tab !== 'search'}
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
      {/if}
    </div>
  </div>
{/if}

<!-- Modal de búsqueda de monstruos -->
<MonsterSearchModal 
  bind:isOpen={showMonsterSearch}
  on:add={handleMonsterAdd}
  on:close={() => { showMonsterSearch = false; tab = 'character'; }}
/>