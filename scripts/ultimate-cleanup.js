#!/usr/bin/env node

/**
 * LIMPEZA DEFINITIVA - Pega TODOS os casos de cores hardcoded
 */

const fs = require('fs');
const path = require('path');

const COMPREHENSIVE_COLOR_MAP = {
  // Cores básicas
  '#FFFFFF': 'COLORS.white',
  '#ffffff': 'COLORS.white',
  '#FFF': 'COLORS.white',
  '#fff': 'COLORS.white',
  '#000000': 'COLORS.black',
  '#000': 'COLORS.black',
  
  // Primary
  '#4CAF50': 'COLORS.primary[500]',
  '#4caf50': 'COLORS.primary[500]',
  '#45A049': 'COLORS.primary[600]',
  '#388E3C': 'COLORS.primary[700]',
  '#2E7D32': 'COLORS.primary[800]',
  '#2e7d32': 'COLORS.primary[800]',
  '#1B5E20': 'COLORS.primary[900]',
  '#E8F5E9': 'COLORS.primary[50]',
  '#C8E6C9': 'COLORS.primary[100]',
  
  // Warning/Yellow
  '#FFEB3B': 'COLORS.warning[400]',
  '#FFC107': 'COLORS.warning[500]',
  '#FF9800': 'COLORS.warning[500]',
  '#F57C00': 'COLORS.warning[600]',
  '#FFF3E0': 'COLORS.warning[50]',
  '#FFE0B2': 'COLORS.warning[100]',
  '#FFD700': 'COLORS.warning[300]',
  
  // Error/Red
  '#FF5722': 'COLORS.error[500]',
  '#F44336': 'COLORS.error[500]',
  '#D32F2F': 'COLORS.error[700]',
  '#FFEBEE': 'COLORS.error[50]',
  
  // Info/Blue
  '#2196F3': 'COLORS.info[500]',
  '#1976D2': 'COLORS.info[700]',
  '#1976d2': 'COLORS.info[700]',
  '#0D47A1': 'COLORS.info[900]',
  '#E3F2FD': 'COLORS.info[50]',
  '#BBDEFB': 'COLORS.info[100]',
  
  // Gray
  '#FAFAFA': 'COLORS.gray[50]',
  '#F5F5F5': 'COLORS.gray[100]',
  '#f5f5f5': 'COLORS.gray[100]',
  '#EEEEEE': 'COLORS.gray[200]',
  '#E0E0E0': 'COLORS.gray[300]',
  '#BDBDBD': 'COLORS.gray[400]',
  '#9E9E9E': 'COLORS.gray[500]',
  '#757575': 'COLORS.gray[600]',
  '#616161': 'COLORS.gray[700]',
  '#424242': 'COLORS.gray[800]',
  '#212121': 'COLORS.gray[900]',
  
  // Background
  '#F8F9FA': 'COLORS.background.light',
  '#f8f9fa': 'COLORS.background.light',
  '#f8f8f8': 'COLORS.background.light',
};

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changeCount = 0;
    const originalContent = content;
    
    for (const [oldColor, newColor] of Object.entries(COMPREHENSIVE_COLOR_MAP)) {
      const escapedColor = oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Padrão 1: backgroundColor: '#FFFFFF'
      const regex1 = new RegExp(`(backgroundColor|borderColor|borderTopColor|borderBottomColor|color):\\s*'${escapedColor}'`, 'gi');
      const matches1 = content.match(regex1);
      if (matches1) {
        content = content.replace(regex1, (match) => {
          const prop = match.split(':')[0];
          return `${prop}: ${newColor}`;
        });
        changeCount += matches1.length;
      }
      
      // Padrão 2: backgroundColor: "#FFFFFF"
      const regex2 = new RegExp(`(backgroundColor|borderColor|borderTopColor|borderBottomColor|color):\\s*"${escapedColor}"`, 'gi');
      const matches2 = content.match(regex2);
      if (matches2) {
        content = content.replace(regex2, (match) => {
          const prop = match.split(':')[0];
          return `${prop}: ${newColor}`;
        });
        changeCount += matches2.length;
      }
      
      // Padrão 3: 'Branca': '#FFFFFF' (mapeamentos)
      const regex3 = new RegExp(`:\\s*'${escapedColor}'`, 'g');
      const matches3 = content.match(regex3);
      if (matches3) {
        content = content.replace(regex3, `: ${newColor}`);
        changeCount += matches3.length;
      }
      
      // Padrão 4: : "#FFFFFF"
      const regex4 = new RegExp(`:\\s*"${escapedColor}"`, 'g');
      const matches4 = content.match(regex4);
      if (matches4) {
        content = content.replace(regex4, `: ${newColor}`);
        changeCount += matches4.length;
      }
    }
    
    if (changeCount === 0) {
      console.log('✅ Nenhuma alteração necessária');
      return;
    }
    
    // Criar backup
    const backupPath = filePath + '.backup-final';
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
  console.log('Uso: node scripts/ultimate-cleanup.js <arquivo>');
  process.exit(0);
}

const filePath = path.resolve(args[0]);

if (!fs.existsSync(filePath)) {
  console.error(`❌ Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

console.log(`\n📄 Limpeza definitiva: ${filePath}`);
migrateFile(filePath);
