#!/usr/bin/env node

/**
 * Script para corrigir imports deprecados do react-native-paper
 * Remove Title e Paragraph dos imports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeprecatedImportsFixer {
  constructor() {
    this.fixedFiles = 0;
    this.errors = [];
  }

  fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Remover Title e Paragraph dos imports do react-native-paper
      const updatedContent = content.replace(
        /import\s*{\s*([^}]*)\s*}\s*from\s*['"]react-native-paper['"];?/g,
        (match, imports) => {
          const importList = imports
            .split(',')
            .map(imp => imp.trim())
            .filter(imp => imp && !imp.includes('Title') && !imp.includes('Paragraph'))
            .join(',\n  ');
          
          if (importList !== imports.trim()) {
            modified = true;
            return `import {\n  ${importList}\n} from 'react-native-paper';`;
          }
          return match;
        }
      );
      
      if (modified) {
        fs.writeFileSync(filePath, updatedContent);
        console.log(`✅ Corrigido: ${filePath}`);
        this.fixedFiles++;
      }
      
    } catch (error) {
      console.error(`❌ Erro em ${filePath}: ${error.message}`);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  async fixAllFiles() {
    console.log('🔧 Corrigindo imports deprecados do react-native-paper...\n');
    
    // Encontrar todos os arquivos com Title ou Paragraph
    const result = execSync(
      `grep -r "Title,\\|Paragraph," src --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" -l`,
      { encoding: 'utf8', cwd: process.cwd() }
    );
    
    const files = result.trim().split('\n').filter(f => f);
    
    console.log(`📁 Encontrados ${files.length} arquivos para corrigir\n`);
    
    for (const file of files) {
      this.fixFile(file);
    }
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 RESUMO DA CORREÇÃO');
    console.log('='.repeat(40));
    console.log(`✅ Arquivos corrigidos: ${this.fixedFiles}`);
    console.log(`❌ Erros encontrados: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Arquivos com erro:');
      this.errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }
    
    console.log('\n🎯 Próximos passos:');
    console.log('1. Verificar se o app compila: npx expo start --clear');
    console.log('2. Substituir usos de <Title> e <Paragraph> por <Text>');
    console.log('3. Testar funcionalidade');
  }
}

// Executar correção
if (require.main === module) {
  const fixer = new DeprecatedImportsFixer();
  fixer.fixAllFiles().catch(console.error);
}

module.exports = DeprecatedImportsFixer;
