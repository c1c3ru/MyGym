#!/usr/bin/env node
/**
 * Script de Correção Automática de Design Tokens
 * Gerado automaticamente pelo audit-design-tokens.js
 */

const fs = require('fs');

const fixes = [
  {
    file: '/home/deppi/MyGym/src/presentation/theme/designTokens.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/theme/designTokens.js',
    find: /height: 0/g,
    replace: 'height: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/theme/designTokens.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/theme/designTokens.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/theme/designTokens.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/theme/designTokens.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/theme/designTokens.js',
    find: /height: 4/g,
    replace: 'height: SPACING.xs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/theme/designTokens.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/theme/designTokens.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/theme/designTokens.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /height: 4/g,
    replace: 'height: SPACING.xs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /width: 48/g,
    replace: 'width: SPACING.xxxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /height: 48/g,
    replace: 'height: SPACING.xxxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /width: 40/g,
    replace: 'width: SPACING.xxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /height: 40/g,
    replace: 'height: SPACING.xxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /width: 32/g,
    replace: 'width: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /height: 32/g,
    replace: 'height: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /top: 8/g,
    replace: 'top: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /width: 32/g,
    replace: 'width: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /height: 32/g,
    replace: 'height: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /top: 40/g,
    replace: 'top: SPACING.xxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /width: 2/g,
    replace: 'width: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /top: 12/g,
    replace: 'top: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentProfileScreen.js',
    find: /right: 12/g,
    replace: 'right: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /bottom: 32/g,
    replace: 'bottom: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /bottom: 2/g,
    replace: 'bottom: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /bottom: 24/g,
    replace: 'bottom: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /padding: 16/g,
    replace: 'padding: SPACING.base',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /margin: 24/g,
    replace: 'margin: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /top: 32/g,
    replace: 'top: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /top: 24/g,
    replace: 'top: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /bottom: 32/g,
    replace: 'bottom: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /bottom: 2/g,
    replace: 'bottom: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /bottom: 24/g,
    replace: 'bottom: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /padding: 16/g,
    replace: 'padding: SPACING.base',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /margin: 24/g,
    replace: 'margin: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /top: 32/g,
    replace: 'top: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /top: 24/g,
    replace: 'top: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /bottom: 32/g,
    replace: 'bottom: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /bottom: 2/g,
    replace: 'bottom: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /bottom: 24/g,
    replace: 'bottom: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /top: 32/g,
    replace: 'top: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/nodeMailerService.js',
    find: /top: 24/g,
    replace: 'top: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/InstructorStudents.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/InstructorStudents.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/InstructorStudents.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/InstructorStudents.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/InstructorStudents.js',
    find: /height: 4/g,
    replace: 'height: SPACING.xs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/InstructorStudents.js',
    find: /padding: 32/g,
    replace: 'padding: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/InstructorStudents.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/InstructorStudents.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/emailService.js',
    find: /bottom: 32/g,
    replace: 'bottom: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/emailService.js',
    find: /bottom: 2/g,
    replace: 'bottom: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/emailService.js',
    find: /bottom: 24/g,
    replace: 'bottom: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/emailService.js',
    find: /bottom: 32/g,
    replace: 'bottom: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/emailService.js',
    find: /padding: 16/g,
    replace: 'padding: SPACING.base',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/emailService.js',
    find: /margin: 24/g,
    replace: 'margin: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/emailService.js',
    find: /top: 32/g,
    replace: 'top: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/emailService.js',
    find: /top: 24/g,
    replace: 'top: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/infrastructure/services/emailService.js',
    find: /padding: 12/g,
    replace: 'padding: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/auth/RegisterScreen.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/auth/RegisterScreen.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/auth/RegisterScreen.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/auth/RegisterScreen.js',
    find: /height: 4/g,
    replace: 'height: SPACING.xs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ActionButton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ActionButton.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ActionButton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ActionButton.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ActionButton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ActionButton.js',
    find: /height: 4/g,
    replace: 'height: SPACING.xs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/theme/professionalTheme.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/theme/professionalTheme.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/theme/professionalTheme.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/theme/professionalTheme.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/theme/professionalTheme.js',
    find: /height: 4/g,
    replace: 'height: SPACING.xs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/theme/professionalTheme.js',
    find: /fontSize: 32/g,
    replace: 'fontSize: FONT_SIZE.xxxl',
    type: 'fontSize'
  },
  {
    file: '/home/deppi/MyGym/src/shared/utils/animations.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/shared/utils/animations.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/shared/utils/animations.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/shared/utils/animations.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/shared/utils/animations.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/shared/utils/animations.js',
    find: /height: 4/g,
    replace: 'height: SPACING.xs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/UniversalHeader.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/UniversalHeader.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/UniversalHeader.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/UniversalHeader.js',
    find: /height: 4/g,
    replace: 'height: SPACING.xs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/UniversalHeader.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/UniversalHeader.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/CheckInSkeleton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/CheckInSkeleton.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/CheckInSkeleton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/CheckInSkeleton.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/CheckInSkeleton.js',
    find: /gap: 8/g,
    replace: 'gap: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/CheckInSkeleton.js',
    find: /bottom: 16/g,
    replace: 'bottom: SPACING.base',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/CheckInSkeleton.js',
    find: /right: 16/g,
    replace: 'right: SPACING.base',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/CheckIn.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/CheckIn.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/CheckIn.js',
    find: /gap: 8/g,
    replace: 'gap: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/CheckIn.js',
    find: /width: 40/g,
    replace: 'width: SPACING.xxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/CheckIn.js',
    find: /height: 40/g,
    replace: 'height: SPACING.xxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/CheckIn.js',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/CheckIn.js',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/CheckIn.js',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ErrorBoundary.tsx',
    find: /padding: 24/g,
    replace: 'padding: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ErrorBoundary.tsx',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ErrorBoundary.tsx',
    find: /padding: 12/g,
    replace: 'padding: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ErrorBoundary.tsx',
    find: /fontSize: 20/g,
    replace: 'fontSize: FONT_SIZE.lg',
    type: 'fontSize'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ErrorBoundary.tsx',
    find: /fontSize: 16/g,
    replace: 'fontSize: FONT_SIZE.base',
    type: 'fontSize'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ErrorBoundary.tsx',
    find: /fontSize: 12/g,
    replace: 'fontSize: FONT_SIZE.xs',
    type: 'fontSize'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ErrorBoundary.tsx',
    find: /borderRadius: 12/g,
    replace: 'borderRadius: BORDER_RADIUS.md',
    type: 'borderRadius'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ErrorBoundary.tsx',
    find: /borderRadius: 8/g,
    replace: 'borderRadius: BORDER_RADIUS.base',
    type: 'borderRadius'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/GraduationNotificationBell.js',
    find: /top: 4/g,
    replace: 'top: SPACING.xs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/GraduationNotificationBell.js',
    find: /right: 4/g,
    replace: 'right: SPACING.xs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/GraduationNotificationBell.js',
    find: /width: 32/g,
    replace: 'width: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/GraduationNotificationBell.js',
    find: /height: 32/g,
    replace: 'height: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/GraduationNotificationBell.js',
    find: /width: 8/g,
    replace: 'width: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/GraduationNotificationBell.js',
    find: /height: 8/g,
    replace: 'height: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/GraduationNotificationBell.js',
    find: /padding: 32/g,
    replace: 'padding: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/OnboardingTour.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/OnboardingTour.js',
    find: /height: 4/g,
    replace: 'height: SPACING.xs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/OnboardingTour.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/OnboardingTour.js',
    find: /height: 0/g,
    replace: 'height: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/OnboardingTour.js',
    find: /width: 8/g,
    replace: 'width: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/OnboardingTour.js',
    find: /height: 8/g,
    replace: 'height: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/OnboardingTour.js',
    find: /width: 24/g,
    replace: 'width: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ScheduleSelector.js',
    find: /height: 24/g,
    replace: 'height: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ScheduleSelector.js',
    find: /fontSize: 10/g,
    replace: 'fontSize: FONT_SIZE.xxs',
    type: 'fontSize'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AdminClasses.js',
    find: /padding: 32/g,
    replace: 'padding: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AdminClasses.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AdminClasses.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AdminClasses.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/AddGraduationScreen.js',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/AddGraduationScreen.js',
    find: /height: 48/g,
    replace: 'height: SPACING.xxxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/AddGraduationScreen.js',
    find: /height: 48/g,
    replace: 'height: SPACING.xxxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/AddGraduationScreen.js',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/SkeletonLoader.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/LoginScreen.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/LoginScreen.js',
    find: /height: 4/g,
    replace: 'height: SPACING.xs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/LoginScreen.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/LoginScreen.js',
    find: /left: 0/g,
    replace: 'left: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/LoginScreen.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/LoginScreen.js',
    find: /fontSize: 32/g,
    replace: 'fontSize: FONT_SIZE.xxxl',
    type: 'fontSize'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/ReportsScreen.js',
    find: /width: 48/g,
    replace: 'width: SPACING.xxxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/ReportsScreen.js',
    find: /height: 48/g,
    replace: 'height: SPACING.xxxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/ReportsScreen.js',
    find: /height: 8/g,
    replace: 'height: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/ReportsScreen.js',
    find: /width: 32/g,
    replace: 'width: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/ReportsScreen.js',
    find: /height: 32/g,
    replace: 'height: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/ReportsScreen.js',
    find: /fontSize: 10/g,
    replace: 'fontSize: FONT_SIZE.xxs',
    type: 'fontSize'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/ReportsScreen.js',
    find: /borderRadius: 4/g,
    replace: 'borderRadius: BORDER_RADIUS.sm',
    type: 'borderRadius'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/PhysicalEvaluationHistoryScreen.js',
    find: /padding: 32/g,
    replace: 'padding: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/PhysicalEvaluationHistoryScreen.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/PhysicalEvaluationHistoryScreen.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/ProfileScreen.js',
    find: /width: 32/g,
    replace: 'width: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/ProfileScreen.js',
    find: /height: 32/g,
    replace: 'height: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/ProfileScreen.js',
    find: /height: 24/g,
    replace: 'height: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/ProfileScreen.js',
    find: /width: 8/g,
    replace: 'width: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/ProfileScreen.js',
    find: /height: 8/g,
    replace: 'height: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ConsistentLoadingStates.js',
    find: /height: 16/g,
    replace: 'height: SPACING.base',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ConsistentLoadingStates.js',
    find: /height: 12/g,
    replace: 'height: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ConsistentLoadingStates.js',
    find: /height: 32/g,
    replace: 'height: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/InstructorDashboardSkeleton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/InstructorDashboardSkeleton.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/InstructorDashboardSkeleton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/InstructorDashboardSkeleton.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/StudentDashboardSkeleton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/StudentDashboardSkeleton.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/StudentDashboardSkeleton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/StudentDashboardSkeleton.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/auth/UserTypeSelectionScreen.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/auth/UserTypeSelectionScreen.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/student/StudentEvolution.js',
    find: /width: 2/g,
    replace: 'width: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/student/StudentEvolution.js',
    find: /height: 16/g,
    replace: 'height: SPACING.base',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/student/StudentEvolution.js',
    find: /padding: 32/g,
    replace: 'padding: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/student/StudentEvolution.js',
    find: /gap: 8/g,
    replace: 'gap: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/FreeGymScheduler.js',
    find: /gap: 8/g,
    replace: 'gap: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/FreeGymScheduler.js',
    find: /width: 4/g,
    replace: 'width: SPACING.xs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/FreeGymScheduler.js',
    find: /bottom: 16/g,
    replace: 'bottom: SPACING.base',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/FreeGymScheduler.js',
    find: /right: 16/g,
    replace: 'right: SPACING.base',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/FreeGymScheduler.js',
    find: /fontSize: 10/g,
    replace: 'fontSize: FONT_SIZE.xxs',
    type: 'fontSize'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/FreeGymScheduler.js',
    find: /borderRadius: 2/g,
    replace: 'borderRadius: BORDER_RADIUS.xs',
    type: 'borderRadius'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/QRCodeGenerator.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/QRCodeGenerator.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/QRCodeGenerator.js',
    find: /gap: 8/g,
    replace: 'gap: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/InstructorClassesSkeleton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/InstructorClassesSkeleton.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/InstructorClassesSkeleton.js',
    find: /gap: 8/g,
    replace: 'gap: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/InstructorClassesSkeleton.js',
    find: /bottom: 16/g,
    replace: 'bottom: SPACING.base',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/InstructorClassesSkeleton.js',
    find: /right: 16/g,
    replace: 'right: SPACING.base',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AddStudentScreen.js',
    find: /padding: 32/g,
    replace: 'padding: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AddStudentScreen.js',
    find: /padding: 32/g,
    replace: 'padding: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AddStudentScreen.js',
    find: /top: 0/g,
    replace: 'top: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AddStudentScreen.js',
    find: /left: 0/g,
    replace: 'left: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AddStudentScreen.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AddStudentScreen.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/auth/AcademiaSelectionScreen.js',
    find: /gap: 8/g,
    replace: 'gap: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/auth/AcademiaSelectionScreen.js',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/auth/AcademiaSelectionScreen.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/auth/AcademiaSelectionScreen.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/auth/AcademiaSelectionScreen.js',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/InstructorDashboard.js',
    find: /width: 48/g,
    replace: 'width: SPACING.xxxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/InstructorDashboard.js',
    find: /height: 48/g,
    replace: 'height: SPACING.xxxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/InstructorDashboard.js',
    find: /width: 12/g,
    replace: 'width: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/InstructorDashboard.js',
    find: /height: 12/g,
    replace: 'height: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/InstructorDashboard.js',
    find: /width: 2/g,
    replace: 'width: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/InjuryHistoryScreen.js',
    find: /padding: 32/g,
    replace: 'padding: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/InjuryHistoryScreen.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/InjuryHistoryScreen.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/app/config/setupTests.js',
    find: /top: 0/g,
    replace: 'top: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/app/config/setupTests.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/app/config/setupTests.js',
    find: /left: 0/g,
    replace: 'left: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/app/config/setupTests.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/GraduationBoard.js',
    find: /padding: 32/g,
    replace: 'padding: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/NotificationBell.js',
    find: /top: 4/g,
    replace: 'top: SPACING.xs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/NotificationBell.js',
    find: /right: 4/g,
    replace: 'right: SPACING.xs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/NotificationBell.js',
    find: /width: 8/g,
    replace: 'width: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/NotificationBell.js',
    find: /height: 8/g,
    replace: 'height: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/NotificationBell.js',
    find: /padding: 32/g,
    replace: 'padding: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/WebCompatibility.js',
    find: /margin: 0/g,
    replace: 'margin: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/WebCompatibility.js',
    find: /padding: 0/g,
    replace: 'padding: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/WebCompatibility.js',
    find: /width: 8/g,
    replace: 'width: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/CalendarSkeleton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/CalendarSkeleton.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/CalendarSkeleton.js',
    find: /bottom: 16/g,
    replace: 'bottom: SPACING.base',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/CalendarSkeleton.js',
    find: /right: 16/g,
    replace: 'right: SPACING.base',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/InstructorStudentsSkeleton.js',
    find: /gap: 8/g,
    replace: 'gap: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/InstructorStudentsSkeleton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/InstructorStudentsSkeleton.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/InstructorStudentsSkeleton.js',
    find: /gap: 8/g,
    replace: 'gap: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/SkeletonLoader.js',
    find: /top: 0/g,
    replace: 'top: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/SkeletonLoader.js',
    find: /left: 0/g,
    replace: 'left: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/SkeletonLoader.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/SkeletonLoader.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/StudentListSkeleton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/StudentListSkeleton.js',
    find: /gap: 8/g,
    replace: 'gap: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AdminStudents.js',
    find: /height: 24/g,
    replace: 'height: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AdminStudents.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AdminStudents.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/InstructorClasses.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/InstructorClasses.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/student/CheckInScreen.js',
    find: /width: 40/g,
    replace: 'width: SPACING.xxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/student/CheckInScreen.js',
    find: /height: 40/g,
    replace: 'height: SPACING.xxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/student/CheckInScreen.js',
    find: /padding: 32/g,
    replace: 'padding: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/student/CheckInScreen.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/student/CheckInScreen.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/CustomMenu.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/CustomMenu.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/DashboardSkeleton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/DashboardSkeleton.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/DashboardSkeleton.js',
    find: /margin: 0/g,
    replace: 'margin: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/StudentDetailsSkeleton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/StudentDetailsSkeleton.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AdminDashboard.js',
    find: /width: 48/g,
    replace: 'width: SPACING.xxxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AdminDashboard.js',
    find: /height: 48/g,
    replace: 'height: SPACING.xxxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AdminStudentsOptimized.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/AdminStudentsOptimized.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/student/PaymentManagementScreen.js',
    find: /padding: 32/g,
    replace: 'padding: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/student/PaymentManagementScreen.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/student/PaymentManagementScreen.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/student/StudentPayments.js',
    find: /height: 24/g,
    replace: 'height: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/student/StudentPayments.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/student/StudentPayments.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/EnhancedErrorBoundary.js',
    find: /gap: 8/g,
    replace: 'gap: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/EnhancedErrorBoundary.js',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/EnhancedErrorBoundary.js',
    find: /fontSize: 10/g,
    replace: 'fontSize: FONT_SIZE.xxs',
    type: 'fontSize'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/EnhancedErrorMessage.js',
    find: /margin: 0/g,
    replace: 'margin: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/ClassListSkeleton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/LoginSkeleton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/LoginSkeleton.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/ReportsSkeleton.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/skeletons/ReportsSkeleton.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/GraduationManagementScreen.js',
    find: /fontSize: 10/g,
    replace: 'fontSize: FONT_SIZE.xxs',
    type: 'fontSize'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/ClassDetailsScreen.js',
    find: /padding: 32/g,
    replace: 'padding: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/ClassDetailsScreen.js',
    find: /height: 48/g,
    replace: 'height: SPACING.xxxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentDetailsScreen.js',
    find: /width: 0/g,
    replace: 'width: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/StudentDetailsScreen.js',
    find: /height: 2/g,
    replace: 'height: SPACING.xxs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/NotificationManager.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/NotificationManager.js',
    find: /left: 0/g,
    replace: 'left: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/NotificationManager.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/PhonePicker.js',
    find: /gap: 8/g,
    replace: 'gap: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ThemeToggleSwitch.js',
    find: /width: 32/g,
    replace: 'width: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ThemeToggleSwitch.js',
    find: /height: 24/g,
    replace: 'height: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/GraduationBoardScreen.js',
    find: /padding: 32/g,
    replace: 'padding: SPACING.xl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/GraduationBoardScreen.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/GraduationBoardScreen.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/InviteManagement.js',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/InviteManagement.js',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/InviteManagement.js',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/auth/ForgotPasswordScreen.js',
    find: /bottom: 0/g,
    replace: 'bottom: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/auth/ForgotPasswordScreen.js',
    find: /left: 0/g,
    replace: 'left: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/auth/ForgotPasswordScreen.js',
    find: /right: 0/g,
    replace: 'right: SPACING.none',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/Relatorios.js',
    find: /height: 4/g,
    replace: 'height: SPACING.xs',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/instructor/Relatorios.js',
    find: /borderRadius: 2/g,
    replace: 'borderRadius: BORDER_RADIUS.xs',
    type: 'borderRadius'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/AddGraduationScreen_old.js',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/PrivacyPolicyScreen.js',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/AccessibleComponents.js',
    find: /fontSize: 32/g,
    replace: 'fontSize: FONT_SIZE.xxxl',
    type: 'fontSize'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/memoized/StudentListItem.js',
    find: /height: 24/g,
    replace: 'height: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/EditClassScreen.js',
    find: /gap: 8/g,
    replace: 'gap: SPACING.sm',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/ChangePasswordScreen.js',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/shared/NotificationSettingsScreen.js',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/ConflictWarning.js',
    find: /height: 24/g,
    replace: 'height: SPACING.lg',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/CountryStatePicker.js',
    find: /height: 48/g,
    replace: 'height: SPACING.xxxl',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/components/QRCodeScanner.js',
    find: /gap: 12/g,
    replace: 'gap: SPACING.md',
    type: 'spacing'
  },
  {
    file: '/home/deppi/MyGym/src/presentation/screens/admin/EditStudentScreen.js',
    find: /gap: 16/g,
    replace: 'gap: SPACING.base',
    type: 'spacing'
  },
];

console.log('🔧 Aplicando correções automáticas...');

fixes.forEach(fix => {
  try {
    const content = fs.readFileSync(fix.file, 'utf8');
    const newContent = content.replace(fix.find, fix.replace);
    
    if (content !== newContent) {
      fs.writeFileSync(fix.file, newContent);
      console.log(`✅ ${fix.file} - ${fix.type} corrigido`);
    }
  } catch (error) {
    console.error(`❌ Erro em ${fix.file}:`, error.message);
  }
});

console.log('🎉 Correções aplicadas! Execute os testes para verificar.');
