// Firebase Authentication service abstraction

import { getAuth, Auth } from 'firebase/auth';
import { firebaseApp } from './app';

export class FirebaseAuthService {
  private static instance: FirebaseAuthService;
  private auth: Auth | null = null;
  private initialized = false;

  private constructor() {}

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