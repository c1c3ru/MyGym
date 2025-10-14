#!/usr/bin/env node

/**
 * Script para corrigir navegação usando getString() para nomes de rotas corretos
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class NavigationFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalReplacements = 0;
    this.errors = [];
    
    // Mapeamento de strings i18n para nomes de rotas corretos
    this.routeMapping = {
      // Admin routes
      'addStudent': 'AddStudent',
      'editStudent': 'EditStudent',
      'studentDetails': 'StudentDetails',
      'adminStudents': 'AdminStudents',
      'adminClasses': 'AdminClasses',
      'adminModalities': 'AdminModalities',
      'reports': 'Reports',
      
      // Shared routes
      'profile': 'Profile',
      'settings': 'Settings',
      'classDetailsScreen': 'ClassDetails',
      'studentProfileScreen': 'StudentProfile',
      'addGraduationScreen': 'AddGraduation',
      'graduationBoard': 'GraduationBoard',
      'studentPayments': 'StudentPayments',
      'physicalEvaluation': 'PhysicalEvaluation',
      'injury': 'Injury',
      'scheduleExam': 'ScheduleExam',
      
      // Auth routes
      'login': 'Login',
      'register': 'Register',
      'forgotPassword': 'ForgotPassword',
      'changePassword': 'ChangePassword',
      'privacyPolicy': 'PrivacyPolicy',
      
      // Instructor routes
      'instructorDashboard': 'InstructorDashboard',
      'instructorClasses': 'InstructorClasses',
      'instructorStudents': 'InstructorStudents',
      'checkIn': 'CheckIn',
      'scheduleClasses': 'ScheduleClasses',
    };
  }

  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let replacements = 0;
      
      // Padrão: navigation.navigate(getString('routeName'))
      const navigationPattern = /navigation\.navigate\(getString\('([^']+)'\)/g;
      
      content = content.replace(navigationPattern, (match, routeKey) => {
        const correctRoute = this.routeMapping[routeKey];
        if (correctRoute) {
          replacements++;
          console.log(`  📍 ${routeKey} → ${correctRoute}`);
          return `navigation.navigate('${correctRoute}')`;
        } else {
          console.log(`  ⚠️  Rota não mapeada: ${routeKey}`);
          return match; // Manter original se não encontrar mapeamento
        }
      });
      
      // Padrão com parâmetros: navigation.navigate(getString('routeName'), params)
      const navigationWithParamsPattern = /navigation\.navigate\(getString\('([^']+)'\),\s*([^)]+)\)/g;
      
      content = content.replace(navigationWithParamsPattern, (match, routeKey, params) => {
        const correctRoute = this.routeMapping[routeKey];
        if (correctRoute) {
          replacements++;
          console.log(`  📍 ${routeKey} → ${correctRoute} (com parâmetros)`);
          return `navigation.navigate('${correctRoute}', ${params})`;
        } else {
          console.log(`  ⚠️  Rota não mapeada: ${routeKey}`);
          return match;
        }
      });
      
      if (replacements > 0) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${filePath}: ${replacements} rotas corrigidas`);
        this.fixedFiles++;
        this.totalReplacements += replacements;
      }
      
    } catch (error) {
      console.error(`❌ Erro em ${filePath}: ${error.message}`);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  async findAndFixFiles() {
    console.log('🧭 Procurando arquivos com navegação usando getString...\n');
    
    try {
      // Encontrar todos os arquivos com navigation.navigate(getString
      const result = execSync(
        `grep -r "navigation\\.navigate(getString" src --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" -l`,
        { encoding: 'utf8', cwd: process.cwd() }
      );
      
      const files = result.trim().split('\n').filter(f => f);
      
      console.log(`📁 Encontrados ${files.length} arquivos com navegação getString\n`);
      
      for (const file of files) {
        console.log(`\n🔧 Corrigindo: ${file}`);
        this.fixFile(file);
      }
      
    } catch (error) {
      console.log('ℹ️  Nenhum arquivo encontrado com navegação getString');
    }
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 RESUMO DA CORREÇÃO DE NAVEGAÇÃO');
    console.log('='.repeat(50));
    console.log(`✅ Arquivos corrigidos: ${this.fixedFiles}`);
    console.log(`🔄 Total de correções: ${this.totalReplacements}`);
    console.log(`❌ Erros encontrados: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Arquivos com erro:');
      this.errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }
    
    console.log('\n🎯 Próximos passos:');
    console.log('1. Verificar se o app compila: npx expo start --clear');
    console.log('2. Testar navegação entre telas');
    console.log('3. Adicionar rotas faltantes se necessário');
    
    console.log('\n📋 Rotas mapeadas:');
    Object.entries(this.routeMapping).forEach(([key, value]) => {
      console.log(`   ${key} → ${value}`);
    });
  }
}

// Executar correção
if (require.main === module) {
  const fixer = new NavigationFixer();
  fixer.findAndFixFiles().catch(console.error);
}

module.exports = NavigationFixer;
