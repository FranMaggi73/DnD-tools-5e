

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.BsevTMDg.js","_app/immutable/chunks/p5AMOfhA.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/DFx7P9KZ.js","_app/immutable/chunks/D2cEoRg9.js","_app/immutable/chunks/B4wUI4WB.js","_app/immutable/chunks/Bckhbwj5.js"];
export const stylesheets = ["_app/immutable/assets/0.D8Rr9gaP.css"];
export const fonts = [];
