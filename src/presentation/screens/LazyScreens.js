import React, { lazy } from 'react';
import { withLazyLoading } from '../components/LazyScreen';

// Admin Screens com Lazy Loading
export const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
export const AdminStudents = lazy(() => import('./admin/AdminStudentsOptimized'));
export const AdminClasses = lazy(() => import('./admin/AdminClasses'));
export const AdminModalities = lazy(() => import('./admin/AdminModalities'));
export const AddStudentScreen = lazy(() => import('./admin/AddStudentScreen'));
export const EditStudentScreen = lazy(() => import('./admin/EditStudentScreen'));
export const AddClassScreen = lazy(() => import('./admin/AddClassScreen'));
export const EditClassScreen = lazy(() => import('./admin/EditClassScreen'));
export const ReportsScreen = lazy(() => import('./admin/ReportsScreen'));
export const InviteManagement = lazy(() => import('./admin/InviteManagement'));

// Instructor Screens com Lazy Loading
export const InstructorDashboard = lazy(() => import('./instructor/InstructorDashboard'));
export const InstructorClasses = lazy(() => import('./instructor/InstructorClasses'));
export const InstructorStudents = lazy(() => import('./instructor/InstructorStudents'));
export const CheckIn = lazy(() => import('./instructor/CheckIn'));
export const NovaAula = lazy(() => import('./instructor/NovaAula'));
export const Relatorios = lazy(() => import('./instructor/Relatorios'));

// Student Screens com Lazy Loading
export const StudentDashboard = lazy(() => import('./student/StudentDashboard'));
export const StudentCalendar = lazy(() => import('./student/StudentCalendar'));
export const StudentPayments = lazy(() => import('./student/StudentPayments'));
export const StudentEvolution = lazy(() => import('./student/StudentEvolution'));
export const CheckInScreen = lazy(() => import('./student/CheckInScreen'));
export const PaymentManagementScreen = lazy(() => import('./student/PaymentManagementScreen'));

// Shared Screens com Lazy Loading
export const ProfileScreen = lazy(() => import('./shared/ProfileScreen'));
export const SettingsScreen = lazy(() => import('./shared/SettingsScreen'));
export const NotificationSettingsScreen = lazy(() => import('./shared/NotificationSettingsScreen'));
export const PrivacySettingsScreen = lazy(() => import('./shared/PrivacySettingsScreen'));
export const ChangePasswordScreen = lazy(() => import('./shared/ChangePasswordScreen'));
export const StudentDetailsScreen = lazy(() => import('./shared/StudentDetailsScreen'));
export const StudentProfileScreen = lazy(() => import('./shared/StudentProfileScreen'));
export const ClassDetailsScreen = lazy(() => import('./shared/ClassDetailsScreen'));
export const EnhancedCalendarScreen = lazy(() => import('./shared/EnhancedCalendarScreen'));
export const InjuryScreen = lazy(() => import('./shared/InjuryScreen'));
export const InjuryHistoryScreen = lazy(() => import('./shared/InjuryHistoryScreen'));
export const PhysicalEvaluationScreen = lazy(() => import('./shared/PhysicalEvaluationScreen'));
export const PhysicalEvaluationHistoryScreen = lazy(() => import('./shared/PhysicalEvaluationHistoryScreen'));
export const AddGraduationScreen = lazy(() => import('./shared/AddGraduationScreen'));
export const PrivacyPolicyScreen = lazy(() => import('./shared/PrivacyPolicyScreen'));

// Auth Screens (carregamento imediato para UX)
export const LoginScreen = lazy(() => import('./LoginScreen'));
export const RegisterScreen = lazy(() => import('./auth/RegisterScreen'));
export const ForgotPasswordScreen = lazy(() => import('./auth/ForgotPasswordScreen'));
export const AcademiaSelectionScreen = lazy(() => import('./auth/AcademiaSelectionScreen'));
export const UserTypeSelectionScreen = lazy(() => import('./auth/UserTypeSelectionScreen'));

// Onboarding Screens
export const AcademyOnboardingScreen = lazy(() => import('./onboarding/AcademyOnboardingScreen'));

// Screens com Lazy Loading pré-configurado
export const LazyAdminDashboard = withLazyLoading(AdminDashboard, 'Carregando dashboard...');
export const LazyAdminStudents = withLazyLoading(AdminStudents, 'Carregando lista de alunos...');
export const LazyAdminClasses = withLazyLoading(AdminClasses, 'Carregando turmas...');
export const LazyInstructorDashboard = withLazyLoading(InstructorDashboard, 'Carregando dashboard...');
export const LazyInstructorClasses = withLazyLoading(InstructorClasses, 'Carregando suas turmas...');
export const LazyStudentDashboard = withLazyLoading(StudentDashboard, 'Carregando dashboard...');
export const LazyStudentPayments = withLazyLoading(StudentPayments, 'Carregando pagamentos...');

// Função utilitária para preload de screens
export const preloadScreens = {
  admin: () => {
    import('./admin/AdminDashboard');
    import('./admin/AdminStudentsOptimized');
    import('./admin/AdminClasses');
  },
  instructor: () => {
    import('./instructor/InstructorDashboard');
    import('./instructor/InstructorClasses');
    import('./instructor/InstructorStudents');
  },
  student: () => {
    import('./student/StudentDashboard');
    import('./student/StudentCalendar');
    import('./student/StudentPayments');
  },
  shared: () => {
    import('./shared/ProfileScreen');
    import('./shared/SettingsScreen');
  }
};