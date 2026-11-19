const { execSync } = require('child_process');

let commitHash = 'dev';
try {
  commitHash = execSync('git rev-parse --short HEAD', {
    cwd: __dirname,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
} catch (_err) {
  commitHash = 'dev';
}

module.exports = {
  expo: {
    name: 'Zelo',
    slug: 'zelo-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: 'zelo',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0F172A',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'br.fiap.mad.zelo.rm561760',
    },
    android: {
      package: 'br.fiap.mad.zelo.rm561760',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0F172A',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
    ],
    extra: {
      commitHash: commitHash,
      eas: {
        projectId: 'c76c8eb7-1ec7-4fc0-978b-63fba9efff8a',
      },
    },
  },
};
