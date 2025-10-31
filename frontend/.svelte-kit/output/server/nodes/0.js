

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.B1Z7GxiD.js","_app/immutable/chunks/Ci_mYp0l.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/CU8g63Ws.js","_app/immutable/chunks/BqHBampF.js","_app/immutable/chunks/DUBRk6C6.js","_app/immutable/chunks/CsW4K-9B.js"];
export const stylesheets = ["_app/immutable/assets/0.D2O6t27E.css"];
export const fonts = [];
