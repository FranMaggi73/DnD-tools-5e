<!-- frontend/src/lib/components/CharacterCardExtended.svelte -->
<script lang="ts">
  import type { Character, AbilityKey, Skill } from '$lib/types';
  import { 
    getAbilityModifier, 
    formatModifier, 
    getProficiencyBonus
  } from '$lib/types';
  import { createEventDispatcher } from 'svelte';

  export let character: Character;
  export let isOwner: boolean = false;
  export let expanded: boolean = false;

  const dispatch = createEventDispatcher();

  $: hpPercentage = character.maxHp ? (character.currentHp / character.maxHp) * 100 : 0;
  $: hpColor = hpPercentage > 50 ? 'success' : hpPercentage > 25 ? 'warning' : 'error';
  $: hasConditions = Array.isArray(character.conditions) && character.conditions.length > 0;
  $: proficiencyBonus = getProficiencyBonus(character.level);

  // Calcular modificadores
  $: abilityModifiers = {
    strength: getAbilityModifier(character.abilityScores.strength),
    dexterity: getAbilityModifier(character.abilityScores.dexterity),
    constitution: getAbilityModifier(character.abilityScores.constitution),
    intelligence: getAbilityModifier(character.abilityScores.intelligence),
    wisdom: getAbilityModifier(character.abilityScores.wisdom),
    charisma: getAbilityModifier(character.abilityScores.charisma)
  };

  // Keys para iterar sin casts en template
  $: abilityKeys = Object.keys(character.abilityScores) as AbilityKey[];
  $: savingThrowKeys = Object.keys(character.savingThrows) as AbilityKey[];

  // Labels
  const abilityLabels: Record<AbilityKey, string> = {
    strength: 'FUE',
    dexterity: 'DES',
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'SAB',
    charisma: 'CAR'
  };

  const abilityNames: Record<AbilityKey, string> = {
    strength: 'Fuerza',
    dexterity: 'Destreza',
    constitution: 'Constitución',
    intelligence: 'Inteligencia',
    wisdom: 'Sabiduría',
    charisma: 'Carisma'
  };

  function handleEdit() {
    dispatch('edit', character);
  }

  function handleDelete() {
    dispatch('delete', character);
  }

  function toggleExpand() {
    expanded = !expanded;
  }

  function getSkillBonusForCharacter(skill: Skill): number {
    const abilityMod = abilityModifiers[skill.ability];
    let bonus = abilityMod ?? 0;
    
    if (skill.expertise) {
      bonus += proficiencyBonus * 2;
    } else if (skill.proficient) {
      bonus += proficiencyBonus;
    }
    
    return bonus;
  }

  function getSavingThrowBonusForCharacter(ability: AbilityKey): number {
    const abilityMod = abilityModifiers[ability];
    const isProficient = character.savingThrows[ability];
    return isProficient ? (abilityMod + proficiencyBonus) : abilityMod;
  }
</script>

<div class="card-parchment card-hover corner-ornament w-full max-w-4xl mx-auto">
  <div class="card-body p-4 sm:p-5">
    
    <!-- Header Compacto -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <div class="avatar flex-shrink-0">
          <div class="w-20 h-20 rounded-full ring-2 ring-secondary ring-offset-2 ring-offset-[#f4e4c1]">
            <div class="bg-gradient-to-br from-primary to-accent flex items-center justify-center w-full h-full">
              <span class="text-3xl">🧙‍♂️</span>
            </div>
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="text-2xl font-medieval font-bold text-neutral mb-1">
            {character.name}
          </h3>
          <p class="text-base text-neutral/70 font-body">
            {character.class} • Nivel {character.level}
          </p>
          <div class="flex gap-2 mt-1">
            <div class="badge badge-sm badge-secondary">+{proficiencyBonus} Competencia</div>
            <div class="badge badge-sm badge-info">{character.speed} pies</div>
          </div>
        </div>
      </div>

      <div class="flex gap-2 flex-shrink-0">
        <button
          on:click={toggleExpand}
          class="btn btn-sm btn-circle btn-ghost"
          title={expanded ? 'Ver menos' : 'Ver más'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class={"h-5 w-5 transition-transform " + (expanded ? 'rotate-180' : '')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {#if isOwner}
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-ghost btn-sm btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </label>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-neutral rounded-box w-52 border-2 border-secondary">
              <li><a on:click={handleEdit} class="text-secondary">✏️ Editar</a></li>
              <li><a on:click={handleDelete} class="text-error">🗑️ Eliminar</a></li>
            </ul>
          </div>
        {/if}
      </div>
    </div>

    <!-- Stats Principales (siempre visible) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <div class="bg-gradient-to-br from-info/20 to-success/20 p-3 rounded-lg border border-info/30 text-center">
        <p class="text-xs font-medieval text-neutral/60 mb-1">CA</p>
        <p class="text-2xl font-bold text-neutral">{character.armorClass}</p>
      </div>
      <div class="bg-gradient-to-br from-warning/20 to-error/20 p-3 rounded-lg border border-warning/30 text-center">
        <p class="text-xs font-medieval text-neutral/60 mb-1">INIT</p>
        <p class="text-2xl font-bold text-neutral">+{character.initiative}</p>
      </div>
      <div class="bg-gradient-to-br from-success/20 to-primary/20 p-3 rounded-lg border border-success/30 text-center">
        <p class="text-xs font-medieval text-neutral/60 mb-1">VELOCIDAD</p>
        <p class="text-2xl font-bold text-neutral">{character.speed}'</p>
      </div>
      <div class="bg-gradient-to-br from-primary/20 to-accent/20 p-3 rounded-lg border border-primary/30 text-center">
        <p class="text-xs font-medieval text-neutral/60 mb-1">NIVEL</p>
        <p class="text-2xl font-bold text-neutral">{character.level}</p>
      </div>
    </div>

    <!-- HP (siempre visible) -->
    <div class="bg-gradient-to-r from-success/10 to-error/10 p-3 rounded-lg border border-success/30 mb-3">
      <div class="flex justify-between items-center mb-2">
        <span class="font-medieval text-neutral/70 text-sm">PUNTOS DE VIDA</span>
        <span class="font-bold text-neutral">{character.currentHp}/{character.maxHp}</span>
      </div>
      <progress class={"progress w-full h-4 " + `progress-${hpColor}`} value={character.currentHp} max={character.maxHp}></progress>
    </div>

    <!-- Condiciones (siempre visible si hay) -->
    {#if hasConditions}
      <div class="bg-warning/10 p-3 rounded-lg border border-warning/30 mb-3">
        <p class="text-xs font-medieval text-neutral/60 mb-2">⚠️ CONDICIONES ACTIVAS</p>
        <div class="flex flex-wrap gap-1">
          {#each character.conditions as condition}
            <div class="badge badge-warning badge-sm">{condition}</div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Contenido Expandible -->
    {#if expanded}
      <div class="divider text-neutral/50 my-4">⚔️</div>

      <!-- Ability Scores -->
      <div class="mb-6">
        <h4 class="font-medieval text-lg text-neutral mb-3 flex items-center gap-2">
          💪 Puntuaciones de Habilidad
        </h4>
        <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
          {#each abilityKeys as ability}
            <div class="bg-gradient-to-br from-primary/10 to-accent/10 p-3 rounded-lg border-2 border-primary/30 text-center">
              <div class="text-xs font-medieval text-neutral/70 mb-1">
                {abilityLabels[ability]}
              </div>
              <div class="text-3xl font-bold text-neutral mb-1">
                {formatModifier(abilityModifiers[ability])}
              </div>
              <div class="text-sm text-neutral/60">
                ({character.abilityScores[ability]})
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Saving Throws -->
      <div class="mb-6">
        <h4 class="font-medieval text-lg text-neutral mb-3 flex items-center gap-2">
          🛡️ Tiradas de Salvación
        </h4>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
          {#each savingThrowKeys as ability}
            <div class={"flex items-center gap-2 p-2 rounded-lg border-2 " + (character.savingThrows[ability] ? 'bg-success/20 border-success' : 'bg-neutral/10 border-neutral/30')}>
              <div class={"w-4 h-4 rounded-full border-2 " + (character.savingThrows[ability] ? 'bg-success border-success' : 'border-neutral/50')}></div>
              <div class="flex-1">
                <div class="text-sm font-medieval">{abilityNames[ability]}</div>
                <div class="text-xs text-neutral/70">{formatModifier(getSavingThrowBonusForCharacter(ability))}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Skills -->
      <div class="mb-4">
        <h4 class="font-medieval text-lg text-neutral mb-3 flex items-center gap-2">
          🎯 Habilidades
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
          {#each character.skills as skill}
            <div class={"flex items-center gap-2 p-2 rounded-lg border-2 " + (skill.expertise ? 'bg-warning/20 border-warning' : skill.proficient ? 'bg-success/20 border-success' : 'bg-neutral/10 border-neutral/30')}>
              <div class={"w-4 h-4 rounded-full border-2 flex items-center justify-center " + (skill.expertise ? 'bg-warning border-warning text-xs' : skill.proficient ? 'bg-success border-success' : 'border-neutral/50')}>
                {#if skill.expertise}★{/if}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medieval truncate">{skill.name}</div>
              </div>
              <div class="text-sm font-bold text-neutral">
                {formatModifier(getSkillBonusForCharacter(skill))}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: rgba(139, 69, 19, 0.1);
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #8B4513, #654321);
    border-radius: 3px;
  }
</style>
