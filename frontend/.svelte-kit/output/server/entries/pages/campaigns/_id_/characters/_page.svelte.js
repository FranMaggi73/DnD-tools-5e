import { c as create_ssr_component, g as createEventDispatcher, e as escape, d as add_attribute, b as subscribe, o as onDestroy, v as validate_component } from "../../../../../chunks/ssr.js";
import { p as page } from "../../../../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import { u as userStore } from "../../../../../chunks/authStore.js";
import { h as headerTitle } from "../../../../../chunks/uiStore.js";
import { getFirestore } from "firebase/firestore";
import { a as app } from "../../../../../chunks/firebase.js";
const CharacterFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { isEdit = false } = $$props;
  let { form = { name: "", maxHp: 10, armorClass: 10 } } = $$props;
  createEventDispatcher();
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.isEdit === void 0 && $$bindings.isEdit && isEdit !== void 0) $$bindings.isEdit(isEdit);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  return `${isOpen ? ` <div class="modal modal-open z-50"> <div class="bg-[#2d241c] text-base-content border-4 border-secondary corner-ornament card-parchment w-full max-w-2xl p-6 relative"> <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" data-svelte-h="svelte-1t0z3ws">✕</button>  <h3 class="font-bold text-3xl font-medieval text-neutral mb-6 text-center">${escape(isEdit ? "✏️ Editar Personaje" : "🧙‍♂️ Crear Personaje")}</h3> <form> <div class="form-control mb-4"><label class="label" data-svelte-h="svelte-xi5qbv"><span class="label-text font-medieval text-neutral text-lg">Nombre *</span></label> <input type="text" placeholder="Ej: Gandalf el Gris" required class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"${add_attribute("value", form.name, 0)}></div>  <div class="grid grid-cols-2 gap-4 mb-4"><div class="form-control"><label class="label" data-svelte-h="svelte-1n2l9vr"><span class="label-text font-medieval text-neutral text-lg">HP Máximo *</span></label> <input type="number" min="1" required class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"${add_attribute("value", form.maxHp, 0)}></div> <div class="form-control"><label class="label" data-svelte-h="svelte-kzmvgp"><span class="label-text font-medieval text-neutral text-lg">Clase de Armadura (CA) *</span></label> <input type="number" min="1" required class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"${add_attribute("value", form.armorClass, 0)}></div></div>  <div class="modal-action justify-center gap-4 mt-4"><button type="button" class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval" data-svelte-h="svelte-qbe6z4">Cancelar</button> <button type="submit" class="btn btn-dnd" ${!form.name || !form.maxHp ? "disabled" : ""}><span class="text-xl">${escape(isEdit ? "💾" : "✨")}</span> ${escape(isEdit ? "Guardar Cambios" : "Crear Personaje")}</button></div></form></div></div>` : ``}`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $userStore, $$unsubscribe_userStore;
  let $page, $$unsubscribe_page;
  $$unsubscribe_userStore = subscribe(userStore, (value) => $userStore = value);
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  headerTitle.set("Personajes");
  let characters = [];
  let showFormModal = false;
  let isEdit = false;
  let form = {
    name: "",
    maxHp: 10,
    armorClass: 10,
    imageUrl: ""
  };
  getFirestore(app);
  onDestroy(() => {
  });
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $page.params.id || "";
    characters.find((c) => c.userId === $userStore?.uid);
    characters.filter((c) => c.userId !== $userStore?.uid);
    $$rendered = `<div class="min-h-screen flex flex-col"><div class="flex flex-1"><div class="flex-1 p-6"><div class="container mx-auto max-w-7xl"> <div class="mb-8 text-center" data-svelte-h="svelte-1rwvit0"><h1 class="text-4xl lg:text-5xl font-bold text-secondary title-ornament mb-3 text-shadow">Personajes</h1> <p class="text-base-content/70 font-body italic text-lg mb-2">&quot;Cada héroe tiene su historia...&quot;</p>  <div class="badge bg-success/30 border-success/50 text-neutral badge-lg" title="Los cambios se sincronizan en tiempo real">🔄 Sincronización en tiempo real activa</div></div> ${``} ${`<div class="flex justify-center py-20" data-svelte-h="svelte-1f8qah6"><span class="loading loading-spinner loading-lg text-secondary"></span></div>`}</div></div></div></div> <div class="justify-center items-center">${validate_component(CharacterFormModal, "CharacterFormModal").$$render(
      $$result,
      { isEdit, form, isOpen: showFormModal },
      {
        isOpen: ($$value) => {
          showFormModal = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>`;
  } while (!$$settled);
  $$unsubscribe_userStore();
  $$unsubscribe_page();
  return $$rendered;
});
export {
  Page as default
};
