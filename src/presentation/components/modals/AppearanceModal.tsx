import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Switch, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@contexts/ThemeContext';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '@presentation/theme/designTokens';
import BaseBottomSheet from './BaseBottomSheet';

interface AppearanceModalProps {
    visible: boolean;
    onDismiss: () => void;
}

const AppearanceModal: React.FC<AppearanceModalProps> = ({ visible, onDismiss }) => {
    const { isDarkMode, theme, getString } = useTheme();
    const {
        isDarkTheme,
        toggleTheme,
        themeInfo,
        currentTheme,
        setDarkTheme,
        setLightTheme
    } = useThemeToggle();

    const textColor = isDarkMode ? COLORS.white : COLORS.black;
    const secondaryColor = isDarkMode ? COLORS.gray[400] : COLORS.gray[600];

    return (
        <BaseBottomSheet
            visible={visible}
            onDismiss={onDismiss}
            title={getString('appearance') || 'Aparência'}
            isDarkMode={isDarkMode}
            theme={theme}
        >
            <View>
                <Text style={[styles.description, { color: secondaryColor }]}>
                    {getString('appearanceDescription') || 'Escolha seu tema preferido'}
                </Text>

                <View style={styles.switchRow}>
                    <View style={styles.switchInfo}>
                        <Text style={[styles.label, { color: textColor }]}>
                            {themeInfo.name}
                        </Text>
                        <Text style={[styles.subLabel, { color: secondaryColor }]}>
                            {themeInfo.description}
                        </Text>
                    </View>
                    <Switch
                        value={isDarkTheme}
                        onValueChange={toggleTheme}
                        color={COLORS.primary[500]}
                    />
                </View>

                <Divider style={[styles.divider, { backgroundColor: isDarkMode ? COLORS.gray[800] : COLORS.gray[200] }]} />

                <Text style={[styles.sectionTitle, { color: textColor }]}>
                    {getString('availableThemes') || 'Temas Disponíveis'}
                </Text>

                <TouchableOpacity
                    style={[
                        styles.option,
                        isDarkTheme && styles.selectedOption,
                        { backgroundColor: isDarkMode ? COLORS.gray[800] : COLORS.gray[50] }
                    ]}
                    onPress={setDarkTheme}
                >
                    <View style={styles.optionContent}>
                        <View style={[styles.preview, { backgroundColor: COLORS.gray[900] }]} />
                        <View style={styles.optionText}>
                            <Text style={[styles.optionName, { color: textColor }]}>Dark Premium</Text>
                            <Text style={[styles.optionDesc, { color: secondaryColor }]}>Foco e elegância</Text>
                        </View>
                    </View>
                    {isDarkTheme && <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary[500]} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.option,
                        !isDarkTheme && styles.selectedOption,
                        { backgroundColor: isDarkMode ? COLORS.gray[800] : COLORS.gray[50] }
                    ]}
                    onPress={setLightTheme}
                >
                    <View style={styles.optionContent}>
                        <View style={[styles.preview, { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray[200] }]} />
                        <View style={styles.optionText}>
                            <Text style={[styles.optionName, { color: textColor }]}>Light Sóbrio</Text>
                            <Text style={[styles.optionDesc, { color: secondaryColor }]}>Clareza e limpeza</Text>
                        </View>
                    </View>
                    {!isDarkTheme && <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary[500]} />}
                </TouchableOpacity>
            </View>
        </BaseBottomSheet>
    );
};

const styles = StyleSheet.create({
    description: {
        fontSize: FONT_SIZE.sm,
        marginBottom: SPACING.lg,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    switchInfo: {
        flex: 1,
    },
    label: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.semibold as any,
    },
    subLabel: {
        fontSize: FONT_SIZE.xs,
    },
    divider: {
        marginVertical: SPACING.lg,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold,
        marginBottom: SPACING.md,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedOption: {
        borderColor: COLORS.primary[500],
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    preview: {
        width: 40,
        height: 30,
        borderRadius: BORDER_RADIUS.sm,
        marginRight: SPACING.md,
    },
    optionText: {
        flex: 1,
    },
    optionName: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.semibold as any,
    },
    optionDesc: {
        fontSize: FONT_SIZE.xs,
    },
});

export default AppearanceModal;
