<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api/api';
  import type { Invitation } from '$lib/types';

  export let onInvitationResponded: () => void = () => {};

  let invitations: Invitation[] = [];
  let loading = false;
  let showDropdown = false;

  // ✅ onMount corregido
  onMount(() => {
    // Cargar invitaciones al montar
    loadInvitations();

    // Polling cada 30 segundos
    const interval = setInterval(loadInvitations, 30000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  });

  async function loadInvitations() {
    try {
      invitations = await api.getMyInvitations();
    } catch (err) {
      console.error('Error loading invitations:', err);
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
</script>

<div class="dropdown dropdown-end">
  <label tabindex="0" class="btn btn-ghost btn-circle indicator">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
    </svg>
    {#if invitations.length > 0}
      <span class="badge badge-sm badge-primary indicator-item">{invitations.length}</span>
    {/if}
  </label>
  
  <div tabindex="0" class="mt-3 z-[1] card card-compact dropdown-content w-80 bg-base-100 shadow-xl">
    <div class="card-body">
      <h3 class="card-title text-lg">
        📬 Invitaciones
        {#if invitations.length > 0}
          <span class="badge badge-primary">{invitations.length}</span>
        {/if}
      </h3>

      {#if invitations.length === 0}
        <p class="text-center py-4 opacity-70">No tienes invitaciones pendientes</p>
      {:else}
        <div class="space-y-3 max-h-96 overflow-y-auto">
          {#each invitations as invitation}
            <div class="border border-base-300 rounded-lg p-3">
              <div class="flex items-start gap-3">
                <div class="avatar">
                  <div class="w-10 rounded-full">
                    <img src={invitation.fromPhoto} alt={invitation.fromName} />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-sm">{invitation.fromName}</p>
                  <p class="text-sm opacity-70">te invitó a</p>
                  <p class="font-semibold text-primary">{invitation.eventName}</p>
                  {#if invitation.eventDesc}
                    <p class="text-xs opacity-60 mt-1 line-clamp-2">{invitation.eventDesc}</p>
                  {/if}
                  
                  <div class="flex gap-2 mt-3">
                    <button 
                      class="btn btn-success btn-xs"
                      on:click={() => respond(invitation.id, 'accept')}
                      disabled={loading}
                    >
                      ✓ Aceptar
                    </button>
                    <button 
                      class="btn btn-error btn-xs"
                      on:click={() => respond(invitation.id, 'reject')}
                      disabled={loading}
                    >
                      ✗ Rechazar
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
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
