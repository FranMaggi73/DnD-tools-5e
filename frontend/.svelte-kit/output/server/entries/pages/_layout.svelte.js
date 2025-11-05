import { c as create_ssr_component, b as subscribe, d as add_attribute, e as each, f as escape, v as validate_component } from "../../chunks/ssr.js";
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
const Sidebar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let currentPath;
  let isCombatPage;
  let isCharactersPage;
  let isNotesPage;
  let isCampaignPage;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { campaignId } = $$props;
  let { isOpen = false } = $$props;
  let btnRefs = [];
  if ($$props.campaignId === void 0 && $$bindings.campaignId && campaignId !== void 0) $$bindings.campaignId(campaignId);
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  currentPath = $page.url.pathname;
  isCombatPage = currentPath === `/campaigns/${campaignId}/combat`;
  isCharactersPage = currentPath === `/campaigns/${campaignId}/characters`;
  isNotesPage = currentPath === `/campaigns/${campaignId}/notes`;
  isCampaignPage = currentPath === `/campaigns/${campaignId}`;
  $$unsubscribe_page();
  return ` ${isOpen ? `<div class="fixed inset-0 bg-black/40 z-40" aria-hidden="true"></div>` : ``} <div${add_attribute(
    "class",
    `fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} w-72`,
    0
  )} role="navigation" aria-label="Sidebar navegación"${add_attribute("aria-hidden", !isOpen, 0)}><div class="bg-neutral border-r-4 border-secondary h-full flex flex-col p-4 shadow-xl"><div class="flex items-center"><button class="btn btn-ghost btn-square ml-2" aria-label="Cerrar menú" aria-controls="sidebar" data-svelte-h="svelte-loq967"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button></div> <div class="space-y-2 flex-1 flex flex-col"><button class="btn font-medieval transition-all duration-200 flex items-center gap-3 justify-start px-3 py-2 btn-ghost text-secondary hover:text-accent" data-svelte-h="svelte-9ry9j6"><span class="text-2xl">📜</span> <span class="ml-2">Volver al Grimorio</span></button> ${each(
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
      },
      {
        path: `/campaigns/${campaignId}/notes`,
        label: "Notas",
        icon: "📝",
        active: isNotesPage
      }
    ],
    (item, i) => {
      return `<button${add_attribute(
        "class",
        `btn font-medieval transition-all duration-200 flex items-center gap-3 justify-start px-3 py-2
                  ${item.active ? "btn-dnd" : "btn-ghost text-secondary hover:text-accent"}`,
        0
      )}${add_attribute("title", item.label, 0)}${add_attribute("aria-current", item.active ? "page" : void 0, 0)}${add_attribute("this", btnRefs[i], 0)}><span class="text-xl">${escape(item.icon)}</span> <span class="ml-2">${escape(item.label)}</span> </button>`;
    }
  )}</div></div></div>`;
});
const css$1 = {
  code: ".space-y-3.svelte-1sirqyk::-webkit-scrollbar{width:8px}.space-y-3.svelte-1sirqyk::-webkit-scrollbar-track{background:rgba(139, 69, 19, 0.1);border-radius:4px}.space-y-3.svelte-1sirqyk::-webkit-scrollbar-thumb{background:linear-gradient(to bottom, #8B4513, #654321);border-radius:4px}.space-y-3.svelte-1sirqyk::-webkit-scrollbar-thumb:hover{background:linear-gradient(to bottom, #A0522D, #8B4513)}",
  map: `{"version":3,"file":"InvitationsButton.svelte","sources":["InvitationsButton.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { onMount } from \\"svelte\\";\\nimport { api } from \\"$lib/api/api\\";\\nexport let onInvitationResponded = () => {\\n};\\nlet invitations = [];\\nlet loading = false;\\nonMount(() => {\\n  loadInvitations();\\n  const interval = setInterval(loadInvitations, 3e4);\\n  return () => clearInterval(interval);\\n});\\nasync function loadInvitations() {\\n  try {\\n    invitations = await api.getMyInvitations();\\n  } catch (err) {\\n    console.error(\\"Error loading invitations:\\", err);\\n  }\\n}\\nasync function respond(invitationId, action) {\\n  try {\\n    loading = true;\\n    await api.respondToInvitation(invitationId, action);\\n    await loadInvitations();\\n    onInvitationResponded();\\n  } catch (err) {\\n    alert(err.message);\\n  } finally {\\n    loading = false;\\n  }\\n}\\n<\/script>\\r\\n\\r\\n<div class=\\"dropdown dropdown-end\\">\\r\\n  <label tabindex=\\"0\\" class=\\"btn btn-ghost btn-circle indicator ring-2 ring-secondary/50 hover:ring-secondary transition-all\\">\\r\\n    <svg xmlns=\\"http://www.w3.org/2000/svg\\" class=\\"h-6 w-6 text-secondary\\" fill=\\"none\\" viewBox=\\"0 0 24 24\\" stroke=\\"currentColor\\">\\r\\n      <path stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76\\" />\\r\\n    </svg>\\r\\n    {#if invitations.length > 0}\\r\\n      <span class=\\"badge badge-sm badge-ornate indicator-item animate-pulse\\">{invitations.length}</span>\\r\\n    {/if}\\r\\n  </label>\\r\\n  \\r\\n <div\\r\\n  tabindex=\\"0\\"\\r\\n  class=\\"mt-3 z-[1] card card-compact dropdown-content w-96 max-w-[73vw] sm:max-w-sm md:max-w-md shadow-2xl bg-neutral border-2 border-secondary\\"\\r\\n>\\r\\n    <div class=\\"card-body\\">\\r\\n      <h3 class=\\"card-title text-xl font-medieval text-secondary\\">\\r\\n        📜 Invitaciones\\r\\n        {#if invitations.length > 0}\\r\\n          <span class=\\"badge badge-ornate\\">{invitations.length}</span>\\r\\n        {/if}\\r\\n      </h3>\\r\\n\\r\\n      <div class=\\"divider my-1 opacity-30\\">⚔️</div>\\r\\n\\r\\n      {#if invitations.length === 0}\\r\\n        <div class=\\"text-center py-6\\">\\r\\n          <div class=\\"text-4xl mb-2 opacity-50\\">📭</div>\\r\\n          <p class=\\"text-base-content/70 font-body italic\\">No hay invitaciones pendientes</p>\\r\\n        </div>\\r\\n      {:else}\\r\\n        <div class=\\"space-y-3 max-h-96 overflow-y-auto pr-2\\">\\r\\n          {#each invitations as invitation}\\r\\n            <div class=\\"bg-gradient-to-br from-[#f4e4c1] to-[#e8d4a8] rounded-lg p-4 border-2 border-primary/30 shadow-md\\">\\r\\n              <div class=\\"flex items-start gap-3\\">\\r\\n                <div class=\\"avatar\\">\\r\\n                  <div class=\\"w-12 rounded-full ring-2 ring-secondary ring-offset-2 ring-offset-[#f4e4c1]\\">\\r\\n                    <img src={invitation.fromPhoto} alt={invitation.fromName} />\\r\\n                  </div>\\r\\n                </div>\\r\\n                <div class=\\"flex-1 min-w-0\\">\\r\\n                  <p class=\\"font-bold text-sm text-neutral font-body\\">{invitation.fromName}</p>\\r\\n                  <p class=\\"text-xs text-neutral/60 font-body italic\\">te invita a la campaña</p>\\r\\n                  <p class=\\"font-semibold text-primary font-medieval mt-1\\">{invitation.campaignName}</p>\\r\\n                  \\r\\n                  <div class=\\"flex gap-2 mt-3\\">\\r\\n                    <button \\r\\n                      class=\\"btn btn-success btn-xs text-white font-medieval\\"\\r\\n                      on:click={() => respond(invitation.id, 'accept')}\\r\\n                      disabled={loading}\\r\\n                    >\\r\\n                      ⚔️ Unirme\\r\\n                    </button>\\r\\n                    <button \\r\\n                      class=\\"btn btn-error btn-xs text-white font-medieval\\"\\r\\n                      on:click={() => respond(invitation.id, 'reject')}\\r\\n                      disabled={loading}\\r\\n                    >\\r\\n                      ✕ Declinar\\r\\n                    </button>\\r\\n                  </div>\\r\\n                </div>\\r\\n              </div>\\r\\n            </div>\\r\\n          {/each}\\r\\n        </div>\\r\\n      {/if}\\r\\n    </div>\\r\\n  </div>\\r\\n</div>\\r\\n\\r\\n<style>\\r\\n  /* Scroll personalizado para las invitaciones */\\r\\n  .space-y-3::-webkit-scrollbar {\\r\\n    width: 8px;\\r\\n  }\\r\\n\\r\\n  .space-y-3::-webkit-scrollbar-track {\\r\\n    background: rgba(139, 69, 19, 0.1);\\r\\n    border-radius: 4px;\\r\\n  }\\r\\n\\r\\n  .space-y-3::-webkit-scrollbar-thumb {\\r\\n    background: linear-gradient(to bottom, #8B4513, #654321);\\r\\n    border-radius: 4px;\\r\\n  }\\r\\n\\r\\n  .space-y-3::-webkit-scrollbar-thumb:hover {\\r\\n    background: linear-gradient(to bottom, #A0522D, #8B4513);\\r\\n  }\\r\\n</style>"],"names":[],"mappings":"AAwGE,yBAAU,mBAAoB,CAC5B,KAAK,CAAE,GACT,CAEA,yBAAU,yBAA0B,CAClC,UAAU,CAAE,KAAK,GAAG,CAAC,CAAC,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CAClC,aAAa,CAAE,GACjB,CAEA,yBAAU,yBAA0B,CAClC,UAAU,CAAE,gBAAgB,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,CAAC,OAAO,CAAC,CACxD,aAAa,CAAE,GACjB,CAEA,yBAAU,yBAAyB,MAAO,CACxC,UAAU,CAAE,gBAAgB,EAAE,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC,CAAC,OAAO,CACzD"}`
};
const InvitationsButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { onInvitationResponded = () => {
  } } = $$props;
  let invitations = [];
  if ($$props.onInvitationResponded === void 0 && $$bindings.onInvitationResponded && onInvitationResponded !== void 0) $$bindings.onInvitationResponded(onInvitationResponded);
  $$result.css.add(css$1);
  return `<div class="dropdown dropdown-end"><label tabindex="0" class="btn btn-ghost btn-circle indicator ring-2 ring-secondary/50 hover:ring-secondary transition-all"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"></path></svg> ${invitations.length > 0 ? `<span class="badge badge-sm badge-ornate indicator-item animate-pulse">${escape(invitations.length)}</span>` : ``}</label> <div tabindex="0" class="mt-3 z-[1] card card-compact dropdown-content w-96 max-w-[73vw] sm:max-w-sm md:max-w-md shadow-2xl bg-neutral border-2 border-secondary"><div class="card-body"><h3 class="card-title text-xl font-medieval text-secondary">📜 Invitaciones
        ${invitations.length > 0 ? `<span class="badge badge-ornate">${escape(invitations.length)}</span>` : ``}</h3> <div class="divider my-1 opacity-30" data-svelte-h="svelte-1gecnns">⚔️</div> ${invitations.length === 0 ? `<div class="text-center py-6" data-svelte-h="svelte-whrkyc"><div class="text-4xl mb-2 opacity-50">📭</div> <p class="text-base-content/70 font-body italic">No hay invitaciones pendientes</p></div>` : `<div class="space-y-3 max-h-96 overflow-y-auto pr-2 svelte-1sirqyk">${each(invitations, (invitation) => {
    return `<div class="bg-gradient-to-br from-[#f4e4c1] to-[#e8d4a8] rounded-lg p-4 border-2 border-primary/30 shadow-md"><div class="flex items-start gap-3"><div class="avatar"><div class="w-12 rounded-full ring-2 ring-secondary ring-offset-2 ring-offset-[#f4e4c1]"><img${add_attribute("src", invitation.fromPhoto, 0)}${add_attribute("alt", invitation.fromName, 0)}> </div></div> <div class="flex-1 min-w-0"><p class="font-bold text-sm text-neutral font-body">${escape(invitation.fromName)}</p> <p class="text-xs text-neutral/60 font-body italic" data-svelte-h="svelte-11uyp94">te invita a la campaña</p> <p class="font-semibold text-primary font-medieval mt-1">${escape(invitation.campaignName)}</p> <div class="flex gap-2 mt-3"><button class="btn btn-success btn-xs text-white font-medieval" ${""}>⚔️ Unirme</button> <button class="btn btn-error btn-xs text-white font-medieval" ${""}>✕ Declinar
                    </button></div> </div></div> </div>`;
  })}</div>`}</div></div> </div>`;
});
const css = {
  code: ".navbar-medieval.svelte-1b5zlnt{display:flex;flex-wrap:nowrap}body{overflow-x:hidden}.btn-circle.svelte-1b5zlnt{min-width:2.5rem;min-height:2.5rem}@media(min-width: 640px){.btn-circle.svelte-1b5zlnt{min-width:2.75rem;min-height:2.75rem}}.dropdown-content.svelte-1b5zlnt{z-index:60 !important}",
  map: `{"version":3,"file":"+layout.svelte","sources":["+layout.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { onMount } from \\"svelte\\";\\nimport { onAuthStateChanged, signOut } from \\"firebase/auth\\";\\nimport { auth } from \\"$lib/firebase\\";\\nimport { userStore, loadingStore, tokenStore } from \\"$lib/stores/authStore\\";\\nimport { headerTitle } from \\"$lib/stores/uiStore\\";\\nimport { goto } from \\"$app/navigation\\";\\nimport { page } from \\"$app/stores\\";\\nimport Sidebar from \\"$lib/components/Sidebar.svelte\\";\\nimport InvitationsButton from \\"$lib/components/InvitationsButton.svelte\\";\\nimport \\"../app.css\\";\\nlet sidebarOpen = false;\\n$: campaignId = $page.params.id;\\n$: isCampaign = $page.url.pathname.startsWith(\\"/campaigns/\\");\\n$: isLoginPage = $page.url.pathname === \\"/login\\";\\n$: isRootPage = $page.url.pathname === \\"/\\";\\nonMount(() => {\\n  const unsubscribe = onAuthStateChanged(auth, async (user) => {\\n    userStore.set(user);\\n    if (user) {\\n      const token = await user.getIdToken();\\n      tokenStore.set(token);\\n    } else {\\n      tokenStore.set(null);\\n    }\\n    loadingStore.set(false);\\n    if (!user && $page.url.pathname !== \\"/login\\" && $page.url.pathname !== \\"/\\") {\\n      goto(\\"/login\\");\\n    }\\n  });\\n  return () => unsubscribe();\\n});\\nfunction handleLogout() {\\n  signOut(auth).then(() => goto(\\"/login\\"));\\n}\\nfunction handleInvitationResponded() {\\n  location.reload();\\n}\\nfunction toggleSidebar() {\\n  sidebarOpen = !sidebarOpen;\\n}\\n<\/script>\\r\\n\\r\\n<div class=\\"min-h-screen relative safe-top safe-bottom\\" data-theme=\\"dnd\\">\\r\\n  {#if $loadingStore}\\r\\n    <!-- Loading Screen -->\\r\\n    <div class=\\"flex flex-col items-center justify-center h-screen gap-4 px-4\\">\\r\\n      <div class=\\"text-4xl sm:text-5xl md:text-6xl\\">🎲</div>\\r\\n      <span class=\\"loading loading-spinner loading-md sm:loading-lg text-secondary\\"></span>\\r\\n      <p class=\\"font-medieval text-secondary text-sm sm:text-base text-center\\">Cargando grimorio...</p>\\r\\n    </div>\\r\\n  {:else}\\r\\n    <!-- Sidebar (solo en campañas) -->\\r\\n    {#if isCampaign && campaignId}\\r\\n      <Sidebar campaignId={campaignId} bind:isOpen={sidebarOpen} />\\r\\n    {/if}\\r\\n\\r\\n    <!-- Header -->\\r\\n    <div \\r\\n      class=\\"navbar-medieval sticky top-0 z-30 w-full flex items-center justify-between \\r\\n             px-3 sm:px-4 lg:px-6 h-14 sm:h-16 lg:h-20\\r\\n             safe-left safe-right py-8\\" \\r\\n    >\\r\\n      <!-- LEFT SECTION -->\\r\\n      <div class=\\"flex items-center gap-2 flex-1 min-w-0\\">\\r\\n        <!-- Hamburger (solo en campañas) -->\\r\\n        {#if isCampaign}\\r\\n          <button\\r\\n            class=\\"btn btn-ghost btn-sm btn-circle flex-shrink-0\\"\\r\\n            on:click={toggleSidebar}\\r\\n            aria-label=\\"Abrir menú\\"\\r\\n            aria-expanded={sidebarOpen}\\r\\n          >\\r\\n            <svg \\r\\n              xmlns=\\"http://www.w3.org/2000/svg\\" \\r\\n              class=\\"h-5 w-5 sm:h-6 sm:w-6\\" \\r\\n              fill=\\"none\\" \\r\\n              viewBox=\\"0 0 24 24\\" \\r\\n              stroke=\\"currentColor\\"\\r\\n            >\\r\\n              <path \\r\\n                stroke-linecap=\\"round\\" \\r\\n                stroke-linejoin=\\"round\\" \\r\\n                stroke-width=\\"2\\" \\r\\n                d=\\"M4 6h16M4 12h16M4 18h16\\" \\r\\n              />\\r\\n            </svg>\\r\\n          </button>\\r\\n        {/if}\\r\\n\\r\\n        <!-- Title - Solo visible en móvil -->\\r\\n        <h1 class=\\"lg:hidden btn btn-ghost text-base sm:text-lg font-medieval text-secondary hover:text-accent sm:max-w-xs\\">\\r\\n          {$headerTitle}\\r\\n        </h1>\\r\\n      </div>\\r\\n\\r\\n      <!-- CENTER SECTION - Title centrado en desktop -->\\r\\n      <div class=\\"hidden lg:flex flex-1 justify-center\\">\\r\\n        <h1 class=\\"btn btn-ghost text-xl font-medieval text-secondary hover:text-accent max-w-md\\">\\r\\n          {$headerTitle}\\r\\n        </h1>\\r\\n      </div>\\r\\n\\r\\n      <!-- RIGHT SECTION -->\\r\\n      <div class=\\"flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 justify-end\\">\\r\\n        <!-- Invitaciones + Avatar (solo si hay usuario y no es login) -->\\r\\n        {#if $userStore && !isLoginPage && !isRootPage}\\r\\n          <InvitationsButton onInvitationResponded={handleInvitationResponded} />\\r\\n          \\r\\n          <div class=\\"dropdown dropdown-end\\">\\r\\n            <label \\r\\n              tabindex=\\"0\\" \\r\\n              class=\\"btn btn-ghost btn-circle avatar ring-2 ring-secondary ring-offset-2 ring-offset-neutral\\"\\r\\n            >\\r\\n              <div class=\\"w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full\\">\\r\\n                <img \\r\\n                  src={$userStore?.photoURL || ''} \\r\\n                  alt={$userStore?.displayName || 'Usuario'}\\r\\n                  class=\\"object-cover\\"\\r\\n                />\\r\\n              </div>\\r\\n            </label>\\r\\n            <ul \\r\\n              tabindex=\\"0\\" \\r\\n              class=\\"mt-3 z-[50] p-2 shadow-xl menu menu-sm dropdown-content bg-neutral rounded-box w-48 sm:w-52 border-2 border-secondary\\"\\r\\n            >\\r\\n              <li>\\r\\n                <a \\r\\n                  on:click={handleLogout} \\r\\n                  class=\\"text-base-content hover:text-secondary font-medieval text-sm sm:text-base\\"\\r\\n                >\\r\\n                  🚪 Cerrar Sesión\\r\\n                </a>\\r\\n              </li>\\r\\n            </ul>\\r\\n          </div>\\r\\n        {/if}\\r\\n      </div>\\r\\n    </div>\\r\\n\\r\\n    <!-- Main Content -->\\r\\n    <div class=\\"relative min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)]\\">\\r\\n      <slot />\\r\\n    </div>\\r\\n  {/if}\\r\\n</div>\\r\\n\\r\\n<style>\\r\\n  /* Asegurar que el header no se rompa en móvil */\\r\\n  .navbar-medieval {\\r\\n    display: flex;\\r\\n    flex-wrap: nowrap;\\r\\n  }\\r\\n\\r\\n  /* Prevenir scroll horizontal */\\r\\n  :global(body) {\\r\\n    overflow-x: hidden;\\r\\n  }\\r\\n\\r\\n  /* Mejorar el tap target en móvil */\\r\\n  .btn-circle {\\r\\n    min-width: 2.5rem;\\r\\n    min-height: 2.5rem;\\r\\n  }\\r\\n\\r\\n  @media (min-width: 640px) {\\r\\n    .btn-circle {\\r\\n      min-width: 2.75rem;\\r\\n      min-height: 2.75rem;\\r\\n    }\\r\\n  }\\r\\n\\r\\n  /* Asegurar que los dropdowns estén sobre el sidebar */\\r\\n  .dropdown-content {\\r\\n    z-index: 60 !important;\\r\\n  }\\r\\n</style>"],"names":[],"mappings":"AAoJE,+BAAiB,CACf,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,MACb,CAGQ,IAAM,CACZ,UAAU,CAAE,MACd,CAGA,0BAAY,CACV,SAAS,CAAE,MAAM,CACjB,UAAU,CAAE,MACd,CAEA,MAAO,YAAY,KAAK,CAAE,CACxB,0BAAY,CACV,SAAS,CAAE,OAAO,CAClB,UAAU,CAAE,OACd,CACF,CAGA,gCAAkB,CAChB,OAAO,CAAE,EAAE,CAAC,UACd"}`
};
function handleInvitationResponded() {
  location.reload();
}
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let campaignId;
  let isCampaign;
  let isLoginPage;
  let isRootPage;
  let $page, $$unsubscribe_page;
  let $loadingStore, $$unsubscribe_loadingStore;
  let $headerTitle, $$unsubscribe_headerTitle;
  let $userStore, $$unsubscribe_userStore;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_loadingStore = subscribe(loadingStore, (value) => $loadingStore = value);
  $$unsubscribe_headerTitle = subscribe(headerTitle, (value) => $headerTitle = value);
  $$unsubscribe_userStore = subscribe(userStore, (value) => $userStore = value);
  let sidebarOpen = false;
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    campaignId = $page.params.id;
    isCampaign = $page.url.pathname.startsWith("/campaigns/");
    isLoginPage = $page.url.pathname === "/login";
    isRootPage = $page.url.pathname === "/";
    $$rendered = `<div class="min-h-screen relative safe-top safe-bottom" data-theme="dnd">${$loadingStore ? ` <div class="flex flex-col items-center justify-center h-screen gap-4 px-4" data-svelte-h="svelte-fmyonb"><div class="text-4xl sm:text-5xl md:text-6xl">🎲</div> <span class="loading loading-spinner loading-md sm:loading-lg text-secondary"></span> <p class="font-medieval text-secondary text-sm sm:text-base text-center">Cargando grimorio...</p></div>` : ` ${isCampaign && campaignId ? `${validate_component(Sidebar, "Sidebar").$$render(
      $$result,
      { campaignId, isOpen: sidebarOpen },
      {
        isOpen: ($$value) => {
          sidebarOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}` : ``}  <div class="navbar-medieval sticky top-0 z-30 w-full flex items-center justify-between px-3 sm:px-4 lg:px-6 h-14 sm:h-16 lg:h-20 safe-left safe-right py-8 svelte-1b5zlnt"> <div class="flex items-center gap-2 flex-1 min-w-0"> ${isCampaign ? `<button class="btn btn-ghost btn-sm btn-circle flex-shrink-0 svelte-1b5zlnt" aria-label="Abrir menú"${add_attribute("aria-expanded", sidebarOpen, 0)}><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button>` : ``}  <h1 class="lg:hidden btn btn-ghost text-base sm:text-lg font-medieval text-secondary hover:text-accent sm:max-w-xs">${escape($headerTitle)}</h1></div>  <div class="hidden lg:flex flex-1 justify-center"><h1 class="btn btn-ghost text-xl font-medieval text-secondary hover:text-accent max-w-md">${escape($headerTitle)}</h1></div>  <div class="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 justify-end"> ${$userStore && !isLoginPage && !isRootPage ? `${validate_component(InvitationsButton, "InvitationsButton").$$render(
      $$result,
      {
        onInvitationResponded: handleInvitationResponded
      },
      {},
      {}
    )} <div class="dropdown dropdown-end"><label tabindex="0" class="btn btn-ghost btn-circle avatar ring-2 ring-secondary ring-offset-2 ring-offset-neutral svelte-1b5zlnt"><div class="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full"><img${add_attribute("src", $userStore?.photoURL || "", 0)}${add_attribute("alt", $userStore?.displayName || "Usuario", 0)} class="object-cover"></div></label> <ul tabindex="0" class="mt-3 z-[50] p-2 shadow-xl menu menu-sm dropdown-content bg-neutral rounded-box w-48 sm:w-52 border-2 border-secondary svelte-1b5zlnt"><li><a class="text-base-content hover:text-secondary font-medieval text-sm sm:text-base" data-svelte-h="svelte-1942x31">🚪 Cerrar Sesión</a></li></ul></div>` : ``}</div></div>  <div class="relative min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)]">${slots.default ? slots.default({}) : ``}</div>`} </div>`;
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
