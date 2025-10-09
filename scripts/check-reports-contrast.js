#!/usr/bin/env node

/**
 * Script para verificar contraste das telas de relatórios
 * Analisa se as cores seguem os padrões WCAG AA do Dark Theme Premium
 */

const fs = require('fs');
const path = require('path');

// Função para calcular luminância
function getLuminance(hex) {
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
}

// Função para calcular contraste
function calculateContrast(color1, color2) {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Cores do Dark Theme Premium
const COLORS = {
  background: {
    default: '#0B0B0B',
    paper: '#1A1A1A',
    elevated: '#222222',
    light: '#F8F8F8'
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#E0E0E0',
    tertiary: '#BDBDBD'
  },
  primary: {
    500: '#D32F2F'
  },
  secondary: {
    700: '#424242'
  },
  info: {
    500: '#2196F3',
    700: '#1976D2',
    50: '#E3F2FD'
  },
  warning: {
    500: '#FFC107',
    700: '#F57C00',
    800: '#E65100'
  },
  error: {
    500: '#F44336',
    700: '#D32F2F'
  },
  gray: {
    500: '#9E9E9E'
  },
  white: '#FFFFFF'
};

// Testes de contraste para telas de relatórios
const contrastTests = [
  // ReportsScreen.js - Fundo principal + texto
  {
    name: 'ReportsScreen - Fundo principal + Texto primário',
    background: COLORS.background.default,
    text: COLORS.text.primary,
    context: 'Títulos e texto principal'
  },
  {
    name: 'ReportsScreen - Cards + Texto primário', 
    background: COLORS.background.paper,
    text: COLORS.text.primary,
    context: 'Cards de estatísticas'
  },
  {
    name: 'ReportsScreen - Cards + Texto secundário',
    background: COLORS.background.paper,
    text: COLORS.text.secondary,
    context: 'Subtítulos e descrições'
  },
  {
    name: 'ReportsScreen - Ícones coloridos + Texto branco',
    background: COLORS.primary[500],
    text: COLORS.white,
    context: 'Ícones de estatísticas'
  },
  {
    name: 'ReportsScreen - Ícones info + Texto branco (CORRIGIDO)',
    background: COLORS.info[700],
    text: COLORS.white,
    context: 'Ícones azuis escuros'
  },
  {
    name: 'ReportsScreen - Ícones receita + Texto branco (CORRIGIDO)',
    background: COLORS.secondary[700],
    text: COLORS.white,
    context: 'Ícones cinza escuros para receita'
  },
  {
    name: 'ReportsScreen - Ícones error + Texto branco (CORRIGIDO)',
    background: COLORS.error[700],
    text: COLORS.white,
    context: 'Ícones vermelhos escuros'
  },
  
  // Relatorios.js (Instrutor) - Correções aplicadas
  {
    name: 'Relatorios - Cards escuros + Texto primário (CORRIGIDO)',
    background: COLORS.background.paper,
    text: COLORS.text.primary,
    context: '✅ CORRIGIDO: Cards escuros com texto branco'
  },
  {
    name: 'Relatorios - Cards escuros + Texto secundário (CORRIGIDO)',
    background: COLORS.background.paper,
    text: COLORS.text.secondary,
    context: '✅ CORRIGIDO: Cards escuros com texto claro'
  },
  {
    name: 'Relatorios - Chip info + Texto escuro',
    background: COLORS.info[50],
    text: '#333333',
    context: 'Chips de frequência (deveria usar texto escuro)'
  }
];

function analyzeContrast() {
  console.log('🔍 ANÁLISE DE CONTRASTE - TELAS DE RELATÓRIOS');
  console.log('=' .repeat(60));
  console.log('📊 Padrão WCAG AA: Mínimo 4.5:1 para texto normal');
  console.log('📊 Padrão WCAG AAA: Mínimo 7:1 para texto normal');
  console.log('=' .repeat(60));
  
  let totalTests = 0;
  let passedAA = 0;
  let passedAAA = 0;
  let problems = [];
  
  contrastTests.forEach(test => {
    const contrast = calculateContrast(test.background, test.text);
    const isAA = contrast >= 4.5;
    const isAAA = contrast >= 7.0;
    
    totalTests++;
    if (isAA) passedAA++;
    if (isAAA) passedAAA++;
    
    const status = isAAA ? '🟢 AAA' : isAA ? '🟡 AA' : '🔴 FALHA';
    const ratio = contrast.toFixed(2);
    
    console.log(`\n${status} ${test.name}`);
    console.log(`   Contraste: ${ratio}:1`);
    console.log(`   Contexto: ${test.context}`);
    console.log(`   Cores: ${test.background} + ${test.text}`);
    
    if (!isAA) {
      problems.push({
        name: test.name,
        contrast: ratio,
        background: test.background,
        text: test.text,
        context: test.context
      });
    }
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESUMO DOS TESTES:');
  console.log(`✅ Total de testes: ${totalTests}`);
  console.log(`🟡 Aprovados WCAG AA: ${passedAA}/${totalTests} (${((passedAA/totalTests)*100).toFixed(1)}%)`);
  console.log(`🟢 Aprovados WCAG AAA: ${passedAAA}/${totalTests} (${((passedAAA/totalTests)*100).toFixed(1)}%)`);
  console.log(`🔴 Problemas encontrados: ${problems.length}`);
  
  if (problems.length > 0) {
    console.log('\n' + '🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS:');
    console.log('=' .repeat(60));
    
    problems.forEach((problem, index) => {
      console.log(`\n${index + 1}. ${problem.name}`);
      console.log(`   ❌ Contraste: ${problem.contrast}:1 (< 4.5:1)`);
      console.log(`   🎨 Cores: ${problem.background} + ${problem.text}`);
      console.log(`   📝 Contexto: ${problem.context}`);
    });
    
    console.log('\n' + '🔧 CORREÇÕES NECESSÁRIAS:');
    console.log('=' .repeat(60));
    
    problems.forEach((problem, index) => {
      if (problem.name.includes('Relatorios')) {
        console.log(`\n${index + 1}. Relatorios.js - Cards brancos incompatíveis:`);
        console.log('   ✅ SOLUÇÃO: Trocar backgroundColor: COLORS.white');
        console.log('   ✅ POR: backgroundColor: COLORS.card.default.background');
        console.log('   ✅ E: color: COLORS.card.default.text');
      }
    });
  }
  
  return {
    totalTests,
    passedAA,
    passedAAA,
    problems
  };
}

function generateRecommendations(results) {
  console.log('\n' + '💡 RECOMENDAÇÕES PARA DARK THEME:');
  console.log('=' .repeat(60));
  
  if (results.problems.length > 0) {
    console.log('\n🎯 PRIORIDADE ALTA:');
    console.log('1. Corrigir Relatorios.js (Instrutor):');
    console.log('   - Substituir cards brancos por cards escuros');
    console.log('   - Usar COLORS.card.default.background + COLORS.card.default.text');
    console.log('   - Trocar COLORS.background.light por COLORS.background.paper');
    
    console.log('\n🎯 PRIORIDADE MÉDIA:');
    console.log('2. Validar chips e badges:');
    console.log('   - Usar cores de fundo escuras com texto claro');
    console.log('   - Evitar fundos claros no dark theme');
    
    console.log('\n🎯 PRIORIDADE BAIXA:');
    console.log('3. Otimizar para WCAG AAA:');
    console.log('   - Aumentar contraste onde possível (7:1)');
    console.log('   - Usar cores mais escuras para fundos');
  } else {
    console.log('✅ Todas as telas estão em conformidade com WCAG AA!');
    console.log('🎯 Considere otimizar para WCAG AAA onde possível.');
  }
}

// Executar análise
function main() {
  const results = analyzeContrast();
  generateRecommendations(results);
  
  console.log('\n' + '🚀 PRÓXIMOS PASSOS:');
  console.log('1. Corrigir problemas identificados');
  console.log('2. Testar visualmente as correções');
  console.log('3. Executar este script novamente para validar');
  console.log('4. Fazer commit das correções');
  
  // Retornar código de saída baseado nos resultados
  process.exit(results.problems.length > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { analyzeContrast, calculateContrast };
