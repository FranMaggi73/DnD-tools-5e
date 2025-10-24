import { c as create_ssr_component } from "../../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { h as headerTitle } from "../../../chunks/uiStore.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  headerTitle.set("🎲 Grimorio de Aventuras");
  return `<div class="container mx-auto justify-center items-center flex flex-col p-6 lg:p-8"><div class="mb-8 text-center" data-svelte-h="svelte-1bk3aw7"><h1 class="text-4xl lg:text-5xl font-bold text-secondary title-ornament mb-3 text-shadow">Mis Campañas</h1> <p class="text-base-content/70 font-body italic text-lg">&quot;Las aventuras aguardan a quienes se atreven a explorar...&quot;</p></div> ${``} ${`<div class="flex justify-center py-20" data-svelte-h="svelte-prkuak"><div class="relative"><span class="loading loading-spinner loading-lg text-secondary"></span> <p class="mt-4 text-secondary font-medieval">Consultando el grimorio...</p></div></div>`}</div> ${``}`;
});
export {
  Page as default
};
