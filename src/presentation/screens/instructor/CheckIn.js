import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl, Platform } from 'react-native';
import { 
  Card, 
  Text,
  Button,
  List,
  Chip,
  Surface,
  Divider,
  FAB,
  Modal,
  Portal,
  TextInput,
  Searchbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@contexts/AuthProvider';
import { academyFirestoreService, academyClassService } from '@services/academyFirestoreService';
import { ResponsiveUtils } from '@utils/animations';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@services/cacheService';
import { useScreenTracking, useUserActionTracking } from '@hooks/useAnalytics';
import CheckInSkeleton from '@components/skeletons/CheckInSkeleton';
import { EnhancedFlashList } from '@components/EnhancedFlashList';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const CheckIn = ({ navigation }) => {
  const { user, userProfile } = useAuth();
  const [classes, setClasses] = useState([]);
  const [activeCheckIns, setActiveCheckIns] = useState([]);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [manualCheckInVisible, setManualCheckInVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  
  // Batch check-in states
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [studentsWithCheckIn, setStudentsWithCheckIn] = useState(new Set());

  // Analytics tracking
  useScreenTracking('CheckIn', { 
    academiaId: userProfile?.academiaId,
    userType: 'instructor',
    instructorId: user?.uid 
  });
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!userProfile?.academiaId || !user?.uid) {
        return;
      }
      
      const cacheKey = CACHE_KEYS.CHECKIN_DATA(userProfile.academiaId, user.uid);
      
      const checkInData = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log('🔍 Buscando dados de check-in (cache miss):', user.uid);
          
          // Usar Promise.all para carregar dados em paralelo
          const [instructorClasses, activeSessions, recentSessions, allStudents] = await Promise.all([
            academyClassService.getClassesByInstructor(user.uid, userProfile.academiaId, user.email),
            academyFirestoreService.getWhere('checkInSessions', 'instructorId', '==', user.uid, userProfile.academiaId),
            academyFirestoreService.getWhere('checkIns', 'instructorId', '==', user.uid, userProfile.academiaId),
            academyFirestoreService.getAll('students', userProfile.academiaId)
          ]);
          
          // Filtrar sessões ativas (abertas nas últimas 24h)
          const now = new Date();
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          
          const activeCheckIns = activeSessions.filter(session => {
            const sessionDate = session.createdAt?.toDate ? session.createdAt.toDate() : new Date(session.createdAt);
            return sessionDate > yesterday && session.status === 'active';
          });
          
          // Filtrar check-ins recentes (hoje)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const recentCheckIns = recentSessions.filter(checkIn => {
            const checkInDate = checkIn.timestamp?.toDate ? checkIn.timestamp.toDate() : new Date(checkIn.timestamp);
            return checkInDate >= today;
          }).sort((a, b) => {
            const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
            const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
            return dateB - dateA;
          });
          
          console.log(`✅ Dados carregados: ${instructorClasses.length} turmas, ${activeCheckIns.length} check-ins ativos, ${recentCheckIns.length} check-ins recentes`);
          
          return {
            classes: instructorClasses,
            activeCheckIns,
            recentCheckIns,
            students: allStudents
          };
        },
        CACHE_TTL.SHORT // Cache por 2 minutos (dados dinâmicos)
      );
      
      setClasses(checkInData.classes);
      setActiveCheckIns(checkInData.activeCheckIns);
      setRecentCheckIns(checkInData.recentCheckIns);
      setStudents(checkInData.students);
      
      // Track analytics
      trackFeatureUsage('checkin_data_loaded', {
        academiaId: userProfile.academiaId,
        instructorId: user.uid,
        classesCount: checkInData.classes.length,
        activeCheckInsCount: checkInData.activeCheckIns.length
      });

    } catch (error) {
      console.error('❌ CheckIn: Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.uid, userProfile?.academiaId, user.email, trackFeatureUsage]);

  // Auto-refresh quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Invalidar cache
    if (userProfile?.academiaId) {
      cacheService.invalidatePattern(`checkin_data:${userProfile.academiaId}:${user.uid}`);
    }
    loadData();
  }, [loadData, userProfile?.academiaId, user.uid]);

  const loadActiveCheckIns = useCallback(async () => {
    try {
      // Buscar sessões de check-in ativas
      const activeSessions = await academyFirestoreService.getWhere(
        'checkInSessions', 
        'instructorId', 
        '==', 
        user.uid, 
        userProfile.academiaId
      );
      
      const activeSessionsWithDetails = activeSessions.map(session => {
        const classInfo = classes.find(c => c.id === session.classId);
        return {
          ...session,
          className: classInfo?.name || 'Turma não encontrada',
          classSchedule: classInfo?.scheduleText || '',
          maxStudents: classInfo?.maxStudents || 0
        };
      });

      setActiveCheckIns(activeSessionsWithDetails);
      console.log('✅ Check-ins ativos carregados:', activeSessionsWithDetails.length);
    } catch (error) {
      console.error('❌ CheckIn: Erro ao carregar check-ins ativos:', error);
      setActiveCheckIns([]);
    }
  }, [user.uid, userProfile?.academiaId]);

  const loadRecentCheckIns = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let allCheckIns = [];

      // Para cada turma do instrutor, buscar check-ins na subcoleção
      for (const classItem of classes) {
        try {
          const classCheckIns = await academyFirestoreService.getSubcollectionDocuments(
            'classes',
            classItem.id,
            'checkIns',
            userProfile.academiaId,
            [
              { field: 'date', operator: '>=', value: today }
            ],
            { field: 'createdAt', direction: 'desc' },
            10
          );

          // Adicionar informações da turma aos check-ins
          const enrichedCheckIns = classCheckIns.map(checkIn => ({
            ...checkIn,
            className: classItem.name,
            classId: classItem.id
          }));

          allCheckIns = [...allCheckIns, ...enrichedCheckIns];
        } catch (error) {
          console.error(`❌ Erro ao carregar check-ins da turma ${classItem.id}:`, error);
        }
      }

      // Ordenar por data de criação e limitar a 10
      allCheckIns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentCheckIns(allCheckIns.slice(0, 10));
      console.log('📋 Check-ins recentes carregados:', allCheckIns.length);
    } catch (error) {
      console.error('❌ Erro ao carregar check-ins recentes:', error);
      setRecentCheckIns([]);
    }
  };

  const loadStudents = async () => {
    try {
      console.log('📚 Carregando alunos da academia:', userProfile.academiaId);
      
      // Buscar alunos na subcoleção da academia
      const allStudents = await academyFirestoreService.getAll('students', userProfile.academiaId);
      console.log('👥 Alunos encontrados:', allStudents.length);
      
      setStudents(allStudents);
      setFilteredStudents(allStudents);
    } catch (error) {
      console.error('❌ Erro ao carregar alunos:', error);
      setStudents([]);
      setFilteredStudents([]);
    }
  };

  const handleStartCheckIn = async (classId) => {
    try {
      console.log('🚀 Iniciando check-in para aula:', classId);
      
      const classInfo = classes.find(c => c.id === classId);
      if (!classInfo) {
        Alert.alert('Erro', 'Turma não encontrada');
        return;
      }

      // Verificar se já existe uma sessão ativa para esta turma
      const existingSession = activeCheckIns.find(session => session.classId === classId);
      if (existingSession) {
        Alert.alert('Aviso', 'Já existe uma sessão de check-in ativa para esta turma');
        return;
      }

      // Criar nova sessão de check-in
      const sessionData = {
        classId,
        className: classInfo.name,
        instructorId: user.uid,
        instructorName: userProfile?.name || user.email,
        academiaId: userProfile.academiaId,
        startTime: new Date(),
        status: 'active',
        checkInCount: 0,
        createdAt: new Date()
      };

      const sessionId = await academyFirestoreService.create('checkInSessions', sessionData, userProfile.academiaId);
      console.log('✅ Sessão de check-in criada:', sessionId);

      // Recarregar dados
      await loadActiveCheckIns();
      
      Alert.alert('Sucesso', `Check-in iniciado para ${classInfo.name}`);
    } catch (error) {
      console.error('❌ Erro ao iniciar check-in:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o check-in. Tente novamente.');
    }
  };

  const handleStopCheckIn = async (sessionId) => {
    try {
      console.log('⏹️ Parando check-in para sessão:', sessionId);
      
      Alert.alert(
        'Confirmar',
        'Deseja realmente parar esta sessão de check-in?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Parar', 
            style: 'destructive',
            onPress: async () => {
              try {
                // Atualizar status da sessão
                await academyFirestoreService.update('checkInSessions', sessionId, {
                  status: 'completed',
                  endTime: new Date(),
                  updatedAt: new Date()
                }, userProfile.academiaId);

                // Limpar seleção e recarregar dados
                setSelectedStudents(new Set());
                await loadRecentCheckIns();
                await loadTodayCheckIns();
                
                Alert.alert('Sucesso', 'Sessão de check-in finalizada');
              } catch (error) {
                console.error('❌ Erro ao parar check-in:', error);
                Alert.alert('Erro', 'Não foi possível parar o check-in');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao parar check-in:', error);
    }
  };

  const handleManualCheckIn = async (studentId, studentName) => {
    try {
      // Debug: verificar token do usuário
      const token = await user.getIdTokenResult();
      console.log('🔍 Debug - Token claims:', token.claims);
      console.log('🔍 Debug - User role:', token.claims.role);
      console.log('🔍 Debug - Academia ID:', token.claims.academiaId);
      console.log('🔍 Debug - User profile:', userProfile);
      
      if (!selectedClass) {
        Alert.alert('Erro', 'Selecione uma turma primeiro');
        return;
      }

      // Usar academiaId do token (que é usado pelas regras do Firestore)
      const tokenAcademiaId = token.claims.academiaId;
      
      const checkInData = {
        studentId,
        studentName,
        classId: selectedClass.id,
        className: selectedClass.name,
        instructorId: user.uid,
        instructorName: userProfile?.name || user.email,
        academiaId: tokenAcademiaId,
        type: 'manual',
        date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        timestamp: new Date(),
        createdAt: new Date()
      };

      console.log('🔍 Debug - Usando academiaId do token:', tokenAcademiaId);
      console.log('🔍 Debug - CheckIn data:', checkInData);

      // Usar subcoleção de check-ins dentro da turma selecionada
      await academyFirestoreService.addSubcollectionDocument(
        'classes',
        selectedClass.id,
        'checkIns',
        checkInData,
        tokenAcademiaId
      );
      
      Alert.alert('Sucesso', `Check-in realizado para ${studentName}!`);
      
      // Recarregar dados
      await loadRecentCheckIns();
      await loadTodayCheckIns();
    } catch (error) {
      console.error('❌ Erro no check-in manual:', error);
      Alert.alert('Erro', 'Não foi possível realizar o check-in');
    }
  };


  const filterStudents = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.name?.toLowerCase().includes(query.toLowerCase()) ||
        student.email?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  };

  const loadTodayCheckIns = async () => {
    if (!selectedClass || !userProfile?.academiaId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const todayCheckIns = await academyFirestoreService.getSubcollectionDocuments(
        'classes',
        selectedClass.id,
        'checkIns',
        userProfile.academiaId,
        [{ field: 'date', operator: '==', value: today }]
      );

      const checkedInStudentIds = new Set(
        todayCheckIns.map(checkIn => checkIn.studentId)
      );
      
      setStudentsWithCheckIn(checkedInStudentIds);
    } catch (error) {
      console.error('❌ Erro ao carregar check-ins de hoje:', error);
    }
  };

  const clearSelection = () => {
    setSelectedStudents(new Set());
  };

  const selectAllStudents = () => {
    // Selecionar apenas alunos que ainda não fizeram check-in
    const availableStudents = filteredStudents.filter(student => 
      !studentsWithCheckIn.has(student.id)
    );
    const allStudentIds = new Set(availableStudents.map(student => student.id));
    setSelectedStudents(allStudentIds);
  };

  const toggleStudentSelection = (studentId) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const handleBatchCheckIn = async () => {
    if (selectedStudents.size === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um aluno para fazer check-in');
      return;
    }

    if (!selectedClass) {
      Alert.alert('Erro', 'Selecione uma turma primeiro');
      return;
    }

    setBatchProcessing(true);
    
    try {
      const token = await user.getIdTokenResult();
      const tokenAcademiaId = token.claims.academiaId;
      
      const checkInPromises = Array.from(selectedStudents).map(async (studentId) => {
        const student = students.find(s => s.id === studentId);
        
        const checkInData = {
          studentId,
          studentName: student?.name || 'Nome não informado',
          classId: selectedClass.id,
          className: selectedClass.name,
          instructorId: user.uid,
          instructorName: userProfile?.name || user.email,
          academiaId: tokenAcademiaId,
          type: 'manual',
          date: new Date().toISOString().split('T')[0],
          timestamp: new Date(),
          createdAt: new Date()
        };

        return academyFirestoreService.addSubcollectionDocument(
          'classes',
          selectedClass.id,
          'checkIns',
          checkInData,
          tokenAcademiaId
        );
      });

      await Promise.all(checkInPromises);
      
      Alert.alert(
        'Sucesso! ✅', 
        `Check-in realizado para ${selectedStudents.size} aluno(s)!`
      );
      
      // Limpar seleção e recarregar dados
      setSelectedStudents(new Set());
      await loadRecentCheckIns();
      await loadTodayCheckIns();
      
    } catch (error) {
      console.error('❌ Erro no check-in em lote:', error);
      Alert.alert('Erro', 'Falha ao realizar check-in em lote. Tente novamente.');
    } finally {
      setBatchProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Minhas Turmas - Para iniciar check-in */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons name="school" size={32} color="COLORS.primary[500]" />
              <Text style={styles.title}>Minhas Turmas</Text>
            </View>
            
            {classes.length > 0 ? (
              classes.map((classItem) => (
                <Surface key={classItem.id} style={styles.checkInItem}>
                  <View style={styles.checkInHeader}>
                    <Text style={styles.aulaName}>{String(classItem.name || 'Turma sem nome')}</Text>
                    <Chip 
                      mode="flat"
                      style={[
                        styles.statusChip,
                        { backgroundColor: 'COLORS.info[500]' }
                      ]}
                      textStyle={{ color: 'COLORS.white' }}
                    >
                      {typeof classItem.modality === 'object' && classItem.modality
                        ? classItem.modality.name || 'Modalidade'
                        : classItem.modality || 'Modalidade'
                      }
                    </Chip>
                  </View>
                  
                  <View style={styles.checkInDetails}>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="clock" size={16} color="COLORS.text.secondary" />
                      <Text style={styles.detailText}>
                        {(() => {
                          if (typeof classItem.schedule === 'object' && classItem.schedule) {
                            const day = String(classItem.schedule.dayOfWeek || '');
                            const hour = String(classItem.schedule.hour || '00').padStart(2, '0');
                            const minute = String(classItem.schedule.minute || 0).padStart(2, '0');
                            return `${day} ${hour}:${minute}`;
                          }
                          return String(classItem.schedule || 'Horário não definido');
                        })()}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="account-group" size={16} color="COLORS.text.secondary" />
                      <Text style={styles.detailText}>
                        {String(classItem.currentStudents || 0)}/{String(classItem.maxStudents || 0)} alunos
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.actionButtons}>
                    <Button
                      mode="contained"
                      onPress={() => handleStartCheckIn(classItem.id)}
                      buttonColor="COLORS.primary[500]"
                      compact
                    >
                      Iniciar Check-in
                    </Button>
                  </View>
                </Surface>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="school-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhuma turma encontrada</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Check-ins Ativos */}
        {activeCheckIns.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <MaterialCommunityIcons name="qrcode-scan" size={32} color="COLORS.info[500]" />
                <Text style={styles.title}>Sessões Ativas</Text>
              </View>
              
              {activeCheckIns.map((session) => (
                <Surface key={session.id} style={styles.checkInItem}>
                  <View style={styles.checkInHeader}>
                    <Text style={styles.aulaName}>{session.className}</Text>
                    <Chip 
                      mode="flat"
                      style={[
                        styles.statusChip,
                        { backgroundColor: 'COLORS.primary[500]' }
                      ]}
                      textStyle={{ color: 'COLORS.white' }}
                    >
                      Ativo
                    </Chip>
                  </View>
                  
                  <View style={styles.checkInDetails}>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="clock" size={16} color="COLORS.text.secondary" />
                      <Text style={styles.detailText}>
                        Iniciado: {session.startTime?.toDate?.()?.toLocaleTimeString() || 'Agora'}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialCommunityIcons name="check-circle" size={16} color="COLORS.text.secondary" />
                      <Text style={styles.detailText}>
                        {session.checkInCount || 0} check-ins
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.actionButtons}>
                    <Button
                      mode="outlined"
                      onPress={() => handleStopCheckIn(session.id)}
                      buttonColor={COLORS.error[50]}
                      textColor="COLORS.error[500]"
                      compact
                    >
                      Parar Check-in
                    </Button>
                  </View>
                </Surface>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Check-ins Recentes */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons name="history" size={32} color="COLORS.warning[500]" />
              <Text style={styles.title}>Check-ins de Hoje</Text>
            </View>
            
            {recentCheckIns.length > 0 ? (
              recentCheckIns.map((checkIn) => (
                <List.Item
                  key={checkIn.id}
                  title={checkIn.studentName}
                  description={`${checkIn.className} • ${checkIn.date?.toDate?.()?.toLocaleTimeString() || 'Agora'}`}
                  left={() => (
                    <List.Icon 
                      icon="check-circle" 
                      color="COLORS.primary[500]" 
                    />
                  )}
                  right={() => (
                    <Chip 
                      mode="outlined" 
                      compact
                      style={{ marginTop: SPACING.sm }}
                    >
                      {checkIn.type === 'manual' ? 'Manual' : 'QR Code'}
                    </Chip>
                  )}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="history" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhum check-in hoje</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Modal para Check-in Manual */}
      <Portal>
        <Modal
          visible={manualCheckInVisible}
          onDismiss={() => setManualCheckInVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Check-in Manual</Text>
          
          {/* Seleção de Turma */}
          <View style={styles.classSelectionContainer}>
            <Text style={styles.modalSubtitle}>Selecione a turma:</Text>
            <View style={styles.classGrid}>
              {classes.map((classItem) => (
                <Button
                  key={classItem.id}
                  mode={selectedClass?.id === classItem.id ? 'contained' : 'outlined'}
                  onPress={() => {
                    setSelectedClass(classItem);
                    // Limpar seleções anteriores ao trocar de turma
                    setSelectedStudents(new Set());
                    setStudentsWithCheckIn(new Set());
                    // Carregar check-ins da nova turma
                    setTimeout(() => loadTodayCheckIns(), 100);
                  }}
                  style={[
                    styles.classButton,
                    selectedClass?.id === classItem.id && styles.classButtonSelected
                  ]}
                  labelStyle={styles.classButtonLabel}
                  icon={selectedClass?.id === classItem.id ? 'check-circle' : 'account-group'}
                >
                  {classItem.name}
                </Button>
              ))}
            </View>
          </View>

          {/* Busca de Alunos */}
          <Searchbar
            placeholder="Buscar aluno..."
            onChangeText={filterStudents}
            value={searchQuery}
            style={styles.searchbar}
          />

          {/* Controles de Seleção em Lote */}
          {filteredStudents.length > 0 && (
            <View style={styles.batchControls}>
              <Text style={styles.selectionCount}>
                {selectedStudents.size} de {filteredStudents.length} selecionados
              </Text>
              <View style={styles.batchButtons}>
                <Button
                  mode="outlined"
                  compact
                  onPress={selectAllStudents}
                  style={styles.batchButton}
                >
                  Selecionar Todos
                </Button>
                <Button
                  mode="outlined"
                  compact
                  onPress={clearSelection}
                  style={styles.batchButton}
                >
                  Limpar
                </Button>
              </View>
            </View>
          )}

          {/* Lista de Alunos */}
          <ScrollView style={styles.studentsList}>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const hasCheckIn = studentsWithCheckIn.has(student.id);
                const isSelected = selectedStudents.has(student.id);
                
                return (
                  <List.Item
                    key={student.id}
                    title={student.name || 'Nome não informado'}
                    description={
                      <View style={styles.studentDescription}>
                        <Text style={styles.studentEmail}>
                          {student.email || 'Email não informado'}
                        </Text>
                        {hasCheckIn && (
                          <Chip
                            icon="check-circle"
                            mode="flat"
                            style={styles.checkInChip}
                            textStyle={styles.checkInChipText}
                          >
                            Presente
                          </Chip>
                        )}
                      </View>
                    }
                    left={() => (
                      <View style={styles.studentLeftSection}>
                        <Button
                          mode={isSelected ? "contained" : "outlined"}
                          compact
                          onPress={() => toggleStudentSelection(student.id)}
                          style={[
                            styles.selectButton,
                            hasCheckIn && styles.selectButtonDisabled
                          ]}
                          disabled={hasCheckIn}
                        >
                          {isSelected ? '✓' : '+'}
                        </Button>
                        {hasCheckIn && (
                          <MaterialCommunityIcons 
                            name="check-circle" 
                            size={24} 
                            color="COLORS.primary[500]" 
                            style={styles.checkInIcon}
                          />
                        )}
                      </View>
                    )}
                    right={() => (
                      <Button
                        mode={hasCheckIn ? "outlined" : "contained"}
                        compact
                        onPress={() => handleManualCheckIn(student.id, student.name)}
                        disabled={!selectedClass || hasCheckIn}
                        style={[
                          styles.individualCheckInButton,
                          hasCheckIn && styles.alreadyCheckedInButton
                        ]}
                      >
                        {hasCheckIn ? 'Presente' : 'Check-in'}
                      </Button>
                    )}
                    style={[
                      styles.studentItem,
                      hasCheckIn && styles.studentItemCheckedIn
                    ]}
                  />
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="account-off" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Nenhum aluno encontrado na busca' : 'Nenhum aluno cadastrado'}
                </Text>
                <Text style={styles.emptySubtext}>
                  Total de alunos: {students.length}
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setManualCheckInVisible(false);
                setSelectedStudents(new Set());
                setSearchQuery('');
              }}
              style={styles.modalButton}
              icon="close"
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={async () => {
                if (!selectedClass) {
                  Alert.alert('Atenção', 'Selecione uma turma primeiro');
                  return;
                }
                if (selectedStudents.size === 0) {
                  Alert.alert('Atenção', 'Selecione pelo menos um aluno para fazer check-in');
                  return;
                }
                await handleBatchCheckIn();
                setManualCheckInVisible(false);
              }}
              loading={batchProcessing}
              disabled={batchProcessing}
              style={[styles.modalButton, styles.batchCheckInButton]}
              icon="account-multiple-check"
            >
              {selectedStudents.size > 0 
                ? `Confirmar Check-in (${selectedStudents.size})`
                : 'Selecione Alunos'
              }
            </Button>
          </View>
        </Modal>
      </Portal>

      <FAB
        icon="qrcode-plus"
        style={styles.fab}
        onPress={() => {
          if (classes.length === 0) {
            Alert.alert('Aviso', 'Você precisa ter pelo menos uma turma para fazer check-in manual');
            return;
          }
          setManualCheckInVisible(true);
        }}
        label="Check-in Manual"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'COLORS.background.light',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: ResponsiveUtils.spacing.md,
    borderRadius: ResponsiveUtils.borderRadius.large,
    ...ResponsiveUtils.elevation,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.lg,
  },
  title: {
    marginLeft: ResponsiveUtils.spacing.md,
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: FONT_WEIGHT.bold,
    color: 'COLORS.text.primary',
  },
  checkInItem: {
    padding: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.sm,
    borderRadius: ResponsiveUtils.borderRadius.medium,
    backgroundColor: 'COLORS.background.light',
  },
  checkInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  aulaName: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: FONT_WEIGHT.bold,
    color: 'COLORS.text.primary',
    flex: 1,
  },
  statusChip: {
    borderRadius: BORDER_RADIUS.md,
  },
  checkInDetails: {
    flexDirection: 'row',
    marginBottom: ResponsiveUtils.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: ResponsiveUtils.spacing.lg,
  },
  detailText: {
    marginLeft: SPACING.xs,
    fontSize: ResponsiveUtils.fontSize.small,
    color: 'COLORS.text.secondary',
  },
  actionButtons: {
    alignItems: 'flex-end',
  },
  emptyState: {
    alignItems: 'center',
    padding: ResponsiveUtils.spacing.xl,
  },
  emptyText: {
    fontSize: ResponsiveUtils.fontSize.medium,
    color: 'COLORS.text.secondary',
    marginTop: ResponsiveUtils.spacing.sm,
  },
  emptySubtext: {
    fontSize: ResponsiveUtils.fontSize.small,
    color: 'COLORS.gray[500]',
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.base,
    right: 0,
    bottom: 0,
    backgroundColor: 'COLORS.info[500]',
  },
  // Modal styles
  modalContainer: {
    backgroundColor: 'COLORS.white',
    padding: SPACING.lg,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.sm,
    color: 'COLORS.text.primary',
  },
  classSelection: {
    maxHeight: 60,
    marginBottom: 16,
  },
  classChip: {
    marginRight: 8,
  },
  searchbar: {
    marginBottom: 16,
  },
  batchControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: 16,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 16,
  },
  selectionCount: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.semibold,
    color: 'COLORS.info[500]',
  },
  batchButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  batchButton: {
    minWidth: 80,
  },
  studentsList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  selectButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: 8,
  },
  individualCheckInButton: {
    minWidth: 80,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  batchCheckInButton: {
    backgroundColor: 'COLORS.primary[500]',
  },
  // Estilos para indicadores visuais de check-in
  studentDescription: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  studentEmail: {
    fontSize: FONT_SIZE.base,
    color: 'COLORS.text.secondary',
    flex: 1,
  },
  checkInChip: {
    backgroundColor: COLORS.primary[50],
    marginLeft: 8,
  },
  checkInChipText: {
    color: 'COLORS.primary[500]',
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  studentLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkInIcon: {
    marginLeft: 8,
  },
  studentItem: {
    borderRadius: BORDER_RADIUS.md,
    marginVertical: 2,
    backgroundColor: COLORS.white,
  },
  studentItemCheckedIn: {
    backgroundColor: COLORS.background.light,
    borderLeftWidth: 4,
    borderLeftColor: 'COLORS.primary[500]',
  },
  selectButtonDisabled: {
    opacity: 0.5,
  },
  alreadyCheckedInButton: {
    backgroundColor: COLORS.primary[50],
    borderColor: 'COLORS.primary[500]',
  },
  modalSubtitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: 16,
    color: 'COLORS.text.primary',
    textAlign: 'center',
  },
  classSelectionContainer: {
    marginBottom: 20,
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  classButton: {
    flex: 1,
    minWidth: '45%',
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    elevation: 2,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  classButtonSelected: {
    backgroundColor: 'COLORS.primary[500]',
    elevation: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 8px rgba(76,175,80,0.3)',
      },
    }),
  },
  classButtonLabel: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.semibold,
  },
  searchbar: {
    marginBottom: 16,
  },
  studentsList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[300],
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  closeButton: {
    backgroundColor: 'COLORS.info[500]',
  },
});

export default CheckIn;
