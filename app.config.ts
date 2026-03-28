import { ExpoConfig } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';

const name = IS_DEV ? 'SSURF (dev)' : 'SSURF';

const bundleIdentifier = IS_DEV ? 'dev.eatsteak.ssurf.dev' : 'dev.eatsteak.ssurf';

const versionCode = 2026032401;

const config: ExpoConfig = {
  name,
  slug: 'ssurf',
  version: '0.0.1',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'ssurf',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier,
    config: {
      usesNonExemptEncryption: false,
    },
    icon: './assets/app.icon',
    buildNumber: versionCode.toString(),
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    package: bundleIdentifier,
    versionCode,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    [
      'expo-build-properties',
      {
        buildReactNativeFromSource: true,
        useHermesV1: true,
      },
    ],
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#05ced9',
        dark: {
          image: './assets/images/splash-icon-dark.png',
          backgroundColor: '#03858d',
        },
      },
    ],
    'expo-sqlite',
    [
      'expo-secure-store',
      {
        configureAndroidBackup: true,
        faceIDPermission: 'Allow $(PRODUCT_NAME) to access your Face ID biometric data.',
      },
    ],
    'expo-font',
    './plugins/android-release',
    'expo-image',
    'expo-web-browser',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '39518783-8aab-4312-85f2-46b95f61da42',
    },
  },
};

export default config;
