import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '@contexts/ThemeContext';
import UniversalHeader from '@components/UniversalHeader';
import { SharedStackParamList, UserType } from '@types';

// Telas Compartilhadas
import ProfileScreen from '@screens/shared/ProfileScreen';
import ChangePasswordScreen from '@screens/shared/ChangePasswordScreen';
import PhysicalEvaluationScreen from '@screens/shared/PhysicalEvaluationScreen';
import PhysicalEvaluationHistoryScreen from '@screens/shared/PhysicalEvaluationHistoryScreen';
import InjuryScreen from '@screens/shared/InjuryScreen';
import InjuryHistoryScreen from '@screens/shared/InjuryHistoryScreen';
import PrivacyPolicyScreen from '@screens/shared/PrivacyPolicyScreen';
import NotificationSettingsScreen from '@screens/shared/NotificationSettingsScreen';
import PrivacySettingsScreen from '@screens/shared/PrivacySettingsScreen';
import { COLORS } from '@presentation/theme/designTokens';

const Stack = createStackNavigator<SharedStackParamList>();

const PROFILE_COLORS = {
  admin: { primary: COLORS.primary[600] },
  instructor: { primary: COLORS.secondary[600] },
  student: { primary: COLORS.info[600] }
};

// Configurações de header baseadas no tipo de usuário
const getHeaderColor = (userType: UserType) => {
  switch (userType) {
    case 'admin':
      return PROFILE_COLORS.admin.primary;
    case 'instructor':
      return PROFILE_COLORS.instructor.primary;
    case 'student':
    default:
      return PROFILE_COLORS.student.primary;
  }
};

interface SharedNavigatorProps {
  userType: UserType;
}

// Navegador para telas compartilhadas
const SharedNavigator = ({ userType }: SharedNavigatorProps) => {
  const { getString } = useTheme();
  const headerColor = getHeaderColor(userType);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('myProfile')}
              subtitle={getString('personalInfoAndSettings')}
              navigation={navigation}
              showBack={true}
              backgroundColor={headerColor}
            />
          ),
        })}
      />
      {/* <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('changePassword')}
              subtitle={getString('updateYourPassword')}
              navigation={navigation}
              showBack={true}
              backgroundColor={headerColor}
            />
          ),
        })}
      /> */}
      <Stack.Screen
        name="PhysicalEvaluation"
        component={PhysicalEvaluationScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('physicalEvaluation')}
              subtitle={getString('recordBodyMeasurements')}
              navigation={navigation}
              showBack={true}
              backgroundColor={headerColor}
            />
          ),
        })}
      />
      <Stack.Screen
        name="PhysicalEvaluationHistory"
        component={PhysicalEvaluationHistoryScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('evaluationHistory')}
              subtitle={getString('trackPhysicalEvolution')}
              navigation={navigation}
              showBack={true}
              backgroundColor={headerColor}
            />
          ),
        })}
      />
      <Stack.Screen
        name="Injury"
        component={InjuryScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('manageInjury')}
              subtitle={getString('recordAndTrackInjuries')}
              navigation={navigation}
              showBack={true}
              backgroundColor={headerColor}
            />
          ),
        })}
      />
      <Stack.Screen
        name="InjuryHistory"
        component={InjuryHistoryScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('myInjuries')}
              subtitle={getString('injuryHistoryAndRecovery')}
              navigation={navigation}
              showBack={true}
              backgroundColor={headerColor}
            />
          ),
        })}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('privacyPolicy')}
              subtitle={getString('dataProtectionAndLGPD')}
              navigation={navigation}
              showBack={true}
              backgroundColor={headerColor}
            />
          ),
        })}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('notificationSettings')}
              subtitle={getString('manageYourNotifications')}
              navigation={navigation}
              showBack={true}
              backgroundColor={headerColor}
            />
          ),
        })}
      />
      <Stack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={({ navigation }) => ({
          header: () => (
            <UniversalHeader
              title={getString('privacySettings')}
              subtitle={getString('lgpdAndDataProtection')}
              navigation={navigation}
              showBack={true}
              backgroundColor={headerColor}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};

export default SharedNavigator;
