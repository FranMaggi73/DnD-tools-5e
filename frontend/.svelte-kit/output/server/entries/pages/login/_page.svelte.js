import { c as create_ssr_component, b as subscribe, d as add_attribute, e as escape } from "../../../chunks/ssr.js";
import "firebase/auth";
import "../../../chunks/firebase.js";
import { u as userStore } from "../../../chunks/authStore.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
function goto(url, opts = {}) {
  {
    throw new Error("Cannot call goto(...) on the server");
  }
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $userStore, $$unsubscribe_userStore;
  $$unsubscribe_userStore = subscribe(userStore, (value) => $userStore = value);
  {
    if ($userStore && typeof window !== "undefined") {
      goto();
    }
  }
  $$unsubscribe_userStore();
  return `<div class="hero min-h-screen relative overflow-hidden"> <div class="absolute inset-0 bg-gradient-to-br from-neutral via-base-100 to-neutral opacity-90"></div>  <div class="absolute top-0 left-0 w-64 h-64 border-l-4 border-t-4 border-secondary opacity-30"></div> <div class="absolute bottom-0 right-0 w-64 h-64 border-r-4 border-b-4 border-secondary opacity-30"></div> <div class="hero-content text-center relative z-10"><div class="max-w-2xl"> <div class="mb-8" data-svelte-h="svelte-18nenjo"><div class="text-8xl mb-4">🎲</div> <h1 class="text-6xl font-bold font-medieval text-secondary mb-4 text-shadow title-ornament">Grimorio de Aventuras</h1> <p class="text-xl text-base-content/80 font-body italic">&quot;Donde las leyendas cobran vida&quot;</p></div> ${!$userStore ? `<div class="card-parchment p-8 corner-ornament"><p class="text-lg mb-6 text-neutral font-body" data-svelte-h="svelte-oocr7c">Accede a tu grimorio personal y gestiona tus campañas épicas de D&amp;D</p> <div class="divider text-neutral/50" data-svelte-h="svelte-uzv0g8">⚔️</div> <button class="btn btn-dnd btn-lg gap-3 w-full" data-svelte-h="svelte-7hus2u"><svg class="w-6 h-6" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path></svg> <span class="font-medieval text-lg">Entrar con Google</span></button> <p class="mt-6 text-sm text-neutral/60 italic font-body" data-svelte-h="svelte-1vziaor">Únete a miles de Dungeon Masters en sus aventuras</p></div>` : `<div class="card-parchment p-8 corner-ornament"><div class="flex flex-col items-center gap-4"><div class="avatar ring-4 ring-secondary ring-offset-4 ring-offset-[#f4e4c1]"><div class="w-24 rounded-full"><img${add_attribute("src", $userStore.photoURL || "", 0)}${add_attribute("alt", $userStore.displayName || "", 0)}></div></div> <div><h2 class="text-3xl font-bold font-medieval text-neutral">${escape($userStore.displayName)}</h2> <p class="text-sm text-neutral/70 font-body">${escape($userStore.email)}</p></div> <div class="divider text-neutral/50" data-svelte-h="svelte-uzv0g8">⚔️</div> <div class="flex flex-col gap-3 w-full"><button class="btn btn-dnd btn-lg w-full" data-svelte-h="svelte-mva5hk"><span class="text-xl">📖</span> <span class="font-medieval">Abrir Grimorio</span></button> <button class="btn btn-outline border-2 border-neutral text-neutral hover:bg-neutral hover:text-secondary font-medieval w-full" data-svelte-h="svelte-9njycx">Cerrar Sesión</button></div></div></div>`} ${``} <div class="mt-12" data-svelte-h="svelte-o9k7m5"><p class="text-xs text-base-content/50 font-body italic">&quot;En cada tirada de dados, el destino se escribe...&quot;</p></div></div></div></div>`;
});
export {
  Page as default
};
