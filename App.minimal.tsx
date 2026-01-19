/**
 * TESTE DEFINITIVO - App Mínimo
 * 
 * Substitua temporariamente o conteúdo de App.tsx por este arquivo
 * para testar se o scroll funciona sem NENHUM provider ou wrapper.
 * 
 * Se este teste NÃO rolar, o problema está ANTES do App renderizar.
 * Se este teste rolar, o problema está em algum Provider/Wrapper.
 */

import React from 'react';
import { SafeAreaView, ScrollView, View, Text } from 'react-native';

export default function App() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
            <View style={{ padding: 20, backgroundColor: '#333' }}>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                    🧪 TESTE DEFINITIVO - App Mínimo
                </Text>
                <Text style={{ color: 'white', fontSize: 14, marginTop: 8 }}>
                    Se você conseguir rolar esta tela, o problema está nos Providers.
                </Text>
                <Text style={{ color: 'white', fontSize: 14, marginTop: 4 }}>
                    Se NÃO conseguir rolar, o problema está no nível do sistema.
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
                        Você rolou até o final com sucesso.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
