import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.commutedrop.app',
  appName: 'CommuteDrop',
  webDir: 'out', // Use static export directory
  server: {
    androidScheme: 'https'
  }
};

export default config;

