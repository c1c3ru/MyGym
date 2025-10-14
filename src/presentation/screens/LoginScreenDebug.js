import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Text } from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Divider,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@contexts/AuthProvider';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getString } from '@utils/theme';

const LoginScreenDebug = ({ navigation }) => {
  const [email, setEmail] = useState('cicero.silva@ifce.edu.br');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const { signIn } = useAuth();

  const addDebugInfo = (info) => {
    setDebugInfo(prev => prev + info + '\n');
  };

  const handleLogin = async () => {
    setDebugInfo('=== INÍCIO DO DEBUG ===\n');
    
    if (!email || !password) {
      addDebugInfo('❌ Email ou senha vazios');
      Alert.alert(getString('error'), 'Por favor, preencha todos os campos');
      return;
    }

    addDebugInfo(`📧 Email: ${email}`);
    addDebugInfo(`🔑 Senha: ${password ? '***' : 'undefined'}`);
    addDebugInfo(`📧 Tipo: ${typeof email}`);
    addDebugInfo(`🔑 Tipo: ${typeof password}`);
    addDebugInfo(`📧 Comprimento: ${email.length}`);
    addDebugInfo(`🔑 Comprimento: ${password.length}`);

    setLoading(true);
    try {
      addDebugInfo('🚀 Iniciando login...');
      await signIn(email, password);
      addDebugInfo('✅ Login bem-sucedido!');
      Alert.alert(getString('success'), getString('loginSuccess'));
    } catch (error) {
      addDebugInfo(`❌ Erro: ${error.code}`);
      addDebugInfo(`📝 Mensagem: ${error.message}`);
      addDebugInfo(`🔍 Stack: ${error.stack}`);
      
      if (error.code === 'auth/invalid-credential') {
        addDebugInfo('💡 Análise do erro:');
        addDebugInfo('   - Verificar se o email está correto');
        addDebugInfo('   - Verificar se a senha está correta');
        addDebugInfo('   - Verificar se há espaços extras');
        addDebugInfo('   - Verificar configuração do Firebase');
      }
      
      Alert.alert(getString('error'), `Erro no login: ${error.code}`);
    } finally {
      setLoading(false);
    }
  };

  const clearDebug = () => {
    setDebugInfo('');
  };

  const testWithCleanData = async () => {
    setDebugInfo('=== TESTE COM DADOS LIMPOS ===\n');
    
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    
    addDebugInfo(`🧹 Email limpo: ${cleanEmail}`);
    addDebugInfo(`🧹 Senha limpa: ${cleanPassword ? '***' : 'undefined'}`);
    
    setLoading(true);
    try {
      addDebugInfo('🚀 Tentando login com dados limpos...');
      await signIn(cleanEmail, cleanPassword);
      addDebugInfo('✅ Login com dados limpos bem-sucedido!');
      Alert.alert(getString('success'), 'Login com dados limpos realizado!');
    } catch (error) {
      addDebugInfo(`❌ Erro com dados limpos: ${error.code}`);
      addDebugInfo(`📝 Mensagem: ${error.message}`);
      Alert.alert(getString('error'), `Erro com dados limpos: ${error.code}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, styles.title]}>Debug de Login</Text>
          <Text style={[styles.subtitle, styles.paragraph]}>
            Teste de autenticação com logs detalhados
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.cardTitle, styles.title]}>Credenciais</Text>
            
            <TextInput
              label="email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              disabled={loading}
            />

            <TextInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              disabled={loading}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color={COLORS.white} /> : 'Testar Login'}
            </Button>

            <Button
              mode="outlined"
              onPress={testWithCleanData}
              style={styles.button}
              disabled={loading}
            >
              Testar com Dados Limpos
            </Button>

            <Button
              mode="outlined"
              onPress={clearDebug}
              style={styles.button}
            >
              Limpar Debug
            </Button>

            <Divider style={styles.divider} />

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login'))}
            >
              Voltar para Login Normal
            </Button>
          </Card.Content>
        </Card>

        {debugInfo ? (
          <Card style={styles.debugCard}>
            <Card.Content>
              <Text style={[styles.title, null]}>Logs de Debug</Text>
              <Text style={styles.debugText}>
                {debugInfo}
              </Text>
            </Card.Content>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  card: {
    marginBottom: 20,
  },
  cardTitle: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginVertical: 5,
  },
  divider: {
    marginVertical: 20,
  },
  debugCard: {
    backgroundColor: COLORS.background.light,
  },
  debugText: {
    fontFamily: 'monospace',
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.primary,
    lineHeight: 18,
  },
});

export default LoginScreenDebug; 