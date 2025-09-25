#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Padrões mais abrangentes para detectar imports relativos
const relativeImportPatterns = [
  // Imports com 2+ níveis relativos que podem ser convertidos
  /from\s+['"]\.\.\/\.\.\//g,
  /from\s+['"]\.\.\/\.\.\.\//g,
  /from\s+['"]\.\.\/\.\.\.\.\//g,
  
  // Imports específicos que podem usar aliases
  /from\s+['"]\.\.\/infrastructure\//g,
  /from\s+['"]\.\.\/\.\.\/infrastructure\//g,
  /from\s+['"]\.\.\/\.\.\/\.\.\/infrastructure\//g,
  
  /from\s+['"]\.\.\/shared\//g,
  /from\s+['"]\.\.\/\.\.\/shared\//g,
  
  /from\s+['"]\.\.\/domain\//g,
  /from\s+['"]\.\.\/\.\.\/domain\//g,
  
  /from\s+['"]\.\.\/presentation\//g,
  /from\s+['"]\.\.\/\.\.\/presentation\//g,
];

// Padrões que são CORRETOS e não devem ser alterados
const correctPatterns = [
  // Testes importando do arquivo pai (correto)
  /.*\/__tests__\/.*from\s+['"]\.\.\/[^\/]/,
  
  // README e documentação
  /.*\.md:/,
  
  // Imports de uma pasta acima apenas (geralmente corretos)
  /from\s+['"]\.\.\/[^\/]/,
];

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];
    
    lines.forEach((line, index) => {
      // Verificar se é um padrão correto (pular)
      const isCorrect = correctPatterns.some(pattern => pattern.test(filePath + ':' + line));
      if (isCorrect) return;
      
      // Verificar padrões problemáticos
      relativeImportPatterns.forEach(pattern => {
        if (pattern.test(line)) {
          issues.push({
            line: index + 1,
            content: line.trim(),
            file: filePath
          });
        }
      });
    });
    
    return issues;
  } catch (error) {
    return [];
  }
}

function findAllFiles(dir, excludeDirs = ['node_modules', '.git', '.expo']) {
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
      // Ignorar erros de permissão
    }
  }
  
  traverse(dir);
  return files;
}

// Executar análise
console.log('🔍 Analisando TODOS os imports relativos restantes...\n');

const srcDir = path.join(__dirname, 'src');
const files = findAllFiles(srcDir);

let totalIssues = 0;
let filesWithIssues = 0;
const issuesByCategory = {
  tests: 0,
  functional: 0,
  documentation: 0
};

files.forEach(file => {
  const issues = analyzeFile(file);
  if (issues.length > 0) {
    filesWithIssues++;
    totalIssues += issues.length;
    
    // Categorizar
    if (file.includes('__tests__') || file.includes('.test.') || file.includes('.spec.')) {
      issuesByCategory.tests += issues.length;
    } else if (file.includes('.md')) {
      issuesByCategory.documentation += issues.length;
    } else {
      issuesByCategory.functional += issues.length;
      
      // Mostrar apenas imports funcionais problemáticos
      console.log(`📁 ${file.replace(__dirname + '/src/', '')}:`);
      issues.forEach(issue => {
        console.log(`   Linha ${issue.line}: ${issue.content}`);
      });
      console.log('');
    }
  }
});

console.log(`📊 Análise completa:`);
console.log(`   Total de arquivos analisados: ${files.length}`);
console.log(`   Arquivos com imports relativos: ${filesWithIssues}`);
console.log(`   Total de imports relativos encontrados: ${totalIssues}`);
console.log(`\n📈 Por categoria:`);
console.log(`   Imports funcionais (precisam correção): ${issuesByCategory.functional}`);
console.log(`   Imports em testes (corretos): ${issuesByCategory.tests}`);
console.log(`   Imports em documentação (corretos): ${issuesByCategory.documentation}`);

if (issuesByCategory.functional > 0) {
  console.log(`\n⚠️  AINDA HÁ ${issuesByCategory.functional} IMPORTS FUNCIONAIS PARA CORRIGIR!`);
} else {
  console.log(`\n✅ TODOS OS IMPORTS FUNCIONAIS ESTÃO CORRETOS!`);
}
