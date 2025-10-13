// Deep linking handler para Android
// Maneja URLs como: https://tu-sitio.netlify.app?battle=ABC123
// O: dndbattle://battle/ABC123

let App = null;

// Intentar cargar Capacitor App plugin
try {
  // eslint-disable-next-line global-require, import/no-unresolved
  const cap = require('@capacitor/app');
  App = cap.App;
} catch (e) {
  // Capacitor no instalado, normal en web
}

// Inicializar listener de deep links
export function initializeDeepLinking(callback) {
  if (!App) {
    // En web, no hay deep linking nativo
    return null;
  }

  // Listener para cuando la app se abre con una URL
  const listener = App.addListener('appUrlOpen', (data) => {
    console.log('App opened with URL:', data.url);
    
    // Extraer battleId de diferentes formatos de URL
    const battleId = extractBattleId(data.url);
    
    if (battleId && callback) {
      callback(battleId);
    }
  });

  return listener;
}

// Extraer battleId de una URL
export function extractBattleId(url) {
  try {
    // Formato 1: https://sitio.com?battle=ABC123
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    if (params.has('battle')) {
      return params.get('battle');
    }

    // Formato 2: dndbattle://battle/ABC123
    if (url.includes('dndbattle://battle/')) {
      const parts = url.split('dndbattle://battle/');
      if (parts.length > 1) {
        return parts[1].split('?')[0].split('/')[0];
      }
    }

    // Formato 3: /battle/ABC123 (path)
    const pathMatch = url.match(/\/battle\/([A-Z0-9]+)/i);
    if (pathMatch) {
      return pathMatch[1];
    }

    return null;
  } catch (e) {
    console.error('Error extracting battleId:', e);
    return null;
  }
}

// Generar deep link para compartir
export function generateDeepLink(battleId) {
  // En Android con app instalada: usa deep link personalizado
  // En web: usa URL normal
  
  const isNative = App && typeof window !== 'undefined' && window.Capacitor;
  
  if (isNative) {
    // Deep link personalizado que abrirá la app
    return `dndbattle://battle/${battleId}`;
  }
  
  // URL web normal
  const baseUrl = process.env.REACT_APP_PUBLIC_URL || window.location.origin;
  return `${baseUrl}?battle=${battleId}`;
}

// Compartir link usando Share API nativa (Android) o copiar al portapapeles
export async function shareBattleLink(battleId) {
  const url = generateDeepLink(battleId);
  
  // Intentar usar Share API nativa
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'D&D Battle Tracker',
        text: `Únete a la batalla con el código: ${battleId}`,
        url: url
      });
      return { success: true, method: 'native-share' };
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
      // Usuario canceló o error, intentar copiar
    }
  }
  
  // Fallback: copiar al portapapeles
  try {
    await navigator.clipboard.writeText(url);
    return { success: true, method: 'clipboard', url };
  } catch (err) {
    console.error('Error copying to clipboard:', err);
    return { success: false, url };
  }
}