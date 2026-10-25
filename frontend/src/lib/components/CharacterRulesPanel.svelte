<script lang="ts">
  import type { Character } from '$lib/types';
  import { api } from '$lib/api/api';
  import { DAMAGE_TYPES, type DamageType, type HealthAction } from '$lib/rules/2024';
  import HealthControls from './HealthControls.svelte';
  export let character: Character;
  export let editable = false;
  let busy = false;
  let error = '';
  let result = '';
  let dice = 1;
  let dieSize = character.rules.hitDieSize;
  let resistances = [...character.rules.resistances];
  let vulnerabilities = [...character.rules.vulnerabilities];
  let immunities = [...character.rules.immunities];
  async function run(action: () => Promise<unknown>) {
    if (busy) return;
    busy = true; error = ''; result = '';
    try { await action(); } catch (cause) { error = cause instanceof Error ? cause.message : 'No se pudo guardar.'; }
    finally { busy = false; }
  }
  function health(event: CustomEvent<HealthAction>) { return run(() => api.applyCharacterHealth(character.id, event.detail)); }
  function takeRest(kind: 'short' | 'long') {
    return run(async () => {
      const response = await api.restCharacter(character.id, kind, kind === 'short' ? dice : 0);
      result = kind === 'long' ? 'Descanso largo aplicado.' : `Descanso corto aplicado. Dados: ${response.rolls.join(', ') || 'ninguno'}.`;
    });
  }
</script>

{#if editable}
  <details class="border border-neutral/30 rounded-lg p-3 mt-4">
    <summary class="font-medieval cursor-pointer">Vida, estados y descansos · reglas 2024</summary>
    <div class="space-y-5 pt-4">
      {#if error}<p class="text-error" role="alert">{error}</p>{/if}
      {#if result}<p class="text-success" role="status">{result}</p>{/if}
      <HealthControls target={character} {busy} on:health={health} />
      <fieldset disabled={busy} class="space-y-3 border-t border-neutral/20 pt-3">
        <legend class="font-medieval">Descansos y dados de golpe</legend>
        <p>{Math.max(0, character.level - character.rules.hitDiceSpent)}/{character.level} dados d{character.rules.hitDieSize} disponibles</p>
        <label class="form-control">Dados a gastar en descanso corto <input type="number" min="0" max={Math.max(0, character.level - character.rules.hitDiceSpent)} bind:value={dice} class="input input-bordered input-sm" /></label>
        <div class="flex flex-wrap gap-2">
          <button class="btn btn-sm" on:click={() => takeRest('short')}>Completar descanso corto</button>
          <button class="btn btn-sm" on:click={() => takeRest('long')}>Completar descanso largo</button>
        </div>
        <p class="text-xs">El corto tira los dados elegidos y suma Constitución a cada uno. El largo recupera HP y todos los dados de golpe, quita los HP temporales y reduce un nivel de agotamiento. El DM confirma que se cumplieron la duración y los requisitos del descanso.</p>
      </fieldset>
      <details class="border-t border-neutral/20 pt-3">
        <summary class="cursor-pointer">Defensas y tipo de dado de golpe</summary>
        <fieldset disabled={busy} class="space-y-3 mt-3">
          <label class="form-control">Dado de golpe <select bind:value={dieSize} class="select select-bordered select-sm">{#each [6,8,10,12] as size}<option value={size}>d{size}</option>{/each}</select></label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label class="form-control">Resistencias <select aria-label="Resistencias" multiple size="5" bind:value={resistances} class="select select-bordered h-auto">{#each DAMAGE_TYPES as type}<option value={type}>{type}</option>{/each}</select></label>
            <label class="form-control">Vulnerabilidades <select aria-label="Vulnerabilidades" multiple size="5" bind:value={vulnerabilities} class="select select-bordered h-auto">{#each DAMAGE_TYPES as type}<option value={type}>{type}</option>{/each}</select></label>
            <label class="form-control">Inmunidades al daño <select aria-label="Inmunidades" multiple size="5" bind:value={immunities} class="select select-bordered h-auto">{#each DAMAGE_TYPES as type}<option value={type}>{type}</option>{/each}</select></label>
          </div>
          <p class="text-xs">Usá Ctrl o Cmd para seleccionar varios tipos de daño.</p>
          <button class="btn btn-sm" on:click={() => run(() => api.updateCharacterRules(character.id, { hitDieSize: dieSize, resistances, vulnerabilities, immunities }))}>Guardar defensas y dado</button>
        </fieldset>
      </details>
    </div>
  </details>
{/if}
