import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
  Dimensions,
  Animated,
  ActivityIndicator
} from 'react-native';
import {
  Button,
  Avatar,
  Chip,
  Divider,
  Text,
  List,
  IconButton,
  Badge
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import SafeCardContent from '@components/SafeCardContent';
import AnimatedButton from '@components/AnimatedButton';
import ModernCard from '@components/modern/ModernCard';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';

import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT, BORDER_WIDTH } from '@presentation/theme/designTokens';
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

const AnimatedModernCard = ({ children, delay = 0, variant = 'card', style = {} }: any) => {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [delay, slideAnim, opacityAnim]);

  return (
    <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim as any }] }}>
      <ModernCard variant={variant as any} style={[styles.card, style]}>
        {children}
      </ModernCard>
    </Animated.View>
  );
};

const StudentProfileScreen: React.FC<StudentProfileScreenProps> = ({ route, navigation }) => {
  const { getString, isDarkMode } = useTheme();
  const { studentId } = route.params;
  const { userProfile, academia } = useAuthFacade();

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
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) return;

      let details = studentInfo;
      if (!details) {
        details = await academyFirestoreService.getById('students', studentId, academiaId) as StudentData;
        setStudentInfo(details);
      }

      const allClasses = await academyFirestoreService.getAll('classes', academiaId) as ClassData[];
      const userClasses = allClasses.filter(cls => details?.classIds?.includes(cls.id));
      setStudentClasses(userClasses);

      // Payments
      try {
        const userPayments = await academyFirestoreService.getWhere('payments', 'studentId', '==', studentId, academiaId) as PaymentData[];
        setPayments(userPayments.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      } catch (e) { setPayments([]); }

      // Graduations
      try {
        const userGraduations = await academyFirestoreService.getWhere('graduations', 'studentId', '==', studentId, academiaId) as GraduationData[];
        setGraduations(userGraduations.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0)));
      } catch (e) { setGraduations([]); }

    } catch (error) {
      console.error('Error loading student details:', error);
      Alert.alert(getString('error'), getString('dataLoadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStudentDetails();
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return COLORS.success[500];
      case 'pending': return COLORS.warning[500];
      case 'overdue': return COLORS.error[500];
      default: return COLORS.gray[500];
    }
  };

  const formatDate = (date: any) => {
    if (!date) return getString('notInformed');
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const calculateAge = (birthDate: any) => {
    if (!birthDate) return null;
    const birth = birthDate.toDate ? birthDate.toDate() : new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  };

  if (loading && !studentInfo) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
        <Text style={{ marginTop: 10, color: COLORS.gray[400] }}>{getString('loadingStudentProfile')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <EnhancedErrorBoundary errorContext={{ screen: 'StudentProfile', studentId }}>
      <LinearGradient colors={getAuthGradient(isDarkMode) as any} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary[500]} />}
          >
            {/* Profile Header */}
            <AnimatedModernCard delay={0} variant="premium">
              <View style={styles.headerRow}>
                <Avatar.Text
                  size={80}
                  label={studentInfo?.name?.charAt(0) || 'U'}
                  style={styles.avatar}
                />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.studentName}>{studentInfo?.name}</Text>
                  <Text style={styles.studentEmail}>{studentInfo?.email}</Text>
                  <View style={styles.badgeRow}>
                    <Chip style={styles.ageChip}>{calculateAge(studentInfo?.birthDate)} {getString('years')}</Chip>
                    {studentInfo?.currentGraduation && (
                      <Chip icon="trophy" style={styles.beltChip}>{studentInfo.currentGraduation}</Chip>
                    )}
                  </View>
                </View>
              </View>
            </AnimatedModernCard>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <AnimatedModernCard delay={100} style={styles.statCard}>
                <Text style={styles.statValue}>{studentClasses.length}</Text>
                <Text style={styles.statLabel}>{getString('classes')}</Text>
              </AnimatedModernCard>
              <AnimatedModernCard delay={150} style={styles.statCard}>
                <Text style={styles.statValue}>{graduations.length}</Text>
                <Text style={styles.statLabel}>{getString('graduations')}</Text>
              </AnimatedModernCard>
              <AnimatedModernCard delay={200} style={styles.statCard}>
                <Text style={styles.statValue}>{payments.filter(p => p.status === 'paid').length}</Text>
                <Text style={styles.statLabel}>{getString('paid')}</Text>
              </AnimatedModernCard>
            </View>

            {/* Personal Info */}
            <AnimatedModernCard delay={250}>
              <View>
                <Text style={styles.sectionTitle}>{getString('personalInformation')}</Text>
                <List.Item
                  title={getString('phone')}
                  description={studentInfo?.phone || getString('notInformed')}
                  left={p => <List.Icon {...p} icon="phone" color={COLORS.info[500]} />}
                />
                <Divider style={styles.divider} />
                <List.Item
                  title={getString('address')}
                  description={studentInfo?.address || getString('notInformed')}
                  left={p => <List.Icon {...p} icon="map-marker" color={COLORS.error[500]} />}
                />
                <Divider style={styles.divider} />
                <List.Item
                  title={getString('birthDate')}
                  description={formatDate(studentInfo?.birthDate)}
                  left={p => <List.Icon {...p} icon="calendar-heart" color={COLORS.primary[500]} />}
                />
              </View>
            </AnimatedModernCard>

            {/* Classes */}
            <AnimatedModernCard delay={300}>
              <View>
                <Text style={styles.sectionTitle}>{getString('enrolledClasses')}</Text>
                {studentClasses.length > 0 ? (
                  studentClasses.map(cls => (
                    <List.Item
                      key={cls.id}
                      title={cls.name}
                      description={cls.modality}
                      left={p => <List.Icon {...p} icon="school" color={COLORS.primary[500]} />}
                      right={p => <IconButton icon="chevron-right" onPress={() => navigation.navigate('ClassDetails', { classId: cls.id })} />}
                    />
                  ))
                ) : (
                  <Text style={styles.emptyText}>{getString('noClassesEnrolled')}</Text>
                )}
              </View>
            </AnimatedModernCard>

            {/* Graduation Timeline */}
            <AnimatedModernCard delay={350}>
              <View>
                <Text style={styles.sectionTitle}>{getString('graduationTimeline')}</Text>
                {graduations.length > 0 ? (
                  graduations.map(grad => (
                    <List.Item
                      key={grad.id}
                      title={grad.graduation}
                      description={`${grad.modality} • ${formatDate(grad.date)}`}
                      left={p => <List.Icon {...p} icon="trophy-variant" color={COLORS.warning[500]} />}
                    />
                  ))
                ) : (
                  <Text style={styles.emptyText}>{getString('noGraduationsRegistered')}</Text>
                )}
                <AnimatedButton
                  mode="outlined"
                  onPress={() => navigation.navigate('AddGraduation', { studentId, studentName: studentInfo?.name })}
                  style={styles.addGradBtn}
                >
                  {getString('newGraduation')}
                </AnimatedButton>
              </View>
            </AnimatedModernCard>

            {/* Financial Summary */}
            <AnimatedModernCard delay={400}>
              <View>
                <Text style={styles.sectionTitle}>{getString('financialSummary')}</Text>
                <View style={styles.financialIndicators}>
                  <View style={styles.finBox}>
                    <Text style={styles.finAmount}>{formatCurrency(payments.reduce((sum, p) => p.status === 'paid' ? sum + p.amount : sum, 0))}</Text>
                    <Text style={styles.finLabel}>{getString('totalPaid')}</Text>
                  </View>
                  <View style={styles.finBox}>
                    <Text style={styles.finAmount}>{formatCurrency(payments.reduce((sum, p) => p.status === 'pending' ? sum + p.amount : sum, 0))}</Text>
                    <Text style={styles.finLabel}>{getString('pending')}</Text>
                  </View>
                </View>
                <Divider style={styles.divider} />
                <Text style={styles.subTitle}>{getString('recentPayments')}</Text>
                {payments.slice(0, 3).map(p => (
                  <List.Item
                    key={p.id}
                    title={formatCurrency(p.amount)}
                    description={formatDate(p.createdAt)}
                    right={() => (
                      <Badge style={{ backgroundColor: getPaymentStatusColor(p.status), color: COLORS.white }}>
                        {getString(p.status)}
                      </Badge>
                    )}
                  />
                ))}
                <AnimatedButton
                  mode="text"
                  onPress={() => navigation.navigate('StudentPayments', { studentId })}
                >
                  {getString('viewAllPayments')}
                </AnimatedButton>
              </View>
            </AnimatedModernCard>

            {/* Actions */}
            <View style={styles.footerActions}>
              <AnimatedButton
                mode="contained"
                onPress={() => navigation.navigate('EditStudent', { studentId, studentData: studentInfo })}
                style={{ flex: 1 }}
              >
                {getString('editProfile')}
              </AnimatedButton>
            </View>

          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </EnhancedErrorBoundary>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background.default },
  scrollView: { flex: 1 },
  scrollContent: { padding: SPACING.base, paddingBottom: 150, flexGrow: 1 },
  card: { marginBottom: SPACING.md, borderRadius: BORDER_RADIUS.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { backgroundColor: COLORS.primary[500] },
  headerTextContainer: { marginLeft: SPACING.lg, flex: 1 },
  studentName: { fontSize: FONT_SIZE.xl, fontWeight: 'bold', color: COLORS.white },
  studentEmail: { fontSize: FONT_SIZE.sm, color: COLORS.gray[400], marginBottom: SPACING.sm },
  badgeRow: { flexDirection: 'row', gap: SPACING.xs },
  ageChip: { height: 28, backgroundColor: 'rgba(255,255,255,0.1)' },
  beltChip: { height: 28, backgroundColor: 'rgba(255,193,7,0.1)' },
  statsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, marginBottom: 0 },
  statValue: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.white },
  statLabel: { fontSize: 10, color: COLORS.gray[500], textTransform: 'uppercase' },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: 'bold', color: COLORS.primary[500], marginBottom: SPACING.md, textTransform: 'uppercase' },
  subTitle: { fontSize: FONT_SIZE.sm, fontWeight: 'bold', color: COLORS.gray[400], marginVertical: SPACING.sm },
  divider: { marginVertical: SPACING.sm, backgroundColor: 'rgba(255,255,255,0.05)' },
  emptyText: { textAlign: 'center', color: COLORS.gray[600], padding: SPACING.lg },
  addGradBtn: { marginTop: SPACING.md },
  financialIndicators: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: SPACING.sm },
  finBox: { alignItems: 'center' },
  finAmount: { fontSize: FONT_SIZE.md, fontWeight: 'bold', color: COLORS.white },
  finLabel: { fontSize: 10, color: COLORS.gray[500] },
  footerActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
});

export default StudentProfileScreen;
