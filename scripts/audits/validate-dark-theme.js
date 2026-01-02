#!/usr/bin/env node

/**
 * Script para validar se o Dark Theme Premium está implementado corretamente
 * Verifica contraste, cores e consistência dos design tokens
 */

const fs = require('fs');
const path = require('path');

// Cores do tema escuro para validação
const EXPECTED_DARK_COLORS = {
  'background.default': '#0B0B0B',
  'background.paper': '#1A1A1A',
  'background.elevated': '#222222',
  'text.primary': '#FFFFFF',
  'text.secondary': '#E0E0E0',
  'primary.500': '#D32F2F',
  'card.default.background': '#1A1A1A',
  'card.elevated.background': '#222222',
};

// Função para calcular contraste
function calculateContrast(color1, color2) {
  // Simplificada - em produção usaria uma lib como chroma-js
  const getLuminance = (hex) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    
    const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Função para validar arquivo de design tokens
function validateDesignTokens() {
  console.log('🎨 Validando Design Tokens...\n');
  
  const tokensPath = path.join(__dirname, '../src/presentation/theme/designTokens.js');
  
  if (!fs.existsSync(tokensPath)) {
    console.error('❌ Arquivo designTokens.js não encontrado!');
    return false;
  }
  
  const tokensContent = fs.readFileSync(tokensPath, 'utf8');
  
  let allValid = true;
  
  // Verificar se as cores esperadas estão presentes
  console.log('📋 Verificando cores do tema escuro:');
  for (const [colorPath, expectedValue] of Object.entries(EXPECTED_DARK_COLORS)) {
    if (tokensContent.includes(expectedValue)) {
      console.log(`✅ ${colorPath}: ${expectedValue}`);
    } else {
      console.log(`❌ ${colorPath}: Não encontrado ou valor incorreto`);
      allValid = false;
    }
  }
  
  // Verificar estruturas importantes
  console.log('\n📋 Verificando estruturas:');
  const requiredStructures = [
    'background:',
    'text:',
    'border:',
    'card:',
    'gradients:',
    'button:',
  ];
  
  for (const structure of requiredStructures) {
    if (tokensContent.includes(structure)) {
      console.log(`✅ Estrutura ${structure} presente`);
    } else {
      console.log(`❌ Estrutura ${structure} ausente`);
      allValid = false;
    }
  }
  
  return allValid;
}

// Função para validar contraste WCAG
function validateContrast() {
  console.log('\n🔍 Validando Contraste WCAG AA:');
  
  const contrastTests = [
    { bg: '#0B0B0B', text: '#FFFFFF', name: 'Fundo principal + Texto primário' },
    { bg: '#1A1A1A', text: '#E0E0E0', name: 'Card + Texto secundário' },
    { bg: '#222222', text: '#FFFFFF', name: 'Card elevado + Texto primário' },
    { bg: '#D32F2F', text: '#FFFFFF', name: 'Botão primário + Texto' },
  ];
  
  let allValid = true;
  
  for (const test of contrastTests) {
    const contrast = calculateContrast(test.bg, test.text);
    const isValid = contrast >= 4.5; // WCAG AA normal text
    
    console.log(
      `${isValid ? '✅' : '❌'} ${test.name}: ${contrast.toFixed(2)}:1 ${
        isValid ? '(WCAG AA ✓)' : '(WCAG AA ✗)'
      }`
    );
    
    if (!isValid) allValid = false;
  }
  
  return allValid;
}

// Função para verificar arquivos que usam design tokens
function validateUsage() {
  console.log('\n📁 Verificando uso dos Design Tokens:');
  
  const screensDir = path.join(__dirname, '../src/presentation/screens');
  const componentsDir = path.join(__dirname, '../src/presentation/components');
  
  let filesWithTokens = 0;
  let filesWithHardcoded = 0;
  
  function scanDirectory(dir, dirName) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { recursive: true });
    const jsFiles = files.filter(file => 
      (file.endsWith('.js') || file.endsWith('.jsx')) && 
      !file.includes('test') && 
      !file.includes('.backup')
    );
    
    for (const file of jsFiles) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isFile()) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        const hasTokens = content.includes('COLORS.') || content.includes('SPACING.');
        const hasHardcoded = /#[0-9A-Fa-f]{3,6}/.test(content) || 
                           /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/.test(content);
        
        if (hasTokens) filesWithTokens++;
        if (hasHardcoded) filesWithHardcoded++;
      }
    }
    
    console.log(`📂 ${dirName}: ${jsFiles.length} arquivos JS encontrados`);
  }
  
  scanDirectory(screensDir, 'Screens');
  scanDirectory(componentsDir, 'Components');
  
  console.log(`✅ Arquivos usando Design Tokens: ${filesWithTokens}`);
  console.log(`${filesWithHardcoded > 0 ? '⚠️' : '✅'} Arquivos com cores hardcoded: ${filesWithHardcoded}`);
  
  return filesWithHardcoded === 0;
}

// Função para gerar relatório
function generateReport(tokensValid, contrastValid, usageValid) {
  console.log('\n' + '='.repeat(50));
  console.log('📊 RELATÓRIO FINAL - DARK THEME PREMIUM');
  console.log('='.repeat(50));
  
  console.log(`🎨 Design Tokens: ${tokensValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
  console.log(`🔍 Contraste WCAG: ${contrastValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
  console.log(`📁 Uso Consistente: ${usageValid ? '✅ VÁLIDO' : '⚠️ MELHORAR'}`);
  
  const overallValid = tokensValid && contrastValid;
  
  console.log('\n' + '-'.repeat(50));
  console.log(`🏆 RESULTADO GERAL: ${overallValid ? '✅ APROVADO' : '❌ REPROVADO'}`);
  console.log('-'.repeat(50));
  
  if (overallValid) {
    console.log('\n🎉 Parabéns! O Dark Theme Premium está implementado corretamente!');
    console.log('\n📱 Próximos passos:');
    console.log('1. Teste o app: npx expo start --clear');
    console.log('2. Verifique visualmente as telas principais');
    console.log('3. Teste em diferentes dispositivos');
    console.log('4. Colete feedback dos usuários');
  } else {
    console.log('\n🔧 Correções necessárias:');
    if (!tokensValid) console.log('- Verificar implementação dos design tokens');
    if (!contrastValid) console.log('- Ajustar cores para melhor contraste');
    if (!usageValid) console.log('- Migrar valores hardcoded para design tokens');
  }
  
  return overallValid;
}

// Função principal
function main() {
  console.log('🌙 VALIDADOR DO DARK THEME PREMIUM - MyGym');
  console.log('=' .repeat(50) + '\n');
  
  const tokensValid = validateDesignTokens();
  const contrastValid = validateContrast();
  const usageValid = validateUsage();
  
  const success = generateReport(tokensValid, contrastValid, usageValid);
  
  process.exit(success ? 0 : 1);
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  validateDesignTokens,
  validateContrast,
  validateUsage,
  generateReport,
};
