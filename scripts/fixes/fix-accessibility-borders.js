#!/usr/bin/env node

/**
 * Script para corrigir problemas de acessibilidade:
 * - Bordas muito finas (borderWidth: 1) → BORDER_WIDTH.base (2px)
 * - Cores com baixo contraste
 * - Adiciona imports necessários
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/presentation/screens/student/StudentPayments.js',
  'src/presentation/components/Button/Button.styles.js',
  'src/presentation/components/ConflictWarning.js',
  'src/presentation/components/FreeGymScheduler.js',
  'src/presentation/components/QRCodeScanner.js',
  'src/presentation/components/SelectionField.js',
  'src/presentation/screens/admin/AddClassScreen.js',
  'src/presentation/screens/admin/AdminClasses.js',
  'src/presentation/screens/admin/EditClassScreen.js',
  'src/presentation/screens/auth/UserTypeSelectionScreen.js',
  'src/presentation/screens/instructor/InstructorStudents.js',
  'src/presentation/screens/shared/ProfileScreen.js',
  'src/presentation/screens/shared/SettingsScreen.js',
];

function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // 1. Substituir borderWidth: 1 por BORDER_WIDTH.base
  const borderWidthRegex = /borderWidth:\s*1([,\s])/g;
  if (borderWidthRegex.test(content)) {
    content = content.replace(borderWidthRegex, 'borderWidth: BORDER_WIDTH.base$1');
    modified = true;
    console.log(`✅ ${filePath}: Corrigido borderWidth: 1 → BORDER_WIDTH.base`);
  }

  // 2. Substituir cores hardcoded por tokens
  const colorReplacements = [
    { from: /'#ddd'/g, to: 'COLORS.gray[400]' },
    { from: /'#eee'/g, to: 'COLORS.gray[300]' },
    { from: /'#ccc'/g, to: 'COLORS.gray[400]' },
    { from: /'#e0e0e0'/gi, to: 'COLORS.gray[300]' },
    { from: /'#bdbdbd'/gi, to: 'COLORS.gray[400]' },
  ];

  colorReplacements.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  });

  // 3. Adicionar import de BORDER_WIDTH se necessário
  if (modified && content.includes('BORDER_WIDTH.base')) {
    const importRegex = /from ['"]@presentation\/theme\/designTokens['"]/;
    const importMatch = content.match(importRegex);
    
    if (importMatch) {
      const importLine = content.match(/import\s*{[^}]+}\s*from\s*['"]@presentation\/theme\/designTokens['"]/);
      if (importLine && !importLine[0].includes('BORDER_WIDTH')) {
        const newImport = importLine[0].replace(
          /}\s*from/,
          ', BORDER_WIDTH } from'
        );
        content = content.replace(importLine[0], newImport);
        console.log(`✅ ${filePath}: Adicionado import BORDER_WIDTH`);
      }
    }
  }

  // 4. Substituir rgba com baixa opacidade
  const lowOpacityRegex = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*0\.[1-3]\)/g;
  if (lowOpacityRegex.test(content)) {
    content = content.replace(lowOpacityRegex, (match, r, g, b, opacity) => {
      return `rgba(${r}, ${g}, ${b}, 0.5)`; // Aumenta opacidade mínima para 0.5
    });
    modified = true;
    console.log(`✅ ${filePath}: Corrigido opacidades baixas`);
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`💾 ${filePath}: Arquivo salvo com correções\n`);
  } else {
    console.log(`ℹ️  ${filePath}: Nenhuma correção necessária\n`);
  }
}

console.log('🔧 Iniciando correções de acessibilidade...\n');

filesToFix.forEach(fixFile);

console.log('✨ Correções concluídas!');
