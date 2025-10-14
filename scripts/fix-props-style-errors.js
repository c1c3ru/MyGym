#!/usr/bin/env node

/**
 * Script para corrigir erros de props.style em arquivos JSX
 * Remove referências a props.style que foram introduzidas pelos scripts de migração
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PropsStyleFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalReplacements = 0;
    this.errors = [];
  }

  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let replacements = 0;
      
      // Padrão 1: style={styles.xxx} style={[styles.title, props.style]}
      const pattern1 = /style=\{styles\.(\w+)\}\s+style=\{\[styles\.(title|paragraph),\s*props\.style\]\}/g;
      content = content.replace(pattern1, (match, style1, style2) => {
        replacements++;
        return `style={[styles.${style1}, styles.${style2}]}`;
      });
      
      // Padrão 2: style={[styles.xxx, props.style]}
      const pattern2 = /style=\{\[([^,]+),\s*props\.style\]\}/g;
      content = content.replace(pattern2, (match, styleContent) => {
        replacements++;
        return `style={${styleContent}}`;
      });
      
      // Padrão 3: props.style isolado
      const pattern3 = /\s+style=\{\[styles\.(title|paragraph),\s*props\.style\]\}/g;
      content = content.replace(pattern3, '');
      
      if (replacements > 0) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${filePath}: ${replacements} correções aplicadas`);
        this.fixedFiles++;
        this.totalReplacements += replacements;
      }
      
    } catch (error) {
      console.error(`❌ Erro em ${filePath}: ${error.message}`);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  async findAndFixFiles() {
    console.log('🔧 Procurando arquivos com erros de props.style...\n');
    
    try {
      // Encontrar todos os arquivos com props.style
      const result = execSync(
        `grep -r "props\\.style" src --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" -l`,
        { encoding: 'utf8', cwd: process.cwd() }
      );
      
      const files = result.trim().split('\n').filter(f => f);
      
      console.log(`📁 Encontrados ${files.length} arquivos com props.style\n`);
      
      for (const file of files) {
        this.fixFile(file);
      }
      
    } catch (error) {
      console.log('ℹ️  Nenhum arquivo encontrado com props.style');
    }
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 RESUMO DA CORREÇÃO DE PROPS.STYLE');
    console.log('='.repeat(50));
    console.log(`✅ Arquivos corrigidos: ${this.fixedFiles}`);
    console.log(`🔄 Total de correções: ${this.totalReplacements}`);
    console.log(`❌ Erros encontrados: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Arquivos com erro:');
      this.errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }
    
    console.log('\n🎯 Próximos passos:');
    console.log('1. Verificar se o app compila: npx expo start --clear');
    console.log('2. Testar funcionalidade das telas corrigidas');
    console.log('3. Fazer commit das correções');
  }
}

// Executar correção
if (require.main === module) {
  const fixer = new PropsStyleFixer();
  fixer.findAndFixFiles().catch(console.error);
}

module.exports = PropsStyleFixer;
