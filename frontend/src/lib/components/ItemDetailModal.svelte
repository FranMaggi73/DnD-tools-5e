<!-- frontend/src/lib/components/ItemDetailModal.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { InventoryItem } from '$lib/api/inventory';
  import type { Character } from '$lib/types';
  import type { CatalogSource } from '$lib/types';
  import { catalogApi } from '$lib/api/catalog';
  import { open5eInventoryApi, type Open5eItem } from '$lib/api/inventory';
  let catalogSource:CatalogSource|null=null;
  let sourceRecord:Open5eItem|null=null;
  let loadedSlug='';
  $: if(isOpen && item && item.open5eSlug!==loadedSlug) {
    loadedSlug=item.open5eSlug || '';
    catalogSource=null;sourceRecord=null;
    if(loadedSlug) loadReference(loadedSlug);
  }
  async function loadReference(slug:string) {
    try {
      const source=await catalogApi.sourceForItem(slug);
      if(loadedSlug!==slug) return;
      catalogSource=source;
      for(const category of ['magicitems','weapons','armor','gear']) {
        try { const record=await catalogApi.getItem(slug,category); if(loadedSlug===slug) sourceRecord=record; break; } catch{}
      }
    } catch { /* The saved inventory remains usable without catalog access. */ }
  }

  export let isOpen: boolean = false;
  export let item: InventoryItem | null = null;
  export let character: Character | null = null;

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch('close');
  }

  function formatValue(value: number): string {
    return value % 1 === 0 ? value.toString() : value.toFixed(2);
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

  function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      weapon: 'Arma',
      armor: 'Armadura',
      shield: 'Escudo',
      tool: 'Herramienta',
      consumable: 'Consumible',
      treasure: 'Tesoro',
      other: 'Otro',
    };
    return labels[type] || 'Item';
  }
</script>

{#if isOpen && item}
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
        
        <div class="flex items-start gap-4">
          <div class="text-5xl">{getItemIcon(item.type)}</div>
          <div class="flex-1">
            <h3 class="font-bold text-3xl font-medieval text-neutral mb-2">
              {item.name}
            </h3>
            <div class="flex flex-wrap gap-2">
              <span class="badge badge-primary">{getTypeLabel(item.type)}</span>
              {#if item.isMagical}<span class="badge badge-secondary">✨ Mágico</span>{/if}
              {#if item.weaponData?.isMagical || (item.weaponData?.magicBonus || 0) > 0}<span class="badge badge-secondary">✨ Arma mágica</span>{/if}
              {#if item.armorData?.isMagical || (item.armorData?.magicBonus || 0) > 0}<span class="badge badge-secondary">✨ {item.type === 'shield' ? 'Escudo mágico' : 'Armadura mágica'}</span>{/if}
              {#if item.requiresAttunement || item.weaponData?.requiresAttunement || item.armorData?.requiresAttunement}<span class="badge badge-warning">🔗 Requiere sintonización</span>{/if}
              {#if item.quantity > 1}
                <span class="badge badge-neutral">×{item.quantity}</span>
              {/if}
              {#if item.value > 0}
                <span class="badge badge-warning">💰 {formatValue(item.value)} gp c/u</span>
              {/if}
              {#if item.rarity}
                <span class="badge badge-secondary">{item.rarity}</span>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        {#if item.open5eSlug}<p class="text-xs text-neutral/70 mb-3"><a class="link" href={catalogSource?`/sources#${catalogSource.key}`:'/sources'}>{catalogSource?`${catalogSource.name} · ${catalogSource.edition}`:'Fuentes y licencias del catálogo'}</a></p>{/if}
        {#if sourceRecord?.desc && sourceRecord.desc !== item.description}<details class="border border-primary/20 rounded p-3 mb-4"><summary class="cursor-pointer font-medieval text-sm text-neutral">Descripción original del catálogo</summary><p class="text-sm text-neutral/80 whitespace-pre-wrap mt-2">{open5eInventoryApi.cleanDescription(sourceRecord.desc,100000)}</p></details>{/if}
        
        <!-- Descripción -->
        {#if item.description}
          <div class="mb-6">
            <h4 class="font-medieval text-lg text-neutral mb-2">📖 Descripción</h4>
            <div class="bg-neutral/10 p-4 rounded-lg border border-primary/20">
              <p class="text-neutral/80 font-body whitespace-pre-wrap">{item.description}</p>
            </div>
          </div>
        {/if}

        <!-- Weapon Data -->
        {#if item.weaponData}
          <div class="mb-6">
            <h4 class="font-medieval text-lg text-neutral mb-3">⚔️ Datos de Arma</h4>
            
            <div class="grid grid-cols-2 gap-3">
              
              <!-- Tipo de arma -->
              <div class="bg-primary/10 p-3 rounded-lg border border-primary/30 col-span-2">
                <p class="text-xs font-medieval text-neutral/60 mb-1">TIPO</p>
                <p class="text-lg font-bold text-neutral capitalize">
                  {item.weaponData.weaponType}
                </p>
              </div>

              <!-- Daño -->
              <div class="bg-error/10 p-3 rounded-lg border border-error/30">
                <p class="text-xs font-medieval text-neutral/60 mb-1">DAÑO · {item.weaponData.properties?.twoHanded ? 'DOS MANOS' : 'UNA MANO'}</p>
                <p class="text-xl font-bold text-neutral">
                  {item.weaponData.damageDice}
                </p>
                <p class="text-sm text-neutral/70 capitalize">{item.weaponData.damageType}</p>
              </div>

              <!-- Bonus mágico (si existe) -->
              {#if item.weaponData.magicBonus}
                <div class="bg-success/10 p-3 rounded-lg border border-success/30">
                  <p class="text-xs font-medieval text-neutral/60 mb-1">BONUS MÁGICO</p>
                  <p class="text-2xl font-bold text-success">+{item.weaponData.magicBonus}</p>
                  <p class="text-xs text-neutral/60">Al ataque y daño</p>
                </div>
              {/if}

              <!-- Rango (si existe) -->
              {#if item.weaponData.properties?.range}
                <div class="col-span-2 bg-warning/10 p-3 rounded-lg border border-warning/30">
                  <p class="text-xs font-medieval text-neutral/60 mb-1">🎯 ALCANCE</p>
                  <p class="text-lg font-bold text-neutral">
                    Normal: {item.weaponData.properties.range.normal} pies
                    {#if item.weaponData.properties.range.max !== item.weaponData.properties.range.normal}
                      • Máximo: {item.weaponData.properties.range.max} pies
                    {/if}
                  </p>
                </div>
              {/if}

              <!-- Versátil (si existe) -->
              {#if item.weaponData.properties?.versatile}
                <div class="col-span-2 bg-success/10 p-3 rounded-lg border border-success/30">
                  <p class="text-xs font-medieval text-neutral/60 mb-1">🤲 VERSÁTIL</p>
                  <p class="text-lg font-bold text-neutral">
                    {item.weaponData.properties.versatile} a dos manos
                  </p>
                </div>
              {/if}
            </div>

            <!-- Propiedades del arma -->
            {#if item.weaponData.properties && Object.keys(item.weaponData.properties).length > 0}
              <div class="mt-3">
                <p class="text-xs font-medieval text-neutral/60 mb-2">PROPIEDADES</p>
                <div class="flex flex-wrap gap-2">
                  {#if item.weaponData.properties.light}
                    <span class="badge badge-sm badge-info">Ligera</span>
                  {/if}
                  {#if item.weaponData.properties.finesse}
                    <span class="badge badge-sm badge-success">Fineza</span>
                  {/if}
                  {#if item.weaponData.properties.thrown}
                    <span class="badge badge-sm badge-warning">Arrojadiza</span>
                  {/if}
                  {#if item.weaponData.properties.twoHanded}
                    <span class="badge badge-sm badge-error">Dos manos</span>
                  {/if}
                  {#if item.weaponData.properties.reach}
                    <span class="badge badge-sm badge-primary">Alcance</span>
                  {/if}
                  {#if item.weaponData.properties.loading}
                    <span class="badge badge-sm badge-ghost">Recarga</span>
                  {/if}
                  {#if item.weaponData.properties.heavy}
                    <span class="badge badge-sm badge-neutral">Pesada</span>
                  {/if}
                  {#if item.weaponData.properties.ammunition}
                    <span class="badge badge-sm badge-accent">Munición</span>
                  {/if}
                  {#if item.weaponData.properties.versatile}
                    <span class="badge badge-sm badge-secondary">Versátil</span>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Armor Data -->
        {#if item.armorData}
          <div class="mb-6">
            <h4 class="font-medieval text-lg text-neutral mb-3">🛡️ Datos de Armadura</h4>
            
            <div class="grid grid-cols-2 gap-3">
              
              <!-- Tipo de armadura -->
              <div class="bg-primary/10 p-3 rounded-lg border border-primary/30 col-span-2">
                <p class="text-xs font-medieval text-neutral/60 mb-1">TIPO</p>
                <p class="text-lg font-bold text-neutral capitalize">
                  {item.armorData.armorType}
                </p>
              </div>

              <!-- AC Base -->
              <div class="bg-info/10 p-3 rounded-lg border border-info/30">
                <p class="text-xs font-medieval text-neutral/60 mb-1">CLASE DE ARMADURA</p>
                <p class="text-2xl font-bold text-neutral">
                  {#if item.armorData.armorType === 'Shield'}
                    +{item.armorData.baseAC}
                  {:else}
                    {item.armorData.baseAC}
                  {/if}
                  {#if item.armorData.magicBonus}
                    <span class="text-success">+{item.armorData.magicBonus}</span>
                  {/if}
                </p>
              </div>
              <!-- Modificador DEX -->
              {#if item.armorData}
                <div class="bg-success/10 p-3 rounded-lg border border-success/30">
                  <p class="text-xs font-medieval text-neutral/60 mb-1">MODIFICADOR DES</p>
                  <p class="text-lg font-bold text-neutral">
                    {#if item.armorData.armorType === 'Light Armor'}
                      Completo
                    {/if}
                    {#if item.armorData.armorType === 'Medium Armor'}
                      Máximo +2
                    {/if}
                    {#if item.armorData.armorType === 'Heavy Armor'}
                      Sin modificador
                    {/if}
                    {#if item.armorData.armorType === 'Shield'}
                      Sin modificador
                    {/if}
                  </p>
                </div>
              {/if}

              <!-- Requisito de Fuerza (si existe) -->
              {#if item.armorData.strengthRequirement && item.armorData.strengthRequirement > 0}
                <div class="bg-warning/10 p-3 rounded-lg border border-warning/30">
                  <p class="text-xs font-medieval text-neutral/60 mb-1">REQ. FUERZA</p>
                  <p class="text-2xl font-bold text-neutral">{item.armorData.strengthRequirement}</p>
                  <p class="text-xs text-neutral/60">Requerido para uso completo</p>
                </div>
              {/if}

              <!-- Desventaja en sigilo (si existe) -->
              {#if item.armorData.stealthDisadvantage}
                <div class="col-span-2 bg-error/10 p-3 rounded-lg border border-error/30">
                  <p class="text-center">
                    <span class="text-2xl">⚠️</span>
                    <span class="font-medieval text-neutral ml-2">Desventaja en Sigilo</span>
                  </p>
                </div>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Info general -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-neutral/10 p-3 rounded-lg border border-primary/20">
            <p class="text-xs font-medieval text-neutral/60 mb-1">CANTIDAD</p>
            <p class="text-2xl font-bold text-neutral">{item.quantity}</p>
          </div>

          <div class="bg-warning/10 p-3 rounded-lg border border-warning/30">
            <p class="text-xs font-medieval text-neutral/60 mb-1">VALOR TOTAL</p>
            <p class="text-2xl font-bold text-neutral">{formatValue(item.value * item.quantity)} gp</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t-2 border-secondary flex-shrink-0">
        <button 
          on:click={handleClose}
          class="btn btn-dnd w-full"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
{/if}
