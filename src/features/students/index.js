// Feature: Students
// Exportações centralizadas para o módulo de estudantes

// Screens
export { default as StudentDashboard } from '../presentation/screens/StudentDashboard';
export { default as StudentPayments } from '../presentation/screens/StudentPayments';
export { default as StudentEvolution } from '../presentation/screens/StudentEvolution';
export { default as StudentCalendar } from '../presentation/screens/StudentCalendar';
export { default as StudentProfileScreen } from '../presentation/screens/StudentProfileScreen';
export { default as StudentDetailsScreen } from '../presentation/screens/StudentDetailsScreen';

// Components
export { default as StudentCard } from '../presentation/components/StudentCard';
export { default as PaymentCard } from '../presentation/components/PaymentCard';
export { default as EvolutionChart } from '../presentation/components/EvolutionChart';

// Services
export { default as studentService } from '../infrastructure/services/studentService';

// Hooks
export { useStudentData } from '../presentation/hooks/useStudentData';

// Types/Constants
export * from '../shared/types/studentTypes';
