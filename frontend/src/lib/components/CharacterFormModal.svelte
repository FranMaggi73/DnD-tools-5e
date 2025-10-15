<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let isOpen: boolean = false;
  export let isEdit: boolean = false;
  export let form = {
    name: '',
    maxHp: 10,
    armorClass: 10,
    imageUrl: ''
  };

  const dispatch = createEventDispatcher();

  function handleSubmit() {
    dispatch('submit', form);
  }

  function handleClose() {
    dispatch('close');
  }
</script>

{#if isOpen}
  <div class="modal modal-open">
    <div class="modal-box card-parchment max-w-2xl border-4 border-secondary corner-ornament">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" on:click={handleClose}>✕</button>
      
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

        <!-- URL de Imagen -->
        <div class="form-control mb-6">
          <label class="label">
            <span class="label-text font-medieval text-neutral text-lg">URL de Imagen (opcional)</span>
          </label>
          <input 
            type="url" 
            bind:value={form.imageUrl}
            placeholder="https://ejemplo.com/imagen.jpg"
            class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
          />
          {#if form.imageUrl}
            <div class="mt-2">
              <img 
                src={form.imageUrl} 
                alt="Preview" 
                class="w-20 h-20 rounded-full object-cover mx-auto ring-2 ring-secondary" 
                on:error={() => form.imageUrl = ''}
              />
            </div>
          {/if}
        </div>

        <!-- Botones -->
        <div class="modal-action justify-center gap-4">
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