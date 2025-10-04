#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuração
const BUILD_PROFILES = {
  'development': 'development',
  'preview': 'preview', 
  'production': 'production-apk',
  'production-apk': 'production-apk',
  'production-aab': 'production'
};

function main() {
  const profile = process.argv[2] || 'preview';
  const platform = process.argv[3] || 'android';
  
  console.log('🚀 MyGym Build Script');
  console.log('====================');
  console.log(`📱 Plataforma: ${platform}`);
  console.log(`🔧 Perfil: ${profile}`);
  console.log('');

  // Validar perfil
  if (!BUILD_PROFILES[profile]) {
    console.error('❌ Perfil inválido. Perfis disponíveis:');
    Object.keys(BUILD_PROFILES).forEach(p => console.error(`   - ${p}`));
    process.exit(1);
  }

  const easProfile = BUILD_PROFILES[profile];

  try {
    // Verificar se EAS CLI está instalado
    console.log('🔍 Verificando EAS CLI...');
    execSync('eas --version', { stdio: 'pipe' });
    console.log('✅ EAS CLI encontrado');

    // Verificar se está logado
    console.log('🔍 Verificando login...');
    try {
      const whoami = execSync('eas whoami', { encoding: 'utf8' });
      console.log(`✅ Logado como: ${whoami.trim()}`);
    } catch (error) {
      console.error('❌ Não está logado no EAS. Execute: eas login');
      process.exit(1);
    }

    // Verificar configuração do projeto
    console.log('🔍 Verificando configuração...');
    if (!fs.existsSync('eas.json')) {
      console.error('❌ Arquivo eas.json não encontrado. Execute: eas build:configure');
      process.exit(1);
    }
    console.log('✅ Configuração encontrada');

    // Instalar dependências se necessário
    if (!fs.existsSync('node_modules')) {
      console.log('📦 Instalando dependências...');
      execSync('npm install', { stdio: 'inherit' });
    }

    // Executar verificações pré-build
    console.log('🔍 Executando verificações...');
    
    try {
      execSync('npm run type-check', { stdio: 'pipe' });
      console.log('✅ Type check passou');
    } catch (error) {
      console.warn('⚠️ Type check falhou, continuando...');
    }

    try {
      execSync('npm run lint', { stdio: 'pipe' });
      console.log('✅ Lint passou');
    } catch (error) {
      console.warn('⚠️ Lint falhou, continuando...');
    }

    // Executar build
    console.log('');
    console.log('🚀 Iniciando build...');
    console.log(`   Profile: ${easProfile}`);
    console.log(`   Platform: ${platform}`);
    console.log('');

    const buildCommand = `eas build --platform ${platform} --profile ${easProfile} --non-interactive`;
    
    console.log(`Executando: ${buildCommand}`);
    execSync(buildCommand, { stdio: 'inherit' });

    console.log('');
    console.log('🎉 Build concluído com sucesso!');
    console.log('🔗 Verifique o status em: https://expo.dev/accounts/c1c3ru/projects/academia-app/builds');

  } catch (error) {
    console.error('');
    console.error('❌ Erro durante o build:');
    console.error(error.message);
    console.error('');
    console.error('💡 Dicas:');
    console.error('   - Verifique se está logado: eas login');
    console.error('   - Verifique a configuração: eas build:configure');
    console.error('   - Verifique os logs no Expo Dashboard');
    process.exit(1);
  }
}

// Ajuda
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('MyGym Build Script');
  console.log('');
  console.log('Uso:');
  console.log('  node scripts/build-android.js [profile] [platform]');
  console.log('');
  console.log('Perfis disponíveis:');
  Object.keys(BUILD_PROFILES).forEach(profile => {
    console.log(`  ${profile.padEnd(15)} - ${BUILD_PROFILES[profile]}`);
  });
  console.log('');
  console.log('Plataformas:');
  console.log('  android         - Build para Android');
  console.log('  ios             - Build para iOS');
  console.log('  all             - Build para ambas');
  console.log('');
  console.log('Exemplos:');
  console.log('  node scripts/build-android.js preview');
  console.log('  node scripts/build-android.js production android');
  console.log('  node scripts/build-android.js development');
  process.exit(0);
}

main();
