#!/usr/bin/env node

/**
 * Script de Migração em Lote
 * Migra múltiplos arquivos de uma vez para acelerar o processo
 */

const { execSync } = require('child_process');
const path = require('path');

// Arquivos prioritários para migração
const PRIORITY_FILES = [
  'src/presentation/screens/auth/RegisterScreen.js',
  'src/presentation/screens/auth/LoginScreen.js',
  'src/presentation/screens/admin/AdminDashboard.js',
  'src/presentation/screens/instructor/InstructorDashboard.js',
  'src/presentation/screens/student/StudentDashboard.js',
  'src/presentation/screens/shared/ProfileScreen.js',
  'src/presentation/screens/shared/SettingsScreen.js',
  'src/presentation/components/NotificationBell.js',
  'src/presentation/components/UniversalHeader.js',
  'src/presentation/screens/examples/LightThemeExampleScreen.js'
];

class BatchMigrator {
  constructor() {
    this.totalFiles = 0;
    this.successfulMigrations = 0;
    this.totalSubstitutions = 0;
    this.errors = [];
  }

  async migrateTokens(files) {
    console.log('🚀 Iniciando migração em lote de Design Tokens...\n');
    
    for (const file of files) {
      try {
        console.log(`📁 Migrando: ${file}`);
        
        const result = execSync(
          `node scripts/auto-migrate-tokens.js ${file}`,
          { 
            cwd: process.cwd(),
            encoding: 'utf8',
            stdio: 'pipe'
          }
        );
        
        // Extrair estatísticas do resultado
        const substitutionsMatch = result.match(/(\d+) substituições/);
        const substitutions = substitutionsMatch ? parseInt(substitutionsMatch[1]) : 0;
        
        if (substitutions > 0) {
          console.log(`  ✅ ${substitutions} substituições aplicadas`);
          this.successfulMigrations++;
          this.totalSubstitutions += substitutions;
        } else {
          console.log(`  ℹ️  Nenhuma alteração necessária`);
        }
        
        this.totalFiles++;
        
      } catch (error) {
        console.error(`  ❌ Erro: ${error.message}`);
        this.errors.push({ file, error: error.message });
      }
    }
  }

  async migrateI18n(files) {
    console.log('\n🌍 Iniciando migração em lote de i18n...\n');
    
    for (const file of files) {
      try {
        console.log(`📁 Migrando i18n: ${file}`);
        
        const result = execSync(
          `node scripts/auto-migrate-i18n.js ${file}`,
          { 
            cwd: process.cwd(),
            encoding: 'utf8',
            stdio: 'pipe'
          }
        );
        
        // Extrair estatísticas do resultado
        const stringsMatch = result.match(/(\d+) strings traduzidas/);
        const strings = stringsMatch ? parseInt(stringsMatch[1]) : 0;
        
        if (strings > 0) {
          console.log(`  ✅ ${strings} strings traduzidas`);
        } else {
          console.log(`  ℹ️  Nenhuma string para traduzir`);
        }
        
      } catch (error) {
        console.error(`  ❌ Erro: ${error.message}`);
        this.errors.push({ file, error: error.message });
      }
    }
  }

  printSummary() {
    console.log('\n📊 RESUMO DA MIGRAÇÃO EM LOTE\n');
    console.log('='.repeat(50));
    console.log(`📁 Arquivos processados: ${this.totalFiles}`);
    console.log(`✅ Migrações bem-sucedidas: ${this.successfulMigrations}`);
    console.log(`🔄 Total de substituições: ${this.totalSubstitutions}`);
    console.log(`❌ Erros encontrados: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Arquivos com erro:');
      this.errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }
    
    const percentage = Math.round((this.successfulMigrations / this.totalFiles) * 100);
    console.log(`\n🎯 Taxa de sucesso: ${percentage}%`);
    
    console.log('\n🔍 Próximos passos:');
    console.log('1. Execute: npm run audit:all para verificar progresso');
    console.log('2. Execute: npm run lint para verificar sintaxe');
    console.log('3. Execute: npm test para verificar funcionalidade');
  }
}

// Executar migração em lote
if (require.main === module) {
  const migrator = new BatchMigrator();
  
  const args = process.argv.slice(2);
  const files = args.length > 0 ? args : PRIORITY_FILES;
  
  console.log(`🎯 Migrando ${files.length} arquivos prioritários...`);
  
  migrator.migrateTokens(files)
    .then(() => migrator.migrateI18n(files))
    .then(() => migrator.printSummary())
    .catch(console.error);
}

module.exports = BatchMigrator;
