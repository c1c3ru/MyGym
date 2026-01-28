#!/bin/bash

# Script to run integration tests with Firebase Emulator
# Temporarily uses open security rules for testing

echo "🧪 Preparing Firebase Emulator for Integration Tests..."

# Backup original firebase.json
cp firebase.json firebase.json.backup

# Create temporary firebase.json with test rules
cat > firebase.json << 'EOF'
{
  "firestore": {
    "rules": "firestore.test.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "firestore": {
      "port": 8080
    },
    "auth": {
      "port": 9099
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
EOF

echo "✅ Configured emulator with test rules"
echo "📝 Original firebase.json backed up to firebase.json.backup"
echo ""
echo "🔥 Starting Firebase Emulators..."
echo "   Press Ctrl+C to stop and restore original config"
echo ""

# Trap to restore firebase.json on exit
trap 'echo ""; echo "🔄 Restoring original firebase.json..."; mv firebase.json.backup firebase.json; echo "✅ Restored"; exit' INT TERM EXIT

# Start emulators
firebase emulators:start --only firestore,auth,storage --project demo-test
