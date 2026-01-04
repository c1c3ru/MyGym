import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@contexts/ThemeContext';
import UniversalHeader from '@components/UniversalHeader';
import { COLORS } from '@presentation/theme/designTokens';

// Telas do Professor
import InstructorDashboard from '@screens/instructor/InstructorDashboard';
import InstructorClasses from '@screens/instructor/InstructorClasses';
import InstructorStudents from '@screens/instructor/InstructorStudents';
import NovaAula from '@screens/instructor/NovaAula';
import CheckIn from '@screens/instructor/CheckIn';
import Relatorios from '@screens/instructor/Relatorios';
import ScheduleClassesScreen from '@screens/instructor/ScheduleClassesScreen';

// Telas Compartilhadas
import ClassDetailsScreen from '@screens/shared/ClassDetailsScreen';
import AddClassScreen from '@screens/admin/AddClassScreen';
import AddStudentScreen from '@screens/admin/AddStudentScreen';
import StudentProfileScreen from '@screens/shared/StudentProfileScreen';
import AddGraduationScreen from '@screens/shared/AddGraduationScreen';
import ProfileScreen from '@screens/shared/ProfileScreen';
import ChangePasswordScreen from '@screens/shared/ChangePasswordScreen';
import PhysicalEvaluationScreen from '@screens/shared/PhysicalEvaluationScreen';
import PhysicalEvaluationHistoryScreen from '@screens/shared/PhysicalEvaluationHistoryScreen';
import NotificationSettingsScreen from '@screens/shared/NotificationSettingsScreen';
import PrivacySettingsScreen from '@screens/shared/PrivacySettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegação para Professores
const InstructorTabNavigator = () => {
  const { getString } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        header: ({ options, route: hdrRoute, navigation: hdrNav }) => (
          <UniversalHeader
            title={(options && options.title) || (hdrRoute && hdrRoute.name) || route.name || getString('instructor')}
            navigation={hdrNav || navigation}
            backgroundColor={COLORS.secondary[500]}
          />
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === getString('dashboard')) {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === getString('classes')) {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === getString('students')) {
            iconName = focused ? 'people' : 'people-outline';
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
        name={getString('dashboard')}
        component={InstructorDashboard}
        options={{ title: getString('dashboard') }}
      />
      <Tab.Screen
        name="Classes"
        component={InstructorClasses}
        options={{ title: getString('classes') }}
      />
      <Tab.Screen
        name="Students"
        component={InstructorStudents}
        options={{ title: getString('students') }}
      />
    </Tab.Navigator>
  );
};

// Stack Navigator para Instrutor (para incluir telas modais)
const InstructorNavigator = () => {
  const { getString } = useTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InstructorTabs" component={InstructorTabNavigator} />
      <Stack.Screen
        name="NovaAula"
        component={NovaAula}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('newLesson')}
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.secondary[500]}
            />
          ),
        }}
      />
      <Stack.Screen
        name="ScheduleClasses"
        component={ScheduleClassesScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title="Agendar Aulas"
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.secondary[500]}
            />
          ),
        }}
      />
      <Stack.Screen
        name="checkIn"
        component={CheckIn}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('checkIn')}
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.secondary[500]}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Relatorios"
        component={Relatorios}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('reports')}
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.secondary[500]}
            />
          ),
        }}
      />
      <Stack.Screen
        name="classDetailsScreen"
        component={ClassDetailsScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('classDetails')}
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.secondary[500]}
            />
          ),
        }}
      />
      <Stack.Screen
        name="CheckIns"
        component={CheckIn}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('checkIns')}
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.secondary[500]}
            />
          ),
        }}
      />
      <Stack.Screen
        name="addClassScreen"
        component={AddClassScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('newClass')}
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.secondary[500]}
            />
          ),
        }}
      />
      <Stack.Screen
        name="AddStudent"
        component={AddStudentScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('newStudent')}
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.secondary[500]}
            />
          ),
        }}
      />
      <Stack.Screen
        name="StudentProfile"
        component={StudentProfileScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title="Perfil do Aluno"
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.secondary[500]}
            />
          ),
        }}
      />
      <Stack.Screen
        name="AddGraduation"
        component={AddGraduationScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title="Nova Graduação"
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.secondary[500]}
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
              title="Profile"
              navigation={navigation}
              showBack={true}
              backgroundColor={COLORS.secondary[500]}
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
              backgroundColor={COLORS.secondary[500]}
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
              backgroundColor={COLORS.secondary[500]}
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
              backgroundColor={COLORS.secondary[500]}
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
              backgroundColor={COLORS.secondary[500]}
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
              backgroundColor={COLORS.secondary[500]}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

export default InstructorNavigator;
