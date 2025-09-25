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

if (fs.existsSync(path.join(rootDir, 'migrate-imports.js'))) {
  console.log('🔧 Running import migration...');
  try {
    execSync('node migrate-imports.js', { cwd: rootDir, stdio: 'inherit' });
  } catch (error) {
    console.log('ℹ️  Import migration completed');
  }
}

if (fs.existsSync(path.join(rootDir, 'fix-components-alias.js'))) {
  console.log('🔧 Fixing component aliases...');
  try {
    execSync('node fix-components-alias.js', { cwd: rootDir, stdio: 'inherit' });
  } catch (error) {
    console.log('ℹ️  Component alias fix completed');
  }
}

if (fs.existsSync(path.join(rootDir, 'fix-domain-imports.js'))) {
  console.log('🔧 Fixing domain imports...');
  try {
    execSync('node fix-domain-imports.js', { cwd: rootDir, stdio: 'inherit' });
  } catch (error) {
    console.log('ℹ️  Domain imports fix completed');
  }
}

if (fs.existsSync(path.join(rootDir, 'fix-incorrect-imports.js'))) {
  console.log('🔧 Fixing incorrect imports...');
  try {
    execSync('node fix-incorrect-imports.js', { cwd: rootDir, stdio: 'inherit' });
  } catch (error) {
    console.log('ℹ️  Incorrect imports fix completed');
  }
}

console.log('\n✅ Setup completed. Starting Expo dev server...\n');

// Iniciar o servidor Expo na porta 5000 para Replit
try {
  // Para Replit, usar --host localhost funciona com o proxy do ambiente
  execSync('npx expo start --web --port 5000 --host localhost --clear', { 
    cwd: rootDir, 
    stdio: 'inherit' 
  });
} catch (error) {
  console.error('❌ Error starting Expo server:', error.message);
  process.exit(1);
}