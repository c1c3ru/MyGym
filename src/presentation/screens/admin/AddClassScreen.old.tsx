import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions
} from 'react-native';
import {
  Text,
  Button,
  TextInput,
  HelperText,
  Chip,
  Snackbar,
  ActivityIndicator,
  IconButton,
  Divider
} from 'react-native-paper';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import { useCustomClaims } from '@hooks/useCustomClaims';
import ImprovedScheduleSelector from '@components/ImprovedScheduleSelector';
import { createEmptySchedule, isValidSchedule, scheduleToDisplayString } from '@utils/scheduleUtils';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '@presentation/theme/designTokens';
import { useTheme } from "@contexts/ThemeContext";
import { hexToRgba } from '@shared/utils/colorUtils';

interface Instructor {
  id: string;
  name: string;
  email?: string | null;
  academiaId?: string | null;
}

interface Modality {
  id: string;
  name: string;
}

interface AddClassFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddClassForm = ({ onClose, onSuccess }: AddClassFormProps) => {
  const { getString, theme } = useTheme();
  const colors = theme?.colors || theme || COLORS;

  const { user, userProfile, academia } = useAuthFacade();
  const { isInstructor } = useCustomClaims();
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });

  // Animação de entrada
  const slideAnim = useMemo(() => new Animated.Value(50), []);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  const textColor = theme?.colors?.text || COLORS.text.primary;

  const styles = useMemo(() => createStyles(colors, textColor), [colors, textColor]);

  const ageCategories = [
    { id: 'kids1', label: 'Kids 1 (4-6 anos)', value: 'kids1' },
    { id: 'kids2', label: 'Kids 2 (7-9 anos)', value: 'kids2' },
    { id: 'kids3', label: 'Kids 3 (10-13 anos)', value: 'kids3' },
    { id: 'juvenil', label: 'Juvenil (14-17 anos)', value: 'juvenil' },
    { id: 'adulto', label: 'Adulto (18+ anos)', value: 'adulto' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    modality: '',
    description: '',
    maxStudents: '',
    instructorId: '',
    instructorName: '',
    schedule: createEmptySchedule(),
    price: '',
    status: 'active',
    ageCategory: ''
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    loadInstructors();
    loadModalities();

    if (isInstructor() && user) {
      setFormData(prev => ({
        ...prev,
        instructorId: user.id,
        instructorName: userProfile?.name || user.displayName || user.email || ''
      }));
    }
  }, [user, userProfile]);

  const loadInstructors = async () => {
    const academiaId = userProfile?.academiaId || academia?.id;
    if (!academiaId) return;

    try {
      const instructorsData = await academyFirestoreService.getAll('instructors', academiaId) as any[];
      const userInstructors = instructorsData.map(u => ({
        id: u.id,
        name: u.name || u.displayName || u.email || getString('instructor'),
        email: u.email || null,
        academiaId: u.academiaId || null
      }));

      const map = new Map();
      userInstructors.forEach((inst: Instructor) => {
        if (inst?.id && !map.has(inst.id)) map.set(inst.id, inst);
      });
      setInstructors(Array.from(map.values()).sort((a, b) => (a?.name || '').localeCompare(b?.name || '')));
    } catch (error) {
      console.warn('Erro ao buscar instrutores:', error);
    }
  };

  const loadModalities = async () => {
    try {
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) return;

      const list = await academyFirestoreService.getAll('modalities', academiaId) as any[];
      const uniqueModalities = (list || []).map((m: any) => ({
        id: m.id || m.name,
        name: m.name
      })).filter((modality: any, index: number, self: any[]) =>
        index === self.findIndex((m: any) => m.name === modality.name)
      );

      setModalities(uniqueModalities);
    } catch (error) {
      console.error('Erro ao carregar modalidades:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome da turma é obrigatório';
    if (!formData.modality) newErrors.modality = 'Modalidade é obrigatória';
    if (!formData.maxStudents || isNaN(Number(formData.maxStudents)) || parseInt(formData.maxStudents) <= 0) {
      newErrors.maxStudents = 'Número inválido';
    }
    if (!formData.ageCategory) newErrors.ageCategory = 'Categoria obrigatória';
    if (!isValidSchedule(formData.schedule) || !Object.values(formData.schedule.hours).some(hours => hours.length > 0)) {
      newErrors.schedule = 'Selecione horários';
    }
    if (!formData.price || isNaN(Number(formData.price)) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Preço inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({ visible: true, message: 'Verifique os erros no formulário', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) throw new Error(getString('academyIdNotFound'));

      const classData = {
        name: formData.name.trim(),
        modality: formData.modality,
        description: formData.description.trim(),
        maxStudents: parseInt(formData.maxStudents),
        currentStudents: 0,
        instructorId: formData.instructorId || user?.id,
        instructorName: formData.instructorName || userProfile?.name || '',
        schedule: formData.schedule,
        scheduleText: scheduleToDisplayString(formData.schedule),
        price: parseFloat(formData.price),
        status: formData.status,
        ageCategory: formData.ageCategory,
        academiaId,
        createdBy: user?.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await academyFirestoreService.create('classes', classData, academiaId);

      setSnackbar({ visible: true, message: 'Turma criada!', type: 'success' });
      setTimeout(() => {
        onSuccess?.();
      }, 1000);

    } catch (error) {
      console.error('Erro ao criar turma:', error);
      setSnackbar({ visible: true, message: 'Erro ao criar turma', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
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

  return (
    <EnhancedErrorBoundary errorContext={{ screen: 'AddClassForm', academiaId: userProfile?.academiaId }}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>

        {/* Header do Modal */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getString('newClass')}</Text>
          <IconButton icon="close" onPress={onClose} iconColor={textColor} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Informações Básicas</Text>

            <TextInput
              label={getString('className')}
              value={formData.name}
              onChangeText={(v) => updateFormData('name', v)}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
              theme={inputTheme}
              textColor={textColor}
            />
            {errors.name && <HelperText type="error">{errors.name}</HelperText>}

            {/* Modalidades */}
            <View style={styles.pickerContainer}>
              <Text style={styles.fieldLabel}>{getString('modality')}</Text>
              <View style={styles.chipContainer}>
                {modalities.map((m) => (
                  <Chip
                    key={m.id}
                    selected={formData.modality === m.name}
                    onPress={() => updateFormData('modality', m.name)}
                    style={[styles.chip, formData.modality === m.name && styles.chipSelected]}
                    mode="outlined"
                  >
                    {m.name}
                  </Chip>
                ))}
              </View>
              {errors.modality && <HelperText type="error">{errors.modality}</HelperText>}
            </View>

            {/* Categoria Idade */}
            <View style={styles.pickerContainer}>
              <Text style={styles.fieldLabel}>{getString('ageCategory')}</Text>
              <View style={styles.chipContainer}>
                {ageCategories.map((cat) => (
                  <Chip
                    key={cat.id}
                    selected={formData.ageCategory === cat.value}
                    onPress={() => updateFormData('ageCategory', cat.value)}
                    style={[styles.chip, formData.ageCategory === cat.value && styles.chipSelected]}
                    mode="outlined"
                  >
                    {cat.label}
                  </Chip>
                ))}
              </View>
              {errors.ageCategory && <HelperText type="error">{errors.ageCategory}</HelperText>}
            </View>

            <TextInput
              label={getString('description')}
              value={formData.description}
              onChangeText={(v) => updateFormData('description', v)}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              theme={inputTheme}
              textColor={textColor}
            />

            <TextInput
              label={getString('maxStudents')}
              value={formData.maxStudents}
              onChangeText={(v) => updateFormData('maxStudents', v)}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              error={!!errors.maxStudents}
              theme={inputTheme}
              textColor={textColor}
            />
            {errors.maxStudents && <HelperText type="error">{errors.maxStudents}</HelperText>}

            <Text style={[styles.sectionTitle, { color: textColor }]}>{getString('instructor')}</Text>
            <View style={styles.chipContainer}>
              <Chip
                selected={!formData.instructorId}
                onPress={() => { updateFormData('instructorId', ''); updateFormData('instructorName', ''); }}
                style={[styles.chip, !formData.instructorId && { backgroundColor: COLORS.success[100] }]}
                mode="outlined"
                icon={!formData.instructorId ? 'check' : 'account'}
              >
                {getString('iWillBeInstructor')}
              </Chip>
            </View>

            {/* Lista Instrutores */}
            {instructors.length > 0 && (
              <View style={[styles.chipContainer, { marginTop: 8 }]}>
                {instructors.map((inst) => (
                  <Chip
                    key={inst.id}
                    selected={formData.instructorId === inst.id}
                    onPress={() => { updateFormData('instructorId', inst.id); updateFormData('instructorName', inst.name); }}
                    style={[styles.chip, formData.instructorId === inst.id && styles.chipSelected]}
                    mode="outlined"
                  >
                    {inst.name}
                  </Chip>
                ))}
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: textColor }]}>{getString('scheduleAndPrice')}</Text>
            <ImprovedScheduleSelector
              value={formData.schedule}
              onScheduleChange={(s) => updateFormData('schedule', s)}
              duration={60}
              startHour={6}
              endHour={22}
              required={true}
              style={styles.input}
              instructorId={formData.instructorId || user?.id}
            />
            {errors.schedule && <HelperText type="error">{errors.schedule}</HelperText>}

            <TextInput
              label={getString('monthlyPrice')}
              value={formData.price}
              onChangeText={(v) => updateFormData('price', v)}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              error={!!errors.price}
              theme={inputTheme}
              textColor={textColor}
            />
            {errors.price && <HelperText type="error">{errors.price}</HelperText>}
          </View>

          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={onClose} style={styles.button} textColor={textColor}>
              {getString('cancel')}
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={loading}
              disabled={loading}
              buttonColor={COLORS.primary[500]}
            >
              {getString('createClass')}
            </Button>
          </View>
          <View style={{ height: 40 }} />
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
          duration={3000}
          style={{ backgroundColor: snackbar.type === 'error' ? COLORS.error[600] : COLORS.success[600] }}
        >
          {snackbar.message}
        </Snackbar>
      </View>
    </EnhancedErrorBoundary>
  );
};

const createStyles = (colors: any, textColor: string) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[300],
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: textColor,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    color: textColor,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: 'transparent',
  },
  pickerContainer: {
    marginBottom: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  chipSelected: {
    backgroundColor: hexToRgba(COLORS.primary[500], 0.1),
    borderColor: COLORS.primary[500],
  },
  fieldLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: SPACING.sm,
    color: textColor,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  button: {
    flex: 1,
  },
  globalLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingOverlayText: {
    marginTop: SPACING.md,
    color: COLORS.white,
    fontWeight: 'bold'
  }
});

export default AddClassForm;
