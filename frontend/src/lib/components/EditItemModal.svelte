<!-- frontend/src/lib/components/EditItemModal.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { InventoryItem } from '$lib/api/inventory';

  export let isOpen: boolean = false;
  export let item: InventoryItem | null = null;
  export let isOwner: boolean = false;

  const dispatch = createEventDispatcher();

  let form = {
    name: '',
    description: '',
    quantity: 1,
    value: 0,
  };

  $: if (item && isOpen) {
    form = {
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      value: item.value,
    };
  }

  function handleUpdate() {
    if (!isOwner) return;
    
    const updates: any = {};
    
    // Solo enviar campos que hayan cambiado
    if (form.name !== item?.name) updates.name = form.name;
    if (form.description !== (item?.description || '')) updates.description = form.description;
    if (form.quantity !== item?.quantity) updates.quantity = form.quantity;
    if (form.value !== item?.value) updates.value = form.value;

    if (Object.keys(updates).length === 0) {
      handleClose();
      return;
    }

    dispatch('update', updates);
  }

  function handleClose() {
    dispatch('close');
  }

  function incrementQuantity() {
    if (form.quantity < 999) form.quantity++;
  }

  function decrementQuantity() {
    if (form.quantity > 0) form.quantity--;
  }
</script>

{#if isOpen && item && isOwner}
  <div class="modal modal-open z-50" on:click={handleClose}>
    <div 
      class="card-parchment border-4 border-secondary w-11/12 max-w-2xl relative max-h-[90vh] flex flex-col"
      on:click|stopPropagation
    >
      
      <!-- Header -->
      <div class="p-6 border-b-2 border-secondary flex-shrink-0">
        <button 
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
          on:click={handleClose}
        >✕</button>
        
        <h3 class="font-bold text-3xl font-medieval text-neutral text-center">
          ✏️ Modificar Item
        </h3>
        <p class="text-center text-neutral/60 font-body italic mt-2">
          Edita los detalles de tu objeto
        </p>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        
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
            placeholder="Nombre del item"
            class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            required
          />
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
                min="0"
                max="999"
                class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 join-item text-center flex-1 w-full"
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
          </div>

          <!-- Valor -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Valor (gp)</span>
            </label>
            <input 
              type="number" 
              bind:value={form.value}
              min="0"
              step="0.01"
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            />
            <label class="label">
              <span class="label-text-alt text-neutral/60 italic text-xs">
                Precio por unidad
              </span>
            </label>
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
            placeholder="Descripción del item..."
            class="textarea textarea-bordered bg-[#2d241c] text-base-content border-primary/50 h-32 resize-none"
          ></textarea>
          <label class="label">
            <span class="label-text-alt text-neutral/60 italic text-xs">
              Información adicional sobre el item
            </span>
          </label>
        </div>

        <!-- Info del item original (no editable) -->
        {#if item.weaponData || item.armorData}
          <div class="divider text-neutral/50">📊 Estadísticas</div>
          
          {#if item.weaponData}
            <div class="bg-error/10 p-4 rounded-lg border border-error/30">
              <p class="font-medieval text-neutral font-bold mb-2">⚔️ Datos de Arma</p>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-neutral/60">Daño:</span>
                  <span class="font-bold ml-2">{item.weaponData.damageDice} {item.weaponData.damageType}</span>
                </div>
                <div>
                  <span class="text-neutral/60">Tipo:</span>
                  <span class="font-bold ml-2 capitalize">{item.weaponData.weaponType.replace('_', ' ')}</span>
                </div>
              </div>
              <p class="text-xs text-neutral/60 italic mt-2">
                * Las estadísticas de combate no son editables
              </p>
            </div>
          {/if}

          {#if item.armorData}
            <div class="bg-info/10 p-4 rounded-lg border border-info/30">
              <p class="font-medieval text-neutral font-bold mb-2">🛡️ Datos de Armadura</p>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-neutral/60">AC Base:</span>
                  <span class="font-bold ml-2">{item.armorData.baseAC}</span>
                </div>
                <div>
                  <span class="text-neutral/60">Tipo:</span>
                  <span class="font-bold ml-2 capitalize">{item.armorData.armorType}</span>
                </div>
              </div>
              <p class="text-xs text-neutral/60 italic mt-2">
                * Las estadísticas de armadura no son editables
              </p>
            </div>
          {/if}
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
        <button 
          on:click={handleUpdate}
          class="btn btn-dnd"
          disabled={!form.name.trim() || form.quantity < 0}
        >
          <span class="text-xl">💾</span>
          Guardar Cambios
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