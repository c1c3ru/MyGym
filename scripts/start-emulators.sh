#!/bin/bash

# Firebase Emulator Startup Script for Tests
# Starts Firebase emulators needed for integration tests

echo "🔥 Starting Firebase Emulators for Testing..."

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Start emulators in the background
firebase emulators:start --only firestore,auth,storage --project demo-test &

# Store the PID
EMULATOR_PID=$!
echo "✅ Firebase Emulators started (PID: $EMULATOR_PID)"
echo "   - Firestore: http://localhost:8080"
echo "   - Auth: http://localhost:9099"
echo "   - Storage: http://localhost:9199"
echo "   - UI: http://localhost:4000"

# Wait for emulators to be ready
echo "⏳ Waiting for emulators to be ready..."
sleep 5

# Check if emulators are running
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Firestore Emulator is ready"
else
    echo "❌ Firestore Emulator failed to start"
    exit 1
fi

echo "🎉 All emulators are ready for testing!"
echo "   To stop: firebase emulators:stop or kill $EMULATOR_PID"
