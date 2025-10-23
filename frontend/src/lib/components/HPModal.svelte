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

  function setQuickValue(value: number) {
    hpChangeValue = value;
  }

  function setCustomDamage() {
    if (customValue > 0) {
      hpChangeValue = -Math.abs(customValue);
      customValue = 0;
    }
  }

  function setCustomHeal() {
    if (customValue > 0) {
      hpChangeValue = Math.abs(customValue);
      customValue = 0;
    }
  }

  function setToMax() {
    if (combatant) {
      hpChangeValue = combatant.maxHp - combatant.currentHp;
    }
  }

  function setToZero() {
    if (combatant) {
      hpChangeValue = -combatant.currentHp;
    }
  }

  function handleApply() {
    if (hpChangeValue !== 0) {
      dispatch('apply', hpChangeValue);
      resetAndClose();
    }
  }

  function resetAndClose() {
    hpChangeValue = 0;
    customValue = 0;
    dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      resetAndClose();
    } else if (e.key === 'Enter' && hpChangeValue !== 0) {
      handleApply();
    }
  }
</script>

{#if isOpen && combatant}
  <div class="modal modal-open z-50" on:keydown={handleKeydown}>
    <div class="modal-box card-parchment border-4 border-secondary max-w-2xl">
      <button 
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
        on:click={resetAndClose}
      >
        ✕
      </button>

      <h3 class="font-bold text-3xl font-medieval text-neutral mb-6 text-center">
        💚 Gestión de HP
      </h3>

      <!-- Info del Combatiente -->
      <div class="bg-gradient-to-r from-primary/20 to-accent/20 p-4 rounded-lg border-2 border-primary/30 mb-6">
        <div class="flex items-center gap-4 mb-3">
          <div class="avatar">
            <div class="w-16 h-16 rounded-full ring-2 ring-secondary ring-offset-2 ring-offset-[#f4e4c1]">
              <div class="bg-primary/20 flex items-center justify-center">
                <span class="text-3xl">{combatant.isNpc ? '👹' : '🧙‍♂️'}</span>
              </div>
            </div>
          </div>
          <div class="flex-1">
            <h4 class="text-2xl font-medieval text-neutral font-bold">{combatant.name}</h4>
            <div class="flex gap-2 mt-1">
              <div class="badge badge-sm bg-info/30 text-neutral border-info/50">
                🛡️ AC {combatant.armorClass}
              </div>
              {#if combatant.isNpc}
                <div class="badge badge-sm badge-error">NPC</div>
              {/if}
            </div>
          </div>
        </div>

        <!-- HP Actual -->
        <div class="bg-neutral/20 p-3 rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medieval text-neutral/70">HP Actual</span>
            <span class="text-3xl font-bold text-neutral">{combatant.currentHp} / {combatant.maxHp}</span>
          </div>
          <progress 
            class="progress progress-{hpColor} w-full h-4" 
            value={combatant.currentHp} 
            max={combatant.maxHp}
          ></progress>
        </div>
      </div>
      <!-- Preview del cambio -->
      {#if hpChangeValue !== 0}
        <div class="bg-gradient-to-r from-{hpChange > 0 ? 'success' : 'error'}/20 to-{hpChange > 0 ? 'success' : 'error'}/10 p-4 rounded-lg border-2 border-{hpChange > 0 ? 'success' : 'error'}/50 mb-4">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm font-medieval text-neutral/70">Nuevo HP</p>
              <p class="text-4xl font-bold text-neutral">{newHP}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medieval text-neutral/70">Cambio</p>
              <p class="text-4xl font-bold text-{hpChange > 0 ? 'success' : 'error'}">
                {hpChange > 0 ? '+' : ''}{hpChange}
              </p>
            </div>
          </div>
          <progress 
            class="progress progress-{hpChange > 0 ? 'success' : 'error'} w-full h-4 mt-2" 
            value={newHP} 
            max={combatant.maxHp}
          ></progress>
        </div>
      {/if}

      <!-- Valor Personalizado -->
      <div class="mb-4">
        <p class="text-sm font-medieval text-neutral/70 mb-2">🎲 Cambiar vida</p>
        <div class="flex gap-2">
          <input 
            type="number" 
            bind:value={customValue}
            placeholder="Ingresa cantidad..."
            class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 flex-1"
            min="0"
          />
          <button 
            on:click={setCustomDamage}
            class="btn btn-error"
            disabled={customValue <= 0}
          >
            💥 Daño
          </button>
          <button 
            on:click={setCustomHeal}
            class="btn btn-success"
            disabled={customValue <= 0}
          >
            💚 Curar
          </button>
        </div>
      </div>
      <!-- Acciones Extremas -->
      <div class="grid grid-cols-2 gap-2 mb-6">
        <button 
          on:click={setToMax}
          class="btn btn-outline border-2 border-success text-neutral hover:bg-success hover:text-white font-medieval"
        >
          ✨ HP Máximo
        </button>
        <button 
          on:click={setToZero}
          class="btn btn-outline border-2 border-error text-neutral hover:bg-error hover:text-white font-medieval"
        >
          💀 HP a 0
        </button>
      </div>

      <!-- Botones de Acción -->
      <div class="modal-action justify-center gap-4">
        <button 
          on:click={resetAndClose}
          class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
        >
          Cancelar
        </button>
        <button 
          on:click={handleApply}
          class="btn btn-dnd btn-lg"
          disabled={hpChangeValue === 0}
        >
          <span class="text-xl">⚔️</span>
          Aplicar Cambio
        </button>
      </div>

      <p class="text-xs text-center text-neutral/50 mt-4 italic">
        Presiona Enter para aplicar • Escape para cancelar
      </p>
    </div>
  </div>
{/if}