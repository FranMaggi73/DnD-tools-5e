

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.BDrg2tcS.js","_app/immutable/chunks/D_G0BaV5.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/CmG8EdGM.js","_app/immutable/chunks/B3SL7ddu.js","_app/immutable/chunks/DJdX-Dki.js","_app/immutable/chunks/cU-WqC5X.js"];
export const stylesheets = ["_app/immutable/assets/0.puc7Vlw8.css"];
export const fonts = [];
