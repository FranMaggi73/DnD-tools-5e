<!-- frontend/src/lib/components/Modal.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';

  export let isOpen: boolean = false;
  export let title: string = '';
  export let size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  export let closeOnOverlayClick: boolean = true;
  export let closeOnEscape: boolean = true;
  export let showCloseButton: boolean = true;
  export let ariaLabel: string = title || 'Modal dialog';
  export let ariaDescribedBy: string = '';

  const dispatch = createEventDispatcher();

  let modalElement: HTMLDivElement;
  let previousActiveElement: HTMLElement | null = null;

  const sizeClasses = {
    sm: 'w-full max-w-md',
    md: 'w-full max-w-2xl',
    lg: 'w-full max-w-4xl',
    xl: 'w-full max-w-6xl',
    full: 'w-[95vw] max-w-[95vw]'
  };

  $: if (isOpen) {
    openModal();
  } else {
    closeModal();
  }

  function openModal() {
    // Guardar el elemento activo actual
    previousActiveElement = document.activeElement as HTMLElement;
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
    
    // Focus trap: enfocar el modal después de un tick
    setTimeout(() => {
      if (modalElement) {
        const firstFocusable = modalElement.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }
    }, 0);
  }

  function closeModal() {
    // Restaurar scroll del body
    document.body.style.overflow = '';
    
    // Restaurar focus
    if (previousActiveElement) {
      previousActiveElement.focus();
      previousActiveElement = null;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) return;

    // Escape key
    if (e.key === 'Escape' && closeOnEscape) {
      e.preventDefault();
      handleClose();
    }

    // Tab trap (mantener focus dentro del modal)
    if (e.key === 'Tab') {
      const focusableElements = modalElement.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }

  function handleOverlayClick(e: MouseEvent) {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  }

  function handleClose() {
    dispatch('close');
  }

  onMount(() => {
    // Agregar listener global para keyboard
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
    // Asegurar que el scroll se restaure
    document.body.style.overflow = '';
  });
</script>

{#if isOpen}
  <!-- Overlay -->
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
    on:click={handleOverlayClick}
    transition:fade={{ duration: 200 }}
    role="dialog"
    aria-modal="true"
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
  >
    <!-- Modal Container -->
    <div
      bind:this={modalElement}
      class="card-parchment border-2 sm:border-4 border-secondary 
             {sizeClasses[size]} max-h-[92vh] 
             relative flex flex-col"
      transition:scale={{ duration: 200, start: 0.95 }}
      on:click|stopPropagation
    >
      <!-- Header -->
      {#if title || showCloseButton || $$slots.header}
        <div class="p-3 sm:p-4 md:p-5 border-b-2 border-secondary flex-shrink-0 
                    bg-gradient-to-b from-[#f4e4c1] to-transparent">
          {#if showCloseButton}
            <button
              type="button"
              class="btn btn-xs sm:btn-sm btn-circle btn-ghost absolute right-2 top-2 
                     hover:bg-error/20 focus:ring-2 focus:ring-secondary"
              on:click={handleClose}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          {/if}

          {#if $$slots.header}
            <slot name="header" />
          {:else if title}
            <h3 class="font-bold text-xl sm:text-2xl md:text-3xl font-medieval 
                       text-neutral text-center pr-8">
              {title}
            </h3>
          {/if}
        </div>
      {/if}

      <!-- Body -->
      <div 
        class="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 custom-scrollbar"
        id={ariaDescribedBy}
      >
        <slot />
      </div>

      <!-- Footer -->
      {#if $$slots.footer}
        <div class="flex-shrink-0 p-3 sm:p-4 md:p-5 border-t-2 border-secondary 
                    bg-gradient-to-t from-[#f4e4c1] to-transparent">
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* Scroll personalizado */
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