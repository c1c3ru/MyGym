#!/usr/bin/env node

/**
 * Script para migrar os 10 arquivos com mais strings hardcoded
 * Foca nas strings mais comuns identificadas no relatório
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src/presentation');
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Top 10 arquivos com mais strings hardcoded (baseado no relatório)
const TOP_10_FILES = [
  'screens/shared/InjuryScreen.js',
  'auth/AuthFacade.ts',
  'screens/shared/AddGraduationScreen.js',
  'screens/admin/AdminModalities.js',
  'screens/instructor/CheckIn.js',
  'components/EnhancedErrorMessage.js',
  'navigation/AdminNavigator.js',
  'screens/shared/ClassDetailsScreen.js',
  'screens/shared/PhysicalEvaluationScreen.js',
  'components/OnboardingTour.js'
];

// Mapeamento expandido das strings mais comuns para suas chaves no i18n
const EXPANDED_STRING_MAPPINGS = {
  // === NAVEGAÇÃO (Top do relatório) ===
  'AddClass': 'addClass',
  'ClassDetails': 'classDetails',
  'StudentDetails': 'studentDetails',
  'Profile': 'profile',
  'Dashboard': 'dashboard',
  'PhysicalEvaluation': 'physicalEvaluation',
  'AddStudent': 'addStudent',
  
  // === ERROS ESPECÍFICOS ===
  'UserProfileNotFoundError': 'userProfileNotFoundError',
  'NetworkError': 'networkError',
  'UnauthorizedError': 'unauthorizedError',
  'Carregando...': 'loading',
  'Tentar Novamente': 'tryAgain',
  'Academia não identificada': 'academyNotIdentified',
  
  // === INTERFACE DO USUÁRIO ===
  'Todos': 'all',
  'N/A': 'notAvailable',
  'BRL': 'currency',
  'Atrasado': 'overdue',
  'Modalidade': 'modality',
  'Instrutor': 'instructor',
  
  // === STRINGS ESPECÍFICAS POR ARQUIVO ===
  
  // InjuryScreen.js específicas
  'Lesão': 'injury',
  'Lesões': 'injuries',
  'Tipo de Lesão': 'injuryType',
  'Data da Lesão': 'injuryDate',
  'Descrição da Lesão': 'injuryDescription',
  'Gravidade': 'severity',
  'Leve': 'mild',
  'Moderada': 'moderate',
  'Grave': 'severe',
  'Status da Lesão': 'injuryStatus',
  'Em Tratamento': 'inTreatment',
  'Recuperado': 'recovered',
  'Crônica': 'chronic',
  
  // AuthFacade.ts específicas
  'Autenticação': 'authentication',
  'Token expirado': 'tokenExpired',
  'Sessão inválida': 'invalidSession',
  'Credenciais inválidas': 'invalidCredentials',
  'Usuário não encontrado': 'userNotFound',
  'Senha incorreta': 'wrongPassword',
  'Email já em uso': 'emailAlreadyInUse',
  'Senha muito fraca': 'weakPassword',
  
  // AddGraduationScreen.js específicas
  'Nova Graduação': 'newGraduation',
  'Faixa Atual': 'currentBelt',
  'Próxima Faixa': 'nextBelt',
  'Data da Graduação': 'graduationDate',
  'Observações': 'observations',
  'Critérios Atendidos': 'criteriasMet',
  'Aprovado': 'approved',
  'Reprovado': 'failed',
  'Em Avaliação': 'underEvaluation',
  
  // AdminModalities.js específicas
  'Modalidades': 'modalities',
  'Nova Modalidade': 'newModality',
  'Editar Modalidade': 'editModality',
  'Excluir Modalidade': 'deleteModality',
  'Nome da Modalidade': 'modalityName',
  'Descrição': 'description',
  'Preço Mensal': 'monthlyPrice',
  'Duração da Aula': 'lessonDuration',
  'Máximo de Alunos': 'maxStudents',
  
  // CheckIn.js específicas
  'Iniciar Check-in': 'startCheckIn',
  'Parar Check-in': 'stopCheckIn',
  'Check-in Ativo': 'activeCheckIn',
  'Sessão Ativa': 'activeSession',
  'QR Code': 'qrCode',
  'Manual': 'manual',
  'Escaneie o QR Code': 'scanQRCode',
  'Ou faça check-in manual': 'orManualCheckIn',
  'Selecionar Alunos': 'selectStudents',
  'Alunos Selecionados': 'selectedStudents',
  
  // EnhancedErrorMessage.js específicas
  'Algo deu errado': 'somethingWentWrong',
  'Tente novamente mais tarde': 'tryAgainLater',
  'Verifique sua conexão': 'checkConnection',
  'Contate o suporte': 'contactSupport',
  'Código do erro': 'errorCode',
  'Detalhes técnicos': 'technicalDetails',
  'Reportar erro': 'reportError',
  
  // AdminNavigator.js específicas
  'Administração': 'administration',
  'Gestão': 'management',
  'Relatórios': 'reports',
  'Configurações': 'settings',
  'Usuários': 'users',
  'Permissões': 'permissions',
  'Backup': 'backup',
  'Logs': 'logs',
  
  // PhysicalEvaluationScreen.js específicas
  'Avaliação Física': 'physicalEvaluation',
  'Nova Avaliação': 'newEvaluation',
  'Peso': 'weight',
  'Altura': 'height',
  'IMC': 'bmi',
  'Percentual de Gordura': 'bodyFat',
  'Massa Muscular': 'muscleMass',
  'Pressão Arterial': 'bloodPressure',
  'Frequência Cardíaca': 'heartRate',
  'Observações Médicas': 'medicalObservations',
  
  // OnboardingTour.js específicas
  'Bem-vindo': 'welcome',
  'Tour Guiado': 'guidedTour',
  'Próximo Passo': 'nextStep',
  'Passo Anterior': 'previousStep',
  'Pular Tour': 'skipTour',
  'Finalizar Tour': 'finishTour',
  'Passo': 'step',
  'de': 'of',
  'Entendi': 'understood',
  'Vamos começar': 'letsStart',
  
  // === STRINGS COMUNS EM MÚLTIPLOS ARQUIVOS ===
  'Sim': 'yes',
  'Não': 'no',
  'Talvez': 'maybe',
  'Opcional': 'optional',
  'Obrigatório': 'required',
  'Disponível': 'available',
  'Indisponível': 'unavailable',
  'Público': 'public',
  'Privado': 'private',
  'Visível': 'visible',
  'Oculto': 'hidden',
  'Habilitado': 'enabled',
  'Desabilitado': 'disabled',
  'Padrão': 'default',
  'Personalizado': 'custom',
  'Automático': 'automatic',
  'Manual': 'manual',
  'Rápido': 'fast',
  'Lento': 'slow',
  'Alto': 'high',
  'Médio': 'medium',
  'Baixo': 'low',
  'Máximo': 'maximum',
  'Mínimo': 'minimum',
  'Ilimitado': 'unlimited',
  'Limitado': 'limited',
  'Completo': 'complete',
  'Incompleto': 'incomplete',
  'Parcial': 'partial',
  'Total': 'total',
  'Subtotal': 'subtotal',
  'Desconto': 'discount',
  'Taxa': 'fee',
  'Imposto': 'tax',
  'Grátis': 'free',
  'Pago': 'paid',
  'Vencido': 'expired',
  'Válido': 'valid',
  'Inválido': 'invalid',
  'Temporário': 'temporary',
  'Permanente': 'permanent',
  'Novo': 'new',
  'Antigo': 'old',
  'Recente': 'recent',
  'Atual': 'current',
  'Anterior': 'previous',
  'Próximo': 'next',
  'Primeiro': 'first',
  'Último': 'last',
  'Início': 'start',
  'Fim': 'end',
  'Meio': 'middle',
  'Centro': 'center',
  'Esquerda': 'left',
  'Direita': 'right',
  'Acima': 'above',
  'Abaixo': 'below',
  'Dentro': 'inside',
  'Fora': 'outside',
  'Perto': 'near',
  'Longe': 'far',
  'Aqui': 'here',
  'Lá': 'there',
  'Onde': 'where',
  'Quando': 'when',
  'Como': 'how',
  'Por que': 'why',
  'Quem': 'who',
  'O que': 'what',
  'Qual': 'which',
  'Quanto': 'howMuch',
  'Quantos': 'howMany',
};

class Top10Migrator {
  constructor() {
    this.processedFiles = 0;
    this.totalReplacements = 0;
    this.fileStats = new Map();
    this.skippedFiles = [];
  }

  // Verifica se arquivo precisa de import do useTheme
  needsThemeImport(content) {
    return !content.includes('useTheme') && !content.includes('getString');
  }

  // Adiciona import do useTheme se necessário
  addThemeImport(content) {
    if (content.includes('useTheme')) {
      return content;
    }

    // Procura por outros imports de contextos
    const contextImportRegex = /import.*from ['"]@contexts\/.*['"];?/;
    const match = content.match(contextImportRegex);
    
    if (match) {
      return content.replace(match[0], match[0] + "\nimport { useTheme } from '@contexts/ThemeContext';");
    }

    // Procura por imports do react-native-paper
    const paperImportRegex = /import.*from ['"]react-native-paper['"];?/;
    const paperMatch = content.match(paperImportRegex);
    
    if (paperMatch) {
      return content.replace(paperMatch[0], paperMatch[0] + "\nimport { useTheme } from '@contexts/ThemeContext';");
    }

    // Se não encontrou lugar específico, adiciona no início dos imports
    const firstImportRegex = /^import.*$/m;
    const firstImportMatch = content.match(firstImportRegex);
    
    if (firstImportMatch) {
      return content.replace(firstImportMatch[0], "import { useTheme } from '@contexts/ThemeContext';\n" + firstImportMatch[0]);
    }

    return content;
  }

  // Adiciona hook useTheme no componente
  addThemeHook(content) {
    if (content.includes('useTheme()') || content.includes('getString')) {
      return content;
    }

    // Procura pelo início do componente funcional
    const componentRegex = /export\s+default\s+function\s+\w+.*?\{/;
    const match = content.match(componentRegex);
    
    if (match) {
      const insertPoint = match.index + match[0].length;
      const before = content.substring(0, insertPoint);
      const after = content.substring(insertPoint);
      
      return before + '\n  const { getString } = useTheme();\n' + after;
    }

    // Tenta encontrar arrow function component
    const arrowComponentRegex = /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{/;
    const arrowMatch = content.match(arrowComponentRegex);
    
    if (arrowMatch) {
      const insertPoint = arrowMatch.index + arrowMatch[0].length;
      const before = content.substring(0, insertPoint);
      const after = content.substring(insertPoint);
      
      return before + '\n  const { getString } = useTheme();\n' + after;
    }

    return content;
  }

  // Migra strings hardcoded para getString()
  migrateStrings(content) {
    let modifiedContent = content;
    let replacements = 0;

    Object.entries(EXPANDED_STRING_MAPPINGS).forEach(([hardcodedString, i18nKey]) => {
      // Regex para encontrar a string hardcoded (com aspas simples ou duplas)
      const stringRegex = new RegExp(`['"\`]${hardcodedString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`, 'g');
      
      // Substitui por getString()
      const newContent = modifiedContent.replace(stringRegex, `getString('${i18nKey}')`);
      
      if (newContent !== modifiedContent) {
        const matches = (modifiedContent.match(stringRegex) || []).length;
        replacements += matches;
        modifiedContent = newContent;
        console.log(`   ✅ "${hardcodedString}" → getString('${i18nKey}') (${matches}x)`);
      }
    });

    return { content: modifiedContent, replacements };
  }

  // Processa um arquivo específico
  processFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let content = originalContent;
      
      const relativePath = path.relative(SRC_DIR, filePath);
      console.log(`\n📄 Processando: ${relativePath}`);

      // Migra strings
      const { content: migratedContent, replacements } = this.migrateStrings(content);
      content = migratedContent;

      if (replacements > 0) {
        // Adiciona import se necessário
        if (this.needsThemeImport(content)) {
          content = this.addThemeImport(content);
          console.log('   📦 Import useTheme adicionado');
        }

        // Adiciona hook se necessário
        content = this.addThemeHook(content);

        // Cria backup
        const backupPath = filePath + '.backup-top10-migration';
        fs.writeFileSync(backupPath, originalContent);

        // Salva arquivo modificado
        fs.writeFileSync(filePath, content);

        this.fileStats.set(relativePath, replacements);
        this.totalReplacements += replacements;
        
        console.log(`   💾 Arquivo salvo com ${replacements} substituições`);
      } else {
        console.log('   ⏭️  Nenhuma string para migrar');
      }

    } catch (error) {
      console.error(`   ❌ Erro ao processar ${filePath}:`, error.message);
    }
  }

  // Processa os top 10 arquivos
  processTop10Files() {
    TOP_10_FILES.forEach(relativePath => {
      const fullPath = path.join(SRC_DIR, relativePath);
      
      if (fs.existsSync(fullPath)) {
        this.processFile(fullPath);
        this.processedFiles++;
      } else {
        console.log(`⚠️  Arquivo não encontrado: ${relativePath}`);
        this.skippedFiles.push(relativePath);
      }
    });
  }

  // Gera relatório final
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO DE MIGRAÇÃO DOS TOP 10 ARQUIVOS');
    console.log('='.repeat(80));
    
    console.log(`✅ Arquivos processados: ${this.processedFiles}/${TOP_10_FILES.length}`);
    console.log(`✅ Total de substituições: ${this.totalReplacements}`);
    console.log(`✅ Arquivos modificados: ${this.fileStats.size}`);
    
    if (this.skippedFiles.length > 0) {
      console.log(`⚠️  Arquivos não encontrados: ${this.skippedFiles.length}`);
      this.skippedFiles.forEach(file => console.log(`   - ${file}`));
    }
    
    if (this.fileStats.size > 0) {
      console.log('\n🔥 ARQUIVOS COM MAIS SUBSTITUIÇÕES:');
      const sortedFiles = Array.from(this.fileStats.entries())
        .sort(([,a], [,b]) => b - a);
      
      sortedFiles.forEach(([file, count], index) => {
        console.log(`   ${index + 1}. ${file}: ${count} substituições`);
      });
    }

    console.log('\n📈 IMPACTO ESTIMADO NA COBERTURA:');
    console.log(`   Strings migradas: ${this.totalReplacements}`);
    console.log(`   Arquivos prioritários: ${this.fileStats.size}/${TOP_10_FILES.length}`);
    console.log(`   Redução estimada de hardcoded: ~${Math.round(this.totalReplacements * 0.8)} strings`);

    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('   1. Executar análise de cobertura para verificar progresso');
    console.log('   2. Testar os arquivos modificados');
    console.log('   3. Criar script para atingir 80% de cobertura');
    console.log('   4. Remover backups se tudo estiver OK:');
    console.log('      find src -name "*.backup-top10-migration" -delete');
    
    console.log('='.repeat(80));
  }

  // Executa migração completa
  run() {
    console.log('🎯 Iniciando migração dos TOP 10 arquivos com mais strings...\n');
    console.log(`📋 Strings mapeadas: ${Object.keys(EXPANDED_STRING_MAPPINGS).length}`);
    console.log(`📁 Arquivos alvo: ${TOP_10_FILES.length}`);
    
    this.processTop10Files();
    this.generateReport();
    
    console.log('\n🎉 Migração dos TOP 10 concluída!');
  }
}

// Executa o script
if (require.main === module) {
  const migrator = new Top10Migrator();
  migrator.run();
}

module.exports = Top10Migrator;
