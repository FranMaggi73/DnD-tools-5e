<!-- frontend/src/lib/components/InventoryPanel.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { inventoryApi, type InventoryItem, type InventoryResponse } from '$lib/api/inventory';
  import AddItemModal from './AddItemModal.svelte';

  export let characterId: string;
  export let isOwner: boolean = false;

  const dispatch = createEventDispatcher();

  let inventory: InventoryResponse | null = null;
  let loading = true;
  let error = '';

  let showAddItemModal = false;
  let showCurrencyModal = false;

  // Estado de currency para edición
  let currencyForm = {
    copper: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
  };

  onMount(async () => {
    await loadInventory();
  });

  async function loadInventory() {
    try {
      loading = true;
      inventory = await inventoryApi.getInventory(characterId);
      
      // Actualizar form de currency
      if (inventory) {
        currencyForm = { ...inventory.currency };
      }
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function handleAddItem(event: CustomEvent) {
    try {
      await inventoryApi.createItem(characterId, event.detail);
      await loadInventory();
      showAddItemModal = false;
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleToggleEquipped(item: InventoryItem) {
    if (!isOwner) return;
    
    try {
      await inventoryApi.updateItem(item.id, { equipped: !item.equipped });
      await loadInventory();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleDeleteItem(item: InventoryItem) {
    if (!confirm(`¿Eliminar ${item.name}?`)) return;
    
    try {
      await inventoryApi.deleteItem(item.id);
      await loadInventory();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleUpdateCurrency() {
    try {
      await inventoryApi.updateCurrency(characterId, currencyForm);
      await loadInventory();
      showCurrencyModal = false;
    } catch (err: any) {
      error = err.message;
    }
  }

  function getItemIcon(type: string): string {
    const icons: Record<string, string> = {
      weapon: '⚔️',
      armor: '🛡️',
      shield: '🛡️',
      tool: '🔧',
      consumable: '🧪',
      treasure: '💎',
      other: '📦',
    };
    return icons[type] || '📦';
  }

  function formatWeight(weight: number): string {
    return weight % 1 === 0 ? weight.toString() : weight.toFixed(1);
  }

  function formatValue(value: number): string {
    return value % 1 === 0 ? value.toString() : value.toFixed(2);
  }

  // Agrupar items por tipo
  $: itemsByType = inventory?.items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>) || {};

  $: itemTypes = Object.keys(itemsByType).sort();
</script>

<div class="space-y-4">
  
  {#if error}
    <div class="alert alert-error">
      <span>{error}</span>
      <button class="btn btn-sm" on:click={() => error = ''}>✕</button>
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-secondary"></span>
    </div>
  {:else if !inventory}
    <div class="card-parchment p-8 text-center">
      <p class="text-neutral/70">No se pudo cargar el inventario</p>
    </div>
  {:else}
    
    <!-- Header con stats -->
    <div class="card-parchment p-4">
      <div class="flex flex-wrap justify-between items-center gap-4">
        
        <!-- Currency -->
        <button 
          on:click={() => showCurrencyModal = true}
          class="flex items-center gap-3 hover:bg-primary/10 p-2 rounded-lg transition-colors"
          disabled={!isOwner}
        >
          <div class="text-3xl">💰</div>
          <div class="text-left">
            <p class="text-xs font-medieval text-neutral/60">MONEDAS</p>
            <div class="flex gap-2 text-sm font-bold">
              {#if inventory.currency.platinum > 0}
                <span class="text-primary">{inventory.currency.platinum}pp</span>
              {/if}
              {#if inventory.currency.gold > 0}
                <span class="text-warning">{inventory.currency.gold}gp</span>
              {/if}
              {#if inventory.currency.silver > 0}
                <span class="text-info">{inventory.currency.silver}sp</span>
              {/if}
              {#if inventory.currency.copper > 0}
                <span class="text-error">{inventory.currency.copper}cp</span>
              {/if}
              {#if inventory.currency.platinum === 0 && inventory.currency.gold === 0 && inventory.currency.silver === 0 && inventory.currency.copper === 0}
                <span class="text-neutral/50">0 gp</span>
              {/if}
            </div>
          </div>
        </button>

        <!-- Weight -->
        <div class="flex items-center gap-3">
          <div class="text-3xl">⚖️</div>
          <div>
            <p class="text-xs font-medieval text-neutral/60">PESO</p>
            <p class="text-sm font-bold">
              {formatWeight(inventory.totalWeight)} / {inventory.carryingCapacity} lb
            </p>
            {#if inventory.heavilyEncumbered}
              <span class="badge badge-error badge-xs">Sobrecargado</span>
            {:else if inventory.encumbered}
              <span class="badge badge-warning badge-xs">Cargado</span>
            {/if}
          </div>
        </div>

        <!-- Total Value -->
        <div class="flex items-center gap-3">
          <div class="text-3xl">💎</div>
          <div>
            <p class="text-xs font-medieval text-neutral/60">VALOR TOTAL</p>
            <p class="text-sm font-bold">{formatValue(inventory.totalValue)} gp</p>
          </div>
        </div>

        <!-- Add button -->
        {#if isOwner}
          <button 
            on:click={() => showAddItemModal = true}
            class="btn btn-success gap-2"
          >
            <span class="text-xl">➕</span>
            Agregar Item
          </button>
        {/if}
      </div>
    </div>

    <!-- Items por tipo -->
    {#if inventory.items.length === 0}
      <div class="card-parchment p-12 text-center">
        <div class="text-6xl mb-4">🎒</div>
        <h3 class="text-2xl font-medieval text-neutral mb-2">Inventario Vacío</h3>
        <p class="text-neutral/70 font-body">
          {#if isOwner}
            Agrega tu primer item para comenzar
          {:else}
            Este personaje no tiene items aún
          {/if}
        </p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each itemTypes as type}
          <div class="card-parchment">
            <div class="card-body p-4">
              
              <!-- Header del tipo -->
              <div class="flex items-center gap-2 mb-3">
                <span class="text-2xl">{getItemIcon(type)}</span>
                <h3 class="text-xl font-medieval text-neutral capitalize">
                  {type === 'other' ? 'Otros' : type}
                </h3>
                <span class="badge badge-secondary badge-sm">{itemsByType[type].length}</span>
              </div>

              <!-- Items grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                {#each itemsByType[type] as item}
                  <div 
                    class="bg-gradient-to-br from-primary/5 to-accent/5 p-3 rounded-lg border-2 
                           {item.equipped ? 'border-success bg-success/10' : 'border-primary/20'}
                           transition-all hover:shadow-md"
                  >
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <div class="flex-1 min-w-0">
                        <h4 class="font-medieval font-bold text-neutral truncate">
                          {item.name}
                          {#if item.quantity > 1}
                            <span class="text-sm text-neutral/60">×{item.quantity}</span>
                          {/if}
                        </h4>
                        
                        <div class="flex flex-wrap gap-1 mt-1">
                          {#if item.equipped}
                            <span class="badge badge-success badge-xs">Equipado</span>
                          {/if}
                          {#if item.attuned}
                            <span class="badge badge-warning badge-xs">Sintonizado</span>
                          {/if}
                          {#if item.weight > 0}
                            <span class="badge badge-ghost badge-xs">⚖️ {formatWeight(item.weight * item.quantity)} lb</span>
                          {/if}
                          {#if item.value > 0}
                            <span class="badge badge-ghost badge-xs">💰 {formatValue(item.value * item.quantity)} gp</span>
                          {/if}
                        </div>
                      </div>

                      {#if isOwner}
                        <div class="dropdown dropdown-end flex-shrink-0">
                          <label tabindex="0" class="btn btn-ghost btn-xs btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </label>
                          <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-neutral rounded-box w-48 border-2 border-secondary">
                            <li>
                              <a on:click={() => handleToggleEquipped(item)} class="text-secondary">
                                {item.equipped ? '📦 Desequipar' : '✨ Equipar'}
                              </a>
                            </li>
                            <li>
                              <a on:click={() => handleDeleteItem(item)} class="text-error">
                                🗑️ Eliminar
                              </a>
                            </li>
                          </ul>
                        </div>
                      {/if}
                    </div>

                    {#if item.description}
                      <p class="text-xs text-neutral/70 line-clamp-2">
                        {item.description}
                      </p>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<!-- Modales -->
<AddItemModal
  bind:isOpen={showAddItemModal}
  {characterId}
  on:add={handleAddItem}
  on:close={() => showAddItemModal = false}
/>

<!-- Currency Modal -->
{#if showCurrencyModal && inventory}
  <div class="modal modal-open z-50">
    <div class="card-parchment border-4 border-secondary w-11/12 max-w-md relative">
      <button 
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
        on:click={() => showCurrencyModal = false}
      >✕</button>
      
      <div class="card-body">
        <h3 class="font-bold text-2xl font-medieval text-neutral text-center mb-4">
          💰 Gestionar Monedas
        </h3>

        <div class="space-y-3">
          <!-- Platinum -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Platino (pp)</span>
              <span class="label-text-alt text-neutral/60">10 gp cada una</span>
            </label>
            <input 
              type="number" 
              bind:value={currencyForm.platinum}
              min="0"
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            />
          </div>

          <!-- Gold -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Oro (gp)</span>
            </label>
            <input 
              type="number" 
              bind:value={currencyForm.gold}
              min="0"
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            />
          </div>
          <!-- Silver -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Plata (sp)</span>
              <span class="label-text-alt text-neutral/60">0.1 gp cada una</span>
            </label>
            <input 
              type="number" 
              bind:value={currencyForm.silver}
              min="0"
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            />
          </div>

          <!-- Copper -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Cobre (cp)</span>
              <span class="label-text-alt text-neutral/60">0.01 gp cada una</span>
            </label>
            <input 
              type="number" 
              bind:value={currencyForm.copper}
              min="0"
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            />
          </div>
        </div>

        <div class="modal-action justify-center gap-4">
          <button 
            on:click={() => showCurrencyModal = false}
            class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
          >
            Cancelar
          </button>
          <button 
            on:click={handleUpdateCurrency}
            class="btn btn-dnd"
          >
            <span class="text-xl">💾</span>
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>