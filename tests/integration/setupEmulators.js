import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

/**
 * Setup Firebase Emulators for Integration Tests
 * 
 * This file configures Firebase to use local emulators instead of production.
 * Run `firebase emulators:start` before running integration tests.
 */

// Firebase test configuration
const firebaseConfig = {
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id'
};

// Initialize Firebase for testing
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Connect to emulators
if (process.env.NODE_ENV === 'test') {
    try {
        // Firestore emulator
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('✅ Connected to Firestore Emulator');

        // Auth emulator
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log('✅ Connected to Auth Emulator');

        // Storage emulator
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('✅ Connected to Storage Emulator');
    } catch (error) {
        console.warn('⚠️ Emulators may already be connected:', error.message);
    }
}

export { db, auth, storage };
