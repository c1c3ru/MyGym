#!/usr/bin/env node

/**
 * Script de Migração para Cores BJJ Control
 * 
 * Atualiza cores hardcoded para usar os design tokens atualizados
 * com o estilo visual do BJJ Control (preto mais profundo, bordas mais sutis)
 */

const fs = require('fs');
const path = require('path');

// Mapeamento de cores antigas → novas
const COLOR_MAPPINGS = {
  // Backgrounds
  "'#0D0D0D'": 'COLORS.background.default',  // #0A0A0A
  '"#0D0D0D"': 'COLORS.background.default',
  '#0D0D0D': 'COLORS.background.default',
  
  "'#1A1A1A'": 'COLORS.background.paper',     // #1C1C1C
  '"#1A1A1A"': 'COLORS.background.paper',
  '#1A1A1A': 'COLORS.background.paper',
  
  "'#212121'": 'COLORS.background.elevated',  // #242424
  '"#212121"': 'COLORS.background.elevated',
  '#212121': 'COLORS.background.elevated',
  
  // Cards (atualizar para nova estrutura)
  'COLORS.secondary[800]': 'COLORS.card.default.background',
  'COLORS.secondary[900]': 'COLORS.background.default',
  
  // Bordas (mais sutis)
  "'#424242'": 'COLORS.border.default',       // Mantém
  '"#424242"': 'COLORS.border.default',
  
  // Texto secundário (ajustado para BJJ Control)
  "'#E0E0E0'": 'COLORS.text.secondary',       // #BDBDBD
  '"#E0E0E0"': 'COLORS.text.secondary',
  '#E0E0E0': 'COLORS.text.secondary',
};

// Substituições específicas para cards
const CARD_REPLACEMENTS = {
  'backgroundColor: COLORS.secondary[800]': 'backgroundColor: COLORS.card.default.background',
  'backgroundColor: COLORS.secondary[900]': 'backgroundColor: COLORS.background.default',
  'borderColor: COLORS.secondary[700]': 'borderColor: COLORS.card.default.border',
};

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changes = 0;

    // Criar backup
    const backupPath = `${filePath}.backup-bjj`;
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, content);
    }

    // Aplicar mapeamentos de cores
    for (const [oldColor, newColor] of Object.entries(COLOR_MAPPINGS)) {
      const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, newColor);
        changes += matches.length;
        modified = true;
      }
    }

    // Aplicar substituições de cards
    for (const [oldPattern, newPattern] of Object.entries(CARD_REPLACEMENTS)) {
      if (content.includes(oldPattern)) {
        content = content.replace(new RegExp(oldPattern, 'g'), newPattern);
        changes++;
        modified = true;
      }
    }

    // Verificar se precisa adicionar import de COLORS
    if (modified && !content.includes('COLORS') && !content.includes('designTokens')) {
      // Encontrar a linha de imports do React Native
      const importMatch = content.match(/import\s+{[^}]+}\s+from\s+['"]react-native['"]/);
      if (importMatch) {
        const insertPosition = content.indexOf(importMatch[0]) + importMatch[0].length;
        const newImport = "\nimport { COLORS } from '@presentation/theme/designTokens';";
        content = content.slice(0, insertPosition) + newImport + content.slice(insertPosition);
        console.log(`   ✅ Import de COLORS adicionado`);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${path.basename(filePath)} - ${changes} substituições`);
      return { success: true, changes };
    } else {
      console.log(`⏭️  ${path.basename(filePath)} - Nenhuma mudança necessária`);
      return { success: true, changes: 0 };
    }

  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return { success: false, changes: 0 };
  }
}

function migrateDirectory(dirPath, pattern = /\.(js|jsx|ts|tsx)$/) {
  const results = {
    total: 0,
    success: 0,
    failed: 0,
    totalChanges: 0,
  };

  function processDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Ignorar node_modules, .git, etc
        if (!['node_modules', '.git', 'build', 'dist', '.expo'].includes(entry.name)) {
          processDir(fullPath);
        }
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.total++;
        const result = migrateFile(fullPath);
        if (result.success) {
          results.success++;
          results.totalChanges += result.changes;
        } else {
          results.failed++;
        }
      }
    }
  }

  processDir(dirPath);
  return results;
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('❌ Uso: node migrate-to-bjj-colors.js <arquivo-ou-diretório>');
  console.log('');
  console.log('Exemplos:');
  console.log('  node migrate-to-bjj-colors.js src/presentation/screens/auth/LoginScreen.js');
  console.log('  node migrate-to-bjj-colors.js src/presentation/screens/auth');
  console.log('  node migrate-to-bjj-colors.js src/presentation');
  process.exit(1);
}

const target = args[0];
const fullPath = path.resolve(target);

console.log('');
console.log('🎨 Migração para Cores BJJ Control');
console.log('═══════════════════════════════════════════');
console.log('');

if (!fs.existsSync(fullPath)) {
  console.error(`❌ Caminho não encontrado: ${fullPath}`);
  process.exit(1);
}

const stats = fs.statSync(fullPath);

if (stats.isFile()) {
  console.log(`📄 Processando arquivo: ${path.basename(fullPath)}`);
  console.log('');
  const result = migrateFile(fullPath);
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Concluído: ${result.changes} substituições`);
} else if (stats.isDirectory()) {
  console.log(`📁 Processando diretório: ${fullPath}`);
  console.log('');
  const results = migrateDirectory(fullPath);
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log(`📊 Resultados:`);
  console.log(`   Total de arquivos: ${results.total}`);
  console.log(`   ✅ Sucesso: ${results.success}`);
  console.log(`   ❌ Falhas: ${results.failed}`);
  console.log(`   🔄 Total de substituições: ${results.totalChanges}`);
}

console.log('');
console.log('💡 Dica: Execute "npx expo start --clear" para limpar o cache');
console.log('');
