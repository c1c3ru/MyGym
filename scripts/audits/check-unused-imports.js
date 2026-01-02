#!/usr/bin/env node

/**
 * Script para verificar imports não utilizados de design tokens
 */

const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, '../src/presentation/components');

const DESIGN_TOKENS = [
  'COLORS',
  'SPACING', 
  'FONT_SIZE',
  'BORDER_RADIUS',
  'FONT_WEIGHT'
];

const OTHER_IMPORTS = [
  'Button',
  'Portal', 
  'Modal',
  'DAY_NAMES',
  'getString'
];

function checkFileForUnusedImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Encontrar linha de import dos design tokens
    const designTokenImportLine = lines.find(line => 
      line.includes('from @presentation/theme/designTokens') ||
      line.includes('from \'@presentation/theme/designTokens\'') ||
      line.includes('from "@presentation/theme/designTokens"')
    );
    
    if (!designTokenImportLine) return null;
    
    // Extrair tokens importados
    const importMatch = designTokenImportLine.match(/import\s*\{\s*([^}]+)\s*\}/);
    if (!importMatch) return null;
    
    const importedTokens = importMatch[1]
      .split(',')
      .map(token => token.trim())
      .filter(token => token);
    
    // Verificar quais tokens são realmente usados
    const unusedTokens = [];
    
    importedTokens.forEach(token => {
      // Procurar uso do token no código (excluindo a linha de import)
      const tokenRegex = new RegExp(`\\b${token}\\.`, 'g');
      const contentWithoutImports = content.replace(/import.*from.*designTokens.*\n/g, '');
      
      if (!tokenRegex.test(contentWithoutImports)) {
        unusedTokens.push(token);
      }
    });
    
    if (unusedTokens.length > 0) {
      return {
        file: path.relative(COMPONENTS_DIR, filePath),
        unusedTokens,
        importedTokens,
        importLine: designTokenImportLine.trim()
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Erro ao processar ${filePath}:`, error.message);
    return null;
  }
}

function walkDirectory(dir) {
  const results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== '__tests__') {
        results.push(...walkDirectory(fullPath));
      }
    } else if (['.js', '.jsx'].includes(path.extname(file))) {
      const result = checkFileForUnusedImports(fullPath);
      if (result) {
        results.push(result);
      }
    }
  }
  
  return results;
}

function main() {
  console.log('🔍 Verificando imports não utilizados de design tokens...\n');
  
  const results = walkDirectory(COMPONENTS_DIR);
  
  if (results.length === 0) {
    console.log('✅ Nenhum import não utilizado encontrado!');
    return;
  }
  
  console.log(`❌ Encontrados ${results.length} arquivos com imports não utilizados:\n`);
  
  results.forEach(result => {
    console.log(`📄 ${result.file}`);
    console.log(`   Import atual: ${result.importLine}`);
    console.log(`   Tokens não utilizados: ${result.unusedTokens.join(', ')}`);
    
    const usedTokens = result.importedTokens.filter(token => 
      !result.unusedTokens.includes(token)
    );
    
    if (usedTokens.length > 0) {
      console.log(`   ✅ Sugestão: import { ${usedTokens.join(', ')} } from '@presentation/theme/designTokens';`);
    } else {
      console.log(`   ✅ Sugestão: Remover import completamente`);
    }
    console.log('');
  });
  
  console.log('💡 Execute o script fix-unused-imports.js para corrigir automaticamente.');
}

if (require.main === module) {
  main();
}

module.exports = { checkFileForUnusedImports };
