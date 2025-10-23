<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Combatant } from '$lib/types';

  export let isOpen: boolean = false;
  export let combatant: Combatant | null = null;

  const dispatch = createEventDispatcher();

  let hpChangeValue = 0;
  let customValue = 0;

  $: hpPercentage = combatant ? (combatant.currentHp / combatant.maxHp) * 100 : 0;
  $: hpColor = hpPercentage > 50 ? 'success' : hpPercentage > 25 ? 'warning' : 'error';
  $: newHP = combatant ? Math.max(0, Math.min(combatant.maxHp, combatant.currentHp + hpChangeValue)) : 0;
  $: hpChange = combatant ? newHP - combatant.currentHp : 0;
  $: newHpPercentage = combatant ? (newHP / combatant.maxHp) * 100 : 0;
  $: newHpColor = newHpPercentage > 50 ? 'success' : newHpPercentage > 25 ? 'warning' : 'error';

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

  function resetAndClose() {
    hpChangeValue = 0;
    customValue = 0;
    dispatch('close');
  }
</script>

{#if isOpen && combatant}
  <div class="modal modal-open z-50">
    <div class="card-parchment border-4 border-secondary mx-4 relative w-1/2 h-3/4 flex flex-col">
      <!-- Botón cerrar -->
      <button 
        class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10 hover:bg-error/20" 
        on:click={resetAndClose}
      >
        ✕
      </button>

      <!-- Header compacto -->
      <div class="p-4 flex-shrink-0 bg-gradient-to-b from-[#f4e4c1] to-transparent">
        <h3 class="font-bold text-2xl font-medieval text-neutral text-center mb-3">
          💚 Gestión de Puntos de Vida
        </h3>

        <!-- Info del Combatiente - Compacta -->
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
              {#if combatant.isNpc}
                <div class="badge badge-xs badge-error">NPC</div>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="flex-1 p-4">
        <!-- HP Actual y Nuevo en 2 columnas -->
        <div class="grid grid-cols-2">
          <!-- HP Actual -->
          <div class="bg-neutral/10 justify-center items-center flex flex-col gap-1 px-2 rounded-lg border-2 border-primary/30">
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
            <p class="text-xs text-center text-neutral/60">{hpPercentage.toFixed(0)}%</p>
          </div>

          <!-- HP Nuevo -->
          <div class="bg-{hpChange !== 0 ? (hpChange > 0 ? 'success' : 'error') : 'neutral'}/10 p-4 rounded-lg gap-1 px-2 flex flex-col justify-center items-center border-2 border-{hpChange !== 0 ? (hpChange > 0 ? 'success' : 'error') : 'primary'}/30">
            <p class="text-xs font-medieval text-neutral/60 text-center">HP NUEVO</p>
            <div class="text-center">
              <p class="text-2xl font-bold text-{hpChange !== 0 ? (hpChange > 0 ? 'success' : 'error') : 'neutral'}">{newHP}</p>
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
            <p class="text-xs text-center text-neutral/60">{newHpPercentage.toFixed(0)}%</p>
          </div>
        </div>
        <!-- Input de cambio personalizado -->
        <div>
          <label class="label">
            <span class="label-text font-medieval text-neutral">🎲 Cantidad de HP</span>
          </label>
          <div class="flex gap-2">
            <input 
              type="number" 
              bind:value={customValue}
              placeholder="Ej: 15"
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 flex-1 text-center text-2xl font-bold"
              min="0"
            />
            <button 
              on:click={setCustomDamage}
              class="btn btn-error flex-1"
              disabled={customValue <= 0}
            >
              <span class="text-xl">💥</span>
              <span class="font-medieval">Daño</span>
            </button>
            <button 
              on:click={setCustomHeal}
              class="btn btn-success flex-1"
              disabled={customValue <= 0}
            >
              <span class="text-xl">💚</span>
              <span class="font-medieval">Curar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}