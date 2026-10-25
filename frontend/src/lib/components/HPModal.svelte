<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Combatant } from '$lib/types';
  import HealthControls from '$lib/components/HealthControls.svelte';
  export let isOpen = false;
  export let combatant: Combatant | null = null;
  export let isDM = false;
  export let busy = false;
  export let error = '';
  const dispatch = createEventDispatcher();
</script>
{#if isOpen && combatant && isDM}
  <div class="modal modal-open z-50" role="dialog" aria-modal="true" aria-label="Vida y estados de combate">
    <div class="card-parchment w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
      <button class="btn btn-sm btn-circle absolute right-3 top-3" aria-label="Cerrar" disabled={busy} on:click={() => dispatch('close')}>✕</button>
      <h2 class="font-medieval text-2xl text-neutral mb-4">Vida y estados: {combatant.name}</h2>
      {#if error}<p role="alert" class="text-error mb-3">{error}</p>{/if}
      {#key combatant.id}<HealthControls target={combatant} {busy} on:health />{/key}
    </div>
  </div>
{/if}
