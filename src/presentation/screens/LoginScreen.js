import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { 
  TextInput, 
  Card, 
  Divider,
  ActivityIndicator,
  Button,
  Text,
  Switch,
  Menu,
  TouchableRipple,
  Snackbar,
  HelperText
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import AnimatedCard from '@components/AnimatedCard';
import AnimatedButton from '@components/AnimatedButton';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import EnhancedErrorMessage, { useEnhancedError } from '@components/EnhancedErrorMessage';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import { useFormValidation } from '@hooks/useFormValidation';
import { rateLimitService } from '@services/rateLimitService';
import LoginSkeleton from '@components/skeletons/LoginSkeleton';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

// Mapear erros de autenticação para códigos do EnhancedErrorMessage
const mapAuthErrorToCode = (error) => {
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
const handleErrorAction = (action, navigation, setEmail, setPassword) => {
  switch (action) {
    case 'focus-email':
      // Focar no campo de email (implementar ref se necessário)
      break;
    case 'focus-password':
      // Focar no campo de senha (implementar ref se necessário)
      break;
    case 'reset-password':
      if (navigation) {
        navigation.navigate(getString('forgotPassword'));
      }
      break;
    case 'register':
      if (navigation) {
        navigation.navigate(getString('register'));
      }
      break;
    case 'retry':
      // Limpar campos para nova tentativa
      break;
    default:
      console.log('Ação não mapeada:', action);
  }
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  
  // Feedback states
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'info' // 'success', 'error', 'info'
  });
  const [errors, setErrors] = useState({});
  
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
  const { isDarkMode, currentLanguage, languages, theme, toggleDarkMode, changeLanguage, getString } = useTheme();

  const showSnackbar = useCallback((message, type = 'info') => {
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
      
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Track failed login (without exposing email)
      const emailDomain = email.trim().split('@')[1] || 'unknown';
      trackFeatureUsage('login_failed', { 
        emailDomain, 
        errorCode: error.code || error.name,
        errorType: error.code?.split('/')[1] || error.name || 'unknown'
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
      navigation.navigate(getString('forgotPassword'));
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
      navigation.navigate(getString('register'));
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
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>{getString('loggingIn')}</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={COLORS.gradients.dark}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Settings Row */}
          <View style={styles.settingsRow}>
            {/* Language Selector */}
            <View style={styles.settingItem}>
              <Menu
                visible={languageMenuVisible}
                onDismiss={() => setLanguageMenuVisible(false)}
                anchor={
                  <TouchableRipple 
                    style={styles.languageButton}
                    onPress={() => setLanguageMenuVisible(true)}
                    rippleColor={currentTheme.white + "1A"}
                  >
                    <View style={styles.languageButtonContent}>
                      <Text style={styles.flagEmoji}>{languages[currentLanguage].flag}</Text>
                      <Text style={styles.languageButtonText}>{languages[currentLanguage].name}</Text>
                      <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.white} />
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
            
            {/* Dark Mode Toggle */}
            <View style={styles.settingItem}>
              <View style={styles.darkModeToggle}>
                <MaterialCommunityIcons 
                  name={isDarkMode ? "weather-night" : "weather-sunny"} 
                  size={20} 
                  color={COLORS.white} 
                  style={styles.darkModeIcon}
                />
                <Text style={styles.darkModeText}>{getString('darkMode')}</Text>
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleDarkMode}
                  thumbColor={isDarkMode ? theme.colors.primary : COLORS.gray[100]}
                  trackColor={{ false: COLORS.gray[500], true: theme.colors.primary }}
                />
              </View>
            </View>
          </View>

          <View style={styles.header}>
            <MaterialCommunityIcons 
              name="school" 
              size={60} 
              color={COLORS.white} 
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>{getString('appName')}</Text>
            <Text style={styles.headerSubtitle}>
              {getString('welcome')}
            </Text>
          </View>

          <View style={styles.content}>
            <AnimatedCard style={[styles.loginCard, { backgroundColor: theme.colors.surface }]} delay={200}>
              <Card.Content>
                <TextInput
                  label={getString('email')}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: null }));
                    }
                  }}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  left={<TextInput.Icon icon="email" />}
                  theme={theme}
                  error={!!errors.email}
                />
                {errors.email && <HelperText type="error" style={styles.errorText}>{errors.email}</HelperText>}

                <TextInput
                  label={getString('password')}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: null }));
                    }
                  }}
                  style={styles.input}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  textContentType="password"
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  theme={theme}
                  error={!!errors.password}
                />
                {errors.password && <HelperText type="error" style={styles.errorText}>{errors.password}</HelperText>}

                <AnimatedButton
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  loading={loading}
                  disabled={loading}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  buttonColor={theme.colors.primary}
                  delay={400}
                >
                  {getString('login')}
                </AnimatedButton>

                <Divider style={styles.divider} />

                {/* Social Login Buttons */}
                <View style={styles.socialLoginContainer}>
                  <Text style={[styles.socialLoginTitle, { color: theme.colors.onSurface }]}>{getString('orLoginWith')}</Text>
                  
                  <View style={styles.socialButtonsRow}>
                    <Button
                      mode="outlined"
                      onPress={handleGoogleLogin}
                      style={[styles.socialButton, { borderColor: theme.colors.outline }]}
                      icon="google"
                      contentStyle={styles.socialButtonContent}
                      loading={loading}
                      disabled={loading}
                    >
                      Google
                    </Button>
                    
                    <Button
                      mode="outlined"
                      onPress={handleFacebookLogin}
                      style={[styles.socialButton, { borderColor: theme.colors.outline }]}
                      icon="facebook"
                      contentStyle={styles.socialButtonContent}
                      loading={loading}
                      disabled={loading}
                    >
                      Facebook
                    </Button>
                  </View>
                  
                  <View style={styles.socialButtonsRow}>
                    <Button
                      mode="outlined"
                      onPress={handleMicrosoftLogin}
                      style={[styles.socialButton, { borderColor: theme.colors.outline }]}
                      icon="microsoft"
                      contentStyle={styles.socialButtonContent}
                      loading={loading}
                      disabled={loading}
                    >
                      Microsoft
                    </Button>
                    
                    <Button
                      mode="outlined"
                      onPress={handleAppleLogin}
                      style={[styles.socialButton, { borderColor: theme.colors.outline }]}
                      icon="apple"
                      contentStyle={styles.socialButtonContent}
                      loading={loading}
                      disabled={loading}
                    >
                      Apple
                    </Button>
                  </View>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.linkContainer}>
                  <Button
                    mode="text"
                    onPress={handleForgotPassword}
                    textColor={theme.colors.primary}
                    style={styles.linkButton}
                  >
                    {getString('forgotPassword')}
                  </Button>

                  <Button
                    mode="text"
                    onPress={handleGoToRegister}
                    textColor={theme.colors.primary}
                    style={styles.linkButton}
                  >
                    {getString('register')}
                  </Button>
                </View>
              </Card.Content>
            </AnimatedCard>
          </View>
          
        </ScrollView>
        
        {/* Sistema de feedback visual para erros */}
        {enhancedError && (
          <View style={styles.errorContainer}>
            <EnhancedErrorMessage
              errorCode={enhancedError.errorCode}
              customMessage={enhancedError.customMessage}
              customTitle={enhancedError.customTitle}
              onAction={(action) => handleErrorAction(action, navigation, setEmail, setPassword)}
              onDismiss={clearEnhancedError}
              compact={false}
            />
          </View>
        )}
        
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
  },
  scrollContainer: {
    flexGrow: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 10,
  },
  settingItem: {
    alignItems: 'center',
  },
  languageButton: {
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    backgroundColor: 'currentTheme.white + "1A"',
  },
  languageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: FONT_SIZE.md,
    marginRight: SPACING.xs,
  },
  languageButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.base,
    marginRight: SPACING.xs,
  },
  darkModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'currentTheme.white + "1A"',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  darkModeIcon: {
    marginRight: 6,
  },
  darkModeText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.base,
    marginRight: 8,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.xs0,
  },
  headerIcon: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  loginCard: {
    marginHorizontal: 20,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: SPACING.sm,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  divider: {
    marginVertical: 16,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkButton: {
    flex: 1,
  },
  socialLoginContainer: {
    marginVertical: 16,
  },
  socialLoginTitle: {
    fontSize: FONT_SIZE.base,
    textAlign: 'center',
    marginBottom: SPACING.md,
    opacity: 0.7,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  socialButton: {
    flex: 0.48,
    marginHorizontal: 2,
  },
  socialButtonContent: {
    paddingVertical: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: FONT_SIZE.md,
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
  snackbarText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
  },
  errorContainer: {
    position: 'absolute',
    top: 80,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 1000,
  },
});