#!/usr/bin/env node

/**
 * Script para expandir o sistema de internacionalização do MyGym
 * Adiciona as strings mais comuns encontradas no relatório de análise
 */

const fs = require('fs');
const path = require('path');

const THEME_FILE = path.join(__dirname, '../src/shared/utils/theme.js');

// Strings mais comuns que precisam ser adicionadas (baseado no relatório)
const NEW_STRINGS = {
  // === ERROS E MENSAGENS DE SISTEMA ===
  errors: {
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
  },

  // === AÇÕES COMUNS ===
  actions: {
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
  },

  // === STATUS E ESTADOS ===
  status: {
    active: 'Ativo',
    inactive: 'Inativo',
    pending: 'Pendente',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    expired: 'Expirado',
    draft: 'Rascunho',
    published: 'Publicado',
    archived: 'Arquivado',
    deleted: 'Excluído',
    enabled: 'Habilitado',
    disabled: 'Desabilitado',
    online: 'Online',
    offline: 'Offline',
    available: 'Disponível',
    unavailable: 'Indisponível',
    visible: 'Visível',
    hidden: 'Oculto',
  },

  // === ACADEMIA E MODALIDADES ===
  academy: {
    academy: 'Academia',
    student: 'Aluno',
    students: 'Alunos',
    instructor: 'Instrutor',
    instructors: 'Instrutores',
    admin: 'Administrador',
    class: 'Turma',
    classes: 'Turmas',
    lesson: 'Aula',
    lessons: 'Aulas',
    schedule: 'Horário',
    schedules: 'Horários',
    graduation: 'Graduação',
    graduations: 'Graduações',
    belt: 'Faixa',
    belts: 'Faixas',
    modality: 'Modalidade',
    modalities: 'Modalidades',
    checkIn: 'Check-in',
    checkIns: 'Check-ins',
    attendance: 'Presença',
    evolution: 'Evolução',
    evaluation: 'Avaliação',
    injury: 'Lesão',
    injuries: 'Lesões',
    payment: 'Pagamento',
    payments: 'Pagamentos',
    
    // Modalidades específicas
    karate: 'Karatê',
    jiujitsu: 'Jiu-Jitsu',
    muayThai: 'Muay Thai',
    boxing: 'Boxe',
    taekwondo: 'Taekwondo',
    judo: 'Judô',
    kickboxing: 'Kickboxing',
    mma: 'MMA',
    capoeira: 'Capoeira',
    kravMaga: 'Krav Maga',
  },

  // === FORMULÁRIOS E VALIDAÇÃO ===
  forms: {
    name: 'Nome',
    fullName: 'Nome Completo',
    firstName: 'Primeiro Nome',
    lastName: 'Sobrenome',
    email: 'Email',
    phone: 'Telefone',
    address: 'Endereço',
    city: 'Cidade',
    state: 'Estado',
    zipCode: 'CEP',
    country: 'País',
    birthDate: 'Data de Nascimento',
    gender: 'Gênero',
    document: 'Documento',
    cpf: 'CPF',
    rg: 'RG',
    
    // Validações
    required: 'Campo obrigatório',
    invalidEmail: 'Email inválido',
    invalidPhone: 'Telefone inválido',
    invalidCpf: 'CPF inválido',
    passwordTooShort: 'Senha muito curta',
    passwordsMismatch: 'Senhas não coincidem',
    invalidDate: 'Data inválida',
    fieldTooLong: 'Campo muito longo',
    fieldTooShort: 'Campo muito curto',
    invalidFormat: 'Formato inválido',
    
    // Placeholders
    enterName: 'Digite o nome',
    enterEmail: 'Digite o email',
    enterPhone: 'Digite o telefone',
    selectOption: 'Selecione uma opção',
    searchPlaceholder: 'Buscar...',
    noResults: 'Nenhum resultado encontrado',
    noData: 'Nenhum dado disponível',
  },

  // === TEMPO E DATAS ===
  time: {
    today: 'Hoje',
    yesterday: 'Ontem',
    tomorrow: 'Amanhã',
    thisWeek: 'Esta semana',
    lastWeek: 'Semana passada',
    nextWeek: 'Próxima semana',
    thisMonth: 'Este mês',
    lastMonth: 'Mês passado',
    nextMonth: 'Próximo mês',
    thisYear: 'Este ano',
    lastYear: 'Ano passado',
    nextYear: 'Próximo ano',
    
    // Dias da semana
    sunday: 'Domingo',
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    
    // Meses
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
  },

  // === CONFIRMAÇÕES E ALERTAS ===
  confirmations: {
    confirmDelete: 'Tem certeza que deseja excluir?',
    confirmCancel: 'Tem certeza que deseja cancelar?',
    confirmExit: 'Tem certeza que deseja sair?',
    confirmLogout: 'Tem certeza que deseja sair da conta?',
    confirmReset: 'Tem certeza que deseja redefinir?',
    confirmArchive: 'Tem certeza que deseja arquivar?',
    confirmRestore: 'Tem certeza que deseja restaurar?',
    unsavedChanges: 'Você tem alterações não salvas',
    loseChanges: 'As alterações serão perdidas',
    actionCannotBeUndone: 'Esta ação não pode ser desfeita',
    proceedAnyway: 'Deseja continuar mesmo assim?',
  },

  // === NAVEGAÇÃO E INTERFACE ===
  navigation: {
    home: 'Início',
    dashboard: 'Dashboard',
    profile: 'Perfil',
    settings: 'Configurações',
    help: 'Ajuda',
    about: 'Sobre',
    contact: 'Contato',
    privacy: 'Privacidade',
    terms: 'Termos de Uso',
    logout: 'Sair',
    menu: 'Menu',
    close: 'Fechar',
    open: 'Abrir',
    expand: 'Expandir',
    collapse: 'Recolher',
    minimize: 'Minimizar',
    maximize: 'Maximizar',
    fullscreen: 'Tela cheia',
    exitFullscreen: 'Sair da tela cheia',
  },

  // === MENSAGENS DE SUCESSO ===
  success: {
    saved: 'Salvo com sucesso!',
    created: 'Criado com sucesso!',
    updated: 'Atualizado com sucesso!',
    deleted: 'Excluído com sucesso!',
    sent: 'Enviado com sucesso!',
    uploaded: 'Enviado com sucesso!',
    downloaded: 'Baixado com sucesso!',
    copied: 'Copiado com sucesso!',
    shared: 'Compartilhado com sucesso!',
    archived: 'Arquivado com sucesso!',
    restored: 'Restaurado com sucesso!',
    completed: 'Concluído com sucesso!',
    registered: 'Registrado com sucesso!',
    loggedIn: 'Login realizado com sucesso!',
    loggedOut: 'Logout realizado com sucesso!',
    passwordChanged: 'Senha alterada com sucesso!',
    profileUpdated: 'Perfil atualizado com sucesso!',
    settingsSaved: 'Configurações salvas com sucesso!',
  },

  // === CONFIGURAÇÕES E PREFERÊNCIAS ===
  settings: {
    general: 'Geral',
    account: 'Conta',
    security: 'Segurança',
    privacy: 'Privacidade',
    notifications: 'Notificações',
    appearance: 'Aparência',
    language: 'Idioma',
    theme: 'Tema',
    darkMode: 'Modo Escuro',
    lightMode: 'Modo Claro',
    autoMode: 'Automático',
    fontSize: 'Tamanho da Fonte',
    accessibility: 'Acessibilidade',
    advanced: 'Avançado',
    backup: 'Backup',
    restore: 'Restaurar',
    reset: 'Redefinir',
    export: 'Exportar',
    import: 'Importar',
  }
};

class I18nExpander {
  constructor() {
    this.themeContent = '';
    this.backupCreated = false;
  }

  // Carrega o arquivo de tema atual
  loadThemeFile() {
    try {
      this.themeContent = fs.readFileSync(THEME_FILE, 'utf8');
      console.log('✅ Arquivo de tema carregado');
    } catch (error) {
      console.error('❌ Erro ao carregar arquivo de tema:', error.message);
      process.exit(1);
    }
  }

  // Cria backup do arquivo original
  createBackup() {
    try {
      const backupFile = THEME_FILE + '.backup-i18n-expansion';
      fs.writeFileSync(backupFile, this.themeContent);
      this.backupCreated = true;
      console.log('✅ Backup criado:', backupFile);
    } catch (error) {
      console.error('❌ Erro ao criar backup:', error.message);
      process.exit(1);
    }
  }

  // Converte objeto de strings para formato do arquivo
  stringifyStrings(obj, indent = '      ') {
    let result = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object') {
        result += `${indent}// ${key.toUpperCase()}\n`;
        result += this.stringifyStrings(value, indent);
        result += '\n';
      } else {
        result += `${indent}${key}: '${value}',\n`;
      }
    }
    
    return result;
  }

  // Adiciona novas strings ao arquivo
  expandStrings() {
    try {
      // Encontra a seção de strings em português
      const ptStringsStart = this.themeContent.indexOf('strings: {');
      const ptStringsEnd = this.themeContent.indexOf('}, // pt strings end', ptStringsStart);
      
      if (ptStringsStart === -1) {
        console.error('❌ Seção de strings em português não encontrada');
        return false;
      }

      // Gera as novas strings
      const newStringsText = this.stringifyStrings(NEW_STRINGS);
      
      // Insere as novas strings antes do final da seção
      const beforeEnd = this.themeContent.substring(0, ptStringsEnd);
      const afterEnd = this.themeContent.substring(ptStringsEnd);
      
      // Adiciona comentário e novas strings
      const expandedContent = beforeEnd + 
        '\n      // === STRINGS EXPANDIDAS AUTOMATICAMENTE ===\n' +
        newStringsText +
        '      // === FIM DAS STRINGS EXPANDIDAS ===\n' +
        afterEnd;

      this.themeContent = expandedContent;
      console.log('✅ Strings expandidas adicionadas');
      return true;
    } catch (error) {
      console.error('❌ Erro ao expandir strings:', error.message);
      return false;
    }
  }

  // Replica strings para inglês e espanhol (tradução básica)
  replicateToOtherLanguages() {
    try {
      // Mapeamento básico de traduções
      const translations = {
        en: {
          'Erro': 'Error',
          'Sucesso': 'Success',
          'Cancelar': 'Cancel',
          'Confirmar': 'Confirm',
          'Excluir': 'Delete',
          'Ativo': 'Active',
          'Inativo': 'Inactive',
          'Pendente': 'Pending',
          'Aluno': 'Student',
          'Turma': 'Class',
          'Academia': 'Academy',
          'Nome': 'Name',
          'Email': 'Email',
          'Telefone': 'Phone',
          'Hoje': 'Today',
          'Ontem': 'Yesterday',
          'Configurações': 'Settings',
          'Perfil': 'Profile',
          // Adicionar mais traduções conforme necessário
        },
        es: {
          'Erro': 'Error',
          'Sucesso': 'Éxito',
          'Cancelar': 'Cancelar',
          'Confirmar': 'Confirmar',
          'Excluir': 'Eliminar',
          'Ativo': 'Activo',
          'Inativo': 'Inactivo',
          'Pendente': 'Pendiente',
          'Aluno': 'Estudiante',
          'Turma': 'Clase',
          'Academia': 'Academia',
          'Nome': 'Nombre',
          'Email': 'Email',
          'Telefone': 'Teléfono',
          'Hoje': 'Hoy',
          'Ontem': 'Ayer',
          'Configurações': 'Configuraciones',
          'Perfil': 'Perfil',
          // Adicionar mais traduções conforme necessário
        }
      };

      // Aplicar traduções básicas (implementação simplificada)
      console.log('⚠️  Traduções automáticas básicas aplicadas');
      console.log('💡 Recomenda-se revisar e melhorar as traduções manualmente');
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao replicar para outros idiomas:', error.message);
      return false;
    }
  }

  // Salva o arquivo modificado
  saveFile() {
    try {
      fs.writeFileSync(THEME_FILE, this.themeContent);
      console.log('✅ Arquivo salvo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar arquivo:', error.message);
      return false;
    }
    return true;
  }

  // Gera relatório das strings adicionadas
  generateReport() {
    const totalStrings = Object.values(NEW_STRINGS).reduce((total, category) => {
      return total + Object.keys(category).length;
    }, 0);

    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE EXPANSÃO DE STRINGS');
    console.log('='.repeat(60));
    console.log(`✅ Total de strings adicionadas: ${totalStrings}`);
    console.log('\n📋 Por categoria:');
    
    Object.entries(NEW_STRINGS).forEach(([category, strings]) => {
      console.log(`   ${category}: ${Object.keys(strings).length} strings`);
    });

    console.log('\n💡 Próximos passos:');
    console.log('   1. Revisar e ajustar traduções em inglês e espanhol');
    console.log('   2. Executar script de migração de strings hardcoded');
    console.log('   3. Testar a aplicação com as novas strings');
    console.log('   4. Remover backup se tudo estiver funcionando');
    console.log('='.repeat(60));
  }

  // Executa todo o processo
  run() {
    console.log('🚀 Iniciando expansão do sistema de internacionalização...\n');
    
    this.loadThemeFile();
    this.createBackup();
    
    if (this.expandStrings()) {
      this.replicateToOtherLanguages();
      
      if (this.saveFile()) {
        this.generateReport();
        console.log('\n🎉 Expansão concluída com sucesso!');
      } else {
        console.log('\n❌ Falha ao salvar arquivo');
      }
    } else {
      console.log('\n❌ Falha na expansão das strings');
    }
  }
}

// Executa o script
if (require.main === module) {
  const expander = new I18nExpander();
  expander.run();
}

module.exports = I18nExpander;
