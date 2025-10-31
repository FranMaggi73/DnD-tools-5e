

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.CQHc8wJB.js","_app/immutable/chunks/Ci_mYp0l.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/CXw4fhZA.js","_app/immutable/chunks/Dlh_RxI_.js","_app/immutable/chunks/DF9D-w41.js","_app/immutable/chunks/CUfF0wPt.js"];
export const stylesheets = ["_app/immutable/assets/0.DyAy0_FK.css"];
export const fonts = [];
