import React, { createContext, useContext } from 'react';
import useAuthMigrationV2 from '../hooks/useAuthMigrationV2';

// Criar contexto para compartilhar o estado
const AuthContext = createContext();

// Provider migrado para usar Clean Architecture
export const AuthProvider = ({ children }) => {
  // Usar o novo hook V2 que integra Clean Architecture com compatibilidade
  const authState = useAuthMigrationV2();
  
  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook de compatibilidade que usa o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthProvider;
