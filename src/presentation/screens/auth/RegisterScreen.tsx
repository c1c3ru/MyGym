import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, Alert, KeyboardAvoidingView, Platform, Dimensions, TouchableOpacity } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Divider,
  ActivityIndicator,
  RadioButton,
  Chip,
  Snackbar,
  HelperText,
  Checkbox,
  Card
} from 'react-native-paper';
import ModernCard from '@components/modern/ModernCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import type { AuthScreenProps, RegisterFormData, RegisterFormErrors, SnackbarState } from './types';
import { getString } from "@utils/theme";

const { width } = Dimensions.get('window');

/**
 * Tela de cadastro
 * Permite que o usuário crie uma nova conta
 */
const RegisterScreen = ({ navigation }: AuthScreenProps) => {
  const { isDarkMode, getString } = useTheme();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: 'student',
    acceptTerms: false,
    acceptPrivacyPolicy: false
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [snackbar, setSnackbar] = useState<SnackbarState>({ visible: false, message: '', type: 'error' });

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const { signUp } = useAuthFacade();

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = getString('nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = getString('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = getString('invalidEmail');
    }

    if (formData.password.length < 6) {
      newErrors.password = getString('passwordMinLength');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = getString('passwordsMismatch');
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Você deve aceitar os termos de uso';
    }

    if (!formData.acceptPrivacyPolicy) {
      newErrors.acceptPrivacyPolicy = 'Você deve aceitar a política de privacidade';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showSnackbar = (message: string, type: SnackbarState['type'] = 'error'): void => {
    setSnackbar({ visible: true, message, type });
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        userType: formData.userType,
        acceptTerms: formData.acceptTerms,
        acceptPrivacyPolicy: formData.acceptPrivacyPolicy
      };

      await signUp(formData.email, formData.password, userData);
      showSnackbar(getString('accountCreatedSuccess'), 'success');

      // Animação de sucesso
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      let errorMessage = getString('registrationError');

      // Mapear erros específicos do Firebase
      if (error.code === 'auth/email-already-in-use' || error.message?.includes('email-already-in-use')) {
        errorMessage = 'Este email já está cadastrado. Faça login ou use outro email.';
        setErrors({ email: errorMessage });
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
        setErrors({ password: errorMessage });
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido. Verifique o formato.';
        setErrors({ email: errorMessage });
      } else if (error.message?.includes('EmailAlreadyInUse')) {
        errorMessage = 'Este email já está cadastrado. Faça login ou use outro email.';
        setErrors({ email: errorMessage });
      }

      showSnackbar(errorMessage, 'error');

      // Animação de erro (shake)
      Animated.sequence([
        Animated.timing(slideAnim, { toValue: -10, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(slideAnim, { toValue: 10, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(slideAnim, { toValue: -5, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(slideAnim, { toValue: 0, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof RegisterFormData, value: any): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field as keyof RegisterFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getUserTypeIcon = (type: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    switch (type) {
      case 'student': return 'school';
      case 'instructor': return 'account-tie';
      case 'admin': return 'shield-account';
      default: return 'account';
    }
  };

  const getUserTypeColor = (type: string): string => {
    switch (type) {
      case 'student': return COLORS.primary[500];
      case 'instructor': return COLORS.warning[500];
      case 'admin': return COLORS.error[500];
      default: return COLORS.info[500];
    }
  };

  return (
    <LinearGradient
      colors={getAuthGradient(isDarkMode) as any}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          horizontal={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <MaterialCommunityIcons
              name="account-plus"
              size={60}
              color={COLORS.white}
              style={styles.headerIcon}
            />
            <Text style={[styles.title, { color: isDarkMode ? COLORS.white : COLORS.black }]}>{getString('createAccount')}</Text>
            <Text style={[styles.subtitle, { color: isDarkMode ? COLORS.gray[300] : COLORS.gray[600] }]}>
              {getString('fillDataToRegister')}
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              { transform: [{ scale: scaleAnim }, { translateX: slideAnim }] }
            ]}
          >
            <ModernCard variant="card" style={styles.card}>
              <View style={{ padding: SPACING.md }}>
                <Text style={[styles.cardTitle, { color: isDarkMode ? COLORS.white : COLORS.black }]}>{getString('personalData')}</Text>

                <TextInput
                  label={getString('fullName')}
                  value={formData.name}
                  onChangeText={(text) => updateFormData('name', text)}
                  mode="outlined"
                  style={[styles.input, { backgroundColor: 'transparent' }]}
                  textColor={isDarkMode ? COLORS.white : COLORS.black}
                  disabled={loading}
                  error={!!errors.name}
                  left={<TextInput.Icon icon="account" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                />
                {errors.name && (
                  <HelperText type="error" visible={!!errors.name}>
                    {errors.name}
                  </HelperText>
                )}

                <TextInput
                  label={getString('email') + ' *'}
                  value={formData.email}
                  onChangeText={(text) => updateFormData('email', text)}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, { backgroundColor: 'transparent' }]}
                  textColor={isDarkMode ? COLORS.white : COLORS.black}
                  disabled={loading}
                  error={!!errors.email}
                  left={<TextInput.Icon icon="email" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                />
                {errors.email && (
                  <HelperText type="error" visible={!!errors.email}>
                    {errors.email}
                  </HelperText>
                )}

                <TextInput
                  label={getString('phoneWhatsApp')}
                  value={formData.phone}
                  onChangeText={(text) => updateFormData('phone', text)}
                  mode="outlined"
                  keyboardType="phone-pad"
                  style={[styles.input, { backgroundColor: 'transparent' }]}
                  textColor={isDarkMode ? COLORS.white : COLORS.black}
                  disabled={loading}
                  left={<TextInput.Icon icon="phone" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                />

                <Divider style={styles.divider} />

                <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.white : COLORS.black }]}>{getString('userType')}</Text>
                <View style={styles.userTypeContainer}>
                  {[
                    { value: 'student', label: getString('student'), description: getString('studentDescription') },
                    { value: 'instructor', label: getString('instructor'), description: getString('instructorDescription') },
                    { value: 'admin', label: getString('administrator'), description: getString('adminDescription') }
                  ].map((type) => (
                    <Card
                      key={type.value}
                      style={[
                        styles.userTypeCard,
                        formData.userType === type.value && {
                          borderColor: getUserTypeColor(type.value),
                          borderWidth: 2,
                          backgroundColor: getUserTypeColor(type.value) + '10'
                        }
                      ]}
                      onPress={() => updateFormData('userType', type.value)}
                    >
                      <Card.Content style={styles.userTypeCardContent}>
                        <View style={styles.userTypeInfo}>
                          <MaterialCommunityIcons
                            name={getUserTypeIcon(type.value)}
                            size={24}
                            color={getUserTypeColor(type.value)}
                          />
                          <View style={styles.userTypeText}>
                            <Text style={[styles.userTypeLabel, { color: isDarkMode ? COLORS.white : COLORS.black }]}>{type.label}</Text>
                            <Text style={[styles.userTypeDescription, { color: isDarkMode ? COLORS.gray[300] : COLORS.gray[600] }]}>{type.description}</Text>
                          </View>
                        </View>
                        <RadioButton
                          value={type.value}
                          status={formData.userType === type.value ? 'checked' : 'unchecked'}
                          onPress={() => updateFormData('userType', type.value)}
                          disabled={loading}
                        />
                      </Card.Content>
                    </Card>
                  ))}
                </View>

                <Divider style={styles.divider} />

                <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.white : COLORS.black }]}>{getString('passwordSection')}</Text>

                <TextInput
                  label={getString('password') + ' *'}
                  value={formData.password}
                  onChangeText={(text) => updateFormData('password', text)}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  left={<TextInput.Icon icon="lock" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                      color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]}
                    />
                  }
                  style={[styles.input, { backgroundColor: 'transparent' }]}
                  textColor={isDarkMode ? COLORS.white : COLORS.black}
                  disabled={loading}
                  error={!!errors.password}
                />
                {errors.password && (
                  <HelperText type="error" visible={!!errors.password}>
                    {errors.password}
                  </HelperText>
                )}

                <TextInput
                  label={getString('confirmPassword')}
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateFormData('confirmPassword', text)}
                  mode="outlined"
                  secureTextEntry={!showConfirmPassword}
                  left={<TextInput.Icon icon="lock-check" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? "eye-off" : "eye"}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]}
                    />
                  }
                  style={[styles.input, { backgroundColor: 'transparent' }]}
                  textColor={isDarkMode ? COLORS.white : COLORS.black}
                  disabled={loading}
                  error={!!errors.confirmPassword}
                />
                {errors.confirmPassword && (
                  <HelperText type="error" visible={!!errors.confirmPassword}>
                    {errors.confirmPassword}
                  </HelperText>
                )}

                <Text style={styles.passwordHint}>
                  * {getString('passwordMinLength')}
                </Text>

                <Divider style={styles.divider} />

                <View style={styles.checkboxContainer}>
                  <View style={styles.checkboxRow}>
                    <Checkbox
                      status={formData.acceptTerms ? 'checked' : 'unchecked'}
                      onPress={() => updateFormData('acceptTerms', !formData.acceptTerms)}
                      disabled={loading}
                      color={COLORS.primary[500]}
                    />
                    <View style={styles.checkboxTextContainer}>
                      <Text style={[styles.checkboxText, { color: isDarkMode ? COLORS.gray[200] : COLORS.gray[800] }]}>
                        Aceito os{' '}
                        <Text
                          style={styles.link}
                          onPress={() => navigation.navigate('TermsOfService')}
                        >
                          Termos de Uso
                        </Text>
                      </Text>
                    </View>
                  </View>
                  {errors.acceptTerms && (
                    <HelperText type="error" visible={!!errors.acceptTerms} style={styles.checkboxError}>
                      {errors.acceptTerms}
                    </HelperText>
                  )}
                </View>

                <View style={styles.checkboxContainer}>
                  <View style={styles.checkboxRow}>
                    <Checkbox
                      status={formData.acceptPrivacyPolicy ? 'checked' : 'unchecked'}
                      onPress={() => updateFormData('acceptPrivacyPolicy', !formData.acceptPrivacyPolicy)}
                      disabled={loading}
                      color={COLORS.primary[500]}
                    />
                    <View style={styles.checkboxTextContainer}>
                      <Text style={[styles.checkboxText, { color: isDarkMode ? COLORS.gray[200] : COLORS.gray[800] }]}>
                        Aceito a{' '}
                        <Text
                          style={styles.link}
                          onPress={() => navigation.navigate('PrivacyPolicy')}
                        >
                          Política de Privacidade
                        </Text>
                      </Text>
                    </View>
                  </View>
                  {errors.acceptPrivacyPolicy && (
                    <HelperText type="error" visible={!!errors.acceptPrivacyPolicy} style={styles.checkboxError}>
                      {errors.acceptPrivacyPolicy}
                    </HelperText>
                  )}
                </View>

                <Button
                  mode="contained"
                  onPress={handleRegister}
                  style={styles.button}
                  disabled={loading}
                  icon={loading ? undefined : "account-plus"}
                  contentStyle={styles.buttonContent}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color={COLORS.white} size="small" />
                      <Text style={styles.loadingText}>{getString('creatingAccount')}</Text>
                    </View>
                  ) : (
                    getString('createAccount')
                  )}
                </Button>

                <View style={styles.loginContainer}>
                  <Text style={{ color: isDarkMode ? COLORS.gray[200] : COLORS.gray[800] }}>
                    {getString('alreadyHaveAccount')}{' '}
                  </Text>
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('Login')}
                    disabled={loading}
                    labelStyle={{ fontWeight: 'bold', color: COLORS.primary[500] }}
                  >
                    {getString('signIn')}
                  </Button>
                </View>
              </View>
            </ModernCard>
          </Animated.View>
        </ScrollView>

        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          duration={4000}
          style={[
            styles.snackbar,
            snackbar.type === 'success' ? styles.successSnackbar : styles.errorSnackbar
          ]}
          action={{
            label: getString('ok'),
            onPress: () => setSnackbar({ ...snackbar, visible: false }),
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
    ...(Platform.OS === 'web' ? { minHeight: '100vh' } as any : {}),
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? { minHeight: '100vh' } as any : {}),
  },
  scroll: {
    flex: 1,
    ...(Platform.OS === 'web' ? { maxHeight: '100vh', overflowY: 'auto' } as any : {}),
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIcon: {
    marginBottom: SPACING.md,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 3.84px currentTheme.black + "40"'
      },
      default: {
        shadowColor: COLORS.black,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }
    }),
  },
  title: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold as any,
    color: COLORS.white,
    marginBottom: SPACING.sm,
    ...Platform.select({
      web: {
        textShadow: '1px 1px 3px currentTheme.black + "4D"'
      },
      default: {
        textShadowColor: COLORS.black + "4D",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      }
    }),
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    opacity: 0.9,
    textAlign: 'center',
    ...Platform.select({
      web: {
        textShadow: '1px 1px 2px currentTheme.black + "4D"'
      },
      default: {
        textShadowColor: COLORS.black + "4D",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      }
    }),
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
        boxShadow: `0 8px 32px ${hexToRgba(COLORS.black, 0.2)}`,
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
  cardTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.black,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semibold,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    marginBottom: SPACING.md,
    color: COLORS.black,
    fontWeight: FONT_WEIGHT.semibold,
  },
  input: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  divider: {
    marginVertical: 24,
    backgroundColor: COLORS.gray[300],
  },
  userTypeContainer: {
    marginBottom: SPACING.md,
  },
  userTypeCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
  },
  userTypeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  userTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userTypeText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  userTypeLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.black,
  },
  userTypeDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    marginTop: 2,
  },
  passwordHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    marginBottom: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  checkboxContainer: {
    marginBottom: SPACING.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxTextContainer: {
    flex: 1,
    marginLeft: SPACING.xs,
  },
  checkboxText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.black,
    lineHeight: 20,
  },
  link: {
    color: COLORS.primary[500],
    fontWeight: FONT_WEIGHT.semibold,
    textDecorationLine: 'underline',
  },
  checkboxLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.black,
  },
  checkboxError: {
    marginTop: -SPACING.sm,
    marginLeft: SPACING.lg,
  },
  button: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    elevation: 3,
  },
  buttonContent: {
    paddingVertical: SPACING.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.white,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  snackbar: {
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 20,
  },
  successSnackbar: {
    backgroundColor: COLORS.primary[500],
  },
  errorSnackbar: {
    backgroundColor: COLORS.error[500],
  },
});

export default RegisterScreen;
