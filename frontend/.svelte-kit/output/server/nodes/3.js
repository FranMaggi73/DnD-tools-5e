

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/campaigns/_id_/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.wKTEoMld.js","_app/immutable/chunks/p5AMOfhA.js","_app/immutable/chunks/B4wUI4WB.js","_app/immutable/chunks/D2cEoRg9.js","_app/immutable/chunks/DFx7P9KZ.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/Bckhbwj5.js"];
export const stylesheets = [];
export const fonts = [];
