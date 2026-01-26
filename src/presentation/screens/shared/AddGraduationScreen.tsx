import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView
} from 'react-native';
import {
  Button,
  TextInput,
  Portal,
  Dialog,
  Snackbar,
  IconButton,
  RadioButton,
  Checkbox
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import SelectionField from '@components/SelectionField';
import graduationRepository from '@presentation/repositories/graduationRepository';
import { certificateService } from '@infrastructure/services/certificateService';
import { CertificateDeliveryService } from '@infrastructure/services/certificateDeliveryService';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, BORDER_WIDTH, FONT_WEIGHT, INPUT_THEME } from '@presentation/theme/designTokens';
import { hexToRgba } from '@shared/utils/colorUtils';
import { getAuthGradient } from '@presentation/theme/authTheme';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

interface AcademyDocument {
  id: string;
  name?: string;
  settings?: {
    certificateTemplateUrl?: string;
    certificateLocation?: string;
    certificateTextTemplate?: string;
    updatedAt?: Date;
  };
  [key: string]: any;
}

interface StudentDocument {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

interface AddGraduationScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<any>;
}

const { width } = Dimensions.get('window');

const AddGraduationScreen = ({ route, navigation }: any) => {
  const { studentId, studentName } = route.params;
  const { user, userProfile, academia } = useAuth();
  const { getString, isDarkMode } = useTheme();

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

  const [modalities, setModalities] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [graduationLevels, setGraduationLevels] = useState<any[]>([]);
  const [modalityDialogVisible, setModalityDialogVisible] = useState(false);
  const [graduationDialogVisible, setGraduationDialogVisible] = useState(false);
  const [instructorDialogVisible, setInstructorDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Certificate states
  const [hasTemplate, setHasTemplate] = useState(false);
  const [templateUrl, setTemplateUrl] = useState('');
  const [textTemplate, setTextTemplate] = useState('');
  const [generateCertificate, setGenerateCertificate] = useState(false);
  const [sendByEmail, setSendByEmail] = useState(false);
  const [sendByWhatsApp, setSendByWhatsApp] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [certificateLocation, setCertificateLocation] = useState('');

  const defaultGraduationLevels = [
    { id: COLORS.special.belt.white, name: getString('whiteBelt'), color: COLORS.special.belt.white, order: 1 },
    { id: COLORS.warning[500], name: getString('yellowBelt'), color: COLORS.special.belt.yellow, order: 2 },
    { id: COLORS.warning[600], name: getString('orangeBelt'), color: COLORS.special.belt.orange, order: 3 },
    { id: COLORS.success[500], name: getString('greenBelt'), color: COLORS.special.belt.green, order: 4 },
    { id: COLORS.info[500], name: getString('blueBelt'), color: COLORS.special.belt.blue, order: 5 },
    { id: 'purple', name: getString('purpleBelt'), color: COLORS.special.belt.purple, order: 6 },
    { id: 'brown', name: getString('brownBelt'), color: COLORS.special.belt.brown, order: 7 },
    { id: 'black-1', name: getString('blackBelt1'), color: COLORS.special.belt.black, order: 8 },
    { id: 'black-2', name: getString('blackBelt2'), color: COLORS.special.belt.black, order: 9 },
    { id: 'black-3', name: getString('blackBelt3'), color: COLORS.special.belt.black, order: 10 },
    { id: 'black-4', name: getString('blackBelt4'), color: COLORS.special.belt.black, order: 11 },
    { id: 'black-5', name: getString('blackBelt5'), color: COLORS.special.belt.black, order: 12 },
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
        console.error(getString('academyIdNotFound'));
        showSnackbar(getString('academyNotFoundLogin'), 'error');
        return;
      }

      // Check certificate template and load student data
      try {
        const academyDoc = await academyFirestoreService.getById('academies', academiaId) as AcademyDocument | null;
        if (academyDoc?.settings?.certificateTemplateUrl) {
          setHasTemplate(true);
          setTemplateUrl(academyDoc.settings.certificateTemplateUrl);
          if (academyDoc.settings.certificateTextTemplate) {
            setTextTemplate(academyDoc.settings.certificateTextTemplate);
          }
          setGenerateCertificate(true);
        }
        // Load certificate location from academy settings
        if (academyDoc?.settings?.certificateLocation) {
          setCertificateLocation(academyDoc.settings.certificateLocation);
        }
      } catch (e) {
        console.warn('Erro ao checar template:', e);
      }

      // Load student contact info
      try {
        const studentDoc = await academyFirestoreService.getById(
          `academies/${academiaId}/students`,
          studentId
        ) as StudentDocument | null;
        if (studentDoc) {
          setStudentEmail(studentDoc.email || '');
          setStudentPhone(studentDoc.phone || '');
        }
      } catch (e) {
        console.warn('Erro ao carregar dados do aluno:', e);
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
      console.error('Erro ao carregar dados:', error as Error);
      showSnackbar((error as Error).message || getString('loadDataError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, type: 'success' | 'error' = 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const getGraduationColor = (levelName: string, index: number) => {
    const colorMap: { [key: string]: string } = {
      'Branca': COLORS.special.belt.white,
      'White': COLORS.special.belt.white,
      'Amarela': COLORS.special.belt.yellow,
      'Yellow': COLORS.special.belt.yellow,
      'Laranja': COLORS.special.belt.orange,
      'Orange': COLORS.special.belt.orange,
      'Verde': COLORS.special.belt.green,
      'Green': COLORS.special.belt.green,
      'Azul': COLORS.special.belt.blue,
      'Blue': COLORS.special.belt.blue,
      'Roxa': COLORS.special.belt.purple,
      'Purple': COLORS.special.belt.purple,
      'Marrom': COLORS.special.belt.brown,
      'Brown': COLORS.special.belt.brown,
      'Preta': COLORS.special.belt.black,
      'Black': COLORS.special.belt.black,
      'Vermelha': COLORS.special.belt.red,
      'Red': COLORS.special.belt.red,
      'Coral': COLORS.special.belt.red,
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
    const defaultColors = [
      COLORS.special.belt.white,
      COLORS.special.belt.yellow,
      COLORS.special.belt.orange,
      COLORS.special.belt.green,
      COLORS.special.belt.blue,
      COLORS.special.belt.purple,
      COLORS.special.belt.brown,
      COLORS.special.belt.black
    ];
    return defaultColors[index % defaultColors.length] || COLORS.gray[300];
  };

  const selectModality = (modality: { id: string; name: string; graduationLevels?: string[] }) => {
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

  const selectGraduation = (graduation: { id?: string; name: string } | string) => {
    setFormData(prev => ({
      ...prev,
      graduation: typeof graduation === 'string' ? graduation : graduation.name,
      graduationId: typeof graduation === 'string' ? graduation : graduation.id || graduation.name
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
      showSnackbar(getString('selectGraduationError'), 'error');
      return false;
    }
    console.log('✅ Graduação válida:', formData.graduation);

    if (!formData.modality) {
      console.log('❌ Falha na validação: modalidade não selecionada');
      showSnackbar(getString('selectModalityError'), 'error');
      return false;
    }
    console.log('✅ Modalidade válida:', formData.modality);

    if (!formData.instructor || !formData.instructorId) {
      console.log('❌ Falha na validação: instrutor não selecionado', {
        instructor: formData.instructor,
        instructorId: formData.instructorId
      });
      showSnackbar(getString('selectInstructorError'), 'error');
      return false;
    }
    console.log('✅ Instrutor válido:', formData.instructor, 'ID:', formData.instructorId);

    // Validar data
    if (!formData.date) {
      console.log('❌ Falha na validação: data não selecionada');
      showSnackbar(getString('selectDateError'), 'error');
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
      showSnackbar(getString('futureDateError'), 'error');
      return false;
    }
    console.log('✅ Data não é futura');

    // Validar certificado (se preenchido)
    if (formData.certificate && formData.certificate.trim()) {
      const certPattern = /^CERT-\d{4}-\d+$/;
      if (!certPattern.test(formData.certificate.trim())) {
        console.log('❌ Falha na validação: formato do certificado inválido:', formData.certificate);
        showSnackbar(getString('certificateFormatError'), 'error');
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
        console.error(getString('academyIdNotFound'));
        showSnackbar(getString('academyNotFoundLogin'), 'error');
        return;
      }

      let certUrl = null;

      if (generateCertificate && hasTemplate && templateUrl) {
        try {
          // Tentar encontrar nome da graduação nos níveis carregados ou nos defaults
          const gradLevel = graduationLevels.find(g => g.id === formData.graduation) || defaultGraduationLevels.find(g => g.id === formData.graduation);
          const gradName = gradLevel?.name || formData.graduation;

          // Encontrar nome do instrutor
          const instrObj = instructors.find(i => i.id === formData.instructor);
          const instrName = instrObj?.name || userProfile?.name || '';

          const pdfUri = await certificateService.generateCertificatePdf({
            studentName,
            graduationName: gradName,
            date: formData.date.toLocaleDateString('pt-BR'),
            location: certificateLocation || 'Brasil',
            instructorName: instrName,
            academyName: academia?.name || 'MyGym Academy'
          }, { imageUrl: templateUrl, textTemplate: textTemplate || undefined });

          // Upload
          const tempId = Date.now().toString();
          certUrl = await certificateService.uploadCertificate(academiaId, studentId, tempId, pdfUri);

          // Send certificate via email/WhatsApp if requested
          if (certUrl && (sendByEmail || sendByWhatsApp)) {
            const deliveryData = {
              studentName,
              studentEmail: sendByEmail ? studentEmail : undefined,
              studentPhone: sendByWhatsApp ? studentPhone : undefined,
              graduationName: gradName,
              academyName: academia?.name || 'MyGym Academy',
              certificateUrl: certUrl,
              date: formData.date.toLocaleDateString('pt-BR'),
            };

            try {
              if (sendByEmail && studentEmail) {
                await CertificateDeliveryService.sendCertificateByEmail(deliveryData);
                console.log('✅ Certificado enviado por email');
              }
              if (sendByWhatsApp && studentPhone) {
                await CertificateDeliveryService.sendCertificateByWhatsApp(deliveryData);
                console.log('✅ Certificado enviado via WhatsApp');
              }
            } catch (deliveryError) {
              console.error('Erro ao enviar certificado:', deliveryError);
              // Não bloqueia o salvamento da graduação
            }
          }

        } catch (e) {
          console.error('Erro ao gerar certificado:', e);
          showSnackbar('Erro ao gerar certificado, mas a graduação será salva.', 'error');
        }
      }

      const graduationData = {
        ...formData,
        studentId,
        studentName,
        createdAt: new Date(),
        createdBy: user?.id, // user can be null
        status: 'active',
        certificateUrl: certUrl
      };

      console.log('Dados da graduação a serem salvos:', graduationData);

      await graduationRepository.addGraduation(academiaId, studentId, graduationData);

      showSnackbar(getString('graduationAddedSuccess'), 'success');

      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Erro no handleSubmit:', error);
      showSnackbar((error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={getAuthGradient(isDarkMode) as any}
      style={[
        styles.container,
        {
          minHeight: 0,
          height: Platform.OS === 'web' ? '100vh' : '100%',
          overflow: 'hidden'
        } as any
      ]}
    >
      <SafeAreaView style={[styles.safeArea, { minHeight: 0 }]}>
        {/* Header Transparente */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <IconButton
              icon="arrow-left"
              iconColor={COLORS.white}
              size={24}
              onPress={() => navigation.goBack()}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{getString('newGraduation')}</Text>
              <Text style={styles.headerSubtitle}>{studentName || getString('student')}</Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
          alwaysBounceVertical={true}
        >
          {/* Card de graduação atual */}
          {formData.previousGraduation ? (
            <View style={styles.glassCard}>
              <View style={styles.currentGraduationContent}>
                <IconButton icon="medal" size={24} iconColor={COLORS.warning[500]} />
                <View style={styles.currentGraduationText}>
                  <Text style={styles.currentGraduationLabel}>{getString('currentGraduation')}</Text>
                  <Text style={styles.currentGraduationValue}>{String(formData.previousGraduation)}</Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Seção de seleções */}
          <View style={styles.glassCard}>
            <View style={styles.cardContent}>
              <Text style={styles.sectionTitle}>{getString('graduationInfo')}</Text>

              {/* Modalidade */}
              <SelectionField
                label={getString('modality')}
                value={formData.modality}
                placeholder={getString('selectModality')}
                icon={formData.modality ? "karate" : "plus"}
                onPress={() => setModalityDialogVisible(true)}
                required
              />

              {/* Instrutor */}
              <SelectionField
                label={getString('responsibleInstructor')}
                value={formData.instructor}
                placeholder={getString('selectInstructor')}
                icon={formData.instructor ? "account-check" : "plus"}
                onPress={() => setInstructorDialogVisible(true)}
                required
              />

              {/* Nova Graduação */}
              <SelectionField
                label={getString('newGraduationLabel')}
                value={formData.graduation}
                placeholder={getString('selectGraduation')}
                icon={formData.graduation ? "trophy" : "plus"}
                onPress={() => setGraduationDialogVisible(true)}
                disabled={!formData.modalityId}
                helperText={(!formData.modalityId ? getString('selectModalityFirst') : undefined) as any}
                required
              />
            </View>
          </View>

          {/* Data e observações */}
          <View style={styles.glassCard}>
            <View style={styles.cardContent}>
              <Text style={styles.sectionTitle}>{getString('additionalDetails')}</Text>

              {/* Data */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{getString('graduationDate')} *</Text>
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
                        }) : getString('invalidDate')
                      ) : getString('selectDate')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Observações */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{getString('notes')}</Text>
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  value={formData.notes}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                  placeholder={getString('addGraduationNotesPlaceholder')}
                  style={styles.notesInput}
                  outlineColor={COLORS.gray[300]}
                  activeOutlineColor={COLORS.info[700]}
                  theme={INPUT_THEME}
                />
              </View>

              {/* Certificado */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{getString('certificateNumberOptional')}</Text>
                <TextInput
                  mode="outlined"
                  value={formData.certificate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, certificate: text }))}
                  placeholder={getString('certificatePlaceholder')}
                  style={styles.certificateInput}
                  outlineColor={COLORS.gray[300]}
                  activeOutlineColor={COLORS.warning[500]}
                  left={<TextInput.Icon icon="certificate" />}
                  theme={INPUT_THEME}
                />
              </View>

              {/* Gerador de Certificado Automático */}
              {hasTemplate && (
                <View style={{ marginTop: 15 }}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 5,
                      backgroundColor: hexToRgba(COLORS.primary[500], 0.1),
                      padding: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: hexToRgba(COLORS.primary[500], 0.3)
                    }}
                    onPress={() => setGenerateCertificate(!generateCertificate)}
                    activeOpacity={0.7}
                  >
                    <Checkbox.Android
                      status={generateCertificate ? 'checked' : 'unchecked'}
                      onPress={() => setGenerateCertificate(!generateCertificate)}
                      color={COLORS.primary[500]}
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={{ fontSize: 16, color: COLORS.info[900], fontWeight: 'bold' }}>
                        Gerar Certificado Digital
                      </Text>
                      <Text style={{ fontSize: 12, color: COLORS.gray[600] }}>
                        Um PDF será gerado com o modelo da academia e anexado à graduação.
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Opções de envio */}
                  {generateCertificate && (
                    <View style={{ marginTop: 10, paddingLeft: 10 }}>
                      {studentEmail && (
                        <TouchableOpacity
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 8,
                            padding: 8,
                            backgroundColor: hexToRgba(COLORS.info[500], 0.05),
                            borderRadius: 6,
                          }}
                          onPress={() => setSendByEmail(!sendByEmail)}
                          activeOpacity={0.7}
                        >
                          <Checkbox.Android
                            status={sendByEmail ? 'checked' : 'unchecked'}
                            onPress={() => setSendByEmail(!sendByEmail)}
                            color={COLORS.info[500]}
                          />
                          <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={{ fontSize: 14, color: COLORS.info[900], fontWeight: '600' }}>
                              📧 Enviar por Email
                            </Text>
                            <Text style={{ fontSize: 11, color: COLORS.gray[600] }}>
                              {studentEmail}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}

                      {studentPhone && Platform.OS !== 'web' && (
                        <TouchableOpacity
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 8,
                            backgroundColor: hexToRgba(COLORS.success[500], 0.05),
                            borderRadius: 6,
                          }}
                          onPress={() => setSendByWhatsApp(!sendByWhatsApp)}
                          activeOpacity={0.7}
                        >
                          <Checkbox.Android
                            status={sendByWhatsApp ? 'checked' : 'unchecked'}
                            onPress={() => setSendByWhatsApp(!sendByWhatsApp)}
                            color={COLORS.success[500]}
                          />
                          <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={{ fontSize: 14, color: COLORS.info[900], fontWeight: '600' }}>
                              💬 Compartilhar via WhatsApp
                            </Text>
                            <Text style={{ fontSize: 11, color: COLORS.gray[600] }}>
                              {studentPhone}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Botões de ação */}
          <View style={styles.actionContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !formData.graduation || !formData.modalityId}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
              labelStyle={styles.submitButtonLabel}
              icon={loading ? undefined : "content-save"}
            >
              {loading ? getString('saving') : getString('saveGraduation')}
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              disabled={loading}
              style={styles.cancelButton}
              contentStyle={styles.cancelButtonContent}
              labelStyle={styles.cancelButtonLabel}
            >{getString('cancel')}</Button>
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
              <Text style={styles.dialogTitle}>{getString('selectModality')}</Text>
            </View>
            <Dialog.ScrollArea>
              <ScrollView style={styles.dialogScroll}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>{getString('loadingModalities')}</Text>
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
                  <Text style={styles.emptyText}>{getString('noModalitiesFound')}</Text>
                )}
              </ScrollView>
            </Dialog.ScrollArea>
            <Dialog.Actions>
              <Button onPress={() => setModalityDialogVisible(false)}>{getString('cancel')}</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Portal>
          <Dialog visible={graduationDialogVisible} onDismiss={() => setGraduationDialogVisible(false)}>
            <Dialog.Title>{getString('selectGraduation')}</Dialog.Title>
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
                        <Text style={styles.dialogItemText}>{level.name || getString('unnamedGraduation')}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyText}>{getString('noGraduationsAvailable')}</Text>
                )}
              </ScrollView>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setGraduationDialogVisible(false)}>{getString('cancel')}</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Portal>
          <Dialog visible={instructorDialogVisible} onDismiss={() => setInstructorDialogVisible(false)}>
            <Dialog.Title>{getString('selectInstructor')}</Dialog.Title>
            <Dialog.Content>
              <ScrollView style={styles.dialogContent}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>{getString('loadingInstructors')}</Text>
                  </View>
                ) : instructors.length > 0 ? (
                  instructors.map((instructor, index) => (
                    <TouchableOpacity
                      key={instructor.id || `instructor-${index}`}
                      style={styles.dialogItem}
                      onPress={() => {
                        setFormData(prev => ({
                          ...prev,
                          instructor: instructor.name || instructor.displayName || instructor.email || getString('instructor'),
                          instructorId: instructor.id
                        }));
                        setInstructorDialogVisible(false);
                      }}
                    >
                      <Text style={styles.dialogItemText}>
                        {(instructor.name || instructor.displayName || instructor.email || getString('unnamedInstructor')).toString()}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyText}>{getString('noInstructorsFound')}</Text>
                )}
              </ScrollView>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setInstructorDialogVisible(false)}>{getString('cancel')}</Button>
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
            label: getString('ok'),
            onPress: () => setSnackbarVisible(false),
          }}
        >
          <Text style={{ color: COLORS.white }}>{snackbarMessage || getString('message')}</Text>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.base,
    color: COLORS.white + "CC",
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl * 3,
    maxWidth: width < 768 ? width : 768, // Limita largura em tablets
    alignSelf: 'center',
    width: '100%',
  },
  glassCard: {
    marginBottom: SPACING.md,
    backgroundColor: hexToRgba(COLORS.white, 0.9),
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.white, 0.5),
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
        boxShadow: `0 8px 32px 0 ${hexToRgba(COLORS.info[800], 0.15)}`,
        backdropFilter: 'blur(10px)',
      },
    }),
  },
  cardContent: {
    padding: SPACING.md,
  },
  currentGraduationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  currentGraduationText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  currentGraduationLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[600],
    textTransform: 'uppercase',
    fontWeight: FONT_WEIGHT.medium,
    letterSpacing: 0.5,
  },
  currentGraduationValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.black,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.gray[600],
    marginBottom: SPACING.sm,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: BORDER_WIDTH.base,
    borderColor: COLORS.gray[400],
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: hexToRgba(COLORS.white, 0.5),
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  dateButtonText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    textTransform: 'capitalize',
  },
  notesInput: {
    backgroundColor: 'transparent',
  },
  certificateInput: {
    backgroundColor: 'transparent',
  },
  actionContainer: {
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  submitButton: {
    backgroundColor: COLORS.info[700],
    borderRadius: BORDER_RADIUS.md,
  },
  submitButtonContent: {
    paddingVertical: SPACING.xs,
  },
  submitButtonLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  cancelButton: {
    borderColor: COLORS.gray[500],
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: hexToRgba(COLORS.white, 0.5),
  },
  cancelButtonContent: {
    paddingVertical: SPACING.xs,
  },
  cancelButtonLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray[700],
  },
  dialogTitleContainer: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  dialogTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.black,
  },
  dialogScroll: {
    maxHeight: 300,
  },
  loadingContainer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.gray[500],
  },
  emptyText: {
    padding: SPACING.md,
    textAlign: 'center',
    color: COLORS.gray[500],
  },
  dialogContent: {
    maxHeight: 300,
  },
  dialogItem: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  dialogItemText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
  },
  graduationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
});

export default AddGraduationScreen;
