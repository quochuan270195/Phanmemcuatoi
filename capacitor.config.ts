import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.appcuatoi.phammemcuatoi',
  appName: 'Phanmemcuatoi',
  webDir: 'dist/web',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      // Dán mã Client ID bạn đã copy ở bước trước vào đây
      serverClientId: '117899702289-vdfdjppt3obhc30b6eijh4qkvp2ir6vd.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;