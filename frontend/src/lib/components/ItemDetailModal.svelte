<!-- frontend/src/lib/components/ItemDetailModal.svelte -->
<!-- ✅ CORREGIDO: Muestra proficiency, bonus calculado, warnings -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { InventoryItem } from '$lib/api/inventory';
  import type { Character } from '$lib/types';
  import { getAbilityModifier } from '$lib/types';

  export let isOpen: boolean = false;
  export let item: InventoryItem | null = null;
  export let character: Character | null = null; // ✅ NUEVO: Para calcular stats efectivos

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

  // ✅ NUEVO: Detectar si es arma marcial
  function getWeaponProficiency(weaponType: string): { type: string; label: string } {
    const martial = ['longsword', 'greatsword', 'longbow', 'battleaxe', 'warhammer', 'martial'];
    const simple = ['club', 'dagger', 'shortbow', 'simple'];
    
    const typeNorm = weaponType.toLowerCase();
    
    if (martial.some(w => typeNorm.includes(w))) {
      return { type: 'martial', label: 'Marcial' };
    }
    if (simple.some(w => typeNorm.includes(w))) {
      return { type: 'simple', label: 'Simple' };
    }
    
    // Default heuristic
    return typeNorm.includes('martial') 
      ? { type: 'martial', label: 'Marcial' } 
      : { type: 'simple', label: 'Simple' };
  }

  // ✅ NUEVO: Calcular bonus de ataque efectivo
  function calculateAttackBonus(weapon: any, char: Character | null): string {
    if (!char || !weapon) return '+?';
    
    const magicBonus = weapon.magicBonus || 0;
    const profBonus = char.proficiencyBonus || 0;
    
    // Determinar si usa STR o DEX
    let abilityMod = 0;
    if (weapon.properties?.finesse) {
      // Usa el mayor entre STR y DEX
      const strMod = getAbilityModifier(char.abilityScores.strength);
      const dexMod = getAbilityModifier(char.abilityScores.dexterity);
      abilityMod = Math.max(strMod, dexMod);
    } else if (weapon.weaponType?.toLowerCase().includes('ranged') || 
               weapon.weaponType?.toLowerCase().includes('bow')) {
      abilityMod = getAbilityModifier(char.abilityScores.dexterity);
    } else {
      abilityMod = getAbilityModifier(char.abilityScores.strength);
    }
    
    const total = abilityMod + profBonus + magicBonus;
    return total >= 0 ? `+${total}` : `${total}`;
  }

  // ✅ NUEVO: Calcular AC efectivo con DEX del personaje
  function calculateEffectiveAC(armor: any, char: Character | null): number {
    if (!char || !armor) return armor.baseAC || 10;
    
    const baseAC = armor.baseAC || 10;
    const magicBonus = armor.magicBonus || 0;
    const dexMod = getAbilityModifier(char.abilityScores.dexterity);
    
    let finalAC = baseAC + magicBonus;
    
    if (armor.dexModifier === 'full') {
      finalAC += dexMod;
    } else if (armor.dexModifier === 'max2') {
      finalAC += Math.min(dexMod, 2);
    }
    // 'none' = no suma DEX
    
    return finalAC;
  }

  // ✅ NUEVO: Verificar si cumple req de fuerza
  function meetsStrengthRequirement(armor: any, char: Character | null): boolean {
    if (!armor.strengthRequirement || !char) return true;
    return char.abilityScores.strength >= armor.strengthRequirement;
  }

  $: weaponProf = item?.weaponData ? getWeaponProficiency(item.weaponData.weaponType) : null;
  $: attackBonus = item?.weaponData ? calculateAttackBonus(item.weaponData, character) : null;
  $: effectiveAC = item?.armorData ? calculateEffectiveAC(item.armorData, character) : null;
  $: strengthOK = item?.armorData ? meetsStrengthRequirement(item.armorData, character) : true;
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
            
            <!-- ✅ NUEVO: Proficiency Badge -->
            {#if weaponProf}
              <div class="mb-3">
                <span class="badge {weaponProf.type === 'martial' ? 'badge-error' : 'badge-success'} badge-lg">
                  {weaponProf.label}
                </span>
                <span class="text-xs text-neutral/60 ml-2">
                  {weaponProf.type === 'martial' ? 'Requiere competencia en armas marciales' : 'Arma simple'}
                </span>
              </div>
            {/if}

            <div class="grid grid-cols-2 gap-3">
              
              <div class="bg-error/10 p-3 rounded-lg border border-error/30">
                <p class="text-xs font-medieval text-neutral/60 mb-1">DAÑO</p>
                <p class="text-xl font-bold text-neutral">
                  {item.weaponData.damageDice} {item.weaponData.damageType}
                </p>
                {#if item.weaponData.magicBonus}
                  <p class="text-sm text-success">+{item.weaponData.magicBonus} mágico</p>
                {/if}
              </div>

              <!-- ✅ NUEVO: Bonus de Ataque Calculado -->
              {#if character && attackBonus}
                <div class="bg-success/10 p-3 rounded-lg border border-success/30">
                  <p class="text-xs font-medieval text-neutral/60 mb-1">BONUS ATAQUE</p>
                  <p class="text-2xl font-bold text-neutral">{attackBonus}</p>
                  <p class="text-xs text-neutral/60">
                    {#if item.weaponData.properties?.finesse}
                      STR/DEX + Prof + Mágico
                    {:else if item.weaponData.weaponType?.toLowerCase().includes('ranged')}
                      DEX + Prof + Mágico
                    {:else}
                      STR + Prof + Mágico
                    {/if}
                  </p>
                </div>
              {:else}
                <div class="bg-info/10 p-3 rounded-lg border border-info/30">
                  <p class="text-xs font-medieval text-neutral/60 mb-1">TIPO</p>
                  <p class="text-lg font-bold text-neutral capitalize">
                    {item.weaponData.weaponType.replace('_', ' ')}
                  </p>
                </div>
              {/if}

              {#if item.weaponData.properties.range}
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

              {#if item.weaponData.properties.versatile}
                <div class="col-span-2 bg-success/10 p-3 rounded-lg border border-success/30">
                  <p class="text-xs font-medieval text-neutral/60 mb-1">🤲 VERSÁTIL</p>
                  <p class="text-lg font-bold text-neutral">
                    {item.weaponData.properties.versatile} a dos manos
                  </p>
                </div>
              {/if}
            </div>

            <!-- Propiedades del arma -->
            {#if Object.entries(item.weaponData.properties).some(([key, value]) => value === true)}
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
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Armor Data -->
        {#if item.armorData}
          <div class="mb-6">
            <h4 class="font-medieval text-lg text-neutral mb-3">🛡️ Datos de Armadura</h4>
            
            <!-- ✅ NUEVO: Warning sobre STR requirement -->
            {#if !strengthOK && character}
              <div class="alert alert-warning mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm">
                  Tu Fuerza ({character.abilityScores.strength}) es menor al requerimiento ({item.armorData.strengthRequirement}). 
                  Tu velocidad se reduce en 10 pies.
                </span>
              </div>
            {/if}

            <div class="grid grid-cols-2 gap-3">
              
              <!-- ✅ MEJORADO: AC Efectivo Calculado -->
              {#if character && effectiveAC !== null}
                <div class="bg-success/10 p-3 rounded-lg border border-success/30 col-span-2">
                  <p class="text-xs font-medieval text-neutral/60 mb-1">AC EFECTIVO (CON TU DEX)</p>
                  <p class="text-3xl font-bold text-neutral">{effectiveAC}</p>
                  <p class="text-xs text-neutral/60 mt-1">
                    Base {item.armorData.baseAC}
                    {#if item.armorData.magicBonus} + Mágico {item.armorData.magicBonus}{/if}
                    {#if item.armorData.dexModifier === 'full'}
                      + DEX {getAbilityModifier(character.abilityScores.dexterity) >= 0 ? '+' : ''}{getAbilityModifier(character.abilityScores.dexterity)}
                    {:else if item.armorData.dexModifier === 'max2'}
                      + DEX (máx +2)
                    {/if}
                  </p>
                </div>
              {:else}
                <div class="bg-info/10 p-3 rounded-lg border border-info/30">
                  <p class="text-xs font-medieval text-neutral/60 mb-1">CLASE DE ARMADURA</p>
                  <p class="text-2xl font-bold text-neutral">
                    {#if item.type === 'shield'}
                      +{item.armorData.baseAC || 2}
                    {:else}
                      {item.armorData.baseAC}
                    {/if}
                    {#if item.armorData.magicBonus}
                      <span class="text-success">+{item.armorData.magicBonus}</span>
                    {/if}
                  </p>
                </div>
              {/if}

              <div class="bg-primary/10 p-3 rounded-lg border border-primary/30">
                <p class="text-xs font-medieval text-neutral/60 mb-1">TIPO</p>
                <p class="text-lg font-bold text-neutral capitalize">
                  {item.armorData.armorType}
                </p>
              </div>

              {#if item.armorData.dexModifier && !character}
                <div class="bg-success/10 p-3 rounded-lg border border-success/30">
                  <p class="text-xs font-medieval text-neutral/60 mb-1">MODIFICADOR DES</p>
                  <p class="text-lg font-bold text-neutral">
                    {#if item.armorData.dexModifier === 'full'}
                      Completo
                    {:else if item.armorData.dexModifier === 'max2'}
                      Máximo +2
                    {:else if item.armorData.dexModifier === 'none'}
                      Sin modificador
                    {:else}
                      {item.armorData.dexModifier}
                    {/if}
                  </p>
                </div>
              {/if}

              {#if item.armorData.strengthRequirement && item.armorData.strengthRequirement > 0}
                <div class="bg-error/10 p-3 rounded-lg border border-error/30">
                  <p class="text-xs font-medieval text-neutral/60 mb-1">REQ. FUERZA</p>
                  <p class="text-2xl font-bold text-neutral">{item.armorData.strengthRequirement}</p>
                  {#if character}
                    <p class="text-xs {strengthOK ? 'text-success' : 'text-error'}">
                      {strengthOK ? '✓ Cumples' : '✗ No cumples'}
                    </p>
                  {/if}
                </div>
              {/if}

              {#if item.armorData.stealthDisadvantage}
                <div class="col-span-2 bg-warning/10 p-3 rounded-lg border border-warning/30">
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

        {#if item.open5eSlug}
          <div class="mt-4 text-center">
            <a 
              href="https://open5e.com/equipment/{item.open5eSlug}"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-primary hover:text-secondary underline"
            >
              📖 Ver en Open5e
            </a>
          </div>
        {/if}
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