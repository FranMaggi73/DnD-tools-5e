import { c as create_ssr_component, b as subscribe } from "../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { u as userStore, l as loadingStore } from "../../chunks/authStore.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_userStore;
  let $$unsubscribe_loadingStore;
  $$unsubscribe_userStore = subscribe(userStore, (value) => value);
  $$unsubscribe_loadingStore = subscribe(loadingStore, (value) => value);
  $$unsubscribe_userStore();
  $$unsubscribe_loadingStore();
  return `<div class="flex items-center justify-center h-screen" data-svelte-h="svelte-3urjxx"><span class="loading loading-spinner loading-lg"></span></div>`;
});
export {
  Page as default
};
