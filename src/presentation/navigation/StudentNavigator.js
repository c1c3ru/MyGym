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
import CheckInScreen from '@screens/student/CheckInScreen';

// Telas Compartilhadas
import ProfileScreen from '@screens/shared/ProfileScreen';
import ChangePasswordScreen from '@screens/shared/ChangePasswordScreen';
import PhysicalEvaluationScreen from '@screens/shared/PhysicalEvaluationScreen';
import PhysicalEvaluationHistoryScreen from '@screens/shared/PhysicalEvaluationHistoryScreen';
import NotificationSettingsScreen from '@screens/shared/NotificationSettingsScreen';
import PrivacySettingsScreen from '@screens/shared/PrivacySettingsScreen';
import { COLORS } from '@presentation/theme/designTokens';
import SettingsScreen from '@screens/shared/SettingsScreen';

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

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Payments') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Evolution') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary[500],
        tabBarInactiveTintColor: COLORS.gray[300],
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
        name="Payments"
        component={StudentPayments}
        options={{ title: getString('payments') }}
      />
      <Tab.Screen
        name="Evolution"
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
  const { getString } = useTheme();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StudentTabs"
        component={StudentNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('checkIn')}
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.info[500]}
            />
          ),
        }}
      />

      {/* Profile-related screens */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('profile')}
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.info[500]}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('settings')}
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
              title={getString('changePassword')}
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
              title={getString('physicalEvaluation')}
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
              title={getString('evaluationHistory')}
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
              title={getString('notificationSettings')}
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
              title={getString('privacyAndSecurity')}
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
