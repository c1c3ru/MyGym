import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, Dimensions, ScrollView } from 'react-native';
import { ActivityIndicator, Card, FAB, Surface, Avatar, Button, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { useCustomClaims } from '@hooks/useCustomClaims';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import { COLORS, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SPACING } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import type { NavigationProp } from '@react-navigation/native';
import { getString } from "@utils/theme";

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

interface ClassInfo {
  id: string;
  name: string;
  modality: string;
}

const CheckInScreen: React.FC<CheckInScreenProps> = ({ navigation }) => {
  const { theme: colors } = useTheme();

  const { user, userProfile, academia } = useAuthFacade();
  const { getUserTypeColor } = useCustomClaims();
  const [loading, setLoading] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassInfo[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const history = await academyFirestoreService.getCheckInHistory(user.uid);
        setCheckIns(history);

        // Se academiaId for fornecida, buscar aulas
        if (academia?.id) {
          const classes = await academyFirestoreService.getClasses(academia.id);
          setAvailableClasses(classes);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de check-in:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, academia]);

  const handleCheckIn = async (classInfo?: ClassInfo) => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      await academyFirestoreService.createCheckIn({
        studentId: user.uid,
        academyId: academia?.id || '',
        classId: classInfo?.id || '',
        className: classInfo?.name || 'Aula Avulsa',
        date: new Date(),
        status: 'completed'
      });

      Alert.alert(getString('success'), getString('checkInSuccess'));

      // Atualizar histórico
      const history = await academyFirestoreService.getCheckInHistory(user.uid);
      setCheckIns(history);
    } catch (error) {
      console.error('Erro ao realizar check-in:', error);
      Alert.alert(getString('error'), getString('checkInError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {getString('checkIn')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {getString('manageCheckIns')}
          </Text>
        </View>

        <Card style={styles.todayCard}>
          <Card.Content style={styles.todayContent}>
            <Avatar.Icon
              size={48}
              icon="calendar-check"
              style={[styles.todayAvatar, { backgroundColor: COLORS.primary[500] }]}
            />
            <View style={styles.todayInfo}>
              <Text style={[styles.todayTitle, { color: colors.text }]}>
                {getString('today')}
              </Text>
              <Text style={[styles.todaySubtitle, { color: colors.textSecondary }]}>
                {new Date().toLocaleDateString(getString('localeCode') || 'pt-BR')}
              </Text>
            </View>
            <Button
              mode="contained"
              onPress={() => handleCheckIn()}
              loading={loading}
              disabled={loading}
              buttonColor={COLORS.primary[500]}
            >
              Check-In
            </Button>
          </Card.Content>
        </Card>

        {availableClasses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={"time-outline" as any} size={24} color={COLORS.primary[500]} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {getString('availableClasses')}
              </Text>
            </View>
            {availableClasses.map((item) => (
              <Card key={item.id} style={styles.classItem}>
                <View style={styles.classInfo}>
                  <View style={styles.classDetails}>
                    <Text style={[styles.className, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.classModality, { color: colors.textSecondary }]}>{item.modality}</Text>
                  </View>
                  <Button
                    mode="outlined"
                    onPress={() => handleCheckIn(item)}
                    textColor={COLORS.primary[500]}
                    style={{ borderColor: COLORS.primary[500] }}
                  >
                    Check-In
                  </Button>
                </View>
              </Card>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name={"history-outline" as any} size={24} color={COLORS.primary[500]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {getString('history')}
            </Text>
          </View>
          {checkIns.length > 0 ? (
            checkIns.map((item) => (
              <Card key={item.id} style={styles.historyItem}>
                <Card.Content style={styles.historyContent}>
                  <View>
                    <Text style={[styles.historyClass, { color: colors.text }]}>{item.className}</Text>
                    <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
                      {item.date?.toDate ? item.date.toDate().toLocaleString() : new Date(item.date).toLocaleString()}
                    </Text>
                  </View>
                  <Chip style={{ backgroundColor: COLORS.success[100] }} textStyle={{ color: COLORS.success[700] }}>
                    {getString('completed')}
                  </Chip>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {getString('noCheckIns')}
            </Text>
          )}
        </View>
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: COLORS.primary[500] }]}
        icon="plus"
        onPress={() => handleCheckIn()}
        color={COLORS.white}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.xs,
  },
  todayCard: {
    marginBottom: SPACING.xl,
    elevation: 4,
    borderRadius: BORDER_RADIUS.lg,
  },
  todayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  todayAvatar: {
    marginRight: SPACING.md,
  },
  todayInfo: {
    flex: 1,
  },
  todayTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.xs,
  },
  todaySubtitle: {
    fontSize: FONT_SIZE.base,
    marginBottom: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginLeft: SPACING.sm,
  },
  classItem: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    elevation: 2,
  },
  classInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classDetails: {
    flex: 1,
  },
  className: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.xs,
  },
  classModality: {
    fontSize: FONT_SIZE.base,
  },
  historyItem: {
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    elevation: 1,
  },
  historyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyClass: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
  },
  historyDate: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontSize: FONT_SIZE.base,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CheckInScreen;
