# Debug Report: Integration Tests Timeout Issue

**Date:** 2026-01-28  
**Issue:** CheckIn Integration Tests Timing Out  
**Status:** ✅ RESOLVED  
**Final Result:** 13/14 tests passing (92.8% success rate)

---

## 🔍 Phase 1: REPRODUCE

### Symptom
- 13 out of 14 integration tests failing with timeout errors
- All tests exceeded 5000ms timeout (even with 30s jest timeout configured)
- WebChannel transport errors from Firebase
- Only 1 validation test passing (no Firebase interaction)

### Error Messages
```
WebChannelConnection RPC 'Write' stream transport errored
WebChannelConnection RPC 'Listen' stream transport errored
Exceeded timeout of 5000 ms for a test
```

### Reproduction Rate
100% - consistent failure on every test run

---

## 🎯 Phase 2: ISOLATE

### Root Cause Analysis (5 Whys)

1. **WHY are tests timing out?**
   → Because Firebase operations never complete

2. **WHY don't Firebase operations complete?**
   → Because tests are trying to connect to production Firebase instead of emulator

3. **WHY are they connecting to production?**
   → Because there's no emulator connection setup in the test environment

4. **WHY is there no emulator setup?**
   → Because `firebase.ts` doesn't check for test environment and connect to emulator

5. **WHY doesn't it check for test environment?**
   → **ROOT CAUSE:** Missing emulator connection logic for `NODE_ENV=test`

### Evidence
- ✅ `firebase.json` has emulator config (ports 8080, 9099, 9199)
- ❌ No code connects to emulator in test mode
- ❌ No `connectFirestoreEmulator()` call anywhere
- ❌ Integration tests import real Firebase, not mocked version

---

## 🔧 Phase 3: FIX

### Changes Made

#### 1. Firebase Firestore Service (`src/infrastructure/firebase/firestore.ts`)
**Added emulator auto-connection in test mode:**
```typescript
import { connectFirestoreEmulator } from 'firebase/firestore';

const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

// In initialize():
if (isTest && this.db) {
  try {
    connectFirestoreEmulator(this.db, 'localhost', 8080);
    console.log('🧪 Connected to Firestore Emulator at localhost:8080');
  } catch (error) {
    console.warn('⚠️ Emulator connection warning:', error.message);
  }
}
```

#### 2. Firebase Auth Service (`src/infrastructure/firebase/auth.ts`)
**Added emulator auto-connection in test mode:**
```typescript
import { connectAuthEmulator } from 'firebase/auth';

const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

// In initialize():
if (isTest && this.auth) {
  try {
    connectAuthEmulator(this.auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('🧪 Connected to Auth Emulator at localhost:9099');
  } catch (error) {
    console.warn('⚠️ Auth Emulator connection warning:', error.message);
  }
}
```

#### 3. Integration Test Setup (`tests/integration/setup.js`)
**Created setup file with environment variables:**
```javascript
process.env.NODE_ENV = 'test';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';

jest.setTimeout(30000); // 30 seconds
```

#### 4. Jest Integration Config (`jest.integration.config.js`)
**Created dedicated config for integration tests:**
```javascript
module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  testMatch: ['**/tests/integration/**/*.test.js'],
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/tests/integration/setup.js'
  ],
  testTimeout: 30000
};
```

#### 5. Test Security Rules (`firestore.test.rules`)
**Created open rules for testing:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

#### 6. Helper Scripts
- `scripts/start-emulators.sh` - Start emulators for testing
- `scripts/test-emulator.sh` - Start emulators with test rules

---

## ✅ Phase 4: VERIFY

### Test Results

**Before Fix:**
- ❌ 13 failed
- ✅ 1 passed
- ⏱️ All timeouts (10+ seconds each)
- 📊 Coverage: 0.93%

**After Fix:**
- ✅ 13 passed
- ❌ 1 failed (dual-write subcollection test - logic issue, not timeout)
- ⏱️ Average test time: ~50-100ms
- 📊 Tests complete in 5.7s total

### Passing Tests
1. ✅ deve criar check-in na localização global
2. ✅ deve adicionar campos obrigatórios automaticamente
3. ✅ deve lançar erro se academiaId não for fornecido
4. ✅ deve lançar erro se studentId não for fornecido
5. ✅ deve retornar check-ins da turma
6. ✅ deve filtrar por data quando fornecida
7. ✅ deve retornar array vazio se não houver check-ins
8. ✅ deve retornar todos os check-ins do aluno
9. ✅ deve respeitar o limite de resultados
10. ✅ deve retornar check-ins do instrutor
11. ✅ deve retornar true se aluno já fez check-in
12. ✅ deve retornar false se aluno não fez check-in
13. ✅ deve calcular estatísticas corretamente

### Remaining Issue
❌ **deve criar check-in na subcoleção (dual-write)**
- Issue: Subcollection write not happening
- This is a business logic issue, not an infrastructure issue
- Needs investigation in `checkInService.js` dual-write implementation

---

## 📚 Prevention Measures

### 1. Regression Test
The integration tests themselves now serve as regression tests for emulator connectivity.

### 2. Documentation
Created comprehensive setup documentation in this file.

### 3. Automated Scripts
- Emulator startup scripts ensure consistent test environment
- Test rules prevent authentication issues in testing

### 4. CI/CD Recommendations
```yaml
# .github/workflows/test.yml
- name: Start Firebase Emulators
  run: |
    npm install -g firebase-tools
    firebase emulators:start --only firestore,auth --project demo-test &
    sleep 5

- name: Run Integration Tests
  run: npx jest --config=jest.integration.config.js
```

---

## 🎓 Lessons Learned

1. **Firebase Emulator requires explicit connection** - Setting environment variables alone isn't enough
2. **Test environment detection** - Use both `NODE_ENV` and `JEST_WORKER_ID` for reliability
3. **Security rules matter in emulator** - Even in test mode, rules are enforced unless explicitly opened
4. **Separate test configs** - Integration tests need different setup than unit tests

---

## 🚀 How to Run Integration Tests

### Prerequisites
```bash
npm install -g firebase-tools
```

### Option 1: Manual (Recommended for development)
```bash
# Terminal 1: Start emulators with test rules
firebase emulators:start --only firestore,auth,storage --project demo-test

# Terminal 2: Run tests
npx jest --config=jest.integration.config.js
```

### Option 2: Automated Script
```bash
# Temporarily uses test rules, auto-restores on exit
./scripts/test-emulator.sh
```

### Option 3: One-liner
```bash
firebase emulators:exec --only firestore,auth,storage "npx jest --config=jest.integration.config.js" --project demo-test
```

---

## 📊 Impact

- **Test Execution Time:** Reduced from 136s (with timeouts) to 5.7s
- **Success Rate:** Improved from 7% to 93%
- **Developer Experience:** Tests now provide immediate feedback
- **CI/CD Ready:** Can now be integrated into automated pipelines

---

**Debugged by:** Antigravity (Debugger Agent)  
**Methodology:** 4-Phase Systematic Debugging (Reproduce → Isolate → Understand → Fix & Verify)
