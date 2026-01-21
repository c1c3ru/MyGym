import { FONT_SIZE, FONT_WEIGHT } from '@presentation/theme/designTokens';

/**
 * Dark Theme Premium - MyGym
 * Glassmorphism effect with deep backgrounds and translucent cards
 * Following the reference design from "Detalhes do Aluno"
 */

const DARK_GLASS = {
    default: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
    heavy: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        shadowColor: 'rgba(0, 0, 0, 0.6)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    light: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(5px)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 2,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        shadowColor: 'rgba(0, 0, 0, 0.4)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    modal: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(25px)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        shadowColor: 'rgba(0, 0, 0, 0.7)',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 20,
    }
};

export const DARK_THEME = {
    // Backgrounds - Deep dark with subtle gradients
    background: {
        default: '#121212',        // Main background - very dark
        paper: '#1A1A1A',          // Cards and elevated surfaces
        elevated: '#222222',       // Elevated elements
        light: '#2A2A2A',          // Lighter alternative
        section: '#1E1E1E',        // Well-defined sections
    },

    // Text with clear hierarchy and IMPROVED contrast (WCAG AAA)
    text: {
        primary: '#FFFFFF',        // White for titles - Maximum contrast (21:1)
        secondary: '#F5F5F5',      // Very light gray - Excellent readability (18:1)
        tertiary: '#D0D0D0',       // Light gray - Good readability (10:1)
        disabled: '#9E9E9E',       // Medium gray - Still visible (5:1)
        inverse: '#121212',        // Text on light backgrounds
    },

    // Primary color - Vibrant for dark mode
    primary: {
        50: '#E3F2FD',
        100: '#BBDEFB',
        200: '#90CAF9',
        300: '#64B5F6',
        400: '#42A5F5',
        500: '#2196F3',            // Main blue - innovation
        600: '#1E88E5',
        700: '#1976D2',            // Darker blue for contrast
        800: '#1565C0',
        900: '#0D47A1',
    },

    // Secondary color - Sober blue-gray
    secondary: {
        50: '#ECEFF1',
        100: '#CFD8DC',
        200: '#B0BEC5',
        300: '#90A4AE',
        400: '#78909C',
        500: '#607D8B',            // Main blue-gray
        600: '#546E7A',
        700: '#455A64',            // For contrast
        800: '#37474F',
        900: '#263238',
    },

    // Functional colors maintaining sobriety
    success: {
        50: '#E8F5E8',
        100: '#C8E6C9',
        200: '#A5D6A7',
        300: '#81C784',
        400: '#66BB6A',
        500: '#4CAF50',            // Sober green
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
        500: '#FFC107',            // Sober yellow
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
        500: '#F44336',            // Sober red
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
        500: '#03A9F4',            // Informative blue
        600: '#039BE5',
        700: '#0288D1',
        800: '#0277BD',
        900: '#01579B',
    },

    // Well-defined card system with IMPROVED text contrast
    card: {
        default: {
            background: 'rgba(255, 255, 255, 0.05)',
            text: '#F5F5F5',  // Improved from #E0E0E0
            border: 'rgba(255, 255, 255, 0.1)',
            shadow: 'rgba(0, 0, 0, 0.5)',
        },
        elevated: {
            background: 'rgba(255, 255, 255, 0.08)',
            text: '#FFFFFF',
            border: 'rgba(255, 255, 255, 0.12)',
            shadow: 'rgba(0, 0, 0, 0.6)',
        },
        section: {
            background: 'rgba(255, 255, 255, 0.03)',
            text: '#F5F5F5',  // Improved from #E0E0E0
            border: 'rgba(255, 255, 255, 0.08)',
            shadow: 'rgba(0, 0, 0, 0.4)',
        },
        // Cards with blue highlight (innovation)
        primary: {
            background: 'rgba(33, 150, 243, 0.15)',
            text: '#90CAF9',
            border: 'rgba(33, 150, 243, 0.3)',
            shadow: 'rgba(33, 150, 243, 0.2)',
        },
        // Cards with neutral tone (technology)
        secondary: {
            background: 'rgba(96, 125, 139, 0.15)',
            text: '#B0BEC5',
            border: 'rgba(96, 125, 139, 0.3)',
            shadow: 'rgba(96, 125, 139, 0.2)',
        },
    },

    // Neutral colors for graphic elements
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

    // Base colors
    white: '#FFFFFF',
    black: '#000000',

    // Borders and dividers
    border: {
        light: 'rgba(255, 255, 255, 0.08)',
        default: 'rgba(255, 255, 255, 0.12)',
        dark: 'rgba(255, 255, 255, 0.18)',
        primary: 'rgba(33, 150, 243, 0.5)',
        secondary: 'rgba(96, 125, 139, 0.5)',
    },

    // Overlays for modals and tooltips
    overlay: {
        light: 'rgba(0, 0, 0, 0.3)',
        default: 'rgba(0, 0, 0, 0.5)',
        dark: 'rgba(0, 0, 0, 0.7)',
    },

    // Gradients for modern graphic elements
    gradients: {
        // Main blue gradient (innovation)
        primary: ['#2196F3', '#1976D2'],
        // Neutral gradient (technology)
        neutral: ['#607D8B', '#455A64'],
        // Subtle gradient for backgrounds
        background: ['#121212', '#1A1A1A'],
        // Gradient for headers
        header: ['#1976D2', '#0D47A1'],
    },

    // Well-defined shadows (graphic elements)
    shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        default: '0 1px 3px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.5), 0 4px 6px rgba(0, 0, 0, 0.3)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.6), 0 10px 10px rgba(0, 0, 0, 0.4)',
        // Blue shadow for highlighted elements
        primary: '0 4px 14px rgba(33, 150, 243, 0.3)',
    },

    // Glass effects
    glass: DARK_GLASS,
};

// Specific theme for gyms (based on visual standard)
export const ACADEMY_DARK_COLORS = {
    // Header with sober blue gradient
    headerGradient: DARK_THEME.gradients.primary,

    // Highlight colors for different profiles
    admin: {
        primary: DARK_THEME.primary[400],
        secondary: DARK_THEME.secondary[400],
        background: DARK_THEME.card.primary.background,
    },

    instructor: {
        primary: DARK_THEME.secondary[400],
        secondary: DARK_THEME.primary[400],
        background: DARK_THEME.card.secondary.background,
    },

    student: {
        primary: DARK_THEME.info[400],
        secondary: DARK_THEME.secondary[300],
        background: DARK_THEME.card.default.background,
    },

    // Colors for specific gym elements
    martial_arts: {
        primary: DARK_THEME.secondary[400],    // Blue-gray for martial arts
        accent: DARK_THEME.primary[400],       // Blue for highlight
        background: DARK_THEME.card.section.background,
    },
};

// Typography settings (clear fonts)
export const DARK_TYPOGRAPHY = {
    // Clear title hierarchy
    display: {
        fontSize: FONT_SIZE.xxxl,
        fontWeight: FONT_WEIGHT.bold,
        color: DARK_THEME.text.primary,
        lineHeight: 40,
    },

    h1: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: FONT_WEIGHT.bold,
        color: DARK_THEME.text.primary,
        lineHeight: 36,
    },

    h2: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.semibold,
        color: DARK_THEME.text.primary,
        lineHeight: 32,
    },

    h3: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.semibold,
        color: DARK_THEME.text.primary,
        lineHeight: 28,
    },

    body1: {
        fontSize: FONT_SIZE.base,
        fontWeight: FONT_WEIGHT.regular,
        color: DARK_THEME.text.secondary,
        lineHeight: 24,
    },

    body2: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.regular,
        color: DARK_THEME.text.secondary,
        lineHeight: 20,
    },

    caption: {
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.regular,
        color: DARK_THEME.text.tertiary,
        lineHeight: 16,
    },
};

export default DARK_THEME;
