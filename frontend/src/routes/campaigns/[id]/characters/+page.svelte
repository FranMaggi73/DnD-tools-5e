<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { userStore } from '$lib/stores/authStore';
  import { api } from '$lib/api/api';
  import type { Campaign, Character } from '$lib/types';
  import CharacterCard from '$lib/components/CharacterCard.svelte';
  import CharacterFormModal from '$lib/components/CharacterFormModal.svelte';

  $: campaignId = $page.params.id || '';

  let campaign: Campaign | null = null;
  let characters: Character[] = [];
  let loading = true;
  let error = '';
  
  let showFormModal = false;
  let editingCharacter: Character | null = null;
  let isEdit = false;

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

  async function handleCreate(event: CustomEvent) {
    try {
      await api.createCharacter(campaignId, event.detail);
      showFormModal = false;
      await loadCharacters();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleUpdate(event: CustomEvent) {
    try {
      const { id, ...data } = event.detail;
      await api.updateCharacter(id, data);
      showFormModal = false;
      editingCharacter = null;
      isEdit = false;
      await loadCharacters();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleDelete(event: CustomEvent) {
    const character = event.detail as Character;
    if (!confirm(`¿Eliminar a ${character.name}?`)) return;
    
    try {
      await api.deleteCharacter(character.id);
      await loadCharacters();
    } catch (err: any) {
      error = err.message;
    }
  }

  function openEditModal(event: CustomEvent) {
    editingCharacter = event.detail;
    isEdit = true;
    showFormModal = true;
  }

  function openCreateModal() {
    editingCharacter = null;
    isEdit = false;
    showFormModal = true;
  }
</script>

<div class="min-h-screen flex flex-col">
  <!-- Navbar -->
  <div class="navbar-medieval sticky top-0 z-50">
    <div class="container mx-auto">
      <div class="flex-1">
        <button on:click={() => goto(`/campaigns/${campaignId}`)} class="btn btn-ghost font-medieval text-secondary hover:text-accent">
          ← Volver al Combate
        </button>
      </div>
      <div class="flex-none">
        <h1 class="font-medieval text-xl text-secondary">{campaign?.name || 'Campaña'}</h1>
      </div>
    </div>
  </div>

  <div class="container mx-auto p-6 max-w-7xl">
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
          {#if canCreateCharacter}
            <button 
              on:click={openCreateModal}
              class="btn btn-dnd gap-2"
            >
              <span class="text-2xl">✨</span>
              Crear Personaje
            </button>
          {/if}
        </div>

        {#if myCharacter}
          <div class="max-w-md">
            <CharacterCard 
              character={myCharacter}
              isOwner={true}
              on:edit={openEditModal}
              on:delete={handleDelete}
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

<!-- Modal de Formulario -->
<CharacterFormModal 
  bind:isOpen={showFormModal}
  character={editingCharacter}
  {isEdit}
  on:create={handleCreate}
  on:update={handleUpdate}
  on:close={() => { showFormModal = false; editingCharacter = null; isEdit = false; }}
/>