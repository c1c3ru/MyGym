/**
 * Design Tokens - MyGym
 * Sistema centralizado de tokens de design para garantir consistência visual
 * em todo o aplicativo.
 * 
 * @see https://www.designtokens.org/
 */

// ============================================
// SPACING - Espaçamentos padronizados
// ============================================
export const SPACING = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  huge: 64,
};

// ============================================
// FONT SIZE - Tamanhos de fonte
// ============================================
export const FONT_SIZE = {
  xxs: 10,
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 32,
  huge: 40,
  display: 48,
};

// ============================================
// FONT WEIGHT - Pesos de fonte
// ============================================
export const FONT_WEIGHT = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

// ============================================
// LINE HEIGHT - Altura de linha
// ============================================
export const LINE_HEIGHT = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
};

// ============================================
// BORDER RADIUS - Raios de borda
// ============================================
export const BORDER_RADIUS = {
  none: 0,
  xs: 2,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// ============================================
// BORDER WIDTH - Larguras de borda (WCAG AA compliant)
// ============================================
export const BORDER_WIDTH = {
  none: 0,
  thin: 1,
  base: 2,        // Padrão para a maioria dos elementos
  thick: 3,       // Para elementos que precisam destaque
  heavy: 4,       // Para elementos críticos
  accessible: 2,  // Mínimo recomendado para acessibilidade
};

// ============================================
// ELEVATION - Elevações (sombras)
// ============================================
export const ELEVATION = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 15,
  },
};

// ============================================
// COLORS - Paleta de cores
// ============================================
export const COLORS = {
  // 🔴 Cores primárias - Vermelho Coral (Ação/Energia/Luta)
  primary: {
    50: '#FFF5F7',
    100: '#FFE3E8',
    200: '#FFC7D1',
    300: '#FF9BAD',
    400: '#FF6B7A',
    500: '#FF4757', // Vermelho coral principal
    600: '#EE3D4D',
    700: '#DC2F3F',
    800: '#C62838',
    900: '#A01F2E',
  },
  
  // ⚫ Cores secundárias - Cinza/Preto (Sofisticação/Tatame)
  secondary: {
    50: '#F5F5F5',
    100: '#E0E0E0',
    200: '#BDBDBD',
    300: '#9E9E9E',
    400: '#757575',
    500: '#424242', // Cinza médio
    600: '#303030',
    700: '#212121',
    800: '#1A1A1A', // Cinza muito escuro (cards)
    900: '#0D0D0D', // Quase preto (background)
  },
  
  // Cores de sucesso
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Principal
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  
  // Cores de erro
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // Principal
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },
  
  // Cores de aviso
  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107', // Principal
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },
  
  // Cores de informação
  info: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Principal
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  
  // Escala de cinzas
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Cores neutras
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Cores de fundo (Dark Theme como padrão)
  background: {
    default: '#0D0D0D',    // Preto profundo (fundo principal)
    paper: '#1A1A1A',      // Cinza muito escuro (cards)
    elevated: '#212121',   // Cinza escuro (modais/elevados)
    light: '#F5F5F5',      // Branco (inputs/áreas claras)
    dark: '#000000',       // Preto puro (overlays)
  },
  
  // Cores de texto (Dark Theme)
  text: {
    primary: '#FFFFFF',      // Branco puro (títulos)
    secondary: '#E0E0E0',    // Cinza claro (subtítulos)
    disabled: '#9E9E9E',     // Cinza médio (desabilitado)
    hint: '#757575',         // Cinza (hints/placeholders)
    inverse: '#0D0D0D',      // Preto (para fundos claros)
  },
  
  // Cores de borda (Dark Theme)
  border: {
    light: '#424242',        // Cinza escuro (bordas sutis)
    default: '#757575',      // Cinza médio (bordas padrão)
    dark: '#9E9E9E',         // Cinza claro (bordas destacadas)
  },
  
  // Cores de overlay (WCAG AA compliant)
  overlay: {
    light: 'rgba(0, 0, 0, 0.1)',
    default: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.5)',
    darker: 'rgba(0, 0, 0, 0.75)',    // Aumentado para melhor contraste
    darkest: 'rgba(0, 0, 0, 0.85)',   // Para modais e overlays críticos
  },
  
  // Cores de foco (para acessibilidade)
  focus: {
    primary: '#9C27B0',
    outline: 'rgba(156, 39, 176, 0.4)',  // Com transparência para destaque
    ring: 'rgba(156, 39, 176, 0.2)',     // Anel externo mais suave
  },
  
  // Cores de contraste alto (WCAG AAA)
  highContrast: {
    text: '#000000',
    background: '#FFFFFF',
    border: '#000000',
    focus: '#0000FF',  // Azul puro para máximo contraste
  },
  
  // 🥋 Gradientes Marciais (para backgrounds especiais)
  gradients: {
    // Vermelho → Preto (Energia/Força)
    combat: ['#FF4757', '#DC2F3F', '#1A1A1A'],
    // Preto → Cinza Escuro (Profissional)
    dark: ['#0D0D0D', '#1A1A1A', '#212121'],
    // Vermelho → Vermelho Escuro (Intenso)
    intense: ['#FF4757', '#DC2F3F', '#A01F2E'],
    // Cinza → Preto (Sutil)
    subtle: ['#424242', '#303030', '#0D0D0D'],
  },
  
  // 🎯 Cores Especiais (Status/Badges)
  special: {
    champion: '#FFD700',      // Ouro (campeão)
    premium: '#FF4757',       // Vermelho coral (premium)
    active: '#4CAF50',        // Verde (ativo)
    inactive: '#757575',      // Cinza (inativo)
    danger: '#F44336',        // Vermelho (perigo)
    belt: {
      white: '#FFFFFF',       // Faixa branca
      yellow: '#FFC107',      // Faixa amarela
      orange: '#FF9800',      // Faixa laranja
      green: '#4CAF50',       // Faixa verde
      blue: '#2196F3',        // Faixa azul
      purple: '#9C27B0',      // Faixa roxa
      brown: '#795548',       // Faixa marrom
      black: '#212121',       // Faixa preta
      red: '#F44336',         // Faixa vermelha (coral)
    },
  },
};

// ============================================
// OPACITY - Níveis de opacidade
// ============================================
export const OPACITY = {
  transparent: 0,
  faint: 0.05,
  light: 0.1,
  medium: 0.3,
  semiopaque: 0.5,
  strong: 0.7,
  heavy: 0.9,
  opaque: 1,
};

// ============================================
// ANIMATION - Durações e easings
// ============================================
export const ANIMATION = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
    slowest: 1000,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

// ============================================
// Z-INDEX - Camadas de profundidade
// ============================================
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
  max: 9999,
};

// ============================================
// ICON SIZE - Tamanhos de ícones
// ============================================
export const ICON_SIZE = {
  xs: 12,
  sm: 16,
  base: 20,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
  huge: 64,
};

// ============================================
// BREAKPOINTS - Pontos de quebra responsivos
// ============================================
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

// ============================================
// CONTAINER - Larguras máximas de container
// ============================================
export const CONTAINER = {
  xs: 540,
  sm: 720,
  md: 960,
  lg: 1140,
  xl: 1320,
  fluid: '100%',
};

// ============================================
// TRANSITIONS - Transições pré-definidas
// ============================================
export const TRANSITIONS = {
  all: `all ${ANIMATION.duration.normal}ms ${ANIMATION.easing.easeInOut}`,
  opacity: `opacity ${ANIMATION.duration.fast}ms ${ANIMATION.easing.easeOut}`,
  transform: `transform ${ANIMATION.duration.normal}ms ${ANIMATION.easing.spring}`,
  color: `color ${ANIMATION.duration.fast}ms ${ANIMATION.easing.easeInOut}`,
  background: `background-color ${ANIMATION.duration.fast}ms ${ANIMATION.easing.easeInOut}`,
};

// ============================================
// UTILITIES - Funções utilitárias
// ============================================

/**
 * Converte tokens de spacing para valores numéricos
 * @param {string} token - Token de spacing (ex: 'md', 'lg')
 * @returns {number} Valor numérico do spacing
 */
export const getSpacing = (token) => SPACING[token] || SPACING.base;

/**
 * Converte tokens de fontSize para valores numéricos
 * @param {string} token - Token de fontSize (ex: 'sm', 'lg')
 * @returns {number} Valor numérico do fontSize
 */
export const getFontSize = (token) => FONT_SIZE[token] || FONT_SIZE.base;

/**
 * Retorna array de cores para gradiente
 * @param {string} type - Tipo de gradiente ('combat', 'dark', 'intense', 'subtle')
 * @returns {Array<string>} Array de cores para o gradiente
 */
export const getGradient = (type) => COLORS.gradients[type] || COLORS.gradients.dark;

/**
 * Retorna cor da faixa de graduação
 * @param {string} belt - Nome da faixa (ex: 'white', 'black', 'blue')
 * @returns {string} Cor hexadecimal da faixa
 */
export const getBeltColor = (belt) => {
  const normalized = belt?.toLowerCase().trim();
  return COLORS.special.belt[normalized] || COLORS.special.belt.white;
};

/**
 * Obtém cor do tema com fallback
 * @param {string} path - Caminho da cor (ex: 'primary.500', 'error.700')
 * @returns {string} Valor da cor
 */
export const getColor = (path) => {
  const parts = path.split('.');
  let value = COLORS;
  
  for (const part of parts) {
    value = value[part];
    if (!value) return COLORS.gray[500];
  }
  
  return value;
};

/**
 * Cria estilo de elevação
 * @param {string} level - Nível de elevação (ex: 'sm', 'md', 'lg')
 * @returns {object} Objeto de estilo com sombra
 */
export const getElevation = (level) => ELEVATION[level] || ELEVATION.none;

// ============================================
// EXPORT DEFAULT - Objeto completo
// ============================================
export default {
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  LINE_HEIGHT,
  BORDER_RADIUS,
  BORDER_WIDTH,
  ELEVATION,
  COLORS,
  OPACITY,
  ANIMATION,
  Z_INDEX,
  ICON_SIZE,
  BREAKPOINTS,
  CONTAINER,
  TRANSITIONS,
  // Utilities
  getSpacing,
  getFontSize,
  getColor,
  getElevation,
};
