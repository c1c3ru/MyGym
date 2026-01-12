import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import {
  Card,
  Text,
  Button,
  TextInput,
  HelperText,
  RadioButton,
  ActivityIndicator,
  Snackbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';

import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

interface EditStudentScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}

const EditStudentScreen: React.FC<EditStudentScreenProps> = ({ navigation, route }) => {
  const { user, userProfile, academia } = useAuthFacade();
  const { studentId } = route.params as any;
  const { getString, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success'); // 'success' | 'error'

  // Form data
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
    sexo: '' // 'masculino' | 'feminino' | 'outro'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoadingData(true);

      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        throw new Error(getString('academyIdNotFound'));
      }

      // Buscar aluno na subcoleção da academia
      const studentData = await academyFirestoreService.getById('students', studentId, academiaId) as any;

      if (studentData) {
        setFormData({
          name: studentData.name || '',
          email: studentData.email || '',
          phone: studentData.phone || '',
          birthDate: studentData.birthDate || '',
          address: studentData.address || '',
          emergencyContact: studentData.emergencyContact || '',
          emergencyPhone: studentData.emergencyPhone || '',
          medicalConditions: studentData.medicalConditions || '',
          goals: studentData.goals || '',
          status: studentData.status || 'active',
          sexo: studentData.sexo || ''
        });
      } else {
        Alert.alert('Erro', 'Aluno não encontrado');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erro ao carregar aluno:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do aluno');
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.birthDate || (typeof formData.birthDate === 'string' && !formData.birthDate.trim())) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    }

    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Contato de emergência é obrigatório';
    }

    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = 'Telefone de emergência é obrigatório';
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
        isActive: formData.status === 'active',
        sexo: formData.sexo,
        updatedAt: new Date(),
        updatedBy: user?.id
      };

      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        throw new Error(getString('academyIdNotFound'));
      }

      // Atualizar aluno na subcoleção da academia
      await academyFirestoreService.update('students', studentId, studentData, academiaId);

      setSnackbarMessage('Aluno atualizado com sucesso!');
      setSnackbarType('success');
      setSnackbarVisible(true);

      // Navegar de volta após 2 segundos
      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      setSnackbarMessage('Erro ao atualizar aluno. Tente novamente.');
      setSnackbarType('error');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              // Obter ID da academia
              const academiaId = userProfile?.academiaId || academia?.id;
              if (!academiaId) {
                throw new Error(getString('academyIdNotFound'));
              }

              await academyFirestoreService.delete('students', studentId, academiaId);

              setSnackbarMessage('Aluno excluído com sucesso!');
              setSnackbarType('success');
              setSnackbarVisible(true);

              // Navegar de volta após 2 segundos
              setTimeout(() => {
                navigation.goBack();
              }, 2000);
            } catch (error) {
              console.error('Erro ao excluir aluno:', error);
              setSnackbarMessage('Erro ao excluir aluno. Tente novamente.');
              setSnackbarType('error');
              setSnackbarVisible(true);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if ((errors as any)[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: null
      }));
    }
  };

  if (loadingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando dados do aluno...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={getAuthGradient(isDarkMode) as any}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.glassCard}>
            <Text style={styles.title}>{getString('editStudent')}</Text>

            {/* Dados Pessoais */}
            <Text style={styles.sectionTitle}>{getString('personalData')}</Text>

            <TextInput
              label={getString('fullName')}
              value={formData.name}
              onChangeText={(value: any) => updateFormData('name', value)}
              mode="outlined"
              style={styles.input}
              error={!!(errors as any).name}
              theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
            />
            {(errors as any).name && <HelperText type="error">{(errors as any).name}</HelperText>}

            <TextInput
              label={getString('email')}
              value={formData.email}
              onChangeText={(value: any) => updateFormData('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={!!(errors as any).email}
              theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
            />
            {(errors as any).email && <HelperText type="error">{(errors as any).email}</HelperText>}

            <TextInput
              label={getString('phone')}
              value={formData.phone}
              onChangeText={(value: any) => updateFormData('phone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              error={!!(errors as any).phone}
              theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
            />
            {(errors as any).phone && <HelperText type="error">{(errors as any).phone}</HelperText>}

            <TextInput
              label={getString('birthDate')}
              value={formData.birthDate}
              onChangeText={(value: any) => updateFormData('birthDate', value)}
              mode="outlined"
              placeholder="01/01/1990"
              style={styles.input}
              error={!!(errors as any).birthDate}
              theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
            />
            {(errors as any).birthDate && <HelperText type="error">{(errors as any).birthDate}</HelperText>}

            <TextInput
              label={getString('address')}
              value={formData.address}
              onChangeText={(value: any) => updateFormData('address', value)}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
            />

            {/* Contato de Emergência */}
            <Text style={styles.sectionTitle}>{getString('emergencyContact')}</Text>

            <TextInput
              label={getString('contactName')}
              value={formData.emergencyContact}
              onChangeText={(value: any) => updateFormData('emergencyContact', value)}
              mode="outlined"
              style={styles.input}
              error={!!(errors as any).emergencyContact}
              theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
            />
            {(errors as any).emergencyContact && <HelperText type="error">{(errors as any).emergencyContact}</HelperText>}

            <TextInput
              label={getString('emergencyPhone')}
              value={formData.emergencyPhone}
              onChangeText={(value: any) => updateFormData('emergencyPhone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              error={!!(errors as any).emergencyPhone}
              theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
            />
            {(errors as any).emergencyPhone && <HelperText type="error">{(errors as any).emergencyPhone}</HelperText>}

            {/* Informações Médicas */}
            <Text style={styles.sectionTitle}>{getString('medicalInfo')}</Text>

            <TextInput
              label={getString('medicalConditions')}
              value={formData.medicalConditions}
              onChangeText={(value: any) => updateFormData('medicalConditions', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder={getString('medicalConditionsPlaceholder')}
              style={styles.input}
              theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
            />

            <TextInput
              label={getString('goals')}
              value={formData.goals}
              onChangeText={(value: any) => updateFormData('goals', value)}
              mode="outlined"
              multiline
              numberOfLines={2}
              placeholder={getString('goalsPlaceholder')}
              style={styles.input}
              theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
            />

            {/* Status */}
            <View style={styles.radioContainer}>
              <Text style={styles.label}>{getString('status')}</Text>
              <RadioButton.Group
                onValueChange={(value: any) => updateFormData('status', value)}
                value={formData.status}
              >
                <View style={styles.radioItem}>
                  <RadioButton value="active" color={COLORS.primary[500]} />
                  <Text style={styles.radioLabel}>{getString('active')}</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="inactive" color={COLORS.gray[500]} />
                  <Text style={styles.radioLabel}>{getString('inactive')}</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="suspended" color={COLORS.error[500]} />
                  <Text style={styles.radioLabel}>{getString('suspended')}</Text>
                </View>
              </RadioButton.Group>
            </View>

            {/* Botões */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={[styles.button, styles.cancelButton]}
                disabled={loading}
                textColor={COLORS.gray[700]}
              >{getString('cancel')}</Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={[styles.button, styles.saveButton]}
                loading={loading}
                disabled={loading}
              >{getString('save')}</Button>
            </View>

            {/* Botão Excluir */}
            <Button
              mode="outlined"
              onPress={handleDelete}
              style={[styles.button, styles.deleteButton]}
              textColor={COLORS.error[700]}
              disabled={loading}
              icon="trash-can-outline"
            >
              {getString('deleteStudent')}
            </Button>
          </View>
        </ScrollView>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{
            backgroundColor: snackbarType === 'success' ? COLORS.success[500] : COLORS.error[500]
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[500],
  },
  glassCard: {
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        backdropFilter: 'blur(10px)',
      },
    }),
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: 20,
    textAlign: 'center',
    color: COLORS.gray[900],
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 20,
    marginBottom: SPACING.md,
    color: COLORS.primary[700],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    paddingBottom: SPACING.xs,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: SPACING.sm,
    color: COLORS.gray[800],
  },
  radioContainer: {
    marginBottom: 20,
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  radioLabel: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[800],
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
  },
  cancelButton: {
    borderColor: COLORS.gray[500],
  },
  saveButton: {
    backgroundColor: COLORS.primary[500],
  },
  deleteButton: {
    borderColor: COLORS.error[700],
    marginTop: 20,
    borderWidth: 1,
  },
});

export default EditStudentScreen;
