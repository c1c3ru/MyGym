// Firebase Storage service abstraction

import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseApp } from './app';

export class FirebaseStorageService {
    private static instance: FirebaseStorageService;
    private storage: FirebaseStorage | null = null;
    private initialized = false;

    private constructor() { }

    static getInstance(): FirebaseStorageService {
        if (!FirebaseStorageService.instance) {
            FirebaseStorageService.instance = new FirebaseStorageService();
        }
        return FirebaseStorageService.instance;
    }

    initialize(): FirebaseStorage {
        if (this.initialized && this.storage) {
            return this.storage;
        }

        try {
            console.log('📦 Initializing Firebase Storage...');

            // Ensure Firebase App is initialized
            const app = firebaseApp.getApp();

            // Initialize Storage
            this.storage = getStorage(app);
            this.initialized = true;

            console.log('✅ Firebase Storage initialized successfully');
            return this.storage;
        } catch (error) {
            console.error('❌ Error initializing Firebase Storage:', error);
            throw error;
        }
    }

    getStorage(): FirebaseStorage {
        if (!this.storage || !this.initialized) {
            return this.initialize();
        }
        return this.storage;
    }

    isInitialized(): boolean {
        return this.initialized && this.storage !== null;
    }
}

// Export singleton instance
export const firebaseStorage = FirebaseStorageService.getInstance();
