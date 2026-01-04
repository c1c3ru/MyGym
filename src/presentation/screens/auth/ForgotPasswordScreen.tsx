
import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import {
  TextInput,
  Card,
  Button,
  ActivityIndicator,
  Snackbar,
  HelperText,
  Text
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@infrastructure/services/firebase';
import AnimatedCard from '@components/AnimatedCard';
import AnimatedButton from '@components/AnimatedButton';
import { ResponsiveUtils } from '@utils/animations';
import { useTheme } from '@contexts/ThemeContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getAuthGradient, getAuthCardColors } from '@presentation/theme/authTheme';
import { getString } from '@utils/theme';
import type { AuthScreenProps, ForgotPasswordFormErrors, SnackbarState } from './types';

/**
 * Tela de recuperação de senha
 * Permite que o usuário solicite um e-mail de redefinição de senha
 */
export default function ForgotPasswordScreen({ navigation }: AuthScreenProps) {
  const { isDarkMode, theme, getString } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);

  // Feedback states
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    visible: false,
    message: '',
    type: 'info'
  });
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});

  /**
   * Exibe uma mensagem de feedback ao usuário
   */
  const showSnackbar = (message: string, type: SnackbarState['type'] = 'info'): void => {
    setSnackbar({
      visible: true,
      message,
      type
    });
  };

  /**
   * Oculta a mensagem de feedback
   */
  const hideSnackbar = (): void => {
    setSnackbar(prev => ({ ...prev, visible: false }));
  };

  /**
   * Valida o e-mail fornecido
   * @returns true se o e-mail é válido, false caso contrário
   */
  const validateEmail = (): boolean => {
    const newErrors: ForgotPasswordFormErrors = {};

    if (!email.trim()) {
      newErrors.email = getString('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = getString('invalidEmail');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Envia o e-mail de recuperação de senha
   */
  const handleResetPassword = async (): Promise<void> => {
    if (!validateEmail()) {
      showSnackbar(getString('pleaseValidEmail'), 'error');
      return;
    }

    setLoading(true);
    console.log('🔄 Iniciando processo de recuperação de senha...');
    console.log('📧 Email:', email.trim());
    console.log('🔥 Auth object:', auth);

    try {
      console.log('📤 Enviando email de recuperação...');
      await sendPasswordResetEmail(auth, email.trim());
      console.log('✅ Email de recuperação enviado com sucesso!');

      setEmailSent(true);
      showSnackbar(getString('emailSentSuccess'), 'success');

      // Auto-voltar após 5 segundos para dar tempo de ler
      setTimeout(() => {
        navigation.goBack();
      }, 5000);
    } catch (error: any) {
      console.error('❌ Erro detalhado ao enviar email:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);

      let errorMessage = getString('resetPasswordError');

      if (error.code === 'auth/user-not-found') {
        errorMessage = getString('emailNotFound');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = getString('invalidEmailFormat');
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = getString('tooManyRequests');
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = getString('networkError');
      } else if (error.code === 'auth/configuration-not-found') {
        errorMessage = getString('configurationNotFound');
      } else if (error.message) {
        errorMessage = `${getString('error')}: ${error.message}`;
      }

      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={getAuthGradient(isDarkMode) as any}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <MaterialCommunityIcons
                name="lock-reset"
                size={ResponsiveUtils?.isTablet?.() ? 80 : 60}
                color={COLORS.white}
                style={styles.headerIcon}
              />
              <Text style={styles.headerTitle}>{getString('recoverPassword')}</Text>
              <Text style={styles.headerSubtitle}>
                {getString('enterEmailForInstructions')}
              </Text>
            </View>

            <View style={styles.content}>
              <View style={[
                styles.cardWrapper,
                getAuthCardColors(isDarkMode),
              ]}>
                <Card.Content style={styles.cardContent}>
                  {!emailSent ? (
                    <>
                      <TextInput
                        label={getString('email')}
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          if (errors.email) {
                            setErrors(prev => ({ ...prev, email: undefined }));
                          }
                        }}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        disabled={loading}
                        left={<TextInput.Icon icon="email" />}
                        error={!!errors.email}
                      />
                      {errors.email && <HelperText type="error" style={styles.errorText}>{errors.email}</HelperText>}

                      <AnimatedButton
                        mode="contained"
                        onPress={handleResetPassword}
                        style={styles.resetButton}
                        loading={loading}
                        disabled={loading}
                        icon="email-send"
                      >
                        {getString('sendEmail')}
                      </AnimatedButton>
                    </>
                  ) : (
                    <View style={styles.successContainer}>
                      <MaterialCommunityIcons
                        name="email-check"
                        size={48}
                        color={COLORS.primary[500]}
                        style={styles.successIcon}
                      />
                      <Text style={[styles.successTitle, { color: COLORS.primary[500], fontWeight: 'bold', fontSize: FONT_SIZE.lg }]}>{getString('emailSent')}</Text>
                      <Text style={styles.successText}>
                        {getString('checkInboxInstructions')}
                      </Text>
                      <Text style={styles.spamWarning}>
                        {getString('spamFolderWarning')}
                      </Text>
                    </View>
                  )}

                  <View style={styles.backContainer}>
                    <Button
                      mode="text"
                      onPress={() => navigation.goBack()}
                      disabled={loading}
                      icon="arrow-left"
                    >
                      {getString('backToLogin')}
                    </Button>
                  </View>
                </Card.Content>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Snackbar para feedback */}
        <Snackbar
          visible={snackbar.visible}
          onDismiss={hideSnackbar}
          duration={snackbar.type === 'success' ? 4000 : 6000}
          style={[
            styles.snackbar,
            snackbar.type === 'success' && styles.snackbarSuccess,
            snackbar.type === 'error' && styles.snackbarError
          ]}
          action={{
            label: getString('close'),
            onPress: hideSnackbar,
            textColor: COLORS.white
          }}
        >
          {snackbar.message}
        </Snackbar>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: ResponsiveUtils?.spacing?.xl || 32,
  },
  header: {
    alignItems: 'center',
    padding: ResponsiveUtils?.spacing?.xl || 32,
    paddingBottom: ResponsiveUtils?.spacing?.md || 16,
  },
  headerIcon: {
    marginBottom: SPACING.base,
  },
  headerTitle: {
    fontSize: ResponsiveUtils?.fontSize?.large || 28,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    marginBottom: ResponsiveUtils?.spacing?.sm || 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: ResponsiveUtils?.fontSize?.medium || 16,
    color: COLORS.white + "E6",
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: ResponsiveUtils?.spacing?.md || 16,
    maxWidth: ResponsiveUtils?.isTablet?.() ? 500 : 450,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  cardWrapper: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      },
      default: {
        elevation: 8,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      }
    }),
  },
  cardContent: {
    padding: ResponsiveUtils?.spacing?.lg || 24,
  },
  input: {
    marginBottom: ResponsiveUtils?.spacing?.md || 16,
    backgroundColor: COLORS.white,
  },
  resetButton: {
    marginTop: ResponsiveUtils?.spacing?.sm || 8,
    paddingVertical: ResponsiveUtils?.spacing?.sm || 8,
    borderRadius: ResponsiveUtils?.borderRadius?.large || 25,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: ResponsiveUtils?.spacing?.md || 16,
  },
  successIcon: {
    marginBottom: ResponsiveUtils?.spacing?.md || 16,
  },
  successTitle: {
    color: COLORS.primary[500],
    marginBottom: ResponsiveUtils?.spacing?.sm || 8,
    textAlign: 'center',
  },
  successText: {
    textAlign: 'center',
    color: COLORS.text.secondary,
  },
  backContainer: {
    alignItems: 'center',
    marginTop: ResponsiveUtils?.spacing?.md || 16,
  },
  errorText: {
    marginBottom: SPACING.sm,
    marginTop: -8,
  },
  snackbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: SPACING.base,
  },
  snackbarSuccess: {
    backgroundColor: COLORS.primary[500],
  },
  snackbarError: {
    backgroundColor: COLORS.error[500],
  },
  spamWarning: {
    textAlign: 'center',
    color: COLORS.warning[500],
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.base,
    backgroundColor: COLORS.warning[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning[500],
  },
  spamWarningBold: {
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.warning[600],
  },
});
