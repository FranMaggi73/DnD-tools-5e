

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.Cj_mh95p.js","_app/immutable/chunks/B11dj0TC.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/DrPqR0bn.js","_app/immutable/chunks/C_jzkI65.js","_app/immutable/chunks/CmoHV78C.js","_app/immutable/chunks/I2x72rHv.js"];
export const stylesheets = ["_app/immutable/assets/0.gW4rZp6a.css"];
export const fonts = [];
