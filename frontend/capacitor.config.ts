import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tuapp.dmevents',
  appName: 'DM Events',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;