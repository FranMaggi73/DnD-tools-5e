import { w as writable } from "./index.js";
const userStore = writable(null);
const loadingStore = writable(true);
export {
  loadingStore as l,
  userStore as u
};
