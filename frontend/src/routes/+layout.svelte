<script lang="ts">
  import { onMount } from 'svelte';
  import { onAuthStateChanged, signOut } from 'firebase/auth';
  import { auth } from '$lib/firebase';
  import { userStore, loadingStore, tokenStore } from '$lib/stores/authStore';
  import { headerTitle } from '$lib/stores/uiStore';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import InvitationsButton from '$lib/components/InvitationsButton.svelte';
  import '../app.css';

  let sidebarOpen = false;

  // Info de la ruta
  $: campaignId = $page.params.id;
  $: isDashboard = $page.url.pathname === '/dashboard';
  $: isCampaign = $page.url.pathname.startsWith('/campaigns/');

  // Manejo de autenticación
  onMount(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      userStore.set(user);

      if (user) {
        const token = await user.getIdToken();
        tokenStore.set(token);
      } else {
        tokenStore.set(null);
      }

      loadingStore.set(false);

      if (!user && $page.url.pathname !== '/login') {
        goto('/login');
      }
    });

    return () => unsubscribe();
  });

  function handleLogout() {
    signOut(auth).then(() => goto('/login'));
  }

  function handleInvitationResponded() {
    location.reload();
  }
</script>

<div class="min-h-screen relative" data-theme="dnd">
  {#if $loadingStore}
    <!-- Pantalla de carga -->
    <div class="flex flex-col items-center justify-center h-screen gap-4">
      <div class="text-6xl">🎲</div>
      <span class="loading loading-spinner loading-lg text-secondary"></span>
      <p class="font-medieval text-secondary">Cargando grimorio...</p>
    </div>
  {:else}
    {#if isCampaign && campaignId}
      <Sidebar campaignId={campaignId} bind:isOpen={sidebarOpen} />
    {/if}

    <!-- Header -->
    <div class="navbar-medieval sticky top-0 z-10 w-full flex items-center justify-between px-6">
      {#if isDashboard}
        <!-- HEADER DASHBOARD -->
        <div class="flex-1"></div>

        <!-- Título centrado -->
        <div class="flex justify-center items-center flex-1 h-20">
          <h1 class="btn btn-ghost text-xl font-medieval text-secondary hover:text-accent">
            {$headerTitle}
          </h1>
        </div>

        <!-- Bandeja + Avatar -->
        <div class="flex justify-end items-center flex-1 gap-2">
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

      {:else}
        <!-- HEADER GENERAL (incluye campañas y otras rutas) -->
        <div class="flex-1 z-1"></div>
        <div class="flex justify-center items-center flex-1 h-20">
          <h1 class="btn btn-ghost text-xl font-medieval text-secondary hover:text-accent">
            {$headerTitle}
          </h1>
        </div>
        <div class="flex-1 flex justify-end">
          {#if isCampaign}
            <button
              on:click={() => goto('/dashboard')}
              class="btn btn-ghost font-medieval text-secondary hover:text-accent"
            >
              Volver al Grimorio →
            </button>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Contenido principal -->
    <div class="relative">
      <slot />
    </div>
  {/if}
</div>
