<script lang="ts">
 import type {CharacterForm} from '$lib/types';import {applyClass,normalizeBuild,type CharacterOption} from '$lib/rules/characterBuilder';
 import CatalogChoice from './CatalogChoice.svelte';import OptionReference from './OptionReference.svelte';
 export let form:CharacterForm;
 $: if(!form.build)form.build=normalizeBuild();
 $: if(form.build&&!form.build.class.key&&form.build.class.name.trim())form.class=form.build.class.name;
 function selectClass(option:CharacterOption){applyClass(form,option);form=form;}
 function selectSpecies(option:CharacterOption){if(!form.build)return;form.build.variant={key:'',name:''};const speed=option.features.find(f=>f.type==='SPEED'||f.name==='Speed')?.desc;const feet=Number(/(\d+)\s*(feet|ft)/i.exec(speed||'')?.[1])||Number(typeof option.mechanics?.speed==='number'?option.mechanics.speed:option.mechanics?.speed?.walk);if(feet>0&&feet<=120)form.speed=feet;form=form;}
</script>
{#if form.build}
 <div class="space-y-3">
  <label class="block text-sm font-semibold">Reglas del catálogo<select class="select select-bordered select-sm w-full mt-1" bind:value={form.build.edition}><option value="2024">D&D 2024</option><option value="2014">D&D 2014</option><option value="all">Todas las ediciones y A5E</option></select></label>
  <label class="block text-sm font-semibold">Origen del contenido<select aria-label="Origen del contenido" class="select select-bordered select-sm w-full mt-1" bind:value={form.build.scope}><option value="official">Oficial</option><option value="third-party">Terceros y A5E</option><option value="playtest">Material de pruebas</option><option value="homebrew">Homebrew</option><option value="all">Todos los orígenes</option></select></label>
  <p class="text-xs">La edición filtra el buscador. Cambiarla conserva tus selecciones; revisá la compatibilidad con tu DM. Las fichas distinguen textos abiertos, datos mecánicos y referencias. Cada opción indica su publicación; los detalles editoriales se consultan en la fuente enlazada.</p>
  <CatalogChoice label="Clase" type="class" edition={form.build.edition} scope={form.build.scope} bind:value={form.build.class} on:choose={e=>selectClass(e.detail)}/>
  <p class="text-xs">Elegir una clase aplica su nombre, dado de golpe y salvaciones. Las habilidades se eligen en Competencias.</p>
  {#if form.build.class.key}
   <OptionReference optionKey={form.build.class.key} level={form.level}/>
   {#if form.build.edition==='2024'&&form.level<3}<p class="text-xs">La subclase de 2024 se elige al nivel 3.{form.build.subclass.name?` Tenés ${form.build.subclass.name} guardada: revisala al cambiar el nivel.`:''}</p>
   {:else}<CatalogChoice label="Subclase" type="subclass" edition={form.build.edition} scope={form.build.scope} parentKey={form.build.class.key} bind:value={form.build.subclass}/>{/if}
  {:else}<CatalogChoice label="Subclase" type="subclass" edition={form.build.edition} scope={form.build.scope} bind:value={form.build.subclass}/>{/if}
  <CatalogChoice label="Especie / raza" type="species" edition={form.build.edition} scope={form.build.scope} bind:value={form.build.species} on:choose={e=>selectSpecies(e.detail)}/>
  {#if form.build.species.key}<CatalogChoice label="Variante / subespecie" type="subspecies" edition={form.build.edition} scope={form.build.scope} parentKey={form.build.species.key} bind:value={form.build.variant}/>{/if}
  <label class="block text-sm">Linaje o variante adicional<input class="input input-bordered input-sm w-full mt-1" bind:value={form.build.lineage} maxlength="200" placeholder="Ej.: alto elfo, ascendencia dracónica roja…"/></label>
  <p class="text-xs">Algunas variantes de 2024 están dentro de los rasgos de la especie. Registrá aquí la elección y sus efectos en Rasgos.</p>
  <CatalogChoice label="Trasfondo" type="background" edition={form.build.edition} scope={form.build.scope} bind:value={form.build.background}/>
 </div>
{/if}
