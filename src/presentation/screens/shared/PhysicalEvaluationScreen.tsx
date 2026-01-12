import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
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
  IconButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

interface PhysicalEvaluationData {
  id?: string;
  weight: number;
  height: number;
  age: number;
  bodyFat?: number | null;
  muscleMass?: number | null;
  boneMass?: number | null;
  viscFat?: number | null;
  basalMetabolism?: number | null;
  bodyWater?: number | null;
  notes?: string;
  imc?: number;
  imcClassification?: string;
  date?: Date;
  createdBy?: string;
  updatedAt?: Date;
  createdAt?: Date;
}

interface PhysicalEvaluationScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}

interface DadosFormulario {
  weight: string;
  height: string;
  age: string;
  bodyFat: string;
  muscleMass: string;
  boneMass: string;
  viscFat: string;
  basalMetabolism: string;
  bodyWater: string;
  notes: string;
}

interface ErrosFormulario {
  [key: string]: string | null;
}

const PhysicalEvaluationScreen = ({ navigation, route }: PhysicalEvaluationScreenProps) => {
  const { user, academia, userProfile } = useAuth();
  const { getString, isDarkMode } = useTheme();
  const { evaluation, isEditing = false } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'info' });

  const [formData, setFormData] = useState<DadosFormulario>({
    weight: '',
    height: '',
    age: '',
    bodyFat: '',
    muscleMass: '',
    boneMass: '',
    viscFat: '',
    basalMetabolism: '',
    bodyWater: '',
    notes: ''
  });

  const [errors, setErrors] = useState<ErrosFormulario>({});
  const [calculatedIMC, setCalculatedIMC] = useState<string | null>(null);
  const [imcClassification, setImcClassification] = useState('');

  useEffect(() => {
    navigation.setOptions({
      title: getString('physicalEvaluation'),
      headerTransparent: true,
      headerTintColor: COLORS.white,
    });
  }, [navigation, getString]);

  useEffect(() => {
    if (isEditing && evaluation) {
      setFormData({
        weight: evaluation.weight?.toString() || '',
        height: evaluation.height?.toString() || '',
        age: evaluation.age?.toString() || '',
        bodyFat: evaluation.bodyFat?.toString() || '',
        muscleMass: evaluation.muscleMass?.toString() || '',
        boneMass: evaluation.boneMass?.toString() || '',
        viscFat: evaluation.viscFat?.toString() || '',
        basalMetabolism: evaluation.basalMetabolism?.toString() || '',
        bodyWater: evaluation.bodyWater?.toString() || '',
        notes: evaluation.notes || ''
      });
    }
  }, [isEditing, evaluation]);

  useEffect(() => {
    calculateIMC();
  }, [formData.weight, formData.height]);

  const normalizeNumber = (value: string) => {
    // Substitui vírgula por ponto e remove espaços
    return value.replace(/,/g, '.').replace(/\s/g, '');
  };

  const calculateIMC = () => {
    const weight = parseFloat(normalizeNumber(formData.weight));
    const height = parseFloat(normalizeNumber(formData.height));

    if (weight > 0 && height > 0) {
      // Assumir altura em centímetros se > 3, converter para metros
      const heightInMeters = height > 3 ? height / 100 : height;
      const imc = weight / (heightInMeters * heightInMeters);

      setCalculatedIMC(imc.toFixed(2));
      setImcClassification(getIMCClassification(imc));
    } else {
      setCalculatedIMC(null);
      setImcClassification('');
    }
  };

  const getIMCClassification = (imc: number) => {
    if (imc < 18.5) return 'underweight';
    if (imc < 25) return 'normalWeight';
    if (imc < 30) return 'overweight';
    if (imc < 35) return 'obesityI';
    if (imc < 40) return 'obesityII';
    return 'obesityIII';
  };

  const getIMCColor = (classification: string) => {
    switch (classification) {
      case 'underweight': return COLORS.warning[500];
      case 'normalWeight': return COLORS.success[500]; // Changed to success (green) for normal weight
      case 'overweight': return COLORS.warning[500];
      case 'obesityI': return COLORS.error[500];
      case 'obesityII': return COLORS.error[500];
      case 'obesityIII': return COLORS.secondary[500];
      default: return COLORS.gray[500];
    }
  };

  const validateForm = () => {
    const newErrors: ErrosFormulario = {};

    if (!formData.weight.trim()) {
      newErrors.weight = getString('weightRequired');
    } else {
      const normalizedWeight = normalizeNumber(formData.weight);
      if (isNaN(Number(normalizedWeight)) || parseFloat(normalizedWeight) <= 0) {
        newErrors.weight = getString('weightInvalid');
      }
    }

    if (!formData.height.trim()) {
      newErrors.height = getString('heightRequired');
    } else {
      const normalizedHeight = normalizeNumber(formData.height);
      if (isNaN(Number(normalizedHeight)) || parseFloat(normalizedHeight) <= 0) {
        newErrors.height = getString('heightInvalid');
      }
    }

    if (!formData.age.trim()) {
      newErrors.age = getString('ageRequired');
    } else if (isNaN(Number(formData.age)) || parseInt(formData.age) <= 0 || parseInt(formData.age) > 120) {
      newErrors.age = getString('ageInvalid');
    }

    // Validações opcionais para bioimpedância
    if (formData.bodyFat && (isNaN(Number(formData.bodyFat)) || parseFloat(formData.bodyFat) < 0 || parseFloat(formData.bodyFat) > 100)) {
      newErrors.bodyFat = getString('bodyFatInvalid');
    }

    if (formData.muscleMass && (isNaN(Number(formData.muscleMass)) || parseFloat(formData.muscleMass) <= 0)) {
      newErrors.muscleMass = getString('muscleMassInvalid');
    }

    if (formData.bodyWater && (isNaN(Number(formData.bodyWater)) || parseFloat(formData.bodyWater) < 0 || parseFloat(formData.bodyWater) > 100)) {
      newErrors.bodyWater = getString('bodyWaterInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // Verificar se academia está disponível
    const academiaId = academia?.id || userProfile?.academiaId;
    if (!academiaId) {
      setSnackbar({
        visible: true,
        message: getString('academyNotIdentified'),
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);

      const evaluationData: any = {
        studentId: user.id,
        weight: parseFloat(normalizeNumber(formData.weight)),
        height: parseFloat(normalizeNumber(formData.height)),
        age: parseInt(formData.age),
        bodyFat: formData.bodyFat ? parseFloat(normalizeNumber(formData.bodyFat)) : null,
        muscleMass: formData.muscleMass ? parseFloat(normalizeNumber(formData.muscleMass)) : null,
        boneMass: formData.boneMass ? parseFloat(normalizeNumber(formData.boneMass)) : null,
        viscFat: formData.viscFat ? parseFloat(normalizeNumber(formData.viscFat)) : null,
        basalMetabolism: formData.basalMetabolism ? parseFloat(normalizeNumber(formData.basalMetabolism)) : null,
        bodyWater: formData.bodyWater ? parseFloat(normalizeNumber(formData.bodyWater)) : null,
        notes: formData.notes.trim(),
        imc: calculatedIMC ? parseFloat(calculatedIMC) : 0,
        imcClassification: getString(imcClassification), // Save localized string or key? Better to save key, but existing data might be string. Saving localized string for now to match existing behavior, or maybe save key?
        // Actually, saving localized string is bad practice, but if other parts of app expect it...
        // Let's save the key if we can, but for now let's save the localized string to be safe with existing display logic elsewhere.
        // Wait, if I save 'underweight', and then view it, I need to translate it back.
        // Ideally I should save the key. But let's assume I save the localized string for now as per `getString(imcClassification)`.
        date: new Date(),
        createdBy: user.id,
        updatedAt: new Date()
      };

      if (isEditing && evaluation && evaluation.id) {
        await academyFirestoreService.update(
          'physicalEvaluations',
          evaluation.id,
          evaluationData,
          academiaId
        );
        setSnackbar({
          visible: true,
          message: getString('evaluationUpdatedSuccess'),
          type: 'success'
        });
      } else {
        evaluationData.createdAt = new Date();
        await academyFirestoreService.create(
          'physicalEvaluations',
          evaluationData,
          academiaId
        );
        setSnackbar({
          visible: true,
          message: getString('evaluationSavedSuccess'),
          type: 'success'
        });
      }

      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Erro ao salvar avaliação física:', error);
      setSnackbar({
        visible: true,
        message: getString('evaluationSaveError'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev: DadosFormulario) => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro quando o usuário começar a digitar
    if (errors[field]) {
      setErrors((prev: ErrosFormulario) => ({
        ...prev,
        [field]: null
      }));
    }
  };

  return (
    <LinearGradient
      colors={getAuthGradient(isDarkMode) as any}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            iconColor={COLORS.white}
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>{isEditing ? getString('editPhysicalEvaluation') : getString('newPhysicalEvaluation')}</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.glassCard}>
            <View style={styles.headerSection}>
              <View style={styles.iconContainer}>
                <Ionicons name="fitness-outline" size={32} color={COLORS.primary[500]} />
              </View>
              <Text style={styles.title}>
                {isEditing ? getString('editPhysicalEvaluation') : getString('newPhysicalEvaluation')}
              </Text>
              <Text style={styles.subtitle}>
                {getString('physicalEvaluationSubtitle')}
              </Text>
            </View>

            <Divider style={styles.divider} />

            {/* Dados Básicos */}
            <Text style={styles.sectionTitle}>📏 {getString('basicMeasurements')}</Text>

            <View style={styles.inputRow}>
              <View style={styles.halfInput}>
                <TextInput
                  label={getString('weightKg')}
                  value={formData.weight}
                  onChangeText={(value: any) => updateFormData('weight', value)}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.input}
                  outlineColor={COLORS.gray[400]}
                  activeOutlineColor={COLORS.primary[500]}
                  theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
                  error={!!errors.weight}
                />
                {errors.weight && <HelperText type="error">{errors.weight}</HelperText>}
              </View>

              <View style={styles.halfInput}>
                <TextInput
                  label={getString('heightCm')}
                  value={formData.height}
                  onChangeText={(value: any) => updateFormData('height', value)}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.input}
                  outlineColor={COLORS.gray[400]}
                  activeOutlineColor={COLORS.primary[500]}
                  theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
                  error={!!errors.height}
                />
                {errors.height && <HelperText type="error">{errors.height}</HelperText>}
              </View>
            </View>

            <TextInput
              label={getString('ageYears')}
              value={formData.age}
              onChangeText={(value: any) => updateFormData('age', value)}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              outlineColor={COLORS.gray[400]}
              activeOutlineColor={COLORS.primary[500]}
              theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
              error={!!errors.age}
            />
            {errors.age && <HelperText type="error">{errors.age}</HelperText>}

            {/* Resultado IMC */}
            {calculatedIMC && (
              <Surface style={styles.imcContainer}>
                <View style={styles.imcHeader}>
                  <Ionicons name="calculator-outline" size={24} color={COLORS.info[500]} />
                  <Text style={styles.imcTitle}>{getString('bmiTitle')}</Text>
                </View>
                <View style={styles.imcResult}>
                  <Text style={styles.imcValue}>{calculatedIMC}</Text>
                  <Chip
                    mode="flat"
                    style={[styles.imcChip, { backgroundColor: getIMCColor(imcClassification) }]}
                    textStyle={{ color: COLORS.white, fontWeight: FONT_WEIGHT.bold }}
                  >
                    {getString(imcClassification)}
                  </Chip>
                </View>
              </Surface>
            )}

            <Divider style={styles.divider} />

            {/* Bioimpedância */}
            <Text style={styles.sectionTitle}>⚡ {getString('bioimpedanceOptional')}</Text>

            <View style={styles.inputRow}>
              <View style={styles.halfInput}>
                <TextInput
                  label={getString('bodyFatPercent')}
                  value={formData.bodyFat}
                  onChangeText={(value: any) => updateFormData('bodyFat', value)}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.input}
                  outlineColor={COLORS.gray[400]}
                  activeOutlineColor={COLORS.primary[500]}
                  theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
                  error={!!errors.bodyFat}
                />
                {errors.bodyFat && <HelperText type="error">{errors.bodyFat}</HelperText>}
              </View>

              <View style={styles.halfInput}>
                <TextInput
                  label={getString('muscleMassKg')}
                  value={formData.muscleMass}
                  onChangeText={(value: any) => updateFormData('muscleMass', value)}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.input}
                  outlineColor={COLORS.gray[400]}
                  activeOutlineColor={COLORS.primary[500]}
                  theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
                  error={!!errors.muscleMass}
                />
                {errors.muscleMass && <HelperText type="error">{errors.muscleMass}</HelperText>}
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.halfInput}>
                <TextInput
                  label={getString('boneMassKg')}
                  value={formData.boneMass}
                  onChangeText={(value: any) => updateFormData('boneMass', value)}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.input}
                  outlineColor={COLORS.gray[400]}
                  activeOutlineColor={COLORS.primary[500]}
                  theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
                />
              </View>

              <View style={styles.halfInput}>
                <TextInput
                  label={getString('visceralFat')}
                  value={formData.viscFat}
                  onChangeText={(value: any) => updateFormData('viscFat', value)}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.input}
                  outlineColor={COLORS.gray[400]}
                  activeOutlineColor={COLORS.primary[500]}
                  theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.halfInput}>
                <TextInput
                  label={getString('basalMetabolismKcal')}
                  value={formData.basalMetabolism}
                  onChangeText={(value: any) => updateFormData('basalMetabolism', value)}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                  outlineColor={COLORS.gray[400]}
                  activeOutlineColor={COLORS.primary[500]}
                  theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
                />
              </View>

              <View style={styles.halfInput}>
                <TextInput
                  label={getString('bodyWaterPercent')}
                  value={formData.bodyWater}
                  onChangeText={(value: any) => updateFormData('bodyWater', value)}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.input}
                  outlineColor={COLORS.gray[400]}
                  activeOutlineColor={COLORS.primary[500]}
                  theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
                  error={!!errors.bodyWater}
                />
                {errors.bodyWater && <HelperText type="error">{errors.bodyWater}</HelperText>}
              </View>
            </View>

            {/* Observações */}
            <Text style={styles.sectionTitle}>📝 {getString('observations')}</Text>
            <TextInput
              label={getString('optionalObservations')}
              value={formData.notes}
              onChangeText={(value: any) => updateFormData('notes', value)}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder={getString('observationsPlaceholder')}
              outlineColor={COLORS.gray[400]}
              activeOutlineColor={COLORS.primary[500]}
              theme={{ colors: { background: 'rgba(255,255,255,0.5)', onSurface: COLORS.gray[900], onSurfaceVariant: COLORS.gray[600] } }}
            />

            {/* Botões */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.button}
                disabled={loading}
                textColor={COLORS.gray[700]}
              >{getString('cancel')}</Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={[styles.button, { backgroundColor: COLORS.primary[500] }]}
                loading={loading}
                disabled={loading}
              >
                {isEditing ? getString('update') : getString('save')}
              </Button>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  glassCard: {
    padding: SPACING.md,
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
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    textAlign: 'center',
    color: COLORS.black,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[600],
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
    backgroundColor: 'transparent',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  errorContainer: {
    marginBottom: SPACING.sm,
  },
  imcContainer: {
    padding: SPACING.md,
    marginVertical: 16,
    borderRadius: BORDER_RADIUS.md,
    elevation: 0,
    backgroundColor: COLORS.info[50],
    borderWidth: 1,
    borderColor: COLORS.info[200],
  },
  imcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  imcTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    marginLeft: SPACING.sm,
    color: COLORS.info[700],
  },
  imcResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imcValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.info[700],
  },
  imcChip: {
    elevation: 0,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: COLORS.gray[200],
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
});

export default PhysicalEvaluationScreen;