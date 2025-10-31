<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { CharacterForm } from '$lib/types';
  import { 
    validateCharacterName, 
    validateHP, 
    validateArmorClass,
    validateAll 
  } from '$lib/utils/validation';

  export let isOpen = false;
  export let isEdit = false;
  export let form: CharacterForm = { name: '', maxHp: 10, armorClass: 10 };

  const dispatch = createEventDispatcher();

  // Estados de validación
  let errors = {
    name: '',
    maxHp: '',
    armorClass: ''
  };

  let touched = {
    name: false,
    maxHp: false,
    armorClass: false
  };

  // Validación en tiempo real
  $: if (touched.name) {
    const result = validateCharacterName(form.name);
    errors.name = result.valid ? '' : result.error || '';
  }

  $: if (touched.maxHp) {
    const result = validateHP(form.maxHp);
    errors.maxHp = result.valid ? '' : result.error || '';
  }

  $: if (touched.armorClass) {
    const result = validateArmorClass(form.armorClass);
    errors.armorClass = result.valid ? '' : result.error || '';
  }

  // Verificar si el formulario es válido
  $: isValid = !errors.name && !errors.maxHp && !errors.armorClass && 
               form.name.trim() && form.maxHp > 0 && form.armorClass > 0;

  function handleBlur(field: keyof typeof touched) {
    touched[field] = true;
  }

  function validateForm(): boolean {
    // Marcar todos como tocados
    Object.keys(touched).forEach(key => {
      touched[key as keyof typeof touched] = true;
    });

    // Validar todos los campos
    const nameValidation = validateCharacterName(form.name);
    const hpValidation = validateHP(form.maxHp);
    const acValidation = validateArmorClass(form.armorClass);

    const validation = validateAll(nameValidation, hpValidation, acValidation);

    if (!validation.valid) {
      errors.name = nameValidation.error || '';
      errors.maxHp = hpValidation.error || '';
      errors.armorClass = acValidation.error || '';
      return false;
    }

    return true;
  }

  function handleSubmit() {
    if (validateForm()) {
      dispatch('submit', form);
      // Reset después de submit exitoso
      resetValidation();
    }
  }

  function resetValidation() {
    // Reset touched states
    Object.keys(touched).forEach(key => {
      touched[key as keyof typeof touched] = false;
    });
    // Reset errors
    Object.keys(errors).forEach(key => {
      errors[key as keyof typeof errors] = '';
    });
  }

  function handleClose() {
    resetValidation();
    dispatch('close');
  }

  // ✅ MEJORA: Reset validación cuando se abre el modal
  $: if (isOpen) {
    resetValidation();
  }
</script>

{#if isOpen}
  <div class="modal modal-open z-50">
    <div class="bg-[#2d241c] text-base-content border-4 border-secondary corner-ornament card-parchment w-full max-w-2xl p-6 relative">

      <!-- Botón cerrar -->
      <button 
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
        on:click={handleClose}
      >✕</button>

      <!-- Título -->
      <h3 class="font-bold text-3xl font-medieval text-neutral mb-6 text-center">
        {isEdit ? '✏️ Editar Personaje' : '🧙‍♂️ Crear Personaje'}
      </h3>

      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <!-- Nombre -->
        <div class="form-control">
          <label class="label mb-1">
            <span class="label-text font-medieval text-neutral text-lg">
              Nombre <span class="text-error">*</span>
            </span>
          </label>
          <input 
            type="text" 
            bind:value={form.name}
            on:blur={() => handleBlur('name')}
            placeholder="Ej: Gandalf el Gris"
            required
            class="input input-bordered bg-[#2d241c] text-base-content border-2 
                   {errors.name && touched.name ? 'border-error' : 'border-primary/50'} 
                   focus:border-secondary focus:ring-0 focus:outline-none w-full transition-colors duration-150"
          />
          {#if errors.name && touched.name}
            <label class="label">
              <span class="label-text-alt text-error">
                <span class="text-lg">⚠️</span> {errors.name}
              </span>
            </label>
          {:else}
            <label class="label">
              <span class="label-text-alt text-neutral/60 italic text-xs">
                Nombre del personaje (2-50 caracteres)
              </span>
            </label>
          {/if}
        </div>

        <!-- HP y CA -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label mb-1">
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
              required
              class="input input-bordered bg-[#2d241c] text-base-content border-2 
                     {errors.maxHp && touched.maxHp ? 'border-error' : 'border-primary/50'} 
                     focus:border-secondary focus:ring-0 focus:outline-none w-full transition-colors duration-150"
            />
            {#if errors.maxHp && touched.maxHp}
              <label class="label">
                <span class="label-text-alt text-error text-xs">
                  ⚠️ {errors.maxHp}
                </span>
              </label>
            {:else}
              <label class="label">
                <span class="label-text-alt text-neutral/60 italic text-xs">
                  Puntos de vida máximos (1-999)
                </span>
              </label>
            {/if}
          </div>

          <div class="form-control">
            <label class="label mb-1">
              <span class="label-text font-medieval text-neutral text-lg">
                Clase de Armadura (CA) <span class="text-error">*</span>
              </span>
            </label>
            <input 
              type="number" 
              bind:value={form.armorClass}
              on:blur={() => handleBlur('armorClass')}
              min="1"
              max="30"
              required
              class="input input-bordered bg-[#2d241c] text-base-content border-2 
                     {errors.armorClass && touched.armorClass ? 'border-error' : 'border-primary/50'} 
                     focus:border-secondary focus:ring-0 focus:outline-none w-full transition-colors duration-150"
            />
            {#if errors.armorClass && touched.armorClass}
              <label class="label">
                <span class="label-text-alt text-error text-xs">
                  ⚠️ {errors.armorClass}
                </span>
              </label>
            {:else}
              <label class="label">
                <span class="label-text-alt text-neutral/60 italic text-xs">
                  Clase de Armadura (1-30)
                </span>
              </label>
            {/if}
          </div>
        </div>

        <!-- Botones -->
        <div class="modal-action justify-center gap-4 mt-4">
          <button 
            type="button"
            on:click={handleClose}
            class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            class="btn btn-dnd"
            disabled={!isValid}
          >
            <span class="text-xl">{isEdit ? '💾' : '✨'}</span>
            {isEdit ? 'Guardar Cambios' : 'Crear Personaje'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}