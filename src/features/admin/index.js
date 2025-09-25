// Feature: Admin
// Exportações centralizadas para o módulo de administração

// Screens
export { default as AdminDashboardSimple } from '@screens/admin/AdminDashboardSimple';
export { default as AdminStudents } from '@screens/admin/AdminStudents';
export { default as AdminClasses } from '@screens/admin/AdminClasses';
export { default as AdminModalities } from '@screens/admin/AdminModalities';
export { default as AddClassScreen } from '@screens/admin/AddClassScreen';
export { default as EditClassScreen } from '@screens/admin/EditClassScreen';
export { default as AddStudentScreen } from '@screens/admin/AddStudentScreen';
export { default as EditStudentScreen } from '@screens/admin/EditStudentScreen';
export { default as ReportsScreen } from '@screens/admin/ReportsScreen';
export { default as InviteManagement } from '@screens/admin/InviteManagement';

// Components
export { default as AdminCard } from '@components/AdminCard';
export { default as UserManagement } from '@components/UserManagement';
export { default as ReportsChart } from '@components/ReportsChart';

// Services
export { default as adminService } from '@services/adminService';

// Hooks
export { useAdminData } from '@hooks/useAdminData';
