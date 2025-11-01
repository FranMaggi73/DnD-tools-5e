<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { CharacterForm, AbilityScores, SavingThrows, Skill, AbilityKey } from '$lib/types';
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

  export let isOpen = false;
  export let isEdit = false;
  export let form: CharacterForm;

  const dispatch = createEventDispatcher();

  // Estado actual del formulario (paso del wizard)
  let currentStep = 1;
  const totalSteps = 4;

  // Estados de validación
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

  // Calcular proficiency bonus basado en el nivel
  $: proficiencyBonus = getProficiencyBonus(form.level);

  // Calcular modificadores de habilidades
  $: abilityModifiers = {
    strength: getAbilityModifier(form.abilityScores.strength),
    dexterity: getAbilityModifier(form.abilityScores.dexterity),
    constitution: getAbilityModifier(form.abilityScores.constitution),
    intelligence: getAbilityModifier(form.abilityScores.intelligence),
    wisdom: getAbilityModifier(form.abilityScores.wisdom),
    charisma: getAbilityModifier(form.abilityScores.charisma)
  };

  // reactive lookup rápido para no buscar con .find() todo el tiempo
  $: skillMap = form?.skills
    ? form.skills.reduce((acc, s) => {
        acc[s.name] = s;
        return acc;
      }, {} as Record<string, typeof form.skills[number]>)
    : {};

  // Precalcular listas de keys para iterar sin casts en template
  $: abilityKeys = Object.keys(form.abilityScores) as AbilityKey[];
  $: savingThrowKeys = Object.keys(form.savingThrows) as AbilityKey[];

  // ✅ VALIDACIÓN REACTIVA - Validar independientemente de touched
  $: {
    // Name validation
    const nameResult = validateCharacterName(form.name);
    errors.name = nameResult.error || '';

    // Class validation
    if (!form.class || form.class.trim().length < 2) {
      errors.class = 'La clase debe tener al menos 2 caracteres';
    } else if (form.class.trim().length > 50) {
      errors.class = 'La clase no puede tener más de 50 caracteres';
    } else {
      errors.class = '';
    }

    // Level validation
    const levelResult = validateLevel(form.level);
    errors.level = levelResult.error || '';

    // MaxHp validation
    const maxHpResult = validateHP(form.maxHp);
    errors.maxHp = maxHpResult.error || '';

    // ArmorClass validation
    const armorClassResult = validateArmorClass(form.armorClass);
    errors.armorClass = armorClassResult.error || '';

    // Speed validation
    if (form.speed < 0) {
      errors.speed = 'La velocidad no puede ser negativa';
    } else if (form.speed > 120) {
      errors.speed = 'La velocidad máxima es 120 pies';
    } else {
      errors.speed = '';
    }
  }

  // ✅ VERIFICAR SI EL PASO ACTUAL ES VÁLIDO (sin depender de touched)
  $: isStepValid = validateCurrentStep();

  function validateCurrentStep(): boolean {
    switch (currentStep) {
      case 1: // Información básica
        const nameValid = form.name.trim() !== '' && !errors.name;
        const classValid = form.class.trim() !== '' && form.class.trim().length >= 2 && !errors.class;
        const levelValid = form.level >= 1 && form.level <= 20 && !errors.level;
        
        console.log('Step 1 validation:', { 
          nameValid, 
          classValid, 
          levelValid, 
          name: form.name,
          class: form.class,
          level: form.level,
          errors 
        });
        return nameValid && classValid && levelValid;
      
      case 2: // Combat Stats
        return form.maxHp > 0 && 
               form.armorClass > 0 && 
               form.speed >= 0 &&
               !errors.maxHp && 
               !errors.armorClass && 
               !errors.speed;
      
      case 3: // Ability Scores
        return Object.values(form.abilityScores).every(score => score >= 1 && score <= 30);
      
      case 4: // Skills & Saves
        return true; // Siempre válido, son opcionales
      
      default:
        return false;
    }
  }

  function handleBlur(field: keyof typeof touched) {
    touched[field] = true;
  }

  function nextStep() {
    // Marcar campos del paso actual como tocados
    if (currentStep === 1) {
      touched.name = true;
      touched.class = true;
      touched.level = true;
    } else if (currentStep === 2) {
      touched.maxHp = true;
      touched.armorClass = true;
      touched.speed = true;
    }

    if (isStepValid && currentStep < totalSteps) {
      currentStep++;
    } else {
      console.log('❌ Step validation failed:', { 
        currentStep, 
        isStepValid, 
        errors, 
        form,
        touched 
      });
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
    const skill = form.skills.find(s => s.name === skillName);
    if (skill) {
      skill.proficient = !skill.proficient;
      if (!skill.proficient) skill.expertise = false;
    }
  }

  function toggleSkillExpertise(skillName: string) {
    const skill = form.skills.find(s => s.name === skillName);
    if (skill && skill.proficient) {
      skill.expertise = !skill.expertise;
    }
  }

  function getSkillBonus(skill: Skill | undefined): number {
    if (!skill) return 0;
    const abilityMod = abilityModifiers[skill.ability];
    let bonus = abilityMod;
    
    if (skill.expertise) {
      bonus += proficiencyBonus * 2;
    } else if (skill.proficient) {
      bonus += proficiencyBonus;
    }
    
    return bonus;
  }

  function getSaveBonus(ability: AbilityKey): number {
    const abilityMod = abilityModifiers[ability];
    return form.savingThrows[ability] ? abilityMod + proficiencyBonus : abilityMod;
  }

  function handleSubmit() {
    // Marcar todos como tocados
    Object.keys(touched).forEach(key => {
      touched[key as keyof typeof touched] = true;
    });

    // Validar todos los pasos
    let allValid = true;
    for (let step = 1; step <= totalSteps; step++) {
      currentStep = step;
      if (!validateCurrentStep()) {
        allValid = false;
        console.log('❌ Validation failed at step:', step);
        break;
      }
    }

    if (allValid) {
      dispatch('submit', form);
      resetValidation();
    }
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

  // Habilidades en español
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
    <div class="card-parchment border-4 border-secondary w-11/12 max-w-4xl max-h-[90vh] relative flex flex-col">
      
      <!-- Header -->
      <div class="p-6 border-b-2 border-secondary flex-shrink-0">
        <button 
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
          on:click={handleClose}
        >✕</button>
        
        <h3 class="font-bold text-3xl font-medieval text-neutral text-center mb-4">
          {isEdit ? '✏️ Editar Personaje' : '🧙‍♂️ Crear Personaje'}
        </h3>

        <!-- Progress Steps -->
        <div class="flex justify-between items-center mb-2">
          {#each Array(totalSteps) as _, i}
            <div class="flex items-center flex-1">
              <button
                class="btn btn-circle btn-sm {currentStep > i + 1 ? 'btn-success' : currentStep === i + 1 ? 'btn-secondary' : 'btn-ghost'}"
                on:click={() => currentStep = i + 1}
                disabled={i + 1 > currentStep}
              >
                {i + 1}
              </button>
              {#if i < totalSteps - 1}
                <div class="flex-1 h-1 mx-2 bg-base-300 rounded">
                  <div 
                    class="h-full bg-secondary rounded transition-all duration-300"
                    style="width: {currentStep > i + 1 ? '100%' : '0%'}"
                  ></div>
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <div class="text-center text-sm text-neutral/70 font-body">
          {#if currentStep === 1}Información Básica
          {:else if currentStep === 2}Estadísticas de Combate
          {:else if currentStep === 3}Puntuaciones de Habilidad
          {:else if currentStep === 4}Competencias & Salvaciones
          {/if}
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        
        <!-- STEP 1: Información Básica -->
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
                on:input={() => touched.name = true}
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
                    Clase <span class="text-error">*</span>
                  </span>
                </label>
                <input 
                  type="text" 
                  bind:value={form.class}
                  on:blur={() => handleBlur('class')}
                  on:input={() => touched.class = true}
                  placeholder="Ej: Mago"
                  class="input input-bordered bg-[#2d241c] text-base-content 
                        {errors.class && touched.class ? 'border-error border-2' : 'border-primary/50'}"
                />
                {#if errors.class && touched.class}
                  <label class="label">
                    <span class="label-text-alt text-error">⚠️ {errors.class}</span>
                  </label>
                {/if}
              </div>

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
                  on:input={() => touched.level = true}
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

        <!-- STEP 2: Combat Stats -->
        {#if currentStep === 2}
          <div class="space-y-4">
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
                    Iniciativa <span class="text-error">*</span>
                  </span>
                </label>
                <input 
                  type="number" 
                  bind:value={form.initiative}
                  min="-5"
                  max="15"
                  class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
                />
                <label class="label">
                  <span class="label-text-alt text-neutral/60 italic text-xs">
                    Normalmente es tu modificador de Destreza
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

        <!-- STEP 3: Ability Scores -->
        {#if currentStep === 3}
          <div class="space-y-4">
            <div class="alert bg-info/20 border-info/40">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-info" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm">Las puntuaciones van de 1 a 30. El modificador se calcula automáticamente.</span>
            </div>

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

        <!-- STEP 4: Skills & Saves -->
        {#if currentStep === 4}
          <div class="space-y-6">
            
            <!-- Saving Throws -->
            <div>
              <h4 class="font-medieval text-xl text-neutral mb-3 flex items-center gap-2">
                🛡️ Tiradas de Salvación
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

            <!-- Skills -->
            <div>
              <h4 class="font-medieval text-xl text-neutral mb-3 flex items-center gap-2">
                🎯 Habilidades
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
                          title="Expertise (x2 proficiency)"
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
      </div>

      <!-- Footer -->
      <div class="p-6 border-t-2 border-secondary flex-shrink-0">
        <div class="flex justify-between gap-4">
          <button 
            on:click={prevStep}
            class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
            disabled={currentStep === 1}
          >
            ← Anterior
          </button>

          {#if currentStep < totalSteps}
            <button 
              on:click={nextStep}
              class="btn btn-dnd"
              disabled={!isStepValid}
            >
              Siguiente →
            </button>
          {:else}
            <button 
              on:click={handleSubmit}
              class="btn btn-dnd"
              disabled={!isStepValid}
            >
              <span class="text-xl">{isEdit ? '💾' : '✨'}</span>
              {isEdit ? 'Guardar Cambios' : 'Crear Personaje'}
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Scroll personalizado */
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
