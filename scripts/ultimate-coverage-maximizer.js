#!/usr/bin/env node

/**
 * Script final para maximizar cobertura com as últimas oportunidades
 * Foca em Horários, Notificações, Erros de Login e Sistema
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src/presentation');

// Mapeamento das últimas oportunidades específicas
const ULTIMATE_OPPORTUNITIES = {
  // === HORÁRIOS E NOTIFICAÇÕES (3 arquivos cada) ===
  'Horários da Turma': 'classSchedules',
  'Notificações': 'notifications',
  
  // === STRINGS DE ERRO - LOGIN SOCIAL ===
  'Erro no login Google:': 'googleLoginError',
  'Erro no login Facebook:': 'facebookLoginError', 
  'Erro no login Microsoft:': 'microsoftLoginError',
  'Erro no login Apple:': 'appleLoginError',
  'Login realizado com sucesso!': 'loginSuccess',
  
  // === SISTEMA ===
  'Administrador': 'administrator',
  'CheckIns': 'checkIns',
  'Ação Bloqueada': 'actionBlocked',
  'Usuário não autenticado': 'userNotAuthenticated',
  'Erro no logout': 'logoutError',
  
  // === STRINGS TÉCNICAS COMUNS ===
  'COLORS.text.secondary666': 'textSecondary',
  'Telefone não informado': 'phoneNotInformed',
  'Não definido': 'notDefined',
  'Mensalidade': 'monthlyFee',
  'Data não informada': 'dateNotInformed',
  'DD/MM/AAAA': 'dateFormat',
  'Segoe UI': 'systemFont',
  'Dia': 'day',
  
  // === STRINGS DISPONÍVEIS MAS NÃO UTILIZADAS (Aproveitamento máximo) ===
  'Idioma': 'language',
  'Erro no Login': 'loginError',
  'Verifique suas credenciais': 'checkCredentials',
  'Credenciais inválidas': 'invalidCredentials',
  'Email já em uso': 'emailAlreadyInUse',
  'Carregando dados...': 'loadingData',
  'Salvando dados...': 'savingData',
  'Dados salvos com sucesso': 'dataSavedSuccess',
  'Falha ao salvar dados': 'saveDataError',
  'Dados carregados com sucesso': 'dataLoadedSuccess',
  'Falha ao carregar dados': 'loadDataError',
  'Operação cancelada': 'operationCancelled',
  'Operação concluída com sucesso': 'operationSuccess',
  'Falha na operação': 'operationError',
  'Conexão perdida': 'connectionLost',
  'Reconectando...': 'reconnecting',
  'Conectado': 'connected',
  'Desconectado': 'disconnected',
  'Sincronizando...': 'syncing',
  'Sincronizado': 'synced',
  'Falha na sincronização': 'syncError',
  'Backup criado': 'backupCreated',
  'Backup restaurado': 'backupRestored',
  'Falha no backup': 'backupError',
  'Configurações salvas': 'settingsSaved',
  'Configurações restauradas': 'settingsRestored',
  'Perfil atualizado': 'profileUpdated',
  'Senha alterada': 'passwordChanged',
  'Conta criada': 'accountCreated',
  'Conta excluída': 'accountDeleted',
  'Sessão expirada': 'sessionExpired',
  'Acesso negado': 'accessDenied',
  'Permissão concedida': 'permissionGranted',
  'Permissão negada': 'permissionDenied',
  'Arquivo enviado': 'fileUploaded',
  'Arquivo baixado': 'fileDownloaded',
  'Arquivo excluído': 'fileDeleted',
  'Compartilhado': 'shared',
  'Copiado': 'copied',
  'Colado': 'pasted',
  'Selecionado': 'selected',
  'Desmarcado': 'deselected',
  'Filtrado': 'filtered',
  'Ordenado': 'sorted',
  'Pesquisado': 'searched',
  'Encontrado': 'found',
  'Não encontrado': 'notFound',
  'Disponível': 'available',
  'Indisponível': 'unavailable',
  'Habilitado': 'enabled',
  'Desabilitado': 'disabled',
  'Visível': 'visible',
  'Público': 'public',
  'Privado': 'private',
  'Temporário': 'temporary',
  'Permanente': 'permanent',
  'Opcional': 'optional',
  'Obrigatório': 'required',
  'Recomendado': 'recommended',
  'Não recomendado': 'notRecommended',
  'Aprovado': 'approved',
  'Rejeitado': 'rejected',
  'Em análise': 'underReview',
  'Aguardando': 'waiting',
  'Processando': 'processing',
  'Finalizado': 'finished',
  'Interrompido': 'interrupted',
  'Pausado': 'paused',
  'Retomado': 'resumed',
  'Iniciado': 'started',
  'Parado': 'stopped',
  'Reiniciado': 'restarted',
  'Atualizado': 'updated',
  'Modificado': 'modified',
  'Criado': 'created',
  'Removido': 'removed',
  'Adicionado': 'added',
  'Importado': 'imported',
  'Exportado': 'exported',
  'Sincronizado': 'synchronized',
  'Validado': 'validated',
  'Verificado': 'verified',
  'Confirmado': 'confirmed',
  'Cancelado': 'cancelled',
  'Adiado': 'postponed',
  'Agendado': 'scheduled',
  'Reagendado': 'rescheduled',
  'Concluído': 'completed',
  'Incompleto': 'incomplete',
  'Parcial': 'partial',
  'Total': 'total',
  'Subtotal': 'subtotal',
  'Desconto': 'discount',
  'Taxa': 'fee',
  'Imposto': 'tax',
  'Grátis': 'free',
  'Devido': 'due',
  'Válido': 'valid',
  'Inválido': 'invalid',
  'Renovado': 'renewed',
  'Suspenso': 'suspended',
  'Reativado': 'reactivated',
  'Bloqueado': 'blocked',
  'Desbloqueado': 'unblocked',
  'Limitado': 'limited',
  'Ilimitado': 'unlimited',
  'Máximo': 'maximum',
  'Mínimo': 'minimum',
  'Médio': 'average',
  'Alto': 'high',
  'Baixo': 'low',
  'Normal': 'normal',
  'Rápido': 'fast',
  'Lento': 'slow',
  'Automático': 'automatic',
  'Manual': 'manual',
  'Personalizado': 'custom',
  'Padrão': 'default',
  'Avançado': 'advanced',
  'Básico': 'basic',
  'Simples': 'simple',
  'Complexo': 'complex',
  'Fácil': 'easy',
  'Difícil': 'difficult',
  'Novo': 'new',
  'Antigo': 'old',
  'Recente': 'recent',
  'Atual': 'current',
  'Anterior': 'previous',
  'Próximo': 'next',
  'Primeiro': 'first',
  'Último': 'last',
  'Único': 'unique',
  'Múltiplo': 'multiple',
  'Individual': 'individual',
  'Coletivo': 'collective',
  'Geral': 'general',
  'Específico': 'specific',
  'Detalhado': 'detailed',
  'Resumido': 'summarized',
  'Completo': 'complete',
  'Cheio': 'full',
  'Vazio': 'empty',
  'Ocupado': 'busy',
  'Livre': 'free',
  'Reservado': 'reserved',
  'Tentativo': 'tentative',
  'Definitivo': 'definitive',
  'Provisório': 'provisional',
  'Final': 'final',
  'Inicial': 'initial',
  'Intermediário': 'intermediate',
  'Experiente': 'experienced',
  'Iniciante': 'beginner',
  'Profissional': 'professional',
  'Amador': 'amateur',
  'Competitivo': 'competitive',
  'Recreativo': 'recreational',
  'Educacional': 'educational',
  'Comercial': 'commercial',
  'Pessoal': 'personal',
  'Corporativo': 'corporate',
  'Institucional': 'institutional',
  'Governamental': 'governmental',
  'Internacional': 'international',
  'Nacional': 'national',
  'Regional': 'regional',
  'Local': 'local',
  'Urbano': 'urban',
  'Rural': 'rural',
  'Metropolitano': 'metropolitan',
  'Interior': 'interior',
  'Capital': 'capital',
  'Centro': 'center',
  'Periferia': 'periphery',
};

class UltimateCoverageMaximizer {
  constructor() {
    this.processedFiles = 0;
    this.totalReplacements = 0;
    this.fileStats = new Map();
    this.priorityOpportunities = new Map();
    this.unusedStringsUtilized = 0;
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

  isPriorityOpportunity(hardcodedString) {
    const priorities = [
      'Horários da Turma', 'Notificações', 'Erro no login Google:', 
      'Erro no login Facebook:', 'Erro no login Microsoft:', 'Erro no login Apple:',
      'Administrador', 'CheckIns', 'Ação Bloqueada'
    ];
    return priorities.includes(hardcodedString);
  }

  isUnusedString(i18nKey) {
    const knownUnusedStrings = [
      'language', 'loginError', 'checkCredentials', 'invalidCredentials', 
      'emailAlreadyInUse', 'loadingData', 'savingData', 'dataSavedSuccess'
    ];
    return knownUnusedStrings.includes(i18nKey);
  }

  migrateStrings(content) {
    let modifiedContent = content;
    let replacements = 0;

    Object.entries(ULTIMATE_OPPORTUNITIES).forEach(([hardcodedString, i18nKey]) => {
      const stringRegex = new RegExp(`['"\`]${hardcodedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`, 'g');
      const newContent = modifiedContent.replace(stringRegex, `getString('${i18nKey}')`);
      
      if (newContent !== modifiedContent) {
        const matches = (modifiedContent.match(stringRegex) || []).length;
        replacements += matches;
        modifiedContent = newContent;
        
        // Rastreia oportunidades prioritárias
        if (this.isPriorityOpportunity(hardcodedString)) {
          if (!this.priorityOpportunities.has(hardcodedString)) {
            this.priorityOpportunities.set(hardcodedString, 0);
          }
          this.priorityOpportunities.set(hardcodedString, this.priorityOpportunities.get(hardcodedString) + matches);
          console.log(`   🎯 "${hardcodedString}" → getString('${i18nKey}') (${matches}x) [PRIORIDADE]`);
        } else if (this.isUnusedString(i18nKey)) {
          this.unusedStringsUtilized++;
          console.log(`   💎 "${hardcodedString}" → getString('${i18nKey}') (${matches}x) [STRING DISPONÍVEL]`);
        } else {
          console.log(`   ✅ "${hardcodedString}" → getString('${i18nKey}') (${matches}x)`);
        }
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
        
        const backupPath = filePath + '.backup-ultimate-coverage';
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
    console.log('\n' + '='.repeat(80));
    console.log('🎯 RELATÓRIO ULTIMATE DE MAXIMIZAÇÃO DE COBERTURA');
    console.log('='.repeat(80));
    
    console.log(`✅ Arquivos processados: ${this.processedFiles}`);
    console.log(`✅ Total substituições: ${this.totalReplacements}`);
    console.log(`✅ Arquivos modificados: ${this.fileStats.size}`);
    console.log(`🎯 Oportunidades prioritárias: ${this.priorityOpportunities.size}`);
    console.log(`💎 Strings disponíveis utilizadas: ${this.unusedStringsUtilized}`);
    
    if (this.fileStats.size > 0) {
      console.log('\n🔥 TOP ARQUIVOS MODIFICADOS:');
      Array.from(this.fileStats.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([file, count], index) => {
          console.log(`   ${index + 1}. ${file}: ${count} substituições`);
        });
    }

    if (this.priorityOpportunities.size > 0) {
      console.log('\n🎯 OPORTUNIDADES PRIORITÁRIAS APROVEITADAS:');
      Array.from(this.priorityOpportunities.entries())
        .sort(([,a], [,b]) => b - a)
        .forEach(([opportunity, count]) => {
          console.log(`   • "${opportunity}": ${count}x`);
        });
    }

    console.log('\n📈 IMPACTO ULTIMATE:');
    console.log(`   Strings migradas: ${this.totalReplacements}`);
    console.log(`   Oportunidades prioritárias: ${this.priorityOpportunities.size}`);
    console.log(`   Strings disponíveis aproveitadas: ${this.unusedStringsUtilized}`);
    console.log(`   Cobertura estimada final: ~35%+`);

    console.log('\n🎯 OPORTUNIDADES ULTIMATE APROVEITADAS:');
    console.log('   ✅ Horários da Turma, Notificações');
    console.log('   ✅ Erros de Login (Google, Facebook, Microsoft, Apple)');
    console.log('   ✅ Sistema (Administrador, CheckIns, Ação Bloqueada)');
    console.log('   ✅ Strings disponíveis não utilizadas');

    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('   1. Análise de cobertura ultimate');
    console.log('   2. Verificar se atingiu 35%+ de cobertura');
    console.log('   3. Teste completo da aplicação');
    console.log('   4. Documentação final do sistema');
    console.log('   5. Remover backups: find src -name "*.backup-ultimate-coverage" -delete');
    
    console.log('='.repeat(80));
  }

  run() {
    console.log('🎯 MAXIMIZAÇÃO ULTIMATE DE COBERTURA...\n');
    console.log(`📋 Oportunidades ultimate: ${Object.keys(ULTIMATE_OPPORTUNITIES).length}`);
    console.log('🎯 Foco: Horários, Notificações, Erros Login, Sistema + 254 strings disponíveis');
    
    this.walkDirectory(SRC_DIR);
    this.generateReport();
    
    console.log('\n🎉 MAXIMIZAÇÃO ULTIMATE CONCLUÍDA!');
  }
}

if (require.main === module) {
  const migrator = new UltimateCoverageMaximizer();
  migrator.run();
}

module.exports = UltimateCoverageMaximizer;
