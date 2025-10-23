<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Combatant } from '$lib/types';

  export let isOpen: boolean = false;
  export let combatant: Combatant | null = null;

  const dispatch = createEventDispatcher();

  let newCondition = '';
  let searchQuery = '';

  // Condiciones de D&D 5e con descripciones
  const conditions = [
    { name: 'Cegado', icon: '👁️', description: 'No puede ver, falla automáticamente chequeos de vista', category: 'Sentidos' },
    { name: 'Encantado', icon: '💫', description: 'No puede atacar al encantador', category: 'Mental' },
    { name: 'Ensordecido', icon: '👂', description: 'No puede oír, falla chequeos de audición', category: 'Sentidos' },
    { name: 'Asustado', icon: '😱', description: 'Desventaja en ataques y chequeos mientras ve la fuente', category: 'Mental' },
    { name: 'Agarrado', icon: '🤝', description: 'Velocidad 0, no puede beneficiarse de bonos de velocidad', category: 'Movimiento' },
    { name: 'Incapacitado', icon: '😵', description: 'No puede realizar acciones o reacciones', category: 'Grave' },
    { name: 'Invisible', icon: '👻', description: 'Imposible de ver sin magia o sentidos especiales', category: 'Ventaja' },
    { name: 'Paralizado', icon: '🥶', description: 'Incapacitado, no puede moverse ni hablar', category: 'Grave' },
    { name: 'Petrificado', icon: '🗿', description: 'Transformado en piedra, incapacitado', category: 'Grave' },
    { name: 'Envenenado', icon: '🤢', description: 'Desventaja en ataques y chequeos de habilidad', category: 'Debilitante' },
    { name: 'Postrado', icon: '🤕', description: 'Solo puede arrastrarse, desventaja en ataques', category: 'Movimiento' },
    { name: 'Restringido', icon: '⛓️', description: 'Velocidad 0, desventaja en DEX, ventaja a atacantes', category: 'Grave' },
    { name: 'Aturdido', icon: '😵‍💫', description: 'Incapacitado, no puede moverse, solo balbucea', category: 'Grave' },
    { name: 'Inconsciente', icon: '💤', description: 'Incapacitado, postrado, suelta lo que sostiene', category: 'Grave' },
    { name: 'Exhausto', icon: '😮‍💨', description: 'Efectos acumulativos de cansancio (1-6)', category: 'Debilitante' },
    { name: 'Concentración', icon: '🎯', description: 'Manteniendo un hechizo o efecto', category: 'Ventaja' },
    { name: 'Bendicido', icon: '✨', description: 'Bono en ataques y salvaciones', category: 'Ventaja' },
    { name: 'Maldito', icon: '😈', description: 'Penalización en ataques y salvaciones', category: 'Debilitante' },
    { name: 'Enfermedad', icon: '🦠', description: 'Sufre los efectos de una enfermedad', category: 'Debilitante' },
    { name: 'Sorprendido', icon: '😲', description: 'No puede moverse ni actuar en el primer turno', category: 'Temporal' },
  ];

  $: filteredConditions = searchQuery.trim() 
    ? conditions.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conditions;

  $: conditionsByCategory = filteredConditions.reduce((acc, condition) => {
    if (!acc[condition.category]) {
      acc[condition.category] = [];
    }
    acc[condition.category].push(condition);
    return acc;
  }, {} as Record<string, Array<typeof conditions[0]>>);

  function addCondition(conditionName: string) {
    if (combatant && conditionName.trim() && !combatant.conditions.includes(conditionName)) {
      dispatch('add', conditionName);
    }
  }

  function removeCondition(conditionName: string) {
    if (combatant) {
      dispatch('remove', conditionName);
    }
  }

  function addCustomCondition() {
    if (newCondition.trim()) {
      addCondition(newCondition.trim());
      newCondition = '';
    }
  }

  function handleClose() {
    newCondition = '';
    searchQuery = '';
    dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'Enter' && newCondition.trim()) {
      addCustomCondition();
    }
  }

  const categoryColors: Record<string, string> = {
    'Sentidos': 'info',
    'Mental': 'secondary',
    'Movimiento': 'warning',
    'Grave': 'error',
    'Ventaja': 'success',
    'Debilitante': 'warning',
    'Temporal': 'accent',
  };
</script>

{#if isOpen && combatant}
  <div class="modal modal-open z-50" on:keydown={handleKeydown}>
    <div class="card-parchment border-4 border-secondary max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden flex flex-col">
      <button 
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
        on:click={handleClose}
      >
        ✕
      </button>

      <h3 class="font-bold text-3xl font-medieval text-neutral mb-4 text-center">
        ⚠️ Gestión de Estados
      </h3>

      <!-- Info del Combatiente -->
      <div class="bg-gradient-to-r from-primary/20 to-accent/20 p-4 rounded-lg border-2 border-primary/30 mb-4">
        <div class="flex items-center gap-3">
          <div class="avatar">
            <div class="w-14 h-14 rounded-full ring-2 ring-secondary ring-offset-2 ring-offset-[#f4e4c1]">
              <div class="bg-primary/20 flex items-center justify-center">
                <span class="text-2xl">{combatant.isNpc ? '👹' : '🧙‍♂️'}</span>
              </div>
            </div>
          </div>
          <div class="flex-1">
            <h4 class="text-xl font-medieval text-neutral font-bold">{combatant.name}</h4>
            <div class="flex gap-2 mt-1">
              <div class="badge badge-sm bg-error/30 text-neutral border-error/50">
                ❤️ {combatant.currentHp}/{combatant.maxHp}
              </div>
              <div class="badge badge-sm bg-info/30 text-neutral border-info/50">
                🛡️ AC {combatant.armorClass}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Condiciones Activas -->
      {#if combatant.conditions && combatant.conditions.length > 0}
        <div class="bg-warning/10 p-4 rounded-lg border-2 border-warning/30 mb-4">
          <p class="text-sm font-medieval text-neutral/70 mb-2 flex items-center gap-2">
            <span class="text-lg">⚠️</span>
            Estados Activos ({combatant.conditions.length})
          </p>
          <div class="flex flex-wrap gap-2">
            {#each combatant.conditions as condition}
              {@const conditionData = conditions.find(c => c.name === condition)}
              <div class="badge badge-warning badge-lg gap-2 p-3">
                {#if conditionData}
                  <span>{conditionData.icon}</span>
                {/if}
                <span class="font-medieval">{condition}</span>
                <button 
                  class="btn btn-xs btn-circle btn-ghost hover:bg-error hover:text-white"
                  on:click={() => removeCondition(condition)}
                  title="Eliminar estado"
                >
                  ✕
                </button>
              </div>
            {/each}
          </div>
        </div>
        <div class="divider text-neutral/50">⚔️</div>
      {/if}

      <!-- Búsqueda y Condición Personalizada -->
      <div class="mb-4 space-y-2">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medieval text-neutral">🔍 Buscar Estado</span>
          </label>
          <input 
            type="text" 
            bind:value={searchQuery}
            placeholder="Buscar por nombre, descripción o categoría..."
            class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
          />
        </div>
      </div>

      <!-- Lista de Condiciones por Categoría -->
      <div class="flex-1 overflow-y-auto pr-2 space-y-3">
        {#if Object.keys(conditionsByCategory).length === 0}
          <div class="text-center py-8">
            <p class="text-neutral/70 font-body">No se encontraron estados con "{searchQuery}"</p>
          </div>
        {:else}
          {#each Object.entries(conditionsByCategory) as [category, categoryConditions]}
            <div class="bg-neutral/10 rounded-lg p-3 border border-primary/20">
              <h4 class="font-medieval text-neutral font-bold mb-2 flex items-center gap-2">
                <span class="badge badge-{categoryColors[category] || 'neutral'} badge-sm">{category}</span>
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                {#each categoryConditions as condition}
                  {@const isActive = combatant.conditions && combatant.conditions.includes(condition.name)}
                  <button
                    on:click={() => isActive ? removeCondition(condition.name) : addCondition(condition.name)}
                    class="btn btn-sm justify-start h-auto py-3 {isActive ? 'btn-warning' : 'btn-ghost border-primary/30'} hover:bg-primary/20"
                    disabled={isActive}
                  >
                    <div class="text-left w-full">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-lg">{condition.icon}</span>
                        <span class="font-medieval font-bold">{condition.name}</span>
                        {#if isActive}
                          <span class="badge badge-xs badge-success">Activo</span>
                        {/if}
                      </div>
                      <p class="text-xs text-neutral/60 font-body leading-tight">{condition.description}</p>
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <!-- Footer -->
      <div class="modal-action justify-center pt-4 border-t-2 border-primary/30 mt-4">
        <button 
          on:click={handleClose}
          class="btn btn-dnd btn-lg"
        >
          <span class="text-xl">✓</span>
          Listo
        </button>
      </div>

      <p class="text-xs text-center text-neutral/50 mt-2 italic">
        Presiona Enter para agregar personalizado • Escape para cerrar
      </p>
    </div>
  </div>
{/if}

<style>
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: rgba(139, 69, 19, 0.1);
    border-radius: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #8B4513, #654321);
    border-radius: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #A0522D, #8B4513);
  }
</style>