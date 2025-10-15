<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Character } from '$lib/types';

  export let isOpen: boolean = false;
  export let character: Character | null = null;
  export let isEdit: boolean = false;

  const dispatch = createEventDispatcher();

  let form = {
    name: '',
    class: '',
    level: 1,
    maxHp: 10,
    armorClass: 10,
    initiative: 0,
    imageUrl: ''
  };

  $: if (character && isEdit) {
    form = {
      name: character.name,
      class: character.class,
      level: character.level,
      maxHp: character.maxHp,
      armorClass: character.armorClass,
      initiative: character.initiative,
      imageUrl: character.imageUrl
    };
  }

  function resetForm() {
    form = {
      name: '',
      class: '',
      level: 1,
      maxHp: 10,
      armorClass: 10,
      initiative: 0,
      imageUrl: ''
    };
  }

  function handleSubmit() {
    if (isEdit && character) {
      dispatch('update', { id: character.id, ...form });
    } else {
      dispatch('create', form);
    }
    resetForm();
  }

  function handleClose() {
    resetForm();
    dispatch('close');
  }

  const classes = [
    'Bárbaro', 'Bardo', 'Clérigo', 'Druida', 'Guerrero', 
    'Monje', 'Paladín', 'Explorador', 'Pícaro', 'Hechicero',
    'Brujo', 'Mago'
  ];
</script>

{#if isOpen}
  <div class="modal modal-open">
    <div class="modal-box card-parchment max-w-3xl border-4 border-secondary corner-ornament">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" on:click={handleClose}>✕</button>
      
      <h3 class="font-bold text-3xl font-medieval text-neutral mb-6 text-center">
        {isEdit ? '✏️ Editar Personaje' : '🧙‍♂️ Crear Personaje'}
      </h3>

      <form on:submit|preventDefault={handleSubmit}>
        <!-- Nombre y Clase -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral text-lg">Nombre *</span>
            </label>
            <input 
              type="text" 
              bind:value={form.name}
              placeholder="Ej: Gandalf"
              required
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral text-lg">Clase *</span>
            </label>
            <select bind:value={form.class} required class="select select-bordered bg-[#2d241c] text-base-content border-primary/50">
              <option value="">Selecciona una clase...</option>
              {#each classes as className}
                <option value={className}>{className}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Nivel y HP -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral text-lg">Nivel *</span>
            </label>
            <input 
              type="number" 
              bind:value={form.level}
              min="1"
              max="20"
              required
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            />
          </div>

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
        </div>

        <!-- CA e Iniciativa -->
        <div class="grid grid-cols-2 gap-4 mb-4">
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

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral text-lg">Bonus Iniciativa</span>
            </label>
            <input 
              type="number" 
              bind:value={form.initiative}
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            />
            <label class="label">
              <span class="label-text-alt text-neutral/60 italic">Ej: +2, -1, 0</span>
            </label>
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
              <img src={form.imageUrl} alt="Preview" class="w-20 h-20 rounded-full object-cover mx-auto ring-2 ring-secondary" on:error={() => form.imageUrl = ''} />
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
            disabled={!form.name || !form.class || !form.maxHp}
          >
            <span class="text-xl">{isEdit ? '💾' : '✨'}</span>
            {isEdit ? 'Guardar Cambios' : 'Crear Personaje'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
