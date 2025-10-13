import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@contexts/AuthProvider';
import { getUserClaims } from '@utils/customClaimsHelper';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

/**
 * Hook para acessar Custom Claims de forma consistente
 * Substitui o uso de userProfile?.userType por claims do token
 * Funciona com ou sem AuthProvider (valores padrão seguros)
 */
export const useCustomClaims = () => {
  // Usa useContext diretamente para evitar erro quando não está dentro do AuthProvider
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;
  
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClaims = async () => {
      if (!user) {
        setClaims(null);
        setLoading(false);
        return;
      }

      try {
        const userClaims = await getUserClaims();
        setClaims(userClaims);
      } catch (error) {
        console.error('❌ useCustomClaims: Erro ao carregar claims:', error);
        setClaims(null);
      } finally {
        setLoading(false);
      }
    };

    loadClaims();
  }, [user]);

  // Funções de conveniência
  const isAdmin = () => claims?.role === 'admin';
  const isInstructor = () => claims?.role === 'instructor';
  const isStudent = () => claims?.role === 'student';
  const isAdminOrInstructor = () => ['admin', 'instructor'].includes(claims?.role);
  
  const getAcademiaId = () => claims?.academiaId;
  const hasValidClaims = () => !!(claims?.role && claims?.academiaId);
  
  // Função para obter cor do tema baseada no role
  const getUserTypeColor = () => {
    switch (claims?.role) {
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
    switch (claims?.role) {
      case 'admin':
        return 'Administrador';
      case 'instructor':
        return 'Instrutor';
      case 'student':
        return getString('student');
      default:
        return 'Usuário';
    }
  };

  return {
    claims,
    loading,
    
    // Funções de verificação
    isAdmin,
    isInstructor,
    isStudent,
    isAdminOrInstructor,
    
    // Dados
    role: claims?.role,
    academiaId: claims?.academiaId,
    getAcademiaId,
    hasValidClaims,
    
    // Utilitários de UI
    getUserTypeColor,
    getUserTypeText,
    
    // Raw claims para casos especiais
    rawClaims: claims?.customClaims
  };
};

/**
 * Hook simplificado para verificar permissões
 */
export const usePermissions = () => {
  const { isAdmin, isInstructor, isStudent, isAdminOrInstructor } = useCustomClaims();
  
  return {
    canManageStudents: isAdminOrInstructor(),
    canManageClasses: isAdminOrInstructor(),
    canManagePayments: isAdmin(),
    canViewReports: isAdminOrInstructor(),
    canCreateAcademy: isAdmin(),
    canManageSettings: isAdmin(),
    canViewAllData: isAdmin(),
    canViewOwnData: isStudent(),
    canCreateCheckIn: isAdminOrInstructor() || isStudent(),
    canManageGraduations: isAdminOrInstructor(),
    canViewLogs: isAdmin()
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
