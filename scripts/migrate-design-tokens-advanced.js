#!/usr/bin/env node

/**
 * Script Avançado de Migração para Design Tokens
 * Identifica e substitui valores hardcoded por Design Tokens
 */

const fs = require('fs');
const path = require('path');

// Mapeamentos de valores para Design Tokens
const SPACING_MAP = {
  '0': 'SPACING.none',
  '2': 'SPACING.xxs', 
  '4': 'SPACING.xs',
  '6': 'SPACING.sm',
  '8': 'SPACING.sm',
  '10': 'SPACING.md',
  '12': 'SPACING.md',
  '16': 'SPACING.base',
  '20': 'SPACING.lg',
  '24': 'SPACING.xl',
  '32': 'SPACING.xxl',
  '40': 'SPACING.huge',
  '48': 'SPACING.huge',
  '64': 'SPACING.huge'
};

const FONT_SIZE_MAP = {
  '10': 'FONT_SIZE.xxs',
  '11': 'FONT_SIZE.xs',
  '12': 'FONT_SIZE.sm',
  '13': 'FONT_SIZE.sm',
  '14': 'FONT_SIZE.base',
  '15': 'FONT_SIZE.base',
  '16': 'FONT_SIZE.md',
  '18': 'FONT_SIZE.lg',
  '20': 'FONT_SIZE.xl',
  '22': 'FONT_SIZE.xl',
  '24': 'FONT_SIZE.xxl',
  '28': 'FONT_SIZE.xxxl',
  '32': 'FONT_SIZE.display',
  '36': 'FONT_SIZE.display',
  '48': 'FONT_SIZE.display'
};

const FONT_WEIGHT_MAP = {
  '100': 'FONT_WEIGHT.light',
  '200': 'FONT_WEIGHT.light',
  '300': 'FONT_WEIGHT.light',
  '400': 'FONT_WEIGHT.normal',
  '500': 'FONT_WEIGHT.medium',
  '600': 'FONT_WEIGHT.semibold',
  '700': 'FONT_WEIGHT.bold',
  '800': 'FONT_WEIGHT.extrabold',
  '900': 'FONT_WEIGHT.extrabold',
  'normal': 'FONT_WEIGHT.normal',
  'bold': 'FONT_WEIGHT.bold'
};

const BORDER_RADIUS_MAP = {
  '0': 'BORDER_RADIUS.none',
  '2': 'BORDER_RADIUS.xs',
  '4': 'BORDER_RADIUS.sm',
  '6': 'BORDER_RADIUS.sm',
  '8': 'BORDER_RADIUS.md',
  '10': 'BORDER_RADIUS.md',
  '12': 'BORDER_RADIUS.lg',
  '16': 'BORDER_RADIUS.xl',
  '20': 'BORDER_RADIUS.xxl',
  '24': 'BORDER_RADIUS.full',
  '50': 'BORDER_RADIUS.full'
};

// Padrões de substituição
const PATTERNS = [
  // Spacing patterns
  {
    pattern: /(\s+)(padding|margin|paddingTop|paddingBottom|paddingLeft|paddingRight|marginTop|marginBottom|marginLeft|marginRight|paddingVertical|paddingHorizontal|marginVertical|marginHorizontal):\s*(\d+),?/g,
    replacement: (match, space, prop, value) => {
      const token = SPACING_MAP[value];
      return token ? `${space}${prop}: ${token},` : match;
    }
  },
  
  // Font size patterns
  {
    pattern: /(\s+)fontSize:\s*(\d+),?/g,
    replacement: (match, space, value) => {
      const token = FONT_SIZE_MAP[value];
      return token ? `${space}fontSize: ${token},` : match;
    }
  },
  
  // Font weight patterns
  {
    pattern: /(\s+)fontWeight:\s*['"]?(\w+)['"]?,?/g,
    replacement: (match, space, value) => {
      const token = FONT_WEIGHT_MAP[value];
      return token ? `${space}fontWeight: ${token},` : match;
    }
  },
  
  // Border radius patterns
  {
    pattern: /(\s+)borderRadius:\s*(\d+),?/g,
    replacement: (match, space, value) => {
      const token = BORDER_RADIUS_MAP[value];
      return token ? `${space}borderRadius: ${token},` : match;
    }
  },
  
  // Width/Height patterns (específicos)
  {
    pattern: /(\s+)(width|height):\s*(24|32|40|48|56|64),?/g,
    replacement: (match, space, prop, value) => {
      const token = SPACING_MAP[value];
      return token ? `${space}${prop}: ${token},` : match;
    }
  },
  
  // Top/Bottom/Left/Right patterns
  {
    pattern: /(\s+)(top|bottom|left|right):\s*(\d+),?/g,
    replacement: (match, space, prop, value) => {
      const token = SPACING_MAP[value];
      return token ? `${space}${prop}: ${token},` : match;
    }
  }
];

// Função para verificar se o arquivo já importa Design Tokens
function hasDesignTokensImport(content) {
  return content.includes('from \'@presentation/theme/designTokens\'') ||
         content.includes('from "@presentation/theme/designTokens"');
}

// Função para adicionar import de Design Tokens
function addDesignTokensImport(content) {
  const importRegex = /^(import.*from.*['"][^'"]*['"];?\s*\n)+/m;
  const match = content.match(importRegex);
  
  if (match) {
    const lastImportIndex = match.index + match[0].length;
    const beforeImports = content.substring(0, lastImportIndex);
    const afterImports = content.substring(lastImportIndex);
    
    const newImport = `import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';\n`;
    
    return beforeImports + newImport + afterImports;
  }
  
  return content;
}

// Função para processar um arquivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let substitutions = 0;
    
    // Aplicar padrões de substituição
    PATTERNS.forEach(({ pattern, replacement }) => {
      const originalContent = content;
      content = content.replace(pattern, (...args) => {
        const result = replacement(...args);
        if (result !== args[0]) {
          substitutions++;
          modified = true;
        }
        return result;
      });
    });
    
    // Adicionar import se necessário e houve modificações
    if (modified && !hasDesignTokensImport(content)) {
      content = addDesignTokensImport(content);
    }
    
    // Salvar arquivo se foi modificado
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath}: ${substitutions} substituições`);
      return substitutions;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return 0;
  }
}

// Função para encontrar arquivos JS/JSX
function findJSFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findJSFiles(fullPath, files);
    } else if (stat.isFile() && /\.(js|jsx)$/.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Função principal
function main() {
  const targetDir = process.argv[2] || './src/presentation';
  
  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Diretório não encontrado: ${targetDir}`);
    process.exit(1);
  }
  
  console.log(`🔍 Procurando arquivos em: ${targetDir}`);
  
  const files = findJSFiles(targetDir);
  console.log(`📁 Encontrados ${files.length} arquivos JS/JSX`);
  
  let totalSubstitutions = 0;
  let processedFiles = 0;
  
  files.forEach(file => {
    const substitutions = processFile(file);
    if (substitutions > 0) {
      processedFiles++;
      totalSubstitutions += substitutions;
    }
  });
  
  console.log('\n📊 RESUMO:');
  console.log(`✅ Arquivos processados: ${processedFiles}`);
  console.log(`🔄 Total de substituições: ${totalSubstitutions}`);
  console.log(`📁 Total de arquivos analisados: ${files.length}`);
  
  if (processedFiles > 0) {
    console.log('\n🎉 Migração concluída! Verifique os arquivos modificados.');
    console.log('💡 Dica: Execute os testes para garantir que nada quebrou.');
  } else {
    console.log('\n✨ Nenhuma modificação necessária. Todos os arquivos já estão usando Design Tokens!');
  }
}

// Executar script
if (require.main === module) {
  main();
}

module.exports = { processFile, SPACING_MAP, FONT_SIZE_MAP, FONT_WEIGHT_MAP, BORDER_RADIUS_MAP };
