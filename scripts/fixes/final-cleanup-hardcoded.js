#!/usr/bin/env node

/**
 * Limpeza FINAL de valores hardcoded
 * Pega casos que os outros scripts não pegaram
 */

const fs = require('fs');
const path = require('path');

const COLOR_MAP = {
  '#FFEBEE': 'COLORS.error[50]',
  '#f5f5f5': 'COLORS.gray[100]',
  '#F5F5F5': 'COLORS.gray[100]',
  '#E8F5E8': 'COLORS.primary[50]',
  '#E8F5E9': 'COLORS.primary[50]',
  '#C8E6C9': 'COLORS.primary[100]',
  '#FFF3E0': 'COLORS.warning[50]',
  '#FFE0B2': 'COLORS.warning[100]',
  '#E3F2FD': 'COLORS.info[50]',
  '#BBDEFB': 'COLORS.info[100]',
  '#F3E5F5': 'COLORS.secondary[50]',
  '#E1BEE7': 'COLORS.secondary[100]',
  '#FAFAFA': 'COLORS.gray[50]',
  '#EEEEEE': 'COLORS.gray[200]',
  '#E0E0E0': 'COLORS.gray[300]',
  '#BDBDBD': 'COLORS.gray[400]',
  '#9E9E9E': 'COLORS.gray[500]',
  '#757575': 'COLORS.gray[600]',
  '#616161': 'COLORS.gray[700]',
  '#424242': 'COLORS.gray[800]',
  '#212121': 'COLORS.gray[900]',
};

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changeCount = 0;
    const originalContent = content;
    
    for (const [oldColor, newColor] of Object.entries(COLOR_MAP)) {
      // backgroundColor: '#f5f5f5'
      const regex1 = new RegExp(`backgroundColor:\\s*'${oldColor}'`, 'gi');
      if (regex1.test(content)) {
        content = content.replace(regex1, `backgroundColor: ${newColor}`);
        changeCount++;
      }
      
      // backgroundColor: "#f5f5f5"
      const regex2 = new RegExp(`backgroundColor:\\s*"${oldColor}"`, 'gi');
      if (regex2.test(content)) {
        content = content.replace(regex2, `backgroundColor: ${newColor}`);
        changeCount++;
      }
      
      // buttonColor="#FFEBEE"
      const regex3 = new RegExp(`buttonColor="${oldColor}"`, 'gi');
      if (regex3.test(content)) {
        content = content.replace(regex3, `buttonColor={${newColor}}`);
        changeCount++;
      }
      
      // borderColor: '#E0E0E0'
      const regex4 = new RegExp(`borderColor:\\s*'${oldColor}'`, 'gi');
      if (regex4.test(content)) {
        content = content.replace(regex4, `borderColor: ${newColor}`);
        changeCount++;
      }
      
      // borderColor: "#E0E0E0"
      const regex5 = new RegExp(`borderColor:\\s*"${oldColor}"`, 'gi');
      if (regex5.test(content)) {
        content = content.replace(regex5, `borderColor: ${newColor}`);
        changeCount++;
      }
    }
    
    if (changeCount === 0) {
      console.log('✅ Nenhuma alteração necessária');
      return;
    }
    
    // Criar backup
    const backupPath = filePath + '.backup3';
    fs.writeFileSync(backupPath, originalContent);
    
    // Salvar arquivo migrado
    fs.writeFileSync(filePath, content);
    console.log(`✅ Migrado! ${changeCount} valores`);
    
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
  }
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
📚 Limpeza Final de Hardcoded

Uso:
  node scripts/final-cleanup-hardcoded.js <arquivo>
  `);
  process.exit(0);
}

const filePath = path.resolve(args[0]);

if (!fs.existsSync(filePath)) {
  console.error(`❌ Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

console.log(`\n📄 Limpando: ${filePath}`);
migrateFile(filePath);
