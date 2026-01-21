import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Card,
  Text,
  Button,
  List,
  Chip,
  Surface,
  Modal,
  Portal,
  Searchbar,
  Checkbox,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthFacade } from "@presentation/auth/AuthFacade";
import {
  academyFirestoreService,
  academyClassService,
} from "@infrastructure/services/academyFirestoreService";
import cacheService, {
  CACHE_KEYS,
  CACHE_TTL,
} from "@infrastructure/services/cacheService";
import { useScreenTracking, useUserActionTracking } from "@hooks/useAnalytics";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  FONT_WEIGHT,
} from "@presentation/theme/designTokens";
import { useTheme } from "@contexts/ThemeContext";
import { useProfileTheme } from "../../../contexts/ProfileThemeContext";

const CheckIn = ({ navigation }) => {
  const { getString } = useTheme();
  const { theme: profileTheme } = useProfileTheme();
  const { user, userProfile } = useAuthFacade();
  const [classes, setClasses] = useState([]);
  const [activeCheckIns, setActiveCheckIns] = useState([]);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [manualCheckInVisible, setManualCheckInVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);

  // Batch check-in states
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [studentsWithCheckIn, setStudentsWithCheckIn] = useState(new Set());

  // Analytics tracking
  useScreenTracking(getString("checkIn"), {
    academiaId: userProfile?.academiaId,
    userType: "instructor",
    instructorId: user?.uid,
  });
  const { trackButtonClick, trackFeatureUsage } = useUserActionTracking();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      if (!userProfile?.academiaId || !user?.uid) {
        return;
      }

      const cacheKey = CACHE_KEYS.CHECKIN_DATA(userProfile.academiaId, user.id);

      const checkInData = await cacheService.getOrSet(
        cacheKey,
        async () => {
          console.log("🔍 Buscando dados de check-in (cache miss):", user.id);

          // Usar Promise.all para carregar dados em paralelo
          const [
            instructorClasses,
            activeSessions,
            recentSessions,
            allStudents,
          ] = await Promise.all([
            academyClassService.getClassesByInstructor(
              user.id,
              userProfile.academiaId,
              user.email,
            ),
            academyFirestoreService.getWhere(
              "checkInSessions",
              "instructorId",
              "==",
              user.id,
              userProfile.academiaId,
            ),
            academyFirestoreService.getWhere(
              "checkIns",
              "instructorId",
              "==",
              user.id,
              userProfile.academiaId,
            ),
            academyFirestoreService.getAll("students", userProfile.academiaId),
          ]);

          // Filtrar sessões ativas (abertas nas últimas 24h)
          const now = new Date();
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

          const activeCheckIns = activeSessions.filter((session) => {
            const sessionDate = session.createdAt?.toDate
              ? session.createdAt.toDate()
              : new Date(session.createdAt);
            return sessionDate > yesterday && session.status === "active";
          });

          // Filtrar check-ins recentes (hoje)
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const recentCheckIns = recentSessions
            .filter((checkIn) => {
              const checkInDate = checkIn.timestamp?.toDate
                ? checkIn.timestamp.toDate()
                : new Date(checkIn.timestamp);
              return checkInDate >= today;
            })
            .sort((a, b) => {
              const dateA = a.timestamp?.toDate
                ? a.timestamp.toDate()
                : new Date(a.timestamp);
              const dateB = b.timestamp?.toDate
                ? b.timestamp.toDate()
                : new Date(b.timestamp);
              return dateB - dateA;
            });

          console.log(
            `✅ Dados carregados: ${instructorClasses.length} turmas, ${activeCheckIns.length} check-ins ativos, ${recentCheckIns.length} check-ins recentes`,
          );

          return {
            classes: instructorClasses,
            activeCheckIns,
            recentCheckIns,
            students: allStudents,
          };
        },
        CACHE_TTL.SHORT, // Cache por 2 minutos (dados dinâmicos)
      );

      setClasses(checkInData.classes);
      setActiveCheckIns(checkInData.activeCheckIns);
      setRecentCheckIns(checkInData.recentCheckIns);
      setStudents(checkInData.students);

      // Track analytics
      trackFeatureUsage("checkin_data_loaded", {
        academiaId: userProfile.academiaId,
        instructorId: user.id,
        classesCount: checkInData.classes.length,
        activeCheckInsCount: checkInData.activeCheckIns.length,
      });
    } catch (error) {
      console.error("❌ CheckIn: Erro ao carregar dados:", error);
      Alert.alert(getString("error"), getString("dataLoadError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.id, userProfile?.academiaId, user.email, trackFeatureUsage]);

  // Auto-refresh quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Invalidar cache
    if (userProfile?.academiaId) {
      cacheService.invalidatePattern(
        `checkin_data:${userProfile.academiaId}:${user.id}`,
      );
    }
    loadData();
  }, [loadData, userProfile?.academiaId, user.id]);

  const loadActiveCheckIns = useCallback(async () => {
    try {
      // Buscar sessões de check-in ativas
      const activeSessions = await academyFirestoreService.getWhere(
        "checkInSessions",
        "instructorId",
        "==",
        user.id,
        userProfile.academiaId,
      );

      const activeSessionsWithDetails = activeSessions.map((session) => {
        const classInfo = classes.find((c) => c.id === session.classId);
        return {
          ...session,
          className: classInfo?.name || getString("classNotFound"),
          classSchedule: classInfo?.scheduleText || "",
          maxStudents: classInfo?.maxStudents || 0,
        };
      });

      setActiveCheckIns(activeSessionsWithDetails);
      console.log(
        "✅ Check-ins ativos carregados:",
        activeSessionsWithDetails.length,
      );
    } catch (error) {
      console.error("❌ CheckIn: Erro ao carregar check-ins ativos:", error);
      setActiveCheckIns([]);
    }
  }, [user.id, userProfile?.academiaId]);

  const loadRecentCheckIns = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let allCheckIns = [];

      // Para cada turma do instrutor, buscar check-ins na subcoleção
      for (const classItem of classes) {
        try {
          const classCheckIns =
            await academyFirestoreService.getSubcollectionDocuments(
              "classes",
              classItem.id,
              "checkIns",
              userProfile.academiaId,
              [{ field: "date", operator: ">=", value: today }],
              { field: "createdAt", direction: "desc" },
              10,
            );

          // Adicionar informações da turma aos check-ins
          const enrichedCheckIns = classCheckIns.map((checkIn) => ({
            ...checkIn,
            className: classItem.name,
            classId: classItem.id,
          }));

          allCheckIns = [...allCheckIns, ...enrichedCheckIns];
        } catch (error) {
          console.error(
            `❌ Erro ao carregar check-ins da turma ${classItem.id}:`,
            error,
          );
        }
      }

      // Ordenar por data de criação e limitar a 10
      allCheckIns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentCheckIns(allCheckIns.slice(0, 10));
      console.log("📋 Check-ins recentes carregados:", allCheckIns.length);
    } catch (error) {
      console.error("❌ Erro ao carregar check-ins recentes:", error);
      setRecentCheckIns([]);
    }
  };

  const loadStudents = async () => {
    try {
      console.log("📚 Carregando alunos da academia:", userProfile.academiaId);

      // Buscar alunos na subcoleção da academia
      const allStudents = await academyFirestoreService.getAll(
        "students",
        userProfile.academiaId,
      );
      console.log("👥 Alunos encontrados:", allStudents.length);

      setStudents(allStudents);
      setFilteredStudents(allStudents);
    } catch (error) {
      console.error("❌ Erro ao carregar alunos:", error);
      setStudents([]);
      setFilteredStudents([]);
    }
  };

  const handleStartCheckIn = async (classId) => {
    try {
      console.log("🚀 Iniciando check-in para aula:", classId);

      const classInfo = classes.find((c) => c.id === classId);
      if (!classInfo) {
        Alert.alert(getString("error"), getString("classNotFound"));
        return;
      }

      // Verificar se já existe uma sessão ativa para esta turma
      const existingSession = activeCheckIns.find(
        (session) => session.classId === classId,
      );
      if (existingSession) {
        Alert.alert(
          getString("warning"),
          "Já existe uma sessão de check-in ativa para esta turma",
        );
        return;
      }

      // Criar nova sessão de check-in
      const sessionData = {
        classId,
        className: classInfo.name,
        instructorId: user.id,
        instructorName: userProfile?.name || user.email,
        academiaId: userProfile.academiaId,
        startTime: new Date(),
        status: "active",
        checkInCount: 0,
        createdAt: new Date(),
      };

      const sessionId = await academyFirestoreService.create(
        "checkInSessions",
        sessionData,
        userProfile.academiaId,
      );
      console.log("✅ Sessão de check-in criada:", sessionId);

      // Recarregar dados
      await loadActiveCheckIns();

      Alert.alert(
        getString("success"),
        `Check-in iniciado para ${classInfo.name}`,
      );
    } catch (error) {
      console.error("❌ Erro ao iniciar check-in:", error);
      Alert.alert(
        getString("error"),
        "Não foi possível iniciar o check-in. Tente novamente.",
      );
    }
  };

  const handleStopCheckIn = async (sessionId) => {
    try {
      console.log("⏹️ Parando check-in para sessão:", sessionId);

      Alert.alert(
        getString("confirm"),
        "Deseja realmente parar esta sessão de check-in?",
        [
          { text: getString("cancel"), style: "cancel" },
          {
            text: "Parar",
            style: "destructive",
            onPress: async () => {
              try {
                // Atualizar status da sessão
                await academyFirestoreService.update(
                  "checkInSessions",
                  sessionId,
                  {
                    status: "completed",
                    endTime: new Date(),
                    updatedAt: new Date(),
                  },
                  userProfile.academiaId,
                );

                // Limpar seleção e recarregar dados
                setSelectedStudents(new Set());
                await loadRecentCheckIns();
                await loadTodayCheckIns();

                Alert.alert(getString("success"), getString("checkInStopped"));
              } catch (error) {
                console.error("❌ Erro ao parar check-in:", error);
                Alert.alert(
                  getString("error"),
                  "Não foi possível parar o check-in",
                );
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error("❌ Erro ao parar check-in:", error);
    }
  };

  const handleManualCheckIn = async (studentId, studentName) => {
    try {
      // Debug: verificar token do usuário
      const token = await user.getIdTokenResult();
      console.log("🔍 Debug - Token claims:", token.claims);
      console.log("🔍 Debug - User role:", token.claims.role);
      console.log("🔍 Debug - Academia ID:", token.claims.academiaId);
      console.log("🔍 Debug - User profile:", userProfile);

      if (!selectedClass) {
        Alert.alert(getString("error"), getString("selectClassFirst"));
        return;
      }

      // Usar academiaId do token (que é usado pelas regras do Firestore)
      const tokenAcademiaId = token.claims.academiaId;

      const checkInData = {
        studentId,
        studentName,
        classId: selectedClass.id,
        className: selectedClass.name,
        instructorId: user.id,
        instructorName: userProfile?.name || user.email,
        academiaId: tokenAcademiaId,
        type: "manual",
        date: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
        timestamp: new Date(),
        createdAt: new Date(),
      };

      console.log("🔍 Debug - Usando academiaId do token:", tokenAcademiaId);
      console.log("🔍 Debug - CheckIn data:", checkInData);

      // Usar subcoleção de check-ins dentro da turma selecionada
      await academyFirestoreService.addSubcollectionDocument(
        "classes",
        selectedClass.id,
        "checkIns",
        checkInData,
        tokenAcademiaId,
      );

      Alert.alert(
        getString("success"),
        `Check-in realizado para ${studentName}!`,
      );

      // Recarregar dados
      await loadRecentCheckIns();
      await loadTodayCheckIns();
    } catch (error) {
      console.error("❌ Erro no check-in manual:", error);
      Alert.alert(getString("error"), "Não foi possível realizar o check-in");
    }
  };

  const filterStudents = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) =>
          student.name?.toLowerCase().includes(query.toLowerCase()) ||
          student.email?.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredStudents(filtered);
    }
  };

  const loadTodayCheckIns = useCallback(async () => {
    if (!selectedClass || !userProfile?.academiaId) return;

    try {
      const today = new Date().toISOString().split("T")[0];

      const todayCheckIns =
        await academyFirestoreService.getSubcollectionDocuments(
          "classes",
          selectedClass.id,
          "checkIns",
          userProfile.academiaId,
          [{ field: "date", operator: "==", value: today }],
        );

      const checkedInStudentIds = new Set(
        todayCheckIns.map((checkIn) => checkIn.studentId),
      );

      setStudentsWithCheckIn(checkedInStudentIds);
    } catch (error) {
      console.error("❌ Erro ao carregar check-ins de hoje:", error);
    }
  }, [selectedClass, userProfile?.academiaId]);

  // Carregar check-ins quando a turma for selecionada
  useEffect(() => {
    if (selectedClass && manualCheckInVisible) {
      loadTodayCheckIns();
    }
  }, [selectedClass, manualCheckInVisible, loadTodayCheckIns]);

  const clearSelection = () => {
    setSelectedStudents(new Set());
  };

  const selectAllStudents = () => {
    // Selecionar apenas alunos que ainda não fizeram check-in
    const availableStudents = filteredStudents.filter(
      (student) => !studentsWithCheckIn.has(student.id),
    );
    const allStudentIds = new Set(
      availableStudents.map((student) => student.id),
    );
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
    console.log("🔍 Debug - handleBatchCheckIn iniciado");
    console.log("🔍 Debug - Alunos selecionados:", selectedStudents.size);
    console.log("🔍 Debug - Turma selecionada:", selectedClass?.name);

    if (selectedStudents.size === 0) {
      Alert.alert(
        getString("attention"),
        "Selecione pelo menos um aluno para fazer check-in",
      );
      return;
    }

    if (!selectedClass) {
      Alert.alert(getString("error"), getString("selectClassFirst"));
      return;
    }

    setBatchProcessing(true);

    try {
      const token = await user.getIdTokenResult();
      const tokenAcademiaId = token.claims.academiaId;

      console.log("🔍 Debug - Academia ID:", tokenAcademiaId);
      console.log("🔍 Debug - User ID:", user.id);

      const checkInPromises = Array.from(selectedStudents).map(
        async (studentId) => {
          const student = students.find((s) => s.id === studentId);

          console.log("✅ Criando check-in para:", student?.name);

          const checkInData = {
            studentId,
            studentName: student?.name || getString("nameNotInformed"),
            classId: selectedClass.id,
            className: selectedClass.name,
            instructorId: user.id,
            instructorName: userProfile?.name || user.email,
            academiaId: tokenAcademiaId,
            type: "manual",
            date: new Date().toISOString().split("T")[0],
            timestamp: new Date(),
            createdAt: new Date(),
          };

          console.log("📝 Dados do check-in:", checkInData);

          return academyFirestoreService.addSubcollectionDocument(
            "classes",
            selectedClass.id,
            "checkIns",
            checkInData,
            tokenAcademiaId,
          );
        },
      );

      console.log(
        "⏳ Aguardando conclusão de",
        checkInPromises.length,
        "check-ins...",
      );
      await Promise.all(checkInPromises);
      console.log("✅ Todos os check-ins concluídos!");

      Alert.alert(
        getString("successCheck"),
        `Check-in realizado para ${selectedStudents.size} aluno(s)!`,
      );

      // Limpar seleção e recarregar dados
      setSelectedStudents(new Set());
      await loadRecentCheckIns();
      await loadTodayCheckIns();
    } catch (error) {
      console.error("❌ Erro no check-in em lote:", error);
      Alert.alert(
        getString("error"),
        "Falha ao realizar check-in em lote. Tente novamente.",
      );
    } finally {
      setBatchProcessing(false);
    }
  };

  return (
    <LinearGradient colors={profileTheme.gradients.hero} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={profileTheme.primary[500]}
              colors={[profileTheme.primary[500]]}
            />
          }
        >
          {/* Minhas Turmas - Para iniciar check-in */}
          <Card style={[styles.card, { backgroundColor: profileTheme.background.paper }]}>
            <Card.Content>
              <View style={styles.header}>
                <MaterialCommunityIcons
                  name="school"
                  size={32}
                  color={profileTheme.primary[500]}
                />
                <Text style={[styles.title, { color: profileTheme.text.primary }]}>{getString("myClasses")}</Text>
              </View>

              {classes.length > 0 ? (
                classes.map((classItem) => (
                  <Surface key={classItem.id} style={[styles.checkInItem, { backgroundColor: profileTheme.background.default }]}>
                    <View style={styles.checkInHeader}>
                      <Text style={[styles.aulaName, { color: profileTheme.text.primary }]}>
                        {String(classItem.name || getString("unnamedClass"))}
                      </Text>
                      <Chip
                        mode="flat"
                        style={[
                          styles.statusChip,
                          { backgroundColor: profileTheme.info || COLORS.info[500] },
                        ]}
                        textStyle={{ color: COLORS.white }}
                      >
                        {typeof classItem.modality === "object" &&
                          classItem.modality
                          ? classItem.modality.name || "modality"
                          : classItem.modality || getString("modality")}
                      </Chip>
                    </View>

                    <View style={styles.checkInDetails}>
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons
                          name="clock"
                          size={16}
                          color={profileTheme.text.secondary}
                        />
                        <Text style={[styles.detailText, { color: profileTheme.text.secondary }]}>
                          {(() => {
                            if (
                              typeof classItem.schedule === "object" &&
                              classItem.schedule
                            ) {
                              const day = String(
                                classItem.schedule.dayOfWeek || "",
                              );
                              const hour = String(
                                classItem.schedule.hour || "00",
                              ).padStart(2, "0");
                              const minute = String(
                                classItem.schedule.minute || 0,
                              ).padStart(2, "0");
                              return `${day} ${hour}:${minute}`;
                            }
                            return String(
                              classItem.schedule ||
                              getString("scheduleNotDefined"),
                            );
                          })()}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons
                          name="account-group"
                          size={16}
                          color={profileTheme.text.secondary}
                        />
                        <Text style={[styles.detailText, { color: profileTheme.text.secondary }]}>
                          {String(classItem.currentStudents || 0)}/
                          {String(classItem.maxStudents || 0)} alunos
                        </Text>
                      </View>
                    </View>

                    <View style={styles.actionButtons}>
                      <Button
                        mode="contained"
                        onPress={() => handleStartCheckIn(classItem.id)}
                        buttonColor={profileTheme.primary[500]}
                        compact
                      >
                        {getString("startCheckIn")}
                      </Button>
                    </View>
                  </Surface>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="school-outline"
                    size={48}
                    color={profileTheme.text.disabled}
                  />
                  <Text style={[styles.emptyText, { color: profileTheme.text.secondary }]}>
                    {getString("noClassesFound")}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Check-ins Ativos */}
          {activeCheckIns.length > 0 && (
            <Card style={[styles.card, { backgroundColor: profileTheme.background.paper }]}>
              <Card.Content>
                <View style={styles.header}>
                  <MaterialCommunityIcons
                    name="qrcode-scan"
                    size={32}
                    color={profileTheme.info || COLORS.info[500]}
                  />
                  <Text style={[styles.title, { color: profileTheme.text.primary }]}>{getString("activeSessions")}</Text>
                </View>

                {activeCheckIns.map((session) => (
                  <Surface key={session.id} style={[styles.checkInItem, { backgroundColor: profileTheme.background.default }]}>
                    <View style={styles.checkInHeader}>
                      <Text style={[styles.aulaName, { color: profileTheme.text.primary }]}>{session.className}</Text>
                      <Chip
                        mode="flat"
                        style={[
                          styles.statusChip,
                          { backgroundColor: profileTheme.primary[500] },
                        ]}
                        textStyle={{ color: COLORS.white }}
                      >
                        {getString("active")}
                      </Chip>
                    </View>

                    <View style={styles.checkInDetails}>
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons
                          name="clock"
                          size={16}
                          color={profileTheme.text.secondary}
                        />
                        <Text style={[styles.detailText, { color: profileTheme.text.secondary }]}>
                          Iniciado:{" "}
                          {session.startTime?.toDate?.()?.toLocaleTimeString() ||
                            getString("now")}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={16}
                          color={profileTheme.text.secondary}
                        />
                        <Text style={[styles.detailText, { color: profileTheme.text.secondary }]}>
                          {session.checkInCount || 0} check-ins
                        </Text>
                      </View>
                    </View>

                    <View style={styles.actionButtons}>
                      <Button
                        mode="outlined"
                        onPress={() => handleStopCheckIn(session.id)}
                        textColor={COLORS.error[500]}
                        style={{ borderColor: COLORS.error[500] }}
                        compact
                      >
                        {getString("stopCheckIn")}
                      </Button>
                      <Button
                        mode="contained"
                        onPress={() => {
                          const classInfo = classes.find(
                            (c) => c.id === session.classId,
                          );
                          setSelectedClass(classInfo);
                          setManualCheckInVisible(true);
                        }}
                        buttonColor={profileTheme.secondary[500]}
                        compact
                      >
                        {getString("manualCheckInShort")}
                      </Button>
                    </View>
                  </Surface>
                ))}
              </Card.Content>
            </Card>
          )}

          {/* Histórico Recente */}
          <Card style={[styles.card, { backgroundColor: profileTheme.background.paper }]}>
            <Card.Content>
              <View style={styles.header}>
                <MaterialCommunityIcons
                  name="history"
                  size={32}
                  color={profileTheme.secondary[500]}
                />
                <Text style={[styles.title, { color: profileTheme.text.primary }]}>{getString("recentHistory")}</Text>
              </View>

              {recentCheckIns.length > 0 ? (
                recentCheckIns.map((checkIn) => (
                  <View key={checkIn.id} style={[styles.historyItem, { borderBottomColor: profileTheme.text.disabled }]}>
                    <View style={styles.historyInfo}>
                      <Text style={[styles.studentName, { color: profileTheme.text.primary }]}>
                        {checkIn.studentName || getString("unknownStudent")}
                      </Text>
                      <Text style={[styles.className, { color: profileTheme.text.secondary }]}>
                        {checkIn.className || getString("unknownClass")}
                      </Text>
                      <Text style={[styles.checkInTime, { color: profileTheme.text.hint }]}>
                        {checkIn.timestamp?.toDate
                          ? checkIn.timestamp.toDate().toLocaleTimeString()
                          : new Date(checkIn.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                    <Chip mode="outlined" style={{ borderColor: profileTheme.secondary[500] }} textStyle={{ color: profileTheme.secondary[500] }} compact>
                      {checkIn.type === "manual" ? "Manual" : "QR Code"}
                    </Chip>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: profileTheme.text.secondary }]}>
                  {getString("noRecentCheckIns")}
                </Text>
              )}
            </Card.Content>
          </Card>
        </ScrollView>

        <Portal>
          <Modal
            visible={manualCheckInVisible}
            onDismiss={() => setManualCheckInVisible(false)}
            contentContainerStyle={[styles.modalContent, { backgroundColor: profileTheme.background.paper }]}
          >
            <Text style={[styles.modalTitle, { color: profileTheme.text.primary }]}>
              {getString("manualCheckInFor")} {selectedClass?.name}
            </Text>

            <Searchbar
              placeholder={getString("searchStudent")}
              onChangeText={filterStudents}
              value={searchQuery}
              style={[styles.searchbar, { backgroundColor: profileTheme.background.default }]}
              inputStyle={{ color: profileTheme.text.primary }}
              iconColor={profileTheme.text.secondary}
            />

            {/* Batch Selection Controls */}
            {filteredStudents.length > 0 && (
              <View style={[styles.batchControls, { backgroundColor: profileTheme.primary[50], borderColor: profileTheme.primary[100] }]}>
                <View style={styles.batchInfo}>
                  <Text style={[styles.batchText, { color: profileTheme.primary[700] }]}>
                    {selectedStudents.size} alunos selecionados
                  </Text>
                  {selectedStudents.size > 0 && (
                    <Button
                      mode="text"
                      compact
                      onPress={clearSelection}
                      textColor={profileTheme.primary[700]}
                    >
                      Limpar
                    </Button>
                  )}
                </View>
                <Button
                  mode="outlined"
                  compact
                  onPress={selectAllStudents}
                  textColor={profileTheme.primary[500]}
                  style={{ borderColor: profileTheme.primary[500] }}
                >
                  Selecionar Todos
                </Button>
              </View>
            )}

            <ScrollView style={styles.studentList}>
              {filteredStudents.map((student) => {
                const hasCheckIn = studentsWithCheckIn.has(student.id);
                const isSelected = selectedStudents.has(student.id);

                return (
                  <List.Item
                    key={student.id}
                    title={student.name}
                    description={student.email}
                    titleStyle={{ color: profileTheme.text.primary }}
                    descriptionStyle={{ color: profileTheme.text.secondary }}
                    left={(props) => (
                      <View style={{ justifyContent: 'center' }}>
                        {hasCheckIn ? (
                          <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.success[500]} style={{ marginHorizontal: 8 }} />
                        ) : (
                          <Checkbox
                            status={isSelected ? 'checked' : 'unchecked'}
                            onPress={() => toggleStudentSelection(student.id)}
                            color={profileTheme.primary[500]}
                            uncheckedColor={profileTheme.text.disabled}
                          />
                        )}
                      </View>
                    )}
                    right={(props) => (
                      hasCheckIn ? (
                        <Chip compact style={{ backgroundColor: COLORS.success[100] }} textStyle={{ color: COLORS.success[700] }}>Check-in OK</Chip>
                      ) : (
                        <Button
                          compact
                          onPress={() => handleManualCheckIn(student.id, student.name)}
                          textColor={profileTheme.primary[500]}
                        >
                          Check-in
                        </Button>
                      )
                    )}
                    onPress={() => !hasCheckIn && toggleStudentSelection(student.id)}
                    style={[
                      styles.studentItem,
                      hasCheckIn && { opacity: 0.7, backgroundColor: COLORS.success[50] },
                      isSelected && { backgroundColor: profileTheme.primary[50] }
                    ]}
                  />
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                mode="contained"
                onPress={handleBatchCheckIn}
                loading={batchProcessing}
                disabled={batchProcessing || selectedStudents.size === 0}
                style={[styles.batchCheckInButton, { backgroundColor: profileTheme.primary[500] }]}
              >
                Confirmar ({selectedStudents.size})
              </Button>
              <Button
                mode="outlined"
                onPress={() => setManualCheckInVisible(false)}
                textColor={profileTheme.text.secondary}
                style={{ borderColor: profileTheme.text.disabled }}
              >
                {getString("close")}
              </Button>
            </View>
          </Modal>
        </Portal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginLeft: SPACING.sm,
  },
  checkInItem: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  checkInHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  aulaName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    flex: 1,
  },
  statusChip: {
    height: 24,
  },
  checkInDetails: {
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  detailText: {
    fontSize: FONT_SIZE.sm,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: SPACING.sm,
  },
  emptyState: {
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZE.base,
    marginTop: SPACING.md,
    textAlign: "center",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  historyInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  className: {
    fontSize: FONT_SIZE.xs,
  },
  checkInTime: {
    fontSize: FONT_SIZE.xs,
  },
  modalContent: {
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 0,
    borderWidth: 1,
    borderColor: "transparent",
  },
  studentList: {
    maxHeight: 300,
  },
  studentItem: {
    paddingVertical: 0,
  },
  batchControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  batchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batchText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  modalActions: {
    marginTop: SPACING.md,
    gap: SPACING.sm
  },
  batchCheckInButton: {
    marginBottom: SPACING.xs
  }
});

export default CheckIn;
