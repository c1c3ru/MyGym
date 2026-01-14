import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Text,
  Button,
  TextInput,
  HelperText,
  Snackbar,
  Chip,
  Divider,
  Surface,
  Menu,
  RadioButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import { firestoreService } from '@infrastructure/services/firestoreService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import type { NavigationProp, RouteProp } from '@react-navigation/native';


interface Injury {
  id?: string;
  userId: string;
  bodyPart: string;
  injuryType: string;
  description: string;
  severity: string;
  dateOccurred: any; // Firestore Timestamp ou Date
  status: string;
  treatment: string;
  doctorNotes: string;
  expectedRecovery: string;
  restrictions: string;
  updatedAt: Date;
  createdAt?: Date;
  createdBy?: string;
}

interface InjuryFormData {
  bodyPart: string;
  injuryType: string;
  description: string;
  severity: string;
  dateOccurred: Date;
  status: string;
  treatment: string;
  doctorNotes: string;
  expectedRecovery: string;
  restrictions: string;
}

interface InjuryScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}

const InjuryScreen = ({ navigation, route }: InjuryScreenProps) => {
  const { user, academia } = useAuth();
  const { getString } = useTheme();
  const { injury, isEditing = false } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });

  const [formData, setFormData] = useState<InjuryFormData>({
    bodyPart: '',
    injuryType: '',
    description: '',
    severity: 'leve',
    dateOccurred: new Date(),
    status: 'ativo',
    treatment: '',
    doctorNotes: '',
    expectedRecovery: '',
    restrictions: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof InjuryFormData, string>>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bodyPartMenuVisible, setBodyPartMenuVisible] = useState(false);
  const [injuryTypeMenuVisible, setInjuryTypeMenuVisible] = useState(false);

  const bodyParts = [
    'Cabeça', 'Pescoço', 'Ombro Direito', 'Ombro Esquerdo',
    'Braço Direito', 'Braço Esquerdo', 'Cotovelo Direito', 'Cotovelo Esquerdo',
    'Antebraço Direito', 'Antebraço Esquerdo', 'Punho Direito', 'Punho Esquerdo',
    'Mão Direita', 'Mão Esquerda', 'Dedos da Mão', 'Tórax', 'Costelas',
    'Coluna Cervical', 'Coluna Torácica', 'Coluna Lombar', 'Quadril',
    'Coxa Direita', 'Coxa Esquerda', 'Joelho Direito', 'Joelho Esquerdo',
    'Canela Direita', 'Canela Esquerda', 'Tornozelo Direito', 'Tornozelo Esquerdo',
    'Pé Direito', 'Pé Esquerdo', 'Dedos do Pé'
  ];

  const injuryTypes = [
    'Contusão', 'Entorse', 'Distensão Muscular', 'Estiramento',
    'Luxação', 'Fratura', 'Corte', 'Arranhão', 'Queimadura',
    'Tendinite', 'Bursite', 'Lesão Ligamentar', 'Lesão Meniscal',
    'Hérnia de Disco', 'Fascite Plantar', 'Dor Muscular', 'Cãibra',
    'Inflamação', 'Outros'
  ];

  const severityLevels = [
    { value: 'leve', label: getString('mild'), color: COLORS.primary[500], description: 'Desconforto mínimo, sem limitação' },
    { value: 'moderada', label: getString('moderate'), color: COLORS.warning[500], description: 'Dor perceptível, limitação parcial' },
    { value: 'grave', label: getString('severe'), color: COLORS.error[500], description: 'Dor intensa, limitação significativa' }
  ];

  const statusOptions = [
    { value: 'ativo', label: getString('active'), color: COLORS.error[500], description: 'Lesão atual em tratamento' },
    { value: 'recuperando', label: getString('recovering'), color: COLORS.warning[500], description: 'Em processo de recuperação' },
    { value: 'recuperado', label: getString('recovered'), color: COLORS.primary[500], description: 'Totalmente recuperado' },
    { value: 'cronico', label: 'Crônico', color: COLORS.secondary[500], description: 'Condição permanente ou recorrente' }
  ];

  useEffect(() => {
    if (isEditing && injury) {
      setFormData({
        bodyPart: injury.bodyPart || '',
        injuryType: injury.injuryType || '',
        description: injury.description || '',
        severity: injury.severity || 'leve',
        dateOccurred: injury.dateOccurred?.toDate ? injury.dateOccurred.toDate() : new Date(injury.dateOccurred || Date.now()),
        status: injury.status || 'ativo',
        treatment: injury.treatment || '',
        doctorNotes: injury.doctorNotes || '',
        expectedRecovery: injury.expectedRecovery || '',
        restrictions: injury.restrictions || ''
      });
    }
  }, [isEditing, injury]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof InjuryFormData, string>> = {};

    if (!formData.bodyPart.trim()) {
      newErrors.bodyPart = 'Parte do corpo é obrigatória';
    }

    if (!formData.injuryType.trim()) {
      newErrors.injuryType = 'Tipo de lesão é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Descrição deve ter pelo menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const injuryData: Injury = {
        userId: user.id,
        bodyPart: formData.bodyPart.trim(),
        injuryType: formData.injuryType.trim(),
        description: formData.description.trim(),
        severity: formData.severity,
        dateOccurred: formData.dateOccurred,
        status: formData.status,
        treatment: formData.treatment.trim(),
        doctorNotes: formData.doctorNotes.trim(),
        expectedRecovery: formData.expectedRecovery.trim(),
        restrictions: formData.restrictions.trim(),
        updatedAt: new Date()
      };

      if (isEditing && injury) {
        await firestoreService.update(
          `gyms/${academia.id}/injuries`,
          injury.id,
          injuryData
        );
        setSnackbar({
          visible: true,
          message: 'Lesão atualizada com sucesso! 🎉',
          type: 'success'
        });
      } else {
        injuryData.createdAt = new Date();
        injuryData.createdBy = user.id;
        await firestoreService.create(
          `gyms/${academia.id}/injuries`,
          injuryData
        );
        setSnackbar({
          visible: true,
          message: 'Lesão registrada com sucesso! 🎉',
          type: 'success'
        });
      }

      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Erro ao salvar lesão:', error);
      setSnackbar({
        visible: true,
        message: 'Erro ao salvar lesão. Tente novamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof InjuryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const getSeverityColor = (severity: string) => {
    return severityLevels.find(s => s.value === severity)?.color || COLORS.gray[500];
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || COLORS.gray[500];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerSection}>
              <Ionicons name="bandage-outline" size={32} color={COLORS.error[500]} />
              <Text style={styles.title}>
                {isEditing ? 'Editar Lesão' : 'Registrar Nova Lesão'}
              </Text>
              <Text style={styles.subtitle}>
                Registre detalhes sobre lesões para acompanhamento médico
              </Text>
            </View>

            {/* Dados Básicos */}
            <Text style={styles.sectionTitle}>🩹 Informações da Lesão</Text>

            {/* Parte do Corpo */}
            <Menu
              visible={bodyPartMenuVisible}
              onDismiss={() => setBodyPartMenuVisible(false)}
              anchor={
                <TextInput
                  label="Parte do Corpo Afetada *"
                  value={formData.bodyPart}
                  mode="outlined"
                  style={styles.input}
                  right={<TextInput.Icon icon="chevron-down" onPress={() => setBodyPartMenuVisible(true)} />}
                  onPress={() => setBodyPartMenuVisible(true)}
                  editable={false}
                  error={!!errors.bodyPart}
                />
              }
            >
              <ScrollView style={styles.menuScrollView}>
                {bodyParts.map((part) => (
                  <Menu.Item
                    key={part}
                    onPress={() => {
                      updateFormData('bodyPart', part);
                      setBodyPartMenuVisible(false);
                    }}
                    title={part}
                  />
                ))}
              </ScrollView>
            </Menu>
            {errors.bodyPart && <HelperText type="error">{errors.bodyPart}</HelperText>}

            {/* Tipo de Lesão */}
            <Menu
              visible={injuryTypeMenuVisible}
              onDismiss={() => setInjuryTypeMenuVisible(false)}
              anchor={
                <TextInput
                  label="Tipo de Lesão *"
                  value={formData.injuryType}
                  mode="outlined"
                  style={styles.input}
                  right={<TextInput.Icon icon="chevron-down" onPress={() => setInjuryTypeMenuVisible(true)} />}
                  onPress={() => setInjuryTypeMenuVisible(true)}
                  editable={false}
                  error={!!errors.injuryType}
                />
              }
            >
              <ScrollView style={styles.menuScrollView}>
                {injuryTypes.map((type) => (
                  <Menu.Item
                    key={type}
                    onPress={() => {
                      updateFormData('injuryType', type);
                      setInjuryTypeMenuVisible(false);
                    }}
                    title={type}
                  />
                ))}
              </ScrollView>
            </Menu>
            {errors.injuryType && <HelperText type="error">{errors.injuryType}</HelperText>}

            {/* Descrição */}
            <TextInput
              label="Descrição Detalhada *"
              value={formData.description}
              onChangeText={(value: any) => updateFormData('description', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              error={!!errors.description}
              placeholder="Descreva como a lesão ocorreu, sintomas, etc."
            />
            {errors.description && <HelperText type="error">{errors.description}</HelperText>}

            {/* Data da Lesão */}
            <TextInput
              label="injuryDate"
              value={formData.dateOccurred.toLocaleDateString('pt-BR')}
              mode="outlined"
              style={styles.input}
              right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
              onPress={() => setShowDatePicker(true)}
              editable={false}
            />

            {showDatePicker && (
              <DateTimePicker
                value={formData.dateOccurred}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    updateFormData('dateOccurred', selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
            )}

            <Divider style={styles.divider} />

            {/* Severidade */}
            <Text style={styles.sectionTitle}>⚠️ Severidade</Text>
            <RadioButton.Group
              onValueChange={(value: any) => updateFormData('severity', value)}
              value={formData.severity}
            >
              {severityLevels.map((level) => (
                <View key={level.value} style={styles.radioItem}>
                  <RadioButton.Item
                    label={level.label}
                    value={level.value}
                    labelStyle={{ color: level.color, fontWeight: FONT_WEIGHT.bold }}
                  />
                  <Text style={styles.radioDescription}>{level.description}</Text>
                </View>
              ))}
            </RadioButton.Group>

            <Divider style={styles.divider} />

            {/* Status */}
            <Text style={styles.sectionTitle}>📊 Status da Lesão</Text>
            <RadioButton.Group
              onValueChange={(value: any) => updateFormData('status', value)}
              value={formData.status}
            >
              {statusOptions.map((option) => (
                <View key={option.value} style={styles.radioItem}>
                  <RadioButton.Item
                    label={option.label}
                    value={option.value}
                    labelStyle={{ color: option.color, fontWeight: FONT_WEIGHT.bold }}
                  />
                  <Text style={styles.radioDescription}>{option.description}</Text>
                </View>
              ))}
            </RadioButton.Group>

            <Divider style={styles.divider} />

            {/* Informações de Tratamento */}
            <Text style={styles.sectionTitle}>🏥 Tratamento e Observações</Text>

            <TextInput
              label="Tratamento Atual (opcional)"
              value={formData.treatment}
              onChangeText={(value: any) => updateFormData('treatment', value)}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              placeholder="Ex: Fisioterapia, medicamentos, repouso..."
            />

            <TextInput
              label="Observações Médicas (opcional)"
              value={formData.doctorNotes}
              onChangeText={(value: any) => updateFormData('doctorNotes', value)}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              placeholder="Instruções do médico, diagnóstico..."
            />

            <TextInput
              label="Previsão de Recuperação (opcional)"
              value={formData.expectedRecovery}
              onChangeText={(value: any) => updateFormData('expectedRecovery', value)}
              mode="outlined"
              style={styles.input}
              placeholder="Ex: 2 semanas, 1 mês..."
            />

            <TextInput
              label="Restrições de Atividade (opcional)"
              value={formData.restrictions}
              onChangeText={(value: any) => updateFormData('restrictions', value)}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              placeholder="Ex: Não fazer força com o braço, evitar corrida..."
            />

            {/* Resumo Visual */}
            <Surface style={styles.summaryContainer}>
              <View style={styles.summaryHeader}>
                <Ionicons name="information-circle-outline" size={24} color={COLORS.info[500]} />
                <Text style={styles.summaryTitle}>Resumo da Lesão</Text>
              </View>
              <View style={styles.summaryContent}>
                <Chip
                  mode="flat"
                  style={[styles.summaryChip, { backgroundColor: getSeverityColor(formData.severity) }]}
                  textStyle={{ color: COLORS.white, fontWeight: FONT_WEIGHT.bold }}
                >
                  {severityLevels.find(s => s.value === formData.severity)?.label}
                </Chip>
                <Chip
                  mode="flat"
                  style={[styles.summaryChip, { backgroundColor: getStatusColor(formData.status) }]}
                  textStyle={{ color: COLORS.white, fontWeight: FONT_WEIGHT.bold }}
                >
                  {statusOptions.find(s => s.value === formData.status)?.label}
                </Chip>
              </View>
            </Surface>

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
                onPress={handleSave}
                style={styles.button}
                loading={loading}
                disabled={loading}
              >
                {isEditing ? getString('update') : 'Registrar'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={snackbar.type === 'success' ? 3000 : 5000}
        style={{
          backgroundColor: snackbar.type === 'success' ? COLORS.primary[500] : COLORS.error[500]
        }}
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
    padding: SPACING.md,
  },
  card: {
    marginBottom: SPACING.md,
    elevation: 4,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    color: COLORS.black,
  },
  input: {
    marginBottom: SPACING.sm,
  },
  menuScrollView: {
    maxHeight: 200,
  },
  divider: {
    marginVertical: 16,
  },
  radioItem: {
    marginBottom: SPACING.sm,
  },
  radioDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    marginLeft: 32,
    marginTop: -8,
    marginBottom: SPACING.sm,
  },
  summaryContainer: {
    padding: SPACING.md,
    marginVertical: 16,
    borderRadius: BORDER_RADIUS.md,
    elevation: 2,
    backgroundColor: COLORS.info[50],
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  summaryTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    marginLeft: SPACING.sm,
    color: COLORS.info[700],
  },
  summaryContent: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  summaryChip: {
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  button: {
    flex: 1,
  },
});

export default InjuryScreen;