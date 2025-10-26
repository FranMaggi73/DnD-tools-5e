

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.ClvDMvEL.js","_app/immutable/chunks/B11dj0TC.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/Bhbx1GBa.js","_app/immutable/chunks/4AD-5CNy.js","_app/immutable/chunks/BFUIfuOa.js","_app/immutable/chunks/CSm4Wu21.js"];
export const stylesheets = ["_app/immutable/assets/0.D6TEETJM.css"];
export const fonts = [];
