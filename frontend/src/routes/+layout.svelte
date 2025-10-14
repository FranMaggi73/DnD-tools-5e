<script lang="ts">
  // El componente recibe params desde SvelteKit. 
  // Lo declaramos para evitar el warning runtime, y usamos `void params`
  // para evitar que el compilador nos marque "export sin usar".
  export let params: Record<string, string> | undefined;
  void params;

  import { onMount } from 'svelte';
  import { onAuthStateChanged } from 'firebase/auth';
  import { auth } from '$lib/firebase';
  import { userStore, loadingStore, tokenStore } from '$lib/stores/authStore';
  import { goto } from '$app/navigation';
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

      if (!user && window.location.pathname !== '/login') {
        goto('/login');
      }
    });

    return () => unsubscribe();
  });
</script>

<div class="min-h-screen bg-base-200">
  {#if $loadingStore ?? true}
    <div class="flex items-center justify-center h-screen">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else}
    <slot />
  {/if}
</div>
