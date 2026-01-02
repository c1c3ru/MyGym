// Feature: Instructors
// Exportações centralizadas para o módulo de instrutores

// Screens
export { default as InstructorDashboard } from '@screens/instructor/InstructorDashboard';
export { default as InstructorClasses } from '@screens/instructor/InstructorClasses';
export { default as InstructorStudents } from '@screens/instructor/InstructorStudents';
export { default as NovaAula } from '@screens/instructor/NovaAula';
export { default as CheckIn } from '@screens/instructor/CheckIn';
export { default as Relatorios } from '@screens/instructor/Relatorios';

// Components
export { default as ClassCard } from '@components/ClassCard';
export { default as CheckInButton } from '@components/CheckInButton';
export { default as StudentList } from '@components/StudentList';

// Services
export { default as instructorService } from '@infrastructure/services/instructorService';

// Hooks
export { useInstructorData } from '@hooks/useInstructorData';
