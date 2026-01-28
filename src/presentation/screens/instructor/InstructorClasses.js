import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  FlatList,
  Platform,
} from "react-native";
import {
  Card,
  Button,
  Chip,
  Text,
  FAB,
  Searchbar,
  Portal,
  Modal,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthFacade } from "@presentation/auth/AuthFacade";
import {
  academyFirestoreService,
  academyStudentService,
} from "@infrastructure/services/academyFirestoreService";
import AddClassForm from "@screens/admin/AddClassScreen";
import EnhancedErrorBoundary from "@components/EnhancedErrorBoundary";
import cacheService, {
  CACHE_KEYS,
  CACHE_TTL,
} from "@infrastructure/services/cacheService";
import { useScreenTracking, useUserActionTracking } from "@hooks/useAnalytics";
import InstructorClassesSkeleton from "@components/skeletons/InstructorClassesSkeleton";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
} from "@presentation/theme/designTokens";
import { getDayNames } from "@shared/utils/dateHelpers";
import { useTheme } from "@contexts/ThemeContext";
import { useProfileTheme } from "../../../contexts/ProfileThemeContext";

const InstructorClasses = ({ navigation }) => {
  const { getString, isDark } = useTheme();
  const { theme: profileTheme } = useProfileTheme();
  const { user, userProfile } = useAuthFacade();
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentCounts, setStudentCounts] = useState({});
  const [showAddClassModal, setShowAddClassModal] = useState(false);

  // Analytics tracking
  useScreenTracking("InstructorClasses", {
    academiaId: userProfile?.academiaId,
    userType: "instructor",
    instructorId: user?.uid,
  });
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

  // 1. Definir loadStudentCounts primeiro (usado por loadClasses)
  const loadStudentCounts = useCallback(
    async (classes) => {
      try {
        const academiaId = userProfile?.academiaId || user?.academiaId;
        if (!academiaId) return;

        // Usar cache para contagens de alunos (global da academia)
        const cacheKey = `class_student_counts:${academiaId}`;

        const counts = await cacheService.getOrSet(
          cacheKey,
          async () => {
            console.log("🔍 Buscando contagens de alunos (cache miss)");
            const countsData = {};

            // Usar Promise.all para carregar contagens em paralelo
            const countPromises = classes.map(async (classItem) => {
              try {
                const students = await academyStudentService.getStudentsByClass(
                  classItem.id,
                  academiaId,
                );
                return {
                  classId: classItem.id,
                  count: Array.isArray(students) ? students.length : 0,
                };
              } catch (error) {
                console.warn(
                  `⚠️ Erro ao carregar alunos da turma ${classItem.id}:`,
                  error,
                );
                return { classId: classItem.id, count: 0 };
              }
            });

            const results = await Promise.all(countPromises);
            results.forEach(({ classId, count }) => {
              countsData[classId] = count;
            });

            return countsData;
          },
          CACHE_TTL.SHORT, // Cache por 2 minutos (dados dinâmicos)
        );

        setStudentCounts(counts);
      } catch (error) {
        console.error("❌ Erro ao carregar contagens de alunos:", error);
      }
    },
    [userProfile?.academiaId, user?.academiaId],
  );

  // 2. Definir loadClasses (usa loadStudentCounts)
  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      console.log("📚 [INSTRUTOR] Carregando TODAS as turmas da academia");

      // Tentar obter academiaId de múltiplas fontes
      const academiaId = userProfile?.academiaId || user?.academiaId;
      console.log("🏢 Academia ID:", academiaId);

      if (!academiaId) {
        console.warn("⚠️ AcademiaId não disponível em userProfile nem em user");

        // Se não tem academiaId, mostrar estado vazio
        setClasses([]);
        setLoading(false);
        return;
      }

      console.log("✅ AcademiaId encontrado:", academiaId);

      // Usar cache de todas as turmas da academia
      const cacheKey = CACHE_KEYS.CLASSES(academiaId);
      console.log("🔑 Cache key:", cacheKey);

      const classesData = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log("🔍 [CACHE MISS] Buscando TODAS as turmas da academia:", academiaId);
          const allClasses = await academyFirestoreService.getAll('classes', academiaId);
          console.log("📊 Turmas retornadas do Firestore:", allClasses?.length || 0);

          if (allClasses && allClasses.length > 0) {
            console.log("📋 Lista de turmas encontradas:");
            allClasses.forEach((c, idx) => {
              console.log(`  ${idx + 1}. ${c.name} (ID: ${c.id}) - Instrutor: ${c.instructorId || 'N/A'}`);
            });
          } else {
            console.warn("⚠️ Nenhuma turma retornada do Firestore para academia:", academiaId);
          }

          return allClasses;
        },
        CACHE_TTL.MEDIUM, // Cache por 5 minutos
      );

      const validClasses = Array.isArray(classesData) ? classesData : [];
      console.log("✅ Total de turmas válidas:", validClasses.length);

      setClasses(validClasses);

      // Carregar contagem de alunos para cada turma
      await loadStudentCounts(validClasses);

      // Track analytics apenas se tiver user.id
      if (user?.id) {
        trackFeatureUsage("instructor_classes_loaded", {
          academiaId: academiaId,
          instructorId: user.id,
          classesCount: validClasses.length,
        });
      }
    } catch (error) {
      console.error("❌ Erro ao carregar turmas:", error);
      console.error("❌ Stack trace:", error.stack);
      setClasses([]);
      Alert.alert(getString("error"), "Não foi possível carregar as turmas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, user?.academiaId, userProfile?.academiaId, trackFeatureUsage, getString, loadStudentCounts]);

  // 3. Definir filterClasses
  const filterClasses = useCallback(() => {
    if (!searchQuery) {
      setFilteredClasses(classes);
      return;
    }

    const filtered = classes.filter(
      (classItem) =>
        classItem.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
        classItem.modality?.toLowerCase()?.includes(searchQuery.toLowerCase()),
    );
    setFilteredClasses(filtered);

    // Track search analytics
    if (searchQuery) {
      trackFeatureUsage("instructor_classes_search", {
        query: searchQuery,
        resultsCount: filtered.length,
      });
    }
  }, [searchQuery, classes, trackFeatureUsage]);

  // 4. Efeitos
  // Log inicial para debug
  useEffect(() => {
    console.log("🔍 [MOUNT] InstructorClasses montado");
    console.log("👤 User disponível:", !!user?.uid, "UID:", user?.uid);
    console.log("📋 UserProfile disponível:", !!userProfile);
    console.log("🏢 AcademiaId disponível:", userProfile?.academiaId);
  }, [user?.uid, userProfile]);

  // Carregar turmas quando userProfile.academiaId ou user.academiaId estiver disponível
  useEffect(() => {
    const academiaId = userProfile?.academiaId || user?.academiaId;

    // Removida dependência estrita de user.uid se já temos academiaId
    if (academiaId) {
      console.log("✅ [EFFECT] AcademiaId encontrado, carregando turmas...");
      console.log("   AcademiaId:", academiaId, "de", userProfile?.academiaId ? "userProfile" : "user");
      loadClasses();
    } else {
      console.log("⏳ [EFFECT] Aguardando AcademiaId:", {
        userProfileAcademiaId: userProfile?.academiaId,
        userAcademiaId: user?.academiaId
      });
    }
  }, [userProfile?.academiaId, user?.academiaId, loadClasses]);

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log("⏰ Timeout de carregamento - forçando fim do loading");
        setLoading(false);
      }
    }, 10000); // 10 segundos

    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    filterClasses();
  }, [searchQuery, classes, filterClasses]);

  const onRefresh = useCallback(() => {
    console.log("🔄 [REFRESH] Forçando atualização das turmas");
    setRefreshing(true);

    // Invalidar todos os caches relacionados
    if (userProfile?.academiaId) {
      const cacheKey = CACHE_KEYS.CLASSES(userProfile.academiaId);
      console.log("🗑️ Invalidando cache:", cacheKey);

      // Usar remove para a chave específica
      cacheService.remove(cacheKey);

      // Invalidar também caches de contagem de alunos usando pattern
      cacheService.invalidatePattern(`class_student_counts:${userProfile.academiaId}`);

      // Invalidar caches antigos se existirem
      cacheService.invalidatePattern(`instructor_classes:${userProfile.academiaId}`);
    }

    loadClasses();
  }, [loadClasses, userProfile?.academiaId]);

  const handleClassPress = useCallback(
    (classItem) => {
      trackButtonClick("instructor_class_details", { classId: classItem.id });
      navigation.navigate("ClassDetails", {
        classId: classItem.id,
        classData: classItem,
      });
    },
    [navigation, trackButtonClick],
  );

  const handleCheckIns = useCallback(
    (classItem) => {
      trackButtonClick("instructor_class_checkins", { classId: classItem.id });
      navigation.navigate("CheckIn", {
        classId: classItem.id,
        className: classItem.name,
      });
    },
    [navigation, trackButtonClick],
  );

  const handleAddClass = useCallback(() => {
    trackButtonClick("instructor_add_class");

    // Invalidar cache de turmas
    if (userProfile?.academiaId) {
      cacheService.invalidatePattern(`classes:${userProfile.academiaId}`);
    }

    setShowAddClassModal(true);
  }, [trackButtonClick, userProfile?.academiaId]);

  const formatSchedule = useCallback((classItem) => {
    try {
      const schedule = classItem?.schedule;
      if (Array.isArray(schedule) && schedule.length > 0) {
        const days = getDayNames(getString);
        return schedule
          .map(
            (s) =>
              `${days[s.dayOfWeek]} ${String(s.hour ?? "").padStart(2, "0")}:${String(s.minute ?? 0).padStart(2, "0")}`,
          )
          .join(", ");
      }
      if (typeof schedule === "string" && schedule.trim()) {
        return schedule.trim();
      }
      if (
        typeof classItem?.scheduleText === "string" &&
        classItem.scheduleText.trim()
      ) {
        return classItem.scheduleText.trim();
      }
      return getString("scheduleNotDefined");
    } catch (e) {
      return getString("scheduleNotDefined");
    }
  }, [getString]);

  /* 
   * Renderização do Card de Turma
   * Restaurada com correções de segurança para evitar 'Unexpected text node' 
   */
  const renderClassCard = useCallback(
    (classItem) => {
      const studentCount =
        studentCounts[classItem.id] || classItem.currentStudents || 0;

      const cardStyle = Platform.OS === 'web'
        ? {
          backgroundColor: isDark ? 'rgba(30, 30, 40, 0.7)' : 'rgba(245, 247, 250, 0.65)', // Cinza glass translúcido
          backdropFilter: 'blur(16px)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)',
          borderWidth: 1,
          boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 20px rgba(0, 0, 0, 0.08)', // Sombra mais marcada
        }
        : { backgroundColor: isDark ? profileTheme.background.paper : '#F8F9FA' };

      return (
        <Card key={classItem.id} style={[styles.card, cardStyle]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={[styles.className, { color: profileTheme.text.primary }]}>
                {classItem.name}
              </Text>
              <Chip
                style={[
                  styles.statusChip,
                  {
                    backgroundColor:
                      classItem.status === "active"
                        ? profileTheme.secondary[500]
                        : COLORS.warning[400],
                  },
                ]}
                textStyle={{ color: COLORS.white, fontSize: FONT_SIZE.sm }}
              >
                {classItem.status === "active" ? getString('active') : getString('inactive')}
              </Chip>
            </View>

            {/* Modalidade */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
              <Ionicons
                name="fitness-outline"
                size={16}
                color={profileTheme.text.secondary}
                style={{ marginRight: 4 }}
              />
              <Text variant="bodyMedium" style={{ color: profileTheme.text.secondary }}>
                {classItem.modality}
              </Text>
            </View>

            <View style={styles.classInfo}>
              {/* Horário */}
              <View style={styles.infoItem}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={profileTheme.text.secondary}
                  style={{ marginRight: 4 }}
                />
                <Text style={{ color: profileTheme.text.secondary }}>
                  {formatSchedule(classItem)}
                </Text>
              </View>

              {/* Alunos */}
              <View style={styles.infoItem}>
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={profileTheme.text.secondary}
                  style={{ marginRight: 4 }}
                />
                <Text style={{ color: profileTheme.text.secondary }}>
                  {`${studentCount}/${classItem.maxStudents || 0} ${getString('students')}`}
                </Text>
              </View>

              {/* Preço (Proteção contra 0) */}
              {(!!classItem.price && classItem.price > 0) && (
                <View style={styles.infoItem}>
                  <Ionicons
                    name="card-outline"
                    size={16}
                    color={profileTheme.text.secondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={{ color: profileTheme.text.secondary }}>
                    R$ {classItem.price.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>

            {/* Descrição */}
            {!!classItem.description && (
              <Text style={[styles.description, { color: profileTheme.text.hint }]}>
                {classItem.description}
              </Text>
            )}
          </Card.Content>

          <Card.Actions style={styles.cardActions}>
            <Button
              mode="outlined"
              onPress={() => handleClassPress(classItem)}
              style={[styles.actionButton, { borderColor: profileTheme.primary[500] }]}
              textColor={profileTheme.primary[500]}
            >
              {getString('details')}
            </Button>
            <Button
              mode="contained"
              onPress={() => handleCheckIns(classItem)}
              style={styles.actionButton}
              buttonColor={profileTheme.primary[500]}
            >
              {getString('checkIns')}
            </Button>
          </Card.Actions>
        </Card>
      );
    },
    [studentCounts, formatSchedule, handleClassPress, handleCheckIns, profileTheme, getString],
  );

  if (loading) {
    return (
      <LinearGradient
        colors={isDark ? COLORS.gradients.deepPurple : COLORS.gradients.lightBackground}
        locations={isDark ? [0, 0.4, 0.8, 1] : [0, 0.5, 1]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.container}>
          <InstructorClassesSkeleton />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <EnhancedErrorBoundary
      onError={(error, errorInfo, errorId) => {
        console.error("🚨 Erro no InstructorClasses:", {
          error,
          errorInfo,
          errorId,
        });
      }}
      errorContext={{
        screen: "InstructorClasses",
        academiaId: userProfile?.academiaId,
        instructorId: user?.uid,
      }}
    >
      <LinearGradient
        colors={isDark ? COLORS.gradients.deepPurple : COLORS.gradients.lightBackground}
        locations={isDark ? [0, 0.4, 0.8, 1] : [0, 0.5, 1]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
          {/* Header informativo */}
          <View style={[
            styles.headerInfo,
            Platform.OS === 'web'
              ? {
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.4)',
              }
              : { backgroundColor: profileTheme.background.paper }
          ]}>
            <Ionicons name="information-circle-outline" size={20} color={profileTheme.primary[500]} />
            <Text style={[styles.headerInfoText, { color: profileTheme.text.secondary }]}>
              {getString('viewingAllClasses')}
            </Text>
          </View>

          <Searchbar
            placeholder={getString('search')}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[
              styles.searchbar,
              Platform.OS === 'web'
                ? {
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  boxShadow: 'none',
                }
                : { backgroundColor: profileTheme.background.paper }
            ]}
            iconColor={profileTheme.text.secondary}
            inputStyle={{ color: profileTheme.text.primary }}
          />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={profileTheme.primary[500]}
                colors={[profileTheme.primary[500]]}
              />
            }
          >
            {filteredClasses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="school-outline"
                  size={64}
                  color={profileTheme.text.disabled}
                />
                <Text style={[styles.emptyText, { color: profileTheme.text.secondary }]}>
                  {searchQuery ? getString("noClassesFound") : getString("noClassesFound")}
                </Text>
                {!searchQuery && (
                  <>
                    <Text style={[styles.emptySubtext, { color: profileTheme.text.hint }]}>
                      {getString('classesCreatedByAdmin')}
                    </Text>
                    <Button
                      mode="contained"
                      onPress={onRefresh}
                      style={{ marginTop: SPACING.md }}
                      buttonColor={profileTheme.primary[500]}
                    >
                      {getString('refresh')}
                    </Button>
                  </>
                )}
              </View>
            ) : (
              <FlatList
                data={filteredClasses}
                renderItem={({ item }) => renderClassCard(item)}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: SPACING.md }}
              />
            )}
          </ScrollView>

          <FAB
            style={[styles.fab, { backgroundColor: profileTheme.secondary[500] }]}
            icon="plus"
            label={getString('newClass')}
            onPress={handleAddClass}
            color={COLORS.white}
          />

          {/* Modal de Adicionar Turma */}
          <Portal>
            <Modal
              visible={showAddClassModal}
              onDismiss={() => setShowAddClassModal(false)}
              contentContainerStyle={{
                backgroundColor: profileTheme.background.paper,
                margin: '2%',
                maxHeight: '96%',
                borderRadius: 12,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <AddClassForm
                onClose={() => setShowAddClassModal(false)}
                onSuccess={() => {
                  setShowAddClassModal(false);
                  loadClasses();
                }}
              />
            </Modal>
          </Portal>
        </SafeAreaView>
      </LinearGradient>
    </EnhancedErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  headerInfoText: {
    fontSize: FONT_SIZE.sm,
    flex: 1,
  },
  searchbar: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  className: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    flex: 1,
  },
  statusChip: {
    height: 28,
  },
  modalityText: {
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.md,
  },
  classInfo: {
    marginBottom: SPACING.md,
  },
  infoItem: {
    fontSize: FONT_SIZE.base,
    marginBottom: SPACING.xs,
    flexDirection: "row",
    alignItems: "center",
  },
  description: {
    fontSize: FONT_SIZE.base,
    fontStyle: "italic",
  },
  cardActions: {
    justifyContent: "flex-end",
  },
  actionButton: {
    marginLeft: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    textAlign: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.base,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    margin: SPACING.md,
    right: 0,
    bottom: 0,
  },
});

export default InstructorClasses;
