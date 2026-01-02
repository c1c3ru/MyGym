#!/usr/bin/env node

/**
 * Script para corrigir cores como strings (color="COLORS.xxx") para JSX válido (color={COLORS.xxx})
 */

const fs = require('fs');
const path = require('path');

function fixColorStringsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Padrões para corrigir cores como strings
    const patterns = [
      // color="COLORS.xxx" → color={COLORS.xxx}
      { 
        regex: /color="(COLORS\.[^"]+)"/g, 
        replacement: 'color={$1}',
        description: 'Cores COLORS como strings'
      },
      // backgroundColor="COLORS.xxx" → backgroundColor={COLORS.xxx}
      { 
        regex: /backgroundColor="(COLORS\.[^"]+)"/g, 
        replacement: 'backgroundColor={$1}',
        description: 'Background colors como strings'
      },
      // borderColor="COLORS.xxx" → borderColor={COLORS.xxx}
      { 
        regex: /borderColor="(COLORS\.[^"]+)"/g, 
        replacement: 'borderColor={$1}',
        description: 'Border colors como strings'
      },
      // tintColor="COLORS.xxx" → tintColor={COLORS.xxx}
      { 
        regex: /tintColor="(COLORS\.[^"]+)"/g, 
        replacement: 'tintColor={$1}',
        description: 'Tint colors como strings'
      }
    ];
    
    let newContent = content;
    let totalReplacements = 0;
    const replacements = [];
    
    patterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern.regex)];
      if (matches.length > 0) {
        newContent = newContent.replace(pattern.regex, pattern.replacement);
        totalReplacements += matches.length;
        replacements.push({
          description: pattern.description,
          count: matches.length,
          examples: matches.slice(0, 3).map(match => match[0])
        });
      }
    });
    
    if (totalReplacements > 0) {
      // Criar backup
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, content);
      
      // Salvar arquivo corrigido
      fs.writeFileSync(filePath, newContent);
      
      return {
        success: true,
        totalReplacements,
        replacements,
        backupCreated: backupPath
      };
    }
    
    return {
      success: true,
      totalReplacements: 0,
      message: 'Nenhuma correção necessária'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

function scanDirectory(dir) {
  const results = [];
  
  function scanRecursive(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanRecursive(fullPath);
      } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx'))) {
        const result = fixColorStringsInFile(fullPath);
        if (result.totalReplacements > 0 || !result.success) {
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
  console.log('🎨 CORRETOR DE CORES COMO STRINGS - MyGym');
  console.log('=' .repeat(50));
  
  const srcDir = path.join(process.cwd(), 'src');
  const results = scanDirectory(srcDir);
  
  if (results.length === 0) {
    console.log('✅ Nenhuma correção necessária! Todas as cores já estão no formato JSX correto.');
    return;
  }
  
  let totalFiles = 0;
  let totalReplacements = 0;
  
  console.log('\n📋 Arquivos corrigidos:\n');
  
  results.forEach(result => {
    if (result.success && result.totalReplacements > 0) {
      totalFiles++;
      totalReplacements += result.totalReplacements;
      
      console.log(`✅ ${result.file}`);
      console.log(`   └─ ${result.totalReplacements} correções realizadas`);
      
      result.replacements.forEach(replacement => {
        console.log(`   └─ ${replacement.description}: ${replacement.count}x`);
        if (replacement.examples.length > 0) {
          console.log(`      Exemplo: ${replacement.examples[0]}`);
        }
      });
      console.log('');
    } else if (!result.success) {
      console.log(`❌ ${result.file}`);
      console.log(`   └─ Erro: ${result.error}`);
      console.log('');
    }
  });
  
  console.log('=' .repeat(50));
  console.log(`📊 RESUMO:`);
  console.log(`✅ Arquivos corrigidos: ${totalFiles}`);
  console.log(`🔧 Total de correções: ${totalReplacements}`);
  console.log(`💾 Backups criados: ${totalFiles}`);
  console.log('=' .repeat(50));
  
  if (totalFiles > 0) {
    console.log('\n🎯 Próximos passos:');
    console.log('1. Teste o app: npx expo start --clear');
    console.log('2. Verifique se não há erros de sintaxe');
    console.log('3. Se tudo estiver OK, remova os backups: find src -name "*.backup" -delete');
    console.log('\n✨ Todas as cores agora usam a sintaxe JSX correta!');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { fixColorStringsInFile, scanDirectory };
