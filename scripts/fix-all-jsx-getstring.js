#!/usr/bin/env node

/**
 * Script para corrigir TODOS os problemas de JSX com getString() sem chaves
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src/presentation');

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

function fixAllJSXGetString(content) {
  let modifiedContent = content;
  let replacements = 0;

  // Regex para encontrar qualquer atributo=getString('key') sem chaves
  const jsxRegex = /(\w+)=getString\('([^']+)'\)/g;
  
  modifiedContent = modifiedContent.replace(jsxRegex, (match, attribute, key) => {
    const fixedName = STRING_MAPPINGS[key] || key;
    replacements++;
    console.log(`   ✅ ${attribute}=getString('${key}') → ${attribute}="${fixedName}"`);
    return `${attribute}="${fixedName}"`;
  });

  return { content: modifiedContent, replacements };
}

function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    
    // Só processa se contém getString
    if (!originalContent.includes('getString(')) {
      return 0;
    }
    
    const { content: modifiedContent, replacements } = fixAllJSXGetString(originalContent);

    if (replacements > 0) {
      const relativePath = path.relative(SRC_DIR, filePath);
      console.log(`\n📄 ${relativePath}`);
      
      // Cria backup
      const backupPath = filePath + '.backup-jsx-all-fix';
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

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let totalReplacements = 0;
  let filesModified = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '__tests__') {
        const { replacements, modified } = walkDirectory(fullPath);
        totalReplacements += replacements;
        filesModified += modified;
      }
    } else if (['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file))) {
      const replacements = processFile(fullPath);
      if (replacements > 0) {
        totalReplacements += replacements;
        filesModified++;
      }
    }
  }
  
  return { replacements: totalReplacements, modified: filesModified };
}

function main() {
  console.log('🔧 Corrigindo TODOS os problemas de JSX com getString()...\n');
  
  const { replacements: totalReplacements, modified: filesModified } = walkDirectory(SRC_DIR);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO COMPLETO DE CORREÇÃO JSX');
  console.log('='.repeat(60));
  console.log(`✅ Arquivos modificados: ${filesModified}`);
  console.log(`✅ Total de correções: ${totalReplacements}`);
  
  if (totalReplacements > 0) {
    console.log('\n💡 Próximos passos:');
    console.log('   1. Verificar se o servidor funciona');
    console.log('   2. Testar navegação');
    console.log('   3. Remover backups: find src -name "*.backup-jsx-all-fix" -delete');
  }
  
  console.log('='.repeat(60));
  console.log('\n🎉 Correção JSX completa concluída!');
}

if (require.main === module) {
  main();
}

module.exports = { fixAllJSXGetString, STRING_MAPPINGS };
