import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Switch,
  Card,
  Divider
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '@presentation/theme/designTokens';

const ThemeToggleSwitch = ({ style }) => {
  const { 
    isDarkTheme, 
    toggleTheme, 
    themeInfo, 
    currentTheme,
    setDarkTheme,
    setLightTheme 
  } = useThemeToggle();

  return (
    <Card style={[styles.container, style]}>
      <Card.Content>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons 
            name="palette-outline" 
            size={24} 
            color={currentTheme.primary[500]} 
          />
          <Text style={[styles.title, { color: COLORS.text.primary}]}>
            Aparência
          </Text>
        </View>
        
        <Text style={[styles.description, { color: COLORS.text.primary}]}>
          Escolha entre o tema claro sóbrio ou escuro premium
        </Text>

        <Divider style={[styles.divider, { backgroundColor: currentTheme.border.default }]} />

        {/* Switch Principal */}
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={[styles.switchLabel, { color: COLORS.text.primary}]}>
              {themeInfo.name}
            </Text>
            <Text style={[styles.switchDescription, { color: COLORS.text.primary}]}>
              {themeInfo.description}
            </Text>
          </View>
          
          <Switch
            value={isDarkTheme}
            onValueChange={toggleTheme}
            thumbColor={isDarkTheme ? currentTheme.primary[500] : currentTheme.secondary[500]}
            trackColor={{
              false: currentTheme.gray[300],
              true: currentTheme.primary[200],
            }}
          />
        </View>

        <Divider style={[styles.divider, { backgroundColor: currentTheme.border.default }]} />

        {/* Opções de Tema */}
        <View style={styles.themeOptions}>
          <Text style={[styles.optionsTitle, { color: COLORS.text.primary}]}>
            Temas Disponíveis
          </Text>
          
          {/* Dark Theme Premium */}
          <TouchableOpacity 
            style={[
              styles.themeOption,
              { 
                backgroundColor: isDarkTheme 
                  ? currentTheme.primary[100] 
                  : currentTheme.background.paper,
                borderColor: isDarkTheme 
                  ? currentTheme.primary[300] 
                  : currentTheme.border.default,
              }
            ]}
            onPress={setDarkTheme}
          >
            <View style={styles.themePreview}>
              <View style={[styles.previewDark, styles.previewBox]} />
              <View style={styles.previewInfo}>
                <Text style={[styles.themeName, { color: COLORS.text.primary}]}>
                  Dark Premium
                </Text>
                <Text style={[styles.themeDesc, { color: COLORS.text.primary}]}>
                  Tema escuro para academias de artes marciais
                </Text>
              </View>
            </View>
            {isDarkTheme && (
              <MaterialCommunityIcons 
                name="check-circle" 
                size={20} 
                color={currentTheme.primary[500]} 
              />
            )}
          </TouchableOpacity>

          {/* Light Theme Sóbrio */}
          <TouchableOpacity 
            style={[
              styles.themeOption,
              { 
                backgroundColor: !isDarkTheme 
                  ? currentTheme.primary[100] 
                  : currentTheme.background.paper,
                borderColor: !isDarkTheme 
                  ? currentTheme.primary[300] 
                  : currentTheme.border.default,
              }
            ]}
            onPress={setLightTheme}
          >
            <View style={styles.themePreview}>
              <View style={[styles.previewLight, styles.previewBox]} />
              <View style={styles.previewInfo}>
                <Text style={[styles.themeName, { color: COLORS.text.primary}]}>
                  Light Sóbrio
                </Text>
                <Text style={[styles.themeDesc, { color: COLORS.text.primary}]}>
                  Tema claro inspirado em incubadoras tecnológicas
                </Text>
              </View>
            </View>
            {!isDarkTheme && (
              <MaterialCommunityIcons 
                name="check-circle" 
                size={20} 
                color={currentTheme.primary[500]} 
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Informações Adicionais */}
        <View style={[styles.infoBox, { backgroundColor: currentTheme.card.section.background }]}>
          <MaterialCommunityIcons 
            name="information-outline" 
            size={16} 
            color={currentTheme.info[500]} 
          />
          <Text style={[styles.infoText, { color: COLORS.text.primary}]}>
            A preferência de tema é salva automaticamente e aplicada em todo o app
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: SPACING.base,
    elevation: 2,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginLeft: SPACING.sm,
  },
  
  description: {
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
    marginBottom: SPACING.base,
  },
  
  divider: {
    marginVertical: SPACING.base,
  },
  
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  
  switchInfo: {
    flex: 1,
    marginRight: SPACING.base,
  },
  
  switchLabel: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: 2,
  },
  
  switchDescription: {
    fontSize: FONT_SIZE.xs,
    lineHeight: 16,
  },
  
  themeOptions: {
    marginTop: SPACING.sm,
  },
  
  optionsTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: SPACING.base,
  },
  
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.base,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  
  themePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  previewBox: {
    width: 32,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  
  previewDark: {
    backgroundColor: COLORS.background.paper,
  },
  
  previewLight: {
    backgroundColor: COLORS.background.light,
  },
  
  previewInfo: {
    flex: 1,
  },
  
  themeName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    marginBottom: 2,
  },
  
  themeDesc: {
    fontSize: FONT_SIZE.xs,
    lineHeight: 16,
  },
  
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.base,
  },
  
  infoText: {
    fontSize: FONT_SIZE.xs,
    lineHeight: 16,
    marginLeft: SPACING.xs,
    flex: 1,
  },
});

export default ThemeToggleSwitch;
