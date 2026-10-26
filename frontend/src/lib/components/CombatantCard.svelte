<script lang="ts">
  import type { Combatant } from '$lib/types';
  import { createEventDispatcher } from 'svelte';
  import ConditionBadge from './ConditionBadge.svelte';

  export let combatant: Combatant;
  export let isCurrentTurn: boolean = false;
  export let isDM: boolean = false;

  const dispatch = createEventDispatcher();

  $: hpPercentage = (combatant.currentHp / combatant.maxHp) * 100;
  $: hpColor = hpPercentage > 50 ? 'success' : hpPercentage > 25 ? 'warning' : 'error';
  $: isDead = combatant.rules.lifeState === 'dead';
  const lifeLabels = { alive: 'Vivo', unconscious: 'Inconsciente', stable: 'Estable', dead: 'Muerto' };

  // Descripción del estado de salud para jugadores
  $: healthStatus = getHealthStatus(hpPercentage);

  function getHealthStatus(percentage: number): { label: string; icon: string; color: string } {
    if (percentage <= 0) return { label: 'Caído', icon: '💀', color: 'text-error' };
    if (percentage < 25) return { label: 'Gravemente herido', icon: '🩸', color: 'text-error' };
    if (percentage < 50) return { label: 'Herido', icon: '🤕', color: 'text-warning' };
    if (percentage < 75) return { label: 'Lastimado', icon: '😣', color: 'text-warning' };
    if (percentage < 100) return { label: 'Ligeramente herido', icon: '😐', color: 'text-success' };
    return { label: 'Ileso', icon: '💪', color: 'text-success' };
  }

  function handleUpdateHP() {
    dispatch('updateHP', combatant);
  }

  function handleAddCondition() {
    dispatch('addCondition', combatant);
  }

  function selectMenu(event: MouseEvent, action: 'remove' | 'visibility') {
    (event.currentTarget as HTMLElement).closest('details')?.removeAttribute('open');
    dispatch(action, combatant);
  }
</script>

<div 
  class="card-parchment corner-ornament relative {isCurrentTurn ? 'ring-4 ring-secondary animate-pulse' : ''} {isDead ? 'opacity-50' : ''}"
>
  {#if isCurrentTurn}
    <div class="absolute -top-3 -right-3 badge badge-ornate text-sm sm:text-lg animate-bounce z-10">
      ⚔️ SU TURNO
    </div>
  {/if}

  {#if isDead}
    <div class="absolute inset-0 bg-error/20 flex items-center justify-center -z-10 rounded-lg">
      <span class="text-4xl sm:text-6xl">💀</span>
    </div>
  {/if}

  <div class="card-body p-3 sm:p-4">
    <div class="flex flex-wrap gap-1 text-xs text-neutral" aria-live="polite">
      {#if combatant.rules.lifeState !== 'alive'}<span class="badge badge-error">{lifeLabels[combatant.rules.lifeState]}</span>{/if}
      {#if combatant.rules.exhaustion}<span class="badge badge-warning">Agotamiento {combatant.rules.exhaustion} · d20 −{2 * combatant.rules.exhaustion}</span>{/if}
      {#if combatant.rules.concentrationSaveDC !== null}<span class="badge badge-warning">Concentración pendiente CD {combatant.rules.concentrationSaveDC}</span>{/if}
    </div>
<div class="flex gap-1 text-xs">{#if combatant.hidden}<span class="badge badge-warning">Oculto</span>{/if}{#if combatant.hideStats}<span class="badge badge-outline">Estadísticas reservadas</span>{/if}{#if combatant.notes}<span class="badge badge-outline" title={combatant.notes}>📝 Notas DM</span>{/if}</div>
    <!-- Header -->
    <div class="flex items-start gap-2 sm:gap-3">
      <div class="avatar flex-shrink-0">
        <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full ring-2 {isCurrentTurn ? 'ring-secondary' : 'ring-primary/50'}">
          <div class="bg-primary/20 flex items-center justify-center">
            <span class="text-xl sm:text-2xl">{combatant.isNpc ? '👹' : '🧙‍♂️'}</span>
          </div>
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <h3 class="font-medieval text-base sm:text-lg text-neutral font-bold truncate">{combatant.name}</h3>
        <div class="flex flex-wrap gap-1 sm:gap-2 mt-1">
          <!-- Iniciativa - VISIBLE PARA TODOS -->
          <div class="badge badge-xs sm:badge-sm bg-primary/30 text-neutral border-primary/50">
            🎲 {combatant.initiative}
          </div>
          
          <!-- AC - SOLO DM -->
          {#if isDM}
            <div class="badge badge-xs sm:badge-sm bg-info/30 text-neutral border-info/50">
              🛡️ AC {combatant.armorClass}
            </div>
          {/if}
        </div>
      </div>

      {#if isDM}
        <details class="dropdown dropdown-end flex-shrink-0">
          <summary class="btn btn-ghost btn-xs btn-circle list-none" aria-label={`Opciones de ${combatant.name}`}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </summary>
          <ul class="dropdown-content z-20 menu p-2 shadow bg-neutral rounded-box w-44 sm:w-52 border-2 border-secondary text-sm">
            <li><button type="button" on:click={(event) => selectMenu(event, 'visibility')} class="text-secondary">👁️ Visibilidad y notas</button></li>
            <li><button type="button" on:click={(event) => selectMenu(event, 'remove')} class="text-error">🗑️ Eliminar</button></li>
          </ul>
        </details>
      {/if}
    </div>

      <div class="flex items-center gap-2 h-8 shrink-0" aria-label="Concentración e inspiración">
        {#if combatant.rules.concentration}
          <span class="badge h-auto rounded-full border border-info/60 bg-info/20 text-neutral px-2 py-1 text-base" tabindex="0" title={`Concentración: ${combatant.rules.concentration}`} aria-label={`Concentración: ${combatant.rules.concentration}`}>🔮</span>
        {/if}
        {#if combatant.rules.heroicInspiration}
          <span class="badge h-auto rounded-full border border-secondary bg-secondary/30 text-neutral px-2 py-1 text-base" tabindex="0" title="Inspiración heroica disponible" aria-label="Inspiración heroica disponible">✨</span>
        {/if}
      </div>

    <!-- HP - DIFERENTE PARA DM Y JUGADORES -->
<div class="mt-2 sm:mt-3">
  {#if isDM}
    <!-- Vista DM: HP exacto con barra -->
    <div class="flex justify-between items-center mb-1">
      <span class="text-xs font-medieval text-neutral/70">Puntos de Vida</span>
      <div class="flex items-center gap-1">
        <span class="font-bold text-neutral text-sm sm:text-base">{combatant.currentHp}/{combatant.maxHp}</span>
      </div>
    </div>
    <progress 
      class="progress progress-{hpColor} w-full h-2 sm:h-3" 
      value={combatant.currentHp} 
      max={combatant.maxHp}
    ></progress>
    
  {:else}
    <!-- Vista Jugador: Estado descriptivo -->
    <div class="bg-{hpColor}/10 p-2 rounded-lg border border-{hpColor}/30">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-medieval text-neutral/70">Estado</span>
        <div class="flex items-center gap-1">
          <span class="text-lg sm:text-xl">{healthStatus.icon}</span>
          <span class="font-medieval text-xs sm:text-sm {healthStatus.color} font-bold">
            {healthStatus.label}
          </span>
        </div>
      </div>
      <!-- Barra visual aproximada (sin números) -->
      <div class="w-full bg-neutral/20 rounded-full h-1.5 sm:h-2 mt-1">
        <div 
          class="bg-{hpColor} h-full rounded-full transition-all duration-300"
          style="width: {hpPercentage}%"
        ></div>
      </div>
    </div>
  {/if}
  <div class="mt-2">
    <div class="flex justify-between items-center gap-2 mb-1">
      <span class="text-xs font-medieval text-neutral/70">HP temporales</span>
      <span class="badge badge-xs border-info/50 bg-info/20 text-neutral">🛡️ {combatant.temporaryHp}</span>
    </div>
    <progress class="progress progress-info w-full h-1.5 bg-info/20" aria-label="HP temporales" max={isDM ? combatant.maxHp : 3} value={isDM ? combatant.temporaryHp : combatant.temporaryHp > 0 ? 1 : 0}></progress>
  </div>
</div>
    <!-- Condiciones - VISIBLE PARA TODOS -->
      <div class="mt-2 p-2 rounded-lg border border-warning/30 bg-warning/10">
        <span class="text-xs font-medieval text-neutral/70 block mb-1">Condiciones</span>
        {#if combatant.conditions && combatant.conditions.length > 0}
        <div class="flex flex-wrap items-center gap-1 min-h-8">
          {#each combatant.conditions as condition}
            <ConditionBadge {condition} />
          {/each}
        </div>
        {:else}
          <p class="text-sm text-neutral/70 min-h-8 flex items-center">Sin condiciones</p>
        {/if}
      </div>

    {#if isDM}<button type="button" class="btn btn-sm btn-outline border-primary/60 text-neutral w-full mt-2" aria-label={`Ver ficha de ${combatant.name}`} on:click={()=>dispatch('viewSheet',combatant)}>📋 Ver ficha</button>{/if}
    <!-- Actions (DM only) -->
    {#if isDM}
      <div class="flex gap-2 mt-3">
        <button 
          on:click={handleUpdateHP}
          class="btn btn-xs sm:btn-sm btn-success flex-1"
        >
          💚 HP
        </button>
        <button 
          on:click={handleAddCondition}
          class="btn btn-xs sm:btn-sm btn-warning flex-1"
        >
          ⚠️ Estado
        </button>
      </div>
    {/if}
  </div>
</div>
