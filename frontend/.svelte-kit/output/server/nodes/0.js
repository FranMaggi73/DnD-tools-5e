

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.KC9VWNOZ.js","_app/immutable/chunks/p5AMOfhA.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/DFvPKOd9.js","_app/immutable/chunks/DPf8yFnW.js","_app/immutable/chunks/CltHjJLp.js","_app/immutable/chunks/CupYUf-u.js"];
export const stylesheets = ["_app/immutable/assets/0.D8Rr9gaP.css"];
export const fonts = [];
