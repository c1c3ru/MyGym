#!/usr/bin/env node
/**
 * Script de Validação da Migração
 * Verifica se todos os critérios foram atendidos
 */

const { execSync } = require('child_process');
const fs = require('fs');

const checklist = [
  {
    "category": "Design Tokens",
    "items": [
      "Todos os valores de spacing usam SPACING.*",
      "Todos os valores de fontSize usam FONT_SIZE.*",
      "Todos os valores de fontWeight usam FONT_WEIGHT.*",
      "Todas as cores usam COLORS.*",
      "Todos os borderRadius usam BORDER_RADIUS.*",
      "Todas as elevations usam ELEVATION.*",
      "Imports corretos em todos os arquivos"
    ]
  },
  {
    "category": "Internacionalização",
    "items": [
      "Todas as strings visíveis usam getString()",
      "Chaves de tradução seguem padrão camelCase",
      "Traduções existem para pt, en, es",
      "Mensagens de erro internacionalizadas",
      "Placeholders e labels traduzidos",
      "Imports de getString() corretos"
    ]
  },
  {
    "category": "Qualidade",
    "items": [
      "ESLint passa sem erros",
      "Testes unitários passam",
      "Testes de integração passam",
      "App funciona em pt, en, es",
      "Tema claro/escuro funciona",
      "Performance mantida"
    ]
  }
];

async function validateMigration() {
  console.log('🔍 Validando migração...\n');
  
  let totalItems = 0;
  let passedItems = 0;
  
  for (const category of checklist) {
    console.log(`📋 ${category.category}:`);
    
    for (const item of category.items) {
      totalItems++;
      const passed = await validateItem(item);
      
      if (passed) {
        console.log(`   ✅ ${item}`);
        passedItems++;
      } else {
        console.log(`   ❌ ${item}`);
      }
    }
    console.log('');
  }
  
  const percentage = Math.round((passedItems / totalItems) * 100);
  console.log(`📊 Resultado: ${passedItems}/${totalItems} (${percentage}%)`);
  
  if (percentage === 100) {
    console.log('🎉 Migração 100% completa!');
    return true;
  } else {
    console.log('⚠️  Migração incompleta. Revise os itens falhando.');
    return false;
  }
}

async function validateItem(item) {
  // Implementar validações específicas
  try {
    switch (item) {
      case 'ESLint passa sem erros':
        execSync('npm run lint', { stdio: 'pipe' });
        return true;
      case 'Testes unitários passam':
        execSync('npm test', { stdio: 'pipe' });
        return true;
      default:
        // Validação manual necessária
        return false;
    }
  } catch (error) {
    return false;
  }
}

if (require.main === module) {
  validateMigration().catch(console.error);
}

module.exports = { validateMigration };
