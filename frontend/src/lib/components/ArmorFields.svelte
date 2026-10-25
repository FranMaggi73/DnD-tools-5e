<script lang="ts">
  import { validateArmorForm, type ArmorForm } from '$lib/utils/armorForm';
  import MagicItemFields from './MagicItemFields.svelte';
  export let form: ArmorForm;
  export let disabled = false;
  export let isShield = false;
  $: error = validateArmorForm(form);
</script>

<fieldset {disabled} class="armor-fields space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-neutral">
  <legend class="font-medieval font-bold px-1">🛡️ {isShield ? 'Datos del escudo' : 'Datos de la armadura'}</legend>
  <label class="form-control text-sm">{isShield ? 'CA que aporta el escudo (sin bono mágico)' : 'CA base (sin bono mágico)'}
    <input type="number" min="0" max="99" step="1" bind:value={form.baseAC} class="input input-bordered input-sm" />
  </label>
  <MagicItemFields bind:isMagical={form.isMagical} bind:requiresAttunement={form.requiresAttunement} bind:magicBonus={form.magicBonus} maxBonus={3} bonusLabel="Bono mágico de CA" {disabled} />
  <p class="text-xs text-neutral/70">Al desmarcar «Mágica» se quitan el bono y la sintonización.</p>
  {#if error}<p class="text-error text-sm" role="alert">{error}</p>{/if}
</fieldset>

<style>
  .armor-fields .input { background: #2d241c; color: #f5e9d0; border-color: #997b53; color-scheme: dark; }
  .armor-fields .input:disabled { color: #cbb99a; opacity: 0.7; }
</style>
