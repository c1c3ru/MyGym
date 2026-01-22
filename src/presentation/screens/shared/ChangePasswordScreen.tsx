import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated
} from 'react-native';
import {
  Text,
  Button,
  TextInput,
  HelperText,
  Snackbar,
  ActivityIndicator,
  IconButton,
  Divider,
  Card
} from 'react-native-paper';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { firebaseAuth } from '@infrastructure/firebase';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '@presentation/theme/designTokens';
import { useTheme } from "@contexts/ThemeContext";
import { hexToRgba } from '@shared/utils/colorUtils';

interface ChangePasswordFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ChangePasswordForm = ({ onClose, onSuccess }: ChangePasswordFormProps) => {
  const { getString, theme } = useTheme();
  const colors = theme?.colors || theme || COLORS;

  const { user } = useAuthFacade();
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });

  // Animations
  const slideAnim = useMemo(() => new Animated.Value(50), []);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  const textColor = theme?.colors?.text || COLORS.text.primary;
  const styles = useMemo(() => createStyles(colors, textColor), [colors, textColor]);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState<any>({});

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true })
    ]).start();
  }, []);

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Senha atual obrigatória';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Nova senha obrigatória';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mínimo 6 caracteres';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'Nova senha deve ser diferente';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação obrigatória';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    try {
      if (!user?.email) {
        setSnackbar({ visible: true, message: 'Usuário não autenticado', type: 'error' });
        return;
      }

      setLoading(true);

      // Reautenticar
      const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
      const firebaseUser = firebaseAuth.getCurrentUser();

      if (!firebaseUser) {
        setSnackbar({ visible: true, message: 'Sessão inválida', type: 'error' });
        return;
      }

      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, formData.newPassword);

      setSnackbar({ visible: true, message: 'Senha alterada com sucesso! 🎉', type: 'success' });

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Erro ao alterar senha:', error);

      let errorMessage = 'Erro ao alterar senha';
      const errorCode = (error as any).code;

      if (errorCode === 'auth/wrong-password') {
        errorMessage = 'Senha atual incorreta';
        setErrors({ currentPassword: errorMessage });
      } else if (errorCode === 'auth/weak-password') {
        errorMessage = 'Nova senha muito fraca';
        setErrors({ newPassword: errorMessage });
      } else if (errorCode === 'auth/requires-recent-login') {
        errorMessage = 'Faça login novamente e tente alterar a senha';
      }

      setSnackbar({ visible: true, message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: null }));
  };

  const toggleShowPassword = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };

  const inputTheme = {
    colors: {
      primary: colors?.primary || COLORS.primary[500],
      text: textColor,
      placeholder: hexToRgba(textColor, 0.6),
      background: 'transparent',
      outline: colors?.text?.disabled || COLORS.gray[500],
      onSurface: textColor
    }
  };

  return (
    <EnhancedErrorBoundary errorContext={{ screen: 'ChangePasswordForm' }}>
      <Animated.View style={{ flex: 1, backgroundColor: colors.background, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Alterar Senha</Text>
          <IconButton icon="close" onPress={onClose} iconColor={textColor} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.subtitle}>
            Para sua segurança, informe sua senha atual e defina uma nova senha
          </Text>

          <Divider style={{ marginVertical: SPACING.lg }} />

          <Text style={styles.sectionTitle}>🔐 Autenticação</Text>

          <TextInput
            label="Senha Atual"
            value={formData.currentPassword}
            onChangeText={(v) => updateFormData('currentPassword', v)}
            mode="outlined"
            secureTextEntry={!showPasswords.current}
            style={styles.input}
            error={!!errors.currentPassword}
            theme={inputTheme}
            textColor={textColor}
            right={
              <TextInput.Icon
                icon={showPasswords.current ? 'eye-off' : 'eye'}
                onPress={() => toggleShowPassword('current')}
              />
            }
          />
          {errors.currentPassword && <HelperText type="error">{errors.currentPassword}</HelperText>}

          <Divider style={{ marginVertical: SPACING.lg }} />

          <Text style={styles.sectionTitle}>🔑 Nova Senha</Text>

          <TextInput
            label="Nova Senha"
            value={formData.newPassword}
            onChangeText={(v) => updateFormData('newPassword', v)}
            mode="outlined"
            secureTextEntry={!showPasswords.new}
            style={styles.input}
            error={!!errors.newPassword}
            theme={inputTheme}
            textColor={textColor}
            right={
              <TextInput.Icon
                icon={showPasswords.new ? 'eye-off' : 'eye'}
                onPress={() => toggleShowPassword('new')}
              />
            }
          />
          {errors.newPassword && <HelperText type="error">{errors.newPassword}</HelperText>}
          {!errors.newPassword && formData.newPassword && (
            <HelperText type="info">Mínimo 6 caracteres</HelperText>
          )}

          <TextInput
            label="Confirmar Nova Senha"
            value={formData.confirmPassword}
            onChangeText={(v) => updateFormData('confirmPassword', v)}
            mode="outlined"
            secureTextEntry={!showPasswords.confirm}
            style={styles.input}
            error={!!errors.confirmPassword}
            theme={inputTheme}
            textColor={textColor}
            right={
              <TextInput.Icon
                icon={showPasswords.confirm ? 'eye-off' : 'eye'}
                onPress={() => toggleShowPassword('confirm')}
              />
            }
          />
          {errors.confirmPassword && <HelperText type="error">{errors.confirmPassword}</HelperText>}

          {/* Dicas de Segurança */}
          <Card style={styles.tipsCard}>
            <Card.Content>
              <Text style={styles.tipsTitle}>💡 Dicas de Segurança</Text>
              <Text style={styles.tipsText}>
                • Use pelo menos 8 caracteres{'\n'}
                • Combine letras maiúsculas, minúsculas e números{'\n'}
                • Evite informações pessoais óbvias{'\n'}
                • Não reutilize senhas de outras contas{'\n'}
                • Considere usar um gerenciador de senhas
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={onClose} style={styles.button} textColor={textColor}>
              {getString('cancel')}
            </Button>
            <Button
              mode="contained"
              onPress={handleChangePassword}
              style={styles.button}
              loading={loading}
              disabled={loading}
              buttonColor={COLORS.primary[500]}
            >
              Alterar Senha
            </Button>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.globalLoadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary[500]} />
          </View>
        )}

        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar(s => ({ ...s, visible: false }))}
          style={{ backgroundColor: snackbar.type === 'error' ? COLORS.error[600] : COLORS.success[600] }}
          duration={snackbar.type === 'success' ? 3000 : 5000}
        >
          {snackbar.message}
        </Snackbar>
      </Animated.View>
    </EnhancedErrorBoundary>
  );
};

const createStyles = (colors: any, textColor: string) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors?.divider || COLORS.gray[200],
    backgroundColor: colors?.surface || COLORS.white,
    elevation: 2,
    zIndex: 10
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: textColor,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl * 3 },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: textColor,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.7
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    color: textColor,
  },
  input: { marginBottom: SPACING.md, backgroundColor: 'transparent' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  button: { flex: 1, borderRadius: BORDER_RADIUS.lg },
  tipsCard: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: hexToRgba(COLORS.primary[100], 0.3),
    borderRadius: BORDER_RADIUS.md,
  },
  tipsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
    color: COLORS.primary[800],
  },
  tipsText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary[900],
    lineHeight: 20,
  },
  globalLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay.medium,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  }
});

export default ChangePasswordForm;