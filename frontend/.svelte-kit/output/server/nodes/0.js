

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.DdJWPeOd.js","_app/immutable/chunks/Dd119kUD.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/SB3GKwJC.js","_app/immutable/chunks/CtaXGYwc.js","_app/immutable/chunks/Cnk8-SBj.js","_app/immutable/chunks/Cq4XVYOP.js","_app/immutable/chunks/COLsPh4f.js"];
export const stylesheets = ["_app/immutable/assets/0.Bm9ncVuu.css"];
export const fonts = [];
