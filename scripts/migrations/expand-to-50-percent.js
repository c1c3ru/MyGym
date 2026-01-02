#!/usr/bin/env node

/**
 * Script para expandir o sistema i18n para 50% de cobertura
 * Adiciona 100+ strings críticas baseadas na análise de frequência
 */

const fs = require('fs');
const path = require('path');

const THEME_FILE = path.join(__dirname, '../src/shared/utils/theme.js');

// 100+ strings críticas para atingir 50% de cobertura
const CRITICAL_STRINGS_50_PERCENT = {
  pt: {
    // === NAVEGAÇÃO E INTERFACE (20 strings) ===
    addClass: 'Adicionar Turma',
    classDetails: 'Detalhes da Turma',
    studentDetails: 'Detalhes do Aluno',
    profile: 'Perfil',
    dashboard: 'Dashboard',
    all: 'Todos',
    none: 'Nenhum',
    notAvailable: 'N/A',
    notInformed: 'Não informado',
    notDefined: 'Não definido',
    loading: 'Carregando...',
    saving: 'Salvando...',
    processing: 'Processando...',
    searching: 'Buscando...',
    filtering: 'Filtrando...',
    sorting: 'Ordenando...',
    exporting: 'Exportando...',
    importing: 'Importando...',
    uploading: 'Enviando...',
    downloading: 'Baixando...',

    // === ERROS ESPECÍFICOS (25 strings) ===
    userProfileNotFoundError: 'Perfil do usuário não encontrado',
    networkError: 'Erro de rede',
    unauthorizedError: 'Não autorizado',
    forbiddenError: 'Acesso negado',
    notFoundError: 'Não encontrado',
    validationError: 'Erro de validação',
    serverError: 'Erro do servidor',
    timeoutError: 'Tempo limite excedido',
    connectionError: 'Erro de conexão',
    authenticationError: 'Erro de autenticação',
    permissionError: 'Erro de permissão',
    dataError: 'Erro nos dados',
    fileError: 'Erro no arquivo',
    uploadError: 'Erro no upload',
    downloadError: 'Erro no download',
    syncError: 'Erro de sincronização',
    cacheError: 'Erro de cache',
    storageError: 'Erro de armazenamento',
    configError: 'Erro de configuração',
    serviceError: 'Erro no serviço',
    apiError: 'Erro na API',
    databaseError: 'Erro no banco de dados',
    backupError: 'Erro no backup',
    restoreError: 'Erro na restauração',
    migrationError: 'Erro na migração',

    // === INTERFACE DO USUÁRIO (20 strings) ===
    tryAgain: 'Tentar Novamente',
    retry: 'Repetir',
    reload: 'Recarregar',
    refresh: 'Atualizar',
    close: 'Fechar',
    open: 'Abrir',
    show: 'Mostrar',
    hide: 'Ocultar',
    expand: 'Expandir',
    collapse: 'Recolher',
    minimize: 'Minimizar',
    maximize: 'Maximizar',
    fullscreen: 'Tela Cheia',
    exitFullscreen: 'Sair da Tela Cheia',
    previous: 'Anterior',
    next: 'Próximo',
    first: 'Primeiro',
    last: 'Último',
    more: 'Mais',
    less: 'Menos',

    // === ACADEMIA ESPECÍFICA (15 strings) ===
    modality: 'Modalidade',
    modalities: 'Modalidades',
    instructor: 'Instrutor',
    instructors: 'Instrutores',
    administrator: 'Administrador',
    administrators: 'Administradores',
    schedule: 'Horário',
    schedules: 'Horários',
    lesson: 'Aula',
    lessons: 'Aulas',
    training: 'Treino',
    trainings: 'Treinos',
    session: 'Sessão',
    sessions: 'Sessões',
    academy: 'Academia',

    // === FORMULÁRIOS AVANÇADOS (10 strings) ===
    selectAll: 'Selecionar Todos',
    deselectAll: 'Desmarcar Todos',
    selectNone: 'Não Selecionar',
    selectOption: 'Selecionar Opção',
    chooseFile: 'Escolher Arquivo',
    uploadFile: 'Enviar Arquivo',
    removeFile: 'Remover Arquivo',
    replaceFile: 'Substituir Arquivo',
    previewFile: 'Visualizar Arquivo',
    downloadFile: 'Baixar Arquivo',

    // === TEMPO E DATAS ESPECÍFICAS (10 strings) ===
    never: 'Nunca',
    always: 'Sempre',
    sometimes: 'Às vezes',
    recently: 'Recentemente',
    soon: 'Em breve',
    later: 'Mais tarde',
    earlier: 'Mais cedo',
    now: 'Agora',
    justNow: 'Agora mesmo',
    longTimeAgo: 'Há muito tempo',
  },

  en: {
    // === NAVIGATION AND INTERFACE (20 strings) ===
    addClass: 'Add Class',
    classDetails: 'Class Details',
    studentDetails: 'Student Details',
    profile: 'Profile',
    dashboard: 'Dashboard',
    all: 'All',
    none: 'None',
    notAvailable: 'N/A',
    notInformed: 'Not informed',
    notDefined: 'Not defined',
    loading: 'Loading...',
    saving: 'Saving...',
    processing: 'Processing...',
    searching: 'Searching...',
    filtering: 'Filtering...',
    sorting: 'Sorting...',
    exporting: 'Exporting...',
    importing: 'Importing...',
    uploading: 'Uploading...',
    downloading: 'Downloading...',

    // === SPECIFIC ERRORS (25 strings) ===
    userProfileNotFoundError: 'User profile not found',
    networkError: 'Network error',
    unauthorizedError: 'Unauthorized',
    forbiddenError: 'Access denied',
    notFoundError: 'Not found',
    validationError: 'Validation error',
    serverError: 'Server error',
    timeoutError: 'Timeout exceeded',
    connectionError: 'Connection error',
    authenticationError: 'Authentication error',
    permissionError: 'Permission error',
    dataError: 'Data error',
    fileError: 'File error',
    uploadError: 'Upload error',
    downloadError: 'Download error',
    syncError: 'Sync error',
    cacheError: 'Cache error',
    storageError: 'Storage error',
    configError: 'Configuration error',
    serviceError: 'Service error',
    apiError: 'API error',
    databaseError: 'Database error',
    backupError: 'Backup error',
    restoreError: 'Restore error',
    migrationError: 'Migration error',

    // === USER INTERFACE (20 strings) ===
    tryAgain: 'Try Again',
    retry: 'Retry',
    reload: 'Reload',
    refresh: 'Refresh',
    close: 'Close',
    open: 'Open',
    show: 'Show',
    hide: 'Hide',
    expand: 'Expand',
    collapse: 'Collapse',
    minimize: 'Minimize',
    maximize: 'Maximize',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    previous: 'Previous',
    next: 'Next',
    first: 'First',
    last: 'Last',
    more: 'More',
    less: 'Less',

    // === ACADEMY SPECIFIC (15 strings) ===
    modality: 'Modality',
    modalities: 'Modalities',
    instructor: 'Instructor',
    instructors: 'Instructors',
    administrator: 'Administrator',
    administrators: 'Administrators',
    schedule: 'Schedule',
    schedules: 'Schedules',
    lesson: 'Lesson',
    lessons: 'Lessons',
    training: 'Training',
    trainings: 'Trainings',
    session: 'Session',
    sessions: 'Sessions',
    academy: 'Academy',

    // === ADVANCED FORMS (10 strings) ===
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    selectNone: 'Select None',
    selectOption: 'Select Option',
    chooseFile: 'Choose File',
    uploadFile: 'Upload File',
    removeFile: 'Remove File',
    replaceFile: 'Replace File',
    previewFile: 'Preview File',
    downloadFile: 'Download File',

    // === SPECIFIC TIME AND DATES (10 strings) ===
    never: 'Never',
    always: 'Always',
    sometimes: 'Sometimes',
    recently: 'Recently',
    soon: 'Soon',
    later: 'Later',
    earlier: 'Earlier',
    now: 'Now',
    justNow: 'Just now',
    longTimeAgo: 'Long time ago',
  },

  es: {
    // === NAVEGACIÓN E INTERFAZ (20 strings) ===
    addClass: 'Agregar Clase',
    classDetails: 'Detalles de la Clase',
    studentDetails: 'Detalles del Estudiante',
    profile: 'Perfil',
    dashboard: 'Panel',
    all: 'Todos',
    none: 'Ninguno',
    notAvailable: 'N/A',
    notInformed: 'No informado',
    notDefined: 'No definido',
    loading: 'Cargando...',
    saving: 'Guardando...',
    processing: 'Procesando...',
    searching: 'Buscando...',
    filtering: 'Filtrando...',
    sorting: 'Ordenando...',
    exporting: 'Exportando...',
    importing: 'Importando...',
    uploading: 'Subiendo...',
    downloading: 'Descargando...',

    // === ERRORES ESPECÍFICOS (25 strings) ===
    userProfileNotFoundError: 'Perfil de usuario no encontrado',
    networkError: 'Error de red',
    unauthorizedError: 'No autorizado',
    forbiddenError: 'Acceso denegado',
    notFoundError: 'No encontrado',
    validationError: 'Error de validación',
    serverError: 'Error del servidor',
    timeoutError: 'Tiempo límite excedido',
    connectionError: 'Error de conexión',
    authenticationError: 'Error de autenticación',
    permissionError: 'Error de permisos',
    dataError: 'Error de datos',
    fileError: 'Error de archivo',
    uploadError: 'Error de subida',
    downloadError: 'Error de descarga',
    syncError: 'Error de sincronización',
    cacheError: 'Error de caché',
    storageError: 'Error de almacenamiento',
    configError: 'Error de configuración',
    serviceError: 'Error de servicio',
    apiError: 'Error de API',
    databaseError: 'Error de base de datos',
    backupError: 'Error de respaldo',
    restoreError: 'Error de restauración',
    migrationError: 'Error de migración',

    // === INTERFAZ DE USUARIO (20 strings) ===
    tryAgain: 'Intentar de Nuevo',
    retry: 'Reintentar',
    reload: 'Recargar',
    refresh: 'Actualizar',
    close: 'Cerrar',
    open: 'Abrir',
    show: 'Mostrar',
    hide: 'Ocultar',
    expand: 'Expandir',
    collapse: 'Contraer',
    minimize: 'Minimizar',
    maximize: 'Maximizar',
    fullscreen: 'Pantalla Completa',
    exitFullscreen: 'Salir de Pantalla Completa',
    previous: 'Anterior',
    next: 'Siguiente',
    first: 'Primero',
    last: 'Último',
    more: 'Más',
    less: 'Menos',

    // === ACADEMIA ESPECÍFICA (15 strings) ===
    modality: 'Modalidad',
    modalities: 'Modalidades',
    instructor: 'Instructor',
    instructors: 'Instructores',
    administrator: 'Administrador',
    administrators: 'Administradores',
    schedule: 'Horario',
    schedules: 'Horarios',
    lesson: 'Lección',
    lessons: 'Lecciones',
    training: 'Entrenamiento',
    trainings: 'Entrenamientos',
    session: 'Sesión',
    sessions: 'Sesiones',
    academy: 'Academia',

    // === FORMULARIOS AVANZADOS (10 strings) ===
    selectAll: 'Seleccionar Todo',
    deselectAll: 'Deseleccionar Todo',
    selectNone: 'No Seleccionar',
    selectOption: 'Seleccionar Opción',
    chooseFile: 'Elegir Archivo',
    uploadFile: 'Subir Archivo',
    removeFile: 'Eliminar Archivo',
    replaceFile: 'Reemplazar Archivo',
    previewFile: 'Vista Previa del Archivo',
    downloadFile: 'Descargar Archivo',

    // === TIEMPO Y FECHAS ESPECÍFICAS (10 strings) ===
    never: 'Nunca',
    always: 'Siempre',
    sometimes: 'A veces',
    recently: 'Recientemente',
    soon: 'Pronto',
    later: 'Más tarde',
    earlier: 'Más temprano',
    now: 'Ahora',
    justNow: 'Justo ahora',
    longTimeAgo: 'Hace mucho tiempo',
  }
};

function expandTo50Percent() {
  console.log('🚀 Expandindo sistema i18n para 50% de cobertura...\n');
  
  try {
    // Ler arquivo atual
    let content = fs.readFileSync(THEME_FILE, 'utf8');
    
    // Criar backup
    const backupFile = THEME_FILE + '.backup-50-percent';
    fs.writeFileSync(backupFile, content);
    console.log('✅ Backup criado:', backupFile);
    
    // Para cada idioma, adicionar as strings
    Object.entries(CRITICAL_STRINGS_50_PERCENT).forEach(([lang, strings]) => {
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
        
        // Gerar texto das novas strings organizadas por categoria
        let newStringsText = '\n      // === EXPANSÃO PARA 50% DE COBERTURA ===\n';
        
        // Navegação e Interface
        newStringsText += '      // Navegação e Interface\n';
        const navKeys = ['addClass', 'classDetails', 'studentDetails', 'profile', 'dashboard', 'all', 'none', 'notAvailable', 'notInformed', 'notDefined', 'loading', 'saving', 'processing', 'searching', 'filtering', 'sorting', 'exporting', 'importing', 'uploading', 'downloading'];
        navKeys.forEach(key => {
          if (strings[key]) {
            newStringsText += `      ${key}: '${strings[key]}',\n`;
          }
        });
        
        // Erros Específicos
        newStringsText += '\n      // Erros Específicos\n';
        const errorKeys = Object.keys(strings).filter(key => key.includes('Error'));
        errorKeys.forEach(key => {
          newStringsText += `      ${key}: '${strings[key]}',\n`;
        });
        
        // Interface do Usuário
        newStringsText += '\n      // Interface do Usuário\n';
        const uiKeys = ['tryAgain', 'retry', 'reload', 'refresh', 'close', 'open', 'show', 'hide', 'expand', 'collapse', 'minimize', 'maximize', 'fullscreen', 'exitFullscreen', 'previous', 'next', 'first', 'last', 'more', 'less'];
        uiKeys.forEach(key => {
          if (strings[key]) {
            newStringsText += `      ${key}: '${strings[key]}',\n`;
          }
        });
        
        // Academia Específica
        newStringsText += '\n      // Academia Específica\n';
        const academyKeys = ['modality', 'modalities', 'instructor', 'instructors', 'administrator', 'administrators', 'schedule', 'schedules', 'lesson', 'lessons', 'training', 'trainings', 'session', 'sessions', 'academy'];
        academyKeys.forEach(key => {
          if (strings[key]) {
            newStringsText += `      ${key}: '${strings[key]}',\n`;
          }
        });
        
        // Formulários Avançados
        newStringsText += '\n      // Formulários Avançados\n';
        const formKeys = Object.keys(strings).filter(key => key.includes('select') || key.includes('File'));
        formKeys.forEach(key => {
          newStringsText += `      ${key}: '${strings[key]}',\n`;
        });
        
        // Tempo e Datas
        newStringsText += '\n      // Tempo e Datas\n';
        const timeKeys = ['never', 'always', 'sometimes', 'recently', 'soon', 'later', 'earlier', 'now', 'justNow', 'longTimeAgo'];
        timeKeys.forEach(key => {
          if (strings[key]) {
            newStringsText += `      ${key}: '${strings[key]}',\n`;
          }
        });
        
        newStringsText += '      // === FIM EXPANSÃO 50% ===\n';
        
        // Inserir as novas strings
        const beforeStrings = content.substring(0, stringsEnd);
        const afterStrings = content.substring(stringsEnd);
        
        content = beforeStrings + newStringsText + afterStrings;
        
        console.log(`   ✅ ${Object.keys(strings).length} strings adicionadas para ${lang}`);
      } else {
        console.log(`   ⚠️  Seção ${lang} não encontrada`);
      }
    });
    
    // Salvar arquivo modificado
    fs.writeFileSync(THEME_FILE, content);
    console.log('\n✅ Arquivo salvo com sucesso!');
    
    // Relatório
    const totalStrings = Object.values(CRITICAL_STRINGS_50_PERCENT).reduce((total, strings) => {
      return total + Object.keys(strings).length;
    }, 0);
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 RELATÓRIO DE EXPANSÃO PARA 50% DE COBERTURA');
    console.log('='.repeat(70));
    console.log(`✅ Total de strings adicionadas: ${totalStrings}`);
    console.log(`✅ Idiomas atualizados: ${Object.keys(CRITICAL_STRINGS_50_PERCENT).length}`);
    console.log(`✅ Strings por idioma: ${Object.keys(CRITICAL_STRINGS_50_PERCENT.pt).length}`);
    
    console.log('\n📋 Categorias adicionadas:');
    console.log('   • Navegação e Interface: 20 strings');
    console.log('   • Erros Específicos: 25 strings');
    console.log('   • Interface do Usuário: 20 strings');
    console.log('   • Academia Específica: 15 strings');
    console.log('   • Formulários Avançados: 10 strings');
    console.log('   • Tempo e Datas: 10 strings');
    
    console.log('\n🎯 META: 50% de cobertura');
    console.log('   Strings disponíveis antes: ~542');
    console.log(`   Strings adicionadas agora: ${totalStrings}`);
    console.log(`   Total estimado: ~${542 + totalStrings}`);
    
    console.log('\n💡 Próximos passos:');
    console.log('   1. Executar migração automática das strings mais comuns');
    console.log('   2. Executar análise de cobertura para verificar progresso');
    console.log('   3. Migrar os 10 arquivos com mais strings hardcoded');
    console.log('   4. Testar a aplicação');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  expandTo50Percent();
}

module.exports = { expandTo50Percent, CRITICAL_STRINGS_50_PERCENT };
