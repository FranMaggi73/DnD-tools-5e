// frontend/src/lib/stores/validationStore.ts
import { writable, derived, type Writable } from 'svelte/store';
import type { ValidationResult } from '$lib/utils/validation';

export interface FieldState<T = any> {
  value: T;
  touched: boolean;
  error: string;
  validating: boolean;
}

export interface FormState<T extends Record<string, any>> {
  fields: {
    [K in keyof T]: FieldState<T[K]>;
  };
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

export type ValidatorFn<T = any> = (value: T) => ValidationResult | Promise<ValidationResult>;

export interface FormConfig<T extends Record<string, any>> {
  initialValues: T;
  validators: {
    [K in keyof T]?: ValidatorFn<T[K]> | ValidatorFn<T[K]>[];
  };
  validateOn?: 'blur' | 'change' | 'submit';
  revalidateOn?: 'blur' | 'change';
}

/**
 * Hook de validación de formularios consistente
 * Uso:
 * 
 * const form = createForm({
 *   initialValues: { name: '', email: '' },
 *   validators: {
 *     name: validateCharacterName,
 *     email: [required, validateEmail]
 *   },
 *   validateOn: 'blur',
 *   revalidateOn: 'change'
 * });
 */
export function createForm<T extends Record<string, any>>(config: FormConfig<T>) {
  const {
    initialValues,
    validators,
    validateOn = 'blur',
    revalidateOn = 'change',
  } = config;

  // Crear estado inicial
  const initialState: FormState<T> = {
    fields: {} as any,
    isValid: false,
    isSubmitting: false,
    submitCount: 0,
  };

  // Inicializar campos
  for (const key in initialValues) {
    initialState.fields[key] = {
      value: initialValues[key],
      touched: false,
      error: '',
      validating: false,
    };
  }

  const state: Writable<FormState<T>> = writable(initialState);

  // Derived store para validez general
  const isValid = derived(state, ($state) => {
    return Object.values($state.fields).every(
      (field: any) => !field.error && field.touched
    );
  });

  // Validar un campo específico
  async function validateField(fieldName: keyof T): Promise<boolean> {
    const fieldValidators = validators[fieldName];
    if (!fieldValidators) return true;

    // Obtener el valor actual y marcar como validating
    let currentValue: T[keyof T] | undefined;
    state.update((s) => {
      currentValue = s.fields[fieldName].value;
      s.fields[fieldName].validating = true;
      return s;
    });

    // TypeScript safety check
    if (currentValue === undefined) {
      return true;
    }

    const validatorArray = Array.isArray(fieldValidators)
      ? fieldValidators
      : [fieldValidators];

    // Ejecutar validadores secuencialmente
    for (const validator of validatorArray) {
      const result = await validator(currentValue);
      
      if (!result.valid) {
        state.update((s) => {
          s.fields[fieldName].error = result.error || 'Error de validación';
          s.fields[fieldName].validating = false;
          return s;
        });
        return false;
      }
    }

    // Todos los validadores pasaron
    state.update((s) => {
      s.fields[fieldName].error = '';
      s.fields[fieldName].validating = false;
      return s;
    });
    return true;
  }

  // Validar todos los campos
  async function validateAll(): Promise<boolean> {
    const validationPromises = Object.keys(initialValues).map((key) =>
      validateField(key as keyof T)
    );

    const results = await Promise.all(validationPromises);
    return results.every((r) => r);
  }

  // Marcar campo como tocado
  function touchField(fieldName: keyof T) {
    state.update((s) => {
      s.fields[fieldName].touched = true;
      return s;
    });
  }

  // Actualizar valor de campo
  function setFieldValue(fieldName: keyof T, value: T[keyof T]) {
    let shouldValidate = false;
    
    state.update((s) => {
      s.fields[fieldName].value = value;
      // Determinar si debemos revalidar
      shouldValidate = s.fields[fieldName].touched && revalidateOn === 'change';
      return s;
    });

    if (shouldValidate) {
      validateField(fieldName);
    }
  }

  // Handler para blur
  function handleBlur(fieldName: keyof T) {
    touchField(fieldName);
    
    if (validateOn === 'blur') {
      validateField(fieldName);
    }
  }

  // Handler para change
  function handleChange(fieldName: keyof T, value: T[keyof T]) {
    setFieldValue(fieldName, value);
    
    if (validateOn === 'change') {
      validateField(fieldName);
    }
  }

  // Reset form
  function reset() {
    state.set({
      fields: {} as any,
      isValid: false,
      isSubmitting: false,
      submitCount: 0,
    });

    // Re-inicializar campos
    for (const key in initialValues) {
      state.update((s) => {
        s.fields[key] = {
          value: initialValues[key],
          touched: false,
          error: '',
          validating: false,
        };
        return s;
      });
    }
  }

  // Submit handler
  async function handleSubmit(
    onSubmit: (values: T) => Promise<void> | void
  ): Promise<boolean> {
    // Marcar todos como tocados
    state.update((s) => {
      for (const key in s.fields) {
        s.fields[key].touched = true;
      }
      s.isSubmitting = true;
      s.submitCount += 1;
      return s;
    });

    // Validar todos
    const isValid = await validateAll();

    if (!isValid) {
      state.update((s) => {
        s.isSubmitting = false;
        return s;
      });
      return false;
    }

    // Ejecutar callback de submit
    try {
      const values = getValues();
      await onSubmit(values);
      
      state.update((s) => {
        s.isSubmitting = false;
        return s;
      });
      
      return true;
    } catch (error) {
      state.update((s) => {
        s.isSubmitting = false;
        return s;
      });
      throw error;
    }
  }

  // Obtener valores actuales
  function getValues(): T {
    const values = {} as T;
    const unsubscribe = state.subscribe((s) => {
      for (const key in s.fields) {
        values[key] = s.fields[key].value;
      }
    });
    unsubscribe(); // Importante: desuscribir inmediatamente
    
    return values;
  }

  // Establecer errores manualmente (útil para errores del servidor)
  function setFieldError(fieldName: keyof T, error: string) {
    state.update((s) => {
      s.fields[fieldName].error = error;
      s.fields[fieldName].touched = true;
      return s;
    });
  }

  return {
    state,
    isValid,
    validateField,
    validateAll,
    touchField,
    setFieldValue,
    handleBlur,
    handleChange,
    handleSubmit,
    reset,
    getValues,
    setFieldError,
  };
}

// ===========================
// EJEMPLO DE USO
// ===========================

/*
// En tu componente .svelte:

<script lang="ts">
  import { createForm } from '$lib/stores/validationStore';
  import { validateCharacterName, validateHP } from '$lib/utils/validation';
  
  const form = createForm({
    initialValues: {
      name: '',
      maxHp: 10,
    },
    validators: {
      name: validateCharacterName,
      maxHp: validateHP,
    },
    validateOn: 'blur',
    revalidateOn: 'change',
  });
  
  async function onSubmit() {
    const success = await form.handleSubmit(async (values) => {
      // Tu lógica de submit
      await api.createCharacter(values);
    });
    
    if (success) {
      form.reset();
    }
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <input
    type="text"
    value={$form.state.fields.name.value}
    on:input={(e) => form.handleChange('name', e.target.value)}
    on:blur={() => form.handleBlur('name')}
    class:error={$form.state.fields.name.error}
  />
  {#if $form.state.fields.name.error}
    <span class="error">{$form.state.fields.name.error}</span>
  {/if}
  
  <button type="submit" disabled={!$form.isValid || $form.state.isSubmitting}>
    Submit
  </button>
</form>
*/