import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity, Modal as RNModal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Card,
  Button,
  Avatar,
  Chip,
  Divider,
  Text,
  List,
  FAB,
  Searchbar,
  Menu,
  IconButton,
  TextInput,
  Portal,
  Modal
} from 'react-native-paper';
import AddStudentForm from '@screens/admin/AddStudentScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService, academyStudentService, academyClassService } from '@infrastructure/services/academyFirestoreService';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@infrastructure/services/cacheService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import InstructorStudentsSkeleton from '@components/skeletons/InstructorStudentsSkeleton';
import { EnhancedFlashList } from '@components/EnhancedFlashList';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT, BORDER_WIDTH, OPACITY, GLASS } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import { useProfileTheme } from '../../../contexts/ProfileThemeContext';
import { hexToRgba } from '@shared/utils/colorUtils';
import StudentDetailsModal from '@components/StudentDetailsModal';
import GlassCard from '@components/GlassCard';
import SectionHeader from '@components/SectionHeader';
import StatusBadge from '@components/StatusBadge';
import IconContainer from '@components/IconContainer';

const InstructorStudents = ({ navigation }) => {
  const { currentTheme } = useThemeToggle();
  const { theme: profileTheme } = useProfileTheme();

  const { user, userProfile, academia } = useAuthFacade();
  const { getString } = useTheme();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  // Advanced filters
  const [genderMenuVisible, setGenderMenuVisible] = useState(false);
  const [modalityMenuVisible, setModalityMenuVisible] = useState(false);
  const [selectedGender, setSelectedGender] = useState(''); // 'male' | 'female' | ''
  const [selectedModalityId, setSelectedModalityId] = useState('');
  const [selectedGraduation, setSelectedGraduation] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(''); // 'paid' | 'pending' | 'overdue' | ''
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [enrollmentStart, setEnrollmentStart] = useState('');
  const [enrollmentEnd, setEnrollmentEnd] = useState('');
  const [classes, setClasses] = useState([]);
  const [modalities, setModalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalityButtonDisabled, setModalityButtonDisabled] = useState(false);
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Analytics tracking
  useScreenTracking('InstructorStudents', {
    academiaId: userProfile?.academiaId,
    userType: 'instructor',
    instructorId: user?.uid
  });
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

  // Declarar loadInitialData antes de usar
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      console.log(getString('loadingStudentsInstructor'), user.id);

      if (!userProfile?.academiaId) {
        console.warn('⚠️ Usuário sem academiaId definido');
        setStudents([]);
        setClasses([]);
        setModalities([]);
        return;
      }

      // Usar cache inteligente para dados da academia (para view do instrutor)
      const cacheKey = `instructor_view_data:${userProfile.academiaId}`;

      const instructorData = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log('🔍 Buscando dados da academia para instrutor (cache miss):', user.id);

          // Usar Promise.all para carregar dados em paralelo
          // Instrutores agora veem TODOS os alunos e TODAS as turmas
          const [allStudents, allClasses, allModalities] = await Promise.all([
            academyFirestoreService.getAll('students', userProfile.academiaId).catch(() => []),
            academyClassService.getClassesByInstructor(user.id, userProfile.academiaId, user.email).catch(() => []),
            academyFirestoreService.getAll('modalities', userProfile.academiaId).catch(() => [])
          ]);

          // Remover duplicatas das modalidades
          const uniqueModalities = allModalities.filter((modality, index, self) =>
            index === self.findIndex(m => m.id === modality.id || m.name === modality.name)
          );

          console.log(`✅ Dados carregados: ${allStudents.length} alunos, ${allClasses.length} turmas, ${uniqueModalities.length} modalidades`);

          return {
            students: allStudents,
            classes: allClasses || [],
            modalities: uniqueModalities || []
          };
        },
        CACHE_TTL.MEDIUM // Cache por 5 minutos
      );

      setStudents(instructorData.students);
      setClasses(instructorData.classes);
      setModalities(instructorData.modalities);

      // Track analytics
      trackFeatureUsage('instructor_students_loaded', {
        academiaId: userProfile.academiaId,
        instructorId: user.id,
        studentsCount: instructorData.students.length,
        classesCount: instructorData.classes.length
      });

      console.log(getString('instructorDataLoaded'));
    } catch (error) {
      console.error(getString('generalErrorLoadingInstructorData'), error);
      setStudents([]);
      setClasses([]);
      setModalities([]);
      Alert.alert(getString('warning'), getString('limitedInfoWarning'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id, userProfile?.academiaId, getString, trackFeatureUsage]);

  // Auto-refresh quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [loadInitialData])
  );

  useEffect(() => {
    filterStudents();
  }, [searchQuery, selectedFilter, students, selectedGender, selectedModalityId, selectedGraduation, selectedClassId, selectedPaymentStatus, ageMin, ageMax, enrollmentStart, enrollmentEnd]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Invalidar cache
    if (userProfile?.academiaId) {
      // Invalida o novo padrão de chave
      cacheService.invalidatePattern(`instructor_view_data:${userProfile.academiaId}`);
    }
    loadInitialData();
  }, [loadInitialData, userProfile?.academiaId, user.id]);

  const toDate = useCallback((val) => {
    if (!val) return null;
    // Firestore Timestamp
    if (val.seconds) return new Date(val.seconds * 1000);
    // ISO string or Date
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }, []);

  const calcAge = useCallback((birthDate) => {
    const d = toDate(birthDate);
    if (!d) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  }, [toDate]);

  const classIdToModalityId = () => {
    const map = {};
    (classes || []).forEach(c => { if (c.id && c.modalityId) map[c.id] = c.modalityId; });
    return map;
  };

  const studentHasModality = (student, modalityId) => {
    if (!modalityId) return true;
    const idMap = classIdToModalityId();
    const classIds = student.classIds || [];
    for (const cid of classIds) {
      if (idMap[cid] === modalityId) return true;
    }
    // Fallback: check graduations modality if available (may store name or id)
    if (student.graduations && student.graduations.length > 0) {
      return student.graduations.some(g => g.modalityId === modalityId || g.modality === getModalityNameById(modalityId));
    }
    return false;
  };

  const getModalityNameById = (id) => (modalities.find(m => m.id === id)?.name || '');

  const filterStudents = () => {
    let filtered = students;

    // Filtro por busca (expandido para incluir mais campos)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.phone?.toLowerCase().includes(query) ||
        student.cpf?.toLowerCase().includes(query) ||
        student.currentPlan?.toLowerCase().includes(query) ||
        student.currentGraduation?.toLowerCase().includes(query) ||
        student.address?.toLowerCase().includes(query) ||
        student.emergencyContact?.toLowerCase().includes(query)
      );
    }

    // Filtro por status
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(s => s.isActive !== false);
        break;
      case 'inactive':
        filtered = filtered.filter(s => s.isActive === false);
        break;
      case 'payment_pending':
        filtered = filtered.filter(s => s.paymentStatus === 'pending' || s.paymentStatus === 'overdue');
        break;
      default:
        break;
    }

    // Filtro por gênero
    if (selectedGender) {
      filtered = filtered.filter(s => (s.gender || '').toLowerCase() === selectedGender);
    }

    // Filtro por faixa etária
    if (ageMin || ageMax) {
      const min = ageMin ? parseInt(ageMin, 10) : null;
      const max = ageMax ? parseInt(ageMax, 10) : null;
      filtered = filtered.filter(s => {
        const age = calcAge(s.birthDate);
        if (age === null) return false;
        if (min !== null && age < min) return false;
        if (max !== null && age > max) return false;
        return true;
      });
    }

    // Filtro por período de matrícula (createdAt)
    if (enrollmentStart || enrollmentEnd) {
      const start = enrollmentStart ? new Date(`${enrollmentStart}T00:00:00`) : null;
      const end = enrollmentEnd ? new Date(`${enrollmentEnd}T23:59:59`) : null;
      filtered = filtered.filter(s => {
        const created = toDate(s.createdAt);
        if (!created) return false;
        if (start && created < start) return false;
        if (end && created > end) return false;
        return true;
      });
    }

    // Filtro por modalidade
    if (selectedModalityId) {
      filtered = filtered.filter(s => studentHasModality(s, selectedModalityId));
    }

    // Filtro por graduação
    if (selectedGraduation) {
      filtered = filtered.filter(s =>
        s.currentGraduation?.toLowerCase().includes(selectedGraduation.toLowerCase())
      );
    }

    // Filtro por turma
    if (selectedClassId) {
      filtered = filtered.filter(s =>
        s.classIds?.includes(selectedClassId)
      );
    }

    // Filtro por status de pagamento
    if (selectedPaymentStatus) {
      filtered = filtered.filter(s => s.paymentStatus === selectedPaymentStatus);
    }

    setFilteredStudents(filtered);
  };


  const handleStudentPress = (student) => {
    setSelectedStudent(student);
    setShowStudentDetailsModal(true);
  };

  const handleAddGraduation = (student) => {
    navigation.navigate('AddGraduation', { studentId: student.id, studentName: student.name });
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return profileTheme.primary[500];
      case 'pending': return COLORS.warning[500];
      case 'overdue': return COLORS.error[500];
      default: return profileTheme.text.disabled;
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid': return getString('paymentUpToDate');
      case 'pending': return getString('paymentPending');
      case 'overdue': return getString('paymentOverdue');
      default: return getString('paymentNA');
    }
  };

  const getFilterText = (filter) => {
    switch (filter) {
      case 'all': return getString('allStudents');
      case 'active': return getString('activeStudents');
      case 'inactive': return getString('inactiveStudents');
      case 'payment_pending': return getString('paymentPendingStudents');
      default: return getString('allStudents');
    }
  };

  const genderLabel = (g) => {
    if (!g) return getString('allGenders');
    if (g === 'male') return getString('male');
    if (g === 'female') return getString('female');
    return getString('other');
  };

  const clearFilters = () => {
    setSelectedFilter('all');
    setSelectedGender('');
    setSelectedModalityId('');
    setSelectedGraduation('');
    setSelectedClassId('');
    setSelectedPaymentStatus('');
    setAgeMin('');
    setAgeMax('');
    setEnrollmentStart('');
    setEnrollmentEnd('');
  };

  const applyFilters = () => {
    // Os filtros são aplicados automaticamente via useEffect
    // Esta função pode ser usada para fechar menus ou mostrar feedback
    setGenderMenuVisible(false);
    setModalityMenuVisible(false);
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[
          COLORS.gradients.deepPurple[0],
          COLORS.gradients.deepPurple[1],
          COLORS.gradients.deepPurple[2],
          COLORS.gradients.deepPurple[3]
        ]}
        locations={[0, 0.4, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.container}>
          <InstructorStudentsSkeleton />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[
        COLORS.gradients.deepPurple[0], // Deep Purple
        COLORS.gradients.deepPurple[1], // Darker Purple
        COLORS.gradients.deepPurple[2], // Almost Black
        COLORS.gradients.deepPurple[3]  // Black
      ]}
      locations={[0, 0.4, 0.8, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <View style={styles.header}>
          <SectionHeader
            title={getString('students')}
            subtitle={getString('manageYourStudents')}
            textColor={COLORS.white}
            subtitleColor={COLORS.gray[300]}
            marginTop={0}
          />
          <Searchbar
            placeholder={getString('searchStudents')}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.glassSearchbar]}
            iconColor={COLORS.gray[300]}
            inputStyle={{ color: COLORS.white }}
            placeholderTextColor={COLORS.gray[400]}
          />

          {/* Filtros Avançados - Linha 1 */}
          <View style={styles.filtersContainer}>
            <Menu
              visible={filterVisible}
              onDismiss={() => setFilterVisible(false)}
              anchor={
                <Button
                  mode={selectedFilter !== 'all' ? "contained" : "outlined"}
                  onPress={() => setFilterVisible(true)}
                  icon="filter"
                  style={[
                    styles.filterButtonImproved,
                    selectedFilter !== 'all' ? { backgroundColor: profileTheme.primary[600] } : { borderColor: profileTheme.primary[400] }
                  ]}
                  labelStyle={[styles.filterButtonLabel, selectedFilter !== 'all' ? { color: COLORS.white } : { color: profileTheme.primary[400] }]}
                  contentStyle={styles.filterButtonContent}
                >
                  {getFilterText(selectedFilter)}
                </Button>
              }
            >
              <Menu.Item onPress={() => { setSelectedFilter('all'); setFilterVisible(false); }} title={getString('allStudents')} />
              <Menu.Item onPress={() => { setSelectedFilter('active'); setFilterVisible(false); }} title={getString('activeStudents')} />
              <Menu.Item onPress={() => { setSelectedFilter('inactive'); setFilterVisible(false); }} title={getString('inactiveStudents')} />
              <Menu.Item onPress={() => { setSelectedFilter('payment_pending'); setFilterVisible(false); }} title={getString('paymentPendingStudents')} />
            </Menu>

            <Menu
              visible={genderMenuVisible}
              onDismiss={() => setGenderMenuVisible(false)}
              anchor={
                <Button
                  mode={selectedGender ? "contained" : "outlined"}
                  onPress={() => setGenderMenuVisible(true)}
                  icon="human-male-female"
                  style={[
                    styles.filterButtonImproved,
                    selectedGender ? { backgroundColor: profileTheme.primary[600] } : { borderColor: profileTheme.primary[400] }
                  ]}
                  labelStyle={[styles.filterButtonLabel, selectedGender ? { color: COLORS.white } : { color: profileTheme.primary[400] }]}
                  contentStyle={styles.filterButtonContent}
                >
                  {genderLabel(selectedGender)}
                </Button>
              }
            >
              <Menu.Item onPress={() => { setSelectedGender(''); setGenderMenuVisible(false); }} title={getString('allGenders')} />
              <Menu.Item onPress={() => { setSelectedGender('male'); setGenderMenuVisible(false); }} title={getString('male')} />
              <Menu.Item onPress={() => { setSelectedGender('female'); setGenderMenuVisible(false); }} title={getString('female')} />
            </Menu>

            {/* Dropdown de Modalidade - Usando Modal */}
            <View style={styles.dropdownContainer}>
              <Button
                mode={selectedModalityId ? "contained" : "outlined"}
                onPress={() => setModalityMenuVisible(true)}
                icon="dumbbell"
                style={[
                  styles.filterButtonImproved,
                  selectedModalityId ? { backgroundColor: profileTheme.primary[600] } : { borderColor: profileTheme.primary[400] }
                ]}
                labelStyle={[styles.filterButtonLabel, selectedModalityId ? { color: COLORS.white } : { color: profileTheme.primary[400] }]}
                contentStyle={styles.filterButtonContent}
              >
                {getModalityNameById(selectedModalityId) || getString('modality')}
              </Button>
            </View>
          </View>

          {/* Botões de Ação dos Filtros */}
          <View style={styles.filterActionsRow}>
            <Button
              mode="outlined"
              onPress={clearFilters}
              style={[styles.clearButtonImproved, { borderColor: COLORS.error[500] }]}
              icon="filter-remove"
              labelStyle={[styles.actionButtonLabel, { color: COLORS.error[500] }]}
            >
              {getString('clearFilters')}
            </Button>
            <Button
              mode="contained"
              onPress={applyFilters}
              style={[styles.applyButtonImproved, { backgroundColor: profileTheme.primary[600] }]}
              icon="check"
              labelStyle={[styles.actionButtonLabel, { color: COLORS.white }]}
            >
              {getString('applyFilters')}
            </Button>
          </View>

          <View style={styles.advancedFiltersRow}>
            <TextInput
              placeholder={getString('graduation')}
              value={selectedGraduation}
              onChangeText={setSelectedGraduation}
              mode="outlined"
              style={[styles.advancedFilterInput, styles.glassInput]}
              textColor={COLORS.white}
              placeholderTextColor={COLORS.gray[400]}
              theme={{ colors: { primary: profileTheme.primary[400], outline: COLORS.gray[600] } }}
              left={<TextInput.Icon icon="trophy" color={COLORS.gray[400]} />}
            />
            <TextInput
              placeholder={getString('class')}
              value={selectedClassId ? classes.find(c => c.id === selectedClassId)?.name || '' : ''}
              onFocus={() => {
                // Abrir seleção de turma (pode ser um modal ou dropdown)
              }}
              mode="outlined"
              style={[styles.advancedFilterInput, styles.glassInput]}
              textColor={COLORS.white}
              placeholderTextColor={COLORS.gray[400]}
              theme={{ colors: { primary: profileTheme.primary[400], outline: COLORS.gray[600] } }}
              left={<TextInput.Icon icon="school" color={COLORS.gray[400]} />}
              editable={false}
            />
            <TextInput
              placeholder={getString('paymentStatus')}
              value={selectedPaymentStatus ? getString(`payment${selectedPaymentStatus.charAt(0).toUpperCase() + selectedPaymentStatus.slice(1)}`) : ''}
              onFocus={() => {
                // Abrir seleção de status de pagamento
              }}
              mode="outlined"
              style={[styles.advancedFilterLong, styles.glassInput]}
              textColor={COLORS.white}
              placeholderTextColor={COLORS.gray[400]}
              theme={{ colors: { primary: profileTheme.primary[400], outline: COLORS.gray[600] } }}
              left={<TextInput.Icon icon="cash" color={COLORS.gray[400]} />}
              editable={false}
            />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ flexGrow: 1, paddingTop: SPACING.lg, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={profileTheme.primary[400]}
              colors={[profileTheme.primary[400]]}
              progressBackgroundColor={COLORS.gray[900]}
            />
          }
        >
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, index) => (
              <GlassCard key={student.id || index} variant="card" marginBottom={SPACING.md}>
                <View style={styles.studentHeader}>
                  <View style={styles.studentInfo}>
                    <Avatar.Text
                      size={50}
                      label={student.name?.charAt(0) || 'A'}
                      style={[styles.avatar, { backgroundColor: profileTheme.primary[600] }]}
                      color={COLORS.white}
                    />
                    <View style={styles.studentDetails}>
                      <Text style={[styles.studentName, { color: COLORS.white }]}>{student.name}</Text>
                      <Text style={[styles.studentEmail, { color: COLORS.gray[400] }]}>{student.email}</Text>
                      {student.currentGraduation && (
                        <View style={{ flexDirection: 'row', marginTop: 4 }}>
                          <StatusBadge
                            status="info"
                            label={student.currentGraduation}
                            size="small"
                            outline
                          />
                        </View>
                      )}
                    </View>
                  </View>

                  <IconButton
                    icon="dots-vertical"
                    iconColor={COLORS.gray[400]}
                    onPress={() => handleStudentPress(student)}
                  />
                </View>

                <View style={styles.studentStats}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: COLORS.gray[400] }]}>{getString('status')}</Text>
                    <StatusBadge
                      status={student.isActive !== false ? "success" : "error"}
                      label={student.isActive !== false ? getString('active') : getString('inactive')}
                      size="small"
                    />
                  </View>

                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: COLORS.gray[400] }]}>{getString('payment')}</Text>
                    <Chip
                      mode="outlined"
                      style={[
                        styles.statusChip,
                        { borderColor: getPaymentStatusColor(student.paymentStatus) }
                      ]}
                      textStyle={{
                        color: getPaymentStatusColor(student.paymentStatus),
                        fontSize: FONT_SIZE.sm
                      }}
                    >
                      {getPaymentStatusText(student.paymentStatus)}
                    </Chip>
                  </View>
                </View>

                {student.graduations && student.graduations.length > 0 && (
                  <View style={styles.graduationsInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <IconContainer
                        icon="trophy"
                        color={COLORS.warning[400]}
                        size={16}
                        containerSize={24}
                        backgroundColor="transparent"
                      />
                      <Text style={[styles.graduationsTitle, { color: COLORS.gray[300], marginLeft: 4 }]}>{getString('lastGraduation')}</Text>
                    </View>
                    <Text style={[styles.lastGraduation, { color: COLORS.white }]}>
                      {student.graduations[0]?.graduation} - {student.graduations[0]?.modality}
                    </Text>
                    <Text style={[styles.graduationDate, { color: COLORS.gray[500] }]}>
                      {new Date(student.graduations[0]?.date).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                )}

                <Divider style={[styles.divider, { backgroundColor: COLORS.gray[800] }]} />

                <View style={styles.studentActions}>
                  <Button
                    mode="outlined"
                    onPress={() => handleStudentPress(student)}
                    style={[styles.actionButton, { borderColor: profileTheme.primary[400] }]}
                    textColor={profileTheme.primary[400]}
                  >
                    {getString('viewProfile')}
                  </Button>

                  <Button
                    mode="contained"
                    onPress={() => handleAddGraduation(student)}
                    style={styles.actionButton}
                    buttonColor={profileTheme.primary[600]}
                    textColor={COLORS.white}
                  >
                    {getString('graduation')}
                  </Button>
                </View>
              </GlassCard>
            ))
          ) : (
            <GlassCard variant="subtle" padding={SPACING.xl} style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="people-outline" size={48} color={COLORS.gray[600]} />
              <Text style={[styles.noStudentsText, { color: COLORS.gray[400], marginTop: SPACING.md }]}>{getString('noStudentsFound')}</Text>
              <Text style={[styles.noStudentsSubtext, { color: COLORS.gray[600] }]}>
                {getString('noStudentsMessage')}
              </Text>
            </GlassCard>
          )}

          {/* Estatísticas gerais */}
          {students.length > 0 && (
            <GlassCard variant="card" padding={SPACING.lg} marginBottom={SPACING.xl}>
              <SectionHeader
                emoji="📊"
                title={getString('studentsSummary')}
                textColor={COLORS.white}
                marginTop={0}
              />

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: profileTheme.primary[400] }]}>{students.length}</Text>
                  <Text style={[styles.statLabel, { color: COLORS.gray[400] }]}>{getString('total')}</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: COLORS.secondary[400] }]}>
                    {students.filter(s => s.isActive !== false).length}
                  </Text>
                  <Text style={[styles.statLabel, { color: COLORS.gray[400] }]}>{getString('activeCount')}</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: profileTheme.primary[400] }]}>
                    {students.filter(s => s.paymentStatus === 'paid').length}
                  </Text>
                  <Text style={[styles.statLabel, { color: COLORS.gray[400] }]}>{getString('upToDate')}</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: COLORS.secondary[400] }]}>
                    {students.filter(s => s.graduations && s.graduations.length > 0).length}
                  </Text>
                  <Text style={[styles.statLabel, { color: COLORS.gray[400] }]}>{getString('withGraduation')}</Text>
                </View>
              </View>
            </GlassCard>
          )}
        </ScrollView>

        <FAB
          style={[styles.fab, { backgroundColor: profileTheme.secondary[600] }]}
          icon="account-plus"
          label={getString('newStudent')}
          onPress={() => setShowAddStudentModal(true)}
          color={COLORS.white}
        />

        {/* Modal para Dropdown de Modalidade */}
        <RNModal
          visible={modalityMenuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalityMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalityMenuVisible(false)}
          >
            <GlassCard variant="modal" padding={0} style={{ width: '80%', maxHeight: '60%' }}>
              <View style={styles.modalDropdownList}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedModalityId('');
                      setModalityMenuVisible(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, { color: COLORS.white }]}>{getString('allModalities')}</Text>
                  </TouchableOpacity>

                  {modalities.map(m => (
                    <TouchableOpacity
                      key={m.id}
                      style={[
                        styles.dropdownItem,
                        selectedModalityId === m.id && { backgroundColor: hexToRgba(profileTheme.primary[500], 0.2) }
                      ]}
                      onPress={() => {
                        setSelectedModalityId(m.id);
                        setModalityMenuVisible(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        { color: COLORS.white },
                        selectedModalityId === m.id && { color: profileTheme.primary[400], fontWeight: 'bold' }
                      ]}>
                        {m.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </GlassCard>
          </TouchableOpacity>
        </RNModal>

        {/* Modal de Adicionar Estudante */}
        <Portal>
          <Modal
            visible={showAddStudentModal}
            onDismiss={() => setShowAddStudentModal(false)}
            contentContainerStyle={{
              backgroundColor: profileTheme.background.paper,
              margin: '2%',
              maxHeight: '96%',
              borderRadius: 12,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <AddStudentForm
              onClose={() => setShowAddStudentModal(false)}
              onSuccess={(newStudentId) => {
                setShowAddStudentModal(false);
                loadInitialData();
              }}
            />
          </Modal>
        </Portal>

        {/* Modal de Detalhes do Aluno */}
        <Portal>
          <Modal
            visible={showStudentDetailsModal}
            onDismiss={() => setShowStudentDetailsModal(false)}
            contentContainerStyle={{
              flex: 1,
              margin: 0,
              backgroundColor: 'transparent'
            }}
          >
            {selectedStudent && (
              <StudentDetailsModal
                studentId={selectedStudent.id}
                studentData={selectedStudent}
                onClose={() => setShowStudentDetailsModal(false)}
                navigation={navigation}
              />
            )}
          </Modal>
        </Portal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING.md,
    // Remover fundo sólido e elevação
    backgroundColor: 'transparent',
    elevation: 0,
  },
  glassSearchbar: {
    backgroundColor: hexToRgba(COLORS.white, OPACITY.light),
    elevation: 0,
    borderRadius: BORDER_RADIUS.lg,
    color: COLORS.white,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: hexToRgba(COLORS.white, 0.15),
  },
  searchbar: {
    elevation: 0,
    marginBottom: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  filterButtonImproved: {
    flex: 1,
    minWidth: 100,
    maxWidth: 140,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  filterButtonLabel: {
    fontSize: FONT_SIZE.xs,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  filterButtonContent: {
    height: 36,
  },
  dropdownContainer: {
    flex: 1,
    minWidth: 100,
    maxWidth: 140,
  },
  filterActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginVertical: SPACING.sm,
  },
  clearButtonImproved: {
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  applyButtonImproved: {
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  actionButtonLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
  },
  advancedFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  advancedFilterInput: {
    flex: 1,
    minWidth: '48%',
    height: 50,
    backgroundColor: 'transparent',
  },
  glassInput: {
    backgroundColor: GLASS.subtle.backgroundColor,
  },
  advancedFilterLong: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
  },

  // Student Card Styles Updated for GlassCard
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: SPACING.md,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: FONT_SIZE.sm,
    marginBottom: 2,
  },
  studentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    marginBottom: 4,
  },
  graduationsInfo: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: GLASS.subtle.backgroundColor,
    borderRadius: BORDER_RADIUS.sm,
  },
  graduationsTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
  },
  lastGraduation: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    marginTop: 2,
  },
  graduationDate: {
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  divider: {
    marginVertical: SPACING.sm,
    height: 1,
  },
  studentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  actionButton: {
    borderRadius: BORDER_RADIUS.md,
  },

  // Empty State
  emptyCard: {
    margin: SPACING.md,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  noStudentsText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noStudentsSubtext: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Stats Card
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  // FAB
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay.darker,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDropdownList: {
    padding: SPACING.sm,
    maxHeight: 300,
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: hexToRgba(COLORS.white, OPACITY.light),
  },
  dropdownItemText: {
    fontSize: FONT_SIZE.md,
  },
});

export default InstructorStudents;
