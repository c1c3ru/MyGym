import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { getUserClaims } from '../../shared/utils/customClaimsHelper';

/**
 * Hook para acessar Custom Claims de forma consistente
 * Substitui o uso de userProfile?.userType por claims do token
 */
export const useCustomClaims = () => {
  const { user } = useAuth();
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
        return '#FF9800';  // Orange
      case 'student':
        return '#4CAF50';  // Green
      default:
        return '#757575';  // Gray
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
        return 'Aluno';
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
