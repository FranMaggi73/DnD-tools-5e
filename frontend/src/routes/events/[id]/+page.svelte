<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { tokenStore } from '$lib/stores/authStore';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';

  // estado
  let loading = true;
  let error: string | null = null;
  let event: any = null;

  // obtener id de la URL
  $: id = $page.params.id; // o use get(page).params.id

  onMount(async () => {
    // obtener token del store (asegurate de llenarlo al loguear)
    const token = get(tokenStore);
    if (!token) {
      // si no hay token, redirigir a login
      goto('/login');
      return;
    }

    try {
      loading = true;
      const res = await fetch(`/api/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 404) {
        error = 'Evento no encontrado';
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        error = body.error || `Error ${res.status}`;
        return;
      }

      event = await res.json();
    } catch (err: any) {
      error = err.message || 'Error de red';
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="flex items-center justify-center h-64">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
{:else if error}
  <div class="p-6">
    <div class="alert alert-error">
      <span>{error}</span>
    </div>
    <div class="mt-4">
      <button class="btn" on:click={() => goto('/dashboard')}>Volver</button>
    </div>
  </div>
{:else}
  <div class="container mx-auto p-6">
    <div class="mb-4">
      <button class="btn btn-ghost" on:click={() => goto('/dashboard')}>← Volver</button>
    </div>

    <h1 class="text-2xl font-bold mb-2">{event.name}</h1>
    <p class="mb-4">{event.description}</p>

    <div class="flex items-center gap-3 mb-6">
      <img src={event.dmPhoto || ''} alt={event.dmName || ''} class="w-12 h-12 rounded-full" />
      <div>
        <div class="font-bold">{event.dmName || 'DM'}</div>
        <div class="text-sm opacity-60">Dungeon Master</div>
      </div>
    </div>

    <!-- más detalles -->
    <div>
      <h2 class="text-lg font-semibold mb-2">Jugadores</h2>
      {#if event.playerIds && event.playerIds.length > 0}
        <ul>
          {#each event.playerIds as pid}
            <li class="py-1">{pid}</li>
          {/each}
        </ul>
      {:else}
        <p class="opacity-60">Aún no hay jugadores</p>
      {/if}
    </div>
  </div>
{/if}
