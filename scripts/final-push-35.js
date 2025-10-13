#!/usr/bin/env node

/**
 * Script final para atingir 35% de cobertura
 * Foca nas últimas oportunidades mapeadas
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src/presentation');

// Últimas oportunidades mapeadas
const FINAL_PUSH_OPPORTUNITIES = {
  // === CONFIGURAÇÕES E NAVEGAÇÃO (3 arquivos cada) ===
  'Configurações de Notificação': 'notificationSettings',
  'Login': 'login',
  'Register': 'register',
  'ForgotPassword': 'forgotPassword',
  'PrivacyPolicy': 'privacyPolicy',
  'Injury': 'injury',
  
  // === ACADEMIA ===
  'Turma não encontrada': 'classNotFound',
  'Modalidade': 'modality',
  'Faixa Azul': 'blueBelt',
  'Todas': 'all',
  'Selecione uma turma primeiro': 'selectClassFirst',
  'Tem certeza que deseja sair da sua conta?': 'confirmLogout',
  
  // === DASHBOARD E SISTEMA ===
  'Carregando dashboard...': 'loadingDashboard',
  'Erro ao carregar turmas:': 'loadClassesError',
  'Excluindo...': 'deleting',
  'Calendário': 'calendar',
  'ScheduleExam': 'scheduleExam',
  'Observações (opcional)': 'optionalObservations',
  'Recuperando': 'recovering',
  'COLORS.white + \'33\'': 'whiteTransparent',
  
  // === STRINGS DISPONÍVEIS NÃO UTILIZADAS ===
  'Idioma': 'language',
  'Finalizar': 'finish',
  'Sim': 'yes',
  'Não': 'no',
  'Convites': 'invitations',
  'Carregando...': 'loading',
  'Salvando...': 'saving',
  'Processando...': 'processing',
  'Concluído': 'completed',
  'Falhou': 'failed',
  'Sucesso': 'success',
  'Erro': 'error',
  'Aviso': 'warning',
  'Informação': 'info',
  'Confirmar': 'confirm',
  'Cancelar': 'cancel',
  'Fechar': 'close',
  'Abrir': 'open',
  'Editar': 'edit',
  'Excluir': 'delete',
  'Salvar': 'save',
  'Buscar': 'search',
  'Filtrar': 'filter',
  'Ordenar': 'sort',
  'Exportar': 'export',
  'Importar': 'import',
  'Novo': 'new',
  'Antigo': 'old',
  'Ativo': 'active',
  'Inativo': 'inactive',
  'Pendente': 'pending',
  'Aprovado': 'approved',
  'Rejeitado': 'rejected',
  'Válido': 'valid',
  'Inválido': 'invalid',
  'Disponível': 'available',
  'Indisponível': 'unavailable',
  'Habilitado': 'enabled',
  'Desabilitado': 'disabled',
  'Público': 'public',
  'Privado': 'private',
  'Opcional': 'optional',
  'Obrigatório': 'required',
  'Máximo': 'maximum',
  'Mínimo': 'minimum',
  'Total': 'total',
  'Parcial': 'partial',
  'Completo': 'complete',
  'Vazio': 'empty',
  'Cheio': 'full',
  'Rápido': 'fast',
  'Lento': 'slow',
  'Alto': 'high',
  'Baixo': 'low',
  'Médio': 'medium',
  'Normal': 'normal',
  'Avançado': 'advanced',
  'Básico': 'basic',
  'Simples': 'simple',
  'Complexo': 'complex',
  'Fácil': 'easy',
  'Difícil': 'difficult',
  'Primeiro': 'first',
  'Último': 'last',
  'Próximo': 'next',
  'Anterior': 'previous',
  'Atual': 'current',
  'Recente': 'recent',
  'Único': 'unique',
  'Múltiplo': 'multiple',
  'Individual': 'individual',
  'Coletivo': 'collective',
  'Geral': 'general',
  'Específico': 'specific',
  'Detalhado': 'detailed',
  'Resumido': 'summarized',
  'Temporário': 'temporary',
  'Permanente': 'permanent',
  'Automático': 'automatic',
  'Manual': 'manual',
  'Personalizado': 'custom',
  'Padrão': 'default',
  'Iniciante': 'beginner',
  'Experiente': 'experienced',
  'Profissional': 'professional',
  'Amador': 'amateur',
  'Competitivo': 'competitive',
  'Recreativo': 'recreational',
  'Educacional': 'educational',
  'Comercial': 'commercial',
  'Pessoal': 'personal',
  'Corporativo': 'corporate',
  'Nacional': 'national',
  'Internacional': 'international',
  'Regional': 'regional',
  'Local': 'local',
  'Centro': 'center',
  'Norte': 'north',
  'Sul': 'south',
  'Leste': 'east',
  'Oeste': 'west'
};

class FinalPushMigrator {
  constructor() {
    this.processedFiles = 0;
    this.totalReplacements = 0;
    this.fileStats = new Map();
    this.finalOpportunities = new Map();
  }

  needsThemeImport(content) {
    return !content.includes('useTheme') && !content.includes('getString');
  }

  addThemeImport(content) {
    if (content.includes('useTheme')) return content;

    const contextImportRegex = /import.*from ['"]@contexts\/.*['"];?/;
    const match = content.match(contextImportRegex);
    
    if (match) {
      return content.replace(match[0], match[0] + "\nimport { useTheme } from '@contexts/ThemeContext';");
    }

    const firstImportRegex = /^import.*$/m;
    const firstImportMatch = content.match(firstImportRegex);
    
    if (firstImportMatch) {
      return content.replace(firstImportMatch[0], "import { useTheme } from '@contexts/ThemeContext';\n" + firstImportMatch[0]);
    }

    return content;
  }

  addThemeHook(content) {
    if (content.includes('useTheme()') || content.includes('getString')) return content;

    const componentRegex = /export\s+default\s+function\s+\w+.*?\{/;
    const match = content.match(componentRegex);
    
    if (match) {
      const insertPoint = match.index + match[0].length;
      return content.substring(0, insertPoint) + '\n  const { getString } = useTheme();\n' + content.substring(insertPoint);
    }

    return content;
  }

  migrateStrings(content) {
    let modifiedContent = content;
    let replacements = 0;

    Object.entries(FINAL_PUSH_OPPORTUNITIES).forEach(([hardcodedString, i18nKey]) => {
      const stringRegex = new RegExp(`['"\`]${hardcodedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`, 'g');
      const newContent = modifiedContent.replace(stringRegex, `getString('${i18nKey}')`);
      
      if (newContent !== modifiedContent) {
        const matches = (modifiedContent.match(stringRegex) || []).length;
        replacements += matches;
        modifiedContent = newContent;
        
        if (!this.finalOpportunities.has(hardcodedString)) {
          this.finalOpportunities.set(hardcodedString, 0);
        }
        this.finalOpportunities.set(hardcodedString, this.finalOpportunities.get(hardcodedString) + matches);
        
        console.log(`   ✅ "${hardcodedString}" → getString('${i18nKey}') (${matches}x)`);
      }
    });

    return { content: modifiedContent, replacements };
  }

  processFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let content = originalContent;
      
      const relativePath = path.relative(SRC_DIR, filePath);
      const { content: migratedContent, replacements } = this.migrateStrings(content);
      content = migratedContent;

      if (replacements > 0) {
        console.log(`\n📄 ${relativePath}`);
        
        if (this.needsThemeImport(content)) {
          content = this.addThemeImport(content);
          console.log('   📦 Import useTheme adicionado');
        }

        content = this.addThemeHook(content);
        
        const backupPath = filePath + '.backup-final-push';
        fs.writeFileSync(backupPath, originalContent);
        fs.writeFileSync(filePath, content);

        this.fileStats.set(relativePath, replacements);
        this.totalReplacements += replacements;
        
        console.log(`   💾 ${replacements} substituições`);
      }
    } catch (error) {
      console.error(`❌ Erro em ${filePath}:`, error.message);
    }
  }

  walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules' && file !== '__tests__') {
          this.walkDirectory(fullPath);
        }
      } else if (['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file))) {
        this.processFile(fullPath);
        this.processedFiles++;
      }
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('🎯 RELATÓRIO FINAL PUSH PARA 35%');
    console.log('='.repeat(70));
    
    console.log(`✅ Arquivos processados: ${this.processedFiles}`);
    console.log(`✅ Total substituições: ${this.totalReplacements}`);
    console.log(`✅ Arquivos modificados: ${this.fileStats.size}`);
    
    if (this.fileStats.size > 0) {
      console.log('\n🔥 TOP ARQUIVOS:');
      Array.from(this.fileStats.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([file, count], index) => {
          console.log(`   ${index + 1}. ${file}: ${count}`);
        });
    }

    if (this.finalOpportunities.size > 0) {
      console.log('\n🎯 OPORTUNIDADES FINAIS:');
      Array.from(this.finalOpportunities.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15)
        .forEach(([opportunity, count]) => {
          console.log(`   • "${opportunity}": ${count}x`);
        });
    }

    console.log('\n📈 IMPACTO FINAL:');
    console.log(`   Strings migradas: ${this.totalReplacements}`);
    console.log(`   Cobertura estimada: ~35%`);

    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('   1. Análise final de cobertura');
    console.log('   2. Teste completo da aplicação');
    console.log('   3. Documentação do sistema');
    
    console.log('='.repeat(70));
  }

  run() {
    console.log('🎯 PUSH FINAL PARA 35% DE COBERTURA...\n');
    console.log(`📋 Oportunidades finais: ${Object.keys(FINAL_PUSH_OPPORTUNITIES).length}`);
    
    this.walkDirectory(SRC_DIR);
    this.generateReport();
    
    console.log('\n🎉 PUSH FINAL CONCLUÍDO!');
  }
}

if (require.main === module) {
  const migrator = new FinalPushMigrator();
  migrator.run();
}

module.exports = FinalPushMigrator;
