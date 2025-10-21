<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import debounce from 'lodash/debounce';
  import { open5eApi } from '$lib/api/api';
  import type { Monster, Character } from '$lib/types';

  export let isOpen: boolean = false;
  export let players: Character[] = []; // jugadores de la campaña

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
      type: 'player',
      id: selectedPlayer.id,
      name: selectedPlayer.name,
      maxHp: selectedPlayer.maxHp,
      armorClass: selectedPlayer.armorClass,
      imgUrl: selectedPlayer.imageUrl || '',
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
  let imgUrl = '';
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
    initiative = Math.floor((selectedMonster.dexterity - 10) / 2);
    maxHp = selectedMonster.hit_points;
    armorClass = selectedMonster.armor_class;
    imgUrl = selectedMonster.img_main || '';
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
      imgUrl,
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
    imgUrl = '';
    cr = '';
    type = '';
    size = '';
    alignment = '';
    dispatch('close');
  }
</script>

{#if isOpen}
  <div class="modal modal-open">
    <div class="modal-box card-parchment max-w-3xl border-4 border-secondary relative">
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        on:click={handleClose}
      >
        ✕
      </button>

      <h3 class="font-bold text-2xl font-medieval text-neutral mb-4 text-center">
        ⚔️ Agregar Combatiente
      </h3>

      <!-- Tabs -->
      <div class="flex justify-center gap-4 mb-6">
        <button
          class="btn btn-sm font-medieval {activeTab === 'player' ? 'btn-primary' : 'btn-outline'}"
          on:click={() => (activeTab = 'player')}
        >
          🧝 Jugador
        </button>
        <button
          class="btn btn-sm font-medieval {activeTab === 'monster' ? 'btn-primary' : 'btn-outline'}"
          on:click={() => (activeTab = 'monster')}
        >
          🐉 Monstruo
        </button>
      </div>

      {#if activeTab === 'player'}
        <!-- === TAB JUGADOR === -->
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Seleccionar Jugador</span>
            </label>
            <select
              bind:value={selectedPlayerId}
              class="select select-bordered bg-[#2d241c] text-base-content border-primary/50"
            >
              <option value="" disabled selected>-- Elegir jugador --</option>
              {#each players as p}
                <option value={p.id}>{p.name}</option>
              {/each}
            </select>
          </div>

          {#if selectedPlayer}
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

            <div class="card bg-neutral/20 border border-primary/40 p-4 mt-2">
              <div class="flex items-center gap-4">
                {#if selectedPlayer.imageUrl}
                  <img
                    src={selectedPlayer.imageUrl}
                    alt={selectedPlayer.name}
                    class="w-16 h-16 rounded-lg object-cover border border-primary/40"
                  />
                {/if}
                <div>
                  <p class="font-medieval text-lg text-neutral">{selectedPlayer.name}</p>
                  <p class="text-sm text-neutral/70">
                    HP: {selectedPlayer.maxHp} | AC: {selectedPlayer.armorClass}
                  </p>
                </div>
              </div>
            </div>

            <div class="modal-action justify-center gap-4 mt-4">
              <button
                on:click={handleClose}
                class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
              >
                Cancelar
              </button>
              <button
                on:click={handleAddPlayer}
                class="btn btn-dnd"
                disabled={!selectedPlayer}
              >
                <span class="text-xl">⚔️</span> Agregar al Combate
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <!-- === TAB MONSTRUO === -->
        <div class="space-y-4">
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Buscar monstruo (Open5e)</span>
            </label>
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Ej: goblin, dragon..."
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
              on:input={handleSearch}
            />
          </div>

          {#if suggestions.length > 0}
            <div class="grid grid-cols-1 gap-2 mb-4 max-h-48 overflow-y-auto">
              {#each suggestions as s}
                <button
                  on:click={() => selectSuggestion(s)}
                  class="btn btn-ghost text-left border border-primary/30 hover:bg-primary/20 flex justify-between"
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
                class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
              />
            </div>

            <div class="grid grid-cols-3 gap-4">
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
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medieval text-neutral">AC</span>
                </label>
                <input
                  type="number"
                  bind:value={armorClass}
                  class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
                />
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medieval text-neutral">Imagen (URL)</span>
              </label>
              <input
                type="text"
                bind:value={imgUrl}
                class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
              />
            </div>

            <div class="modal-action justify-center gap-4 mt-4">
              <button
                on:click={handleClose}
                class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
              >
                Cancelar
              </button>
              <button
                on:click={handleAddMonster}
                class="btn btn-dnd"
                disabled={!name || !maxHp || !armorClass}
              >
                <span class="text-xl">⚔️</span> Agregar al Combate
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
