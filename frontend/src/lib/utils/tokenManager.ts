import { get } from 'svelte/store';
import { auth } from '$lib/firebase';
import { tokenStore, lastTokenRefresh, userStore } from '$lib/stores/authStore';

let refreshInterval: NodeJS.Timeout | null = null;

/**
 * Renueva el token de Firebase
 */
export async function refreshToken(): Promise<string | null> {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.warn('No hay usuario autenticado para renovar token');
      return null;
    }

    // Forzar renovación del token
    const newToken = await currentUser.getIdToken(true);
    
    tokenStore.set(newToken);
    lastTokenRefresh.set(Date.now());
    
    console.log('✅ Token renovado exitosamente');
    return newToken;
  } catch (error) {
    console.error('❌ Error renovando token:', error);
    return null;
  }
}

/**
 * Inicia el sistema de renovación automática de tokens
 */
export function startTokenRefreshSystem() {
  // Limpiar interval existente
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // Renovar cada 50 minutos (tokens de Firebase duran 1 hora)
  const FIFTY_MINUTES = 50 * 60 * 1000;
  
  refreshInterval = setInterval(async () => {
    const user = get(userStore);
    
    if (user) {
      console.log('🔄 Renovación automática de token...');
      await refreshToken();
    }
  }, FIFTY_MINUTES);

  console.log('✅ Sistema de renovación de tokens iniciado');
}

/**
 * Detiene el sistema de renovación automática
 */
export function stopTokenRefreshSystem() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log('⏹️ Sistema de renovación de tokens detenido');
  }
}

/**
 * Verifica si el token necesita renovación y lo renueva si es necesario
 */
export async function ensureValidToken(): Promise<string | null> {
  const lastRefresh = get(lastTokenRefresh);
  const FIFTY_MINUTES = 50 * 60 * 1000;
  
  if (Date.now() - lastRefresh > FIFTY_MINUTES) {
    console.log('⚠️ Token próximo a expirar, renovando...');
    return await refreshToken();
  }
  
  return get(tokenStore);
}