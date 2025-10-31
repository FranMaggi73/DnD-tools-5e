<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  $: error = $page.error;
  $: status = $page.status;
</script>

<div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-neutral via-base-100 to-neutral">
  <div class="card-parchment max-w-2xl w-full p-8 text-center corner-ornament">
    <!-- Icono según el tipo de error -->
    {#if status === 404}
      <div class="text-8xl mb-6">🗺️</div>
      <h1 class="text-4xl font-medieval text-error mb-4">
        Página No Encontrada
      </h1>
      <p class="text-xl text-neutral/70 font-body mb-2">
        Esta página no existe en tu grimorio...
      </p>
    {:else if status === 403}
      <div class="text-8xl mb-6">🛡️</div>
      <h1 class="text-4xl font-medieval text-error mb-4">
        Acceso Denegado
      </h1>
      <p class="text-xl text-neutral/70 font-body mb-2">
        No tienes permisos para acceder aquí
      </p>
    {:else}
      <div class="text-8xl mb-6">⚠️</div>
      <h1 class="text-4xl font-medieval text-error mb-4">
        ¡Algo salió mal!
      </h1>
      <p class="text-xl text-neutral/70 font-body mb-2">
        {error?.message || 'Ha ocurrido un error inesperado'}
      </p>
    {/if}
    
    {#if import.meta.env.DEV}
      <div class="bg-error/10 border-2 border-error/30 rounded-lg p-4 mt-4 text-left">
        <p class="text-xs font-mono text-error">
          {JSON.stringify(error, null, 2)}
        </p>
      </div>
    {/if}

    <div class="divider text-neutral/50 my-6">⚔️</div>
    
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button 
        on:click={() => goto('/dashboard')}
        class="btn btn-dnd"
      >
        <span class="text-xl">🏠</span>
        Volver al Dashboard
      </button>
      <button 
        on:click={() => window.location.reload()}
        class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
      >
        <span class="text-xl">🔄</span>
        Recargar Página
      </button>
    </div>

    <p class="text-sm text-neutral/50 italic mt-6 font-body">
      "Incluso los héroes más valientes encuentran obstáculos en su camino..."
    </p>
  </div>
</div>