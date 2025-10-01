import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView
} from 'react-native';
import {
  Button,
  TextInput,
  Card,
  Portal,
  Dialog,
  Snackbar,
  IconButton,
  Chip,
  Surface,
  Divider,
  RadioButton
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import academyCollectionsService from '@services/academyCollectionsService';
import { LinearGradient } from 'expo-linear-gradient';
import SelectionField from '@components/SelectionField';
import graduationRepository from '@presentation/repositories/graduationRepository';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, BORDER_WIDTH, FONT_WEIGHT } from '@presentation/theme/designTokens';

const { width } = Dimensions.get('window');

const AddGraduationScreen = ({ route, navigation }) => {
  const { studentId, studentName } = route.params;
  const { user, userProfile, academia } = useAuth();
  const { getString } = useTheme();

  const [formData, setFormData] = useState({
    graduation: '',
    modality: '',
    modalityId: '',
    date: new Date(),
    instructor: '',
    instructorId: '',
    notes: '',
    certificate: '',
    previousGraduation: ''
  });

  const [modalities, setModalities] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [graduationLevels, setGraduationLevels] = useState([]);
  const [modalityDialogVisible, setModalityDialogVisible] = useState(false);
  const [graduationDialogVisible, setGraduationDialogVisible] = useState(false);
  const [instructorDialogVisible, setInstructorDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const defaultGraduationLevels = [
    { id: COLORS.white, name: 'Faixa Branca', color: COLORS.white, order: 1 },
    { id: 'yellow', name: 'Faixa Amarela', color: COLORS.warning[400], order: 2 },
    { id: 'orange', name: 'Faixa Laranja', color: COLORS.warning[500], order: 3 },
    { id: 'green', name: 'Faixa Verde', color: COLORS.primary[500], order: 4 },
    { id: 'blue', name: 'Faixa Azul', color: COLORS.info[500], order: 5 },
    { id: 'purple', name: 'Faixa Roxa', color: COLORS.secondary[500], order: 6 },
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
      setLoading(true);
      
      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error('Academia ID não encontrado');
        showSnackbar('Academia não encontrada. Faça login novamente.', 'error');
        return;
      }

      const { modalities, instructors, currentGraduation } = await graduationRepository.loadInitialData(academiaId, studentId);
      
      setModalities(modalities);
      setInstructors(instructors);
      setGraduationLevels(defaultGraduationLevels);
      
      if (currentGraduation) {
        setFormData(prev => ({
          ...prev,
          previousGraduation: currentGraduation
        }));
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showSnackbar(error.message || 'Não foi possível carregar os dados necessários', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, type = 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const getGraduationColor = (levelName, index) => {
    const colorMap = {
      'Branca': COLORS.white,
      'Amarela': COLORS.warning[400],
      'Laranja': COLORS.warning[500],
      'Verde': COLORS.primary[500],
      'Azul': COLORS.info[500],
      'Roxa': COLORS.secondary[500],
      'Marrom': COLORS.gray[700],
      'Preta': COLORS.black,
      'Vermelha': COLORS.error[500],
      'Crua': COLORS.gray[600],
      'Cordão': COLORS.warning[300]
    };
    
    // Procurar por cor baseada no nome
    for (const [color, hex] of Object.entries(colorMap)) {
      if (levelName.toLowerCase().includes(color.toLowerCase())) {
        return hex;
      }
    }
    
    // Cores padrão baseadas no índice se não encontrar correspondência
    const defaultColors = [COLORS.white, COLORS.warning[400], COLORS.warning[500], COLORS.primary[500], COLORS.info[500], COLORS.secondary[500], COLORS.gray[700], COLORS.black];
    return defaultColors[index % defaultColors.length] || COLORS.gray[300];
  };

  const selectModality = (modality) => {
    setFormData(prev => ({
      ...prev,
      modality: modality.name,
      modalityId: modality.id,
      graduation: ''
    }));

    if (modality.graduationLevels && modality.graduationLevels.length > 0) {
      // Converter array de strings para objetos com estrutura esperada
      const convertedLevels = modality.graduationLevels.map((level, index) => ({
        id: `${modality.id}-${index}`,
        name: level,
        color: getGraduationColor(level, index),
        order: index + 1
      }));
      setGraduationLevels(convertedLevels);
    } else {
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

  const validateForm = () => {
    console.log('🔍 Iniciando validação do formulário...');
    console.log('📋 Dados do formulário:', {
      graduation: formData.graduation,
      modality: formData.modality,
      instructor: formData.instructor,
      instructorId: formData.instructorId,
      date: formData.date,
      certificate: formData.certificate
    });

    if (!formData.graduation) {
      console.log('❌ Falha na validação: graduação não selecionada');
      showSnackbar('Por favor, selecione uma graduação', 'error');
      return false;
    }
    console.log('✅ Graduação válida:', formData.graduation);

    if (!formData.modality) {
      console.log('❌ Falha na validação: modalidade não selecionada');
      showSnackbar('Por favor, selecione uma modalidade', 'error');
      return false;
    }
    console.log('✅ Modalidade válida:', formData.modality);

    if (!formData.instructor || !formData.instructorId) {
      console.log('❌ Falha na validação: instrutor não selecionado', {
        instructor: formData.instructor,
        instructorId: formData.instructorId
      });
      showSnackbar('Por favor, selecione um instrutor responsável', 'error');
      return false;
    }
    console.log('✅ Instrutor válido:', formData.instructor, 'ID:', formData.instructorId);
    
    // Validar data
    if (!formData.date) {
      console.log('❌ Falha na validação: data não selecionada');
      showSnackbar('Por favor, selecione uma data', 'error');
      return false;
    }
    console.log('✅ Data válida:', formData.date);
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Fim do dia atual
    if (formData.date > today) {
      console.log('❌ Falha na validação: data futura', {
        dataFormulario: formData.date,
        hoje: today
      });
      showSnackbar('A data da graduação não pode ser futura', 'error');
      return false;
    }
    console.log('✅ Data não é futura');
    
    // Validar certificado (se preenchido)
    if (formData.certificate && formData.certificate.trim()) {
      const certPattern = /^CERT-\d{4}-\d+$/;
      if (!certPattern.test(formData.certificate.trim())) {
        console.log('❌ Falha na validação: formato do certificado inválido:', formData.certificate);
        showSnackbar('Formato do certificado deve ser: CERT-YYYY-NNN (ex: CERT-2024-001)', 'error');
        return false;
      }
      console.log('✅ Certificado válido:', formData.certificate);
    } else {
      console.log('ℹ️ Certificado não preenchido (opcional)');
    }
    
    console.log('🎉 Validação concluída com sucesso!');
    return true;
  };

  const handleSubmit = async () => {
    console.log('Iniciando processo de salvamento...');
    console.log('FormData atual:', formData);
    
    if (!validateForm()) {
      console.log('Validação falhou');
      return;
    }

    try {
      setLoading(true);

      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      console.log('Academia ID:', academiaId);
      console.log('User profile:', userProfile);
      console.log('Academia:', academia);
      
      if (!academiaId) {
        console.error('Academia ID não encontrado');
        showSnackbar('Academia não encontrada. Faça login novamente.', 'error');
        return;
      }

      const graduationData = {
        ...formData,
        studentId,
        studentName,
        createdAt: new Date(),
        createdBy: user.id,
        status: 'active'
      };

      console.log('Dados da graduação a serem salvos:', graduationData);

      await graduationRepository.addGraduation(academiaId, studentId, graduationData);
      
      showSnackbar('Graduação adicionada com sucesso!', 'success');

      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Erro no handleSubmit:', error);
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com gradiente */}
      <LinearGradient
        colors={[COLORS.info[700], '#1565C0']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            iconColor={COLORS.white}
            size={24}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Nova Graduação</Text>
            <Text style={styles.headerSubtitle}>{studentName || 'Aluno'}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Card de graduação atual */}
{formData.previousGraduation ? (
          <Surface style={styles.currentGraduationCard} elevation={2}>
            <View style={styles.currentGraduationContent}>
              <IconButton icon="medal" size={24} iconColor={COLORS.warning[500]} />
              <View style={styles.currentGraduationText}>
                <Text style={styles.currentGraduationLabel}>Graduação Atual</Text>
                <Text style={styles.currentGraduationValue}>{String(formData.previousGraduation)}</Text>
              </View>
            </View>
          </Surface>
        ) : null}

        {/* Seção de seleções */}
        <Card style={styles.selectionCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Informações da Graduação</Text>

            {/* Modalidade */}
            <SelectionField
              label="Modalidade"
              value={formData.modality}
              placeholder="Selecionar Modalidade"
              icon={formData.modality ? "karate" : "plus"}
              onPress={() => setModalityDialogVisible(true)}
              required
            />

            {/* Instrutor */}
            <SelectionField
              label="Instrutor Responsável"
              value={formData.instructor}
              placeholder="Selecionar Instrutor"
              icon={formData.instructor ? "account-check" : "plus"}
              onPress={() => setInstructorDialogVisible(true)}
              required
            />

            {/* Nova Graduação */}
            <SelectionField
              label="Nova Graduação"
              value={formData.graduation}
              placeholder="Selecionar Graduação"
              icon={formData.graduation ? "trophy" : "plus"}
              onPress={() => setGraduationDialogVisible(true)}
              disabled={!formData.modalityId}
              helperText={!formData.modalityId ? "Selecione uma modalidade primeiro" : null}
              required
            />
          </Card.Content>
        </Card>

        {/* Data e observações */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Detalhes Adicionais</Text>
            
            {/* Data */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Data da Graduação *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <IconButton icon="calendar" size={20} iconColor={COLORS.info[700]} />
                <Text style={styles.dateButtonText}>
                  {formData.date ? 
                    (formData.date instanceof Date ? 
                      formData.date.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Data inválida'
                    ) : 'Selecionar data'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Observações */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Observações</Text>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={4}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="Adicione observações sobre a graduação..."
                style={styles.notesInput}
                outlineColor={COLORS.gray[300]}
                activeOutlineColor={COLORS.info[700]}
              />
            </View>

            {/* Certificado */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Número do Certificado (Opcional)</Text>
              <TextInput
                mode="outlined"
                value={formData.certificate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, certificate: text }))}
                placeholder="Ex: CERT-2024-001"
                style={styles.certificateInput}
                outlineColor={COLORS.gray[300]}
                activeOutlineColor={COLORS.warning[500]}
                left={<TextInput.Icon icon="certificate" />}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Botões de ação */}
        <View style={styles.actionContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            labelStyle={styles.submitButtonLabel}
            icon={loading ? undefined : "content-save"}
          >
            {loading ? 'Salvando...' : 'Salvar Graduação'}
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.cancelButton}
            contentStyle={styles.cancelButtonContent}
            labelStyle={styles.cancelButtonLabel}
          >
            Cancelar
          </Button>
        </View>
      </ScrollView>

      {/* DateTimePicker */}
{showDatePicker ? (
        <DateTimePicker
          value={formData.date || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFormData(prev => ({ ...prev, date: selectedDate }));
            }
          }}
        />
      ) : null}

      <Portal>
        <Dialog visible={modalityDialogVisible} onDismiss={() => setModalityDialogVisible(false)}>
          <View style={styles.dialogTitleContainer}>
            <Text style={styles.dialogTitle}>Selecionar Modalidade</Text>
          </View>
          <Dialog.ScrollArea>
            <ScrollView style={styles.dialogScroll}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Carregando modalidades...</Text>
                </View>
              ) : modalities.length > 0 ? (
                modalities.map((modality) => (
                  <View key={modality.id}>
                    <RadioButton.Item
                      label={modality.name}
                      value={modality.id}
                      status={formData.modalityId === modality.id ? 'checked' : 'unchecked'}
                      onPress={() => selectModality(modality)}
                    />
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhuma modalidade encontrada</Text>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setModalityDialogVisible(false)}>
              Cancelar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={graduationDialogVisible} onDismiss={() => setGraduationDialogVisible(false)}>
          <Dialog.Title>Selecionar Graduação</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.dialogContent}>
              {graduationLevels.length > 0 ? (
                graduationLevels.map((level, index) => (
                  <TouchableOpacity
                    key={level.id || `graduation-${index}`}
                    style={styles.dialogItem}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        graduation: level.name
                      }));
                      setGraduationDialogVisible(false);
                    }}
                  >
                    <View style={styles.graduationItem}>
                      <View style={[styles.colorIndicator, { backgroundColor: level.color || COLORS.gray[300] }]} />
                      <Text style={styles.dialogItemText}>{level.name || 'Graduação sem nome'}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhuma graduação disponível</Text>
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setGraduationDialogVisible(false)}>Cancelar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={instructorDialogVisible} onDismiss={() => setInstructorDialogVisible(false)}>
          <Dialog.Title>Selecionar Instrutor</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.dialogContent}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Carregando instrutores...</Text>
                </View>
              ) : instructors.length > 0 ? (
                instructors.map((instructor, index) => (
                  <TouchableOpacity
                    key={instructor.id || `instructor-${index}`}
                    style={styles.dialogItem}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        instructor: instructor.name || instructor.displayName || instructor.email || 'Instrutor',
                        instructorId: instructor.id
                      }));
                      setInstructorDialogVisible(false);
                    }}
                  >
                    <Text style={styles.dialogItemText}>
                      {(instructor.name || instructor.displayName || instructor.email || 'Instrutor sem nome').toString()}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhum instrutor encontrado</Text>
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setInstructorDialogVisible(false)}>Cancelar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={snackbarType === 'success' ? 2000 : 4000}
        style={{
          backgroundColor: snackbarType === 'success' ? COLORS.primary[500] : COLORS.error[500]
        }}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        <Text style={{ color: COLORS.white }}>{snackbarMessage || 'Mensagem'}</Text>
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.base,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.base,
    paddingBottom: 32,
    maxWidth: width < 768 ? width : 768, // Limita largura em tablets
    alignSelf: 'center',
    width: '100%',
  },
  currentGraduationCard: {
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 16,
    backgroundColor: COLORS.white,
  },
  currentGraduationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
  },
  currentGraduationText: {
    flex: 1,
    marginLeft: 8,
  },
  currentGraduationLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    fontWeight: FONT_WEIGHT.medium,
    letterSpacing: 0.5,
  },
  currentGraduationValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginTop: 2,
  },
  selectionCard: {
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  selectionItem: {
    marginBottom: 16,
  },
  selectionLabel: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  selectionButton: {
    borderWidth: BORDER_WIDTH.base,
    borderColor: COLORS.gray[400],
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
  },
  selectionButtonSelected: {
    borderColor: COLORS.info[700],
    backgroundColor: COLORS.info[50],
  },
  selectionButtonDisabled: {
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[100],
  },
  selectionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: 4,
  },
  selectionButtonText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
  },
  selectionButtonTextSelected: {
    color: COLORS.info[700],
    fontWeight: FONT_WEIGHT.medium,
  },
  selectionButtonTextDisabled: {
    color: COLORS.gray[500],
  },
  helperText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  detailsCard: {
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 16,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: BORDER_WIDTH.base,
    borderColor: COLORS.gray[400],
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: 4,
  },
  dateButtonText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
    textTransform: 'capitalize',
  },
  notesInput: {
    backgroundColor: COLORS.white,
  },
  certificateCard: {
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 16,
    elevation: 2,
  },
  certificateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  certificateInput: {
    backgroundColor: COLORS.white,
  },
  actionContainer: {
    marginTop: SPACING.sm,
    gap: 12,
  },
  submitButton: {
    backgroundColor: COLORS.info[700],
    borderRadius: BORDER_RADIUS.md,
  },
  submitButtonContent: {
    height: 48,
  },
  submitButtonLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  cancelButton: {
    borderColor: COLORS.gray[500],
    borderRadius: BORDER_RADIUS.md,
  },
  cancelButtonContent: {
    height: 48,
  },
  cancelButtonLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
  },
  dialogTitleContainer: {
    padding: SPACING.lg,
    paddingBottom: 16,
  },
  dialogTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  dialogContent: {
    maxHeight: 300,
  },
  dialogItem: {
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  dialogItemText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
  },
  graduationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: BORDER_WIDTH.base,
    borderColor: COLORS.gray[400],
  },
  emptyText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
    textAlign: 'center',
    padding: SPACING.lg,
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
});

export default AddGraduationScreen;
