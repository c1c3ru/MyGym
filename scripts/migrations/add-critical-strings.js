#!/usr/bin/env node

/**
 * Script para adicionar strings críticas mais comuns ao sistema i18n
 * Baseado no relatório de análise de cobertura
 */

const fs = require('fs');
const path = require('path');

const THEME_FILE = path.join(__dirname, '../src/shared/utils/theme.js');

// Strings críticas mais comuns (Top 20 do relatório)
const CRITICAL_STRINGS = {
  // Português
  pt: {
    // Erros mais comuns
    error: 'Erro',
    academyIdNotFound: 'Academia ID não encontrado',
    dataLoadError: 'Não foi possível carregar os dados. Tente novamente.',
    networkError: 'Erro de conexão. Verifique sua internet e tente novamente.',
    userNotAssociated: 'Usuário não associado a uma academia',
    
    // Ações mais comuns
    update: 'Atualizar',
    
    // Status mais comuns
    active: 'Ativo',
    pending: 'Pendente',
    
    // Academia mais comuns
    karate: 'Karatê',
    jiujitsu: 'Jiu-Jitsu',
    muayThai: 'Muay Thai',
    boxing: 'Boxe',
    
    // Navegação mais comum
    addClass: 'Adicionar Turma',
    classDetails: 'Detalhes da Turma',
    
    // Confirmações
    confirmDelete: 'Tem certeza que deseja excluir?',
    confirmCancel: 'Tem certeza que deseja cancelar?',
    
    // Placeholders
    searchStudent: 'Buscar aluno...',
    searchClass: 'Buscar turma...',
    noStudentsFound: 'Nenhum aluno encontrado',
    noClassesFound: 'Nenhuma turma encontrada',
    noDataAvailable: 'Nenhum dado disponível',
    
    // Formulários
    nameNotInformed: 'Nome não informado',
    emailNotInformed: 'Email não informado',
    selectClass: 'Selecione uma turma',
    selectStudent: 'Selecione um aluno',
    
    // Check-in específico
    checkInStarted: 'Check-in iniciado para',
    checkInStopped: 'Sessão de check-in finalizada',
    checkInSuccess: 'Check-in realizado com sucesso!',
    selectStudentsFirst: 'Selecione pelo menos um aluno',
    confirmCheckIn: 'Confirmar Check-in',
    manualCheckIn: 'Check-in Manual',
    
    // Tempo
    startedAt: 'Iniciado às',
    now: 'Agora',
    today: 'Hoje',
    thisWeek: 'Esta semana',
    
    // Graduação
    currentGraduation: 'Graduação Atual',
    beginner: 'Iniciante',
    addGraduation: 'Adicionar Graduação',
    
    // Pagamentos
    paymentUpToDate: 'Em dia',
    paymentPending: 'Pendente',
    paymentOverdue: 'Em atraso',
    
    // Modalidades específicas
    modalityNotInformed: 'Modalidade não informada',
    scheduleNotDefined: 'Horário não definido',
    
    // Mensagens de sistema
    loadingData: 'Carregando dados...',
    savingData: 'Salvando dados...',
    processingRequest: 'Processando solicitação...',
    operationCompleted: 'Operação concluída',
    
    // Validações específicas
    selectAtLeastOne: 'Selecione pelo menos um item',
    fillAllRequiredFields: 'Preencha todos os campos obrigatórios',
    invalidData: 'Dados inválidos',
    
    // Ações específicas do app
    startCheckIn: 'Iniciar Check-in',
    stopCheckIn: 'Parar Check-in',
    viewDetails: 'Ver Detalhes',
    editInfo: 'Editar Informações',
    manageStudents: 'Gerenciar Alunos',
    manageClasses: 'Gerenciar Turmas',
  },

  // Inglês (traduções básicas)
  en: {
    error: 'Error',
    academyIdNotFound: 'Academy ID not found',
    dataLoadError: 'Could not load data. Please try again.',
    networkError: 'Connection error. Check your internet and try again.',
    userNotAssociated: 'User not associated with an academy',
    
    update: 'Update',
    
    active: 'Active',
    pending: 'Pending',
    
    karate: 'Karate',
    jiujitsu: 'Jiu-Jitsu',
    muayThai: 'Muay Thai',
    boxing: 'Boxing',
    
    addClass: 'Add Class',
    classDetails: 'Class Details',
    
    confirmDelete: 'Are you sure you want to delete?',
    confirmCancel: 'Are you sure you want to cancel?',
    
    searchStudent: 'Search student...',
    searchClass: 'Search class...',
    noStudentsFound: 'No students found',
    noClassesFound: 'No classes found',
    noDataAvailable: 'No data available',
    
    nameNotInformed: 'Name not provided',
    emailNotInformed: 'Email not provided',
    selectClass: 'Select a class',
    selectStudent: 'Select a student',
    
    checkInStarted: 'Check-in started for',
    checkInStopped: 'Check-in session ended',
    checkInSuccess: 'Check-in completed successfully!',
    selectStudentsFirst: 'Select at least one student',
    confirmCheckIn: 'Confirm Check-in',
    manualCheckIn: 'Manual Check-in',
    
    startedAt: 'Started at',
    now: 'Now',
    today: 'Today',
    thisWeek: 'This week',
    
    currentGraduation: 'Current Graduation',
    beginner: 'Beginner',
    addGraduation: 'Add Graduation',
    
    paymentUpToDate: 'Up to date',
    paymentPending: 'Pending',
    paymentOverdue: 'Overdue',
    
    modalityNotInformed: 'Modality not informed',
    scheduleNotDefined: 'Schedule not defined',
    
    loadingData: 'Loading data...',
    savingData: 'Saving data...',
    processingRequest: 'Processing request...',
    operationCompleted: 'Operation completed',
    
    selectAtLeastOne: 'Select at least one item',
    fillAllRequiredFields: 'Fill all required fields',
    invalidData: 'Invalid data',
    
    startCheckIn: 'Start Check-in',
    stopCheckIn: 'Stop Check-in',
    viewDetails: 'View Details',
    editInfo: 'Edit Information',
    manageStudents: 'Manage Students',
    manageClasses: 'Manage Classes',
  },

  // Espanhol (traduções básicas)
  es: {
    error: 'Error',
    academyIdNotFound: 'ID de academia no encontrado',
    dataLoadError: 'No se pudieron cargar los datos. Inténtalo de nuevo.',
    networkError: 'Error de conexión. Verifica tu internet e inténtalo de nuevo.',
    userNotAssociated: 'Usuario no asociado a una academia',
    
    update: 'Actualizar',
    
    active: 'Activo',
    pending: 'Pendiente',
    
    karate: 'Karate',
    jiujitsu: 'Jiu-Jitsu',
    muayThai: 'Muay Thai',
    boxing: 'Boxeo',
    
    addClass: 'Agregar Clase',
    classDetails: 'Detalles de la Clase',
    
    confirmDelete: '¿Estás seguro de que quieres eliminar?',
    confirmCancel: '¿Estás seguro de que quieres cancelar?',
    
    searchStudent: 'Buscar estudiante...',
    searchClass: 'Buscar clase...',
    noStudentsFound: 'No se encontraron estudiantes',
    noClassesFound: 'No se encontraron clases',
    noDataAvailable: 'No hay datos disponibles',
    
    nameNotInformed: 'Nombre no proporcionado',
    emailNotInformed: 'Email no proporcionado',
    selectClass: 'Selecciona una clase',
    selectStudent: 'Selecciona un estudiante',
    
    checkInStarted: 'Check-in iniciado para',
    checkInStopped: 'Sesión de check-in finalizada',
    checkInSuccess: '¡Check-in completado exitosamente!',
    selectStudentsFirst: 'Selecciona al menos un estudiante',
    confirmCheckIn: 'Confirmar Check-in',
    manualCheckIn: 'Check-in Manual',
    
    startedAt: 'Iniciado a las',
    now: 'Ahora',
    today: 'Hoy',
    thisWeek: 'Esta semana',
    
    currentGraduation: 'Graduación Actual',
    beginner: 'Principiante',
    addGraduation: 'Agregar Graduación',
    
    paymentUpToDate: 'Al día',
    paymentPending: 'Pendiente',
    paymentOverdue: 'Atrasado',
    
    modalityNotInformed: 'Modalidad no informada',
    scheduleNotDefined: 'Horario no definido',
    
    loadingData: 'Cargando datos...',
    savingData: 'Guardando datos...',
    processingRequest: 'Procesando solicitud...',
    operationCompleted: 'Operación completada',
    
    selectAtLeastOne: 'Selecciona al menos un elemento',
    fillAllRequiredFields: 'Completa todos los campos requeridos',
    invalidData: 'Datos inválidos',
    
    startCheckIn: 'Iniciar Check-in',
    stopCheckIn: 'Detener Check-in',
    viewDetails: 'Ver Detalles',
    editInfo: 'Editar Información',
    manageStudents: 'Gestionar Estudiantes',
    manageClasses: 'Gestionar Clases',
  }
};

function addCriticalStrings() {
  console.log('🚀 Adicionando strings críticas ao sistema i18n...\n');
  
  try {
    // Ler arquivo atual
    let content = fs.readFileSync(THEME_FILE, 'utf8');
    
    // Criar backup
    const backupFile = THEME_FILE + '.backup-critical-strings';
    fs.writeFileSync(backupFile, content);
    console.log('✅ Backup criado:', backupFile);
    
    // Para cada idioma, adicionar as strings
    Object.entries(CRITICAL_STRINGS).forEach(([lang, strings]) => {
      console.log(`\n📝 Adicionando strings para ${lang.toUpperCase()}...`);
      
      // Encontrar a seção do idioma
      const langPattern = new RegExp(`${lang}:\\s*{[\\s\\S]*?strings:\\s*{`, 'g');
      const match = langPattern.exec(content);
      
      if (match) {
        // Encontrar onde inserir (antes do final da seção strings)
        const stringsStart = match.index + match[0].length;
        
        // Procurar o final da seção strings deste idioma
        let braceCount = 1;
        let stringsEnd = stringsStart;
        
        for (let i = stringsStart; i < content.length && braceCount > 0; i++) {
          if (content[i] === '{') braceCount++;
          if (content[i] === '}') braceCount--;
          if (braceCount === 0) {
            stringsEnd = i;
            break;
          }
        }
        
        // Gerar texto das novas strings
        const newStringsText = Object.entries(strings)
          .map(([key, value]) => `      ${key}: '${value}',`)
          .join('\n');
        
        // Inserir as novas strings
        const beforeStrings = content.substring(0, stringsEnd);
        const afterStrings = content.substring(stringsEnd);
        
        content = beforeStrings + 
          '\n      // === STRINGS CRÍTICAS ADICIONADAS ===\n' +
          newStringsText + '\n' +
          '      // === FIM STRINGS CRÍTICAS ===\n' +
          afterStrings;
        
        console.log(`   ✅ ${Object.keys(strings).length} strings adicionadas para ${lang}`);
      } else {
        console.log(`   ⚠️  Seção ${lang} não encontrada`);
      }
    });
    
    // Salvar arquivo modificado
    fs.writeFileSync(THEME_FILE, content);
    console.log('\n✅ Arquivo salvo com sucesso!');
    
    // Relatório
    const totalStrings = Object.values(CRITICAL_STRINGS).reduce((total, strings) => {
      return total + Object.keys(strings).length;
    }, 0);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE STRINGS CRÍTICAS ADICIONADAS');
    console.log('='.repeat(60));
    console.log(`✅ Total de strings adicionadas: ${totalStrings}`);
    console.log(`✅ Idiomas atualizados: ${Object.keys(CRITICAL_STRINGS).length}`);
    console.log(`✅ Strings por idioma: ${Object.keys(CRITICAL_STRINGS.pt).length}`);
    
    console.log('\n💡 Próximos passos:');
    console.log('   1. Executar análise de cobertura novamente');
    console.log('   2. Migrar strings hardcoded para usar getString()');
    console.log('   3. Testar a aplicação');
    console.log('   4. Remover backup se tudo estiver OK');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  addCriticalStrings();
}

module.exports = { addCriticalStrings, CRITICAL_STRINGS };
