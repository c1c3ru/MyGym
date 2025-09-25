
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, RefreshControl, Animated, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Avatar,
  Text,
  List,
  Modal,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SafeIonicons, SafeMaterialCommunityIcons } from '@components/SafeIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthProvider';
import { ADMIN_COLORS, ADMIN_ICONS } from '@components/theme/adminTheme';
import { academyFirestoreService } from '@services/academyFirestoreService';
import AnimatedCard from '@/components/AnimatedCard';
import AnimatedButton from '@/components/AnimatedButton';
import { useAnimation, ResponsiveUtils } from '@utils/animations';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import EnhancedErrorBoundary from '@/components/EnhancedErrorBoundary';
import cacheService, { CACHE_KEYS, CACHE_TTL } from '@services/cacheService';
import batchFirestoreService from '@services/batchFirestoreService';
import { useScreenTracking, useUserActionTracking } from '@/hooks/useAnalytics';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';

const AdminDashboard = ({ navigation }) => {
  const { user, userProfile, logout, academia } = useAuth();
  const { animations, startEntryAnimation } = useAnimation();
  const scrollY = new Animated.Value(0);

  // Analytics tracking
  useScreenTracking('AdminDashboard', { 
    academiaId: userProfile?.academiaId,
    userType: userProfile?.userType 
  });
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();
  
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalClasses: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
    recentActivities: [],
    quickStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Skeleton pulse for loading state
  const [skeletonPulse] = useState(new Animated.Value(0.6));

  useEffect(() => {
    loadDashboardData();
    startEntryAnimation();
  }, []);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonPulse, { toValue: 1, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(skeletonPulse, { toValue: 0.6, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
        ])
      ).start();
    }
  }, [loading]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar todos os alunos da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error('Academia ID não encontrado');
        return;
      }

      // Usar cache inteligente para carregar dados do dashboard
      const cacheKey = CACHE_KEYS.DASHBOARD(academiaId);
      
      const dashboardStats = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log('🔍 Buscando dados do dashboard (cache miss):', academiaId);
          
          // Usar batch processing para carregar múltiplas coleções
          const [students, classes, payments, instructors] = await Promise.all([
            academyFirestoreService.getAll('students', academiaId),
            academyFirestoreService.getAll('classes', academiaId),
            academyFirestoreService.getAll('payments', academiaId),
            academyFirestoreService.getAll('instructors', academiaId)
          ]);

          const activeStudents = students.filter(s => s.isActive !== false);
          
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          const monthlyPayments = payments.filter(p => {
            const paymentDate = new Date(p.createdAt?.seconds ? p.createdAt.seconds * 1000 : p.createdAt);
            return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
          });
          
          const pendingPayments = payments.filter(p => p.status === 'pending').length;
          const overduePayments = payments.filter(p => p.status === 'overdue').length;
          
          const monthlyRevenue = monthlyPayments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
          
          // Buscar atividades recentes (simulado - em produção viria do Firestore)
          const recentActivities = [
            {
              type: 'new_student',
              message: 'Novo aluno cadastrado',
              time: '2 horas atrás',
              icon: 'person-add'
            },
            {
              type: 'payment',
              message: 'Pagamento recebido',
              time: '4 horas atrás',
              icon: 'card'
            },
            {
              type: 'graduation',
              message: 'Graduação registrada',
              time: '1 dia atrás',
              icon: 'trophy'
            }
          ];

          return {
            totalStudents: students.length,
            activeStudents: activeStudents.length,
            totalClasses: classes.length,
            monthlyRevenue,
            pendingPayments,
            overduePayments,
            recentActivities,
            quickStats: {
              instructors: instructors.length,
              modalities: [...new Set(classes.map(c => c.modality))].length
            }
          };
        },
        CACHE_TTL.SHORT // Cache por 2 minutos (dados do dashboard mudam frequentemente)
      );

      setDashboardData(dashboardStats);
      console.log('✅ Dashboard carregado com sucesso');
      
      // Track analytics
      trackFeatureUsage('dashboard_loaded', {
        totalStudents: dashboardStats.totalStudents,
        totalClasses: dashboardStats.totalClasses,
        academiaId
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard admin:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userProfile?.academiaId, academia?.id, trackFeatureUsage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Invalidar cache do dashboard para forçar refresh
    const academiaId = userProfile?.academiaId || academia?.id;
    if (academiaId) {
      cacheService.invalidatePattern(`dashboard:${academiaId}`);
    }
    loadDashboardData();
  }, [loadDashboardData, userProfile?.academiaId, academia?.id]);

  const handleLogout = useCallback(async () => {
    try {
      trackButtonClick('logout');
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [logout, trackButtonClick]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getActivityIcon = (type) => ADMIN_ICONS.activities[type] || ADMIN_ICONS.activities.fallback;

  const getActivityColor = (type) => {
    const colors = {
      'new_student': '#4CAF50',
      'payment': '#2196F3',
      'graduation': '#FFD700',
      'class': '#FF9800',
      'announcement': '#9C27B0'
    };
    return colors[type] || '#666';
  };

  const headerTransform = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 100],
          outputRange: [0, -20],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  // Memoized navigation handlers
  const handleNavigateToStudents = useCallback(() => {
    trackButtonClick('navigate_students');
    navigation.navigate('Alunos');
  }, [navigation, trackButtonClick]);

  const handleNavigateToClasses = useCallback(() => {
    trackButtonClick('navigate_classes');
    navigation.navigate('Turmas');
  }, [navigation, trackButtonClick]);

  const handleNavigateToManagement = useCallback(() => {
    trackButtonClick('navigate_management');
    navigation.navigate('Gestão');
  }, [navigation, trackButtonClick]);

  const handleShowQR = useCallback(() => {
    trackButtonClick('show_qr_code');
    setShowQRModal(true);
  }, [trackButtonClick]);

  // Render skeletons while loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <EnhancedErrorBoundary
      onError={(error, errorInfo, errorId) => {
        console.error('🚨 Erro no AdminDashboard:', { error, errorInfo, errorId });
      }}
      errorContext={{ screen: 'AdminDashboard', academiaId: userProfile?.academiaId }}
    >
      <SafeAreaView style={styles.container}>
      {/* Modal do QR Code */}
      <Modal 
        visible={showQRModal} 
        onDismiss={() => setShowQRModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <QRCodeGenerator 
          academiaId={academia?.id}
          academiaNome={academia?.nome}
          size={200}
          showActions={true}
        />
        <Button 
          mode="outlined" 
          onPress={() => setShowQRModal(false)}
          style={styles.closeModalButton}
        >
          Fechar
        </Button>
      </Modal>
      <Animated.ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: Platform.OS !== 'web' }
        )}
        scrollEventThrottle={16}
      >
        {/* Header moderno com gradiente (similar ao do Instrutor) */}
        <Animated.View style={[headerTransform]}>
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={ADMIN_COLORS.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerContentModern}>
                <Animated.View style={{ transform: [{ scale: animations.scaleAnim }] }}>
                  <Avatar.Text 
                    size={ResponsiveUtils.isTablet() ? 85 : 65}
                    label={userProfile?.name?.charAt(0) || 'A'}
                    style={styles.avatarModern}
                  />
                </Animated.View>
                <View style={styles.headerTextModern}>
                  <Text style={styles.welcomeTextModern}>
                    Olá, {userProfile?.name?.split(' ')[0] || 'Admin'}! 👋
                  </Text>
                  <Text style={styles.roleTextModern}>
                    Administrador da Academia
                  </Text>
                  <View style={styles.statusBadge}>
                    <SafeMaterialCommunityIcons name="circle" size={8} color="#4CAF50" />
                    <Text style={styles.statusText}>Online</Text>
                  </View>
                  {/* Código da Academia */}
                  {academia?.codigo && (
                    <TouchableOpacity 
                      style={styles.academiaCodeContainer}
                      onPress={handleShowQR}
                    >
                      <SafeMaterialCommunityIcons name="qrcode" size={16} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.academiaCodeText}>
                        Código: {academia.codigo}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Animated.View style={{ opacity: animations.fadeAnim }}>
                  <TouchableOpacity onPress={handleShowQR}>
                    <SafeMaterialCommunityIcons 
                      name="qrcode-scan" 
                      size={24} 
                      color="rgba(255,255,255,0.85)" 
                    />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Estatísticas principais em cards com gradiente (estilo Instrutor) */}
        <View style={styles.statsContainer}>
          <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
            <LinearGradient colors={ADMIN_COLORS.blue} style={styles.statGradient}>
              <SafeMaterialCommunityIcons name="account-group" size={32} color="white" />
              <Text style={styles.statNumberModern}>{dashboardData.totalStudents}</Text>
              <Text style={styles.statLabelModern}>Total de Alunos</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
            <LinearGradient colors={ADMIN_COLORS.green} style={styles.statGradient}>
              <SafeMaterialCommunityIcons name="account-check" size={32} color="white" />
              <Text style={styles.statNumberModern}>{dashboardData.activeStudents}</Text>
              <Text style={styles.statLabelModern}>Alunos Ativos</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
            <LinearGradient colors={ADMIN_COLORS.orange} style={styles.statGradient}>
              <SafeMaterialCommunityIcons name="school-outline" size={32} color="white" />
              <Text style={styles.statNumberModern}>{dashboardData.totalClasses}</Text>
              <Text style={styles.statLabelModern}>Turmas</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={[styles.statCard, { opacity: animations.fadeAnim }]}>
            <LinearGradient colors={ADMIN_COLORS.purple} style={styles.statGradient}>
              <SafeMaterialCommunityIcons name="cash-multiple" size={32} color="white" />
              <Text style={styles.statNumberModern}>{dashboardData.pendingPayments}</Text>
              <Text style={styles.statLabelModern}>Pendências</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Financeiro */}
        <AnimatedCard delay={200} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <SafeIonicons name="cash-outline" size={24} color="#4CAF50" />
              <Title style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                Financeiro do Mês
              </Title>
            </View>
            
            <View style={styles.financialInfo}>
              <Animated.View 
                style={[
                  styles.revenueItem,
                  {
                    opacity: animations.fadeAnim,
                    transform: [{ translateY: animations.slideAnim }],
                  }
                ]}
              >
                <Text style={[styles.revenueLabel, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                  Receita do Mês
                </Text>
                <Text style={[styles.revenueValue, { fontSize: ResponsiveUtils.fontSize.extraLarge }]}>
                  {formatCurrency(dashboardData.monthlyRevenue)}
                </Text>
              </Animated.View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.paymentsRow}>
                <View style={styles.paymentItem}>
                  <Text style={[styles.paymentNumber, { fontSize: ResponsiveUtils.fontSize.large }]}>
                    {dashboardData.pendingPayments}
                  </Text>
                  <Text style={[styles.paymentLabel, { fontSize: ResponsiveUtils.fontSize.small }]}>
                    Pendentes
                  </Text>
                </View>
                
                <View style={styles.paymentItem}>
                  <Text style={[
                    styles.paymentNumber, 
                    { 
                      color: '#F44336',
                      fontSize: ResponsiveUtils.fontSize.large 
                    }
                  ]}>
                    {dashboardData.overduePayments}
                  </Text>
                  <Text style={[styles.paymentLabel, { fontSize: ResponsiveUtils.fontSize.small }]}>
                    Atrasados
                  </Text>
                </View>
              </View>
            </View>
            
            <AnimatedButton 
              mode="outlined" 
              onPress={handleNavigateToManagement}
              style={styles.viewReportsButton}
              icon="chart-line"
            >
              Acessar Gestão e Relatórios
            </AnimatedButton>
          </Card.Content>
        </AnimatedCard>

        {/* Ações Rápidas modernas com gradiente (responsivo 2/3 por linha) */}
        <AnimatedCard delay={300} style={styles.modernCard}>
          <Card.Content>
            <View style={styles.modernCardHeader}>
              <View style={styles.headerIconContainer}>
                <SafeMaterialCommunityIcons name="lightning-bolt" size={24} color={ADMIN_COLORS.accentWarning} />
              </View>
              <View>
                <Title style={styles.modernCardTitle}>Ações Rápidas</Title>
                <Text style={styles.modernCardSubtitle}>Acesso direto às principais funcionalidades</Text>
              </View>
            </View>

            <View style={styles.modernQuickActions}>
              {[
                { key: 'students', title: 'Alunos', subtitle: 'Gerenciar alunos', icon: ADMIN_ICONS.quickActions.students, colors: ADMIN_COLORS.blue, onPress: handleNavigateToStudents },
                { key: 'classes', title: 'Turmas', subtitle: 'Gerenciar turmas', icon: ADMIN_ICONS.quickActions.classes, colors: ADMIN_COLORS.green, onPress: handleNavigateToClasses },
                { key: 'settings', title: 'Configurações', subtitle: 'Preferências e gestão', icon: ADMIN_ICONS.quickActions.settings, colors: ADMIN_COLORS.orange, onPress: handleNavigateToManagement },
                { key: 'modalities', title: 'Modalidades', subtitle: 'Configurar modalidades', icon: ADMIN_ICONS.quickActions.modalities, colors: ADMIN_COLORS.purple, onPress: handleNavigateToManagement },
              ].map((action, idx) => (
                <Animated.View key={action.key} style={[styles.actionCard, { opacity: animations.fadeAnim, width: ResponsiveUtils.isTablet() ? '31%' : '48%' }]}>
                  <LinearGradient colors={action.colors} style={styles.actionGradient}>
                    <SafeMaterialCommunityIcons name={action.icon} size={28} color="white" />
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                    <AnimatedButton
                      mode="contained"
                      onPress={action.onPress}
                      style={styles.modernActionButton}
                      buttonColor="rgba(255,255,255,0.2)"
                      textColor="white"
                      compact
                    >
                      Abrir
                    </AnimatedButton>
                  </LinearGradient>
                </Animated.View>
              ))}
            </View>
          </Card.Content>
        </AnimatedCard>

        {/* Atividades Recentes */}
        <AnimatedCard delay={400} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <SafeIonicons name="time-outline" size={24} color="#666" />
              <Title style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                Atividades Recentes
              </Title>
            </View>
            
            {dashboardData.recentActivities.map((activity, index) => (
              <Animated.View
                key={index}
                style={{
                  opacity: animations.fadeAnim,
                  transform: [{
                    translateX: animations.slideAnim.interpolate({
                      inputRange: [-50, 0],
                      outputRange: [-30, 0],
                    })
                  }]
                }}
              >
                <List.Item
                  title={activity.message}
                  description={activity.time}
                  titleStyle={{ fontSize: ResponsiveUtils.fontSize.medium }}
                  descriptionStyle={{ fontSize: ResponsiveUtils.fontSize.small }}
                  left={() => (
                    <List.Icon 
                      icon={getActivityIcon(activity.type)} 
                      color={getActivityColor(activity.type)}
                    />
                  )}
                />
              </Animated.View>
            ))}
            
            <AnimatedButton 
              mode="text" 
              onPress={() => {/* Implementar histórico completo */}}
              style={styles.viewAllButton}
            >
              Ver Todas as Atividades
            </AnimatedButton>
          </Card.Content>
        </AnimatedCard>

        {/* Alertas e Notificações */}
        {(dashboardData.overduePayments > 0 || dashboardData.pendingPayments > 5) && (
          <AnimatedCard delay={500} style={[styles.card, styles.alertCard]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <SafeIonicons name="warning-outline" size={24} color="#FF9800" />
                <Title style={[styles.cardTitle, { fontSize: ResponsiveUtils.fontSize.medium }]}>
                  Alertas
                </Title>
              </View>
              
              {dashboardData.overduePayments > 0 && (
                <Paragraph style={[styles.alertText, { fontSize: ResponsiveUtils.fontSize.small }]}>
                  • {dashboardData.overduePayments} pagamento(s) em atraso
                </Paragraph>
              )}
              
              {dashboardData.pendingPayments > 5 && (
                <Paragraph style={[styles.alertText, { fontSize: ResponsiveUtils.fontSize.small }]}>
                  • Muitos pagamentos pendentes ({dashboardData.pendingPayments})
                </Paragraph>
              )}
            </Card.Content>
          </AnimatedCard>
        )}
      </Animated.ScrollView>
      </SafeAreaView>
    </EnhancedErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  modernCard: {
    margin: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.md,
    borderRadius: ResponsiveUtils.borderRadius.large,
    ...ResponsiveUtils.elevation,
  },
  modernCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.md,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ResponsiveUtils.spacing.md,
  },
  modernCardTitle: {
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  modernCardSubtitle: {
    fontSize: ResponsiveUtils.fontSize.small,
    color: '#666',
  },
  // Header moderno
  headerContainer: {
    margin: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.lg,
    borderRadius: ResponsiveUtils.borderRadius.large,
    overflow: 'hidden',
    ...ResponsiveUtils.elevation,
  },
  headerGradient: {
    padding: ResponsiveUtils.spacing.lg,
  },
  headerContentModern: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarModern: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTextModern: {
    marginLeft: ResponsiveUtils.spacing.md,
    flex: 1,
  },
  welcomeTextModern: {
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  roleTextModern: {
    fontSize: ResponsiveUtils.fontSize.medium,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  headerCard: {
    margin: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.sm,
    ...ResponsiveUtils.elevation,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ResponsiveUtils.spacing.md,
  },
  avatar: {
    backgroundColor: '#FF9800',
  },
  headerText: {
    marginLeft: ResponsiveUtils.spacing.md,
    flex: 1,
  },
  welcomeText: {
    fontWeight: 'bold',
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  roleText: {
    color: '#666',
  },
  // Estatísticas modernas (cards com gradiente)
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: ResponsiveUtils.spacing.md,
    marginBottom: ResponsiveUtils.spacing.md,
  },
  statCard: {
    width: '48%',
    marginBottom: ResponsiveUtils.spacing.md,
    borderRadius: ResponsiveUtils.borderRadius.medium,
    overflow: 'hidden',
    ...ResponsiveUtils.elevation,
  },
  statGradient: {
    padding: ResponsiveUtils.spacing.md,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  statNumberModern: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  statLabelModern: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    margin: ResponsiveUtils.spacing.md,
    marginTop: ResponsiveUtils.spacing.sm,
    ...ResponsiveUtils.elevation,
  },
  alertCard: {
    backgroundColor: '#FFF3E0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.md,
  },
  cardTitle: {
    marginLeft: ResponsiveUtils.spacing.sm,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: ResponsiveUtils.isTablet() ? '23%' : '48%',
    alignItems: 'center',
    padding: ResponsiveUtils.spacing.md,
    borderRadius: ResponsiveUtils.borderRadius.medium,
    ...ResponsiveUtils.elevation,
    backgroundColor: '#fff',
    marginBottom: ResponsiveUtils.spacing.sm,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    color: '#666',
    marginTop: ResponsiveUtils.spacing.xs,
    textAlign: 'center',
  },
  financialInfo: {
    marginBottom: ResponsiveUtils.spacing.md,
  },
  revenueItem: {
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.md,
    padding: ResponsiveUtils.spacing.md,
    backgroundColor: '#E8F5E8',
    borderRadius: ResponsiveUtils.borderRadius.medium,
  },
  revenueLabel: {
    color: '#666',
  },
  revenueValue: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: ResponsiveUtils.spacing.xs,
  },
  paymentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: ResponsiveUtils.spacing.md,
  },
  paymentItem: {
    alignItems: 'center',
    padding: ResponsiveUtils.spacing.sm,
    backgroundColor: '#f9f9f9',
    borderRadius: ResponsiveUtils.borderRadius.small,
    flex: 1,
    marginHorizontal: ResponsiveUtils.spacing.xs,
  },
  paymentNumber: {
    fontWeight: 'bold',
    color: '#FF9800',
  },
  paymentLabel: {
    color: '#666',
    marginTop: ResponsiveUtils.spacing.xs,
  },
  divider: {
    marginVertical: ResponsiveUtils.spacing.sm,
  },
  viewReportsButton: {
    marginTop: ResponsiveUtils.spacing.sm,
  },
  // Quick actions modernas
  modernQuickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    marginBottom: ResponsiveUtils.spacing.sm,
    borderRadius: ResponsiveUtils.borderRadius.medium,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: ResponsiveUtils.spacing.md,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'space-between',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  modernActionButton: {
    borderRadius: 20,
  },
  
  viewAllButton: {
    marginTop: ResponsiveUtils.spacing.sm,
  },
  alertText: {
    color: '#FF9800',
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  // Skeletons
  skeletonBlock: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  skeletonHeader: {
    height: 90,
    margin: ResponsiveUtils.spacing.md,
  },
  skeletonStat: {
    height: 120,
    width: '48%',
    marginBottom: ResponsiveUtils.spacing.md,
  },
  skeletonAction: {
    height: 120,
    width: '48%',
    borderRadius: ResponsiveUtils.borderRadius.medium,
  },
  
  // Estilos do código da academia
  academiaCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  academiaCodeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  
  // Modal do QR Code
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  closeModalButton: {
    marginTop: 16,
  },
});

export default AdminDashboard;
