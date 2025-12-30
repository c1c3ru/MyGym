import React, { useCallback, useMemo, memo, useState, useEffect, useRef } from 'react';
import { COLORS } from '@presentation/theme/designTokens';
import { View, StyleSheet, Image, ActivityIndicator, ImageProps, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Hook para debounce - útil para buscas e filtros
 */
export const useDebounce = (value: any, delay: number): any => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

/**
 * Hook para throttle - útil para scroll events
 */
export const useThrottle = (callback: (...args: any[]) => any, delay: number) => {
  const callbackRef = useRef<any>(callback);
  const lastCall = useRef<number>(0);
  
  callbackRef.current = callback;
  
  return useCallback((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callbackRef.current(...args);
    }
  }, [delay]);
};

/**
 * HOC para memoização de componentes com props complexas
 */
export const withMemoization = (Component: React.ComponentType<any>, areEqual?: (prev: any, next: any) => boolean) => {
  return memo(Component, areEqual);
};

/**
 * Hook para memoização de arrays/objetos complexos
 */
export const useDeepMemo = (value: any): any => {
  const ref = useRef<any>(undefined);
  
  if (!ref.current || JSON.stringify(ref.current) !== JSON.stringify(value)) {
    ref.current = value;
  }
  
  return ref.current as any;
};

/**
 * Utilitário para lazy loading de imagens
 */
export const LazyImage = memo<{ source: any; style?: any }>(({ source, style, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const onLoad = useCallback(() => setLoaded(true), []);
  const onError = useCallback(() => setError(true), []);
  
  if (error) {
    return (
      <View style={[style as any, { backgroundColor: COLORS.gray[100], justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="image-outline" size={24} color={COLORS.gray[300]} />
      </View>
    );
  }
  
  return (
    <View style={style as any}>
      {!loaded && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.gray[100], justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="small" color={COLORS.info[500]} />
        </View>
      )}
      <Image
        {...props}
        source={source}
        style={[style, { opacity: loaded ? 1 : 0 }]}
        onLoad={onLoad}
        onError={onError}
      />
    </View>
  );
});

/**
 * Configurações de performance para FlashList
 */
export const flashListConfig = {
  getItemType: (item: any, index: number) => {
    // Retorna tipos diferentes para otimizar renderização
    if (item.featured) return 'featured';
    if (index % 10 === 0) return 'ad'; // A cada 10 items, tipo diferente
    return 'default';
  },
  estimatedItemSize: 120,
  drawDistance: 500,
  optimizeItemArrangement: true,
};

/**
 * Utilitário para preload de dados críticos
 */
export const preloadData = {
  user: async (userId: string) => {
    // Preload user data
    return Promise.all([
      import('@services/academyFirestoreService').then(service => 
        service.academyFirestoreService.getById('users', userId)
      ),
      import('@services/academyFirestoreService').then(service =>
        service.academyFirestoreService.getWhere('gyms', 'ownerId', '==', userId)
      )
    ]);
  },
  
  academy: async (academyId: string) => {
    // Preload academy data
    const svc = await import('@services/academyFirestoreService');
    return Promise.all([
      svc.academyFirestoreService.getById('gyms', academyId),
      svc.academyFirestoreService.getAll('students', academyId)
    ]);
  }
};

/**
 * Monitor de performance (apenas em desenvolvimento)
 */
export const PerformanceMonitor = {
  start: (label: string) => {
    if (__DEV__) {
      performance.mark(`${label}-start`);
    }
  },
  
  end: (label: string) => {
    if (__DEV__) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      const measure = performance.getEntriesByName(label)[0];
      console.log(`⚡ ${label}: ${measure.duration.toFixed(2)}ms`);
    }
  },
  
  component: (Component: React.ComponentType<any>, displayName: string) => {
    if (!__DEV__) return Component;
    
    return memo<any>((props: any) => {
      PerformanceMonitor.start(`Render-${displayName}`);
      const element = React.createElement(Component, props);
      PerformanceMonitor.end(`Render-${displayName}`);
      return element;
    });
  }
};