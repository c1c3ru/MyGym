// Firebase Firestore service abstraction

import { initializeFirestore, Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import { firebaseApp } from './app';

const isWeb = Platform.OS === 'web';

export class FirebaseFirestoreService {
  private static instance: FirebaseFirestoreService;
  private db: Firestore | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): FirebaseFirestoreService {
    if (!FirebaseFirestoreService.instance) {
      FirebaseFirestoreService.instance = new FirebaseFirestoreService();
    }
    return FirebaseFirestoreService.instance;
  }

  initialize(): Firestore {
    if (this.initialized && this.db) {
      return this.db;
    }

    try {
      console.log('🔥 Initializing Firebase Firestore...');
      
      // Ensure Firebase App is initialized
      const app = firebaseApp.getApp();

      // Initialize Firestore with platform-specific settings
      if (isWeb) {
        // For web, use optimized settings for connectivity
        this.db = initializeFirestore(app, {
          experimentalAutoDetectLongPolling: true,
          ignoreUndefinedProperties: true,
          cacheSizeBytes: 40000000, // 40MB cache
        });
        console.log('✅ Firebase Firestore initialized for web with optimized settings');
      } else {
        // For React Native, use specific settings
        this.db = initializeFirestore(app, {
          experimentalAutoDetectLongPolling: true
        });
        console.log('✅ Firebase Firestore initialized for mobile with long-polling');
      }

      this.initialized = true;
      console.log('🎉 Firebase Firestore initialized successfully for', Platform.OS);
      
      return this.db;
    } catch (error) {
      console.error('❌ Error initializing Firebase Firestore:', error);
      console.error('Platform:', Platform.OS);
      console.error('Stack:', error instanceof Error ? error.stack : 'Unknown error');
      throw error;
    }
  }

  getFirestore(): Firestore {
    if (!this.db || !this.initialized) {
      throw new Error('Firebase Firestore not initialized. Call initialize() first.');
    }
    return this.db;
  }

  isInitialized(): boolean {
    return this.initialized && this.db !== null;
  }

  // Helper methods for common operations
  getCollectionPath(collection: string): string {
    return collection;
  }

  getDocumentPath(collection: string, documentId: string): string {
    return `${collection}/${documentId}`;
  }

  getSubcollectionPath(parentCollection: string, parentId: string, subcollection: string): string {
    return `${parentCollection}/${parentId}/${subcollection}`;
  }

  // Platform-specific optimizations
  getPlatformOptimizations() {
    return {
      platform: Platform.OS,
      isWeb,
      cachingEnabled: isWeb,
      longPollingEnabled: true,
      maxCacheSize: isWeb ? 40000000 : undefined
    };
  }
}

// Export singleton instance
export const firebaseFirestore = FirebaseFirestoreService.getInstance();