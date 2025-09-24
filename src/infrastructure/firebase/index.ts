// Export all Firebase infrastructure services

export * from './app';
export * from './auth';
export * from './firestore';

// Import services for initialization
import { firebaseApp } from './app';
import { firebaseAuth } from './auth';
import { firebaseFirestore } from './firestore';

// Re-export commonly used Firebase instances
export { firebaseApp, firebaseAuth, firebaseFirestore };

// Initialize all services
export function initializeFirebaseServices() {
  console.log('🚀 Initializing all Firebase services...');
  
  try {
    // Initialize in order: App -> Auth -> Firestore
    const app = firebaseApp.initialize();
    const auth = firebaseAuth.initialize();
    const db = firebaseFirestore.initialize();
    
    console.log('✅ All Firebase services initialized successfully');
    
    return {
      app,
      auth,
      db
    };
  } catch (error) {
    console.error('❌ Error initializing Firebase services:', error);
    throw error;
  }
}