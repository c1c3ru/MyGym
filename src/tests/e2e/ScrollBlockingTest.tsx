/**
 * E2E Test: Scroll Blocking Detection
 * 
 * This test helps identify layout issues that prevent ScrollView from working.
 * 
 * Common culprits:
 * 1. height: '100%' or overflow: 'hidden' in parent containers
 * 2. LinearGradient with flex: 1 instead of flexGrow: 1
 * 3. Navigator contentStyle with overflow: 'hidden'
 * 4. PaperProvider/Portal.Host with fixed height
 * 
 * Run this test to verify scroll functionality at different levels:
 * - Root level (App.tsx)
 * - Navigator level (AppNavigator, AdminNavigator)
 * - Screen level (AddClassScreen, AddStudentScreen)
 */

import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Test 1: Basic ScrollView Test (should ALWAYS work)
export const BasicScrollTest = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
                {Array.from({ length: 100 }).map((_, i) => (
                    <View
                        key={i}
                        style={{
                            height: 60,
                            backgroundColor: i % 2 ? 'green' : 'yellow',
                            marginBottom: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                            Box {i + 1}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

// Test 2: ScrollView with contentContainerStyle (common pattern)
export const ContentContainerScrollTest = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    padding: 20,
                    paddingBottom: 150,
                }}
                keyboardShouldPersistTaps="handled"
            >
                {Array.from({ length: 50 }).map((_, i) => (
                    <View
                        key={i}
                        style={{
                            height: 60,
                            backgroundColor: i % 2 === 0 ? 'red' : 'blue',
                            marginBottom: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                            Item {i + 1}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

// Test 3: BROKEN - height: '100%' (should NOT scroll)
export const BrokenHeightTest = () => {
    return (
        <View style={{ height: '100%' }}>
            <ScrollView style={{ flex: 1 }}>
                {Array.from({ length: 50 }).map((_, i) => (
                    <View
                        key={i}
                        style={{
                            height: 60,
                            backgroundColor: i % 2 === 0 ? 'orange' : 'purple',
                            marginBottom: 10,
                        }}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

// Test 4: BROKEN - overflow: 'hidden' (should NOT scroll)
export const BrokenOverflowTest = () => {
    return (
        <View style={{ flex: 1, overflow: 'hidden' }}>
            <ScrollView style={{ flex: 1 }}>
                {Array.from({ length: 50 }).map((_, i) => (
                    <View
                        key={i}
                        style={{
                            height: 60,
                            backgroundColor: i % 2 === 0 ? 'pink' : 'cyan',
                            marginBottom: 10,
                        }}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

// Test 5: Diagnostic Component - Shows current layout constraints
export const LayoutDiagnostics = () => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20 }}
            >
                <View style={styles.diagnosticCard}>
                    <Text style={styles.diagnosticTitle}>🔍 Layout Diagnostics</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>✅ CORRECT Patterns:</Text>
                        <Text style={styles.code}>{'<SafeAreaView style={{ flex: 1 }}>'}</Text>
                        <Text style={styles.code}>{'  <ScrollView style={{ flex: 1 }}>'}</Text>
                        <Text style={styles.code}>{'    {content}'}</Text>
                        <Text style={styles.code}>{'  </ScrollView>'}</Text>
                        <Text style={styles.code}>{'</SafeAreaView>'}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>❌ BROKEN Patterns:</Text>
                        <Text style={styles.errorCode}>{"<View style={{ height: '100%' }}>"}</Text>
                        <Text style={styles.errorCode}>{"<View style={{ overflow: 'hidden' }}>"}</Text>
                        <Text style={styles.errorCode}>{"<LinearGradient style={{ flex: 1 }}>"}</Text>
                        <Text style={styles.note}>Use flexGrow: 1 for LinearGradient</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🎯 Common Culprits:</Text>
                        <Text style={styles.item}>1. App.tsx - SafeAreaProvider</Text>
                        <Text style={styles.item}>2. AppNavigator - NavigationContainer</Text>
                        <Text style={styles.item}>3. Stack.Navigator - screenOptions</Text>
                        <Text style={styles.item}>4. Tab.Navigator - screenOptions</Text>
                        <Text style={styles.item}>5. LinearGradient wrappers</Text>
                        <Text style={styles.item}>6. PaperProvider/Portal.Host</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🔧 How to Fix:</Text>
                        <Text style={styles.fixStep}>1. Remove all height: '100%'</Text>
                        <Text style={styles.fixStep}>2. Remove all overflow: 'hidden'</Text>
                        <Text style={styles.fixStep}>3. Use flex: 1 only on direct parents</Text>
                        <Text style={styles.fixStep}>4. Use flexGrow: 1 for LinearGradient</Text>
                        <Text style={styles.fixStep}>5. Check Navigator screenOptions</Text>
                    </View>

                    {/* Spacer boxes to test scroll */}
                    {Array.from({ length: 20 }).map((_, i) => (
                        <View
                            key={i}
                            style={{
                                height: 80,
                                backgroundColor: i % 3 === 0 ? '#4CAF50' : i % 3 === 1 ? '#2196F3' : '#FF9800',
                                marginTop: 10,
                                borderRadius: 8,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                                Scroll Test Box {i + 1}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    diagnosticCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    diagnosticTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    section: {
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    code: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#2e7d32',
        marginBottom: 4,
        paddingLeft: 8,
    },
    errorCode: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#d32f2f',
        marginBottom: 4,
        paddingLeft: 8,
    },
    note: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 8,
        paddingLeft: 8,
    },
    item: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
        paddingLeft: 8,
    },
    fixStep: {
        fontSize: 14,
        color: '#1976d2',
        marginBottom: 8,
        paddingLeft: 8,
    },
});

// Export all tests
export default {
    BasicScrollTest,
    ContentContainerScrollTest,
    BrokenHeightTest,
    BrokenOverflowTest,
    LayoutDiagnostics,
};
