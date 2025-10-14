<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { userStore } from '$lib/stores/authStore';
  import { api } from '$lib/api/api';

  let event: any = null;
  let members: any = { dm: null, players: [] };
  let loading = true;
  let error = '';
  let showInviteModal = false;
  let showDeleteModal = false;
  let playerToDelete: any = null;
  let inviteEmail = '';

  $: eventId = $page.params.id || '';

  onMount(async () => {
    await loadEventData();
  });

  async function loadEventData() {
    if (!eventId) {
      error = 'ID de evento no válido';
      loading = false;
      return;
    }

    try {
      loading = true;
      error = '';
      
      [event, members] = await Promise.all([
        api.getEvent(eventId),
        api.getEventMembers(eventId)
      ]);
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function invitePlayer() {
    try {
      error = '';
      await api.invitePlayer(eventId, inviteEmail);
      showInviteModal = false;
      inviteEmail = '';
      await loadEventData();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function removePlayer(playerId: string) {
    try {
      error = '';
      await api.removePlayer(eventId, playerId);
      playerToDelete = null;
      await loadEventData();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function deleteEvent() {
    try {
      error = '';
      await api.deleteEvent(eventId);
      goto('/dashboard');
    } catch (err: any) {
      error = err.message;
    }
  }

  $: isCurrentUserDM = event && $userStore && event.dmId === $userStore.uid;
</script>

<div class="min-h-screen bg-base-200">
  <!-- Navbar -->
  <div class="navbar bg-base-100 shadow-lg">
    <div class="flex-1">
      <button on:click={() => goto('/dashboard')} class="btn btn-ghost">
        ← Volver
      </button>
    </div>
  </div>

  <div class="container mx-auto p-4 max-w-4xl">
    {#if loading}
      <div class="flex justify-center items-center h-64">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    {:else if error && !event}
      <div class="alert alert-error">
        <span>{error}</span>
      </div>
    {:else if event}
      <!-- Header del Evento -->
      <div class="card bg-base-100 shadow-xl mb-6">
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="card-title text-3xl mb-2">{event.name}</h1>
              <p class="opacity-70">{event.description}</p>
              <p class="text-sm opacity-50 mt-2">
                Creado el {new Date(event.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            {#if isCurrentUserDM}
              <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-ghost btn-circle">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </label>
                <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li><a on:click={() => showInviteModal = true}>Invitar Jugador</a></li>
                  <li><a class="text-error" on:click={() => showDeleteModal = true}>Eliminar Evento</a></li>
                </ul>
              </div>
            {/if}
          </div>
        </div>
      </div>

      {#if error}
        <div class="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      {/if}

      <!-- Sección DM -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="badge badge-primary">DM</span>
          Dungeon Master
        </h2>
        
        {#if members.dm}
          <div class="card bg-base-100 shadow-lg">
            <div class="card-body">
              <div class="flex items-center gap-4">
                <div class="avatar">
                  <div class="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={members.dm.userPhoto} alt={members.dm.userName} />
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold">{members.dm.userName}</h3>
                  <p class="text-sm opacity-50">
                    Líder desde {new Date(members.dm.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                {#if members.dm.userId === $userStore?.uid}
                  <div class="badge badge-success">Tú</div>
                {/if}
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Sección Jugadores -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <span class="badge badge-secondary">
              {members.players?.length || 0}
            </span>
            Jugadores
          </h2>
          
          {#if isCurrentUserDM}
            <button 
              on:click={() => showInviteModal = true}
              class="btn btn-sm btn-primary"
            >
              + Invitar
            </button>
          {/if}
        </div>

        {#if members.players && members.players.length > 0}
          <div class="space-y-3">
            {#each members.players as player}
              <div class="card bg-base-100 shadow-lg">
                <div class="card-body py-4">
                  <div class="flex items-center gap-4">
                    <div class="avatar">
                      <div class="w-12 rounded-full">
                        <img src={player.userPhoto} alt={player.userName} />
                      </div>
                    </div>
                    <div class="flex-1">
                      <h3 class="font-bold">{player.userName}</h3>
                      <p class="text-xs opacity-50">
                        Unido el {new Date(player.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div class="flex gap-2">
                      {#if player.userId === $userStore?.uid}
                        <div class="badge badge-success">Tú</div>
                      {/if}
                      
                      {#if isCurrentUserDM}
                        <button 
                          on:click={() => playerToDelete = player}
                          class="btn btn-sm btn-ghost btn-circle text-error"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-12 bg-base-100 rounded-lg">
            <p class="text-lg opacity-70">No hay jugadores aún</p>
            <p class="opacity-50 mt-2">
              {isCurrentUserDM ? 'Invita jugadores para comenzar' : 'Esperando que el DM invite jugadores'}
            </p>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- Modal Invitar Jugador -->
{#if showInviteModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Invitar Jugador</h3>
      
      <div class="form-control w-full mt-4">
        <label class="label">
          <span class="label-text">Email del jugador</span>
        </label>
        <input 
          type="email" 
          bind:value={inviteEmail}
          placeholder="jugador@ejemplo.com"
          class="input input-bordered w-full" 
        />
      </div>

      <div class="modal-action">
        <button 
          on:click={() => { showInviteModal = false; inviteEmail = ''; }}
          class="btn"
        >
          Cancelar
        </button>
        <button 
          on:click={invitePlayer}
          class="btn btn-primary"
          disabled={!inviteEmail}
        >
          Invitar
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Modal Eliminar Jugador -->
{#if playerToDelete}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Eliminar Jugador</h3>
      <p class="py-4">
        ¿Estás seguro de que quieres eliminar a <strong>{playerToDelete.userName}</strong> del evento?
      </p>

      <div class="modal-action">
        <button 
          on:click={() => playerToDelete = null}
          class="btn"
        >
          Cancelar
        </button>
        <button 
          on:click={() => removePlayer(playerToDelete.userId)}
          class="btn btn-error"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Modal Eliminar Evento -->
{#if showDeleteModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg text-error">⚠️ Eliminar Evento</h3>
      <p class="py-4">
        ¿Estás seguro de que quieres eliminar este evento? 
        <strong>Esta acción no se puede deshacer</strong> y eliminará todos los datos asociados.
      </p>

      <div class="modal-action">
        <button 
          on:click={() => showDeleteModal = false}
          class="btn"
        >
          Cancelar
        </button>
        <button 
          on:click={deleteEvent}
          class="btn btn-error"
        >
          Eliminar Evento
        </button>
      </div>
    </div>
  </div>
{/if}