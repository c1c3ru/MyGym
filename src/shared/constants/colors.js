/**
 * Paleta de Cores Centralizada - MyGym App
 * 
 * Este arquivo centraliza todas as cores do aplicativo, incluindo:
 * - Paleta principal (base para todo o app)
 * - Cores específicas de cada perfil (Aluno, Instrutor, Administrador)
 * - Cores de status e utilidades
 * 
 * 🎨 NOVA PALETA: Tema escuro com vermelho coral (#FF4757)
 */

import { COLORS } from '@presentation/theme/designTokens';

// ============================================
// PALETA PRINCIPAL (BASE DO APLICATIVO)
// Referencia os Design Tokens para consistência
// ============================================

export const APP_COLORS = {
  black: COLORS.secondary[900],       // '#0D0D0D' - Preto profundo
  darkGray: COLORS.secondary[800],    // '#1A1A1A' - Cinza muito escuro
  white: COLORS.white,                // '#FFFFFF'
  vibrantRed: COLORS.primary[500],    // '#FF4757' - Vermelho coral (NOVO)
  
  gray: {
    50: COLORS.gray[50],              // '#FAFAFA'
    100: COLORS.gray[100],            // '#F5F5F5'
    200: COLORS.gray[200],            // '#EEEEEE'
    300: COLORS.gray[300],            // '#E0E0E0'
    400: COLORS.gray[400],            // '#BDBDBD'
    500: COLORS.gray[500],            // '#9E9E9E'
    600: COLORS.gray[600],            // '#757575'
    700: COLORS.gray[700],            // '#616161'
    800: COLORS.gray[800],            // '#424242'
    900: COLORS.gray[900],            // '#212121'
  },
};

// ============================================
// CORES POR PERFIL DE USUÁRIO
// 🥋 NOVA PALETA: Todos usam vermelho coral com tema escuro
// ============================================

export const PROFILE_COLORS = {
  student: {
    primary: COLORS.primary[500],         // '#FF4757' - Vermelho coral
    primaryLight: COLORS.primary[400],    // '#FF6B7A'
    primaryDark: COLORS.primary[700],     // '#DC2F3F'
    gradient: COLORS.gradients.combat,    // ['#FF4757', '#DC2F3F', '#1A1A1A']
    surface: COLORS.background.paper,     // '#1A1A1A' - Card escuro
    background: COLORS.white, // '#0D0D0D' - Fundo escuro
  },
  
  instructor: {
    primary: COLORS.primary[500],         // '#FF4757' - Vermelho coral
    primaryLight: COLORS.primary[400],    // '#FF6B7A'
    primaryDark: COLORS.primary[700],     // '#DC2F3F'
    gradient: COLORS.gradients.combat,    // ['#FF4757', '#DC2F3F', '#1A1A1A']
    surface: COLORS.background.paper,     // '#1A1A1A' - Card escuro
    background: COLORS.white, // '#0D0D0D' - Fundo escuro
  },
  
  admin: {
    primary: COLORS.primary[500],         // '#FF4757' - Vermelho coral
    primaryLight: COLORS.primary[400],    // '#FF6B7A'
    primaryDark: COLORS.primary[700],     // '#DC2F3F'
    gradient: COLORS.gradients.intense,   // ['#FF4757', '#DC2F3F', '#A01F2E'] - Mais intenso para admin
    surface: COLORS.background.paper,     // '#1A1A1A' - Card escuro
    background: COLORS.white, // '#0D0D0D' - Fundo escuro
  },
};

// ============================================
// CORES DE STATUS
// Referencia os Design Tokens
// ============================================

export const STATUS_COLORS = {
  success: COLORS.success[500],          // '#4CAF50'
  successLight: COLORS.success[400],     // '#66BB6A'
  successDark: COLORS.success[700],      // '#388E3C'
  successGradient: [COLORS.success[500], COLORS.success[700]],
  
  warning: COLORS.warning[500],          // '#FFC107'
  warningLight: COLORS.warning[400],     // '#FFCA28'
  warningDark: COLORS.warning[700],      // '#FFA000'
  warningGradient: [COLORS.warning[500], COLORS.warning[700]],
  
  error: COLORS.error[500],              // '#F44336'
  errorLight: COLORS.error[400],         // '#EF5350'
  errorDark: COLORS.error[700],          // '#D32F2F'
  errorGradient: [COLORS.error[500], COLORS.error[700]],
  
  info: COLORS.info[500],                // '#2196F3'
  infoLight: COLORS.info[400],           // '#42A5F5'
  infoDark: COLORS.info[700],            // '#1976D2'
  infoGradient: [COLORS.info[500], COLORS.info[700]],
};

// ============================================
// CORES DE TEXTO
// 🌑 Dark Theme como padrão
// ============================================

export const TEXT_COLORS = {
  primary: COLORS.black,         // '#FFFFFF' - Branco para dark theme
  secondary: COLORS.gray[500],     // '#E0E0E0' - Cinza claro
  disabled: COLORS.gray[300],       // '#9E9E9E' - Cinza médio
  hint: COLORS.text.hint,               // '#757575' - Cinza para hints
  inverse: COLORS.text.inverse,         // '#0D0D0D' - Preto (para fundos claros)
  onPrimary: COLORS.white,              // '#FFFFFF' - Texto em botões coral
  onBackground: COLORS.black,    // '#FFFFFF' - Texto em fundo escuro
  onSurface: COLORS.black,       // '#FFFFFF' - Texto em cards escuros
};

// ============================================
// CORES DE FAIXA (GRADUAÇÃO)
// Referencia os Design Tokens
// ============================================

export const BELT_COLORS = {
  branca: COLORS.special.belt.white,     // '#FFFFFF'
  cinza: COLORS.gray[500],               // '#9E9E9E'
  amarela: COLORS.special.belt.yellow,   // '#FFC107'
  laranja: COLORS.special.belt.orange,   // '#FF9800'
  verde: COLORS.special.belt.green,      // '#4CAF50'
  azul: COLORS.special.belt.blue,        // '#2196F3'
  roxa: COLORS.special.belt.purple,      // '#9C27B0'
  marrom: COLORS.special.belt.brown,     // '#795548'
  preta: COLORS.special.belt.black,      // '#212121'
  vermelha: COLORS.special.belt.red,     // '#F44336'
};

// ============================================
// TEMAS (CLARO/ESCURO)
// 🌑 Dark Theme como padrão
// ============================================

export const LIGHT_THEME = {
  background: COLORS.white,                // '#FFFFFF' (para modo claro legacy)
  surface: COLORS.gray[100],               // '#F5F5F5'
  card: COLORS.white,                      // '#FFFFFF'
  border: COLORS.border.default,           // '#757575'
  text: COLORS.text.inverse,               // '#0D0D0D' - Preto para tema claro
  textSecondary: COLORS.gray[700],         // '#616161'
  disabled: COLORS.gray[300],          // '#9E9E9E'
};

export const DARK_THEME = {
  background: COLORS.white,   // '#0D0D0D' - Preto profundo (PADRÃO)
  surface: COLORS.background.paper,        // '#1A1A1A' - Cinza muito escuro
  card: COLORS.background.paper,           // '#1A1A1A' - Cards escuros
  border: COLORS.border.light,             // '#424242' - Bordas sutis
  text: COLORS.black,               // '#FFFFFF' - Texto branco
  textSecondary: COLORS.gray[500],    // '#E0E0E0' - Cinza claro
  disabled: COLORS.gray[300],          // '#9E9E9E'
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Retorna as cores do perfil baseado no tipo de usuário
 * 🥋 NOVA PALETA: Todos os perfis usam vermelho coral
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
 * 🔴 Agora sempre retorna vermelho coral (#FF4757)
 * @param {string} userType - 'student', 'instructor', 'admin'
 * @returns {string} Cor primária em formato hex
 */
export const getPrimaryColor = (userType) => {
  return COLORS.primary[500]; // Todos usam coral agora
};

/**
 * Retorna o gradiente do perfil
 * 🥋 Gradientes marciais (combat para student/instructor, intense para admin)
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
  return BELT_COLORS[normalized] || COLORS.gray[500];
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
