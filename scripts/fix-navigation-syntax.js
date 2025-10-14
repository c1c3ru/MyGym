#!/usr/bin/env node

/**
 * Script para corrigir erros de sintaxe na navegação
 * Corrige navigation.navigate('Route'), { params } para navigation.navigate('Route', { params })
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class NavigationSyntaxFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalReplacements = 0;
    this.errors = [];
  }

  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let replacements = 0;
      
      // Padrão 1: navigation.navigate('Route'), { params }
      const pattern1 = /navigation\.navigate\(([^)]+)\),\s*(\{[^}]*\})/g;
      content = content.replace(pattern1, (match, route, params) => {
        replacements++;
        console.log(`  📍 Corrigindo: ${route}, ${params} → ${route}, ${params}`);
        return `navigation.navigate(${route}, ${params})`;
      });
      
      // Padrão 2: navigation.navigate(getString('route')), { params }
      const pattern2 = /navigation\.navigate\((getString\([^)]+\))\),\s*(\{[^}]*\})/g;
      content = content.replace(pattern2, (match, route, params) => {
        replacements++;
        console.log(`  📍 Corrigindo getString: ${route}, ${params} → ${route}, ${params}`);
        return `navigation.navigate(${route}, ${params})`;
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
    console.log('🔧 Procurando arquivos com erros de sintaxe de navegação...\n');
    
    try {
      // Encontrar todos os arquivos com o padrão problemático
      const result = execSync(
        `grep -r "navigation\\\\.navigate([^,]*),\\\\s*{" src --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" -l`,
        { encoding: 'utf8', cwd: process.cwd() }
      );
      
      const files = result.trim().split('\n').filter(f => f);
      
      console.log(`📁 Encontrados ${files.length} arquivos com erros de sintaxe\n`);
      
      for (const file of files) {
        console.log(`\n🔧 Corrigindo: ${file}`);
        this.fixFile(file);
      }
      
    } catch (error) {
      console.log('ℹ️  Nenhum arquivo encontrado com erros de sintaxe de navegação');
    }
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 RESUMO DA CORREÇÃO DE SINTAXE DE NAVEGAÇÃO');
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
    console.log('2. Testar navegação entre telas');
    console.log('3. Fazer commit das correções');
  }
}

// Executar correção
if (require.main === module) {
  const fixer = new NavigationSyntaxFixer();
  fixer.findAndFixFiles().catch(console.error);
}

module.exports = NavigationSyntaxFixer;
