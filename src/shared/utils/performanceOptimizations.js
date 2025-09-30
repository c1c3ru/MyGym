import React, { useCallback, useMemo, memo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Hook para debounce - útil para buscas e filtros
 */
export const useDebounce = (value, delay) => {
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
export const useThrottle = (callback, delay) => {
  const callbackRef = useRef(callback);
  const lastCall = useRef(0);
  
  callbackRef.current = callback;
  
  return useCallback((...args) => {
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
export const withMemoization = (Component, areEqual) => {
  return memo(Component, areEqual);
};

/**
 * Hook para memoização de arrays/objetos complexos
 */
export const useDeepMemo = (value) => {
  const ref = useRef();
  
  if (!ref.current || JSON.stringify(ref.current) !== JSON.stringify(value)) {
    ref.current = value;
  }
  
  return ref.current;
};

/**
 * Utilitário para lazy loading de imagens
 */
export const LazyImage = memo(({ source, style, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const onLoad = useCallback(() => setLoaded(true), []);
  const onError = useCallback(() => setError(true), []);
  
  if (error) {
    return (
      <View style={[style, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="image-outline" size={24} color="#ccc" />
      </View>
    );
  }
  
  return (
    <View style={style}>
      {!loaded && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
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
  getItemType: (item, index) => {
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
  user: async (userId) => {
    // Preload user data
    return Promise.all([
      import('@services/academyFirestoreService').then(service => 
        service.academyFirestoreService.get('users', userId)
      ),
      import('@services/academyFirestoreService').then(service =>
        service.academyFirestoreService.getWhere('academies', 'ownerId', '==', userId)
      )
    ]);
  },
  
  academy: async (academyId) => {
    // Preload academy data
    return Promise.all([
      academyFirestoreService.get('academies', academyId),
      academyFirestoreService.getAll('students', academyId)
    ]);
  }
};

/**
 * Monitor de performance (apenas em desenvolvimento)
 */
export const PerformanceMonitor = {
  start: (label) => {
    if (__DEV__) {
      performance.mark(`${label}-start`);
    }
  },
  
  end: (label) => {
    if (__DEV__) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      const measure = performance.getEntriesByName(label)[0];
      console.log(`⚡ ${label}: ${measure.duration.toFixed(2)}ms`);
    }
  },
  
  component: (Component, displayName) => {
    if (!__DEV__) return Component;
    
    return memo((props) => {
      PerformanceMonitor.start(`Render-${displayName}`);
      const result = Component(props);
      PerformanceMonitor.end(`Render-${displayName}`);
      return result;
    });
  }
};