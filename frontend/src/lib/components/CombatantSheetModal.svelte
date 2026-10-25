<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { doc, onSnapshot } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { fromDoc } from '$lib/api/firestore';
  import { open5eApi } from '$lib/api/api';
  import type { Character, Combatant, Monster, MonsterSummary } from '$lib/types';
  import { characterInCombat, isLinkedCharacter } from '$lib/utils/combatSheet';
  import CharacterCard from './CharacterCard.svelte';
  import MonsterSheet from './MonsterSheet.svelte';
  import ConditionBadge from './ConditionBadge.svelte';
  export let combatant: Combatant;
  const dispatch = createEventDispatcher();
  let character: Character | null = null;
  let monster: Monster | null = null;
  let loading = true;
  let error = '';
  let query = '';
  let choices: MonsterSummary[] = [];
  let loadedId = '';
  let request = 0;
  let unsubscribe: (() => void) | undefined;
  $: sheetCharacter = character && isLinkedCharacter(combatant, character) ? characterInCombat(character, combatant) : null;
  $: if (combatant.id !== loadedId) {
    loadedId = combatant.id;
    load();
  }
  onDestroy(() => { request++; unsubscribe?.(); });
  function load() {
    request++; unsubscribe?.(); unsubscribe = undefined;
    loading = true; error = ''; character = null; monster = null; choices = []; query = combatant.name;
    if (combatant.characterId) {
      const token = request;
      unsubscribe = onSnapshot(doc(db, 'characters', combatant.characterId), snapshot => {
        if (token !== request) return;
        character = snapshot.exists() ? fromDoc<Character>(snapshot) : null;
        error = !character || !isLinkedCharacter(combatant, character) ? 'El personaje original ya no está disponible. Se muestra el estado guardado en el combate.' : '';
        loading = false;
      }, () => { if (token === request) { error = 'No se pudo cargar la ficha del personaje.'; loading = false; } });
    } else if (combatant.monsterSlug) loadMonster(combatant.monsterSlug);
    else search(true);
  }
  async function loadMonster(slug: string) {
    const token = ++request;
    loading = true; error = ''; monster = null; choices = [];
    try { const value = await open5eApi.getMonster(slug); if (token === request) monster = value; }
    catch { if (token === request) error = 'No se pudo cargar la referencia del catálogo. Podés volver a buscarla.'; }
    finally { if (token === request) loading = false; }
  }
  async function search(auto = false) {
    if (!query.trim()) return;
    const token = ++request;
    loading = true; error = ''; monster = null; choices = [];
    try {
      const result = await open5eApi.searchMonsters(query);
      if (token !== request) return;
      const exact = result.results.filter(entry => entry.name.toLowerCase() === query.trim().toLowerCase());
      if (auto && exact.length === 1) { await loadMonster(exact[0].slug); return; }
      choices = result.results;
      if (!choices.length) error = 'No se encontró una ficha de referencia. Se muestran los datos registrados en el combate.';
    } catch { if (token === request) error = 'No se pudo cargar el catálogo. Se muestran los datos registrados en el combate.'; }
    finally { if (token === request) loading = false; }
  }
</script>

<svelte:window on:keydown={(event) => { if (event.key === 'Escape') dispatch('close'); }} />
<div class="modal modal-open z-[60]" role="dialog" aria-modal="true" aria-labelledby="combatant-sheet-title">
  <div class="card-parchment border-2 sm:border-4 border-secondary w-full sm:w-11/12 max-w-4xl h-[92dvh] flex flex-col !overflow-hidden text-neutral relative">
    <header class="p-3 sm:p-4 border-b border-primary/30 shrink-0 flex items-center justify-between gap-2">
      <h2 id="combatant-sheet-title" class="font-medieval text-lg sm:text-2xl min-w-0 break-words">📋 Ficha: {combatant.name}</h2>
      <button class="btn btn-sm btn-circle btn-ghost shrink-0" aria-label="Cerrar ficha" on:click={() => dispatch('close')}>✕</button>
    </header>
    <div class="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
      {#if error}<p role="status" class="text-sm rounded border border-warning/40 bg-warning/10 p-3">{error}</p>{/if}
      {#if loading}<div class="flex items-center gap-2 py-6 justify-center" role="status"><span class="loading loading-spinner loading-sm"></span> Cargando ficha…</div>{/if}
      {#if sheetCharacter}
        <CharacterCard character={sheetCharacter} isOwner={false} />
      {:else if monster}
        <MonsterSheet {monster} {combatant} />
      {:else if !loading}
        <div class="grid grid-cols-3 gap-2 text-center text-sm">
          <div class="border border-primary/30 rounded p-2"><p>HP</p><strong>{combatant.currentHp}/{combatant.maxHp}</strong></div>
          <div class="border border-primary/30 rounded p-2"><p>CA</p><strong>{combatant.armorClass}</strong></div>
          <div class="border border-primary/30 rounded p-2"><p>Iniciativa</p><strong>{combatant.initiative}</strong></div>
        </div>
      {/if}
      {#if !combatant.characterId}
        <div class="rounded border border-primary/30 bg-primary/5 p-3 space-y-2">
          <form class="flex gap-2" on:submit|preventDefault={() => search()}>
            <input bind:value={query} aria-label="Buscar ficha de monstruo" placeholder="Nombre del monstruo en el catálogo" class="input input-bordered input-sm bg-[#2d241c] text-base-content flex-1 min-w-0" />
            <button class="btn btn-sm btn-dnd" disabled={loading || !query.trim()}>Buscar</button>
          </form>
          {#each choices as choice}
            <button class="block w-full text-left border border-primary/30 rounded p-3 hover:bg-primary/10" on:click={() => loadMonster(choice.slug)}>{choice.name} <span class="text-xs text-neutral/60">· {choice.document__title || choice.document__slug || 'Open5e'}</span></button>
          {/each}
        </div>
      {/if}
      <div class="rounded border border-warning/30 bg-warning/10 p-3 space-y-2">
        <p class="text-sm">HP temporales: {combatant.temporaryHp} · Iniciativa del encuentro: {combatant.initiative}</p>
        <div class="flex flex-wrap items-center gap-1">{#each combatant.conditions as condition}<ConditionBadge {condition} />{:else}<span class="text-sm text-neutral/70">Sin condiciones</span>{/each}</div>
      </div>
      {#if error}<button class="btn btn-sm" disabled={loading} on:click={load}>Reintentar</button>{/if}
    </div>
  </div>
</div>
