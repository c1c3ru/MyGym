
/**
 * UserType Enum
 */
export const UserType = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student'
};

/**
 * UserType validation and utility functions
 */
export class UserTypeUtils {
  /**
   * Validates if a user type is valid
   */
  static isValid(userType) {
    return Object.values(UserType).includes(userType);
  }

  /**
   * Gets all available user types
   */
  static getAll() {
    return Object.values(UserType);
  }

  /**
   * Gets user type display name
   */
  static getDisplayName(userType, getStringFn) {
    const t = getStringFn || ((key) => key);
    const displayNames = {
      [UserType.ADMIN]: t('administrator'),
      [UserType.INSTRUCTOR]: t('instructor'),
      [UserType.STUDENT]: t('student')
    };
    return displayNames[userType] || userType;
  }

  /**
   * Checks if user type has admin privileges
   */
  static hasAdminPrivileges(userType) {
    return userType === UserType.ADMIN;
  }

  /**
   * Checks if user type has instructor privileges
   */
  static hasInstructorPrivileges(userType) {
    return [UserType.ADMIN, UserType.INSTRUCTOR].includes(userType);
  }

  /**
   * Gets permissions for user type
   */
  static getPermissions(userType) {
    const permissions = {
      [UserType.ADMIN]: [
        'manage_users',
        'manage_classes',
        'manage_academy',
        'view_reports',
        'manage_graduations'
      ],
      [UserType.INSTRUCTOR]: [
        'manage_classes',
        'view_students',
        'manage_graduations',
        'checkin_students'
      ],
      [UserType.STUDENT]: [
        'view_classes',
        'view_profile',
        'checkin_self'
      ]
    };
    return permissions[userType] || [];
  }
}
