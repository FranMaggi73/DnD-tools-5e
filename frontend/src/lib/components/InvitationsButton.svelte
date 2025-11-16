<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api/api';
  import type { Invitation } from '$lib/types';

  export let onInvitationResponded: () => void = () => {};

  let invitations: Invitation[] = [];
  let loading = false;
  let showJoinModal = false;
  let joinCode = '';
  let joinError = '';
  let joining = false;
  let dropdownOpen = false; // ✅ NUEVO: Estado del dropdown

  onMount(() => {
    loadInvitations();
    const interval = setInterval(loadInvitations, 30000);
    return () => clearInterval(interval);
  });

  async function loadInvitations() {
    try {
      invitations = await api.getMyInvitations();
    } catch (err) {
      console.error('Error loading invitations:', err);
    }
  }

  async function handleJoinWithCode() {
    if (!joinCode.trim()) return;
    
    try {
      joining = true;
      joinError = '';
      const result = await api.invitationLinks.join(joinCode.trim());
      showJoinModal = false;
      joinCode = '';
      alert(result.message);
      onInvitationResponded();
      window.location.reload();
    } catch (err: any) {
      joinError = err.message || 'Error al unirse a la campaña';
    } finally {
      joining = false;
    }
  }

  async function respond(invitationId: string, action: 'accept' | 'reject') {
    try {
      loading = true;
      await api.respondToInvitation(invitationId, action);
      await loadInvitations();
      onInvitationResponded();
    } catch (err: any) {
      alert(err.message);
    } finally {
      loading = false;
    }
  }

  // ✅ NUEVO: Función para alternar dropdown
  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  // ✅ NUEVO: Cerrar dropdown al hacer clic fuera
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      dropdownOpen = false;
    }
  }

  $: if (dropdownOpen) {
    document.addEventListener('click', handleClickOutside);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
</script>

<!-- ✅ Estructura correcta del dropdown -->
<div class="dropdown dropdown-end">
  <!-- Botón principal -->
  <label 
    tabindex="0" 
    class="btn btn-ghost btn-circle indicator"
    on:click={toggleDropdown}
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      class="h-5 w-5 sm:h-6 sm:w-6" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
      />
    </svg>
    {#if invitations.length > 0}
      <span class="badge badge-sm badge-secondary indicator-item">{invitations.length}</span>
    {/if}
  </label>

  <!-- Contenido del dropdown - Solo se muestra cuando está abierto -->
  {#if dropdownOpen}
    <div
      tabindex="0"
      class="mt-3 z-[60] card card-compact dropdown-content w-96 max-w-[73vw] sm:max-w-sm md:max-w-md shadow-2xl bg-neutral border-2 border-secondary"
    >
      <div class="card-body">
        <h3 class="card-title text-xl font-medieval text-secondary">
          📜 Invitaciones
          {#if invitations.length > 0}
            <span class="badge badge-ornate">{invitations.length}</span>
          {/if}
        </h3>

        <div class="divider my-1 opacity-30">⚔️</div>

        <!-- Botón para unirse con código -->
        <button 
          on:click={() => showJoinModal = true}
          class="btn btn-sm btn-primary w-full gap-2"
        >
          <span>🔗</span>
          Unirme con Código
        </button>

        <div class="divider my-1 opacity-30">⚔️</div>

        {#if invitations.length === 0}
          <div class="text-center py-6">
            <div class="text-4xl mb-2 opacity-50">📭</div>
            <p class="text-base-content/70 font-body italic">No hay invitaciones pendientes</p>
          </div>
        {:else}
          <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
            {#each invitations as invitation}
              <div class="bg-gradient-to-br from-[#f4e4c1] to-[#e8d4a8] rounded-lg p-4 border-2 border-primary/30 shadow-md">
                <div class="flex items-start gap-3">
                  <div class="avatar">
                    <div class="w-12 rounded-full ring-2 ring-secondary ring-offset-2 ring-offset-[#f4e4c1]">
                      <img src={invitation.fromPhoto} alt={invitation.fromName} />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-sm text-neutral font-body">{invitation.fromName}</p>
                    <p class="text-xs text-neutral/60 font-body italic">te invita a la campaña</p>
                    <p class="font-semibold text-primary font-medieval mt-1">{invitation.campaignName}</p>
                    
                    <div class="flex gap-2 mt-3">
                      <button 
                        class="btn btn-success btn-xs text-white font-medieval"
                        on:click={() => respond(invitation.id, 'accept')}
                        disabled={loading}
                      >
                        ⚔️ Unirme
                      </button>
                      <button 
                        class="btn btn-error btn-xs text-white font-medieval"
                        on:click={() => respond(invitation.id, 'reject')}
                        disabled={loading}
                      >
                        ✕ Declinar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Modal para unirse con código -->
{#if showJoinModal}
  <div class="modal modal-open z-[70]" on:click={() => { showJoinModal = false; joinCode = ''; joinError = ''; }}>
    <div class="card-parchment border-4 border-secondary w-11/12 max-w-md relative p-6" on:click|stopPropagation>
      <button 
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
        on:click={() => { showJoinModal = false; joinCode = ''; joinError = ''; }}
      >✕</button>
      
      <h3 class="font-bold text-2xl font-medieval text-neutral mb-4 text-center">
        🔗 Unirse con Código
      </h3>

      {#if joinError}
        <div class="alert alert-error mb-4 text-sm">
          <span>{joinError}</span>
        </div>
      {/if}

      <div class="form-control">
        <label class="label">
          <span class="label-text font-medieval text-neutral">Código de Invitación</span>
        </label>
        <input 
          type="text" 
          bind:value={joinCode}
          placeholder="Ej: ABC123XY"
          class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 uppercase"
          maxlength="10"
        />
        <label class="label">
          <span class="label-text-alt text-neutral/60 italic text-xs">
            Ingresa el código que te compartió el DM
          </span>
        </label>
      </div>

      <div class="modal-action justify-center gap-4">
        <button 
          on:click={() => { showJoinModal = false; joinCode = ''; joinError = ''; }}
          class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
        >
          Cancelar
        </button>
        <button 
          on:click={handleJoinWithCode}
          class="btn btn-dnd"
          disabled={!joinCode.trim() || joining}
        >
          {#if joining}
            <span class="loading loading-spinner loading-sm"></span>
          {:else}
            <span class="text-xl">🚪</span>
          {/if}
          Unirme
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Scroll personalizado para las invitaciones */
  .space-y-3::-webkit-scrollbar {
    width: 8px;
  }

  .space-y-3::-webkit-scrollbar-track {
    background: rgba(139, 69, 19, 0.1);
    border-radius: 4px;
  }

  .space-y-3::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #8B4513, #654321);
    border-radius: 4px;
  }

  .space-y-3::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #A0522D, #8B4513);
  }
</style>