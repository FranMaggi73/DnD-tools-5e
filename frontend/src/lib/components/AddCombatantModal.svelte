<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import debounce from 'lodash/debounce';
  import { open5eApi } from '$lib/api/api';
  import type { Monster, Character } from '$lib/types';

  export let isOpen: boolean = false;
  export let players: Character[] = [];

  const dispatch = createEventDispatcher();

  let activeTab: 'player' | 'monster' = 'player';

  // Campos generales
  let initiative = 0;

  // === MODO JUGADOR ===
  let selectedPlayerId: string = '';
  $: selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  function handleAddPlayer() {
    if (!selectedPlayer) return;

    dispatch('add', {
      type: 'character', // ✅ Corregido: era 'player'
      characterId: selectedPlayer.id, // ✅ Corregido: era 'id'
      name: selectedPlayer.name,
      maxHp: selectedPlayer.maxHp,
      armorClass: selectedPlayer.armorClass,
      initiative,
      isNpc: false
    });

    handleClose();
  }

  // === MODO MONSTRUO ===
  let searchQuery = '';
  let suggestions: Monster[] = [];
  let selectedMonster: Monster | null = null;
  let loading = false;

  // Campos autocompletables del monstruo
  let name = '';
  let maxHp = 0;
  let armorClass = 10;
  let cr = '';
  let type = '';
  let size = '';
  let alignment = '';

  const handleSearch = debounce(async () => {
    if (!searchQuery.trim()) {
      suggestions = [];
      return;
    }
    loading = true;
    try {
      const result = await open5eApi.searchMonsters(searchQuery);
      suggestions = result.results.slice(0, 3);
    } catch (err) {
      console.error(err);
      suggestions = [];
    } finally {
      loading = false;
    }
  }, 300);

  async function selectSuggestion(monster: Monster) {
    selectedMonster = await open5eApi.getMonster(monster.slug);

    name = selectedMonster.name;
    maxHp = selectedMonster.hit_points;
    armorClass = selectedMonster.armor_class;
    cr = selectedMonster.challenge_rating;
    type = selectedMonster.type;
    size = selectedMonster.size;
    alignment = selectedMonster.alignment;

    suggestions = [];
    searchQuery = '';
  }

  function handleAddMonster() {
    if (!name || !maxHp || !armorClass) return;

    dispatch('add', {
      type: 'creature',
      name,
      initiative,
      maxHp,
      armorClass,
      cr,
      size,
      alignment,
      isNpc: true
    });

    handleClose();
  }

  function handleClose() {
    // reset total
    selectedPlayerId = '';
    selectedMonster = null;
    searchQuery = '';
    suggestions = [];
    name = '';
    initiative = 0;
    maxHp = 0;
    armorClass = 10;
    cr = '';
    type = '';
    size = '';
    alignment = '';
    dispatch('close');
  }
</script>

{#if isOpen}
<div class="modal modal-open z-50">
  <!-- Contenedor del modal -->
  <div class="modal-box card-parchment w-11/12 max-w-3xl h-[80vh] md:h-[70vh] relative flex flex-col">

        <!-- HEADER FIJO: título + tabs + close -->
    <div class="flex flex-col md:flex-row justify-between items-center p-4 border-b-2 border-secondary gap-2 md:gap-4">
      <!-- Título -->
      <h3 class="font-bold text-2xl md:text-3xl font-medieval text-neutral flex-1 text-center md:text-left">
        ⚔️ Agregar Combatiente
      </h3>
      <!-- Tabs -->
      <div class="flex gap-2">
        <button
          class="btn btn-sm font-medieval {activeTab === 'player' ? 'btn-primary' : 'btn-outline'}"
          on:click={() => (activeTab = 'player')}
        >🧝 Jugador</button>
        <button
          class="btn btn-sm font-medieval {activeTab === 'monster' ? 'btn-primary' : 'btn-outline'}"
          on:click={() => (activeTab = 'monster')}
        >🐉 Monstruo</button>
      </div>

      <!-- Botón cerrar -->
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 md:static"
        on:click={handleClose}
      >✕</button>
    </div>

    <!-- CONTENIDO SCROLLEABLE -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      {#if activeTab === 'player'}
        <!-- TAB JUGADOR -->
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Seleccionar Jugador</span>
            </label>
            <select
              bind:value={selectedPlayerId}
              class="select select-bordered bg-[#2d241c] text-base-content border-primary/50 w-full"
            >
              <option value="" disabled selected>-- Elegir jugador --</option>
              {#each players as p}
                <option value={p.id}>{p.name}</option>
              {/each}
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Iniciativa</span>
            </label>
            <input
              type="number"
              min="1"
              max="100"
              step="1"
              required
              bind:value={initiative}
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 w-full"
            />
          </div>

          <div class="card bg-neutral/20 border border-primary/40 p-4 mt-2">
            <div class="flex items-center gap-4">
              <div>
                <p class="text-lg font-bold text-neutral">{selectedPlayer?.name || 'Elegir jugador'}</p>
                <p class="text-sm text-neutral/70">
                  HP: {selectedPlayer?.maxHp || 0} | AC: {selectedPlayer?.armorClass || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      {:else}
        <!-- TAB MONSTRUO -->
        <div class="space-y-4">
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Buscar monstruo (Open5e)</span>
            </label>
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Ej: goblin, dragon..."
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 w-full"
              on:input={handleSearch}
            />
          </div>

          {#if suggestions.length > 0}
            <div class="grid grid-cols-1 gap-2 mb-4 max-h-48 overflow-y-auto">
              {#each suggestions as s}
                <button
                  on:click={() => selectSuggestion(s)}
                  class="btn btn-ghost text-left border border-primary/30 hover:bg-primary/20 flex justify-between w-full"
                >
                  <span>{s.name}</span>
                  <span class="text-xs text-neutral/60">CR {s.challenge_rating}</span>
                </button>
              {/each}
            </div>
          {/if}

          <!-- Formulario monstruo -->
          <div class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medieval text-neutral">Nombre</span>
              </label>
              <input
                type="text"
                bind:value={name}
                class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 w-full"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medieval text-neutral">Iniciativa</span>
                </label>
                <input
                  type="number"
                  bind:value={initiative}
                  class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 w-full"
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medieval text-neutral">HP Máximo</span>
                </label>
                <input
                  type="number"
                  bind:value={maxHp}
                  class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 w-full"
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medieval text-neutral">AC</span>
                </label>
                <input
                  type="number"
                  bind:value={armorClass}
                  class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 w-full"
                />
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- FOOTER FIJO -->
    <div class="flex justify-center gap-4 p-4 border-t-2 border-secondary flex-col md:flex-row">
      <button
        on:click={handleClose}
        class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval w-full md:w-auto"
      >Cancelar</button>
      <button
        on:click={activeTab === 'player' ? handleAddPlayer : handleAddMonster}
        class="btn btn-dnd w-full md:w-auto"
        disabled={
          (activeTab === 'player' && (!selectedPlayer || initiative < 1)) ||
          (activeTab === 'monster' && (!name || !maxHp || !armorClass || initiative < 1))
        }
      >
        <span class="text-xl">⚔️</span> Agregar al Combate
      </button>
    </div>
  </div>
</div>
{/if}
