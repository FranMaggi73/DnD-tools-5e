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

  // Detectar rutas
  $: campaignId = $page.params.id;
  $: isCampaign = $page.url.pathname.startsWith('/campaigns/');
  $: isLoginPage = $page.url.pathname === '/login';
  $: isRootPage = $page.url.pathname === '/';

  // Auth state
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

      if (!user && $page.url.pathname !== '/login' && $page.url.pathname !== '/') {
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

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
</script>

<div class="min-h-screen relative safe-top safe-bottom" data-theme="dnd">
  {#if $loadingStore}
    <!-- Loading Screen -->
    <div class="flex flex-col items-center justify-center h-screen gap-4 px-4">
      <div class="text-4xl sm:text-5xl md:text-6xl">🎲</div>
      <span class="loading loading-spinner loading-md sm:loading-lg text-secondary"></span>
      <p class="font-medieval text-secondary text-sm sm:text-base text-center">Cargando grimorio...</p>
    </div>
  {:else}
    <!-- Sidebar (solo en campañas) -->
    {#if isCampaign && campaignId}
      <Sidebar campaignId={campaignId} bind:isOpen={sidebarOpen} />
    {/if}

    <!-- Header -->
    <div 
      class="navbar-medieval sticky top-0 z-30 w-full flex items-center justify-between 
             px-3 sm:px-4 lg:px-6 h-14 sm:h-16 lg:h-20
             safe-left safe-right py-8" 
    >
      <!-- LEFT SECTION -->
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <!-- Hamburger (solo en campañas) -->
        {#if isCampaign}
          <button
            class="btn btn-ghost btn-sm btn-circle flex-shrink-0"
            on:click={toggleSidebar}
            aria-label="Abrir menú"
            aria-expanded={sidebarOpen}
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
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>
        {/if}

        <!-- Title - Solo visible en móvil -->
        <h1 class="lg:hidden btn btn-ghost text-base sm:text-lg font-medieval text-secondary hover:text-accent sm:max-w-xs">
          {$headerTitle}
        </h1>
      </div>

      <!-- CENTER SECTION - Title centrado en desktop -->
      <div class="hidden lg:flex flex-1 justify-center">
        <h1 class="btn btn-ghost text-xl font-medieval text-secondary hover:text-accent max-w-md">
          {$headerTitle}
        </h1>
      </div>

      <!-- RIGHT SECTION -->
      <div class="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 justify-end">
        <!-- Invitaciones + Avatar (solo si hay usuario y no es login) -->
        {#if $userStore && !isLoginPage && !isRootPage}
          <InvitationsButton onInvitationResponded={handleInvitationResponded} />
          
          <div class="dropdown dropdown-end">
            <label 
              tabindex="0" 
              class="btn btn-ghost btn-circle avatar ring-2 ring-secondary ring-offset-2 ring-offset-neutral"
            >
              <div class="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full">
                <img 
                  src={$userStore?.photoURL || ''} 
                  alt={$userStore?.displayName || 'Usuario'}
                  class="object-cover"
                />
              </div>
            </label>
            <ul 
              tabindex="0" 
              class="mt-3 z-[50] p-2 shadow-xl menu menu-sm dropdown-content bg-neutral rounded-box w-48 sm:w-52 border-2 border-secondary"
            >
              <li>
                <a 
                  on:click={handleLogout} 
                  class="text-base-content hover:text-secondary font-medieval text-sm sm:text-base"
                >
                  🚪 Cerrar Sesión
                </a>
              </li>
            </ul>
          </div>
        {/if}
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)]">
      <slot />
    </div>
  {/if}
</div>

<style>
  /* Asegurar que el header no se rompa en móvil */
  .navbar-medieval {
    display: flex;
    flex-wrap: nowrap;
  }

  /* Prevenir scroll horizontal */
  :global(body) {
    overflow-x: hidden;
  }

  /* Mejorar el tap target en móvil */
  .btn-circle {
    min-width: 2.5rem;
    min-height: 2.5rem;
  }

  @media (min-width: 640px) {
    .btn-circle {
      min-width: 2.75rem;
      min-height: 2.75rem;
    }
  }

  /* Asegurar que los dropdowns estén sobre el sidebar */
  .dropdown-content {
    z-index: 60 !important;
  }
</style>