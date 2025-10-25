import { c as create_ssr_component, b as subscribe, d as add_attribute, e as escape, f as each, v as validate_component } from "../../chunks/ssr.js";
import "firebase/auth";
import "../../chunks/firebase.js";
import { l as loadingStore, u as userStore } from "../../chunks/authStore.js";
import { h as headerTitle } from "../../chunks/uiStore.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
import { p as page } from "../../chunks/stores.js";
import "../../chunks/api.js";
const Sidebar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let currentPath;
  let isCombatPage;
  let isCharactersPage;
  let isCampaignPage;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { campaignId } = $$props;
  let { isOpen = false } = $$props;
  if ($$props.campaignId === void 0 && $$bindings.campaignId && campaignId !== void 0) $$bindings.campaignId(campaignId);
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  currentPath = $page.url.pathname;
  isCombatPage = currentPath === `/campaigns/${campaignId}/combat`;
  isCharactersPage = currentPath === `/campaigns/${campaignId}/characters`;
  isCampaignPage = currentPath === `/campaigns/${campaignId}`;
  $$unsubscribe_page();
  return `<div${add_attribute("class", `bg-neutral border-r-4 border-secondary transition-all duration-300 fixed top-0 left-0 h-full z-40 ${isOpen ? "w-64" : "w-20"}`, 0)}><div class="p-4 space-y-2 flex flex-col h-full"> <button class="btn btn-ghost btn-sm w-full text-secondary hover:text-accent mb-4"${add_attribute("title", isOpen ? "Ocultar sidebar" : "Mostrar sidebar", 0)}><span class="text-xl">${escape(isOpen ? "◀" : "▶")}</span></button>  <div class="space-y-2 flex-1 flex flex-col">${each(
    [
      {
        path: `/campaigns/${campaignId}`,
        label: "Home",
        icon: "🏠",
        active: isCampaignPage
      },
      {
        path: `/campaigns/${campaignId}/combat`,
        label: "Combate",
        icon: "⚔️",
        active: isCombatPage
      },
      {
        path: `/campaigns/${campaignId}/characters`,
        label: "Personajes",
        icon: "🧙‍♂️",
        active: isCharactersPage
      }
    ],
    (item) => {
      return `<button${add_attribute(
        "class",
        `btn font-medieval transition-all duration-300 ${item.active ? "btn-dnd" : "btn-ghost text-secondary hover:text-accent"} ${isOpen ? "w-full justify-start" : "w-22 justify-center"}`,
        0
      )}${add_attribute("title", item.label, 0)}><div class="flex items-center justify-center text-center w-fit ml-3"><span class="text-xl">${escape(item.icon)}</span> <span${add_attribute(
        "class",
        `ml-3 overflow-hidden transition-all duration-300 ${isOpen ? "max-w-[180px] opacity-100" : "max-w-0 opacity-0"}`,
        0
      )}>${escape(item.label)} </span></div> </button>`;
    }
  )}</div></div></div>`;
});
const css = {
  code: ".space-y-3.svelte-1sirqyk::-webkit-scrollbar{width:8px}.space-y-3.svelte-1sirqyk::-webkit-scrollbar-track{background:rgba(139, 69, 19, 0.1);border-radius:4px}.space-y-3.svelte-1sirqyk::-webkit-scrollbar-thumb{background:linear-gradient(to bottom, #8B4513, #654321);border-radius:4px}.space-y-3.svelte-1sirqyk::-webkit-scrollbar-thumb:hover{background:linear-gradient(to bottom, #A0522D, #8B4513)}",
  map: `{"version":3,"file":"InvitationsButton.svelte","sources":["InvitationsButton.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { onMount } from \\"svelte\\";\\nimport { api } from \\"$lib/api/api\\";\\nexport let onInvitationResponded = () => {\\n};\\nlet invitations = [];\\nlet loading = false;\\nonMount(() => {\\n  loadInvitations();\\n  const interval = setInterval(loadInvitations, 3e4);\\n  return () => clearInterval(interval);\\n});\\nasync function loadInvitations() {\\n  try {\\n    invitations = await api.getMyInvitations();\\n  } catch (err) {\\n    console.error(\\"Error loading invitations:\\", err);\\n  }\\n}\\nasync function respond(invitationId, action) {\\n  try {\\n    loading = true;\\n    await api.respondToInvitation(invitationId, action);\\n    await loadInvitations();\\n    onInvitationResponded();\\n  } catch (err) {\\n    alert(err.message);\\n  } finally {\\n    loading = false;\\n  }\\n}\\n<\/script>\\r\\n\\r\\n<div class=\\"dropdown dropdown-end\\">\\r\\n  <label tabindex=\\"0\\" class=\\"btn btn-ghost btn-circle indicator ring-2 ring-secondary/50 hover:ring-secondary transition-all\\">\\r\\n    <svg xmlns=\\"http://www.w3.org/2000/svg\\" class=\\"h-6 w-6 text-secondary\\" fill=\\"none\\" viewBox=\\"0 0 24 24\\" stroke=\\"currentColor\\">\\r\\n      <path stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76\\" />\\r\\n    </svg>\\r\\n    {#if invitations.length > 0}\\r\\n      <span class=\\"badge badge-sm badge-ornate indicator-item animate-pulse\\">{invitations.length}</span>\\r\\n    {/if}\\r\\n  </label>\\r\\n  \\r\\n  <div tabindex=\\"0\\" class=\\"mt-3 z-[1] card card-compact dropdown-content w-96 shadow-2xl bg-neutral border-2 border-secondary\\">\\r\\n    <div class=\\"card-body\\">\\r\\n      <h3 class=\\"card-title text-xl font-medieval text-secondary\\">\\r\\n        📜 Invitaciones\\r\\n        {#if invitations.length > 0}\\r\\n          <span class=\\"badge badge-ornate\\">{invitations.length}</span>\\r\\n        {/if}\\r\\n      </h3>\\r\\n\\r\\n      <div class=\\"divider my-1 opacity-30\\">⚔️</div>\\r\\n\\r\\n      {#if invitations.length === 0}\\r\\n        <div class=\\"text-center py-6\\">\\r\\n          <div class=\\"text-4xl mb-2 opacity-50\\">📭</div>\\r\\n          <p class=\\"text-base-content/70 font-body italic\\">No hay invitaciones pendientes</p>\\r\\n        </div>\\r\\n      {:else}\\r\\n        <div class=\\"space-y-3 max-h-96 overflow-y-auto pr-2\\">\\r\\n          {#each invitations as invitation}\\r\\n            <div class=\\"bg-gradient-to-br from-[#f4e4c1] to-[#e8d4a8] rounded-lg p-4 border-2 border-primary/30 shadow-md\\">\\r\\n              <div class=\\"flex items-start gap-3\\">\\r\\n                <div class=\\"avatar\\">\\r\\n                  <div class=\\"w-12 rounded-full ring-2 ring-secondary ring-offset-2 ring-offset-[#f4e4c1]\\">\\r\\n                    <img src={invitation.fromPhoto} alt={invitation.fromName} />\\r\\n                  </div>\\r\\n                </div>\\r\\n                <div class=\\"flex-1 min-w-0\\">\\r\\n                  <p class=\\"font-bold text-sm text-neutral font-body\\">{invitation.fromName}</p>\\r\\n                  <p class=\\"text-xs text-neutral/60 font-body italic\\">te invita a la campaña</p>\\r\\n                  <p class=\\"font-semibold text-primary font-medieval mt-1\\">{invitation.campaignName}</p>\\r\\n                  \\r\\n                  <div class=\\"flex gap-2 mt-3\\">\\r\\n                    <button \\r\\n                      class=\\"btn btn-success btn-xs text-white font-medieval\\"\\r\\n                      on:click={() => respond(invitation.id, 'accept')}\\r\\n                      disabled={loading}\\r\\n                    >\\r\\n                      ⚔️ Unirme\\r\\n                    </button>\\r\\n                    <button \\r\\n                      class=\\"btn btn-error btn-xs text-white font-medieval\\"\\r\\n                      on:click={() => respond(invitation.id, 'reject')}\\r\\n                      disabled={loading}\\r\\n                    >\\r\\n                      ✕ Declinar\\r\\n                    </button>\\r\\n                  </div>\\r\\n                </div>\\r\\n              </div>\\r\\n            </div>\\r\\n          {/each}\\r\\n        </div>\\r\\n      {/if}\\r\\n    </div>\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style>\\r\\n  /* Scroll personalizado para las invitaciones */\\r\\n  .space-y-3::-webkit-scrollbar {\\r\\n    width: 8px;\\r\\n  }\\r\\n\\r\\n  .space-y-3::-webkit-scrollbar-track {\\r\\n    background: rgba(139, 69, 19, 0.1);\\r\\n    border-radius: 4px;\\r\\n  }\\r\\n\\r\\n  .space-y-3::-webkit-scrollbar-thumb {\\r\\n    background: linear-gradient(to bottom, #8B4513, #654321);\\r\\n    border-radius: 4px;\\r\\n  }\\r\\n\\r\\n  .space-y-3::-webkit-scrollbar-thumb:hover {\\r\\n    background: linear-gradient(to bottom, #A0522D, #8B4513);\\r\\n  }\\r\\n</style>"],"names":[],"mappings":"AAqGE,yBAAU,mBAAoB,CAC5B,KAAK,CAAE,GACT,CAEA,yBAAU,yBAA0B,CAClC,UAAU,CAAE,KAAK,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAClC,aAAa,CAAE,GACjB,CAEA,yBAAU,yBAA0B,CAClC,UAAU,CAAE,gBAAgB,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,CAAC,OAAO,CAAC,CACxD,aAAa,CAAE,GACjB,CAEA,yBAAU,yBAAyB,MAAO,CACxC,UAAU,CAAE,gBAAgB,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,CAAC,OAAO,CACzD"}`
};
const InvitationsButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { onInvitationResponded = () => {
  } } = $$props;
  let invitations = [];
  if ($$props.onInvitationResponded === void 0 && $$bindings.onInvitationResponded && onInvitationResponded !== void 0) $$bindings.onInvitationResponded(onInvitationResponded);
  $$result.css.add(css);
  return `<div class="dropdown dropdown-end"><label tabindex="0" class="btn btn-ghost btn-circle indicator ring-2 ring-secondary/50 hover:ring-secondary transition-all"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path></svg> ${invitations.length > 0 ? `<span class="badge badge-sm badge-ornate indicator-item animate-pulse">${escape(invitations.length)}</span>` : ``}</label> <div tabindex="0" class="mt-3 z-[1] card card-compact dropdown-content w-96 shadow-2xl bg-neutral border-2 border-secondary"><div class="card-body"><h3 class="card-title text-xl font-medieval text-secondary">📜 Invitaciones
        ${invitations.length > 0 ? `<span class="badge badge-ornate">${escape(invitations.length)}</span>` : ``}</h3> <div class="divider my-1 opacity-30" data-svelte-h="svelte-1gecnns">⚔️</div> ${invitations.length === 0 ? `<div class="text-center py-6" data-svelte-h="svelte-whrkyc"><div class="text-4xl mb-2 opacity-50">📭</div> <p class="text-base-content/70 font-body italic">No hay invitaciones pendientes</p></div>` : `<div class="space-y-3 max-h-96 overflow-y-auto pr-2 svelte-1sirqyk">${each(invitations, (invitation) => {
    return `<div class="bg-gradient-to-br from-[#f4e4c1] to-[#e8d4a8] rounded-lg p-4 border-2 border-primary/30 shadow-md"><div class="flex items-start gap-3"><div class="avatar"><div class="w-12 rounded-full ring-2 ring-secondary ring-offset-2 ring-offset-[#f4e4c1]"><img${add_attribute("src", invitation.fromPhoto, 0)}${add_attribute("alt", invitation.fromName, 0)}> </div></div> <div class="flex-1 min-w-0"><p class="font-bold text-sm text-neutral font-body">${escape(invitation.fromName)}</p> <p class="text-xs text-neutral/60 font-body italic" data-svelte-h="svelte-11uyp94">te invita a la campaña</p> <p class="font-semibold text-primary font-medieval mt-1">${escape(invitation.campaignName)}</p> <div class="flex gap-2 mt-3"><button class="btn btn-success btn-xs text-white font-medieval" ${""}>⚔️ Unirme</button> <button class="btn btn-error btn-xs text-white font-medieval" ${""}>✕ Declinar
                    </button></div> </div></div> </div>`;
  })}</div>`}</div></div> </div>`;
});
function handleInvitationResponded() {
  location.reload();
}
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let campaignId;
  let isDashboard;
  let isCampaign;
  let $page, $$unsubscribe_page;
  let $loadingStore, $$unsubscribe_loadingStore;
  let $headerTitle, $$unsubscribe_headerTitle;
  let $userStore, $$unsubscribe_userStore;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_loadingStore = subscribe(loadingStore, (value) => $loadingStore = value);
  $$unsubscribe_headerTitle = subscribe(headerTitle, (value) => $headerTitle = value);
  $$unsubscribe_userStore = subscribe(userStore, (value) => $userStore = value);
  let sidebarOpen = false;
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    campaignId = $page.params.id;
    isDashboard = $page.url.pathname === "/dashboard";
    isCampaign = $page.url.pathname.startsWith("/campaigns/");
    $$rendered = `<div class="min-h-screen relative" data-theme="dnd">${$loadingStore ? ` <div class="flex flex-col items-center justify-center h-screen gap-4" data-svelte-h="svelte-36y11s"><div class="text-6xl">🎲</div> <span class="loading loading-spinner loading-lg text-secondary"></span> <p class="font-medieval text-secondary">Cargando grimorio...</p></div>` : `${isCampaign && campaignId ? `${validate_component(Sidebar, "Sidebar").$$render(
      $$result,
      { campaignId, isOpen: sidebarOpen },
      {
        isOpen: ($$value) => {
          sidebarOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}` : ``}  <div class="navbar-medieval sticky top-0 z-10 w-full flex items-center justify-between px-6">${isDashboard ? ` <div class="flex-1"></div>  <div class="flex justify-center items-center flex-1 h-20"><h1 class="btn btn-ghost text-xl font-medieval text-secondary hover:text-accent">${escape($headerTitle)}</h1></div>  <div class="flex justify-end items-center flex-1 gap-2">${validate_component(InvitationsButton, "InvitationsButton").$$render(
      $$result,
      {
        onInvitationResponded: handleInvitationResponded
      },
      {},
      {}
    )} <div class="dropdown dropdown-end"><label tabindex="0" class="btn btn-ghost btn-circle avatar ring-2 ring-secondary ring-offset-2 ring-offset-neutral"><div class="w-10 rounded-full"><img${add_attribute("src", $userStore?.photoURL || "", 0)}${add_attribute("alt", $userStore?.displayName || "", 0)}></div></label> <ul tabindex="0" class="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content bg-neutral rounded-box w-52 border-2 border-secondary"><li><a class="text-base-content hover:text-secondary font-medieval" data-svelte-h="svelte-14mgj6a">🚪 Cerrar Sesión</a></li></ul></div></div>` : ` <div class="flex-1 z-1"></div> <div class="flex justify-center items-center flex-1 h-20"><h1 class="btn btn-ghost text-xl font-medieval text-secondary hover:text-accent">${escape($headerTitle)}</h1></div> <div class="flex-1 flex justify-end">${isCampaign ? `<button class="btn btn-ghost font-medieval text-secondary hover:text-accent" data-svelte-h="svelte-cvo9ts">Volver al Grimorio →</button>` : ``}</div>`}</div>  <div class="relative">${slots.default ? slots.default({}) : ``}</div>`}</div>`;
  } while (!$$settled);
  $$unsubscribe_page();
  $$unsubscribe_loadingStore();
  $$unsubscribe_headerTitle();
  $$unsubscribe_userStore();
  return $$rendered;
});
export {
  Layout as default
};
