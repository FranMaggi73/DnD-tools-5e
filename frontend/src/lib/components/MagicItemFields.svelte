<script lang="ts">
  export let isMagical = false;
  export let requiresAttunement = false;
  export let magicBonus = 0;
  export let maxBonus = 5;
  export let bonusLabel = 'Bono mágico de ataque y daño';
  export let disabled = false;
  function toggleMagic(event: Event) {
    isMagical = (event.currentTarget as HTMLInputElement).checked;
    if (!isMagical) { magicBonus = 0; requiresAttunement = false; }
  }
</script>

<div class="magic-options" role="group" aria-label="Propiedades mágicas">
  <label class="magic-check"><input type="checkbox" checked={isMagical} on:change={toggleMagic} {disabled} class="checkbox checkbox-sm" /> Mágica</label>
  <label class="magic-check"><input type="checkbox" bind:checked={requiresAttunement} aria-label="Requiere sintonización" disabled={disabled || !isMagical} class="checkbox checkbox-sm" /> Sintonización</label>
  <label class="magic-bonus"><span aria-hidden="true">+</span><input type="number" min="0" max={maxBonus} step="1" bind:value={magicBonus} aria-label={bonusLabel} disabled={disabled || !isMagical} class="input input-bordered input-sm" /></label>
</div>

<style>
  .magic-options { display: grid; grid-template-columns: max-content max-content minmax(2.75rem, 1fr); align-items: center; gap: 0.375rem; font-size: 0.75rem; }
  .magic-check { display: flex; align-items: center; gap: 0.25rem; min-height: 2.75rem; white-space: nowrap; cursor: pointer; }
  .magic-bonus { display: flex; align-items: center; gap: 0.25rem; min-width: 0; max-width: 4rem; }
  .magic-bonus .input { width: 100%; min-width: 0; padding-inline: 0.375rem; background: #2d241c; color: #f5e9d0; border-color: #997b53; color-scheme: dark; }
  .magic-bonus .input:disabled { color: #cbb99a; opacity: 0.7; }
  .checkbox { flex-shrink: 0; background-color: #fff4dc; border: 2px solid #654321; color: #2c1810; }
  .checkbox:checked { background-color: #daa520; }
  .checkbox:disabled { opacity: 0.5; }
</style>
