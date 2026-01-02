import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, languages, getThemeForUserType } from '@utils/theme';
import type { ReactNode } from 'react';

// Tipos de idiomas suportados
type LanguageCode = 'pt' | 'en' | 'es';

// Tipo de usuário para temas
type UserType = 'student' | 'instructor' | 'admin';

// Interface do contexto de tema
interface ThemeContextType {
  isDarkMode: boolean;
  currentLanguage: LanguageCode;
  theme: any; // TODO: criar interface Theme completa
  languages: typeof languages;
  toggleDarkMode: () => Promise<void>;
  changeLanguage: (languageCode: LanguageCode) => Promise<void>;
  getString: (key: string, params?: Record<string, any>) => string;
  updateUserTheme: (userType: UserType) => void;
}

// Interface das props do Provider
interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('pt');
  const [theme, setTheme] = useState<any>(() => getThemeForUserType('student', false));

  // Load saved preferences on app start
  useEffect(() => {
    loadPreferences();
  }, []);

  // Update theme when dark mode or user type changes
  useEffect(() => {
    updateThemeForCurrentUser();
  }, [isDarkMode]);

  const updateThemeForCurrentUser = (): void => {
    // Use getThemeForUserType with 'student' as default to ensure all properties are available
    const defaultTheme = getThemeForUserType('student', isDarkMode);
    setTheme(defaultTheme);
  };

  const loadPreferences = async (): Promise<void> => {
    try {
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      const savedLanguage = await AsyncStorage.getItem('language');

      if (savedDarkMode !== null) {
        setIsDarkMode(JSON.parse(savedDarkMode));
      }

      if (savedLanguage && (languages as any)[savedLanguage]) {
        setCurrentLanguage(savedLanguage as LanguageCode);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const toggleDarkMode = async (): Promise<void> => {
    try {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);
      await AsyncStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
  };

  const changeLanguage = async (languageCode: LanguageCode): Promise<void> => {
    try {
      if (languages[languageCode]) {
        setCurrentLanguage(languageCode);
        await AsyncStorage.setItem('language', languageCode);
      }
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const getString = (key: string, params?: Record<string, any>): string => {
    return (languages as any)[currentLanguage]?.strings[key] || (languages as any).pt.strings[key] || key;
  };

  // Function to manually update theme (called when user type changes)
  const updateUserTheme = React.useCallback((userType: UserType): void => {
    const newTheme = getThemeForUserType(userType, isDarkMode);
    setTheme(newTheme);
  }, [isDarkMode]);

  const value: ThemeContextType = {
    isDarkMode,
    currentLanguage,
    theme,
    languages,
    toggleDarkMode,
    changeLanguage,
    getString,
    updateUserTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};