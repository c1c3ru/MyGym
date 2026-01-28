/**
 * Integration Test Setup
 * 
 * Configures Firebase Emulator connection for integration tests
 * This file runs BEFORE integration tests to ensure proper setup
 */

// CRITICAL: Set emulator environment variables BEFORE any Firebase imports
// This ensures Firebase SDK connects to emulator instead of production
process.env.NODE_ENV = 'test';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';

// Disable security rules enforcement in emulator for testing
// This allows tests to run without authentication
process.env.FIRESTORE_EMULATOR_RULES_AUTO_DOWNLOAD = 'false';

console.log('🧪 Integration Test Environment Setup');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - Firestore Emulator:', process.env.FIRESTORE_EMULATOR_HOST);
console.log('   - Auth Emulator:', process.env.FIREBASE_AUTH_EMULATOR_HOST);
console.log('   - Storage Emulator:', process.env.FIREBASE_STORAGE_EMULATOR_HOST);

// Increase timeout for integration tests
jest.setTimeout(30000); // 30 seconds

// Global test cleanup
afterAll(async () => {
    console.log('🧹 Cleaning up test environment...');
    // Add any global cleanup here
});

console.log('✅ Integration test setup complete');
