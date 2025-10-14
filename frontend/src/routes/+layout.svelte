<script lang="ts">
  import { onMount } from 'svelte';
  import { onAuthStateChanged } from 'firebase/auth';
  import { auth } from '$lib/firebase';
  import { userStore, loadingStore, tokenStore } from '$lib/stores/authStore';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import '../app.css';

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
</script>

<div class="min-h-screen" data-theme="dnd">
  {#if $loadingStore}
    <div class="flex flex-col items-center justify-center h-screen gap-4">
      <div class="text-6xl">🎲</div>
      <span class="loading loading-spinner loading-lg text-secondary"></span>
      <p class="font-medieval text-secondary">Cargando grimorio...</p>
    </div>
  {:else}
    <slot />
  {/if}
</div>