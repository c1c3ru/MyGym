/**
 * Firebase Emulator Test Helper
 * 
 * Provides utilities for integration tests with Firebase Emulator
 * Handles emulator initialization and cleanup
 */

import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let testEnv;

/**
 * Initialize Firebase Test Environment with open rules for integration tests
 */
export async function setupFirebaseTest() {
    // Use open rules for integration tests
    const openRules = `
        rules_version = '2';
        service cloud.firestore {
            match /databases/{database}/documents {
                match /{document=**} {
                    allow read, write: if true;
                }
            }
        }
    `;

    testEnv = await initializeTestEnvironment({
        projectId: 'demo-test',
        firestore: {
            rules: openRules,
            host: 'localhost',
            port: 8080
        }
    });

    return testEnv;
}

/**
 * Get Firestore instance for testing
 */
export function getTestFirestore() {
    if (!testEnv) {
        throw new Error('Test environment not initialized. Call setupFirebaseTest() first.');
    }
    return testEnv.unauthenticatedContext().firestore();
}

/**
 * Get authenticated Firestore context
 */
export function getAuthenticatedContext(auth) {
    if (!testEnv) {
        throw new Error('Test environment not initialized. Call setupFirebaseTest() first.');
    }
    return testEnv.authenticatedContext(auth.uid, auth).firestore();
}

/**
 * Clear all Firestore data
 */
export async function clearFirestoreData() {
    if (testEnv) {
        await testEnv.clearFirestore();
    }
}

/**
 * Cleanup test environment
 */
export async function cleanupFirebaseTest() {
    if (testEnv) {
        await testEnv.cleanup();
        testEnv = null;
    }
}

// Export assertion helpers
export { assertSucceeds, assertFails };
