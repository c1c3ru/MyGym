#!/usr/bin/env node

/**
 * Script para analisar cobertura de strings de internacionalização no MyGym
 * Identifica textos hardcoded que precisam ser movidos para o sistema i18n
 */

const fs = require('fs');
const path = require('path');

// Configurações
const SRC_DIR = path.join(__dirname, '../src/presentation');
const THEME_FILE = path.join(__dirname, '../src/shared/utils/theme.js');
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Regex para encontrar strings em português
const PORTUGUESE_STRING_REGEX = /'([A-ZÁÊÇÕ][^']*)'|"([A-ZÁÊÇÕ][^"]*)"/g;
const GETSTRING_REGEX = /getString\(['"`]([^'"`]+)['"`]\)/g;

// Categorias de strings
const STRING_CATEGORIES = {
  'Login/Auth': ['login', 'password', 'email', 'register', 'forgot', 'auth', 'signin', 'signup'],
  'Dashboard': ['dashboard', 'painel', 'admin', 'instructor', 'student', 'welcome', 'olá'],
  'Formulários': ['nome', 'telefone', 'endereço', 'salvar', 'cancelar', 'confirmar', 'obrigatório'],
  'Navegação': ['voltar', 'próximo', 'menu', 'configurações', 'perfil', 'sair'],
  'Erros': ['erro', 'falha', 'não foi possível', 'tente novamente', 'inválido'],
  'Configurações': ['configurações', 'preferências', 'notificações', 'privacidade'],
  'Ações': ['criar', 'editar', 'excluir', 'adicionar', 'remover', 'buscar'],
  'Status': ['ativo', 'inativo', 'pendente', 'concluído', 'sucesso'],
  'Tempo': ['hoje', 'ontem', 'semana', 'mês', 'ano', 'data', 'horário'],
  'Academia': ['turma', 'aluno', 'professor', 'graduação', 'modalidade', 'check-in']
};

class StringAnalyzer {
  constructor() {
    this.hardcodedStrings = new Map();
    this.usedStrings = new Set();
    this.availableStrings = new Set();
    this.fileStats = new Map();
  }

  // Carrega strings disponíveis no sistema i18n
  loadAvailableStrings() {
    try {
      const themeContent = fs.readFileSync(THEME_FILE, 'utf8');
      
      // Extrai strings do objeto languages.pt.strings
      const stringsMatch = themeContent.match(/strings:\s*{([\s\S]*?)(?=\n\s*},?\s*\n\s*en:)/);
      if (stringsMatch) {
        const stringsContent = stringsMatch[1];
        const stringMatches = stringsContent.matchAll(/(\w+):\s*['"`]([^'"`]+)['"`]/g);
        
        for (const match of stringMatches) {
          this.availableStrings.add(match[1]);
        }
      }
      
      console.log(`✅ Carregadas ${this.availableStrings.size} strings disponíveis no sistema i18n`);
    } catch (error) {
      console.error('❌ Erro ao carregar strings disponíveis:', error.message);
    }
  }

  // Analisa um arquivo específico
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(SRC_DIR, filePath);
      
      const fileStats = {
        hardcoded: [],
        getString: [],
        total: 0
      };

      // Encontra strings hardcoded em português
      let match;
      while ((match = PORTUGUESE_STRING_REGEX.exec(content)) !== null) {
        const string = match[1] || match[2];
        if (string && string.length > 2) { // Ignora strings muito curtas
          fileStats.hardcoded.push({
            string,
            line: this.getLineNumber(content, match.index),
            category: this.categorizeString(string)
          });
          
          if (!this.hardcodedStrings.has(string)) {
            this.hardcodedStrings.set(string, []);
          }
          this.hardcodedStrings.get(string).push(relativePath);
        }
      }

      // Encontra usos de getString
      GETSTRING_REGEX.lastIndex = 0;
      while ((match = GETSTRING_REGEX.exec(content)) !== null) {
        const key = match[1];
        fileStats.getString.push(key);
        this.usedStrings.add(key);
      }

      fileStats.total = fileStats.hardcoded.length + fileStats.getString.length;
      this.fileStats.set(relativePath, fileStats);

    } catch (error) {
      console.error(`❌ Erro ao analisar ${filePath}:`, error.message);
    }
  }

  // Obtém número da linha onde a string foi encontrada
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  // Categoriza uma string baseada em palavras-chave
  categorizeString(string) {
    const lowerString = string.toLowerCase();
    
    for (const [category, keywords] of Object.entries(STRING_CATEGORIES)) {
      if (keywords.some(keyword => lowerString.includes(keyword))) {
        return category;
      }
    }
    
    return 'Outros';
  }

  // Percorre recursivamente os arquivos
  walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Pula diretórios de teste e node_modules
        if (!file.startsWith('.') && file !== 'node_modules' && file !== '__tests__') {
          this.walkDirectory(fullPath);
        }
      } else if (EXTENSIONS.includes(path.extname(file))) {
        this.analyzeFile(fullPath);
      }
    }
  }

  // Gera relatório completo
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO DE COBERTURA DE STRINGS - MyGym');
    console.log('='.repeat(80));

    // Estatísticas gerais
    const totalFiles = this.fileStats.size;
    const totalHardcoded = Array.from(this.hardcodedStrings.keys()).length;
    const totalUsedStrings = this.usedStrings.size;
    const totalAvailable = this.availableStrings.size;

    console.log(`\n📈 ESTATÍSTICAS GERAIS:`);
    console.log(`   Arquivos analisados: ${totalFiles}`);
    console.log(`   Strings hardcoded encontradas: ${totalHardcoded}`);
    console.log(`   Strings usando getString(): ${totalUsedStrings}`);
    console.log(`   Strings disponíveis no i18n: ${totalAvailable}`);

    // Cobertura por categoria
    console.log(`\n📋 STRINGS HARDCODED POR CATEGORIA:`);
    const categoryCounts = {};
    
    for (const [string] of this.hardcodedStrings) {
      const category = this.categorizeString(string);
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }

    Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} strings`);
      });

    // Top arquivos com mais strings hardcoded
    console.log(`\n🔥 TOP 10 ARQUIVOS COM MAIS STRINGS HARDCODED:`);
    const filesByHardcoded = Array.from(this.fileStats.entries())
      .sort(([,a], [,b]) => b.hardcoded.length - a.hardcoded.length)
      .slice(0, 10);

    filesByHardcoded.forEach(([file, stats], index) => {
      console.log(`   ${index + 1}. ${file}: ${stats.hardcoded.length} strings`);
    });

    // Strings mais comuns
    console.log(`\n🎯 TOP 20 STRINGS HARDCODED MAIS COMUNS:`);
    const stringsByFrequency = Array.from(this.hardcodedStrings.entries())
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 20);

    stringsByFrequency.forEach(([string, files], index) => {
      const category = this.categorizeString(string);
      console.log(`   ${index + 1}. "${string}" (${files.length} arquivos) [${category}]`);
    });

    // Strings não utilizadas no sistema i18n
    console.log(`\n⚠️  STRINGS DISPONÍVEIS MAS NÃO UTILIZADAS:`);
    const unusedStrings = Array.from(this.availableStrings).filter(key => !this.usedStrings.has(key));
    console.log(`   Total: ${unusedStrings.length} strings`);
    
    if (unusedStrings.length > 0) {
      unusedStrings.slice(0, 10).forEach(key => {
        console.log(`   - ${key}`);
      });
      if (unusedStrings.length > 10) {
        console.log(`   ... e mais ${unusedStrings.length - 10} strings`);
      }
    }

    // Recomendações
    console.log(`\n💡 RECOMENDAÇÕES:`);
    
    const coveragePercent = Math.round((totalUsedStrings / (totalUsedStrings + totalHardcoded)) * 100);
    console.log(`   Cobertura atual: ${coveragePercent}%`);
    
    if (coveragePercent < 80) {
      console.log(`   🔴 Cobertura BAIXA - Priorize migração das strings mais comuns`);
    } else if (coveragePercent < 95) {
      console.log(`   🟡 Cobertura BOA - Continue migrando strings por categoria`);
    } else {
      console.log(`   🟢 Cobertura EXCELENTE - Foque em casos específicos`);
    }

    console.log(`\n   1. Migre as ${Math.min(20, totalHardcoded)} strings mais comuns primeiro`);
    console.log(`   2. Foque nas categorias: ${Object.keys(categoryCounts).slice(0, 3).join(', ')}`);
    console.log(`   3. Priorize arquivos: ${filesByHardcoded.slice(0, 3).map(([file]) => path.basename(file)).join(', ')}`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ Análise concluída! Use este relatório para priorizar a migração.');
    console.log('='.repeat(80));
  }

  // Executa análise completa
  run() {
    console.log('🔍 Iniciando análise de cobertura de strings...');
    
    this.loadAvailableStrings();
    this.walkDirectory(SRC_DIR);
    this.generateReport();
  }
}

// Executa o script
if (require.main === module) {
  const analyzer = new StringAnalyzer();
  analyzer.run();
}

module.exports = StringAnalyzer;
