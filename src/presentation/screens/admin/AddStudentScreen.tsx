import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import {
  Card,
  Text,
  Button,
  TextInput,
  HelperText,
  RadioButton,
  Snackbar,
  ActivityIndicator,
  Banner,
  Chip,
  Divider
} from 'react-native-paper';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import { refreshManager } from '@utils/refreshManager';
import type { NavigationProp } from '@react-navigation/native';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import { useFormValidation } from '@hooks/useFormValidation';
import { useStudentCreationRateLimit } from '@hooks/useRateLimit';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import cacheService, { CACHE_KEYS } from '@infrastructure/services/cacheService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import { useTheme } from "@contexts/ThemeContext";

interface AddStudentScreenProps {
  navigation: NavigationProp<any>;
  route?: any;
}

const AddStudentScreen = ({ navigation, route }: AddStudentScreenProps) => {
  const { getString } = useTheme();
  const { currentTheme } = useThemeToggle();

  const { user, userProfile, academia } = useAuthFacade();
  const [loading, setLoading] = useState(false);

  // Analytics tracking
  useScreenTracking('AddStudentScreen', {
    academiaId: userProfile?.academiaId,
    userType: userProfile?.userType
  });
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();
  const { executeWithLimit: executeStudentCreation } = useStudentCreationRateLimit();

  // Feedback states
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'info' // 'success', 'error', 'info'
  });
  const [showValidationBanner, setShowValidationBanner] = useState(false);

  // Classes data
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Enhanced form validation
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
    clearErrors,
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
    {
      validateOnChange: true,
      validateOnBlur: true,
      debounceMs: 300
    }
  ) as any;

  // Carregar turmas disponíveis
  useEffect(() => {
    loadAvailableClasses();
  }, [userProfile?.academiaId]);

  const loadAvailableClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);
      if (!userProfile?.academiaId) return;

      // Usar cache para turmas disponíveis
      const cacheKey = CACHE_KEYS.CLASSES(userProfile.academiaId);
      const classes = await cacheService.get(cacheKey) ||
        await academyFirestoreService.getAll('classes', userProfile.academiaId);

      console.log('📚 Turmas disponíveis carregadas:', classes.length);
      setAvailableClasses(classes);

      if (classes.length === 0) {
        setSnackbar({
          visible: true,
          message: 'Nenhuma turma encontrada. Crie turmas primeiro para associar alunos.',
          type: 'info'
        });
      }

      trackFeatureUsage('classes_loaded_for_student', {
        classesCount: classes.length,
        academiaId: userProfile.academiaId
      });

    } catch (error) {
      console.error('❌ Erro ao carregar turmas:', error);
      setSnackbar({
        visible: true,
        message: 'Erro ao carregar turmas disponíveis',
        type: 'error'
      });
    } finally {
      setLoadingClasses(false);
    }
  }, [userProfile?.academiaId, trackFeatureUsage]);

  const toggleClassSelection = useCallback((classId: string) => {
    const isCurrentlySelected = selectedClasses.includes(classId);
    const className = availableClasses.find(c => c.id === classId)?.name || 'Turma';

    setSelectedClasses(prev => {
      const isSelected = prev.includes(classId);
      return isSelected
        ? prev.filter(id => id !== classId)
        : [...prev, classId];
    });

    // Feedback visual e analytics fora do setState
    if (isCurrentlySelected) {
      trackButtonClick('remove_class_selection', { classId, className });
    } else {
      trackButtonClick('add_class_selection', { classId, className });
    }
  }, [selectedClasses, availableClasses, trackButtonClick]);

  const showSnackbar = (message: string, type: string = 'info') => {
    setSnackbar({
      visible: true,
      message,
      type
    });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, visible: false }));
  };

  const handleSubmit = useCallback(async () => {
    const isValid = await validateForm();
    if (!isValid) {
      setShowValidationBanner(true);
      showSnackbar('Por favor, preencha todos os campos obrigatórios', 'error');
      return;
    }

    const result = await executeStudentCreation(async () => {
      try {
        setLoading(true);

        if (!user?.id) {
          throw new Error('Usuário não autenticado');
        }

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
          isActive: true,
          createdBy: user!.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          graduations: [],
          currentGraduation: null,
          classIds: selectedClasses
        };

        const academiaId = userProfile?.academiaId || academia?.id;
        if (!academiaId) {
          throw new Error(getString('academyIdNotFound'));
        }

        studentData.academiaId = academiaId;

        console.log('✅ Criando aluno na academia:', academiaId, studentData);
        const newStudentId = await academyFirestoreService.create('students', studentData, academiaId);
        console.log('✅ Aluno criado com ID:', newStudentId);

        // Invalidar cache de estudantes
        await cacheService.invalidatePattern(`students:${academiaId}`);

        // Track analytics
        trackFeatureUsage('student_creation_submit', {
          success: true,
          academiaId,
          classesSelected: selectedClasses.length,
          hasEmergencyContact: !!studentData.emergencyContact,
          hasMedicalConditions: !!studentData.medicalConditions
        });

        showSnackbar(`Aluno "${formData.name.trim()}" cadastrado com sucesso!`, 'success');

        // Notificar outras telas
        if (route.params?.onStudentAdded) {
          route.params.onStudentAdded({
            id: newStudentId,
            ...studentData
          });
        }

        refreshManager.refreshStudents({
          id: newStudentId,
          ...studentData
        });

        // Limpar formulário após sucesso
        setTimeout(() => {
          resetForm();
          setSelectedClasses([]);
          navigation.goBack();
        }, 2000);

      } catch (error: any) {
        console.error('❌ Erro ao cadastrar aluno:', error);

        let errorMessage = 'Não foi possível cadastrar o aluno. Tente novamente.';

        if (error.code === 'permission-denied') {
          errorMessage = 'Você não tem permissão para cadastrar alunos.';
        } else if (error.code === 'network-request-failed') {
          errorMessage = 'Erro de conexão. Verifique sua internet.';
        } else if (error.message?.includes('email')) {
          errorMessage = 'Este email já está em uso.';
        }

        trackFeatureUsage('student_creation_failed', {
          success: false,
          error: error.message,
          academiaId: userProfile?.academiaId
        });

        showSnackbar(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    });

    if (result.blocked) {
      Alert.alert('Ação Bloqueada', 'Muitas criações de aluno. Aguarde alguns minutos.');
    }
  }, [validateForm, executeStudentCreation, formData, selectedClasses, user?.id, userProfile?.academiaId, academia?.id, trackFeatureUsage, route.params, resetForm, navigation]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFieldValue(field, value);

    // Hide validation banner if no more errors
    if (!hasErrors()) {
      setShowValidationBanner(false);
    }
  }, [setFieldValue, hasErrors]);

  const handleFieldBlur = useCallback((field: string) => {
    setFieldTouched(field, true);
  }, [setFieldTouched]);

  const updateFormData = useCallback((field: string, value: any) => {
    setFieldValue(field, value);
  }, [setFieldValue]);

  return (
    <EnhancedErrorBoundary
      onError={(error: any, errorInfo: any, errorId: any) => {
        console.error('🚨 Erro no AddStudentScreen:', { error, errorInfo, errorId });
      }}
      errorContext={{ screen: 'AddStudentScreen', academiaId: userProfile?.academiaId }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {/* Banner de validação */}
          <Banner
            visible={showValidationBanner}
            actions={[
              {
                label: 'OK',
                onPress: () => setShowValidationBanner(false),
              },
            ]}
            icon="alert-circle"
            style={styles.validationBanner}
          >
            Preencha todos os campos obrigatórios marcados com *
          </Banner>

          {/* Loading overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary[500]} />
              <Text style={styles.loadingOverlayText}>Cadastrando aluno...</Text>
            </View>
          )}

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>Novo Aluno</Text>

              {/* Dados Pessoais */}
              <Text style={styles.sectionTitle}>Dados Pessoais</Text>

              <TextInput
                label="Nome Completo *"
                {...getFieldProps('name')}
                onChangeText={(value: any) => handleFieldChange('name', value)}
                onBlur={() => handleFieldBlur('name')}
                mode="outlined"
                style={styles.input}
                error={!!(touched.name && errors.name)}
                left={<TextInput.Icon icon="account" />}
              />
              {touched.name && errors.name && <HelperText type="error">{errors.name}</HelperText>}

              <TextInput
                label="Email *"
                {...getFieldProps('email')}
                onChangeText={(value: any) => handleFieldChange('email', value)}
                onBlur={() => handleFieldBlur('email')}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                error={!!(touched.email && errors.email)}
                left={<TextInput.Icon icon="email" />}
              />
              {touched.email && errors.email && <HelperText type="error">{errors.email}</HelperText>}

              <TextInput
                label="Telefone *"
                value={formData.phone}
                onChangeText={(value: any) => updateFormData('phone', value)}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                error={!!errors.phone}
                left={<TextInput.Icon icon="phone" />}
              />
              {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}

              <TextInput
                label="Data de Nascimento (DD/MM/AAAA) *"
                value={formData.birthDate}
                onChangeText={(value: any) => updateFormData('birthDate', value)}
                mode="outlined"
                placeholder="01/01/1990"
                style={styles.input}
                error={!!errors.birthDate}
                left={<TextInput.Icon icon="calendar" />}
              />
              {errors.birthDate && <HelperText type="error">{errors.birthDate}</HelperText>}

              {/* Campo Sexo */}
              <Text style={styles.fieldLabel}>Sexo *</Text>
              <RadioButton.Group
                onValueChange={(value: any) => handleFieldChange('sexo', value)}
                value={formData.sexo}
              >
                <View style={styles.radioContainer}>
                  <View style={styles.radioItem}>
                    <RadioButton value="masculino" />
                    <Text style={styles.radioLabel}>Masculino</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="feminino" />
                    <Text style={styles.radioLabel}>Feminino</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="outro" />
                    <Text style={styles.radioLabel}>Outro</Text>
                  </View>
                </View>
              </RadioButton.Group>
              {touched.sexo && errors.sexo && <HelperText type="error">{errors.sexo}</HelperText>}

              <TextInput
                label="Endereço (opcional)"
                value={formData.address}
                onChangeText={(value: any) => updateFormData('address', value)}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={styles.input}
                left={<TextInput.Icon icon="home" />}
              />

              {/* Contato de Emergência */}
              <Text style={styles.sectionTitle}>Contato de Emergência</Text>

              <TextInput
                label="Nome do Contato *"
                value={formData.emergencyContact}
                onChangeText={(value: any) => updateFormData('emergencyContact', value)}
                mode="outlined"
                style={styles.input}
                error={!!errors.emergencyContact}
                left={<TextInput.Icon icon="account-heart" />}
              />
              {errors.emergencyContact && <HelperText type="error">{errors.emergencyContact}</HelperText>}

              <TextInput
                label="Telefone de Emergência *"
                value={formData.emergencyPhone}
                onChangeText={(value: any) => updateFormData('emergencyPhone', value)}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                error={!!errors.emergencyPhone}
                left={<TextInput.Icon icon="phone-alert" />}
              />
              {errors.emergencyPhone && <HelperText type="error">{errors.emergencyPhone}</HelperText>}

              {/* Informações Médicas */}
              <Text style={styles.sectionTitle}>Informações Médicas</Text>

              <TextInput
                label="Condições Médicas (opcional)"
                value={formData.medicalConditions}
                onChangeText={(value: any) => updateFormData('medicalConditions', value)}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Informe alergias, lesões, medicamentos, etc."
                style={styles.input}
                left={<TextInput.Icon icon="medical-bag" />}
              />

              <TextInput
                label="Objetivos (opcional)"
                value={formData.goals}
                onChangeText={(value: any) => updateFormData('goals', value)}
                mode="outlined"
                multiline
                numberOfLines={2}
                placeholder="Perda de peso, ganho de massa, condicionamento..."
                style={styles.input}
                left={<TextInput.Icon icon="target" />}
              />

              {/* Seleção de Turmas */}
              <Divider style={styles.divider} />
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🎯 Turmas</Text>
                {loadingClasses && <ActivityIndicator size="small" color={COLORS.info[500]} />}
              </View>
              <Text style={styles.sectionSubtitle}>
                Selecione as turmas que o aluno irá participar (opcional)
              </Text>

              {loadingClasses ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.info[500]} />
                  <Text style={styles.loadingText}>Carregando turmas...</Text>
                </View>
              ) : availableClasses.length > 0 ? (
                <>
                  <View style={styles.classesContainer}>
                    {availableClasses.map((classItem) => (
                      <Chip
                        key={classItem.id}
                        selected={selectedClasses.includes(classItem.id)}
                        onPress={() => toggleClassSelection(classItem.id)}
                        style={[
                          styles.classChip,
                          selectedClasses.includes(classItem.id) && styles.selectedChip
                        ]}
                        textStyle={selectedClasses.includes(classItem.id) && styles.selectedChipText}
                        icon={selectedClasses.includes(classItem.id) ? "check-circle" : "plus-circle"}
                      >
                        {classItem.name || `${classItem.modality} - ${classItem.instructorName}`}
                      </Chip>
                    ))}
                  </View>

                  {selectedClasses.length > 0 && (
                    <View style={styles.selectedClassesContainer}>
                      <Text style={styles.selectedClassesInfo}>
                        ✅ {selectedClasses.length} turma{selectedClasses.length !== 1 ? 's' : ''} selecionada{selectedClasses.length !== 1 ? 's' : ''}
                      </Text>
                      <Button
                        mode="text"
                        onPress={() => {
                          setSelectedClasses([]);
                          showSnackbar('Todas as turmas foram desmarcadas', 'info');
                        }}
                        compact
                        style={styles.clearButton}
                      >
                        Limpar seleção
                      </Button>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateIcon}>📚</Text>
                  <Text style={styles.noClassesText}>
                    Nenhuma turma disponível
                  </Text>
                  <Text style={styles.noClassesSubtext}>
                    Crie turmas primeiro para associar alunos
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={loadAvailableClasses}
                    style={styles.retryButton}
                    icon="refresh"
                    compact
                  >
                    Tentar novamente
                  </Button>
                </View>
              )}

              {/* Status */}
              <View style={styles.radioContainer}>
                <Text style={styles.fieldLabel}>Status</Text>
                <RadioButton.Group
                  onValueChange={(value: any) => updateFormData('status', value)}
                  value={formData.status}
                >
                  <View style={styles.radioItem}>
                    <RadioButton value="active" />
                    <Text style={styles.radioLabel}>Ativo</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="inactive" />
                    <Text style={styles.radioLabel}>Inativo</Text>
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
                >Cancelar</Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={[styles.button, loading && styles.buttonLoading]}
                  buttonColor={COLORS.success[500]}
                  loading={loading}
                  disabled={loading}
                  icon={loading ? undefined : "account-plus"}
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar Aluno'}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Snackbar para feedback */}
        <Snackbar
          visible={snackbar.visible}
          onDismiss={hideSnackbar}
          duration={snackbar.type === 'success' ? 2000 : 4000}
          style={[
            styles.snackbar,
            snackbar.type === 'success' && styles.snackbarSuccess,
            snackbar.type === 'error' && styles.snackbarError
          ]}
          action={{
            label: 'Fechar',
            onPress: hideSnackbar,
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
    paddingHorizontal: '4%',
    paddingVertical: SPACING.md,
    paddingBottom: 100, // Espaço extra bottom
    flexGrow: 1,
  },
  card: {
    marginBottom: SPACING.lg,
    width: '100%',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    color: COLORS.black,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  fieldLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: SPACING.sm,
    color: COLORS.text.primary,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: 'transparent',
  },
  classesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    width: '100%',
  },
  classChip: {
    marginBottom: SPACING.sm,
    flexGrow: 0,
    flexShrink: 1,
  },
  selectedChip: {
    backgroundColor: COLORS.info[500],
  },
  selectedChipText: {
    color: COLORS.white,
  },
  noClassesText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
    fontStyle: 'italic',
    textAlign: 'center',
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    width: '100%',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
  },
  selectedClassesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.info[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    width: '100%',
  },
  selectedClassesInfo: {
    fontSize: FONT_SIZE.base,
    color: COLORS.info[700],
    fontWeight: FONT_WEIGHT.medium,
    flex: 1,
  },
  clearButton: {
    marginLeft: SPACING.sm,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    marginVertical: SPACING.md,
    width: '100%',
  },
  emptyStateIcon: {
    fontSize: FONT_SIZE.display,
    marginBottom: SPACING.md,
  },
  noClassesSubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  retryButton: {
    marginTop: SPACING.sm,
  },
  radioContainer: {
    marginBottom: SPACING.lg,
    width: '100%',
    flexDirection: 'row',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  radioLabel: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.md,
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
  },
  buttonLoading: {
    opacity: 0.8,
  },
  validationBanner: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingOverlayText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.lg,
    color: COLORS.primary[500],
    fontWeight: 'bold',
  },
  snackbar: {
    marginBottom: 20,
  },
  snackbarSuccess: {
    backgroundColor: COLORS.success[500],
  },
  snackbarError: {
    backgroundColor: COLORS.error[500],
  }
});

export default AddStudentScreen;
