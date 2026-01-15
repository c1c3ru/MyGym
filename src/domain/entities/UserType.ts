/**
 * UserType Enum
 */
export enum UserType {
    ADMIN = 'admin',
    INSTRUCTOR = 'instructor',
    STUDENT = 'student'
}

/**
 * UserType validation and utility functions
 */
export class UserTypeUtils {
    /**
     * Validates if a user type is valid
     */
    static isValid(userType: string): boolean {
        return Object.values(UserType).includes(userType as UserType);
    }

    /**
     * Gets all available user types
     */
    static getAll(): UserType[] {
        return Object.values(UserType);
    }

    /**
     * Gets user type display name
     */
    static getDisplayName(userType: string, getStringFn?: (key: string) => string): string {
        const t = getStringFn || ((key: string) => key);
        const displayNames: Record<string, string> = {
            [UserType.ADMIN]: t('administrator'),
            [UserType.INSTRUCTOR]: t('instructor'),
            [UserType.STUDENT]: t('student')
        };
        return displayNames[userType] || userType;
    }

    /**
     * Checks if user type has admin privileges
     */
    static hasAdminPrivileges(userType: string): boolean {
        return userType === UserType.ADMIN;
    }

    /**
     * Checks if user type has instructor privileges
     */
    static hasInstructorPrivileges(userType: string): boolean {
        return [UserType.ADMIN, UserType.INSTRUCTOR].includes(userType as UserType);
    }

    /**
     * Gets permissions for user type
     */
    static getPermissions(userType: string): string[] {
        const permissions: Record<string, string[]> = {
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
