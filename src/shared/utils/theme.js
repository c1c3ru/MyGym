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
      verify: 'Verificar'
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
      verify: 'Verify'
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
      verify: 'Verificar'
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
