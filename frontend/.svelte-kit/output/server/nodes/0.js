

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.DKFHFrk5.js","_app/immutable/chunks/Ci_mYp0l.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/CKOnY_Cx.js","_app/immutable/chunks/2A4Ak0Xg.js","_app/immutable/chunks/Cfl1PM-f.js","_app/immutable/chunks/CIGmlyIo.js"];
export const stylesheets = ["_app/immutable/assets/0.DyAy0_FK.css"];
export const fonts = [];
