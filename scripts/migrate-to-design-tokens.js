#!/usr/bin/env node

/**
 * Script de Migração Automática para Design Tokens
 * 
 * Este script automatiza a substituição de valores hardcoded por Design Tokens
 * 
 * Uso:
 *   node scripts/migrate-to-design-tokens.js <caminho-do-arquivo>
 *   node scripts/migrate-to-design-tokens.js src/presentation/screens/admin/AdminDashboard.js
 */

const fs = require('fs');
const path = require('path');

// Mapeamento de valores hardcoded para Design Tokens
const MIGRATIONS = {
  // CORES
  colors: {
    '#4CAF50': 'COLORS.primary[500]',
    '#45A049': 'COLORS.primary[600]',
    '#FF9800': 'COLORS.warning[500]',
    '#2196F3': 'COLORS.info[500]',
    '#1976D2': 'COLORS.info[700]',
    '#9C27B0': 'COLORS.secondary[500]',
    '#7B1FA2': 'COLORS.secondary[700]',
    '#F44336': 'COLORS.error[500]',
    '#f8f9fa': 'COLORS.background.light',
    '#f0f0f0': 'COLORS.gray[100]',
    '#e0e0e0': 'COLORS.gray[300]',
    '#333': 'COLORS.text.primary',
    '#666': 'COLORS.text.secondary',
    '#999': 'COLORS.gray[500]',
    '#757575': 'COLORS.gray[600]',
    'white': 'COLORS.white',
    "'white'": 'COLORS.white',
    '"white"': 'COLORS.white',
    '#fff': 'COLORS.white',
    '#ffffff': 'COLORS.white',
    '#e3f2fd': 'COLORS.info[50]',
    '#fff3e0': 'COLORS.warning[50]',
    '#f9f9f9': 'COLORS.gray[50]',
    'rgba(255,255,255,0.2)': "COLORS.white + '33'",
    'rgba(255,255,255,0.3)': "COLORS.white + '4D'",
    'rgba(255,255,255,0.8)': "COLORS.white + 'CC'",
    'rgba(255,255,255,0.9)': "COLORS.white + 'E6'",
    'rgba(255, 152, 0, 0.05)': 'COLORS.warning[50]',
    'rgba(255, 193, 7, 0.2)': 'COLORS.warning[100]',
  },
  
  // ESPAÇAMENTOS
  spacing: {
    'padding: 4': 'padding: SPACING.xs',
    'padding: 8': 'padding: SPACING.sm',
    'padding: 12': 'padding: SPACING.md',
    'padding: 16': 'padding: SPACING.base',
    'padding: 20': 'padding: SPACING.lg',
    'padding: 24': 'padding: SPACING.xl',
    'margin: 4': 'margin: SPACING.xs',
    'margin: 8': 'margin: SPACING.sm',
    'margin: 12': 'margin: SPACING.md',
    'margin: 16': 'margin: SPACING.base',
    'margin: 20': 'margin: SPACING.lg',
    'margin: 24': 'margin: SPACING.xl',
    'marginTop: 4': 'marginTop: SPACING.xs',
    'marginTop: 8': 'marginTop: SPACING.sm',
    'marginTop: 12': 'marginTop: SPACING.md',
    'marginBottom: 4': 'marginBottom: SPACING.xs',
    'marginBottom: 8': 'marginBottom: SPACING.sm',
    'marginBottom: 12': 'marginBottom: SPACING.md',
    'marginLeft: 4': 'marginLeft: SPACING.xs',
    'marginLeft: 6': 'marginLeft: SPACING.xs',
    'marginRight: 4': 'marginRight: SPACING.xs',
    'paddingHorizontal: 8': 'paddingHorizontal: SPACING.sm',
    'paddingHorizontal: 12': 'paddingHorizontal: SPACING.md',
    'paddingVertical: 4': 'paddingVertical: SPACING.xs',
    'paddingVertical: 8': 'paddingVertical: SPACING.sm',
    'paddingVertical: 12': 'paddingVertical: SPACING.md',
  },
  
  // TIPOGRAFIA
  typography: {
    'fontSize: 12': 'fontSize: FONT_SIZE.sm',
    'fontSize: 14': 'fontSize: FONT_SIZE.base',
    'fontSize: 16': 'fontSize: FONT_SIZE.md',
    'fontSize: 18': 'fontSize: FONT_SIZE.lg',
    'fontSize: 20': 'fontSize: FONT_SIZE.xl',
    'fontSize: 24': 'fontSize: FONT_SIZE.xxl',
    'fontSize: 28': 'fontSize: FONT_SIZE.xxl',
    "fontWeight: 'bold'": 'fontWeight: FONT_WEIGHT.bold',
    "fontWeight: '500'": 'fontWeight: FONT_WEIGHT.medium',
    "fontWeight: '600'": 'fontWeight: FONT_WEIGHT.semibold',
    "fontWeight: '700'": 'fontWeight: FONT_WEIGHT.bold',
  },
  
  // BORDER RADIUS
  borderRadius: {
    'borderRadius: 4': 'borderRadius: BORDER_RADIUS.sm',
    'borderRadius: 6': 'borderRadius: BORDER_RADIUS.sm',
    'borderRadius: 8': 'borderRadius: BORDER_RADIUS.md',
    'borderRadius: 12': 'borderRadius: BORDER_RADIUS.md',
    'borderRadius: 16': 'borderRadius: BORDER_RADIUS.lg',
    'borderRadius: 20': 'borderRadius: BORDER_RADIUS.lg',
    'borderRadius: 24': 'borderRadius: BORDER_RADIUS.full',
  }
};

// Verificar se o import já existe
function hasDesignTokensImport(content) {
  return content.includes("from '@presentation/theme/designTokens'") ||
         content.includes('from "@presentation/theme/designTokens"');
}

// Adicionar import dos Design Tokens
function addDesignTokensImport(content) {
  if (hasDesignTokensImport(content)) {
    return content;
  }
  
  // Encontrar a última linha de import
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex !== -1) {
    const importLine = "import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';";
    lines.splice(lastImportIndex + 1, 0, importLine);
    return lines.join('\n');
  }
  
  return content;
}

// Aplicar migrações
function applyMigrations(content) {
  let migratedContent = content;
  let changeCount = 0;
  
  // Migrar cores
  for (const [oldValue, newValue] of Object.entries(MIGRATIONS.colors)) {
    const regex = new RegExp(oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = migratedContent.match(regex);
    if (matches) {
      migratedContent = migratedContent.replace(regex, newValue);
      changeCount += matches.length;
    }
  }
  
  // Migrar espaçamentos
  for (const [oldValue, newValue] of Object.entries(MIGRATIONS.spacing)) {
    const regex = new RegExp(oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = migratedContent.match(regex);
    if (matches) {
      migratedContent = migratedContent.replace(regex, newValue);
      changeCount += matches.length;
    }
  }
  
  // Migrar tipografia
  for (const [oldValue, newValue] of Object.entries(MIGRATIONS.typography)) {
    const regex = new RegExp(oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = migratedContent.match(regex);
    if (matches) {
      migratedContent = migratedContent.replace(regex, newValue);
      changeCount += matches.length;
    }
  }
  
  // Migrar border radius
  for (const [oldValue, newValue] of Object.entries(MIGRATIONS.borderRadius)) {
    const regex = new RegExp(oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = migratedContent.match(regex);
    if (matches) {
      migratedContent = migratedContent.replace(regex, newValue);
      changeCount += matches.length;
    }
  }
  
  return { content: migratedContent, changeCount };
}

// Função principal
function migrateFile(filePath) {
  try {
    // Ler arquivo
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`\n📄 Migrando: ${filePath}`);
    
    // Adicionar import
    let migratedContent = addDesignTokensImport(content);
    
    // Aplicar migrações
    const { content: finalContent, changeCount } = applyMigrations(migratedContent);
    
    if (changeCount === 0) {
      console.log('✅ Nenhuma alteração necessária');
      return;
    }
    
    // Criar backup
    const backupPath = filePath + '.backup';
    fs.writeFileSync(backupPath, content);
    console.log(`💾 Backup criado: ${backupPath}`);
    
    // Salvar arquivo migrado
    fs.writeFileSync(filePath, finalContent);
    console.log(`✅ Migrado com sucesso! ${changeCount} substituições realizadas`);
    
  } catch (error) {
    console.error(`❌ Erro ao migrar ${filePath}:`, error.message);
  }
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
📚 Script de Migração para Design Tokens

Uso:
  node scripts/migrate-to-design-tokens.js <caminho-do-arquivo>

Exemplo:
  node scripts/migrate-to-design-tokens.js src/presentation/screens/admin/AdminDashboard.js

O script irá:
  1. Criar um backup do arquivo original (.backup)
  2. Adicionar import dos Design Tokens (se necessário)
  3. Substituir valores hardcoded por tokens
  4. Salvar o arquivo migrado
  `);
  process.exit(0);
}

const filePath = path.resolve(args[0]);

if (!fs.existsSync(filePath)) {
  console.error(`❌ Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

migrateFile(filePath);
