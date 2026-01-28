# Integration Tests - Check-In Service

## Overview

Integration tests for the Check-In Service that validate the complete flow including Firebase Firestore operations.

## Prerequisites

Before running integration tests, you need to have Firebase emulators running. This ensures tests don't affect production data.

## Running Tests

### Option 1: With Firebase Emulators (Recommended)

1. **Start Firebase Emulators** (in a separate terminal):
   ```bash
   npm run emulator:start
   ```

2. **Run Integration Tests**:
   ```bash
   npm run test:integration:emulator
   ```

### Option 2: Full Automated Test (Starts and Stops Emulators)

```bash
npm run test:integration:full
```

This command will:
- Start Firebase emulators
- Wait for them to be ready
- Run integration tests
- Stop emulators after tests complete

### Option 3: Run Specific Test File

```bash
jest tests/integration/checkIn.test.js
```

## Test Configuration

### Timeouts

Integration tests have extended timeouts to account for Firebase operations:
- **Global timeout**: 30 seconds (`jest.setTimeout(30000)`)
- **beforeAll**: 10 seconds
- **afterEach**: 15 seconds
- **beforeEach**: 15 seconds

### Firebase Emulator Ports

- **Firestore**: 8080
- **Auth**: 9099
- **Storage**: 9199
- **Emulator UI**: 4000

## Test Structure

```
tests/integration/
├── checkIn.test.js          # Check-in service integration tests
├── setupEmulators.js        # Firebase emulator configuration
└── README.md                # This file
```

## Common Issues

### 1. Timeout Errors

**Problem**: Tests fail with "Exceeded timeout of 5000 ms"

**Solution**: 
- Ensure Firebase emulators are running
- Check that `jest.setTimeout(30000)` is set
- Verify network connectivity

### 2. WebChannel Transport Errors

**Problem**: Firebase connection warnings in console

**Solution**:
- Start Firebase emulators before running tests
- Use `npm run emulator:start` in a separate terminal

### 3. Coverage Threshold Not Met

**Problem**: Tests pass but coverage is below 70%

**Solution**:
- This is expected for integration tests focusing on specific services
- Run full test suite: `npm run test:coverage`
- Integration tests focus on critical paths, not 100% coverage

## Test Data Cleanup

Tests automatically clean up test data after each test using the `cleanupTestData()` function. This ensures:
- No test pollution
- Consistent test state
- Isolated test execution

## Writing New Integration Tests

When adding new integration tests:

1. **Use test prefixes** for IDs to avoid conflicts:
   ```javascript
   const TEST_ACADEMIA_ID = 'test-academia-123';
   ```

2. **Add proper timeouts**:
   ```javascript
   beforeEach(async () => {
       // setup code
   }, 15000);
   ```

3. **Clean up after tests**:
   ```javascript
   afterEach(async () => {
       await cleanupTestData(TEST_ACADEMIA_ID);
   }, 15000);
   ```

4. **Use descriptive test names**:
   ```javascript
   it('deve criar check-in na localização global', async () => {
       // test code
   });
   ```

## Debugging

To debug integration tests:

1. **Enable verbose logging**:
   ```bash
   npm run test:integration:emulator -- --verbose
   ```

2. **Run single test**:
   ```bash
   jest tests/integration/checkIn.test.js -t "deve criar check-in"
   ```

3. **View Emulator UI**:
   - Start emulators: `npm run emulator:ui`
   - Open browser: http://localhost:4000
   - Inspect Firestore data in real-time

## CI/CD Integration

For continuous integration:

```yaml
# .github/workflows/test.yml
- name: Run Integration Tests
  run: |
    npm run emulator:start &
    sleep 5
    npm run test:integration:emulator
    kill %1
```

## Performance

Integration tests are slower than unit tests due to Firebase operations:
- **Unit tests**: ~100ms per test
- **Integration tests**: ~1-5s per test

This is expected and acceptable for integration testing.
