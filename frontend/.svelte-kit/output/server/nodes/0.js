

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.D6_bcsG4.js","_app/immutable/chunks/b1l4neni.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/CG6d4oC4.js","_app/immutable/chunks/CE5E9yVk.js","_app/immutable/chunks/C6zySN1F.js","_app/immutable/chunks/CAHGdLhf.js"];
export const stylesheets = ["_app/immutable/assets/0.Ch9X-YFx.css"];
export const fonts = [];
