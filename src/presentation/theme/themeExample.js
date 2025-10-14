/**
 * Exemplo de uso dos temas Light e Dark
 * Demonstra como alternar entre os temas sem ciclo de dependência
 */

import { getTheme, getLightThemeTokens, DARK_THEME_TOKENS } from './designTokens';

// Exemplo 1: Usando a função getTheme (recomendado)
export const useThemeExample = () => {
  const [isDark, setIsDark] = useState(true);
  
  // Obtém o tema atual baseado na preferência
  const currentTheme = getTheme(isDark);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
  };
  
  return {
    theme: currentTheme,
    isDark,
    toggleTheme,
    // Cores do tema atual
    backgroundColor: currentTheme.background.default,
    textColor: currentTheme.text.primary,
  };
};

// Exemplo 2: Usando temas diretamente
export const directThemeExample = () => {
  // Dark theme (sempre disponível)
  const darkTheme = DARK_THEME_TOKENS;
  
  // Light theme (carregado sob demanda)
  const lightTheme = getLightThemeTokens();
  
  return {
    darkTheme,
    lightTheme,
    // Comparação de cores
    darkBackground: darkTheme.background.default,
    lightBackground: lightTheme.background.default,
  };
};

// Exemplo 3: Hook personalizado para tema
export const useAppTheme = (userPreference = 'dark') => {
  const isDark = userPreference === 'dark';
  const theme = getTheme(isDark);
  
  return {
    theme,
    isDark,
    colors: theme.background,
    text: theme.text,
    // Utilitários
    getBackgroundColor: (variant = 'default') => theme.background[variant],
    getTextColor: (variant = 'primary') => theme.text[variant],
  };
};

export default {
  useThemeExample,
  directThemeExample,
  useAppTheme,
};
