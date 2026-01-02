#!/usr/bin/env node

/**
 * Script para corrigir cores hardcoded críticas em componentes e telas
 * Foca nos arquivos que afetam diretamente a UI
 */

const fs = require('fs');
const path = require('path');

// Mapeamento de cores hardcoded para Design Tokens
const COLOR_MAPPINGS = {
  // Cores hexadecimais comuns
  '#FFFFFF': 'currentTheme.white',
  '#ffffff': 'currentTheme.white',
  '#FFF': 'currentTheme.white',
  '#fff': 'currentTheme.white',
  
  '#000000': 'currentTheme.black',
  '#000': 'currentTheme.black',
  
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
  
  '#E8F5E8': 'currentTheme.success[50]',
  
  // Cores nomeadas
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
  
  // RGBA comuns
  'rgba(0, 0, 0, 0.1)': 'currentTheme.black + "1A"',
  'rgba(0, 0, 0, 0.15)': 'currentTheme.black + "26"',
  'rgba(0, 0, 0, 0.2)': 'currentTheme.black + "33"',
  'rgba(0, 0, 0, 0.3)': 'currentTheme.black + "4D"',
  'rgba(0, 0, 0, 0.5)': 'currentTheme.black + "80"',
  'rgba(0,0,0,0.15)': 'currentTheme.black + "26"',
  
  // Propriedades específicas
  "shadowColor: '#000'": 'shadowColor: currentTheme.black',
  'shadowColor: "#000"': 'shadowColor: currentTheme.black',
  "shadowColor: '#000000'": 'shadowColor: currentTheme.black',
  'shadowColor: "#000000"': 'shadowColor: currentTheme.black',
  
  "backgroundColor: '#ccc'": 'backgroundColor: currentTheme.gray[300]',
  'backgroundColor: "#ccc"': 'backgroundColor: currentTheme.gray[300]',
  "backgroundColor: '#f0f0f0'": 'backgroundColor: currentTheme.gray[100]',
  'backgroundColor: "#f0f0f0"': 'backgroundColor: currentTheme.gray[100]',
  "backgroundColor: '#E8F5E8'": 'backgroundColor: currentTheme.success[50]',
  
  "color: '#888'": 'color: currentTheme.gray[500]',
  'color: "#888"': 'color: currentTheme.gray[500]',
  "color: '#ccc'": 'color: currentTheme.gray[300]',
  'color: "#ccc"': 'color: currentTheme.gray[300]',
};

// Arquivos prioritários para correção (componentes e telas)
const PRIORITY_FILES = [
  'src/presentation/components/',
  'src/presentation/screens/',
];

function shouldProcessFile(filePath) {
  // Pular arquivos de tema e design tokens (eles devem ter cores hardcoded)
  if (filePath.includes('designTokens.js') || 
      filePath.includes('lightTheme.js') || 
      filePath.includes('adminTheme.js') ||
      filePath.includes('colors.js') ||
      filePath.includes('theme.js')) {
    return false;
  }
  
  // Processar apenas arquivos prioritários
  return PRIORITY_FILES.some(priority => filePath.includes(priority));
}

function fixHardcodedColors(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let changes = 0;
    const appliedChanges = [];
    
    // Verificar se já usa useThemeToggle
    const hasThemeToggle = content.includes('useThemeToggle');
    const hasCurrentTheme = content.includes('currentTheme');
    
    // Aplicar mapeamentos
    Object.entries(COLOR_MAPPINGS).forEach(([oldColor, newColor]) => {
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
    
    // Se houve mudanças e não tem useThemeToggle, adicionar import
    if (changes > 0 && !hasThemeToggle && !hasCurrentTheme) {
      // Encontrar onde adicionar o import
      const importLines = content.split('\n').filter(line => line.includes('import'));
      if (importLines.length > 0) {
        // Adicionar após os outros imports
        const lastImportIndex = content.lastIndexOf('import');
        const nextLineIndex = content.indexOf('\n', lastImportIndex);
        
        const importToAdd = "import { useThemeToggle } from '@contexts/ThemeToggleContext';\n";
        newContent = newContent.slice(0, nextLineIndex + 1) + importToAdd + newContent.slice(nextLineIndex + 1);
        
        // Adicionar hook no componente
        const componentMatch = newContent.match(/const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{/);
        if (componentMatch) {
          const hookToAdd = "  const { currentTheme } = useThemeToggle();\n  \n";
          const insertIndex = componentMatch.index + componentMatch[0].length;
          newContent = newContent.slice(0, insertIndex + 1) + hookToAdd + newContent.slice(insertIndex + 1);
        }
      }
    }
    
    if (changes > 0) {
      // Criar backup
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, content);
      
      // Salvar arquivo corrigido
      fs.writeFileSync(filePath, newContent);
      
      return {
        success: true,
        changes,
        appliedChanges,
        addedThemeToggle: changes > 0 && !hasThemeToggle && !hasCurrentTheme,
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

function scanAndFix(dir) {
  const results = [];
  
  function scanRecursive(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanRecursive(fullPath);
      } else if (stat.isFile() && 
                 (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx')) &&
                 shouldProcessFile(fullPath)) {
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
  console.log('🔧 CORRETOR AUTOMÁTICO DE CORES HARDCODED - MyGym');
  console.log('=' .repeat(60));
  console.log('🎯 Focando em componentes e telas críticas');
  console.log('');
  
  const srcDir = path.join(process.cwd(), 'src');
  const results = scanAndFix(srcDir);
  
  if (results.length === 0) {
    console.log('✅ Nenhuma correção necessária nos arquivos prioritários!');
    return;
  }
  
  let totalFiles = 0;
  let totalChanges = 0;
  let filesWithThemeToggle = 0;
  
  console.log('📋 Correções aplicadas:\n');
  
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
      
      // Mostrar algumas mudanças
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
  
  console.log('=' .repeat(60));
  console.log(`📊 RESUMO:`);
  console.log(`✅ Arquivos corrigidos: ${totalFiles}`);
  console.log(`🔧 Total de correções: ${totalChanges}`);
  console.log(`🎨 useThemeToggle adicionado: ${filesWithThemeToggle} arquivos`);
  console.log(`💾 Backups criados: ${totalFiles}`);
  console.log('=' .repeat(60));
  
  if (totalFiles > 0) {
    console.log('\n🎯 Próximos passos:');
    console.log('1. Teste o app: npx expo start --clear');
    console.log('2. Verifique se não há erros de sintaxe');
    console.log('3. Teste alternância entre temas');
    console.log('4. Se tudo OK, remova backups: find src -name "*.backup" -delete');
    console.log('\n✨ Cores agora são dinâmicas e seguem o tema atual!');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { fixHardcodedColors, COLOR_MAPPINGS };
