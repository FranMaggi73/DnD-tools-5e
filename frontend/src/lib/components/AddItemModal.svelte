<!-- frontend/src/lib/components/AddItemModal.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import debounce from 'lodash/debounce';
  import { open5eInventoryApi, type Open5eItem } from '$lib/api/inventory';

  export let isOpen: boolean = false;
  export let characterId: string = '';

  const dispatch = createEventDispatcher();

  let searchQuery = '';
  let suggestions: Open5eItem[] = [];
  let selectedItem: Open5eItem | null = null;
  let loading = false;
  let noResults = false;

  // Modo manual
  let manualMode = false;
  let manualForm = {
    name: '',
    type: 'other',
    description: '',
    quantity: 1,
    value: 0,
  };

  // Buscar items en Open5e
  const handleSearch = debounce(async () => {
    const query = searchQuery.trim();
    if (!query) {
      suggestions = [];
      noResults = false;
      return;
    }
    
    loading = true;
    noResults = false;
    
    try {
      const result = await open5eInventoryApi.searchItems(query);
      suggestions = result.results || [];
      noResults = suggestions.length === 0;
      
      console.log('🔍 Search results:', suggestions);
    } catch (err) {
      console.error('Error buscando items:', err);
      suggestions = [];
      noResults = true;
    } finally {
      loading = false;
    }
  }, 500);

// dentro de <script lang="ts"> reemplaza la función selectItem existente por esta:
async function selectItem(item: Open5eItem) {
  console.log('📦 Selected item (summary):', item);
  loading = true;
  noResults = false;

  try {
    // Intentar obtener la versión completa del item (algunos endpoints devuelven sólo resumen)
    // `item.source` en searchItems lo seteas como 'weapons'/'armor'/'gear'/'magicitems' etc.
    const category = (item as any).source || 'magicitems';
    let fullItem: Open5eItem | any = item;

    try {
      fullItem = await open5eInventoryApi.getItem(item.slug, category);
      console.log('📥 Fetched full item:', fullItem);
    } catch (err) {
      // si falla, usamos el item del resumen (no queremos bloquear la UX)
      console.warn('Could not fetch full item, using summary:', err);
      fullItem = item;
    }

    selectedItem = fullItem;

    // Convertir a formato de inventario usando el item completo
    const converted = open5eInventoryApi.convertToInventoryItem(fullItem);

    manualForm = {
      name: converted.name || fullItem.name || '',
      type: converted.type || 'other',
      description: open5eInventoryApi.cleanDescription(converted.description || fullItem.desc || '', 500),
      quantity: 1,
      // Aseguramos que sea number (no strings)
      value: typeof converted.value === 'number' ? converted.value : parseFloat(String(converted.value || 0)) || 0,
    };

    suggestions = [];
    searchQuery = '';
    manualMode = true;
  } catch (err) {
    console.error('Error selecting item:', err);
  } finally {
    loading = false;
  }
}


  function handleAddItem() {
    if (!manualForm.name.trim()) return;
    
    const itemData = {
      ...manualForm,
      weaponData: selectedItem && manualForm.type === 'weapon' 
        ? open5eInventoryApi.convertToInventoryItem(selectedItem).weaponData 
        : undefined,
      armorData: selectedItem && (manualForm.type === 'armor' || manualForm.type === 'shield')
        ? open5eInventoryApi.convertToInventoryItem(selectedItem).armorData
        : undefined,
      open5eSlug: selectedItem?.slug,
    };
    
    console.log('💾 Adding item:', itemData);
    dispatch('add', itemData);
    handleClose();
  }

  function handleClose() {
    searchQuery = '';
    suggestions = [];
    selectedItem = null;
    manualMode = false;
    manualForm = {
      name: '',
      type: 'other',
      description: '',
      quantity: 1,
      value: 0,
    };
    noResults = false;
    loading = false;
    dispatch('close');
  }

  function startManualMode() {
    manualMode = true;
    suggestions = [];
    searchQuery = '';
  }

  // Tipos de items
  const itemTypes = [
    { value: 'weapon', label: '⚔️ Arma', icon: '⚔️' },
    { value: 'armor', label: '🛡️ Armadura', icon: '🛡️' },
    { value: 'shield', label: '🛡️ Escudo', icon: '🛡️' },
    { value: 'tool', label: '🔧 Herramienta', icon: '🔧' },
    { value: 'consumable', label: '🧪 Consumible', icon: '🧪' },
    { value: 'treasure', label: '💎 Tesoro', icon: '💎' },
    { value: 'other', label: '📦 Otro', icon: '📦' },
  ];

  function getItemTypeIcon(type: string): string {
    return itemTypes.find(t => t.value === type)?.icon || '📦';
  }

  function getRarityColor(rarity: string): string {
    const colors: Record<string, string> = {
      common: 'badge-ghost',
      uncommon: 'badge-success',
      rare: 'badge-primary',
      'very rare': 'badge-secondary',
      legendary: 'badge-warning',
      artifact: 'badge-error',
    };
    return colors[rarity?.toLowerCase()] || 'badge-ghost';
  }

  // ✨ NUEVO: Formatear información del item para mostrar
  function getItemSummary(item: any): string {
    const parts = [];
    
    // Source badge
    if (item.source === 'weapon') parts.push('⚔️ Arma');
    else if (item.source === 'armor') parts.push('🛡️ Armadura');
    else if (item.source === 'magic') parts.push('✨ Mágico');
    
    // Damage (weapons)
    if (item.damage) {
      parts.push(`${item.damage} ${item.damage_type || ''}`);
    }
    
    // AC (armor)
    if (item.armor_class) {
      if (typeof item.armor_class === 'object') {
        parts.push(`AC ${item.armor_class.base || '?'}`);
      } else if (typeof item.armor_class === 'string') {
        const acMatch = item.armor_class.match(/(\d+)/);
        if (acMatch) parts.push(`AC ${acMatch[1]}`);
      } else if (typeof item.armor_class === 'number') {
        parts.push(`AC ${item.armor_class}`);
      }
    }
    if (item.ac_string) {
      const acMatch = item.ac_string.match(/(\d+)/);
      if (acMatch) parts.push(`AC ${acMatch[1]}`);
    }
    
    return parts.join(' • ');
  }

  // ✨ NUEVO: Formatear costo
  function formatCost(item: any): string {
    if (!item.cost) return '';
    return `💰 ${item.cost}`;
  }
</script>

{#if isOpen}
  <div 
    class="modal modal-open z-50"
    on:click={handleClose}
    on:keydown={(e) => e.key === 'Escape' && handleClose()}
  >
    <div 
      class="card-parchment border-4 border-secondary w-11/12 max-w-4xl max-h-[90vh] relative flex flex-col"
      on:click|stopPropagation
    >
      
      <!-- Header -->
      <div class="p-6 border-b-2 border-secondary flex-shrink-0">
        <button 
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
          on:click={handleClose}
        >✕</button>
        
        <h3 class="font-bold text-3xl font-medieval text-neutral text-center mb-2">
          {#if manualMode}
            ➕ Agregar Item
          {:else}
            🔍 Buscar Item
          {/if}
        </h3>
        <p class="text-center text-neutral/60 text-sm font-body italic">
          {#if manualMode}
            Completa los detalles del item
          {:else}
            Busca en la base de datos oficial de D&D 5e
          {/if}
        </p>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        
        {#if !manualMode}
          <!-- Modo búsqueda -->
          <div class="space-y-4">
            
            <!-- Búsqueda -->
            <div class="form-control">
              <div class="relative">
                <input 
                  type="text" 
                  bind:value={searchQuery}
                  on:input={handleSearch}
                  placeholder="Buscar: plate armor, longsword, rope, health potion..."
                  class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 w-full pr-10"
                  autofocus
                />
                <div class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral/50">
                  🔍
                </div>
              </div>
              <label class="label">
                <span class="label-text-alt text-neutral/60 italic">
                  💡 Busca armas, armaduras y equipo de aventurero
                </span>
              </label>
            </div>

            <!-- Loading -->
            {#if loading}
              <div class="flex justify-center items-center py-8">
                <span class="loading loading-spinner loading-md text-secondary"></span>
                <span class="ml-3 text-neutral/70">Buscando items...</span>
              </div>
            {/if}

            <!-- No results -->
            {#if noResults && !loading}
              <div class="alert bg-warning/20 border-warning/40">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <div>
                  <p class="font-bold">No se encontraron resultados</p>
                  <p class="text-xs">Intenta con otro nombre o agrega el item manualmente</p>
                </div>
              </div>
            {/if}

            <!-- Suggestions -->
            {#if suggestions.length > 0 && !loading}
              <div class="space-y-2">
                <p class="text-xs font-medieval text-neutral/70">
                  📖 {suggestions.length} item{suggestions.length !== 1 ? 's' : ''} encontrado{suggestions.length !== 1 ? 's' : ''}
                </p>
                
                <div class="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                  {#each suggestions as item}
                    <button
                      on:click={() => selectItem(item)}
                      class="btn btn-ghost text-left border border-primary/30 hover:bg-primary/20 
                             flex flex-col items-start w-full p-4 h-auto min-h-[6rem]"
                    >
                      <div class="flex justify-between items-start w-full mb-2">
                        <div class="flex-1">
                          <span class="font-bold text-neutral text-lg block">{item.name}</span>
                          <span class="text-xs text-neutral/70 block mt-1">
                            {getItemSummary(item)}
                          </span>
                        </div>
                        {#if item.rarity}
                          <span class="badge badge-sm {getRarityColor(item.rarity)} ml-2 flex-shrink-0">
                            {item.rarity}
                          </span>
                        {/if}
                      </div>
                      
                      <div class="flex flex-wrap gap-2 mb-2 w-full">
                        {#if formatCost(item)}
                          <span class="badge badge-xs badge-info">{formatCost(item)}</span>
                        {/if}
                        {#if item.category}
                          <span class="badge badge-xs badge-secondary">{item.category}</span>
                        {/if}
                      </div>
                      
                      <p class="text-xs text-neutral/70 line-clamp-2 w-full">
                        {open5eInventoryApi.cleanDescription(item.desc || '', 120)}
                      </p>
                    </button>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Sin búsqueda activa -->
            {#if !searchQuery && !loading && suggestions.length === 0}
              <div class="text-center py-12">
                <div class="text-6xl mb-4">📦</div>
                <p class="text-neutral/70 font-body mb-4">
                  Escribe para buscar items en la base de datos oficial
                </p>
                <div class="flex flex-wrap gap-2 justify-center text-xs text-neutral/50">
                  <span class="bg-neutral/10 px-3 py-1 rounded">plate armor</span>
                  <span class="bg-neutral/10 px-3 py-1 rounded">longsword</span>
                  <span class="bg-neutral/10 px-3 py-1 rounded">health potion</span>
                  <span class="bg-neutral/10 px-3 py-1 rounded">rope</span>
                </div>
              </div>
            {/if}

            <!-- Botón manual -->
            <div class="divider text-neutral/50">O</div>
            <button 
              on:click={startManualMode}
              class="btn btn-outline border-2 border-primary text-primary hover:bg-primary hover:text-white w-full"
            >
              ✏️ Agregar Item Manualmente
            </button>
          </div>

        {:else}
          <!-- Modo manual -->
          <div class="space-y-4">
            
            <!-- Nombre -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medieval text-neutral text-lg">
                  Nombre <span class="text-error">*</span>
                </span>
              </label>
              <input 
                type="text" 
                bind:value={manualForm.name}
                placeholder="Ej: Espada Larga +1"
                class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
              />
            </div>

            <!-- Tipo -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medieval text-neutral text-lg">Tipo</span>
              </label>
              <select 
                bind:value={manualForm.type}
                class="select select-bordered bg-[#2d241c] text-base-content border-primary/50"
              >
                {#each itemTypes as type}
                  <option value={type.value}>{type.label}</option>
                {/each}
              </select>
            </div>

            <!-- Grid de cantidad, peso, valor -->
            <div class="grid grid-cols-3 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medieval text-neutral">Cantidad</span>
                </label>
                <input 
                  type="number" 
                  bind:value={manualForm.quantity}
                  min="1"
                  class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
                />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medieval text-neutral">Valor (GP)</span>
                </label>
                <input 
                  type="number" 
                  bind:value={manualForm.value}
                  min="0"
                  step="0.01"
                  class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
                />
              </div>
            </div>

            <!-- Descripción -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medieval text-neutral text-lg">Descripción</span>
              </label>
              <textarea 
                bind:value={manualForm.description}
                placeholder="Descripción del item..."
                class="textarea textarea-bordered bg-[#2d241c] text-base-content border-primary/50 h-24"
              ></textarea>
            </div>

            {#if selectedItem}
              <div class="alert bg-success/20 border-success/40">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">✨ Item basado en <strong>{selectedItem.name}</strong> de Open5e</span>
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex justify-center gap-4 p-6 border-t-2 border-secondary flex-shrink-0">
        <button 
          on:click={handleClose}
          class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
        >
          Cancelar
        </button>
        
        {#if manualMode}
          <button 
            on:click={handleAddItem}
            class="btn btn-dnd"
            disabled={!manualForm.name.trim()}
          >
            <span class="text-xl">➕</span>
            Agregar al Inventario
          </button>
        {/if}
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