// Import design tokens
import { COLORS } from '@presentation/theme/designTokens';
import { LIGHT_THEME } from '@presentation/theme/lightTheme';

export const languages = {
  pt: {
    code: 'pt',
    name: 'Português',
    flag: '🇧🇷',
    strings: {
      // ERRORS
      error: 'Erro',
      networkError: 'Erro de conexão. Verifique sua internet e tente novamente.',
      academyIdNotFound: 'Academia ID não encontrado',
      userProfileNotFound: 'Perfil do usuário não encontrado',
      classNotFound: 'Turma não encontrada',
      studentNotFound: 'Aluno não encontrado',
      dataLoadError: 'Não foi possível carregar os dados. Tente novamente.',
      saveError: 'Não foi possível salvar. Tente novamente.',
      deleteError: 'Não foi possível excluir. Tente novamente.',
      updateError: 'Não foi possível atualizar. Tente novamente.',
      permissionDenied: 'Permissão negada',
      sessionExpired: 'Sessão expirada',
      connectionTimeout: 'Tempo limite de conexão excedido',
      serverError: 'Erro no servidor. Tente novamente mais tarde.',
      validationError: 'Dados inválidos. Verifique os campos.',
      rateLimitExceeded: 'Muitas tentativas. Aguarde alguns minutos.',

      // ACTIONS
      create: 'Criar',
      add: 'Adicionar',
      edit: 'Editar',
      update: 'Atualizar',
      delete: 'Excluir',
      remove: 'Remover',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      export: 'Exportar',
      import: 'Importar',
      share: 'Compartilhar',
      copy: 'Copiar',
      paste: 'Colar',
      duplicate: 'Duplicar',
      archive: 'Arquivar',
      restore: 'Restaurar',
      refresh: 'Atualizar',
      reload: 'Recarregar',
      reset: 'Redefinir',
      clear: 'Limpar',

      // STATUS
      active: 'Ativo',
      inactive: 'Inativo',
      pending: 'Pendente',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      expired: 'Expirado',
      valid: 'Válido',
      invalid: 'Inválido',
      enabled: 'Habilitado',
      disabled: 'Desabilitado',
      available: 'Disponível',
      unavailable: 'Indisponível',
      visible: 'Visível',
      hidden: 'Oculto',

      // ACADEMY
      academy: 'Academia',
      student: 'Aluno',
      students: 'Alunos',
      instructor: 'Instrutor',
      instructors: 'Instrutores',
      class: 'Turma',
      classes: 'Turmas',
      graduation: 'Graduação',
      graduations: 'Graduações',
      belt: 'Faixa',
      belts: 'Faixas',
      modality: 'Modalidade',
      modalities: 'Modalidades',
      payment: 'Pagamento',
      payments: 'Pagamentos',
      schedule: 'Horário',
      schedules: 'Horários',
      lesson: 'Aula',
      lessons: 'Aulas',

      // COMMON
      yes: 'Sim',
      no: 'Não',
      ok: 'OK',
      cancel: 'Cancelar',
      save: 'Salvar',
      close: 'Fechar',
      open: 'Abrir',
      loading: 'Carregando...',
      saving: 'Salvando...',
      processing: 'Processando...',
      success: 'Sucesso',
      warning: 'Aviso',
      info: 'Informação',
      name: 'Nome',
      email: 'Email',
      phone: 'Telefone',
      address: 'Endereço',
      date: 'Data',
      time: 'Hora',
      description: 'Descrição',
      notes: 'Observações',
      total: 'Total',
      subtotal: 'Subtotal',
      discount: 'Desconto',
      fee: 'Taxa',
      free: 'Grátis',
      paid: 'Pago',
      overdue: 'Atrasado',
      currency: 'BRL',

      // NAVIGATION
      home: 'Início',
      dashboard: 'Dashboard',
      profile: 'Perfil',
      settings: 'Configurações',
      help: 'Ajuda',
      about: 'Sobre',
      logout: 'Sair',
      back: 'Voltar',
      next: 'Próximo',
      previous: 'Anterior',
      first: 'Primeiro',
      last: 'Último',

      // FORMS
      required: 'Obrigatório',
      optional: 'Opcional',
      select: 'Selecionar',
      choose: 'Escolher',
      upload: 'Enviar',
      download: 'Baixar',
      submit: 'Enviar',
      confirm: 'Confirmar',
      validate: 'Validar',
      verify: 'Verificar',

      // TIME
      today: 'Hoje',
      yesterday: 'Ontem',
      tomorrow: 'Amanhã',
      now: 'Agora mesmo',
      minutesAgo: 'minutos atrás',
      hoursAgo: 'horas atrás',
      daysAgo: 'dias atrás',
      weeksAgo: 'semanas atrás',
      monthsAgo: 'meses atrás',
      unknownDate: 'Data desconhecida',

      // ACTIVITIES
      newStudentRegistered: 'Novo aluno cadastrado',
      paymentReceived: 'Pagamento recebido',
      graduationRegistered: 'Graduação registrada',
      checkInRegistered: 'Check-in registrado',
      classScheduled: 'Aula agendada',
      announcementPosted: 'Aviso publicado',

      // DASHBOARD
      quickActions: 'Ações Rápidas',
      quickActionsSubtitle: 'Acesso direto às principais funcionalidades',
      checkIn: 'Check-in',
      viewCalendar: 'Ver Calendário',
      viewReports: 'Ver Relatórios',
      manageStudents: 'Gerenciar Alunos',
      manageStudentsSubtitle: 'Gerenciar alunos',
      manageClasses: 'Gerenciar Turmas',
      manageClassesSubtitle: 'Gerenciar turmas',
      managePayments: 'Gerenciar Pagamentos',
      viewGraduations: 'Ver Graduações',
      viewSchedule: 'Visualizar cronograma',
      recentActivities: 'Atividades Recentes',
      viewAllActivities: 'Ver Todas as Atividades',
      calendar: 'Calendário',
      classSchedule: 'Cronograma das Turmas',
      management: 'Gestão',
      settingsManagement: 'Preferências e gestão',
      accessManagementReports: 'Acessar Gestão e Relatórios',
      
      // USER & ADMIN
      hello: 'Olá',
      admin: 'Admin',
      academyAdministrator: 'Administrador da Academia',
      online: 'Online',
      code: 'Código',
      
      // STATS
      totalStudents: 'Total de Alunos',
      activeStudents: 'Alunos Ativos',
      pendingPaymentsCount: 'Pendências',
      monthlyFinancials: 'Financeiro do Mês',
      monthlyRevenue: 'Receita do Mês',
      pendingCount: 'Pendentes',
      overdueCount: 'Atrasados',
      alerts: 'Alertas',
      paymentsOverdue: 'pagamento(s) em atraso',
      manyPendingPayments: 'Muitos pagamentos pendentes',
      loadingAcademyInfo: 'Carregando informações da academia...',
      
      // ANNOUNCEMENTS
      announcements: 'Avisos',
      noAnnouncementsNow: 'Nenhum aviso no momento',
      highPriority: 'Alta Prioridade',
      
      // BELT LEVELS
      whiteBelt: 'Faixa Branca',
      yellowBelt: 'Faixa Amarela',
      orangeBelt: 'Faixa Laranja',
      greenBelt: 'Faixa Verde',
      blueBelt: 'Faixa Azul',
      purpleBelt: 'Faixa Roxa',
      brownBelt: 'Faixa Marrom',
      blackBelt: 'Faixa Preta',

      // MESSAGES
      functionalityInDevelopment: 'Funcionalidade em desenvolvimento',
      errorLoadingAnnouncements: 'Erro ao carregar anúncios',
      errorLoadingData: 'Erro ao carregar dados',
      couldNotLoadAnnouncements: 'Não foi possível carregar os anúncios. Tente novamente mais tarde.',
      loadingInstructorDashboard: 'Carregando dashboard do instrutor',
      loadingStudentDashboard: 'Carregando dashboard do aluno',
      loadingAdminDashboard: 'Carregando dashboard do administrador',
      studentsLoaded: 'Alunos carregados',
      errorSearchingStudents: 'Erro ao buscar alunos',
      errorFormattingDate: 'Erro ao formatar data',
      couldNotLoadData: 'Não foi possível carregar os dados. Tente novamente.',
      tryAgainLater: 'Tente novamente mais tarde',

      // DAYS OF WEEK
      sunday: 'Domingo',
      monday: 'Segunda',
      tuesday: 'Terça',
      wednesday: 'Quarta',
      thursday: 'Quinta',
      friday: 'Sexta',
      saturday: 'Sábado',

      // MONTHS
      january: 'Janeiro',
      february: 'Fevereiro',
      march: 'Março',
      april: 'Abril',
      may: 'Maio',
      june: 'Junho',
      july: 'Julho',
      august: 'Agosto',
      september: 'Setembro',
      october: 'Outubro',
      november: 'Novembro',
      december: 'Dezembro',

      // SYSTEM
      system: 'system',
      colorWhite: '#FFFFFF'
    }
  },

  en: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    strings: {
      // ERRORS
      error: 'Error',
      networkError: 'Connection error. Check your internet and try again.',
      academyIdNotFound: 'Academy ID not found',
      userProfileNotFound: 'User profile not found',
      classNotFound: 'Class not found',
      studentNotFound: 'Student not found',
      dataLoadError: 'Could not load data. Please try again.',
      saveError: 'Could not save. Please try again.',
      deleteError: 'Could not delete. Please try again.',
      permissionDenied: 'Permission denied',
      sessionExpired: 'Session expired',
      connectionTimeout: 'Connection timeout exceeded',
      serverError: 'Server error. Please try again later.',
      validationError: 'Invalid data. Please check the fields.',
      rateLimitExceeded: 'Too many attempts. Please wait a few minutes.',
      reload: 'Reload',
      reset: 'Reset',
      clear: 'Clear',

      // STATUS
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      completed: 'Completed',
      cancelled: 'Cancelled',
      expired: 'Expired',
      valid: 'Valid',
      invalid: 'Invalid',
      enabled: 'Enabled',
      disabled: 'Disabled',
      available: 'Available',
      unavailable: 'Unavailable',
      visible: 'Visible',
      hidden: 'Hidden',

      // ACADEMY
      academy: 'Academy',
      student: 'Student',
      students: 'Students',
      instructor: 'Instructor',
      instructors: 'Instructors',
      class: 'Class',
      classes: 'Classes',
      graduation: 'Graduation',
      graduations: 'Graduations',
      belt: 'Belt',
      belts: 'Belts',
      modality: 'Modality',
      modalities: 'Modalities',
      payment: 'Payment',
      payments: 'Payments',
      schedule: 'Schedule',
      schedules: 'Schedules',
      lesson: 'Lesson',
      lessons: 'Lessons',

      // COMMON
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      cancel: 'Cancel',
      save: 'Save',
      close: 'Close',
      open: 'Open',
      loading: 'Loading...',
      saving: 'Saving...',
      processing: 'Processing...',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      date: 'Date',
      time: 'Time',
      description: 'Description',
      notes: 'Notes',
      total: 'Total',
      subtotal: 'Subtotal',
      discount: 'Discount',
      fee: 'Fee',
      free: 'Free',
      paid: 'Paid',
      overdue: 'Overdue',
      currency: 'USD',

      // NAVIGATION
      home: 'Home',
      dashboard: 'Dashboard',
      profile: 'Profile',
      settings: 'Settings',
      help: 'Help',
      about: 'About',
      logout: 'Logout',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      first: 'First',
      last: 'Last',

      // FORMS
      required: 'Required',
      optional: 'Optional',
      select: 'Select',
      choose: 'Choose',
      upload: 'Upload',
      download: 'Download',
      submit: 'Submit',
      confirm: 'Confirm',
      validate: 'Validate',
      verify: 'Verify',

      // TIME
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      now: 'Just now',
      minutesAgo: 'minutes ago',
      hoursAgo: 'hours ago',
      daysAgo: 'days ago',
      weeksAgo: 'weeks ago',
      monthsAgo: 'months ago',
      unknownDate: 'Unknown date',

      // ACTIVITIES
      newStudentRegistered: 'New student registered',
      paymentReceived: 'Payment received',
      graduationRegistered: 'Graduation registered',
      checkInRegistered: 'Check-in registered',
      classScheduled: 'Class scheduled',
      announcementPosted: 'Announcement posted',

      // DASHBOARD
      quickActions: 'Quick Actions',
      quickActionsSubtitle: 'Direct access to main features',
      checkIn: 'Check-in',
      viewCalendar: 'View Calendar',
      viewReports: 'View Reports',
      manageStudents: 'Manage Students',
      manageStudentsSubtitle: 'Manage students',
      manageClasses: 'Manage Classes',
      manageClassesSubtitle: 'Manage classes',
      managePayments: 'Manage Payments',
      viewGraduations: 'View Graduations',
      viewSchedule: 'View schedule',
      recentActivities: 'Recent Activities',
      viewAllActivities: 'View All Activities',
      calendar: 'Calendar',
      classSchedule: 'Class Schedule',
      management: 'Management',
      settingsManagement: 'Preferences and management',
      accessManagementReports: 'Access Management and Reports',
      
      // USER & ADMIN
      hello: 'Hello',
      admin: 'Admin',
      academyAdministrator: 'Academy Administrator',
      online: 'Online',
      code: 'Code',
      
      // STATS
      totalStudents: 'Total Students',
      activeStudents: 'Active Students',
      pendingPaymentsCount: 'Pending',
      monthlyFinancials: 'Monthly Financials',
      monthlyRevenue: 'Monthly Revenue',
      pendingCount: 'Pending',
      overdueCount: 'Overdue',
      alerts: 'Alerts',
      paymentsOverdue: 'overdue payment(s)',
      manyPendingPayments: 'Many pending payments',
      loadingAcademyInfo: 'Loading academy information...',
      
      // ANNOUNCEMENTS
      announcements: 'Announcements',
      noAnnouncementsNow: 'No announcements at the moment',
      highPriority: 'High Priority',
      
      // BELT LEVELS
      whiteBelt: 'White Belt',
      yellowBelt: 'Yellow Belt',
      orangeBelt: 'Orange Belt',
      greenBelt: 'Green Belt',
      blueBelt: 'Blue Belt',
      purpleBelt: 'Purple Belt',
      brownBelt: 'Brown Belt',
      blackBelt: 'Black Belt',

      // MESSAGES
      functionalityInDevelopment: 'Feature under development',
      errorLoadingAnnouncements: 'Error loading announcements',
      errorLoadingData: 'Error loading data',
      couldNotLoadAnnouncements: 'Could not load announcements. Please try again later.',
      loadingInstructorDashboard: 'Loading instructor dashboard',
      loadingStudentDashboard: 'Loading student dashboard',
      loadingAdminDashboard: 'Loading admin dashboard',
      studentsLoaded: 'Students loaded',
      errorSearchingStudents: 'Error searching students',
      errorFormattingDate: 'Error formatting date',
      couldNotLoadData: 'Could not load data. Please try again.',
      tryAgainLater: 'Please try again later'
    }
  },

  es: {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
    strings: {
      // ERRORS
      error: 'Error',
      networkError: 'Error de conexión. Verifique su internet e intente nuevamente.',
      academyIdNotFound: 'ID de academia no encontrado',
      userProfileNotFound: 'Perfil de usuario no encontrado',
      classNotFound: 'Clase no encontrada',
      studentNotFound: 'Estudiante no encontrado',
      dataLoadError: 'No se pudieron cargar los datos. Intente nuevamente.',
      saveError: 'No se pudo guardar. Intente nuevamente.',
      deleteError: 'No se pudo eliminar. Intente nuevamente.',
      updateError: 'No se pudo actualizar. Intente nuevamente.',
      permissionDenied: 'Permiso denegado',
      sessionExpired: 'Sesión expirada',
      connectionTimeout: 'Tiempo límite de conexión excedido',
      serverError: 'Error del servidor. Intente nuevamente más tarde.',
      validationError: 'Datos inválidos. Verifique los campos.',
      rateLimitExceeded: 'Demasiados intentos. Espere unos minutos.',

      // ACTIONS
      create: 'Crear',
      add: 'Agregar',
      edit: 'Editar',
      update: 'Actualizar',
      delete: 'Eliminar',
      remove: 'Remover',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      export: 'Exportar',
      import: 'Importar',
      share: 'Compartir',
      copy: 'Copiar',
      paste: 'Pegar',
      duplicate: 'Duplicar',
      archive: 'Archivar',
      restore: 'Restaurar',
      refresh: 'Actualizar',
      reload: 'Recargar',
      reset: 'Restablecer',
      clear: 'Limpiar',

      // STATUS
      active: 'Activo',
      inactive: 'Inactivo',
      pending: 'Pendiente',
      completed: 'Completado',
      cancelled: 'Cancelado',
      expired: 'Expirado',
      valid: 'Válido',
      invalid: 'Inválido',
      enabled: 'Habilitado',
      disabled: 'Deshabilitado',
      available: 'Disponible',
      unavailable: 'No disponible',
      visible: 'Visible',
      hidden: 'Oculto',

      // ACADEMY
      academy: 'Academia',
      student: 'Estudiante',
      students: 'Estudiantes',
      instructor: 'Instructor',
      instructors: 'Instructores',
      class: 'Clase',
      classes: 'Clases',
      graduation: 'Graduación',
      graduations: 'Graduaciones',
      belt: 'Cinturón',
      belts: 'Cinturones',
      modality: 'Modalidad',
      modalities: 'Modalidades',
      payment: 'Pago',
      payments: 'Pagos',
      schedule: 'Horario',
      schedules: 'Horarios',
      lesson: 'Lección',
      lessons: 'Lecciones',

      // COMMON
      yes: 'Sí',
      no: 'No',
      ok: 'OK',
      cancel: 'Cancelar',
      save: 'Guardar',
      close: 'Cerrar',
      open: 'Abrir',
      loading: 'Cargando...',
      saving: 'Guardando...',
      processing: 'Procesando...',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información',
      name: 'Nombre',
      email: 'Email',
      phone: 'Teléfono',
      address: 'Dirección',
      date: 'Fecha',
      time: 'Hora',
      description: 'Descripción',
      notes: 'Observaciones',
      total: 'Total',
      subtotal: 'Subtotal',
      discount: 'Descuento',
      fee: 'Tarifa',
      free: 'Gratis',
      paid: 'Pagado',
      overdue: 'Vencido',
      currency: 'EUR',

      // NAVIGATION
      home: 'Inicio',
      dashboard: 'Panel',
      profile: 'Perfil',
      settings: 'Configuraciones',
      help: 'Ayuda',
      about: 'Acerca de',
      logout: 'Cerrar sesión',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      first: 'Primero',
      last: 'Último',

      // FORMS
      required: 'Requerido',
      optional: 'Opcional',
      select: 'Seleccionar',
      choose: 'Elegir',
      upload: 'Subir',
      download: 'Descargar',
      submit: 'Enviar',
      confirm: 'Confirmar',
      validate: 'Validar',
      verify: 'Verificar',

      // TIME
      today: 'Hoy',
      yesterday: 'Ayer',
      tomorrow: 'Mañana',
      now: 'Ahora mismo',
      minutesAgo: 'minutos atrás',
      hoursAgo: 'horas atrás',
      daysAgo: 'días atrás',
      weeksAgo: 'semanas atrás',
      monthsAgo: 'meses atrás',
      unknownDate: 'Fecha desconocida',

      // ACTIVITIES
      newStudentRegistered: 'Nuevo estudiante registrado',
      paymentReceived: 'Pago recibido',
      graduationRegistered: 'Graduación registrada',
      checkInRegistered: 'Check-in registrado',
      classScheduled: 'Clase programada',
      announcementPosted: 'Aviso publicado',

      // DASHBOARD
      quickActions: 'Acciones Rápidas',
      quickActionsSubtitle: 'Acceso directo a las principales funcionalidades',
      checkIn: 'Check-in',
      viewCalendar: 'Ver Calendario',
      viewReports: 'Ver Informes',
      manageStudents: 'Gestionar Estudiantes',
      manageStudentsSubtitle: 'Gestionar estudiantes',
      manageClasses: 'Gestionar Clases',
      manageClassesSubtitle: 'Gestionar clases',
      managePayments: 'Gestionar Pagos',
      viewGraduations: 'Ver Graduaciones',
      viewSchedule: 'Ver cronograma',
      recentActivities: 'Actividades Recientes',
      viewAllActivities: 'Ver Todas las Actividades',
      calendar: 'Calendario',
      classSchedule: 'Cronograma de Clases',
      management: 'Gestión',
      settingsManagement: 'Preferencias y gestión',
      accessManagementReports: 'Acceder a Gestión e Informes',
      
      // USER & ADMIN
      hello: 'Hola',
      admin: 'Admin',
      academyAdministrator: 'Administrador de la Academia',
      online: 'En línea',
      code: 'Código',
      
      // STATS
      totalStudents: 'Total de Estudiantes',
      activeStudents: 'Estudiantes Activos',
      pendingPaymentsCount: 'Pendientes',
      monthlyFinancials: 'Financiero del Mes',
      monthlyRevenue: 'Ingresos del Mes',
      pendingCount: 'Pendientes',
      overdueCount: 'Vencidos',
      alerts: 'Alertas',
      paymentsOverdue: 'pago(s) vencido(s)',
      manyPendingPayments: 'Muchos pagos pendientes',
      loadingAcademyInfo: 'Cargando información de la academia...',
      
      // ANNOUNCEMENTS
      announcements: 'Avisos',
      noAnnouncementsNow: 'Ningún aviso en este momento',
      highPriority: 'Alta Prioridad',
      
      // BELT LEVELS
      whiteBelt: 'Cinturón Blanco',
      yellowBelt: 'Cinturón Amarillo',
      orangeBelt: 'Cinturón Naranja',
      greenBelt: 'Cinturón Verde',
      blueBelt: 'Cinturón Azul',
      purpleBelt: 'Cinturón Morado',
      brownBelt: 'Cinturón Marrón',
      blackBelt: 'Cinturón Negro',

      // MESSAGES
      functionalityInDevelopment: 'Funcionalidad en desarrollo',
      errorLoadingAnnouncements: 'Error al cargar avisos',
      errorLoadingData: 'Error al cargar datos',
      couldNotLoadAnnouncements: 'No se pudieron cargar los avisos. Intente nuevamente más tarde.',
      loadingInstructorDashboard: 'Cargando panel del instructor',
      loadingStudentDashboard: 'Cargando panel del estudiante',
      loadingAdminDashboard: 'Cargando panel del administrador',
      studentsLoaded: 'Estudiantes cargados',
      errorSearchingStudents: 'Error al buscar estudiantes',
      errorFormattingDate: 'Error al formatear fecha',
      couldNotLoadData: 'No se pudieron cargar los datos. Intente nuevamente.',
      tryAgainLater: 'Intente nuevamente más tarde'
    }
  }
};

// Helper functions
export const getString = (key, language = 'pt') => {
  try {
    return languages[language]?.strings?.[key] || key;
  } catch (error) {
    console.warn(`Translation key "${key}" not found for language "${language}"`);
    return key;
  }
};

export const getLanguages = () => {
  return Object.keys(languages).map(code => ({
    code,
    name: languages[code].name,
    flag: languages[code].flag
  }));
};

export const isLanguageSupported = (language) => {
  return Object.keys(languages).includes(language);
};

// Temas básicos usando design tokens
export const lightTheme = {
  colors: {
    primary: COLORS.primary[500],
    primaryVariant: COLORS.primary[700],
    secondary: COLORS.secondary[500],
    background: LIGHT_THEME.background.default,
    surface: LIGHT_THEME.background.paper,
    card: LIGHT_THEME.background.paper,
    text: LIGHT_THEME.text.primary,
    accent: COLORS.info[500],
    textSecondary: LIGHT_THEME.text.secondary,
    textDisabled: LIGHT_THEME.text.disabled,
  }
};

export const darkTheme = {
  colors: {
    primary: COLORS.primary[400],
    primaryVariant: COLORS.primary[300],
    secondary: COLORS.secondary[400],
    background: COLORS.gray[900],
    surface: COLORS.gray[800],
    card: COLORS.gray[800],
    text: COLORS.white,
    accent: COLORS.info[400],
    textSecondary: COLORS.gray[300],
    textDisabled: COLORS.gray[500],
  }
};

// Função para obter tema baseado no tipo de usuário
export const getThemeForUserType = (userType = 'student', isDarkMode = false) => {
  const baseTheme = isDarkMode ? darkTheme : lightTheme;
  
  // Cores específicas por tipo de usuário usando design tokens
  const userColors = {
    student: {
      primary: isDarkMode ? COLORS.info[400] : COLORS.primary[500],
      accent: isDarkMode ? COLORS.info[300] : COLORS.info[500],
    },
    instructor: {
      primary: isDarkMode ? COLORS.secondary[400] : COLORS.secondary[600],
      accent: isDarkMode ? COLORS.secondary[300] : COLORS.secondary[500],
    },
    admin: {
      primary: isDarkMode ? COLORS.primary[400] : COLORS.primary[700],
      accent: isDarkMode ? COLORS.primary[300] : COLORS.primary[600],
    }
  };

  const colors = userColors[userType] || userColors.student;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      accent: colors.accent,
    },
    userType,
    isDarkMode
  };
};

export default languages;
