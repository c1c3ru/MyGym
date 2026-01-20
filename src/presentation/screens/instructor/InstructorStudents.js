import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity, Modal } from 'react-native';
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
  TextInput
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService, academyStudentService } from '@infrastructure/services/academyFirestoreService';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@infrastructure/services/cacheService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import InstructorStudentsSkeleton from '@components/skeletons/InstructorStudentsSkeleton';
import { EnhancedFlashList } from '@components/EnhancedFlashList';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT, BORDER_WIDTH } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import { useProfileTheme } from '../../../contexts/ProfileThemeContext';

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
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [enrollmentStart, setEnrollmentStart] = useState(''); // YYYY-MM-DD
  const [enrollmentEnd, setEnrollmentEnd] = useState(''); // YYYY-MM-DD
  const [classes, setClasses] = useState([]);
  const [modalities, setModalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalityButtonDisabled, setModalityButtonDisabled] = useState(false);

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
            academyFirestoreService.getAll('classes', userProfile.academiaId).catch(() => []),
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
  }, [searchQuery, selectedFilter, students, selectedGender, selectedModalityId, ageMin, ageMax, enrollmentStart, enrollmentEnd]);

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

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.currentGraduation && student.currentGraduation.toLowerCase().includes(searchQuery.toLowerCase()))
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

    setFilteredStudents(filtered);
  };


  const handleStudentPress = (student) => {
    navigation.navigate('StudentProfile', { studentId: student.id, studentData: student });
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
      <LinearGradient colors={profileTheme.gradients.hero} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <InstructorStudentsSkeleton />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={profileTheme.gradients.hero} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <View style={[styles.header, { backgroundColor: profileTheme.background.paper }]}>
          <Searchbar
            placeholder={getString('searchStudents')}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchbar, { backgroundColor: profileTheme.background.default }]}
            iconColor={profileTheme.text.secondary}
            inputStyle={{ color: profileTheme.text.primary }}
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
                    selectedFilter !== 'all' ? { backgroundColor: profileTheme.primary[500] } : { borderColor: profileTheme.primary[500] }
                  ]}
                  labelStyle={[styles.filterButtonLabel, selectedFilter !== 'all' ? { color: COLORS.white } : { color: profileTheme.primary[500] }]}
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
                    selectedGender ? { backgroundColor: profileTheme.primary[500] } : { borderColor: profileTheme.primary[500] }
                  ]}
                  labelStyle={[styles.filterButtonLabel, selectedGender ? { color: COLORS.white } : { color: profileTheme.primary[500] }]}
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
                  selectedModalityId ? { backgroundColor: profileTheme.primary[500] } : { borderColor: profileTheme.primary[500] }
                ]}
                labelStyle={[styles.filterButtonLabel, selectedModalityId ? { color: COLORS.white } : { color: profileTheme.primary[500] }]}
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
              style={[styles.applyButtonImproved, { backgroundColor: profileTheme.primary[500] }]}
              icon="check"
              labelStyle={[styles.actionButtonLabel, { color: COLORS.white }]}
            >
              {getString('applyFilters')}
            </Button>
          </View>

          <View style={styles.advancedFiltersRow}>
            <TextInput
              placeholder={getString('minAge')}
              value={ageMin}
              onChangeText={setAgeMin}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.advancedFilterInput, { backgroundColor: profileTheme.background.default }]}
              textColor={profileTheme.text.primary}
              theme={{ colors: { primary: profileTheme.primary[500], outline: profileTheme.text.disabled } }}
            />
            <TextInput
              placeholder={getString('maxAge')}
              value={ageMax}
              onChangeText={setAgeMax}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.advancedFilterInput, { backgroundColor: profileTheme.background.default }]}
              textColor={profileTheme.text.primary}
              theme={{ colors: { primary: profileTheme.primary[500], outline: profileTheme.text.disabled } }}
            />
            <TextInput
              label={getString('sinceDate')}
              value={enrollmentStart}
              onChangeText={setEnrollmentStart}
              mode="outlined"
              style={[styles.advancedFilterLong, { backgroundColor: profileTheme.background.default }]}
              textColor={profileTheme.text.primary}
              theme={{ colors: { primary: profileTheme.primary[500], outline: profileTheme.text.disabled } }}
            />
            <TextInput
              placeholder={getString('enrollmentEnd')}
              value={enrollmentEnd}
              onChangeText={setEnrollmentEnd}
              mode="outlined"
              style={[styles.advancedFilterLong, { backgroundColor: profileTheme.background.default }]}
              textColor={profileTheme.text.primary}
              theme={{ colors: { primary: profileTheme.primary[500], outline: profileTheme.text.disabled } }}
            />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={profileTheme.primary[500]}
              colors={[profileTheme.primary[500]]}
            />
          }
        >
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, index) => (
              <Card key={student.id || index} style={[styles.studentCard, { backgroundColor: profileTheme.background.paper }]}>
                <Card.Content>
                  <View style={styles.studentHeader}>
                    <View style={styles.studentInfo}>
                      <Avatar.Text
                        size={50}
                        label={student.name?.charAt(0) || 'A'}
                        style={[styles.avatar, { backgroundColor: profileTheme.primary[100] }]}
                        color={profileTheme.primary[700]}
                      />
                      <View style={styles.studentDetails}>
                        <Text style={[styles.studentName, { color: profileTheme.text.primary }]}>{student.name}</Text>
                        <Text style={[styles.studentEmail, { color: profileTheme.text.secondary }]}>{student.email}</Text>
                        {student.currentGraduation && (
                          <Chip
                            mode="outlined"
                            style={[styles.graduationChip, { borderColor: profileTheme.secondary[500] }]}
                            textStyle={[styles.graduationText, { color: profileTheme.secondary[500] }]}
                          >
                            {student.currentGraduation}
                          </Chip>
                        )}
                      </View>
                    </View>

                    <IconButton
                      icon="dots-vertical"
                      iconColor={profileTheme.text.secondary}
                      onPress={() => handleStudentPress(student)}
                    />
                  </View>

                  <View style={styles.studentStats}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statLabel, { color: profileTheme.text.secondary }]}>{getString('status')}</Text>
                      <Chip
                        mode="outlined"
                        style={[
                          styles.statusChip,
                          { borderColor: student.isActive !== false ? profileTheme.secondary[500] : COLORS.error[500] }
                        ]}
                        textStyle={{
                          color: student.isActive !== false ? profileTheme.secondary[500] : COLORS.error[500],
                          fontSize: FONT_SIZE.sm
                        }}
                      >
                        {student.isActive !== false ? getString('active') : getString('inactive')}
                      </Chip>
                    </View>

                    <View style={styles.statItem}>
                      <Text style={[styles.statLabel, { color: profileTheme.text.secondary }]}>{getString('payment')}</Text>
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
                      <Text style={[styles.graduationsTitle, { color: profileTheme.text.primary }]}>{getString('lastGraduation')}</Text>
                      <Text style={[styles.lastGraduation, { color: profileTheme.text.secondary }]}>
                        {student.graduations[0]?.graduation} - {student.graduations[0]?.modality}
                      </Text>
                      <Text style={[styles.graduationDate, { color: profileTheme.text.hint }]}>
                        {new Date(student.graduations[0]?.date).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                  )}

                  <Divider style={[styles.divider, { backgroundColor: profileTheme.text.disabled }]} />

                  <View style={styles.studentActions}>
                    <Button
                      mode="outlined"
                      onPress={() => handleStudentPress(student)}
                      style={[styles.actionButton, { borderColor: profileTheme.primary[500] }]}
                      textColor={profileTheme.primary[500]}
                    >
                      {getString('viewProfile')}
                    </Button>

                    <Button
                      mode="contained"
                      onPress={() => handleAddGraduation(student)}
                      style={styles.actionButton}
                      buttonColor={profileTheme.primary[500]}
                    >
                      {getString('graduation')}
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={[styles.emptyCard, { backgroundColor: profileTheme.background.paper }]}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="people-outline" size={48} color={profileTheme.text.disabled} />
                <Text style={[styles.noStudentsText, { color: profileTheme.text.secondary }]}>{getString('noStudentsFound')}</Text>
                <Text style={[styles.noStudentsSubtext, { color: profileTheme.text.hint }]}>
                  {getString('noStudentsMessage')}
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Estatísticas gerais */}
          {students.length > 0 && (
            <Card style={[styles.statsCard, { backgroundColor: profileTheme.background.paper }]}>
              <Card.Content>
                <Text style={[styles.statsTitle, { color: profileTheme.text.primary }]}>{getString('studentsSummary')}</Text>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: profileTheme.primary[500] }]}>{students.length}</Text>
                    <Text style={[styles.statLabel, { color: profileTheme.text.secondary }]}>{getString('total')}</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: profileTheme.secondary[500] }]}>
                      {students.filter(s => s.isActive !== false).length}
                    </Text>
                    <Text style={[styles.statLabel, { color: profileTheme.text.secondary }]}>{getString('activeCount')}</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: profileTheme.primary[500] }]}>
                      {students.filter(s => s.paymentStatus === 'paid').length}
                    </Text>
                    <Text style={[styles.statLabel, { color: profileTheme.text.secondary }]}>{getString('upToDate')}</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: profileTheme.secondary[500] }]}>
                      {students.filter(s => s.graduations && s.graduations.length > 0).length}
                    </Text>
                    <Text style={[styles.statLabel, { color: profileTheme.text.secondary }]}>{getString('withGraduation')}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
        </ScrollView>

        <FAB
          style={[styles.fab, { backgroundColor: profileTheme.secondary[500] }]}
          icon="account-plus"
          label={getString('newStudent')}
          onPress={() => navigation.navigate('AddStudent')}
          color={COLORS.white}
        />

        {/* Modal para Dropdown de Modalidade */}
        <Modal
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
            <View style={[styles.modalDropdownContainer, { backgroundColor: profileTheme.background.paper }]}>
              <View style={styles.modalDropdownList}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedModalityId('');
                      setModalityMenuVisible(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, { color: profileTheme.text.primary }]}>{getString('allModalities')}</Text>
                  </TouchableOpacity>

                  {modalities.map(m => (
                    <TouchableOpacity
                      key={m.id}
                      style={[
                        styles.dropdownItem,
                        selectedModalityId === m.id && { backgroundColor: profileTheme.primary[100] }
                      ]}
                      onPress={() => {
                        setSelectedModalityId(m.id);
                        setModalityMenuVisible(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        { color: profileTheme.text.primary },
                        selectedModalityId === m.id && { color: profileTheme.primary[700], fontWeight: 'bold' }
                      ]}>
                        {m.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
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
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
    marginBottom: SPACING.sm,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginHorizontal: 2,
  },
  filterButtonLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  filterButtonContent: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  advancedFilterRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  clearButtonImproved: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
  },
  applyButtonImproved: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    elevation: 3,
  },
  actionButtonLabel: {
    fontSize: 13,
    fontWeight: FONT_WEIGHT.semibold,
  },
  dropdownContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  modalDropdownContainer: {
    width: '80%',
    maxWidth: 300,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  modalDropdownList: {
    maxHeight: 300,
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  dropdownItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: FONT_SIZE.md,
  },
  studentCard: {
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.md,
    elevation: 2,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  studentInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    marginRight: SPACING.md,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  studentEmail: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  graduationChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  graduationText: {
    fontSize: FONT_SIZE.xs,
    marginVertical: 0,
    marginHorizontal: 4,
  },
  studentStats: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    marginBottom: 4,
  },
  statusChip: {
    height: 24,
  },
  graduationsInfo: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  graduationsTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  lastGraduation: {
    fontSize: FONT_SIZE.md,
  },
  graduationDate: {
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  divider: {
    marginVertical: SPACING.md,
  },
  studentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  actionButton: {
    minWidth: 100,
  },
  emptyCard: {
    margin: SPACING.md,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  noStudentsText: {
    fontSize: FONT_SIZE.lg,
    marginTop: SPACING.md,
    fontWeight: 'bold',
  },
  noStudentsSubtext: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  statsCard: {
    margin: SPACING.md,
    marginTop: 0,
    elevation: 2,
  },
  statsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
  advancedFilterInput: {
    flex: 1,
    minWidth: '45%',
  },
  advancedFilterLong: {
    flex: 1,
    minWidth: '100%',
  },
});

export default InstructorStudents;
