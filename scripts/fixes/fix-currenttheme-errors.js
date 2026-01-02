#!/usr/bin/env node

/**
 * Script para encontrar e corrigir referências incorretas a currentTheme
 * nos estilos estáticos (fora de componentes funcionais)
 */

const fs = require('fs');
const path = require('path');

function fixCurrentThemeReferences(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let changes = 0;
    
    // Padrões problemáticos de currentTheme em estilos estáticos
    const patterns = [
      {
        regex: /backgroundColor:\s*currentTheme\.transparent[^,}]*/g,
        replacement: "backgroundColor: 'transparent'",
        description: 'backgroundColor com currentTheme.transparent'
      },
      {
        regex: /color:\s*currentTheme\.[^,}]*/g,
        replacement: "color: COLORS.text.primary",
        description: 'color com currentTheme'
      },
      {
        regex: /borderColor:\s*currentTheme\.[^,}]*/g,
        replacement: "borderColor: COLORS.border.default",
        description: 'borderColor com currentTheme'
      },
      {
        regex: /shadowColor:\s*currentTheme\.[^,}]*/g,
        replacement: "shadowColor: COLORS.black",
        description: 'shadowColor com currentTheme'
      },
      // Padrão específico encontrado nos arquivos
      {
        regex: /currentTheme\.transparent\s*\|\|\s*currentTheme\.transparent\s*\|\|\s*currentTheme\.transparent\s*\|\|\s*"transparent"/g,
        replacement: "'transparent'",
        description: 'currentTheme.transparent múltiplo'
      },
      {
        regex: /currentTheme\.transparent\s*\|\|\s*"transparent"/g,
        replacement: "'transparent'",
        description: 'currentTheme.transparent com fallback'
      }
    ];
    
    patterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern.regex)];
      if (matches.length > 0) {
        newContent = newContent.replace(pattern.regex, pattern.replacement);
        changes += matches.length;
        console.log(`  ✅ ${pattern.description}: ${matches.length}x`);
      }
    });
    
    if (changes > 0) {
      // Criar backup
      const backupPath = filePath + '.backup-currenttheme';
      fs.writeFileSync(backupPath, content);
      
      // Salvar arquivo corrigido
      fs.writeFileSync(filePath, newContent);
      
      return { success: true, changes, backupCreated: backupPath };
    }
    
    return { success: true, changes: 0 };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function scanAndFix(dir) {
  const results = [];
  
  function scanRecursive(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanRecursive(fullPath);
      } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx'))) {
        const result = fixCurrentThemeReferences(fullPath);
        if (result.changes > 0 || !result.success) {
          results.push({
            file: fullPath.replace(process.cwd() + '/', ''),
            ...result
          });
        }
      }
    }
  }
  
  scanRecursive(dir);
  return results;
}

function main() {
  console.log('🔧 CORRETOR DE REFERÊNCIAS currentTheme INCORRETAS');
  console.log('=' .repeat(60));
  console.log('🎯 Procurando currentTheme em estilos estáticos...');
  console.log('');
  
  const srcDir = path.join(process.cwd(), 'src');
  const results = scanAndFix(srcDir);
  
  if (results.length === 0) {
    console.log('✅ Nenhuma referência incorreta a currentTheme encontrada!');
    return;
  }
  
  let totalFiles = 0;
  let totalChanges = 0;
  
  console.log('📋 Correções aplicadas:\n');
  
  results.forEach(result => {
    if (result.success && result.changes > 0) {
      totalFiles++;
      totalChanges += result.changes;
      
      console.log(`✅ ${result.file}`);
      console.log(`   └─ ${result.changes} referências corrigidas`);
      console.log('');
    } else if (!result.success) {
      console.log(`❌ ${result.file}`);
      console.log(`   └─ Erro: ${result.error}`);
      console.log('');
    }
  });
  
  console.log('=' .repeat(60));
  console.log(`📊 RESUMO:`);
  console.log(`✅ Arquivos corrigidos: ${totalFiles}`);
  console.log(`🔧 Total de correções: ${totalChanges}`);
  console.log(`💾 Backups criados: ${totalFiles}`);
  console.log('=' .repeat(60));
  
  if (totalFiles > 0) {
    console.log('\n🎯 Próximos passos:');
    console.log('1. Teste o app: npx expo start --clear');
    console.log('2. Verifique se não há mais erros currentTheme');
    console.log('3. Se tudo OK, remova backups: find src -name "*.backup-currenttheme" -delete');
    console.log('\n✨ Referências currentTheme agora estão corretas!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixCurrentThemeReferences };
