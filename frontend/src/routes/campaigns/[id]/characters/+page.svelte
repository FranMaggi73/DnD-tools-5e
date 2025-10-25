<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { userStore } from '$lib/stores/authStore';
  import { api } from '$lib/api/api';
  import type { Campaign, Character } from '$lib/types';
  import CharacterCard from '$lib/components/CharacterCard.svelte';
  import CharacterFormModal from '$lib/components/CharacterFormModal.svelte';
  import { headerTitle } from '$lib/stores/uiStore';

  // ===== NUEVO: Importar Firestore =====
  import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
  import { app } from '$lib/firebase';

  headerTitle.set('Personajes');

  $: campaignId = $page.params.id || '';

  let campaign: Campaign | null = null;
  let characters: Character[] = [];
  let loading = true;
  let error = '';
  
  let showFormModal = false;
  let editingCharacter: Character | null = null;
  let isEdit = false;

  let form = {
    name: '',
    maxHp: 10,
    armorClass: 10,
    imageUrl: ''
  };

  // ===== NUEVO: Listener para sincronización en tiempo real =====
  let charactersUnsubscribe: (() => void) | null = null;
  const db = getFirestore(app);

  $: myCharacter = characters.find(c => c.userId === $userStore?.uid);
  $: otherCharacters = characters.filter(c => c.userId !== $userStore?.uid);

  onMount(async () => {
    await loadCampaign();
    setupCharactersListener();
  });

  onDestroy(() => {
    if (charactersUnsubscribe) charactersUnsubscribe();
  });

  // ===== NUEVO: Setup listener en tiempo real =====
  function setupCharactersListener() {
    try {
      loading = true;
      const charactersRef = collection(db, 'characters');
      const charactersQuery = query(
        charactersRef,
        where('campaignId', '==', campaignId)
      );

      charactersUnsubscribe = onSnapshot(
        charactersQuery,
        (snapshot) => {
          characters = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Character[];
          loading = false;
        },
        (err) => {
          console.error('Error en listener de personajes:', err);
          error = err.message;
          loading = false;
        }
      );
    } catch (err: any) {
      error = err.message;
      loading = false;
    }
  }

  async function loadCampaign() {
    try {
      campaign = await api.getCampaign(campaignId);
    } catch (err: any) {
      error = err.message;
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
      // No necesitamos recargar, el listener lo hará automáticamente
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleDelete(character: Character) {
    if (!confirm(`¿Eliminar a ${character.name}?`)) return;
    
    try {
      await api.deleteCharacter(character.id);
      // No necesitamos recargar, el listener lo hará automáticamente
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
  <div class="flex flex-1">
    <div class="flex-1 p-6">
      <div class="container mx-auto max-w-7xl">
        <!-- Header -->
        <div class="mb-8 text-center">
          <h1 class="text-4xl lg:text-5xl font-bold text-secondary title-ornament mb-3 text-shadow">
            Personajes
          </h1>
          <p class="text-base-content/70 font-body italic text-lg mb-2">
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
            {#if myCharacter}
            <div class="flex justify-center">
              <div class="max-w-md">
                <CharacterCard 
                  character={myCharacter}
                  isOwner={true}
                  on:edit={(e) => openEditModal(e.detail)}
                  on:delete={(e) => handleDelete(e.detail)}
                />
              </div>
            </div>
            {:else}
            <div class="flex justify-center">
              <div class="card-parchment p-8 text-center max-w-2xl justify-center items-center corner-ornament">
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
            </div>
            {/if}
          </div>

          <!-- Otros Personajes -->
          {#if otherCharacters.length > 0}
            <div class="divider text-neutral/50 my-8">⚔️</div>
            
            <div class="mb-6">
              <h2 class="text-3xl font-medieval text-center text-secondary mb-2">Compañeros de Aventura</h2>
              <p class="text-primary text-center font-body italic">Los demás héroes de esta campaña</p>
            </div>
            <div class="w-3/4 mx-auto">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {#each otherCharacters as character}
                  <CharacterCard 
                    {character}
                    isOwner={false}
                  />
                {/each}
              </div>              
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</div>

<div class="justify-center items-center">
  <CharacterFormModal
    bind:isOpen={showFormModal}
    {isEdit}
    {form}
    on:submit={handleSubmit}
    on:close={handleClose}
  />  
</div>