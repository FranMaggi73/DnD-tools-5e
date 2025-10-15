<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { userStore } from '$lib/stores/authStore';
  import { api } from '$lib/api/api';
  import type { Campaign, Character } from '$lib/types';
  import CharacterCard from '$lib/components/CharacterCard.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';

  $: campaignId = $page.params.id || '';

  let campaign: Campaign | null = null;
  let characters: Character[] = [];
  let loading = true;
  let error = '';
  
  let showFormModal = false;
  let editingCharacter: Character | null = null;
  let isEdit = false;
  let sidebarOpen = true;

  // Form simplificado
  let form = {
    name: '',
    maxHp: 10,
    armorClass: 10,
    imageUrl: ''
  };

  $: myCharacter = characters.find(c => c.userId === $userStore?.uid);
  $: otherCharacters = characters.filter(c => c.userId !== $userStore?.uid);
  $: canCreateCharacter = !myCharacter;

  onMount(async () => {
    await loadCampaign();
    await loadCharacters();
  });

  async function loadCampaign() {
    try {
      campaign = await api.getCampaign(campaignId);
    } catch (err: any) {
      error = err.message;
    }
  }

  async function loadCharacters() {
    try {
      loading = true;
      characters = await api.getCampaignCharacters(campaignId);
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function resetForm() {
    form = {
      name: '',
      maxHp: 10,
      armorClass: 10,
      imageUrl: ''
    };
  }

  function openCreateModal() {
    editingCharacter = null;
    isEdit = false;
    resetForm();
    showFormModal = true;
  }

  function openEditModal(character: Character) {
    editingCharacter = character;
    isEdit = true;
    form = {
      name: character.name,
      maxHp: character.maxHp,
      armorClass: character.armorClass,
      imageUrl: character.imageUrl
    };
    showFormModal = true;
  }

  async function handleSubmit() {
    try {
      if (isEdit && editingCharacter) {
        await api.updateCharacter(editingCharacter.id, {
          ...form,
          class: editingCharacter.class,
          level: editingCharacter.level,
          initiative: editingCharacter.initiative
        });
      } else {
        await api.createCharacter(campaignId, {
          ...form,
          class: 'Aventurero',
          level: 1,
          initiative: 0
        });
      }
      showFormModal = false;
      resetForm();
      await loadCharacters();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleDelete(character: Character) {
    if (!confirm(`¿Eliminar a ${character.name}?`)) return;
    
    try {
      await api.deleteCharacter(character.id);
      await loadCharacters();
    } catch (err: any) {
      error = err.message;
    }
  }

  function handleClose() {
    showFormModal = false;
    resetForm();
  }
</script>

<div class="min-h-screen flex flex-col">
  <!-- Navbar -->
  <div class="navbar-medieval sticky top-0 z-50">
    <div class="container mx-auto">
      <div class="flex-1"></div>
      <div class="flex-none">
        <h1 class="font-medieval text-xl text-secondary">{campaign?.name || 'Campaña'}</h1>
      </div>
      <div class="flex-1 flex justify-end">
        <button on:click={() => goto('/dashboard')} class="btn btn-ghost font-medieval text-secondary hover:text-accent">
          Volver al Grimorio →
        </button>
      </div>
    </div>
  </div>

  <div class="flex flex-1">
    <!-- Sidebar Component -->
    <Sidebar {campaignId} bind:isOpen={sidebarOpen} />

    <!-- Contenido principal -->
    <div class="flex-1 p-6">
      <div class="container mx-auto max-w-7xl">
        <!-- Header -->
        <div class="mb-8 text-center">
          <h1 class="text-4xl lg:text-5xl font-bold text-secondary title-ornament mb-3 text-shadow">
            Personajes
          </h1>
          <p class="text-base-content/70 font-body italic text-lg">
            "Cada héroe tiene su historia..."
          </p>
        </div>

        {#if error}
          <div class="alert alert-error mb-6">
            <span>{error}</span>
            <button class="btn btn-sm" on:click={() => error = ''}>✕</button>
          </div>
        {/if}

        {#if loading}
          <div class="flex justify-center py-20">
            <span class="loading loading-spinner loading-lg text-secondary"></span>
          </div>
        {:else}
          <!-- Mi Personaje -->
          <div class="mb-10">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-3xl font-medieval text-secondary">Tu Personaje</h2>
            </div>

            {#if myCharacter}
              <div class="max-w-md">
                <CharacterCard 
                  character={myCharacter}
                  isOwner={true}
                  on:edit={(e) => openEditModal(e.detail)}
                  on:delete={(e) => handleDelete(e.detail)}
                />
              </div>
            {:else}
              <div class="card-parchment p-12 text-center max-w-2xl corner-ornament">
                <div class="text-6xl mb-4">🧙‍♂️</div>
                <h3 class="text-2xl font-medieval text-neutral mb-3">No tienes personaje</h3>
                <p class="text-neutral/70 font-body mb-6">
                  Crea tu personaje para unirte a las aventuras de esta campaña
                </p>
                <button 
                  on:click={openCreateModal}
                  class="btn btn-dnd btn-lg"
                >
                  <span class="text-2xl">✨</span>
                  Crear Mi Personaje
                </button>
              </div>
            {/if}
          </div>

          <!-- Otros Personajes -->
          {#if otherCharacters.length > 0}
            <div class="divider text-neutral/50 my-8">⚔️</div>
            
            <div class="mb-6">
              <h2 class="text-3xl font-medieval text-secondary mb-2">Compañeros de Aventura</h2>
              <p class="text-neutral/60 font-body italic">Los demás héroes de esta campaña</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {#each otherCharacters as character}
                <CharacterCard 
                  {character}
                  isOwner={false}
                />
              {/each}
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- Modal de Formulario Simplificado -->
{#if showFormModal}
  <div class="modal modal-open">
    <div class="modal-box card-parchment max-w-2xl border-4 border-secondary corner-ornament">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" on:click={() => showFormModal = false}>✕</button>
      
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
            on:click={() => showFormModal = false}
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