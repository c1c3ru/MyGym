/**
 * AccessibleComponents - Componentes com acessibilidade completa
 * 
 * Wrappers de componentes comuns com todas as propriedades de acessibilidade
 * configuradas corretamente seguindo as diretrizes WCAG 2.1.
 */

import React from 'react';
import { COLORS } from '@presentation/theme/designTokens';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Button, Card, Text, IconButton, FAB, Chip } from 'react-native-paper';
import { SPACING, BORDER_RADIUS, getElevation } from '@presentation/theme/designTokens';

// ============================================
// ACCESSIBLE BUTTON
// ============================================
export const AccessibleButton = ({
  children,
  onPress,
  disabled = false,
  loading = false,
  mode = 'contained',
  icon,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
  ...props
}) => {
  // Gera label automático se não fornecido
  const autoLabel = typeof children === 'string' ? children : accessibilityLabel;
  
  return (
    <Button
      mode={mode}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      icon={icon}
      style={style}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={autoLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      testID={testID}
      {...props}
    >
      {children}
    </Button>
  );
};

// ============================================
// ACCESSIBLE ICON BUTTON
// ============================================
export const AccessibleIconButton = ({
  icon,
  onPress,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  size = 24,
  color,
  style,
  ...props
}) => {
  if (!accessibilityLabel) {
    console.warn(`AccessibleIconButton: accessibilityLabel é obrigatório para ícone "${icon}"`);
  }

  return (
    <IconButton
      icon={icon}
      size={size}
      color={color}
      onPress={onPress}
      disabled={disabled}
      style={style}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || `Botão ${icon}`}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      testID={testID}
      {...props}
    />
  );
};

// ============================================
// ACCESSIBLE CARD
// ============================================
export const AccessibleCard = ({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  testID,
  elevation = 'base',
  style,
  ...props
}) => {
  const CardComponent = onPress ? Card : Card;
  const elevationStyle = getElevation(elevation);

  return (
    <CardComponent
      onPress={onPress}
      style={[elevationStyle, style]}
      accessible={true}
      accessibilityRole={onPress ? accessibilityRole : 'none'}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      testID={testID}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

// ============================================
// ACCESSIBLE FAB
// ============================================
export const AccessibleFAB = ({
  icon,
  label,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
  ...props
}) => {
  const autoLabel = accessibilityLabel || label || `Botão ${icon}`;

  return (
    <FAB
      icon={icon}
      label={label}
      onPress={onPress}
      style={style}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={autoLabel}
      accessibilityHint={accessibilityHint || 'Ação flutuante principal'}
      testID={testID}
      {...props}
    />
  );
};

// ============================================
// ACCESSIBLE CHIP
// ============================================
export const AccessibleChip = ({
  children,
  onPress,
  onClose,
  selected = false,
  disabled = false,
  icon,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
  ...props
}) => {
  const autoLabel = typeof children === 'string' ? children : accessibilityLabel;
  const hint = accessibilityHint || (selected ? 'Selecionado, toque para desmarcar' : 'Toque para selecionar');

  return (
    <Chip
      onPress={onPress}
      onClose={onClose}
      selected={selected}
      disabled={disabled}
      icon={icon}
      style={style}
      accessible={true}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={autoLabel}
      accessibilityHint={hint}
      accessibilityState={{
        disabled,
        selected,
      }}
      testID={testID}
      {...props}
    >
      {children}
    </Chip>
  );
};

// ============================================
// ACCESSIBLE TEXT
// ============================================
export const AccessibleText = ({
  children,
  variant = 'body',
  accessibilityLabel,
  accessibilityRole = 'text',
  testID,
  style,
  ...props
}) => {
  const variantStyles = {
    h1: styles.h1,
    h2: styles.h2,
    h3: styles.h3,
    body: styles.body,
    caption: styles.caption,
  };

  return (
    <Text
      style={[variantStyles[variant], style]}
      accessible={true}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      {...props}
    >
      {children}
    </Text>
  );
};

// ============================================
// ACCESSIBLE TOUCHABLE
// ============================================
export const AccessibleTouchable = ({
  children,
  onPress,
  onLongPress,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  testID,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      style={style}
      accessible={true}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      testID={testID}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

// ============================================
// ACCESSIBLE LIST ITEM
// ============================================
export const AccessibleListItem = ({
  title,
  description,
  left,
  right,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
  ...props
}) => {
  const autoLabel = accessibilityLabel || `${title}${description ? `, ${description}` : ''}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.listItem, style]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={autoLabel}
      accessibilityHint={accessibilityHint || 'Toque para ver detalhes'}
      testID={testID}
      {...props}
    >
      {left && <View style={styles.listItemLeft}>{left}</View>}
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{title}</Text>
        {description && <Text style={styles.listItemDescription}>{description}</Text>}
      </View>
      {right && <View style={styles.listItemRight}>{right}</View>}
    </TouchableOpacity>
  );
};

// ============================================
// ACCESSIBLE HEADER
// ============================================
export const AccessibleHeader = ({
  title,
  subtitle,
  left,
  right,
  accessibilityLabel,
  testID,
  style,
  ...props
}) => {
  const autoLabel = accessibilityLabel || `Cabeçalho: ${title}${subtitle ? `, ${subtitle}` : ''}`;

  return (
    <View
      style={[styles.header, style]}
      accessible={true}
      accessibilityRole="header"
      accessibilityLabel={autoLabel}
      testID={testID}
      {...props}
    >
      {left && <View style={styles.headerLeft}>{left}</View>}
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      {right && <View style={styles.headerRight}>{right}</View>}
    </View>
  );
};

// ============================================
// ACCESSIBLE BADGE
// ============================================
export const AccessibleBadge = ({
  children,
  count,
  accessibilityLabel,
  testID,
  style,
  ...props
}) => {
  const autoLabel = accessibilityLabel || `${count} notificações`;

  return (
    <View
      style={[styles.badge, style]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={autoLabel}
      accessibilityLiveRegion="polite"
      testID={testID}
      {...props}
    >
      {children || <Text style={styles.badgeText}>{count}</Text>}
    </View>
  );
};

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
  // Text variants
  h1: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
  },
  h2: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.sm,
  },
  h3: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.sm,
  },
  body: {
    fontSize: FONT_SIZE.md,
    lineHeight: 24,
  },
  caption: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
  },

  // List Item
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.base,
    backgroundColor: COLORS.white,
    marginVertical: SPACING.xs,
  },
  listItemLeft: {
    marginRight: SPACING.md,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.xs,
  },
  listItemDescription: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
  },
  listItemRight: {
    marginLeft: SPACING.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    marginRight: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
  },
  headerRight: {
    marginLeft: SPACING.md,
  },

  // Badge
  badge: {
    backgroundColor: COLORS.error[500],
    borderRadius: BORDER_RADIUS.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
});

export default {
  AccessibleButton,
  AccessibleIconButton,
  AccessibleCard,
  AccessibleFAB,
  AccessibleChip,
  AccessibleText,
  AccessibleTouchable,
  AccessibleListItem,
  AccessibleHeader,
  AccessibleBadge,
};
