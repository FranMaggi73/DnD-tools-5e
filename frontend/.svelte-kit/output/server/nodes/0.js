

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.kXc3Tg2-.js","_app/immutable/chunks/D_G0BaV5.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/BLMm51hs.js","_app/immutable/chunks/BGidcjIc.js","_app/immutable/chunks/5Suz-1-0.js","_app/immutable/chunks/D0AE5CJh.js"];
export const stylesheets = ["_app/immutable/assets/0.puc7Vlw8.css"];
export const fonts = [];
