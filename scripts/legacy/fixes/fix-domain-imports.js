#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Correções para o domain
const domainFixes = [
  { pattern: /@components\/entities/g, replacement: '@domain/entities' },
  { pattern: /@components\/repositories/g, replacement: '@domain/repositories' },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    domainFixes.forEach(({ pattern, replacement }) => {
      const originalContent = content;
      content = content.replace(pattern, replacement);
      if (content !== originalContent) {
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function findDomainFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (item.endsWith('.js') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignorar erros
    }
  }
  
  traverse(dir);
  return files;
}

// Executar correção
console.log('🔧 Corrigindo imports do domain...\n');

const domainDir = path.join(__dirname, 'src/domain');
const files = findDomainFiles(domainDir);

let fixedCount = 0;

files.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n📊 Correção do domain concluída:`);
console.log(`   Arquivos corrigidos: ${fixedCount}`);

if (fixedCount > 0) {
  console.log('\n✅ Imports do domain corrigidos com sucesso!');
} else {
  console.log('\n📝 Nenhum import problemático encontrado no domain.');
}
