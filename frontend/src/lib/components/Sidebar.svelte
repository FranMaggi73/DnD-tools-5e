<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  export let campaignId: string;
  export let isOpen: boolean = true;

  $: currentPath = $page.url.pathname;
  $: isCombatPage = currentPath === `/campaigns/${campaignId}/combat`;
  $: isCharactersPage = currentPath === `/campaigns/${campaignId}/characters`;
  $: isCampaignPage = currentPath === `/campaigns/${campaignId}`;

  function toggleSidebar() {
    isOpen = !isOpen;
  }
</script>

<div class={`bg-neutral/50 border-r-4 border-secondary p-4 space-y-2 transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
  <!-- Botón toggle -->
  <button 
    on:click={toggleSidebar}
    class="btn btn-ghost btn-sm w-full justify-center mb-4 text-secondary hover:text-accent"
    title={isOpen ? 'Ocultar sidebar' : 'Mostrar sidebar'}
  >
    <span class="text-xl">{isOpen ? '◀' : '▶'}</span>
  </button>

  <!-- Navegación -->
  <button 
    on:click={() => goto(`/campaigns/${campaignId}`)}
    class={`btn w-full justify-start gap-2 font-medieval ${
      isCampaignPage 
        ? 'btn-dnd' 
        : 'btn-ghost text-secondary hover:text-accent'
    }`}
    title="Home"
  >
    <span class="text-xl">🏠</span>
    {#if isOpen}<span>Home</span>{/if}
  </button>
  <button 
    on:click={() => goto(`/campaigns/${campaignId}/combat`)}
    class={`btn w-full justify-start gap-2 font-medieval ${
      isCombatPage 
        ? 'btn-dnd' 
        : 'btn-ghost text-secondary hover:text-accent'
    }`}
    title="Combate"
  >
    <span class="text-xl">⚔️</span>
    {#if isOpen}<span>Combate</span>{/if}
  </button>

  <button 
    on:click={() => goto(`/campaigns/${campaignId}/characters`)}
    class={`btn w-full justify-start gap-2 font-medieval ${
      isCharactersPage 
        ? 'btn-dnd' 
        : 'btn-ghost text-secondary hover:text-accent'
    }`}
    title="Personajes"
  >
    <span class="text-xl">🧙‍♂️</span>
    {#if isOpen}<span>Personajes</span>{/if}
  </button>
</div>