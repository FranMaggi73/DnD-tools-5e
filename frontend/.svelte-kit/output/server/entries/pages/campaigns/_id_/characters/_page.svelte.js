import { c as create_ssr_component, g as createEventDispatcher, f as escape, d as add_attribute, b as subscribe, o as onDestroy, v as validate_component } from "../../../../../chunks/ssr.js";
import { p as page } from "../../../../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import { u as userStore } from "../../../../../chunks/authStore.js";
import "../../../../../chunks/api.js";
import { h as headerTitle } from "../../../../../chunks/uiStore.js";
import { getFirestore } from "firebase/firestore";
import { a as app } from "../../../../../chunks/firebase.js";
function validateCharacterName(name) {
  if (!name || !name.trim()) {
    return { valid: false, error: "El nombre no puede estar vacío" };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: "El nombre debe tener al menos 2 caracteres" };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: "El nombre no puede tener más de 50 caracteres" };
  }
  return { valid: true };
}
function validateHP(hp, max) {
  if (hp < 0) {
    return { valid: false, error: "Los HP no pueden ser negativos" };
  }
  if (hp > 999) {
    return { valid: false, error: "Los HP no pueden ser mayores a 999" };
  }
  return { valid: true };
}
function validateArmorClass(ac) {
  if (ac < 1) {
    return { valid: false, error: "La CA mínima es 1" };
  }
  if (ac > 30) {
    return { valid: false, error: "La CA máxima es 30" };
  }
  return { valid: true };
}
const CharacterFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isValid;
  let { isOpen = false } = $$props;
  let { isEdit = false } = $$props;
  let { form = { name: "", maxHp: 10, armorClass: 10 } } = $$props;
  createEventDispatcher();
  let errors = { name: "", maxHp: "", armorClass: "" };
  let touched = {
    name: false,
    maxHp: false,
    armorClass: false
  };
  function resetValidation() {
    Object.keys(touched).forEach((key) => {
      touched[key] = false;
    });
    Object.keys(errors).forEach((key) => {
      errors[key] = "";
    });
  }
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.isEdit === void 0 && $$bindings.isEdit && isEdit !== void 0) $$bindings.isEdit(isEdit);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0) $$bindings.form(form);
  {
    if (touched.name) {
      const result = validateCharacterName(form.name);
      errors.name = result.valid ? "" : result.error || "";
    }
  }
  {
    if (touched.maxHp) {
      const result = validateHP(form.maxHp);
      errors.maxHp = result.valid ? "" : result.error || "";
    }
  }
  {
    if (touched.armorClass) {
      const result = validateArmorClass(form.armorClass);
      errors.armorClass = result.valid ? "" : result.error || "";
    }
  }
  isValid = !errors.name && !errors.maxHp && !errors.armorClass && form.name.trim() && form.maxHp > 0 && form.armorClass > 0;
  {
    if (isOpen) {
      resetValidation();
    }
  }
  return `${isOpen ? `<div class="modal modal-open z-50"><div class="bg-[#2d241c] text-base-content border-4 border-secondary corner-ornament card-parchment w-full max-w-2xl p-6 relative"> <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" data-svelte-h="svelte-1t0z3ws">✕</button>  <h3 class="font-bold text-3xl font-medieval text-neutral mb-6 text-center">${escape(isEdit ? "✏️ Editar Personaje" : "🧙‍♂️ Crear Personaje")}</h3> <form class="space-y-4"> <div class="form-control"><label class="label mb-1" data-svelte-h="svelte-126ln4a"><span class="label-text font-medieval text-neutral text-lg">Nombre <span class="text-error">*</span></span></label> <input type="text" placeholder="Ej: Gandalf el Gris" required class="${"input input-bordered bg-[#2d241c] text-base-content border-2 " + escape(
    errors.name && touched.name ? "border-error" : "border-primary/50",
    true
  ) + " focus:border-secondary focus:ring-0 focus:outline-none w-full transition-colors duration-150"}"${add_attribute("value", form.name, 0)}> ${errors.name && touched.name ? `<label class="label"><span class="label-text-alt text-error"><span class="text-lg" data-svelte-h="svelte-15g1o1n">⚠️</span> ${escape(errors.name)}</span></label>` : `<label class="label" data-svelte-h="svelte-5xpbjl"><span class="label-text-alt text-neutral/60 italic text-xs">Nombre del personaje (2-50 caracteres)</span></label>`}</div>  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="form-control"><label class="label mb-1" data-svelte-h="svelte-1179efa"><span class="label-text font-medieval text-neutral text-lg">HP Máximo <span class="text-error">*</span></span></label> <input type="number" min="1" max="999" required class="${"input input-bordered bg-[#2d241c] text-base-content border-2 " + escape(
    errors.maxHp && touched.maxHp ? "border-error" : "border-primary/50",
    true
  ) + " focus:border-secondary focus:ring-0 focus:outline-none w-full transition-colors duration-150"}"${add_attribute("value", form.maxHp, 0)}> ${errors.maxHp && touched.maxHp ? `<label class="label"><span class="label-text-alt text-error text-xs">⚠️ ${escape(errors.maxHp)}</span></label>` : `<label class="label" data-svelte-h="svelte-1l1zyba"><span class="label-text-alt text-neutral/60 italic text-xs">Puntos de vida máximos (1-999)</span></label>`}</div> <div class="form-control"><label class="label mb-1" data-svelte-h="svelte-11qwlgk"><span class="label-text font-medieval text-neutral text-lg">Clase de Armadura (CA) <span class="text-error">*</span></span></label> <input type="number" min="1" max="30" required class="${"input input-bordered bg-[#2d241c] text-base-content border-2 " + escape(
    errors.armorClass && touched.armorClass ? "border-error" : "border-primary/50",
    true
  ) + " focus:border-secondary focus:ring-0 focus:outline-none w-full transition-colors duration-150"}"${add_attribute("value", form.armorClass, 0)}> ${errors.armorClass && touched.armorClass ? `<label class="label"><span class="label-text-alt text-error text-xs">⚠️ ${escape(errors.armorClass)}</span></label>` : `<label class="label" data-svelte-h="svelte-q9nn2u"><span class="label-text-alt text-neutral/60 italic text-xs">Clase de Armadura (1-30)</span></label>`}</div></div>  <div class="modal-action justify-center gap-4 mt-4"><button type="button" class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval" data-svelte-h="svelte-qbe6z4">Cancelar</button> <button type="submit" class="btn btn-dnd" ${!isValid ? "disabled" : ""}><span class="text-xl">${escape(isEdit ? "💾" : "✨")}</span> ${escape(isEdit ? "Guardar Cambios" : "Crear Personaje")}</button></div></form></div></div>` : ``}`;
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
    $$rendered = `<div class="min-h-screen flex flex-col"><div class="flex flex-1"><div class="flex-1 p-6"><div class="container mx-auto max-w-7xl"> <div class="mb-8 text-center" data-svelte-h="svelte-1nv5ok9"><h1 class="text-4xl lg:text-5xl font-bold text-secondary title-ornament mb-3 text-shadow">Personajes</h1> <p class="text-base-content/70 font-body italic text-lg mb-2">&quot;Cada héroe tiene su historia...&quot;</p></div> ${``} ${`<div class="flex justify-center py-20" data-svelte-h="svelte-1f8qah6"><span class="loading loading-spinner loading-lg text-secondary"></span></div>`}</div></div></div></div> <div class="justify-center items-center">${validate_component(CharacterFormModal, "CharacterFormModal").$$render(
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
