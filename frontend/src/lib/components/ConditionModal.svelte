<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import debounce from 'lodash/debounce';
  import { open5eApi } from '$lib/api/api';
  import type { Combatant, Condition } from '$lib/types';

  export let isOpen: boolean = false;
  export let combatant: Combatant | null = null;

  const dispatch = createEventDispatcher();

  let searchQuery = '';
  let suggestions: Condition[] = [];
  let loading = false;

  // Buscar condiciones en Open5e usando la API centralizada
  const searchConditions = debounce(async () => {
    if (!searchQuery.trim()) {
      suggestions = [];
      return;
    }
    
    loading = true;
    try {
      const result = await open5eApi.searchConditions(searchQuery);
      suggestions = result.results;
    } catch (err) {
      console.error('Error searching conditions:', err);
      suggestions = [];
    } finally {
      loading = false;
    }
  }, 300);

  function addCondition(conditionName: string) {
    if (!combatant || !conditionName.trim()) return;
    
    const currentConditions = Array.isArray(combatant.conditions) ? combatant.conditions : [];
    if (currentConditions.includes(conditionName)) {
      console.log('Condición ya existe:', conditionName);
      return;
    }

    console.log('Agregando condición:', conditionName);
    dispatch('add', conditionName);
    searchQuery = '';
    suggestions = [];
  }

  function removeCondition(conditionName: string) {
    if (!combatant) return;
    console.log('Removiendo condición:', conditionName);
    dispatch('remove', conditionName);
  }

  function handleClose() {
    searchQuery = '';
    suggestions = [];
    dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    }
  }
</script>

{#if isOpen && combatant}
  <div class="modal modal-open z-50" on:keydown={handleKeydown}>
    <div class="card-parchment border-4 border-secondary w-1/2 h-5/6 mx-4 relative flex flex-col">
      <!-- Botón cerrar -->
      <button 
        class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10 hover:bg-error/20" 
        on:click={handleClose}
      >
        ✕
      </button>

      <!-- Header compacto y fijo -->
      <div class="p-4 flex-shrink-0 bg-gradient-to-b from-[#f4e4c1] to-transparent">
        <h3 class="font-bold text-2xl font-medieval text-neutral text-center mb-3">
          ⚠️ Estados de Combate
        </h3>

        <!-- Info del Combatiente - Más compacta -->
        <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg border border-primary/30 flex items-center gap-3">
          <div class="avatar">
            <div class="w-12 h-12 rounded-full ring-2 ring-secondary">
              <div class="bg-primary/20 flex items-center justify-center">
                <span class="text-xl">{combatant.isNpc ? '👹' : '🧙‍♂️'}</span>
              </div>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-lg font-medieval text-neutral font-bold truncate">{combatant.name}</h4>
            <div class="flex gap-2 mt-1">
              <div class="badge badge-xs bg-error/30 text-neutral border-error/50">
                ❤️ {combatant.currentHp}/{combatant.maxHp}
              </div>
              <div class="badge badge-xs bg-info/30 text-neutral border-info/50">
                🛡️ {combatant.armorClass}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Layout de 2 columnas - Altura fija -->
      <div class="flex-1 overflow-hidden flex flex-col md:flex-row gap-3 p-4" style="min-height: 0;">
        <!-- Columna izquierda: Estados Activos (30%) - Altura fija -->
        <div class="md:w-1/3 flex flex-col" style="min-height: 300px;">
          <div class="bg-warning/10 rounded-lg border-2 border-warning/30 p-3 flex flex-col h-full">
            <div class="flex items-center justify-between mb-3">
              <h5 class="font-medieval text-neutral font-bold flex items-center gap-2">
                <span>⚠️</span>
                <span>Estados Activos</span>
              </h5>
              <span class="badge badge-warning badge-sm">
                {combatant.conditions && Array.isArray(combatant.conditions) ? combatant.conditions.length : 0}
              </span>
            </div>

            {#if combatant.conditions && Array.isArray(combatant.conditions) && combatant.conditions.length > 0}
              <div class="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                {#each combatant.conditions as condition}
                  <div class="bg-warning/20 rounded px-3 py-2 border border-warning/40 flex items-center justify-between gap-2 hover:bg-warning/30 transition-colors">
                    <span class="font-medieval text-sm text-neutral flex-1">{condition}</span>
                    <button 
                      class="btn btn-xs btn-circle btn-ghost hover:bg-error hover:text-white"
                      on:click={() => removeCondition(condition)}
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="flex-1 flex flex-col items-center justify-center text-center py-6">
                <div class="text-3xl mb-2 opacity-50">😌</div>
                <p class="text-xs text-neutral/60 font-body italic">
                  Sin estados activos
                </p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Columna derecha: Búsqueda y Resultados (70%) - Altura fija -->
        <div class="md:w-2/3 flex flex-col" style="min-height: 300px;">
          <!-- Búsqueda -->
          <div class="mb-3">
            <div class="relative">
              <input 
                type="text" 
                bind:value={searchQuery}
                on:input={searchConditions}
                placeholder="Buscar condición (ej: blinded, poisoned, stunned)..."
                class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 w-full pr-10"
              />
              <div class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral/50">
                🔍
              </div>
            </div>
            <p class="text-xs text-neutral/50 mt-1 italic">
              Base de datos oficial de D&D 5e
            </p>
          </div>

          <!-- Resultados con scroll -->
          <div class="flex-1 overflow-y-auto custom-scrollbar bg-neutral/5 rounded-lg border border-primary/20 p-3">
            {#if loading}
              <div class="flex flex-col items-center justify-center h-full">
                <span class="loading loading-spinner loading-md text-secondary"></span>
                <p class="text-xs text-neutral/60 mt-2">Buscando...</p>
              </div>
            {:else if suggestions.length > 0}
              <div class="space-y-2">
                {#each suggestions as suggestion}
                  {@const currentConditions = Array.isArray(combatant.conditions) ? combatant.conditions : []}
                  {@const isActive = currentConditions.includes(suggestion.name)}
                  <button
                    on:click={() => addCondition(suggestion.name)}
                    disabled={isActive}
                    class="w-full text-left p-3 rounded-lg border-2 transition-all {isActive 
                      ? 'border-success/50 bg-success/10 cursor-not-allowed opacity-60' 
                      : 'border-primary/30 bg-[#f4e4c1]/50 hover:bg-[#f4e4c1] hover:border-primary/50 hover:shadow-md'
                    }"
                  >
                    <div class="flex items-start justify-between gap-2 mb-1">
                      <span class="font-medieval font-bold text-neutral">
                        {suggestion.name}
                      </span>
                      {#if isActive}
                        <span class="badge badge-xs badge-success shrink-0">✓ Activo</span>
                      {/if}
                    </div>
                    <p class="text-xs text-neutral/70 font-body leading-snug">
                      {open5eApi.cleanDescription(suggestion.desc, 120)}
                    </p>
                  </button>
                {/each}
              </div>
            {:else if searchQuery.trim()}
              <div class="flex flex-col items-center justify-center h-full text-center">
                <div class="text-4xl mb-3">🔍</div>
                <p class="text-neutral/70 font-body mb-3">
                  No se encontró "<span class="font-bold">{searchQuery}</span>"
                </p>
                <button 
                  on:click={() => addCondition(searchQuery.trim())}
                  class="btn btn-primary btn-sm"
                >
                  ➕ Agregar como personalizado
                </button>
              </div>
            {:else}
              <div class="flex flex-col items-center justify-center h-full text-center px-4">
                <div class="text-5xl mb-3">📖</div>
                <p class="text-neutral/70 font-body mb-2">
                  Escribe para buscar condiciones
                </p>
                <div class="flex flex-wrap gap-1 justify-center text-xs text-neutral/50 mt-2">
                  <span class="bg-neutral/10 px-2 py-1 rounded">blinded</span>
                  <span class="bg-neutral/10 px-2 py-1 rounded">charmed</span>
                  <span class="bg-neutral/10 px-2 py-1 rounded">frightened</span>
                  <span class="bg-neutral/10 px-2 py-1 rounded">grappled</span>
                  <span class="bg-neutral/10 px-2 py-1 rounded">paralyzed</span>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}