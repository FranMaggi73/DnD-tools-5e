<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { userStore } from '$lib/stores/authStore';
  import { api } from '$lib/api/api';
  import type { Campaign, Encounter, Combatant, Character } from '$lib/types';
  import CombatantCard from '$lib/components/CombatantCard.svelte';
  import AddCombatantModal from '$lib/components/AddCombatantModal.svelte';
  import { headerTitle } from '$lib/stores/uiStore';

  headerTitle.set('Combate');

  $: campaignId = $page.params.id || '';

  let campaign: Campaign | null = null;
  let encounter: Encounter | null = null;
  let combatants: Combatant[] = [];
  let characters: Character[] = [];
  let loading = true;
  let error = '';

  let showAddCombatantModal = false;
  let showCreateEncounterModal = false;
  let encounterName = '';
  let selectedCombatant: Combatant | null = null;
  let hpChangeValue = 0;
  let newCondition = '';

  let pollInterval: NodeJS.Timeout;

  $: isDM = campaign && $userStore && campaign.dmId === $userStore.uid;
  $: currentTurnCombatant = encounter && combatants.length > 0 
    ? combatants[encounter.turnIndex % combatants.length] 
    : null;

  onMount(async () => {
    await loadCampaign();
    await loadCharacters();
    await loadEncounter();
    
    // Poll cada 5 segundos
    pollInterval = setInterval(() => {
      if (encounter?.isActive) {
        loadEncounter(true);
      }
    }, 5000);
  });

  onDestroy(() => {
    if (pollInterval) clearInterval(pollInterval);
  });

  async function loadCampaign() {
    try {
      campaign = await api.getCampaign(campaignId);
    } catch (err: any) {
      error = err.message;
    }
  }

  async function loadCharacters() {
    try {
      characters = await api.getCampaignCharacters(campaignId);
    } catch (err) {
      console.error('Error loading characters:', err);
    }
  }

  async function loadEncounter(silent = false) {
    try {
      if (!silent) loading = true;
      encounter = await api.getActiveEncounter(campaignId);
      if (encounter) {
        await loadCombatants();
      }
    } catch (err: any) {
      if (!silent) {
        encounter = null;
        combatants = [];
      }
    } finally {
      if (!silent) loading = false;
    }
  }

  async function loadCombatants() {
    if (!encounter) return;
    try {
      combatants = await api.getCombatants(encounter.id);
    } catch (err) {
      console.error('Error loading combatants:', err);
    }
  }

  async function createEncounter() {
    if (!encounterName.trim()) return;
    try {
      await api.createEncounter(campaignId, encounterName);
      showCreateEncounterModal = false;
      encounterName = '';
      await loadEncounter();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function endEncounter() {
    if (!encounter || !confirm('¿Finalizar este encuentro?')) return;
    try {
      await api.endEncounter(encounter.id);
      encounter = null;
      combatants = [];
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleAddCombatant(event: CustomEvent) {
    if (!encounter) return;
    try {
      await api.addCombatant(encounter.id, event.detail);
      showAddCombatantModal = false;
      await loadCombatants();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleRemoveCombatant(event: CustomEvent) {
    const combatant = event.detail as Combatant;
    if (!confirm(`¿Eliminar a ${combatant.name} del combate?`)) return;
    try {
      await api.removeCombatant(combatant.id);
      await loadCombatants();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function updateHP(combatant: Combatant, change: number) {
    try {
      const newHP = Math.max(0, Math.min(combatant.maxHp, combatant.currentHp + change));
      await api.updateCombatant(combatant.id, { currentHp: newHP });
      await loadCombatants();
      selectedCombatant = null;
      hpChangeValue = 0;
    } catch (err: any) {
      error = err.message;
    }
  }

  async function addCondition(combatant: Combatant, condition: string) {
    if (!condition.trim()) return;
    try {
      const conditions = [...combatant.conditions, condition];
      await api.updateCombatant(combatant.id, { conditions });
      await loadCombatants();
      newCondition = '';
    } catch (err: any) {
      error = err.message;
    }
  }

  async function removeCondition(combatant: Combatant, condition: string) {
    try {
      const conditions = combatant.conditions.filter(c => c !== condition);
      await api.updateCombatant(combatant.id, { conditions });
      await loadCombatants();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function nextTurn() {
    if (!encounter) return;
    try {
      encounter = await api.nextTurn(encounter.id);
      await loadCombatants();
    } catch (err: any) {
      error = err.message;
    }
  }
</script>

<div class="min-h-screen flex flex-col">
  {#if error}
    <div class="container mx-auto p-4">
      <div class="alert alert-error">
        <span>{error}</span>
        <button class="btn btn-sm" on:click={() => error = ''}>✕</button>
      </div>
    </div>
  {/if}

  <div class="flex flex-1">
    <!-- Contenido principal -->
    <div class="flex-1">
      {#if loading}
        <div class="flex items-center justify-center h-full">
          <span class="loading loading-spinner loading-lg text-secondary"></span>
        </div>
      {:else if !encounter}
        <!-- No hay encuentro activo -->
        <div class="flex items-center justify-center h-full p-4">
          <div class="card-parchment max-w-2xl w-full p-12 corner-ornament text-center">
            <div class="text-6xl mb-4">⚔️</div>
            <h2 class="text-3xl font-medieval text-neutral mb-4">No hay combate activo</h2>
            <p class="text-neutral/70 font-body mb-6">
              El DM debe iniciar un encuentro para comenzar la batalla
            </p>
            
            {#if isDM}
              <button 
                on:click={() => showCreateEncounterModal = true}
                class="btn btn-dnd btn-lg"
              >
                <span class="text-2xl">⚔️</span>
                Iniciar Encuentro
              </button>
            {:else}
              <p class="text-sm text-neutral/50 italic">Esperando que el DM inicie el combate...</p>
            {/if}
          </div>
        </div>
      {:else}
        <!-- Combate activo -->
        <div class="p-4 max-w-4xl mx-auto">
          <!-- Header del combate -->
          <div class="card-parchment mb-6 corner-ornament">
            <div class="card-body p-6">
              <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h2 class="text-3xl font-medieval text-neutral mb-2">{encounter.name}</h2>
                  <div class="flex gap-4">
                    <div class="badge badge-ornate badge-lg">
                      🔄 Ronda {encounter.round}
                    </div>
                    <div class="badge bg-info/30 border-info/50 text-neutral badge-lg">
                      👥 {combatants.length} Combatientes
                    </div>
                  </div>
                </div>

                {#if isDM}
                  <div class="flex gap-2">
                    <button 
                      on:click={() => showAddCombatantModal = true}
                      class="btn btn-success btn-sm gap-2"
                    >
                      <span class="text-lg">➕</span>
                      Agregar
                    </button>
                    <button 
                      on:click={nextTurn}
                      class="btn btn-dnd btn-sm gap-2"
                      disabled={combatants.length === 0}
                    >
                      <span class="text-lg">▶️</span>
                      Siguiente Turno
                    </button>
                    <button 
                      on:click={endEncounter}
                      class="btn btn-error btn-sm"
                    >
                      🏁 Finalizar
                    </button>
                  </div>
                {/if}
              </div>

              {#if currentTurnCombatant}
                <div class="bg-gradient-to-r from-secondary/20 to-accent/20 p-4 rounded-lg border-2 border-secondary">
                  <p class="text-sm font-medieval text-neutral/70 mb-1">TURNO ACTUAL</p>
                  <p class="text-2xl font-bold font-medieval text-neutral">
                    {currentTurnCombatant.name}
                  </p>
                </div>
              {/if}
            </div>
          </div>

          {#if combatants.length === 0}
            <div class="card-parchment p-12 text-center">
              <div class="text-4xl mb-3">🎲</div>
              <p class="text-xl font-medieval text-neutral mb-2">Sin combatientes</p>
              <p class="text-neutral/70 font-body">
                {isDM ? 'Agrega personajes y criaturas para comenzar' : 'Esperando que el DM agregue combatientes'}
              </p>
            </div>
          {:else}
            <!-- Lista de combatientes -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each combatants as combatant, index}
                <CombatantCard 
                  {combatant}
                  isCurrentTurn={index === (encounter.turnIndex % combatants.length)}
                  isDM={!!isDM} 
                  on:updateHP={(e) => selectedCombatant = e.detail}
                  on:addCondition={(e) => selectedCombatant = e.detail}
                  on:remove={handleRemoveCombatant}
                />
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Modal Crear Encuentro -->
{#if showCreateEncounterModal}
  <div class="modal modal-open">
    <div class="modal-box card-parchment border-4 border-secondary">
      <h3 class="font-bold text-2xl font-medieval text-neutral mb-4 text-center">
        ⚔️ Iniciar Encuentro
      </h3>

      <div class="form-control">
        <label class="label">
          <span class="label-text font-medieval text-neutral text-lg">Nombre del Encuentro</span>
        </label>
        <input 
          type="text" 
          bind:value={encounterName}
          placeholder="Ej: Emboscada de Orcos"
          class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 text-lg"
        />
      </div>

      <div class="modal-action justify-center gap-4">
        <button 
          on:click={() => { showCreateEncounterModal = false; encounterName = ''; }}
          class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
        >
          Cancelar
        </button>
        <button 
          on:click={createEncounter}
          class="btn btn-dnd"
          disabled={!encounterName.trim()}
        >
          <span class="text-xl">⚔️</span>
          Iniciar Combate
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Modal Modificar HP -->
{#if selectedCombatant && !newCondition}
  <div class="modal modal-open">
    <div class="modal-box card-parchment border-4 border-secondary">
      <h3 class="font-bold text-2xl font-medieval text-neutral mb-4 text-center">
        💚 Modificar HP - {selectedCombatant.name}
      </h3>

      <div class="text-center mb-6">
        <p class="text-sm font-medieval text-neutral/70">HP Actual</p>
        <p class="text-5xl font-bold text-neutral">{selectedCombatant.currentHp}</p>
        <p class="text-neutral/50">/ {selectedCombatant.maxHp}</p>
      </div>

      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text font-medieval text-neutral">Cambio de HP (+ curar / - daño)</span>
        </label>
        <input 
          type="number" 
          bind:value={hpChangeValue}
          placeholder="Ej: -5 para daño, +10 para curación"
          class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 text-center text-2xl"
        />
      </div>

      <div class="grid grid-cols-2 gap-2 mb-4">
        <button 
          on:click={() => hpChangeValue = -5}
          class="btn btn-error btn-sm"
        >
          -5
        </button>
        <button 
          on:click={() => hpChangeValue = -10}
          class="btn btn-error btn-sm"
        >
          -10
        </button>
        <button 
          on:click={() => hpChangeValue = 5}
          class="btn btn-success btn-sm"
        >
          +5
        </button>
        <button 
          on:click={() => hpChangeValue = 10}
          class="btn btn-success btn-sm"
        >
          +10
        </button>
      </div>

      <div class="modal-action justify-center gap-4">
        <button 
          on:click={() => { selectedCombatant = null; hpChangeValue = 0; }}
          class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
        >
          Cancelar
        </button>
        <button 
          on:click={() => selectedCombatant && updateHP(selectedCombatant, hpChangeValue)}
          class="btn btn-dnd"
          disabled={hpChangeValue === 0}
        >
          Aplicar
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Modal Agregar Condición -->
{#if selectedCombatant && newCondition !== null && newCondition !== undefined}
  <div class="modal modal-open">
    <div class="modal-box card-parchment border-4 border-secondary">
      <h3 class="font-bold text-2xl font-medieval text-neutral mb-4 text-center">
        ⚠️ Condiciones - {selectedCombatant.name}
      </h3>

      <!-- Condiciones actuales -->
      {#if selectedCombatant.conditions.length > 0}
        <div class="mb-4">
          <p class="text-sm font-medieval text-neutral/70 mb-2">Condiciones Activas:</p>
          <div class="flex flex-wrap gap-2">
            {#each selectedCombatant.conditions as condition}
              <div class="badge badge-warning gap-2">
                {condition}
                <button 
                  class="btn btn-xs btn-circle btn-ghost"
                  on:click={() => selectedCombatant && removeCondition(selectedCombatant, condition)}
                >
                  ✕
                </button>
              </div>
            {/each}
          </div>
        </div>
        <div class="divider">⚔️</div>
      {/if}

      <!-- Agregar nueva condición -->
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text font-medieval text-neutral">Nueva Condición</span>
        </label>
        <input 
          type="text" 
          bind:value={newCondition}
          placeholder="Ej: Envenenado, Aturdido..."
          class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
        />
      </div>

      <!-- Condiciones comunes -->
      <div class="grid grid-cols-2 gap-2 mb-4">
        {#each ['Envenenado', 'Aturdido', 'Cegado', 'Concentración', 'Hechizado', 'Asustado', 'Prone', 'Restringido'] as cond}
          <button 
            on:click={() => selectedCombatant && addCondition(selectedCombatant, cond)}
            class="btn btn-xs btn-outline border-warning text-neutral hover:bg-warning"
          >
            {cond}
          </button>
        {/each}
      </div>

      <div class="modal-action justify-center gap-4">
        <button 
          on:click={() => { selectedCombatant = null; newCondition = ''; }}
          class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
        >
          Cerrar
        </button>
        <button 
          on:click={() => selectedCombatant && addCondition(selectedCombatant, newCondition)}
          class="btn btn-warning"
          disabled={!newCondition.trim()}
        >
          Agregar
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Modal Agregar Combatiente -->
<AddCombatantModal 
  bind:isOpen={showAddCombatantModal}
  players={characters}
  on:add={handleAddCombatant}
  on:close={() => showAddCombatantModal = false}
/>