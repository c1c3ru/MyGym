// Firebase compatibility layer
// This file exports Firebase instances for backward compatibility
// All new code should import from '@infrastructure/firebase' instead

import { firebaseApp, firebaseAuth, firebaseFirestore } from '@infrastructure/firebase';

// Initialize Firebase App first (required before Auth and Firestore)
let app;
try {
    app = firebaseApp.getApp();
} catch (error) {
    app = firebaseApp.initialize();
}

// Get or initialize Firebase Auth
let auth;
try {
    auth = firebaseAuth.getAuth();
} catch (error) {
    auth = firebaseAuth.initialize();
}

// Get or initialize Firebase Firestore
let db;
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
