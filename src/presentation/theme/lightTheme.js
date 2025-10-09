/**
 * Light Theme Premium - MyGym
 * Inspirado no padrão visual de incubadoras tecnológicas
 * Cores sóbrias, tons neutros com destaque em azul
 * Elementos gráficos alinhados à inovação
 */

export const LIGHT_THEME = {
  // Cores base neutras e sóbrias
  background: {
    default: '#FAFBFC',        // Fundo principal - cinza muito claro
    paper: '#FFFFFF',          // Cards e superfícies elevadas
    elevated: '#F8F9FA',       // Elementos elevados
    light: '#F5F6F7',          // Fundo alternativo
    section: '#F0F2F5',        // Seções bem definidas
  },

  // Texto com hierarquia clara
  text: {
    primary: '#2C3E50',        // Texto principal - azul escuro sóbrio
    secondary: '#5D6D7E',      // Texto secundário - cinza azulado
    tertiary: '#85929E',       // Texto terciário
    disabled: '#BDC3C7',       // Texto desabilitado
    inverse: '#FFFFFF',        // Texto em fundos escuros
  },

  // Azul como cor principal (destaque das imagens)
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB', 
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',            // Azul principal - inovação
    600: '#1E88E5',
    700: '#1976D2',            // Azul mais escuro para contraste
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Cinza azulado secundário (sóbrio)
  secondary: {
    50: '#ECEFF1',
    100: '#CFD8DC',
    200: '#B0BEC5',
    300: '#90A4AE',
    400: '#78909C',
    500: '#607D8B',            // Cinza azulado principal
    600: '#546E7A',
    700: '#455A64',            // Para contraste
    800: '#37474F',
    900: '#263238',
  },

  // Cores funcionais mantendo sobriedade
  success: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',            // Verde sóbrio
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107',            // Amarelo sóbrio
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },

  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',            // Vermelho sóbrio
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  info: {
    50: '#E1F5FE',
    100: '#B3E5FC',
    200: '#81D4FA',
    300: '#4FC3F7',
    400: '#29B6F6',
    500: '#03A9F4',            // Azul informativo
    600: '#039BE5',
    700: '#0288D1',
    800: '#0277BD',
    900: '#01579B',
  },

  // Sistema de cards bem definidos
  card: {
    default: {
      background: '#FFFFFF',
      text: '#2C3E50',
      border: '#E5E7EB',
      shadow: 'rgba(0, 0, 0, 0.08)',
    },
    elevated: {
      background: '#FFFFFF',
      text: '#2C3E50', 
      border: '#D1D5DB',
      shadow: 'rgba(0, 0, 0, 0.12)',
    },
    section: {
      background: '#F8F9FA',
      text: '#2C3E50',
      border: '#E5E7EB',
      shadow: 'rgba(0, 0, 0, 0.06)',
    },
    // Cards com destaque azul (inovação)
    primary: {
      background: '#E3F2FD',
      text: '#1565C0',
      border: '#90CAF9',
      shadow: 'rgba(33, 150, 243, 0.15)',
    },
    // Cards com tom neutro (tecnologia)
    secondary: {
      background: '#ECEFF1',
      text: '#37474F',
      border: '#B0BEC5',
      shadow: 'rgba(96, 125, 139, 0.15)',
    },
  },

  // Cores neutras para elementos gráficos
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

  // Cores base
  white: '#FFFFFF',
  black: '#000000',

  // Borders e divisores sóbrios
  border: {
    light: '#F0F2F5',
    default: '#E5E7EB',
    dark: '#D1D5DB',
    primary: '#90CAF9',
    secondary: '#B0BEC5',
  },

  // Overlays para modais e tooltips
  overlay: {
    light: 'rgba(255, 255, 255, 0.9)',
    default: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
  },

  // Gradientes para elementos gráficos modernos
  gradients: {
    // Gradiente principal azul (inovação)
    primary: ['#2196F3', '#1976D2'],
    // Gradiente neutro (tecnologia)
    neutral: ['#607D8B', '#455A64'],
    // Gradiente sutil para backgrounds
    background: ['#FAFBFC', '#F5F6F7'],
    // Gradiente para headers
    header: ['#E3F2FD', '#BBDEFB'],
  },

  // Sombras bem definidas (elementos gráficos)
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    default: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
    // Sombra azul para elementos de destaque
    primary: '0 4px 14px rgba(33, 150, 243, 0.15)',
  },
};

// Tema específico para academias (baseado no padrão visual)
export const ACADEMY_LIGHT_COLORS = {
  // Header com gradiente azul sóbrio
  headerGradient: LIGHT_THEME.gradients.primary,
  
  // Cores de destaque para diferentes perfis
  admin: {
    primary: LIGHT_THEME.primary[600],
    secondary: LIGHT_THEME.secondary[500],
    background: LIGHT_THEME.card.primary.background,
  },
  
  instructor: {
    primary: LIGHT_THEME.secondary[600],
    secondary: LIGHT_THEME.primary[500], 
    background: LIGHT_THEME.card.secondary.background,
  },
  
  student: {
    primary: LIGHT_THEME.info[600],
    secondary: LIGHT_THEME.secondary[400],
    background: LIGHT_THEME.card.default.background,
  },

  // Cores para elementos específicos de academia
  martial_arts: {
    primary: LIGHT_THEME.secondary[700],    // Cinza azulado para artes marciais
    accent: LIGHT_THEME.primary[500],       // Azul para destaque
    background: LIGHT_THEME.card.section.background,
  },
};

// Configurações de tipografia (fontes claras)
export const LIGHT_TYPOGRAPHY = {
  // Hierarquia clara de títulos
  display: {
    fontSize: 32,
    fontWeight: '300',                      // Fonte clara
    color: LIGHT_THEME.text.primary,
    lineHeight: 40,
  },
  
  h1: {
    fontSize: 28,
    fontWeight: '300',                      // Fonte clara
    color: LIGHT_THEME.text.primary,
    lineHeight: 36,
  },
  
  h2: {
    fontSize: 24,
    fontWeight: '400',                      // Peso médio
    color: LIGHT_THEME.text.primary,
    lineHeight: 32,
  },
  
  h3: {
    fontSize: 20,
    fontWeight: '400',
    color: LIGHT_THEME.text.primary,
    lineHeight: 28,
  },
  
  body1: {
    fontSize: 16,
    fontWeight: '400',
    color: LIGHT_THEME.text.primary,
    lineHeight: 24,
  },
  
  body2: {
    fontSize: 14,
    fontWeight: '400',
    color: LIGHT_THEME.text.secondary,
    lineHeight: 20,
  },
  
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: LIGHT_THEME.text.tertiary,
    lineHeight: 16,
  },
};

export default LIGHT_THEME;
