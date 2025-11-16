<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { api } from '$lib/api/api';
  import { goto } from '$app/navigation';
  import { userStore } from '$lib/stores/authStore';
  import type { Campaign, CampaignMembers, CampaignMember } from '$lib/types';
  import { headerTitle } from '$lib/stores/uiStore';
  import { validateCampaignName } from '$lib/utils/validation';
  
  // ===== NUEVO: Importar Firestore =====
  import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    onSnapshot,
    doc,
    getDocs,
    DocumentReference,
    DocumentSnapshot,
    documentId
  } from 'firebase/firestore';
  import { app } from '$lib/firebase';

  headerTitle.set('🎲 Grimorio de Aventuras');

  let campaigns: Campaign[] = [];
  let campaignsWithMembers: Array<{ campaign: Campaign; members: CampaignMembers }> = [];
  let loading = true;
  let showCreateModal = false;
  let newCampaign = { name: '' };
  let error = '';
  
  // Estados de validación
  let validationError = '';
  let touched = false;

  // ===== NUEVO: Listeners =====
  let campaignsUnsubscribe: (() => void) | null = null;
  const db = getFirestore(app);

  $: if (touched && newCampaign.name) {
    const result = validateCampaignName(newCampaign.name);
    validationError = result.valid ? '' : result.error || '';
  }

  $: isValid = !validationError && newCampaign.name.trim();

  onMount(async () => {
    if (!$userStore) return;

  // ✅ NUEVO: Detectar si viene el parámetro action=create
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'create') {
    showCreateModal = true;
    // Limpiar el parámetro de la URL
    window.history.replaceState({}, '', '/dashboard');
  }
    setupRealtimeListeners();
  });

  onDestroy(() => {
    if (campaignsUnsubscribe) campaignsUnsubscribe();
  });

    async function setupRealtimeListeners() {
    if (!$userStore) return;

    try {
      loading = true;
      error = '';

      const membersRef = collection(db, 'event_members');
      const membersQuery = query(
        membersRef,
        where('userId', '==', $userStore.uid)
      );

      campaignsUnsubscribe = onSnapshot(
        membersQuery,
        async (snapshot) => {
          const campaignIds = snapshot.docs.map(doc => doc.data().campaignId);

          if (campaignIds.length === 0) {
            campaigns = [];
            campaignsWithMembers = [];
            loading = false;
            return;
          }

          // ✅ OPTIMIZACIÓN: Obtener TODAS las campañas en una sola query
          const campaignsSnapshot = await getDocs(
            query(
              collection(db, 'events'),
              where(documentId(), 'in', campaignIds.slice(0, 10)) // Firestore limita 'in' a 10
            )
          );

          const campaignsMap = new Map(
            campaignsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() } as Campaign])
          );

          // ✅ Obtener miembros en paralelo
          const membersPromises = campaignIds.map(async (id) => {
            const membersSnapshot = await getDocs(
              query(
                collection(db, 'event_members'),
                where('campaignId', '==', id)
              )
            );

            const membersList = membersSnapshot.docs.map(doc => doc.data()) as CampaignMember[];

            let dm: CampaignMember | null = null;
            let players: CampaignMember[] = [];

            membersList.forEach(member => {
              if (member.role === 'dm') {
                dm = member;
              } else {
                players.push(member);
              }
            });

            return { campaignId: id, members: { dm, players } };
          });

          const membersResults = await Promise.all(membersPromises);
          const membersMap = new Map(
            membersResults.map(r => [r.campaignId, r.members])
          );

          // ✅ Combinar resultados
          campaignsWithMembers = campaignIds
            .map(id => {
              const campaign = campaignsMap.get(id);
              const members = membersMap.get(id);
              
              if (!campaign || !members) return null;
              
              return { campaign, members };
            })
            .filter(Boolean) as Array<{ campaign: Campaign; members: CampaignMembers }>;

          loading = false;
        },
        (err) => {
          console.error('Error en listener de campañas:', err);
          error = err.message;
          loading = false;
        }
      );

    } catch (err: any) {
      error = err?.message ?? String(err);
      loading = false;
    }
  }

// ✅ NUEVO: Helper para getAll (necesario porque Firestore no lo exporta directamente)
async function getAll(...refs: DocumentReference[]): Promise<DocumentSnapshot[]> {
  const { getFirestore, getDoc } = await import('firebase/firestore');
  return Promise.all(refs.map(ref => getDoc(ref)));
}

  function handleInputChange() {
    touched = true;
  }

  async function createCampaign() {
    touched = true;
    
    const validation = validateCampaignName(newCampaign.name);
    if (!validation.valid) {
      validationError = validation.error || '';
      return;
    }

    try {
      error = '';
      await api.createCampaign({ name: newCampaign.name.trim() });
      showCreateModal = false;
      newCampaign = { name: '' };
      touched = false;
      validationError = '';
      // ✅ El listener actualizará automáticamente
    } catch (err: any) {
      error = err?.message ?? String(err);
    }
  }

  function handleCloseModal() {
    showCreateModal = false;
    newCampaign = { name: '' };
    touched = false;
    validationError = '';
  }
</script>

<div class="container mx-auto justify-center items-center flex flex-col p-6 lg:p-8">
  <div class="mb-8 text-center">
    <h1 class="text-4xl lg:text-5xl font-bold text-secondary title-ornament mx-4 mb-3 text-shadow">
      Mis Campañas
    </h1>
    <p class="text-base-content/70 font-body italic text-lg">
      "Las aventuras aguardan a quienes se atreven a explorar..."
    </p>
  </div>
      <button 
      on:click={() => showCreateModal = true}
      class="btn btn-circle btn-primary btn-lg fixed bottom-6 right-6 shadow-xl z-40"
      title="Crear nueva campaña"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  {#if error}
    <div class="alert bg-error/20 border-2 border-error mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-error shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="font-body">{error}</span>
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center py-20">
      <div class="relative">
        <span class="loading loading-spinner loading-lg text-secondary"></span>
        <p class="mt-4 text-secondary font-medieval">Consultando el grimorio...</p>
      </div>
    </div>
  {:else if campaignsWithMembers.length === 0}
    <div class="card-parchment max-w-2xl mx-auto p-12 text-center corner-ornament">
      <div class="text-6xl mb-4">📖</div>
      <h2 class="text-2xl font-medieval mb-3 text-neutral">Tu Grimorio está Vacío</h2>
      <p class="text-neutral/70 font-body text-lg mb-6">
        No has creado ninguna campaña aún. ¡Comienza tu primera aventura épica!
      </p>
      <button 
        on:click={() => showCreateModal = true}
        class="btn btn-dnd"
      >
        Crear Primera Campaña
      </button>
    </div>
  {:else}
    <div class="w-fit gap-6">
      {#each campaignsWithMembers as { campaign, members }}
        <div class="card-parchment card-hover corner-ornament">
          <div class="card-body">
            <h2 class="card-title text-2xl font-medieval text-neutral mb-4 text-center">
              {campaign.name}
            </h2>
            <div class="mb-4 bg-gradient-to-r from-primary/20 to-accent/20 p-3 rounded-lg border border-primary/30">
              <p class="text-xs font-medieval text-neutral/60 mb-2 tracking-wider">DUNGEON MASTER</p>
              <div class="flex items-center gap-3">
                <div class="avatar">
                  <div class="w-10 rounded-full ring-2 ring-secondary ring-offset-2 ring-offset-[#f4e4c1]">
                    <img src={members?.dm?.userPhoto || campaign.dmPhoto || ''} alt={members?.dm?.userName || campaign.dmName || 'DM'} />
                  </div>
                </div>
                <div>
                  <p class="font-bold text-neutral font-body">{members?.dm?.userName || campaign.dmName || 'Dungeon Master'}</p>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-r from-info/10 to-success/10 p-3 rounded-lg border border-info/30">
              <p class="text-xs font-medieval text-neutral/60 mb-2 tracking-wider">
                AVENTUREROS ({(members?.players ?? []).length})
              </p>

              {#if (members?.players ?? []).length > 0}
                <div class="flex flex-wrap gap-2">
                  {#each (members?.players ?? []).slice(0, 6) as player}
                    <div class="avatar" title={player.userName || 'Jugador'}>
                      <div class="w-9 rounded-full ring-2 ring-success ring-offset-2 ring-offset-[#f4e4c1]">
                        <img src={player.userPhoto || ''} alt={player.userName || 'Jugador'} />
                      </div>
                    </div>
                  {/each}

                  {#if (members?.players ?? []).length > 6}
                    <div class="avatar placeholder">
                      <div class="w-9 rounded-full bg-neutral text-secondary ring-2 ring-secondary">
                        <span class="text-xs font-bold">+{(members?.players ?? []).length - 6}</span>
                      </div>
                    </div>
                  {/if}
                </div>
              {:else}
                <p class="text-sm text-neutral/60 font-body italic">En busca de valientes aventureros...</p>
              {/if}
            </div>

            <div class="card-actions justify-center mt-6">
              <button 
                on:click={() => goto(`/campaigns/${campaign.id}`)}
                class="btn btn-dnd w-full"
              >
                <span class="text-xl">⚔️</span>
                Entrar a la Aventura
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if showCreateModal}
  <div class="modal modal-open z-50 fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div 
      class="card-parchment border-4 border-secondary corner-ornament w-[420px] max-w-full relative p-6 flex flex-col transition-all duration-200 transform scale-100"
    >
      <!-- Header -->
      <h3 class="font-bold text-2xl font-medieval text-neutral text-center mb-4">
        📜 Crear Nueva Campaña
      </h3>

      <!-- Input -->
      <div class="form-control w-full flex-1">
        <label class="label">
          <span class="label-text font-medieval text-neutral text-lg">
            Nombre de la Campaña <span class="text-error">*</span>
          </span>
        </label>
        <input 
          type="text" 
          bind:value={newCampaign.name}
          on:input={handleInputChange}
          placeholder="Ej: La Mina Perdida de Phandelver"
          class="input bg-[#2d241c] text-base-content border-2 
                 {validationError && touched ? 'border-error' : 'border-primary/50'} 
                 w-full text-lg font-body 
                 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50"
        />
        {#if validationError && touched}
          <label class="label">
            <span class="label-text-alt text-error">
              <span class="text-lg">⚠️</span> {validationError}
            </span>
          </label>
        {:else}
          <label class="label">
            <span class="label-text-alt text-neutral/60 italic">
              Elige un nombre épico para tu aventura (3-100 caracteres)
            </span>
          </label>
        {/if}
      </div>

      <!-- Botones -->
      <div class="mt-6 flex justify-center gap-4">
        <button 
          on:click={handleCloseModal}
          class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval w-32"
        >
          Cancelar
        </button>
        <button 
          on:click={createCampaign} 
          class="btn btn-dnd w-32 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isValid}
        >
          <span class="text-xl">✨</span>
          Crear
        </button>
      </div>
    </div>
  </div>
{/if}