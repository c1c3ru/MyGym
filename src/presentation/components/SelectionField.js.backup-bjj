import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT , BORDER_WIDTH } from '@presentation/theme/designTokens';

const SelectionField = ({
  label,
  value,
  placeholder,
  icon,
  onPress,
  required = false,
  disabled = false,
  helperText = null,
  style = {}
}) => {
  return (
    <View style={[styles.selectionItem, style]}>
      <Text style={styles.selectionLabel}>
        {label} {required && '*'}
      </Text>
      <TouchableOpacity
        style={[
          styles.selectionButton,
          value && styles.selectionButtonSelected,
          disabled && styles.selectionButtonDisabled
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <View style={styles.selectionButtonContent}>
          <IconButton
            icon={icon}
            size={20}
            iconColor={value ? COLORS.info[700] : COLORS.text.secondary}
          />
          <Text style={[
            styles.selectionButtonText,
            value && styles.selectionButtonTextSelected,
            disabled && styles.selectionButtonTextDisabled
          ]}>
            {value || placeholder}
          </Text>
          <IconButton icon="chevron-right" size={16} iconColor={COLORS.gray[500]} />
        </View>
      </TouchableOpacity>
      {helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  selectionItem: {
    marginBottom: 16,
  },
  selectionLabel: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  selectionButton: {
    borderWidth: BORDER_WIDTH.base,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
  },
  selectionButtonSelected: {
    borderColor: COLORS.info[700],
    backgroundColor: COLORS.info[50],
  },
  selectionButtonDisabled: {
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[100],
  },
  selectionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: 4,
  },
  selectionButtonText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
  },
  selectionButtonTextSelected: {
    color: COLORS.info[700],
    fontWeight: FONT_WEIGHT.medium,
  },
  selectionButtonTextDisabled: {
    color: COLORS.gray[500],
  },
  helperText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
});

export default SelectionField;
