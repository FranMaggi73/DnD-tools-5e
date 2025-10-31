import { c as create_ssr_component, b as subscribe, f as escape } from "../../chunks/ssr.js";
import { p as page } from "../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
const Error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let error;
  let status;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  error = $page.error;
  status = $page.status;
  $$unsubscribe_page();
  return `<div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-neutral via-base-100 to-neutral"><div class="card-parchment max-w-2xl w-full p-8 text-center corner-ornament"> ${status === 404 ? `<div class="text-8xl mb-6" data-svelte-h="svelte-xbvyn5">🗺️</div> <h1 class="text-4xl font-medieval text-error mb-4" data-svelte-h="svelte-1tyee52">Página No Encontrada</h1> <p class="text-xl text-neutral/70 font-body mb-2" data-svelte-h="svelte-apoeiu">Esta página no existe en tu grimorio...</p>` : `${status === 403 ? `<div class="text-8xl mb-6" data-svelte-h="svelte-1elu706">🛡️</div> <h1 class="text-4xl font-medieval text-error mb-4" data-svelte-h="svelte-7wbt5x">Acceso Denegado</h1> <p class="text-xl text-neutral/70 font-body mb-2" data-svelte-h="svelte-15mb4hs">No tienes permisos para acceder aquí</p>` : `<div class="text-8xl mb-6" data-svelte-h="svelte-17xpvts">⚠️</div> <h1 class="text-4xl font-medieval text-error mb-4" data-svelte-h="svelte-qfxsbl">¡Algo salió mal!</h1> <p class="text-xl text-neutral/70 font-body mb-2">${escape(error?.message || "Ha ocurrido un error inesperado")}</p>`}`} ${``} <div class="divider text-neutral/50 my-6" data-svelte-h="svelte-4enbfl">⚔️</div> <div class="flex flex-col sm:flex-row gap-4 justify-center"><button class="btn btn-dnd" data-svelte-h="svelte-lvxyv2"><span class="text-xl">🏠</span>
        Volver al Dashboard</button> <button class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval" data-svelte-h="svelte-rftzh9"><span class="text-xl">🔄</span>
        Recargar Página</button></div> <p class="text-sm text-neutral/50 italic mt-6 font-body" data-svelte-h="svelte-1ex90y1">&quot;Incluso los héroes más valientes encuentran obstáculos en su camino...&quot;</p></div></div>`;
});
export {
  Error as default
};
