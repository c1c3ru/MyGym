import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert, Platform, ScrollView, Linking, KeyboardAvoidingView } from 'react-native';
import {
  Card,
  Divider,
  ActivityIndicator,
  Text,
  Switch,
  Menu,
  TouchableRipple,
  Snackbar,
  HelperText,
  TextInput,
  Portal
} from 'react-native-paper';
import ModernCard from '@presentation/components/modern/ModernCard';
import ModernButton from '@presentation/components/modern/ModernButton';
import ModernTextField from '@presentation/components/modern/ModernTextField';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
// AnimatedCard/AnimatedButton substituídos por versões Modern sem quebrar lógica
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import EnhancedErrorMessage, { useEnhancedError } from '@components/EnhancedErrorMessage';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import { useFormValidation } from '@hooks/useFormValidation';
import { rateLimitService } from '@services/rateLimitService';
import LoginSkeleton from '@components/skeletons/LoginSkeleton';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getAuthGradient, getAuthCardColors } from '@presentation/theme/authTheme';
import { getString } from '@utils/theme';
import type { AuthScreenProps, LoginFormErrors, SnackbarState } from './auth/types';

// Mapear erros de autenticação para códigos do EnhancedErrorMessage
const mapAuthErrorToCode = (error: any): string => {
  const errorCode = error.code || error.name || '';

  // Mapear erros específicos do Firebase Auth
  if (errorCode.includes('auth/user-not-found')) return 'auth/user-not-found';
  if (errorCode.includes('auth/wrong-password')) return 'auth/wrong-password';
  if (errorCode.includes('auth/invalid-credential')) return 'auth/wrong-password';
  if (errorCode.includes('auth/invalid-email')) return 'auth/invalid-email';
  if (errorCode.includes('auth/too-many-requests')) return 'auth/too-many-requests';
  if (errorCode.includes('auth/network-request-failed')) return 'network/offline';
  if (errorCode.includes('auth/email-already-in-use')) return 'auth/email-already-in-use';
  if (errorCode.includes('auth/weak-password')) return 'auth/weak-password';

  // Mapear erros customizados do domain
  if (errorCode.includes('UserProfileNotFoundError')) return 'data/not-found';
  if (errorCode.includes('UnauthorizedError')) return 'permission/denied';
  if (errorCode.includes('NetworkError')) return 'network/offline';

  // Fallback para erro genérico
  return 'unknown';
};

// Função para lidar com ações do EnhancedErrorMessage
const handleErrorAction = (
  action: string,
  navigation: any,
  setEmail: (email: string) => void,
  setPassword: (password: string) => void
): void => {
  switch (action) {
    case 'focus-email':
      // Focar no campo de email (implementar ref se necessário)
      break;
    case 'focus-password':
      // Focar no campo de senha (implementar ref se necessário)
      break;
    case 'reset-password':
      if (navigation) {
        navigation.navigate('ForgotPassword');
      }
      break;
    case 'register':
      if (navigation) {
        navigation.navigate('Register');
      }
      break;
    case 'retry':
      // Limpar campos para nova tentativa
      break;
    case 'support':
      // Abrir link de suporte ou fallback para alerta
      const supportUrl = 'mailto:support@mygym.app?subject=Ajuda%20no%20login';
      Linking.openURL(supportUrl).catch(() => {
        Alert.alert('Suporte', 'Envie um e-mail para support@mygym.app');
      });
      break;
    default:
      console.log('Ação não mapeada:', action);
  }
};

/**
 * Tela de login
 * Permite que o usuário faça login com e-mail/senha ou provedores sociais
 */
export default function LoginScreen({ navigation }: AuthScreenProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [languageMenuVisible, setLanguageMenuVisible] = useState<boolean>(false);

  // Feedback states
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    visible: false,
    message: '',
    type: 'info'
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});

  // Sistema de feedback visual para erros
  const {
    error: enhancedError,
    showError: showEnhancedError,
    clearError: clearEnhancedError
  } = useEnhancedError();

  // Analytics tracking
  useScreenTracking('LoginScreen');
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

  const { signIn, signInWithGoogle, signInWithFacebook, signInWithMicrosoft, signInWithApple } = useAuthFacade();
  // @ts-ignore - ThemeContext needs proper typing
  const { isDarkMode, currentLanguage, languages, theme, toggleDarkMode, changeLanguage, getString } = useTheme();

  const showSnackbar = useCallback((message: string, type: SnackbarState['type'] = 'info'): void => {
    setSnackbar({
      visible: true,
      message,
      type
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, visible: false }));
  }, []);
  // Usar hook de validação customizado
  const validationRules = useMemo(() => ({
    email: {
      required: true,
      pattern: /\S+@\S+\.\S+/,
      message: getString('invalidEmail') || getString('invalidEmail')
    },
    password: {
      required: true,
      minLength: 6,
      message: getString('passwordTooShort') || 'Senha deve ter pelo menos 6 caracteres'
    }
  }), [getString]);

  const { validateField, validateForm: validateFormHook, errors: formErrors } = useFormValidation(validationRules);

  const validateForm = useCallback(() => {
    const isValid = validateFormHook({ email: email.trim(), password });
    setErrors(formErrors);
    return isValid;
  }, [email, password, validateFormHook, formErrors]);

  const handleLogin = useCallback(async () => {
    // Rate limiting para login
    const rateLimitKey = `login_${email.trim()}`;
    if (!rateLimitService.checkLimit(rateLimitKey, 5, 300000)) { // 5 tentativas por 5 minutos
      showSnackbar(getString('rateLimitExceeded') || 'Muitas tentativas de login. Tente novamente em alguns minutos.', 'error');
      return;
    }

    if (!validateForm()) {
      showSnackbar(getString('fillAllFields'), 'error');
      return;
    }

    setLoading(true);
    try {
      // Track login attempt (without exposing email)
      const emailDomain = email.trim().split('@')[1] || 'unknown';
      trackButtonClick('login_attempt', { emailDomain });

      await signIn(email.trim(), password);

      // Track successful login (without exposing email)
      trackFeatureUsage('login_success', { emailDomain });
      showSnackbar(getString('loginSuccess') || getString('loginSuccess'), 'success');

      // Reset rate limit on success
      rateLimitService.resetLimit(rateLimitKey);

    } catch (error: any) {
      console.error('Erro no login:', error);

      // Track failed login (without exposing email)
      const emailDomain = email.trim().split('@')[1] || 'unknown';
      trackFeatureUsage('login_failed', {
        emailDomain,
        errorCode: error?.code || error?.name,
        errorType: error?.code?.split('/')[1] || error?.name || 'unknown'
      });

      // Mapear erro para código do EnhancedErrorMessage
      const errorCode = mapAuthErrorToCode(error);
      showEnhancedError(errorCode);
    } finally {
      setLoading(false);
    }
  }, [email, password, validateForm, getString, showEnhancedError, trackButtonClick, signIn, trackFeatureUsage]);

  const handleForgotPassword = () => {
    if (navigation) {
      navigation.navigate('ForgotPassword');
    } else {
      Alert.alert(
        getString('recoverPassword'),
        getString('contactSupport'),
        [{ text: getString('ok') }]
      );
    }
  };

  const handleGoToRegister = () => {
    if (navigation) {
      navigation.navigate('Register');
    } else {
      Alert.alert(getString('register'), getString('registrationDevelopment'));
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithGoogle();
      showSnackbar('Login com Google realizado com sucesso!', 'success');
    } catch (error) {
      console.error(getString('googleLoginError'), error);
      const errorCode = mapAuthErrorToCode(error);
      showEnhancedError(errorCode);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithFacebook();
      showSnackbar('Login com Facebook realizado com sucesso!', 'success');
    } catch (error) {
      console.error(getString('facebookLoginError'), error);
      const errorCode = mapAuthErrorToCode(error);
      showEnhancedError(errorCode);
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithMicrosoft();
      showSnackbar('Login com Microsoft realizado com sucesso!', 'success');
    } catch (error) {
      console.error(getString('microsoftLoginError'), error);
      const errorCode = mapAuthErrorToCode(error);
      showEnhancedError(errorCode);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithApple();
      showSnackbar('Login com Apple realizado com sucesso!', 'success');
    } catch (error) {
      console.error(getString('appleLoginError'), error);
      const errorCode = mapAuthErrorToCode(error);
      showEnhancedError(errorCode);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          {getString('loggingIn')}...
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={getAuthGradient(isDarkMode) as any}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Decorative Element */}
            <View style={styles.topDecoration}>
              <LinearGradient
                colors={[COLORS.primary[500] + '44', 'transparent']}
                style={styles.topOrb}
              />
            </View>

            {/* Settings Row */}
            <View style={styles.settingsRow}>
              <View style={styles.settingItem}>
                <Menu
                  visible={languageMenuVisible}
                  onDismiss={() => setLanguageMenuVisible(false)}
                  anchor={
                    <TouchableRipple
                      style={[styles.glassButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                      onPress={() => setLanguageMenuVisible(true)}
                    >
                      <View style={styles.languageButtonContent}>
                        <Text style={styles.flagEmoji}>{languages[currentLanguage].flag}</Text>
                        <MaterialCommunityIcons
                          name="chevron-down"
                          size={16}
                          color={isDarkMode ? COLORS.white : COLORS.black}
                        />
                      </View>
                    </TouchableRipple>
                  }
                >
                  {Object.keys(languages).map((langCode) => (
                    <Menu.Item
                      key={langCode}
                      onPress={() => {
                        changeLanguage(langCode);
                        setLanguageMenuVisible(false);
                      }}
                      title={`${languages[langCode].flag} ${languages[langCode].name}`}
                    />
                  ))}
                </Menu>
              </View>

              <View style={styles.settingItem}>
                <TouchableRipple
                  onPress={toggleDarkMode}
                  style={[styles.glassButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                >
                  <MaterialCommunityIcons
                    name={isDarkMode ? "weather-night" : "weather-sunny"}
                    size={20}
                    color={isDarkMode ? COLORS.primary[400] : COLORS.warning[500]}
                  />
                </TouchableRipple>
              </View>
            </View>

            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={[COLORS.primary[500], COLORS.primary[700]]}
                  style={styles.logoGradient}
                >
                  <MaterialCommunityIcons name="fitness-center" size={40} color={COLORS.white} />
                </LinearGradient>
              </View>
              <Text style={[styles.headerTitle, { color: isDarkMode ? COLORS.white : COLORS.black, fontSize: 32 }]}>
                My<Text style={{ color: COLORS.primary[500], fontWeight: 'bold' }}>Gym</Text>
              </Text>
              <Text style={[styles.headerSubtitle, { color: isDarkMode ? COLORS.gray[400] : COLORS.gray[600] }]}>
                {getString('welcome')}
              </Text>
            </View>

            <View style={styles.content}>
              <ModernCard
                style={[
                  styles.loginCard,
                  getAuthCardColors(isDarkMode),
                  {
                    backdropFilter: 'blur(10px)', // Para web se suportado
                  }
                ]}
              >
                <ModernTextField
                  label={getString('email')}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  style={styles.input}
                  keyboardType="email-address"
                  error={!!errors.email}
                  theme={theme}
                />
                {errors.email && <HelperText type="error" style={styles.errorText}>{errors.email}</HelperText>}

                <ModernTextField
                  label={getString('password')}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  error={!!errors.password}
                  theme={theme}
                  right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
                />
                {errors.password && <HelperText type="error" style={styles.errorText}>{errors.password}</HelperText>}

                <ModernButton
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  loading={loading}
                  disabled={loading}
                  buttonColor={COLORS.primary[500]}
                >
                  {getString('login')}
                </ModernButton>

                <View style={styles.forgotPasswordRow}>
                  <TouchableRipple onPress={handleForgotPassword}>
                    <Text style={[styles.forgotPasswordText, { color: COLORS.primary[500] }]}>
                      {getString('forgotPassword')}
                    </Text>
                  </TouchableRipple>
                </View>

                <View style={styles.dividerRow}>
                  <View style={[styles.line, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
                  <Text style={[styles.dividerText, { color: isDarkMode ? COLORS.gray[500] : COLORS.gray[400] }]}>
                    {getString('orLoginWith')}
                  </Text>
                  <View style={[styles.line, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
                </View>

                <View style={styles.socialRow}>
                  <TouchableRipple
                    onPress={handleGoogleLogin}
                    style={[styles.socialIconBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : COLORS.white, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : COLORS.gray[200] }]}
                  >
                    <MaterialCommunityIcons name="google" size={24} color="#DB4437" />
                  </TouchableRipple>

                  <TouchableRipple
                    onPress={handleFacebookLogin}
                    style={[styles.socialIconBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : COLORS.white, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : COLORS.gray[200] }]}
                  >
                    <MaterialCommunityIcons name="facebook" size={24} color="#4267B2" />
                  </TouchableRipple>

                  <TouchableRipple
                    onPress={handleAppleLogin}
                    style={[styles.socialIconBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : COLORS.white, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : COLORS.gray[200] }]}
                  >
                    <MaterialCommunityIcons name="apple" size={24} color={isDarkMode ? COLORS.white : COLORS.black} />
                  </TouchableRipple>
                </View>

                <View style={styles.registerRow}>
                  <Text style={[styles.registerText, { color: isDarkMode ? COLORS.gray[200] : COLORS.gray[800], fontWeight: '500' }]}>
                    {getString('noAccount')}
                  </Text>
                  <TouchableRipple onPress={handleGoToRegister} style={styles.registerLink}>
                    <Text style={[styles.registerLinkText, { color: COLORS.primary[500], textDecorationLine: 'underline' }]}>
                      {getString('register')}
                    </Text>
                  </TouchableRipple>
                </View>
              </ModernCard>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Sistema de feedback visual para erros */}
        {
          enhancedError && (
            <View style={styles.errorContainer}>
              <EnhancedErrorMessage
                errorCode={enhancedError.errorCode}
                customMessage={enhancedError.customMessage || undefined}
                customTitle={enhancedError.customTitle || undefined}
                onAction={(action) => handleErrorAction(action, navigation, setEmail, setPassword)}
                onDismiss={clearEnhancedError}
                compact={false}
              />
            </View>
          )
        }

        {/* Snackbar para feedback */}
        <Snackbar
          visible={snackbar.visible}
          onDismiss={hideSnackbar}
          duration={snackbar.type === 'success' ? 3000 : 5000}
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
          <Text style={styles.snackbarText}>{snackbar.message}</Text>
        </Snackbar>
      </SafeAreaView >
    </LinearGradient >
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  topDecoration: {
    position: 'absolute',
    top: -150,
    right: -100,
    width: 300,
    height: 300,
  },
  topOrb: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    zIndex: 10,
  },
  glassButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  languageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 18,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  logoContainer: {
    marginBottom: 20,
    elevation: 8,
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    maxWidth: 500, // Aumentar um pouco para web
    alignSelf: 'center',
    width: '100%',
  },
  loginCard: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1.5,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  errorText: {
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },
  loginButton: {
    height: 56,
    borderRadius: 16,
    marginTop: 8,
    justifyContent: 'center',
  },
  forgotPasswordRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialIconBtn: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    padding: 4,
  },
  registerLinkText: {
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  snackbar: {
    borderRadius: 12,
  },
  errorContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
});