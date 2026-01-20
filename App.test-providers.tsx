/**
 * TESTE COM PROVIDERS - SEM NAVIGATOR
 * 
 * Este teste inclui TODOS os providers da hierarquia original,
 * mas SEM o AppNavigator, para verificar se o problema está
 * no React Navigation.
 */

import React from "react";
import { SafeAreaView, ScrollView, View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "./src/presentation/contexts/ThemeContext";
import { ThemeToggleProvider } from "./src/presentation/contexts/ThemeToggleContext";
import { ProfileThemeProvider } from "./src/contexts/ProfileThemeContext";
import { AuthProvider } from "./src/presentation/contexts/AuthProvider";
import { NotificationProvider } from "./src/presentation/contexts/NotificationContext";
import { UndoProvider } from "./src/presentation/components/UndoManager";
import { OnboardingProvider } from "./src/presentation/components/OnboardingTour";
import EnhancedErrorBoundary from "./src/presentation/components/ErrorBoundary";

export default function App() {
    return (
        <EnhancedErrorBoundary>
            <SafeAreaProvider style={{ flex: 1 }}>
                <ThemeToggleProvider>
                    <NotificationProvider>
                        <ThemeProvider>
                            <AuthProvider>
                                <ProfileThemeProvider>
                                    <UndoProvider>
                                        <OnboardingProvider>
                                            {/* TESTE DIRETO - SEM NAVIGATOR */}
                                            <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
                                                <View style={{ padding: 20, backgroundColor: '#333' }}>
                                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                                                        🧪 TESTE COM TODOS OS PROVIDERS
                                                    </Text>
                                                    <Text style={{ color: 'white', fontSize: 14, marginTop: 8 }}>
                                                        Inclui: ErrorBoundary, SafeAreaProvider, ThemeToggle,
                                                    </Text>
                                                    <Text style={{ color: 'white', fontSize: 14 }}>
                                                        Notification, Theme, PaperProvider, Auth,
                                                    </Text>
                                                    <Text style={{ color: 'white', fontSize: 14 }}>
                                                        ProfileTheme, Undo, Onboarding
                                                    </Text>
                                                    <Text style={{ color: 'white', fontSize: 14, marginTop: 8, fontWeight: 'bold' }}>
                                                        MAS SEM AppNavigator
                                                    </Text>
                                                </View>

                                                <ScrollView
                                                    style={{ flex: 1 }}
                                                    contentContainerStyle={{ padding: 20 }}
                                                >
                                                    {Array.from({ length: 80 }).map((_, i) => (
                                                        <View
                                                            key={i}
                                                            style={{
                                                                height: 60,
                                                                marginBottom: 12,
                                                                backgroundColor: i % 2 ? '#e74c3c' : '#3498db',
                                                                borderRadius: 8,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                                                                Box {i + 1} de 80
                                                            </Text>
                                                        </View>
                                                    ))}

                                                    <View style={{
                                                        padding: 20,
                                                        backgroundColor: '#2ecc71',
                                                        borderRadius: 8,
                                                        marginTop: 20,
                                                    }}>
                                                        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                                                            ✅ SE VOCÊ VÊ ISSO, O SCROLL FUNCIONA!
                                                        </Text>
                                                        <Text style={{ color: 'white', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                                                            Isso significa que o problema está no Navigator.
                                                        </Text>
                                                    </View>
                                                </ScrollView>
                                            </SafeAreaView>
                                        </OnboardingProvider>
                                    </UndoProvider>
                                </ProfileThemeProvider>
                            </AuthProvider>
                        </ThemeProvider>
                    </NotificationProvider>
                </ThemeToggleProvider>
            </SafeAreaProvider>
        </EnhancedErrorBoundary>
    );
}
