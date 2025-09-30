/**
 * Paleta de Cores Centralizada - MyGym App
 * 
 * Este arquivo centraliza todas as cores do aplicativo, incluindo:
 * - Paleta principal (base para todo o app)
 * - Cores específicas de cada perfil (Aluno, Instrutor, Administrador)
 * - Cores de status e utilidades
 */

// ============================================
// PALETA PRINCIPAL (BASE DO APLICATIVO)
// ============================================

export const APP_COLORS = {
  black: '#0D0D0D',
  darkGray: '#262626',
  white: '#FFFFFF',
  vibrantRed: '#FF3B3B',
  
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: COLORS.gray[400],
    500: COLORS.gray[500],
    600: COLORS.gray[600],
    700: '#616161',
    800: '#424242',
    900: '#262626',
  },
};

// ============================================
// CORES POR PERFIL DE USUÁRIO
// ============================================

export const PROFILE_COLORS = {
  student: {
    primary: '#007BFF',
    primaryLight: '#3395FF',
    primaryDark: '#0056B3',
    gradient: ['#007BFF', '#0056B3'],
    surface: '#E7F3FF',
    background: '#F5FAFF',
  },
  
  instructor: {
    primary: '#2ECC71',
    primaryLight: '#58D68D',
    primaryDark: '#27AE60',
    gradient: ['#2ECC71', '#27AE60'],
    surface: '#E8F8F0',
    background: '#F4FBF7',
  },
  
  admin: {
    primary: COLORS.warning[300],
    primaryLight: '#FFE44D',
    primaryDark: '#E6C200',
    gradient: [COLORS.warning[300], '#E6C200'],
    surface: '#FFF9E6',
    background: '#FFFDF5',
  },
};

// ============================================
// CORES DE STATUS
// ============================================

export const STATUS_COLORS = {
  success: '#2ECC71',
  successLight: '#58D68D',
  successDark: '#27AE60',
  successGradient: ['#2ECC71', '#27AE60'],
  
  warning: '#FFA500',
  warningLight: '#FFB733',
  warningDark: COLORS.warning[600],
  warningGradient: ['#FFA500', COLORS.warning[600]],
  
  error: '#FF3B3B',
  errorLight: '#FF6B6B',
  errorDark: '#D32F2F',
  errorGradient: ['#FF3B3B', '#D32F2F'],
  
  info: '#007BFF',
  infoLight: '#3395FF',
  infoDark: '#0056B3',
  infoGradient: ['#007BFF', '#0056B3'],
};

// ============================================
// CORES DE TEXTO
// ============================================

export const TEXT_COLORS = {
  primary: '#0D0D0D',
  secondary: '#424242',
  disabled: COLORS.gray[500],
  inverse: '#FFFFFF',
  onPrimary: '#FFFFFF',
  onBackground: '#0D0D0D',
  onSurface: '#0D0D0D',
};

// ============================================
// CORES DE FAIXA (GRADUAÇÃO)
// ============================================

export const BELT_COLORS = {
  branca: '#FFFFFF',
  cinza: '#808080',
  amarela: '#FFEB3B',
  laranja: COLORS.warning[500],
  verde: COLORS.primary[500],
  azul: COLORS.info[500],
  roxa: COLORS.secondary[500],
  marrom: '#795548',
  preta: '#000000',
};

// ============================================
// TEMAS (CLARO/ESCURO)
// ============================================

export const LIGHT_THEME = {
  background: APP_COLORS.white,
  surface: APP_COLORS.gray[50],
  card: APP_COLORS.white,
  border: APP_COLORS.gray[300],
  text: TEXT_COLORS.primary,
  textSecondary: TEXT_COLORS.secondary,
  disabled: TEXT_COLORS.disabled,
};

export const DARK_THEME = {
  background: APP_COLORS.black,
  surface: APP_COLORS.darkGray,
  card: '#1A1A1A',
  border: APP_COLORS.gray[700],
  text: TEXT_COLORS.inverse,
  textSecondary: APP_COLORS.gray[400],
  disabled: APP_COLORS.gray[600],
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Retorna as cores do perfil baseado no tipo de usuário
 * @param {string} userType - 'student', 'instructor', 'admin'
 * @returns {object} Objeto com as cores do perfil
 */
export const getProfileColors = (userType) => {
  const normalized = userType?.toLowerCase();
  
  if (normalized === 'student' || normalized === 'aluno') {
    return PROFILE_COLORS.student;
  }
  
  if (normalized === 'instructor' || normalized === 'instrutor') {
    return PROFILE_COLORS.instructor;
  }
  
  if (normalized === 'admin' || normalized === 'administrador') {
    return PROFILE_COLORS.admin;
  }
  
  return PROFILE_COLORS.student;
};

/**
 * Retorna a cor primária do perfil
 * @param {string} userType - 'student', 'instructor', 'admin'
 * @returns {string} Cor primária em formato hex
 */
export const getPrimaryColor = (userType) => {
  return getProfileColors(userType).primary;
};

/**
 * Retorna o gradiente do perfil
 * @param {string} userType - 'student', 'instructor', 'admin'
 * @returns {array} Array com as cores do gradiente
 */
export const getProfileGradient = (userType) => {
  return getProfileColors(userType).gradient;
};

/**
 * Retorna a cor da faixa baseado no nome
 * @param {string} beltName - Nome da faixa
 * @returns {string} Cor em formato hex
 */
export const getBeltColor = (beltName) => {
  const normalized = beltName?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return BELT_COLORS[normalized] || APP_COLORS.gray[300];
};

/**
 * Retorna a cor de status baseado no nível
 * @param {string} level - 'success', 'warning', 'error', 'info'
 * @returns {string} Cor em formato hex
 */
export const getStatusColor = (level) => {
  return STATUS_COLORS[level] || STATUS_COLORS.info;
};

// Exportação default com todas as cores
export default {
  APP_COLORS,
  PROFILE_COLORS,
  STATUS_COLORS,
  TEXT_COLORS,
  BELT_COLORS,
  LIGHT_THEME,
  DARK_THEME,
  getProfileColors,
  getPrimaryColor,
  getProfileGradient,
  getBeltColor,
  getStatusColor,
};
