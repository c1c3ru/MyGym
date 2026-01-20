import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  Alert
} from 'react-native';
import {
  Text,
  Button,
  TextInput,
  HelperText,
  Chip,
  RadioButton,
  Snackbar,
  ActivityIndicator,
  Banner,
  Divider,
  IconButton
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import { refreshManager } from '@utils/refreshManager';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import { useFormValidation } from '@hooks/useFormValidation';
import { useStudentCreationRateLimit } from '@hooks/useRateLimit';
import { useUserActionTracking } from '@hooks/useAnalytics';
import cacheService, { CACHE_KEYS } from '@infrastructure/services/cacheService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useTheme } from "@contexts/ThemeContext";
import { hexToRgba } from '@shared/utils/colorUtils';

interface AddStudentFormProps {
  onClose: () => void;
  onSuccess: (studentId?: string) => void;
}

const AddStudentForm = ({ onClose, onSuccess }: AddStudentFormProps) => {
  const { getString, theme } = useTheme();
  const colors = theme?.colors || theme || COLORS;

  const { user, userProfile, academia } = useAuthFacade();
  const [loading, setLoading] = useState(false);

  // Animações
  const slideAnim = useMemo(() => new Animated.Value(50), []);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  const textColor = theme?.colors?.text || COLORS.text.primary;
  const styles = useMemo(() => createStyles(colors, textColor), [colors, textColor]);

  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();
  const { executeWithLimit: executeStudentCreation } = useStudentCreationRateLimit();

  // Feedback states
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });
  const [showValidationBanner, setShowValidationBanner] = useState(false);

  // Classes and Plans data
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Form Validation
  const studentValidationSchema = {
    name: ['required', { rule: 'minLength', params: [2] }],
    email: ['required', 'email'],
    phone: ['required', { rule: 'minLength', params: [10] }],
    birthDate: ['required'],
    emergencyContact: ['required', { rule: 'minLength', params: [2] }],
    emergencyPhone: ['required', { rule: 'minLength', params: [10] }],
    sexo: ['required']
  };

  const {
    formData,
    errors,
    touched,
    validateField,
    validateForm,
    setFieldValue,
    setFieldTouched,
    resetForm,
    getFieldProps,
    hasErrors
  } = useFormValidation(
    {
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      medicalConditions: '',
      goals: '',
      status: 'active',
      sexo: ''
    },
    studentValidationSchema,
    { validateOnChange: true, validateOnBlur: true }
  ) as any;

  useEffect(() => {
    // Start animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true })
    ]).start();

    loadAvailableClasses();
    loadAvailablePlans();
  }, [userProfile?.academiaId]);

  const loadAvailableClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);
      if (!userProfile?.academiaId) return;

      const cacheKey = CACHE_KEYS.CLASSES(userProfile.academiaId);
      const classes = await cacheService.get(cacheKey) ||
        await academyFirestoreService.getAll('classes', userProfile.academiaId);

      setAvailableClasses(classes);
    } catch (error) {
      console.error('❌ Erro ao carregar turmas:', error);
      showSnackbar('Erro ao carregar turmas disponíveis', 'error');
    } finally {
      setLoadingClasses(false);
    }
  }, [userProfile?.academiaId]);

  const loadAvailablePlans = useCallback(async () => {
    try {
      setLoadingPlans(true);
      if (!userProfile?.academiaId) return;

      const plans = await academyFirestoreService.getAll('plans', userProfile.academiaId);
      setAvailablePlans(plans);
    } catch (error) {
      console.error('❌ Erro ao carregar planos:', error);
      // Não bloqueia o fluxo se falhar planos
    } finally {
      setLoadingPlans(false);
    }
  }, [userProfile?.academiaId]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate || birthDate.length !== 10) return 0;
    const parts = birthDate.split('/');
    if (parts.length !== 3) return 0;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return 0;

    const today = new Date();
    let age = today.getFullYear() - year;
    const m = today.getMonth() + 1 - month;
    if (m < 0 || (m === 0 && today.getDate() < day)) {
      age--;
    }
    return age;
  };

  const toggleClassSelection = useCallback((classId: string) => {
    // Se estiver desmarcando, permite sempre
    if (selectedClasses.includes(classId)) {
      setSelectedClasses(prev => prev.filter(id => id !== classId));
      return;
    }

    // Se estiver marcando, valida idade
    const targetClass = availableClasses.find(c => c.id === classId);
    if (!targetClass) return;

    if (formData.birthDate && formData.birthDate.length === 10) {
      const age = calculateAge(formData.birthDate);
      const restrictedCategories = ['kids1', 'kids2', 'kids3', 'juvenil'];

      if (age >= 18 && restrictedCategories.includes(targetClass.ageCategory)) {
        Alert.alert(
          'Restrição de Idade',
          `O aluno tem ${age} anos (Maior de 18). Não é permitido matriculá-lo em turmas Infantis ou Juvenis.\n\nTurma: ${targetClass.name} (${targetClass.ageCategory})`
        );
        return;
      }
    }

    setSelectedClasses(prev => [...prev, classId]);
  }, [selectedClasses, availableClasses, formData.birthDate]);

  const showSnackbar = (message: string, type: string = 'info') => setSnackbar({ visible: true, message, type });

  const handleSubmit = useCallback(async () => {
    const isValid = await validateForm();
    if (!isValid) {
      setShowValidationBanner(true);
      showSnackbar('Por favor, preencha todos os campos obrigatórios', 'error');
      return;
    }

    // Validação de Idade vs Turmas (Segurança adicional)
    if (formData.birthDate && formData.birthDate.length === 10) {
      const age = calculateAge(formData.birthDate);
      if (age >= 18) {
        const restrictedCategories = ['kids1', 'kids2', 'kids3', 'juvenil'];
        const invalidClasses = selectedClasses
          .map(id => availableClasses.find(c => c.id === id))
          .filter(c => c && restrictedCategories.includes(c.ageCategory));

        if (invalidClasses.length > 0) {
          Alert.alert(
            'Conflito de Idade',
            `Aluno com ${age} anos não pode ser matriculado nas seguintes turmas infantis/juvenis:\n\n${invalidClasses.map(c => c?.name).join('\n')}\n\nRemova essas turmas ou corrija a data de nascimento.`
          );
          return;
        }
      }
    }

    const result = await executeStudentCreation(async () => {
      try {
        setLoading(true);
        if (!user?.id) throw new Error('Usuário não autenticado');

        const selectedPlanObj = availablePlans.find(p => p.id === selectedPlanId);

        const studentData: any = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          birthDate: formData.birthDate.trim(),
          address: formData.address.trim(),
          emergencyContact: formData.emergencyContact.trim(),
          emergencyPhone: formData.emergencyPhone.trim(),
          medicalConditions: formData.medicalConditions.trim(),
          goals: formData.goals.trim(),
          status: formData.status,
          sexo: formData.sexo,
          isActive: true, // Legacy
          createdBy: user!.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          graduations: [],
          currentGraduation: null,
          classIds: selectedClasses,
          planId: selectedPlanId || null,
          currentPlan: selectedPlanObj ? selectedPlanObj.name : null,
          academiaId: userProfile?.academiaId
        };

        const newStudentId = await academyFirestoreService.create('students', studentData, userProfile!.academiaId);

        // Cache Invalidation
        await cacheService.invalidatePattern(`students:${userProfile!.academiaId}`);

        refreshManager.refreshStudents({ id: newStudentId, ...studentData });
        showSnackbar(`Aluno "${formData.name.trim()}" cadastrado com sucesso!`, 'success');

        trackFeatureUsage('student_creation_submit', { success: true });

        setTimeout(() => {
          onSuccess(newStudentId);
        }, 1500);

      } catch (error: any) {
        console.error('❌ Erro:', error);
        showSnackbar(error.message || 'Erro ao cadastrar', 'error');
      } finally {
        setLoading(false);
      }
    });

    if (result.blocked) Alert.alert('Ação Bloqueada', 'Muitas criações de aluno. Aguarde.');
  }, [validateForm, executeStudentCreation, formData, selectedClasses, selectedPlanId, availablePlans, user, userProfile]);

  const handleFieldChange = (field: string, value: string) => {
    setFieldValue(field, value);
    if (!hasErrors()) setShowValidationBanner(false);
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
    <EnhancedErrorBoundary errorContext={{ screen: 'AddStudentForm', academiaId: userProfile?.academiaId }}>
      <Animated.View style={{ flex: 1, backgroundColor: colors.background, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getString('newStudent')}</Text>
          <IconButton icon="close" onPress={onClose} iconColor={textColor} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={true}>

          {showValidationBanner && (
            <Banner
              visible={showValidationBanner}
              actions={[{ label: 'Fechar', onPress: () => setShowValidationBanner(false) }]}
              icon={({ size }) => <MaterialCommunityIcons name="alert-circle" size={size} color={COLORS.error[500]} />}
              style={styles.banner}
            >
              Corrija os erros destacados.
            </Banner>
          )}

          <Text style={styles.sectionTitle}>👤 Dados Pessoais</Text>

          <TextInput
            label="Nome Completo *"
            {...getFieldProps('name')}
            onChangeText={(v) => handleFieldChange('name', v)}
            onBlur={() => setFieldTouched('name', true)}
            mode="outlined"
            style={styles.input}
            error={!!(touched.name && errors.name)}
            theme={inputTheme}
            textColor={textColor}
          />
          {touched.name && errors.name && <HelperText type="error">{errors.name}</HelperText>}

          <TextInput
            label="Email *"
            {...getFieldProps('email')}
            onChangeText={(v) => handleFieldChange('email', v)}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            error={!!(touched.email && errors.email)}
            theme={inputTheme}
            textColor={textColor}
          />
          {touched.email && errors.email && <HelperText type="error">{errors.email}</HelperText>}

          <TextInput
            label="Telefone *"
            value={formData.phone}
            onChangeText={(v) => handleFieldChange('phone', v)}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            error={!!(touched.phone && errors.phone)}
            theme={inputTheme}
            textColor={textColor}
          />
          {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}

          <TextInput
            label="Data de Nascimento *"
            value={formData.birthDate}
            onChangeText={(v) => handleFieldChange('birthDate', v)}
            mode="outlined"
            placeholder="DD/MM/AAAA"
            style={styles.input}
            error={!!errors.birthDate}
            theme={inputTheme}
            textColor={textColor}
          />
          {errors.birthDate && <HelperText type="error">{errors.birthDate}</HelperText>}

          <Text style={styles.fieldLabel}>Sexo *</Text>
          <RadioButton.Group onValueChange={(v) => handleFieldChange('sexo', v)} value={formData.sexo}>
            <View style={styles.radioContainer}>
              {['masculino', 'feminino', 'outro'].map(opt => (
                <View key={opt} style={styles.radioItem}>
                  <RadioButton value={opt} color={colors?.primary} />
                  <Text style={{ color: textColor, textTransform: 'capitalize' }}>{opt}</Text>
                </View>
              ))}
            </View>
          </RadioButton.Group>
          {touched.sexo && errors.sexo && <HelperText type="error">{errors.sexo}</HelperText>}

          <Divider style={{ marginVertical: SPACING.lg }} />

          <Text style={styles.sectionTitle}>🚑 Emergência</Text>
          <TextInput
            label="Nome Contato *"
            value={formData.emergencyContact}
            onChangeText={(v) => handleFieldChange('emergencyContact', v)}
            mode="outlined"
            style={styles.input}
            error={!!errors.emergencyContact}
            theme={inputTheme}
            textColor={textColor}
          />
          {errors.emergencyContact && <HelperText type="error">{errors.emergencyContact}</HelperText>}

          <TextInput
            label="Telefone Emergência *"
            value={formData.emergencyPhone}
            onChangeText={(v) => handleFieldChange('emergencyPhone', v)}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            error={!!errors.emergencyPhone}
            theme={inputTheme}
            textColor={textColor}
          />
          {errors.emergencyPhone && <HelperText type="error">{errors.emergencyPhone}</HelperText>}

          <Divider style={{ marginVertical: SPACING.lg }} />

          <Text style={styles.sectionTitle}>💳 Plano</Text>
          {loadingPlans ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : availablePlans.length === 0 ? (
            <Text style={{ color: textColor }}>Nenhum plano disponível.</Text>
          ) : (
            <RadioButton.Group onValueChange={v => setSelectedPlanId(v)} value={selectedPlanId}>
              <View style={{ gap: 8 }}>
                {availablePlans.map(plan => (
                  <View key={plan.id} style={[styles.radioItem, { marginBottom: 4 }]}>
                    <RadioButton value={plan.id} color={colors.primary} />
                    <View>
                      <Text style={{ color: textColor, fontWeight: 'bold' }}>{plan.name}</Text>
                      <Text style={{ color: textColor, fontSize: FONT_SIZE.sm }}>
                        {plan.price ? `R$ ${plan.price}` : ''} {plan.billingCycle ? `(${plan.billingCycle})` : ''}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </RadioButton.Group>
          )}

          <Divider style={{ marginVertical: SPACING.lg }} />

          <Text style={styles.sectionTitle}>🎯 Turmas</Text>
          {loadingClasses ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : availableClasses.length === 0 ? (
            <Text style={{ color: textColor }}>Nenhuma turma disponível.</Text>
          ) : (
            <View style={styles.chipContainer}>
              {availableClasses.map(c => (
                <Chip
                  key={c.id}
                  selected={selectedClasses.includes(c.id)}
                  onPress={() => toggleClassSelection(c.id)}
                  style={[styles.chip, selectedClasses.includes(c.id) && styles.chipSelected]}
                  mode="outlined"
                  showSelectedOverlay
                >
                  {c.name}
                </Chip>
              ))}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={onClose} style={styles.button} textColor={textColor}>Cancelar</Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={loading}
              disabled={loading}
              buttonColor={COLORS.primary[500]}
              icon={loading ? undefined : "account-check"}
            >
              {loading ? 'Salvando...' : 'Cadastrar'}
            </Button>
          </View>
          <View style={{ height: 60 }} />
        </ScrollView>


        {loading && (
          <View style={styles.globalLoadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary[500]} />
            <Text style={styles.loadingOverlayText}>Salvando...</Text>
          </View>
        )}

        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar(s => ({ ...s, visible: false }))}
          style={{ backgroundColor: snackbar.type === 'error' ? COLORS.error[600] : COLORS.success[600] }}
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
  scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    color: textColor,
  },
  input: { marginBottom: SPACING.md, backgroundColor: 'transparent' },
  fieldLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: SPACING.sm,
    color: textColor,
    marginTop: SPACING.sm
  },
  radioContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  radioItem: { flexDirection: 'row', alignItems: 'center' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { marginBottom: 4, borderRadius: BORDER_RADIUS.md },
  chipSelected: {
    backgroundColor: hexToRgba(COLORS.primary[500], 0.15),
    borderColor: COLORS.primary[500],
    borderWidth: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  button: { flex: 1, borderRadius: BORDER_RADIUS.lg },
  banner: { marginBottom: SPACING.md, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.error[100] },
  globalLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingOverlayText: { marginTop: SPACING.md, color: COLORS.white, fontWeight: 'bold' }
});

export default AddStudentForm;
