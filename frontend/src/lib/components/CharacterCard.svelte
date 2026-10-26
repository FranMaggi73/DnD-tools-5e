<!-- frontend/src/lib/components/CharacterSheet.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Character, AbilityKey, Skill } from '$lib/types';
  import { 
    getAbilityModifier, 
    formatModifier, 
    getProficiencyBonus 
  } from '$lib/types';
  import CharacterBuildSheet from './CharacterBuildSheet.svelte';
  import InventoryPanel from './InventoryPanel.svelte';
  import CharacterRulesPanel from './CharacterRulesPanel.svelte';
  import ResourcePanel from './ResourcePanel.svelte';
  import ConditionBadge from './ConditionBadge.svelte';
  import { skillBonus, hasJackOfAllTrades, effectiveSpeed } from '$lib/rules/2024';

  export let character: Character;
  export let isOwner: boolean = false;
  export let showInventory: boolean = false;

  const dispatch = createEventDispatcher();

  // Estados de las pestañas
  let activeTab: 'stats' | 'inventory' = 'stats';
  let resourcesOpen = false;

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

  // Keys para iterar
  $: abilityKeys = Object.keys(character.abilityScores) as AbilityKey[];
  $: savingThrowKeys = Object.keys(character.savingThrows) as AbilityKey[];

  // Filtrar skills por proficiencia
  $: proficientSkills = character.skills.filter(s => s.proficient || s.expertise);
  $: otherSkills = character.skills.filter(s => !s.proficient && !s.expertise);

  // Labels en español
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

  function getSkillBonusForCharacter(skill: Skill): number {
    return skillBonus(character.abilityScores[skill.ability], skill, proficiencyBonus,
      hasJackOfAllTrades(character.class, character.level), character.rules.exhaustion);
  }
  function passivePerception(value: Character) {
    const perception = value.skills.find(skill => skill.name === 'Perception');
    return 10 + (perception ? getSkillBonusForCharacter(perception) : 0) - (value.conditions.includes('Poisoned') ? 5 : 0);
  }

  function getSavingThrowBonusForCharacter(ability: AbilityKey): number {
    const abilityMod = abilityModifiers[ability];
    const isProficient = character.savingThrows[ability];
    return abilityMod + (isProficient ? proficiencyBonus : 0) - 2 * character.rules.exhaustion;
  }

  function getSkillLabel(skillName: string): string {
    const translations: Record<string, string> = {
      'Acrobatics': 'Acrobacias',
      'Animal Handling': 'Trato con Animales',
      'Arcana': 'Arcano',
      'Athletics': 'Atletismo',
      'Deception': 'Engaño',
      'History': 'Historia',
      'Insight': 'Perspicacia',
      'Intimidation': 'Intimidación',
      'Investigation': 'Investigación',
      'Medicine': 'Medicina',
      'Nature': 'Naturaleza',
      'Perception': 'Percepción',
      'Performance': 'Interpretación',
      'Persuasion': 'Persuasión',
      'Religion': 'Religión',
      'Sleight of Hand': 'Juego de Manos',
      'Stealth': 'Sigilo',
      'Survival': 'Supervivencia'
    };
    return translations[skillName] || skillName;
  }
</script>

<div class="card-parchment character-sheet w-full max-w-6xl mx-auto">
  <div class="card-body p-3 sm:p-5 gap-3">
    
    <!-- Header -->
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <div class="avatar flex-shrink-0">
          <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full ring-2 ring-secondary ring-offset-2 ring-offset-[#f4e4c1]">
            <div class="bg-gradient-to-br from-primary to-accent flex items-center justify-center w-full h-full">
              <span class="text-3xl">🧙‍♂️</span>
            </div>
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="text-lg sm:text-2xl font-medieval font-bold text-neutral leading-tight break-words">
            {character.name}
          </h3>
          <p class="text-sm text-neutral/70 font-body">
            {character.class} • Nivel {character.level}
          </p>
          <div class="flex flex-wrap gap-1 mt-1">
            <div class="badge badge-sm badge-secondary">+{proficiencyBonus} Competencia</div>
          </div>
        </div>
      </div>

      {#if isOwner}
        <div class="flex gap-2 flex-shrink-0">
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
        </div>
      {/if}
    </div>

    <!-- Tabs -->
    {#if showInventory}
    <div class="tabs tabs-boxed bg-neutral/20">
      <button 
        class="tab flex-1 {activeTab === 'stats' ? 'tab-active' : ''}"
        on:click={() => activeTab = 'stats'}
      >
        <span class="text-lg mr-2">📊</span>
        Estadísticas
      </button>
      {#if showInventory}
      <button 
        class="tab flex-1 {activeTab === 'inventory' ? 'tab-active' : ''}"
        on:click={() => activeTab = 'inventory'}
      >
        <span class="text-lg mr-2">🎒</span>
        Inventario
      </button>
      {/if}
    </div>

    {/if}
    <div class="flex flex-wrap items-center gap-1 text-sm text-neutral">
      <span class="badge badge-outline">Percepción pasiva: {character.rules.lifeState === 'alive' ? passivePerception(character) : '—'}</span>
      <span class="badge badge-outline">Agotamiento: {character.rules.exhaustion}/6</span>
      {#if hasJackOfAllTrades(character.class, character.level)}<span class="badge badge-outline">Media competencia en habilidades no competentes</span>{/if}
      <div class="flex items-center gap-1 h-8 shrink-0" aria-label="Concentración e inspiración">
      {#if character.rules.concentration}
        <span class="badge h-auto rounded-full border border-info/60 bg-info/20 text-neutral px-2 py-1 text-base" tabindex="0" title={`Concentración: ${character.rules.concentration}`} aria-label={`Concentración: ${character.rules.concentration}`}>🔮</span>
      {/if}
      {#if character.rules.heroicInspiration}
        <span class="badge h-auto rounded-full border border-secondary bg-secondary/30 text-neutral px-2 py-1 text-base" tabindex="0" title="Inspiración heroica disponible" aria-label="Inspiración heroica disponible">✨</span>
      {/if}
      </div>
    </div>
    <!-- Content -->
    <div class="sheet-content" role="region" aria-label={`Ficha de ${character.name}`} tabindex="0">
    {#if activeTab === 'stats'}
      <!-- Stats Tab -->
      <div class="space-y-2">
        
        <!-- Stats Principales -->
        <div class="grid grid-cols-4 gap-1.5 sm:gap-3 sheet-summary">
          <div class="bg-gradient-to-br from-info/20 to-success/20 p-2 rounded-lg border border-info/30 text-center">
            <p class="text-xs font-medieval text-neutral/60 mb-1">CA</p>
            <p class="text-xl font-bold text-neutral">{character.armorClass}</p>
          </div>
          <div class="bg-gradient-to-br from-warning/20 to-error/20 p-2 rounded-lg border border-warning/30 text-center">
            <p class="text-xs font-medieval text-neutral/60 mb-1">INIT</p>
            <p class="text-xl font-bold text-neutral">{formatModifier(character.initiative - 2 * character.rules.exhaustion)}</p>
          </div>
          <div class="bg-gradient-to-br from-success/20 to-primary/20 p-2 rounded-lg border border-success/30 text-center">
            <p class="text-xs font-medieval text-neutral/60 mb-1">PIES</p>
            <p class="text-xl font-bold text-neutral">{effectiveSpeed(character.speed, character.rules, character.conditions)}'</p>
          </div>
          <div class="bg-gradient-to-br from-primary/20 to-accent/20 p-2 rounded-lg border border-primary/30 text-center">
            <p class="text-xs font-medieval text-neutral/60 mb-1">NIVEL</p>
            <p class="text-xl font-bold text-neutral">{character.level}</p>
          </div>
        </div>

        <!-- HP -->
        <div class="bg-gradient-to-r from-success/10 to-error/10 p-2 rounded-lg border border-success/30">
          <div class="flex justify-between items-center mb-2">
            <span class="font-medieval text-neutral/70 text-sm">PUNTOS DE VIDA</span>
            <span class="font-bold text-neutral">{character.currentHp}/{character.maxHp}</span>
          </div>
          <progress class={"progress w-full h-2.5 sm:h-3 " + `progress-${hpColor}`} value={character.currentHp} max={character.maxHp}></progress>
        </div>

        <!-- Condiciones -->
        {#if hasConditions}
          <div class="bg-warning/10 p-2 rounded-lg border border-warning/30">
            <p class="text-xs font-medieval text-neutral/60 mb-2">⚠️ CONDICIONES ACTIVAS</p>
            <div class="flex flex-wrap gap-1">
              {#each character.conditions as condition}
                <ConditionBadge {condition} />
              {/each}
            </div>
          </div>
        {/if}

        <!-- Ability Scores -->
        <details class="sheet-section">
          <summary class="font-medieval text-sm text-neutral cursor-pointer">💪 Características</summary>
          <div class="grid grid-cols-3 min-[380px]:grid-cols-6 gap-1.5 sm:gap-3 sheet-abilities">
            {#each abilityKeys as ability}
              <div class="bg-gradient-to-br from-primary/10 to-accent/10 p-2 rounded-lg border-2 border-primary/30 text-center">
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
        </details>

        <!-- Saving Throws -->
        <details class="sheet-section">
          <summary class="font-medieval text-sm text-neutral cursor-pointer">🛡️ Tiradas de Salvación</summary>
          <div class="grid grid-cols-2 min-[380px]:grid-cols-3 gap-1.5 sm:gap-2 sheet-saves">
            {#each savingThrowKeys as ability}
              <div class={"flex items-center gap-2 p-2 rounded-lg border-2 " + (character.savingThrows[ability] ? 'bg-success/20 border-success' : 'bg-neutral/10 border-neutral/30')}>
                <div class={"w-4 h-4 rounded-full border-2 " + (character.savingThrows[ability] ? 'bg-success border-success' : 'border-neutral/50')}></div>
                <div class="flex-1">
                  <div class="text-sm font-medieval">{abilityLabels[ability]}</div>
                  <div class="text-xs text-neutral/70">{formatModifier(getSavingThrowBonusForCharacter(ability))}</div>
                </div>
              </div>
            {/each}
          </div>
        </details>

        <!-- Skills -->
        <details class="sheet-section">
          <summary class="font-medieval text-sm text-neutral cursor-pointer">🎯 Habilidades</summary>

          {#if proficientSkills.length > 0}
            <div class="mb-3">
              <p class="text-xs font-medieval text-neutral/60 mb-2">COMPETENTES</p>
              <div class="grid grid-cols-1 min-[360px]:grid-cols-2 gap-1.5 sm:gap-2 sheet-skills">
                {#each proficientSkills as skill}
                  <div class={"flex items-center gap-2 p-2 rounded-lg border-2 " + (skill.expertise ? 'bg-warning/20 border-warning' : 'bg-success/20 border-success')}>
                    <div class={"w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs " + (skill.expertise ? 'bg-warning border-warning' : 'bg-success border-success')}>
                      {#if skill.expertise}★{/if}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm leading-tight">{getSkillLabel(skill.name)}</div>
                    </div>
                    <div class="text-sm font-bold text-neutral">
                      {formatModifier(getSkillBonusForCharacter(skill))}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          {#if otherSkills.length > 0}
            <details class="collapse collapse-arrow bg-neutral/5 rounded-lg border border-neutral/20">
              <summary class="collapse-title text-xs font-medieval text-neutral/60">
                OTRAS HABILIDADES ({otherSkills.length})
              </summary>
              <div class="collapse-content">
                <div class="grid grid-cols-1 min-[360px]:grid-cols-2 gap-1.5 sm:gap-2 sheet-skills pt-2">
                  {#each otherSkills as skill}
                    <div class="flex items-center gap-2 p-2 rounded-lg border-2 bg-neutral/10 border-neutral/30">
                      <div class="w-4 h-4 rounded-full border-2 border-neutral/50"></div>
                      <div class="flex-1 min-w-0">
                        <div class="text-sm leading-tight">{getSkillLabel(skill.name)}</div>
                      </div>
                      <div class="text-sm font-bold text-neutral">
                        {formatModifier(getSkillBonusForCharacter(skill))}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </details>
          {/if}
        </details>
      </div>
      {#if isOwner}
        <details class="sheet-section mt-2 text-neutral" bind:open={resourcesOpen}>
          <summary class="font-medieval text-sm font-semibold cursor-pointer">Recursos</summary>
          {#if resourcesOpen}<div class="pt-2"><ResourcePanel {character}/></div>{/if}
        </details>
      {/if}
      <CharacterBuildSheet {character}/>
      <CharacterRulesPanel {character} editable={isOwner} />
    {:else if showInventory}
      <!-- Inventory Tab -->
      <InventoryPanel 
        characterId={character.id}
        isOwner={isOwner}
      />
    {/if}
    </div>
  </div>
</div>

<style>
 .character-sheet { display: flex; flex-direction: column; max-height: min(78dvh, 48rem); }
 .card-body { min-height: 0; padding: .75rem; gap: .625rem; }
 .sheet-content { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior-y: contain; scrollbar-gutter: stable; padding-right: .25rem; }
 .sheet-section { border: 1px solid #8b45134d; border-radius: .5rem; padding: .625rem; }
 .sheet-section > summary { min-height: 1.5rem; }
 .sheet-section[open] > summary { margin-bottom: .625rem; }
 .sheet-content :global(.sheet-abilities > div) { padding: .375rem .125rem; border-width: 1px; }
 .sheet-content :global(.sheet-abilities .text-3xl) { font-size: 1.25rem; }
</style>
