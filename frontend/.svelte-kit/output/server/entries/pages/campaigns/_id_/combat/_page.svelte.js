import { c as create_ssr_component, g as createEventDispatcher, d as add_attribute, e as each, f as escape, b as subscribe, o as onDestroy, v as validate_component } from "../../../../../chunks/ssr.js";
import { p as page } from "../../../../../chunks/stores.js";
import { u as userStore } from "../../../../../chunks/authStore.js";
import { a as app } from "../../../../../chunks/firebase.js";
import debounce from "lodash/debounce.js";
import { h as headerTitle } from "../../../../../chunks/uiStore.js";
import { getFirestore } from "firebase/firestore";
const open5eApi = {
  searchMonsters: async (query) => {
    const searchQuery = query.trim().toLowerCase();
    const response = await fetch(
      `https://api.open5e.com/v1/monsters/?search=${encodeURIComponent(searchQuery)}&limit=50`
    );
    if (!response.ok) throw new Error("Error buscando criaturas");
    const data = await response.json();
    if (data.results) {
      data.results = data.results.filter((m) => {
        const name = m.name.toLowerCase();
        const type = m.type?.toLowerCase() || "";
        return name.includes(searchQuery) || type.includes(searchQuery);
      }).sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aStarts = aName.startsWith(searchQuery);
        const bStarts = bName.startsWith(searchQuery);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aName.length - bName.length;
      }).slice(0, 20);
    }
    return data;
  },
  getMonster: async (slug) => {
    const response = await fetch(`https://api.open5e.com/v1/monsters/${slug}/`);
    if (!response.ok) throw new Error("Error obteniendo criatura");
    return response.json();
  },
  monsterToCombatant: (monster, initiative) => ({
    type: "creature",
    name: monster.name,
    initiative,
    maxHp: monster.hit_points,
    currentHp: monster.hit_points,
    armorClass: monster.armor_class,
    isNpc: true,
    creatureSource: "open5e"
  }),
  searchConditions: async (query) => {
    const response = await fetch(
      `https://api.open5e.com/v1/conditions/?search=${encodeURIComponent(query)}&limit=5`
    );
    if (!response.ok) throw new Error("Error buscando condiciones");
    return response.json();
  },
  getCondition: async (slug) => {
    const response = await fetch(`https://api.open5e.com/v1/conditions/${slug}/`);
    if (!response.ok) throw new Error("Error obteniendo condición");
    return response.json();
  },
  cleanDescription: (html, maxLength = 150) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    let text = temp.textContent || temp.innerText || "";
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + "...";
    }
    return text;
  }
};
const AddCombatantModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let selectedPlayer;
  let isPlayerValid;
  let { isOpen = false } = $$props;
  let { players = [] } = $$props;
  createEventDispatcher();
  let activeTab = "player";
  let initiative = 0;
  let selectedPlayerId = "";
  let searchQuery = "";
  let suggestions = [];
  let noResults = false;
  debounce(
    async () => {
      const query = searchQuery.trim();
      if (!query) {
        suggestions = [];
        noResults = false;
        return;
      }
      noResults = false;
      try {
        const result = await open5eApi.searchMonsters(query);
        suggestions = result.results || [];
        noResults = suggestions.length === 0;
      } catch (err) {
        console.error("Error buscando monstruos:", err);
        suggestions = [];
        noResults = true;
      } finally {
      }
    },
    500
  );
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.players === void 0 && $$bindings.players && players !== void 0) $$bindings.players(players);
  selectedPlayer = players.find((p) => p.id === selectedPlayerId);
  isPlayerValid = selectedPlayer && initiative >= 1;
  return `${isOpen ? `<div class="modal modal-open z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-box card-parchment w-11/12 max-w-3xl h-11/12 relative flex flex-col"><div class="flex flex-col md:flex-row justify-between items-center p-4 border-b-2 border-secondary gap-2 md:gap-4"><h3 id="modal-title" class="font-bold text-2xl md:text-3xl font-medieval text-neutral flex-1 text-center md:text-left" data-svelte-h="svelte-cw4yad">⚔️ Agregar Combatiente</h3> <div class="flex gap-2" role="tablist" aria-label="Tipo de combatiente"><button role="tab"${add_attribute("aria-selected", activeTab === "player", 0)} aria-controls="player-panel" class="${"btn btn-sm font-medieval " + escape("btn-primary", true)}">🧝 Jugador</button> <button role="tab"${add_attribute("aria-selected", activeTab === "monster", 0)} aria-controls="monster-panel" class="${"btn btn-sm font-medieval " + escape("btn-outline", true)}">🐉 Monstruo</button></div> <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 md:static" aria-label="Cerrar modal" data-svelte-h="svelte-1j9u8d0">✕</button></div>  <div class="flex-1 overflow-y-auto p-4 space-y-4">${` <div class="space-y-4"><div class="form-control"><label class="label" data-svelte-h="svelte-aatn1l"><span class="label-text font-medieval text-neutral">Seleccionar Jugador <span class="text-error">*</span></span></label> <select class="select select-bordered bg-[#2d241c] text-base-content border-primary/50 w-full"><option value="" disabled selected data-svelte-h="svelte-ws9sqz">-- Elegir jugador --</option>${each(players, (p) => {
    return `<option${add_attribute("value", p.id, 0)}>${escape(p.name)}</option>`;
  })}</select></div> <div class="form-control"><label class="label" data-svelte-h="svelte-1kjkdwe"><span class="label-text font-medieval text-neutral">Iniciativa <span class="text-error">*</span></span></label> <input type="number" min="1" max="100" step="1" required class="${"input input-bordered bg-[#2d241c] text-base-content " + escape(
    "border-primary/50",
    true
  ) + " w-full focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50"}"${add_attribute("value", initiative, 0)}> ${`<label class="label" data-svelte-h="svelte-18jw2s3"><span class="label-text-alt text-neutral/60 italic text-xs">Valor de iniciativa tirado (1-100)</span></label>`}</div> <div class="card bg-neutral/20 border border-primary/40 p-4 mt-2"><div class="flex items-center gap-4"><div><p class="text-lg font-bold text-neutral">${escape(selectedPlayer?.name || "Elegir jugador")}</p> <p class="text-sm text-neutral/70">HP: ${escape(selectedPlayer?.maxHp || 0)} | AC: ${escape(selectedPlayer?.armorClass || 0)}</p></div></div></div></div>`}</div>  <div class="flex justify-center gap-4 pt-4 border-t-2 border-secondary flex-col md:flex-row"><button class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval w-full md:w-auto" data-svelte-h="svelte-toewbe">Cancelar</button> <button class="btn btn-dnd w-full md:w-auto" ${!isPlayerValid ? "disabled" : ""}><span class="text-xl" data-svelte-h="svelte-v5ojki">⚔️</span> Agregar al Combate</button></div></div></div>` : ``}`;
});
const HPModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let hpPercentage;
  let hpColor;
  let newHP;
  let isDead;
  let { isOpen = false } = $$props;
  let { combatant = null } = $$props;
  let { isDM = false } = $$props;
  createEventDispatcher();
  let hpChangeValue = 0;
  let customValue = 0;
  let localDeathSaves = { successes: 0, failures: 0 };
  let lastOpenState = false;
  let lastCombatantId = "";
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.combatant === void 0 && $$bindings.combatant && combatant !== void 0) $$bindings.combatant(combatant);
  if ($$props.isDM === void 0 && $$bindings.isDM && isDM !== void 0) $$bindings.isDM(isDM);
  {
    if (isOpen && combatant) {
      if (!lastOpenState || lastCombatantId !== combatant.id) {
        combatant.temporaryHp || 0;
        localDeathSaves = combatant.deathSaves || { successes: 0, failures: 0 };
        lastCombatantId = combatant.id;
      }
      lastOpenState = true;
    } else if (!isOpen) {
      lastOpenState = false;
    }
  }
  {
    if (combatant) {
      newHP = combatant.currentHp;
    }
  }
  hpPercentage = combatant ? combatant.currentHp / combatant.maxHp * 100 : 0;
  hpColor = hpPercentage > 50 ? "success" : hpPercentage > 25 ? "warning" : "error";
  newHP = combatant ? Math.max(0, Math.min(combatant.maxHp, combatant.currentHp + hpChangeValue)) : 0;
  combatant ? newHP - combatant.currentHp : 0;
  combatant ? newHP / combatant.maxHp * 100 : 0;
  isDead = combatant && combatant.currentHp <= 0;
  localDeathSaves.successes >= 3;
  localDeathSaves.failures >= 3;
  return `${isOpen && combatant && isDM ? `<div class="modal modal-open z-50" role="dialog" aria-modal="true"><div class="card-parchment border-4 border-secondary w-11/12 max-w-2xl relative max-h-[90vh] flex flex-col"><button class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10 hover:bg-error/20" aria-label="Cerrar modal" data-svelte-h="svelte-kahe5o">✕</button>  <div class="p-4 flex-shrink-0 border-b-2 border-secondary"><h3 class="font-bold text-2xl font-medieval text-neutral text-center mb-3" data-svelte-h="svelte-f3fslb">💚 Gestión de Vida</h3>  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg border border-primary/30 flex items-center gap-3"><div class="avatar"><div class="w-12 h-12 rounded-full ring-2 ring-secondary"><div class="bg-primary/20 flex items-center justify-center"><span class="text-xl">${escape(combatant.isNpc ? "👹" : "🧙‍♂️")}</span></div></div></div> <div class="flex-1"><h4 class="text-lg font-medieval text-neutral font-bold">${escape(combatant.name)}</h4> <div class="flex gap-2 mt-1">${isDead ? `<div class="badge badge-xs badge-error" data-svelte-h="svelte-1i75sp6">💀 Caído</div>` : `${combatant.temporaryHp > 0 ? `<div class="badge badge-xs badge-info">🛡️ +${escape(combatant.temporaryHp)} temp</div>` : ``}`}</div></div></div></div>  <div class="tabs tabs-boxed bg-neutral/20 p-2 flex-shrink-0"><button class="${"tab flex-1 " + escape("tab-active", true)}">💚 HP Normal</button> <button class="${"tab flex-1 " + escape("", true)}">🛡️ HP Temporal</button> <button class="${"tab flex-1 " + escape("", true)}" ${!isDead ? "disabled" : ""}>💀 Death Saves</button></div>  <div class="flex-1 overflow-y-auto p-4">${` <div class="space-y-4"> <div class="gap-3"><div class="bg-neutral/10 p-3 rounded-lg border-2 border-primary/30"><p class="text-xs font-medieval text-neutral/60 text-center" data-svelte-h="svelte-15e8cb6">HP ACTUAL</p> <div class="text-center"><p class="text-2xl font-bold text-neutral">${escape(combatant.currentHp)}</p> <p class="text-sm text-neutral/60">de ${escape(combatant.maxHp)}</p></div> <progress class="${"progress progress-" + escape(hpColor, true) + " w-full h-3"}"${add_attribute("value", combatant.currentHp, 0)}${add_attribute("max", combatant.maxHp, 0)}></progress></div></div>  <div><label class="label" data-svelte-h="svelte-1b89huq"><span class="label-text font-medieval text-neutral">🎲 Cantidad de HP</span></label> <div class="flex gap-2"><input type="number" placeholder="Ej: 15" class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 flex-1 text-center text-2xl font-bold" min="0"${add_attribute("value", customValue, 0)}> <div class="flex gap-2"><button class="btn btn-error" ${"disabled"}><span class="text-xl" data-svelte-h="svelte-qwnz9x">💥</span>
                    Daño</button> <button class="btn btn-success" ${"disabled"}><span class="text-xl" data-svelte-h="svelte-cy0xo0">💚</span>
                    Curar</button></div></div></div> ${combatant.temporaryHp > 0 ? `<div class="bg-info/10 p-3 rounded-lg border border-info/30 mt-4"><div class="flex items-center justify-between mb-2"><span class="text-xs font-medieval text-neutral/70" data-svelte-h="svelte-tzs62y">HP TEMPORAL ACTIVO</span> <span class="badge badge-info">🛡️ ${escape(combatant.temporaryHp)}</span></div> <p class="text-xs text-neutral/60 italic" data-svelte-h="svelte-1a6d5wt">💡 El daño reducirá primero los HP temporales</p></div>` : ``}</div>`}</div></div></div>` : `${isOpen && combatant && !isDM ? ` <div class="modal modal-open z-50"><div class="card-parchment border-4 border-error w-11/12 max-w-md text-center p-8"><div class="text-6xl mb-4" data-svelte-h="svelte-13ghcez">🚫</div> <h3 class="text-2xl font-medieval text-neutral mb-3" data-svelte-h="svelte-13fk1x3">Acceso Denegado</h3> <p class="text-neutral/70 font-body mb-6" data-svelte-h="svelte-1myopqh">Solo el Dungeon Master puede gestionar los puntos de vida.</p> <button class="btn btn-dnd" data-svelte-h="svelte-1bzkva0">Entendido</button></div></div>` : ``}`}`;
});
const ConditionModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { combatant = null } = $$props;
  let { isDM = false } = $$props;
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
  if ($$props.isDM === void 0 && $$bindings.isDM && isDM !== void 0) $$bindings.isDM(isDM);
  return `${isOpen && combatant && isDM ? `<div class="modal modal-open z-50" role="dialog" aria-modal="true" aria-labelledby="condition-modal-title"><div class="card-parchment border-4 border-secondary w-5/6 h-5/6 mx-4 relative flex flex-col"><button class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10 hover:bg-error/20" aria-label="Cerrar modal" data-svelte-h="svelte-hn98im">✕</button> <div class="p-4 flex-shrink-0 bg-gradient-to-b from-[#f4e4c1] to-transparent"><h3 id="condition-modal-title" class="font-bold text-2xl font-medieval text-neutral text-center mb-3" data-svelte-h="svelte-1wgccba">⚠️ Estados de Combate</h3>  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg border border-primary/30 flex items-center gap-3"><div class="avatar"><div class="w-12 h-12 rounded-full ring-2 ring-secondary"><div class="bg-primary/20 flex items-center justify-center"><span class="text-xl">${escape(combatant.isNpc ? "👹" : "🧙‍♂️")}</span></div></div></div> <div class="flex-1 min-w-0"><h4 class="text-lg font-medieval text-neutral font-bold truncate">${escape(combatant.name)}</h4> <div class="flex gap-2 mt-1"><div class="badge badge-xs bg-error/30 text-neutral border-error/50">❤️ ${escape(combatant.currentHp)}/${escape(combatant.maxHp)}</div> <div class="badge badge-xs bg-info/30 text-neutral border-info/50">🛡️ ${escape(combatant.armorClass)}</div></div></div></div></div>  <div class="flex-1 overflow-hidden flex flex-col md:flex-row gap-3 p-4" style="min-height: 0;"> <div class="md:w-1/3 flex flex-col" style="min-height: 300px;"><div class="bg-warning/10 rounded-lg border-2 border-warning/30 p-3 flex flex-col h-full"><div class="flex items-center justify-between mb-3"><h5 class="font-medieval text-neutral font-bold flex items-center gap-2" data-svelte-h="svelte-12hilzf"><span>⚠️</span> <span>Estados Activos</span></h5> <span class="badge badge-warning badge-sm">${escape(combatant.conditions && Array.isArray(combatant.conditions) ? combatant.conditions.length : 0)}</span></div> ${combatant.conditions && Array.isArray(combatant.conditions) && combatant.conditions.length > 0 ? `<div class="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">${each(combatant.conditions, (condition) => {
    return `<div class="bg-warning/20 rounded px-3 py-2 border border-warning/40 flex items-center justify-between gap-2 hover:bg-warning/30 transition-colors"><span class="font-medieval text-sm text-neutral flex-1">${escape(condition)}</span> <button class="btn btn-xs btn-circle btn-ghost hover:bg-error hover:text-white" title="Eliminar" data-svelte-h="svelte-5t970f">✕</button> </div>`;
  })}</div>` : `<div class="flex-1 flex flex-col items-center justify-center text-center py-6" data-svelte-h="svelte-gjvbew"><div class="text-3xl mb-2 opacity-50">😌</div> <p class="text-xs text-neutral/60 font-body italic">Sin estados activos</p></div>`}</div></div>  <div class="md:w-2/3 flex flex-col" style="min-height: 300px;"> <div class="mb-3"><div class="relative"><input type="text" placeholder="Buscar condición (ej: blinded, poisoned, stunned)..." class="input input-bordered bg-[#2d241c] text-base-content border-primary/50 w-full pr-10"${add_attribute("value", searchQuery, 0)}> <div class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral/50" data-svelte-h="svelte-1duc997">🔍</div></div> <p class="text-xs text-neutral/50 mt-1 italic" data-svelte-h="svelte-hqlo3f">Base de datos oficial de D&amp;D 5e</p></div>  <div class="flex-1 overflow-y-auto custom-scrollbar bg-neutral/5 rounded-lg border border-primary/20 p-3">${loading ? `<div class="flex flex-col items-center justify-center h-full" data-svelte-h="svelte-io7n20"><span class="loading loading-spinner loading-md text-secondary"></span> <p class="text-xs text-neutral/60 mt-2">Buscando...</p></div>` : `${suggestions.length > 0 ? `<div class="space-y-2">${each(suggestions, (suggestion) => {
    let currentConditions = Array.isArray(combatant.conditions) ? combatant.conditions : [], isActive = currentConditions.includes(suggestion.name);
    return `  <button ${isActive ? "disabled" : ""} class="${"w-full text-left p-3 rounded-lg border-2 transition-all " + escape(
      isActive ? "border-success/50 bg-success/10 cursor-not-allowed opacity-60" : "border-primary/30 bg-[#f4e4c1]/50 hover:bg-[#f4e4c1] hover:border-primary/50 hover:shadow-md",
      true
    )}"><div class="flex items-start justify-between gap-2 mb-1"><span class="font-medieval font-bold text-neutral">${escape(suggestion.name)}</span> ${isActive ? `<span class="badge badge-xs badge-success shrink-0" data-svelte-h="svelte-mm16lr">✓ Activo</span>` : ``}</div> <p class="text-xs text-neutral/70 font-body leading-snug">${escape(open5eApi.cleanDescription(suggestion.desc, 120))}</p> </button>`;
  })}</div>` : `${searchQuery.trim() ? `<div class="flex flex-col items-center justify-center h-full text-center"><div class="text-4xl mb-3" data-svelte-h="svelte-sy51vw">🔍</div> <p class="text-neutral/70 font-body mb-3">No se encontró &quot;<span class="font-bold">${escape(searchQuery)}</span>&quot;</p> <button class="btn btn-primary btn-sm" data-svelte-h="svelte-1rs0apo">➕ Agregar como personalizado</button></div>` : `<div class="flex flex-col items-center justify-center h-full text-center px-4" data-svelte-h="svelte-981qn5"><div class="text-5xl mb-3">📖</div> <p class="text-neutral/70 font-body mb-2">Escribe para buscar condiciones</p> <div class="flex flex-wrap gap-1 justify-center text-xs text-neutral/50 mt-2"><span class="bg-neutral/10 px-2 py-1 rounded">blinded</span> <span class="bg-neutral/10 px-2 py-1 rounded">charmed</span> <span class="bg-neutral/10 px-2 py-1 rounded">frightened</span> <span class="bg-neutral/10 px-2 py-1 rounded">grappled</span> <span class="bg-neutral/10 px-2 py-1 rounded">paralyzed</span></div></div>`}`}`}</div></div></div></div></div>` : `${isOpen && combatant && !isDM ? ` <div class="modal modal-open z-50"><div class="card-parchment border-4 border-secondary w-11/12 max-w-md relative p-6"><button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" data-svelte-h="svelte-1t0z3ws">✕</button> <h3 class="font-bold text-2xl font-medieval text-neutral text-center mb-4">⚠️ Estados de ${escape(combatant.name)}</h3> ${combatant.conditions && Array.isArray(combatant.conditions) && combatant.conditions.length > 0 ? `<div class="space-y-2">${each(combatant.conditions, (condition) => {
    return `<div class="bg-warning/20 rounded px-3 py-2 border border-warning/40"><span class="font-medieval text-sm text-neutral">${escape(condition)}</span> </div>`;
  })}</div>` : `<div class="text-center py-6" data-svelte-h="svelte-18t8x0o"><div class="text-4xl mb-2">😌</div> <p class="text-neutral/70 font-body">Sin estados activos</p></div>`} <p class="text-xs text-center text-neutral/60 italic mt-4" data-svelte-h="svelte-1mg2e4g">Solo el DM puede modificar estados</p> <button class="btn btn-dnd w-full mt-4" data-svelte-h="svelte-1vgxpha">Cerrar</button></div></div>` : ``}`}`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isDM;
  let $$unsubscribe_userStore;
  let $page, $$unsubscribe_page;
  $$unsubscribe_userStore = subscribe(userStore, (value) => value);
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  headerTitle.set("Combate");
  let campaign = null;
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
    isDM = campaign;
    $$rendered = `<div class="min-h-screen flex flex-col">${``} <div class="flex flex-1"><div class="flex-1">${`<div class="flex items-center justify-center h-full" data-svelte-h="svelte-xh23f2"><span class="loading loading-spinner loading-lg text-secondary"></span></div>`}</div></div></div> ${``} ${validate_component(HPModal, "HPModal").$$render(
      $$result,
      {
        combatant: selectedCombatant,
        isDM: !!isDM,
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
        isDM: !!isDM,
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
