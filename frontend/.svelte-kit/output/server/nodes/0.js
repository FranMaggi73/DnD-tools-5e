

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.Cbi547cS.js","_app/immutable/chunks/Ci_mYp0l.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/Dj1ipyZ7.js","_app/immutable/chunks/CPk0U1zk.js","_app/immutable/chunks/B7Jf-8xW.js","_app/immutable/chunks/Bn8W9W94.js"];
export const stylesheets = ["_app/immutable/assets/0.DyAy0_FK.css"];
export const fonts = [];
