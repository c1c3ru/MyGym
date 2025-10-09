import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme, LIGHT_THEME, DARK_THEME } from '@presentation/theme/designTokens';

const ThemeToggleContext = createContext();

const THEME_STORAGE_KEY = '@MyGym:theme_preference';

export const ThemeToggleProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Padrão: Dark Theme Premium
  const [isLoading, setIsLoading] = useState(true);

  // Carregar preferência de tema salva
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDarkTheme(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.warn('Erro ao carregar preferência de tema:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkTheme;
      setIsDarkTheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newTheme));
      
      // Analytics para tracking de uso de temas
      console.log(`📱 Tema alterado para: ${newTheme ? 'Dark Premium' : 'Light Sóbrio'}`);
    } catch (error) {
      console.warn('Erro ao salvar preferência de tema:', error);
    }
  };

  const setTheme = async (isDark) => {
    try {
      setIsDarkTheme(isDark);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(isDark));
    } catch (error) {
      console.warn('Erro ao definir tema:', error);
    }
  };

  // Obter tema atual
  const currentTheme = getTheme(isDarkTheme);
  
  // Informações sobre o tema atual
  const themeInfo = {
    name: isDarkTheme ? 'Dark Premium' : 'Light Sóbrio',
    description: isDarkTheme 
      ? 'Tema escuro premium para academias de artes marciais'
      : 'Tema claro sóbrio inspirado em incubadoras tecnológicas',
    isDark: isDarkTheme,
    isLight: !isDarkTheme,
  };

  const value = {
    // Estado do tema
    isDarkTheme,
    isLightTheme: !isDarkTheme,
    isLoading,
    
    // Temas
    currentTheme,
    lightTheme: LIGHT_THEME,
    darkTheme: DARK_THEME,
    
    // Informações
    themeInfo,
    
    // Ações
    toggleTheme,
    setTheme,
    setDarkTheme: () => setTheme(true),
    setLightTheme: () => setTheme(false),
    
    // Utilitários
    getThemeColor: (colorPath) => {
      // Exemplo: getThemeColor('primary.500')
      const keys = colorPath.split('.');
      let color = currentTheme;
      for (const key of keys) {
        color = color[key];
        if (!color) break;
      }
      return color;
    },
    
    // Verificar se cor existe no tema atual
    hasColor: (colorPath) => {
      const color = value.getThemeColor(colorPath);
      return color !== undefined;
    },
  };

  return (
    <ThemeToggleContext.Provider value={value}>
      {children}
    </ThemeToggleContext.Provider>
  );
};

export const useThemeToggle = () => {
  const context = useContext(ThemeToggleContext);
  if (!context) {
    throw new Error('useThemeToggle deve ser usado dentro de ThemeToggleProvider');
  }
  return context;
};

// Hook simplificado para apenas obter o tema atual
export const useCurrentTheme = () => {
  const { currentTheme } = useThemeToggle();
  return currentTheme;
};

// Hook para verificar se é tema escuro
export const useIsDarkTheme = () => {
  const { isDarkTheme } = useThemeToggle();
  return isDarkTheme;
};

export default ThemeToggleContext;
