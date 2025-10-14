<script lang="ts">
  import { onMount } from 'svelte';
  import { signOut } from 'firebase/auth';
  import { auth } from '$lib/firebase';
  import { userStore } from '$lib/stores/authStore';
  import { api } from '$lib/api/api';
  import { goto } from '$app/navigation';
  import InvitationsButton from '$lib/components/InvitationsButton.svelte';


  let events: any[] = [];
  let loading = true;
  let showCreateModal = false;
  let newEvent = { name: '', description: '' };
  let error = '';

  onMount(async () => {
    await loadEvents();
  });

  async function loadEvents() {
    try {
      loading = true;
      const res = await api.getEvents();
      events = Array.isArray(res) ? res : []; // asegura array
    } catch (err: any) {
      error = err.message;
      events = []; // fallback
    } finally {
      loading = false;
    }
  }

  async function createEvent() {
    try {
      error = '';
      await api.createEvent(newEvent);
      showCreateModal = false;
      newEvent = { name: '', description: '' };
      await loadEvents();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleLogout() {
    await signOut(auth);
    goto('/login');
  }

  async function handleInvitationResponded() {
    await loadEvents();
  }
</script>

<div class="navbar bg-base-100 shadow-lg">
  <div class="flex-1">
    <a href="/dashboard" class="btn btn-ghost text-xl">🎲 DM Events</a>
  </div>
  <div class="flex-none gap-2">
    <InvitationsButton onInvitationResponded={handleInvitationResponded} />
    <div class="dropdown dropdown-end">
      <label tabindex="0" class="btn btn-ghost btn-circle avatar">
        <div class="w-10 rounded-full">
          <img src={$userStore?.photoURL || ''} alt={$userStore?.displayName || ''} />
        </div>
      </label>
      <ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
        <li><a on:click={handleLogout}>Cerrar Sesión</a></li>
      </ul>
    </div>
  </div>
</div>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Mis Eventos</h1>
    <button 
      on:click={() => showCreateModal = true}
      class="btn btn-primary"
    >
      + Crear Evento
    </button>
  </div>

  {#if error}
    <div class="alert alert-error mb-4">
      <span>{error}</span>
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if (events?.length ?? 0) === 0}
    <div class="text-center py-12">
      <p class="text-xl opacity-70">No tienes eventos aún</p>
      <p class="opacity-50">Crea tu primer evento para comenzar</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each events as event}
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">{event.name}</h2>
            <p class="opacity-70">{event.description}</p>

            <div class="flex items-center gap-2 mt-2">
              <div class="avatar">
                <div class="w-8 rounded-full">
                  <img src={event.dmPhoto || ''} alt={event.dmName || ''} />
                </div>
              </div>
              <div>
                <p class="text-sm font-bold">{event.dmName || 'Desconocido'}</p>
                <p class="text-xs opacity-50">Dungeon Master</p>
              </div>
            </div>

            <div class="card-actions justify-end mt-4">
              <button 
                on:click={() => goto(`/events/${event.id}`)}
                class="btn btn-sm btn-primary"
              >
                Ver Detalles
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
    <div class="modal-box">
      <h3 class="font-bold text-lg">Crear Nuevo Evento</h3>
      
      <div class="form-control w-full mt-4">
        <label class="label">
          <span class="label-text">Nombre del Evento</span>
        </label>
        <input 
          type="text" 
          bind:value={newEvent.name}
          placeholder="Ej: Campaña de D&D"
          class="input input-bordered w-full" 
        />
      </div>

      <div class="form-control w-full mt-4">
        <label class="label">
          <span class="label-text">Descripción</span>
        </label>
        <textarea 
          bind:value={newEvent.description}
          placeholder="Describe tu evento..."
          class="textarea textarea-bordered h-24"
        ></textarea>
      </div>

      <div class="modal-action">
        <button on:click={() => showCreateModal = false} class="btn">Cancelar</button>
        <button on:click={createEvent} class="btn btn-primary" disabled={!newEvent.name}>
          Crear
        </button>
      </div>
    </div>
  </div>
{/if}
