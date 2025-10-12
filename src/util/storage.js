// Storage wrapper que funciona en web y Android
// En web usa localStorage directamente
// En Android usa Capacitor Storage (si está disponible)

// Wrapper para localStorage que simula API async
const webStorage = {
  async getItem(key) {
    return window.localStorage.getItem(key);
  },

  async setItem(key, value) {
    window.localStorage.setItem(key, value);
  },

  async removeItem(key) {
    window.localStorage.removeItem(key);
  },

  async clear() {
    window.localStorage.clear();
  },

  async keys() {
    return Object.keys(window.localStorage);
  }
};

// Esta función se ejecuta dinámicamente para detectar Capacitor
function getStorageImplementation() {
  // Intentar detectar si Capacitor está disponible
  if (typeof window !== 'undefined' && window.Capacitor) {
    try {
      // En Android/iOS con Capacitor
      // eslint-disable-next-line no-undef
      const { Storage } = Capacitor.Plugins;
      if (Storage) {
        return {
          async getItem(key) {
            const { value } = await Storage.get({ key });
            return value;
          },

          async setItem(key, value) {
            await Storage.set({ key, value });
          },

          async removeItem(key) {
            await Storage.remove({ key });
          },

          async clear() {
            await Storage.clear();
          },

          async keys() {
            const { keys } = await Storage.keys();
            return keys;
          }
        };
      }
    } catch (e) {
      // Capacitor no disponible, usar web storage
      console.log('Capacitor Storage not available, using localStorage');
    }
  }
  
  // Por defecto, usar localStorage
  return webStorage;
}

// Exportar la implementación correcta
export const storage = getStorageImplementation();

export default storage;