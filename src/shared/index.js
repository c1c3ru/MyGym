// Shared Components and Utilities
// Exportações centralizadas para componentes e utilitários compartilhados

// UI Components
export { default as OptimizedImage } from '../presentation/components/OptimizedImage';
export { default as LazyScreen, LazyLoadingFallback, withLazyLoading } from '../presentation/components/LazyScreen';
export { default as UniversalHeader } from '../presentation/components/UniversalHeader';
export { default as ErrorBoundary } from '../presentation/components/ErrorBoundary';
export { default as LoadingButton } from '../presentation/components/LoadingButton';
export { default as FormInput } from '../presentation/components/FormInput';
export { default as FormSelect } from '../presentation/components/FormSelect';
export { default as ActionButton } from '../presentation/components/ActionButton';
export { default as AnimatedButton } from '../presentation/components/AnimatedButton';
export { default as AnimatedCard } from '../presentation/components/AnimatedCard';
export { default as ResponsiveContainer } from '../presentation/components/ResponsiveContainer';

// Form Components
export { default as CountryStatePicker } from '../presentation/components/CountryStatePicker';
export { default as PhonePicker } from '../presentation/components/PhonePicker';
export { default as ModalityPicker } from '../presentation/components/ModalityPicker';

// Utility Components
export { default as QRCodeGenerator } from '../presentation/components/QRCodeGenerator';
export { default as QRCodeScanner } from '../presentation/components/QRCodeScanner';
export { default as NotificationBell } from '../presentation/components/NotificationBell';
export { default as NotificationManager } from '../presentation/components/NotificationManager';

// Stores
export { default as useAuthStore } from '../presentation/stores/AuthUIStore';
export { default as useUIStore } from './stores/uiStore';
export { default as useAcademiaStore } from './stores/academiaStore';

// Services
export { default as firebase } from '../infrastructure/services/firebase';
export { default as firestoreService } from '../infrastructure/services/firestoreService';
export { default as notificationService } from '../infrastructure/services/notificationService';

// Utils
export { default as performanceMonitor, usePerformanceMonitor, withPerformanceMonitoring } from '../shared/utils/performanceMonitor';
export * from '../shared/utils/validation';
export * from '../shared/utils/constants';
export * from '../shared/utils/platform';

// Hooks
export { useResponsive } from '../presentation/hooks/useResponsive';

// Navigation
export { default as AuthNavigator } from '../presentation/navigation/AuthNavigator';
export { default as SharedNavigator } from '../presentation/navigation/SharedNavigator';

// Contexts (Legacy - para compatibilidade)
export { ThemeProvider, useTheme } from '../presentation/contexts/ThemeContext';
export { NotificationProvider } from '../presentation/contexts/NotificationContext';
