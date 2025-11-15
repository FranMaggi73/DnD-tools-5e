import { d as derived, w as writable } from "./index.js";
const userStore = writable(null);
const loadingStore = writable(true);
const lastTokenRefresh = writable(Date.now());
derived(
  lastTokenRefresh,
  ($lastRefresh) => {
    const FIFTY_MINUTES = 50 * 60 * 1e3;
    return Date.now() - $lastRefresh > FIFTY_MINUTES;
  }
);
export {
  loadingStore as l,
  userStore as u
};
