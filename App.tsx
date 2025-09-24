import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/presentation/contexts/ThemeContext';
import { AuthProvider } from './src/presentation/contexts/AuthProvider';
import AppNavigator from './src/presentation/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
