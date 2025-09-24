// Bundle size analyzer utility
import { Platform } from 'react-native';

export const bundleAnalyzer = {
  // Log component sizes in development
  logComponentSize: (componentName, startTime) => {
    if (__DEV__ && Platform.OS === 'web') {
      const endTime = performance.now();
      console.log(`📦 ${componentName} render time: ${(endTime - startTime).toFixed(2)}ms`);
    }
  },

  // Track heavy imports
  trackImport: (moduleName) => {
    if (__DEV__) {
      console.log(`📥 Loading module: ${moduleName}`);
    }
  }
};

export default bundleAnalyzer;
