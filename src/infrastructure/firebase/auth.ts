// Firebase Authentication service abstraction

import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { firebaseApp } from './app';

const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

export class FirebaseAuthService {
  private static instance: FirebaseAuthService;
  private auth: Auth | null = null;
  private initialized = false;

  private constructor() { }

  static getInstance(): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService();
    }
    return FirebaseAuthService.instance;
  }

  initialize(): Auth {
    if (this.initialized && this.auth) {
      return this.auth;
    }

    try {
      console.log('🔐 Initializing Firebase Auth...');

      // Ensure Firebase App is initialized
      const app = firebaseApp.getApp();

      // Initialize Auth
      this.auth = getAuth(app);
      this.initialized = true;

      // Connect to emulator in test environment
      if (isTest && this.auth) {
        try {
          connectAuthEmulator(this.auth, 'http://localhost:9099', { disableWarnings: true });
          console.log('🧪 Connected to Auth Emulator at localhost:9099');
        } catch (error) {
          // Emulator might already be connected, ignore error
          console.warn('⚠️ Auth Emulator connection warning:', error instanceof Error ? error.message : error);
        }
      }

      console.log('✅ Firebase Auth initialized successfully');
      return this.auth;
    } catch (error) {
      console.error('❌ Error initializing Firebase Auth:', error);
      throw error;
    }
  }

  getAuth(): Auth {
    if (!this.auth || !this.initialized) {
      throw new Error('Firebase Auth not initialized. Call initialize() first.');
    }
    return this.auth;
  }

  isInitialized(): boolean {
    return this.initialized && this.auth !== null;
  }

  getCurrentUser() {
    const auth = this.getAuth();
    return auth.currentUser;
  }

  async waitForAuthInitialization(): Promise<void> {
    const auth = this.getAuth();

    return new Promise((resolve) => {
      if (auth.currentUser !== undefined) {
        resolve();
        return;
      }

      const unsubscribe = auth.onAuthStateChanged(() => {
        unsubscribe();
        resolve();
      });
    });
  }
}

// Export singleton instance
export const firebaseAuth = FirebaseAuthService.getInstance();