import { c as create_ssr_component, g as createEventDispatcher, f as each, d as add_attribute, e as escape, b as subscribe, o as onDestroy, v as validate_component } from "../../../../../chunks/ssr.js";
import { p as page } from "../../../../../chunks/stores.js";
import { u as userStore } from "../../../../../chunks/authStore.js";
import { o as open5eApi } from "../../../../../chunks/api.js";
import debounce from "lodash/debounce.js";
import { h as headerTitle } from "../../../../../chunks/uiStore.js";
import { getFirestore } from "firebase/firestore";
import { a as app } from "../../../../../chunks/firebase.js";
const AddCombatantModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let selectedPlayer;
  let { isOpen = false } = $$props;
  let { players = [] } = $$props;
  createEventDispatcher();
  let initiative = 0;
  let selectedPlayerId = "";
  let searchQuery = "";
  let suggestions = [];
  debounce(
    async () => {
      if (!searchQuery.trim()) {
        suggestions = [];
        return;
      }
      try {
        const result = await open5eApi.searchMonsters(searchQuery);
        suggestions = result.results.slice(0, 3);
      } catch (err) {
        console.error(err);
        suggestions = [];
      } finally {
      }
    },
    300
  );
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.players === void 0 && $$bindings.players && players !== void 0) $$bindings.players(players);
  selectedPlayer = players.find((p) => p.id === selectedPlayerId);
  return `${isOpen ? `<div class="modal modal-open z-50"><div class="modal-box card-parchment max-w-3xl h-full relative"><button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" data-svelte-h="svelte-1e8f2lk">✕</button> <h3 class="font-bold text-2xl font-medieval text-neutral mb-4 text-center" data-svelte-h="svelte-1n7thfu">⚔️ Agregar Combatiente</h3>  <div class="flex justify-center gap-4 mb-6"><button class="${"btn btn-sm font-medieval " + escape("btn-primary", true)}">🧝 Jugador</button> <button class="${"btn btn-sm font-medieval " + escape("btn-outline", true)}">🐉 Monstruo</button></div> ${` <div class="space-y-4"><div class="form-control"><label class="label" data-svelte-h="svelte-1lzlsw9"><span class="label-text font-medieval text-neutral">Seleccionar Jugador</span></label> <select class="select select-bordered bg-[#2d241c] text-base-content border-primary/50"><option value="" disabled selected data-svelte-h="svelte-ws9sqz">-- Elegir jugador --</option>${each(players, (p) => {
    return `<option${add_attribute("value", p.id, 0)}>${escape(p.name)}</option>`;
  })}</select></div> <div class="form-control"><label class="label" data-svelte-h="svelte-7krrq8"><span class="label-text font-medieval text-neutral">Iniciativa</span></label> <input type="number" min="1" max="100" step="1" required class="input input-bordered bg-[#2d241c] text-base-content border-primary/50"${add_attribute("value", initiative, 0)}></div> <div class="card bg-neutral/20 border border-primary/40 p-4 mt-2"><div class="flex items-center gap-4"><div><p class="text-lg font-bold text-neutral">${escape(selectedPlayer?.name || "Elegir jugador")}</p> <p class="text-sm text-neutral/70">HP: ${escape(selectedPlayer?.maxHp || 0)} | AC: ${escape(selectedPlayer?.armorClass || 0)}</p></div></div></div> <div class="modal-action justify-center gap-4 mt-4"><button class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval" data-svelte-h="svelte-acy963">Cancelar</button> <button class="btn btn-dnd" ${"disabled"}><span class="text-xl" data-svelte-h="svelte-v5ojki">⚔️</span> Agregar al Combate</button></div></div>`}</div></div>` : ``}`;
});
const HPModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let hpPercentage;
  let hpColor;
  let newHP;
  let hpChange;
  let newHpPercentage;
  let newHpColor;
  let { isOpen = false } = $$props;
  let { combatant = null } = $$props;
  createEventDispatcher();
  let hpChangeValue = 0;
  let customValue = 0;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.combatant === void 0 && $$bindings.combatant && combatant !== void 0) $$bindings.combatant(combatant);
  hpPercentage = combatant ? combatant.currentHp / combatant.maxHp * 100 : 0;
  hpColor = hpPercentage > 50 ? "success" : hpPercentage > 25 ? "warning" : "error";
  newHP = combatant ? Math.max(0, Math.min(combatant.maxHp, combatant.currentHp + hpChangeValue)) : 0;
  hpChange = combatant ? newHP - combatant.currentHp : 0;
  newHpPercentage = combatant ? newHP / combatant.maxHp * 100 : 0;
  newHpColor = newHpPercentage > 50 ? "success" : newHpPercentage > 25 ? "warning" : "error";
  return `${isOpen && combatant ? `<div class="modal modal-open z-50"><div class="card-parchment border-4 border-secondary mx-4 relative w-1/2 h-3/4 flex flex-col"> <button class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10 hover:bg-error/20" data-svelte-h="svelte-ghishr">✕</button>  <div class="p-4 flex-shrink-0 bg-gradient-to-b from-[#f4e4c1] to-transparent"><h3 class="font-bold text-2xl font-medieval text-neutral text-center mb-3" data-svelte-h="svelte-1i9waqd">💚 Gestión de Puntos de Vida</h3>  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg border border-primary/30 flex items-center gap-3"><div class="avatar"><div class="w-12 h-12 rounded-full ring-2 ring-secondary"><div class="bg-primary/20 flex items-center justify-center"><span class="text-xl">${escape(combatant.isNpc ? "👹" : "🧙‍♂️")}</span></div></div></div> <div class="flex-1 min-w-0"><h4 class="text-lg font-medieval text-neutral font-bold truncate">${escape(combatant.name)}</h4> <div class="flex gap-2 mt-1">${combatant.isNpc ? `<div class="badge badge-xs badge-error" data-svelte-h="svelte-31ycly">NPC</div>` : ``}</div></div></div></div>  <div class="flex-1 p-4"> <div class="grid grid-cols-2"> <div class="bg-neutral/10 justify-center items-center flex flex-col gap-1 px-2 rounded-lg border-2 border-primary/30"><p class="text-xs font-medieval text-neutral/60 text-center" data-svelte-h="svelte-15e8cb6">HP ACTUAL</p> <div class="text-center"><p class="text-2xl font-bold text-neutral">${escape(combatant.currentHp)}</p> <p class="text-sm text-neutral/60">de ${escape(combatant.maxHp)}</p></div> <progress class="${"progress progress-" + escape(hpColor, true) + " w-full h-3"}"${add_attribute("value", combatant.currentHp, 0)}${add_attribute("max", combatant.maxHp, 0)}></progress> <p class="text-xs text-center text-neutral/60">${escape(hpPercentage.toFixed(0))}%</p></div>  <div class="${"bg-" + escape(
    hpChange !== 0 ? hpChange > 0 ? "success" : "error" : "neutral",
    true
  ) + "/10 p-4 rounded-lg gap-1 px-2 flex flex-col justify-center items-center border-2 border-" + escape(
    hpChange !== 0 ? hpChange > 0 ? "success" : "error" : "primary",
    true
  ) + "/30"}"><p class="text-xs font-medieval text-neutral/60 text-center" data-svelte-h="svelte-ukgy9p">HP NUEVO</p> <div class="text-center"><p class="${"text-2xl font-bold text-" + escape(
    hpChange !== 0 ? hpChange > 0 ? "success" : "error" : "neutral",
    true
  )}">${escape(newHP)}</p> ${hpChange !== 0 ? `<p class="${"text-lg font-bold text-" + escape(hpChange > 0 ? "success" : "error", true)}">${escape(hpChange > 0 ? "+" : "")}${escape(hpChange)}</p>` : `<p class="text-sm text-neutral/60" data-svelte-h="svelte-yn2w7t">Sin cambios</p>`}</div> <progress class="${"progress progress-" + escape(hpChange !== 0 ? newHpColor : hpColor, true) + " w-full h-3"}"${add_attribute("value", newHP, 0)}${add_attribute("max", combatant.maxHp, 0)}></progress> <p class="text-xs text-center text-neutral/60">${escape(newHpPercentage.toFixed(0))}%</p></div></div>  <div><label class="label" data-svelte-h="svelte-7wz7aa"><span class="label-text font-medieval text-neutral">🎲 Cantidad de HP</span></label> <div class="flex gap-2"><input type="number" placeholder="Ej: 15" class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 flex-1 text-center text-2xl font-bold" min="0"${add_attribute("value", customValue, 0)}> <button class="btn btn-error flex-1" ${"disabled"}><span class="text-xl" data-svelte-h="svelte-qwnz9x">💥</span> <span class="font-medieval" data-svelte-h="svelte-1lnjjvd">Daño</span></button> <button class="btn btn-success flex-1" ${"disabled"}><span class="text-xl" data-svelte-h="svelte-cy0xo0">💚</span> <span class="font-medieval" data-svelte-h="svelte-2fk1mx">Curar</span></button></div></div></div></div></div>` : ``}`;
});
const ConditionModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { combatant = null } = $$props;
  createEventDispatcher();
  let searchQuery = "";
  let suggestions = [];
  let loading = false;
  debounce(
    async () => {
      if (!searchQuery.trim()) {
        suggestions = [];
        return;
      }
      loading = true;
      try {
        const result = await open5eApi.searchConditions(searchQuery);
        suggestions = result.results;
      } catch (err) {
        console.error("Error searching conditions:", err);
        suggestions = [];
      } finally {
        loading = false;
      }
    },
    300
  );
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.combatant === void 0 && $$bindings.combatant && combatant !== void 0) $$bindings.combatant(combatant);
  return `${isOpen && combatant ? `<div class="modal modal-open z-50"><div class="card-parchment border-4 border-secondary w-1/2 h-5/6 mx-4 relative flex flex-col"> <button class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10 hover:bg-error/20" data-svelte-h="svelte-1vc2djp">✕</button>  <div class="p-4 flex-shrink-0 bg-gradient-to-b from-[#f4e4c1] to-transparent"><h3 class="font-bold text-2xl font-medieval text-neutral text-center mb-3" data-svelte-h="svelte-j0oh10">⚠️ Estados de Combate</h3>  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg border border-primary/30 flex items-center gap-3"><div class="avatar"><div class="w-12 h-12 rounded-full ring-2 ring-secondary"><div class="bg-primary/20 flex items-center justify-center"><span class="text-xl">${escape(combatant.isNpc ? "👹" : "🧙‍♂️")}</span></div></div></div> <div class="flex-1 min-w-0"><h4 class="text-lg font-medieval text-neutral font-bold truncate">${escape(combatant.name)}</h4> <div class="flex gap-2 mt-1"><div class="badge badge-xs bg-error/30 text-neutral border-error/50">❤️ ${escape(combatant.currentHp)}/${escape(combatant.maxHp)}</div> <div class="badge badge-xs bg-info/30 text-neutral border-info/50">🛡️ ${escape(combatant.armorClass)}</div></div></div></div></div>  <div class="flex-1 overflow-hidden flex flex-col md:flex-row gap-3 p-4" style="min-height: 0;"> <div class="md:w-1/3 flex flex-col" style="min-height: 300px;"><div class="bg-warning/10 rounded-lg border-2 border-warning/30 p-3 flex flex-col h-full"><div class="flex items-center justify-between mb-3"><h5 class="font-medieval text-neutral font-bold flex items-center gap-2" data-svelte-h="svelte-12hilzf"><span>⚠️</span> <span>Estados Activos</span></h5> <span class="badge badge-warning badge-sm">${escape(combatant.conditions && Array.isArray(combatant.conditions) ? combatant.conditions.length : 0)}</span></div> ${combatant.conditions && Array.isArray(combatant.conditions) && combatant.conditions.length > 0 ? `<div class="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">${each(combatant.conditions, (condition) => {
    return `<div class="bg-warning/20 rounded px-3 py-2 border border-warning/40 flex items-center justify-between gap-2 hover:bg-warning/30 transition-colors"><span class="font-medieval text-sm text-neutral flex-1">${escape(condition)}</span> <button class="btn btn-xs btn-circle btn-ghost hover:bg-error hover:text-white" title="Eliminar" data-svelte-h="svelte-5t970f">✕</button> </div>`;
  })}</div>` : `<div class="flex-1 flex flex-col items-center justify-center text-center py-6" data-svelte-h="svelte-gjvbew"><div class="text-3xl mb-2 opacity-50">😌</div> <p class="text-xs text-neutral/60 font-body italic">Sin estados activos</p></div>`}</div></div>  <div class="md:w-2/3 flex flex-col" style="min-height: 300px;"> <div class="mb-3"><div class="relative"><input type="text" placeholder="Buscar condición (ej: blinded, poisoned, stunned)..." class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 w-full pr-10"${add_attribute("value", searchQuery, 0)}> <div class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral/50" data-svelte-h="svelte-1duc997">🔍</div></div> <p class="text-xs text-neutral/50 mt-1 italic" data-svelte-h="svelte-hqlo3f">Base de datos oficial de D&amp;D 5e</p></div>  <div class="flex-1 overflow-y-auto custom-scrollbar bg-neutral/5 rounded-lg border border-primary/20 p-3">${loading ? `<div class="flex flex-col items-center justify-center h-full" data-svelte-h="svelte-io7n20"><span class="loading loading-spinner loading-md text-secondary"></span> <p class="text-xs text-neutral/60 mt-2">Buscando...</p></div>` : `${suggestions.length > 0 ? `<div class="space-y-2">${each(suggestions, (suggestion) => {
    let currentConditions = Array.isArray(combatant.conditions) ? combatant.conditions : [], isActive = currentConditions.includes(suggestion.name);
    return `  <button ${isActive ? "disabled" : ""} class="${"w-full text-left p-3 rounded-lg border-2 transition-all " + escape(
      isActive ? "border-success/50 bg-success/10 cursor-not-allowed opacity-60" : "border-primary/30 bg-[#f4e4c1]/50 hover:bg-[#f4e4c1] hover:border-primary/50 hover:shadow-md",
      true
    )}"><div class="flex items-start justify-between gap-2 mb-1"><span class="font-medieval font-bold text-neutral">${escape(suggestion.name)}</span> ${isActive ? `<span class="badge badge-xs badge-success shrink-0" data-svelte-h="svelte-mm16lr">✓ Activo</span>` : ``}</div> <p class="text-xs text-neutral/70 font-body leading-snug">${escape(open5eApi.cleanDescription(suggestion.desc, 120))}</p> </button>`;
  })}</div>` : `${searchQuery.trim() ? `<div class="flex flex-col items-center justify-center h-full text-center"><div class="text-4xl mb-3" data-svelte-h="svelte-sy51vw">🔍</div> <p class="text-neutral/70 font-body mb-3">No se encontró &quot;<span class="font-bold">${escape(searchQuery)}</span>&quot;</p> <button class="btn btn-primary btn-sm" data-svelte-h="svelte-1rs0apo">➕ Agregar como personalizado</button></div>` : `<div class="flex flex-col items-center justify-center h-full text-center px-4" data-svelte-h="svelte-981qn5"><div class="text-5xl mb-3">📖</div> <p class="text-neutral/70 font-body mb-2">Escribe para buscar condiciones</p> <div class="flex flex-wrap gap-1 justify-center text-xs text-neutral/50 mt-2"><span class="bg-neutral/10 px-2 py-1 rounded">blinded</span> <span class="bg-neutral/10 px-2 py-1 rounded">charmed</span> <span class="bg-neutral/10 px-2 py-1 rounded">frightened</span> <span class="bg-neutral/10 px-2 py-1 rounded">grappled</span> <span class="bg-neutral/10 px-2 py-1 rounded">paralyzed</span></div></div>`}`}`}</div></div></div></div></div>` : ``}`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_userStore;
  let $page, $$unsubscribe_page;
  $$unsubscribe_userStore = subscribe(userStore, (value) => value);
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  headerTitle.set("Combate");
  let characters = [];
  let showAddCombatantModal = false;
  let showHPModal = false;
  let showConditionModal = false;
  let selectedCombatant = null;
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
    $$rendered = ` <div class="min-h-screen flex flex-col">${``} <div class="flex flex-1"><div class="flex-1">${`<div class="flex items-center justify-center h-full" data-svelte-h="svelte-xh23f2"><span class="loading loading-spinner loading-lg text-secondary"></span></div>`}</div></div></div> ${``} ${validate_component(HPModal, "HPModal").$$render(
      $$result,
      {
        combatant: selectedCombatant,
        isOpen: showHPModal
      },
      {
        isOpen: ($$value) => {
          showHPModal = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(ConditionModal, "ConditionModal").$$render(
      $$result,
      {
        combatant: selectedCombatant,
        isOpen: showConditionModal
      },
      {
        isOpen: ($$value) => {
          showConditionModal = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(AddCombatantModal, "AddCombatantModal").$$render(
      $$result,
      {
        players: characters,
        isOpen: showAddCombatantModal
      },
      {
        isOpen: ($$value) => {
          showAddCombatantModal = $$value;
          $$settled = false;
        }
      },
      {}
    )}`;
  } while (!$$settled);
  $$unsubscribe_userStore();
  $$unsubscribe_page();
  return $$rendered;
});
export {
  Page as default
};
