<script lang="ts">
  import { goto } from '$app/navigation';
</script>

<div class="min-h-screen flex flex-col">
  <!-- Navbar -->
  <div class="navbar-medieval">
    <div class="container mx-auto">
      <div class="flex-1">
        <button on:click={() => goto('/dashboard')} class="btn btn-ghost font-medieval text-secondary hover:text-accent">
          ← Volver al Grimorio
        </button>
      </div>
    </div>
  </div>

  <!-- Coming Soon Content -->
  <div class="flex-1 flex items-center justify-center p-4">
    <div class="card-parchment max-w-2xl w-full p-12 corner-ornament">
      <div class="text-center">
        <!-- Dado animado -->
        <div class="mb-8 relative inline-block">
          <div class="text-9xl animate-bounce">🎲</div>
          <div class="absolute inset-0 animate-ping opacity-20">
            <div class="text-9xl">🎲</div>
          </div>
        </div>
        
        <h1 class="text-5xl lg:text-6xl font-bold font-medieval text-neutral mb-6 title-ornament">
          Próximamente
        </h1>
        
        <div class="divider text-neutral/50">⚔️</div>
        
        <p class="text-2xl text-neutral/80 font-body mb-4">
          El destino se está escribiendo...
        </p>
        
        <p class="text-lg text-neutral/60 font-body italic mb-8 max-w-md mx-auto">
          Los antiguos textos están siendo descifrados. Pronto revelaremos las herramientas que necesitas para guiar a tus aventureros.
        </p>

        <div class="bg-gradient-to-r from-primary/20 to-accent/20 p-6 rounded-lg border-2 border-primary/30 mb-8">
          <h3 class="font-medieval text-xl text-neutral mb-3">🔮 Funciones en Preparación:</h3>
          <ul class="text-left space-y-2 text-neutral/70 font-body">
            <li>📊 Panel de gestión de sesiones</li>
            <li>🗺️ Mapas y locaciones</li>
            <li>👥 Gestión avanzada de personajes</li>
            <li>📝 Sistema de notas y registro</li>
            <li>🎭 Herramientas para el DM</li>
          </ul>
        </div>

        <button on:click={() => goto('/dashboard')} class="btn btn-dnd btn-lg">
          <span class="text-2xl">📖</span>
          <span class="font-medieval">Regresar al Grimorio</span>
        </button>

        <div class="mt-8">
          <p class="text-sm text-neutral/50 font-body italic">
            "La paciencia es la virtud del sabio aventurero..."
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes bounce {
    0%, 100% {
      transform: translateY(-25%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }

  .animate-bounce {
    animation: bounce 1s infinite;
  }
</style>