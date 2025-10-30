<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { userStore } from '$lib/stores/authStore';
  import { api } from '$lib/api/api';
  import { headerTitle } from '$lib/stores/uiStore';
  import type { Campaign, Note } from '$lib/types';
  
  // Firestore real-time
  import { getFirestore, collection, query, where, onSnapshot, or } from 'firebase/firestore';
  import { app } from '$lib/firebase';

  headerTitle.set('📝 Notas');

  $: campaignId = $page.params.id || '';

  let campaign: Campaign | null = null;
  let notes: Note[] = [];
  let filteredNotes: Note[] = [];
  let loading = true;
  let error = '';

  // Filtros
  let searchQuery = '';
  let filterCategory = 'all';
  let filterShared = 'all'; // 'all', 'personal', 'shared'

  // Modales
  let showCreateModal = false;
  let showEditModal = false;
  let editingNote: Note | null = null;

  let form = {
    title: '',
    content: '',
    isShared: false,
    category: 'other',
    tags: [] as string[],
  };

  let tagInput = '';

  // Firestore listener
  let notesUnsubscribe: (() => void) | null = null;
  const db = getFirestore(app);

  $: isDM = campaign && $userStore && campaign.dmId === $userStore.uid;
  
  // Categorías disponibles
  const categories = [
    { value: 'session', label: '📅 Sesión', icon: '📅' },
    { value: 'npc', label: '👤 NPC', icon: '👤' },
    { value: 'location', label: '🗺️ Ubicación', icon: '🗺️' },
    { value: 'plot', label: '📖 Trama', icon: '📖' },
    { value: 'other', label: '📝 Otro', icon: '📝' },
  ];

  // Filtrado reactivo
  $: {
    filteredNotes = notes.filter(note => {
      // Búsqueda
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const matchTitle = note.title.toLowerCase().includes(search);
        const matchContent = note.content.toLowerCase().includes(search);
        const matchTags = note.tags.some(tag => tag.toLowerCase().includes(search));
        if (!matchTitle && !matchContent && !matchTags) return false;
      }

      // Categoría
      if (filterCategory !== 'all' && note.category !== filterCategory) return false;

      // Compartido
      if (filterShared === 'personal' && note.isShared) return false;
      if (filterShared === 'shared' && !note.isShared) return false;

      return true;
    });
  }

  onMount(async () => {
    await loadCampaign();
    setupNotesListener();
  });

  onDestroy(() => {
    if (notesUnsubscribe) notesUnsubscribe();
  });

  async function loadCampaign() {
    try {
      campaign = await api.getCampaign(campaignId);
    } catch (err: any) {
      error = err.message;
    }
  }

function setupNotesListener() {
  if (!$userStore) return;
  
  try {
    loading = true;
    
    // Array para almacenar notas de ambas queries
    let personalNotes: Note[] = [];
    let sharedNotes: Note[] = [];
    let loadedQueries = 0;
    
    const notesRef = collection(db, 'notes');
    
    // Query 1: Notas personales del usuario
    const personalQuery = query(
      notesRef,
      where('campaignId', '==', campaignId),
      where('authorId', '==', $userStore.uid),
      where('isShared', '==', false)
    );
    
    // Query 2: Notas compartidas de la campaña
    const sharedQuery = query(
      notesRef,
      where('campaignId', '==', campaignId),
      where('isShared', '==', true)
    );
    
    // Listener para notas personales
    const unsubPersonal = onSnapshot(
      personalQuery,
      (snapshot) => {
        personalNotes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Note[];
        
        // Combinar y ordenar
        combineNotes();
      },
      (err) => {
        console.error('Error en listener de notas personales:', err);
        error = err.message;
        loading = false;
      }
    );
    
    // Listener para notas compartidas
    const unsubShared = onSnapshot(
      sharedQuery,
      (snapshot) => {
        sharedNotes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Note[];
        
        // Combinar y ordenar
        combineNotes();
      },
      (err) => {
        console.error('Error en listener de notas compartidas:', err);
        error = err.message;
        loading = false;
      }
    );
    
    function combineNotes() {
      loadedQueries++;
      
      // Combinar arrays eliminando duplicados por ID
      const allNotes = [...personalNotes, ...sharedNotes];
      const uniqueNotes = Array.from(
        new Map(allNotes.map(note => [note.id, note])).values()
      );
      
      // Ordenar por fecha (más recientes primero)
      notes = uniqueNotes.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      // Marcar como loaded después de ambas queries
      if (loadedQueries >= 2) {
        loading = false;
      }
    }
    
    // Función para limpiar ambos listeners
    notesUnsubscribe = () => {
      unsubPersonal();
      unsubShared();
    };
    
  } catch (err: any) {
    error = err.message;
    loading = false;
  }
}

  function openCreateModal() {
    resetForm();
    showCreateModal = true;
  }

  function openEditModal(note: Note) {
    editingNote = note;
    form = {
      title: note.title,
      content: note.content,
      isShared: note.isShared,
      category: note.category,
      tags: [...note.tags],
    };
    showEditModal = true;
  }

  function resetForm() {
    form = {
      title: '',
      content: '',
      isShared: false,
      category: 'other',
      tags: [],
    };
    tagInput = '';
  }

  function addTag() {
    if (!tagInput.trim()) return;
    const tag = tagInput.trim().toLowerCase();
    if (!form.tags.includes(tag)) {
      form.tags = [...form.tags, tag];
    }
    tagInput = '';
  }

  function removeTag(tag: string) {
    form.tags = form.tags.filter(t => t !== tag);
  }

  async function handleCreate() {
    if (!form.title.trim()) return;
    
    try {
      await api.createNote(campaignId, form);
      showCreateModal = false;
      resetForm();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleUpdate() {
    if (!editingNote || !form.title.trim()) return;
    
    try {
      await api.updateNote(editingNote.id, form);
      showEditModal = false;
      editingNote = null;
      resetForm();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleDelete(note: Note) {
    if (!confirm(`¿Eliminar la nota "${note.title}"?`)) return;
    
    try {
      await api.deleteNote(note.id);
    } catch (err: any) {
      error = err.message;
    }
  }

  function getCategoryIcon(category: string): string {
    return categories.find(c => c.value === category)?.icon || '📝';
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<div class="min-h-screen p-4 md:p-6">
  <div class="container mx-auto max-w-7xl">
    
    <!-- Header -->
    <div class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl md:text-4xl font-bold text-secondary title-ornament">
          📝 Notas de Campaña
        </h1>
        <p class="text-base-content/70 font-body italic mt-2">
          {isDM ? 'Gestiona tus notas personales y compartidas' : 'Tus notas personales de aventurero'}
        </p>
      </div>
      
      <button 
        on:click={openCreateModal}
        class="btn btn-dnd"
      >
        <span class="text-xl">➕</span>
        Nueva Nota
      </button>
    </div>

    {#if error}
      <div class="alert alert-error mb-6">
        <span>{error}</span>
        <button class="btn btn-sm" on:click={() => error = ''}>✕</button>
      </div>
    {/if}

    {#if loading}
      <div class="flex justify-center py-20">
        <span class="loading loading-spinner loading-lg text-secondary"></span>
      </div>
    {:else}
      
      <!-- Filtros -->
      <div class="card-parchment p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <!-- Búsqueda -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">🔍 Buscar</span>
            </label>
            <input 
              type="text" 
              bind:value={searchQuery}
              placeholder="Título, contenido o etiquetas..."
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            />
          </div>

          <!-- Categoría -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Categoría</span>
            </label>
            <select 
              bind:value={filterCategory}
              class="select select-bordered bg-[#2d241c] text-base-content border-primary/50"
            >
              <option value="all">Todas</option>
              {#each categories as cat}
                <option value={cat.value}>{cat.label}</option>
              {/each}
            </select>
          </div>

          <!-- Tipo -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Tipo</span>
            </label>
            <select 
              bind:value={filterShared}
              class="select select-bordered bg-[#2d241c] text-base-content border-primary/50"
            >
              <option value="all">Todas</option>
              <option value="personal">Personales</option>
              <option value="shared">Compartidas</option>
            </select>
          </div>
        </div>

        <!-- Contador -->
        <div class="mt-3 text-sm text-neutral/60 font-body text-center">
          Mostrando {filteredNotes.length} de {notes.length} notas
        </div>
      </div>

      <!-- Grid de Notas -->
      {#if filteredNotes.length === 0}
        <div class="card-parchment p-12 text-center">
          <div class="text-6xl mb-4">📝</div>
          <h3 class="text-2xl font-medieval text-neutral mb-2">
            {notes.length === 0 ? 'Sin notas aún' : 'No se encontraron notas'}
          </h3>
          <p class="text-neutral/70 font-body">
            {notes.length === 0 
              ? 'Crea tu primera nota para comenzar' 
              : 'Intenta ajustar los filtros de búsqueda'}
          </p>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each filteredNotes as note}
            <div class="card-parchment corner-ornament hover:shadow-xl transition-all">
              <div class="card-body p-4">
                
                <!-- Header con badges -->
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <span class="text-2xl">{getCategoryIcon(note.category)}</span>
                    <h3 class="font-medieval text-lg text-neutral font-bold truncate">
                      {note.title}
                    </h3>
                  </div>
                  
                  <div class="dropdown dropdown-end flex-shrink-0">
                    <label tabindex="0" class="btn btn-ghost btn-xs btn-circle">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </label>
                    <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-neutral rounded-box w-40 border-2 border-secondary">
                      <li><a on:click={() => openEditModal(note)} class="text-secondary">✏️ Editar</a></li>
                      <li><a on:click={() => handleDelete(note)} class="text-error">🗑️ Eliminar</a></li>
                    </ul>
                  </div>
                </div>

                <!-- Badges -->
                <div class="flex flex-wrap gap-1 mb-3">
                  {#if note.isShared}
                    <div class="badge badge-success badge-sm">🌐 Compartida</div>
                  {:else}
                    <div class="badge badge-info badge-sm">🔒 Personal</div>
                  {/if}
                  
                  {#if note.authorId !== $userStore?.uid}
                    <div class="badge badge-warning badge-sm">👑 DM</div>
                  {/if}
                </div>

                <!-- Content Preview -->
                <div class="text-sm text-neutral/80 font-body mb-3 line-clamp-3">
                  {note.content || 'Sin contenido'}
                </div>

                <!-- Tags -->
                {#if note.tags && note.tags.length > 0}
                  <div class="flex flex-wrap gap-1 mb-3">
                    {#each note.tags.slice(0, 3) as tag}
                      <div class="badge badge-outline badge-xs">{tag}</div>
                    {/each}
                    {#if note.tags.length > 3}
                      <div class="badge badge-outline badge-xs">+{note.tags.length - 3}</div>
                    {/if}
                  </div>
                {/if}

                <!-- Footer -->
                <div class="text-xs text-neutral/60 font-body">
                  <div>✍️ {note.authorName}</div>
                  <div>🕐 {formatDate(note.updatedAt)}</div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>

<!-- Modal Crear Nota -->
{#if showCreateModal}
  <div class="modal modal-open z-50">
    <div class="card-parchment border-4 border-secondary w-11/12 max-w-3xl relative max-h-[90vh] flex flex-col">
      
      <!-- Header -->
      <div class="p-4 border-b-2 border-secondary flex-shrink-0">
        <button 
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
          on:click={() => { showCreateModal = false; resetForm(); }}
        >✕</button>
        
        <h3 class="font-bold text-2xl font-medieval text-neutral text-center">
          ✨ Nueva Nota
        </h3>
      </div>

      <!-- Content Scrollable -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        
        <!-- Título -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medieval text-neutral text-lg">Título *</span>
          </label>
          <input 
            type="text" 
            bind:value={form.title}
            placeholder="Ej: Encuentro con el dragón rojo"
            class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            required
          />
        </div>

        <!-- Categoría y Compartido -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Categoría</span>
            </label>
            <select 
              bind:value={form.category}
              class="select select-bordered bg-[#2d241c] text-base-content border-primary/50"
            >
              {#each categories as cat}
                <option value={cat.value}>{cat.label}</option>
              {/each}
            </select>
          </div>

          {#if isDM}
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  bind:checked={form.isShared}
                  class="checkbox checkbox-secondary"
                />
                <span class="label-text font-medieval text-neutral">
                  🌐 Compartir con jugadores
                </span>
              </label>
              <label class="label">
                <span class="label-text-alt text-neutral/60 italic text-xs">
                  Los jugadores podrán ver esta nota
                </span>
              </label>
            </div>
          {/if}
        </div>

        <!-- Contenido -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medieval text-neutral text-lg">Contenido</span>
          </label>
          <textarea 
            bind:value={form.content}
            placeholder="Escribe aquí el contenido de tu nota..."
            class="textarea textarea-bordered bg-[#2d241c] text-base-content border-primary/50 h-40"
          ></textarea>
        </div>

        <!-- Tags -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medieval text-neutral">🏷️ Etiquetas</span>
          </label>
          <div class="flex gap-2">
            <input 
              type="text" 
              bind:value={tagInput}
              on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Agregar etiqueta..."
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 flex-1"
            />
            <button 
              type="button"
              on:click={addTag}
              class="btn btn-secondary"
            >
              ➕
            </button>
          </div>
          
          {#if form.tags.length > 0}
            <div class="flex flex-wrap gap-2 mt-2">
              {#each form.tags as tag}
                <div class="badge badge-lg gap-2">
                  {tag}
                  <button 
                    type="button"
                    on:click={() => removeTag(tag)}
                    class="btn btn-xs btn-circle btn-ghost"
                  >✕</button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-center gap-4 p-4 border-t-2 border-secondary flex-shrink-0">
        <button 
          on:click={() => { showCreateModal = false; resetForm(); }}
          class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
        >
          Cancelar
        </button>
        <button 
          on:click={handleCreate}
          class="btn btn-dnd"
          disabled={!form.title.trim()}
        >
          <span class="text-xl">💾</span>
          Crear Nota
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Modal Editar Nota -->
{#if showEditModal && editingNote}
  <div class="modal modal-open z-50">
    <div class="card-parchment border-4 border-secondary w-11/12 max-w-3xl relative max-h-[90vh] flex flex-col">
      
      <!-- Header -->
      <div class="p-4 border-b-2 border-secondary flex-shrink-0">
        <button 
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" 
          on:click={() => { showEditModal = false; editingNote = null; resetForm(); }}
        >✕</button>
        
        <h3 class="font-bold text-2xl font-medieval text-neutral text-center">
          ✏️ Editar Nota
        </h3>
      </div>

      <!-- Content Scrollable -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        
        <!-- Título -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medieval text-neutral text-lg">Título *</span>
          </label>
          <input 
            type="text" 
            bind:value={form.title}
            placeholder="Ej: Encuentro con el dragón rojo"
            class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"
            required
          />
        </div>

        <!-- Categoría y Compartido -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medieval text-neutral">Categoría</span>
            </label>
            <select 
              bind:value={form.category}
              class="select select-bordered bg-[#2d241c] text-base-content border-primary/50"
            >
              {#each categories as cat}
                <option value={cat.value}>{cat.label}</option>
              {/each}
            </select>
          </div>

          {#if isDM}
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-3">
                <input 
                  type="checkbox" 
                  bind:checked={form.isShared}
                  class="checkbox checkbox-secondary"
                />
                <span class="label-text font-medieval text-neutral">
                  🌐 Compartir con jugadores
                </span>
              </label>
              <label class="label">
                <span class="label-text-alt text-neutral/60 italic text-xs">
                  Los jugadores podrán ver esta nota
                </span>
              </label>
            </div>
          {/if}
        </div>

        <!-- Contenido -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medieval text-neutral text-lg">Contenido</span>
          </label>
          <textarea 
            bind:value={form.content}
            placeholder="Escribe aquí el contenido de tu nota..."
            class="textarea textarea-bordered bg-[#2d241c] text-base-content border-primary/50 h-40"
          ></textarea>
        </div>

        <!-- Tags -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medieval text-neutral">🏷️ Etiquetas</span>
          </label>
          <div class="flex gap-2">
            <input 
              type="text" 
              bind:value={tagInput}
              on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Agregar etiqueta..."
              class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 flex-1"
            />
            <button 
              type="button"
              on:click={addTag}
              class="btn btn-secondary"
            >
              ➕
            </button>
          </div>
          
          {#if form.tags.length > 0}
            <div class="flex flex-wrap gap-2 mt-2">
              {#each form.tags as tag}
                <div class="badge badge-lg gap-2">
                  {tag}
                  <button 
                    type="button"
                    on:click={() => removeTag(tag)}
                    class="btn btn-xs btn-circle btn-ghost"
                  >✕</button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-center gap-4 p-4 border-t-2 border-secondary flex-shrink-0">
        <button 
          on:click={() => { showEditModal = false; editingNote = null; resetForm(); }}
          class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval"
        >
          Cancelar
        </button>
        <button 
          on:click={handleUpdate}
          class="btn btn-dnd"
          disabled={!form.title.trim()}
        >
          <span class="text-xl">💾</span>
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>