import { c as create_ssr_component, b as subscribe } from "../../../../chunks/ssr.js";
import { p as page } from "../../../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
import { u as userStore } from "../../../../chunks/authStore.js";
import "../../../../chunks/api.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_userStore;
  let $page, $$unsubscribe_page;
  $$unsubscribe_userStore = subscribe(userStore, (value) => value);
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $page.params.id || "";
  $$unsubscribe_userStore();
  $$unsubscribe_page();
  return `<div class="min-h-screen flex flex-col">${``} <div class="flex flex-1"> <div class="flex-1 p-6">${`<div class="flex justify-center py-20" data-svelte-h="svelte-1fvu3yi"><span class="loading loading-spinner loading-lg text-secondary"></span></div>`}</div></div></div>  ${``}  ${``}`;
});
export {
  Page as default
};
