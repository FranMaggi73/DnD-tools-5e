

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.DmPpJy0z.js","_app/immutable/chunks/Ci_mYp0l.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bhgkhhu0.js","_app/immutable/chunks/Cjcxx2Yi.js","_app/immutable/chunks/Df_Q5QZT.js","_app/immutable/chunks/IoV-54eZ.js","_app/immutable/chunks/BMnbv9td.js"];
export const stylesheets = ["_app/immutable/assets/0.B9a9VeY8.css"];
export const fonts = [];
