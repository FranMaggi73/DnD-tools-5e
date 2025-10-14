<script lang="ts">
  export let params: Record<string, string> | undefined;
  void params;

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { userStore, loadingStore } from '$lib/stores/authStore';

  onMount(() => {
    if ($loadingStore ?? true) return;

    if ($userStore) {
      goto('/dashboard');
    } else {
      goto('/login');
    }
  });
</script>

<div class="flex items-center justify-center h-screen">
  <span class="loading loading-spinner loading-lg"></span>
</div>
