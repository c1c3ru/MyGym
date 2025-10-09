#!/usr/bin/env node

/**
 * Script para encontrar e corrigir cores hardcoded no projeto MyGym
 * Detecta cores hex, rgb, rgba e strings de cores
 */

const fs = require('fs');
const path = require('path');

function findHardcodedColors(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];
    
    // Padrões para detectar cores hardcoded
    const patterns = [
      // Cores hexadecimais
      { 
        regex: /#[0-9A-Fa-f]{3,8}/g, 
        type: 'hex',
        description: 'Cor hexadecimal'
      },
      // RGB/RGBA
      { 
        regex: /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+)?\s*\)/g, 
        type: 'rgb',
        description: 'Cor RGB/RGBA'
      },
      // Cores nomeadas como strings
      { 
        regex: /['"`](white|black|red|green|blue|yellow|orange|purple|pink|gray|grey|brown|cyan|magenta)['"`]/g, 
        type: 'named',
        description: 'Cor nomeada'
      },
      // shadowColor hardcoded
      { 
        regex: /shadowColor:\s*['"`]#[0-9A-Fa-f]{3,8}['"`]/g, 
        type: 'shadow',
        description: 'Shadow color hardcoded'
      },
      // backgroundColor hardcoded
      { 
        regex: /backgroundColor:\s*['"`]#[0-9A-Fa-f]{3,8}['"`]/g, 
        type: 'background',
        description: 'Background color hardcoded'
      },
      // color hardcoded
      { 
        regex: /color:\s*['"`]#[0-9A-Fa-f]{3,8}['"`]/g, 
        type: 'color',
        description: 'Color hardcoded'
      },
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        const line = content.split('\n')[lineNumber - 1];
        
        results.push({
          type: pattern.type,
          description: pattern.description,
          value: match[0],
          line: lineNumber,
          lineContent: line.trim(),
          index: match.index
        });
      }
    });
    
    return results;
  } catch (error) {
    return { error: error.message };
  }
}

function scanDirectory(dir) {
  const results = {};
  
  function scanRecursive(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanRecursive(fullPath);
      } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx'))) {
        const colors = findHardcodedColors(fullPath);
        if (colors.length > 0) {
          const relativePath = fullPath.replace(process.cwd() + '/', '');
          results[relativePath] = colors;
        }
      }
    }
  }
  
  scanRecursive(dir);
  return results;
}

function generateSuggestions(colorValue, type) {
  const suggestions = [];
  
  switch (type) {
    case 'hex':
      if (colorValue === '#FFFFFF' || colorValue === '#ffffff') {
        suggestions.push('currentTheme.white');
        suggestions.push('COLORS.white');
      } else if (colorValue === '#000000' || colorValue === '#000') {
        suggestions.push('currentTheme.black');
        suggestions.push('COLORS.black');
      } else if (colorValue.startsWith('#FF')) {
        suggestions.push('currentTheme.error[500]');
        suggestions.push('currentTheme.primary[500]');
      } else if (colorValue.startsWith('#00')) {
        suggestions.push('currentTheme.success[500]');
      } else if (colorValue.startsWith('#0')) {
        suggestions.push('currentTheme.info[500]');
        suggestions.push('currentTheme.primary[500]');
      } else {
        suggestions.push('currentTheme.gray[500]');
        suggestions.push('currentTheme.text.secondary');
      }
      break;
      
    case 'named':
      const colorName = colorValue.replace(/['"`]/g, '');
      switch (colorName) {
        case 'white':
          suggestions.push('currentTheme.white');
          break;
        case 'black':
          suggestions.push('currentTheme.black');
          break;
        case 'red':
          suggestions.push('currentTheme.error[500]');
          suggestions.push('currentTheme.primary[500]');
          break;
        case 'green':
          suggestions.push('currentTheme.success[500]');
          break;
        case 'blue':
          suggestions.push('currentTheme.info[500]');
          suggestions.push('currentTheme.primary[500]');
          break;
        case 'yellow':
          suggestions.push('currentTheme.warning[500]');
          break;
        case 'gray':
        case 'grey':
          suggestions.push('currentTheme.gray[500]');
          suggestions.push('currentTheme.text.secondary');
          break;
        default:
          suggestions.push('currentTheme.gray[500]');
      }
      break;
      
    case 'shadow':
    case 'background':
    case 'color':
      suggestions.push('currentTheme.black');
      suggestions.push('currentTheme.text.primary');
      suggestions.push('currentTheme.background.default');
      break;
  }
  
  return suggestions;
}

function main() {
  console.log('🎨 DETECTOR DE CORES HARDCODED - MyGym');
  console.log('=' .repeat(60));
  
  const srcDir = path.join(process.cwd(), 'src');
  const results = scanDirectory(srcDir);
  
  if (Object.keys(results).length === 0) {
    console.log('✅ Nenhuma cor hardcoded encontrada!');
    return;
  }
  
  let totalFiles = 0;
  let totalColors = 0;
  
  console.log('\n📋 Cores hardcoded encontradas:\n');
  
  Object.entries(results).forEach(([file, colors]) => {
    totalFiles++;
    totalColors += colors.length;
    
    console.log(`📄 ${file}`);
    console.log(`   └─ ${colors.length} cores hardcoded encontradas`);
    
    // Agrupar por tipo
    const byType = {};
    colors.forEach(color => {
      if (!byType[color.type]) byType[color.type] = [];
      byType[color.type].push(color);
    });
    
    Object.entries(byType).forEach(([type, typeColors]) => {
      console.log(`   ├─ ${type.toUpperCase()}: ${typeColors.length}x`);
      
      // Mostrar alguns exemplos
      typeColors.slice(0, 3).forEach(color => {
        console.log(`   │  └─ Linha ${color.line}: ${color.value}`);
        const suggestions = generateSuggestions(color.value, color.type);
        if (suggestions.length > 0) {
          console.log(`   │     💡 Sugestão: ${suggestions[0]}`);
        }
      });
      
      if (typeColors.length > 3) {
        console.log(`   │  └─ ... e mais ${typeColors.length - 3} ocorrências`);
      }
    });
    console.log('');
  });
  
  console.log('=' .repeat(60));
  console.log(`📊 RESUMO:`);
  console.log(`📄 Arquivos afetados: ${totalFiles}`);
  console.log(`🎨 Total de cores hardcoded: ${totalColors}`);
  console.log('=' .repeat(60));
  
  console.log('\n🔧 PRÓXIMOS PASSOS:');
  console.log('1. Revisar cada arquivo listado acima');
  console.log('2. Substituir cores hardcoded por Design Tokens');
  console.log('3. Usar useThemeToggle() para cores dinâmicas');
  console.log('4. Testar em ambos os temas (Light/Dark)');
  
  console.log('\n💡 EXEMPLO DE CORREÇÃO:');
  console.log('// ❌ ANTES (hardcoded)');
  console.log("color: '#FFFFFF'");
  console.log('');
  console.log('// ✅ DEPOIS (dinâmico)');
  console.log('const { currentTheme } = useThemeToggle();');
  console.log('color: currentTheme.white');
  
  console.log('\n📚 DOCUMENTAÇÃO:');
  console.log('- Guia de temas: docs/COMO_USAR_TEMAS.md');
  console.log('- Design Tokens: src/presentation/theme/designTokens.js');
  console.log('- Light Theme: src/presentation/theme/lightTheme.js');
  
  // Retornar código de saída baseado nos resultados
  process.exit(totalColors > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { findHardcodedColors, scanDirectory, generateSuggestions };
