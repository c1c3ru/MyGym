#!/usr/bin/env node

/**
 * Push Final de Migração
 * Migra os arquivos restantes para atingir 80%+ de cobertura
 */

const { execSync } = require('child_process');

// Arquivos restantes com mais problemas
const REMAINING_FILES = [
  'src/presentation/screens/shared/ClassDetailsScreen.js',
  'src/presentation/screens/admin/PaymentManagementScreen.js',
  'src/presentation/screens/shared/GraduationBoardScreen.js',
  'src/presentation/screens/shared/InjuryHistoryScreen.js',
  'src/presentation/screens/shared/StudentEvolution.js',
  'src/presentation/screens/shared/PhysicalEvaluationHistoryScreen.js',
  'src/presentation/screens/admin/AdminModalities.js',
  'src/presentation/screens/shared/InjuryScreen.js',
  'src/presentation/screens/admin/Relatorios.js',
  'src/presentation/screens/shared/PhysicalEvaluationScreen.js',
  'src/presentation/screens/shared/StudentDetailsScreen.js',
  'src/presentation/screens/auth/UserTypeSelectionScreen.js',
  'src/presentation/screens/student/StudentPayments.js',
  'src/presentation/screens/instructor/NovaAula.js',
  'src/presentation/screens/instructor/CheckInScreen.js',
  'src/presentation/screens/admin/AddStudentScreen.js',
  'src/presentation/screens/admin/AddClassScreen.js'
];

class FinalMigrationPush {
  constructor() {
    this.stats = {
      totalFiles: 0,
      migratedFiles: 0,
      totalSubstitutions: 0,
      totalStrings: 0,
      errors: []
    };
  }

  async migrateFile(file) {
    console.log(`\n🔧 Migrando: ${file}`);
    
    try {
      // Migrar Design Tokens
      const tokensResult = execSync(
        `node scripts/auto-migrate-tokens.js ${file}`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      
      const substitutionsMatch = tokensResult.match(/(\d+) substituições/);
      const substitutions = substitutionsMatch ? parseInt(substitutionsMatch[1]) : 0;
      
      // Migrar i18n
      const i18nResult = execSync(
        `node scripts/auto-migrate-i18n.js ${file}`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      
      const stringsMatch = i18nResult.match(/(\d+) strings traduzidas/);
      const strings = stringsMatch ? parseInt(stringsMatch[1]) : 0;
      
      if (substitutions > 0 || strings > 0) {
        console.log(`  ✅ ${substitutions} tokens + ${strings} strings migrados`);
        this.stats.migratedFiles++;
      } else {
        console.log(`  ℹ️  Arquivo já migrado ou sem alterações`);
      }
      
      this.stats.totalSubstitutions += substitutions;
      this.stats.totalStrings += strings;
      this.stats.totalFiles++;
      
    } catch (error) {
      console.error(`  ❌ Erro: ${error.message}`);
      this.stats.errors.push({ file, error: error.message });
    }
  }

  async migrateAll() {
    console.log('🚀 PUSH FINAL DE MIGRAÇÃO - DESIGN TOKENS & I18N');
    console.log('='.repeat(60));
    console.log(`📁 Migrando ${REMAINING_FILES.length} arquivos restantes...\n`);
    
    for (const file of REMAINING_FILES) {
      await this.migrateFile(file);
    }
    
    this.printFinalReport();
  }

  printFinalReport() {
    console.log('\n📊 RELATÓRIO FINAL DA MIGRAÇÃO');
    console.log('='.repeat(60));
    console.log(`📁 Arquivos processados: ${this.stats.totalFiles}`);
    console.log(`✅ Arquivos migrados: ${this.stats.migratedFiles}`);
    console.log(`🔄 Total de substituições (tokens): ${this.stats.totalSubstitutions}`);
    console.log(`🌍 Total de strings traduzidas: ${this.stats.totalStrings}`);
    console.log(`❌ Erros encontrados: ${this.stats.errors.length}`);
    
    const successRate = Math.round((this.stats.migratedFiles / this.stats.totalFiles) * 100);
    console.log(`\n🎯 Taxa de sucesso: ${successRate}%`);
    console.log(`📈 Total de alterações: ${this.stats.totalSubstitutions + this.stats.totalStrings}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ Arquivos com erro:');
      this.stats.errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }
    
    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA!');
    console.log('\n🔍 Próximos passos:');
    console.log('1. Execute: npm run audit:all para verificar nova cobertura');
    console.log('2. Execute: npm test para validar funcionalidade');
    console.log('3. Teste o app: npx expo start --clear');
    console.log('4. Commit as mudanças: git add . && git commit -m "feat: migração massiva para Design Tokens & i18n"');
  }
}

// Executar migração final
if (require.main === module) {
  const migrator = new FinalMigrationPush();
  migrator.migrateAll().catch(console.error);
}

module.exports = FinalMigrationPush;
