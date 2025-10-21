<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  export let campaignId: string;
  export let isOpen: boolean = false;

  $: currentPath = $page.url.pathname;
  $: isCombatPage = currentPath === `/campaigns/${campaignId}/combat`;
  $: isCharactersPage = currentPath === `/campaigns/${campaignId}/characters`;
  $: isCampaignPage = currentPath === `/campaigns/${campaignId}`;

  function toggleSidebar() {
    isOpen = !isOpen;
  }
</script>

<div
  class={`bg-neutral border-r-4 border-secondary transition-all duration-300 fixed top-0 left-0 h-full z-50 ${
    isOpen ? 'w-64' : 'w-20'
  }`}
>
  <div class="p-4 space-y-2 flex flex-col h-full">
    <!-- Botón toggle -->
    <button
      on:click={toggleSidebar}
      class="btn btn-ghost btn-sm w-full text-secondary hover:text-accent mb-4"
      title={isOpen ? 'Ocultar sidebar' : 'Mostrar sidebar'}
    >
      <span class="text-xl">{isOpen ? '◀' : '▶'}</span>
    </button>

    <!-- Navegación -->
    <div class="space-y-2 flex-1 flex flex-col">
      {#each [
        { path: `/campaigns/${campaignId}`, label: 'Home', icon: '🏠', active: isCampaignPage },
        { path: `/campaigns/${campaignId}/combat`, label: 'Combate', icon: '⚔️', active: isCombatPage },
        { path: `/campaigns/${campaignId}/characters`, label: 'Personajes', icon: '🧙‍♂️', active: isCharactersPage }
      ] as item}
        <button
          on:click={() => goto(item.path)}
          class={`btn font-medieval transition-all duration-300 ${
            item.active
              ? 'btn-dnd'
              : 'btn-ghost text-secondary hover:text-accent'
          } ${isOpen ? 'w-full justify-start' : 'w-22 justify-center'}`}
          title={item.label}
        >
          <div class="flex items-center justify-center text-center w-fit ml-3">
            <span class="text-xl">{item.icon}</span>
            <span
              class={`ml-3 overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-w-[180px] opacity-100' : 'max-w-0 opacity-0'
              }`}
            >
              {item.label}
            </span>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>
