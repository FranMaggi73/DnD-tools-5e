<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Combatant } from '$lib/types';

  export let isOpen: boolean = false;
  export let combatant: Combatant | null = null;
  export let isDM: boolean = false;

  const dispatch = createEventDispatcher();

  let activeTab: 'hp' | 'temp' | 'death' = 'hp';
  let hpChangeValue = 0;
  let customValue = 0;
  
  // ✅ FIX: Variables locales que se actualizan del combatant
  let localTempHp = 0;
  let localDeathSaves = { successes: 0, failures: 0 };
  
  // ✅ FIX: Variable para trackear si el modal acaba de abrirse
  let lastOpenState = false;
  let lastCombatantId = '';

  // ✅ FIX: Solo actualizar cuando el modal se abre o cambia el combatiente
  $: if (isOpen && combatant) {
    // Solo actualizar si es la primera vez que se abre o cambió el combatiente
    if (!lastOpenState || lastCombatantId !== combatant.id) {
      localTempHp = combatant.temporaryHp || 0;
      localDeathSaves = combatant.deathSaves || { successes: 0, failures: 0 };
      lastCombatantId = combatant.id;
    }
    lastOpenState = true;
  } else if (!isOpen) {
    lastOpenState = false;
  }

  $: hpPercentage = combatant ? (combatant.currentHp / combatant.maxHp) * 100 : 0;
  $: hpColor = hpPercentage > 50 ? 'success' : hpPercentage > 25 ? 'warning' : 'error';
  $: newHP = combatant ? Math.max(0, Math.min(combatant.maxHp, combatant.currentHp + hpChangeValue)) : 0;
  $: hpChange = combatant ? newHP - combatant.currentHp : 0;
  $: newHpPercentage = combatant ? (newHP / combatant.maxHp) * 100 : 0;
  $: newHpColor = newHpPercentage > 50 ? 'success' : newHpPercentage > 25 ? 'warning' : 'error';
  $: isDead = combatant && combatant.currentHp <= 0;
  $: isStabilized = localDeathSaves.successes >= 3;
  $: isPermaKilled = localDeathSaves.failures >= 3;

  function setCustomDamage() {
    if (combatant && customValue > 0) {
      const change = -Math.abs(customValue);
      dispatch('apply', change);
      customValue = 0;
    }
  }

  function setCustomHeal() {
    if (combatant && customValue > 0) {
      const change = Math.abs(customValue);
      dispatch('apply', change);
      customValue = 0;
    }
  }

  function applyTempHP() {
    if (combatant && localTempHp >= 0) {
      dispatch('updateTemp', localTempHp);
    }
  }

  function removeTempHP() {
    if (combatant) {
      localTempHp = 0;
      dispatch('updateTemp', 0);
    }
  }

  function toggleDeathSave(type: 'success' | 'failure', index: number) {
    if (!combatant) return;
    
    const newSaves = { ...localDeathSaves };
    
    if (type === 'success') {
      newSaves.successes = newSaves.successes === index + 1 ? index : index + 1;
    } else {
      newSaves.failures = newSaves.failures === index + 1 ? index : index + 1;
    }
    
    localDeathSaves = newSaves;
    dispatch('updateDeathSaves', newSaves);
  }

  function resetDeathSaves() {
    if (!combatant) return;
    localDeathSaves = { successes: 0, failures: 0 };
    dispatch('updateDeathSaves', { successes: 0, failures: 0 });
  }

  function resetAndClose() {
    hpChangeValue = 0;
    customValue = 0;
    activeTab = 'hp';
    lastOpenState = false;
    lastCombatantId = '';
    dispatch('close');
  }
</script>

{#if isOpen && combatant && isDM}
  <div 
    class="modal modal-open z-50"
    role="dialog"
    aria-modal="true"
    on:keydown={(e) => e.key === 'Escape' && resetAndClose()}
  >
    <div class="card-parchment border-4 border-secondary w-11/12 max-w-2xl relative max-h-[90vh] flex flex-col">
      
      <button 
        class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10 hover:bg-error/20" 
        on:click={resetAndClose}
        aria-label="Cerrar modal"
      >✕</button>

      <!-- Header -->
      <div class="p-4 flex-shrink-0 border-b-2 border-secondary">
        <h3 class="font-bold text-2xl font-medieval text-neutral text-center mb-3">
          💚 Gestión de Vida
        </h3>
        
        <!-- Info del Combatiente -->
        <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg border border-primary/30 flex items-center gap-3">
          <div class="avatar">
            <div class="w-12 h-12 rounded-full ring-2 ring-secondary">
              <div class="bg-primary/20 flex items-center justify-center">
                <span class="text-xl">{combatant.isNpc ? '👹' : '🧙‍♂️'}</span>
              </div>
            </div>
          </div>
          <div class="flex-1">
            <h4 class="text-lg font-medieval text-neutral font-bold">{combatant.name}</h4>
            <div class="flex gap-2 mt-1">
              {#if isDead}
                <div class="badge badge-xs badge-error">💀 Caído</div>
              {:else if combatant.temporaryHp > 0}
                <div class="badge badge-xs badge-info">🛡️ +{combatant.temporaryHp} temp</div>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs tabs-boxed bg-neutral/20 p-2 flex-shrink-0">
        <button 
          class="tab flex-1 {activeTab === 'hp' ? 'tab-active' : ''}"
          on:click={() => activeTab = 'hp'}
        >
          💚 HP Normal
        </button>
        <button 
          class="tab flex-1 {activeTab === 'temp' ? 'tab-active' : ''}"
          on:click={() => activeTab = 'temp'}
        >
          🛡️ HP Temporal
        </button>
        <button 
          class="tab flex-1 {activeTab === 'death' ? 'tab-active' : ''}"
          on:click={() => activeTab = 'death'}
          disabled={!isDead}
        >
          💀 Death Saves
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4">
        
        {#if activeTab === 'hp'}
          <!-- HP Normal Tab -->
          <div class="space-y-4">
            
            <!-- HP Actual y Nuevo -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-neutral/10 p-3 rounded-lg border-2 border-primary/30">
                <p class="text-xs font-medieval text-neutral/60 text-center">HP ACTUAL</p>
                <div class="text-center">
                  <p class="text-2xl font-bold text-neutral">{combatant.currentHp}</p>
                  <p class="text-sm text-neutral/60">de {combatant.maxHp}</p>
                </div>
                <progress 
                  class="progress progress-{hpColor} w-full h-3" 
                  value={combatant.currentHp} 
                  max={combatant.maxHp}
                ></progress>
              </div>

              <div class="bg-{hpChange !== 0 ? (hpChange > 0 ? 'success' : 'error') : 'neutral'}/10 
                          p-3 rounded-lg border-2 border-{hpChange !== 0 ? (hpChange > 0 ? 'success' : 'error') : 'primary'}/30">
                <p class="text-xs font-medieval text-neutral/60 text-center">HP NUEVO</p>
                <div class="text-center">
                  <p class="text-2xl font-bold text-{hpChange !== 0 ? (hpChange > 0 ? 'success' : 'error') : 'neutral'}">
                    {newHP}
                  </p>
                  {#if hpChange !== 0}
                    <p class="text-lg font-bold text-{hpChange > 0 ? 'success' : 'error'}">
                      {hpChange > 0 ? '+' : ''}{hpChange}
                    </p>
                  {:else}
                    <p class="text-sm text-neutral/60">Sin cambios</p>
                  {/if}
                </div>
                <progress 
                  class="progress progress-{hpChange !== 0 ? newHpColor : hpColor} w-full h-3" 
                  value={newHP} 
                  max={combatant.maxHp}
                ></progress>
              </div>
            </div>

            <!-- Input de cambio -->
            <div>
              <label class="label">
                <span class="label-text font-medieval text-neutral">🎲 Cantidad de HP</span>
              </label>
              <div class="flex gap-2">
                <input 
                  type="number" 
                  bind:value={customValue}
                  placeholder="Ej: 15"
                  class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 
                         flex-1 text-center text-2xl font-bold"
                  min="0"
                />
                <div class="flex gap-2">
                  <button 
                    on:click={setCustomDamage}
                    class="btn btn-error"
                    disabled={customValue <= 0}
                  >
                    <span class="text-xl">💥</span>
                    Daño
                  </button>
                  <button 
                    on:click={setCustomHeal}
                    class="btn btn-success"
                    disabled={customValue <= 0}
                  >
                    <span class="text-xl">💚</span>
                    Curar
                  </button>
                </div>
              </div>
            </div>
          </div>

        {:else if activeTab === 'temp'}
          <!-- HP Temporal Tab -->
          <div class="space-y-4">
            <!-- HP Temporal Actual -->
            {#if combatant.temporaryHp > 0}
              <div class="bg-info/20 p-4 rounded-lg border-2 border-info/40">
                <p class="text-xs font-medieval text-neutral/60 mb-2">HP TEMPORAL ACTUAL</p>
                <div class="flex justify-between items-center">
                  <div>
                    <p class="text-3xl font-bold text-info">{combatant.temporaryHp}</p>
                    <p class="text-sm text-neutral/70">puntos de protección</p>
                  </div>
                  <button 
                    on:click={removeTempHP}
                    class="btn btn-error btn-sm"
                  >
                    🗑️ Remover
                  </button>
                </div>
              </div>
            {:else}
            <!-- Sin HP Temporal Activo -->
              <div class="text-center py-6">
                <div class="text-4xl mb-2">🛡️</div>
                <p class="text-neutral/70 font-body">Sin HP temporal activo</p>
              </div>
            {/if}
<!-- Agregar HP Temporal -->
<div>
  <label class="label">
    <span class="label-text font-medieval text-neutral">🛡️ Nuevo HP Temporal</span>
  </label>
  <div class="flex gap-2">
    <input 
      type="number" 
      bind:value={localTempHp}
      placeholder="Ej: 10"
      class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 
             flex-1 text-center text-2xl font-bold"
      min="0"
      step="1"
    />
    <button 
      on:click={applyTempHP}
      class="btn btn-info"
      disabled={localTempHp <= 0 || localTempHp === combatant?.temporaryHp}
    >
      <span class="text-xl">✨</span>
      Aplicar
    </button>
  </div>
  <label class="label">
    <span class="label-text-alt text-neutral/60 italic">
      {#if localTempHp > 0}
        💡 Esto {combatant?.temporaryHp ? 'reemplazará' : 'agregará'} {localTempHp} HP temporal
      {:else}
        Los HP temporales protegen contra el daño pero no se acumulan
      {/if}
    </span>
  </label>
</div>
          </div>

        {:else if activeTab === 'death'}
        <!-- Death Saves Tab -->
        <div class="space-y-4">
          
          {#if isPermaKilled}
            <div class="alert alert-error">
              <span class="text-lg">💀 El personaje ha muerto permanentemente</span>
            </div>
          {:else if isStabilized}
            <div class="alert alert-success">
              <span class="text-lg">✨ El personaje está estabilizado</span>
            </div>
          {/if}

          <!-- Successes -->
          <div class="bg-success/10 p-4 rounded-lg border-2 border-success/30">
            <p class="font-medieval text-neutral mb-3 flex items-center gap-2">
              <span class="text-xl">✅</span>
              Éxitos de Salvación
            </p>
            <div class="flex gap-3 justify-center">
              {#each [0, 1, 2] as index}
                <button
                  on:click={() => toggleDeathSave('success', index)}
                  class="btn btn-circle btn-lg {localDeathSaves.successes > index ? 'btn-success' : 'btn-ghost border-2 border-success/30'}"
                >
                  {#if localDeathSaves.successes > index}
                    ✓
                  {:else}
                    ○
                  {/if}
                </button>
              {/each}
            </div>
          </div>

          <!-- Failures -->
          <div class="bg-error/10 p-4 rounded-lg border-2 border-error/30">
            <p class="font-medieval text-neutral mb-3 flex items-center gap-2">
              <span class="text-xl">❌</span>
              Fallos de Salvación
            </p>
            <div class="flex gap-3 justify-center">
              {#each [0, 1, 2] as index}
                <button
                  on:click={() => toggleDeathSave('failure', index)}
                  class="btn btn-circle btn-lg {localDeathSaves.failures > index ? 'btn-error' : 'btn-ghost border-2 border-error/30'}"
                >
                  {#if localDeathSaves.failures > index}
                    ✗
                  {:else}
                    ○
                  {/if}
                </button>
              {/each}
            </div>
          </div>

          <!-- Reset -->
          <button 
            on:click={resetDeathSaves}
            class="btn btn-dnd border-2 border-neutral w-full px-4"
          >
            🔄 Resetear Death Saves
          </button>

          <!-- Reglas sin cambios -->
        </div>
        {/if}
      </div>
    </div>
  </div>
{:else if isOpen && combatant && !isDM}
  <!-- Mensaje para jugadores -->
  <div class="modal modal-open z-50">
    <div class="card-parchment border-4 border-error w-11/12 max-w-md text-center p-8">
      <div class="text-6xl mb-4">🚫</div>
      <h3 class="text-2xl font-medieval text-neutral mb-3">Acceso Denegado</h3>
      <p class="text-neutral/70 font-body mb-6">
        Solo el Dungeon Master puede gestionar los puntos de vida.
      </p>
      <button 
        on:click={resetAndClose}
        class="btn btn-dnd"
      >
        Entendido
      </button>
    </div>
  </div>
{/if}