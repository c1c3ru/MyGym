import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Animated } from 'react-native';
import { ActivityIndicator, Avatar, Chip, Text, Button, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@presentation/theme/designTokens';
import EnhancedErrorBoundary from '@components/EnhancedErrorBoundary';

import type { NavigationProp } from '@react-navigation/native';

interface CheckInScreenProps {
  navigation: NavigationProp<any>;
}

interface CheckIn {
  id?: string;
  date: any;
  className?: string;
  type?: string;
  studentId?: string;
}

interface ClassSchedule {
  day: string;
  startTime: string;
  endTime: string;
}

interface ClassInfo {
  id: string;
  name: string;
  modality: string;
  schedule?: ClassSchedule[];
  days?: string[]; // Legacy support or simplified view
  instructorName?: string;
}

const AnimatedCard = ({ children, delay = 0, style, colors }: any) => {
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
    <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim as any }], marginBottom: SPACING.sm }}>
      <Card style={[{ borderRadius: BORDER_RADIUS.md, elevation: 2 }, { backgroundColor: colors.surface }, style]}>
        <Card.Content>
          {children}
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

const formatSchedule = (schedule?: ClassSchedule[], days?: string[], getString?: any) => {
  if (schedule && schedule.length > 0) {
    return schedule.map(s => `${s.day.slice(0, 3)} ${s.startTime}-${s.endTime}`).join(' • ');
  }
  if (days && days.length > 0) {
    return days.join(' • ');
  }
  return getString ? getString('scheduleNotDefined') : 'Horário não definido';
};

const CheckInScreen: React.FC<CheckInScreenProps> = ({ navigation }) => {
  const { getString, theme } = useTheme();
  const colors = theme.colors;
  const { user, academia } = useAuthFacade();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassInfo[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user?.id) {
          const history = await academyFirestoreService.getCheckInHistory(user.id, academia?.id) as CheckIn[];
          setCheckIns(history);
        }

        if (academia?.id) {
          const classes = await academyFirestoreService.getClasses(academia.id) as ClassInfo[];
          setAvailableClasses(classes);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de check-in:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [user, academia]);

  const handleCheckIn = async (classInfo?: ClassInfo) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await academyFirestoreService.create('checkIns', {
        studentId: user.id,
        academiaId: academia?.id || '',
        classId: classInfo?.id || '',
        className: classInfo?.name || getString('singleClass') || 'Aula Avulsa',
        date: new Date(),
        status: 'completed'
      }, academia?.id);

      Alert.alert(getString('success'), getString('checkInSuccess'));

      if (user?.id) {
        const history = await academyFirestoreService.getCheckInHistory(user.id, academia?.id) as CheckIn[];
        setCheckIns(history);
      }
    } catch (error) {
      console.error('Erro ao realizar check-in:', error);
      Alert.alert(getString('error'), getString('checkInError'));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <EnhancedErrorBoundary errorContext={{ screen: 'CheckInScreen' }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <Text style={styles.title}>{getString('checkIn')}</Text>
            <Text style={styles.subtitle}>{getString('manageCheckIns')}</Text>
          </View>

          {/* Card de Hoje / Ação Rápida */}
          <AnimatedCard delay={0} colors={colors}>
            <View style={styles.todayContent}>
              <View style={styles.todayHeader}>
                <Avatar.Icon size={48} icon="calendar-check" style={{ backgroundColor: colors.primary }} color={colors.onPrimary} />
                <View style={styles.todayInfo}>
                  <Text style={styles.todayTitle}>{getString('today')}</Text>
                  <Text style={styles.todaySubtitle}>{new Date().toLocaleDateString('pt-BR')}</Text>
                </View>
              </View>

              <Button
                mode="contained"
                onPress={() => handleCheckIn()}
                loading={loading}
                disabled={loading}
                style={styles.checkInButton}
                icon="check"
                buttonColor={colors.primary}
                textColor={colors.onPrimary}
              >
                {getString('manualCheckIn')}
              </Button>
            </View>
          </AnimatedCard>

          {/* Aulas Disponíveis */}
          {availableClasses.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>{getString('availableClasses')}</Text>
              </View>

              {availableClasses.map((item, index) => (
                <AnimatedCard key={item.id} delay={100 + (index * 50)} colors={colors} style={styles.classCard}>
                  <View style={styles.classInfo}>
                    <View style={styles.classDetails}>
                      <Text style={styles.className}>{item.name}</Text>
                      <Text style={styles.classModality}>{item.modality}</Text>

                      <View style={styles.scheduleContainer}>
                        <Ionicons name="calendar-outline" size={14} color={colors.onSurfaceVariant} />
                        <Text style={styles.scheduleText} numberOfLines={1}>
                          {formatSchedule(item.schedule, item.days, getString)}
                        </Text>
                      </View>
                    </View>
                    <Button
                      mode="outlined"
                      onPress={() => handleCheckIn(item)}
                      style={styles.miniButton}
                      labelStyle={styles.miniButtonLabel}
                      compact
                      textColor={colors.primary}
                      theme={{ colors: { outline: colors.primary } }}
                    >
                      Check-In
                    </Button>
                  </View>
                </AnimatedCard>
              ))}
            </View>
          )}

          {/* Histórico */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={20} color={colors.onSurfaceVariant} />
              <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>{getString('history')}</Text>
            </View>

            {checkIns.length > 0 ? (
              checkIns.map((item, index) => (
                <AnimatedCard key={item.id || index} delay={300 + (index * 50)} colors={colors} style={styles.historyCard}>
                  <View style={styles.historyContent}>
                    <View>
                      <Text style={styles.historyClass}>{item.className}</Text>
                      <Text style={styles.historyDate}>
                        {item.date?.toDate ? item.date.toDate().toLocaleString() : new Date(item.date).toLocaleString()}
                      </Text>
                    </View>
                    <Chip
                      style={{ backgroundColor: colors.surfaceVariant }}
                      textStyle={{ color: colors.primary, fontSize: 10, fontWeight: 'bold' }}
                    >
                      {getString('present')}
                    </Chip>
                  </View>
                </AnimatedCard>
              ))
            ) : (
              <Text style={styles.emptyText}>{getString('noCheckIns')}</Text>
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
    </EnhancedErrorBoundary>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
  header: { marginBottom: SPACING.lg },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: 'bold', color: colors.onSurface },
  subtitle: { fontSize: FONT_SIZE.md, color: colors.onSurfaceVariant, marginTop: SPACING.xs },
  card: { borderRadius: BORDER_RADIUS.md, elevation: 2 },
  todayContent: {},
  todayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  todayInfo: { marginLeft: SPACING.md },
  todayTitle: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: colors.onSurface },
  todaySubtitle: { fontSize: FONT_SIZE.md, color: colors.onSurfaceVariant },
  checkInButton: { width: '100%' },

  section: { marginTop: SPACING.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, gap: SPACING.xs },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: 'bold', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 },

  classCard: {},
  classInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  classDetails: { flex: 1, paddingRight: SPACING.sm },
  className: { fontSize: FONT_SIZE.md, fontWeight: 'bold', color: colors.onSurface },
  classModality: { fontSize: FONT_SIZE.sm, color: colors.onSurfaceVariant, marginBottom: 2 },
  scheduleContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  scheduleText: { fontSize: FONT_SIZE.sm, color: colors.onSurfaceVariant },

  miniButton: { height: 36 },
  miniButtonLabel: { fontSize: 12 },

  historyCard: {},
  historyContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyClass: { fontSize: FONT_SIZE.md, fontWeight: '600', color: colors.onSurface },
  historyDate: { fontSize: FONT_SIZE.sm, color: colors.onSurfaceVariant, marginTop: 2 },

  emptyText: { textAlign: 'center', color: colors.onSurfaceVariant, fontStyle: 'italic', marginTop: SPACING.md },
});

export default CheckInScreen;
