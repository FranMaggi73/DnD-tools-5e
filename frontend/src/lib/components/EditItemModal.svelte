<!-- frontend/src/lib/components/EditItemModal.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { InventoryItem } from '$lib/api/inventory';
  import WeaponFields from './WeaponFields.svelte';
  import ArmorFields from './ArmorFields.svelte';
  import { armorFormFromData, armorDataFromForm, validateArmorForm } from '$lib/utils/armorForm';
  import { weaponFormFromData, weaponDataFromForm, validateWeaponForm } from '$lib/utils/weaponForm';
  import { 
    validateItemName, 
    validateItemQuantity, 
    validateItemValue, 
    validateItemDescription 
  } from '$lib/utils/validation';

  export let isOpen: boolean = false;
  export let item: InventoryItem | null = null;
  export let isOwner: boolean = false;
  export let busy = false;
  export let error = '';

  const dispatch = createEventDispatcher();

  type Form = {
    name: string;
    description: string;
    quantity: number;
    value: number;
  };

  let form: Form = {
    name: '',
    description: '',
    quantity: 1,
    value: 0,
  };

  let validationErrors: { name: string; quantity: string; value: string; description: string } = {
    name: '',
    quantity: '',
    value: '',
    description: ''
  };

  let touched: { name: boolean; quantity: boolean; value: boolean; description: boolean } = {
    name: false,
    quantity: false,
    value: false,
    description: false
  };

  let hasChanges: boolean = false;
  let weaponForm = weaponFormFromData();
  let armorForm = armorFormFromData();
  let isValid: boolean = false;
  
  // ✅ NUEVO: Variable para controlar si ya se inicializó el formulario
  let formInitialized = false;
  let lastItemId: string | null = null;

  // ✅ CORRECCIÓN PRINCIPAL: Inicializar solo cuando cambia el item o se abre por primera vez
  $: if (item && isOpen) {
    // Solo inicializar si es un item diferente o es la primera vez
    if (!formInitialized || lastItemId !== item.id) {
      form = {
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        value: item.value,
      };
      weaponForm = weaponFormFromData(item.weaponData);
      armorForm = armorFormFromData(item.armorData, item.type);
      resetValidation();
      formInitialized = true;
      lastItemId = item.id;
    }
  }

  // ✅ Reset cuando se cierra el modal
  $: if (!isOpen) {
    formInitialized = false;
    lastItemId = null;
  }

  // Validaciones reactivas - SIN setTimeout
  $: {
    if (touched.name && form.name !== undefined) {
      const result = validateItemName(form.name);
      validationErrors.name = result.valid ? '' : result.error || '';
    }
  }

  $: {
    if (touched.quantity && form.quantity !== undefined) {
      const result = validateItemQuantity(form.quantity);
      validationErrors.quantity = result.valid ? '' : result.error || '';
    }
  }

  $: {
    if (touched.value && form.value !== undefined) {
      const result = validateItemValue(form.value);
      validationErrors.value = result.valid ? '' : result.error || '';
    }
  }

  $: {
    if (touched.description && form.description !== undefined) {
      const result = validateItemDescription(form.description);
      validationErrors.description = result.valid ? '' : result.error || '';
    }
  }

  // Cálculo de cambios
  $: {
    if (item && formInitialized) {
      const nameChanged = form.name !== item.name;
      const descChanged = form.description !== (item.description || '');
      const qtyChanged = Number(form.quantity) !== Number(item.quantity);
      const valueChanged = Number(form.value) !== Number(item.value);
      
      let weaponChanged = false;
      if (item.type === 'weapon') {
        weaponChanged = !item.weaponData || JSON.stringify(weaponForm) !== JSON.stringify(weaponFormFromData(item.weaponData));
      }
      
      let armorChanged = false;
      if (item.type === 'armor' || item.type === 'shield') {
        armorChanged = !item.armorData || JSON.stringify(armorForm) !== JSON.stringify(armorFormFromData(item.armorData, item.type));
      }
      
      hasChanges = nameChanged || descChanged || qtyChanged || valueChanged || weaponChanged || armorChanged;
    } else {
      hasChanges = false;
    }
  }

  $: isValid = validateItemName(form.name).valid && validateItemQuantity(form.quantity).valid && form.quantity <= 999 &&
               validateItemValue(form.value).valid && validateItemDescription(form.description).valid &&
               (item?.type !== 'weapon' || !validateWeaponForm(weaponForm)) &&
               (!item || !['armor','shield'].includes(item.type) || !validateArmorForm(armorForm));

  function handleBlur(field: keyof typeof touched) {
    touched[field] = true;
  }

  function handleUpdate() {
    if (!isOwner || busy) return;

    Object.keys(touched).forEach(key => {
      touched[key as keyof typeof touched] = true;
    });

    if (!isValid) return;

    if (!hasChanges) {
      handleClose();
      return;
    }

    const updates: any = {};

    if (form.name !== item?.name) updates.name = form.name;
    if (form.description !== (item?.description || '')) updates.description = form.description;
    if (form.quantity !== item?.quantity) updates.quantity = form.quantity;
    if (form.value !== item?.value) updates.value = form.value;

    if (item?.type === 'weapon') {
      updates.weaponData = weaponDataFromForm(weaponForm, item.weaponData);
    }

    if (item && ['armor','shield'].includes(item.type)) {
      updates.armorData = armorDataFromForm(armorForm, item.armorData, item.type);
    }

    dispatch('update', updates);
  }

  function handleClose() {
    if (busy) return;
    resetValidation();
    formInitialized = false;
    lastItemId = null;
    dispatch('close');
  }

  function resetValidation() {
    Object.keys(touched).forEach(key => {
      touched[key as keyof typeof touched] = false;
    });
    Object.keys(validationErrors).forEach(key => {
      validationErrors[key as keyof typeof validationErrors] = '';
    });
  }

  function incrementQuantity() {
    if (form.quantity < 999) {
      form.quantity++;
      touched.quantity = true;
    }
  }

  function decrementQuantity() {
    if (form.quantity > 0) {
      form.quantity--;
      touched.quantity = true;
    }
  }

  function handleQuantityChange() {
    if (form.quantity === 0 && item && item.quantity > 0) {
      if (!confirm('⚠️ Si la cantidad llega a 0, el item se eliminará. ¿Continuar?')) {
        form.quantity = 1;
      }
    }
  }
</script>

{#if isOpen && item && isOwner}
  <div class="modal modal-open z-50" on:click={handleClose}>
    <div 
      class="card-parchment border-2 sm:border-4 border-secondary w-full sm:w-11/12 max-w-2xl relative max-h-[92dvh] flex flex-col !overflow-hidden"
      on:click|stopPropagation
    >
      
      <!-- Header -->
      <div class="p-3 sm:p-6 border-b-2 border-secondary flex-shrink-0">
        <button 
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
          on:click={handleClose}
        >✕</button>
        
        <h3 class="font-bold text-xl sm:text-3xl font-medieval text-neutral text-center pr-8">
          ✏️ Modificar Item
        </h3>
        <p class="text-center text-neutral/60 font-body italic mt-2">
          Edita los detalles de tu objeto
        </p>
      </div>

      <!-- Content -->
      <div class="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 space-y-4">
        
        <!-- Nombre -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medieval text-neutral text-lg">
              Nombre <span class="text-error">*</span>
            </span>
          </label>
          <input 
            type="text" 
            bind:value={form.name}
            on:input={() => touched.name = true}
            on:blur={() => handleBlur('name')}
            placeholder="Nombre del item"
            class="input input-bordered bg-[#2d241c] text-base-content 
                  {validationErrors.name && touched.name ? 'border-error border-2' : 'border-primary/50'}"
            required
          />
          {#if validationErrors.name && touched.name}
            <label class="label">
              <span class="label-text-alt text-error">⚠️ {validationErrors.name}</span>
            </label>
          {/if}
        </div>

        <!-- Grid: Cantidad y Valor -->
        <div class="grid grid-cols-2 gap-4">
          
          <!-- Cantidad con botones -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Cantidad</span>
            </label>
            <div class="join w-full">
              <button 
                type="button"
                on:click={decrementQuantity}
                class="btn btn-outline join-item flex-shrink-0"
                disabled={form.quantity <= 0}
              >
                ➖
              </button>
                <input 
                  type="number" 
                  bind:value={form.quantity}
                  on:input={() => touched.quantity = true}
                  on:blur={() => { handleBlur('quantity'); handleQuantityChange(); }}
                  on:change={handleQuantityChange}
                  min="0"
                  max="999"
                  step="1"
                  class="input input-bordered bg-[#2d241c] text-base-content 
                        {validationErrors.quantity && touched.quantity ? 'border-error border-2' : 'border-primary/50'} 
                        join-item text-center flex-1 w-full"
                />
              <button 
                type="button"
                on:click={incrementQuantity}
                class="btn btn-outline join-item flex-shrink-0"
                disabled={form.quantity >= 999}
              >
                ➕
              </button>
            </div>
            {#if validationErrors.quantity && touched.quantity}
              <label class="label">
                <span class="label-text-alt text-error text-xs">⚠️ {validationErrors.quantity}</span>
              </label>
            {:else}
              <label class="label">
                <span class="label-text-alt text-neutral/60 italic text-xs">
                  {#if form.quantity === 0}
                    ⚠️ Si llegas a 0, el item se eliminará
                  {:else if form.quantity > 99}
                    📦 Gran cantidad de items
                  {:else}
                    Cantidad disponible
                  {/if}
                </span>
              </label>
            {/if}
          </div>

          <!-- Valor -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Valor (gp)</span>
            </label>
              <input 
                type="number" 
                bind:value={form.value}
                on:input={() => touched.value = true}
                on:blur={() => handleBlur('value')}
                min="0"
                step="0.01"
                class="input input-bordered bg-[#2d241c] text-base-content 
                      {validationErrors.value && touched.value ? 'border-error border-2' : 'border-primary/50'}"
              />
            {#if validationErrors.value && touched.value}
              <label class="label">
                <span class="label-text-alt text-error text-xs">⚠️ {validationErrors.value}</span>
              </label>
            {:else}
              <label class="label">
                <span class="label-text-alt text-neutral/60 italic text-xs">
                  Precio por unidad
                </span>
              </label>
            {/if}
          </div>
        </div>

        <!-- Valor total calculado -->
        {#if form.quantity > 1}
          <div class="bg-warning/10 p-3 rounded-lg border border-warning/30">
            <div class="flex justify-between items-center">
              <span class="font-medieval text-neutral">💰 Valor Total:</span>
              <span class="text-2xl font-bold text-neutral">
                {(form.value * form.quantity).toFixed(2)} gp
              </span>
            </div>
          </div>
        {/if}

        <!-- Descripción -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medieval text-neutral text-lg">Descripción</span>
          </label>
          <textarea 
            bind:value={form.description}
            on:blur={() => handleBlur('description')}
            placeholder="Descripción del item..."
            class="textarea textarea-bordered bg-[#2d241c] text-base-content 
                   {validationErrors.description && touched.description ? 'border-error border-2' : 'border-primary/50'} 
                   h-32 resize-none"
          ></textarea>
          {#if validationErrors.description && touched.description}
            <label class="label">
              <span class="label-text-alt text-error text-xs">⚠️ {validationErrors.description}</span>
            </label>
          {:else}
            <label class="label">
              <span class="label-text-alt text-neutral/60 italic text-xs">
                Información adicional sobre el item
              </span>
            </label>
          {/if}
        </div>

        {#if error}<p class="text-error text-sm" role="alert">{error}</p>{/if}
        {#if item.type === 'weapon'}
          <WeaponFields bind:form={weaponForm} disabled={busy} />
        {/if}
        {#if item.type === 'armor' || item.type === 'shield'}
          <ArmorFields bind:form={armorForm} disabled={busy} isShield={item.type === 'shield'} />
        {/if}
      </div>

      <!-- Footer -->
      <div class="grid grid-cols-2 gap-2 p-3 sm:p-6 border-t-2 border-secondary flex-shrink-0">
        <button 
          on:click={handleClose}
          class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
        >
          Cancelar
        </button>
        <button 
          on:click={handleUpdate}
          class="btn btn-dnd"
          disabled={busy || !isValid || !hasChanges}
        >
          <span class="text-xl">💾</span>
          {hasChanges ? 'Guardar Cambios' : 'Sin Cambios'}
        </button>
      </div>
    </div>
  </div>
{:else if isOpen && item && !isOwner}
  <!-- Mensaje si no es el dueño -->
  <div class="modal modal-open z-50" on:click={handleClose}>
    <div class="card-parchment border-4 border-error w-11/12 max-w-md text-center p-8">
      <div class="text-6xl mb-4">🚫</div>
      <h3 class="text-2xl font-medieval text-neutral mb-3">Acceso Denegado</h3>
      <p class="text-neutral/70 font-body mb-6">
        Solo el dueño del personaje puede modificar items.
      </p>
      <button 
        on:click={handleClose}
        class="btn btn-dnd"
      >
        Entendido
      </button>
    </div>
  </div>
{/if}
