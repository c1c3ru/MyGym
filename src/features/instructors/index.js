// Feature: Instructors
// Exportações centralizadas para o módulo de instrutores

// Screens
export { default as InstructorDashboard } from '../presentation/screens/InstructorDashboard';
export { default as InstructorClasses } from '../presentation/screens/InstructorClasses';
export { default as InstructorStudents } from '../presentation/screens/InstructorStudents';
export { default as NovaAula } from '../presentation/screens/NovaAula';
export { default as CheckIn } from '../presentation/screens/CheckIn';
export { default as Relatorios } from '../presentation/screens/Relatorios';

// Components
export { default as ClassCard } from '../presentation/components/ClassCard';
export { default as CheckInButton } from '../presentation/components/CheckInButton';
export { default as StudentList } from '../presentation/components/StudentList';

// Services
export { default as instructorService } from '../infrastructure/services/instructorService';

// Hooks
export { useInstructorData } from '../presentation/hooks/useInstructorData';
