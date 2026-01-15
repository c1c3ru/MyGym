import React from 'react';
import { getFinalUserType } from '@utils/userTypeHelpers';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { useAuthFacade } from '@presentation/auth/AuthFacade';
// import { useTheme } from '@contexts/ThemeContext'; // Unused?

// Navegadores Modulares
import AuthNavigator from './AuthNavigator';
import StudentStackNavigator from './StudentNavigator';
import InstructorNavigator from './InstructorNavigator';
import AdminNavigator from './AdminNavigator';
import SharedNavigator from './SharedNavigator';

// Telas Especiais
import LoadingScreen from '@screens/shared/LoadingScreen';
import UserTypeSelectionScreen from '@screens/auth/UserTypeSelectionScreen';
// import AcademiaSelectionScreen from '@screens/auth/AcademiaSelectionScreen'; // Unused in renderContent logic shown?
import AcademyOnboardingScreen from '@screens/onboarding/AcademyOnboardingScreen';
import { RootStackParamList, UserType } from '@types';

const Stack = createStackNavigator<RootStackParamList>();

// Navegação Principal (simplificada e modular)
interface MainNavigatorProps {
  userType: string;
}

const MainNavigator = ({ userType }: MainNavigatorProps) => {
  let TabNavigator: any;
  switch (userType) {
    case 'student':
      TabNavigator = StudentStackNavigator;
      break;
    case 'instructor':
      TabNavigator = InstructorNavigator;
      break;
    case 'admin':
      TabNavigator = AdminNavigator;
      break;
    default:
      TabNavigator = StudentStackNavigator;
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{ headerShown: false }}
        initialParams={{ userType: userType as UserType }}
      />
      {/* SharedNavigator usage might need adjustment if it's not a screen component but a navigator */}
      <Stack.Screen
        name="SharedScreens" // This name doesn't exist in RootStackParamList? "SharedScreens"?
        component={SharedNavigator as any} // Temporary cast if SharedScreens is strange
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Navegador Principal da Aplicação
const AppNavigator = () => {
  const { user, userProfile, academia, customClaims, loading, hasValidClaims } = useAuthFacade();

  // Memoizar o estado para evitar re-renderizações desnecessárias
  const navigationState = React.useMemo(() => ({
    loading,
    hasUser: !!user,
    hasUserProfile: !!userProfile,
    hasAcademia: !!academia,
    hasCustomClaims: !!customClaims,
    userEmail: user?.email,
    userType: userProfile?.userType,
    finalUserType: customClaims?.role || userProfile?.userType || 'student',
    academiaId: userProfile?.academiaId || customClaims?.academiaId,
    claimsRole: customClaims?.role,
    hasValidClaims: hasValidClaims || !!(customClaims?.role && customClaims?.academiaId)
  }), [loading, user, userProfile, academia, customClaims, hasValidClaims]);

  console.log('🧭 AppNavigator: Estado atual:', navigationState);

  if (loading) {
    console.log('🧭 AppNavigator: Mostrando LoadingScreen');
    return <LoadingScreen />;
  }

  // Função para renderizar o conteúdo correto baseado no estado de autenticação
  const renderContent = () => {
    // 1. Usuário não logado
    if (!user) {
      console.log('🧭 AppNavigator: Renderizando AuthNavigator');
      return <AuthNavigator />;
    }

    // 2. Usuário logado mas sem perfil (ex: login social novo ou perfil deletado)
    if (!userProfile) {
      console.log('🧭 AppNavigator: Usuário sem perfil. Direcionando para criação...');
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} />
        </Stack.Navigator>
      );
    }

    // 3. Usuário com perfil incompleto
    const needsProfileCompletion = userProfile.profileCompleted === false &&
      (!customClaims?.role || !userProfile.userType);

    if (!hasValidClaims && needsProfileCompletion) {
      console.log('🧭 AppNavigator: Perfil incompleto. Direcionando para seleção de tipo...');
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* @ts-ignore - UserTypeSelection might not be in RootStackParamList? */}
          <Stack.Screen name="UserTypeSelection" component={UserTypeSelectionScreen} />
        </Stack.Navigator>
      );
    }

    // 4. Usuário sem academia associada
    const hasAcademiaAssociation = userProfile.academiaId || customClaims?.academiaId;
    if (!hasAcademiaAssociation) {
      console.log('🧭 AppNavigator: Sem academia associada. Direcionando para onboarding...');
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* @ts-ignore */}
          <Stack.Screen name="AcademyOnboarding" component={AcademyOnboardingScreen} />
        </Stack.Navigator>
      );
    }

    // 5. Carregando dados da academia
    const academiaId = userProfile.academiaId || customClaims?.academiaId;
    if (!academia && academiaId) {
      console.log('🧭 AppNavigator: Carregando dados da academia...', academiaId);
      return <LoadingScreen />;
    }

    // 6. App Principal
    const userType = getFinalUserType(userProfile);
    console.log('🧭 AppNavigator: Renderizando MainNavigator para:', userType);
    return <MainNavigator userType={userType} />;
  };

  return (
    <NavigationContainer>
      {renderContent()}
    </NavigationContainer>
  );
};

export default AppNavigator;