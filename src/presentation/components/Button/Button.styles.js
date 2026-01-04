import { StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT , BORDER_WIDTH } from '@presentation/theme/designTokens';
import { getString } from "@utils/theme";

const styles = StyleSheet.create({
  // Base button styles
  button: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  // Variants
  primary: {
    backgroundColor: COLORS.info[500],
  },
  secondary: {
    backgroundColor: COLORS.gray[600],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: BORDER_WIDTH.base,
    borderColor: COLORS.info[500],
  },
  danger: {
    backgroundColor: COLORS.error[500],
  },

  // Sizes
  small: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 36,
  },
  medium: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 44,
  },
  large: {
    paddingVertical: SPACING.md,
    paddingHorizontal: 32,
    minHeight: 52,
  },

  // States
  disabled: {
    opacity: 0.6,
  },

  // Text styles
  text: {
    fontWeight: FONT_WEIGHT.semiBold,
    textAlign: 'center',
  },
  textPrimary: {
    color: getString('colorWhite'),
  },
  textSecondary: {
    color: getString('colorWhite'),
  },
  textOutline: {
    color: COLORS.info[500],
  },
  textDanger: {
    color: getString('colorWhite'),
  },

  // Text sizes
  textSmall: {
    fontSize: FONT_SIZE.base,
  },
  textMedium: {
    fontSize: FONT_SIZE.md,
  },
  textLarge: {
    fontSize: FONT_SIZE.lg,
  },
});

export default styles;
