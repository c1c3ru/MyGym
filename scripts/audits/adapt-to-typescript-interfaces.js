#!/usr/bin/env node

/**
 * Script para adaptar código JavaScript para usar interfaces TypeScript
 * ao invés de classes legacy
 */

const fs = require('fs');
const path = require('path');

const adaptations = [
  // user.uid → user.id
  {
    pattern: /\buser\.uid\b/g,
    replacement: 'user.id',
    description: 'user.uid → user.id'
  },
  // currentUser.uid → currentUser.id
  {
    pattern: /\bcurrentUser\.uid\b/g,
    replacement: 'currentUser.id',
    description: 'currentUser.uid → currentUser.id'
  },
  // firebaseUser.uid → firebaseUser.uid (manter para Firebase)
  // Não alterar firebaseUser.uid pois é do Firebase Auth
  
  // Remover chamadas de métodos das classes legacy
  {
    pattern: /\.isAdmin\(\)/g,
    replacement: ".userType === 'admin'",
    description: '.isAdmin() → userType check'
  },
  {
    pattern: /\.isInstructor\(\)/g,
    replacement: ".userType === 'instructor'",
    description: '.isInstructor() → userType check'
  },
  {
    pattern: /\.isStudent\(\)/g,
    replacement: ".userType === 'student'",
    description: '.isStudent() → userType check'
  },
  
  // Remover .toObject() e .toJSON()
  {
    pattern: /\.toObject\(\)/g,
    replacement: '',
    description: 'Remover .toObject()'
  },
  {
    pattern: /\.toJSON\(\)/g,
    replacement: '',
    description: 'Remover .toJSON()'
  }
];

function adaptFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changes = [];

    adaptations.forEach(({ pattern, replacement, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        modified = true;
        changes.push(`  ✓ ${description} (${matches.length}x)`);
      }
    });

    if (modified) {
      // Criar backup
      const backupPath = filePath + '.backup-adapt';
      fs.copyFileSync(filePath, backupPath);
      
      // Salvar arquivo modificado
      fs.writeFileSync(filePath, content, 'utf8');
      
      console.log(`\n✅ ${path.relative(process.cwd(), filePath)}`);
      changes.forEach(change => console.log(change));
      
      return { modified: true, changes: changes.length };
    }

    return { modified: false, changes: 0 };
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return { modified: false, changes: 0 };
  }
}

function findJavaScriptFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Ignorar node_modules, .git, etc
      if (!['node_modules', '.git', 'backup', 'build', 'dist'].includes(entry.name)) {
        findJavaScriptFiles(fullPath, files);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main
const targetDir = process.argv[2] || path.join(process.cwd(), 'src/presentation');

console.log('🔄 Adaptando código para usar interfaces TypeScript...');
console.log(`📁 Diretório: ${targetDir}\n`);

const files = findJavaScriptFiles(targetDir);
console.log(`📄 Encontrados ${files.length} arquivos JavaScript\n`);

let totalModified = 0;
let totalChanges = 0;

files.forEach(file => {
  const result = adaptFile(file);
  if (result.modified) {
    totalModified++;
    totalChanges += result.changes;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`✅ Adaptação concluída!`);
console.log(`📊 ${totalModified} arquivos modificados`);
console.log(`🔧 ${totalChanges} tipos de mudanças aplicadas`);
console.log(`💾 Backups criados: *.backup-adapt`);
console.log('='.repeat(60));
