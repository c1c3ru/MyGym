import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@contexts/ThemeContext';
import UniversalHeader from '@components/UniversalHeader';
import { PROFILE_COLORS } from '@shared/constants/colors';

// Telas do Admin
import AdminDashboard from '@screens/admin/AdminDashboard';
import AdminStudents from '@screens/admin/AdminStudents';
import AdminClasses from '@screens/admin/AdminClasses';
import AdminModalities from '@screens/admin/AdminModalities';
import AddClassScreen from '@screens/admin/AddClassScreen';
import EditClassScreen from '@screens/admin/EditClassScreen';
import AddStudentScreen from '@screens/admin/AddStudentScreen';
import EditStudentScreen from '@screens/admin/EditStudentScreen';
import ReportsScreen from '@screens/admin/ReportsScreen';
import InviteManagement from '@screens/admin/InviteManagement';

// Telas de Exemplo e Demonstração
import LightThemeExampleScreen from '@screens/examples/LightThemeExampleScreen';

// Telas Compartilhadas
import ClassDetailsScreen from '@screens/shared/ClassDetailsScreen';
import StudentDetailsScreen from '@screens/shared/StudentDetailsScreen';
import StudentProfileScreen from '@screens/shared/StudentProfileScreen';
import ProfileScreen from '@screens/shared/ProfileScreen';
import AddGraduationScreen from '@screens/shared/AddGraduationScreen';
import ChangePasswordScreen from '@screens/shared/ChangePasswordScreen';
import PhysicalEvaluationScreen from '@screens/shared/PhysicalEvaluationScreen';
import PhysicalEvaluationHistoryScreen from '@screens/shared/PhysicalEvaluationHistoryScreen';
import NotificationSettingsScreen from '@screens/shared/NotificationSettingsScreen';
import PrivacySettingsScreen from '@screens/shared/PrivacySettingsScreen';
import SettingsScreen from '@screens/shared/SettingsScreen';
import StudentPayments from '@screens/student/StudentPayments';
import CheckIn from '@screens/instructor/CheckIn';
import { COLORS } from '@presentation/theme/designTokens';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegação para Administradores
const AdminTabNavigator = () => {
  const { getString } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        header: ({ options, route: hdrRoute, navigation: hdrNav }) => (
          <UniversalHeader
            title={(options && options.title) || (hdrRoute && hdrRoute.name) || route.name || 'Admin'}
            navigation={hdrNav || navigation}
            backgroundColor={PROFILE_COLORS.admin.primary}
          />
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === getString('dashboard')) {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === getString('students')) {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === getString('classes')) {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === getString('modalities')) {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === getString('management')) {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === getString('invitations')) {
            iconName = focused ? 'mail' : 'mail-outline';
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
        name=getString('dashboard') 
        component={AdminDashboard}
        options={{ title: getString('dashboard') }}
      />
      <Tab.Screen 
        name=getString('students') 
        component={AdminStudents}
        options={{ title: getString('students') }}
      />
      <Tab.Screen 
        name=getString('classes') 
        component={AdminClasses}
        options={{ title: getString('classes') }}
      />
      <Tab.Screen 
        name=getString('modalities') 
        component={AdminModalities}
        options={{ title: getString('modalities') }}
      />
      <Tab.Screen 
        name=getString('management') 
        component={ReportsScreen}
        options={{ title: getString('reports') }}
      />
      <Tab.Screen 
        name=getString('invitations') 
        component={InviteManagement}
        options={{ title: getString('invites') }}
      />
    </Tab.Navigator>
  );
};

// Stack Navigator para Admin (para telas modais/detalhes)
const AdminNavigator = () => {
  const { getString } = useTheme();
  
  return (
    <Stack.Navigator id=getString('adminStack') screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      <Stack.Screen 
        name=getString('addClass') 
        component={AddClassScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('newClass')}
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name="ClassStudents" 
        component={AdminStudents}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('classStudents')}
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name=getString('checkIns') 
        component={CheckIn}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title="Check-ins"
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name=getString('editClass') 
        component={EditClassScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('editClass')}
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name=getString('classDetails') 
        component={ClassDetailsScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('classDetails')}
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name=getString('addStudent') 
        component={AddStudentScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('newStudent')}
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name=getString('editStudent') 
        component={EditStudentScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('editStudent')}
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name=getString('studentDetails') 
        component={StudentDetailsScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('studentDetails')}
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name=getString('studentPayments') 
        component={StudentPayments}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('studentPayments')}
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title={getString('reports')}
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name="Modalities" 
        component={AdminModalities}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title=getString('modalities')
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name=getString('studentProfile') 
        component={StudentProfileScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title="Perfil do Aluno"
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name=getString('addGraduationScreen') 
        component={AddGraduationScreen}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen 
        name=getString('profile') 
        component={ProfileScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title=getString('profile')
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      
      {/* Nested SharedNavigator screens */}
      <Stack.Screen 
        name=getString('changePassword') 
        component={ChangePasswordScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title=getString('changePassword')
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name=getString('physicalEvaluation') 
        component={PhysicalEvaluationScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title=getString('physicalEvaluation')
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name=getString('physicalEvaluationHistory') 
        component={PhysicalEvaluationHistoryScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title=getString('evaluationHistory')
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name=getString('notificationSettings') 
        component={NotificationSettingsScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title=getString('notificationSettings')
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name=getString('privacySettings') 
        component={PrivacySettingsScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title=getString('privacyAndSecurity')
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
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
              title=getString('settings')
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
      <Stack.Screen 
        name="ThemeDemo" 
        component={LightThemeExampleScreen}
        options={{
          headerShown: true,
          header: ({ navigation }) => (
            <UniversalHeader
              title="Demonstração de Temas"
              navigation={navigation}
              showBack={true}
              backgroundColor={PROFILE_COLORS.admin.primary}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
