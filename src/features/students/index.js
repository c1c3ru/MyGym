// Feature: Students
// Exportações centralizadas para o módulo de estudantes

// Screens
export { default as StudentDashboard } from '@screens/student/StudentDashboard';
export { default as StudentPayments } from '@screens/student/StudentPayments';
export { default as StudentEvolution } from '@screens/student/StudentEvolution';
export { default as StudentCalendar } from '@screens/student/StudentCalendar';
export { default as StudentProfileScreen } from '@screens/student/StudentProfileScreen';
export { default as StudentDetailsScreen } from '@screens/student/StudentDetailsScreen';

// Components
export { default as StudentCard } from '@components/StudentCard';
export { default as PaymentCard } from '@components/PaymentCard';
export { default as EvolutionChart } from '@components/EvolutionChart';

// Services
export { default as studentService } from '@services/studentService';

// Hooks
export { useStudentData } from '@hooks/useStudentData';

// Types/Constants
export * from '@/shared/types/studentTypes';
