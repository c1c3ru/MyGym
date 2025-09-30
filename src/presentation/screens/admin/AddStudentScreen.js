import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Card,
  Text,
  Button,
  Title,
  TextInput,
  HelperText,
  RadioButton,
  Snackbar,
  ActivityIndicator,
  Banner,
  Chip,
  Divider
} from 'react-native-paper';
import { useAuth } from '@contexts/AuthProvider';
import { academyFirestoreService } from '@services/academyFirestoreService';
import { refreshManager } from '@utils/refreshManager';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import { useFormValidation } from '@hooks/useFormValidation';
import { useStudentCreationRateLimit } from '@hooks/useRateLimit';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import cacheService, { CACHE_KEYS } from '@services/cacheService';
import { formValidator, commonSchemas } from '@utils/formValidation';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const AddStudentScreen = ({ navigation, route }) => {
  const { user, userProfile, academia } = useAuth();
  const [loading, setLoading] = useState(false);

  // Analytics tracking
  useScreenTracking('AddStudentScreen', { 
    academiaId: userProfile?.academiaId,
    userType: userProfile?.userType 
  });
  const { trackButtonClick, trackFormSubmission, trackFeatureUsage } = useUserActionTracking();
  const { executeWithLimit: executeStudentCreation } = useStudentCreationRateLimit();
  
  // Feedback states
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'info' // 'success', 'error', 'info'
  });
  const [showValidationBanner, setShowValidationBanner] = useState(false);
  
  // Classes data
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  
  // Enhanced form validation
  const studentValidationSchema = {
    name: ['required', 'minLength:2'],
    email: ['required', 'email'],
    phone: ['required', 'minLength:10'],
    birthDate: ['required'],
    emergencyContact: ['required', 'minLength:2'],
    emergencyPhone: ['required', 'minLength:10'],
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
  );

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
        showSnackbar('Nenhuma turma encontrada. Crie turmas primeiro para associar alunos.', 'info');
      }
      
      trackFeatureUsage('classes_loaded_for_student', {
        classesCount: classes.length,
        academiaId: userProfile.academiaId
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar turmas:', error);
      showSnackbar('Erro ao carregar turmas disponíveis', 'error');
    } finally {
      setLoadingClasses(false);
    }
  }, [userProfile?.academiaId, trackFeatureUsage]);

  const toggleClassSelection = useCallback((classId) => {
    setSelectedClasses(prev => {
      const isSelected = prev.includes(classId);
      const newSelection = isSelected 
        ? prev.filter(id => id !== classId)
        : [...prev, classId];
      
      // Feedback visual
      const className = availableClasses.find(c => c.id === classId)?.name || 'Turma';
      if (isSelected) {
        showSnackbar(`${className} removida da seleção`, 'info');
        trackButtonClick('remove_class_selection', { classId, className });
      } else {
        showSnackbar(`${className} adicionada à seleção`, 'success');
        trackButtonClick('add_class_selection', { classId, className });
      }
      
      return newSelection;
    });
  }, [availableClasses, trackButtonClick]);

  const showSnackbar = (message, type = 'info') => {
    setSnackbar({
      visible: true,
      message,
      type
    });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, visible: false }));
  };

  // Form validation is now handled by useFormValidation hook

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

        const studentData = {
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
          createdBy: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
          graduations: [],
          currentGraduation: null,
          classIds: selectedClasses
        };

        const academiaId = userProfile?.academiaId || academia?.id;
        if (!academiaId) {
          throw new Error('Academia ID não encontrado');
        }
        
        studentData.academiaId = academiaId;
        
        console.log('✅ Criando aluno na academia:', academiaId, studentData);
        const newStudentId = await academyFirestoreService.create('students', studentData, academiaId);
        console.log('✅ Aluno criado com ID:', newStudentId);
        
        // Invalidar cache de estudantes
        await cacheService.invalidatePattern(`students:${academiaId}`);
        
        // Track analytics
        trackFormSubmission('student_creation', {
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

      } catch (error) {
        console.error('❌ Erro ao cadastrar aluno:', error);
        
        let errorMessage = 'Não foi possível cadastrar o aluno. Tente novamente.';
        
        if (error.code === 'permission-denied') {
          errorMessage = 'Você não tem permissão para cadastrar alunos.';
        } else if (error.code === 'network-request-failed') {
          errorMessage = 'Erro de conexão. Verifique sua internet.';
        } else if (error.message?.includes('email')) {
          errorMessage = 'Este email já está em uso.';
        }
        
        trackFormSubmission('student_creation', {
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
  }, [validateForm, executeStudentCreation, formData, selectedClasses, user.uid, userProfile?.academiaId, academia?.id, trackFormSubmission, route.params, resetForm, navigation]);

  // Form field handlers with enhanced validation
  const handleFieldChange = useCallback((field, value) => {
    setFieldValue(field, value);
    
    // Hide validation banner if no more errors
    if (!hasErrors()) {
      setShowValidationBanner(false);
    }
  }, [setFieldValue, hasErrors]);

  const handleFieldBlur = useCallback((field) => {
    setFieldTouched(field, true);
  }, [setFieldTouched]);

  return (
    <EnhancedErrorBoundary
      onError={(error, errorInfo, errorId) => {
        console.error('🚨 Erro no AddStudentScreen:', { error, errorInfo, errorId });
      }}
      errorContext={{ screen: 'AddStudentScreen', academiaId: userProfile?.academiaId }}
    >
      <SafeAreaView style={styles.container}>
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
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Cadastrando aluno...</Text>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Novo Aluno</Title>

            {/* Dados Pessoais */}
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>

            <TextInput
              label="Nome Completo *"
              {...getFieldProps('name')}
              onChangeText={(value) => handleFieldChange('name', value)}
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
              onChangeText={(value) => handleFieldChange('email', value)}
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
              onChangeText={(value) => updateFormData('phone', value)}
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
              onChangeText={(value) => updateFormData('birthDate', value)}
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
              onValueChange={(value) => handleFieldChange('sexo', value)} 
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
              onChangeText={(value) => updateFormData('address', value)}
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
              onChangeText={(value) => updateFormData('emergencyContact', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.emergencyContact}
              left={<TextInput.Icon icon="account-heart" />}
            />
            {errors.emergencyContact && <HelperText type="error">{errors.emergencyContact}</HelperText>}

            <TextInput
              label="Telefone de Emergência *"
              value={formData.emergencyPhone}
              onChangeText={(value) => updateFormData('emergencyPhone', value)}
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
              onChangeText={(value) => updateFormData('medicalConditions', value)}
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
              onChangeText={(value) => updateFormData('goals', value)}
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
              {loadingClasses && <ActivityIndicator size="small" color="COLORS.info[500]" />}
            </View>
            <Text style={styles.sectionSubtitle}>
              Selecione as turmas que o aluno irá participar (opcional)
            </Text>
            
            {loadingClasses ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="COLORS.info[500]" />
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
              <Text style={styles.label}>Status</Text>
              <RadioButton.Group
                onValueChange={(value) => updateFormData('status', value)}
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
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={[styles.button, loading && styles.buttonLoading]}
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
      </SafeAreaView>
    </EnhancedErrorBoundary>
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
  card: {
    marginBottom: 20,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 20,
    marginBottom: 16,
    color: COLORS.text.primary,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: 16,
  },
  classesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  classChip: {
    marginBottom: SPACING.sm,
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
    marginTop: 20,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
  },
  selectedClassesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.info[50],
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  selectedClassesInfo: {
    fontSize: FONT_SIZE.base,
    color: COLORS.info[700],
    fontWeight: FONT_WEIGHT.medium,
    flex: 1,
  },
  clearButton: {
    marginLeft: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    marginVertical: 16,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  noClassesSubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: 16,
  },
  retryButton: {
    marginTop: SPACING.sm,
  },
  input: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: SPACING.sm,
    color: COLORS.text.primary,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
    color: COLORS.text.primary,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    marginTop: SPACING.sm,
    paddingHorizontal: 16,
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
    marginTop: 30,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  snackbar: {
    marginBottom: 16,
  },
  snackbarSuccess: {
    backgroundColor: COLORS.primary[500],
  },
  snackbarError: {
    backgroundColor: COLORS.error[500],
  },
  validationBanner: {
    backgroundColor: COLORS.error[50],
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.medium,
  },
  snackbar: {
    marginBottom: 16,
  },
  snackbarSuccess: {
    backgroundColor: COLORS.primary[500],
  },
  snackbarError: {
    backgroundColor: COLORS.error[500],
  },
});

export default AddStudentScreen;
