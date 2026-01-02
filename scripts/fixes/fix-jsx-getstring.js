#!/usr/bin/env node

/**
 * Script para corrigir problemas de JSX com getString() sem chaves
 */

const fs = require('fs');
const path = require('path');

const NAVIGATION_DIR = path.join(__dirname, '../src/presentation/navigation');

// Mapeamento de getString() para strings fixas
const STRING_MAPPINGS = {
  'dashboard': 'Dashboard',
  'students': 'Students', 
  'classes': 'Classes',
  'modalities': 'Modalities',
  'management': 'Management',
  'reports': 'Reports',
  'invitations': 'Invitations',
  'invites': 'Invites',
  'adminStack': 'AdminStack',
  'addClass': 'AddClass',
  'checkIns': 'CheckIns',
  'editClass': 'EditClass',
  'classDetails': 'ClassDetails',
  'addStudent': 'AddStudent',
  'editStudent': 'EditStudent',
  'studentDetails': 'StudentDetails',
  'studentPayments': 'StudentPayments',
  'studentProfile': 'StudentProfile',
  'addGraduationScreen': 'AddGraduation',
  'profile': 'Profile',
  'changePassword': 'ChangePassword',
  'physicalEvaluation': 'PhysicalEvaluation',
  'physicalEvaluationHistory': 'PhysicalEvaluationHistory',
  'injury': 'Injury',
  'privacyPolicy': 'PrivacyPolicy',
  'notificationSettings': 'NotificationSettings',
  'privacySettings': 'PrivacySettings',
  'calendar': 'Calendar',
  'studentDashboard': 'StudentDashboard',
  'evolution': 'Evolution',
  'login': 'Login',
  'register': 'Register',
  'forgotPassword': 'ForgotPassword'
};

function fixJSXGetString(content) {
  let modifiedContent = content;
  let replacements = 0;

  // Regex para encontrar name=getString('key') sem chaves
  const jsxRegex = /name=getString\('([^']+)'\)/g;
  
  modifiedContent = modifiedContent.replace(jsxRegex, (match, key) => {
    const fixedName = STRING_MAPPINGS[key] || key;
    replacements++;
    console.log(`   ✅ name=getString('${key}') → name="${fixedName}"`);
    return `name="${fixedName}"`;
  });

  // Regex para encontrar id=getString('key') sem chaves
  const idRegex = /id=getString\('([^']+)'\)/g;
  
  modifiedContent = modifiedContent.replace(idRegex, (match, key) => {
    const fixedName = STRING_MAPPINGS[key] || key;
    replacements++;
    console.log(`   ✅ id=getString('${key}') → id="${fixedName}"`);
    return `id="${fixedName}"`;
  });

  return { content: modifiedContent, replacements };
}

function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const { content: modifiedContent, replacements } = fixJSXGetString(originalContent);

    if (replacements > 0) {
      const relativePath = path.relative(NAVIGATION_DIR, filePath);
      console.log(`\n📄 ${relativePath}`);
      
      // Cria backup
      const backupPath = filePath + '.backup-jsx-fix';
      fs.writeFileSync(backupPath, originalContent);
      
      // Salva arquivo corrigido
      fs.writeFileSync(filePath, modifiedContent);
      
      console.log(`   💾 ${replacements} correções aplicadas`);
      return replacements;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return 0;
  }
}

function main() {
  console.log('🔧 Corrigindo problemas de JSX com getString()...\n');
  
  const files = fs.readdirSync(NAVIGATION_DIR).filter(file => 
    file.endsWith('.js') || file.endsWith('.jsx')
  );
  
  let totalReplacements = 0;
  let filesModified = 0;
  
  files.forEach(file => {
    const filePath = path.join(NAVIGATION_DIR, file);
    const replacements = processFile(filePath);
    
    if (replacements > 0) {
      totalReplacements += replacements;
      filesModified++;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO DE CORREÇÃO JSX');
  console.log('='.repeat(60));
  console.log(`✅ Arquivos processados: ${files.length}`);
  console.log(`✅ Arquivos modificados: ${filesModified}`);
  console.log(`✅ Total de correções: ${totalReplacements}`);
  
  if (totalReplacements > 0) {
    console.log('\n💡 Próximos passos:');
    console.log('   1. Verificar se o servidor funciona');
    console.log('   2. Testar navegação');
    console.log('   3. Remover backups: rm src/presentation/navigation/*.backup-jsx-fix');
  }
  
  console.log('='.repeat(60));
  console.log('\n🎉 Correção JSX concluída!');
}

if (require.main === module) {
  main();
}

module.exports = { fixJSXGetString, STRING_MAPPINGS };
