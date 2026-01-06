import { firebaseApp, firebaseAuth, firebaseFirestore } from '@infrastructure/firebase';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';
import { Functions, getFunctions } from 'firebase/functions';

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

// Get or initialize Firebase Functions
let functions: Functions;
try {
    functions = getFunctions(app);
} catch (error) {
    console.error('Error initializing functions:', error);
    // Fallback or re-throw if critical
    functions = getFunctions(app);
}

// Export instances
export { auth, db, app, functions };

// Default export
export default {
    auth,
    db,
    app,
    functions
};
