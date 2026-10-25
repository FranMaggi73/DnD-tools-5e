<script lang="ts">
  import {statusLabel} from '$lib/utils/catalogLabels';
  import { onMount } from 'svelte';
  import { catalogApi, type CatalogCredits, type CatalogManifest } from '$lib/api/catalog';
  let credits:CatalogCredits|null=null;
  let manifest:CatalogManifest|null=null;
  let error='';
  function safeLink(value='') {
    try {const url=new URL(/^https?:/i.test(value)?value:`https://${value}`);return ['http:','https:'].includes(url.protocol)?url.href:undefined;} catch{return undefined;}
  }
  async function load() {
    error='';
    try { [manifest,credits]=await Promise.all([catalogApi.manifest(),catalogApi.credits()]); }
    catch(cause) {error=cause instanceof Error?cause.message:'No se pudieron cargar las fuentes.';}
  }
  onMount(load);
</script>

<svelte:head><title>Fuentes y licencias · DnD Tools</title></svelte:head>
<main class="p-3 sm:p-6 max-w-4xl mx-auto space-y-4 pb-8">
  <h1 class="font-medieval text-2xl text-secondary">📚 Fuentes y licencias del catálogo</h1>
  {#if error}<p class="text-error" role="alert">{error}</p><button class="btn" on:click={load}>Reintentar</button>
  {:else if !credits || !manifest}<p role="status">Cargando fuentes…</p>
  {:else}
    <section class="card-parchment p-3 sm:p-5 space-y-3 text-neutral">
      <p>El catálogo aloja {manifest.monsters.count.toLocaleString('es-AR')} monstruos y {manifest.items.count.toLocaleString('es-AR')} objetos. También incluye {manifest.options?.count || 0} opciones de personaje y {manifest.spells?.count || 0} hechizos. Las publicaciones y ediciones se identifican en cada resultado.</p>
      <p>Los textos proceden de <a class="link" href="https://open5e.com">Open5e</a> y sus fuentes. Los derechos sobre el contenido pertenecen a sus respectivos autores. El catálogo y sus licencias se distribuyen por separado del código de la aplicación.</p>
      <p class="text-sm">{credits.modifications}</p>
      {#if credits.referenceRevision}<p class="text-xs break-all">Revisión de referencias: {credits.referenceRevision}</p>{/if}
      <a class="link text-primary" href={manifest.notice}>Leer o descargar todos los avisos y licencias</a>
    </section>
    {#if manifest.audit}<section class="card-parchment p-3 sm:p-5 text-neutral space-y-2"><h2 class="font-medieval font-bold">Verificación de datos</h2><p class="text-sm">{manifest.audit.mechanicalChecks} comparaciones de dados de golpe, progresiones y niveles de hechizos. {manifest.audit.conflicts.length} discrepancias pendientes en esos controles. Esto no verifica automáticamente el texto ni todas las interacciones de rasgos.</p><p class="text-sm">{manifest.audit.excludedReferences} referencias apartadas por clasificación, compatibilidad o datos insuficientes.</p>{#each manifest.audit.corrections as correction}<p class="text-sm">{correction.key}: corrección de {correction.field}. <a class="link" href={correction.source} target="_blank" rel="noreferrer">Reglas oficiales</a></p>{/each}</section>{/if}
    {#each credits.sources as source}
      <section id={source.key} class="card-parchment p-3 sm:p-5 space-y-2 text-neutral scroll-mt-24">
        <h2 class="font-medieval font-bold text-lg">{source.display_name || source.name}</h2>
        <p class="text-sm">{statusLabel(source.status)} · {source.published||''} · {source.contentMode==='mechanics'?'Datos mecánicos y referencias':'Texto abierto'}</p>
        <p class="text-sm">{source.gamesystem?.name || '5e'} · {source.author || ''}</p>
        {#if safeLink(source.permalink)}<a class="link text-sm text-primary" href={safeLink(source.permalink)}>Publicación original</a>{/if}
        <div class="flex flex-wrap gap-1">{#each source.licenses as license}<a href={`#license-${license.key}`} class="badge badge-outline h-auto py-1">{license.name}</a>{/each}</div>
        {#if source.attribution}<details><summary class="cursor-pointer text-sm font-semibold py-2">Atribución y avisos de copyright</summary><p class="whitespace-pre-wrap break-words text-sm">{source.attribution}</p></details>{/if}
      </section>
    {/each}
    <section class="card-parchment p-3 sm:p-5 text-neutral space-y-3">
      <h2 class="font-medieval text-xl">Avisos de copyright adicionales</h2>
      {#each credits.legacyCopyrightNotices as notice}<details><summary class="cursor-pointer py-2 font-semibold">{notice.title}</summary><p class="whitespace-pre-wrap break-words text-sm">{notice.copyright}</p></details>{/each}
    </section>
    {#each credits.licenses as license}
      <section id={`license-${license.key}`} class="card-parchment p-3 sm:p-5 text-neutral scroll-mt-24">
        <details><summary class="cursor-pointer font-medieval text-lg">{license.name} · texto completo</summary><p class="whitespace-pre-wrap break-words text-sm mt-3">{license.desc}</p></details>
      </section>
    {/each}
  {/if}
</main>
