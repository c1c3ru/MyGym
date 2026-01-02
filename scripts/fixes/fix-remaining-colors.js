#!/usr/bin/env node

/**
 * Script para eliminar as 561 cores hardcoded restantes
 * Foca nos arquivos que ainda não foram processados
 */

const fs = require('fs');
const path = require('path');

// Mapeamento específico para as cores restantes detectadas
const REMAINING_COLOR_MAPPINGS = {
  // === CORES ESPECÍFICAS DETECTADAS ===
  '#333': 'currentTheme.gray[700]',
  '#333333': 'currentTheme.gray[700]',
  '#666': 'currentTheme.gray[600]',
  '#666666': 'currentTheme.gray[600]',
  '#FFB74D': 'currentTheme.warning[400]',
  '#ffb74d': 'currentTheme.warning[400]',
  '#FF231F7C': 'currentTheme.error[500]',
  '#ff231f7c': 'currentTheme.error[500]',
  
  // Bootstrap colors
  '#007bff': 'currentTheme.info[500]',
  '#007BFF': 'currentTheme.info[500]',
  '#6c757d': 'currentTheme.gray[600]',
  '#6C757D': 'currentTheme.gray[600]',
  
  // Cores específicas do projeto
  '#1565C0': 'currentTheme.info[800]',
  '#1565c0': 'currentTheme.info[800]',
  '#42A5F5': 'currentTheme.info[400]',
  '#42a5f5': 'currentTheme.info[400]',
  '#1E88E5': 'currentTheme.info[600]',
  '#1e88e5': 'currentTheme.info[600]',
  
  // RGBA específicas
  'rgba(33, 150, 243, 0.3)': 'currentTheme.info[500] + "4D"',
  'rgba(33,150,243,0.3)': 'currentTheme.info[500] + "4D"',
  'rgba(0, 0, 0, 0.06)': 'currentTheme.black + "0F"',
  'rgba(0, 0, 0, 0.07)': 'currentTheme.black + "12"',
  'rgba(0, 0, 0, 0.08)': 'currentTheme.black + "14"',
  'rgba(0, 0, 0, 0.12)': 'currentTheme.black + "1F"',
  
  // Propriedades específicas
  "backgroundColor: '#007bff'": 'backgroundColor: currentTheme.info[500]',
  'backgroundColor: "#007bff"': 'backgroundColor: currentTheme.info[500]',
  "backgroundColor: '#6c757d'": 'backgroundColor: currentTheme.gray[600]',
  'backgroundColor: "#6c757d"': 'backgroundColor: currentTheme.gray[600]',
  
  "color: '#333'": 'color: currentTheme.gray[700]',
  'color: "#333"': 'color: currentTheme.gray[700]',
  "color: '#666'": 'color: currentTheme.gray[600]',
  'color: "#666"': 'color: currentTheme.gray[600]',
  
  "borderColor: '#333'": 'borderColor: currentTheme.gray[700]',
  'borderColor: "#333"': 'borderColor: currentTheme.gray[700]',
};

function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let changes = 0;
    const appliedChanges = [];
    
    // Aplicar mapeamentos específicos
    Object.entries(REMAINING_COLOR_MAPPINGS).forEach(([oldColor, newColor]) => {
      const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = [...content.matchAll(regex)];
      
      if (matches.length > 0) {
        newContent = newContent.replace(regex, newColor);
        changes += matches.length;
        appliedChanges.push({
          from: oldColor,
          to: newColor,
          count: matches.length
        });
      }
    });
    
    if (changes > 0) {
      // Criar backup
      const backupPath = filePath + '.backup-final';
      fs.writeFileSync(backupPath, content);
      
      // Salvar arquivo corrigido
      fs.writeFileSync(filePath, newContent);
      
      return {
        success: true,
        changes,
        appliedChanges,
        backupCreated: backupPath
      };
    }
    
    return { success: true, changes: 0 };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function processAllFiles() {
  const results = [];
  
  // Lista específica de arquivos detectados com cores restantes
  const filesToProcess = [
    'src/infrastructure/services/emailService.js',
    'src/infrastructure/services/nodeMailerService.js', 
    'src/infrastructure/services/notificationService.js',
    'src/presentation/components/Button/Button.styles.js',
    'src/presentation/components/Card/Card.styles.js',
    'src/presentation/components/CustomInput.js',
    'src/presentation/components/DateTimePicker.js',
    'src/presentation/components/EnhancedErrorBoundary.js',
    'src/presentation/components/ErrorBoundary.tsx',
    'src/presentation/components/FloatingActionButton.js',
    'src/presentation/components/LoadingSpinner.js',
    'src/presentation/components/Modal/Modal.styles.js',
    'src/presentation/components/NotificationBell.js',
    'src/presentation/components/OfflineIndicator.js',
    'src/presentation/components/PerformanceMonitor.js',
    'src/presentation/components/ProgressIndicator.js',
    'src/presentation/components/ScheduleSelector.js',
    'src/presentation/components/SearchableDropdown.js',
    'src/presentation/components/SuccessAnimation.js',
    'src/presentation/components/TabBar.js',
    'src/presentation/components/Toast.js',
    'src/presentation/components/Tooltip.js',
    'src/presentation/components/skeletons/DashboardSkeleton.js',
    'src/presentation/components/skeletons/ReportsSkeleton.js',
    'src/presentation/screens/admin/EditClassScreen.js',
    'src/presentation/screens/admin/EditStudentScreen.js',
    'src/presentation/screens/admin/InviteManagement.js',
    'src/presentation/screens/auth/LoginScreen.js',
    'src/presentation/screens/auth/RegisterScreen.js',
    'src/presentation/screens/instructor/Relatorios.js',
    'src/presentation/screens/shared/CalendarScreen.js',
    'src/presentation/screens/shared/EnhancedCalendarScreen.js',
    'src/presentation/screens/shared/NotificationSettingsScreen.js',
    'src/presentation/screens/shared/TermsOfServiceScreen.js',
    'src/presentation/screens/student/StudentDashboard.js',
    'src/presentation/screens/student/StudentPayments.js',
    'src/shared/utils/dateUtils.js',
    'src/shared/utils/validationUtils.js',
  ];
  
  filesToProcess.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const result = fixFile(fullPath);
      if (result.changes > 0 || !result.success) {
        results.push({ file: filePath, ...result });
      }
    }
  });
  
  return results;
}

function main() {
  console.log('🎯 ELIMINADOR FINAL DE CORES HARDCODED - MyGym');
  console.log('=' .repeat(60));
  console.log('🔥 META: Eliminar as 561 cores restantes');
  console.log('📊 PROGRESSO ATUAL: 170/731 (23.3%)');
  console.log('🚀 OBJETIVO: Chegar a 500+ cores eliminadas');
  console.log('');
  
  const results = processAllFiles();
  
  if (results.length === 0) {
    console.log('✅ Nenhuma cor adicional encontrada nos arquivos específicos!');
    console.log('💡 Execute o detector novamente para ver o progresso:');
    console.log('   node scripts/find-hardcoded-colors.js');
    return;
  }
  
  let totalFiles = 0;
  let totalChanges = 0;
  
  console.log('📋 Correções finais aplicadas:\n');
  
  results.forEach(result => {
    if (result.success && result.changes > 0) {
      totalFiles++;
      totalChanges += result.changes;
      
      console.log(`✅ ${result.file}`);
      console.log(`   └─ ${result.changes} cores eliminadas`);
      
      result.appliedChanges.forEach(change => {
        console.log(`   ├─ ${change.from} → ${change.to} (${change.count}x)`);
      });
      console.log('');
    } else if (!result.success) {
      console.log(`❌ ${result.file}`);
      console.log(`   └─ Erro: ${result.error}`);
      console.log('');
    }
  });
  
  const newTotal = 170 + totalChanges;
  const percentage = ((newTotal / 731) * 100).toFixed(1);
  const remaining = 731 - newTotal;
  
  console.log('=' .repeat(60));
  console.log(`📊 PROGRESSO ATUALIZADO:`);
  console.log(`✅ Cores eliminadas nesta execução: ${totalChanges}`);
  console.log(`📈 Total de cores eliminadas: ${newTotal}/731 (${percentage}%)`);
  console.log(`📉 Cores ainda restantes: ${remaining}`);
  console.log(`📄 Arquivos processados: ${totalFiles}`);
  console.log('=' .repeat(60));
  
  if (newTotal >= 400) {
    console.log('\n🎉 EXCELENTE! Mais de 50% das cores eliminadas!');
  }
  
  if (remaining > 0) {
    console.log('\n🔍 Para eliminar as cores restantes:');
    console.log('1. Execute: node scripts/find-hardcoded-colors.js');
    console.log('2. Identifique os arquivos com mais cores');
    console.log('3. Corrija manualmente os arquivos de tema/constants');
    console.log('4. Foque nos arquivos com 50+ cores hardcoded');
  }
  
  console.log('\n🧪 TESTE OBRIGATÓRIO:');
  console.log('npx expo start --clear');
}

if (require.main === module) {
  main();
}

module.exports = { fixFile, REMAINING_COLOR_MAPPINGS };
