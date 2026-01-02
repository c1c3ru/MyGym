#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mapeamento de correções para @components/ incorretos
const componentsFixes = [
  // Corrigir @components/presentation/components para @components
  { pattern: /@components\/presentation\/components\//g, replacement: '@components/' },
  
  // Corrigir @components/presentation/screens para @screens
  { pattern: /@components\/presentation\/screens\//g, replacement: '@screens/' },
  
  // Corrigir @components/presentation/hooks para @hooks
  { pattern: /@components\/presentation\/hooks\//g, replacement: '@hooks/' },
  
  // Corrigir @components/presentation/contexts para @contexts
  { pattern: /@components\/presentation\/contexts\//g, replacement: '@contexts/' },
  
  // Corrigir @components/presentation/navigation para @navigation
  { pattern: /@components\/presentation\/navigation\//g, replacement: '@navigation/' },
  
  // Corrigir @components/presentation/stores para @presentation/stores
  { pattern: /@components\/presentation\/stores\//g, replacement: '@presentation/stores/' },
  
  // Corrigir @components/infrastructure/services para @services
  { pattern: /@components\/infrastructure\/services\//g, replacement: '@services/' },
  
  // Corrigir @components/shared/utils para @utils
  { pattern: /@components\/shared\/utils\//g, replacement: '@utils/' },
  
  // Corrigir @components/shared/ para @shared/
  { pattern: /@components\/shared\//g, replacement: '@shared/' },
  
  // Corrigir @components/datasources para @data/datasources
  { pattern: /@components\/datasources\//g, replacement: '@data/datasources/' },
  
  // Corrigir @components/models para @data/models
  { pattern: /@components\/models\//g, replacement: '@data/models/' },
  
  // Corrigir @components/stores para @presentation/stores
  { pattern: /@components\/stores\//g, replacement: '@presentation/stores/' },
  
  // Corrigir @components/index para @infrastructure/index
  { pattern: /@components\/index/g, replacement: '@infrastructure/index' },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    componentsFixes.forEach(({ pattern, replacement }) => {
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

function findJSFiles(dir, excludeDirs = ['node_modules', '.git', '__tests__', '.expo']) {
  const files = [];
  
  function traverse(currentDir) {
    try {
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
    } catch (error) {
      // Ignorar erros
    }
  }
  
  traverse(dir);
  return files;
}

// Executar correção
console.log('🔧 Corrigindo imports @components/ incorretos...\n');

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
  console.log('\n✅ Imports @components/ incorretos corrigidos com sucesso!');
} else {
  console.log('\n📝 Nenhum import @components/ incorreto encontrado.');
}
