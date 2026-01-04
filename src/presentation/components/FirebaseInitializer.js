import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { auth, db } from '@infrastructure/services/firebase';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';

const FirebaseInitializer = ({ children }) => {
  const { currentTheme } = useThemeToggle();
  
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Aguardar um pouco para garantir que o Firebase esteja pronto
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar se o Firebase foi inicializado corretamente
        if (auth && db) {
          console.log('Firebase inicializado com sucesso');
          setIsFirebaseReady(true);
        } else {
          throw new Error('Firebase não foi inicializado corretamente');
        }
      } catch (err) {
        console.error('Erro ao inicializar Firebase:', err);
        setError(err.message);
      }
    };

    initializeFirebase();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg }}>
        <Text style={{ fontSize: FONT_SIZE.lg, color: COLORS.black, textAlign: 'center', marginBottom: 20 }}>
          Erro ao inicializar o Firebase
        </Text>
        <Text style={{ fontSize: FONT_SIZE.base, color: COLORS.gray[500], textAlign: 'center' }}>
          {error}
        </Text>
        <Text style={{ fontSize: FONT_SIZE.sm, color: COLORS.gray[500], textAlign: 'center', marginTop: 20 }}>
          Verifique sua conexão com a internet e tente novamente
        </Text>
      </View>
    );
  }

  if (!isFirebaseReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.info[500]} />
        <Text style={{ marginTop: 20, fontSize: FONT_SIZE.md, color: COLORS.gray[500] }}>
          Inicializando...
        </Text>
      </View>
    );
  }

  return children;
};

export default FirebaseInitializer; 