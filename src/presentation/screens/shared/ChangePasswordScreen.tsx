import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  Button,
  TextInput,
  HelperText,
  Snackbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import SafeCardContent from '@components/SafeCardContent';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import type { NavigationProp } from '@react-navigation/native';

interface ChangePasswordScreenProps {
  navigation: NavigationProp<any>;
}

const ChangePasswordScreen = ({ navigation }: ChangePasswordScreenProps) => {
  const { user } = useAuth();
  const { isDarkMode, getString } = useTheme();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'Nova senha deve ser diferente da senha atual';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Primeiro, reautenticar o usuário com a senha atual
      const credential = EmailAuthProvider.credential(
        user.email,
        formData.currentPassword
      );

      await reauthenticateWithCredential(user, credential);

      // Se a reautenticação foi bem-sucedida, atualizar a senha
      await updatePassword(user, formData.newPassword);

      setSnackbar({
        visible: true,
        message: 'Senha alterada com sucesso! 🎉',
        type: 'success'
      });

      // Limpar o formulário
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Voltar à tela anterior após um breve delay
      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Erro ao alterar senha:', error);

      let errorMessage = 'Erro ao alterar senha. Tente novamente.';

      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha atual incorreta';
        setErrors({ currentPassword: errorMessage });
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Nova senha é muito fraca';
        setErrors({ newPassword: errorMessage });
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por segurança, faça login novamente e tente alterar a senha';
      }

      setSnackbar({
        visible: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <LinearGradient
      colors={getAuthGradient(isDarkMode) as any}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>Alterar Senha</Text>
              <Text style={styles.subtitle}>
                Para sua segurança, informe sua senha atual e defina uma nova senha
              </Text>

              {/* Senha Atual */}
              <TextInput
                label="Senha Atual"
                value={formData.currentPassword}
                onChangeText={(value) => updateFormData('currentPassword', value)}
                mode="outlined"
                secureTextEntry={!showPasswords.current}
                style={styles.input}
                error={!!errors.currentPassword}
                right={
                  <TextInput.Icon
                    icon={showPasswords.current ? 'eye-off' : 'eye'}
                    onPress={() => toggleShowPassword('current')}
                  />
                }
              />
              {errors.currentPassword ? (
                <HelperText type="error">{errors.currentPassword}</HelperText>
              ) : null}

              {/* Nova Senha */}
              <TextInput
                label="Nova Senha"
                value={formData.newPassword}
                onChangeText={(value) => updateFormData('newPassword', value)}
                mode="outlined"
                secureTextEntry={!showPasswords.new}
                style={styles.input}
                error={!!errors.newPassword}
                right={
                  <TextInput.Icon
                    icon={showPasswords.new ? 'eye-off' : 'eye'}
                    onPress={() => toggleShowPassword('new')}
                  />
                }
              />
              {errors.newPassword ? (
                <HelperText type="error">{errors.newPassword}</HelperText>
              ) : null}
              {!errors.newPassword && formData.newPassword ? (
                <HelperText type="info">
                  A senha deve ter pelo menos 6 caracteres
                </HelperText>
              ) : null}

              {/* Confirmar Nova Senha */}
              <TextInput
                label="Confirmar Nova Senha"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                mode="outlined"
                secureTextEntry={!showPasswords.confirm}
                style={styles.input}
                error={!!errors.confirmPassword}
                right={
                  <TextInput.Icon
                    icon={showPasswords.confirm ? 'eye-off' : 'eye'}
                    onPress={() => toggleShowPassword('confirm')}
                  />
                }
              />
              {errors.confirmPassword ? (
                <HelperText type="error">{errors.confirmPassword}</HelperText>
              ) : null}

              {/* Botões */}
              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.goBack()}
                  style={styles.button}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleChangePassword}
                  style={styles.button}
                  loading={loading}
                  disabled={loading}
                >
                  Alterar Senha
                </Button>
              </View>

              {/* Dicas de Segurança */}
              <Card style={styles.tipsCard}>
                <Card.Content>
                  <Text style={styles.tipsTitle}>💡 Dicas de Segurança</Text>
                  <Text style={styles.tipsText}>
                    • Use uma senha com pelo menos 8 caracteres{'\n'}
                    • Combine letras maiúsculas, minúsculas e números{'\n'}
                    • Evite informações pessoais óbvias{'\n'}
                    • Não reutilize senhas de outras contas{'\n'}
                    • Considere usar um gerenciador de senhas
                  </Text>
                </Card.Content>
              </Card>
            </Card.Content>
          </Card>
        </ScrollView>

        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          duration={snackbar.type === 'success' ? 3000 : 5000}
          style={{
            backgroundColor: snackbar.type === 'success' ? COLORS.primary[500] : COLORS.error[500]
          }}
        >
          {snackbar.message}
        </Snackbar>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.base,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    marginBottom: SPACING.sm,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  tipsCard: {
    marginTop: 24,
    backgroundColor: COLORS.primary[50],
  },
  tipsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
    color: COLORS.primary[800],
  },
  tipsText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.primary[900],
    lineHeight: 20,
  },
});

export default ChangePasswordScreen;