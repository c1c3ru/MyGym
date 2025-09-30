import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, TouchableOpacity, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Card, 
  Title, 
  Paragraph, 
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
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService, academyStudentService } from '@services/academyFirestoreService';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@services/cacheService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import InstructorStudentsSkeleton from '@components/skeletons/InstructorStudentsSkeleton';
import { EnhancedFlashList } from '@components/EnhancedFlashList';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const InstructorStudents = ({ navigation }) => {
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
      console.log(getString('loadingStudentsInstructor'), user.uid);
      
      if (!userProfile?.academiaId) {
        console.warn('⚠️ Usuário sem academiaId definido');
        setStudents([]);
        setClasses([]);
        setModalities([]);
        return;
      }
      
      // Usar cache inteligente para dados do instrutor
      const cacheKey = CACHE_KEYS.INSTRUCTOR_STUDENTS(userProfile.academiaId, user.uid);
      
      const instructorData = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log('🔍 Buscando dados do instrutor (cache miss):', user.uid);
          
          // Usar Promise.all para carregar dados em paralelo
          const [instructorStudents, instructorClasses, allModalities] = await Promise.all([
            academyStudentService.getStudentsByInstructor(user.uid, userProfile.academiaId).catch(() => []),
            academyFirestoreService.getWhere('classes', 'instructorId', '==', user.uid, userProfile.academiaId).catch(() => []),
            academyFirestoreService.getAll('modalities', userProfile.academiaId).catch(() => [])
          ]);
          
          // Remover duplicatas das modalidades
          const uniqueModalities = allModalities.filter((modality, index, self) => 
            index === self.findIndex(m => m.id === modality.id || m.name === modality.name)
          );
          
          console.log(`✅ Dados carregados: ${instructorStudents.length} alunos, ${instructorClasses.length} turmas, ${uniqueModalities.length} modalidades`);
          
          return {
            students: instructorStudents,
            classes: instructorClasses || [],
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
        instructorId: user.uid,
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
  }, [user.uid, userProfile?.academiaId, getString, trackFeatureUsage]);

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
      cacheService.invalidatePattern(`instructor_students:${userProfile.academiaId}:${user.uid}`);
    }
    loadInitialData();
  }, [loadInitialData, userProfile?.academiaId, user.uid]);

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
      case 'paid': return 'COLORS.primary[500]';
      case 'pending': return 'COLORS.warning[500]';
      case 'overdue': return 'COLORS.error[500]';
      default: return COLORS.gray[500];
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder={getString('searchStudents')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        {/* Filtros Avançados - Linha 1 */}
        <View style={styles.filtersRow}>
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
                    selectedFilter !== 'all' && styles.filterButtonActive
                  ]}
                  labelStyle={styles.filterButtonLabel}
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
                    selectedGender && styles.filterButtonActive
                  ]}
                  labelStyle={styles.filterButtonLabel}
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
                  selectedModalityId && styles.filterButtonActive
                ]}
                labelStyle={styles.filterButtonLabel}
                contentStyle={styles.filterButtonContent}
              >
                {getModalityNameById(selectedModalityId) || getString('modality')}
              </Button>
            </View>
          </View>
        </View>

        {/* Botões de Ação dos Filtros */}
        <View style={styles.filterActionsRow}>
          <Button 
            mode="outlined" 
            onPress={clearFilters} 
            style={styles.clearButtonImproved}
            icon="filter-remove"
            labelStyle={styles.actionButtonLabel}
          >
            {getString('clearFilters')}
          </Button>
          <Button 
            mode="contained" 
            onPress={applyFilters} 
            style={styles.applyButtonImproved}
            icon="check"
            labelStyle={styles.actionButtonLabel}
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
            style={styles.advancedFilterInput}
          />
          <TextInput
            placeholder={getString('maxAge')}
            value={ageMax}
            onChangeText={setAgeMax}
            mode="outlined"
            keyboardType="numeric"
            style={styles.advancedFilterInput}
          />
          <TextInput
            label="Desde (AAAA-MM-DD)"
            value={enrollmentStart}
            onChangeText={setEnrollmentStart}
            mode="outlined"
            style={styles.advancedFilterLong}
          />
          <TextInput
            placeholder={getString('enrollmentEnd')}
            value={enrollmentEnd}
            onChangeText={setEnrollmentEnd}
            mode="outlined"
            style={styles.advancedFilterLong}
          />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, index) => (
            <Card key={student.id || index} style={styles.studentCard}>
              <Card.Content>
                <View style={styles.studentHeader}>
                  <View style={styles.studentInfo}>
                    <Avatar.Text 
                      size={50} 
                      label={student.name?.charAt(0) || 'A'} 
                      style={styles.avatar}
                    />
                    <View style={styles.studentDetails}>
                      <Title style={styles.studentName}>{student.name}</Title>
                      <Text style={styles.studentEmail}>{student.email}</Text>
                      {student.currentGraduation && (
                        <Chip 
                          mode="outlined" 
                          style={styles.graduationChip}
                          textStyle={styles.graduationText}
                        >
                          {student.currentGraduation}
                        </Chip>
                      )}
                    </View>
                  </View>
                  
                  <IconButton
                    icon="dots-vertical"
                    onPress={() => handleStudentPress(student)}
                  />
                </View>

                <View style={styles.studentStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Status</Text>
                    <Chip 
                      mode="outlined"
                      style={[
                        styles.statusChip,
                        { borderColor: student.isActive !== false ? 'COLORS.primary[500]' : 'COLORS.error[500]' }
                      ]}
                      textStyle={{ 
                        color: student.isActive !== false ? 'COLORS.primary[500]' : 'COLORS.error[500]',
                        fontSize: FONT_SIZE.sm
                      }}
                    >
                      {student.isActive !== false ? 'Ativo' : 'Inativo'}
                    </Chip>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Pagamento</Text>
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
                    <Text style={styles.graduationsTitle}>Última graduação:</Text>
                    <Text style={styles.lastGraduation}>
                      {student.graduations[0]?.graduation} - {student.graduations[0]?.modality}
                    </Text>
                    <Text style={styles.graduationDate}>
                      {new Date(student.graduations[0]?.date).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                )}

                <Divider style={styles.divider} />

                <View style={styles.studentActions}>
                  <Button 
                    mode="outlined" 
                    onPress={() => handleStudentPress(student)}
                    style={styles.actionButton}
                  >
                    {getString('viewProfile')}
                  </Button>

                  <Button 
                    mode="contained" 
                    onPress={() => handleAddGraduation(student)}
                    style={styles.actionButton}
                  >
                    {getString('graduation')}
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.noStudentsText}>{getString('noStudentsFound')}</Text>
              <Text style={styles.noStudentsSubtext}>
                {getString('noStudentsMessage')}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Estatísticas gerais */}
        {students.length > 0 && (
          <Card style={styles.statsCard}>
            <Card.Content>
              <Title style={styles.statsTitle}>Resumo dos Alunos</Title>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{students.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {students.filter(s => s.isActive !== false).length}
                  </Text>
                  <Text style={styles.statLabel}>Ativos</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {students.filter(s => s.paymentStatus === 'paid').length}
                  </Text>
                  <Text style={styles.statLabel}>Em Dia</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {students.filter(s => s.graduations && s.graduations.length > 0).length}
                  </Text>
                  <Text style={styles.statLabel}>Com Graduação</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="account-plus"
        label="Novo Aluno"
        onPress={() => navigation.navigate('AddStudent')}
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
          <View style={styles.modalDropdownContainer}>
            <View style={styles.modalDropdownList}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedModalityId('');
                    setModalityMenuVisible(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{getString('allModalities')}</Text>
                </TouchableOpacity>
                
                {modalities.map(m => (
                  <TouchableOpacity 
                    key={m.id}
                    style={[
                      styles.dropdownItem,
                      selectedModalityId === m.id && styles.dropdownItemSelected
                    ]}
                    onPress={() => {
                      setSelectedModalityId(m.id);
                      setModalityMenuVisible(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedModalityId === m.id && styles.dropdownItemTextSelected
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  header: {
    padding: SPACING.base,
    backgroundColor: 'COLORS.COLORS.white',
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: COLORS.gray[100],
    marginBottom: SPACING.sm,
  },
  // Novos estilos para filtros melhorados
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    gap: 8,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: SPACING.md,
  },
  filterButtonImproved: {
    flex: 1,
    minWidth: 100,
    maxWidth: 140,
    borderRadius: BORDER_RADIUS.lg,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginHorizontal: 2,
  },
  filterButtonActive: {
    backgroundColor: 'COLORS.primary[500]',
    borderColor: 'COLORS.primary[500]',
  },
  filterButtonLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  filterButtonContent: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  // Estilos antigos mantidos para compatibilidade
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterButton: {
    borderColor: 'COLORS.primary[500]',
  },
  advancedFilterRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    gap: 12,
  },
  clearButtonImproved: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    borderColor: COLORS.error[500],
    borderWidth: 1.5,
  },
  applyButtonImproved: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'COLORS.primary[500]',
    elevation: 3,
  },
  actionButtonLabel: {
    fontSize: 13,
    fontWeight: FONT_WEIGHT.semibold,
  },
  menuContent: {
    maxHeight: 300,
    backgroundColor: 'COLORS.COLORS.white',
    borderRadius: BORDER_RADIUS.md,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  filterButtonDisabled: {
    opacity: 0.6,
  },
  dropdownContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 120,
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  modalDropdownContainer: {
    width: '80%',
    maxWidth: 300,
    marginTop: SPACING.xs0,
    marginBottom: 20,
  },
  modalDropdownList: {
    backgroundColor: 'COLORS.COLORS.white',
    borderRadius: BORDER_RADIUS.md,
    elevation: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: 'COLORS.gray[300]',
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'COLORS.gray[100]',
  },
  dropdownItemSelected: {
    backgroundColor: 'COLORS.info[50]',
  },
  dropdownItemText: {
    fontSize: FONT_SIZE.base,
    color: 'COLORS.text.primary',
  },
  dropdownItemTextSelected: {
    color: COLORS.info[700],
    fontWeight: FONT_WEIGHT.semibold,
  },
  advancedFilterInput: {
    flexGrow: 1,
    minWidth: 110,
    marginRight: 8,
    marginBottom: SPACING.sm,
  },
  advancedFilterLong: {
    flexGrow: 2,
    minWidth: 160,
    marginRight: 8,
    marginBottom: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  studentCard: {
    margin: SPACING.base,
    marginBottom: SPACING.sm,
    elevation: 2,
  },
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
    backgroundColor: 'COLORS.primary[500]',
  },
  studentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: FONT_SIZE.md,
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: FONT_SIZE.sm,
    color: 'COLORS.text.secondary',
    marginBottom: SPACING.xs,
  },
  graduationChip: {
    alignSelf: 'flex-start',
  },
  graduationText: {
    fontSize: 10,
  },
  studentStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: 'COLORS.text.secondary',
    marginBottom: SPACING.xs,
  },
  statusChip: {
    borderWidth: 1,
  },
  graduationsInfo: {
    backgroundColor: 'COLORS.background.light',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  graduationsTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: 2,
  },
  lastGraduation: {
    fontSize: FONT_SIZE.base,
    marginBottom: 2,
  },
  graduationDate: {
    fontSize: FONT_SIZE.sm,
    color: 'COLORS.text.secondary',
  },
  divider: {
    marginVertical: 12,
  },
  studentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyCard: {
    margin: SPACING.base,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: 'COLORS.text.secondary',
  },
  statsCard: {
    margin: SPACING.base,
    marginTop: SPACING.sm,
    elevation: 2,
    backgroundColor: COLORS.primary[50],
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: 'COLORS.primary[500]',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.base,
    right: 0,
    bottom: 0,
    backgroundColor: 'COLORS.primary[500]',
  },
});

export default InstructorStudents;
