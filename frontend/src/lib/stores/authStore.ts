import { writable, derived } from 'svelte/store';
import type { User } from 'firebase/auth';

export const userStore = writable<User | null>(null);
export const loadingStore = writable<boolean>(true);
export const tokenStore = writable<string | null>(null);

// ✅ NUEVO: Store para timestamp de última renovación
export const lastTokenRefresh = writable<number>(Date.now());

// ✅ NUEVO: Store derivado para saber si el token está próximo a expirar
export const tokenNeedsRefresh = derived(
  lastTokenRefresh,
  ($lastRefresh) => {
    // Firebase tokens duran 1 hora, renovar después de 50 minutos
    const FIFTY_MINUTES = 50 * 60 * 1000;
    return Date.now() - $lastRefresh > FIFTY_MINUTES;
  }
);