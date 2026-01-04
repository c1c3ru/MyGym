import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { COLORS } from '@presentation/theme/designTokens';
import { getString } from '@utils/theme';

/**
 * Hook para acessar Custom Claims de forma consistente
 * Agora utiliza AuthFacade como fonte da verdade
 */
export const useCustomClaims = () => {
  const { customClaims, user, loading: authLoading } = useAuthFacade();

  // Funções de verificação
  const isAdmin = () => customClaims?.role === 'admin';
  const isInstructor = () => customClaims?.role === 'instructor';
  const isStudent = () => customClaims?.role === 'student';
  const isAdminOrInstructor = () => ['admin', 'instructor'].includes(customClaims?.role);

  const getAcademiaId = () => customClaims?.academiaId;
  const hasValidClaims = () => !!(customClaims?.role && customClaims?.academiaId);

  // Função para obter cor do tema baseada no role
  const getUserTypeColor = () => {
    switch (customClaims?.role) {
      case 'admin':
        return '#6A1B9A';  // Purple
      case 'instructor':
        return COLORS.warning[500];  // Orange
      case 'student':
        return COLORS.primary[500];  // Green
      default:
        return COLORS.gray[600];  // Gray
    }
  };

  // Função para obter texto do tipo de usuário
  const getUserTypeText = () => {
    switch (customClaims?.role) {
      case 'admin':
        return getString('administrator');
      case 'instructor':
        return getString('instructor');
      case 'student':
        return getString('student');
      default:
        return getString('user');
    }
  };

  return {
    claims: customClaims, // Mantendo compatibilidade de nome se necessário, mas idealmente usar customClaims
    loading: authLoading, // Reutilizando loading do AuthFacade

    // Funções de verificação
    isAdmin: isAdmin(), // Chamando aqui se o retorno original era booleano direto ou função?
    // O original retornava REFERÊNCIAS para funções: const isAdmin = () => ...
    // O hook original retornava: { isAdmin, ... } onde isAdmin é a função.
    // VOU MANTER COMO FUNÇÃO para compatibilidade estrita.
    isAdminFn: isAdmin,
    isInstructorFn: isInstructor,

    // Retornando as funções como no original
    isAdmin,
    isInstructor,
    isStudent,
    isAdminOrInstructor,

    // Dados
    role: customClaims?.role,
    academiaId: customClaims?.academiaId,
    getAcademiaId,
    hasValidClaims,

    // Utilitários de UI
    getUserTypeColor,
    getUserTypeText,

    // Raw claims
    rawClaims: customClaims
  };
};

/**
 * Hook simplificado para verificar permissões
 */
export const usePermissions = () => {
  const { customClaims } = useAuthFacade();

  const role = customClaims?.role;
  const isStudent = role === 'student';
  const isAdmin = role === 'admin';
  const isInstructor = role === 'instructor';
  const isAdminOrInstructor = isAdmin || isInstructor;

  return {
    canManageStudents: isAdminOrInstructor,
    canManageClasses: isAdminOrInstructor,
    canManagePayments: isAdmin,
    canViewReports: isAdminOrInstructor,
    canCreateAcademy: isAdmin,
    canManageSettings: isAdmin,
    canViewAllData: isAdmin,
    canViewOwnData: isStudent,
    canCreateCheckIn: isAdminOrInstructor || isStudent,
    canManageGraduations: isAdminOrInstructor,
    canViewLogs: isAdmin
  };
};

/**
 * Utilitário para casos onde precisamos de verificação síncrona
 * USE APENAS quando useCustomClaims não pode ser usado (fora de componentes)
 */
export const getClaimsSync = (customClaims) => {
  if (!customClaims) return { role: 'student', academiaId: null };

  return {
    role: customClaims.role || 'student',
    academiaId: customClaims.academiaId || null,
    isAdmin: customClaims.role === 'admin',
    isInstructor: customClaims.role === 'instructor',
    isStudent: customClaims.role === 'student',
    isAdminOrInstructor: ['admin', 'instructor'].includes(customClaims.role)
  };
};
