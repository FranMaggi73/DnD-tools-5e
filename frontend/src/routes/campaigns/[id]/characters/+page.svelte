<!-- frontend/src/routes/campaigns/[id]/characters/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { userStore } from '$lib/stores/authStore';
  import { api } from '$lib/api/api';
  import type { Campaign, Character, CharacterForm } from '$lib/types';
  import { DND_SKILLS, getProficiencyBonus } from '$lib/types';
  import CharacterCard from '$lib/components/CharacterCard.svelte';
  import CharacterFormModal from '$lib/components/CharacterFormModal.svelte';
  import InventoryPanel from '$lib/components/InventoryPanel.svelte';
  import { headerTitle } from '$lib/stores/uiStore';

  // ===== Importar Firestore para listeners en tiempo real =====
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

  // ===== NUEVO: Estado para mostrar inventario =====
  let showInventory = false;
  let inventoryCharacter: Character | null = null;

  function emptyCharacterForm(): CharacterForm {
    return {
      name: '',
      class: 'Aventurero',
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
      skills: DND_SKILLS.map(skill => ({
        name: skill.name,
        ability: skill.ability,
        proficient: false,
        expertise: false
      }))
    };
  }

  function characterToForm(character: Character): CharacterForm {
    return {
      name: character.name,
      class: character.class,
      level: character.level,
      maxHp: character.maxHp,
      armorClass: character.armorClass,
      initiative: character.initiative,
      speed: character.speed,
      abilityScores: { ...character.abilityScores },
      savingThrows: { ...character.savingThrows },
      skills: DND_SKILLS.map(skillDef => {
        const existingSkill = character.skills?.find(s => s.name === skillDef.name);
        return existingSkill ? { ...existingSkill } : {
          name: skillDef.name,
          ability: skillDef.ability,
          proficient: false,
          expertise: false
        };
      })
    };
  }

  let form: CharacterForm = emptyCharacterForm();

  function resetForm() {
    form = emptyCharacterForm();
  }

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

  function openCreateModal() {
    editingCharacter = null;
    isEdit = false;
    resetForm();
    showFormModal = true;
  }

  function openEditModal(character: Character) {
    editingCharacter = character;
    isEdit = true;
    form = characterToForm(character);
    showFormModal = true;
  }

  // ===== NUEVO: Abrir inventario =====
  function openInventory(character: Character) {
    inventoryCharacter = character;
    showInventory = true;
  }

  function closeInventory() {
    showInventory = false;
    inventoryCharacter = null;
  }

  async function handleSubmit() {
    try {
      const proficiencyBonus = getProficiencyBonus(form.level);
      
      const characterData = {
        name: form.name,
        class: form.class,
        level: form.level,
        maxHp: form.maxHp,
        armorClass: form.armorClass,
        initiative: form.initiative,
        speed: form.speed,
        abilityScores: form.abilityScores,
        proficiencyBonus: proficiencyBonus,
        savingThrows: form.savingThrows,
        skills: form.skills
      };

      if (isEdit && editingCharacter) {
        await api.updateCharacter(editingCharacter.id, characterData);
      } else {
        await api.createCharacter(campaignId, characterData);
      }
      
      showFormModal = false;
      resetForm();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleDelete(character: Character) {
    if (!confirm(`¿Eliminar a ${character.name}?`)) return;
    
    try {
      await api.deleteCharacter(character.id);
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
                <div class="max-w-4xl w-full space-y-4">
                  <CharacterCard 
                    character={myCharacter}
                    isOwner={true}
                    on:edit={(e) => openEditModal(e.detail)}
                    on:delete={(e) => handleDelete(e.detail)}
                  />
                  
                  <!-- Botón de Inventario -->
                  <div class="flex justify-center">
                    <button 
                      on:click={() => myCharacter && openInventory(myCharacter)}
                      class="btn btn-primary gap-2"
                    >
                      <span class="text-xl">🎒</span>
                      Ver Inventario
                    </button>
                  </div>
                </div>
              </div>
            {:else}
              <div class="flex justify-center">
                <div class="card-parchment p-8 text-center max-w-2xl corner-ornament">
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
              <h2 class="text-3xl font-medieval text-center text-secondary mb-2">
                Compañeros de Aventura
              </h2>
              <p class="text-primary text-center font-body italic">
                Los demás héroes de esta campaña
              </p>
            </div>
            
            <div class="container mx-auto max-w-7xl">
              <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {#each otherCharacters as character}
                  <div class="flex justify-center">
                    <div class="w-full space-y-4">
                      <CharacterCard 
                        {character}
                        isOwner={false}
                      />
                      
                      <!-- Botón de inventario para otros personajes -->
                      <div class="flex justify-center">
                        <button 
                          on:click={() => openInventory(character)}
                          class="btn btn-info btn-sm gap-2"
                        >
                          <span>🎒</span>
                          Ver Inventario
                        </button>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>              
            </div>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- Modal del Formulario -->
<CharacterFormModal
  bind:isOpen={showFormModal}
  {isEdit}
  bind:form
  on:submit={handleSubmit}
  on:close={handleClose}
/>

<!-- Modal de Inventario -->
{#if showInventory && inventoryCharacter}
  <div class="modal modal-open z-50">
    <div class="card-parchment border-4 border-secondary w-[95vw] max-w-6xl max-h-[90vh] relative flex flex-col">
      
      <!-- Header -->
      <div class="p-4 border-b-2 border-secondary flex-shrink-0">
        <button 
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
          on:click={closeInventory}
        >✕</button>
        
        <h3 class="font-bold text-2xl font-medieval text-neutral text-center mb-2">
          🎒 Inventario de {inventoryCharacter.name}
        </h3>
        <p class="text-center text-sm text-neutral/70 font-body">
          {inventoryCharacter.class} - Nivel {inventoryCharacter.level}
        </p>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4">
        <InventoryPanel 
          characterId={inventoryCharacter.id}
          isOwner={inventoryCharacter.userId === $userStore?.uid}
        />
      </div>
    </div>
  </div>
{/if}