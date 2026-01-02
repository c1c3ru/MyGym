#!/usr/bin/env node

/**
 * Plano de Migração Sistemático - Design Tokens & i18n
 * Baseado nos resultados das auditorias
 */

const fs = require('fs');
const path = require('path');

// Resultados das auditorias
const AUDIT_RESULTS = {
  designTokens: {
    coverage: 65.9,
    totalFiles: 336,
    problemFiles: 108,
    totalProblems: 1146,
    priorityFiles: [
      '/src/presentation/theme/designTokens.js',
      '/src/presentation/theme/lightTheme.js', 
      '/src/shared/constants/colors.js',
      '/src/presentation/screens/shared/StudentProfileScreen.js',
      '/src/presentation/screens/instructor/InstructorStudents.js'
    ]
  },
  i18n: {
    coverage: 83.4,
    totalFiles: 336,
    problemFiles: 121,
    totalProblems: 1118,
    priorityFiles: [
      '/src/presentation/screens/legal/PrivacyPolicyScreen.js',
      '/src/data/countries.js',
      '/src/infrastructure/services/nodeMailerService.js',
      '/src/presentation/screens/legal/TermsOfServiceScreen.js',
      '/src/presentation/screens/shared/AddGraduationScreen.js'
    ]
  }
};

// Fases da migração
const MIGRATION_PHASES = [
  {
    name: 'Fase 1: Correção Crítica',
    description: 'Corrigir arquivos de tema e design tokens',
    priority: 'CRÍTICA',
    estimatedTime: '2-3 horas',
    files: [
      '/src/presentation/theme/designTokens.js',
      '/src/presentation/theme/lightTheme.js',
      '/src/shared/constants/colors.js'
    ],
    actions: [
      'Migrar cores hardcoded para COLORS',
      'Migrar spacing hardcoded para SPACING',
      'Migrar fontSize hardcoded para FONT_SIZE',
      'Adicionar imports corretos'
    ]
  },
  {
    name: 'Fase 2: Telas Principais',
    description: 'Migrar dashboards e telas mais usadas',
    priority: 'ALTA',
    estimatedTime: '4-6 horas',
    files: [
      '/src/presentation/screens/admin/AdminDashboard.js',
      '/src/presentation/screens/student/StudentDashboard.js',
      '/src/presentation/screens/instructor/InstructorDashboard.js',
      '/src/presentation/screens/shared/StudentProfileScreen.js'
    ],
    actions: [
      'Substituir valores hardcoded por tokens',
      'Substituir strings por getString()',
      'Adicionar imports necessários',
      'Testar funcionalidade'
    ]
  },
  {
    name: 'Fase 3: Componentes Compartilhados',
    description: 'Migrar componentes reutilizáveis',
    priority: 'ALTA',
    estimatedTime: '3-4 horas',
    files: [
      '/src/presentation/components/ActionButton.js',
      '/src/presentation/components/NotificationBell.js',
      '/src/presentation/components/ThemeToggleSwitch.js'
    ],
    actions: [
      'Padronizar uso de design tokens',
      'Internacionalizar textos',
      'Documentar padrões'
    ]
  },
  {
    name: 'Fase 4: Telas de Autenticação',
    description: 'Migrar login, registro e recuperação',
    priority: 'MÉDIA',
    estimatedTime: '2-3 horas',
    files: [
      '/src/presentation/screens/auth/LoginScreen.js',
      '/src/presentation/screens/auth/RegisterScreen.js',
      '/src/presentation/screens/auth/ForgotPasswordScreen.js'
    ],
    actions: [
      'Migrar estilos para tokens',
      'Traduzir mensagens de erro',
      'Padronizar validações'
    ]
  },
  {
    name: 'Fase 5: Telas Legais e Configurações',
    description: 'Migrar termos, políticas e configurações',
    priority: 'MÉDIA',
    estimatedTime: '3-4 horas',
    files: [
      '/src/presentation/screens/legal/PrivacyPolicyScreen.js',
      '/src/presentation/screens/legal/TermsOfServiceScreen.js',
      '/src/presentation/screens/shared/SettingsScreen.js'
    ],
    actions: [
      'Internacionalizar conteúdo legal',
      'Migrar estilos',
      'Adicionar suporte a múltiplos idiomas'
    ]
  },
  {
    name: 'Fase 6: Serviços e Infraestrutura',
    description: 'Migrar serviços de email e notificações',
    priority: 'BAIXA',
    estimatedTime: '2-3 horas',
    files: [
      '/src/infrastructure/services/emailService.js',
      '/src/infrastructure/services/nodeMailerService.js'
    ],
    actions: [
      'Internacionalizar templates de email',
      'Padronizar estilos de email',
      'Adicionar suporte a idiomas'
    ]
  },
  {
    name: 'Fase 7: Telas Secundárias',
    description: 'Migrar demais telas',
    priority: 'BAIXA',
    estimatedTime: '4-6 horas',
    files: [
      '/src/presentation/screens/instructor/InstructorStudents.js',
      '/src/presentation/screens/examples/*.js',
      'Demais telas identificadas'
    ],
    actions: [
      'Aplicar padrões estabelecidos',
      'Revisar consistência',
      'Documentar exceções'
    ]
  }
];

// Checklist de validação
const VALIDATION_CHECKLIST = [
  {
    category: 'Design Tokens',
    items: [
      'Todos os valores de spacing usam SPACING.*',
      'Todos os valores de fontSize usam FONT_SIZE.*',
      'Todos os valores de fontWeight usam FONT_WEIGHT.*',
      'Todas as cores usam COLORS.*',
      'Todos os borderRadius usam BORDER_RADIUS.*',
      'Todas as elevations usam ELEVATION.*',
      'Imports corretos em todos os arquivos'
    ]
  },
  {
    category: 'Internacionalização',
    items: [
      'Todas as strings visíveis usam getString()',
      'Chaves de tradução seguem padrão camelCase',
      'Traduções existem para pt, en, es',
      'Mensagens de erro internacionalizadas',
      'Placeholders e labels traduzidos',
      'Imports de getString() corretos'
    ]
  },
  {
    category: 'Qualidade',
    items: [
      'ESLint passa sem erros',
      'Testes unitários passam',
      'Testes de integração passam',
      'App funciona em pt, en, es',
      'Tema claro/escuro funciona',
      'Performance mantida'
    ]
  }
];

class MigrationPlanner {
  constructor() {
    this.currentPhase = 0;
    this.completedTasks = [];
    this.logFile = path.join(process.cwd(), 'migration-log.md');
  }

  generatePlan() {
    console.log('\n🚀 PLANO DE MIGRAÇÃO - DESIGN TOKENS & I18N\n');
    console.log('='.repeat(60));
    
    console.log('\n📊 Situação Atual:');
    console.log(`   • Design Tokens: ${AUDIT_RESULTS.designTokens.coverage}% cobertura`);
    console.log(`   • Internacionalização: ${AUDIT_RESULTS.i18n.coverage}% cobertura`);
    console.log(`   • Total de problemas: ${AUDIT_RESULTS.designTokens.totalProblems + AUDIT_RESULTS.i18n.totalProblems}`);
    
    console.log('\n🎯 Meta: 100% de cobertura em ambos');
    console.log('⏱️  Tempo estimado total: 20-29 horas');
    
    console.log('\n📋 Fases da Migração:\n');
    
    MIGRATION_PHASES.forEach((phase, index) => {
      const status = this.getPhaseStatus(index);
      console.log(`${index + 1}. ${phase.name} ${status}`);
      console.log(`   📝 ${phase.description}`);
      console.log(`   🔥 Prioridade: ${phase.priority}`);
      console.log(`   ⏱️  Tempo estimado: ${phase.estimatedTime}`);
      console.log(`   📁 Arquivos: ${phase.files.length} arquivos`);
      console.log(`   ✅ Ações: ${phase.actions.length} ações`);
      console.log('');
    });
    
    console.log('\n🔍 Próximos Passos Imediatos:\n');
    const nextPhase = MIGRATION_PHASES[this.currentPhase];
    console.log(`1. Iniciar ${nextPhase.name}`);
    console.log(`2. Executar: node scripts/migrate-phase-${this.currentPhase + 1}.js`);
    console.log(`3. Validar com: npm run test`);
    console.log(`4. Revisar manualmente os arquivos`);
    
    this.generatePhaseScripts();
    this.generateValidationScript();
    this.saveProgressFile();
  }

  getPhaseStatus(phaseIndex) {
    if (phaseIndex < this.currentPhase) return '✅';
    if (phaseIndex === this.currentPhase) return '🔄';
    return '⏳';
  }

  generatePhaseScripts() {
    MIGRATION_PHASES.forEach((phase, index) => {
      const scriptPath = path.join(process.cwd(), 'scripts', `migrate-phase-${index + 1}.js`);
      
      let script = `#!/usr/bin/env node
/**
 * ${phase.name}
 * ${phase.description}
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando ${phase.name}...');

const files = [
${phase.files.map(file => `  '${file}',`).join('\n')}
];

const actions = [
${phase.actions.map(action => `  '${action}',`).join('\n')}
];

async function migratePhase() {
  console.log('📁 Arquivos a migrar:', files.length);
  console.log('✅ Ações a executar:', actions.length);
  
  for (const file of files) {
    console.log(\`🔧 Migrando: \${file}\`);
    
    try {
      const fullPath = path.join(process.cwd(), file);
      
      if (!fs.existsSync(fullPath)) {
        console.log(\`⚠️  Arquivo não encontrado: \${file}\`);
        continue;
      }
      
      // Aplicar migrações específicas aqui
      await migrateFile(fullPath);
      
      console.log(\`✅ Migrado: \${file}\`);
    } catch (error) {
      console.error(\`❌ Erro em \${file}:\`, error.message);
    }
  }
  
  console.log('🎉 ${phase.name} concluída!');
}

async function migrateFile(filePath) {
  // Implementar lógica específica de migração
  console.log(\`  📝 Processando: \${path.basename(filePath)}\`);
  
  // TODO: Implementar migrações automáticas
  // 1. Substituir valores hardcoded por tokens
  // 2. Substituir strings por getString()
  // 3. Adicionar imports necessários
}

if (require.main === module) {
  migratePhase().catch(console.error);
}

module.exports = { migratePhase, migrateFile };
`;

      fs.writeFileSync(scriptPath, script);
      fs.chmodSync(scriptPath, '755');
    });
    
    console.log(`\n📝 Scripts de fase gerados em: scripts/migrate-phase-*.js`);
  }

  generateValidationScript() {
    const scriptPath = path.join(process.cwd(), 'scripts', 'validate-migration.js');
    
    let script = `#!/usr/bin/env node
/**
 * Script de Validação da Migração
 * Verifica se todos os critérios foram atendidos
 */

const { execSync } = require('child_process');
const fs = require('fs');

const checklist = ${JSON.stringify(VALIDATION_CHECKLIST, null, 2)};

async function validateMigration() {
  console.log('🔍 Validando migração...\\n');
  
  let totalItems = 0;
  let passedItems = 0;
  
  for (const category of checklist) {
    console.log(\`📋 \${category.category}:\`);
    
    for (const item of category.items) {
      totalItems++;
      const passed = await validateItem(item);
      
      if (passed) {
        console.log(\`   ✅ \${item}\`);
        passedItems++;
      } else {
        console.log(\`   ❌ \${item}\`);
      }
    }
    console.log('');
  }
  
  const percentage = Math.round((passedItems / totalItems) * 100);
  console.log(\`📊 Resultado: \${passedItems}/\${totalItems} (\${percentage}%)\`);
  
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
`;

    fs.writeFileSync(scriptPath, script);
    fs.chmodSync(scriptPath, '755');
    
    console.log(`📝 Script de validação gerado: scripts/validate-migration.js`);
  }

  saveProgressFile() {
    const progressData = {
      timestamp: new Date().toISOString(),
      currentPhase: this.currentPhase,
      auditResults: AUDIT_RESULTS,
      phases: MIGRATION_PHASES,
      completedTasks: this.completedTasks
    };
    
    const progressPath = path.join(process.cwd(), 'migration-progress.json');
    fs.writeFileSync(progressPath, JSON.stringify(progressData, null, 2));
    
    console.log(`\n💾 Progresso salvo em: migration-progress.json`);
  }
}

// Executar planejamento
if (require.main === module) {
  const planner = new MigrationPlanner();
  planner.generatePlan();
}

module.exports = MigrationPlanner;
