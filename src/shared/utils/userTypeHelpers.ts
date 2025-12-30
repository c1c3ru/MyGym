/**
 * Utilitários para normalização e mapeamento de tipos de usuário
 */

// Mapa de tipos de usuário (português → inglês)
const USER_TYPE_MAP: Record<string, 'admin' | 'instructor' | 'student'> = {
  'administrador': 'admin',
  'instrutor': 'instructor', 
  'aluno': 'student',
  'admin': 'admin',
  'instructor': 'instructor',
  'student': 'student'
};

/**
 * Converte tipo de usuário para formato canônico (inglês)
 * @param {string} userType - Tipo do usuário (português ou inglês)
 * @returns {string} Tipo normalizado em inglês
 */
export const getCanonicalUserType = (userType?: string): 'admin' | 'instructor' | 'student' => {
  if (!userType) return 'student'; // default
  return (USER_TYPE_MAP[userType] as any) || (userType as any);
};

/**
 * Verifica se o usuário é administrador
 * @param {Object} userProfile - Perfil do usuário
 * @returns {boolean} true se for admin
 */
export const isAdmin = (userProfile?: { userType?: string; tipo?: string } | null): boolean => {
  if (!userProfile) return false;
  
  const userType = userProfile.userType || userProfile.tipo;
  if (!userType) return false;
  
  return getCanonicalUserType(userType) === 'admin';
};

/**
 * Verifica se o usuário é instrutor
 * @param {Object} userProfile - Perfil do usuário
 * @returns {boolean} true se for instructor
 */
export const isInstructor = (userProfile?: { userType?: string; tipo?: string } | null): boolean => {
  if (!userProfile) return false;
  
  const userType = userProfile.userType || userProfile.tipo;
  if (!userType) return false;
  
  return getCanonicalUserType(userType) === 'instructor';
};

/**
 * Verifica se o usuário é aluno
 * @param {Object} userProfile - Perfil do usuário
 * @returns {boolean} true se for student
 */
export const isStudent = (userProfile?: { userType?: string; tipo?: string } | null): boolean => {
  if (!userProfile) return false;
  
  const userType = userProfile.userType || userProfile.tipo;
  if (!userType) return false;
  
  return getCanonicalUserType(userType) === 'student';
};

/**
 * Obtém o tipo de usuário final do perfil (normalizado)
 * @param {Object} userProfile - Perfil do usuário
 * @returns {string} Tipo normalizado ('admin', 'instructor', 'student')
 */
export const getFinalUserType = (userProfile?: { userType?: string; tipo?: string } | null): 'admin' | 'instructor' | 'student' => {
  if (!userProfile) return 'student';
  
  const userType = userProfile.userType || userProfile.tipo || 'student';
  return getCanonicalUserType(userType);
};

/**
 * Migra perfil legado para formato canônico
 * Atualiza userType se estiver ausente mas tipo estiver presente
 * @param {Object} userProfile - Perfil do usuário
 * @returns {Object} Perfil normalizado
 */
export const normalizeUserProfile = (userProfile?: Record<string, any> | null): Record<string, any> | undefined | null => {
  if (!userProfile) return userProfile;
  
  const normalized = { ...userProfile } as Record<string, any>;
  
  // Se tem tipo mas não tem userType, normalizar
  if (normalized.tipo && !normalized.userType) {
    normalized.userType = getCanonicalUserType(normalized.tipo);
  }
  
  // Se profileCompleted não está definido mas tem tipo, marcar como completo
  if (normalized.profileCompleted === undefined && normalized.tipo) {
    normalized.profileCompleted = true;
  }
  
  return normalized;
};