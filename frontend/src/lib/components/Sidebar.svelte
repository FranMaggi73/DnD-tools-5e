<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  export let campaignId: string;
  export let isOpen: boolean = false;

  // refs para cada botón
  let btnRefs: Array<HTMLButtonElement | undefined> = [];

  $: currentPath = $page.url.pathname;
  $: isCombatPage = currentPath === `/campaigns/${campaignId}/combat`;
  $: isCharactersPage = currentPath === `/campaigns/${campaignId}/characters`;
  $: isCampaignPage = currentPath === `/campaigns/${campaignId}`;

  function closeSidebar() {
    isOpen = false;
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') closeSidebar();
  }


  function navigateTo(path: string) {
    goto(path);
    closeSidebar();
  }
</script>

<svelte:window on:keydown={onKeydown} />

{#if isOpen}
  <div class="fixed inset-0 bg-black/40 z-40" on:click={closeSidebar} aria-hidden="true" />
{/if}

<div
  class={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-72`}
  role="navigation"
  aria-label="Sidebar navegación"
  aria-hidden={!isOpen}
>
  <div class="bg-neutral border-r-4 border-secondary h-full flex flex-col p-4 shadow-xl">
    <div class="flex items-center">
      <button
        class="btn btn-ghost btn-square ml-2"
        on:click={closeSidebar} 
        aria-label="Cerrar menú"
        aria-controls="sidebar"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
      </button>
    </div>
    <div class="space-y-2 flex-1 flex flex-col">
      <button
        on:click={() => navigateTo('/dashboard')}
        class="btn font-medieval transition-all duration-200 flex items-center gap-3 justify-start px-3 py-2
                btn-ghost text-secondary hover:text-accent"
      >
        <span class="text-2xl">📜</span>
        <span class="ml-2">Volver al Grimorio</span>
      </button>
      {#each [
        { path: `/campaigns/${campaignId}`, label: 'Home', icon: '🏠', active: isCampaignPage },
        { path: `/campaigns/${campaignId}/combat`, label: 'Combate', icon: '⚔️', active: isCombatPage },
        { path: `/campaigns/${campaignId}/characters`, label: 'Personajes', icon: '🧙‍♂️', active: isCharactersPage }
      ] as item, i}
        <button
          bind:this={btnRefs[i]}
          on:click={() => navigateTo(item.path)}
          class={`btn font-medieval transition-all duration-200 flex items-center gap-3 justify-start px-3 py-2
                  ${item.active ? 'btn-dnd' : 'btn-ghost text-secondary hover:text-accent'}`}
          title={item.label}
          aria-current={item.active ? 'page' : undefined}
        >
          <span class="text-xl">{item.icon}</span>
          <span class="ml-2">{item.label}</span>
        </button>
      {/each}
    </div>
  </div>
</div>
