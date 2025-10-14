<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api/api';
  import type { Invitation } from '$lib/types';

  export let onInvitationResponded: () => void = () => {};

  let invitations: Invitation[] = [];
  let loading = false;

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
  <label tabindex="0" class="btn btn-ghost btn-circle indicator ring-2 ring-secondary/50 hover:ring-secondary transition-all">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
    </svg>
    {#if invitations.length > 0}
      <span class="badge badge-sm badge-ornate indicator-item animate-pulse">{invitations.length}</span>
    {/if}
  </label>
  
  <div tabindex="0" class="mt-3 z-[1] card card-compact dropdown-content w-96 shadow-2xl bg-neutral border-2 border-secondary">
    <div class="card-body">
      <h3 class="card-title text-xl font-medieval text-secondary">
        📜 Invitaciones
        {#if invitations.length > 0}
          <span class="badge badge-ornate">{invitations.length}</span>
        {/if}
      </h3>

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
</div>

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