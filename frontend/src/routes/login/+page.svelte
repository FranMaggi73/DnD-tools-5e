<script lang="ts">
  import { signInWithPopup, signOut } from 'firebase/auth';
  import { auth, googleProvider } from '$lib/firebase';
  import { userStore } from '$lib/stores/authStore';
  import { goto } from '$app/navigation';

  let error = '';

  async function handleGoogleLogin() {
    try {
      error = '';
      await signInWithPopup(auth, googleProvider);
      goto('/dashboard');
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (err: any) {
      error = err.message;
    }
  }

  $: if ($userStore && typeof window !== 'undefined') {
    goto('/dashboard');
  }
</script>

<div class="hero min-h-screen relative overflow-hidden">
  <!-- Fondo decorativo -->
  <div class="absolute inset-0 bg-gradient-to-br from-neutral via-base-100 to-neutral opacity-90"></div>
  
  <!-- Decoraciones de esquina -->
  <div class="absolute top-0 left-0 w-64 h-64 border-l-4 border-t-4 border-secondary opacity-30"></div>
  <div class="absolute bottom-0 right-0 w-64 h-64 border-r-4 border-b-4 border-secondary opacity-30"></div>

  <div class="hero-content text-center relative z-10">
    <div class="max-w-2xl">
      <!-- Logo/Título principal -->
      <div class="mb-8">
        <div class="text-8xl mb-4">🎲</div>
        <h1 class="text-6xl font-bold font-medieval text-secondary mb-4 text-shadow title-ornament">
          Grimorio de Aventuras
        </h1>
        <p class="text-xl text-base-content/80 font-body italic">
          "Donde las leyendas cobran vida"
        </p>
      </div>
      
      {#if !$userStore}
        <div class="card-parchment p-8 corner-ornament">
          <p class="text-lg mb-6 text-neutral font-body">
            Accede a tu grimorio personal y gestiona tus campañas épicas de D&D
          </p>
          
          <div class="divider text-neutral/50">⚔️</div>

          <button 
            on:click={handleGoogleLogin}
            class="btn btn-dnd btn-lg gap-3 w-full"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span class="font-medieval text-lg">Entrar con Google</span>
          </button>

          <p class="mt-6 text-sm text-neutral/60 italic font-body">
            Únete a miles de Dungeon Masters en sus aventuras
          </p>
        </div>
      {:else}
        <div class="card-parchment p-8 corner-ornament">
          <div class="flex flex-col items-center gap-4">
            <div class="avatar ring-4 ring-secondary ring-offset-4 ring-offset-[#f4e4c1]">
              <div class="w-24 rounded-full">
                <img src={$userStore.photoURL || ''} alt={$userStore.displayName || ''} />
              </div>
            </div>
            
            <div>
              <h2 class="text-3xl font-bold font-medieval text-neutral">{$userStore.displayName}</h2>
              <p class="text-sm text-neutral/70 font-body">{$userStore.email}</p>
            </div>

            <div class="divider text-neutral/50">⚔️</div>
            
            <div class="flex flex-col gap-3 w-full">
              <button 
                on:click={() => goto('/dashboard')}
                class="btn btn-dnd btn-lg w-full"
              >
                <span class="text-xl">📖</span>
                <span class="font-medieval">Abrir Grimorio</span>
              </button>
              <button 
                on:click={handleLogout}
                class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval w-full"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      {/if}

      {#if error}
        <div class="alert bg-error/20 border-2 border-error mt-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-error shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-body">{error}</span>
        </div>
      {/if}

      <div class="mt-12">
        <p class="text-xs text-base-content/50 font-body italic">
          "En cada tirada de dados, el destino se escribe..."
        </p>
      </div>
    </div>
  </div>
</div>