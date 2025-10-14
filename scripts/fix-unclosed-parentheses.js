#!/usr/bin/env node

/**
 * Script para corrigir parênteses não fechados em navigation.navigate
 * Corrige navigation.navigate('Route' para navigation.navigate('Route')
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UnclosedParenthesesFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalReplacements = 0;
    this.errors = [];
  }

  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let replacements = 0;
      
      // Padrão 1: navigation.navigate(getString('route')\n seguido por espaços e />
      const pattern1 = /navigation\.navigate\(([^)]+)\)\s*\n\s*\/>/g;
      content = content.replace(pattern1, (match, route) => {
        replacements++;
        console.log(`  📍 Corrigindo: navigation.navigate(${route}) sem fechamento`);
        return `navigation.navigate(${route})}\n                />`;
      });
      
      // Padrão 2: navigation.navigate(getString('route') sem fechamento seguido por quebra de linha
      const pattern2 = /navigation\.navigate\(([^)]+)\s*\n\s*\/>/g;
      content = content.replace(pattern2, (match, route) => {
        replacements++;
        console.log(`  📍 Corrigindo: navigation.navigate(${route} sem fechamento`);
        return `navigation.navigate(${route})}\n                />`;
      });
      
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
    console.log('🔧 Procurando arquivos com parênteses não fechados...\n');
    
    try {
      // Encontrar todos os arquivos com o padrão problemático
      const result = execSync(
        `grep -r "navigation\\\\.navigate.*[^)]\\s*$" src --include="*.js" --include="*.jsx" -l`,
        { encoding: 'utf8', cwd: process.cwd() }
      );
      
      const files = result.trim().split('\n').filter(f => f);
      
      console.log(`📁 Encontrados ${files.length} arquivos com parênteses não fechados\n`);
      
      for (const file of files) {
        console.log(`\n🔧 Corrigindo: ${file}`);
        this.fixFile(file);
      }
      
    } catch (error) {
      console.log('ℹ️  Nenhum arquivo encontrado com parênteses não fechados');
    }
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 RESUMO DA CORREÇÃO DE PARÊNTESES NÃO FECHADOS');
    console.log('='.repeat(55));
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
    console.log('2. Testar navegação entre telas');
    console.log('3. Fazer commit das correções');
  }
}

// Executar correção
if (require.main === module) {
  const fixer = new UnclosedParenthesesFixer();
  fixer.findAndFixFiles().catch(console.error);
}

module.exports = UnclosedParenthesesFixer;
