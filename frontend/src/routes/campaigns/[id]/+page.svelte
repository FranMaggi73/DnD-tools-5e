<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { userStore } from '$lib/stores/authStore';
  import { api } from '$lib/api/api';
  import { headerTitle } from '$lib/stores/uiStore';
  import type { Campaign, CampaignMembers } from '$lib/types';

  $: campaignId = $page.params.id || '';

  let campaign: Campaign | null = null;
  let members: CampaignMembers | null = null;
  let loading = true;
  let error = '';
  // Modales
  let showInviteModal = false;
  let showDeleteModal = false;
  let inviteEmail = '';
  let inviting = false;

  $: isDM = campaign && $userStore && campaign.dmId === $userStore.uid;

  onMount(async () => {
    await loadCampaign();
    await loadMembers();
  });

  async function loadCampaign() {
    try {
      campaign = await api.getCampaign(campaignId);
      if (campaign?.name) {
        headerTitle.set(campaign.name); // 👈 actualiza el título del header global
      }
    } catch (err: any) {
      error = err.message;
    }
  }

  async function loadMembers() {
    try {
      loading = true;
      members = await api.getCampaignMembers(campaignId);
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    
    try {
      inviting = true;
      error = '';
      await api.invitePlayer(campaignId, inviteEmail.trim());
      showInviteModal = false;
      inviteEmail = '';
      alert('¡Invitación enviada con éxito!');
      await loadMembers();
    } catch (err: any) {
      error = err.message;
    } finally {
      inviting = false;
    }
  }

  async function handleRemovePlayer(userId: string, userName: string) {
    if (!confirm(`¿Expulsar a ${userName} de la campaña?`)) return;
    
    try {
      await api.removePlayer(campaignId, userId);
      await loadMembers();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleDeleteCampaign() {
    if (!campaign) return;
    
    try {
      await api.deleteCampaign(campaignId);
      showDeleteModal = false;
      goto('/dashboard');
    } catch (err: any) {
      error = err.message;
    }
  }
</script>

<div class="min-h-screen flex flex-col">
  {#if error}
    <div class="container mx-auto p-4">
      <div class="alert alert-error">
        <span>{error}</span>
        <button class="btn btn-sm" on:click={() => error = ''}>✕</button>
      </div>
    </div>
  {/if}

  <div class="flex flex-1">
    <!-- Contenido principal -->
    <div class="flex-1 p-6">
      {#if loading}
        <div class="flex justify-center py-20">
          <span class="loading loading-spinner loading-lg text-secondary"></span>
        </div>
      {:else}
        <div class="container mx-auto max-w-6xl">
          <!-- Header de la campaña -->
          <div class="card-parchment mb-6 corner-ornament">
            <div class="card-body p-8">
              <div class="text-center mb-6">
                <div class="text-6xl mb-4">📜</div>
                <h1 class="text-5xl font-medieval text-neutral mb-3">{campaign?.name}</h1>
                <p class="text-neutral/60 font-body italic">Creada el {campaign ? new Date(campaign.createdAt).toLocaleDateString() : ''}</p>
              </div>

              {#if isDM}
                <div class="flex flex-wrap justify-center gap-3">
                  <button 
                    on:click={() => showInviteModal = true}
                    class="btn btn-success gap-2"
                  >
                    <span class="text-lg">✉️</span>
                    Invitar Jugador
                  </button>
                  <button 
                    on:click={() => goto(`/campaigns/${campaignId}/combat`)}
                    class="btn btn-dnd gap-2"
                  >
                    <span class="text-lg">⚔️</span>
                    Ir a Combate
                  </button>
                  <button 
                    on:click={() => goto(`/campaigns/${campaignId}/characters`)}
                    class="btn btn-info gap-2"
                  >
                    <span class="text-lg">🧙‍♂️</span>
                    Ver Personajes
                  </button>
                  <button 
                    on:click={() => showDeleteModal = true}
                    class="btn btn-error gap-2"
                  >
                    <span class="text-lg">🗑️</span>
                    Eliminar Campaña
                  </button>
                </div>
              {/if}
            </div>
          </div>

          <!-- Dungeon Master -->
          <div class="mb-6">
            <h2 class="text-3xl font-medieval text-secondary mb-4">👑 Dungeon Master</h2>
            <div class="card-parchment corner-ornament">
              <div class="card-body p-6">
                <div class="flex items-center gap-4">
                  <div class="avatar">
                    <div class="w-20 rounded-full ring-4 ring-secondary ring-offset-4 ring-offset-[#f4e4c1]">
                      <img src={members?.dm?.userPhoto || campaign?.dmPhoto} alt={members?.dm?.userName || campaign?.dmName} />
                    </div>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-2xl font-bold text-neutral font-medieval">
                      {members?.dm?.userName || campaign?.dmName}
                    </h3>
                    <p class="text-neutral/60 font-body">
                      Maestro de mazmorras desde {members?.dm ? new Date(members.dm.joinedAt).toLocaleDateString() : 'el principio'}
                    </p>
                  </div>
                  <div class="badge badge-ornate badge-lg">DM</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Jugadores -->
          <div>
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-3xl font-medieval text-secondary">🎲 Aventureros ({members?.players?.length || 0})</h2>
              {#if isDM}
                <button 
                  on:click={() => showInviteModal = true}
                  class="btn btn-success btn-sm gap-2"
                >
                  <span class="text-lg">➕</span>
                  Invitar
                </button>
              {/if}
            </div>

            {#if members?.players && members.players.length > 0}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each members.players as player}
                  <div class="card-parchment corner-ornament">
                    <div class="card-body p-5">
                      <div class="flex items-start gap-4">
                        <div class="avatar">
                          <div class="w-16 rounded-full ring-2 ring-success ring-offset-2 ring-offset-[#f4e4c1]">
                            <img src={player.userPhoto} alt={player.userName} />
                          </div>
                        </div>
                        <div class="flex-1">
                          <h3 class="text-xl font-bold text-neutral font-medieval mb-1">
                            {player.userName}
                          </h3>
                          <p class="text-sm text-neutral/60 font-body">
                            Se unió el {new Date(player.joinedAt).toLocaleDateString()}
                          </p>
                          <div class="badge badge-success badge-sm mt-2">Jugador</div>
                        </div>
                        
                        {#if isDM}
                          <div class="dropdown dropdown-end">
                            <label tabindex="0" class="btn btn-ghost btn-sm btn-circle">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </label>
                            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-neutral rounded-box w-52 border-2 border-secondary">
                              <li>
                                <a on:click={() => handleRemovePlayer(player.userId, player.userName)} class="text-error">
                                  🚫 Expulsar
                                </a>
                              </li>
                            </ul>
                          </div>
                        {/if}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="card-parchment p-12 text-center">
                <div class="text-4xl mb-3">🎲</div>
                <p class="text-xl font-medieval text-neutral mb-2">Sin aventureros</p>
                <p class="text-neutral/70 font-body">
                  {isDM ? 'Invita jugadores para comenzar la aventura' : 'Esperando que se unan más jugadores...'}
                </p>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Modal Invitar Jugador -->
{#if showInviteModal}
  <!-- Overlay -->
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <!-- Modal Box -->
    <div class="modal-box card-parchment border-4 border-secondary corner-ornament relative w-full max-w-md overflow-hidden">
      
      <!-- Botón Cerrar -->
      <button 
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
        on:click={() => { showInviteModal = false; inviteEmail = ''; }}
      >
        ✕
      </button>
      
      <!-- Título -->
      <h3 class="font-bold text-2xl font-medieval text-neutral mb-4 text-center">
        ✉️ Invitar Jugador
      </h3>

      <!-- Formulario -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medieval text-neutral text-lg">Email del Jugador</span>
        </label>
        <input 
          type="email" 
          bind:value={inviteEmail}
          placeholder="ejemplo@email.com"
          class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
        />
        <label class="label">
          <span class="label-text-alt text-neutral/60 italic">
            El jugador recibirá una invitación para unirse a la campaña
          </span>
        </label>
      </div>

      <!-- Acciones -->
      <div class="modal-action justify-center gap-4">
        <button 
          on:click={() => { showInviteModal = false; inviteEmail = ''; }}
          class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
        >
          Cancelar
        </button>
        <button 
          on:click={handleInvite}
          class="btn btn-success"
          disabled={!inviteEmail.trim() || inviting}
        >
          {#if inviting}
            <span class="loading loading-spinner loading-sm"></span>
          {:else}
            <span class="text-xl">📨</span>
          {/if}
          Enviar Invitación
        </button>
      </div>
    </div>
  </div>
{/if}


<!-- Modal Confirmar Eliminación -->
{#if showDeleteModal}
  <!-- Overlay -->
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <!-- Modal Box -->
    <div class="modal-box card-parchment border-4 border-error corner-ornament relative w-full max-w-lg overflow-hidden">
      
      <!-- Título -->
      <h3 class="font-bold text-2xl font-medieval text-neutral mb-4 text-center">
        ⚠️ Eliminar Campaña
      </h3>

      <!-- Contenido -->
      <div class="text-center mb-6">
        <div class="text-6xl mb-4">🔥</div>
        <p class="text-lg text-neutral font-body mb-2">
          ¿Estás seguro de que quieres eliminar esta campaña?
        </p>
        <p class="text-error font-bold font-medieval text-xl">
          Esta acción no se puede deshacer
        </p>
      </div>

      <div class="bg-error/20 p-4 rounded-lg border-2 border-error mb-4">
        <p class="text-sm text-neutral font-body">
          Se eliminarán permanentemente:
        </p>
        <ul class="list-disc list-inside text-sm text-neutral/70 font-body mt-2">
          <li>Todos los personajes</li>
          <li>Todos los encuentros y combates</li>
          <li>Todas las invitaciones</li>
          <li>Todos los datos de la campaña</li>
        </ul>
      </div>

      <!-- Acciones -->
      <div class="modal-action justify-center gap-4">
        <button 
          on:click={() => showDeleteModal = false}
          class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
        >
          Cancelar
        </button>
        <button 
          on:click={handleDeleteCampaign}
          class="btn btn-error"
        >
          <span class="text-xl">🗑️</span>
          Eliminar Definitivamente
        </button>
      </div>

    </div>
  </div>
{/if}
