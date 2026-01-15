import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassCard from '@components/GlassCard';
import {
  Text,
  Button,
  TextInput,
  HelperText,
  Chip,
  RadioButton,
  Snackbar,
  ActivityIndicator,
  Banner
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import { useCustomClaims } from '@hooks/useCustomClaims';
import ImprovedScheduleSelector from '@components/ImprovedScheduleSelector';
import { createEmptySchedule, isValidSchedule, scheduleToDisplayString } from '@utils/scheduleUtils';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import type { NavigationProp } from '@react-navigation/native';
import { useTheme } from "@contexts/ThemeContext";
import { hexToRgba } from '@shared/utils/colorUtils';
import { LinearGradient } from 'expo-linear-gradient';

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

interface AddClassScreenProps {
  navigation: NavigationProp<any>;
}

const AddClassScreen = ({ navigation }: AddClassScreenProps) => {
  const { getString, theme, isDarkMode } = useTheme();
  // Ensure we have access to colors from the theme object which should be dynamic
  const colors = theme?.colors || theme || COLORS;

  const { user, userProfile, academia } = useAuthFacade();
  const { role, isInstructor } = useCustomClaims();
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });

  // Dynamic Styles from ReportsScreen/AddStudentScreen logic
  const backgroundGradient = isDarkMode
    ? [COLORS.gray[800], COLORS.gray[900], COLORS.black]
    : [COLORS.gray[100], COLORS.gray[50], COLORS.white];
  const glassVariant = isDarkMode ? 'premium' : 'card';
  const textColor = theme?.colors?.text || COLORS.text.primary;
  const secondaryTextColor = theme?.colors?.textSecondary || COLORS.text.secondary;

  const styles = useMemo(() => createStyles(colors, textColor), [colors, textColor]);

  // Age categories for classes
  const ageCategories = [
    { id: 'kids1', label: 'Kids 1 (4-6 anos)', value: 'kids1', minAge: 4, maxAge: 6 },
    { id: 'kids2', label: 'Kids 2 (7-9 anos)', value: 'kids2', minAge: 7, maxAge: 9 },
    { id: 'kids3', label: 'Kids 3 (10-13 anos)', value: 'kids3', minAge: 10, maxAge: 13 },
    { id: 'juvenil', label: 'Juvenil (14-17 anos)', value: 'juvenil', minAge: 14, maxAge: 17 },
    { id: 'adulto', label: 'Adulto (18+ anos)', value: 'adulto', minAge: 18, maxAge: null }
  ];

  // Form data
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

    // Se for um instrutor, pré-selecionar ele mesmo como instrutor da turma
    if (isInstructor() && user) {
      setFormData(prev => ({
        ...prev,
        instructorId: user.id,
        instructorName: userProfile?.name || user.displayName || user.email || ''
      }));
    }
  }, [user, userProfile]);

  const loadInstructors = async () => {
    let userInstructors: Instructor[] = [];

    // Obter ID da academia
    const academiaId = userProfile?.academiaId || academia?.id;
    if (!academiaId) {
      console.error(getString('academyIdNotFound'));
      return;
    }

    try {
      const instructorsData = await academyFirestoreService.getAll('instructors', academiaId) as any[];
      userInstructors = instructorsData
        .map(u => ({
          id: u.id,
          name: u.name || u.displayName || u.fullName || u.email || getString('instructor'),
          email: u.email || null,
          academiaId: u.academiaId || null
        }));
    } catch (error: any) {
      console.warn('Aviso: falha ao buscar instrutores em users (permissões?):', error?.message || error);
    }

    if (userInstructors.length === 0) {
      console.log('ℹ️ Nenhum instrutor encontrado na subcoleção da academia');
    }

    const map = new Map();
    [...userInstructors].forEach((inst: Instructor) => {
      if (!inst?.id) return;
      if (!map.has(inst.id)) {
        map.set(inst.id, inst);
      }
    });
    const merged = Array.from(map.values()).sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));

    setInstructors(merged);
  };

  const loadModalities = async () => {
    try {
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error(getString('academyIdNotFound'));
        return;
      }

      const list = await academyFirestoreService.getAll('modalities', academiaId) as any[];

      const normalized = (list || []).map((m: any) => ({
        id: m.id || m.name,
        name: m.name
      }));

      const uniqueModalities = normalized.filter((modality, index, self) =>
        index === self.findIndex(m => m.name === modality.name)
      );

      setModalities(uniqueModalities);
    } catch (error) {
      console.error('Erro ao carregar modalidades:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da turma é obrigatório';
    }

    if (!modalities || modalities.length === 0) {
      newErrors.modality = getString('noModalityGoToAdmin');
    }

    if (!formData.modality) {
      newErrors.modality = 'Modalidade é obrigatória';
    }

    if (!formData.maxStudents || isNaN(Number(formData.maxStudents)) || parseInt(formData.maxStudents) <= 0) {
      newErrors.maxStudents = 'Número máximo de alunos deve ser um número positivo';
    }

    if (formData.instructorId && !instructors.find(i => i.id === formData.instructorId) && !formData.instructorName?.trim()) {
      newErrors.instructorId = 'Instrutor selecionado não encontrado. Informe o nome manualmente.';
    }

    if (!isValidSchedule(formData.schedule) || !Object.values(formData.schedule.hours).some(hours => hours.length > 0)) {
      newErrors.schedule = 'Pelo menos um horário deve ser selecionado';
    }

    if (!formData.price || isNaN(Number(formData.price)) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Preço deve ser um número válido';
    }

    if (!formData.ageCategory) {
      newErrors.ageCategory = 'Categoria de idade é obrigatória';
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

      const classData = {
        name: formData.name.trim(),
        modality: formData.modality,
        description: formData.description.trim(),
        maxStudents: parseInt(formData.maxStudents),
        currentStudents: 0,
        instructorId: formData.instructorId || user?.id,
        instructorName: formData.instructorName || userProfile?.name || user?.displayName || user?.email || '',
        schedule: formData.schedule,
        scheduleText: scheduleToDisplayString(formData.schedule),
        price: parseFloat(formData.price),
        status: formData.status,
        ageCategory: formData.ageCategory,
        academiaId: userProfile?.academiaId,
        createdBy: user?.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        throw new Error(getString('academyIdNotFound'));
      }

      await academyFirestoreService.create('classes', classData, academiaId);

      setSnackbar({
        visible: true,
        message: `✅ Turma "${formData.name.trim()}" criada com sucesso!`,
        type: 'success'
      });

      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Erro ao criar turma:', error);
      setSnackbar({ visible: true, message: 'Erro ao criar turma. Tente novamente.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleInstructorChange = (instructorId: string) => {
    const instructor = instructors.find(i => i.id === instructorId);
    updateFormData('instructorId', instructorId);
    updateFormData('instructorName', instructor ? instructor.name : '');
  };

  // Tema personalizado para inputs transparentes
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
    <EnhancedErrorBoundary errorContext={{ screen: 'AddClassScreen', academiaId: userProfile?.academiaId }}>
      <LinearGradient
        colors={backgroundGradient as any}
        style={{
          flex: 1,
          width: '100%',
          minHeight: 0,
          height: Platform.OS === 'web' ? '100vh' : '100%',
          overflow: 'hidden'
        } as any}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            enabled={Platform.OS !== 'web'}
          >
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                padding: SPACING.md,
                paddingBottom: 100,
                flexGrow: 1,
                minHeight: '101%'
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              alwaysBounceVertical={true}
            >
              <View style={{ marginBottom: SPACING.lg, marginTop: SPACING.sm }}>
                <Text style={{
                  fontSize: FONT_SIZE.xxl,
                  fontWeight: FONT_WEIGHT.bold,
                  color: textColor,
                  textAlign: 'center'
                }}>
                  {getString('newClass')}
                </Text>
              </View>

              <GlassCard variant={glassVariant} style={{ padding: SPACING.md }}>

                {loading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors?.primary || COLORS.primary[500]} />
                    <Text style={styles.loadingOverlayText}>{getString('creatingClass')}...</Text>
                  </View>
                )}

                <View>
                  <Text style={styles.sectionTitle}>{getString('basicInfo')}</Text>

                  {/* Nome da Turma */}
                  <TextInput
                    label={getString('className')}
                    value={formData.name}
                    onChangeText={(value: string) => updateFormData('name', value)}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.name}
                    left={<TextInput.Icon icon="pencil" color={colors?.onSurfaceVariant || COLORS.gray[500]} />}
                    theme={inputTheme}
                    textColor={textColor}
                  />
                  {errors.name && <HelperText type="error">{errors.name}</HelperText>}

                  {/* Modalidade */}
                  <View style={styles.pickerContainer}>
                    <Text style={styles.fieldLabel}>{getString('modality')}</Text>
                    <View style={styles.chipContainer}>
                      {modalities.length === 0 && (
                        <Text style={{ color: secondaryTextColor }}>{getString('noModalitiesRegistered')}</Text>
                      )}
                      {modalities.map((m) => (
                        <Chip
                          key={m.id}
                          selected={formData.modality === m.name}
                          onPress={() => updateFormData('modality', m.name)}
                          style={[
                            styles.chip,
                            formData.modality === m.name && styles.chipSelected
                          ]}
                          textStyle={formData.modality === m.name ? styles.chipSelectedText : styles.chipText}
                          mode={formData.modality === m.name ? 'flat' : 'outlined'}
                        >
                          {m.name}
                        </Chip>
                      ))}
                    </View>
                    {errors.modality && <HelperText type="error">{errors.modality}</HelperText>}
                  </View>

                  {/* Categoria por Idade */}
                  <View style={styles.pickerContainer}>
                    <Text style={styles.fieldLabel}>{getString('ageCategory')}</Text>
                    <View style={styles.chipContainer}>
                      {ageCategories.map((category) => (
                        <Chip
                          key={category.id}
                          selected={formData.ageCategory === category.value}
                          onPress={() => updateFormData('ageCategory', category.value)}
                          style={[
                            styles.chip,
                            formData.ageCategory === category.value && styles.chipSelected
                          ]}
                          textStyle={formData.ageCategory === category.value ? styles.chipSelectedText : styles.chipText}
                          mode={formData.ageCategory === category.value ? 'flat' : 'outlined'}
                        >
                          {category.label}
                        </Chip>
                      ))}
                    </View>
                    {errors.ageCategory && <HelperText type="error">{errors.ageCategory}</HelperText>}
                  </View>

                  {/* Descrição */}
                  <TextInput
                    label={getString('description') + " (" + getString('optional') + ")"}
                    value={formData.description}
                    onChangeText={(value: string) => updateFormData('description', value)}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                    left={<TextInput.Icon icon="text" color={colors?.onSurfaceVariant || COLORS.gray[500]} />}
                    theme={inputTheme}
                    textColor={textColor}
                  />

                  {/* Máximo de Alunos */}
                  <TextInput
                    label={getString('maxStudents')}
                    value={formData.maxStudents}
                    onChangeText={(value: string) => updateFormData('maxStudents', value)}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    error={!!errors.maxStudents}
                    left={<TextInput.Icon icon="account-group" color={colors?.onSurfaceVariant || COLORS.gray[500]} />}
                    theme={inputTheme}
                    textColor={textColor}
                  />
                  {errors.maxStudents && <HelperText type="error">{errors.maxStudents}</HelperText>}

                  <Text style={styles.sectionTitle}>{getString('instructor')}</Text>

                  {/* Instrutor */}
                  <View style={styles.pickerContainer}>
                    <View style={styles.chipContainer}>
                      <Chip
                        selected={!formData.instructorId}
                        onPress={() => {
                          updateFormData('instructorId', '');
                          updateFormData('instructorName', '');
                        }}
                        style={[styles.chip, !formData.instructorId && { backgroundColor: COLORS.success[100], borderColor: COLORS.success[500] }]}
                        mode={!formData.instructorId ? 'flat' : 'outlined'}
                        icon={!formData.instructorId ? 'check' : 'account'}
                        textStyle={{ color: !formData.instructorId ? COLORS.success[900] : secondaryTextColor }}
                      >
                        {getString('iWillBeInstructor')}
                      </Chip>
                    </View>

                    {/* Mostrar nome do usuário atual quando selecionado */}
                    {!formData.instructorId && (
                      <View style={{
                        backgroundColor: hexToRgba(COLORS.success[500], 0.1),
                        padding: SPACING.sm,
                        borderRadius: BORDER_RADIUS.sm,
                        marginBottom: SPACING.sm,
                        marginTop: SPACING.xs
                      }}>
                        <Text style={{ color: COLORS.success[500], fontSize: FONT_SIZE.sm }}>
                          ✅ {getString('instructor')}: {userProfile?.name || user?.displayName || user?.email}
                        </Text>
                      </View>
                    )}

                    {/* Lista de outros instrutores */}
                    {instructors.length > 0 && (
                      <>
                        <Text style={[styles.fieldLabel, { fontSize: FONT_SIZE.sm, marginTop: SPACING.md }]}>
                          {getString('orChooseOtherInstructor')}:
                        </Text>
                        <View style={styles.chipContainer}>
                          {instructors.map((instructor) => (
                            <Chip
                              key={instructor.id}
                              selected={formData.instructorId === instructor.id}
                              onPress={() => handleInstructorChange(instructor.id)}
                              style={[
                                styles.chip,
                                formData.instructorId === instructor.id && styles.chipSelected
                              ]}
                              textStyle={formData.instructorId === instructor.id ? styles.chipSelectedText : styles.chipText}
                              mode={formData.instructorId === instructor.id ? 'flat' : 'outlined'}
                            >
                              {instructor.name}
                            </Chip>
                          ))}
                        </View>
                      </>
                    )}

                    {errors.instructorId && <HelperText type="error">{errors.instructorId}</HelperText>}

                    {/* Entrada manual do nome do instrutor como fallback */}
                    <TextInput
                      label={getString('instructorNameManual')}
                      value={formData.instructorName}
                      onChangeText={(value: string) => updateFormData('instructorName', value)}
                      mode="outlined"
                      placeholder={instructors.length === 0 ? 'Ex: Cícero Silva' : getString('optionalIfSelectedAbove')}
                      style={styles.input}
                      theme={inputTheme}
                      textColor={textColor}
                    />
                  </View>

                  <Text style={styles.sectionTitle}>{getString('scheduleAndPrice')}</Text>

                  {/* Horário */}
                  <ImprovedScheduleSelector
                    value={formData.schedule}
                    onScheduleChange={(schedule: any) => updateFormData('schedule', schedule)}
                    duration={60}
                    timezone="timezone"
                    startHour={6}
                    endHour={22}
                    required={true}
                    label={getString('schedules')}
                    style={styles.input}
                    instructorId={formData.instructorId || user?.id}
                    enableConflictValidation={true}
                  />
                  {errors.schedule && <HelperText type="error">{errors.schedule}</HelperText>}

                  {/* Preço */}
                  <TextInput
                    label={getString('monthlyPrice')}
                    value={formData.price}
                    onChangeText={(value: string) => updateFormData('price', value)}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                    error={!!errors.price}
                    left={<TextInput.Icon icon="currency-usd" color={colors?.onSurfaceVariant || COLORS.gray[500]} />}
                    theme={inputTheme}
                    textColor={textColor}
                  />
                  {errors.price && <HelperText type="error">{errors.price}</HelperText>}

                  {/* Status */}
                  <View style={styles.radioContainer}>
                    <Text style={styles.fieldLabel}>{getString('status')}</Text>
                    <RadioButton.Group
                      onValueChange={(value: string) => updateFormData('status', value)}
                      value={formData.status}
                    >
                      <View style={styles.radioItem}>
                        <RadioButton value="active" color={colors?.primary || COLORS.primary[500]} uncheckedColor={colors?.onSurfaceVariant || COLORS.gray[500]} />
                        <Text style={[styles.radioLabel, { color: textColor }]}>{getString('active')}</Text>
                      </View>
                      <View style={styles.radioItem}>
                        <RadioButton value="inactive" color={colors?.primary || COLORS.primary[500]} uncheckedColor={colors?.onSurfaceVariant || COLORS.gray[500]} />
                        <Text style={[styles.radioLabel, { color: textColor }]}>{getString('inactive')}</Text>
                      </View>
                    </RadioButton.Group>
                  </View>

                  {/* Botões */}
                  <View style={styles.buttonContainer}>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.goBack()}
                      style={styles.button}
                      disabled={loading}
                      textColor={textColor}
                    >{getString('cancel')}</Button>
                    <Button
                      mode="contained"
                      onPress={handleSubmit}
                      style={[styles.button, loading && styles.buttonLoading]}
                      buttonColor={colors?.primary || COLORS.primary[500]}
                      loading={loading}
                      disabled={loading || modalities.length === 0}
                      icon={loading ? undefined : "check"}
                    >
                      {loading ? getString('creating') : getString('createClass')}
                    </Button>
                  </View>
                </View>
              </GlassCard>
            </ScrollView>

            <Snackbar
              visible={snackbar.visible}
              onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
              duration={3000}
              style={{
                marginBottom: SPACING.lg,
                backgroundColor: snackbar.type === 'success' ? COLORS.success[600] :
                  snackbar.type === 'error' ? COLORS.error[600] : COLORS.info[600]
              }}
              action={{
                label: 'OK',
                onPress: () => setSnackbar((s) => ({ ...s, visible: false })),
                textColor: COLORS.white
              }}
            >
              {snackbar.message}
            </Snackbar>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </EnhancedErrorBoundary>
  );
};

const createStyles = (colors: any, textColor: string) => StyleSheet.create({
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    color: textColor,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: SPACING.sm,
    color: textColor,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: 'transparent',
  },
  pickerContainer: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    width: '100%',
  },
  chip: {
    marginBottom: SPACING.sm,
    flexGrow: 0,
    backgroundColor: 'transparent',
    borderColor: colors?.text?.disabled || COLORS.gray[400],
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: hexToRgba(colors?.primary || COLORS.primary[500], 0.1),
    borderColor: colors?.primary || COLORS.primary[500],
  },
  chipText: {
    color: colors?.text?.secondary || COLORS.gray[600],
  },
  chipSelectedText: {
    color: colors?.primary || COLORS.primary[500],
    fontWeight: 'bold',
  },
  radioContainer: {
    marginBottom: SPACING.lg,
    width: '100%',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  radioLabel: {
    fontSize: FONT_SIZE.md,
    marginLeft: SPACING.sm
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
  },
  buttonLoading: {
    opacity: 0.8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
  },
  loadingOverlayText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: colors?.primary || COLORS.primary[500],
  },
});

export default AddClassScreen;
