import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import {
  Card,
  Text,
  Button,
  FAB,
  Surface,
  Avatar,
  Chip,
  ActivityIndicator
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useTheme } from '@contexts/ThemeContext';
import { useCustomClaims } from '@hooks/useCustomClaims';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
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
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassInfo[]>([]);

  const userPrimaryColor = getUserTypeColor();

  const themeColors = {
    ...colors,
    primary: userPrimaryColor || colors.primary,
    background: colors.background,
    success: COLORS.success || '#4CAF50',
    warning: COLORS.warning || '#FFC107',
    secondary: COLORS.secondary || colors.secondary,
  };

  useEffect(() => {
    if (user?.id && academia?.id) {
      loadCheckInData();
    }
    if (userProfile?.academiaId || academia?.id) {
      loadAvailableClasses();
    }
  }, []);

  const loadCheckInData = async () => {
    if (!user?.id || !academia?.id) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Buscar check-in de hoje nas subcoleções das turmas do aluno
      let todayCheckIns: any[] = [];

      // Buscar turmas do aluno primeiro
      const studentClasses = await academyFirestoreService.getWhere(
        'classes',
        'students',
        'array-contains',
        user.id,
        academia.id
      );

      // Para cada turma, buscar check-ins do aluno
      for (const classItem of studentClasses) {
        const classCheckIns = await academyFirestoreService.getSubcollectionDocuments(
          'classes',
          classItem.id,
          'checkIns',
          academia.id,
          [
            { field: 'studentId', operator: '==', value: user.id },
            { field: 'date', operator: '>=', value: today },
            { field: 'date', operator: '<', value: tomorrow }
          ]
        );

        todayCheckIns = [...todayCheckIns, ...classCheckIns];
      }

      if (todayCheckIns.length > 0) {
        setTodayCheckIn(todayCheckIns[0]);
      }

      // Buscar check-ins recentes (últimos 7 dias)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      let recentCheckIns: any[] = [];

      // Para cada turma, buscar check-ins recentes do aluno
      for (const classItem of studentClasses) {
        const classRecentCheckIns = await academyFirestoreService.getSubcollectionDocuments(
          'classes',
          classItem.id,
          'checkIns',
          academia.id,
          [
            { field: 'studentId', operator: '==', value: user.id },
            { field: 'date', operator: '>=', value: weekAgo }
          ],
          { field: 'date', direction: 'desc' }
        );

        recentCheckIns = [...recentCheckIns, ...classRecentCheckIns];
      }

      // Ordenar por data mais recente
      recentCheckIns.sort((a, b) => {
        const dateA = a.date && typeof a.date.toDate === 'function' ? a.date.toDate() : new Date(a.date);
        const dateB = b.date && typeof b.date.toDate === 'function' ? b.date.toDate() : new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });

      setRecentCheckIns(recentCheckIns);
    } catch (error) {
      console.error('Erro ao carregar dados de check-in:', error);
    }
  };

  const loadAvailableClasses = async () => {
    try {
      // Obter ID da academia
      const academiaId = userProfile?.academiaId || academia?.id;
      if (!academiaId) {
        console.error(getString('academyIdNotFound'));
        return;
      }

      // Buscar turmas do aluno na academia
      const allClasses: any[] = await academyFirestoreService.getAll('classes', academiaId);
      const userClasses = allClasses.filter(cls =>
        userProfile?.classIds && userProfile.classIds.includes(cls.id)
      );
      setAvailableClasses(userClasses);
    } catch (error) {
      console.error(getString('loadClassesError'), error);
    }
  };

  const handleCheckIn = async (classId: string | null = null, className: string | null = null) => {
    try {
      setLoading(true);

      if (!user?.id || !academia?.id) {
        throw new Error(getString('error'));
      }

      const checkInData = {
        studentId: user.id,
        studentName: userProfile?.name || user.email,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date(),
        createdAt: new Date()
      };

      // Buscar a turma do aluno para fazer check-in na subcoleção
      const studentClasses = await academyFirestoreService.getWhere(
        'classes',
        'students',
        'array-contains',
        user.id,
        academia.id
      );

      if (studentClasses.length === 0) {
        throw new Error('Nenhuma turma encontrada para este aluno');
      }

      // Usar a turma selecionada ou a primeira encontrada
      const targetClassId = classId || studentClasses[0].id;

      await academyFirestoreService.addSubcollectionDocument(
        'classes',
        targetClassId,
        'checkIns',
        checkInData,
        academia.id
      );

      Alert.alert(
        '✅ Check-in realizado!',
        classId ? `Check-in na aula de ${className} realizado com sucesso!` : 'Check-in geral realizado com sucesso!',
        [{ text: getString('ok'), onPress: () => loadCheckInData() }]
      );

    } catch (error) {
      console.error('Erro ao fazer check-in:', error);
      Alert.alert(getString('error'), 'Não foi possível realizar o check-in. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: any) => {
    if (!date) return '';
    const dateObj = date && typeof date.toDate === 'function' ? date.toDate() : new Date(date);
    return dateObj.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const dateObj = date && typeof date.toDate === 'function' ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('pt-BR');
  };

  const getCheckInIcon = (type: string | undefined): keyof typeof Ionicons.glyphMap => {
    return type === 'class' ? 'school' : 'checkmark-circle';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        {/* Status de Hoje */}
        <Card style={[styles.card, styles.todayCard]}>
          <Card.Content>
            <View style={styles.todayHeader}>
              <Avatar.Icon
                size={60}
                icon={todayCheckIn ? "check-circle" : "clock-outline"}
                style={[
                  styles.todayAvatar,
                  { backgroundColor: todayCheckIn ? themeColors.success : themeColors.warning }
                ]}
              />
              <View style={styles.todayInfo}>
                <Text style={styles.todayTitle}>
                  {todayCheckIn ? '✅ Check-in Realizado' : '⏰ Aguardando Check-in'}
                </Text>
                <Text style={styles.todaySubtitle}>
                  {todayCheckIn
                    ? `Hoje às ${formatTime(todayCheckIn.date)}`
                    : 'Faça seu check-in de hoje'
                  }
                </Text>
                {todayCheckIn?.className && (
                  <Chip
                    mode="outlined"
                    style={styles.classChip}
                    textStyle={{ fontSize: FONT_SIZE.sm }}
                  >
                    {todayCheckIn.className}
                  </Chip>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Turmas Disponíveis */}
        {availableClasses.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Ionicons name="school" size={24} color={themeColors.primary} />
                <Text style={styles.sectionTitle}>Suas Turmas</Text>
              </View>

              {availableClasses.map((classItem) => (
                <Surface key={classItem.id} style={styles.classItem} elevation={1}>
                  <View style={styles.classInfo}>
                    <View style={styles.classDetails}>
                      <Text style={styles.className}>{classItem.name}</Text>
                      <Text style={styles.classModality}>{classItem.modality}</Text>
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => handleCheckIn(classItem.id, classItem.name)}
                      disabled={loading || !!todayCheckIn}
                      style={[styles.checkInButton, { backgroundColor: themeColors.primary }]}
                      compact
                    >
                      Check-in
                    </Button>
                  </View>
                </Surface>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Histórico Recente */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={24} color={themeColors.secondary} />
              <Text style={styles.sectionTitle}>Últimos Check-ins</Text>
            </View>

            {recentCheckIns.length > 0 ? (
              recentCheckIns.slice(0, 5).map((checkIn, index) => (
                <View key={checkIn.id || index} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <Ionicons
                      name={getCheckInIcon(checkIn.type)}
                      size={20}
                      color={themeColors.primary}
                    />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyTitle}>
                      {checkIn.className || 'Check-in Geral'}
                    </Text>
                    <Text style={styles.historyDate}>
                      {formatDate(checkIn.date)} às {formatTime(checkIn.date)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={themeColors.gray ? themeColors.gray[300] : '#ccc'} />
                <Text style={styles.emptyText}>Nenhum check-in registrado</Text>
                <Text style={styles.emptySubtext}>Faça seu primeiro check-in!</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* FAB para Check-in Geral */}
      {!todayCheckIn && (
        <FAB
          style={[styles.fab, { backgroundColor: themeColors.primary }]}
          icon={loading ? () => <ActivityIndicator color={COLORS.white} /> : "plus"}
          label="Check-in Geral"
          onPress={() => handleCheckIn()}
          disabled={loading}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.base,
  },
  card: {
    marginBottom: SPACING.base,
    elevation: 4,
  },
  todayCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary[500],
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayAvatar: {
    marginRight: SPACING.base,
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
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  classChip: {
    alignSelf: 'flex-start',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.base,
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
    color: COLORS.text.secondary,
  },
  checkInButton: {
    borderRadius: BORDER_RADIUS.lg,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.gray[500],
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[300],
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.base,
    right: 0,
    bottom: 0,
  },
});

export default CheckInScreen;

