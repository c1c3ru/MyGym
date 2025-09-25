#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mapeamento de correções para imports incorretos
const incorrectImportFixes = [
  // Corrigir @components/../domain para @domain
  { pattern: /@components\/\.\.\//g, replacement: '@' },
  
  // Corrigir outros padrões incorretos
  { pattern: /from '@components\/\.\.\//g, replacement: "from '@" },
  { pattern: /import.*from '@components\/\.\.\//g, replacement: match => match.replace('@components/../', '@') },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    incorrectImportFixes.forEach(({ pattern, replacement }) => {
      const originalContent = content;
      if (typeof replacement === 'function') {
        content = content.replace(pattern, replacement);
      } else {
        content = content.replace(pattern, replacement);
      }
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

function findJSFiles(dir, excludeDirs = ['node_modules', '.git', '__tests__', '.expo']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          traverse(fullPath);
        }
      } else if (item.endsWith('.js') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Executar correção
console.log('🔧 Corrigindo imports incorretos...\n');

const srcDir = path.join(__dirname, 'src');
const files = findJSFiles(srcDir);

let fixedCount = 0;
let totalFiles = files.length;

files.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n📊 Correção concluída:`);
console.log(`   Total de arquivos: ${totalFiles}`);
console.log(`   Arquivos corrigidos: ${fixedCount}`);
console.log(`   Arquivos sem problemas: ${totalFiles - fixedCount}`);

if (fixedCount > 0) {
  console.log('\n✅ Imports incorretos corrigidos com sucesso!');
} else {
  console.log('\n📝 Nenhum import incorreto encontrado.');
}
