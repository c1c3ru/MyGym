import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Telas de Autenticação
import LoginScreen from '@screens/LoginScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';
import UserTypeSelectionScreen from '@screens/auth/UserTypeSelectionScreen';
import AcademiaSelectionScreen from '@screens/auth/AcademiaSelectionScreen';

// Telas Legais
import TermsOfServiceScreen from '@screens/legal/TermsOfServiceScreen';
import PrivacyPolicyScreen from '@screens/legal/PrivacyPolicyScreen';

const Stack = createStackNavigator();

// Navegação de Autenticação
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="AcademiaSelection" component={AcademiaSelectionScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
