<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { userStore } from '$lib/stores/authStore';
  import { api } from '$lib/api/api';
  import { headerTitle } from '$lib/stores/uiStore';
  import type { Campaign, Note } from '$lib/types';
  // Firestore real-time
  import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
  import { app } from '$lib/firebase';

  headerTitle.set('📝 Notas');

  import { 
    validateNoteTitle, 
    validateNoteContent, 
    validateNoteTags,
    validateAll 
  } from '$lib/utils/validation';

  // Estados de validación
  let validationErrors = {
    title: '',
    content: '',
    tags: ''
  };

  let touched = {
    title: false,
    content: false,
    tags: false
  };

  // Validación reactiva
  $: if (touched.title) {
    const result = validateNoteTitle(form.title);
    validationErrors.title = result.valid ? '' : result.error || '';
  }

  $: if (touched.content) {
    const result = validateNoteContent(form.content);
    validationErrors.content = result.valid ? '' : result.error || '';
  }

  $: if (touched.tags) {
    const result = validateNoteTags(form.tags);
    validationErrors.tags = result.valid ? '' : result.error || '';
  }

  $: isFormValid = !validationErrors.title && !validationErrors.content && 
                   !validationErrors.tags && form.title.trim();

  function handleBlur(field: keyof typeof touched) {
    touched[field] = true;
  }

  function validateNoteForm(): boolean {
    // Marcar todos como tocados
    Object.keys(touched).forEach(key => {
      touched[key as keyof typeof touched] = true;
    });

    const titleValidation = validateNoteTitle(form.title);
    const contentValidation = validateNoteContent(form.content);
    const tagsValidation = validateNoteTags(form.tags);

    const validation = validateAll(titleValidation, contentValidation, tagsValidation);

    if (!validation.valid) {
      validationErrors.title = titleValidation.error || '';
      validationErrors.content = contentValidation.error || '';
      validationErrors.tags = tagsValidation.error || '';
      return false;
    }

    return true;
  }

  $: campaignId = $page.params.id || '';

  let campaign: Campaign | null = null;
  let notes: Note[] = [];
  let filteredNotes: Note[] = [];
  let loading = true;
  let error = '';
  let isAddingTag = false; 

  // Filtros
  let searchQuery = '';
  let filterCategory = 'all';
  let filterShared = 'all';

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
      
      let personalNotes: Note[] = [];
      let sharedNotes: Note[] = [];
      let loadedPersonal = false;
      let loadedShared = false;
      
      const notesRef = collection(db, 'notes');
      
      const personalQuery = query(
        notesRef,
        where('campaignId', '==', campaignId),
        where('authorId', '==', $userStore.uid),
        where('isShared', '==', false)
      );
      
      const sharedQuery = query(
        notesRef,
        where('campaignId', '==', campaignId),
        where('isShared', '==', true)
      );
      
      const unsubPersonal = onSnapshot(
        personalQuery,
        (snapshot) => {
          personalNotes = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            } as Note;
          });
          
          loadedPersonal = true;
          combineNotes();
        },
        (err) => {
          console.error('Error en listener de notas personales:', err);
          error = err.message;
          loading = false;
        }
      );
      
      const unsubShared = onSnapshot(
        sharedQuery,
        (snapshot) => {
          sharedNotes = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            } as Note;
          });
          
          loadedShared = true;
          combineNotes();
        },
        (err) => {
          console.error('Error en listener de notas compartidas:', err);
          error = err.message;
          loading = false;
        }
      );
      
      function combineNotes() {
        if (loadedPersonal && loadedShared) {
          const allNotes = [...personalNotes, ...sharedNotes];
          const uniqueNotes = Array.from(
            new Map(allNotes.map(note => [note.id, note])).values()
          );
          
          notes = uniqueNotes.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          
          loading = false;
        }
      }
      
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
    
    // Reset validaciones
    Object.keys(touched).forEach(key => {
      touched[key as keyof typeof touched] = false;
    });
    Object.keys(validationErrors).forEach(key => {
      validationErrors[key as keyof typeof validationErrors] = '';
    });
  }

  function addTag() {
  // Prevenir múltiples ejecuciones simultáneas
  if (isAddingTag) {
    console.log('Tag addition already in progress');
    return;
  }

  const trimmedTag = tagInput.trim().toLowerCase();
  
  // Validaciones previas
  if (!trimmedTag) {
    return;
  }
  
  // ✅ VERIFICAR DUPLICADO ANTES DE VALIDAR
  if (form.tags.includes(trimmedTag)) {
    validationErrors.tags = `La etiqueta "${trimmedTag}" ya existe`;
    touched.tags = true;
    tagInput = ''; // Limpiar input
    return;
  }
  
  isAddingTag = true; // Bloquear
  
  try {
    // Validar antes de agregar
    const newTags = [...form.tags, trimmedTag];
    const validation = validateNoteTags(newTags);
    
    if (!validation.valid) {
      validationErrors.tags = validation.error || '';
      touched.tags = true;
      return;
    }
    
    // Agregar tag si pasó todas las validaciones
    form.tags = newTags;
    validationErrors.tags = '';
    tagInput = '';
    
  } finally {
    // Siempre desbloquear después de 100ms
    setTimeout(() => {
      isAddingTag = false;
    }, 100);
  }
}
  function removeTag(tag: string) {
    form.tags = form.tags.filter(t => t !== tag);
  }

  async function handleCreate() {
    if (!validateNoteForm()) return;
    
    try {
      await api.createNote(campaignId, form);
      showCreateModal = false;
      resetForm();
    } catch (err: any) {
      error = err.message;
    }
  }

  async function handleUpdate() {
    if (!editingNote || !validateNoteForm()) return;
    
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
    try {
      const date = new Date(dateStr);
      
      if (isNaN(date.getTime())) {
        return 'Fecha no disponible';
      }
      
      return date.toLocaleDateString('es', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Error formateando fecha:', err);
      return 'Fecha no disponible';
    }
  }
</script>

<div class="min-h-screen p-4 md:p-6">
  <div class="container mx-auto max-w-7xl">
    
    <!-- Header -->
    <div class="mb-6">
      <div class="relative">
        <button 
          on:click={openCreateModal}
          class="btn btn-dnd hidden sm:block absolute right-0 top-0"
        >
          <span class="text-xl">➕</span>
          Nueva Nota
        </button>
        
        <div class="text-center">
          <h1 class="text-3xl md:text-4xl font-bold text-secondary title-ornament">
            📝 Notas
          </h1>
          <p class="text-base-content/70 font-body italic mt-2">
            {isDM ? 'Gestiona tus notas personales y compartidas' : 'Tus notas personales de aventurero'}
          </p>
        </div>
      </div>
      
      <div class="flex justify-center mt-4 sm:hidden">
        <button 
          on:click={openCreateModal}
          class="btn btn-dnd"
        >
          <span class="text-xl">➕</span>
          Nueva Nota
        </button>
      </div>
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

                <div class="text-sm text-neutral/80 font-body mb-3 line-clamp-3">
                  {note.content || 'Sin contenido'}
                </div>

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
  <div class="modal modal-open z-50" on:click={() => { showCreateModal = false; resetForm(); }}>
    <div 
      class="card-parchment border-2 sm:border-4 border-secondary 
             w-[95vw] sm:w-[90vw] md:w-3/4 lg:w-2/3 xl:w-1/2 max-w-3xl 
             relative max-h-[92vh] flex flex-col m-2 sm:m-4"
      on:click|stopPropagation
    >
      
      <div class="p-3 sm:p-4 md:p-5 border-b-2 border-secondary flex-shrink-0 bg-gradient-to-b from-[#f4e4c1] to-transparent">
        <button 
          class="btn btn-xs sm:btn-sm btn-circle btn-ghost absolute right-2 top-2 hover:bg-error/20" 
          on:click={() => { showCreateModal = false; resetForm(); }}
        >✕</button>
        
        <h3 class="font-bold text-xl sm:text-2xl md:text-3xl font-medieval text-neutral text-center pr-8">
          ✨ Nueva Nota
        </h3>
      </div>

      <div class="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4 custom-scrollbar">
        
        <div class="form-control">
          <label class="label pb-1">
            <span class="label-text font-medieval text-neutral text-sm sm:text-base md:text-lg">
              Título <span class="text-error">*</span>
            </span>
          </label>
          <input 
            type="text" 
            bind:value={form.title}
            on:blur={() => handleBlur('title')}
            placeholder="Ej: Encuentro con el dragón rojo"
            class="input input-sm sm:input-md input-bordered bg-[#2d241c] text-base-content border-primary/50 
                   focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50
                   {validationErrors.title ? 'border-error' : ''}"
            required
            autofocus
          />
          {#if validationErrors.title}
            <label class="label">
              <span class="label-text-alt text-error">{validationErrors.title}</span>
            </label>
          {/if}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div class="form-control">
            <label class="label pb-1">
              <span class="label-text font-medieval text-neutral text-sm sm:text-base">Categoría</span>
            </label>
            <select 
              bind:value={form.category}
              class="select select-sm sm:select-md select-bordered bg-[#2d241c] text-base-content border-primary/50
                     focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50"
            >
              {#each categories as cat}
                <option value={cat.value}>{cat.label}</option>
              {/each}
            </select>
          </div>

          {#if isDM}
            <div class="form-control justify-center">
              <label class="label cursor-pointer justify-start gap-2 sm:gap-3 pb-1">
                <input 
                  type="checkbox" 
                  bind:checked={form.isShared}
                  class="checkbox checkbox-secondary checkbox-sm sm:checkbox-md"
                />
                <div class="flex flex-col">
                  <span class="label-text font-medieval text-neutral text-sm sm:text-base">
                    🌐 Compartir con jugadores
                  </span>
                  <span class="label-text-alt text-neutral/60 italic text-xs">
                    Los jugadores podrán ver esta nota
                  </span>
                </div>
              </label>
            </div>
          {/if}
        </div>

        <div class="form-control">
          <label class="label pb-1">
            <span class="label-text font-medieval text-neutral text-sm sm:text-base md:text-lg">Contenido</span>
          </label>
          <textarea 
            bind:value={form.content}
            on:blur={() => handleBlur('content')}
            placeholder="Escribe aquí el contenido de tu nota..."
            class="textarea textarea-sm sm:textarea-md textarea-bordered bg-[#2d241c] text-base-content border-primary/50 
                   h-32 sm:h-40 md:h-48 resize-none
                   focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50
                   {validationErrors.content ? 'border-error' : ''}"
          ></textarea>
          {#if validationErrors.content}
            <label class="label">
              <span class="label-text-alt text-error">{validationErrors.content}</span>
            </label>
          {:else}
            <label class="label pt-1">
              <span class="label-text-alt text-neutral/60 italic text-xs">
                Puedes usar este espacio para escribir detalles extensos
              </span>
            </label>
          {/if}
        </div>

        <div class="form-control">
          <label class="label pb-1">
            <span class="label-text font-medieval text-neutral text-sm sm:text-base">🏷️ Etiquetas</span>
          </label>
          <div class="flex gap-2">
            <input 
              type="text" 
              bind:value={tagInput}
              on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Presiona Enter para agregar..."
              class="input input-sm sm:input-md input-bordered bg-[#2d241c] text-base-content border-primary/50 flex-1
                     focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
            <button 
              type="button"
              on:click={addTag}
              class="btn btn-sm sm:btn-md btn-secondary flex-shrink-0"
              disabled={!tagInput.trim()}
            >
              ➕
            </button>
          </div>
          
          {#if validationErrors.tags}
            <label class="label">
              <span class="label-text-alt text-error">{validationErrors.tags}</span>
            </label>
          {/if}
          
          {#if form.tags.length > 0}
            <div class="flex flex-wrap gap-1.5 sm:gap-2 mt-2 p-2 bg-neutral/10 rounded-lg border border-primary/20">
              {#each form.tags as tag}
                <div class="badge badge-md sm:badge-lg gap-1.5 sm:gap-2 bg-secondary/20 border-secondary/40">
                  <span class="text-xs sm:text-sm">{tag}</span>
                  <button 
                    type="button"
                    on:click={() => removeTag(tag)}
                    class="btn btn-xs btn-circle btn-ghost hover:bg-error hover:text-white"
                  >✕</button>
                </div>
              {/each}
            </div>
          {:else if !validationErrors.tags}
            <label class="label pt-1">
              <span class="label-text-alt text-neutral/60 italic text-xs">
                Agrega etiquetas para organizar mejor tus notas
              </span>
            </label>
          {/if}
        </div>
      </div>

      <div class="flex flex-col-reverse sm:flex-row justify-center gap-2 sm:gap-4 p-3 sm:p-4 md:p-5 
                  border-t-2 border-secondary flex-shrink-0 bg-gradient-to-t from-[#f4e4c1] to-transparent">
        <button 
          on:click={() => { showCreateModal = false; resetForm(); }}
          class="btn btn-sm sm:btn-md btn-outline border-2 border-neutral text-neutral 
                 hover:bg-neutral hover:text-secondary font-medieval w-full sm:w-auto"
        >
          Cancelar
        </button>
        <button 
          on:click={handleCreate}
          class="btn btn-sm sm:btn-md btn-dnd w-full sm:w-auto"
          disabled={!isFormValid}
        >
          <span class="text-lg sm:text-xl">💾</span>
          Crear Nota
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Modal Editar Nota -->
{#if showEditModal && editingNote}
  <div class="modal modal-open z-50" on:click={() => { showEditModal = false; editingNote = null; resetForm(); }}>
    <div 
      class="card-parchment border-2 sm:border-4 border-secondary 
             w-[95vw] sm:w-[90vw] md:w-3/4 lg:w-2/3 xl:w-1/2 max-w-3xl 
             relative max-h-[92vh] flex flex-col m-2 sm:m-4"
      on:click|stopPropagation
    >
      
      <div class="p-3 sm:p-4 md:p-5 border-b-2 border-secondary flex-shrink-0 bg-gradient-to-b from-[#f4e4c1] to-transparent">
        <button 
          class="btn btn-xs sm:btn-sm btn-circle btn-ghost absolute right-2 top-2 hover:bg-error/20" 
          on:click={() => { showEditModal = false; editingNote = null; resetForm(); }}
        >✕</button>
        
        <h3 class="font-bold text-xl sm:text-2xl md:text-3xl font-medieval text-neutral text-center pr-8">
          ✏️ Editar Nota
        </h3>
      </div>

      <div class="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4 custom-scrollbar">
        
        <div class="form-control">
          <label class="label pb-1">
            <span class="label-text font-medieval text-neutral text-sm sm:text-base md:text-lg">
              Título <span class="text-error">*</span>
            </span>
          </label>
          <input 
            type="text" 
            bind:value={form.title}
            on:blur={() => handleBlur('title')}
            placeholder="Ej: Encuentro con el dragón rojo"
            class="input input-sm sm:input-md input-bordered bg-[#2d241c] text-base-content border-primary/50 
                   focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50
                   {validationErrors.title ? 'border-error' : ''}"
            required
          />
          {#if validationErrors.title}
            <label class="label">
              <span class="label-text-alt text-error">{validationErrors.title}</span>
            </label>
          {/if}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div class="form-control">
            <label class="label pb-1">
              <span class="label-text font-medieval text-neutral text-sm sm:text-base">Categoría</span>
            </label>
            <select 
              bind:value={form.category}
              class="select select-sm sm:select-md select-bordered bg-[#2d241c] text-base-content border-primary/50
                     focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50"
            >
              {#each categories as cat}
                <option value={cat.value}>{cat.label}</option>
              {/each}
            </select>
          </div>

          {#if isDM}
            <div class="form-control justify-center">
              <label class="label cursor-pointer justify-start gap-2 sm:gap-3 pb-1">
                <input 
                  type="checkbox" 
                  bind:checked={form.isShared}
                  class="checkbox checkbox-secondary checkbox-sm sm:checkbox-md"
                />
                <div class="flex flex-col">
                  <span class="label-text font-medieval text-neutral text-sm sm:text-base">
                    🌐 Compartir con jugadores
                  </span>
                  <span class="label-text-alt text-neutral/60 italic text-xs">
                    Los jugadores podrán ver esta nota
                  </span>
                </div>
              </label>
            </div>
          {/if}
        </div>

        <div class="form-control">
          <label class="label pb-1">
            <span class="label-text font-medieval text-neutral text-sm sm:text-base md:text-lg">Contenido</span>
          </label>
          <textarea 
            bind:value={form.content}
            on:blur={() => handleBlur('content')}
            placeholder="Escribe aquí el contenido de tu nota..."
            class="textarea textarea-sm sm:textarea-md textarea-bordered bg-[#2d241c] text-base-content border-primary/50 
                   h-32 sm:h-40 md:h-48 resize-none
                   focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50
                   {validationErrors.content ? 'border-error' : ''}"
          ></textarea>
          {#if validationErrors.content}
            <label class="label">
              <span class="label-text-alt text-error">{validationErrors.content}</span>
            </label>
          {/if}
        </div>

        <div class="form-control">
          <label class="label pb-1">
            <span class="label-text font-medieval text-neutral text-sm sm:text-base">🏷️ Etiquetas</span>
          </label>
          <div class="flex gap-2">
            <input 
              type="text" 
              bind:value={tagInput}
              on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Presiona Enter para agregar..."
              class="input input-sm sm:input-md input-bordered bg-[#2d241c] text-base-content border-primary/50 flex-1
                     focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
            <button 
              type="button"
              on:click={addTag}
              class="btn btn-sm sm:btn-md btn-secondary flex-shrink-0"
              disabled={!tagInput.trim()}
            >
              ➕
            </button>
          </div>
          
          {#if validationErrors.tags}
            <label class="label">
              <span class="label-text-alt text-error">{validationErrors.tags}</span>
            </label>
          {/if}
          
          {#if form.tags.length > 0}
            <div class="flex flex-wrap gap-1.5 sm:gap-2 mt-2 p-2 bg-neutral/10 rounded-lg border border-primary/20">
              {#each form.tags as tag}
                <div class="badge badge-md sm:badge-lg gap-1.5 sm:gap-2 bg-secondary/20 border-secondary/40">
                  <span class="text-xs sm:text-sm">{tag}</span>
                  <button 
                    type="button"
                    on:click={() => removeTag(tag)}
                    class="btn btn-xs btn-circle btn-ghost hover:bg-error hover:text-white"
                  >✕</button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <div class="flex flex-col-reverse sm:flex-row justify-center gap-2 sm:gap-4 p-3 sm:p-4 md:p-5 
                  border-t-2 border-secondary flex-shrink-0 bg-gradient-to-t from-[#f4e4c1] to-transparent">
        <button 
          on:click={() => { showEditModal = false; editingNote = null; resetForm(); }}
          class="btn btn-sm sm:btn-md btn-outline border-2 border-neutral text-neutral 
                 hover:bg-neutral hover:text-secondary font-medieval w-full sm:w-auto"
        >
          Cancelar
        </button>
        <button 
          on:click={handleUpdate}
          class="btn btn-sm sm:btn-md btn-dnd w-full sm:w-auto"
          disabled={!isFormValid}
        >
          <span class="text-lg sm:text-xl">💾</span>
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

  /* Scroll personalizado para los modales */
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(139, 69, 19, 0.1);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #8B4513, #654321);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #A0522D, #8B4513);
  }
</style>