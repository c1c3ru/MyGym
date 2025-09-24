// Feature: Admin
// Exportações centralizadas para o módulo de administração

// Screens
export { default as AdminDashboardSimple } from '../presentation/screens/AdminDashboardSimple';
export { default as AdminStudents } from '../presentation/screens/AdminStudents';
export { default as AdminClasses } from '../presentation/screens/AdminClasses';
export { default as AdminModalities } from '../presentation/screens/AdminModalities';
export { default as AddClassScreen } from '../presentation/screens/AddClassScreen';
export { default as EditClassScreen } from '../presentation/screens/EditClassScreen';
export { default as AddStudentScreen } from '../presentation/screens/AddStudentScreen';
export { default as EditStudentScreen } from '../presentation/screens/EditStudentScreen';
export { default as ReportsScreen } from '../presentation/screens/ReportsScreen';
export { default as InviteManagement } from '../presentation/screens/InviteManagement';

// Components
export { default as AdminCard } from '../presentation/components/AdminCard';
export { default as UserManagement } from '../presentation/components/UserManagement';
export { default as ReportsChart } from '../presentation/components/ReportsChart';

// Services
export { default as adminService } from '../infrastructure/services/adminService';

// Hooks
export { useAdminData } from '../presentation/hooks/useAdminData';
