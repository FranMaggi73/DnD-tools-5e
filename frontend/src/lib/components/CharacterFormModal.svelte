<script lang="ts">
  import CharacterChoicesChecklist from './CharacterChoicesChecklist.svelte';
  import CharacterOriginFields from './CharacterOriginFields.svelte';
  import CharacterBuildDetails from './CharacterBuildDetails.svelte';
  import CharacterSpellbook from './CharacterSpellbook.svelte';
  import CharacterTrainingFields from './CharacterTrainingFields.svelte';
  import AbilityScoreSetup from './AbilityScoreSetup.svelte';
  import {normalizeBuild,averageHp} from '$lib/rules/characterBuilder';
  import { createEventDispatcher } from 'svelte';
  import type { CharacterForm, Skill, AbilityKey } from '$lib/types';
  import { 
    getAbilityModifier, 
    formatModifier, 
    getProficiencyBonus,
    DND_SKILLS 
  } from '$lib/types';
  import { 
    validateCharacterName, 
    validateHP, 
    validateArmorClass,
    validateLevel 
  } from '$lib/utils/validation';
  import debounce from 'lodash/debounce';
  import { skillBonus, hasJackOfAllTrades, initiativeModifier } from '$lib/rules/2024';

  export let busy = false;
  export let submitError = '';
  export let isOpen = false;
  $: if(!form.build)form.build=normalizeBuild();
  let hpExtraPerLevel=0;
  export let isEdit = false;
  export let form: CharacterForm;

  const dispatch = createEventDispatcher();

  let currentStep = 1;
  const totalSteps = 6;

  let errors = {
    name: '',
    class: '',
    level: '',
    maxHp: '',
    armorClass: '',
    speed: ''
  };

  let touched = {
    name: false,
    class: false,
    level: false,
    maxHp: false,
    armorClass: false,
    speed: false
  };

  $: if (form.initiativeBonus === undefined) form.initiativeBonus = isEdit ? form.initiative - getAbilityModifier(form.abilityScores.dexterity) : 0;
  $: {
    const calculated = initiativeModifier(form.abilityScores, form.initiativeBonus || 0);
    if (form.initiative !== calculated) form.initiative = calculated;
  }
  $: proficiencyBonus = getProficiencyBonus(form.level);

  $: abilityModifiers = {
    strength: getAbilityModifier(form.abilityScores.strength),
    dexterity: getAbilityModifier(form.abilityScores.dexterity),
    constitution: getAbilityModifier(form.abilityScores.constitution),
    intelligence: getAbilityModifier(form.abilityScores.intelligence),
    wisdom: getAbilityModifier(form.abilityScores.wisdom),
    charisma: getAbilityModifier(form.abilityScores.charisma)
  };

  $: skillMap = form?.skills
    ? form.skills.reduce((acc, s) => {
        acc[s.name] = s;
        return acc;
      }, {} as Record<string, typeof form.skills[number]>)
    : {};

  $: abilityKeys = Object.keys(form.abilityScores) as AbilityKey[];
  $: savingThrowKeys = Object.keys(form.savingThrows) as AbilityKey[];

  // ✅ VALIDACIÓN REACTIVA
  $: {
    const nameResult = validateCharacterName(form.name);
    errors.name = nameResult.error || '';

    if (!form.class || form.class.trim().length < 2) {
      errors.class = 'La clase debe tener al menos 2 caracteres';
    } else if (form.class.trim().length > 50) {
      errors.class = 'La clase no puede tener más de 50 caracteres';
    } else {
      errors.class = '';
    }

    const levelResult = validateLevel(form.level);
    errors.level = levelResult.error || '';

    const maxHpResult = validateHP(form.maxHp);
    errors.maxHp = maxHpResult.error || '';

    const armorClassResult = validateArmorClass(form.armorClass);
    errors.armorClass = armorClassResult.error || '';

    if (form.speed < 0) {
      errors.speed = 'La velocidad no puede ser negativa';
    } else if (form.speed > 120) {
      errors.speed = 'La velocidad máxima es 120 pies';
    } else {
      errors.speed = '';
    }
  }

    const validateAbilityScoresDebounced = debounce(() => {
    // Validación pesada de ability scores
    const allScoresValid = Object.values(form.abilityScores).every(
      score => Number.isInteger(score) && score >= 1 && score <= 30
    );
    
    if (!allScoresValid) {
      console.warn('Algunas puntuaciones son inválidas');
    }
  }, 300);
  
  // Aplicar validación debounced en cambios de ability scores
  $: if (form.abilityScores && currentStep === 2) {
    validateAbilityScoresDebounced();
  }

  // ✅ FIX: Simplificar validación de pasos
  $: isStepValid = (() => {
    
    switch (currentStep) {
      case 1: {
        const nameValid = form.name.trim() !== '' && !errors.name;
        const classValid = form.class.trim() !== '' && form.class.trim().length >= 2 && !errors.class;
        const levelValid = form.level >= 1 && form.level <= 20 && !errors.level;
        
        const valid = nameValid && classValid && levelValid;
        return valid;
      }
      
      case 3: {
        const valid = form.maxHp > 0 && form.armorClass > 0 && form.speed >= 0 &&
                      !errors.maxHp && !errors.armorClass && !errors.speed;
        return valid;
      }
      
      case 2: {
        const valid = Object.values(form.abilityScores).every(score => Number.isInteger(score) && score >= 1 && score <= 30);
        return valid;
      }
      
      case 5:
      case 6:
      case 4: {
        return true;
      }
      
      default:
        return false;
    }
  })();

  function handleBlur(field: keyof typeof touched) {
    touched[field] = true;
  }

  function nextStep() {
    // ✅ FIX: Solo validar el paso actual
    
    if (!isStepValid) {
      // Marcar campos como touched para mostrar errores
      if (currentStep === 1) {
        touched.name = true;
        touched.class = true;
        touched.level = true;
      } else if (currentStep === 3) {
        touched.maxHp = true;
        touched.armorClass = true;
        touched.speed = true;
      }
      return;
    }

    if (currentStep < totalSteps) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  function toggleSavingThrow(ability: AbilityKey) {
    form.savingThrows[ability] = !form.savingThrows[ability];
  }

  function toggleSkillProficiency(skillName: string) {
    const skillIndex = form.skills.findIndex(s => s.name === skillName);
    
    if (skillIndex === -1) {
      console.error(`Skill not found: ${skillName}`);
      return;
    }
    
    const updatedSkills = [...form.skills];
    const currentProficient = updatedSkills[skillIndex].proficient;
    
    updatedSkills[skillIndex] = {
      ...updatedSkills[skillIndex],
      proficient: !currentProficient,
      expertise: currentProficient ? false : updatedSkills[skillIndex].expertise
    };
    
    form.skills = updatedSkills;
  }

  function toggleSkillExpertise(skillName: string) {
    const skillIndex = form.skills.findIndex(s => s.name === skillName);
    
    if (skillIndex === -1) {
      console.error(`Skill not found: ${skillName}`);
      return;
    }
    
    if (!form.skills[skillIndex].proficient) {
      console.warn(`⚠️ Cannot toggle expertise: ${skillName} is not proficient`);
      return;
    }
    
    const updatedSkills = [...form.skills];
    
    updatedSkills[skillIndex] = {
      ...updatedSkills[skillIndex],
      expertise: !updatedSkills[skillIndex].expertise
    };
    
    form.skills = updatedSkills;
  }

  function getSkillBonus(skill: Skill | undefined): number {
    return skill ? skillBonus(form.abilityScores[skill.ability], skill, proficiencyBonus, hasJackOfAllTrades(form.class, form.level)) : 0;
  }

  function getSaveBonus(ability: AbilityKey): number {
    const abilityMod = abilityModifiers[ability];
    return form.savingThrows[ability] ? abilityMod + proficiencyBonus : abilityMod;
  }

  function handleSubmit() {
    
    // ✅ FIX: Validar todos los pasos antes de enviar
    Object.keys(touched).forEach(key => {
      touched[key as keyof typeof touched] = true;
    });

    if(!form.name.trim()||errors.name||errors.class||errors.level||errors.maxHp||errors.armorClass||errors.speed||Object.values(form.abilityScores).some(v=>!Number.isInteger(v)||v<1||v>30)) {
      currentStep=errors.name||errors.class||errors.level?1:errors.maxHp||errors.armorClass||errors.speed?3:2;return;
    }
    dispatch('submit', form);
  }

  function resetValidation() {
    Object.keys(touched).forEach(key => {
      touched[key as keyof typeof touched] = false;
    });
    Object.keys(errors).forEach(key => {
      errors[key as keyof typeof errors] = '';
    });
    currentStep = 1;
  }

  function handleClose() {
    resetValidation();
    dispatch('close');
  }

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
</script>

{#if isOpen}
  <div class="modal modal-open z-50">
    <div class="character-builder card-parchment border-2 sm:border-4 border-secondary w-full sm:w-11/12 max-w-4xl max-h-[90dvh] relative flex flex-col min-h-0 min-w-0 overflow-x-hidden">
      
      <div class="p-3 sm:p-6 border-b-2 border-secondary flex-shrink-0">
        <button 
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
          on:click={handleClose}
          disabled={busy}
        >✕</button>
        
        <h3 class="font-bold text-xl sm:text-3xl font-medieval text-neutral text-center mb-3 pr-8">
          {isEdit ? '✏️ Editar Personaje' : '🧙‍♂️ Crear Personaje'}
        </h3>

        <div class="grid grid-cols-6 gap-1 mb-2">
          {#each Array(totalSteps) as _, i}
            <div class="flex justify-center min-w-0">
              <button
                class="step-button btn btn-circle btn-sm {currentStep > i + 1 ? 'btn-success' : currentStep === i + 1 ? 'btn-secondary' : 'btn-ghost'}"
                on:click={() => currentStep = i + 1}
                disabled={i + 1 > currentStep}
              >
                {i + 1}
              </button>

            </div>
          {/each}
        </div>

        <div class="text-center text-sm text-neutral/70 font-body">
          {#if submitError}<p role="alert" class="text-error text-sm mb-3">{submitError}</p>{/if}
        {#if currentStep === 1}Información Básica
          {:else if currentStep === 3}Estadísticas de Combate
          {:else if currentStep === 2}Características
          {:else if currentStep === 4}Competencias y Salvaciones
          {:else if currentStep === 5}Rasgos y Dotes
          {:else if currentStep === 6}Hechizos
          {/if}
        </div>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6">
        
        {#if currentStep === 1}
          <div class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medieval text-neutral text-lg">
                  Nombre <span class="text-error">*</span>
                </span>
              </label>
              <input 
                type="text" 
                bind:value={form.name}
                on:blur={() => handleBlur('name')}
                placeholder="Ej: Gandalf el Gris"
                class="input input-bordered bg-[#2d241c] text-base-content 
                      {errors.name && touched.name ? 'border-error border-2' : 'border-primary/50'}"
              />
              {#if errors.name && touched.name}
                <label class="label">
                  <span class="label-text-alt text-error">⚠️ {errors.name}</span>
                </label>
              {/if}
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medieval text-neutral text-lg">
                    Nivel <span class="text-error">*</span>
                  </span>
                </label>
                <input 
                  type="number" 
                  bind:value={form.level}
                  on:blur={() => handleBlur('level')}
                  min="1"
                  max="20"
                  class="input input-bordered bg-[#2d241c] text-base-content 
                        {errors.level && touched.level ? 'border-error border-2' : 'border-primary/50'}"
                />
                {#if errors.level && touched.level}
                  <label class="label">
                    <span class="label-text-alt text-error">⚠️ {errors.level}</span>
                  </label>
                {/if}
              </div>
            </div>

            <CharacterOriginFields bind:form/>
            {#if errors.class}<p class="text-error text-sm">{errors.class}</p>{/if}
            <div class="bg-info/10 p-4 rounded-lg border border-info/30">
              <p class="text-sm font-medieval text-neutral mb-1">
                Bonus de Competencia: +{proficiencyBonus}
              </p>
              <p class="text-xs text-neutral/70">
                Calculado automáticamente según tu nivel
              </p>
            </div>
          </div>
        {/if}

        {#if currentStep === 3}
          <div class="space-y-4">
           {#if form.build}<div class="border border-primary/30 rounded p-2 space-y-2"><label class="block text-sm">Dado de golpe<select aria-label="Dado de golpe" class="select select-bordered select-sm w-full" bind:value={form.build.hitDie}>{#each [6,8,10,12] as die}<option value={die}>d{die}</option>{/each}</select></label><label class="block text-sm">Vida adicional por nivel (especie, dote u otro rasgo)<input class="input input-bordered input-sm w-full" type="number" min="0" max="20" bind:value={hpExtraPerLevel}/></label><button type="button" class="btn btn-sm" on:click={()=>form.maxHp=averageHp(form.build?.hitDie||8,form.level,form.abilityScores.constitution,hpExtraPerLevel)}>Calcular vida con promedio</button><p class="text-xs">Primer nivel: dado máximo + CON. Niveles siguientes: promedio + CON, mínimo 1 por nivel. Ajustá los rasgos adicionales y revisá la vida tras cambiar CON.</p></div>{/if}
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medieval text-neutral text-lg">
                    HP Máximo <span class="text-error">*</span>
                  </span>
                </label>
                <input 
                  type="number" 
                  bind:value={form.maxHp}
                  on:blur={() => handleBlur('maxHp')}
                  min="1"
                  max="999"
                  class="input input-bordered bg-[#2d241c] text-base-content 
                         {errors.maxHp && touched.maxHp ? 'border-error border-2' : 'border-primary/50'}"
                />
                {#if errors.maxHp && touched.maxHp}
                  <label class="label">
                    <span class="label-text-alt text-error">⚠️ {errors.maxHp}</span>
                  </label>
                {/if}
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medieval text-neutral text-lg">
                    Clase de Armadura <span class="text-error">*</span>
                  </span>
                </label>
                <input 
                  type="number" 
                  bind:value={form.armorClass}
                  on:blur={() => handleBlur('armorClass')}
                  min="1"
                  max="30"
                  class="input input-bordered bg-[#2d241c] text-base-content 
                         {errors.armorClass && touched.armorClass ? 'border-error border-2' : 'border-primary/50'}"
                />
                {#if errors.armorClass && touched.armorClass}
                  <label class="label">
                    <span class="label-text-alt text-error">⚠️ {errors.armorClass}</span>
                  </label>
                {/if}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medieval text-neutral text-lg">
                    Bono adicional de iniciativa
                  </span>
                </label>
                <input 
                  type="number" 
                  bind:value={form.initiativeBonus}
                  min="-5"
                  max="15"
                  class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
                />
                <label class="label">
                  <span class="label-text-alt text-neutral/60 italic text-xs">
                    Destreza + bono adicional = {formatModifier(form.initiative)} de iniciativa
                  </span>
                </label>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medieval text-neutral text-lg">
                    Velocidad (pies) <span class="text-error">*</span>
                  </span>
                </label>
                <input 
                  type="number" 
                  bind:value={form.speed}
                  on:blur={() => handleBlur('speed')}
                  min="0"
                  max="120"
                  step="5"
                  class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
                />
                <label class="label">
                  <span class="label-text-alt text-neutral/60 italic text-xs">
                    Velocidad de movimiento (típicamente 30 pies)
                  </span>
                </label>
              </div>
            </div>
          </div>
        {/if}

        {#if currentStep === 2}
          <AbilityScoreSetup bind:form/>
          <div class="space-y-4">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            {#each abilityKeys as ability}
              {#if form.abilityScores[ability] !== undefined}
                <div class="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-lg border-2 border-primary/30">
                  <label class="label pb-2">
                    <span class="label-text font-medieval text-neutral font-bold">
                      {abilityNames[ability]}
                    </span>
                    <span class="badge badge-secondary">{abilityLabels[ability]}</span>
                  </label>
                  
                  <div class="flex items-center gap-2">
                    <input 
                      type="number" 
                      bind:value={form.abilityScores[ability]}
                      min="1"
                      max="30"
                      class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 w-20 text-center text-lg font-bold"
                    />
                    <div class="flex-1 text-center">
                      <div class="text-2xl font-bold text-neutral">
                        {formatModifier(getAbilityModifier(form.abilityScores[ability]))}
                      </div>
                      <div class="text-xs text-neutral/60">modificador</div>
                    </div>
                  </div>
                </div>
              {/if}
            {/each}
            </div>
          </div>
        {/if}

        {#if currentStep === 4}
          <CharacterTrainingFields bind:form/>
          <div class="space-y-6">
            <div>
              <h4 class="font-medieval text-xl text-neutral mb-3 flex items-center gap-2">
                🛡️ Tiradas de Salvación (competencia, sin pericia)
              </h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                {#each savingThrowKeys as ability}
                  <label 
                    class="flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                          {form.savingThrows[ability] ? 'bg-success/20 border-success' : 'bg-neutral/10 border-neutral/30'}">

                    <input 
                      type="checkbox" 
                      checked={form.savingThrows[ability]}
                      on:change={() => toggleSavingThrow(ability)}
                      class="checkbox checkbox-sm checkbox-success"
                    />

                    <div class="flex-1">
                      <div class="font-medieval text-sm">{abilityNames[ability]}</div>
                      <div class="text-xs text-neutral/70">
                        {formatModifier(getSaveBonus(ability))}
                      </div>
                    </div>
                  </label>
                {/each}
              </div>
            </div>
            <div class="divider text-neutral/50">⚔️</div>
            <div>
              <h4 class="font-medieval text-xl text-neutral mb-3 flex items-center gap-2">
                🎯 Habilidades · ★ Pericia
              </h4>
              <div class="space-y-2 max-h-96 overflow-y-auto pr-2">
                {#each DND_SKILLS as skillDef}
                  {#if skillMap[skillDef.name]}
                    <div class="flex items-center gap-2 p-3 rounded-lg border-2 transition-all
                                {skillMap[skillDef.name].expertise ? 'bg-warning/20 border-warning' : 
                                skillMap[skillDef.name].proficient ? 'bg-success/20 border-success' : 
                                'bg-neutral/10 border-neutral/30'}">

                      <label class="flex items-center gap-2 cursor-pointer flex-1">
                        <input 
                          type="checkbox" 
                          checked={skillMap[skillDef.name].proficient || false}
                          on:change={() => toggleSkillProficiency(skillDef.name)}
                          class="checkbox checkbox-sm checkbox-success"
                        />
                        <div class="flex-1">
                          <div class="font-medieval text-sm">{skillDef.label}</div>
                          <div class="text-xs text-neutral/70">
                            {abilityNames[skillDef.ability]} • {formatModifier(getSkillBonus(skillMap[skillDef.name]))}
                          </div>
                        </div>
                      </label>

                      {#if skillMap[skillDef.name].proficient}
                        <button
                          on:click={() => toggleSkillExpertise(skillDef.name)}
                          class="btn btn-xs {skillMap[skillDef.name].expertise ? 'btn-warning' : 'btn-ghost'}"
                          title="Pericia: duplica el bono de competencia de esta habilidad"
                        >
                          ★
                        </button>
                      {/if}
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          </div>
        {/if}
        {#if currentStep === 5}<div class="mb-3"><CharacterChoicesChecklist bind:form/></div><CharacterBuildDetails bind:form/>{/if}
        {#if currentStep === 6 && form.build}<div class="text-sm border border-primary/30 rounded p-2 mb-3"><strong>{form.name}</strong> · {form.class} {form.level}<br/>{[form.build.species.name,form.build.subclass.name,form.build.background.name].filter(Boolean).join(' · ')}<br/>Vida {form.maxHp} · CA {form.armorClass} · Competencia +{proficiencyBonus}</div><CharacterSpellbook bind:build={form.build} level={form.level} abilityScores={form.abilityScores}/>{/if}
      </div>
      <div class="p-3 sm:p-6 border-t-2 border-secondary flex-shrink-0">
        <div class="grid grid-cols-2 gap-2 sm:gap-4">
          <button 
            on:click={prevStep}
            class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
            disabled={currentStep === 1 || busy}
          >
            ← Anterior
          </button>

          {#if currentStep < totalSteps}
            <button 
              on:click={nextStep}
              class="btn btn-dnd"
              disabled={!isStepValid || busy}
              type="button"
            >
              Siguiente →
            </button>
          {:else}
            <button 
              on:click={handleSubmit}
              class="btn btn-dnd"
              disabled={!isStepValid || busy}
              type="button"
            >
              <span class="text-xl">{isEdit ? '💾' : '✨'}</span>
              {busy ? 'Guardando…' : isEdit ? 'Guardar Cambios' : 'Crear Personaje'}
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .step-button { min-width: 0; width: 100%; max-width: 2.75rem; padding-inline: 0; }
  .step-button:disabled { color: #66594a; background: #d4c39d; opacity: 1; }
  .character-builder :global(.input), .character-builder :global(.select), .character-builder :global(.textarea) { color: #f7ecd8; background-color: #2d241c; }
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: rgba(139, 69, 19, 0.1);
    border-radius: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #8B4513, #654321);
    border-radius: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #A0522D, #8B4513);
  }
</style>
