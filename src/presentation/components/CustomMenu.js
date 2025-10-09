import React from 'react';
import { View, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';

const CustomMenu = ({ visible, onDismiss, anchor, children, style }) => {
  const { currentTheme } = useThemeToggle();
  
  return (
    <View>
      {anchor}
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onDismiss}
        >
          <View style={[styles.menuContainer, style]}>
            {children}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const MenuItem = ({ onPress, title, titleStyle, style, ...props }) => {
  return (
    <TouchableOpacity
      style={[styles.menuItem, style]}
      onPress={onPress}
      {...props}
    >
      <Text style={[styles.menuItemText, titleStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

CustomMenu.Item = MenuItem;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'currentTheme.black + "80"',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    minWidth: 150,
    ...Platform.select({
      ios: {
        shadowColor: 'currentTheme.black',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        ...Platform.select({

          ios: {},

          android: {

            elevation: 4,

          },

          web: {

            boxShadow: '0 2px 4px currentTheme.black + "40"',

          },

        }),
      },
    }),
  },
  menuItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  menuItemText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
  },
});

export default CustomMenu;
