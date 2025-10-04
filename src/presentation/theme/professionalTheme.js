import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import {
  APP_COLORS,
  PROFILE_COLORS,
  STATUS_COLORS,
  TEXT_COLORS,
  getProfileColors,
  getPrimaryColor,
  getProfileGradient,
} from '@shared/constants/colors';

export const PROFESSIONAL_COLORS = {
  admin: {
    primary: PROFILE_COLORS.admin.primary,
    secondary: PROFILE_COLORS.admin.primaryLight,
    accent: PROFILE_COLORS.admin.primaryDark,
    gradient: PROFILE_COLORS.admin.gradient,
    surface: PROFILE_COLORS.admin.surface,
    background: PROFILE_COLORS.admin.background,
    card: APP_COLORS.white,
    text: TEXT_COLORS.primary,
    textSecondary: TEXT_COLORS.secondary,
    success: STATUS_COLORS.success,
    warning: STATUS_COLORS.warning,
    error: STATUS_COLORS.error,
  },

  instructor: {
    primary: PROFILE_COLORS.instructor.primary,
    secondary: PROFILE_COLORS.instructor.primaryLight,
    accent: PROFILE_COLORS.instructor.primaryDark,
    gradient: PROFILE_COLORS.instructor.gradient,
    surface: PROFILE_COLORS.instructor.surface,
    background: PROFILE_COLORS.instructor.background,
    card: APP_COLORS.white,
    text: TEXT_COLORS.primary,
    textSecondary: TEXT_COLORS.secondary,
    success: STATUS_COLORS.success,
    warning: STATUS_COLORS.warning,
    error: STATUS_COLORS.error,
  },

  student: {
    primary: PROFILE_COLORS.student.primary,
    secondary: PROFILE_COLORS.student.primaryLight,
    accent: PROFILE_COLORS.student.primaryDark,
    gradient: PROFILE_COLORS.student.gradient,
    surface: PROFILE_COLORS.student.surface,
    background: PROFILE_COLORS.student.background,
    card: APP_COLORS.white,
    text: TEXT_COLORS.primary,
    textSecondary: TEXT_COLORS.secondary,
    success: STATUS_COLORS.success,
    warning: STATUS_COLORS.warning,
    error: STATUS_COLORS.error,
  },

  common: {
    COLORS.white: APP_COLORS.white,
    black: APP_COLORS.black,
    gray: APP_COLORS.gray,
    status: STATUS_COLORS,
    vibrantRed: APP_COLORS.vibrantRed,
  }
};

export const getThemeColors = (userType) => {
  console.warn('getThemeColors() is deprecated. Use useCustomClaims().getUserTypeColor() instead.');
  return getProfileColors(userType);
};

export const HEADER_GRADIENTS = {
  admin: PROFILE_COLORS.admin.gradient,
  instructor: PROFILE_COLORS.instructor.gradient,
  student: PROFILE_COLORS.student.gradient,
};

export const STATUS_COLORS_EXPORT = {
  active: STATUS_COLORS.success,
  inactive: APP_COLORS.gray[500],
  pending: STATUS_COLORS.warning,
  overdue: STATUS_COLORS.error,
  paid: STATUS_COLORS.success,
  cancelled: STATUS_COLORS.error,
};

export const ELEVATION = {
  small: {
    shadowColor: APP_COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: APP_COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: APP_COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: FONT_WEIGHT.bold, lineHeight: 40 },
  h2: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, lineHeight: 36 },
  h3: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, lineHeight: 32 },
  h4: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.semibold, lineHeight: 28 },
  h5: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.semibold, lineHeight: 24 },
  h6: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, lineHeight: 22 },
  body1: { fontSize: FONT_SIZE.md, fontWeight: 'normal', lineHeight: 24 },
  body2: { fontSize: FONT_SIZE.base, fontWeight: 'normal', lineHeight: 20 },
  caption: { fontSize: FONT_SIZE.sm, fontWeight: 'normal', lineHeight: 16 },
  button: { fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, lineHeight: 20 },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
  round: 50,
};
