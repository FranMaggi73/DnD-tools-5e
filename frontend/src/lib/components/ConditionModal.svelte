<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Combatant } from '$lib/types';
  import { CONDITION_NAMES, CONDITION_INFO, conditionIcon, type ConditionName } from '$lib/rules/2024';
  export let isOpen = false;
  export let combatant: Combatant | null = null;
  export let isDM = false;
  export let busy = false;
  export let error = '';
  let searchQuery = '';
  let source = '';
  let rounds = 0;
  let expires: 'start' | 'end' = 'end';
  const dispatch = createEventDispatcher();
  const label = (name: string) => CONDITION_INFO[name as ConditionName]?.label || name;
  const searchable = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  $: results = CONDITION_NAMES.filter(name => searchable(`${name} ${label(name)}`).includes(searchable(searchQuery.trim())));
  $: validDuration = Number.isInteger(rounds) && rounds >= 0 && rounds <= 1000000;
  function close() {
    if (busy) return;
    searchQuery = ''; source = ''; rounds = 0; expires = 'end';
    dispatch('close');
  }
  function toggleCondition(condition: ConditionName) {
    if (busy || !combatant) return;
    if (combatant.conditions.includes(condition)) dispatch('remove', condition);
    else if (validDuration) dispatch('add', { condition, source, rounds: rounds === 0 ? null : rounds, expires });
  }
</script>
<svelte:window on:keydown={(event) => { if (isOpen && event.key === 'Escape') close(); }} />
{#if isOpen && combatant}
  <div class="modal modal-open z-50" role="dialog" aria-modal="true" aria-labelledby="condition-modal-title">
    <div class="card-parchment border-2 sm:border-4 border-secondary w-full sm:w-11/12 max-w-5xl h-[92dvh] md:h-[82dvh] relative flex flex-col !overflow-hidden text-neutral">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10 hover:bg-error/20" aria-label="Cerrar modal" disabled={busy} on:click={close}>✕</button>
      <header class="p-3 sm:p-4 shrink-0 bg-gradient-to-b from-[#f4e4c1] to-transparent">
        <h2 id="condition-modal-title" class="font-bold text-xl sm:text-2xl font-medieval text-center mb-3 pr-9">⚠️ Estados de Combate</h2>
        <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg border border-primary/30 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full ring-2 ring-secondary bg-primary/20 flex items-center justify-center shrink-0 text-xl">{combatant.isNpc ? '👹' : '🧙‍♂️'}</div>
          <div class="min-w-0 flex-1">
            <h3 class="font-medieval font-bold truncate">{combatant.name}</h3>
            <div class="flex flex-wrap gap-2 mt-1">
              <span class="badge badge-xs bg-error/30 text-neutral border-error/50">❤️ {combatant.currentHp}/{combatant.maxHp}</span>
              <span class="badge badge-xs bg-info/30 text-neutral border-info/50">🛡️ {combatant.armorClass}</span>
            </div>
          </div>
        </div>
        {#if error}<p class="text-error text-sm mt-2" role="alert">{error}</p>{/if}
      </header>

      <div class="flex-1 min-h-0 overflow-y-auto md:overflow-hidden flex flex-col md:flex-row gap-3 px-3 pb-3 sm:px-4 sm:pb-4">
        <section class="md:w-1/3 shrink-0 md:shrink flex flex-col min-h-0" aria-label="Estados activos">
          <div class="bg-warning/10 rounded-lg border-2 border-warning/30 p-3 flex flex-col md:h-full min-h-0">
            <div class="flex items-center justify-between gap-2 mb-2">
              <h3 class="font-medieval font-bold text-sm">⚠️ Estados Activos</h3>
              <span class="badge badge-warning badge-sm">{combatant.conditions.length}</span>
            </div>
            {#if combatant.conditions.length}
              <ul class="space-y-2 overflow-y-auto max-h-36 md:max-h-none md:flex-1 min-h-0">
                {#each combatant.conditions as name}
                  <li class="bg-warning/20 rounded px-2 py-2 border border-warning/40 flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1">
                      <span class="font-medieval text-sm inline-flex items-center gap-2"><span class="text-xl" aria-hidden="true">{conditionIcon(name)}</span>{label(name)}</span>
                      {#each combatant.rules.effects.filter(effect => effect.condition === name) as effect}
                        <p class="text-xs text-neutral/70 break-words">{effect.source || 'Sin origen indicado'} · {effect.rounds === null ? 'Final manual' : `${effect.rounds} turnos, al ${effect.expires === 'start' ? 'inicio' : 'final'}`}</p>
                      {/each}
                    </div>
                    {#if isDM}<button class="btn btn-xs btn-circle btn-ghost shrink-0 hover:bg-error hover:text-white" disabled={busy} aria-label={`Quitar ${label(name)}`} on:click={() => dispatch('remove', name)}>✕</button>{/if}
                  </li>
                {/each}
              </ul>
            {:else}
              <div class="flex-1 text-center py-3 md:py-8"><div class="text-3xl opacity-50 mb-1">😌</div><p class="text-xs text-neutral/60 italic">Sin estados activos</p></div>
            {/if}
          </div>
        </section>

        {#if isDM}
          <section class="md:w-2/3 flex flex-col min-h-0 shrink-0 md:shrink" aria-label="Buscar condiciones">
            <div class="relative mb-1">
              <input type="search" bind:value={searchQuery} aria-label="Buscar condición" placeholder="Buscar condición…" class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 w-full pr-10" />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">🔍</span>
            </div>
            <p class="text-xs text-neutral/60 mb-2">Reglas 2024 · Buscá en español o inglés. Tocá una tarjeta para activar o quitar la condición.</p>

            <details class="rounded-lg border border-primary/20 bg-primary/5 mb-3">
              <summary class="cursor-pointer text-sm font-medieval p-3">Origen y duración <span class="font-body text-neutral/60">· {rounds === 0 ? 'final manual' : `${rounds} turnos`}</span></summary>
              <fieldset disabled={busy} class="space-y-2 px-3 pb-3">
                <label class="form-control text-sm">Origen o efecto <input bind:value={source} maxlength="100" class="input input-bordered input-sm bg-[#2d241c] text-base-content" placeholder="Ej.: red, veneno, conjuro" /></label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label class="form-control text-sm">Turnos propios (0 = manual) <input type="number" min="0" max="1000000" bind:value={rounds} class="input input-bordered input-sm bg-[#2d241c] text-base-content" /></label>
                  <label class="form-control text-sm">Contar al <select bind:value={expires} class="select select-bordered select-sm bg-[#2d241c] text-base-content"><option value="start">Inicio de su turno</option><option value="end">Final de su turno</option></select></label>
                </div>
              </fieldset>
            </details>

            <div class="md:flex-1 min-h-0 md:overflow-y-auto bg-neutral/5 rounded-lg border border-primary/20 p-2 sm:p-3">
              <div class="space-y-2">
                {#each results as name}
                  {@const active = combatant.conditions.includes(name)}
                  <button on:click={() => toggleCondition(name)} aria-pressed={active} disabled={busy || (!active && !validDuration)} class="w-full text-left p-3 rounded-lg border-2 transition-colors disabled:opacity-50 {active ? 'border-success/50 bg-success/10' : 'border-primary/30 bg-[#f4e4c1]/50 hover:bg-[#f4e4c1] hover:border-primary/50'}">
                    <div class="flex flex-wrap items-start justify-between gap-2 mb-1">
                      <span class="font-medieval font-bold text-sm inline-flex items-center gap-2"><span class="text-xl" aria-hidden="true">{conditionIcon(name)}</span>{label(name)}</span>
                      {#if active}<span class="badge badge-xs badge-success">✓ Activo · tocar para quitar</span>{:else}<span class="text-primary text-sm" aria-hidden="true">＋</span>{/if}
                    </div>
                    <p class="text-xs text-neutral/70 font-body leading-snug">{CONDITION_INFO[name].description}</p>
                  </button>
                {:else}
                  <div class="text-center py-8"><div class="text-3xl mb-2">🔍</div><p class="text-sm text-neutral/70">No se encontró «{searchQuery}».</p></div>
                {/each}
              </div>
            </div>
            <p class="text-xs text-neutral/60 mt-2">Las tiradas para terminar efectos se resuelven en la mesa. El agotamiento está en Vida y estados.</p>
          </section>
        {:else}
          <p class="text-sm text-neutral/60 self-center p-4">Solo el DM puede modificar estados.</p>
        {/if}
      </div>
    </div>
  </div>
{/if}
