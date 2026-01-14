import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { Card, Text, Button, TextInput, HelperText, Chip, RadioButton, Snackbar } from 'react-native-paper';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import { useCustomClaims } from '@hooks/useCustomClaims';
import ImprovedScheduleSelector from '@components/ImprovedScheduleSelector';
import { createEmptySchedule, isValidSchedule, scheduleToDisplayString } from '@utils/scheduleUtils';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT, BORDER_WIDTH } from '@presentation/theme/designTokens';
import type { NavigationProp } from '@react-navigation/native';
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

interface AddClassScreenProps {
  navigation: NavigationProp<any>;
}

const AddClassScreen = ({ navigation }: AddClassScreenProps) => {
  const { getString } = useTheme();

  const { user, userProfile, academia } = useAuthFacade();
  const { role, isInstructor } = useCustomClaims();
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });

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

    // 1) Buscar instrutores na subcoleção da academia
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

    // Se não encontrou instrutores na subcoleção, significa que não há instrutores cadastrados para esta academia
    if (userInstructors.length === 0) {
      console.log('ℹ️ Nenhum instrutor encontrado na subcoleção da academia');
    }

    // 3) Mesclar e remover duplicados por id
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
      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error(getString('academyIdNotFound'));
        return;
      }

      console.log('🔍 Carregando modalidades da coleção:', `gyms/${academiaId}/modalities`);
      const list = await academyFirestoreService.getAll('modalities', academiaId) as any[];
      console.log('📋 Modalidades brutas encontradas:', list.length);

      // Normalizar e remover duplicatas
      const normalized = (list || []).map((m: any) => ({
        id: m.id || m.name,
        name: m.name
      }));

      // Remover duplicatas baseado no nome da modalidade
      const uniqueModalities = normalized.filter((modality, index, self) =>
        index === self.findIndex(m => m.name === modality.name)
      );

      console.log('✅ Modalidades únicas após deduplicação:', uniqueModalities.length);
      console.log('📝 Lista de modalidades:', uniqueModalities.map(m => m.name));

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

    // Bloquear quando não houver modalidades cadastradas no sistema
    if (!modalities || modalities.length === 0) {
      newErrors.modality = getString('noModalityGoToAdmin');
    }

    if (!formData.modality) {
      newErrors.modality = 'Modalidade é obrigatória';
    }

    if (!formData.maxStudents || isNaN(Number(formData.maxStudents)) || parseInt(formData.maxStudents) <= 0) {
      newErrors.maxStudents = 'Número máximo de alunos deve ser um número positivo';
    }

    // Validação flexível: se não selecionou instrutor específico nem informou nome manual, usará o usuário atual
    // Só dar erro se realmente não há como identificar um instrutor
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
        instructorId: formData.instructorId || user?.id, // Usar instrutor selecionado ou usuário atual como fallback
        instructorName: formData.instructorName || userProfile?.name || user?.displayName || user?.email || '',
        // Armazenar formato estruturado
        schedule: formData.schedule,
        scheduleText: scheduleToDisplayString(formData.schedule),
        price: parseFloat(formData.price),
        status: formData.status,
        ageCategory: formData.ageCategory,
        academiaId: userProfile?.academiaId, // Associar à academia do instrutor
        createdBy: user?.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('🔍 Dados da turma que será criada:', {
        name: classData.name,
        instructorId: classData.instructorId,
        instructorName: classData.instructorName,
        academiaId: classData.academiaId,
        formDataInstructorId: formData.instructorId,
        userUid: user?.id,
        userType: role,
        userEmail: user?.email
      });

      // Verificação específica para instrutor criando própria turma
      if (isInstructor() && !formData.instructorId) {
        console.log('🎯 INSTRUTOR CRIANDO PRÓPRIA TURMA - instructorId será:', user?.id);
      }

      // Obter ID da academia para criar na subcoleção correta
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        throw new Error(getString('academyIdNotFound'));
      }

      console.log('✅ Criando turma na coleção:', `gyms/${academiaId}/classes`);
      console.log('✅ Dados da turma:', classData);
      const newClassId = await academyFirestoreService.create('classes', classData, academiaId);
      console.log('✅ Turma criada com ID:', newClassId);

      // Verificar se a turma foi realmente salva
      try {
        const savedClass = await academyFirestoreService.getById('classes', newClassId, academiaId) as any;
        if (savedClass) {
          console.log('🔍 Turma salva verificada:', {
            id: savedClass.id,
            name: savedClass.name,
            instructorId: savedClass.instructorId,
            academiaId: savedClass.academiaId
          });
        }
      } catch (verifyError) {
        console.warn('⚠️ Erro ao verificar turma criada:', verifyError);
      }

      console.log('✅ Turma criada com ID:', newClassId);

      setSnackbar({
        visible: true,
        message: `✅ Turma "${formData.name.trim()}" criada com sucesso! Redirecionando...`,
        type: 'success'
      });

      // Voltar após pequeno atraso para permitir ver o feedback
      setTimeout(() => {
        // Sempre voltar para a tela anterior, independente do tipo de usuário
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

    // Clear error when user starts typing
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

  return (
    <EnhancedErrorBoundary errorContext={{ screen: 'AddClassScreen', academiaId: userProfile?.academiaId }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>{getString('newClass')}</Text>

              {/* Nome da Turma */}
              <TextInput
                label={getString('className')}
                value={formData.name}
                onChangeText={(value: string) => updateFormData('name', value)}
                mode="outlined"
                style={styles.input}
                error={!!errors.name}
                theme={{ colors: { onSurface: COLORS.text.primary, onSurfaceVariant: COLORS.text.secondary } }}
              />
              {errors.name && <HelperText type="error">{errors.name}</HelperText>}

              {/* Modalidade */}
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>{getString('modality')}</Text>
                <View style={styles.chipContainer}>
                  {modalities.length === 0 && (
                    <Text style={{ color: COLORS.gray[500] }}>{getString('noModalitiesRegistered')}</Text>
                  )}
                  {modalities.map((m) => (
                    <Chip
                      key={m.id}
                      selected={formData.modality === m.name}
                      onPress={() => updateFormData('modality', m.name)}
                      style={styles.chip}
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
                <Text style={styles.label}>{getString('ageCategory')}</Text>
                <View style={styles.chipContainer}>
                  {ageCategories.map((category) => (
                    <Chip
                      key={category.id}
                      selected={formData.ageCategory === category.value}
                      onPress={() => updateFormData('ageCategory', category.value)}
                      style={styles.chip}
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
                theme={{ colors: { onSurface: COLORS.text.primary, onSurfaceVariant: COLORS.text.secondary } }}
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
                theme={{ colors: { onSurface: COLORS.text.primary, onSurfaceVariant: COLORS.text.secondary } }}
              />
              {errors.maxStudents && <HelperText type="error">{errors.maxStudents}</HelperText>}

              {/* Instrutor */}
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>{getString('instructor')}</Text>

                {/* Opção "Eu serei o instrutor" sempre visível */}
                <View style={styles.chipContainer}>
                  <Chip
                    selected={!formData.instructorId}
                    onPress={() => {
                      updateFormData('instructorId', '');
                      updateFormData('instructorName', '');
                    }}
                    style={[styles.chip, { backgroundColor: !formData.instructorId ? COLORS.success[50] : 'transparent' }]}
                    mode={!formData.instructorId ? 'flat' : 'outlined'}
                    icon={!formData.instructorId ? 'check' : 'account'}
                  >
                    👤 {getString('iWillBeInstructor')}
                  </Chip>
                </View>

                {/* Mostrar nome do usuário atual quando selecionado */}
                {!formData.instructorId && (
                  <View style={{ backgroundColor: COLORS.success[50], padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, marginBottom: SPACING.sm }}>
                    <Text style={{ color: COLORS.success[800], fontSize: FONT_SIZE.sm }}>
                      ✅ {getString('instructor')}: {userProfile?.name || user?.displayName || user?.email}
                    </Text>
                  </View>
                )}

                {/* Lista de outros instrutores */}
                {instructors.length > 0 && (
                  <>
                    <Text style={[styles.label, { fontSize: FONT_SIZE.base, marginTop: SPACING.md, marginBottom: SPACING.sm }]}>
                      {getString('orChooseOtherInstructor')}:
                    </Text>
                    <View style={styles.chipContainer}>
                      {instructors.map((instructor) => (
                        <Chip
                          key={instructor.id}
                          selected={formData.instructorId === instructor.id}
                          onPress={() => handleInstructorChange(instructor.id)}
                          style={styles.chip}
                          mode={formData.instructorId === instructor.id ? 'flat' : 'outlined'}
                        >
                          {instructor.name}
                        </Chip>
                      ))}
                    </View>
                  </>
                )}

                {instructors.length === 0 && (
                  <Text style={{ color: COLORS.gray[500], fontSize: FONT_SIZE.sm, marginTop: SPACING.sm }}>
                    {getString('noOtherInstructors')}
                  </Text>
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
                  theme={{ colors: { onSurface: COLORS.text.primary, onSurfaceVariant: COLORS.text.secondary } }}
                />
              </View>

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
                theme={{ colors: { onSurface: COLORS.text.primary, onSurfaceVariant: COLORS.text.secondary } }}
              />
              {errors.price && <HelperText type="error">{errors.price}</HelperText>}

              {/* Status */}
              <View style={styles.radioContainer}>
                <Text style={styles.label}>{getString('status')}</Text>
                <RadioButton.Group
                  onValueChange={(value: string) => updateFormData('status', value)}
                  value={formData.status}
                >
                  <View style={styles.radioItem}>
                    <RadioButton value="active" />
                    <Text style={styles.radioLabel}>{getString('active')}</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="inactive" />
                    <Text style={styles.radioLabel}>{getString('inactive')}</Text>
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
                >{getString('cancel')}</Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  buttonColor={COLORS.success[500]}
                  loading={loading}
                  disabled={loading || modalities.length === 0}
                >
                  {getString('createClass')}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>

        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
          duration={3000}
          style={{
            backgroundColor: snackbar.type === 'success' ? COLORS.primary[500] :
              snackbar.type === 'error' ? COLORS.error[500] : COLORS.info[500]
          }}
          action={{
            label: 'OK',
            onPress: () => setSnackbar((s) => ({ ...s, visible: false })),
            labelStyle: { color: COLORS.white }
          }}
        >
          {snackbar.message}
        </Snackbar>
      </KeyboardAvoidingView>
    </EnhancedErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 4, // Espaço extra no fim
    flexGrow: 1,
  },
  card: {
    marginBottom: 20,
    backgroundColor: hexToRgba(COLORS.white, 0.08),
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.white, 0.12),
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    width: '100%',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    color: COLORS.text.primary,
  },
  input: {
    marginBottom: SPACING.md,
    width: '100%',
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: SPACING.sm,
    color: COLORS.text.primary,
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
    flexShrink: 1,
  },
  radioContainer: {
    marginBottom: SPACING.lg,
    width: '100%',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    flex: 1,
  },
  radioLabel: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    flex: 1,
    color: COLORS.text.secondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    width: '100%',
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    minWidth: 0,
  }
});

export default AddClassScreen;
