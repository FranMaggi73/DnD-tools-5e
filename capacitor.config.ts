import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dndbattletracker.app',
  appName: 'D&D Battle Tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'dnd5etools.netlify.app'  // TU SITIO EXACTO
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#822000",
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#822000'
    },
    App: {
      handleUrlOpen: true
    }
  }
};

export default config;