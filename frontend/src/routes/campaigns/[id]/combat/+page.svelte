<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { userStore } from '$lib/stores/authStore';
  import { api } from '$lib/api/api';
  import type { Campaign, Encounter, Combatant, Character } from '$lib/types';
  import CombatantCard from '$lib/components/CombatantCard.svelte';
  import AddCombatantModal from '$lib/components/AddCombatantModal.svelte';
  import HPModal from '$lib/components/HPModal.svelte';
  import ConditionModal from '$lib/components/ConditionModal.svelte';
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
  
  // Modales de gestión
  let showHPModal = false;
  let showConditionModal = false;
  let selectedCombatant: Combatant | null = null;

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
      // Actualizar selectedCombatant si está abierto un modal
      if (selectedCombatant) {
        const updated = combatants.find(c => c.id === selectedCombatant!.id);
        if (updated) selectedCombatant = updated;
      }
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

  function openHPModal(event: CustomEvent) {
    selectedCombatant = event.detail;
    showHPModal = true;
    showConditionModal = false;
  }

  function openConditionModal(event: CustomEvent) {
    selectedCombatant = event.detail;
    showConditionModal = true;
    showHPModal = false;
  }

  async function handleApplyHP(event: CustomEvent) {
    if (!selectedCombatant) return;
    try {
      const change = event.detail as number;
      const newHP = Math.max(0, Math.min(selectedCombatant.maxHp, selectedCombatant.currentHp + change));
      await api.updateCombatant(selectedCombatant.id, { currentHp: newHP });
      await loadCombatants();
      showHPModal = false;
      selectedCombatant = null;
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleAddCondition(event: CustomEvent) {
    if (!selectedCombatant) return;
    try {
      const condition = event.detail as string;
      const conditions = [...selectedCombatant.conditions, condition];
      await api.updateCombatant(selectedCombatant.id, { conditions });
      await loadCombatants();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleRemoveCondition(event: CustomEvent) {
    if (!selectedCombatant) return;
    try {
      const condition = event.detail as string;
      const conditions = selectedCombatant.conditions.filter(c => c !== condition);
      await api.updateCombatant(selectedCombatant.id, { conditions });
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
                <div class="bg-gradient-to-r from-secondary/20 to-accent/20 p-4 rounded-lg border-2 border-secondary mt-4">
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
                  on:updateHP={openHPModal}
                  on:addCondition={openConditionModal}
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
  <div class="modal modal-open z-50">
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

<!-- Modal de HP -->
<HPModal 
  bind:isOpen={showHPModal}
  combatant={selectedCombatant}
  on:apply={handleApplyHP}
  on:close={() => { showHPModal = false; selectedCombatant = null; }}
/>

<!-- Modal de Condiciones -->
<ConditionModal 
  bind:isOpen={showConditionModal}
  combatant={selectedCombatant}
  on:add={handleAddCondition}
  on:remove={handleRemoveCondition}
  on:close={() => { showConditionModal = false; selectedCombatant = null; }}
/>

<!-- Modal Agregar Combatiente -->
<AddCombatantModal 
  bind:isOpen={showAddCombatantModal}
  players={characters}
  on:add={handleAddCombatant}
  on:close={() => showAddCombatantModal = false}
/>