<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { open5eApi } from '$lib/api/api';
  import type { Monster } from '$lib/types';

  export let isOpen: boolean = false;

  const dispatch = createEventDispatcher();

  let searchQuery = '';
  let searchResults: Monster[] = [];
  let selectedMonster: Monster | null = null;
  let loading = false;
  let initiative = 0;

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    
    try {
      loading = true;
      const result = await open5eApi.searchMonsters(searchQuery);
      searchResults = result.results;
    } catch (err: any) {
      alert('Error buscando criaturas: ' + err.message);
    } finally {
      loading = false;
    }
  }

  async function selectMonster(monster: Monster) {
    try {
      // Obtener detalles completos
      const fullMonster = await open5eApi.getMonster(monster.slug);
      selectedMonster = fullMonster;
      // Calcular iniciativa base
      initiative = Math.floor((fullMonster.dexterity - 10) / 2);
    } catch (err) {
      selectedMonster = monster;
      initiative = 0;
    }
  }

  function handleAdd() {
    if (!selectedMonster) return;
    
    const combatant = open5eApi.monsterToCombatant(selectedMonster, initiative);
    dispatch('add', combatant);
    
    // Reset
    searchQuery = '';
    searchResults = [];
    selectedMonster = null;
    initiative = 0;
  }

  function handleClose() {
    searchQuery = '';
    searchResults = [];
    selectedMonster = null;
    initiative = 0;
    dispatch('close');
  }

  $: crText = selectedMonster?.challenge_rating 
    ? `CR ${selectedMonster.challenge_rating}` 
    : '';
</script>

{#if isOpen}
  <div class="modal modal-open">
    <div class="modal-box card-parchment max-w-4xl border-4 border-secondary corner-ornament">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" on:click={handleClose}>✕</button>
      
      <h3 class="font-bold text-3xl font-medieval text-neutral mb-4 text-center">
        🐉 Buscar Criatura en Open5e
      </h3>

      {#if !selectedMonster}
        <!-- Búsqueda -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medieval text-neutral text-lg">Buscar Monstruo</span>
          </label>
          <div class="input-group">
            <input 
              type="text" 
              bind:value={searchQuery}
              on:keydown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ej: goblin, dragon, orc..."
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 flex-1"
            />
            <button 
              class="btn btn-dnd"
              on:click={handleSearch}
              disabled={loading || !searchQuery.trim()}
            >
              {#if loading}
                <span class="loading loading-spinner loading-sm"></span>
              {:else}
                🔍 Buscar
              {/if}
            </button>
          </div>
          <label class="label">
            <span class="label-text-alt text-neutral/60 italic">
              Busca en más de 2000 criaturas del SRD de D&D 5e
            </span>
          </label>
        </div>

        <!-- Resultados -->
        {#if searchResults.length > 0}
          <div class="max-h-96 overflow-y-auto pr-2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              {#each searchResults as monster}
                <button
                  on:click={() => selectMonster(monster)}
                  class="card bg-gradient-to-br from-[#f4e4c1] to-[#e8d4a8] hover:from-[#e8d4a8] hover:to-[#dcc498] shadow-md hover:shadow-xl transition-all text-left border-2 border-primary/30"
                >
                  <div class="card-body p-4">
                    <div class="flex items-start gap-3">
                      {#if monster.img_main}
                        <img 
                          src={monster.img_main} 
                          alt={monster.name}
                          class="w-16 h-16 rounded-lg object-cover ring-2 ring-secondary"
                        />
                      {:else}
                        <div class="w-16 h-16 rounded-lg bg-primary/30 flex items-center justify-center text-3xl">
                          👹
                        </div>
                      {/if}
                      
                      <div class="flex-1">
                        <h4 class="font-bold text-neutral font-medieval">{monster.name}</h4>
                        <p class="text-xs text-neutral/70 font-body">
                          {monster.size} {monster.type}
                        </p>
                        <div class="flex gap-2 mt-1">
                          <div class="badge badge-xs bg-primary/30 text-neutral border-primary/50">
                            CR {monster.challenge_rating}
                          </div>
                          <div class="badge badge-xs bg-info/30 text-neutral border-info/50">
                            AC {monster.armor_class}
                          </div>
                          <div class="badge badge-xs bg-error/30 text-neutral border-error/50">
                            {monster.hit_points} HP
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              {/each}
            </div>
          </div>
        {:else if searchQuery && !loading}
          <div class="text-center py-12">
            <p class="text-neutral/70 font-body">No se encontraron criaturas</p>
          </div>
        {/if}
      {:else}
        <!-- Vista previa del monstruo seleccionado -->
        <div class="space-y-4">
          <!-- Header -->
          <div class="flex items-start gap-4 bg-gradient-to-br from-primary/20 to-accent/20 p-4 rounded-lg border-2 border-primary/50">
            {#if selectedMonster.img_main}
              <img 
                src={selectedMonster.img_main} 
                alt={selectedMonster.name}
                class="w-24 h-24 rounded-lg object-cover ring-4 ring-secondary"
              />
            {:else}
              <div class="w-24 h-24 rounded-lg bg-primary/30 flex items-center justify-center text-5xl ring-4 ring-secondary">
                👹
              </div>
            {/if}
            
            <div class="flex-1">
              <h2 class="text-3xl font-medieval font-bold text-neutral mb-1">
                {selectedMonster.name}
              </h2>
              <p class="text-neutral/70 font-body italic mb-2">
                {selectedMonster.size} {selectedMonster.type}
                {#if selectedMonster.subtype}({selectedMonster.subtype}){/if}
                , {selectedMonster.alignment}
              </p>
              <div class="flex flex-wrap gap-2">
                <div class="badge badge-ornate">{crText}</div>
                <div class="badge bg-primary/30 text-neutral border-primary/50">
                  AC {selectedMonster.armor_class}
                </div>
                <div class="badge bg-error/30 text-neutral border-error/50">
                  {selectedMonster.hit_points} HP ({selectedMonster.hit_dice})
                </div>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="bg-gradient-to-r from-info/10 to-success/10 p-4 rounded-lg border border-info/30">
            <p class="text-xs font-medieval text-neutral/60 mb-2">ATRIBUTOS</p>
            <div class="grid grid-cols-6 gap-2">
              <div class="text-center">
                <p class="text-xs text-neutral/60">FUE</p>
                <p class="text-lg font-bold text-neutral">{selectedMonster.strength}</p>
                <p class="text-xs text-neutral/50">({Math.floor((selectedMonster.strength - 10) / 2) >= 0 ? '+' : ''}{Math.floor((selectedMonster.strength - 10) / 2)})</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-neutral/60">DES</p>
                <p class="text-lg font-bold text-neutral">{selectedMonster.dexterity}</p>
                <p class="text-xs text-neutral/50">({Math.floor((selectedMonster.dexterity - 10) / 2) >= 0 ? '+' : ''}{Math.floor((selectedMonster.dexterity - 10) / 2)})</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-neutral/60">CON</p>
                <p class="text-lg font-bold text-neutral">{selectedMonster.constitution}</p>
                <p class="text-xs text-neutral/50">({Math.floor((selectedMonster.constitution - 10) / 2) >= 0 ? '+' : ''}{Math.floor((selectedMonster.constitution - 10) / 2)})</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-neutral/60">INT</p>
                <p class="text-lg font-bold text-neutral">{selectedMonster.intelligence}</p>
                <p class="text-xs text-neutral/50">({Math.floor((selectedMonster.intelligence - 10) / 2) >= 0 ? '+' : ''}{Math.floor((selectedMonster.intelligence - 10) / 2)})</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-neutral/60">SAB</p>
                <p class="text-lg font-bold text-neutral">{selectedMonster.wisdom}</p>
                <p class="text-xs text-neutral/50">({Math.floor((selectedMonster.wisdom - 10) / 2) >= 0 ? '+' : ''}{Math.floor((selectedMonster.wisdom - 10) / 2)})</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-neutral/60">CAR</p>
                <p class="text-lg font-bold text-neutral">{selectedMonster.charisma}</p>
                <p class="text-xs text-neutral/50">({Math.floor((selectedMonster.charisma - 10) / 2) >= 0 ? '+' : ''}{Math.floor((selectedMonster.charisma - 10) / 2)})</p>
              </div>
            </div>
          </div>

          <!-- Iniciativa -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral text-lg">Iniciativa (tirada)</span>
            </label>
            <input 
              type="number" 
              bind:value={initiative}
              placeholder="Valor de iniciativa"
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 text-center text-2xl"
            />
            <label class="label">
              <span class="label-text-alt text-neutral/60 italic">
                Modificador base: {Math.floor((selectedMonster.dexterity - 10) / 2) >= 0 ? '+' : ''}{Math.floor((selectedMonster.dexterity - 10) / 2)}
              </span>
            </label>
          </div>
        </div>

        <!-- Botones -->
        <div class="modal-action justify-center gap-4">
          <button 
            on:click={() => selectedMonster = null}
            class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
          >
            ← Volver
          </button>
          <button 
            on:click={handleAdd}
            class="btn btn-dnd"
            disabled={!initiative}
          >
            <span class="text-xl">⚔️</span>
            Agregar al Combate
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .input-group {
    display: flex;
    width: 100%;
  }
</style>