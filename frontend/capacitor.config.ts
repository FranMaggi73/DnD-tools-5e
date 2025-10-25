import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tuapp.dmevents',
  appName: 'DM Events',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    // ✅ Usar tu backend de producción
    url: 'https://dnd5etools-73.web.app',
    cleartext: false
  },
  android: {
    allowMixedContent: false
  }
};

export default config;