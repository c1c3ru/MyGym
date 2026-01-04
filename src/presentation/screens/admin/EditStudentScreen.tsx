import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert
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
import { firestoreService } from '@infrastructure/services/firestoreService';
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
  const { getString } = useTheme();
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
      const studentData = await firestoreService.getById(`gyms/${academiaId}/students`, studentId) as any;

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
        Alert.alert(getString('error'), 'Aluno não encontrado');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erro ao carregar aluno:', error);
      Alert.alert(getString('error'), 'Não foi possível carregar os dados do aluno');
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
      newErrors.email = getString('invalidEmail');
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
        sexo: formData.sexo,
        updatedAt: new Date(),
        updatedBy: user.id
      };

      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        throw new Error(getString('academyIdNotFound'));
      }

      // Atualizar aluno na subcoleção da academia
      await firestoreService.update(`gyms/${academiaId}/students`, studentId, studentData);

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
      getString('confirmDelete'),
      'Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.',
      [
        {
          text: getString('cancel'),
          style: 'cancel'
        },
        {
          text: getString('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await firestoreService.delete('users', studentId);

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
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.title, styles.title]}>Editar Aluno</Text>

            {/* Dados Pessoais */}
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>

            <TextInput
              label="Nome Completo"
              value={formData.name}
              onChangeText={(value: any) => updateFormData('name', value)}
              mode="outlined"
              style={styles.input}
              error={!!(errors as any).name}
            />
            {(errors as any).name && <HelperText type="error">{(errors as any).name}</HelperText>}

            <TextInput
              label="email"
              value={formData.email}
              onChangeText={(value: any) => updateFormData('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={!!(errors as any).email}
            />
            {(errors as any).email && <HelperText type="error">{(errors as any).email}</HelperText>}

            <TextInput
              label="Telefone"
              value={formData.phone}
              onChangeText={(value: any) => updateFormData('phone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              error={!!(errors as any).phone}
            />
            {(errors as any).phone && <HelperText type="error">{(errors as any).phone}</HelperText>}

            <TextInput
              label="Data de Nascimento (DD/MM/AAAA)"
              value={formData.birthDate}
              onChangeText={(value: any) => updateFormData('birthDate', value)}
              mode="outlined"
              placeholder="01/01/1990"
              style={styles.input}
              error={!!(errors as any).birthDate}
            />
            {(errors as any).birthDate && <HelperText type="error">{(errors as any).birthDate}</HelperText>}

            <TextInput
              label="Endereço (opcional)"
              value={formData.address}
              onChangeText={(value: any) => updateFormData('address', value)}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
            />

            {/* Contato de Emergência */}
            <Text style={styles.sectionTitle}>Contato de Emergência</Text>

            <TextInput
              label="Nome do Contato"
              value={formData.emergencyContact}
              onChangeText={(value: any) => updateFormData('emergencyContact', value)}
              mode="outlined"
              style={styles.input}
              error={!!(errors as any).emergencyContact}
            />
            {(errors as any).emergencyContact && <HelperText type="error">{(errors as any).emergencyContact}</HelperText>}

            <TextInput
              label="Telefone de Emergência"
              value={formData.emergencyPhone}
              onChangeText={(value: any) => updateFormData('emergencyPhone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              error={!!(errors as any).emergencyPhone}
            />
            {(errors as any).emergencyPhone && <HelperText type="error">{(errors as any).emergencyPhone}</HelperText>}

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
            />

            {/* Status */}
            <View style={styles.radioContainer}>
              <Text style={styles.label}>Status</Text>
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
                <View style={styles.radioItem}>
                  <RadioButton value="suspended" />
                  <Text style={styles.radioLabel}>Suspenso</Text>
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
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={[styles.button, styles.saveButton]}
                loading={loading}
                disabled={loading}
              >
                Salvar
              </Button>
            </View>

            {/* Botão Excluir */}
            <Button
              mode="outlined"
              onPress={handleDelete}
              style={[styles.button, styles.deleteButton]}
              textColor="currentTheme.primary[700]"
              disabled={loading}
            >
              Excluir Aluno
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{
          backgroundColor: snackbarType === 'success' ? COLORS.primary[500] : COLORS.error[500]
        }}
      >
        {snackbarMessage}
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
  loadingText: {
    marginTop: 16,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
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
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700' as const,
    marginTop: 20,
    marginBottom: 16,
    color: COLORS.text.primary,
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
  radioContainer: {
    marginBottom: 20,
    marginTop: 16,
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
    gap: 16,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    borderColor: COLORS.text.secondary,
  },
  saveButton: {
    backgroundColor: COLORS.primary[500],
  },
  deleteButton: {
    borderColor: COLORS.error[700],
    marginTop: 20,
  },
});

export default EditStudentScreen;
