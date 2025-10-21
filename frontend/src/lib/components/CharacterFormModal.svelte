<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { CharacterForm } from '$lib/types';

  export let isOpen = false;
  export let isEdit = false;
  export let form: CharacterForm = { name: '', maxHp: 10, armorClass: 10 };

  const dispatch = createEventDispatcher();

  function handleSubmit() {
    dispatch('submit', form);
  }

  function handleClose() {
    dispatch('close');
  }
</script>

{#if isOpen}
  <!-- Fondo oscuro fijo -->
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-10 pt-4">
    <!-- Modal fijo -->
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

      <form on:submit|preventDefault={handleSubmit}>
        <!-- Nombre -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-medieval text-neutral text-lg">Nombre *</span>
          </label>
          <input 
            type="text" 
            bind:value={form.name}
            placeholder="Ej: Gandalf el Gris"
            required
            class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
          />
        </div>

        <!-- HP y CA -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral text-lg">HP Máximo *</span>
            </label>
            <input 
              type="number" 
              bind:value={form.maxHp}
              min="1"
              required
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral text-lg">Clase de Armadura (CA) *</span>
            </label>
            <input 
              type="number" 
              bind:value={form.armorClass}
              min="1"
              required
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            />
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
            disabled={!form.name || !form.maxHp}
          >
            <span class="text-xl">{isEdit ? '💾' : '✨'}</span>
            {isEdit ? 'Guardar Cambios' : 'Crear Personaje'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
