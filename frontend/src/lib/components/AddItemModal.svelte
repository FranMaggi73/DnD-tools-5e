<!-- frontend/src/lib/components/AddItemModal.svelte -->
<script lang="ts">
  import { createEventDispatcher, onDestroy, tick } from 'svelte';
  import {catalogApi,type CatalogManifest} from '$lib/api/catalog';
  import {libraryFilters,type LibraryFilters,type LibrarySearch} from '$lib/rules/library';
  import LibrarySubfilters from './LibrarySubfilters.svelte';
  import debounce from 'lodash/debounce';
  import { open5eInventoryApi, type Open5eItem, type WeaponData, type ArmorData } from '$lib/api/inventory';
  import { validateCompleteItem, type CreateItemData } from '$lib/utils/validation';
  import WeaponFields from './WeaponFields.svelte';
  import ArmorFields from './ArmorFields.svelte';
  import { armorFormFromData, armorDataFromForm, validateArmorForm } from '$lib/utils/armorForm';
  import { weaponFormFromData, weaponDataFromForm, validateWeaponForm } from '$lib/utils/weaponForm';

  export let isOpen: boolean = false;
  export let characterId: string = '';
  export let busy = false;
  export let error = '';

  const dispatch = createEventDispatcher();

  let searchQuery = '';
  let suggestions: Open5eItem[] = [];
  let selectedItem: Open5eItem | null = null;
  let loading = false;
  let noResults = false;
  let selectedTypeFilter: string = 'all';

  let filters:LibraryFilters={};
  let edition='all';let scope='all';let source='';
  let manifest:CatalogManifest|null=null;let loadingManifest=false;
  let resultsElement:HTMLDivElement|undefined;
  let contentElement:HTMLDivElement|undefined;
  let searchGeneration=0;let searchError='';let searched=false;let lastSignature='';
  $: searchSignature=JSON.stringify([searchQuery.trim(),selectedTypeFilter,filters,edition,scope,source]);
  $: if(searchSignature!==lastSignature){lastSignature=searchSignature;invalidateSearch();}
  $: if(isOpen&&!manifest&&!loadingManifest)loadManifest();
  async function loadManifest(){loadingManifest=true;try{manifest=await catalogApi.manifest();}catch{searchError='No se pudieron cargar las publicaciones. Podés reintentar con Buscar.';}}

  // Modo manual
  let manualMode = false;
  let weaponForm = weaponFormFromData();
  let originalWeapon: WeaponData | undefined;
  let originalArmor: ArmorData | undefined;
  let armorForm = armorFormFromData();
  let lastArmorType = '';
  let manualForm = {
    name: '',
    type: 'other',
    description: '',
    quantity: 1,
    value: 0,
  };
  $: if (['armor','shield'].includes(manualForm.type) && manualForm.type !== lastArmorType) {
    armorForm = armorFormFromData(originalArmor, manualForm.type);
    lastArmorType = manualForm.type;
  }

  // ✅ NUEVO: Estados de validación
  let validationError = '';
  let touched = false;

  function criteria():Omit<LibrarySearch,'kind'> {
    return {query:searchQuery.trim(),type:selectedTypeFilter==='all'?'':selectedTypeFilter,edition,scope,source,filters:libraryFilters(filters)};
  }
  function invalidateSearch(){searchGeneration++;loading=false;suggestions=[];noResults=false;searched=false;searchError='';}
  const handleSearch=debounce(()=>{if(searchQuery.trim())runSearch();},150);
  onDestroy(()=>{searchGeneration++;handleSearch.cancel();});
  async function runSearch(showResults=false){
    handleSearch.cancel();const generation=++searchGeneration;const requested=criteria();
    loading=true;noResults=false;searchError='';searched=true;
    try {
      const result=await catalogApi.searchInventoryItems(requested);
      if(generation!==searchGeneration||JSON.stringify(requested)!==JSON.stringify(criteria())||!isOpen||manualMode)return;
      suggestions=result.results;noResults=suggestions.length===0;
      if(!manifest)manifest=await catalogApi.manifest();
      if(showResults){await tick();if(generation===searchGeneration)resultsElement?.scrollIntoView({block:'start'});}
    }catch(cause){if(generation===searchGeneration){suggestions=[];searchError=cause instanceof Error?cause.message:'No se pudo buscar. Volvé a intentar.';}}
    finally {if(generation===searchGeneration)loading=false;}
  }

  // ✅ MEJORADO: Selección de item con mejor manejo de errores
  async function selectItem(item: Open5eItem) {
    handleSearch.cancel();const generation=++searchGeneration;
    loading = true;
    noResults = false;

    try {
      const category = (item as any).source || 'magicitems';
      let fullItem: Open5eItem | any = item;

      // ✅ CORREGIDO: Solo fetch si source está definido
      if ((item as any).source) {
        fullItem = await open5eInventoryApi.getItem(item.slug, category);
      }
      if(generation!==searchGeneration||!isOpen||manualMode)return;

      fullItem = { ...fullItem, source: category };
      selectedItem = fullItem;

      // Convertir a formato de inventario
      const converted = open5eInventoryApi.convertToInventoryItem(fullItem);
      originalWeapon = converted.weaponData;
      weaponForm = weaponFormFromData(originalWeapon);
      originalArmor = converted.armorData;
      armorForm = armorFormFromData(originalArmor, converted.type);
      lastArmorType = converted.type || '';

      manualForm = {
        name: converted.name || fullItem.name || '',
        type: converted.type || 'other',
        description: open5eInventoryApi.cleanDescription(converted.description || fullItem.desc || '', 500),
        quantity: 1,
        value: typeof converted.value === 'number' ? converted.value : parseFloat(String(converted.value || 0)) || 0,
      };

      suggestions = [];
      searchQuery = '';
      manualMode = true;
      await tick();contentElement?.scrollTo({top:0});
    } catch (err) {
      if(generation!==searchGeneration)return;
      console.error('Error selecting item:', err);
      validationError = 'Error al cargar el item. Por favor intenta de nuevo.';
    } finally {
      if(generation===searchGeneration)loading = false;
    }
  }

  // ✅ NUEVO: Validación reactiva
  $: if (touched && manualMode) {
    const itemData: CreateItemData = {
      name: manualForm.name,
      type: manualForm.type,
      description: manualForm.description,
      quantity: manualForm.quantity,
      value: manualForm.value,
    };
    
    const result = validateCompleteItem(itemData);
    validationError = result.valid ? (manualForm.type === 'weapon' ? validateWeaponForm(weaponForm) : ['armor','shield'].includes(manualForm.type) ? validateArmorForm(armorForm) : '') : result.error || '';
  }

  function handleAddItem() {
    if (busy) return;
    touched = true;
    
    if (!manualForm.name.trim()) {
      validationError = 'El nombre no puede estar vacío';
      return;
    }
    
    const itemData: CreateItemData = {
      name: manualForm.name,
      type: manualForm.type,
      description: manualForm.description,
      quantity: manualForm.quantity,
      value: manualForm.value,
    };
    
    const validation = validateCompleteItem(itemData);
    if (!validation.valid) {
      validationError = validation.error || '';
      return;
    }
    if (manualForm.type === 'weapon' && validateWeaponForm(weaponForm)) {
      validationError = validateWeaponForm(weaponForm);
      return;
    }
    if (manualForm.quantity < 1 || manualForm.quantity > 999) { validationError = 'La cantidad debe estar entre 1 y 999.'; return; }
    if (['armor','shield'].includes(manualForm.type) && validateArmorForm(armorForm)) { validationError = validateArmorForm(armorForm); return; }
    
    const fullItemData = {
      ...itemData,
      weaponData: manualForm.type === 'weapon'
        ? weaponDataFromForm(weaponForm, originalWeapon)
        : undefined,
      armorData: manualForm.type === 'armor' || manualForm.type === 'shield'
        ? armorDataFromForm(armorForm, originalArmor, manualForm.type)
        : undefined,
      open5eSlug: selectedItem?.slug,
      rarity: selectedItem?.rarity,
      ...(!['weapon','armor','shield'].includes(manualForm.type) && selectedItem ? {
        isMagical: open5eInventoryApi.convertToInventoryItem(selectedItem).isMagical || false,
        requiresAttunement: open5eInventoryApi.convertToInventoryItem(selectedItem).requiresAttunement || false
      } : {}),
    };
    
    dispatch('add', fullItemData);
  }

  function resetForm() {
    searchGeneration++;handleSearch.cancel();
    filters={};edition='all';scope='all';source='';selectedTypeFilter='all';searchError='';searched=false;
    
    searchQuery = '';
    suggestions = [];
    selectedItem = null;
    originalWeapon = undefined; originalArmor = undefined;
    weaponForm = weaponFormFromData(); armorForm = armorFormFromData(); lastArmorType = '';
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
    validationError = '';
    touched = false;
  }
  function handleClose() {
    if (busy) return;
    resetForm();
    dispatch('close');
  }
  $: if (!isOpen) resetForm();

  function startManualMode() {
    searchGeneration++;handleSearch.cancel();loading=false;
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
  // ✅ Formatear costo
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
      class="card-parchment border-2 sm:border-4 border-secondary w-full sm:w-11/12 max-w-4xl max-h-[92dvh] relative flex flex-col !overflow-hidden"
      on:click|stopPropagation
    >
      
      <!-- Header -->
      <div class="p-3 sm:p-6 border-b-2 border-secondary flex-shrink-0">
        <button 
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
          on:click={handleClose}
        >✕</button>
        
        <h3 class="font-bold text-xl sm:text-3xl font-medieval text-neutral text-center mb-2 pr-8">
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
            Buscá objetos en nuestro catálogo
          {/if}
        </p>
      </div>

      <!-- Content -->
      <div class="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6" bind:this={contentElement}>
        {#if validationError && !manualMode}<p class="text-error text-sm mb-3" role="alert">{validationError}</p>{/if}
        
        {#if !manualMode}
          <!-- Modo búsqueda -->
          <div class="space-y-4">
            <!-- ✅ NUEVO: Filtro de tipo -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medieval text-neutral">Filtrar por tipo</span>
              </label>
              <select 
                bind:value={selectedTypeFilter}
                on:change={() => {filters={};if(searchQuery.trim())handleSearch();}}
                aria-label="Filtrar por tipo"
                class="select select-bordered bg-[#2d241c] text-base-content border-primary/50"
              >
                <option value="all">🔍 Buscar en todo</option>
                <option value="weapon">⚔️ Solo Armas</option>
                <option value="armor">🛡️ Armaduras y escudos</option>
                <option value="consumable">🧪 Solo Consumibles</option>
                <option value="tool">🔧 Solo Herramientas</option>
                <option value="treasure">💎 Solo Tesoros</option>
                <option value="other">📦 Otros objetos</option>
              </select>
            </div>
            <!-- Búsqueda -->
            <div class="form-control">
              <div class="relative">
                <input 
                  type="text" 
                  bind:value={searchQuery}
                  on:input={handleSearch}
                  on:keydown={(event)=>{if(event.key==='Enter'){event.preventDefault();runSearch(true);}}}
                  aria-label="Nombre del objeto"
                  placeholder="Buscar: plate armor, longsword, rope, health potion..."
                  class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 w-full pr-10"
                  autofocus
                />
                <div class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral/50">
                  {#if loading}
                    <span class="loading loading-spinner loading-sm"></span>
                  {:else}
                    🔍
                  {/if}
                </div>
              </div>
              <label class="label">
                <span class="label-text-alt text-neutral/60 italic">
                  💡 El nombre es opcional; podés buscar solo con filtros
                </span>
              </label>
            </div>

            <details class="border border-primary/30 rounded p-2 text-neutral">
              <summary class="cursor-pointer text-sm font-semibold">Edición y publicación</summary>
              <div class="grid grid-cols-2 gap-2 mt-2">
                <label class="text-sm">Edición<select class="select select-bordered select-sm w-full bg-[#2d241c] text-base-content" bind:value={edition}><option value="all">Todas / A5E</option><option value="2024">Reglas 2024</option><option value="2014">Reglas 2014</option></select></label>
                <label class="text-sm">Contenido<select class="select select-bordered select-sm w-full bg-[#2d241c] text-base-content" bind:value={scope}><option value="all">Todos</option><option value="official">Oficial</option><option value="third-party">Terceros</option><option value="homebrew">Homebrew</option><option value="playtest">Pruebas</option></select></label>
                <label class="text-sm col-span-2">Publicación<select class="select select-bordered select-sm w-full bg-[#2d241c] text-base-content" bind:value={source}><option value="">Todos los libros</option>{#each Object.values(manifest?.sourceLabels||{}).sort((a,b)=>a.name.localeCompare(b.name)) as book}<option value={book.key}>{book.name}</option>{/each}</select></label>
              </div>
            </details>
            <LibrarySubfilters kind="items" type={selectedTypeFilter==='all'?'':selectedTypeFilter} bind:filters/>
            {#if searchError}<p class="text-error text-sm" role="alert">{searchError}</p>{/if}
            <div bind:this={resultsElement}>
            <!-- Loading - Más compacto -->
            {#if loading && !suggestions.length}
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
            {#if suggestions.length > 0}
              <div class="space-y-2">
                <p class="text-xs font-medieval text-neutral/70">
                  📖 {suggestions.length} item{suggestions.length !== 1 ? 's' : ''} encontrado{suggestions.length !== 1 ? 's' : ''} · máximo 60
                </p>
                
                <div class="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto overflow-x-hidden">
                  {#each suggestions as item}
                    <button
                      on:click={() => selectItem(item)}
                      class="btn btn-ghost text-left border border-primary/30 hover:bg-primary/20 
                             flex flex-col items-start w-full min-w-0 p-4 h-auto min-h-[6rem]"
                      disabled={loading}
                    >
                      <div class="flex justify-between items-start w-full mb-2">
                        <div class="flex-1 min-w-0">
                          <span class="font-bold text-neutral text-lg block break-words">{item.name}</span>
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
                        {#if item.catalogSource}<span class="badge badge-xs badge-outline">{item.catalogSource.name} · {item.catalogSource.edition}</span>{/if}
                      </div>
                      
                      <p class="text-xs text-neutral/70 line-clamp-2 w-full">
                        {open5eInventoryApi.cleanDescription(item.desc || '', 120)}
                      </p>
                    </button>
                  {/each}
                </div>
              </div>
            {/if}

            </div>
            <!-- Sin búsqueda activa -->
            {#if !searched && !loading && suggestions.length === 0}
              <div class="text-center py-12">
                <div class="text-6xl mb-4">📦</div>
                <p class="text-neutral/70 font-body mb-4">
                  Elegí filtros y presioná Buscar. El nombre es opcional.
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
            
            {#if validationError}
              <div class="alert alert-error">
                <span>{validationError}</span>
              </div>
            {/if}
            {#if error}<p class="text-error text-sm" role="alert">{error}</p>{/if}
            
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
                on:input={() => touched = true}
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

            {#if manualForm.type === 'weapon'}
              <WeaponFields bind:form={weaponForm} disabled={busy} />
            {/if}
            {#if manualForm.type === 'armor' || manualForm.type === 'shield'}
              <ArmorFields bind:form={armorForm} disabled={busy} isShield={manualForm.type === 'shield'} />
            {/if}
            <!-- Cantidad y valor -->
            <div class="grid grid-cols-2 gap-3">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medieval text-neutral">Cantidad</span>
                </label>
                <input 
                  type="number" 
                  bind:value={manualForm.quantity}
                  on:input={() => touched = true}
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
                  on:input={() => touched = true}
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
                on:input={() => touched = true}
                placeholder="Descripción del item..."
                class="textarea textarea-bordered bg-[#2d241c] text-base-content border-primary/50 h-24"
              ></textarea>
            </div>
          </div>
        {/if}
      </div>

      <!-- Footer: la búsqueda queda accesible al desplazarse por los filtros. -->
      <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2 p-3 sm:p-6 border-t-2 border-secondary flex-shrink-0">
        <button 
          on:click={handleClose}
          class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
        >
          Cancelar
        </button>
        
        {#if manualMode}
          <button 
            on:click={handleAddItem}
            class="btn btn-dnd whitespace-normal min-w-0"
            disabled={busy || !manualForm.name.trim() || !!validationError || (manualForm.type === 'weapon' && !!validateWeaponForm(weaponForm)) || (['armor','shield'].includes(manualForm.type) && !!validateArmorForm(armorForm))}
          >
            <span class="text-xl">➕</span>
            Agregar al Inventario
          </button>
        {:else}
          <button type="button" class="btn btn-dnd min-w-0" disabled={loading||busy} on:click={()=>runSearch(true)}>{loading?'Buscando…':'Buscar'}</button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .btn:disabled {color:#594c39;background:#d8c9aa;border-color:#9e8a69;opacity:1;}
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
