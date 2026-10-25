<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { userStore } from '$lib/stores/authStore';
  import { api } from '$lib/api/api';

  let joining = false;
  let error = '';
  async function join() {
    joining = true;
    error = '';
    try {
      const result = await api.invitationLinks.join($page.params.code || '');
      await goto(`/campaigns/${result.campaign.id}`);
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'No se pudo aceptar la invitación.';
    } finally { joining = false; }
  }
</script>

<div class="max-w-lg mx-auto p-6">
  <div class="card-parchment p-8 text-center space-y-6">
    <h1 class="text-3xl font-medieval">Invitación a una campaña</h1>
    {#if $userStore}
      <p>Ingresaste como {$userStore.displayName || $userStore.email}. Aceptá la invitación para unirte.</p>
      <button class="btn btn-dnd w-full" disabled={joining} on:click={join}>
        {joining ? 'Uniéndote…' : 'Unirme a la campaña'}
      </button>
    {:else}
      <p>Iniciá sesión con Google para aceptar la invitación.</p>
      <a class="btn btn-dnd" href={`/login?next=${encodeURIComponent($page.url.pathname)}`}>Iniciar sesión</a>
    {/if}
    {#if error}<p role="alert" class="text-error">{error}</p>{/if}
  </div>
</div>
