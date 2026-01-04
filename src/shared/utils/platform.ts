import { getString } from "@utils/theme";

import { Platform, Dimensions, ScaledSize } from 'react-native';

// Detectar plataforma
export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Utilitários de responsividade
export const ResponsiveUtils = {
  // Obter dimensões da tela
  getScreenDimensions: (): { width: number; height: number } => {
    const { width, height }: ScaledSize = Dimensions.get('window');
    return { width, height };
  },

  // Verificar se é dispositivo móvel (baseado na largura)
  isMobile: (): boolean => {
    const { width }: ScaledSize = Dimensions.get('window');
    return width < 768;
  },

  // Verificar se é tablet
  isTablet: (): boolean => {
    const { width }: ScaledSize = Dimensions.get('window');
    return width >= 768 && width < 1024;
  },

  // Verificar se é desktop
  isDesktop: (): boolean => {
    const { width }: ScaledSize = Dimensions.get('window');
    return width >= 1024;
  },

  // Obter breakpoint atual
  getCurrentBreakpoint: (): 'mobile' | 'tablet' | 'desktop' => {
    const { width }: ScaledSize = Dimensions.get('window');
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
};

// Configurações específicas da plataforma
export const PlatformConfig = {
  web: {
    enableGestures: false,
    headerHeight: 56,
    tabBarHeight: 50,
    statusBarHeight: 0,
  },
  ios: {
    enableGestures: true,
    headerHeight: 88,
    tabBarHeight: 83,
    statusBarHeight: 44,
  },
  android: {
    enableGestures: true,
    headerHeight: 56,
    tabBarHeight: 56,
    statusBarHeight: 24,
  }
};

// Obter configuração da plataforma atual
export const getCurrentPlatformConfig = (): { enableGestures: boolean; headerHeight: number; tabBarHeight: number; statusBarHeight: number } => {
  const supported = ['web', 'ios', 'android'] as const;
  const os = (supported as readonly string[]).includes(Platform.OS)
    ? (Platform.OS as (typeof supported)[number])
    : 'web';
  return PlatformConfig[os];
};

// Utilitários para APK/AAB
export const BuildUtils = {
  // Verificar se está em modo de produção
  isProduction: () => {
    return (typeof __DEV__ !== 'undefined') ? !__DEV__ : true;
  },

  // Obter informações da build
  getBuildInfo: () => {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      isProduction: (typeof __DEV__ !== 'undefined') ? !__DEV__ : true,
      buildType: isAndroid ? 'apk' : 'ipa'
    };
  }
};

const platformUtils = {
  isWeb,
  isIOS,
  isAndroid,
  ResponsiveUtils,
  PlatformConfig,
  getCurrentPlatformConfig,
  BuildUtils
};

export default platformUtils;
