import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@contexts/AuthProvider';
import { useNotification } from '@components/NotificationManager';
import graduationBoardService from '@infrastructure/services/graduationBoardService';
import graduationCalculationService from '@infrastructure/services/graduationCalculationService';
import graduationNotificationService from '@infrastructure/services/graduationNotificationService';
import { getString } from '@utils/theme';

/**
 * Hook para gerenciar funcionalidades de graduação
 */
export const useGraduation = () => {
  const { user, userProfile, academia } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();

  const [graduationBoard, setGraduationBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Carrega o painel de graduações
   */
  const loadGraduationBoard = useCallback(async (forceRefresh = false) => {
    if (!academia?.id) return null;

    try {
      setLoading(true);
      const board = await graduationBoardService.getGraduationBoard(academia.id, forceRefresh);
      setGraduationBoard(board);
      return board;
    } catch (error) {
      console.error('Erro ao carregar painel de graduações:', error);
      showError('Erro ao carregar dados de graduação');
      return null;
    } finally {
      setLoading(false);
    }
  }, [academia?.id, showError]);

  /**
   * Atualiza o painel de graduações
   */
  const refreshGraduationBoard = useCallback(async () => {
    setRefreshing(true);
    const result = await loadGraduationBoard(true);
    setRefreshing(false);
    return result;
  }, [loadGraduationBoard]);

  /**
   * Calcula alerta de graduação para um estudante específico
   */
  const calculateStudentAlert = useCallback(async (studentData, attendanceData = []) => {
    try {
      const alert = graduationCalculationService.calculateGraduationAlert(studentData, attendanceData);
      return alert;
    } catch (error) {
      console.error('Erro ao calcular alerta de graduação:', error);
      return null;
    }
  }, []);

  /**
   * Agenda um exame de graduação
   */
  const scheduleExam = useCallback(async (examData) => {
    if (!academia?.id) {
      showError(getString('academyNotIdentified'));
      return false;
    }

    try {
      const examId = await graduationBoardService.scheduleGraduationExam({
        ...examData,
        academiaId: academia.id,
        createdBy: user?.id
      });

      showSuccess('Exame de graduação agendado com sucesso!');
      
      // Atualizar painel
      await loadGraduationBoard(true);
      
      return examId;
    } catch (error) {
      console.error('Erro ao agendar exame:', error);
      showError('Erro ao agendar exame de graduação');
      return false;
    }
  }, [academia?.id, user?.id, showSuccess, showError, loadGraduationBoard]);

  /**
   * Processa resultados de um exame
   */
  const processExamResults = useCallback(async (examId, results) => {
    if (!academia?.id) {
      showError(getString('academyNotIdentified'));
      return false;
    }

    try {
      await graduationBoardService.processExamResults(examId, results, academia.id);
      showSuccess('Resultados do exame processados com sucesso!');
      
      // Atualizar painel
      await loadGraduationBoard(true);
      
      return true;
    } catch (error) {
      console.error('Erro ao processar resultados:', error);
      showError('Erro ao processar resultados do exame');
      return false;
    }
  }, [academia?.id, showSuccess, showError, loadGraduationBoard]);

  /**
   * Executa verificação automática de graduações
   */
  const runAutomaticCheck = useCallback(async () => {
    if (!academia?.id) return false;

    try {
      await graduationBoardService.runAutomaticGraduationCheck(academia.id);
      showSuccess('Verificação automática executada');
      
      // Atualizar painel
      await loadGraduationBoard(true);
      
      return true;
    } catch (error) {
      console.error('Erro na verificação automática:', error);
      showError('Erro na verificação automática');
      return false;
    }
  }, [academia?.id, showSuccess, showError, loadGraduationBoard]);

  /**
   * Obtém notificações de graduação
   */
  const getNotifications = useCallback(async (limit = 20) => {
    if (!user?.id || !academia?.id) return [];

    try {
      const notifications = await graduationNotificationService.getGraduationNotifications(
        user.id,
        academia.id,
        limit
      );
      return notifications;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  }, [user?.id, academia?.id]);

  /**
   * Marca notificação como lida
   */
  const markNotificationAsRead = useCallback(async (notificationId) => {
    if (!academia?.id) return false;

    try {
      await graduationNotificationService.markNotificationAsRead(notificationId, academia.id);
      return true;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  }, [academia?.id]);

  /**
   * Adiciona regras customizadas para uma modalidade
   */
  const addModalityRules = useCallback((modality, rules) => {
    try {
      graduationCalculationService.addCustomModalityRules(modality, rules);
      showSuccess(`Regras customizadas adicionadas para ${modality}`);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar regras:', error);
      showError('Erro ao adicionar regras customizadas');
      return false;
    }
  }, [showSuccess, showError]);

  /**
   * Obtém regras de uma modalidade
   */
  const getModalityRules = useCallback((modality) => {
    return graduationCalculationService.getModalityRules(modality);
  }, []);

  /**
   * Lista modalidades disponíveis
   */
  const getAvailableModalities = useCallback(() => {
    return graduationCalculationService.getAvailableModalities();
  }, []);

  /**
   * Verifica se usuário pode gerenciar graduações
   */
  const canManageGraduations = useCallback(() => {
    return userProfile?.userType === 'admin' || userProfile?.userType === 'instructor';
  }, [userProfile?.userType]);

  /**
   * Verifica se usuário pode agendar exames
   */
  const canScheduleExams = useCallback(() => {
    return userProfile?.userType === 'admin' || userProfile?.userType === 'instructor';
  }, [userProfile?.userType]);

  /**
   * Obtém estatísticas resumidas
   */
  const getSummaryStats = useCallback(() => {
    if (!graduationBoard?.summary) return null;

    return {
      totalStudents: graduationBoard.summary.totalStudents,
      eligibleStudents: graduationBoard.summary.totalEligible,
      upcomingExams: graduationBoard.summary.totalUpcomingExams,
      recentGraduations: graduationBoard.summary.totalRecentGraduations,
      eligibilityRate: graduationBoard.summary.totalStudents > 0 
        ? (graduationBoard.summary.totalEligible / graduationBoard.summary.totalStudents * 100).toFixed(1)
        : 0
    };
  }, [graduationBoard?.summary]);

  /**
   * Filtra alertas por modalidade
   */
  const getAlertsByModality = useCallback((modality) => {
    if (!graduationBoard?.allAlerts) return [];
    
    if (modality === 'all') return graduationBoard.allAlerts;
    
    return graduationBoard.allAlerts.filter(alert => alert.modality === modality);
  }, [graduationBoard?.allAlerts]);

  /**
   * Obtém próximos exames
   */
  const getUpcomingExams = useCallback((modality = 'all', limit = 10) => {
    if (!graduationBoard?.upcomingExams) return [];
    
    let exams = graduationBoard.upcomingExams;
    
    if (modality !== 'all') {
      exams = exams.filter(exam => exam.modality === modality);
    }
    
    return exams.slice(0, limit);
  }, [graduationBoard?.upcomingExams]);

  // Carregar dados iniciais
  useEffect(() => {
    if (academia?.id) {
      loadGraduationBoard();
    }
  }, [academia?.id, loadGraduationBoard]);

  return {
    // State
    graduationBoard,
    loading,
    refreshing,

    // Actions
    loadGraduationBoard,
    refreshGraduationBoard,
    calculateStudentAlert,
    scheduleExam,
    processExamResults,
    runAutomaticCheck,

    // Notifications
    getNotifications,
    markNotificationAsRead,

    // Rules
    addModalityRules,
    getModalityRules,
    getAvailableModalities,

    // Permissions
    canManageGraduations,
    canScheduleExams,

    // Helpers
    getSummaryStats,
    getAlertsByModality,
    getUpcomingExams
  };
};

export default useGraduation;