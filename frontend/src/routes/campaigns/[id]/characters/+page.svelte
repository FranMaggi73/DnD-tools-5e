<!-- frontend/src/routes/campaigns/[id]/characters/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { userStore } from '$lib/stores/authStore';
  import { api } from '$lib/api/api';
  import type { Campaign, Character, CharacterForm } from '$lib/types';
  import { DND_SKILLS, getProficiencyBonus } from '$lib/types';
  import CharacterSheet from '$lib/components/CharacterCard.svelte';
  import CharacterFormModal from '$lib/components/CharacterFormModal.svelte';
  import { headerTitle } from '$lib/stores/uiStore';

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
    <div class="flex-1 p-4 sm:p-6">
      <div class="container mx-auto max-w-7xl">
        
        <!-- Header -->
        <div class="mb-6 sm:mb-8 text-center">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary title-ornament mb-3 text-shadow">
            Personajes
          </h1>
          <p class="text-base-content/70 font-body italic text-base sm:text-lg mb-2">
            "Cada héroe tiene su historia..."
          </p>
        </div>

        {#if error}
          <div class="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span>{error}</span>
            <button class="btn btn-sm btn-ghost" on:click={() => error = ''}>✕</button>
          </div>
        {/if}

        {#if loading}
          <div class="flex justify-center py-20">
            <div class="flex flex-col items-center gap-4">
              <span class="loading loading-spinner loading-lg text-secondary"></span>
              <p class="text-neutral/70 font-body">Cargando personajes...</p>
            </div>
          </div>
        {:else}
          
          <!-- Mi Personaje -->
          <div class="mb-10">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-2xl font-medieval text-secondary">
                {myCharacter ? '👤 Mi Personaje' : ''}
              </h2>
            </div>
            
            {#if myCharacter}
              <div class="flex justify-center">
                <div class="max-w-6xl w-full">
                  <CharacterSheet 
                    character={myCharacter}
                    isOwner={true}
                    showInventory={true}
                    on:edit={(e) => openEditModal(e.detail)}
                    on:delete={(e) => handleDelete(e.detail)}
                  />
                </div>
              </div>
            {:else}
              <div class="flex justify-center">
                <div class="card-parchment p-6 sm:p-8 text-center max-w-2xl corner-ornament">
                  <div class="text-4xl sm:text-6xl mb-4">🧙‍♂️</div>
                  <h3 class="text-xl sm:text-2xl font-medieval text-neutral mb-3">No tienes personaje</h3>
                  <p class="text-sm sm:text-base text-neutral/70 font-body mb-6">
                    Crea tu personaje para unirte a las aventuras de esta campaña
                  </p>
                  <button 
                    on:click={openCreateModal}
                    class="btn btn-dnd btn-md sm:btn-lg"
                  >
                    <span class="text-xl sm:text-2xl">✨</span>
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
              <h2 class="text-2xl sm:text-3xl font-medieval text-center text-secondary mb-2">
                Compañeros de Aventura
              </h2>
              <p class="text-primary text-center font-body italic text-sm sm:text-base">
                Los demás héroes de esta campaña
              </p>
            </div>
            
            <div class="container mx-auto max-w-7xl">
              <div class="grid grid-cols-1 gap-6">
                {#each otherCharacters as character}
                  <div class="flex justify-center">
                    <div class="w-full max-w-6xl">
                      <CharacterSheet 
                        {character}
                        isOwner={false}
                        showInventory={true}
                      />
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