import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { Card, Text, Button, TextInput, HelperText, Chip, RadioButton, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
// import { Picker } from '@react-native-picker/picker'; // Removido - dependência não disponível
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService, academyClassService } from '@infrastructure/services/academyFirestoreService';
import ActionButton, { ActionButtonGroup } from '@components/ActionButton';
import ImprovedScheduleSelector from '@components/ImprovedScheduleSelector';
import { createEmptySchedule, isValidSchedule, scheduleToDisplayString } from '@utils/scheduleUtils';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT, BORDER_WIDTH } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import { getString } from '@utils/theme';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

interface EditClassScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}

const EditClassScreen = ({ route, navigation }: EditClassScreenProps) => {
  const { classId } = (route.params as any);
  const { user, userProfile, academia } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [modalities, setModalities] = useState<any[]>([]);
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
    schedule: '',
    price: '',
    status: 'active',
    ageCategory: ''
  });

  interface FormErrors {
    name?: string | null;
    modality?: string | null;
    maxStudents?: string | null;
    instructorId?: string | null;
    schedule?: string | null;
    price?: string | null;
    ageCategory?: string | null;
    [key: string]: string | null | undefined;
  }

  const [errors, setErrors] = useState<FormErrors>({});


  // Carregar modalidades do Firestore
  const loadModalities = async () => {
    try {
      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error(getString('academyIdNotFound'));
        return;
      }

      const list = await academyFirestoreService.getAll('modalities', academiaId) as any[];
      const normalized = (list || []).map((m: any) => ({ id: m.id || m.name, name: m.name }));
      setModalities(normalized);
    } catch (error) {
      console.error('Erro ao carregar modalidades:', error);
    }
  };

  useEffect(() => {
    loadClassData();
    loadInstructors();
    loadModalities();
  }, []);

  const loadClassData = async () => {
    try {
      setLoadingData(true);
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error(getString('academyIdNotFound'));
        return;
      }

      const classData = await academyFirestoreService.getById('classes', classId, academiaId) as any;

      if (classData) {
        setFormData({
          name: classData.name || '',
          modality: classData.modality || '',
          description: classData.description || '',
          maxStudents: classData.maxStudents?.toString() || '',
          instructorId: classData.instructorId || '',
          instructorName: classData.instructorName || '',
          ageCategory: classData.ageCategory || '',
          schedule: classData.schedule || '',
          price: classData.price?.toString() || '',
          status: classData.status || 'active'
        });
      } else {
        setSnackbar({ visible: true, message: getString('classNotFound'), type: 'error' });
        setTimeout(() => navigation.goBack(), 800);
      }
    } catch (error) {
      console.error('Erro ao carregar turma:', error);
      setSnackbar({ visible: true, message: 'Erro ao carregar dados da turma', type: 'error' });
    } finally {
      setLoadingData(false);
    }
  };

  const loadInstructors = async () => {
    try {
      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error(getString('academyIdNotFound'));
        return;
      }

      const instructorsData = await academyFirestoreService.getAll('instructors', academiaId) as any[];
      setInstructors(instructorsData);
    } catch (error) {
      console.error('Erro ao carregar instrutores:', error);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da turma é obrigatório';
    }

    // Bloquear quando não houver modalidades cadastradas no sistema
    if (!modalities || modalities.length === 0) {
      newErrors.modality = 'Nenhuma modalidade cadastrada. Vá em Admin > Modalidades para cadastrar antes de continuar.';
    }

    if (!formData.modality) {
      newErrors.modality = 'Modalidade é obrigatória';
    }

    if (!formData.maxStudents || isNaN(parseInt(formData.maxStudents)) || parseInt(formData.maxStudents) <= 0) {
      newErrors.maxStudents = 'Número máximo de alunos deve ser um número positivo';
    }

    if (!formData.instructorId) {
      newErrors.instructorId = 'Instrutor é obrigatório';
    }

    if (!formData.schedule?.trim()) {
      newErrors.schedule = 'Horário é obrigatório';
    }

    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
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
        instructorId: formData.instructorId,
        instructorName: formData.instructorName,
        schedule: formData.schedule.trim(),
        price: parseFloat(formData.price),
        status: formData.status,
        ageCategory: formData.ageCategory,
        updatedAt: new Date(),
        updatedBy: user.id
      };

      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        throw new Error(getString('academyIdNotFound'));
      }

      await academyFirestoreService.update('classes', classId, classData, academiaId);
      setSnackbar({ visible: true, message: 'Turma atualizada com sucesso!', type: 'success' });
      setTimeout(() => navigation.goBack(), 800);

    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      setSnackbar({ visible: true, message: 'Erro ao atualizar turma. Tente novamente.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    // Exclusão direta com feedback. Em produção, pode-se reintroduzir um Dialog de confirmação.
    (async () => {
      try {
        setLoading(true);
        const academiaId = userProfile?.academiaId || academia?.id;
        if (!academiaId) {
          throw new Error(getString('academyIdNotFound'));
        }

        await academyFirestoreService.delete('classes', classId, academiaId);
        setSnackbar({ visible: true, message: 'Turma excluída com sucesso!', type: 'success' });
        setTimeout(() => navigation.goBack(), 800);
      } catch (error) {
        console.error('Erro ao excluir turma:', error);
        setSnackbar({ visible: true, message: 'Não foi possível excluir a turma.', type: 'error' });
      } finally {
        setLoading(false);
      }
    })();
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro quando o usuário começa a digitar
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleInstructorChange = (instructorId: string) => {
    const instructor = instructors.find((i: any) => i.id === instructorId);
    updateFormData('instructorId', instructorId);
    updateFormData('instructorName', instructor ? instructor.name : '');
  };

  if (loadingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando dados da turma...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Editar Turma</Text>

            {/* Nome da Turma */}
            <TextInput
              label="Nome da Turma"
              value={formData.name}
              onChangeText={(value: any) => updateFormData('name', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
            />
            {errors.name && <HelperText type="error">{errors.name}</HelperText>}

            {/* Modalidade */}
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Modalidade</Text>
              <View style={styles.chipContainer}>
                {modalities.length === 0 && (
                  <Text style={{ color: COLORS.text.secondary }}>Nenhuma modalidade cadastrada</Text>
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
              <Text style={styles.label}>Categoria por Idade</Text>
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
              label="Descrição (opcional)"
              value={formData.description}
              onChangeText={(value: any) => updateFormData('description', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            {/* Máximo de Alunos */}
            <TextInput
              label="Máximo de Alunos"
              value={formData.maxStudents}
              onChangeText={(value: any) => updateFormData('maxStudents', value)}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              error={!!errors.maxStudents}
            />
            {errors.maxStudents && <HelperText type="error">{errors.maxStudents}</HelperText>}

            {/* Instrutor */}
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Instrutor</Text>
              <View style={styles.chipContainer}>
                {instructors.length === 0 && (
                  <Text style={{ color: COLORS.text.secondary }}>Nenhum instrutor encontrado</Text>
                )}
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
              {errors.instructorId && <HelperText type="error">{errors.instructorId}</HelperText>}
            </View>

            {/* Horário */}
            <TextInput
              label="Horário (ex: Segunda-feira 08:00-09:00)"
              value={formData.schedule}
              onChangeText={(value: any) => updateFormData('schedule', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.schedule}
            />
            {errors.schedule && <HelperText type="error">{errors.schedule}</HelperText>}

            {/* Preço */}
            <TextInput
              label="Preço Mensal (R$)"
              value={formData.price}
              onChangeText={(value: any) => updateFormData('price', value)}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              error={!!errors.price}
            />
            {errors.price && <HelperText type="error">{errors.price}</HelperText>}

            {/* Status */}
            <View style={styles.radioContainer}>
              <Text style={styles.label}>Status</Text>
              <RadioButton.Group
                onValueChange={(value: any) => updateFormData('status', value)}
                value={formData.status}
              >
                <View style={styles.radioItem}>
                  <RadioButton value="active" />
                  <Text style={styles.radioLabel}>Ativa</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="inactive" />
                  <Text style={styles.radioLabel}>Inativa</Text>
                </View>
              </RadioButton.Group>
            </View>

            {/* Botões */}
            <ActionButtonGroup style={styles.buttonContainer}>
              <ActionButton
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.button}
                disabled={loading}
                variant="secondary"
              >
                Cancelar
              </ActionButton>
              <ActionButton
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                loading={loading}
                disabled={loading || modalities.length === 0}
                variant="success"
              >
                Salvar
              </ActionButton>
            </ActionButtonGroup>

            {/* Botão Excluir */}
            <ActionButton
              mode="outlined"
              onPress={handleDelete}
              style={[styles.deleteButton, { marginTop: 20 }]}
              disabled={loading}
              variant="danger"
            >
              Excluir Turma
            </ActionButton>
          </Card.Content>
        </Card>
      </ScrollView>
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
        duration={2500}
      >
        {snackbar.message}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 20,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700' as const,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500' as const,
    marginBottom: SPACING.sm,
    color: COLORS.text.primary,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: SPACING.sm,
  },
  picker: {
    borderWidth: BORDER_WIDTH.base,
    borderColor: COLORS.gray[400],
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.white,
  },
  pickerStyle: {
    height: 50,
  },
  radioContainer: {
    marginBottom: 20,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: FONT_SIZE.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  deleteButton: {
    borderColor: COLORS.error[700],
  },
  helperTip: {
    marginTop: -4,
    marginBottom: SPACING.md,
    color: COLORS.text.secondary,
    fontSize: FONT_SIZE.sm,
  },
});

export default EditClassScreen;
