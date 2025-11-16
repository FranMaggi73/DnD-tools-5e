

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.C56lh7Pl.js","_app/immutable/chunks/Dd119kUD.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/SB3GKwJC.js","_app/immutable/chunks/cKSI5pp1.js","_app/immutable/chunks/D9iovcAR.js","_app/immutable/chunks/EMvpN3yC.js","_app/immutable/chunks/Crv-74m0.js"];
export const stylesheets = ["_app/immutable/assets/0.Bm9ncVuu.css"];
export const fonts = [];
