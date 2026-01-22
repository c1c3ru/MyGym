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
  Chip,
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

interface EditClassFormProps {
  classId: string;
  onClose: () => void;
  onSuccess: () => void;
  classData?: any; // Opcional, para carregar direto se já tiver
}

const EditClassForm = ({ classId, onClose, onSuccess, classData: initialData }: EditClassFormProps) => {
  const { getString, theme } = useTheme();
  const colors = theme?.colors || theme || COLORS;

  const { user, userProfile, academia } = useAuthFacade();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(!initialData);

  const [instructors, setInstructors] = useState<any[]>([]);
  const [modalities, setModalities] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });

  // Animations
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
    schedule: '', // Simplificado para string por compatibilidade, idealmente seria objeto
    price: '',
    status: 'active',
    ageCategory: ''
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    // Start Animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true })
    ]).start();

    loadInstructors();
    loadModalities();

    if (initialData) {
      populateForm(initialData);
    } else {
      loadClassData();
    }
  }, [classId]);

  const populateForm = (data: any) => {
    setFormData({
      name: data.name || '',
      modality: data.modality || '',
      description: data.description || '',
      maxStudents: data.maxStudents?.toString() || '',
      instructorId: data.instructorId || '',
      instructorName: data.instructorName || '',
      schedule: data.schedule || '',
      price: data.price?.toString() || '',
      status: data.status || 'active',
      ageCategory: data.ageCategory || ''
    });
    setLoadingData(false);
  };

  const loadClassData = async () => {
    try {
      setLoadingData(true);
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) return;

      const data = await academyFirestoreService.getById('classes', classId, academiaId) as any;
      if (data) {
        populateForm(data);
      } else {
        setSnackbar({ visible: true, message: 'Turma não encontrada', type: 'error' });
        setTimeout(onClose, 1000);
      }
    } catch (error) {
      console.error('Erro ao carregar turma:', error);
      setSnackbar({ visible: true, message: 'Erro ao carregar dados', type: 'error' });
    } finally {
      setLoadingData(false);
    }
  };

  const loadInstructors = async () => {
    try {
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) return;
      const data = await academyFirestoreService.getAll('instructors', academiaId) as any[];
      setInstructors(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadModalities = async () => {
    try {
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) return;
      const list = await academyFirestoreService.getAll('modalities', academiaId) as any[];
      const unique = (list || []).map((m: any) => ({ id: m.id || m.name, name: m.name }))
        .filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => t.name === v.name) === i);
      setModalities(unique);
    } catch (e) {
      console.error(e);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Nome obrigatório';
    if (!formData.modality) newErrors.modality = 'Modalidade obrigatória';
    if (!formData.maxStudents || parseInt(formData.maxStudents) <= 0) newErrors.maxStudents = 'Inválido';
    if (!formData.instructorId) newErrors.instructorId = 'Instrutor obrigatório';
    // Schedule validation could be more complex
    if (!formData.price || parseFloat(formData.price) < 0) newErrors.price = 'Preço inválido';
    if (!formData.ageCategory) newErrors.ageCategory = 'Categoria obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const academiaId = userProfile?.academiaId || academia?.id;

      const updateData = {
        name: formData.name.trim(),
        modality: formData.modality,
        description: formData.description.trim(),
        maxStudents: parseInt(formData.maxStudents),
        instructorId: formData.instructorId,
        instructorName: formData.instructorName,
        schedule: formData.schedule,
        price: parseFloat(formData.price),
        status: formData.status,
        ageCategory: formData.ageCategory,
        updatedAt: new Date(),
        updatedBy: user?.id
      };

      await academyFirestoreService.update('classes', classId, updateData, academiaId!);
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
      'Excluir Turma',
      'Tem certeza? Essa ação não pode ser desfeita e afetará alunos inscritos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const academiaId = userProfile?.academiaId || academia?.id;
              await academyFirestoreService.delete('classes', classId, academiaId!);
              setSnackbar({ visible: true, message: 'Turma excluída', type: 'success' });
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
        <Text style={{ marginTop: 10, color: textColor }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <EnhancedErrorBoundary errorContext={{ screen: 'EditClassForm', classId }}>
      <Animated.View style={{ flex: 1, backgroundColor: colors.background, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Editar Turma</Text>
          <IconButton icon="close" onPress={onClose} iconColor={textColor} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>📋 Informações Básicas</Text>

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
          <Text style={styles.fieldLabel}>{getString('modality')}</Text>
          <View style={styles.chipContainer}>
            {modalities.map((m) => (
              <Chip
                key={m.id}
                selected={formData.modality === m.name}
                onPress={() => updateFormData('modality', m.name)}
                style={[styles.chip, formData.modality === m.name && styles.chipSelected]}
                mode="outlined"
                showSelectedOverlay
              >
                {m.name}
              </Chip>
            ))}
          </View>
          {errors.modality && <HelperText type="error">{errors.modality}</HelperText>}

          {/* Categorias */}
          <Text style={styles.fieldLabel}>{getString('ageCategory')}</Text>
          <View style={styles.chipContainer}>
            {ageCategories.map((c) => (
              <Chip
                key={c.id}
                selected={formData.ageCategory === c.value}
                onPress={() => updateFormData('ageCategory', c.value)}
                style={[styles.chip, formData.ageCategory === c.value && styles.chipSelected]}
                mode="outlined"
                showSelectedOverlay
              >
                {c.label}
              </Chip>
            ))}
          </View>

          <TextInput
            label="Descrição"
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
            label="Máximo de Alunos"
            value={formData.maxStudents}
            onChangeText={(v) => updateFormData('maxStudents', v)}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            theme={inputTheme}
            textColor={textColor}
          />

          <Divider style={{ marginVertical: SPACING.lg }} />

          <Text style={styles.sectionTitle}>👨‍🏫 Instrutor</Text>
          <View style={styles.chipContainer}>
            {instructors.map((inst) => (
              <Chip
                key={inst.id}
                selected={formData.instructorId === inst.id}
                onPress={() => { updateFormData('instructorId', inst.id); updateFormData('instructorName', inst.name); }}
                style={[styles.chip, formData.instructorId === inst.id && styles.chipSelected]}
                mode="outlined"
                showSelectedOverlay
              >
                {inst.name}
              </Chip>
            ))}
          </View>

          <Divider style={{ marginVertical: SPACING.lg }} />

          <Text style={styles.sectionTitle}>🕐 Detalhes</Text>

          <TextInput
            label="Horário (Texto)"
            value={formData.schedule}
            onChangeText={(v) => updateFormData('schedule', v)}
            mode="outlined"
            style={styles.input}
            theme={inputTheme}
            textColor={textColor}
            placeholder="Ex: Seg e Qua 18:00"
          />

          <TextInput
            label="Preço Mensal"
            value={formData.price}
            onChangeText={(v) => updateFormData('price', v)}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            theme={inputTheme}
            textColor={textColor}
          />

          <Text style={styles.fieldLabel}>Status</Text>
          <RadioButton.Group onValueChange={v => updateFormData('status', v)} value={formData.status}>
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <View style={styles.radioItem}>
                <RadioButton value="active" color={colors.primary} />
                <Text style={{ color: textColor }}>Ativo</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="inactive" color={colors.primary} />
                <Text style={{ color: textColor }}>Inativo</Text>
              </View>
            </View>
          </RadioButton.Group>

          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={onClose} style={styles.button} textColor={textColor}>Cancelar</Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={loading}
              disabled={loading}
              buttonColor={COLORS.primary[500]}
            >
              Salvar Alterações
            </Button>
          </View>

          <Button
            mode="outlined"
            onPress={handleDelete}
            style={[styles.button, { marginTop: SPACING.md, borderColor: COLORS.error[500] }]}
            textColor={COLORS.error[500]}
            icon="delete"
          >
            Excluir Turma
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
  scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl * 3 },
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
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
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
  globalLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay.medium,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  }
});

export default EditClassForm;
