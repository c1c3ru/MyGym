import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider } from './src/presentation/contexts/ThemeContext';
import { ThemeToggleProvider } from './src/presentation/contexts/ThemeToggleContext';
import { AuthProvider } from './src/presentation/contexts/AuthProvider';
import { NotificationProvider } from './src/presentation/contexts/NotificationContext';
import { UndoProvider } from './src/presentation/components/UndoManager';
import { OnboardingProvider } from './src/presentation/components/OnboardingTour';
import AppNavigator from './src/presentation/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <ThemeToggleProvider>
          <ThemeProvider>
            <AuthProvider>
            <NotificationProvider>
              <UndoProvider>
                <OnboardingProvider>
                  <StatusBar style="auto" />
                  <AppNavigator />
                </OnboardingProvider>
              </UndoProvider>
            </NotificationProvider>
            </AuthProvider>
          </ThemeProvider>
        </ThemeToggleProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
