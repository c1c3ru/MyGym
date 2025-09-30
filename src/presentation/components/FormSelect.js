import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, Button, HelperText, Text } from 'react-native-paper';
import { useTheme } from '@contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const FormSelect = ({
  label,
  value,
  onSelect,
  options = [],
  error,
  touched,
  placeholder,
  disabled = false,
  style
}) => {
  const [visible, setVisible] = useState(false);
  const { getString } = useTheme();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (selectedValue) => {
    onSelect(selectedValue);
    closeMenu();
  };

  const getDisplayValue = () => {
    if (!value) return placeholder || getString('selectOption');
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const hasError = touched && error;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button
            mode="outlined"
            onPress={openMenu}
            disabled={disabled}
            style={[
              styles.button,
              hasError && styles.buttonError,
              disabled && styles.buttonDisabled
            ]}
            contentStyle={styles.buttonContent}
            labelStyle={[
              styles.buttonLabel,
              !value && styles.placeholderText
            ]}
            icon={() => (
              <Ionicons 
                name={visible ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={hasError ? "COLORS.error[500]" : "COLORS.text.secondary"} 
              />
            )}
          >
            {getDisplayValue()}
          </Button>
        }
      >
        {options.map((option) => (
          <Menu.Item
            key={option.value}
            onPress={() => handleSelect(option.value)}
            title={option.label}
            titleStyle={value === option.value ? styles.selectedOption : null}
          />
        ))}
      </Menu>

      {hasError && (
        <HelperText type="error" visible={hasError} style={styles.errorText}>
          {error}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  button: {
    backgroundColor: 'COLORS.COLORS.white',
    borderColor: '#ccc',
    justifyContent: 'flex-start',
  },
  buttonError: {
    borderColor: COLORS.error[500],
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray[100],
  },
  buttonContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  buttonLabel: {
    color: COLORS.text.primary,
    textAlign: 'left',
    flex: 1,
  },
  placeholderText: {
    color: COLORS.gray[500],
  },
  selectedOption: {
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.info[500],
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
});

export default FormSelect;
