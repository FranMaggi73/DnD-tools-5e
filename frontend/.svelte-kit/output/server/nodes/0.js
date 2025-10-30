

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.1gnRxNEz.js","_app/immutable/chunks/xl8dgHUM.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/YJlP5Giy.js","_app/immutable/chunks/B8bFgK_i.js","_app/immutable/chunks/DYUkzndH.js","_app/immutable/chunks/D_PcSuOn.js"];
export const stylesheets = ["_app/immutable/assets/0.DYTGtBvk.css"];
export const fonts = [];
