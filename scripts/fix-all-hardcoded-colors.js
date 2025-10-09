#!/usr/bin/env node

/**
 * Script para corrigir TODAS as cores hardcoded restantes no projeto MyGym
 * Abordagem mais agressiva para eliminar todas as 651 cores restantes
 */

const fs = require('fs');
const path = require('path');

// Mapeamento expandido de cores hardcoded para Design Tokens
const COMPREHENSIVE_COLOR_MAPPINGS = {
  // === CORES HEXADECIMAIS BÁSICAS ===
  '#FFFFFF': 'currentTheme.white',
  '#ffffff': 'currentTheme.white',
  '#FFF': 'currentTheme.white',
  '#fff': 'currentTheme.white',
  
  '#000000': 'currentTheme.black',
  '#000': 'currentTheme.black',
  
  // === TONS DE CINZA ===
  '#FAFAFA': 'currentTheme.gray[50]',
  '#fafafa': 'currentTheme.gray[50]',
  '#F5F5F5': 'currentTheme.gray[100]',
  '#f5f5f5': 'currentTheme.gray[100]',
  '#EEEEEE': 'currentTheme.gray[200]',
  '#eeeeee': 'currentTheme.gray[200]',
  '#E0E0E0': 'currentTheme.gray[300]',
  '#e0e0e0': 'currentTheme.gray[300]',
  '#BDBDBD': 'currentTheme.gray[400]',
  '#bdbdbd': 'currentTheme.gray[400]',
  '#9E9E9E': 'currentTheme.gray[500]',
  '#9e9e9e': 'currentTheme.gray[500]',
  '#757575': 'currentTheme.gray[600]',
  '#616161': 'currentTheme.gray[700]',
  '#424242': 'currentTheme.gray[800]',
  '#212121': 'currentTheme.gray[900]',
  
  // Variações comuns
  '#ccc': 'currentTheme.gray[300]',
  '#CCC': 'currentTheme.gray[300]',
  '#cccccc': 'currentTheme.gray[300]',
  '#CCCCCC': 'currentTheme.gray[300]',
  '#ddd': 'currentTheme.gray[300]',
  '#DDD': 'currentTheme.gray[300]',
  '#dddddd': 'currentTheme.gray[300]',
  '#DDDDDD': 'currentTheme.gray[300]',
  '#888': 'currentTheme.gray[500]',
  '#888888': 'currentTheme.gray[500]',
  '#f0f0f0': 'currentTheme.gray[100]',
  '#F0F0F0': 'currentTheme.gray[100]',
  
  // === CORES ESPECÍFICAS DO MYGYM ===
  '#FF4757': 'currentTheme.primary[500]',  // Vermelho coral
  '#ff4757': 'currentTheme.primary[500]',
  '#D32F2F': 'currentTheme.primary[700]',  // Vermelho escuro
  '#d32f2f': 'currentTheme.primary[700]',
  '#DC2F3F': 'currentTheme.primary[700]',
  '#dc2f3f': 'currentTheme.primary[700]',
  
  // === CORES AZUIS ===
  '#2196F3': 'currentTheme.info[500]',
  '#2196f3': 'currentTheme.info[500]',
  '#1976D2': 'currentTheme.info[700]',
  '#1976d2': 'currentTheme.info[700]',
  '#1565C0': 'currentTheme.info[800]',
  '#1565c0': 'currentTheme.info[800]',
  '#42A5F5': 'currentTheme.info[400]',
  '#42a5f5': 'currentTheme.info[400]',
  '#1E88E5': 'currentTheme.info[600]',
  '#1e88e5': 'currentTheme.info[600]',
  '#E3F2FD': 'currentTheme.info[50]',
  '#e3f2fd': 'currentTheme.info[50]',
  
  // === CORES VERDES ===
  '#4CAF50': 'currentTheme.success[500]',
  '#4caf50': 'currentTheme.success[500]',
  '#43A047': 'currentTheme.success[600]',
  '#43a047': 'currentTheme.success[600]',
  '#388E3C': 'currentTheme.success[700]',
  '#388e3c': 'currentTheme.success[700]',
  '#2E7D32': 'currentTheme.success[800]',
  '#2e7d32': 'currentTheme.success[800]',
  '#E8F5E8': 'currentTheme.success[50]',
  '#e8f5e8': 'currentTheme.success[50]',
  
  // === CORES AMARELAS/LARANJA ===
  '#FFC107': 'currentTheme.warning[500]',
  '#ffc107': 'currentTheme.warning[500]',
  '#FFB300': 'currentTheme.warning[600]',
  '#ffb300': 'currentTheme.warning[600]',
  '#FFA000': 'currentTheme.warning[700]',
  '#ffa000': 'currentTheme.warning[700]',
  '#FF8F00': 'currentTheme.warning[800]',
  '#ff8f00': 'currentTheme.warning[800]',
  '#F57C00': 'currentTheme.warning[700]',
  '#f57c00': 'currentTheme.warning[700]',
  '#E65100': 'currentTheme.warning[800]',
  '#e65100': 'currentTheme.warning[800]',
  
  // === CORES VERMELHAS ===
  '#F44336': 'currentTheme.error[500]',
  '#f44336': 'currentTheme.error[500]',
  '#E53935': 'currentTheme.error[600]',
  '#e53935': 'currentTheme.error[600]',
  '#C62828': 'currentTheme.error[800]',
  '#c62828': 'currentTheme.error[800]',
  '#B71C1C': 'currentTheme.error[900]',
  '#b71c1c': 'currentTheme.error[900]',
  
  // === CORES DE FUNDO ESPECÍFICAS ===
  '#0D0D0D': 'currentTheme.background.default',
  '#0d0d0d': 'currentTheme.background.default',
  '#1A1A1A': 'currentTheme.background.paper',
  '#1a1a1a': 'currentTheme.background.paper',
  '#FAFBFC': 'currentTheme.background.light',
  '#fafbfc': 'currentTheme.background.light',
  '#F8F9FA': 'currentTheme.background.light',
  '#f8f9fa': 'currentTheme.background.light',
  
  // === CORES NOMEADAS ===
  "'white'": 'currentTheme.white',
  '"white"': 'currentTheme.white',
  '`white`': 'currentTheme.white',
  "'black'": 'currentTheme.black',
  '"black"': 'currentTheme.black',
  '`black`': 'currentTheme.black',
  "'red'": 'currentTheme.error[500]',
  '"red"': 'currentTheme.error[500]',
  "'green'": 'currentTheme.success[500]',
  '"green"': 'currentTheme.success[500]',
  "'blue'": 'currentTheme.info[500]',
  '"blue"': 'currentTheme.info[500]',
  "'yellow'": 'currentTheme.warning[500]',
  '"yellow"': 'currentTheme.warning[500]',
  "'orange'": 'currentTheme.warning[600]',
  '"orange"': 'currentTheme.warning[600]',
  "'gray'": 'currentTheme.gray[500]',
  '"gray"': 'currentTheme.gray[500]',
  "'grey'": 'currentTheme.gray[500]',
  '"grey"': 'currentTheme.gray[500]',
  
  // === RGBA TRANSPARÊNCIAS ===
  'rgba(0, 0, 0, 0.05)': 'currentTheme.black + "0D"',
  'rgba(0, 0, 0, 0.1)': 'currentTheme.black + "1A"',
  'rgba(0, 0, 0, 0.15)': 'currentTheme.black + "26"',
  'rgba(0, 0, 0, 0.2)': 'currentTheme.black + "33"',
  'rgba(0, 0, 0, 0.25)': 'currentTheme.black + "40"',
  'rgba(0, 0, 0, 0.3)': 'currentTheme.black + "4D"',
  'rgba(0, 0, 0, 0.4)': 'currentTheme.black + "66"',
  'rgba(0, 0, 0, 0.5)': 'currentTheme.black + "80"',
  'rgba(0, 0, 0, 0.6)': 'currentTheme.black + "99"',
  'rgba(0, 0, 0, 0.7)': 'currentTheme.black + "B3"',
  'rgba(0, 0, 0, 0.8)': 'currentTheme.black + "CC"',
  'rgba(0, 0, 0, 0.9)': 'currentTheme.black + "E6"',
  
  // Variações sem espaços
  'rgba(0,0,0,0.05)': 'currentTheme.black + "0D"',
  'rgba(0,0,0,0.1)': 'currentTheme.black + "1A"',
  'rgba(0,0,0,0.15)': 'currentTheme.black + "26"',
  'rgba(0,0,0,0.2)': 'currentTheme.black + "33"',
  'rgba(0,0,0,0.3)': 'currentTheme.black + "4D"',
  'rgba(0,0,0,0.5)': 'currentTheme.black + "80"',
  
  // === PROPRIEDADES ESPECÍFICAS ===
  "shadowColor: '#000'": 'shadowColor: currentTheme.black',
  'shadowColor: "#000"': 'shadowColor: currentTheme.black',
  "shadowColor: '#000000'": 'shadowColor: currentTheme.black',
  'shadowColor: "#000000"': 'shadowColor: currentTheme.black',
  
  "backgroundColor: '#fff'": 'backgroundColor: currentTheme.white',
  'backgroundColor: "#fff"': 'backgroundColor: currentTheme.white',
  "backgroundColor: '#FFFFFF'": 'backgroundColor: currentTheme.white',
  'backgroundColor: "#FFFFFF"': 'backgroundColor: currentTheme.white',
  "backgroundColor: '#ccc'": 'backgroundColor: currentTheme.gray[300]',
  'backgroundColor: "#ccc"': 'backgroundColor: currentTheme.gray[300]',
  "backgroundColor: '#f0f0f0'": 'backgroundColor: currentTheme.gray[100]',
  'backgroundColor: "#f0f0f0"': 'backgroundColor: currentTheme.gray[100]',
  "backgroundColor: '#E8F5E8'": 'backgroundColor: currentTheme.success[50]',
  'backgroundColor: "#E8F5E8"': 'backgroundColor: currentTheme.success[50]',
  
  "color: '#000'": 'color: currentTheme.black',
  'color: "#000"': 'color: currentTheme.black',
  "color: '#fff'": 'color: currentTheme.white',
  'color: "#fff"': 'color: currentTheme.white',
  "color: '#888'": 'color: currentTheme.gray[500]',
  'color: "#888"': 'color: currentTheme.gray[500]',
  "color: '#ccc'": 'color: currentTheme.gray[300]',
  'color: "#ccc"': 'color: currentTheme.gray[300]',
  
  "borderColor: '#ccc'": 'borderColor: currentTheme.gray[300]',
  'borderColor: "#ccc"': 'borderColor: currentTheme.gray[300]',
  "borderColor: '#ddd'": 'borderColor: currentTheme.gray[300]',
  'borderColor: "#ddd"': 'borderColor: currentTheme.gray[300]',
};

// Arquivos que devem ser IGNORADOS (contêm cores intencionalmente hardcoded)
const IGNORED_FILES = [
  'designTokens.js',
  'lightTheme.js',
  'adminTheme.js',
  'colors.js',
  'theme.js',
  '.test.js',
  '.spec.js',
  'constants.js',
];

function shouldProcessFile(filePath) {
  // Ignorar arquivos específicos
  if (IGNORED_FILES.some(ignored => filePath.includes(ignored))) {
    return false;
  }
  
  // Processar apenas arquivos JS/TS
  return filePath.match(/\.(js|jsx|ts|tsx)$/);
}

function addThemeToggleImport(content) {
  // Verificar se já tem useThemeToggle
  if (content.includes('useThemeToggle') || content.includes('currentTheme')) {
    return content;
  }
  
  // Encontrar onde adicionar o import
  const lines = content.split('\n');
  let importInsertIndex = -1;
  
  // Procurar a última linha de import
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('import') && !lines[i].includes('//')) {
      importInsertIndex = i;
    }
  }
  
  if (importInsertIndex === -1) {
    return content; // Não conseguiu encontrar imports
  }
  
  // Adicionar import após a última linha de import
  const importToAdd = "import { useThemeToggle } from '@contexts/ThemeToggleContext';";
  lines.splice(importInsertIndex + 1, 0, importToAdd);
  
  // Encontrar componente e adicionar hook
  const newContent = lines.join('\n');
  const componentMatch = newContent.match(/const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{/);
  
  if (componentMatch) {
    const hookToAdd = "  const { currentTheme } = useThemeToggle();\n  ";
    const insertIndex = componentMatch.index + componentMatch[0].length;
    return newContent.slice(0, insertIndex + 1) + hookToAdd + newContent.slice(insertIndex + 1);
  }
  
  return newContent;
}

function fixHardcodedColors(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let changes = 0;
    const appliedChanges = [];
    
    // Aplicar todos os mapeamentos
    Object.entries(COMPREHENSIVE_COLOR_MAPPINGS).forEach(([oldColor, newColor]) => {
      const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = [...content.matchAll(regex)];
      
      if (matches.length > 0) {
        newContent = newContent.replace(regex, newColor);
        changes += matches.length;
        appliedChanges.push({
          from: oldColor,
          to: newColor,
          count: matches.length
        });
      }
    });
    
    // Se houve mudanças, adicionar useThemeToggle se necessário
    if (changes > 0) {
      const hasThemeToggle = content.includes('useThemeToggle');
      if (!hasThemeToggle) {
        newContent = addThemeToggleImport(newContent);
      }
      
      // Criar backup
      const backupPath = filePath + '.backup-all';
      fs.writeFileSync(backupPath, content);
      
      // Salvar arquivo corrigido
      fs.writeFileSync(filePath, newContent);
      
      return {
        success: true,
        changes,
        appliedChanges,
        addedThemeToggle: !hasThemeToggle,
        backupCreated: backupPath
      };
    }
    
    return {
      success: true,
      changes: 0,
      message: 'Nenhuma correção necessária'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

function scanAndFixAll(dir) {
  const results = [];
  
  function scanRecursive(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanRecursive(fullPath);
      } else if (stat.isFile() && shouldProcessFile(fullPath)) {
        const result = fixHardcodedColors(fullPath);
        if (result.changes > 0 || !result.success) {
          results.push({
            file: fullPath.replace(process.cwd() + '/', ''),
            ...result
          });
        }
      }
    }
  }
  
  scanRecursive(dir);
  return results;
}

function main() {
  console.log('🚀 CORRETOR MASSIVO DE CORES HARDCODED - MyGym');
  console.log('=' .repeat(70));
  console.log('🎯 META: Eliminar as 651 cores restantes de 731 total');
  console.log('📊 PROGRESSO ATUAL: 80/731 cores corrigidas (11%)');
  console.log('🔥 MODO AGRESSIVO: Corrigindo TODAS as cores hardcoded');
  console.log('');
  
  const srcDir = path.join(process.cwd(), 'src');
  const results = scanAndFixAll(srcDir);
  
  if (results.length === 0) {
    console.log('✅ Todas as cores hardcoded já foram corrigidas!');
    return;
  }
  
  let totalFiles = 0;
  let totalChanges = 0;
  let filesWithThemeToggle = 0;
  
  console.log('📋 Correções massivas aplicadas:\n');
  
  results.forEach(result => {
    if (result.success && result.changes > 0) {
      totalFiles++;
      totalChanges += result.changes;
      
      console.log(`✅ ${result.file}`);
      console.log(`   └─ ${result.changes} cores corrigidas`);
      
      if (result.addedThemeToggle) {
        filesWithThemeToggle++;
        console.log(`   └─ ✨ useThemeToggle() adicionado`);
      }
      
      // Mostrar top 3 mudanças
      result.appliedChanges.slice(0, 3).forEach(change => {
        console.log(`   ├─ ${change.from} → ${change.to} (${change.count}x)`);
      });
      
      if (result.appliedChanges.length > 3) {
        console.log(`   └─ ... e mais ${result.appliedChanges.length - 3} mudanças`);
      }
      console.log('');
    } else if (!result.success) {
      console.log(`❌ ${result.file}`);
      console.log(`   └─ Erro: ${result.error}`);
      console.log('');
    }
  });
  
  const newTotal = 80 + totalChanges;
  const percentage = ((newTotal / 731) * 100).toFixed(1);
  
  console.log('=' .repeat(70));
  console.log(`📊 RESULTADOS MASSIVOS:`);
  console.log(`✅ Arquivos corrigidos nesta execução: ${totalFiles}`);
  console.log(`🔧 Correções nesta execução: ${totalChanges}`);
  console.log(`🎨 useThemeToggle adicionado: ${filesWithThemeToggle} arquivos`);
  console.log(`💾 Backups criados: ${totalFiles}`);
  console.log('');
  console.log(`📈 PROGRESSO TOTAL:`);
  console.log(`🎯 Cores corrigidas: ${newTotal}/731 (${percentage}%)`);
  console.log(`📉 Cores restantes: ${731 - newTotal}`);
  console.log('=' .repeat(70));
  
  if (totalFiles > 0) {
    console.log('\n🎯 Próximos passos CRÍTICOS:');
    console.log('1. 🧪 TESTE IMEDIATO: npx expo start --clear');
    console.log('2. 🔍 Verifique se não há erros de sintaxe');
    console.log('3. 🔄 Teste alternância entre temas');
    console.log('4. 📱 Teste todas as telas principais');
    console.log('5. ✅ Se tudo OK: find src -name "*.backup-all" -delete');
    console.log('\n🎉 PARABÉNS! Mais cores hardcoded eliminadas!');
    
    if (newTotal >= 600) {
      console.log('\n🏆 QUASE LÁ! Mais de 80% das cores corrigidas!');
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { fixHardcodedColors, COMPREHENSIVE_COLOR_MAPPINGS };
