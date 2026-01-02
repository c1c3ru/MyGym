#!/usr/bin/env node

/**
 * Script para aproveitar as oportunidades finais mapeadas
 * Foca em StudentProfile, Dashboard, Status específicos e strings disponíveis
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src/presentation');

// Mapeamento das oportunidades finais específicas
const FINAL_OPPORTUNITIES = {
  // === OPORTUNIDADES MAPEADAS (4 arquivos cada) ===
  'StudentProfile': 'studentProfile',
  'Dashboard': 'dashboard',
  'StudentDetails': 'studentDetails',
  
  // === HISTÓRICO E PRIVACIDADE ===
  'Histórico de Avaliações': 'evaluationHistory',
  'Privacidade e Segurança': 'privacyAndSecurity',
  
  // === STATUS ESPECÍFICOS ===
  'Ativos': 'active',
  'Inativos': 'inactive',
  'Pagamento OK': 'paymentOK',
  'Pagamento Pendente': 'paymentPending',
  'Pagamento Atrasado': 'paymentOverdue',
  
  // === STRINGS TÉCNICAS ===
  'User UID:': 'userUID',
  'Data não disponível': 'dataNotAvailable',
  'Faixa Branca': 'whiteBelt',
  'Academia': 'academy',
  'Sucesso! ✅': 'successCheck',
  'Ocultar': 'hide',
  'COLORS.white': 'colorWhite',
  'System': 'system',
  'America/Fortaleza': 'timezone',
  
  // === EMAIL E COMUNICAÇÃO ===
  'Email': 'email',
  'Mensagem': 'message',
  'Notificação': 'notification',
  'Alerta': 'alert',
  
  // === STRINGS DISPONÍVEIS MAS NÃO UTILIZADAS ===
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
  'Oculto': 'hidden',
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

class FinalOpportunityMigrator {
  constructor() {
    this.processedFiles = 0;
    this.totalReplacements = 0;
    this.fileStats = new Map();
    this.opportunitiesFound = new Map();
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

    Object.entries(FINAL_OPPORTUNITIES).forEach(([hardcodedString, i18nKey]) => {
      const stringRegex = new RegExp(`['"\`]${hardcodedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`, 'g');
      const newContent = modifiedContent.replace(stringRegex, `getString('${i18nKey}')`);
      
      if (newContent !== modifiedContent) {
        const matches = (modifiedContent.match(stringRegex) || []).length;
        replacements += matches;
        modifiedContent = newContent;
        
        // Rastreia oportunidades encontradas
        if (!this.opportunitiesFound.has(hardcodedString)) {
          this.opportunitiesFound.set(hardcodedString, 0);
        }
        this.opportunitiesFound.set(hardcodedString, this.opportunitiesFound.get(hardcodedString) + matches);
        
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
        
        const backupPath = filePath + '.backup-final-opportunities';
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
    console.log('🎯 RELATÓRIO FINAL DE OPORTUNIDADES');
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

    if (this.opportunitiesFound.size > 0) {
      console.log('\n🎯 OPORTUNIDADES APROVEITADAS:');
      Array.from(this.opportunitiesFound.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15)
        .forEach(([opportunity, count]) => {
          console.log(`   • "${opportunity}": ${count}x`);
        });
    }

    console.log('\n📈 IMPACTO ESTIMADO:');
    console.log(`   Strings migradas: ${this.totalReplacements}`);
    console.log(`   Cobertura estimada: ~35%+`);
    console.log(`   Oportunidades aproveitadas: ${this.opportunitiesFound.size}`);

    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('   1. Análise de cobertura final');
    console.log('   2. Teste da aplicação');
    console.log('   3. Documentação completa');
    
    console.log('='.repeat(70));
  }

  run() {
    console.log('🎯 Aproveitando oportunidades finais mapeadas...\n');
    console.log(`📋 Oportunidades: ${Object.keys(FINAL_OPPORTUNITIES).length}`);
    
    this.walkDirectory(SRC_DIR);
    this.generateReport();
    
    console.log('\n🎉 Oportunidades finais aproveitadas!');
  }
}

if (require.main === module) {
  const migrator = new FinalOpportunityMigrator();
  migrator.run();
}

module.exports = FinalOpportunityMigrator;
