

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.HZLTRbP-.js","_app/immutable/chunks/Ci_mYp0l.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/CurvcQiw.js","_app/immutable/chunks/DK4t9RT9.js","_app/immutable/chunks/Yyfqa3ZV.js","_app/immutable/chunks/CTIIqXDP.js"];
export const stylesheets = ["_app/immutable/assets/0.DyAy0_FK.css"];
export const fonts = [];
