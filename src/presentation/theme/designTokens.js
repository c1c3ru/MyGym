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
  // 🔴 Cores primárias - Vermelho Coral (Ação/Energia/Luta) - WCAG AA Compliant
  primary: {
    50: '#FFF5F7',
    100: '#FFE3E8',
    200: '#FFC7D1',
    300: '#FF9BAD',
    400: '#FF6B7A',
    500: '#D32F2F', // Vermelho coral escuro para contraste WCAG AA (4.5:1+)
    600: '#DC2F3F',
    700: '#C62838',
    800: '#B71C1C',
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
  
  // 🎨 Cores Neutras Refinadas (para cards e elementos sutis)
  neutral: {
    darkest: '#0D0C0D',    // Preto refinado (cards escuros premium)
    dark: '#262626',       // Cinza muito escuro (cards secundários)
    medium: '#595859',     // Cinza médio (separadores, bordas)
    light: '#8C8B8C',      // Cinza claro (texto secundário, ícones)
    lighter: '#D9D9D9',    // Cinza muito claro (texto desabilitado, placeholders)
  },
  
  // Cores neutras básicas
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Cores de fundo (Dark Theme Premium - Otimizado)
  background: {
    default: '#0B0B0B',    // Preto profundo premium (fundo principal)
    paper: '#1A1A1A',      // Cinza muito escuro (cards padrão)
    elevated: '#222222',   // Cinza escuro (modais/elevados)
    surface: '#2A2A2A',    // Superfície interativa
    light: '#F8F8F8',      // Branco suave (inputs/áreas claras)
    dark: '#000000',       // Preto puro (overlays)
    // Neutros refinados premium
    cardDark: '#0F0F0F',   // Card escuro premium (mais profundo)
    cardMedium: '#1E1E1E', // Card médio premium
    accent: '#D32F2F',     // Cor de destaque (vermelho coral WCAG AA)
  },
  
  // Cores de texto (Dark Theme Premium)
  text: {
    primary: '#FFFFFF',      // Branco puro (títulos)
    secondary: '#E0E0E0',    // Cinza muito claro (subtítulos) - Melhor contraste
    tertiary: '#BDBDBD',     // Cinza claro (texto auxiliar)
    disabled: '#757575',     // Cinza médio (desabilitado)
    hint: '#616161',         // Cinza escuro (hints/placeholders)
    inverse: '#0B0B0B',      // Preto (para fundos claros)
    accent: '#D32F2F',       // Texto de destaque (vermelho coral WCAG AA)
    muted: '#9E9E9E',        // Texto esmaecido
  },
  
  // Cores de borda (Dark Theme Premium - Bordas refinadas)
  border: {
    light: '#1A1A1A',        // Cinza muito escuro (bordas sutis)
    default: '#2A2A2A',      // Cinza escuro (bordas padrão)
    medium: '#424242',       // Cinza médio (bordas destacadas)
    dark: '#616161',         // Cinza (bordas visíveis)
    // Neutros refinados
    subtle: '#333333',       // Borda sutil premium
    separator: '#424242',    // Separador visível
    accent: '#D32F2F',       // Borda de destaque (vermelho coral WCAG AA)
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
  
  // 🎯 Cores de Botões (separadas para melhor organização)
  button: {
    // Botão primário (ação principal) - WCAG AA Compliant
    primary: {
      background: '#D32F2F',      // Vermelho coral WCAG AA
      hover: '#DC2F3F',           // Vermelho coral escuro
      pressed: '#C62838',         // Vermelho coral mais escuro
      disabled: '#757575',        // Cinza
      text: '#FFFFFF',            // Branco
    },
    // Botão secundário (ação secundária)
    secondary: {
      background: '#424242',      // Cinza escuro
      hover: '#303030',           // Cinza mais escuro
      pressed: '#212121',         // Cinza muito escuro
      disabled: '#9E9E9E',        // Cinza claro
      text: '#FFFFFF',            // Branco
    },
    // Botão de sucesso
    success: {
      background: '#4CAF50',      // Verde
      hover: '#43A047',           // Verde escuro
      pressed: '#388E3C',         // Verde mais escuro
      text: '#FFFFFF',            // Branco
    },
    // Botão de erro/perigo
    danger: {
      background: '#F44336',      // Vermelho
      hover: '#E53935',           // Vermelho escuro
      pressed: '#D32F2F',         // Vermelho mais escuro
      text: '#FFFFFF',            // Branco
    },
    // Botão outline/ghost
    outline: {
      border: '#D32F2F',          // Vermelho coral WCAG AA
      text: '#D32F2F',            // Vermelho coral WCAG AA
      hover: 'rgba(230, 57, 70, 0.1)',  // Vermelho coral com transparência
    },
  },
  
  // 🃏 Cores de Cards (Dark Theme Premium)
  card: {
    // Card padrão (uso geral)
    default: {
      background: '#1A1A1A',      // Cinza muito escuro premium
      border: '#2A2A2A',          // Cinza escuro sutil
      shadow: 'rgba(0, 0, 0, 0.6)',  // Sombra mais profunda
      text: '#E0E0E0',            // Texto claro
    },
    // Card elevado (modais, drawers, overlays)
    elevated: {
      background: '#222222',      // Cinza escuro premium
      border: '#333333',          // Cinza médio
      shadow: 'rgba(0, 0, 0, 0.8)',  // Sombra forte
      text: '#FFFFFF',            // Texto branco
    },
    // Card de destaque (selecionado, ativo)
    highlighted: {
      background: '#2A2A2A',      // Cinza mais claro
      border: '#D32F2F',          // Vermelho coral WCAG AA
      shadow: 'rgba(230, 57, 70, 0.4)',  // Sombra coral mais intensa
      text: '#FFFFFF',            // Texto branco
      accent: '#D32F2F',          // Cor de destaque
    },
    // Card interativo (hover states)
    interactive: {
      background: '#1E1E1E',      // Cinza escuro interativo
      backgroundHover: '#252525', // Estado hover
      border: '#333333',          // Borda padrão
      borderHover: '#D32F2F',     // Borda hover (coral WCAG AA)
      text: '#E0E0E0',            // Texto padrão
      textHover: '#FFFFFF',       // Texto hover
    },
    // Card de sucesso
    success: {
      background: '#1A2E1A',      // Verde escuro
      border: '#4CAF50',          // Verde
      shadow: 'rgba(76, 175, 80, 0.3)',  // Sombra verde
      text: '#FFFFFF',            // Texto branco
      accent: '#4CAF50',          // Verde de destaque
    },
    // Card de erro
    error: {
      background: '#2E1A1A',      // Vermelho escuro
      border: '#F44336',          // Vermelho
      shadow: 'rgba(244, 67, 54, 0.3)',  // Sombra vermelha
      text: '#FFFFFF',            // Texto branco
      accent: '#F44336',          // Vermelho de destaque
    },
    // Card de aviso
    warning: {
      background: '#2E2A1A',      // Amarelo escuro
      border: '#FFC107',          // Amarelo
      shadow: 'rgba(255, 193, 7, 0.3)',  // Sombra amarela
      text: '#FFFFFF',            // Texto branco
      accent: '#FFC107',          // Amarelo de destaque
    },
    // 🎨 Cards Premium Especiais
    premium: {
      background: '#0F0F0F',      // Preto premium profundo
      border: '#D32F2F',          // Borda coral premium WCAG AA
      shadow: 'rgba(230, 57, 70, 0.5)',  // Sombra coral intensa
      text: '#FFFFFF',            // Texto branco premium
      accent: '#D32F2F',          // Coral premium WCAG AA
      gradient: ['#0F0F0F', '#1A1A1A'], // Gradiente sutil
    },
    // Card transparente (overlays)
    transparent: {
      background: 'rgba(26, 26, 26, 0.9)',  // Fundo semi-transparente
      border: 'rgba(230, 57, 70, 0.3)',     // Borda coral transparente WCAG AA
      shadow: 'rgba(0, 0, 0, 0.9)',         // Sombra forte
      text: '#FFFFFF',                       // Texto branco
      backdrop: 'rgba(0, 0, 0, 0.7)',       // Backdrop
    },
  },
  
  // 🥋 Gradientes Dark Theme Premium - WCAG AA Compliant
  gradients: {
    // Vermelho coral → Preto (Energia/Força)
    combat: ['#D32F2F', '#DC2F3F', '#0B0B0B'],
    // Preto profundo → Cinza escuro (Profissional premium)
    dark: ['#0B0B0B', '#1A1A1A', '#222222'],
    // Vermelho coral intenso (CTAs importantes)
    intense: ['#D32F2F', '#DC2F3F', '#C62838'],
    // Cinza sutil premium (backgrounds neutros)
    subtle: ['#2A2A2A', '#1E1E1E', '#0F0F0F'],
    // Gradiente de destaque (headers, cards premium)
    accent: ['#D32F2F', '#1A1A1A', '#0B0B0B'],
    // Gradiente reverso (efeitos especiais)
    reverse: ['#0B0B0B', '#D32F2F'],
    // Gradiente suave (overlays, modais)
    soft: ['rgba(11, 11, 11, 0.9)', 'rgba(26, 26, 26, 0.8)', 'rgba(42, 42, 42, 0.6)'],
    // Gradiente de elevação (cards flutuantes)
    elevated: ['#222222', '#1A1A1A', '#0F0F0F'],
    // Gradiente de sucesso escuro
    success: ['#1A2E1A', '#0F1F0F', '#0B0B0B'],
    // Gradiente de erro escuro
    error: ['#2E1A1A', '#1F0F0F', '#0B0B0B'],
  },
  
  // 🎯 Cores Especiais (Status/Badges)
  special: {
    champion: '#FFD700',      // Ouro (campeão)
    premium: '#D32F2F',       // Vermelho coral WCAG AA (premium)
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
