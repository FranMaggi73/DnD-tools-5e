<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { inventoryApi, type InventoryItem, type InventoryResponse } from '$lib/api/inventory';
  import AddItemModal from './AddItemModal.svelte';
  import ItemDetailModal from './ItemDetailModal.svelte';
  import EditItemModal from './EditItemModal.svelte';
  import { validateCurrency } from '$lib/utils/validation';
  
  // ===== NUEVO: Importar Firestore =====
  import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    onSnapshot,
    doc
  } from 'firebase/firestore';
  import { app } from '$lib/firebase';

  export let characterId: string;
  export let isOwner: boolean = false;

  let inventory: InventoryResponse | null = null;
  let loading = true;
  let error = '';
  let processingItem: string | null = null;
  let searchLocalQuery = '';

  let showAddItemModal = false;
  let showCurrencyModal = false;
  let showDetailModal = false;
  let showEditModal = false;
  let selectedItem: InventoryItem | null = null;

  let currencyForm = {
    copper: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
  };

  let currencyErrors = {
    copper: '',
    silver: '',
    gold: '',
    platinum: ''
  };

  let currencyTouched = {
    copper: false,
    silver: false,
    gold: false,
    platinum: false
  };

  // ===== NUEVO: Listeners =====
  let itemsUnsubscribe: (() => void) | null = null;
  let currencyUnsubscribe: (() => void) | null = null;
  const db = getFirestore(app);

  // Paginación
  const ITEMS_PER_PAGE = 20;
  let currentPage: Record<string, number> = (() => {
    if (typeof window === 'undefined') return {};
    const saved = sessionStorage.getItem(`inventory-pages-${characterId}`);
    return saved ? JSON.parse(saved) : {};
  })();

  $: if (typeof window !== 'undefined') {
    sessionStorage.setItem(`inventory-pages-${characterId}`, JSON.stringify(currentPage));
  }

  // Calculadora de conversión
  let showConverter = false;
  let converterAmount = 0;
  let converterFrom: 'cp' | 'sp' | 'gp' | 'pp' = 'gp';

  // Validación reactiva de currency
  $: if (currencyTouched.copper) {
    const result = validateCurrency(currencyForm.copper);
    currencyErrors.copper = result.valid ? '' : result.error || '';
  }
  $: if (currencyTouched.silver) {
    const result = validateCurrency(currencyForm.silver);
    currencyErrors.silver = result.valid ? '' : result.error || '';
  }
  $: if (currencyTouched.gold) {
    const result = validateCurrency(currencyForm.gold);
    currencyErrors.gold = result.valid ? '' : result.error || '';
  }
  $: if (currencyTouched.platinum) {
    const result = validateCurrency(currencyForm.platinum);
    currencyErrors.platinum = result.valid ? '' : result.error || '';
  }

  $: isCurrencyValid = !currencyErrors.copper && !currencyErrors.silver && 
                       !currencyErrors.gold && !currencyErrors.platinum;

  $: convertedValues = calculateConversion(converterAmount, converterFrom);

  onMount(async () => {
    setupRealtimeListeners();
  });

  onDestroy(() => {
    if (itemsUnsubscribe) itemsUnsubscribe();
    if (currencyUnsubscribe) currencyUnsubscribe();
  });

  function setupRealtimeListeners() {
    try {
      loading = true;

      // ===== LISTENER: Items =====
      const itemsRef = collection(db, 'inventory_items');
      const itemsQuery = query(
        itemsRef,
        where('characterId', '==', characterId)
      );

      itemsUnsubscribe = onSnapshot(
        itemsQuery,
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          })) as InventoryItem[];

          // Calcular valor total
          const totalValue = items.reduce((sum, item) => 
            sum + (item.value * item.quantity), 0
          );

          // Actualizar inventory
          if (!inventory) {
            inventory = {
              items,
              currency: { copper: 0, silver: 0, gold: 0, platinum: 0 },
              totalValue
            };
          } else {
            inventory.items = items;
            inventory.totalValue = totalValue + (
              (inventory.currency.copper * 0.01) +
              (inventory.currency.silver * 0.1) +
              inventory.currency.gold +
              (inventory.currency.platinum * 10)
            );
          }

          loading = false;
        },
        (err) => {
          console.error('Error en listener de items:', err);
          error = err.message;
          loading = false;
        }
      );

      // ===== LISTENER: Currency =====
      const currencyRef = doc(db, 'currencies', characterId);

      currencyUnsubscribe = onSnapshot(
        currencyRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const currency = snapshot.data() as typeof currencyForm;
            
            if (!inventory) {
              inventory = {
                items: [],
                currency,
                totalValue: (currency.copper * 0.01) +
                            (currency.silver * 0.1) +
                            currency.gold +
                            (currency.platinum * 10)
              };
            } else {
              inventory.currency = currency;
              inventory.totalValue = inventory.items.reduce((sum, item) => 
                sum + (item.value * item.quantity), 0
              ) + (
                (currency.copper * 0.01) +
                (currency.silver * 0.1) +
                currency.gold +
                (currency.platinum * 10)
              );
            }

            currencyForm = { ...currency };
          }
        },
        (err) => {
          console.error('Error en listener de currency:', err);
        }
      );

    } catch (err: any) {
      error = err.message;
      loading = false;
    }
  }

  async function handleAddItem(event: CustomEvent) {
    try {
      error = '';
      await inventoryApi.createItem(characterId, event.detail);
      showAddItemModal = false;
      // ✅ El listener actualizará automáticamente
    } catch (err: any) {
      error = err.message || 'Error agregando item';
      console.error('Error adding item:', err);
    }
  }

  async function handleUpdateItem(event: CustomEvent) {
    if (!selectedItem) return;
    
    try {
      error = '';
      processingItem = selectedItem.id;
      
      const updates = event.detail;
      await inventoryApi.updateItem(selectedItem.id, updates);
      // ✅ El listener actualizará automáticamente
      
      showEditModal = false;
      selectedItem = null;
    } catch (err: any) {
      error = err.message || 'Error actualizando item';
      console.error('Error updating item:', err);
    } finally {
      processingItem = null;
    }
  }

  async function handleDeleteItem(item: InventoryItem) {
    if (!confirm(`¿Eliminar ${item.name}${item.quantity > 1 ? ` (×${item.quantity})` : ''}?`)) return;
    
    try {
      processingItem = item.id;
      error = '';
      await inventoryApi.deleteItem(item.id);
      // ✅ El listener actualizará automáticamente
    } catch (err: any) {
      error = err.message || 'Error eliminando item';
      console.error('Error deleting item:', err);
    } finally {
      processingItem = null;
    }
  }

  async function handleUpdateCurrency() {
    Object.keys(currencyTouched).forEach(key => {
      currencyTouched[key as keyof typeof currencyTouched] = true;
    });

    if (!isCurrencyValid) return;

    try {
      error = '';
      await inventoryApi.updateCurrency(characterId, currencyForm);
      showCurrencyModal = false;
      resetCurrencyValidation();
      // ✅ El listener actualizará automáticamente
    } catch (err: any) {
      error = err.message || 'Error actualizando monedas';
      console.error('Error updating currency:', err);
    }
  }

  function resetCurrencyValidation() {
    Object.keys(currencyTouched).forEach(key => {
      currencyTouched[key as keyof typeof currencyTouched] = false;
    });
    Object.keys(currencyErrors).forEach(key => {
      currencyErrors[key as keyof typeof currencyErrors] = '';
    });
  }

  function openDetailModal(item: InventoryItem) {
    selectedItem = item;
    showDetailModal = true;
  }

  function openEditModal(item: InventoryItem) {
    selectedItem = item;
    showEditModal = true;
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

  function formatValue(value: number): string {
    return value % 1 === 0 ? value.toString() : value.toFixed(2);
  }

  function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      weapon: 'Armas',
      armor: 'Armaduras',
      shield: 'Escudos',
      tool: 'Herramientas',
      consumable: 'Consumibles',
      treasure: 'Tesoros',
      other: 'Otros',
    };
    return labels[type] || 'Items';
  }

  function getRarityColor(rarity?: string): string {
    if (!rarity) return 'badge-ghost';
    const colors: Record<string, string> = {
      common: 'badge-ghost',
      uncommon: 'badge-success',
      rare: 'badge-primary',
      'very rare': 'badge-secondary',
      legendary: 'badge-warning',
      artifact: 'badge-error',
    };
    return colors[rarity.toLowerCase()] || 'badge-ghost';
  }

  function formatRarity(rarity?: string): string {
    if (!rarity) return 'Común';
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  }

  $: itemsByType = inventory?.items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>) || {};

  $: itemsByTypeFiltered = (() => {
    if (!searchLocalQuery.trim()) return itemsByType;
    
    const search = searchLocalQuery.toLowerCase();
    const filtered: Record<string, InventoryItem[]> = {};
    
    Object.keys(itemsByType).forEach(type => {
      const items = itemsByType[type].filter(item => 
        item.name.toLowerCase().includes(search) ||
        (item.description && item.description.toLowerCase().includes(search)) ||
        (item.weaponData?.weaponType.toLowerCase().includes(search)) ||
        (item.armorData?.armorType.toLowerCase().includes(search)) ||
        (item.rarity && item.rarity.toLowerCase().includes(search))
      );
      
      if (items.length > 0) {
        filtered[type] = items;
      }
    });
    
    return filtered;
  })();

  $: itemTypes = Object.keys(itemsByTypeFiltered).sort();
  $: totalItems = inventory?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  function getPaginatedItems(type: string): InventoryItem[] {
    const items = itemsByTypeFiltered[type] || [];
    const page = currentPage[type] || 0;
    const start = page * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return items.slice(start, end);
  }

  function getTotalPages(type: string): number {
    const items = itemsByTypeFiltered[type] || [];
    return Math.ceil(items.length / ITEMS_PER_PAGE);
  }

  function changePage(type: string, direction: number) {
    const totalPages = getTotalPages(type);
    const currentPageNum = currentPage[type] || 0;
    const newPage = currentPageNum + direction;
    
    if (newPage >= 0 && newPage < totalPages) {
      currentPage = { ...currentPage, [type]: newPage };
    }
  }

  $: if (searchLocalQuery) {
    Object.keys(currentPage).forEach(type => {
      currentPage[type] = 0;
    });
  }

  function calculateConversion(amount: number, from: 'cp' | 'sp' | 'gp' | 'pp') {
    if (!amount || amount <= 0) {
      return { cp: 0, sp: 0, gp: 0, pp: 0 };
    }

    let copper = 0;
    switch (from) {
      case 'cp': copper = amount; break;
      case 'sp': copper = amount * 10; break;
      case 'gp': copper = amount * 100; break;
      case 'pp': copper = amount * 1000; break;
    }

    return {
      cp: copper,
      sp: copper / 10,
      gp: copper / 100,
      pp: copper / 1000
    };
  }

  function handleCurrencyBlur(field: keyof typeof currencyTouched) {
    currencyTouched[field] = true;
  }
</script>

<div class="space-y-4">
  
  {#if error}
    <div class="alert alert-error">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
      <span>{error}</span>
      <button class="btn btn-sm btn-ghost" on:click={() => error = ''}>✕</button>
    </div>
  {/if}

  {#if loading}
    <div class="space-y-4">
      <div class="skeleton h-32 w-full"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        {#each Array(4) as _}
          <div class="skeleton h-24 w-full"></div>
        {/each}
      </div>
    </div>
  {:else if !inventory}
    <div class="card-parchment p-8 text-center">
      <div class="text-4xl mb-4">⚠️</div>
      <h3 class="text-xl font-medieval text-neutral mb-2">Error al Cargar</h3>
      <p class="text-neutral/70 mb-4">No se pudo cargar el inventario</p>
      <button
        class="btn btn-primary btn-sm"
        on:click={() => { error = ''; loading = true; setupRealtimeListeners(); }}
      >
        🔄 Reintentar
      </button>
    </div>
  {:else}
    {#if inventory.items.length > 0}
      <div class="mb-4">
        <div class="form-control">
          <div class="relative">
            <input 
              type="text" 
              bind:value={searchLocalQuery}
              placeholder="🔍 Buscar en tu inventario..."
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 w-full pr-10"
            />
            {#if searchLocalQuery}
              <button 
                class="btn btn-ghost btn-sm btn-circle absolute right-2 top-1/2 -translate-y-1/2"
                on:click={() => searchLocalQuery = ''}
              >
                ✕
              </button>
            {/if}
          </div>
          {#if searchLocalQuery}
            <label class="label">
              <span class="label-text-alt text-success">
                ✓ {inventory.items.filter(item => 
                  item.name.toLowerCase().includes(searchLocalQuery.toLowerCase()) ||
                  (item.description && item.description.toLowerCase().includes(searchLocalQuery.toLowerCase()))
                ).length} items encontrados
              </span>
            </label>
          {/if}
        </div>
      </div>
    {/if}
        
    <!-- Header con stats -->
    <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-2 border-primary/30">
      <div class="flex flex-wrap justify-between items-center gap-4">
        
        <button 
          on:click={() => showCurrencyModal = true}
          class="flex items-center gap-3 hover:bg-primary/10 p-2 rounded-lg transition-colors flex-1 min-w-[200px]"
          disabled={!isOwner}
        >
          <div class="text-3xl">💰</div>
          <div class="text-left">
            <p class="text-xs font-medieval text-neutral/60">MONEDAS</p>
            <div class="flex gap-2 text-sm font-bold flex-wrap">
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

        <div class="flex items-center gap-3 flex-1 min-w-[150px]">
          <div class="text-3xl">📦</div>
          <div>
            <p class="text-xs font-medieval text-neutral/60">ITEMS</p>
            <p class="text-sm font-bold">{totalItems} items</p>
            <p class="text-xs text-neutral/60">{inventory.items.length} tipos</p>
          </div>
        </div>

        <div class="flex items-center gap-3 flex-1 min-w-[150px]">
          <div class="text-3xl">💎</div>
          <div>
            <p class="text-xs font-medieval text-neutral/60">VALOR</p>
            <p class="text-sm font-bold">{formatValue(inventory.totalValue)} gp</p>
          </div>
        </div>

        {#if isOwner}
          <button 
            on:click={() => showAddItemModal = true}
            class="btn btn-success gap-2"
          >
            <span class="text-xl">➕</span>
            <span class="hidden sm:inline">Agregar</span>
          </button>
        {/if}
      </div>
    </div>

    <!-- Items por tipo -->
    {#if inventory.items.length === 0}
      <div class="card-parchment p-12 text-center">
        <div class="text-6xl mb-4">🎒</div>
        <h3 class="text-2xl font-medieval text-neutral mb-2">Inventario Vacío</h3>
        <p class="text-neutral/70 font-body mb-4">
          {#if isOwner}
            Agrega tu primer item para comenzar
          {:else}
            Este personaje no tiene items aún
          {/if}
        </p>
        {#if isOwner}
          <button 
            on:click={() => showAddItemModal = true}
            class="btn btn-primary"
          >
            <span class="text-xl">➕</span>
            Agregar Primer Item
          </button>
        {/if}
      </div>
    {:else}
      <div class="space-y-4">
        {#each itemTypes as type}
          {@const items = itemsByType[type]}
          {@const paginatedItems = getPaginatedItems(type)}
          {@const totalPages = getTotalPages(type)}
          {@const currentPageNum = currentPage[type] || 0}
          
          <div class="card-parchment">
            <div class="card-body p-4">
              
              <!-- Header del tipo -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2 flex-1">
                  <span class="text-2xl">{getItemIcon(type)}</span>
                  <h3 class="text-xl font-medieval text-neutral">
                    {getTypeLabel(type)}
                  </h3>
                  <span class="badge badge-secondary badge-sm">{items.length}</span>
                  <span class="badge badge-ghost badge-sm">
                    {items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </span>
                </div>

                {#if totalPages > 1}
                  <div class="flex items-center gap-2">
                    <button 
                      class="btn btn-xs btn-circle btn-ghost"
                      on:click={() => changePage(type, -1)}
                      disabled={currentPageNum === 0}
                    >
                      ◀
                    </button>
                    <span class="text-xs">
                      {currentPageNum + 1} / {totalPages}
                    </span>
                    <button 
                      class="btn btn-xs btn-circle btn-ghost"
                      on:click={() => changePage(type, 1)}
                      disabled={currentPageNum >= totalPages - 1}
                    >
                      ▶
                    </button>
                  </div>
                {/if}
              </div>

              <!-- Grid de items -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                {#each paginatedItems as item}
                  <div 
                    class="bg-gradient-to-br from-primary/5 to-accent/5 p-3 rounded-lg border-2 
                           {processingItem === item.id ? 'opacity-50' : ''}
                           transition-all hover:shadow-md cursor-pointer"
                    on:click={() => openDetailModal(item)}
                  >
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <div class="flex-1 min-w-0">
                        <h4 class="font-medieval font-bold text-neutral truncate flex items-center gap-2">
                          {item.name}
                          {#if item.quantity > 1}
                            <span class="badge badge-sm badge-neutral">×{item.quantity}</span>
                          {/if}
                        </h4>
                        
                        <div class="flex flex-wrap gap-1 mt-1">
                          {#if item.value > 0}
                            <span class="badge badge-ghost badge-xs">💰 {formatValue(item.value * item.quantity)} gp</span>
                          {/if}
                          
                          <!-- ✅ NUEVO: Badge de rareza -->
                          {#if item.rarity}
                            <span class="badge badge-xs {getRarityColor(item.rarity)}">
                              {formatRarity(item.rarity)}
                            </span>
                          {/if}
                          
                          {#if item.weaponData}
                            <span class="badge badge-error badge-xs">
                              ⚔️ {item.weaponData.damageDice}{#if item.weaponData.properties.versatile}/{item.weaponData.properties.versatile}{/if}
                              {#if item.weaponData.damageType}
                                {item.weaponData.damageType}
                              {/if}
                              {#if item.weaponData.magicBonus && item.weaponData.magicBonus > 0}
                                +{item.weaponData.magicBonus}
                              {/if}
                            </span>
                          {/if}
                          
                          {#if item.armorData}
                            <span class="badge badge-info badge-xs">
                              {#if item.armorData.armorType === 'Shield'}
                                +{item.armorData.baseAC || 2}{item.armorData.magicBonus ? `+${item.armorData.magicBonus}` : ''} AC
                              {:else}
                                AC {item.armorData.baseAC}{item.armorData.magicBonus ? `+${item.armorData.magicBonus}` : ''}
                              {/if}
                            </span>
                          {/if}
                        </div>
                      </div>

                      {#if isOwner}
                        <div class="dropdown dropdown-end flex-shrink-0" on:click|stopPropagation>
                          {#if processingItem === item.id}
                            <button class="btn btn-ghost btn-xs btn-circle" disabled>
                              <span class="loading loading-spinner loading-xs"></span>
                            </button>
                          {:else}
                            <label tabindex="0" class="btn btn-ghost btn-xs btn-circle">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </label>
                            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-neutral rounded-box w-48 border-2 border-secondary text-xs">
                              <li>
                                <a on:click|stopPropagation={() => openEditModal(item)} class="text-secondary">
                                  ✏️ Modificar
                                </a>
                              </li>
                              <li>
                                <a on:click|stopPropagation={() => handleDeleteItem(item)} class="text-error">
                                  🗑️ Eliminar
                                </a>
                              </li>
                            </ul>
                          {/if}
                        </div>
                      {/if}
                    </div>

                    {#if item.description}
                      <p class="text-xs text-neutral/70 line-clamp-2 mt-1">
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

<ItemDetailModal
  bind:isOpen={showDetailModal}
  item={selectedItem}
  on:close={() => { showDetailModal = false; selectedItem = null; }}
/>

<EditItemModal
  bind:isOpen={showEditModal}
  item={selectedItem}
  {isOwner}
  on:update={handleUpdateItem}
  on:close={() => { showEditModal = false; selectedItem = null; }}
/>

<!-- Currency Modal (sin cambios mayores) -->
{#if showCurrencyModal && inventory}
  <div class="modal modal-open z-50" on:click={() => { showCurrencyModal = false; resetCurrencyValidation(); }}>
    <div class="card-parchment border-4 border-secondary w-11/12 max-w-2xl relative" on:click|stopPropagation>
      <button 
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
        on:click={() => { showCurrencyModal = false; resetCurrencyValidation(); }}
      >✕</button>
      
      <div class="card-body">
        <h3 class="font-bold text-2xl font-medieval text-neutral text-center mb-4">
          💰 Gestionar Monedas
        </h3>

        <div class="mb-4">
          <button 
            class="btn btn-sm btn-outline w-full"
            on:click={() => showConverter = !showConverter}
          >
            🔄 {showConverter ? 'Ocultar' : 'Mostrar'} Calculadora de Conversión
          </button>
        </div>

        {#if showConverter}
          <div class="bg-info/10 p-4 rounded-lg border border-info/30 mb-4">
            <p class="font-medieval text-sm mb-2">Calculadora de Monedas</p>
            <div class="grid grid-cols-2 gap-2">
              <input 
                type="number" 
                bind:value={converterAmount}
                placeholder="Cantidad"
                class="input input-sm input-bordered bg-[#2d241c]"
              />
              <select 
                bind:value={converterFrom}
                class="select select-sm select-bordered bg-[#2d241c]"
              >
                <option value="cp">Cobre (cp)</option>
                <option value="sp">Plata (sp)</option>
                <option value="gp">Oro (gp)</option>
                <option value="pp">Platino (pp)</option>
              </select>
            </div>
            {#if converterAmount > 0}
              <div class="mt-3 text-xs space-y-1">
                <p><strong>{converterAmount} {converterFrom}</strong> equivale a:</p>
                <p>🥉 {formatValue(convertedValues.cp)} cp</p>
                <p>🥈 {formatValue(convertedValues.sp)} sp</p>
                <p>🥇 {formatValue(convertedValues.gp)} gp</p>
                <p>💎 {formatValue(convertedValues.pp)} pp</p>
              </div>
            {/if}
          </div>
        {/if}

        <div class="space-y-3">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Platino (pp)</span>
              <span class="label-text-alt text-neutral/60">10 gp c/u</span>
            </label>
            <input 
              type="number" 
              bind:value={currencyForm.platinum}
              on:blur={() => handleCurrencyBlur('platinum')}
              min="0"
              class="input input-bordered bg-[#2d241c] text-base-content 
                     {currencyErrors.platinum && currencyTouched.platinum ? 'border-error border-2' : 'border-primary/50'}"
            />
            {#if currencyErrors.platinum && currencyTouched.platinum}
              <label class="label">
                <span class="label-text-alt text-error text-xs">⚠️ {currencyErrors.platinum}</span>
              </label>
            {/if}
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Oro (gp)</span>
            </label>
            <input 
              type="number" 
              bind:value={currencyForm.gold}
              on:blur={() => handleCurrencyBlur('gold')}
              min="0"
              class="input input-bordered bg-[#2d241c] text-base-content 
                     {currencyErrors.gold && currencyTouched.gold ? 'border-error border-2' : 'border-primary/50'}"
            />
            {#if currencyErrors.gold && currencyTouched.gold}
              <label class="label">
                <span class="label-text-alt text-error text-xs">⚠️ {currencyErrors.gold}</span>
              </label>
            {/if}
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Plata (sp)</span>
              <span class="label-text-alt text-neutral/60">0.1 gp c/u</span>
            </label>
            <input 
              type="number" 
              bind:value={currencyForm.silver}
              on:blur={() => handleCurrencyBlur('silver')}
              min="0"
              class="input input-bordered bg-[#2d241c] text-base-content 
                     {currencyErrors.silver && currencyTouched.silver ? 'border-error border-2' : 'border-primary/50'}"
            />
            {#if currencyErrors.silver && currencyTouched.silver}
              <label class="label">
                <span class="label-text-alt text-error text-xs">⚠️ {currencyErrors.silver}</span>
              </label>
            {/if}
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Cobre (cp)</span>
              <span class="label-text-alt text-neutral/60">0.01 gp c/u</span>
            </label>
            <input 
              type="number" 
              bind:value={currencyForm.copper}
              on:blur={() => handleCurrencyBlur('copper')}
              min="0"
              class="input input-bordered bg-[#2d241c] text-base-content 
                     {currencyErrors.copper && currencyTouched.copper ? 'border-error border-2' : 'border-primary/50'}"
            />
            {#if currencyErrors.copper && currencyTouched.copper}
              <label class="label">
                <span class="label-text-alt text-error text-xs">⚠️ {currencyErrors.copper}</span>
              </label>
            {/if}
          </div>
        </div>

        <div class="bg-success/10 p-3 rounded-lg border border-success/30 mt-3">
          <p class="text-xs font-medieval mb-1">Valor Total en Oro (gp):</p>
          <p class="text-lg font-bold text-success">
            {formatValue(
              (currencyForm.platinum * 10) + 
              currencyForm.gold + 
              (currencyForm.silver * 0.1) + 
              (currencyForm.copper * 0.01)
            )} gp
          </p>
        </div>

        <div class="card-actions justify-end mt-4">
          <button 
            class="btn btn-ghost" 
            on:click={() => { showCurrencyModal = false; resetCurrencyValidation(); }}
          >
            Cancelar
          </button>
          <button 
            class="btn btn-primary"
            on:click={handleUpdateCurrency}
            disabled={!isCurrencyValid}
          >
            💰 Actualizar Monedas
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}