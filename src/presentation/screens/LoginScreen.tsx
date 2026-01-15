import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert, Platform, ScrollView, Linking, KeyboardAvoidingView } from 'react-native';
import {
  ActivityIndicator,
  Text,
  Snackbar,
  TouchableRipple
} from 'react-native-paper';
import ModernCard from '@presentation/components/modern/ModernCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import EnhancedErrorMessage, { useEnhancedError } from '@components/EnhancedErrorMessage';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import { useFormValidation } from '@hooks/useFormValidation';
import { rateLimitService } from '@infrastructure/services/rateLimitService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getAuthGradient, getAuthCardColors } from '@presentation/theme/authTheme';
import { hexToRgba } from '@shared/utils/colorUtils';
import formValidator from '@shared/utils/formValidation';
import type { AuthScreenProps, LoginFormErrors, SnackbarState } from './auth/types';

// Importing extracted components
import { LoginHeader } from './auth/components/LoginHeader';
import { LoginSettings } from './auth/components/LoginSettings';
import { LoginForm } from './auth/components/LoginForm';
import { SocialLogin } from './auth/components/SocialLogin';

// Mapear erros de autenticação (mantido localmente ou poderia ser movido para util)
const mapAuthErrorToCode = (error: any): string => {
  const errorCode = error.code || error.name || '';
  if (errorCode.includes('auth/user-not-found')) return 'auth/user-not-found';
  if (errorCode.includes('auth/wrong-password')) return 'auth/wrong-password';
  if (errorCode.includes('auth/invalid-credential')) return 'auth/wrong-password';
  if (errorCode.includes('auth/invalid-email')) return 'auth/invalid-email';
  if (errorCode.includes('auth/too-many-requests')) return 'auth/too-many-requests';
  if (errorCode.includes('auth/network-request-failed')) return 'network/offline';
  if (errorCode.includes('auth/email-already-in-use')) return 'auth/email-already-in-use';
  if (errorCode.includes('auth/weak-password')) return 'auth/weak-password';
  if (errorCode.includes('UserProfileNotFoundError')) return 'data/not-found';
  if (errorCode.includes('UnauthorizedError') || errorCode.includes('UNAUTHORIZED')) return 'auth/wrong-password';
  if (errorCode.includes('NetworkError')) return 'network/offline';
  if (errorCode.includes('InvalidCredentialsError')) return 'auth/wrong-password';
  return 'unknown';
};

const handleErrorAction = (
  action: string,
  navigation: any,
  setEmail: (email: string) => void,
  setPassword: (password: string) => void,
  handleGoogleLogin?: () => void
): void => {
  switch (action) {
    case 'reset-password':
      if (navigation) navigation.navigate('ForgotPassword');
      break;
    case 'register':
      if (navigation) navigation.navigate('Register');
      break;
    case 'google-login':
      if (handleGoogleLogin) handleGoogleLogin();
      break;
    case 'support':
      const supportUrl = 'mailto:support@mygym.app?subject=Ajuda%20no%20login';
      Linking.openURL(supportUrl).catch(() => {
        Alert.alert('Suporte', 'Envie um e-mail para support@mygym.app');
      });
      break;
  }
};

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

  const {
    error: enhancedError,
    showError: showEnhancedError,
    clearError: clearEnhancedError
  } = useEnhancedError();

  useScreenTracking('LoginScreen');
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

  const { signIn, signInWithGoogle, signInWithFacebook, signInWithMicrosoft, signInWithApple } = useAuthFacade();
  const { isDarkMode, currentLanguage, languages, theme, toggleDarkMode, changeLanguage, getString } = useTheme();

  const showSnackbar = useCallback((message: string, type: SnackbarState['type'] = 'info'): void => {
    setSnackbar({ visible: true, message, type });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, visible: false }));
  }, []);

  const validationRules = useMemo(() => ({
    email: {
      required: true,
      pattern: /\S+@\S+\.\S+/,
      message: getString('invalidEmail')
    },
    password: {
      required: true,
      minLength: 6,
      message: getString('passwordMinChars')
    }
  }), [getString]);

  const { validateForm: validateFormHook } = useFormValidation(validationRules);

  const validateForm = useCallback(async () => {
    const result = await formValidator.validateForm({ email: email.trim(), password }, validationRules as any);
    const mappedErrors: LoginFormErrors = {};
    Object.keys(result.errors).forEach(key => {
      mappedErrors[key as keyof LoginFormErrors] = result.errors[key][0];
    });
    setErrors(mappedErrors);
    return result.isValid;
  }, [email, password, validationRules]);

  const handleLogin = useCallback(async () => {
    const rateLimitKey = `login_${email.trim()}`;
    if (!rateLimitService.checkLimit(rateLimitKey, 5, 300000)) {
      showSnackbar(getString('rateLimitExceeded') || 'Muitas tentativas de login. Tente novamente em alguns minutos.', 'error');
      return;
    }

    if (!validateForm()) {
      showSnackbar(getString('fillAllFields'), 'error');
      return;
    }

    setLoading(true);
    try {
      const emailDomain = email.trim().split('@')[1] || 'unknown';
      trackButtonClick('login_attempt', { emailDomain });

      await signIn(email.trim(), password);

      trackFeatureUsage('login_success', { emailDomain });
      showSnackbar(getString('loginSuccess') || 'Login realizado com sucesso', 'success');
      rateLimitService.resetLimit(rateLimitKey);

    } catch (error: any) {
      console.error('Erro no login:', error);
      const emailDomain = email.trim().split('@')[1] || 'unknown';
      trackFeatureUsage('login_failed', {
        emailDomain,
        errorCode: error?.code || error?.name,
        errorType: error?.code?.split('/')[1] || error?.name || 'unknown'
      });
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
      Alert.alert(getString('recoverPassword'), getString('contactSupport'), [{ text: getString('ok') }]);
    }
  };

  const wrapSocialLogin = async (fn: () => Promise<any>, name: string, successMsg: string, errorMsg: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await fn();
      showSnackbar(getString(successMsg), 'success');
    } catch (error) {
      console.error(getString(errorMsg), error);
      const errorCode = mapAuthErrorToCode(error);
      showEnhancedError(errorCode);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => wrapSocialLogin(signInWithGoogle, 'Google', 'googleLoginSuccess', 'googleLoginError');
  const handleFacebookLogin = () => wrapSocialLogin(signInWithFacebook, 'Facebook', 'facebookLoginSuccess', 'facebookLoginError');
  const handleAppleLogin = () => wrapSocialLogin(signInWithApple, 'Apple', 'appleLoginSuccess', 'appleLoginError');

  // Microsoft login extracted but not used in UI? Keeping it available if needed or removing if unused in previous UI
  // The original UI used Google, Facebook, Apple. Microsoft was defined but not in the render.

  const handleGoToRegister = () => {
    if (navigation) {
      navigation.navigate('Register');
    } else {
      Alert.alert(getString('register'), getString('registrationDevelopment'));
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
            <View style={styles.topDecoration}>
              <LinearGradient
                colors={[hexToRgba(COLORS.primary[500], 0.27), 'transparent']}
                style={styles.topOrb}
              />
            </View>

            <LoginSettings
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              languageMenuVisible={languageMenuVisible}
              setLanguageMenuVisible={setLanguageMenuVisible}
              currentLanguage={currentLanguage}
              languages={languages}
              changeLanguage={(lang) => changeLanguage(lang as any)}
            />

            <LoginHeader
              isDarkMode={isDarkMode}
              welcomeMessage={getString('welcome')}
            />

            <View style={styles.content}>
              <ModernCard style={[styles.loginCard, getAuthCardColors(isDarkMode)]}>

                <LoginForm
                  email={email}
                  setEmail={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  password={password}
                  setPassword={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  errors={errors}
                  loading={loading}
                  onLogin={handleLogin}
                  onForgotPassword={handleForgotPassword}
                  getString={getString}
                  theme={theme}
                />

                <SocialLogin
                  isDarkMode={isDarkMode}
                  onGoogleLogin={handleGoogleLogin}
                  onFacebookLogin={handleFacebookLogin}
                  onAppleLogin={handleAppleLogin}
                  getString={getString}
                />

                <View style={styles.registerRow}>
                  <Text style={[styles.registerText, { color: isDarkMode ? COLORS.gray[200] : COLORS.gray[800], fontWeight: FONT_WEIGHT.medium }]}>
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

        {enhancedError && (
          <View style={styles.errorContainer}>
            <EnhancedErrorMessage
              errorCode={enhancedError.errorCode}
              customMessage={enhancedError.customMessage || undefined}
              customTitle={enhancedError.customTitle || undefined}
              onAction={(action) => handleErrorAction(action, navigation, setEmail, setPassword, handleGoogleLogin)}
              onDismiss={clearEnhancedError}
              compact={false}
            />
          </View>
        )}

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
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, paddingBottom: 0 },
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  loginCard: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1.5,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  registerText: {
    fontSize: FONT_SIZE.sm,
  },
  registerLink: {
    padding: 4,
  },
  registerLinkText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold as any,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.semibold as any,
  },
  snackbar: {
    borderRadius: BORDER_RADIUS.md,
  },
  errorContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  snackbarSuccess: {
    backgroundColor: COLORS.success[500],
  },
  snackbarError: {
    backgroundColor: COLORS.error[500],
  },
  snackbarText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
  },
});