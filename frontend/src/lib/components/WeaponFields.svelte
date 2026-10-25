<script lang="ts">
  import { DAMAGE_TYPES } from '$lib/rules/2024';
  import { DAMAGE_LABELS, WEAPON_DICE, validateWeaponForm, type WeaponForm } from '$lib/utils/weaponForm';
  import MagicItemFields from './MagicItemFields.svelte';
  export let form: WeaponForm;
  export let disabled = false;
  $: error = validateWeaponForm(form);
</script>

<fieldset {disabled} class="weapon-fields space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-neutral">
  <legend class="font-medieval font-bold px-1">⚔️ Datos del arma</legend>
  <label class="form-control text-sm">Uso del arma
    <select bind:value={form.handling} class="select select-bordered select-sm">
      <option value="one-handed">Una mano</option>
      <option value="two-handed">Dos manos</option>
      <option value="versatile">Versátil (una o dos manos)</option>
    </select>
  </label>
  <p class="text-sm font-medieval font-semibold">Daño a {form.handling === 'two-handed' ? 'dos manos' : 'una mano'}</p>
  <label class="form-control text-sm">Modo de daño
    <select bind:value={form.damageMode} class="select select-bordered select-sm"><option value="dice">Dados</option><option value="fixed">Daño fijo</option></select>
  </label>
  {#if form.damageMode === 'fixed'}
    <label class="form-control text-sm">Daño fijo <input type="number" min="0" max="999" step="1" bind:value={form.fixedDamage} class="input input-bordered input-sm" /></label>
  {:else}
  <div class="grid grid-cols-2 gap-3">
    <label class="form-control text-sm">Cantidad de dados
      <input type="number" min="1" max="100" step="1" bind:value={form.diceCount} class="input input-bordered input-sm" />
    </label>
    <label class="form-control text-sm">Dado de daño
      <select bind:value={form.dieSize} class="select select-bordered select-sm">{#each WEAPON_DICE as die}<option value={die}>d{die}</option>{/each}</select>
    </label>
  </div>
  {/if}
  {#if form.handling === 'versatile'}
    <p class="text-sm font-medieval font-semibold">Daño a dos manos</p>
    <div class="grid grid-cols-2 gap-3">
      <label class="form-control text-sm">Cantidad de dados
        <input aria-label="Cantidad de dados a dos manos" type="number" min="1" max="100" step="1" bind:value={form.twoHandedDiceCount} class="input input-bordered input-sm" />
      </label>
      <label class="form-control text-sm">Dado de daño
        <select aria-label="Dado de daño a dos manos" bind:value={form.twoHandedDieSize} class="select select-bordered select-sm">{#each WEAPON_DICE as die}<option value={die}>d{die}</option>{/each}</select>
      </label>
    </div>
  {/if}
  <label class="form-control text-sm">Tipo de daño
    <select bind:value={form.damageType} class="select select-bordered select-sm">{#each DAMAGE_TYPES as type}<option value={type}>{DAMAGE_LABELS[type]}</option>{/each}</select>
  </label>
  <MagicItemFields bind:isMagical={form.isMagical} bind:requiresAttunement={form.requiresAttunement} bind:magicBonus={form.magicBonus} maxBonus={5} {disabled} />
  <p class="text-xs text-neutral/70">Al desmarcar «Mágica» se quitan el bono y la sintonización.</p>
  {#if error}<p class="text-error text-sm" role="alert">{error}</p>{:else}
    <div class="text-sm font-semibold space-y-1">
      <p>{form.handling === 'two-handed' ? 'Dos manos' : 'Una mano'}: {form.damageMode === 'fixed' ? form.fixedDamage : `${form.diceCount}d${form.dieSize}`}{form.magicBonus > 0 ? ` + ${form.magicBonus}` : ''} · {DAMAGE_LABELS[form.damageType]}</p>
      {#if form.handling === 'versatile'}<p>Dos manos: {form.twoHandedDiceCount}d{form.twoHandedDieSize}{form.magicBonus > 0 ? ` + ${form.magicBonus}` : ''} · {DAMAGE_LABELS[form.damageType]}</p>{/if}
    </div>
  {/if}
</fieldset>

<style>
  .weapon-fields .input, .weapon-fields .select { background: #2d241c; color: #f5e9d0; border-color: #997b53; color-scheme: dark; }
  .weapon-fields .input:disabled { color: #cbb99a; opacity: 0.7; }
</style>
