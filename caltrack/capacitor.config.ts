import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.caltrack.app',
  appName: 'CalTrack',
  webDir: 'www',
  android: {
    allowMixedContent: true,
  },
};

export default config;
