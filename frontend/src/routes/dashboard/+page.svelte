<script lang="ts">
  import { onMount } from 'svelte';
  import { signOut } from 'firebase/auth';
  import { auth } from '$lib/firebase';
  import { userStore } from '$lib/stores/authStore';
  import { api } from '$lib/api/api';
  import { goto } from '$app/navigation';
  import InvitationsButton from '$lib/components/InvitationsButton.svelte';
  import type { Campaign, CampaignMembers } from '$lib/types';

  let campaigns: Campaign[] = [];
  let campaignsWithMembers: Array<{ campaign: Campaign; members: CampaignMembers }> = [];
  let loading = true;
  let showCreateModal = false;
  let newCampaign = { name: '' };
  let error = '';

  onMount(async () => {
    await loadCampaigns();
  });

  async function loadCampaigns() {
    try {
      loading = true;
      error = '';

      const fetchedCampaigns = await api.getCampaigns();
      campaigns = Array.isArray(fetchedCampaigns) ? fetchedCampaigns : [];

      const campaignsData = await Promise.all(
        campaigns.map(async (campaign) => {
          try {
            const rawMembers = await api.getCampaignMembers(campaign.id);
            const members: CampaignMembers = {
              dm: rawMembers?.dm ?? null,
              players: Array.isArray(rawMembers?.players) ? rawMembers!.players : [],
            };
            return { campaign, members };
          } catch (err) {
            return { campaign, members: { dm: null, players: [] } };
          }
        })
      );

      campaignsWithMembers = campaignsData;
    } catch (err: any) {
      error = err?.message ?? String(err);
      campaigns = [];
      campaignsWithMembers = [];
    } finally {
      loading = false;
    }
  }

  async function createCampaign() {
    try {
      error = '';
      if (!newCampaign.name || !newCampaign.name.trim()) {
        error = 'El nombre de la campaña no puede estar vacío.';
        return;
      }
      await api.createCampaign({ name: newCampaign.name.trim() });
      showCreateModal = false;
      newCampaign = { name: '' };
      await loadCampaigns();
    } catch (err: any) {
      error = err?.message ?? String(err);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    goto('/login');
  }

  async function handleInvitationResponded() {
    await loadCampaigns();
  }
</script>

<div class="navbar-medieval sticky top-0 z-50">
  <div class="container mx-auto">
    <div class="flex-1"></div>
    <div class="flex-none flex justify-center flex-1">
      <a href="/dashboard" class="btn btn-ghost text-xl font-medieval text-secondary hover:text-accent">
        🎲 Grimorio de Aventuras
      </a>
    </div>
    <div class="flex-none gap-2 flex-1 flex justify-end">
      <InvitationsButton onInvitationResponded={handleInvitationResponded} />
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-circle avatar ring-2 ring-secondary ring-offset-2 ring-offset-neutral">
          <div class="w-10 rounded-full">
            <img src={$userStore?.photoURL || ''} alt={$userStore?.displayName || ''} />
          </div>
        </label>
        <ul tabindex="0" class="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content bg-neutral rounded-box w-52 border-2 border-secondary">
          <li>
            <a on:click={handleLogout} class="text-base-content hover:text-secondary font-medieval">
              🚪 Cerrar Sesión
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>

<div class="container mx-auto p-6 lg:p-8">
  <div class="mb-8 text-center">
    <h1 class="text-4xl lg:text-5xl font-bold text-secondary title-ornament mb-3 text-shadow">
      Mis Campañas
    </h1>
    <p class="text-base-content/70 font-body italic text-lg">
      "Las aventuras aguardan a quienes se atreven a explorar..."
    </p>
  </div>

  <div class="flex justify-center mb-8">
    <button 
      on:click={() => showCreateModal = true}
      class="btn btn-dnd btn-lg gap-2"
    >
      <span class="text-2xl">📜</span>
      Crear Nueva Campaña
    </button>
  </div>

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
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each campaignsWithMembers as { campaign, members }}
        <div class="card-parchment card-hover corner-ornament">
          <div class="card-body">
            <h2 class="card-title text-2xl font-medieval text-neutral mb-4 text-center">
              {campaign.name}
            </h2>

            <div class="divider my-1">⚔️</div>

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
  <div class="modal modal-open">
    <div class="modal-box card-parchment border-4 border-secondary corner-ornament">
      <h3 class="font-bold text-2xl font-medieval text-neutral mb-4 text-center">
        📜 Crear Nueva Campaña
      </h3>
      
      <div class="form-control w-full mt-6">
        <label class="label">
          <span class="label-text font-medieval text-neutral text-lg">Nombre de la Campaña</span>
        </label>
        <input 
          type="text" 
          bind:value={newCampaign.name}
          placeholder="Ej: La Mina Perdida de Phandelver"
          class="input input-medieval w-full text-lg font-body" 
        />
        <label class="label">
          <span class="label-text-alt text-neutral/60 italic">Elige un nombre épico para tu aventura</span>
        </label>
      </div>

      <div class="modal-action justify-center gap-4">
        <button on:click={() => { showCreateModal = false; newCampaign = { name: '' }; }} class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval">
          Cancelar
        </button>
        <button on:click={createCampaign} class="btn btn-dnd" disabled={!newCampaign.name || !newCampaign.name.trim()}>
          <span class="text-xl">✨</span>
          Crear Campaña
        </button>
      </div>
    </div>
  </div>
{/if}