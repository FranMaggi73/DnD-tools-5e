<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import debounce from 'lodash/debounce';
  import { open5eApi } from '$lib/api/api';
  import type { Monster, Character } from '$lib/types';
  // ===== IMPORTAR VALIDACIONES =====
  import { 
    validateHP, 
    validateArmorClass, 
    validateInitiative,
    validateCharacterName 
  } from '$lib/utils/validation';

  export let isOpen: boolean = false;
  export let players: Character[] = [];

  const dispatch = createEventDispatcher();

  let activeTab: 'player' | 'monster' = 'player';

  // Campos generales
  let initiative = 0;

  // === MODO JUGADOR ===
  let selectedPlayerId: string = '';
  $: selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  // === MODO MONSTRUO ===
  let searchQuery = '';
  let suggestions: Monster[] = [];
  let selectedMonster: Monster | null = null;
  let loading = false;
  let noResults = false;

  // Campos autocompletables del monstruo
  let name = '';
  let maxHp = 0;
  let armorClass = 10;
  let cr = '';
  let type = '';
  let size = '';
  let alignment = '';

  // ===== ESTADOS DE VALIDACIÓN =====
  let validationErrors = {
    name: '',
    initiative: '',
    maxHp: '',
    armorClass: ''
  };

  let touched = {
    name: false,
    initiative: false,
    maxHp: false,
    armorClass: false
  };

  // ===== VALIDACIÓN REACTIVA =====
  $: if (touched.name && activeTab === 'monster' && name) {
    const result = validateCharacterName(name);
    validationErrors.name = result.valid ? '' : result.error || '';
  }

  $: if (touched.initiative && initiative !== null) {
    const result = validateInitiative(initiative);
    validationErrors.initiative = result.valid ? '' : result.error || '';
  }

  $: if (touched.maxHp && maxHp !== null) {
    const result = validateHP(maxHp);
    validationErrors.maxHp = result.valid ? '' : result.error || '';
  }

  $: if (touched.armorClass && armorClass !== null) {
    const result = validateArmorClass(armorClass);
    validationErrors.armorClass = result.valid ? '' : result.error || '';
  }

  // Validación del formulario según el tab activo
  $: isPlayerValid = selectedPlayer && initiative >= 1 && !validationErrors.initiative;

  $: isMonsterValid = !validationErrors.name && !validationErrors.initiative && 
                      !validationErrors.maxHp && !validationErrors.armorClass &&
                      name.trim() && maxHp > 0 && armorClass > 0 && initiative >= 1;

  function handleBlur(field: keyof typeof touched) {
    touched[field] = true;
  }

  function validateCombatantForm(): boolean {
    if (activeTab === 'player') {
      touched.initiative = true;
      const initValidation = validateInitiative(initiative);
      validationErrors.initiative = initValidation.error || '';
      return initValidation.valid && selectedPlayer !== undefined;
    } else {
      // Marcar todos como tocados
      Object.keys(touched).forEach(key => {
        touched[key as keyof typeof touched] = true;
      });

      const nameValidation = validateCharacterName(name);
      const initValidation = validateInitiative(initiative);
      const hpValidation = validateHP(maxHp);
      const acValidation = validateArmorClass(armorClass);

      validationErrors.name = nameValidation.error || '';
      validationErrors.initiative = initValidation.error || '';
      validationErrors.maxHp = hpValidation.error || '';
      validationErrors.armorClass = acValidation.error || '';

      return nameValidation.valid && initValidation.valid && 
             hpValidation.valid && acValidation.valid;
    }
  }

  function handleAddPlayer() {
    if (!validateCombatantForm()) return;
    
    if (!selectedPlayer) return;

    dispatch('add', {
      type: 'character',
      characterId: selectedPlayer.id,
      name: selectedPlayer.name,
      maxHp: selectedPlayer.maxHp,
      armorClass: selectedPlayer.armorClass,
      initiative,
      isNpc: false
    });

    handleClose();
  }

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
      const result = await open5eApi.searchMonsters(query);
      suggestions = result.results || [];
      noResults = suggestions.length === 0;
    } catch (err) {
      console.error('Error buscando monstruos:', err);
      suggestions = [];
      noResults = true;
    } finally {
      loading = false;
    }
  }, 500);

  async function selectSuggestion(monster: Monster) {
    selectedMonster = await open5eApi.getMonster(monster.slug);

    name = selectedMonster.name;
    maxHp = selectedMonster.hit_points;
    armorClass = selectedMonster.armor_class;
    cr = selectedMonster.challenge_rating;
    type = selectedMonster.type;
    size = selectedMonster.size;
    alignment = selectedMonster.alignment;

    suggestions = [];
    searchQuery = '';
    
    // Marcar como tocados después de autocompletar
    touched.name = true;
    touched.maxHp = true;
    touched.armorClass = true;
  }

  function handleAddMonster() {
    if (!validateCombatantForm()) return;

    dispatch('add', {
      type: 'creature',
      name,
      initiative,
      maxHp,
      armorClass,
      cr,
      size,
      alignment,
      isNpc: true
    });

    handleClose();
  }

  function handleClose() {
    // reset total
    selectedPlayerId = '';
    selectedMonster = null;
    searchQuery = '';
    suggestions = [];
    noResults = false;
    name = '';
    initiative = 0;
    maxHp = 0;
    armorClass = 10;
    cr = '';
    type = '';
    size = '';
    alignment = '';
    loading = false;
    
    // Reset validaciones
    Object.keys(touched).forEach(key => {
      touched[key as keyof typeof touched] = false;
    });
    Object.keys(validationErrors).forEach(key => {
      validationErrors[key as keyof typeof validationErrors] = '';
    });
    
    dispatch('close');
  }
</script>

{#if isOpen}
<div 
  class="modal modal-open z-50" 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
  on:keydown={(e) => e.key === 'Escape' && handleClose()}
>
  <div class="modal-box card-parchment w-11/12 max-w-3xl h-11/12 relative flex flex-col">
    <div class="flex flex-col md:flex-row justify-between items-center p-4 border-b-2 border-secondary gap-2 md:gap-4">
      <h3 
        id="modal-title"
        class="font-bold text-2xl md:text-3xl font-medieval text-neutral flex-1 text-center md:text-left"
      >
        ⚔️ Agregar Combatiente
      </h3>
      
      <div class="flex gap-2" role="tablist" aria-label="Tipo de combatiente">
        <button
          role="tab"
          aria-selected={activeTab === 'player'}
          aria-controls="player-panel"
          class="btn btn-sm font-medieval {activeTab === 'player' ? 'btn-primary' : 'btn-outline'}"
          on:click={() => (activeTab = 'player')}
        >🧝 Jugador</button>
        <button
          role="tab"
          aria-selected={activeTab === 'monster'}
          aria-controls="monster-panel"
          class="btn btn-sm font-medieval {activeTab === 'monster' ? 'btn-primary' : 'btn-outline'}"
          on:click={() => (activeTab = 'monster')}
        >🐉 Monstruo</button>
      </div>

      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 md:static"
        on:click={handleClose}
        aria-label="Cerrar modal"
      >✕</button>
    </div>

    <!-- CONTENIDO SCROLLEABLE -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      {#if activeTab === 'player'}
        <!-- TAB JUGADOR -->
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">
                Seleccionar Jugador <span class="text-error">*</span>
              </span>
            </label>
            <select
              bind:value={selectedPlayerId}
              class="select select-bordered bg-[#2d241c] text-base-content border-primary/50 w-full"
            >
              <option value="" disabled selected>-- Elegir jugador --</option>
              {#each players as p}
                <option value={p.id}>{p.name}</option>
              {/each}
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">
                Iniciativa <span class="text-error">*</span>
              </span>
            </label>
            <input
              type="number"
              min="1"
              max="100"
              step="1"
              required
              bind:value={initiative}
              on:blur={() => handleBlur('initiative')}
              class="input input-bordered bg-[#2d241c] text-base-content 
                     {validationErrors.initiative && touched.initiative ? 'border-error border-2' : 'border-primary/50'} 
                     w-full focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
            {#if validationErrors.initiative && touched.initiative}
              <label class="label">
                <span class="label-text-alt text-error text-xs">
                  ⚠️ {validationErrors.initiative}
                </span>
              </label>
            {:else}
              <label class="label">
                <span class="label-text-alt text-neutral/60 italic text-xs">
                  Valor de iniciativa tirado (1-100)
                </span>
              </label>
            {/if}
          </div>

          <div class="card bg-neutral/20 border border-primary/40 p-4 mt-2">
            <div class="flex items-center gap-4">
              <div>
                <p class="text-lg font-bold text-neutral">{selectedPlayer?.name || 'Elegir jugador'}</p>
                <p class="text-sm text-neutral/70">
                  HP: {selectedPlayer?.maxHp || 0} | AC: {selectedPlayer?.armorClass || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      {:else}
        <!-- TAB MONSTRUO -->
        <div class="space-y-4">
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Buscar monstruo (Open5e)</span>
            </label>
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Ej: kobold, goblin, dragon..."
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 w-full"
              on:input={handleSearch}
            />
            <label class="label">
              <span class="label-text-alt text-neutral/60 italic">
                💡 Prueba con nombres en inglés (kobold, goblin, orc)
              </span>
            </label>
          </div>

          <!-- Loading indicator -->
          {#if loading}
            <div class="flex justify-center items-center py-4">
              <span class="loading loading-spinner loading-md text-secondary"></span>
              <span class="ml-3 text-neutral/70">Buscando criaturas...</span>
            </div>
          {/if}

          <!-- No results message -->
          {#if noResults && !loading}
            <div class="alert bg-warning/20 border-warning/40">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="font-bold">No se encontraron resultados</p>
                <p class="text-xs">Intenta con otro nombre o crea el monstruo manualmente</p>
              </div>
            </div>
          {/if}

          <!-- Suggestions -->
          {#if suggestions.length > 0 && !loading}
            <div class="bg-neutral/10 rounded-lg border border-primary/30 p-3">
              <p class="text-xs font-medieval text-neutral/70 mb-2">
                📖 {suggestions.length} criatura{suggestions.length !== 1 ? 's' : ''} encontrada{suggestions.length !== 1 ? 's' : ''}
              </p>
              <div class="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {#each suggestions as s}
                  <button
                    on:click={() => selectSuggestion(s)}
                    class="btn btn-ghost text-left border border-primary/30 hover:bg-primary/20 
                           flex justify-between w-full p-3 h-auto min-h-[3rem]"
                  >
                    <div class="flex-1">
                      <span class="font-bold text-neutral block">{s.name}</span>
                      <span class="text-xs text-neutral/60">
                        {s.type} | CR {s.challenge_rating}
                      </span>
                    </div>
                    <span class="text-xs badge badge-sm badge-primary">
                      Seleccionar
                    </span>
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Formulario monstruo (siempre visible) -->
          <div class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medieval text-neutral">
                  Nombre <span class="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                bind:value={name}
                on:blur={() => handleBlur('name')}
                placeholder="Nombre de la criatura"
                class="input input-bordered bg-[#2d241c] text-base-content 
                       {validationErrors.name && touched.name ? 'border-error border-2' : 'border-primary/50'} 
                       w-full focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
              {#if validationErrors.name && touched.name}
                <label class="label">
                  <span class="label-text-alt text-error text-xs">
                    ⚠️ {validationErrors.name}
                  </span>
                </label>
              {/if}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medieval text-neutral">
                    Iniciativa <span class="text-error">*</span>
                  </span>
                </label>
                <input
                  type="number"
                  bind:value={initiative}
                  on:blur={() => handleBlur('initiative')}
                  min="1"
                  max="100"
                  class="input input-bordered bg-[#2d241c] text-base-content 
                         {validationErrors.initiative && touched.initiative ? 'border-error border-2' : 'border-primary/50'} 
                         w-full focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
                {#if validationErrors.initiative && touched.initiative}
                  <label class="label">
                    <span class="label-text-alt text-error text-xs">
                      {validationErrors.initiative}
                    </span>
                  </label>
                {/if}
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medieval text-neutral">
                    HP Máximo <span class="text-error">*</span>
                  </span>
                </label>
                <input
                  type="number"
                  bind:value={maxHp}
                  on:blur={() => handleBlur('maxHp')}
                  min="1"
                  max="999"
                  class="input input-bordered bg-[#2d241c] text-base-content 
                         {validationErrors.maxHp && touched.maxHp ? 'border-error border-2' : 'border-primary/50'} 
                         w-full focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
                {#if validationErrors.maxHp && touched.maxHp}
                  <label class="label">
                    <span class="label-text-alt text-error text-xs">
                      {validationErrors.maxHp}
                    </span>
                  </label>
                {/if}
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medieval text-neutral">
                    AC <span class="text-error">*</span>
                  </span>
                </label>
                <input
                  type="number"
                  bind:value={armorClass}
                  on:blur={() => handleBlur('armorClass')}
                  min="1"
                  max="30"
                  class="input input-bordered bg-[#2d241c] text-base-content 
                         {validationErrors.armorClass && touched.armorClass ? 'border-error border-2' : 'border-primary/50'} 
                         w-full focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
                {#if validationErrors.armorClass && touched.armorClass}
                  <label class="label">
                    <span class="label-text-alt text-error text-xs">
                      {validationErrors.armorClass}
                    </span>
                  </label>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- FOOTER FIJO -->
    <div class="flex justify-center gap-4 pt-4 border-t-2 border-secondary flex-col md:flex-row">
      <button
        on:click={handleClose}
        class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval w-full md:w-auto"
      >Cancelar</button>
      <button
        on:click={activeTab === 'player' ? handleAddPlayer : handleAddMonster}
        class="btn btn-dnd w-full md:w-auto"
        disabled={activeTab === 'player' ? !isPlayerValid : !isMonsterValid}
      >
        <span class="text-xl">⚔️</span> Agregar al Combate
      </button>
    </div>
  </div>
</div>
{/if}