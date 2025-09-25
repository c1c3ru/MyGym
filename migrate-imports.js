#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mapeamento de padrões de imports para aliases
const importMappings = [
  // Contexts
  { pattern: /from ['"]\.\.\/contexts\/([^'"]+)['"]/g, replacement: "from '@contexts/$1'" },
  
  // Hooks
  { pattern: /from ['"]\.\.\/hooks\/([^'"]+)['"]/g, replacement: "from '@hooks/$1'" },
  
  // Services - diferentes níveis
  { pattern: /from ['"]\.\.\/\.\.\/infrastructure\/services\/([^'"]+)['"]/g, replacement: "from '@services/$1'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/infrastructure\/services\/([^'"]+)['"]/g, replacement: "from '@services/$1'" },
  
  // Utils - diferentes níveis
  { pattern: /from ['"]\.\.\/\.\.\/shared\/utils\/([^'"]+)['"]/g, replacement: "from '@utils/$1'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/shared\/utils\/([^'"]+)['"]/g, replacement: "from '@utils/$1'" },
  
  // Components
  { pattern: /from ['"]\.\.\/([^'"]+)['"]/g, replacement: "from '@components/$1'" },
  
  // Data
  { pattern: /from ['"]\.\.\/\.\.\/data\/([^'"]+)['"]/g, replacement: "from '@/data/$1'" },
  
  // Domain
  { pattern: /from ['"]\.\.\/\.\.\/domain\/([^'"]+)['"]/g, replacement: "from '@domain/$1'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/domain\/([^'"]+)['"]/g, replacement: "from '@domain/$1'" },
  
  // Shared types
  { pattern: /from ['"]\.\.\/shared\/([^'"]+)['"]/g, replacement: "from '@/shared/$1'" },
  { pattern: /from ['"]\.\.\/\.\.\/shared\/([^'"]+)['"]/g, replacement: "from '@/shared/$1'" },
];

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    importMappings.forEach(({ pattern, replacement }) => {
      const originalContent = content;
      content = content.replace(pattern, replacement);
      if (content !== originalContent) {
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Migrated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
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

// Executar migração
console.log('🚀 Iniciando migração de imports...\n');

const srcDir = path.join(__dirname, 'src');
const files = findJSFiles(srcDir);

let migratedCount = 0;
let totalFiles = files.length;

files.forEach(file => {
  if (migrateFile(file)) {
    migratedCount++;
  }
});

console.log(`\n📊 Migração concluída:`);
console.log(`   Total de arquivos: ${totalFiles}`);
console.log(`   Arquivos migrados: ${migratedCount}`);
console.log(`   Arquivos sem alterações: ${totalFiles - migratedCount}`);

if (migratedCount > 0) {
  console.log('\n✅ Migração realizada com sucesso!');
} else {
  console.log('\n📝 Nenhum arquivo precisou ser migrado.');
}
