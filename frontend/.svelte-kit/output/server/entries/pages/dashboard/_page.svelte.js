import { c as create_ssr_component, b as subscribe, o as onDestroy } from "../../../chunks/ssr.js";
import { u as userStore } from "../../../chunks/authStore.js";
import { a as app } from "../../../chunks/firebase.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
import { h as headerTitle } from "../../../chunks/uiStore.js";
import { getFirestore } from "firebase/firestore";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_userStore;
  $$unsubscribe_userStore = subscribe(userStore, (value) => value);
  headerTitle.set("🎲 Grimorio de Aventuras");
  getFirestore(app);
  onDestroy(() => {
  });
  $$unsubscribe_userStore();
  return `<div class="container mx-auto justify-center items-center flex flex-col p-6 lg:p-8"><div class="mb-8 text-center" data-svelte-h="svelte-j8o7kj"><h1 class="text-4xl lg:text-5xl font-bold text-secondary title-ornament mx-4 mb-3 text-shadow">Mis Campañas</h1> <p class="text-base-content/70 font-body italic text-lg">&quot;Las aventuras aguardan a quienes se atreven a explorar...&quot;</p></div> <button class="btn btn-circle btn-primary btn-lg fixed bottom-6 right-6 shadow-xl z-40" title="Crear nueva campaña" data-svelte-h="svelte-1eth7et"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg></button> ${``} ${`<div class="flex justify-center py-20" data-svelte-h="svelte-prkuak"><div class="relative"><span class="loading loading-spinner loading-lg text-secondary"></span> <p class="mt-4 text-secondary font-medieval">Consultando el grimorio...</p></div></div>`}</div> ${``}`;
});
export {
  Page as default
};
