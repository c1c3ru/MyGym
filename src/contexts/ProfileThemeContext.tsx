/**
 * ProfileThemeContext - Context para gerenciar temas por perfil de usuário
 * 
 * Este context detecta automaticamente o tipo de usuário (student, instructor, admin)
 * e aplica a paleta de cores correspondente, com suporte a light/dark mode.
 */

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import {
    getThemeByUserType,
    STUDENT_THEME,
    INSTRUCTOR_THEME,
    ADMIN_THEME,
    STUDENT_THEME_DARK,
    INSTRUCTOR_THEME_DARK,
    ADMIN_THEME_DARK,
} from '@presentation/theme/profileThemes';

// Tipo do tema retornado
type ProfileTheme = typeof STUDENT_THEME | typeof INSTRUCTOR_THEME | typeof ADMIN_THEME;

// Tipo do contexto
interface ProfileThemeContextType {
    theme: ProfileTheme;
    userType: 'student' | 'instructor' | 'admin';
    isDark: boolean;
}

// Criar o contexto
const ProfileThemeContext = createContext<ProfileThemeContextType | null>(null);

// Props do Provider
interface ProfileThemeProviderProps {
    children: ReactNode;
}

/**
 * Provider que fornece o tema baseado no perfil do usuário
 */
export const ProfileThemeProvider: React.FC<ProfileThemeProviderProps> = ({ children }) => {
    const { userProfile } = useAuth();
    const { isDarkMode } = useTheme();

    // Detectar tipo de usuário (padrão: student)
    const userType = (userProfile?.userType || 'student') as 'student' | 'instructor' | 'admin';

    // Obter tema correspondente com memoization para performance
    const theme = useMemo(() => {
        return getThemeByUserType(userType, isDarkMode);
    }, [userType, isDarkMode]);

    const value = useMemo(() => ({
        theme,
        userType,
        isDark: isDarkMode,
    }), [theme, userType, isDarkMode]);

    return (
        <ProfileThemeContext.Provider value={value}>
            {children}
        </ProfileThemeContext.Provider>
    );
};

/**
 * Hook para acessar o tema do perfil atual
 * 
 * @returns {ProfileThemeContextType} Objeto com theme, userType e isDark
 * 
 * @example
 * ```typescript
 * const MyComponent = () => {
 *   const { theme, userType, isDark } = useProfileTheme();
 *   
 *   return (
 *     <View style={{ backgroundColor: theme.background.default }}>
 *       <Button buttonColor={theme.primary[500]}>
 *         Ação Principal
 *       </Button>
 *     </View>
 *   );
 * };
 * ```
 */
export const useProfileTheme = (): ProfileThemeContextType => {
    const context = useContext(ProfileThemeContext);

    if (!context) {
        throw new Error(
            'useProfileTheme must be used within a ProfileThemeProvider. ' +
            'Make sure to wrap your app with <ProfileThemeProvider>.'
        );
    }

    return context;
};

/**
 * Hook alternativo que retorna apenas o tema (mais simples)
 * 
 * @returns {ProfileTheme} Tema do perfil atual
 * 
 * @example
 * ```typescript
 * const MyComponent = () => {
 *   const theme = useCurrentProfileTheme();
 *   
 *   return (
 *     <Button buttonColor={theme.primary[500]}>
 *       Botão
 *     </Button>
 *   );
 * };
 * ```
 */
export const useCurrentProfileTheme = (): ProfileTheme => {
    const { theme } = useProfileTheme();
    return theme;
};

/**
 * HOC para injetar o tema em componentes de classe
 * 
 * @example
 * ```typescript
 * class MyComponent extends React.Component<{ theme: ProfileTheme }> {
 *   render() {
 *     const { theme } = this.props;
 *     return <View style={{ backgroundColor: theme.primary[500] }} />;
 *   }
 * }
 * 
 * export default withProfileTheme(MyComponent);
 * ```
 */
export const withProfileTheme = <P extends object>(
    Component: React.ComponentType<P & { theme: ProfileTheme }>
) => {
    return (props: P) => {
        const theme = useCurrentProfileTheme();
        return <Component {...props} theme={theme} />;
    };
};

// Exportar temas individuais para uso direto (se necessário)
export {
    STUDENT_THEME,
    INSTRUCTOR_THEME,
    ADMIN_THEME,
    STUDENT_THEME_DARK,
    INSTRUCTOR_THEME_DARK,
    ADMIN_THEME_DARK,
};
