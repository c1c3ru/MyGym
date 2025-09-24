import { Platform } from 'react-native';

class CrashlyticsService {
  constructor() {
    this.isEnabled = !__DEV__ && Platform.OS !== 'web'; // Desabilitar em dev e web
    this.crashlytics = null;
    console.log('🔍 Crashlytics service initialized for', Platform.OS);
  }

  // Registrar erro não fatal
  recordError(error, context = {}) {
    console.log('📊 [CRASHLYTICS] Error:', error.message || error, context);
  }

  // Registrar erro fatal (crash)
  crash(message = 'Manual crash for testing') {
    console.log('💥 [CRASHLYTICS] Manual crash:', message);
  }

  // Definir ID do usuário
  setUserId(userId) {
    console.log('👤 [CRASHLYTICS] User ID:', userId);
  }

  // Definir atributos personalizados
  setAttributes(attributes) {
    console.log('📋 [CRASHLYTICS] Attributes:', attributes);
  }

  // Log personalizado
  log(message) {
    console.log('📝 [CRASHLYTICS] Log:', message);
  }

  // Registrar evento de autenticação
  logAuthEvent(userId, userType, academiaId) {
    console.log('🔐 [CRASHLYTICS] Auth Event:', { userId, userType, academiaId });
  }

  // Registrar erro de API
  logApiError(endpoint, error, statusCode) {
    console.log('🌐 [CRASHLYTICS] API Error:', { endpoint, error: error.message, statusCode });
  }

  // Registrar erro de navegação
  logNavigationError(screen, error) {
    console.log('🧭 [CRASHLYTICS] Navigation Error:', { screen, error: error.message });
  }

  // Registrar erro de autenticação
  logAuthError(error, context = {}) {
    console.log('🔑 [CRASHLYTICS] Auth Error:', { error: error.message, context });
  }

  // Registrar erro de Firestore
  logFirestoreError(operation, collection, error) {
    console.log('🔥 [CRASHLYTICS] Firestore Error:', { operation, collection, error: error.message });
  }
}

// Singleton instance
const crashlyticsService = new CrashlyticsService();

export default crashlyticsService;
