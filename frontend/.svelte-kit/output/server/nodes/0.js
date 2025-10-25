

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.BMySd8og.js","_app/immutable/chunks/D_G0BaV5.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/CBmwglN4.js","_app/immutable/chunks/TqFmUP0D.js","_app/immutable/chunks/DP41e6a0.js","_app/immutable/chunks/Bk6V3RR-.js"];
export const stylesheets = ["_app/immutable/assets/0.puc7Vlw8.css"];
export const fonts = [];
