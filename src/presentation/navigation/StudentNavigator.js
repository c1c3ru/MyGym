import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@contexts/ThemeContext';
import UniversalHeader from '@components/UniversalHeader';

// Telas do Aluno
import StudentDashboard from '@screens/student/StudentDashboard';
import StudentPayments from '@screens/student/StudentPayments';
import StudentEvolution from '@screens/student/StudentEvolution';
import StudentCalendar from '@screens/student/StudentCalendar';

// Telas Compartilhadas
import ProfileScreen from '@screens/shared/ProfileScreen';
import ChangePasswordScreen from '@screens/shared/ChangePasswordScreen';
import PhysicalEvaluationScreen from '@screens/shared/PhysicalEvaluationScreen';
import PhysicalEvaluationHistoryScreen from '@screens/shared/PhysicalEvaluationHistoryScreen';
import NotificationSettingsScreen from '@screens/shared/NotificationSettingsScreen';
import PrivacySettingsScreen from '@screens/shared/PrivacySettingsScreen';
import { COLORS } from '@presentation/theme/designTokens';
import { getString } from '@utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Navegação para Alunos
const StudentNavigator = () => {
  const { getString } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        header: ({ options, route: hdrRoute, navigation: hdrNav }) => (
          <UniversalHeader
            title={(options && options.title) || (hdrRoute && hdrRoute.name) || route.name || getString('academy')}
            navigation={hdrNav || navigation}
            backgroundColor={COLORS.info[500]}
          />
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === getString('dashboard')) {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Pagamentos') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Evolução') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === getString('calendar')) {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary[500],
        tabBarInactiveTintColor: COLORS.text.disabled,
        tabBarStyle: {
          backgroundColor: COLORS.card.default.background,
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={StudentDashboard}
        options={{ title: getString('studentDashboard') }}
      />
      <Tab.Screen 
        name="Pagamentos" 
        component={StudentPayments}
        options={{ title: getString('payments') }}
      />
      <Tab.Screen 
        name="Evolução" 
        component={StudentEvolution}
        options={{ title: getString('evolution') }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={StudentCalendar}
        options={{ title: getString('calendar') }}
      />
    </Tab.Navigator>
  );
};

// Stack Navigator para Student (para incluir telas modais e de perfil)
const StudentStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="StudentTabs" 
        component={StudentNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Profile-related screens */}
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title="Profile"
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.info[500]}
            />
          ),
        }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title="ChangePassword"
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.info[500]}
            />
          ),
        }}
      />
      <Stack.Screen 
        name="PhysicalEvaluation" 
        component={PhysicalEvaluationScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title="Avaliação Física"
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.info[500]}
            />
          ),
        }}
      />
      <Stack.Screen 
        name="PhysicalEvaluationHistory" 
        component={PhysicalEvaluationHistoryScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title="evaluationHistory"
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.info[500]}
            />
          ),
        }}
      />
      <Stack.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title="NotificationSettings"
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.info[500]}
            />
          ),
        }}
      />
      <Stack.Screen 
        name="PrivacySettings" 
        component={PrivacySettingsScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title="privacyAndSecurity"
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.info[500]}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

export default StudentStackNavigator;
