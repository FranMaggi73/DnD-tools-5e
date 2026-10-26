<script lang="ts">
 import {catalogApi} from '$lib/api/catalog';
 import type {LibraryFilters,LibraryKind} from '$lib/rules/library';
 export let kind:LibraryKind;
 export let type='';
 export let filters:LibraryFilters={};
 let facets={schools:[] as string[],classes:[] as string[],rarities:[] as string[]};
 let current='';let error='';
 $: if((kind==='items'||kind==='spells')&&current!==kind){current=kind;loadFacets(kind);}
 async function loadFacets(category:'items'|'spells') {
  error='';try {const result=await catalogApi.libraryFacets(category);if(kind===category)facets=result;}
  catch {if(kind===category)error='No se pudieron cargar las opciones de filtro.';}
 }
 function retry(){if(kind==='items'||kind==='spells')loadFacets(kind);}
 const schools:Record<string,string>={abjuration:'Abjuración',conjuration:'Conjuración',divination:'Adivinación',enchantment:'Encantamiento',evocation:'Evocación',illusion:'Ilusión',necromancy:'Nigromancia',transmutation:'Transmutación'};
 const classes:Record<string,string>={Artificer:'Artificiero',Barbarian:'Bárbaro',Bard:'Bardo',Cleric:'Clérigo',Druid:'Druida',Fighter:'Guerrero',Monk:'Monje',Paladin:'Paladín',Ranger:'Explorador',Rogue:'Pícaro',Sorcerer:'Hechicero',Warlock:'Brujo',Wizard:'Mago'};
 const rarities:Record<string,string>={common:'Común',uncommon:'Poco común',rare:'Raro','very rare':'Muy raro',legendary:'Legendario',artifact:'Artefacto',varies:'Variable'};
</script>

{#if kind==='items'||kind==='spells'}
 <details class="border border-primary/30 rounded p-2" open>
  <summary class="cursor-pointer font-semibold text-sm text-neutral">Filtros de {kind==='spells'?'hechizos':type==='weapon'?'armas':type==='armor'?'armaduras':'objetos'}</summary>
  {#if error}<p class="text-error text-sm" role="alert">{error} <button type="button" class="link" on:click={retry}>Reintentar</button></p>{/if}
  <div class="grid grid-cols-2 gap-2 mt-2">
   {#if kind==='items'}
    <label>Magia<select bind:value={filters.magic}><option value={undefined}>Cualquiera</option><option value="yes">Mágicos</option><option value="no">No mágicos</option></select></label>
    <label>Sintonización<select bind:value={filters.attunement}><option value={undefined}>Cualquiera</option><option value="yes">Requiere</option><option value="no">No requiere</option></select></label>
    <label class="col-span-2">Rareza<select bind:value={filters.rarity}><option value={undefined}>Cualquiera</option>{#each facets.rarities as rarity}<option value={rarity}>{rarities[rarity.toLowerCase()]||rarity}</option>{/each}</select></label>
    {#if type==='weapon'}
     <label>Tipo de arma<select bind:value={filters.weaponType}><option value={undefined}>Cualquiera</option><option value="simple">Simple</option><option value="martial">Marcial</option></select></label>
     <label>Manos<select bind:value={filters.hands}><option value={undefined}>Cualquiera</option><option value="one">Una mano</option><option value="two">Dos manos</option><option value="versatile">Versátil</option></select></label>
     <label>Tipo de daño<select bind:value={filters.damageType}><option value={undefined}>Cualquiera</option>{#each [['acid','Ácido'],['bludgeoning','Contundente'],['cold','Frío'],['fire','Fuego'],['force','Fuerza'],['lightning','Relámpago'],['necrotic','Necrótico'],['piercing','Perforante'],['poison','Veneno'],['psychic','Psíquico'],['radiant','Radiante'],['slashing','Cortante'],['thunder','Trueno']] as [value,label]}<option {value}>{label}</option>{/each}</select></label>
     <label>Propiedad<select bind:value={filters.property}><option value={undefined}>Cualquiera</option>{#each [['finesse','Sutil'],['light','Ligera'],['heavy','Pesada'],['reach','Alcance'],['thrown','Arrojadiza'],['ammunition','Munición'],['loading','Recarga'],['special','Especial']] as [value,label]}<option {value}>{label}</option>{/each}</select></label>
    {:else if type==='armor'}
     <label>Categoría de armadura<select bind:value={filters.armorType}><option value={undefined}>Cualquiera</option><option value="light">Ligera</option><option value="medium">Media</option><option value="heavy">Pesada</option><option value="shield">Escudo</option></select></label>
     <label>Sigilo<select bind:value={filters.stealth}><option value={undefined}>Cualquiera</option><option value="yes">Con desventaja</option><option value="no">Sin desventaja</option></select></label>
    {/if}
   {:else}
    <label>Nivel de hechizo<select bind:value={filters.spellLevel}><option value={undefined}>Cualquiera</option><option value="0">Trucos</option>{#each [1,2,3,4,5,6,7,8,9] as level}<option value={String(level)}>Nivel {level}</option>{/each}</select></label>
    <label>Escuela<select bind:value={filters.school}><option value={undefined}>Cualquiera</option>{#each facets.schools as school}<option value={school}>{schools[school.toLowerCase()]||school}</option>{/each}</select></label>
    <label class="col-span-2">Clase de hechizo<select bind:value={filters.spellClass}><option value={undefined}>Cualquiera</option>{#each facets.classes as name}<option value={name}>{classes[name]||name}</option>{/each}</select></label>
    <label>Concentración<select bind:value={filters.concentration}><option value={undefined}>Cualquiera</option><option value="yes">Requiere</option><option value="no">No requiere</option></select></label>
    <label>Ritual<select bind:value={filters.ritual}><option value={undefined}>Cualquiera</option><option value="yes">Sí</option><option value="no">No</option></select></label>
    <label class="col-span-2">Tiempo de lanzamiento<select bind:value={filters.castingTime}><option value={undefined}>Cualquiera</option><option value="action">Acción</option><option value="bonus">Acción adicional</option><option value="reaction">Reacción</option><option value="long">Más tiempo / especial</option></select></label>
   {/if}
  </div>
  <button class="link text-sm mt-2" type="button" on:click={()=>filters={}}>Limpiar subfiltros</button>
 </details>
{/if}

<style>
 label {font-size:.8125rem;color:#2c1810;min-width:0;}
 select {display:block;width:100%;min-width:0;min-height:2.75rem;padding:.5rem .375rem;border:1px solid #8b451380;border-radius:.5rem;color:#f7ecd8;background:#2d241c;font-size:1rem;}
</style>
