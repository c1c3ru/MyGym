import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Injetar estilos globais para Web para garantir altura total
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
    }
  `;
  document.head.appendChild(style);
}


import { ThemeProvider } from './src/presentation/contexts/ThemeContext';
import { ThemeToggleProvider } from './src/presentation/contexts/ThemeToggleContext';
import { ProfileThemeProvider } from './src/contexts/ProfileThemeContext';
import { AuthProvider } from './src/presentation/contexts/AuthProvider';
import { NotificationProvider } from './src/presentation/contexts/NotificationContext';
import { UndoProvider } from './src/presentation/components/UndoManager';
import { OnboardingProvider } from './src/presentation/components/OnboardingTour';
import EnhancedErrorBoundary from './src/presentation/components/ErrorBoundary';
import AppNavigator from './src/presentation/navigation/AppNavigator';

export default function App() {
  return (
    <EnhancedErrorBoundary>
      <SafeAreaProvider style={{ flex: 1 }}>
        <ThemeToggleProvider>
          <ThemeProvider>
            <NotificationProvider>

              <AuthProvider>
                <ProfileThemeProvider>
                  <UndoProvider>
                    <OnboardingProvider>
                      <StatusBar style="auto" />
                      <AppNavigator />
                    </OnboardingProvider>
                  </UndoProvider>
                </ProfileThemeProvider>
              </AuthProvider>

            </NotificationProvider>
          </ThemeProvider>
        </ThemeToggleProvider>
      </SafeAreaProvider>
    </EnhancedErrorBoundary>
  );
}
