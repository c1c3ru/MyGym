import { firebaseApp, firebaseAuth, firebaseFirestore } from '@infrastructure/firebase';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';

// Initialize Firebase App first (required before Auth and Firestore)
let app: FirebaseApp;
try {
    app = firebaseApp.getApp();
} catch (error) {
    app = firebaseApp.initialize();
}

// Get or initialize Firebase Auth
let auth: Auth;
try {
    auth = firebaseAuth.getAuth();
} catch (error) {
    auth = firebaseAuth.initialize();
}

// Get or initialize Firebase Firestore
let db: Firestore;
try {
    db = firebaseFirestore.getFirestore();
} catch (error) {
    db = firebaseFirestore.initialize();
}

// Export instances
export { auth, db, app };

// Export functions (for dynamic access)
export const functions = null; // TODO: Implement if needed

// Default export
export default {
    auth,
    db,
    app,
    functions
};
