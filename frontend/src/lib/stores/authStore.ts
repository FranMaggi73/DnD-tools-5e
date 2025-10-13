import { writable } from 'svelte/store';
import type { User } from 'firebase/auth';

export const userStore = writable<User | null>(null);
export const loadingStore = writable<boolean>(true);
export const tokenStore = writable<string | null>(null);