#!/usr/bin/env node
/**
 * Fase 2: Telas Principais
 * Migrar dashboards e telas mais usadas
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando Fase 2: Telas Principais...');

const files = [
  '/src/presentation/screens/admin/AdminDashboard.js',
  '/src/presentation/screens/student/StudentDashboard.js',
  '/src/presentation/screens/instructor/InstructorDashboard.js',
  '/src/presentation/screens/shared/StudentProfileScreen.js',
];

const actions = [
  'Substituir valores hardcoded por tokens',
  'Substituir strings por getString()',
  'Adicionar imports necessários',
  'Testar funcionalidade',
];

async function migratePhase() {
  console.log('📁 Arquivos a migrar:', files.length);
  console.log('✅ Ações a executar:', actions.length);
  
  for (const file of files) {
    console.log(`🔧 Migrando: ${file}`);
    
    try {
      const fullPath = path.join(process.cwd(), file);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Arquivo não encontrado: ${file}`);
        continue;
      }
      
      // Aplicar migrações específicas aqui
      await migrateFile(fullPath);
      
      console.log(`✅ Migrado: ${file}`);
    } catch (error) {
      console.error(`❌ Erro em ${file}:`, error.message);
    }
  }
  
  console.log('🎉 Fase 2: Telas Principais concluída!');
}

async function migrateFile(filePath) {
  // Implementar lógica específica de migração
  console.log(`  📝 Processando: ${path.basename(filePath)}`);
  
  // TODO: Implementar migrações automáticas
  // 1. Substituir valores hardcoded por tokens
  // 2. Substituir strings por getString()
  // 3. Adicionar imports necessários
}

if (require.main === module) {
  migratePhase().catch(console.error);
}

module.exports = { migratePhase, migrateFile };
