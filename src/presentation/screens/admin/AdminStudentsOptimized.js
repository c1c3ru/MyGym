import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  FAB,
  Searchbar,
  Menu,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@contexts/AuthProvider';
import { academyFirestoreService } from '@services/academyFirestoreService';
import OptimizedStudentCard from '@components/OptimizedStudentCard';
import LoadingSpinner from '@components/LoadingSpinner';
import StudentDisassociationDialog from '@components/StudentDisassociationDialog';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';

const AdminStudentsOptimized = ({ navigation }) => {
  const { currentTheme } = useThemeToggle();
  
  const { user, userProfile, academia } = useAuth();
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDisassociationDialog, setShowDisassociationDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Auto-refresh quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [userProfile?.academiaId])
  );

  // Filtros memoizados para performance
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.currentGraduation?.toLowerCase().includes(searchQuery.toLowerCase())
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
      case 'payment_ok':
        filtered = filtered.filter(s => s.paymentStatus === 'paid');
        break;
      case 'payment_pending':
        filtered = filtered.filter(s => s.paymentStatus === 'pending');
        break;
      case 'payment_overdue':
        filtered = filtered.filter(s => s.paymentStatus === 'overdue');
        break;
      default:
        break;
    }

    return filtered;
  }, [students, searchQuery, selectedFilter]);

  // Estatísticas memoizadas
  const stats = useMemo(() => ({
    total: students.length,
    active: students.filter(s => s.isActive !== false).length,
    paymentOk: students.filter(s => s.paymentStatus === 'paid').length,
    overdue: students.filter(s => s.paymentStatus === 'overdue').length,
  }), [students]);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      
      const academiaId = userProfile?.academiaId || academia?.id;
      console.log('🏫 Academia ID:', academiaId);
      if (!academiaId) {
        console.error('❌ Academia ID não encontrado');
        return;
      }
      
      console.log('🔍 Buscando alunos na academia:', academiaId);
      const studentUsers = await academyFirestoreService.getAll('students', academiaId);
      console.log('👥 Alunos encontrados:', studentUsers.length);
      
      // Buscar informações de pagamento para cada aluno
      const studentsWithPayments = await Promise.all(
        studentUsers.map(async (student) => {
          try {
            const payments = await academyFirestoreService.getWhere('payments', 'studentId', '==', student.id, academiaId);
            const latestPayment = payments[0];
            return {
              ...student,
              paymentStatus: latestPayment?.status || 'unknown',
              lastPaymentDate: latestPayment?.createdAt,
              totalPayments: payments.length
            };
          } catch (error) {
            return {
              ...student,
              paymentStatus: 'unknown',
              totalPayments: 0
            };
          }
        })
      );
      
      setStudents(studentsWithPayments);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      Alert.alert(getString('error'), 'Não foi possível carregar os alunos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userProfile?.academiaId, academia?.id]);

  // Callbacks memoizados para performance
  const handleStudentPress = useCallback((student) => {
    navigation.navigate('StudentProfile', { student });
  }, [navigation]);

  const handleEditStudent = useCallback((student) => {
    navigation.navigate('EditStudent', { student });
  }, [navigation]);

  const handleAddStudent = useCallback(() => {
    navigation.navigate('AddStudent');
  }, [navigation]);

  const handleDisassociateStudent = useCallback((student) => {
    setSelectedStudent(student);
    setShowDisassociationDialog(true);
  }, []);

  const handleNavigateToPayments = useCallback((studentId) => {
    navigation.navigate('StudentPayments', { studentId });
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStudents();
  }, [loadStudents]);

  const getFilterText = useCallback((filter) => {
    const filters = {
      'all': 'Todos',
      'active': 'Ativos',
      'inactive': 'Inativos',
      'payment_ok': 'Pagamento OK',
      'payment_pending': 'Pagamento Pendente',
      'payment_overdue': 'Pagamento Atrasado'
    };
    return filters[filter] || 'Todos';
  }, []);

  // Render item otimizado para FlashList
  const renderItem = useCallback(({ item: student }) => (
    <OptimizedStudentCard
      student={student}
      onStudentPress={handleStudentPress}
      onEditStudent={handleEditStudent}
      onDisassociateStudent={handleDisassociateStudent}
      onNavigateToPayments={handleNavigateToPayments}
    />
  ), [handleStudentPress, handleEditStudent, handleDisassociateStudent, handleNavigateToPayments]);

  // Componente de cabeçalho
  const ListHeaderComponent = useMemo(() => (
    <View style={styles.header}>
      <Searchbar
        placeholder="Buscar alunos..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        accessible={true}
        accessibilityLabel="Campo de busca de alunos"
        accessibilityHint="Digite para buscar alunos por nome, email ou graduação"
      />
      
      <View style={styles.filterRow}>
        <Menu
          visible={filterVisible}
          onDismiss={() => setFilterVisible(false)}
          anchor={
            <Button 
              mode="outlined" 
              onPress={() => setFilterVisible(true)}
              icon="filter"
              style={styles.filterButton}
              accessible={true}
              accessibilityLabel={`Filtro atual: ${getFilterText(selectedFilter)}`}
              accessibilityHint="Toque para alterar o filtro"
            >
              {getFilterText(selectedFilter)}
            </Button>
          }
        >
          <Menu.Item onPress={() => { setSelectedFilter('all'); setFilterVisible(false); }} title="Todos" />
          <Menu.Item onPress={() => { setSelectedFilter('active'); setFilterVisible(false); }} title="Ativos" />
          <Menu.Item onPress={() => { setSelectedFilter('inactive'); setFilterVisible(false); }} title="Inativos" />
          <Divider />
          <Menu.Item onPress={() => { setSelectedFilter('payment_ok'); setFilterVisible(false); }} title="Pagamento OK" />
          <Menu.Item onPress={() => { setSelectedFilter('payment_pending'); setFilterVisible(false); }} title="Pagamento Pendente" />
          <Menu.Item onPress={() => { setSelectedFilter('payment_overdue'); setFilterVisible(false); }} title="Pagamento Atrasado" />
        </Menu>
      </View>
    </View>
  ), [searchQuery, filterVisible, selectedFilter, getFilterText]);

  // Componente de rodapé com estatísticas
  const ListFooterComponent = useMemo(() => (
    students.length > 0 ? (
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.statsTitle} accessibilityRole="header">
            Estatísticas Gerais
          </Title>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Title style={styles.statNumber} accessible={true}>
                {stats.total}
              </Title>
              <Paragraph style={styles.statLabel}>Total</Paragraph>
            </View>
            
            <View style={styles.statItem}>
              <Title style={styles.statNumber} accessible={true}>
                {stats.active}
              </Title>
              <Paragraph style={styles.statLabel}>Ativos</Paragraph>
            </View>
            
            <View style={styles.statItem}>
              <Title style={styles.statNumber} accessible={true}>
                {stats.paymentOk}
              </Title>
              <Paragraph style={styles.statLabel}>Pagamento OK</Paragraph>
            </View>
            
            <View style={styles.statItem}>
              <Title style={styles.statNumber} accessible={true}>
                {stats.overdue}
              </Title>
              <Paragraph style={styles.statLabel}>Atrasados</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    ) : null
  ), [students.length, stats]);

  // Componente vazio
  const ListEmptyComponent = useMemo(() => (
    <Card style={styles.emptyCard}>
      <Card.Content style={styles.emptyContent}>
        <Ionicons name="people-outline" size={48} color="currentTheme.gray[300]" />
        <Title style={styles.emptyTitle}>Nenhum aluno encontrado</Title>
        <Paragraph style={styles.emptyText}>
          {searchQuery ? 
            'Nenhum aluno corresponde à sua busca' : 
            'Nenhum aluno cadastrado ainda'
          }
        </Paragraph>
      </Card.Content>
    </Card>
  ), [searchQuery]);

  if (loading) {
    return <LoadingSpinner message="Carregando alunos..." />;
  }

  return (
    <SafeAreaView style={styles.container} accessible={true}>
      <FlashList
        data={filteredStudents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={200}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel={`Lista de ${filteredStudents.length} alunos`}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        label="Novo Aluno"
        onPress={handleAddStudent}
        accessible={true}
        accessibilityLabel="Adicionar novo aluno"
        accessibilityHint="Toque para cadastrar um novo aluno"
      />

      <StudentDisassociationDialog
        visible={showDisassociationDialog}
        onDismiss={() => {
          setShowDisassociationDialog(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onSuccess={() => {
          loadStudents();
          setShowDisassociationDialog(false);
          setSelectedStudent(null);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  listContainer: {
    paddingBottom: 80,
  },
  header: {
    padding: SPACING.base,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[300],
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 0,
    backgroundColor: COLORS.background.light,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  filterButton: {
    borderColor: COLORS.info[500],
  },
  statsCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    borderRadius: BORDER_RADIUS.md,
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: COLORS.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.info[500],
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  emptyCard: {
    marginHorizontal: 16,
    marginVertical: 32,
    elevation: 2,
    borderRadius: BORDER_RADIUS.md,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    color: COLORS.text.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.text.secondary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.base,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary[500],
  },
});

export default AdminStudentsOptimized;