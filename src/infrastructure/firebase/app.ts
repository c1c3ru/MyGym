// Firebase App initialization and configuration

import { initializeApp, FirebaseApp } from 'firebase/app';
import { Platform } from 'react-native';

// Detect platform
const isWeb = Platform.OS === 'web';

// Firebase configuration
const firebaseConfig = {
  apiKey: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_FIREBASE_API_KEY) || "AIzaSyA_hzFPt9hUITlMq9BrsJuxAdzycVR3AEI",
  authDomain: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN) || "academia-app-5cf79.firebaseapp.com",
  projectId: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_FIREBASE_PROJECT_ID) || "academia-app-5cf79",
  storageBucket: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET) || "academia-app-5cf79.firebasestorage.app",
  messagingSenderId: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || "377489252583",
  appId: (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_FIREBASE_APP_ID) || "1:377489252583:android:87f2c3948511325769c242"
};

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export class FirebaseAppService {
  private static instance: FirebaseAppService;
  private app: FirebaseApp | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): FirebaseAppService {
    if (!FirebaseAppService.instance) {
      FirebaseAppService.instance = new FirebaseAppService();
    }
    return FirebaseAppService.instance;
  }

  initialize(config?: FirebaseConfig): FirebaseApp {
    if (this.initialized && this.app) {
      return this.app;
    }

    try {
      console.log('🔥 Initializing Firebase App...');
      console.log('📋 Platform:', isWeb ? 'Web' : 'Mobile');
      console.log('📋 Config:', {
        apiKey: (config || firebaseConfig).apiKey ? 'Present' : 'Missing',
        authDomain: (config || firebaseConfig).authDomain,
        projectId: (config || firebaseConfig).projectId,
        appId: (config || firebaseConfig).appId
      });

      this.app = initializeApp(config || firebaseConfig);
      this.initialized = true;

      console.log('✅ Firebase App initialized successfully for', Platform.OS);
      return this.app;
    } catch (error) {
      console.error('❌ Error initializing Firebase App:', error);
      console.error('Platform:', Platform.OS);
      console.error('Stack:', error instanceof Error ? error.stack : 'Unknown error');
      throw error;
    }
  }

  getApp(): FirebaseApp {
    if (!this.app || !this.initialized) {
      throw new Error('Firebase App not initialized. Call initialize() first.');
    }
    return this.app;
  }

  isInitialized(): boolean {
    return this.initialized && this.app !== null;
  }

  getConfig(): FirebaseConfig {
    return firebaseConfig;
  }

  getPlatform(): 'web' | 'mobile' {
    return isWeb ? 'web' : 'mobile';
  }
}

// Export singleton instance
export const firebaseApp = FirebaseAppService.getInstance();