import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Alert
} from 'react-native';
import {
  Text,
  Button,
  TextInput,
  HelperText,
  RadioButton,
  Snackbar,
  ActivityIndicator,
  IconButton,
  Divider
} from 'react-native-paper';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '@presentation/theme/designTokens';
import { useTheme } from "@contexts/ThemeContext";
import { hexToRgba } from '@shared/utils/colorUtils';

interface EditStudentFormProps {
  studentId: string;
  onClose: () => void;
  onSuccess: () => void;
  studentData?: any;
}

const EditStudentForm = ({ studentId, onClose, onSuccess, studentData: initialData }: EditStudentFormProps) => {
  const { getString, theme } = useTheme();
  const colors = theme?.colors || theme || COLORS;

  const { user, userProfile, academia } = useAuthFacade();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!initialData);

  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [loadingPlans, setLoadingPlans] = useState(true);

  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });

  // Animations
  const slideAnim = useMemo(() => new Animated.Value(50), []);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  const textColor = theme?.colors?.text || COLORS.text.primary;
  const styles = useMemo(() => createStyles(colors, textColor), [colors, textColor]);

  const [formData, setFormData] = useState({
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
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true })
    ]).start();

    loadAvailablePlans();

    if (initialData) {
      populateForm(initialData);
    } else {
      loadStudentData();
    }
  }, [studentId]);

  const loadAvailablePlans = async () => {
    try {
      setLoadingPlans(true);
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) return;

      const plans = await academyFirestoreService.getAll('plans', academiaId);
      setAvailablePlans(plans);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const populateForm = (data: any) => {
    setFormData({
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      birthDate: data.birthDate || '',
      address: data.address || '',
      emergencyContact: data.emergencyContact || '',
      emergencyPhone: data.emergencyPhone || '',
      medicalConditions: data.medicalConditions || '',
      goals: data.goals || '',
      status: data.status || 'active',
      sexo: data.sexo || ''
    });
    // Tenta usar planId existente, ou deixa vazio por enquanto
    if (data.planId) {
      setSelectedPlanId(data.planId);
    }
    setLoadingData(false);
  };

  const loadStudentData = async () => {
    try {
      setLoadingData(true);
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) return;

      const data = await academyFirestoreService.getById('students', studentId, academiaId) as any;
      if (data) {
        populateForm(data);
      } else {
        setSnackbar({ visible: true, message: 'Aluno não encontrado', type: 'error' });
        setTimeout(onClose, 1000);
      }
    } catch (error) {
      console.error(error);
      setSnackbar({ visible: true, message: 'Erro ao carregar dados', type: 'error' });
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Nome obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email obrigatório';
    if (!formData.phone.trim()) newErrors.phone = 'Telefone obrigatório';
    if (!formData.birthDate || !formData.birthDate.trim()) newErrors.birthDate = 'Data nasc. obrigatória';
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Contato emergência obrigatório';
    if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Telefone emergência obrigatório';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const academiaId = userProfile?.academiaId || academia?.id;

      const selectedPlanObj = availablePlans.find(p => p.id === selectedPlanId);

      const updateData = {
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
        isActive: formData.status === 'active',
        sexo: formData.sexo,
        updatedAt: new Date(),
        updatedBy: user?.id,
        planId: selectedPlanId || null,
        currentPlan: selectedPlanObj ? selectedPlanObj.name : null
      };

      await academyFirestoreService.update('students', studentId, updateData, academiaId!);
      setSnackbar({ visible: true, message: 'Atualizado com sucesso!', type: 'success' });
      setTimeout(onSuccess, 1000);
    } catch (error) {
      console.error(error);
      setSnackbar({ visible: true, message: 'Erro ao atualizar', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Aluno',
      'Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const academiaId = userProfile?.academiaId || academia?.id;
              await academyFirestoreService.delete('students', studentId, academiaId!);
              setSnackbar({ visible: true, message: 'Aluno excluído', type: 'success' });
              setTimeout(onSuccess, 800);
            } catch (error) {
              setSnackbar({ visible: true, message: 'Erro ao excluir', type: 'error' });
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: null }));
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

  if (loadingData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <EnhancedErrorBoundary errorContext={{ screen: 'EditStudentForm', studentId }}>
      <Animated.View style={{ flex: 1, backgroundColor: colors.background, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getString('editStudent')}</Text>
          <IconButton icon="close" onPress={onClose} iconColor={textColor} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>👤 {getString('personalData')}</Text>

          <TextInput
            label={getString('fullName')}
            value={formData.name}
            onChangeText={(v) => updateFormData('name', v)}
            mode="outlined"
            style={styles.input}
            error={!!errors.name}
            theme={inputTheme}
            textColor={textColor}
          />
          {errors.name && <HelperText type="error">{errors.name}</HelperText>}

          <TextInput
            label={getString('email')}
            value={formData.email}
            onChangeText={(v) => updateFormData('email', v)}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            error={!!errors.email}
            theme={inputTheme}
            textColor={textColor}
          />
          {errors.email && <HelperText type="error">{errors.email}</HelperText>}

          <TextInput
            label={getString('phone')}
            value={formData.phone}
            onChangeText={(v) => updateFormData('phone', v)}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            error={!!errors.phone}
            theme={inputTheme}
            textColor={textColor}
          />
          {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}

          <TextInput
            label={getString('birthDate')}
            value={formData.birthDate}
            onChangeText={(v) => updateFormData('birthDate', v)}
            mode="outlined"
            placeholder="01/01/1990"
            style={styles.input}
            error={!!errors.birthDate}
            theme={inputTheme}
            textColor={textColor}
          />
          {errors.birthDate && <HelperText type="error">{errors.birthDate}</HelperText>}

          <TextInput
            label={getString('address')}
            value={formData.address}
            onChangeText={(v) => updateFormData('address', v)}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
            theme={inputTheme}
            textColor={textColor}
          />

          <Divider style={{ marginVertical: SPACING.lg }} />

          <Text style={styles.sectionTitle}>🚑 {getString('emergencyContact')}</Text>
          <TextInput
            label={getString('contactName')}
            value={formData.emergencyContact}
            onChangeText={(v) => updateFormData('emergencyContact', v)}
            mode="outlined"
            style={styles.input}
            error={!!errors.emergencyContact}
            theme={inputTheme}
            textColor={textColor}
          />
          {errors.emergencyContact && <HelperText type="error">{errors.emergencyContact}</HelperText>}

          <TextInput
            label={getString('emergencyPhone')}
            value={formData.emergencyPhone}
            onChangeText={(v) => updateFormData('emergencyPhone', v)}
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

          <Text style={styles.sectionTitle}>🩺 {getString('medicalInfo')}</Text>
          <TextInput
            label={getString('medicalConditions')}
            value={formData.medicalConditions}
            onChangeText={(v) => updateFormData('medicalConditions', v)}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            theme={inputTheme}
            textColor={textColor}
          />

          <TextInput
            label={getString('goals')}
            value={formData.goals}
            onChangeText={(v) => updateFormData('goals', v)}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
            theme={inputTheme}
            textColor={textColor}
          />

          <Text style={styles.fieldLabel}>{getString('status')}</Text>
          <RadioButton.Group onValueChange={v => updateFormData('status', v)} value={formData.status}>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={styles.radioItem}>
                <RadioButton value="active" color={colors.primary} />
                <Text style={{ color: textColor }}>{getString('active')}</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="inactive" color={colors.primary} />
                <Text style={{ color: textColor }}>{getString('inactive')}</Text>
              </View>
            </View>
          </RadioButton.Group>

          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={onClose} style={styles.button} textColor={textColor}>{getString('cancel')}</Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={loading}
              disabled={loading}
              buttonColor={COLORS.primary[500]}
            >
              {getString('save')}
            </Button>
          </View>

          <Button
            mode="outlined"
            onPress={handleDelete}
            style={[styles.button, { marginTop: SPACING.md, borderColor: COLORS.error[500] }]}
            textColor={COLORS.error[500]}
            icon="delete"
          >
            {getString('deleteStudent')}
          </Button>

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
  radioItem: { flexDirection: 'row', alignItems: 'center' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  button: { flex: 1, borderRadius: BORDER_RADIUS.lg },
  globalLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  }
});

export default EditStudentForm;
