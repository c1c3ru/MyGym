#!/usr/bin/env node

/**
 * LIMPEZA ABSOLUTA FINAL - Pega até cores customizadas e gradientes
 */

const fs = require('fs');
const path = require('path');

const COMPLETE_COLOR_MAP = {
  // Básicas
  '#FFFFFF': 'COLORS.white',
  '#ffffff': 'COLORS.white',
  '#000000': 'COLORS.black',
  '#000': 'COLORS.black',
  
  // Primary/Green
  '#4CAF50': 'COLORS.primary[500]',
  '#4caf50': 'COLORS.primary[500]',
  '#45A049': 'COLORS.primary[600]',
  '#388E3C': 'COLORS.primary[700]',
  '#2E7D32': 'COLORS.primary[800]',
  '#2e7d32': 'COLORS.primary[800]',
  '#1B5E20': 'COLORS.primary[900]',
  '#E8F5E9': 'COLORS.primary[50]',
  '#C8E6C9': 'COLORS.primary[100]',
  '#F1F8E9': 'COLORS.primary[50]',
  
  // Warning/Orange/Yellow
  '#FFEB3B': 'COLORS.warning[400]',
  '#FFC107': 'COLORS.warning[500]',
  '#FF9800': 'COLORS.warning[500]',
  '#FF8F00': 'COLORS.warning[600]',
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
  
  // Purple/Violet (para gradientes)
  '#667eea': 'COLORS.secondary[400]',
  '#667EEA': 'COLORS.secondary[400]',
  '#764ba2': 'COLORS.secondary[600]',
  '#764BA2': 'COLORS.secondary[600]',
  '#9C27B0': 'COLORS.secondary[500]',
  
  // Brown (graduações)
  '#795548': 'COLORS.gray[700]',
  '#8D6E63': 'COLORS.gray[600]',
  
  // Coral
  '#FF7043': 'COLORS.error[400]',
  
  // Light backgrounds
  '#F3F8FF': 'COLORS.info[50]',
  '#FFF5F5': 'COLORS.error[50]',
  '#F0F0F0': 'COLORS.gray[100]',
  
  // Deep Orange
  '#E65100': 'COLORS.warning[800]',
  
  // Gray/Dark
  '#1a1a1a': 'COLORS.gray[900]',
  '#1A1A1A': 'COLORS.gray[900]',
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
    
    for (const [oldColor, newColor] of Object.entries(COMPLETE_COLOR_MAP)) {
      const escapedColor = oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Todos os padrões possíveis
      const patterns = [
        // Propriedades CSS
        new RegExp(`(backgroundColor|borderColor|borderTopColor|borderBottomColor|color|iconColor|textColor|buttonColor):\\s*['"]${escapedColor}['"]`, 'gi'),
        // Mapeamentos de objetos
        new RegExp(`:\\s*['"]${escapedColor}['"]`, 'g'),
        // Arrays de cores (gradientes)
        new RegExp(`['"]${escapedColor}['"]`, 'g'),
      ];
      
      patterns.forEach(regex => {
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, (match) => {
            // Se tem propriedade CSS (backgroundColor:)
            if (match.includes(':') && !match.startsWith("'") && !match.startsWith('"')) {
              const prop = match.split(':')[0];
              return `${prop}: ${newColor}`;
            }
            // Se é mapeamento ou array
            return match.replace(new RegExp(`['"]${escapedColor}['"]`, 'gi'), newColor);
          });
          changeCount += matches.length;
        }
      });
    }
    
    if (changeCount === 0) {
      console.log('✅ Nenhuma alteração necessária');
      return;
    }
    
    // Criar backup
    const backupPath = filePath + '.backup-absolute';
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
  console.log('Uso: node scripts/final-final-cleanup.js <arquivo>');
  process.exit(0);
}

const filePath = path.resolve(args[0]);

if (!fs.existsSync(filePath)) {
  console.error(`❌ Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

console.log(`\n📄 Limpeza absoluta: ${filePath}`);
migrateFile(filePath);
