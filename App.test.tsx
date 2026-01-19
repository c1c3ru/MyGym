/**
 * TEMPORARY TEST FILE
 * 
 * Instructions:
 * 1. Backup your current App.tsx
 * 2. Replace App.tsx content with this file
 * 3. Run the app and check if scroll works
 * 4. If scroll WORKS here but NOT in your app, the problem is in your layout hierarchy
 * 5. Restore your original App.tsx after testing
 * 
 * Expected Results:
 * ✅ If this scrolls → Problem is in your app's layout hierarchy (Navigator, Providers, etc.)
 * ❌ If this doesn't scroll → Problem is in root-level web styles or SafeAreaProvider
 */

import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import the test components
import {
    BasicScrollTest,
    ContentContainerScrollTest,
    BrokenHeightTest,
    BrokenOverflowTest,
    LayoutDiagnostics,
} from './src/tests/e2e/ScrollBlockingTest';

export default function App() {
    const [currentTest, setCurrentTest] = useState<string>('menu');

    const renderTest = () => {
        switch (currentTest) {
            case 'basic':
                return <BasicScrollTest />;
            case 'contentContainer':
                return <ContentContainerScrollTest />;
            case 'brokenHeight':
                return <BrokenHeightTest />;
            case 'brokenOverflow':
                return <BrokenOverflowTest />;
            case 'diagnostics':
                return <LayoutDiagnostics />;
            default:
                return (
                    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
                        <ScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={{ padding: 20 }}
                        >
                            <View style={styles.menuContainer}>
                                <Text style={styles.title}>🧪 Scroll Blocking E2E Tests</Text>
                                <Text style={styles.subtitle}>
                                    Select a test to identify scroll-blocking issues
                                </Text>

                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>✅ Working Tests (Should Scroll)</Text>

                                    <TouchableOpacity
                                        style={styles.testButton}
                                        onPress={() => setCurrentTest('basic')}
                                    >
                                        <Text style={styles.buttonText}>1. Basic ScrollView Test</Text>
                                        <Text style={styles.buttonDescription}>
                                            Simple SafeAreaView + ScrollView
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.testButton}
                                        onPress={() => setCurrentTest('contentContainer')}
                                    >
                                        <Text style={styles.buttonText}>2. ContentContainer Test</Text>
                                        <Text style={styles.buttonDescription}>
                                            ScrollView with contentContainerStyle
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.testButton}
                                        onPress={() => setCurrentTest('diagnostics')}
                                    >
                                        <Text style={styles.buttonText}>3. Layout Diagnostics</Text>
                                        <Text style={styles.buttonDescription}>
                                            Comprehensive diagnostic information
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>❌ Broken Tests (Should NOT Scroll)</Text>

                                    <TouchableOpacity
                                        style={[styles.testButton, styles.dangerButton]}
                                        onPress={() => setCurrentTest('brokenHeight')}
                                    >
                                        <Text style={styles.buttonText}>4. Broken: height: '100%'</Text>
                                        <Text style={styles.buttonDescription}>
                                            Demonstrates height: '100%' issue
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.testButton, styles.dangerButton]}
                                        onPress={() => setCurrentTest('brokenOverflow')}
                                    >
                                        <Text style={styles.buttonText}>5. Broken: overflow: 'hidden'</Text>
                                        <Text style={styles.buttonDescription}>
                                            Demonstrates overflow: 'hidden' issue
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.infoBox}>
                                    <Text style={styles.infoTitle}>📋 Test Instructions:</Text>
                                    <Text style={styles.infoText}>
                                        1. Run each test and verify scroll behavior{'\n'}
                                        2. Working tests should scroll smoothly{'\n'}
                                        3. Broken tests demonstrate common issues{'\n'}
                                        4. If ALL tests fail, check root-level styles{'\n'}
                                        5. If only app screens fail, check Navigator/Provider hierarchy
                                    </Text>
                                </View>

                                {/* Add some boxes to test menu scroll */}
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <View
                                        key={i}
                                        style={{
                                            height: 60,
                                            backgroundColor: i % 2 === 0 ? '#e3f2fd' : '#f3e5f5',
                                            marginTop: 10,
                                            borderRadius: 8,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text style={{ fontSize: 14, color: '#555' }}>
                                            Scroll Test Element {i + 1}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                );
        }
    };

    return (
        <SafeAreaProvider style={{ flex: 1 }}>
            {currentTest !== 'menu' && (
                <View style={styles.backButtonContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setCurrentTest('menu')}
                    >
                        <Text style={styles.backButtonText}>← Back to Menu</Text>
                    </TouchableOpacity>
                </View>
            )}
            {renderTest()}
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    menuContainer: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    testButton: {
        backgroundColor: '#2196F3',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dangerButton: {
        backgroundColor: '#f44336',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    buttonDescription: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    infoBox: {
        backgroundColor: '#fff3cd',
        padding: 16,
        borderRadius: 8,
        marginTop: 24,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#ffc107',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#856404',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#856404',
        lineHeight: 20,
    },
    backButtonContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 1000,
    },
    backButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
