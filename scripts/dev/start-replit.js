#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting MyGym App in Replit environment...\n');

// Verificar se é ambiente Replit
const isReplit = process.env.REPL_ID || process.env.REPLIT_DEV_DOMAIN;

if (!isReplit) {
  console.log('⚠️  Not running in Replit environment. Using standard start...');
}

// Executar os scripts de correção de imports se necessário
const rootDir = path.join(__dirname, '..');

// Migration scripts disabled - they should only run once during initial setup
// These scripts were converting valid imports incorrectly
// If needed, run them manually: node migrate-imports.js

console.log('\n✅ Setup completed. Starting Expo dev server...\n');

// Iniciar o servidor Expo na porta 5000 para Replit
try {
  // Para Replit, usar lan como host (que escuta em 0.0.0.0) e CI=1 para modo não-interativo
  // Use local expo instead of npx to avoid version mismatch
  execSync('node_modules/.bin/expo start --web --port 5000 --host lan', { 
    cwd: rootDir, 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      CI: '1',
      EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0',
      EXPO_NO_TELEMETRY: '1'
    }
  });
} catch (error) {
  console.error('❌ Error starting Expo server:', error.message);
  process.exit(1);
}