/**
 * Auth Theme Constants
 * Constantes centralizadas de cores e estilos para telas de autenticação
 * Garante consistência visual entre Login, Register e ForgotPassword
 */

import { COLORS } from '@presentation/theme/designTokens';

/**
 * Gradientes de fundo para telas de autenticação
 */
export const AUTH_GRADIENTS = {
    dark: [COLORS.secondary[900], COLORS.secondary[800], COLORS.black],
    light: [COLORS.primary[50], COLORS.white],
};

/**
 * Cores do card glassmorphism para telas de autenticação
 */
export const AUTH_CARD_COLORS = {
    dark: {
        background: 'rgba(30, 30, 30, 0.4)',
        border: 'rgba(255, 255, 255, 0.15)',
    },
    light: {
        background: 'rgba(255, 255, 255, 0.6)',
        border: 'rgba(0, 0, 0, 0.1)',
    },
};

/**
 * Retorna o gradiente de fundo apropriado para o tema atual
 * @param {boolean} isDarkMode - Se o tema escuro está ativo
 * @returns {Array<string>} Array de cores para o gradiente
 */
export const getAuthGradient = (isDarkMode) => {
    return isDarkMode ? AUTH_GRADIENTS.dark : AUTH_GRADIENTS.light;
};

/**
 * Retorna as cores do card glassmorphism para o tema atual
 * @param {boolean} isDarkMode - Se o tema escuro está ativo
 * @returns {Object} Objeto com background e border colors
 */
export const getAuthCardColors = (isDarkMode) => {
    return isDarkMode ? AUTH_CARD_COLORS.dark : AUTH_CARD_COLORS.light;
};
