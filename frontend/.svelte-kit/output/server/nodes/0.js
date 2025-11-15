

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.CT3BAwlh.js","_app/immutable/chunks/CQqHTK8U.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/SB3GKwJC.js","_app/immutable/chunks/8E2ohCEn.js","_app/immutable/chunks/CuU0tWjs.js","_app/immutable/chunks/BjXTUeIZ.js","_app/immutable/chunks/CSRxS88f.js"];
export const stylesheets = ["_app/immutable/assets/0.D3r7xQJ4.css"];
export const fonts = [];
