import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Platform, Dimensions } from 'react-native';
import {
  Card,
  Button,
  Avatar,
  Chip,
  Divider,
  Text,
  List,
  IconButton,
  ProgressBar,
  Badge
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@contexts/AuthProvider';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService } from '@services/academyFirestoreService';
import SafeCardContent from '@components/SafeCardContent';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT, BORDER_WIDTH } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import { getAuthGradient } from '@presentation/theme/authTheme';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

interface StudentData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: any;
  birthDate?: any;
  currentGraduation?: string;
  classIds?: string[];
  [key: string]: any;
}

interface ClassData {
  id: string;
  name: string;
  modality: string;
  schedule?: any[];
  [key: string]: any;
}

interface PaymentData {
  id: string;
  userId: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  createdAt: any;
  [key: string]: any;
}

interface GraduationData {
  id: string;
  studentId: string;
  graduation: string;
  modality: string;
  date: any;
  [key: string]: any;
}

type StudentProfileRouteParams = {
  StudentProfile: {
    studentId: string;
  };
};

interface StudentProfileScreenProps {
  navigation: NavigationProp<any>;
  route: RouteProp<StudentProfileRouteParams, 'StudentProfile'>;
}

const { width } = Dimensions.get('window');

const StudentProfileScreen: React.FC<StudentProfileScreenProps> = ({ route, navigation }) => {
  const { currentTheme } = useThemeToggle();
  const { getString, isDarkMode } = useTheme();
  const { studentId } = route.params;
  const { user, userProfile, academia } = useAuth();
  const [studentInfo, setStudentInfo] = useState<StudentData | null>(null);
  const [studentClasses, setStudentClasses] = useState<ClassData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [graduations, setGraduations] = useState<GraduationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (studentId) {
      loadStudentDetails();
    }
  }, [studentId]);

  const loadStudentDetails = async () => {
    try {
      setLoading(true);

      // Carregar dados do aluno se não foram passados
      if (!studentInfo) {
        const details = await academyFirestoreService.getById('users', studentId);
        setStudentInfo(details);
      }

      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error(getString('academyIdNotFound'));
        return;
      }

      // Buscar turmas do aluno na academia
      const allClasses = await academyFirestoreService.getAll('classes', academiaId) as ClassData[];
      const userClasses = allClasses.filter(cls =>
        details?.classIds && details.classIds.includes(cls.id)
      );
      setStudentClasses(userClasses);

      // Buscar pagamentos do aluno na academia
      const allPayments = await academyFirestoreService.getAll('payments', academiaId) as PaymentData[];
      const userPayments = allPayments.filter(payment =>
        payment.userId === studentId
      ).sort((a: PaymentData, b: PaymentData) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt).getTime() / 1000;
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt).getTime() / 1000;
        return dateB - dateA;
      });
      setPayments(userPayments);

      // Buscar graduações com tratamento robusto de erros
      try {
        const allGraduations = await academyFirestoreService.getAll('graduations', academiaId) as GraduationData[];
        const userGraduations = allGraduations.filter(graduation =>
          graduation.studentId === studentId
        ).sort((a: GraduationData, b: GraduationData) => {
          const dateA = a.date?.seconds ? a.date.seconds : new Date(a.date).getTime() / 1000;
          const dateB = b.date?.seconds ? b.date.seconds : new Date(b.date).getTime() / 1000;
          return dateB - dateA;
        });
        setGraduations(userGraduations);
      } catch (graduationError: any) {
        console.warn('Não foi possível carregar graduações:', graduationError.message);
        // Se for erro de permissão, não mostrar erro ao usuário, apenas log
        if (graduationError.code !== 'permission-denied') {
          console.error('Erro inesperado ao carregar graduações:', graduationError);
        }
        setGraduations([]);
      }

    } catch (error: any) {
      console.error('Erro ao carregar detalhes do aluno:', error);
      let errorMessage = 'Não foi possível carregar os detalhes do aluno';

      if (error?.code === 'permission-denied') {
        errorMessage = 'Você não tem permissão para visualizar este perfil.';
      } else if (error?.code === 'unavailable') {
        errorMessage = 'Serviço temporariamente indisponível. Tente novamente.';
      }

      Alert.alert(getString('error'), errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStudentDetails();
  };

  const getPaymentStatusColor = (status: 'paid' | 'pending' | 'overdue' | string) => {
    const colors: Record<string, string> = {
      'paid': COLORS.primary[500],
      'pending': COLORS.warning[500],
      'overdue': COLORS.error[500]
    };
    return colors[status] || COLORS.text.secondary;
  };

  const getPaymentStatusText = (status: 'paid' | 'pending' | 'overdue' | string) => {
    const texts: Record<string, string> = {
      'paid': getString('paid'),
      'pending': getString('paymentPending'),
      'overdue': getString('overdue')
    };
    return texts[status] || status;
  };

  const formatDate = (date: any, format = 'long') => {
    if (!date) return getString('dataNotAvailable');
    const dateObj = date.seconds ? new Date(date.seconds * 1000) : new Date(date);

    if (format === 'short') {
      return dateObj.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric'
      });
    }

    return dateObj.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: getString('currency')
    }).format(value || 0);
  };

  const calculateAge = (birthDate: any) => {
    if (!birthDate) return null;
    const birth = birthDate.seconds ? new Date(birthDate.seconds * 1000) : new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleAddGraduation = () => {
    navigation.navigate('AddGraduation', {
      studentId: studentId,
      studentName: studentInfo?.name || getString('student')
    });
  };

  if (loading && !studentInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando perfil do aluno...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header do Perfil com Gradiente */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[COLORS.secondary[400], COLORS.secondary[600]]}
            style={styles.gradientHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileHeaderContent}>
              <View style={styles.avatarContainer}>
                <Avatar.Text
                  size={100}
                  label={studentInfo?.name?.charAt(0) || 'A'}
                  style={styles.avatar}
                  labelStyle={styles.avatarLabel}
                />
                {studentInfo?.isActive !== false && (
                  <Badge style={styles.activeBadge} size={20}>
                    <MaterialCommunityIcons name="check" size={12} color={COLORS.white} />
                  </Badge>
                )}
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.studentName}>{studentInfo?.name || getString('student')}</Text>
                <Text style={styles.studentEmail}>{studentInfo?.email}</Text>

                <View style={styles.statusRow}>
                  <View style={styles.statusItem}>
                    <Ionicons name="time-outline" size={16} color={COLORS.white} />
                    <Text style={styles.statusText}>
                      {calculateAge(studentInfo?.birthDate) || '--'} anos
                    </Text>
                  </View>

                  <View style={styles.statusItem}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.white} />
                    <Text style={styles.statusText}>
                      Desde {formatDate(studentInfo?.createdAt, 'short')}
                    </Text>
                  </View>
                </View>

                {studentInfo?.currentGraduation && (
                  <View style={styles.graduationContainer}>
                    <Ionicons name="trophy" size={16} color={COLORS.warning[300]} />
                    <Text style={styles.graduationText}>
                      {studentInfo.currentGraduation}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Cards de Estatísticas Rápidas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="school-outline" size={24} color={COLORS.primary[500]} />
            </View>
            <Text style={styles.statNumber}>{studentClasses.length}</Text>
            <Text style={styles.statLabel}>Turmas</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trophy-outline" size={24} color={COLORS.warning[300]} />
            </View>
            <Text style={styles.statNumber}>{graduations.length}</Text>
            <Text style={styles.statLabel}>Graduações</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="card-outline" size={24} color={COLORS.info[500]} />
            </View>
            <Text style={styles.statNumber}>{payments.filter(p => p.status === 'paid').length}</Text>
            <Text style={styles.statLabel}>Pagos</Text>
          </View>
        </View>

        {/* Informações Pessoais Modernizadas */}
        <Card style={styles.modernCard}>
          <SafeCardContent source="StudentProfile/personalInfo">
            <View style={styles.modernCardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="person-outline" size={24} color={COLORS.secondary[400]} />
              </View>
              <Text style={styles.modernCardTitle}>Informações Pessoais</Text>
            </View>

            <View style={styles.modernInfoGrid}>
              <View style={styles.modernInfoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="call-outline" size={20} color={COLORS.secondary[400]} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.modernInfoLabel}>Telefone</Text>
                  <Text style={styles.modernInfoValue}>
                    {studentInfo?.phone || getString('notInformed')}
                  </Text>
                </View>
              </View>

              <View style={styles.modernInfoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="location-outline" size={20} color={COLORS.secondary[400]} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.modernInfoLabel}>Endereço</Text>
                  <Text style={styles.modernInfoValue}>
                    {studentInfo?.address || getString('notInformed')}
                  </Text>
                </View>
              </View>

              <View style={styles.modernInfoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.secondary[400]} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.modernInfoLabel}>Data de Nascimento</Text>
                  <Text style={styles.modernInfoValue}>
                    {formatDate(studentInfo?.birthDate) || getString('notInformed')}
                  </Text>
                </View>
              </View>

              <View style={styles.modernInfoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="time-outline" size={20} color={COLORS.secondary[400]} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.modernInfoLabel}>Membro desde</Text>
                  <Text style={styles.modernInfoValue}>
                    {formatDate(studentInfo?.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
          </SafeCardContent>
        </Card>

        {/* Turmas Matriculadas Modernizadas */}
        <Card style={styles.modernCard}>
          <SafeCardContent source="StudentProfile/classes">
            <View style={styles.modernCardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="school-outline" size={24} color={COLORS.primary[500]} />
              </View>
              <Text style={styles.modernCardTitle}>Turmas Matriculadas</Text>
              <Badge style={styles.countBadge}>{studentClasses.length}</Badge>
            </View>

            {studentClasses.length > 0 ? (
              <View style={styles.classesGrid}>
                {studentClasses.map((classItem, index) => (
                  <View key={classItem.id || index} style={styles.classCard}>
                    <View style={styles.classCardHeader}>
                      <View style={styles.classIconContainer}>
                        <Ionicons name="fitness-outline" size={20} color={COLORS.primary[500]} />
                      </View>
                      <Text style={styles.className}>{classItem.name}</Text>
                    </View>

                    <Text style={styles.classModality}>{classItem.modality}</Text>

                    <View style={styles.classFooter}>
                      <View style={styles.scheduleInfo}>
                        <Ionicons name="time-outline" size={14} color={COLORS.text.secondary} />
                        <Text style={styles.scheduleText}>
                          {classItem.schedule?.length || 0} horários
                        </Text>
                      </View>

                      <IconButton
                        icon="chevron-right"
                        size={20}
                        iconColor={COLORS.secondary[400]}
                        onPress={() => navigation.navigate('ClassDetails', {
                          classId: classItem.id,
                          classData: classItem
                        })}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="school-outline" size={48} color={COLORS.gray[400]} />
                <Text style={styles.emptyStateText}>
                  Nenhuma turma matriculada
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  O aluno ainda não foi matriculado em nenhuma turma
                </Text>
              </View>
            )}
          </SafeCardContent>
        </Card>

        {/* Timeline de Graduações */}
        <Card style={styles.modernCard}>
          <SafeCardContent source="StudentProfile/graduations">
            <View style={styles.modernCardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="trophy-outline" size={24} color={COLORS.warning[300]} />
              </View>
              <Text style={styles.modernCardTitle}>Timeline de Graduações</Text>
              <Badge style={styles.countBadge}>{graduations.length}</Badge>
            </View>

            {graduations.length > 0 ? (
              <View style={styles.timelineContainer}>
                {graduations.map((graduation, index) => (
                  <View key={graduation.id || index} style={styles.timelineItem}>
                    <View style={styles.timelineDot}>
                      <Ionicons name="trophy" size={16} color={COLORS.warning[300]} />
                    </View>

                    <View style={styles.timelineContent}>
                      <View style={styles.graduationCard}>
                        <Text style={styles.graduationTitle}>{graduation.graduation}</Text>
                        <Text style={styles.graduationModality}>{graduation.modality}</Text>
                        <View style={styles.graduationDate}>
                          <Ionicons name="calendar-outline" size={14} color={COLORS.text.secondary} />
                          <Text style={styles.graduationDateText}>
                            {formatDate(graduation.date)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {index < graduations.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={48} color={COLORS.gray[400]} />
                <Text style={styles.emptyStateText}>
                  Nenhuma graduação registrada
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Adicione a primeira graduação do aluno
                </Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleAddGraduation}
              style={styles.modernAddButton}
              icon="plus"
              buttonColor={COLORS.warning[300]}
              textColor={COLORS.text.primary}
            >
              Nova Graduação
            </Button>
          </SafeCardContent>
        </Card>

        {/* Resumo Financeiro */}
        <Card style={styles.modernCard}>
          <SafeCardContent source="StudentProfile/payments">
            <View style={styles.modernCardHeader}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="card-outline" size={24} color={COLORS.info[500]} />
              </View>
              <Text style={styles.modernCardTitle}>Resumo Financeiro</Text>
            </View>

            {/* Indicadores Financeiros */}
            <View style={styles.financialIndicators}>
              <View style={styles.financialCard}>
                <Text style={styles.financialValue}>
                  {formatCurrency(payments.reduce((sum, p) => p.status === 'paid' ? sum + p.amount : sum, 0))}
                </Text>
                <Text style={styles.financialLabel}>Total Pago</Text>
                <View style={styles.financialIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary[500]} />
                </View>
              </View>

              <View style={styles.financialCard}>
                <Text style={styles.financialValue}>
                  {formatCurrency(payments.reduce((sum, p) => p.status === 'pending' ? sum + p.amount : sum, 0))}
                </Text>
                <Text style={styles.financialLabel}>Pendente</Text>
                <View style={styles.financialIcon}>
                  <Ionicons name="time-outline" size={20} color={COLORS.warning[500]} />
                </View>
              </View>
            </View>

            {/* Últimos Pagamentos */}
            {payments.length > 0 ? (
              <View style={styles.paymentsSection}>
                <Text style={styles.sectionTitle}>Últimos Pagamentos</Text>
                {payments.slice(0, 3).map((payment, index) => (
                  <View key={payment.id || index} style={styles.paymentItem}>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentAmount}>
                        {formatCurrency(payment.amount)}
                      </Text>
                      <Text style={styles.paymentDate}>
                        {formatDate(payment.createdAt)}
                      </Text>
                    </View>

                    <View style={[
                      styles.paymentStatus,
                      { backgroundColor: getPaymentStatusColor(payment.status) + '20' }
                    ]}>
                      <Text style={[
                        styles.paymentStatusText,
                        { color: getPaymentStatusColor(payment.status) }
                      ]}>
                        {getPaymentStatusText(payment.status)}
                      </Text>
                    </View>
                  </View>
                ))}

                {payments.length > 3 && (
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('StudentPayments', { studentId })}
                    style={styles.viewAllPaymentsButton}
                    textColor={COLORS.secondary[400]}
                  >
                    Ver Todos os Pagamentos ({payments.length})
                  </Button>
                )}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={48} color={COLORS.gray[400]} />
                <Text style={styles.emptyStateText}>
                  Nenhum pagamento registrado
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Histórico de pagamentos aparecerá aqui
                </Text>
              </View>
            )}
          </SafeCardContent>
        </Card>

        {/* Ações Rápidas */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.actionCard}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('EditStudent', {
                studentId,
                studentData: studentInfo
              })}
              style={styles.primaryActionButton}
              icon="pencil"
              buttonColor={COLORS.secondary[400]}
            >
              Editar Perfil
            </Button>
          </View>

          <View style={styles.actionCard}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('AddGraduation', {
                studentId,
                studentName: studentInfo?.name
              })}
              style={styles.primaryActionButton}
              icon="trophy"
              buttonColor={COLORS.warning[300]}
              textColor={COLORS.text.primary}
            >
              Nova Graduação
            </Button>
          </View>
        </View>

        {/* Espaçamento final */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },

  // Header com gradiente
  headerContainer: {
    marginBottom: 20,
  },
  gradientHeader: {
    paddingTop: SPACING.xs,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 20px currentTheme.black + "26"',
      },
    }),
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: COLORS.white + '33',
    borderWidth: 3,
    borderColor: COLORS.white + '4D',
  },
  avatarLabel: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: COLORS.white,
  },
  activeBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary[500],
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  studentName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
  },
  studentEmail: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white + 'E6',
    marginBottom: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    gap: SPACING.base,
    marginBottom: SPACING.sm,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.white,
    fontWeight: '500' as const,
  },
  graduationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.xs,
  },
  graduationText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.warning[300],
    fontWeight: '600' as const,
  },

  // Cards de estatísticas
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: SPACING.md,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card.default.background,
    borderColor: COLORS.card.default.border,
    borderWidth: BORDER_WIDTH.thin,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: `0 2px 12px ${COLORS.card.default.shadow}`,
      },
    }),
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.card.elevated.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statNumber: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    fontWeight: '500' as const,
    textAlign: 'center',
  },

  // Cards modernos
  modernCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.card.default.background,
    borderColor: COLORS.card.default.border,
    borderWidth: BORDER_WIDTH.thin,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: `0 2px 12px ${COLORS.card.default.shadow}`,
      },
    }),
  },
  modernCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.card.elevated.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  modernCardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700' as const,
    color: COLORS.text.primary,
    flex: 1,
  },
  countBadge: {
    backgroundColor: COLORS.secondary[400],
  },

  // Informações pessoais
  modernInfoGrid: {
    gap: SPACING.base,
  },
  modernInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    backgroundColor: COLORS.card.elevated.background,
    borderRadius: BORDER_RADIUS.md,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card.default.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  modernInfoLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    fontWeight: '500' as const,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modernInfoValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
    fontWeight: '600' as const,
  },

  // Turmas
  classesGrid: {
    gap: SPACING.md,
  },
  classCard: {
    backgroundColor: COLORS.card.elevated.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
  },
  classCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  classIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.card.default.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  className: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700' as const,
    color: COLORS.text.primary,
    flex: 1,
  },
  classModality: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    fontWeight: '500' as const,
  },
  classFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  scheduleText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    fontWeight: '500' as const,
  },

  // Timeline de graduações
  timelineContainer: {
    paddingLeft: 20,
  },
  timelineItem: {
    position: 'relative',
    paddingBottom: 20,
  },
  timelineDot: {
    position: 'absolute',
    left: -28,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.warning[300],
  },
  timelineContent: {
    marginLeft: 20,
  },
  timelineLine: {
    position: 'absolute',
    left: -12,
    top: 40,
    bottom: -20,
    width: 2,
    backgroundColor: COLORS.gray[100],
  },
  graduationCard: {
    backgroundColor: COLORS.card.elevated.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning[300],
  },
  graduationTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700' as const,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  graduationModality: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
    fontWeight: '500' as const,
  },
  graduationDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  graduationDateText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    fontWeight: '500' as const,
  },

  // Resumo financeiro
  financialIndicators: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: 20,
  },
  financialCard: {
    flex: 1,
    backgroundColor: COLORS.card.elevated.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.base,
    position: 'relative',
  },
  financialValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  financialLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    fontWeight: '500' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  financialIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  paymentsSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700' as const,
    color: COLORS.text.primary,
    marginBottom: SPACING.base,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700' as const,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    fontWeight: '500' as const,
  },
  paymentStatus: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.lg,
  },
  paymentStatusText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600' as const,
  },
  viewAllPaymentsButton: {
    marginTop: SPACING.md,
  },

  // Estados vazios
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  emptyStateText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600' as const,
    color: COLORS.gray[500],
    marginTop: SPACING.base,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[400],
    textAlign: 'center',
    lineHeight: 20,
  },

  // Botões modernos
  modernAddButton: {
    marginTop: 20,
    borderRadius: BORDER_RADIUS.md,
  },

  // Ações rápidas
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: SPACING.md,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
  },
  primaryActionButton: {
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.xs,
  },

  // Espaçamento
  bottomSpacing: {
    height: 20,
  },
});

export default StudentProfileScreen;
