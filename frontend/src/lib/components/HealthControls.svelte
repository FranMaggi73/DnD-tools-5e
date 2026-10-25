<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { DAMAGE_TYPES, type HealthAction, type HealthState, type DamageType } from '$lib/rules/2024';
  export let target: HealthState;
  export let busy = false;
  const dispatch = createEventDispatcher<{ health: HealthAction }>();
  let amount = 1;
  let damageType: DamageType | '' = '';
  let critical = false;
  let temporary = target.temporaryHp;
  let roll = 10;
  let saveModifier = 0;
  let exhaustion = target.rules.exhaustion;
  let concentration = target.rules.concentration;
  const labels = { alive: 'Vivo', unconscious: 'Inconsciente', stable: 'Estable a 0 HP', dead: 'Muerto' };
  function send(action: HealthAction) { if (!busy) dispatch('health', action); }
</script>

<div class="health-controls space-y-4 text-neutral">
  <p class="font-bold" aria-live="polite">{labels[target.rules.lifeState]} · {target.currentHp}/{target.maxHp} HP · {target.temporaryHp} temporales</p>
  <fieldset disabled={busy} class="space-y-3">
    <legend class="font-medieval">Daño y curación</legend>
    <div class="grid grid-cols-2 gap-3">
      <label class="form-control">Cantidad <input aria-label="Cantidad de daño o curación" type="number" min="0" max="9999" bind:value={amount} class="input input-bordered" /></label>
      <label class="form-control">Tipo de daño
        <select bind:value={damageType} class="select select-bordered"><option value="">Sin tipo</option>{#each DAMAGE_TYPES as type}<option value={type}>{type}</option>{/each}</select>
      </label>
    </div>
    <label class="flex gap-2 items-center"><input type="checkbox" bind:checked={critical} class="checkbox checkbox-sm" /> Impacto crítico (para daño recibido a 0 HP)</label>
    <div class="flex flex-wrap gap-2">
      <button class="btn btn-error btn-sm" disabled={target.rules.lifeState === 'dead'} on:click={() => send({ type: 'damage', amount, critical, ...(damageType ? { damageType } : {}) })}>Aplicar daño</button>
      <button class="btn btn-success btn-sm" disabled={target.rules.lifeState === 'dead'} on:click={() => send({ type: 'heal', amount })}>Curar</button>
      {#if target.rules.lifeState === 'dead'}<button class="btn btn-warning btn-sm" on:click={() => send({ type: 'revive', amount })}>Revivir con intervención del DM</button>{/if}
    </div>
    <p class="text-xs">Las resistencias y vulnerabilidades se aplican antes de los HP temporales. Un crítico no duplica aquí el daño: ingresá el total ya tirado.</p>
    <div class="flex flex-wrap gap-2 items-end">
      <label class="form-control">HP temporales <input type="number" min="0" max="9999" bind:value={temporary} class="input input-bordered input-sm" /></label>
      <button class="btn btn-sm" on:click={() => send({ type: 'temporary', amount: temporary })}>Reemplazar temporales</button>
    </div>
    <p class="text-xs">Los HP temporales se reemplazan, no se suman; no curan ni devuelven la consciencia.</p>
  </fieldset>

  {#if target.currentHp === 0 && target.rules.lifeState !== 'dead'}
    <fieldset disabled={busy} class="space-y-2 border-t border-neutral/20 pt-3">
      <legend class="font-medieval">Salvaciones de muerte</legend>
      <p>Éxitos: {target.deathSaves.successes}/3 · Fallos: {target.deathSaves.failures}/3</p>
      {#if target.rules.lifeState !== 'stable'}
        <div class="grid grid-cols-2 gap-3">
          <label class="form-control">d20 natural <input type="number" min="1" max="20" bind:value={roll} class="input input-bordered input-sm" /></label>
          <label class="form-control">Modificador especial <input type="number" min="-100" max="100" bind:value={saveModifier} class="input input-bordered input-sm" /></label>
        </div>
        <button class="btn btn-sm" on:click={() => send({ type: 'deathSave', roll, modifier: saveModifier })}>Resolver salvación</button>
      {/if}
      <button class="btn btn-sm" on:click={() => send({ type: 'stabilize' })}>Estabilizar</button>
      <p class="text-xs">Un 1 natural suma dos fallos; un 20 recupera 1 HP. Al curarse o estabilizarse, los contadores vuelven a cero.</p>
    </fieldset>
  {/if}

  <fieldset disabled={busy} class="space-y-3 border-t border-neutral/20 pt-3">
    <legend class="font-medieval">Estados de 2024</legend>
    <label class="flex gap-2 items-center"><input type="checkbox" class="checkbox checkbox-sm" checked={target.rules.heroicInspiration} on:change={(event) => send({ type: 'inspiration', value: event.currentTarget.checked })} /> Inspiración heroica disponible</label>
    <p class="text-xs">Permite volver a tirar un dado inmediatamente después de tirarlo; hay que usar el nuevo resultado.</p>
    <div class="flex gap-2 items-end">
      <label class="form-control">Agotamiento (0–6) <input type="number" min="0" max="6" bind:value={exhaustion} class="input input-bordered input-sm" /></label>
      <button class="btn btn-sm" on:click={() => send({ type: 'exhaustion', level: exhaustion })}>Aplicar nivel</button>
    </div>
    <p class="text-xs">Penalizador d20 actual: −{2 * target.rules.exhaustion}. Reducción de velocidad: {5 * target.rules.exhaustion} pies. El nivel 6 causa la muerte.</p>
    <div class="flex flex-wrap gap-2 items-end">
      <label class="form-control flex-1">Efecto en concentración <input type="text" maxlength="150" bind:value={concentration} class="input input-bordered input-sm" /></label>
      <button class="btn btn-sm" on:click={() => send({ type: 'concentration', name: concentration })}>Guardar</button>
      <button class="btn btn-sm" on:click={() => send({ type: 'concentration', name: '' })}>Terminar</button>
    </div>
    <p class="text-sm">Actual: {target.rules.concentration || 'Ninguno'}</p>
    {#if target.rules.concentrationSaveDC !== null}
      <div class="rounded border border-warning p-3" role="status">
        <p>Salvación de Constitución pendiente: CD {target.rules.concentrationSaveDC}</p>
        <button class="btn btn-success btn-sm mt-2" on:click={() => send({ type: 'concentrationResult', success: true })}>La superó</button>
        <button class="btn btn-error btn-sm mt-2" on:click={() => send({ type: 'concentrationResult', success: false })}>La falló</button>
      </div>
    {/if}
  </fieldset>
</div>

<style>
  .health-controls .input,
  .health-controls .select {
    background-color: #2d241c;
    color: #f5e9d0;
    border-color: #997b53;
    caret-color: #f5e9d0;
    color-scheme: dark;
  }
  .health-controls .input::placeholder { color: #cbb99a; opacity: 1; }
  .health-controls .input:focus-visible,
  .health-controls .select:focus-visible {
    outline: 2px solid #b8860b;
    outline-offset: 2px;
  }
  .health-controls .checkbox {
    flex-shrink: 0;
    border: 2px solid #654321;
    background-color: #fff4dc;
    color: #2c1810;
  }
  .health-controls .checkbox:checked {
    background-color: #daa520;
    border-color: #654321;
  }
  .health-controls .checkbox:focus-visible {
    outline: 2px solid #654321;
    outline-offset: 3px;
  }
</style>
