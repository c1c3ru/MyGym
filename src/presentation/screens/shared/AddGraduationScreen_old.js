import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Button, 
  TextInput,
  Chip,
  Text,
  Portal,
  Dialog,
  RadioButton,
  Divider,
  Snackbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import { firestoreService } from '@services/firestoreService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const AddGraduationScreen = ({ route, navigation }) => {
  const { studentId, studentName } = route.params || {};
  const { user } = useAuth();
  const { getString } = useTheme();
  
  const [formData, setFormData] = useState({
    graduation: '',
    modality: '',
    modalityId: '',
    date: new Date(),
    instructor: user?.name || '',
    instructorId: user?.uid || '',
    notes: '',
    certificate: '',
    previousGraduation: ''
  });
  
  const [modalities, setModalities] = useState([]);
  const [graduationLevels, setGraduationLevels] = useState([]);
  const [modalityDialogVisible, setModalityDialogVisible] = useState(false);
  const [graduationDialogVisible, setGraduationDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success'); // 'success' | 'error'

  // Níveis de graduação comuns para artes marciais
  const defaultGraduationLevels = [
    { id: 'COLORS.white', name: 'Faixa Branca', color: COLORS.white, order: 1 },
    { id: 'yellow', name: 'Faixa Amarela', color: COLORS.warning[400], order: 2 },
    { id: 'orange', name: 'Faixa Laranja', color: 'COLORS.warning[500]', order: 3 },
    { id: 'green', name: 'Faixa Verde', color: 'COLORS.primary[500]', order: 4 },
    { id: 'blue', name: 'Faixa Azul', color: 'COLORS.info[500]', order: 5 },
    { id: 'purple', name: 'Faixa Roxa', color: 'COLORS.secondary[500]', order: 6 },
    { id: 'brown', name: 'Faixa Marrom', color: COLORS.gray[700], order: 7 },
    { id: 'black-1', name: 'Faixa Preta 1º Dan', color: COLORS.black, order: 8 },
    { id: 'black-2', name: 'Faixa Preta 2º Dan', color: COLORS.black, order: 9 },
    { id: 'black-3', name: 'Faixa Preta 3º Dan', color: COLORS.black, order: 10 },
    { id: 'black-4', name: 'Faixa Preta 4º Dan', color: COLORS.black, order: 11 },
    { id: 'black-5', name: 'Faixa Preta 5º Dan', color: COLORS.black, order: 12 },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Carregar modalidades do Firebase (que já contêm graduationLevels)
      const modalitiesData = await firestoreService.getAll('modalities');
      setModalities(modalitiesData || []);
      
      // Inicializar com graduações padrão até que uma modalidade seja selecionada
      setGraduationLevels(defaultGraduationLevels);
      
      // Carregar graduação atual do aluno para referência
      try {
        const studentData = await firestoreService.getById('users', studentId);
        if (studentData?.currentGraduation) {
          setFormData(prev => ({
            ...prev,
            previousGraduation: studentData.currentGraduation
          }));
        }
      } catch (error) {
        console.warn('Não foi possível carregar dados do aluno:', error.message);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados necessários');
    }
  };

  const showSnackbar = (message, type = 'success') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const handleSubmit = async () => {
    if (!formData.graduation || !formData.modality || !formData.modalityId) {
      showSnackbar('Por favor, preencha todos os campos obrigatórios', 'error');
      return;
    }

    try {
      setLoading(true);

      // Criar registro de graduação
      const graduationData = {
        ...formData,
        studentId,
        studentName,
        createdAt: new Date(),
        createdBy: user.uid,
        status: 'active'
      };

      await firestoreService.create('graduations', graduationData);

      // Atualizar graduação atual do aluno
      await firestoreService.update('users', studentId, {
        currentGraduation: formData.graduation,
        lastGraduationDate: formData.date,
        updatedAt: new Date()
      });

      showSnackbar('Graduação adicionada com sucesso!', 'success');
      
      // Voltar para tela anterior após 2 segundos
      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Erro ao salvar graduação:', error);
      let errorMessage = 'Não foi possível salvar a graduação. Tente novamente.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Você não tem permissão para adicionar graduações. Contate o administrador.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.';
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };


  const selectModality = (modality) => {
    setFormData(prev => ({
      ...prev,
      modality: modality.name,
      modalityId: modality.id,
      graduation: '' // Limpar graduação quando mudar modalidade
    }));
    
    // Usar os graduationLevels específicos da modalidade selecionada
    if (modality.graduationLevels && modality.graduationLevels.length > 0) {
      setGraduationLevels(modality.graduationLevels);
    } else {
      // Fallback para graduações padrão se a modalidade não tiver níveis específicos
      setGraduationLevels(defaultGraduationLevels);
    }
    
    setModalityDialogVisible(false);
  };

  const selectGraduation = (graduation) => {
    setFormData(prev => ({
      ...prev,
      graduation: graduation.name || graduation,
      graduationId: graduation.id || graduation
    }));
    setGraduationDialogVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons name="trophy" size={32} color={COLORS.warning[300]} />
              <View style={styles.headerText}>
                <Title style={styles.title}>Nova Graduação</Title>
                <Text style={styles.subtitle}>Aluno: {studentName}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Formulário */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Informações da Graduação</Title>

            {/* Graduação Anterior */}
            {formData.previousGraduation && (
              <View style={styles.previousGraduation}>
                <Text style={styles.label}>Graduação Atual:</Text>
                <Chip mode="outlined" style={styles.previousChip}>
                  {formData.previousGraduation}
                </Chip>
              </View>
            )}

            {/* Modalidade */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Modalidade *</Text>
              <Button
                mode="outlined"
                onPress={() => setModalityDialogVisible(true)}
                style={styles.selectButton}
                contentStyle={styles.selectButtonContent}
              >
                {formData.modality || 'Selecionar modalidade'}
              </Button>
            </View>

            {/* Graduação */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nova Graduação *</Text>
              <Button
                mode="outlined"
                onPress={() => setGraduationDialogVisible(true)}
                style={styles.selectButton}
                contentStyle={styles.selectButtonContent}
                disabled={!formData.modalityId}
              >
                {formData.graduation || (formData.modalityId ? 'Selecionar graduação' : 'Primeiro selecione uma modalidade')}
              </Button>
            </View>

            {/* Data */}
            <TextInput
              label="Data da Graduação (DD/MM/AAAA)"
              value={formData.date.toLocaleDateString('pt-BR')}
              onChangeText={(text) => {
                // Parse date from DD/MM/YYYY format
                const parts = text.split('/');
                if (parts.length === 3) {
                  const day = parseInt(parts[0], 10);
                  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
                  const year = parseInt(parts[2], 10);
                  if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    const newDate = new Date(year, month, day);
                    if (newDate.getFullYear() === year && newDate.getMonth() === month && newDate.getDate() === day) {
                      setFormData(prev => ({ ...prev, date: newDate }));
                    }
                  }
                }
              }}
              mode="outlined"
              style={styles.input}
              placeholder="DD/MM/AAAA"
              left={<TextInput.Icon icon="calendar" />}
            />

            {/* Instrutor */}
            <TextInput
              label="Instrutor Responsável"
              value={formData.instructor}
              onChangeText={(text) => setFormData(prev => ({ ...prev, instructor: text }))}
              mode="outlined"
              style={styles.input}
            />

            {/* Certificado */}
            <TextInput
              label="Número do Certificado (opcional)"
              value={formData.certificate}
              onChangeText={(text) => setFormData(prev => ({ ...prev, certificate: text }))}
              mode="outlined"
              style={styles.input}
            />

            {/* Observações */}
            <TextInput
              label="Observações (opcional)"
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            Cancelar
          </Button>
          
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={[styles.button, styles.submitButton]}
          >
            Salvar Graduação
          </Button>
        </View>
      </ScrollView>

      {/* Dialog Modalidade */}
      <Portal>
        <Dialog visible={modalityDialogVisible} onDismiss={() => setModalityDialogVisible(false)}>
          <Dialog.Title>Selecionar Modalidade</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={styles.dialogScroll}>
              {modalities.map((modality) => (
                <View key={modality.id}>
                  <RadioButton.Item
                    label={modality.name}
                    value={modality.id}
                    status={formData.modalityId === modality.id ? 'checked' : 'unchecked'}
                    onPress={() => selectModality(modality)}
                  />
                </View>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setModalityDialogVisible(false)}>Cancelar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Dialog Graduação */}
      <Portal>
        <Dialog visible={graduationDialogVisible} onDismiss={() => setGraduationDialogVisible(false)}>
          <Dialog.Title>Selecionar Graduação</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={styles.dialogScroll}>
              {graduationLevels.map((graduation, index) => (
                <View key={graduation.id || graduation || index}>
                  <RadioButton.Item
                    label={graduation.name || graduation}
                    value={graduation.id || graduation}
                    status={formData.graduation === (graduation.name || graduation) ? 'checked' : 'unchecked'}
                    onPress={() => selectGraduation(graduation)}
                  />
                </View>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setGraduationDialogVisible(false)}>Cancelar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar para feedbacks */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={snackbarType === 'success' ? 2000 : 4000}
        style={{
          backgroundColor: snackbarType === 'success' ? 'COLORS.primary[500]' : 'COLORS.error[500]'
        }}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        <Text style={{ color: 'COLORS.white' }}>{snackbarMessage}</Text>
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
  headerCard: {
    margin: SPACING.base,
    marginBottom: SPACING.sm,
    elevation: 4,
  },
  card: {
    margin: SPACING.base,
    marginTop: SPACING.sm,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: 'COLORS.text.primary',
  },
  subtitle: {
    fontSize: FONT_SIZE.base,
    color: 'COLORS.text.secondary',
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    marginBottom: 16,
    color: 'COLORS.text.primary',
  },
  previousGraduation: {
    marginBottom: 16,
    padding: SPACING.md,
    backgroundColor: 'COLORS.background.light',
    borderRadius: BORDER_RADIUS.md,
  },
  label: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: 'COLORS.text.primary',
    marginBottom: SPACING.sm,
  },
  previousChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E8',
  },
  inputGroup: {
    marginBottom: 16,
  },
  selectButton: {
    justifyContent: 'flex-start',
    borderColor: '#ddd',
  },
  selectButtonContent: {
    justifyContent: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: SPACING.base,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: 'COLORS.primary[500]',
  },
  dialogScroll: {
    maxHeight: 300,
  },
});

export default AddGraduationScreen;
