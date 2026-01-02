#!/usr/bin/env node

/**
 * Script para corrigir getString() usado como chave de objeto
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src/presentation');

// Mapeamento de chaves getString() para strings fixas
const KEY_MAPPINGS = {
  'white': 'Branca',
  'yellow': 'Amarela',
  'orange': 'Laranja',
  'green': 'Verde',
  'blue': 'Azul',
  'purple': 'Roxa',
  'brown': 'Marrom',
  'black': 'Preta',
  'coral': 'Coral',
  'red': 'Vermelha',
  'jiujitsu': 'Jiu-Jitsu',
  'muayThai': 'Muay Thai',
  'boxing': 'Boxe',
  'mma': 'MMA',
  'karate': 'Karatê',
  'judo': 'Judô'
};

function fixObjectKeyGetString(content) {
  let modifiedContent = content;
  let replacements = 0;

  // Regex para encontrar getString('key'): value em objetos
  const objectKeyRegex = /getString\('([^']+)'\)(\s*:\s*[^,}]+)/g;
  
  modifiedContent = modifiedContent.replace(objectKeyRegex, (match, key, rest) => {
    const fixedKey = KEY_MAPPINGS[key] || key;
    replacements++;
    console.log(`   ✅ getString('${key}'):${rest} → '${fixedKey}':${rest}`);
    return `'${fixedKey}'${rest}`;
  });

  return { content: modifiedContent, replacements };
}

function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    
    // Só processa se contém getString como chave
    if (!originalContent.includes('getString(') || !originalContent.includes('):')) {
      return 0;
    }
    
    const { content: modifiedContent, replacements } = fixObjectKeyGetString(originalContent);

    if (replacements > 0) {
      const relativePath = path.relative(SRC_DIR, filePath);
      console.log(`\n📄 ${relativePath}`);
      
      // Cria backup
      const backupPath = filePath + '.backup-object-key-fix';
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
  console.log('🔧 Corrigindo getString() usado como chave de objeto...\n');
  
  const { replacements: totalReplacements, modified: filesModified } = walkDirectory(SRC_DIR);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO DE CORREÇÃO CHAVES DE OBJETO');
  console.log('='.repeat(60));
  console.log(`✅ Arquivos modificados: ${filesModified}`);
  console.log(`✅ Total de correções: ${totalReplacements}`);
  
  if (totalReplacements > 0) {
    console.log('\n💡 Próximos passos:');
    console.log('   1. Verificar se o servidor funciona');
    console.log('   2. Testar funcionalidades');
    console.log('   3. Remover backups: find src -name "*.backup-object-key-fix" -delete');
  }
  
  console.log('='.repeat(60));
  console.log('\n🎉 Correção de chaves de objeto concluída!');
}

if (require.main === module) {
  main();
}

module.exports = { fixObjectKeyGetString, KEY_MAPPINGS };
