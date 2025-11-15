import { c as create_ssr_component, g as createEventDispatcher, f as escape, e as each, d as add_attribute, b as subscribe, o as onDestroy, v as validate_component } from "../../../../../chunks/ssr.js";
import { p as page } from "../../../../../chunks/stores.js";
import { u as userStore } from "../../../../../chunks/authStore.js";
import "lodash/debounce.js";
import { h as headerTitle } from "../../../../../chunks/uiStore.js";
import { getFirestore } from "firebase/firestore";
import { a as app } from "../../../../../chunks/firebase.js";
function getAbilityModifier(score) {
  return Math.floor((score - 10) / 2);
}
function getProficiencyBonus(level) {
  return Math.floor((level - 1) / 4) + 2;
}
const DND_SKILLS = [
  { name: "Acrobatics", ability: "dexterity", label: "Acrobacias" },
  { name: "Animal Handling", ability: "wisdom", label: "Trato con Animales" },
  { name: "Arcana", ability: "intelligence", label: "Arcano" },
  { name: "Athletics", ability: "strength", label: "Atletismo" },
  { name: "Deception", ability: "charisma", label: "Engaño" },
  { name: "History", ability: "intelligence", label: "Historia" },
  { name: "Insight", ability: "wisdom", label: "Perspicacia" },
  { name: "Intimidation", ability: "charisma", label: "Intimidación" },
  { name: "Investigation", ability: "intelligence", label: "Investigación" },
  { name: "Medicine", ability: "wisdom", label: "Medicina" },
  { name: "Nature", ability: "intelligence", label: "Naturaleza" },
  { name: "Perception", ability: "wisdom", label: "Percepción" },
  { name: "Performance", ability: "charisma", label: "Interpretación" },
  { name: "Persuasion", ability: "charisma", label: "Persuasión" },
  { name: "Religion", ability: "intelligence", label: "Religión" },
  { name: "Sleight of Hand", ability: "dexterity", label: "Juego de Manos" },
  { name: "Stealth", ability: "dexterity", label: "Sigilo" },
  { name: "Survival", ability: "wisdom", label: "Supervivencia" }
];
function validateCharacterName(name) {
  if (!name || !name.trim()) {
    return { valid: false, error: "El nombre no puede estar vacío" };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: "El nombre debe tener al menos 2 caracteres" };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: "El nombre no puede tener más de 50 caracteres" };
  }
  return { valid: true };
}
function validateLevel(level) {
  if (level < 1) {
    return { valid: false, error: "El nivel mínimo es 1" };
  }
  if (level > 20) {
    return { valid: false, error: "El nivel máximo es 20" };
  }
  return { valid: true };
}
function validateHP(hp, max) {
  if (hp < 0) {
    return { valid: false, error: "Los HP no pueden ser negativos" };
  }
  if (hp > 999) {
    return { valid: false, error: "Los HP no pueden ser mayores a 999" };
  }
  return { valid: true };
}
function validateArmorClass(ac) {
  if (ac < 1) {
    return { valid: false, error: "La CA mínima es 1" };
  }
  if (ac > 30) {
    return { valid: false, error: "La CA máxima es 30" };
  }
  return { valid: true };
}
const css = {
  code: ".overflow-y-auto.svelte-p7d1us::-webkit-scrollbar{width:8px}.overflow-y-auto.svelte-p7d1us::-webkit-scrollbar-track{background:rgba(139, 69, 19, 0.1);border-radius:4px}.overflow-y-auto.svelte-p7d1us::-webkit-scrollbar-thumb{background:linear-gradient(to bottom, #8B4513, #654321);border-radius:4px}.overflow-y-auto.svelte-p7d1us::-webkit-scrollbar-thumb:hover{background:linear-gradient(to bottom, #A0522D, #8B4513)}",
  map: `{"version":3,"file":"CharacterFormModal.svelte","sources":["CharacterFormModal.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { createEventDispatcher } from \\"svelte\\";\\nimport {\\n  getAbilityModifier,\\n  formatModifier,\\n  getProficiencyBonus,\\n  DND_SKILLS\\n} from \\"$lib/types\\";\\nimport {\\n  validateCharacterName,\\n  validateHP,\\n  validateArmorClass,\\n  validateLevel\\n} from \\"$lib/utils/validation\\";\\nexport let isOpen = false;\\nexport let isEdit = false;\\nexport let form;\\nconst dispatch = createEventDispatcher();\\nlet currentStep = 1;\\nconst totalSteps = 4;\\nlet errors = {\\n  name: \\"\\",\\n  class: \\"\\",\\n  level: \\"\\",\\n  maxHp: \\"\\",\\n  armorClass: \\"\\",\\n  speed: \\"\\"\\n};\\nlet touched = {\\n  name: false,\\n  class: false,\\n  level: false,\\n  maxHp: false,\\n  armorClass: false,\\n  speed: false\\n};\\n$: proficiencyBonus = getProficiencyBonus(form.level);\\n$: abilityModifiers = {\\n  strength: getAbilityModifier(form.abilityScores.strength),\\n  dexterity: getAbilityModifier(form.abilityScores.dexterity),\\n  constitution: getAbilityModifier(form.abilityScores.constitution),\\n  intelligence: getAbilityModifier(form.abilityScores.intelligence),\\n  wisdom: getAbilityModifier(form.abilityScores.wisdom),\\n  charisma: getAbilityModifier(form.abilityScores.charisma)\\n};\\n$: skillMap = form?.skills ? form.skills.reduce((acc, s) => {\\n  acc[s.name] = s;\\n  return acc;\\n}, {}) : {};\\n$: abilityKeys = Object.keys(form.abilityScores);\\n$: savingThrowKeys = Object.keys(form.savingThrows);\\n$: {\\n  const nameResult = validateCharacterName(form.name);\\n  errors.name = nameResult.error || \\"\\";\\n  if (!form.class || form.class.trim().length < 2) {\\n    errors.class = \\"La clase debe tener al menos 2 caracteres\\";\\n  } else if (form.class.trim().length > 50) {\\n    errors.class = \\"La clase no puede tener m\\\\xE1s de 50 caracteres\\";\\n  } else {\\n    errors.class = \\"\\";\\n  }\\n  const levelResult = validateLevel(form.level);\\n  errors.level = levelResult.error || \\"\\";\\n  const maxHpResult = validateHP(form.maxHp);\\n  errors.maxHp = maxHpResult.error || \\"\\";\\n  const armorClassResult = validateArmorClass(form.armorClass);\\n  errors.armorClass = armorClassResult.error || \\"\\";\\n  if (form.speed < 0) {\\n    errors.speed = \\"La velocidad no puede ser negativa\\";\\n  } else if (form.speed > 120) {\\n    errors.speed = \\"La velocidad m\\\\xE1xima es 120 pies\\";\\n  } else {\\n    errors.speed = \\"\\";\\n  }\\n}\\n$: isStepValid = (() => {\\n  switch (currentStep) {\\n    case 1: {\\n      const nameValid = form.name.trim() !== \\"\\" && !errors.name;\\n      const classValid = form.class.trim() !== \\"\\" && form.class.trim().length >= 2 && !errors.class;\\n      const levelValid = form.level >= 1 && form.level <= 20 && !errors.level;\\n      const valid = nameValid && classValid && levelValid;\\n      return valid;\\n    }\\n    case 2: {\\n      const valid = form.maxHp > 0 && form.armorClass > 0 && form.speed >= 0 && !errors.maxHp && !errors.armorClass && !errors.speed;\\n      return valid;\\n    }\\n    case 3: {\\n      const valid = Object.values(form.abilityScores).every((score) => score >= 1 && score <= 30);\\n      return valid;\\n    }\\n    case 4: {\\n      return true;\\n    }\\n    default:\\n      return false;\\n  }\\n})();\\nfunction handleBlur(field) {\\n  touched[field] = true;\\n}\\nfunction nextStep() {\\n  if (!isStepValid) {\\n    if (currentStep === 1) {\\n      touched.name = true;\\n      touched.class = true;\\n      touched.level = true;\\n    } else if (currentStep === 2) {\\n      touched.maxHp = true;\\n      touched.armorClass = true;\\n      touched.speed = true;\\n    }\\n    return;\\n  }\\n  if (currentStep < totalSteps) {\\n    currentStep++;\\n  }\\n}\\nfunction prevStep() {\\n  if (currentStep > 1) {\\n    currentStep--;\\n  }\\n}\\nfunction toggleSavingThrow(ability) {\\n  form.savingThrows[ability] = !form.savingThrows[ability];\\n}\\nfunction toggleSkillProficiency(skillName) {\\n  const skillIndex = form.skills.findIndex((s) => s.name === skillName);\\n  if (skillIndex === -1) {\\n    console.error(\`Skill not found: \${skillName}\`);\\n    return;\\n  }\\n  const updatedSkills = [...form.skills];\\n  const currentProficient = updatedSkills[skillIndex].proficient;\\n  updatedSkills[skillIndex] = {\\n    ...updatedSkills[skillIndex],\\n    proficient: !currentProficient,\\n    expertise: currentProficient ? false : updatedSkills[skillIndex].expertise\\n  };\\n  form.skills = updatedSkills;\\n}\\nfunction toggleSkillExpertise(skillName) {\\n  const skillIndex = form.skills.findIndex((s) => s.name === skillName);\\n  if (skillIndex === -1) {\\n    console.error(\`Skill not found: \${skillName}\`);\\n    return;\\n  }\\n  if (!form.skills[skillIndex].proficient) {\\n    console.warn(\`\\\\u26A0\\\\uFE0F Cannot toggle expertise: \${skillName} is not proficient\`);\\n    return;\\n  }\\n  const updatedSkills = [...form.skills];\\n  updatedSkills[skillIndex] = {\\n    ...updatedSkills[skillIndex],\\n    expertise: !updatedSkills[skillIndex].expertise\\n  };\\n  form.skills = updatedSkills;\\n}\\nfunction getSkillBonus(skill) {\\n  if (!skill) return 0;\\n  const abilityMod = abilityModifiers[skill.ability];\\n  let bonus = abilityMod;\\n  if (skill.expertise) {\\n    bonus += proficiencyBonus * 2;\\n  } else if (skill.proficient) {\\n    bonus += proficiencyBonus;\\n  }\\n  return bonus;\\n}\\nfunction getSaveBonus(ability) {\\n  const abilityMod = abilityModifiers[ability];\\n  return form.savingThrows[ability] ? abilityMod + proficiencyBonus : abilityMod;\\n}\\nfunction handleSubmit() {\\n  Object.keys(touched).forEach((key) => {\\n    touched[key] = true;\\n  });\\n  for (let step = 1; step <= totalSteps; step++) {\\n    currentStep = step;\\n    if (!isStepValid) {\\n      return;\\n    }\\n  }\\n  dispatch(\\"submit\\", form);\\n  resetValidation();\\n}\\nfunction resetValidation() {\\n  Object.keys(touched).forEach((key) => {\\n    touched[key] = false;\\n  });\\n  Object.keys(errors).forEach((key) => {\\n    errors[key] = \\"\\";\\n  });\\n  currentStep = 1;\\n}\\nfunction handleClose() {\\n  resetValidation();\\n  dispatch(\\"close\\");\\n}\\nconst abilityLabels = {\\n  strength: \\"FUE\\",\\n  dexterity: \\"DES\\",\\n  constitution: \\"CON\\",\\n  intelligence: \\"INT\\",\\n  wisdom: \\"SAB\\",\\n  charisma: \\"CAR\\"\\n};\\nconst abilityNames = {\\n  strength: \\"Fuerza\\",\\n  dexterity: \\"Destreza\\",\\n  constitution: \\"Constituci\\\\xF3n\\",\\n  intelligence: \\"Inteligencia\\",\\n  wisdom: \\"Sabidur\\\\xEDa\\",\\n  charisma: \\"Carisma\\"\\n};\\n<\/script>\\r\\n\\r\\n{#if isOpen}\\r\\n  <div class=\\"modal modal-open z-50\\">\\r\\n    <div class=\\"card-parchment border-4 border-secondary w-11/12 max-w-4xl max-h-[90vh] relative flex flex-col\\">\\r\\n      \\r\\n      <div class=\\"p-6 border-b-2 border-secondary flex-shrink-0\\">\\r\\n        <button \\r\\n          class=\\"btn btn-sm btn-circle btn-ghost absolute right-2 top-2\\" \\r\\n          on:click={handleClose}\\r\\n        >✕</button>\\r\\n        \\r\\n        <h3 class=\\"font-bold text-3xl font-medieval text-neutral text-center mb-4\\">\\r\\n          {isEdit ? '✏️ Editar Personaje' : '🧙‍♂️ Crear Personaje'}\\r\\n        </h3>\\r\\n\\r\\n        <div class=\\"flex justify-between items-center mb-2\\">\\r\\n          {#each Array(totalSteps) as _, i}\\r\\n            <div class=\\"flex items-center flex-1\\">\\r\\n              <button\\r\\n                class=\\"btn btn-circle btn-sm {currentStep > i + 1 ? 'btn-success' : currentStep === i + 1 ? 'btn-secondary' : 'btn-ghost'}\\"\\r\\n                on:click={() => currentStep = i + 1}\\r\\n                disabled={i + 1 > currentStep}\\r\\n              >\\r\\n                {i + 1}\\r\\n              </button>\\r\\n              {#if i < totalSteps - 1}\\r\\n                <div class=\\"flex-1 h-1 mx-2 bg-base-300 rounded\\">\\r\\n                  <div \\r\\n                    class=\\"h-full bg-secondary rounded transition-all duration-300\\"\\r\\n                    style=\\"width: {currentStep > i + 1 ? '100%' : '0%'}\\"\\r\\n                  ></div>\\r\\n                </div>\\r\\n              {/if}\\r\\n            </div>\\r\\n          {/each}\\r\\n        </div>\\r\\n\\r\\n        <div class=\\"text-center text-sm text-neutral/70 font-body\\">\\r\\n          {#if currentStep === 1}Información Básica\\r\\n          {:else if currentStep === 2}Estadísticas de Combate\\r\\n          {:else if currentStep === 3}Puntuaciones de Habilidad\\r\\n          {:else if currentStep === 4}Competencias & Salvaciones\\r\\n          {/if}\\r\\n        </div>\\r\\n      </div>\\r\\n\\r\\n      <div class=\\"flex-1 overflow-y-auto p-6\\">\\r\\n        \\r\\n        {#if currentStep === 1}\\r\\n          <div class=\\"space-y-4\\">\\r\\n            <div class=\\"form-control\\">\\r\\n              <label class=\\"label\\">\\r\\n                <span class=\\"label-text font-medieval text-neutral text-lg\\">\\r\\n                  Nombre <span class=\\"text-error\\">*</span>\\r\\n                </span>\\r\\n              </label>\\r\\n              <input \\r\\n                type=\\"text\\" \\r\\n                bind:value={form.name}\\r\\n                on:blur={() => handleBlur('name')}\\r\\n                placeholder=\\"Ej: Gandalf el Gris\\"\\r\\n                class=\\"input input-bordered bg-[#2d241c] text-base-content \\r\\n                      {errors.name && touched.name ? 'border-error border-2' : 'border-primary/50'}\\"\\r\\n              />\\r\\n              {#if errors.name && touched.name}\\r\\n                <label class=\\"label\\">\\r\\n                  <span class=\\"label-text-alt text-error\\">⚠️ {errors.name}</span>\\r\\n                </label>\\r\\n              {/if}\\r\\n            </div>\\r\\n\\r\\n            <div class=\\"grid grid-cols-2 gap-4\\">\\r\\n              <div class=\\"form-control\\">\\r\\n                <label class=\\"label\\">\\r\\n                  <span class=\\"label-text font-medieval text-neutral text-lg\\">\\r\\n                    Clase <span class=\\"text-error\\">*</span>\\r\\n                  </span>\\r\\n                </label>\\r\\n                <input \\r\\n                  type=\\"text\\" \\r\\n                  bind:value={form.class}\\r\\n                  on:blur={() => handleBlur('class')}\\r\\n                  placeholder=\\"Ej: Mago\\"\\r\\n                  class=\\"input input-bordered bg-[#2d241c] text-base-content \\r\\n                        {errors.class && touched.class ? 'border-error border-2' : 'border-primary/50'}\\"\\r\\n                />\\r\\n                {#if errors.class && touched.class}\\r\\n                  <label class=\\"label\\">\\r\\n                    <span class=\\"label-text-alt text-error\\">⚠️ {errors.class}</span>\\r\\n                  </label>\\r\\n                {/if}\\r\\n              </div>\\r\\n\\r\\n              <div class=\\"form-control\\">\\r\\n                <label class=\\"label\\">\\r\\n                  <span class=\\"label-text font-medieval text-neutral text-lg\\">\\r\\n                    Nivel <span class=\\"text-error\\">*</span>\\r\\n                  </span>\\r\\n                </label>\\r\\n                <input \\r\\n                  type=\\"number\\" \\r\\n                  bind:value={form.level}\\r\\n                  on:blur={() => handleBlur('level')}\\r\\n                  min=\\"1\\"\\r\\n                  max=\\"20\\"\\r\\n                  class=\\"input input-bordered bg-[#2d241c] text-base-content \\r\\n                        {errors.level && touched.level ? 'border-error border-2' : 'border-primary/50'}\\"\\r\\n                />\\r\\n                {#if errors.level && touched.level}\\r\\n                  <label class=\\"label\\">\\r\\n                    <span class=\\"label-text-alt text-error\\">⚠️ {errors.level}</span>\\r\\n                  </label>\\r\\n                {/if}\\r\\n              </div>\\r\\n            </div>\\r\\n\\r\\n            <div class=\\"bg-info/10 p-4 rounded-lg border border-info/30\\">\\r\\n              <p class=\\"text-sm font-medieval text-neutral mb-1\\">\\r\\n                Bonus de Competencia: +{proficiencyBonus}\\r\\n              </p>\\r\\n              <p class=\\"text-xs text-neutral/70\\">\\r\\n                Calculado automáticamente según tu nivel\\r\\n              </p>\\r\\n            </div>\\r\\n          </div>\\r\\n        {/if}\\r\\n\\r\\n        {#if currentStep === 2}\\r\\n          <div class=\\"space-y-4\\">\\r\\n            <div class=\\"grid grid-cols-2 gap-4\\">\\r\\n              <div class=\\"form-control\\">\\r\\n                <label class=\\"label\\">\\r\\n                  <span class=\\"label-text font-medieval text-neutral text-lg\\">\\r\\n                    HP Máximo <span class=\\"text-error\\">*</span>\\r\\n                  </span>\\r\\n                </label>\\r\\n                <input \\r\\n                  type=\\"number\\" \\r\\n                  bind:value={form.maxHp}\\r\\n                  on:blur={() => handleBlur('maxHp')}\\r\\n                  min=\\"1\\"\\r\\n                  max=\\"999\\"\\r\\n                  class=\\"input input-bordered bg-[#2d241c] text-base-content \\r\\n                         {errors.maxHp && touched.maxHp ? 'border-error border-2' : 'border-primary/50'}\\"\\r\\n                />\\r\\n                {#if errors.maxHp && touched.maxHp}\\r\\n                  <label class=\\"label\\">\\r\\n                    <span class=\\"label-text-alt text-error\\">⚠️ {errors.maxHp}</span>\\r\\n                  </label>\\r\\n                {/if}\\r\\n              </div>\\r\\n\\r\\n              <div class=\\"form-control\\">\\r\\n                <label class=\\"label\\">\\r\\n                  <span class=\\"label-text font-medieval text-neutral text-lg\\">\\r\\n                    Clase de Armadura <span class=\\"text-error\\">*</span>\\r\\n                  </span>\\r\\n                </label>\\r\\n                <input \\r\\n                  type=\\"number\\" \\r\\n                  bind:value={form.armorClass}\\r\\n                  on:blur={() => handleBlur('armorClass')}\\r\\n                  min=\\"1\\"\\r\\n                  max=\\"30\\"\\r\\n                  class=\\"input input-bordered bg-[#2d241c] text-base-content \\r\\n                         {errors.armorClass && touched.armorClass ? 'border-error border-2' : 'border-primary/50'}\\"\\r\\n                />\\r\\n                {#if errors.armorClass && touched.armorClass}\\r\\n                  <label class=\\"label\\">\\r\\n                    <span class=\\"label-text-alt text-error\\">⚠️ {errors.armorClass}</span>\\r\\n                  </label>\\r\\n                {/if}\\r\\n              </div>\\r\\n            </div>\\r\\n\\r\\n            <div class=\\"grid grid-cols-2 gap-4\\">\\r\\n              <div class=\\"form-control\\">\\r\\n                <label class=\\"label\\">\\r\\n                  <span class=\\"label-text font-medieval text-neutral text-lg\\">\\r\\n                    Iniciativa <span class=\\"text-error\\">*</span>\\r\\n                  </span>\\r\\n                </label>\\r\\n                <input \\r\\n                  type=\\"number\\" \\r\\n                  bind:value={form.initiative}\\r\\n                  min=\\"-5\\"\\r\\n                  max=\\"15\\"\\r\\n                  class=\\"input input-bordered bg-[#2d241c] text-base-content border-primary/50\\"\\r\\n                />\\r\\n                <label class=\\"label\\">\\r\\n                  <span class=\\"label-text-alt text-neutral/60 italic text-xs\\">\\r\\n                    Normalmente es tu modificador de Destreza\\r\\n                  </span>\\r\\n                </label>\\r\\n              </div>\\r\\n\\r\\n              <div class=\\"form-control\\">\\r\\n                <label class=\\"label\\">\\r\\n                  <span class=\\"label-text font-medieval text-neutral text-lg\\">\\r\\n                    Velocidad (pies) <span class=\\"text-error\\">*</span>\\r\\n                  </span>\\r\\n                </label>\\r\\n                <input \\r\\n                  type=\\"number\\" \\r\\n                  bind:value={form.speed}\\r\\n                  on:blur={() => handleBlur('speed')}\\r\\n                  min=\\"0\\"\\r\\n                  max=\\"120\\"\\r\\n                  step=\\"5\\"\\r\\n                  class=\\"input input-bordered bg-[#2d241c] text-base-content border-primary/50\\"\\r\\n                />\\r\\n                <label class=\\"label\\">\\r\\n                  <span class=\\"label-text-alt text-neutral/60 italic text-xs\\">\\r\\n                    Velocidad de movimiento (típicamente 30 pies)\\r\\n                  </span>\\r\\n                </label>\\r\\n              </div>\\r\\n            </div>\\r\\n          </div>\\r\\n        {/if}\\r\\n\\r\\n        {#if currentStep === 3}\\r\\n          <div class=\\"space-y-4\\">\\r\\n            <div class=\\"grid grid-cols-2 md:grid-cols-3 gap-4\\">\\r\\n            {#each abilityKeys as ability}\\r\\n              {#if form.abilityScores[ability] !== undefined}\\r\\n                <div class=\\"bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-lg border-2 border-primary/30\\">\\r\\n                  <label class=\\"label pb-2\\">\\r\\n                    <span class=\\"label-text font-medieval text-neutral font-bold\\">\\r\\n                      {abilityNames[ability]}\\r\\n                    </span>\\r\\n                    <span class=\\"badge badge-secondary\\">{abilityLabels[ability]}</span>\\r\\n                  </label>\\r\\n                  \\r\\n                  <div class=\\"flex items-center gap-2\\">\\r\\n                    <input \\r\\n                      type=\\"number\\" \\r\\n                      bind:value={form.abilityScores[ability]}\\r\\n                      min=\\"1\\"\\r\\n                      max=\\"30\\"\\r\\n                      class=\\"input input-bordered bg-[#2d241c] text-base-content border-primary/50 w-20 text-center text-lg font-bold\\"\\r\\n                    />\\r\\n                    <div class=\\"flex-1 text-center\\">\\r\\n                      <div class=\\"text-2xl font-bold text-neutral\\">\\r\\n                        {formatModifier(getAbilityModifier(form.abilityScores[ability]))}\\r\\n                      </div>\\r\\n                      <div class=\\"text-xs text-neutral/60\\">modificador</div>\\r\\n                    </div>\\r\\n                  </div>\\r\\n                </div>\\r\\n              {/if}\\r\\n            {/each}\\r\\n            </div>\\r\\n          </div>\\r\\n        {/if}\\r\\n\\r\\n        {#if currentStep === 4}\\r\\n          <div class=\\"space-y-6\\">\\r\\n            <div>\\r\\n              <h4 class=\\"font-medieval text-xl text-neutral mb-3 flex items-center gap-2\\">\\r\\n                🛡️ Tiradas de Salvación\\r\\n              </h4>\\r\\n              <div class=\\"grid grid-cols-2 md:grid-cols-3 gap-3\\">\\r\\n                {#each savingThrowKeys as ability}\\r\\n                  <label \\r\\n                    class=\\"flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all\\r\\n                          {form.savingThrows[ability] ? 'bg-success/20 border-success' : 'bg-neutral/10 border-neutral/30'}\\">\\r\\n\\r\\n                    <input \\r\\n                      type=\\"checkbox\\" \\r\\n                      checked={form.savingThrows[ability]}\\r\\n                      on:change={() => toggleSavingThrow(ability)}\\r\\n                      class=\\"checkbox checkbox-sm checkbox-success\\"\\r\\n                    />\\r\\n\\r\\n                    <div class=\\"flex-1\\">\\r\\n                      <div class=\\"font-medieval text-sm\\">{abilityNames[ability]}</div>\\r\\n                      <div class=\\"text-xs text-neutral/70\\">\\r\\n                        {formatModifier(getSaveBonus(ability))}\\r\\n                      </div>\\r\\n                    </div>\\r\\n                  </label>\\r\\n                {/each}\\r\\n              </div>\\r\\n            </div>\\r\\n            <div class=\\"divider text-neutral/50\\">⚔️</div>\\r\\n            <div>\\r\\n              <h4 class=\\"font-medieval text-xl text-neutral mb-3 flex items-center gap-2\\">\\r\\n                🎯 Habilidades\\r\\n              </h4>\\r\\n              <div class=\\"space-y-2 max-h-96 overflow-y-auto pr-2\\">\\r\\n                {#each DND_SKILLS as skillDef}\\r\\n                  {#if skillMap[skillDef.name]}\\r\\n                    <div class=\\"flex items-center gap-2 p-3 rounded-lg border-2 transition-all\\r\\n                                {skillMap[skillDef.name].expertise ? 'bg-warning/20 border-warning' : \\r\\n                                skillMap[skillDef.name].proficient ? 'bg-success/20 border-success' : \\r\\n                                'bg-neutral/10 border-neutral/30'}\\">\\r\\n\\r\\n                      <label class=\\"flex items-center gap-2 cursor-pointer flex-1\\">\\r\\n                        <input \\r\\n                          type=\\"checkbox\\" \\r\\n                          checked={skillMap[skillDef.name].proficient || false}\\r\\n                          on:change={() => toggleSkillProficiency(skillDef.name)}\\r\\n                          class=\\"checkbox checkbox-sm checkbox-success\\"\\r\\n                        />\\r\\n                        <div class=\\"flex-1\\">\\r\\n                          <div class=\\"font-medieval text-sm\\">{skillDef.label}</div>\\r\\n                          <div class=\\"text-xs text-neutral/70\\">\\r\\n                            {abilityNames[skillDef.ability]} • {formatModifier(getSkillBonus(skillMap[skillDef.name]))}\\r\\n                          </div>\\r\\n                        </div>\\r\\n                      </label>\\r\\n\\r\\n                      {#if skillMap[skillDef.name].proficient}\\r\\n                        <button\\r\\n                          on:click={() => toggleSkillExpertise(skillDef.name)}\\r\\n                          class=\\"btn btn-xs {skillMap[skillDef.name].expertise ? 'btn-warning' : 'btn-ghost'}\\"\\r\\n                          title=\\"Expertise (x2 proficiency)\\"\\r\\n                        >\\r\\n                          ★\\r\\n                        </button>\\r\\n                      {/if}\\r\\n                    </div>\\r\\n                  {/if}\\r\\n                {/each}\\r\\n              </div>\\r\\n            </div>\\r\\n          </div>\\r\\n        {/if}\\r\\n      </div>\\r\\n\\r\\n      <div class=\\"p-6 border-t-2 border-secondary flex-shrink-0\\">\\r\\n        <div class=\\"flex justify-between gap-4\\">\\r\\n          <button \\r\\n            on:click={prevStep}\\r\\n            class=\\"btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval\\"\\r\\n            disabled={currentStep === 1}\\r\\n          >\\r\\n            ← Anterior\\r\\n          </button>\\r\\n\\r\\n          {#if currentStep < totalSteps}\\r\\n            <button \\r\\n              on:click={nextStep}\\r\\n              class=\\"btn btn-dnd\\"\\r\\n              disabled={!isStepValid}\\r\\n              type=\\"button\\"\\r\\n            >\\r\\n              Siguiente →\\r\\n            </button>\\r\\n          {:else}\\r\\n            <button \\r\\n              on:click={handleSubmit}\\r\\n              class=\\"btn btn-dnd\\"\\r\\n              disabled={!isStepValid}\\r\\n              type=\\"button\\"\\r\\n            >\\r\\n              <span class=\\"text-xl\\">{isEdit ? '💾' : '✨'}</span>\\r\\n              {isEdit ? 'Guardar Cambios' : 'Crear Personaje'}\\r\\n            </button>\\r\\n          {/if}\\r\\n        </div>\\r\\n      </div>\\r\\n    </div>\\r\\n  </div>\\r\\n{/if}\\r\\n\\r\\n<style>\\r\\n  .overflow-y-auto::-webkit-scrollbar {\\r\\n    width: 8px;\\r\\n  }\\r\\n\\r\\n  .overflow-y-auto::-webkit-scrollbar-track {\\r\\n    background: rgba(139, 69, 19, 0.1);\\r\\n    border-radius: 4px;\\r\\n  }\\r\\n\\r\\n  .overflow-y-auto::-webkit-scrollbar-thumb {\\r\\n    background: linear-gradient(to bottom, #8B4513, #654321);\\r\\n    border-radius: 4px;\\r\\n  }\\r\\n\\r\\n  .overflow-y-auto::-webkit-scrollbar-thumb:hover {\\r\\n    background: linear-gradient(to bottom, #A0522D, #8B4513);\\r\\n  }\\r\\n</style>"],"names":[],"mappings":"AAwkBE,8BAAgB,mBAAoB,CAClC,KAAK,CAAE,GACT,CAEA,8BAAgB,yBAA0B,CACxC,UAAU,CAAE,KAAK,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAClC,aAAa,CAAE,GACjB,CAEA,8BAAgB,yBAA0B,CACxC,UAAU,CAAE,gBAAgB,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,CAAC,OAAO,CAAC,CACxD,aAAa,CAAE,GACjB,CAEA,8BAAgB,yBAAyB,MAAO,CAC9C,UAAU,CAAE,gBAAgB,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,CAAC,OAAO,CACzD"}`
};
const totalSteps = 4;
const CharacterFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let proficiencyBonus;
  let isStepValid;
  let { isOpen = false } = $$props;
  let { isEdit = false } = $$props;
  let { form } = $$props;
  createEventDispatcher();
  let currentStep = 1;
  let errors = {
    name: "",
    class: "",
    level: "",
    maxHp: "",
    armorClass: "",
    speed: ""
  };
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.isEdit === void 0 && $$bindings.isEdit && isEdit !== void 0) $$bindings.isEdit(isEdit);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  $$result.css.add(css);
  proficiencyBonus = getProficiencyBonus(form.level);
  ({
    strength: getAbilityModifier(form.abilityScores.strength),
    dexterity: getAbilityModifier(form.abilityScores.dexterity),
    constitution: getAbilityModifier(form.abilityScores.constitution),
    intelligence: getAbilityModifier(form.abilityScores.intelligence),
    wisdom: getAbilityModifier(form.abilityScores.wisdom),
    charisma: getAbilityModifier(form.abilityScores.charisma)
  });
  form?.skills ? form.skills.reduce(
    (acc, s) => {
      acc[s.name] = s;
      return acc;
    },
    {}
  ) : {};
  Object.keys(form.abilityScores);
  Object.keys(form.savingThrows);
  {
    {
      const nameResult = validateCharacterName(form.name);
      errors.name = nameResult.error || "";
      if (!form.class || form.class.trim().length < 2) {
        errors.class = "La clase debe tener al menos 2 caracteres";
      } else if (form.class.trim().length > 50) {
        errors.class = "La clase no puede tener más de 50 caracteres";
      } else {
        errors.class = "";
      }
      const levelResult = validateLevel(form.level);
      errors.level = levelResult.error || "";
      const maxHpResult = validateHP(form.maxHp);
      errors.maxHp = maxHpResult.error || "";
      const armorClassResult = validateArmorClass(form.armorClass);
      errors.armorClass = armorClassResult.error || "";
      if (form.speed < 0) {
        errors.speed = "La velocidad no puede ser negativa";
      } else if (form.speed > 120) {
        errors.speed = "La velocidad máxima es 120 pies";
      } else {
        errors.speed = "";
      }
    }
  }
  isStepValid = (() => {
    switch (currentStep) {
      case 1: {
        const nameValid = form.name.trim() !== "" && !errors.name;
        const classValid = form.class.trim() !== "" && form.class.trim().length >= 2 && !errors.class;
        const levelValid = form.level >= 1 && form.level <= 20 && !errors.level;
        const valid = nameValid && classValid && levelValid;
        return valid;
      }
      case 2: {
        const valid = form.maxHp > 0 && form.armorClass > 0 && form.speed >= 0 && !errors.maxHp && !errors.armorClass && !errors.speed;
        return valid;
      }
      case 3: {
        const valid = Object.values(form.abilityScores).every((score) => score >= 1 && score <= 30);
        return valid;
      }
      case 4: {
        return true;
      }
      default:
        return false;
    }
  })();
  return `${isOpen ? `<div class="modal modal-open z-50"><div class="card-parchment border-4 border-secondary w-11/12 max-w-4xl max-h-[90vh] relative flex flex-col"><div class="p-6 border-b-2 border-secondary flex-shrink-0"><button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" data-svelte-h="svelte-drx0cs">✕</button> <h3 class="font-bold text-3xl font-medieval text-neutral text-center mb-4">${escape(isEdit ? "✏️ Editar Personaje" : "🧙‍♂️ Crear Personaje")}</h3> <div class="flex justify-between items-center mb-2">${each(Array(totalSteps), (_, i) => {
    return `<div class="flex items-center flex-1"><button class="${"btn btn-circle btn-sm " + escape(
      currentStep > i + 1 ? "btn-success" : currentStep === i + 1 ? "btn-secondary" : "btn-ghost",
      true
    )}" ${i + 1 > currentStep ? "disabled" : ""}>${escape(i + 1)}</button> ${i < totalSteps - 1 ? `<div class="flex-1 h-1 mx-2 bg-base-300 rounded"><div class="h-full bg-secondary rounded transition-all duration-300" style="${"width: " + escape(currentStep > i + 1 ? "100%" : "0%", true)}"></div> </div>` : ``} </div>`;
  })}</div> <div class="text-center text-sm text-neutral/70 font-body">${`Información Básica`}</div></div> <div class="flex-1 overflow-y-auto p-6 svelte-p7d1us">${`<div class="space-y-4"><div class="form-control"><label class="label" data-svelte-h="svelte-euejpb"><span class="label-text font-medieval text-neutral text-lg">Nombre <span class="text-error">*</span></span></label> <input type="text" placeholder="Ej: Gandalf el Gris" class="${"input input-bordered bg-[#2d241c] text-base-content " + escape(
    "border-primary/50",
    true
  )}"${add_attribute("value", form.name, 0)}> ${``}</div> <div class="grid grid-cols-2 gap-4"><div class="form-control"><label class="label" data-svelte-h="svelte-qka7hk"><span class="label-text font-medieval text-neutral text-lg">Clase <span class="text-error">*</span></span></label> <input type="text" placeholder="Ej: Mago" class="${"input input-bordered bg-[#2d241c] text-base-content " + escape(
    "border-primary/50",
    true
  )}"${add_attribute("value", form.class, 0)}> ${``}</div> <div class="form-control"><label class="label" data-svelte-h="svelte-1karhsq"><span class="label-text font-medieval text-neutral text-lg">Nivel <span class="text-error">*</span></span></label> <input type="number" min="1" max="20" class="${"input input-bordered bg-[#2d241c] text-base-content " + escape(
    "border-primary/50",
    true
  )}"${add_attribute("value", form.level, 0)}> ${``}</div></div> <div class="bg-info/10 p-4 rounded-lg border border-info/30"><p class="text-sm font-medieval text-neutral mb-1">Bonus de Competencia: +${escape(proficiencyBonus)}</p> <p class="text-xs text-neutral/70" data-svelte-h="svelte-6wk9r6">Calculado automáticamente según tu nivel</p></div></div>`} ${``} ${``} ${``}</div> <div class="p-6 border-t-2 border-secondary flex-shrink-0"><div class="flex justify-between gap-4"><button class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval" ${"disabled"}>← Anterior</button> ${`<button class="btn btn-dnd" ${!isStepValid ? "disabled" : ""} type="button">Siguiente →</button>`}</div></div></div></div>` : ``}`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $userStore, $$unsubscribe_userStore;
  let $page, $$unsubscribe_page;
  $$unsubscribe_userStore = subscribe(userStore, (value) => $userStore = value);
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  headerTitle.set("Personajes");
  let characters = [];
  let showFormModal = false;
  let isEdit = false;
  function emptyCharacterForm() {
    return {
      name: "",
      class: "Aventurero",
      level: 1,
      maxHp: 10,
      armorClass: 10,
      initiative: 0,
      speed: 30,
      abilityScores: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      savingThrows: {
        strength: false,
        dexterity: false,
        constitution: false,
        intelligence: false,
        wisdom: false,
        charisma: false
      },
      skills: DND_SKILLS.map((skill) => ({
        name: skill.name,
        ability: skill.ability,
        proficient: false,
        expertise: false
      }))
    };
  }
  let form = emptyCharacterForm();
  getFirestore(app);
  onDestroy(() => {
  });
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $page.params.id || "";
    characters.find((c) => c.userId === $userStore?.uid);
    characters.filter((c) => c.userId !== $userStore?.uid);
    $$rendered = `  <div class="min-h-screen flex flex-col"><div class="flex flex-1"><div class="flex-1 p-4 sm:p-6"><div class="container mx-auto max-w-7xl"> <div class="mb-6 sm:mb-8 text-center" data-svelte-h="svelte-xbcwjp"><h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary title-ornament mb-3 text-shadow">Personajes</h1> <p class="text-base-content/70 font-body italic text-base sm:text-lg mb-2">&quot;Cada héroe tiene su historia...&quot;</p></div> ${``} ${`<div class="flex justify-center py-20" data-svelte-h="svelte-3wguzo"><div class="flex flex-col items-center gap-4"><span class="loading loading-spinner loading-lg text-secondary"></span> <p class="text-neutral/70 font-body">Cargando personajes...</p></div></div>`}</div></div></div></div>  ${validate_component(CharacterFormModal, "CharacterFormModal").$$render(
      $$result,
      { isEdit, isOpen: showFormModal, form },
      {
        isOpen: ($$value) => {
          showFormModal = $$value;
          $$settled = false;
        },
        form: ($$value) => {
          form = $$value;
          $$settled = false;
        }
      },
      {}
    )}`;
  } while (!$$settled);
  $$unsubscribe_userStore();
  $$unsubscribe_page();
  return $$rendered;
});
export {
  Page as default
};
