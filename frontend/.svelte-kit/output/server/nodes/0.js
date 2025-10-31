

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.BrhtGBiI.js","_app/immutable/chunks/Ci_mYp0l.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/DUZazcRU.js","_app/immutable/chunks/Chz0Fur3.js","_app/immutable/chunks/DDGZZkHX.js","_app/immutable/chunks/DPbeY7Ol.js"];
export const stylesheets = ["_app/immutable/assets/0.D5okwF__.css"];
export const fonts = [];
