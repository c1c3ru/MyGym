#!/usr/bin/env node

/**
 * Script para migrar cores hardcoded em propriedades de componentes
 * (color="#FF5722", colors={['#4CAF50']}, etc.)
 */

const fs = require('fs');
const path = require('path');

// Mapeamento de cores para Design Tokens
const COLOR_MAP = {
  '#4CAF50': 'COLORS.primary[500]',
  '#45A049': 'COLORS.primary[600]',
  '#388E3C': 'COLORS.primary[700]',
  '#2E7D32': 'COLORS.primary[800]',
  '#FF9800': 'COLORS.warning[500]',
  '#F57C00': 'COLORS.warning[600]',
  '#FF5722': 'COLORS.error[500]',
  '#2196F3': 'COLORS.info[500]',
  '#1976D2': 'COLORS.info[700]',
  '#FFC107': 'COLORS.warning[400]',
  '#FFD700': 'COLORS.warning[300]',
  '#BDBDBD': 'COLORS.gray[400]',
  '#9E9E9E': 'COLORS.gray[500]',
  '#757575': 'COLORS.gray[600]',
  '#F44336': 'COLORS.error[500]',
  '#E91E63': 'COLORS.secondary[500]',
  '#9C27B0': 'COLORS.secondary[500]',
};

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changeCount = 0;
    const originalContent = content;
    
    // Migrar cores em propriedades (color="#FF5722")
    for (const [oldColor, newColor] of Object.entries(COLOR_MAP)) {
      // Padrão: color="#FF5722"
      const regex1 = new RegExp(`color="${oldColor}"`, 'gi');
      if (regex1.test(content)) {
        content = content.replace(regex1, `color={${newColor}}`);
        changeCount++;
      }
      
      // Padrão: color='#FF5722'
      const regex2 = new RegExp(`color='${oldColor}'`, 'gi');
      if (regex2.test(content)) {
        content = content.replace(regex2, `color={${newColor}}`);
        changeCount++;
      }
      
      // Padrão: colors={['#4CAF50', '#45A049']}
      const regex3 = new RegExp(`'${oldColor}'`, 'g');
      if (regex3.test(content)) {
        content = content.replace(regex3, newColor);
        changeCount++;
      }
      
      // Padrão: colors={["#4CAF50"]}
      const regex4 = new RegExp(`"${oldColor}"`, 'g');
      if (regex4.test(content)) {
        content = content.replace(regex4, newColor);
        changeCount++;
      }
    }
    
    if (changeCount === 0) {
      console.log('✅ Nenhuma alteração necessária');
      return;
    }
    
    // Criar backup
    const backupPath = filePath + '.backup2';
    fs.writeFileSync(backupPath, originalContent);
    
    // Salvar arquivo migrado
    fs.writeFileSync(filePath, content);
    console.log(`✅ Migrado! ${changeCount} cores em componentes`);
    
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
  }
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
📚 Script de Migração de Cores em Componentes

Uso:
  node scripts/migrate-component-colors.js <arquivo>

Exemplo:
  node scripts/migrate-component-colors.js src/presentation/screens/instructor/InstructorDashboard.js
  `);
  process.exit(0);
}

const filePath = path.resolve(args[0]);

if (!fs.existsSync(filePath)) {
  console.error(`❌ Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

console.log(`\n📄 Migrando cores de componentes: ${filePath}`);
migrateFile(filePath);
