

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.B9cjxQ6b.js","_app/immutable/chunks/b1l4neni.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/DMj5m-5l.js","_app/immutable/chunks/B6ZMp0ec.js","_app/immutable/chunks/B0AGoUMz.js","_app/immutable/chunks/CBsnC47a.js"];
export const stylesheets = ["_app/immutable/assets/0.D3r7xQJ4.css"];
export const fonts = [];
