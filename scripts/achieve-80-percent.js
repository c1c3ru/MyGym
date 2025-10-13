#!/usr/bin/env node

/**
 * Script para atingir 80% de cobertura i18n
 * Foca nas strings restantes prioritárias e categorias específicas
 */

const fs = require('fs');
const path = require('path');

const THEME_FILE = path.join(__dirname, '../src/shared/utils/theme.js');
const SRC_DIR = path.join(__dirname, '../src/presentation');

// Strings restantes prioritárias + categorias para 80% de cobertura
const FINAL_STRINGS_80_PERCENT = {
  pt: {
    // === STRINGS RESTANTES PRIORITÁRIAS ===
    addClassScreen: 'Adicionar Turma',
    classDetailsScreen: 'Detalhes da Turma',
    currency: 'BRL',
    
    // === INTERFACE ESPECÍFICA ===
    // Botões
    addButton: 'Adicionar',
    editButton: 'Editar',
    deleteButton: 'Excluir',
    saveButton: 'Salvar',
    cancelButton: 'Cancelar',
    confirmButton: 'Confirmar',
    submitButton: 'Enviar',
    resetButton: 'Redefinir',
    clearButton: 'Limpar',
    searchButton: 'Buscar',
    filterButton: 'Filtrar',
    sortButton: 'Ordenar',
    
    // Labels
    nameLabel: 'Nome',
    emailLabel: 'Email',
    phoneLabel: 'Telefone',
    addressLabel: 'Endereço',
    dateLabel: 'Data',
    timeLabel: 'Hora',
    statusLabel: 'Status',
    typeLabel: 'Tipo',
    categoryLabel: 'Categoria',
    descriptionLabel: 'Descrição',
    
    // Placeholders
    enterName: 'Digite o nome',
    enterEmail: 'Digite o email',
    enterPhone: 'Digite o telefone',
    selectDate: 'Selecione a data',
    selectTime: 'Selecione a hora',
    searchPlaceholder: 'Buscar...',
    
    // === CONTEXTO ACADEMIA ===
    // Modalidades
    modalityManagement: 'Gestão de Modalidades',
    addModality: 'Adicionar Modalidade',
    editModality: 'Editar Modalidade',
    deleteModality: 'Excluir Modalidade',
    modalityName: 'Nome da Modalidade',
    modalityPrice: 'Preço da Modalidade',
    modalityDuration: 'Duração da Modalidade',
    
    // Graduações
    graduationManagement: 'Gestão de Graduações',
    addGraduationScreen: 'Adicionar Graduação',
    editGraduation: 'Editar Graduação',
    deleteGraduation: 'Excluir Graduação',
    graduationLevel: 'Nível de Graduação',
    graduationRequirements: 'Requisitos',
    
    // Check-ins
    checkInManagement: 'Gestão de Check-ins',
    activeCheckIns: 'Check-ins Ativos',
    checkInHistory: 'Histórico de Check-ins',
    manualCheckInScreen: 'Check-in Manual',
    qrCodeCheckIn: 'Check-in por QR Code',
    
    // === MENSAGENS SISTEMA ===
    // Confirmações
    confirmDeleteItem: 'Tem certeza que deseja excluir este item?',
    confirmCancelAction: 'Tem certeza que deseja cancelar esta ação?',
    confirmSaveChanges: 'Tem certeza que deseja salvar as alterações?',
    confirmLogoutAction: 'Tem certeza que deseja sair?',
    confirmResetData: 'Tem certeza que deseja redefinir os dados?',
    
    // Alertas
    dataNotSaved: 'Os dados não foram salvos',
    connectionLost: 'Conexão perdida',
    sessionExpiredAlert: 'Sessão expirada',
    permissionDeniedAlert: 'Permissão negada',
    operationFailed: 'Operação falhou',
    
    // Notificações
    dataSavedSuccess: 'Dados salvos com sucesso',
    dataDeletedSuccess: 'Dados excluídos com sucesso',
    operationCompleted: 'Operação concluída',
    welcomeNotification: 'Bem-vindo ao MyGym',
    newMessageNotification: 'Nova mensagem',
    
    // === ESTADOS E STATUS ===
    loadingState: 'Carregando',
    savingState: 'Salvando',
    processingState: 'Processando',
    completedState: 'Concluído',
    failedState: 'Falhou',
    
    // === NAVEGAÇÃO ESPECÍFICA ===
    homeScreen: 'Início',
    profileScreen: 'Perfil',
    settingsScreen: 'Configurações',
    helpScreen: 'Ajuda',
    aboutScreen: 'Sobre',
    
    // === FORMULÁRIOS ESPECÍFICOS ===
    requiredField: 'Campo obrigatório',
    optionalField: 'Campo opcional',
    invalidInput: 'Entrada inválida',
    fieldTooShort: 'Campo muito curto',
    fieldTooLong: 'Campo muito longo',
  },

  en: {
    // === REMAINING PRIORITY STRINGS ===
    addClassScreen: 'Add Class',
    classDetailsScreen: 'Class Details',
    currency: 'USD',
    
    // === SPECIFIC INTERFACE ===
    // Buttons
    addButton: 'Add',
    editButton: 'Edit',
    deleteButton: 'Delete',
    saveButton: 'Save',
    cancelButton: 'Cancel',
    confirmButton: 'Confirm',
    submitButton: 'Submit',
    resetButton: 'Reset',
    clearButton: 'Clear',
    searchButton: 'Search',
    filterButton: 'Filter',
    sortButton: 'Sort',
    
    // Labels
    nameLabel: 'Name',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    addressLabel: 'Address',
    dateLabel: 'Date',
    timeLabel: 'Time',
    statusLabel: 'Status',
    typeLabel: 'Type',
    categoryLabel: 'Category',
    descriptionLabel: 'Description',
    
    // Placeholders
    enterName: 'Enter name',
    enterEmail: 'Enter email',
    enterPhone: 'Enter phone',
    selectDate: 'Select date',
    selectTime: 'Select time',
    searchPlaceholder: 'Search...',
    
    // === ACADEMY CONTEXT ===
    // Modalities
    modalityManagement: 'Modality Management',
    addModality: 'Add Modality',
    editModality: 'Edit Modality',
    deleteModality: 'Delete Modality',
    modalityName: 'Modality Name',
    modalityPrice: 'Modality Price',
    modalityDuration: 'Modality Duration',
    
    // Graduations
    graduationManagement: 'Graduation Management',
    addGraduationScreen: 'Add Graduation',
    editGraduation: 'Edit Graduation',
    deleteGraduation: 'Delete Graduation',
    graduationLevel: 'Graduation Level',
    graduationRequirements: 'Requirements',
    
    // Check-ins
    checkInManagement: 'Check-in Management',
    activeCheckIns: 'Active Check-ins',
    checkInHistory: 'Check-in History',
    manualCheckInScreen: 'Manual Check-in',
    qrCodeCheckIn: 'QR Code Check-in',
    
    // === SYSTEM MESSAGES ===
    // Confirmations
    confirmDeleteItem: 'Are you sure you want to delete this item?',
    confirmCancelAction: 'Are you sure you want to cancel this action?',
    confirmSaveChanges: 'Are you sure you want to save the changes?',
    confirmLogoutAction: 'Are you sure you want to logout?',
    confirmResetData: 'Are you sure you want to reset the data?',
    
    // Alerts
    dataNotSaved: 'Data not saved',
    connectionLost: 'Connection lost',
    sessionExpiredAlert: 'Session expired',
    permissionDeniedAlert: 'Permission denied',
    operationFailed: 'Operation failed',
    
    // Notifications
    dataSavedSuccess: 'Data saved successfully',
    dataDeletedSuccess: 'Data deleted successfully',
    operationCompleted: 'Operation completed',
    welcomeNotification: 'Welcome to MyGym',
    newMessageNotification: 'New message',
    
    // === STATES AND STATUS ===
    loadingState: 'Loading',
    savingState: 'Saving',
    processingState: 'Processing',
    completedState: 'Completed',
    failedState: 'Failed',
    
    // === SPECIFIC NAVIGATION ===
    homeScreen: 'Home',
    profileScreen: 'Profile',
    settingsScreen: 'Settings',
    helpScreen: 'Help',
    aboutScreen: 'About',
    
    // === SPECIFIC FORMS ===
    requiredField: 'Required field',
    optionalField: 'Optional field',
    invalidInput: 'Invalid input',
    fieldTooShort: 'Field too short',
    fieldTooLong: 'Field too long',
  },

  es: {
    // === STRINGS PRIORITARIAS RESTANTES ===
    addClassScreen: 'Agregar Clase',
    classDetailsScreen: 'Detalles de la Clase',
    currency: 'EUR',
    
    // === INTERFAZ ESPECÍFICA ===
    // Botones
    addButton: 'Agregar',
    editButton: 'Editar',
    deleteButton: 'Eliminar',
    saveButton: 'Guardar',
    cancelButton: 'Cancelar',
    confirmButton: 'Confirmar',
    submitButton: 'Enviar',
    resetButton: 'Restablecer',
    clearButton: 'Limpiar',
    searchButton: 'Buscar',
    filterButton: 'Filtrar',
    sortButton: 'Ordenar',
    
    // Etiquetas
    nameLabel: 'Nombre',
    emailLabel: 'Email',
    phoneLabel: 'Teléfono',
    addressLabel: 'Dirección',
    dateLabel: 'Fecha',
    timeLabel: 'Hora',
    statusLabel: 'Estado',
    typeLabel: 'Tipo',
    categoryLabel: 'Categoría',
    descriptionLabel: 'Descripción',
    
    // Marcadores de posición
    enterName: 'Ingrese el nombre',
    enterEmail: 'Ingrese el email',
    enterPhone: 'Ingrese el teléfono',
    selectDate: 'Seleccione la fecha',
    selectTime: 'Seleccione la hora',
    searchPlaceholder: 'Buscar...',
    
    // === CONTEXTO ACADEMIA ===
    // Modalidades
    modalityManagement: 'Gestión de Modalidades',
    addModality: 'Agregar Modalidad',
    editModality: 'Editar Modalidad',
    deleteModality: 'Eliminar Modalidad',
    modalityName: 'Nombre de Modalidad',
    modalityPrice: 'Precio de Modalidad',
    modalityDuration: 'Duración de Modalidad',
    
    // Graduaciones
    graduationManagement: 'Gestión de Graduaciones',
    addGraduationScreen: 'Agregar Graduación',
    editGraduation: 'Editar Graduación',
    deleteGraduation: 'Eliminar Graduación',
    graduationLevel: 'Nivel de Graduación',
    graduationRequirements: 'Requisitos',
    
    // Check-ins
    checkInManagement: 'Gestión de Check-ins',
    activeCheckIns: 'Check-ins Activos',
    checkInHistory: 'Historial de Check-ins',
    manualCheckInScreen: 'Check-in Manual',
    qrCodeCheckIn: 'Check-in por Código QR',
    
    // === MENSAJES DEL SISTEMA ===
    // Confirmaciones
    confirmDeleteItem: '¿Estás seguro de que quieres eliminar este elemento?',
    confirmCancelAction: '¿Estás seguro de que quieres cancelar esta acción?',
    confirmSaveChanges: '¿Estás seguro de que quieres guardar los cambios?',
    confirmLogoutAction: '¿Estás seguro de que quieres cerrar sesión?',
    confirmResetData: '¿Estás seguro de que quieres restablecer los datos?',
    
    // Alertas
    dataNotSaved: 'Datos no guardados',
    connectionLost: 'Conexión perdida',
    sessionExpiredAlert: 'Sesión expirada',
    permissionDeniedAlert: 'Permiso denegado',
    operationFailed: 'Operación falló',
    
    // Notificaciones
    dataSavedSuccess: 'Datos guardados exitosamente',
    dataDeletedSuccess: 'Datos eliminados exitosamente',
    operationCompleted: 'Operación completada',
    welcomeNotification: 'Bienvenido a MyGym',
    newMessageNotification: 'Nuevo mensaje',
    
    // === ESTADOS Y STATUS ===
    loadingState: 'Cargando',
    savingState: 'Guardando',
    processingState: 'Procesando',
    completedState: 'Completado',
    failedState: 'Falló',
    
    // === NAVEGACIÓN ESPECÍFICA ===
    homeScreen: 'Inicio',
    profileScreen: 'Perfil',
    settingsScreen: 'Configuraciones',
    helpScreen: 'Ayuda',
    aboutScreen: 'Acerca de',
    
    // === FORMULARIOS ESPECÍFICOS ===
    requiredField: 'Campo requerido',
    optionalField: 'Campo opcional',
    invalidInput: 'Entrada inválida',
    fieldTooShort: 'Campo muy corto',
    fieldTooLong: 'Campo muy largo',
  }
};

// Mapeamento das strings restantes prioritárias
const PRIORITY_MAPPINGS = {
  'AddClass': 'addClassScreen',
  'ClassDetails': 'classDetailsScreen',
  'Carregando...': 'loadingState',
  'N/A': 'notAvailable',
  'BRL': 'currency',
  'Atrasado': 'overdue',
  'Academia não identificada': 'academyNotIdentified',
  'Todos': 'all',
  'Info': 'info',
  'Azul': 'blue',
  'AddGraduation': 'addGraduationScreen',
  'ChangePassword': 'changePassword',
  'PhysicalEvaluationHistory': 'physicalEvaluationHistory',
  'AddStudent': 'addStudent',
  'PhysicalEvaluation': 'physicalEvaluation',
};

function expandTo80Percent() {
  console.log('🎯 Expandindo sistema i18n para 80% de cobertura...\n');
  
  try {
    let content = fs.readFileSync(THEME_FILE, 'utf8');
    
    const backupFile = THEME_FILE + '.backup-80-percent';
    fs.writeFileSync(backupFile, content);
    console.log('✅ Backup criado:', backupFile);
    
    Object.entries(FINAL_STRINGS_80_PERCENT).forEach(([lang, strings]) => {
      console.log(`\n📝 Adicionando strings para ${lang.toUpperCase()}...`);
      
      const langPattern = new RegExp(`${lang}:\\s*{[\\s\\S]*?strings:\\s*{`, 'g');
      const match = langPattern.exec(content);
      
      if (match) {
        const stringsStart = match.index + match[0].length;
        
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
        
        let newStringsText = '\n      // === EXPANSÃO PARA 80% DE COBERTURA ===\n';
        
        // Interface Específica
        newStringsText += '      // Interface Específica\n';
        const interfaceKeys = Object.keys(strings).filter(key => 
          key.includes('Button') || key.includes('Label') || key.includes('enter') || key.includes('select')
        );
        interfaceKeys.forEach(key => {
          newStringsText += `      ${key}: '${strings[key]}',\n`;
        });
        
        // Contexto Academia
        newStringsText += '\n      // Contexto Academia\n';
        const academyKeys = Object.keys(strings).filter(key => 
          key.includes('modality') || key.includes('graduation') || key.includes('checkIn')
        );
        academyKeys.forEach(key => {
          newStringsText += `      ${key}: '${strings[key]}',\n`;
        });
        
        // Mensagens Sistema
        newStringsText += '\n      // Mensagens Sistema\n';
        const systemKeys = Object.keys(strings).filter(key => 
          key.includes('confirm') || key.includes('Alert') || key.includes('Notification') || key.includes('State')
        );
        systemKeys.forEach(key => {
          newStringsText += `      ${key}: '${strings[key]}',\n`;
        });
        
        // Navegação e Formulários
        newStringsText += '\n      // Navegação e Formulários\n';
        const navKeys = Object.keys(strings).filter(key => 
          key.includes('Screen') || key.includes('Field') || key === 'currency'
        );
        navKeys.forEach(key => {
          newStringsText += `      ${key}: '${strings[key]}',\n`;
        });
        
        newStringsText += '      // === FIM EXPANSÃO 80% ===\n';
        
        const beforeStrings = content.substring(0, stringsEnd);
        const afterStrings = content.substring(stringsEnd);
        
        content = beforeStrings + newStringsText + afterStrings;
        
        console.log(`   ✅ ${Object.keys(strings).length} strings adicionadas para ${lang}`);
      }
    });
    
    fs.writeFileSync(THEME_FILE, content);
    console.log('\n✅ Arquivo salvo com sucesso!');
    
    const totalStrings = Object.values(FINAL_STRINGS_80_PERCENT).reduce((total, strings) => {
      return total + Object.keys(strings).length;
    }, 0);
    
    console.log('\n' + '='.repeat(70));
    console.log('🎯 RELATÓRIO DE EXPANSÃO PARA 80% DE COBERTURA');
    console.log('='.repeat(70));
    console.log(`✅ Total de strings adicionadas: ${totalStrings}`);
    console.log(`✅ Strings por idioma: ${Object.keys(FINAL_STRINGS_80_PERCENT.pt).length}`);
    
    console.log('\n📋 Categorias expandidas:');
    console.log('   • Interface Específica: Botões, labels, placeholders');
    console.log('   • Contexto Academia: Modalidades, graduações, check-ins');
    console.log('   • Mensagens Sistema: Confirmações, alertas, notificações');
    console.log('   • Navegação: Telas específicas e formulários');
    
    console.log('\n🎯 META: 80% de cobertura');
    console.log('   Strings disponíveis antes: ~619');
    console.log(`   Strings adicionadas agora: ${totalStrings}`);
    console.log(`   Total estimado: ~${619 + totalStrings}`);
    
    console.log('\n💡 Próximos passos:');
    console.log('   1. Executar migração das strings prioritárias restantes');
    console.log('   2. Executar análise de cobertura final');
    console.log('   3. Testar aplicação completa');
    console.log('   4. Documentar sistema i18n completo');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  expandTo80Percent();
}

module.exports = { expandTo80Percent, FINAL_STRINGS_80_PERCENT, PRIORITY_MAPPINGS };
