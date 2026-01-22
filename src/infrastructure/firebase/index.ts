// Export all Firebase infrastructure services

export * from './app';
export * from './auth';
export * from './firestore';
export * from './storage';

// Import services for initialization
import { firebaseApp } from './app';
import { firebaseAuth } from './auth';
import { firebaseFirestore } from './firestore';
import { firebaseStorage } from './storage';

// Re-export commonly used Firebase instances
export { firebaseApp, firebaseAuth, firebaseFirestore, firebaseStorage };

// Initialize all services
export function initializeFirebaseServices() {
  console.log('🚀 Initializing all Firebase services...');

  try {
    // Initialize in order: App -> Auth -> Firestore -> Storage
    const app = firebaseApp.initialize();
    const auth = firebaseAuth.initialize();
    const db = firebaseFirestore.initialize();
    const storage = firebaseStorage.initialize();

    console.log('✅ All Firebase services initialized successfully');

    return {
      app,
      auth,
      db,
      storage
    };
  } catch (error) {
    console.error('❌ Error initializing Firebase services:', error);
    throw error;
  }
}