#!/usr/bin/env node

/**
 * Script para adicionar imports de getString em arquivos que precisam
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src/presentation');

function addGetStringImport(content) {
  // Verifica se já tem o import
  if (content.includes('getString') && !content.includes("import.*getString")) {
    // Encontra a última linha de import
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') && !lines[i].includes('//')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex >= 0) {
      // Adiciona o import após a última linha de import
      lines.splice(lastImportIndex + 1, 0, "import { getString } from '@shared/utils/theme';");
      return { content: lines.join('\n'), added: true };
    } else {
      // Se não encontrou imports, adiciona no início após comentários
      let insertIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (!lines[i].trim().startsWith('/**') && 
            !lines[i].trim().startsWith('*') && 
            !lines[i].trim().startsWith('*/') &&
            !lines[i].trim().startsWith('//') &&
            lines[i].trim() !== '') {
          insertIndex = i;
          break;
        }
      }
      lines.splice(insertIndex, 0, "import { getString } from '@shared/utils/theme';", '');
      return { content: lines.join('\n'), added: true };
    }
  }
  
  return { content, added: false };
}

function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    
    // Só processa se contém getString mas não tem import
    if (!originalContent.includes('getString(')) {
      return false;
    }
    
    if (originalContent.includes('import.*getString') || 
        originalContent.includes("from '@shared/utils/theme'")) {
      return false;
    }
    
    const { content: modifiedContent, added } = addGetStringImport(originalContent);

    if (added) {
      const relativePath = path.relative(SRC_DIR, filePath);
      console.log(`✅ ${relativePath}`);
      
      // Salva arquivo corrigido
      fs.writeFileSync(filePath, modifiedContent);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let filesModified = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '__tests__') {
        filesModified += walkDirectory(fullPath);
      }
    } else if (['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file))) {
      if (processFile(fullPath)) {
        filesModified++;
      }
    }
  }
  
  return filesModified;
}

function main() {
  console.log('🔧 Adicionando imports de getString...\n');
  
  const filesModified = walkDirectory(SRC_DIR);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO DE IMPORTS ADICIONADOS');
  console.log('='.repeat(60));
  console.log(`✅ Arquivos modificados: ${filesModified}`);
  
  if (filesModified > 0) {
    console.log('\n💡 Próximos passos:');
    console.log('   1. Verificar se o servidor funciona');
    console.log('   2. Testar funcionalidades');
  }
  
  console.log('='.repeat(60));
  console.log('\n🎉 Imports de getString adicionados!');
}

if (require.main === module) {
  main();
}

module.exports = { addGetStringImport };
