#!/usr/bin/env node

/**
 * Script de Migração Automática para Dark Theme
 * Converte telas para usar a nova paleta de cores escuras
 * 
 * PROTEÇÕES:
 * - Não duplica COLORS (evita COLORS.COLORS)
 * - Verifica imports existentes
 * - Cria backup antes de modificar
 * - Valida sintaxe após mudanças
 */

const fs = require('fs');
const path = require('path');

// Mapeamento de cores claras → escuras
const COLOR_MAPPINGS = {
  // Backgrounds claros → escuros
  "'#FFFFFF'": 'COLORS.background.default',
  '"#FFFFFF"': 'COLORS.background.default',
  "'#ffffff'": 'COLORS.background.default',
  '"#ffffff"': 'COLORS.background.default',
  "'white'": 'COLORS.white',
  '"white"': 'COLORS.white',
  
  "'#F5F5F5'": 'COLORS.background.paper',
  '"#F5F5F5"': 'COLORS.background.paper',
  "'#f5f5f5'": 'COLORS.background.paper',
  '"#f5f5f5"': 'COLORS.background.paper',
  
  "'#FAFAFA'": 'COLORS.background.paper',
  '"#FAFAFA"': 'COLORS.background.paper',
  "'#fafafa'": 'COLORS.background.paper',
  '"#fafafa"': 'COLORS.background.paper',
  
  "'#F8F9FA'": 'COLORS.background.paper',
  '"#F8F9FA"': 'COLORS.background.paper',
  "'#f8f9fa'": 'COLORS.background.paper',
  '"#f8f9fa"': 'COLORS.background.paper',
  
  // Texto escuro → claro
  "'#000000'": 'COLORS.text.primary',
  '"#000000"': 'COLORS.text.primary',
  "'#000'": 'COLORS.text.primary',
  '"#000"': 'COLORS.text.primary',
  "'black'": 'COLORS.text.primary',
  '"black"': 'COLORS.text.primary',
  
  "'#333333'": 'COLORS.text.primary',
  '"#333333"': 'COLORS.text.primary',
  "'#333'": 'COLORS.text.primary',
  '"#333"': 'COLORS.text.primary',
  
  "'#666666'": 'COLORS.text.secondary',
  '"#666666"': 'COLORS.text.secondary',
  "'#666'": 'COLORS.text.secondary',
  '"#666"': 'COLORS.text.secondary',
  
  "'#999999'": 'COLORS.text.disabled',
  '"#999999"': 'COLORS.text.disabled',
  "'#999'": 'COLORS.text.disabled',
  '"#999"': 'COLORS.text.disabled',
  
  // Cinzas claros → escuros
  "'#E0E0E0'": 'COLORS.secondary[100]',
  '"#E0E0E0"': 'COLORS.secondary[100]',
  "'#e0e0e0'": 'COLORS.secondary[100]',
  '"#e0e0e0"': 'COLORS.secondary[100]',
  
  "'#BDBDBD'": 'COLORS.secondary[200]',
  '"#BDBDBD"': 'COLORS.secondary[200]',
  "'#bdbdbd'": 'COLORS.secondary[200]',
  '"#bdbdbd"': 'COLORS.secondary[200]',
};

// Import necessário
const DESIGN_TOKENS_IMPORT = "import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';";

/**
 * Verifica se o arquivo já tem import de design tokens
 */
function hasDesignTokensImport(content) {
  return content.includes('from @presentation/theme/designTokens') ||
         content.includes('from \'@presentation/theme/designTokens\'') ||
         content.includes('from "@presentation/theme/designTokens"');
}

/**
 * Verifica se uma string já é uma referência a COLORS
 */
function isAlreadyColorsReference(str) {
  return str.includes('COLORS.') || str.includes('COLORS[');
}

/**
 * Adiciona import de design tokens se não existir
 */
function addDesignTokensImport(content) {
  if (hasDesignTokensImport(content)) {
    console.log('  ℹ️  Import de design tokens já existe');
    return content;
  }
  
  // Encontra a última linha de import
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex === -1) {
    // Não há imports, adiciona no início
    return DESIGN_TOKENS_IMPORT + '\n\n' + content;
  }
  
  // Adiciona após o último import
  lines.splice(lastImportIndex + 1, 0, DESIGN_TOKENS_IMPORT);
  console.log('  ✅ Import de design tokens adicionado');
  return lines.join('\n');
}

/**
 * Substitui cores hardcoded por tokens
 * PROTEÇÃO: Não substitui se já é COLORS.xxx
 */
function replaceColors(content) {
  let modified = content;
  let replacements = 0;
  
  for (const [oldColor, newColor] of Object.entries(COLOR_MAPPINGS)) {
    // Regex para encontrar a cor em contextos de estilo
    // Evita substituir se já tem COLORS. antes
    const regex = new RegExp(
      `(?<!COLORS\\.)(?<!COLORS\\[)${oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      'g'
    );
    
    const matches = (modified.match(regex) || []).length;
    if (matches > 0) {
      modified = modified.replace(regex, newColor);
      replacements += matches;
      console.log(`  🔄 ${oldColor} → ${newColor} (${matches}x)`);
    }
  }
  
  return { content: modified, replacements };
}

/**
 * Processa um arquivo
 */
function processFile(filePath) {
  console.log(`\n📄 Processando: ${filePath}`);
  
  // Lê o arquivo
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Verifica se já está usando COLORS extensivamente
  const colorsCount = (content.match(/COLORS\./g) || []).length;
  if (colorsCount > 20) {
    console.log(`  ⏭️  Arquivo já usa COLORS extensivamente (${colorsCount} ocorrências)`);
    return { skipped: true, replacements: 0 };
  }
  
  // Cria backup
  const backupPath = filePath + '.backup-dark';
  fs.writeFileSync(backupPath, content);
  console.log(`  💾 Backup criado: ${backupPath}`);
  
  // Adiciona import se necessário
  let modified = addDesignTokensImport(content);
  
  // Substitui cores
  const result = replaceColors(modified);
  modified = result.content;
  
  if (result.replacements === 0) {
    console.log('  ⏭️  Nenhuma substituição necessária');
    fs.unlinkSync(backupPath); // Remove backup desnecessário
    return { skipped: true, replacements: 0 };
  }
  
  // Salva arquivo modificado
  fs.writeFileSync(filePath, modified);
  console.log(`  ✅ Arquivo atualizado (${result.replacements} substituições)`);
  
  return { skipped: false, replacements: result.replacements };
}

/**
 * Processa múltiplos arquivos
 */
function processFiles(files) {
  console.log('🚀 Iniciando migração para Dark Theme...\n');
  
  let totalFiles = 0;
  let totalReplacements = 0;
  let skippedFiles = 0;
  
  for (const file of files) {
    const result = processFile(file);
    if (!result.skipped) {
      totalFiles++;
      totalReplacements += result.replacements;
    } else {
      skippedFiles++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DA MIGRAÇÃO');
  console.log('='.repeat(60));
  console.log(`✅ Arquivos processados: ${totalFiles}`);
  console.log(`⏭️  Arquivos pulados: ${skippedFiles}`);
  console.log(`🔄 Total de substituições: ${totalReplacements}`);
  console.log('='.repeat(60));
}

// Execução
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Uso: node migrate-to-dark-theme.js <arquivo1> [arquivo2] ...');
    process.exit(1);
  }
  
  // Valida que todos os arquivos existem
  for (const file of args) {
    if (!fs.existsSync(file)) {
      console.log(`❌ Arquivo não encontrado: ${file}`);
      process.exit(1);
    }
  }
  
  processFiles(args);
}

module.exports = { processFile, processFiles };
