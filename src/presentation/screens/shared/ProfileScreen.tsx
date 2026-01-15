import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions, Platform, TouchableOpacity, ScrollView } from 'react-native';
import {
  Button,
  Avatar,
  TextInput,
  Divider,
  Text,
  Chip,
  List,
  Modal,
  Portal,
  Surface,
  SegmentedButtons,
  HelperText
} from 'react-native-paper';
import ModernCard from '@components/modern/ModernCard';
import AnimatedButton from '@components/AnimatedButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { useCustomClaims } from '@hooks/useCustomClaims';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import PaymentDueDateEditor from '@components/PaymentDueDateEditor';
import type { NavigationProp } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT, BORDER_WIDTH, GLASS, ANIMATION } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import { hexToRgba } from '@shared/utils/colorUtils';

interface ProfileScreenProps {
  navigation: NavigationProp<any>;
}

const { width } = Dimensions.get('window');

/**
 * Tela de perfil do usuário
 * Exibe informações pessoais, dados da academia, treinos e configurações
 */
const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, userProfile, logout: signOut, updateUserProfile: updateProfile, academia } = useAuthFacade();
  const { getString, isDarkMode, theme } = useTheme();
  const { getUserTypeColor: getClaimsTypeColor, getUserTypeText: getClaimsTypeText, isStudent } = useCustomClaims();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthDate: '',
    gender: 'male',
    // Endereço
    zipCode: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    // Contato de Emergência
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    medicalInfo: ''
  });

  // Estados para as novas funcionalidades
  const [trainingData, setTrainingData] = useState<any>({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showYearModal, setShowYearModal] = useState(false);
  const [physicalEvaluations, setPhysicalEvaluations] = useState<any[]>([]);
  const [injuries, setInjuries] = useState<any[]>([]);
  const [checkInStats, setCheckInStats] = useState({
    thisWeek: 0,
    total: 14,
    nextPayment: new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString()
  });

  // Estados para pagamentos
  const [currentPayment, setCurrentPayment] = useState<any>(null);
  const [showPaymentEditor, setShowPaymentEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentDueNotification, setPaymentDueNotification] = useState<any>(null);

  const processTrainingData = (trainingHistory: any) => {
    const data: any = {};
    trainingHistory.forEach((training: any) => {
      const date = training.date && typeof training.date.toDate === 'function'
        ? training.date.toDate()
        : new Date(training.date);

      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();

      if (!data[year]) data[year] = {};
      if (!data[year][month]) data[year][month] = {};
      data[year][month][day] = true;
    });
    return data;
  };

  const loadStudentData = async () => {
    if (!user?.id || !academia?.id) return;
    try {
      const userId = user.id;
      const academiaId = academia.id;
      if (!userId || !academiaId) return;

      const trainingHistory = await academyFirestoreService.getWhere(
        'checkIns',
        'studentId',
        '==',
        userId,
        academiaId
      );
      setTrainingData(processTrainingData(trainingHistory));

      const evaluations = await academyFirestoreService.getWhere(
        'physicalEvaluations',
        'studentId',
        '==',
        userId,
        academiaId
      );
      setPhysicalEvaluations(evaluations);

      const userInjuries = await academyFirestoreService.getWhere(
        'injuries',
        'studentId',
        '==',
        userId,
        academiaId
      );
      setInjuries(userInjuries);
    } catch (error) {
      console.error(getString('loadingStudentData'), error);
    }
  };

  const loadCurrentPayment = async () => {
    if (!user?.id || !academia?.id) return;
    try {
      const userId = user.id;
      const academiaId = academia.id;
      if (!userId || !academiaId) return;

      const payments = await academyFirestoreService.getWhere(
        'payments',
        'studentId',
        '==',
        userId,
        academiaId
      );
      if (!payments || payments.length === 0) return;
      const payment = payments.find((p: any) => p.status === 'pending') || payments[0];
      setCurrentPayment(payment);
    } catch (error) {
      console.error(getString('loadingPaymentData'), error);
    }
  };

  const checkPaymentDueNotification = async () => {
    if (!user || !academia || !currentPayment) return;
    try {
      const today = new Date();
      const dueDate = currentPayment.dueDate.toDate ? currentPayment.dueDate.toDate() : new Date(currentPayment.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDue <= 3 && daysUntilDue >= 0 && currentPayment.status === 'pending') {
        const planName = currentPayment.planName || getString('monthlyPayment');
        setPaymentDueNotification({
          daysUntilDue,
          dueDate: dueDate.toLocaleDateString(),
          amount: currentPayment.amount,
          planName: planName
        });
      }
    } catch (error) {
      console.error(getString('checkingPaymentDue'), error);
    }
  };

  useEffect(() => {
    const formatDate = (date: any) => {
      if (!date) return '';
      try {
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('pt-BR');
      } catch (e) {
        return '';
      }
    };

    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        birthDate: formatDate(userProfile.dateOfBirth),
        gender: userProfile.gender || 'male',

        // Address
        zipCode: userProfile.address?.zipCode || '',
        street: userProfile.address?.street || '',
        number: (userProfile.address as any)?.number || '',

        // Re-reading entities.ts: UserProfile address matches UpdateProfileData address.
        // I will implement separate fields in UI, but maybe concatenate for storage if I shouldn't change the model?
        // The user says "dados pessoais de acordo com o banco". If the *Student* table has number, I should probably save it.
        // The `AUTH` profile might trigger a sync to `STUDENTS` collection?
        // Let's assume I should follow the detailed Student Address structure if possible.
        // I'll add the fields to formData.

        neighborhood: (userProfile.address as any)?.neighborhood || '',
        // number removed (duplicate)

        city: userProfile.address?.city || '',
        state: userProfile.address?.state || '',

        // Emergency
        emergencyName: userProfile.emergencyContact?.name || '',
        emergencyPhone: userProfile.emergencyContact?.phone || '',
        emergencyRelationship: userProfile.emergencyContact?.relationship || '',

        medicalInfo: userProfile.medicalInfo?.notes || ''
      });

      if (userProfile.userType === 'student') {
        loadStudentData();
        loadCurrentPayment();
        checkPaymentDueNotification();
      }
    }
  }, [userProfile, currentPayment]); // Added currentPayment to dependency to re-check notification if payment changes

  const handleSave = async () => {
    try {
      setLoading(true);
      // Parse date
      let dateOfBirth: Date | undefined;
      if (formData.birthDate) {
        const [day, month, year] = formData.birthDate.split('/');
        if (day && month && year) {
          dateOfBirth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      }

      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        dateOfBirth,
        gender: formData.gender as any,
        address: {
          street: formData.street,
          number: formData.number,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        } as any,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relationship: formData.emergencyRelationship
        },
        medicalInfo: {
          ...userProfile?.medicalInfo,
          notes: formData.medicalInfo
        }
      });
      setEditing(false);
      Alert.alert(getString('success'), getString('profileUpdatedSuccess'));
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert(getString('error'), getString('cannotUpdateProfile'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      getString('logout'),
      getString('confirmLogout'),
      [
        { text: getString('cancel'), style: 'cancel' },
        {
          text: getString('logout'),
          style: 'destructive',
          onPress: signOut
        }
      ]
    );
  };

  const getDaysOfWeek = () => {
    const days = getString('daysOfWeekShort');
    return Array.isArray(days) ? days : ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  }

  const renderMonthDays = (monthIndex: number, monthData: any) => {
    const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
    const dots = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const hasTraining = monthData[day];
      dots.push(
        <View
          key={day}
          style={[
            styles.trainingMiniDot,
            hasTraining ? styles.trainingDotActive : styles.trainingDotEmpty
          ]}
        />
      );
    }
    return dots;
  };

  const renderMonthsGrid = () => {
    const months = [
      getString('janShort'), getString('febShort'), getString('marShort'),
      getString('aprShort'), getString('mayShort'), getString('junShort'),
      getString('julShort'), getString('augShort'), getString('sepShort'),
      getString('octShort'), getString('novShort'), getString('decShort')
    ];

    return (
      <View style={styles.monthsGrid}>
        {months.map((month, monthIndex) => {
          const monthData = (trainingData[selectedYear] || {})[monthIndex] || {};
          const trainingCount = Object.keys(monthData).length;

          return (
            <Animated.View
              key={`${selectedYear}-${monthIndex}`}
              entering={FadeIn.delay(monthIndex * 50)}
              style={styles.monthCardGlassEffect}
            >
              <View style={styles.monthHeader}>
                <Text style={styles.monthNameText}>{month}</Text>
                <View style={styles.monthCountBadgeContainer}>
                  <Text style={styles.monthCountBadgeText}>{trainingCount}</Text>
                </View>
              </View>

              <View style={styles.monthDaysGrid}>
                {renderMonthDays(monthIndex, monthData)}
              </View>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={getAuthGradient(isDarkMode) as any}
      style={[
        styles.gradient,
        {
          minHeight: 0,
          height: Platform.OS === 'web' ? '100vh' : '100%',
          overflow: 'hidden'
        } as any
      ]}
    >
      <SafeAreaView style={[styles.container, { minHeight: 0 }]}>
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollViewContent, { minHeight: '101%' }]}
          entering={FadeIn}
          showsVerticalScrollIndicator={true}
          persistentScrollbar={true}
          alwaysBounceVertical={true}
        >
          {/* Header do Perfil */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <ModernCard variant={isDarkMode ? "premium" : "light"} style={styles.headerCard}>
              <View style={styles.headerContent}>
                <Avatar.Text
                  size={80}
                  label={userProfile?.name?.charAt(0) || 'U'}
                  style={[styles.avatar, { backgroundColor: getClaimsTypeColor() }]}
                />
                <View style={styles.headerText}>
                  <Text style={[styles.userName, styles.title, { color: theme.colors.text }]}>
                    {userProfile?.name || getString('user')}
                  </Text>
                  <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{user?.email}</Text>
                  <Chip
                    mode="outlined"
                    style={[styles.userTypeChip, { borderColor: getClaimsTypeColor() }]}
                    textStyle={{ color: getClaimsTypeColor() }}
                  >
                    {getClaimsTypeText()}
                  </Chip>
                </View>
              </View>
            </ModernCard>
          </Animated.View>

          {/* Notificação de Vencimento */}
          {paymentDueNotification && (
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <ModernCard variant={isDarkMode ? "premium" : "light"} style={styles.warningCard}>
                <View>
                  <View style={styles.cardHeader}>
                    <Ionicons name="warning-outline" size={24} color={COLORS.error[400]} />
                    <Text style={[styles.cardTitle, styles.title, { color: COLORS.error[400] }]}>{getString('paymentNearDue')}</Text>
                  </View>

                  <View style={styles.paymentWarning}>
                    <Text style={[styles.warningText, { color: theme.colors.text }]}>
                      {getString('paymentDueText').replace('{planName}', paymentDueNotification?.planName || '').replace('{days}',
                        paymentDueNotification?.daysUntilDue === 0 ? getString('paymentDueToday') :
                          paymentDueNotification?.daysUntilDue === 1 ? getString('paymentDueTomorrow') :
                            `${paymentDueNotification?.daysUntilDue} ${getString('paymentDueInDays')}`
                      )}
                    </Text>
                    <Text style={[styles.warningDetails, { color: theme.colors.textSecondary }]}>
                      {getString('dateLabel')}: {paymentDueNotification.dueDate} | {getString('valueLabel')}: {getString('currency') === 'BRL' ? 'R$' : getString('currency')} {paymentDueNotification.amount?.toFixed(2)}
                    </Text>

                    <View style={styles.warningButtons}>
                      <AnimatedButton
                        mode="outlined"
                        onPress={() => setShowPaymentEditor(true)}
                        style={[styles.editDateButton, { borderColor: COLORS.error[400] }]}
                        icon="calendar-edit"
                        textColor={COLORS.error[400]}
                      >
                        {getString('changeDate')}
                      </AnimatedButton>
                      <AnimatedButton
                        mode="contained"
                        onPress={() => navigation.navigate('StudentPayments')}
                        style={[styles.payNowButton, { backgroundColor: COLORS.error[500] }]}
                        icon="credit-card"
                      >
                        {getString('payNow')}
                      </AnimatedButton>
                    </View>
                  </View>
                </View>
              </ModernCard>
            </Animated.View>
          )}

          {/* Informações Pessoais */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <ModernCard variant={isDarkMode ? "card" : "medium"}>
              <View>
                <View style={styles.cardHeader}>
                  <Ionicons name="person-outline" size={24} color={COLORS.info[500]} />
                  <Text style={[styles.cardTitle, styles.title, { color: theme.colors.text }]}>{getString('personalInformation')}</Text>
                  <AnimatedButton
                    mode="text"
                    onPress={() => setEditing(!editing)}
                    icon={editing ? "close" : "pencil"}
                    textColor={COLORS.info[500]}
                  >
                    {editing ? getString('cancel') : getString('edit')}
                  </AnimatedButton>
                </View>

                {editing ? (
                  <View>
                    <TextInput
                      label={getString('fullName')}
                      value={formData.name}
                      onChangeText={(text) => setFormData({ ...formData, name: text })}
                      mode="outlined"
                      style={styles.input}
                      textColor={theme.colors.text}
                    />

                    <TextInput
                      label={getString('birthDate')}
                      value={formData.birthDate}
                      onChangeText={(text) => {
                        // Simple mask logic DD/MM/YYYY
                        let v = text.replace(/\D/g, '');
                        if (v.length > 8) v = v.substring(0, 8);
                        if (v.length > 4) v = `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4)}`;
                        else if (v.length > 2) v = `${v.substring(0, 2)}/${v.substring(2)}`;
                        setFormData({ ...formData, birthDate: v });
                      }}
                      placeholder="DD/MM/AAAA"
                      keyboardType="numeric"
                      mode="outlined"
                      style={styles.input}
                      textColor={theme.colors.text}
                      maxLength={10}
                    />

                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>{getString('gender')}</Text>
                      <SegmentedButtons
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        buttons={[
                          { value: 'male', label: getString('male') || 'Masculino' },
                          { value: 'female', label: getString('female') || 'Feminino' },
                          { value: 'other', label: getString('other') || 'Outro' },
                        ]}
                        style={styles.segmentedButton}
                      />
                    </View>

                    <TextInput
                      label={getString('phoneWhatsApp')}
                      value={formData.phone}
                      onChangeText={(text) => setFormData({ ...formData, phone: text })}
                      mode="outlined"
                      keyboardType="phone-pad"
                      style={styles.input}
                      textColor={theme.colors.text}
                    />

                    <Divider style={[styles.divider, { marginVertical: SPACING.md }]} />
                    <Text style={[styles.sectionHeader, { color: COLORS.primary[500] }]}>{getString('address')}</Text>

                    <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                      <TextInput
                        label={getString('zipCode') || 'CEP'}
                        value={formData.zipCode}
                        onChangeText={(text) => setFormData({ ...formData, zipCode: text })}
                        mode="outlined"
                        keyboardType="numeric"
                        style={[styles.input, { flex: 1 }]}
                        textColor={theme.colors.text}
                      />
                      <TextInput
                        label={getString('state') || 'UF'}
                        value={formData.state}
                        onChangeText={(text) => setFormData({ ...formData, state: text })}
                        mode="outlined"
                        style={[styles.input, { width: 80 }]}
                        textColor={theme.colors.text}
                      />
                    </View>

                    <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                      <TextInput
                        label={getString('street') || 'Logradouro'}
                        value={formData.street}
                        onChangeText={(text) => setFormData({ ...formData, street: text })}
                        mode="outlined"
                        style={[styles.input, { flex: 2 }]}
                        textColor={theme.colors.text}
                      />
                      <TextInput
                        label={getString('number') || 'Nº'}
                        value={formData.number}
                        onChangeText={(text) => setFormData({ ...formData, number: text })}
                        mode="outlined"
                        style={[styles.input, { flex: 0.8 }]}
                        textColor={theme.colors.text}
                      />
                    </View>

                    <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                      <TextInput
                        label={getString('neighborhood') || 'Bairro'}
                        value={formData.neighborhood}
                        onChangeText={(text) => setFormData({ ...formData, neighborhood: text })}
                        mode="outlined"
                        style={[styles.input, { flex: 1 }]}
                        textColor={theme.colors.text}
                      />
                      <TextInput
                        label={getString('city') || 'Cidade'}
                        value={formData.city}
                        onChangeText={(text) => setFormData({ ...formData, city: text })}
                        mode="outlined"
                        style={[styles.input, { flex: 1 }]}
                        textColor={theme.colors.text}
                      />
                    </View>

                    <Divider style={[styles.divider, { marginVertical: SPACING.md }]} />
                    <Text style={[styles.sectionHeader, { color: COLORS.primary[500] }]}>{getString('emergencyContact')}</Text>

                    <TextInput
                      label={getString('contactName') || 'Nome do Contato'}
                      value={formData.emergencyName}
                      onChangeText={(text) => setFormData({ ...formData, emergencyName: text })}
                      mode="outlined"
                      style={styles.input}
                      textColor={theme.colors.text}
                    />

                    <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                      <TextInput
                        label={getString('contactPhone') || 'Telefone'}
                        value={formData.emergencyPhone}
                        onChangeText={(text) => setFormData({ ...formData, emergencyPhone: text })}
                        mode="outlined"
                        keyboardType="phone-pad"
                        style={[styles.input, { flex: 1.5 }]}
                        textColor={theme.colors.text}
                      />
                      <TextInput
                        label={getString('relationship') || 'Parentesco'}
                        value={formData.emergencyRelationship}
                        onChangeText={(text) => setFormData({ ...formData, emergencyRelationship: text })}
                        mode="outlined"
                        style={[styles.input, { flex: 1 }]}
                        textColor={theme.colors.text}
                      />
                    </View>

                    <Divider style={[styles.divider, { marginVertical: SPACING.md }]} />
                    <Text style={[styles.sectionHeader, { color: COLORS.primary[500] }]}>{getString('medicalInformation')}</Text>

                    <TextInput
                      label={getString('medicalInformation')}
                      value={formData.medicalInfo}
                      onChangeText={(text) => setFormData({ ...formData, medicalInfo: text })}
                      mode="outlined"
                      multiline
                      numberOfLines={3}
                      style={styles.input}
                      placeholder={getString('allergiesMedicationsConditions')}
                      textColor={theme.colors.text}
                    />

                    <AnimatedButton
                      mode="contained"
                      onPress={handleSave}
                      style={[styles.saveButton, { backgroundColor: COLORS.primary[500] }]}
                      icon="check"
                      loading={loading}
                    >
                      {getString('saveChanges')}
                    </AnimatedButton>
                  </View>
                ) : (
                  <View>
                    <List.Item
                      title={getString('name')}
                      description={userProfile?.name || getString('notInformed')}
                      left={() => <List.Icon icon="account" color={COLORS.info[500]} />}
                      titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                      descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                    />
                    <Divider style={[styles.divider, { backgroundColor: COLORS.border.subtle }]} />

                    <List.Item
                      title={getString('phone')}
                      description={userProfile?.phone || getString('notInformed')}
                      left={() => <List.Icon icon="phone" color={COLORS.info[500]} />}
                      titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                      descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                    />
                    <Divider style={[styles.divider, { backgroundColor: COLORS.border.subtle }]} />

                    <List.Item
                      title={getString('birthDate')}
                      description={userProfile?.dateOfBirth ?
                        ((userProfile.dateOfBirth as any).toDate ? (userProfile.dateOfBirth as any).toDate().toLocaleDateString('pt-BR') : new Date(userProfile.dateOfBirth).toLocaleDateString('pt-BR')) :
                        getString('notInformed')}
                      left={() => <List.Icon icon="cake" color={COLORS.info[500]} />}
                      titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                      descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                    />
                    <Divider style={[styles.divider, { backgroundColor: COLORS.border.subtle }]} />

                    <List.Item
                      title={getString('address')}
                      description={userProfile?.address ?
                        `${userProfile.address.street || ''}${(userProfile.address as any).number ? ', ' + (userProfile.address as any).number : ''}
${(userProfile.address as any).neighborhood ? (userProfile.address as any).neighborhood + ' - ' : ''}${userProfile.address.city || ''}/${userProfile.address.state || ''}
${userProfile.address.zipCode || ''}` :
                        getString('notInformed')
                      }
                      left={() => <List.Icon icon="map-marker" color={COLORS.info[500]} />}
                      titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                      descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                      descriptionNumberOfLines={3}
                    />
                    <Divider style={[styles.divider, { backgroundColor: COLORS.border.subtle }]} />

                    <List.Item
                      title={getString('emergencyContact')}
                      description={userProfile?.emergencyContact ?
                        `${userProfile.emergencyContact.name} - ${userProfile.emergencyContact.relationship}
${userProfile.emergencyContact.phone}` :
                        getString('notInformed')
                      }
                      left={() => <List.Icon icon="phone-alert" color={COLORS.error[400]} />}
                      titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                      descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                    />
                    <Divider style={[styles.divider, { backgroundColor: COLORS.border.subtle }]} />

                    <List.Item
                      title={getString('medicalInformation')}
                      description={userProfile?.medicalInfo?.notes || getString('notInformed')}
                      left={() => <List.Icon icon="medical-bag" color={COLORS.info[400]} />}
                      titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                      descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                    />
                  </View>
                )}
              </View>
            </ModernCard>
          </Animated.View>

          {/* Informações da Academia (apenas para alunos) */}
          {isStudent() && (
            <>
              <Animated.View entering={FadeInDown.delay(400).springify()}>
                <ModernCard variant="medium">
                  <View>
                    <View style={styles.cardHeader}>
                      <Ionicons name="school-outline" size={24} color={COLORS.primary[500]} />
                      <Text style={[styles.cardTitle, styles.title, { color: theme.colors.text }]}>{getString('academyInformation')}</Text>
                    </View>

                    <List.Item
                      title={getString('academy')}
                      description={academia?.name || (userProfile as any)?.academiaName || getString('notInformed')}
                      left={() => <List.Icon icon="office-building" color={COLORS.primary[500]} />}
                      titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                      descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                    />
                    <Divider style={[styles.divider, { backgroundColor: COLORS.border.subtle }]} />

                    <List.Item
                      title={getString('currentGraduation')}
                      description={userProfile?.currentGraduation || getString('beginner')}
                      left={() => <List.Icon icon="trophy" color={COLORS.warning[300]} />}
                      titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                      descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                    />
                    <Divider style={[styles.divider, { backgroundColor: COLORS.border.subtle }]} />

                    <List.Item
                      title={getString('currentPlan')}
                      description={(userProfile as any)?.currentPlan || getString('notDefined')}
                      left={() => <List.Icon icon="card" color={COLORS.primary[500]} />}
                      titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                      descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                    />
                    <Divider style={[styles.divider, { backgroundColor: COLORS.border.subtle }]} />

                    <List.Item
                      title={getString('startDate')}
                      description={(userProfile as any)?.startDate ?
                        new Date((userProfile as any).startDate).toLocaleDateString() :
                        getString('notInformed')
                      }
                      left={() => <List.Icon icon="calendar-start" color={COLORS.primary[500]} />}
                      titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                      descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                    />
                  </View>
                </ModernCard>
              </Animated.View>

              {/* Treinos esta semana */}
              <Animated.View entering={FadeInDown.delay(500).springify()}>
                <ModernCard variant="subtle">
                  <View>
                    <View style={styles.cardHeader}>
                      <Ionicons name="calendar-outline" size={24} color={COLORS.info[500]} />
                      <Text style={[styles.cardTitle, styles.title, { color: theme.colors.text }]}>{getString('trainingsThisWeek')}</Text>
                      <AnimatedButton
                        mode="text"
                        onPress={() => setShowYearModal(true)}
                        icon="plus"
                        textColor={COLORS.info[500]}
                      >
                        {getString('details')}
                      </AnimatedButton>
                    </View>

                    <View style={styles.weekDays}>
                      {getDaysOfWeek().map((day: string, index: number) => (
                        <View key={index} style={styles.dayCircle}>
                          <Text style={[styles.dayText, { color: theme.colors.text }]}>{day}</Text>
                        </View>
                      ))}
                    </View>

                    <Text style={[styles.noTrainingText, { color: theme.colors.textSecondary }]}>{getString('noTrainingThisWeek')}</Text>
                  </View>
                </ModernCard>
              </Animated.View>

              {/* Grid de Stats Rápidos */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.md }}>
                <Animated.View entering={FadeInDown.delay(600).springify()} style={{ flex: 1, marginRight: SPACING.xs }}>
                  <ModernCard variant="medium" style={{ marginHorizontal: 0 }}>
                    <TouchableOpacity onPress={() => { }} style={{ alignItems: 'center', padding: SPACING.sm }}>
                      <Ionicons name="document-outline" size={32} color={COLORS.primary[500]} />
                      <Text style={{ color: theme.colors.text, fontWeight: 'bold', marginTop: SPACING.xs, fontSize: 12 }}>{getString('contracts')}</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>{checkInStats.nextPayment}</Text>
                    </TouchableOpacity>
                  </ModernCard>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(700).springify()} style={{ flex: 1, marginLeft: SPACING.xs }}>
                  <ModernCard variant="medium" style={{ marginHorizontal: 0 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('CheckIn')} style={{ alignItems: 'center', padding: SPACING.sm }}>
                      <Ionicons name="checkmark-circle-outline" size={32} color={COLORS.success[500]} />
                      <Text style={{ color: theme.colors.text, fontWeight: 'bold', marginTop: SPACING.xs, fontSize: 12 }}>{getString('checkIns')}</Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>{checkInStats.thisWeek}/{checkInStats.total}</Text>
                    </TouchableOpacity>
                  </ModernCard>
                </Animated.View>
              </View>

              {/* Avaliações físicas */}
              <Animated.View entering={FadeInDown.delay(800).springify()}>
                <ModernCard variant="subtle">
                  <View>
                    <List.Item
                      title={getString('physicalEvaluations')}
                      description={physicalEvaluations.length > 0 ?
                        `${physicalEvaluations.length} ${getString('evaluationsRegistered')}` :
                        getString('noEvaluationsRegistered')
                      }
                      left={() => <List.Icon icon="clipboard-pulse-outline" color={COLORS.info[500]} />}
                      right={() => <List.Icon icon="chevron-right" color={COLORS.text.tertiary} />}
                      titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                      descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                      onPress={() => navigation.navigate('SharedScreens', { screen: 'PhysicalEvaluationHistory' })}
                    />
                  </View>
                </ModernCard>
              </Animated.View>

              {/* Minhas Lesões */}
              <Animated.View entering={FadeInDown.delay(900).springify()}>
                <ModernCard variant="subtle">
                  <View>
                    <List.Item
                      title={getString('myInjuries')}
                      description={injuries.length > 0 ?
                        `${injuries.length} ${getString('injuriesRegistered')}` :
                        getString('noInjuriesRegistered')
                      }
                      left={() => <List.Icon icon="bandage" color={COLORS.error[400]} />}
                      right={() => <List.Icon icon="chevron-right" color={COLORS.text.tertiary} />}
                      onPress={() => navigation.navigate('SharedScreens', { screen: 'InjuryHistory' })}
                      titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                      descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                    />
                  </View>
                </ModernCard>
              </Animated.View>
            </>
          )}

          {/* Configurações da Conta */}
          <Animated.View entering={FadeInDown.delay(1000).springify()}>
            <ModernCard variant={isDarkMode ? "card" : "medium"}>
              <View>
                <View style={styles.cardHeader}>
                  <Ionicons name="settings-outline" size={24} color={COLORS.text.secondary} />
                  <Text style={[styles.cardTitle, styles.title, { color: theme.colors.text }]}>{getString('accountSettings')}</Text>
                </View>

                <List.Item
                  title={getString('changePassword')}
                  description={getString('clickToChangePassword')}
                  left={() => <List.Icon icon="lock" color={COLORS.text.secondary} />}
                  right={() => <List.Icon icon="chevron-right" color={COLORS.text.tertiary} />}
                  onPress={() => navigation.navigate('SharedScreens', { screen: 'ChangePassword' })}
                  titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                  descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                />
                <Divider style={[styles.divider, { backgroundColor: COLORS.border.subtle }]} />

                <List.Item
                  title={getString('physicalEvaluations')}
                  description={getString('trackPhysicalProgress')}
                  left={() => <List.Icon icon="scale" color={theme.colors.textSecondary} />}
                  right={() => <List.Icon icon="chevron-right" color={COLORS.text.tertiary} />}
                  onPress={() => navigation.navigate('SharedScreens', { screen: 'PhysicalEvaluation' })}
                  titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                  descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                />
                <Divider style={[styles.divider, { backgroundColor: COLORS.border.subtle }]} />

                <List.Item
                  title={getString('evaluationHistory')}
                  description={getString('viewAllEvaluations')}
                  left={() => <List.Icon icon="history" color={COLORS.text.secondary} />}
                  right={() => <List.Icon icon="chevron-right" color={COLORS.text.tertiary} />}
                  onPress={() => navigation.navigate('SharedScreens', { screen: 'PhysicalEvaluationHistory' })}
                  titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                  descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                />
                <Divider style={[styles.divider, { backgroundColor: COLORS.border.subtle }]} />

                <List.Item
                  title={getString('notifications')}
                  description={getString('configureAppNotifications')}
                  left={() => <List.Icon icon="bell" color={COLORS.text.secondary} />}
                  right={() => <List.Icon icon="chevron-right" color={COLORS.text.tertiary} />}
                  onPress={() => navigation.navigate('SharedScreens', { screen: 'NotificationSettings' })}
                  titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                  descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                />
                <Divider style={[styles.divider, { backgroundColor: COLORS.border.subtle }]} />

                <List.Item
                  title={getString('privacyAndSecurity')}
                  description={getString('privacyLGPDSettings')}
                  left={() => <List.Icon icon="shield" color={COLORS.text.secondary} />}
                  right={() => <List.Icon icon="chevron-right" color={COLORS.text.tertiary} />}
                  onPress={() => navigation.navigate('SharedScreens', { screen: 'PrivacySettings' })}
                  titleStyle={[styles.listItemTitle, { color: theme.colors.text }]}
                  descriptionStyle={[styles.listItemDescription, { color: theme.colors.textSecondary }]}
                />
              </View>
            </ModernCard>
          </Animated.View>

          {/* Ações da Conta */}
          <Animated.View entering={FadeInDown.delay(1100).springify()}>
            <ModernCard variant="subtle">
              <View>
                <AnimatedButton
                  mode="outlined"
                  onPress={handleLogout}
                  style={[styles.logoutButton, { borderColor: COLORS.error[500] }]}
                  icon="logout"
                  textColor={COLORS.error[500]}
                >
                  {getString('signOut')}
                </AnimatedButton>
              </View>
            </ModernCard>
          </Animated.View>
        </Animated.ScrollView>

        {/* Modal Treinos no Ano - Versão Glassmorphism Modernizada */}
        <Portal>
          <Modal
            visible={showYearModal}
            onDismiss={() => setShowYearModal(false)}
            contentContainerStyle={styles.modalCenteredContainer}
          >
            <Animated.View
              entering={ZoomIn.duration(400).springify()}
              style={[styles.glassModalContent]}
            >
              <View style={styles.modalHeader}>
                <View style={styles.headerTitleRow}>
                  <Surface style={styles.headerIconBg} elevation={1}>
                    <Ionicons name="calendar" size={20} color={COLORS.primary[400]} />
                  </Surface>
                  <Text style={styles.glassModalTitle}>{getString('trainingsThisYear')}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowYearModal(false)}
                  style={styles.closeIconButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color={COLORS.text.tertiary} />
                </TouchableOpacity>
              </View>

              <View style={styles.yearSelectionContainer}>
                <TouchableOpacity
                  onPress={() => setSelectedYear(selectedYear - 1)}
                  style={styles.yearNavButton}
                >
                  <Ionicons name="chevron-back" size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>

                <Animated.View
                  key={selectedYear}
                  entering={FadeIn.duration(300)}
                  style={styles.activeYearWrapper}
                >
                  <Text style={styles.activeYearText}>{selectedYear}</Text>
                  <View style={styles.activeYearGlow} />
                </Animated.View>

                <TouchableOpacity
                  onPress={() => setSelectedYear(selectedYear + 1)}
                  style={styles.yearNavButton}
                >
                  <Ionicons name="chevron-forward" size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.glassMonthsScroll}
                showsVerticalScrollIndicator={false}
              >
                {renderMonthsGrid()}
              </ScrollView>

              <View style={styles.modalFooterLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.trainingMiniDot, styles.trainingDotActive]} />
                  <Text style={styles.legendLabelText}>{getString('attended')}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.trainingMiniDot, styles.trainingDotEmpty]} />
                  <Text style={styles.legendLabelText}>{getString('absent')}</Text>
                </View>
              </View>
            </Animated.View>
          </Modal>
        </Portal>

        {/* Modal Editor de Data de Vencimento */}
        <PaymentDueDateEditor
          visible={showPaymentEditor}
          onDismiss={() => setShowPaymentEditor(false)}
          currentPayment={currentPayment}
          onUpdate={() => {
            loadCurrentPayment();
            checkPaymentDueNotification();
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 150,
  },
  headerCard: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  avatar: {
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 22,
    marginBottom: SPACING.xs,
    color: COLORS.text.primary,
  },
  userEmail: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  userTypeChip: {
    alignSelf: 'flex-start',
    borderWidth: BORDER_WIDTH.base,
    backgroundColor: 'transparent',
  },
  warningCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: hexToRgba(COLORS.warning[500], 0.1), // 10% opacity warning yellow
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning[500],
  },
  paymentWarning: {
    marginTop: SPACING.sm,
  },
  warningText: {
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.sm,
    color: COLORS.text.primary,
  },
  warningDays: {
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.warning[500],
  },
  warningDetails: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  warningButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  editDateButton: {
    flex: 1,
    borderColor: COLORS.warning[500],
  },
  payNowButton: {
    flex: 1,
    backgroundColor: COLORS.primary[500],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.lg,
    flex: 1,
    color: COLORS.text.primary,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: 'transparent',
  },
  saveButton: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primary[500],
  },
  logoutButton: {
    borderColor: COLORS.error[500],
    margin: SPACING.sm,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: hexToRgba(COLORS.white, 0.05),
    borderColor: hexToRgba(COLORS.white, 0.1),
    borderWidth: BORDER_WIDTH.thin,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.secondary,
  },
  noTrainingText: {
    textAlign: 'center',
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  divider: {
    backgroundColor: hexToRgba(COLORS.white, 0.1),
  },
  // Estilos Modernizados com Glassmorphism
  modalCenteredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: hexToRgba(COLORS.black, 0.4),
  },
  glassModalContent: {
    width: width * 0.95,
    maxWidth: 500,
    ...GLASS.modal,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: hexToRgba(COLORS.primary[500], 0.15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassModalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  closeIconButton: {
    padding: SPACING.xs,
  },
  yearSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.lg,
  },
  yearNavButton: {
    padding: SPACING.sm,
    backgroundColor: hexToRgba(COLORS.white, 0.05),
    borderRadius: BORDER_RADIUS.full,
  },
  activeYearWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  activeYearText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.primary[400],
    letterSpacing: 1,
  },
  activeYearGlow: {
    position: 'absolute',
    bottom: -4,
    width: '120%',
    height: 4,
    backgroundColor: COLORS.primary[500],
    borderRadius: 2,
    opacity: 0.6,
    shadowColor: COLORS.primary[500],
    shadowRadius: 10,
    shadowOpacity: 0.5,
  },
  glassMonthsScroll: {
    maxHeight: 450,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthCardGlassEffect: {
    width: '48%',
    backgroundColor: hexToRgba(COLORS.gray[400], 0.05),
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.white, 0.05),
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  monthNameText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  monthCountBadgeContainer: {
    backgroundColor: hexToRgba(COLORS.primary[500], 0.2),
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  monthCountBadgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary[400],
  },
  monthDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  trainingMiniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trainingDotActive: {
    backgroundColor: COLORS.primary[500],
    shadowColor: COLORS.primary[500],
    shadowRadius: 4,
    shadowOpacity: 0.6,
  },
  trainingDotEmpty: {
    backgroundColor: hexToRgba(COLORS.white, 0.1),
  },
  modalFooterLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: hexToRgba(COLORS.white, 0.1),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendLabelText: {
    fontSize: 10,
    color: COLORS.text.secondary,
  },
  listItemTitle: {
    color: COLORS.text.primary,
  },
  listItemDescription: {
    color: COLORS.text.secondary,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.sm,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    marginBottom: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    marginLeft: SPACING.xs,
  },
  sectionHeader: {
    fontSize: FONT_SIZE.base,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  segmentedButton: {
    marginBottom: SPACING.xs,
  },
});

export default ProfileScreen;
