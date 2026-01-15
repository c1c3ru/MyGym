import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Menu, TouchableRipple, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZE } from '@presentation/theme/designTokens';
import { hexToRgba } from '@shared/utils/colorUtils';

interface LoginSettingsProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    languageMenuVisible: boolean;
    setLanguageMenuVisible: (visible: boolean) => void;
    currentLanguage: string;
    languages: any;
    changeLanguage: (lang: string) => void;
}

export const LoginSettings = ({
    isDarkMode,
    toggleDarkMode,
    languageMenuVisible,
    setLanguageMenuVisible,
    currentLanguage,
    languages,
    changeLanguage
}: LoginSettingsProps) => {
    return (
        <View style={styles.settingsRow}>
            <View style={styles.settingItem}>
                <Menu
                    visible={languageMenuVisible}
                    onDismiss={() => setLanguageMenuVisible(false)}
                    anchor={
                        <TouchableRipple
                            style={[
                                styles.glassButton,
                                { backgroundColor: isDarkMode ? hexToRgba(COLORS.white, 0.05) : hexToRgba(COLORS.black, 0.03) }
                            ]}
                            onPress={() => setLanguageMenuVisible(true)}
                        >
                            <View style={styles.languageButtonContent}>
                                <Text style={styles.flagEmoji}>{languages[currentLanguage].flag}</Text>
                                <MaterialCommunityIcons
                                    name="chevron-down"
                                    size={16}
                                    color={isDarkMode ? COLORS.white : COLORS.black}
                                />
                            </View>
                        </TouchableRipple>
                    }
                >
                    {Object.keys(languages).map((langCode) => (
                        <Menu.Item
                            key={langCode}
                            onPress={() => {
                                changeLanguage(langCode);
                                setLanguageMenuVisible(false);
                            }}
                            title={`${languages[langCode].flag} ${languages[langCode].name}`}
                        />
                    ))}
                </Menu>
            </View>

            <View style={styles.settingItem}>
                <TouchableRipple
                    onPress={toggleDarkMode}
                    style={[
                        styles.glassButton,
                        { backgroundColor: isDarkMode ? hexToRgba(COLORS.white, 0.05) : hexToRgba(COLORS.black, 0.03) }
                    ]}
                >
                    <MaterialCommunityIcons
                        name={isDarkMode ? "weather-night" : "weather-sunny"}
                        size={20}
                        color={isDarkMode ? COLORS.primary[400] : COLORS.warning[500]}
                    />
                </TouchableRipple>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    settingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        zIndex: 10,
    },
    settingItem: {
        marginLeft: SPACING.sm,
    },
    glassButton: {
        width: 44,
        height: 44,
        borderRadius: BORDER_RADIUS.sm,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: hexToRgba(COLORS.white, 0.1),
    },
    languageButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flagEmoji: {
        fontSize: FONT_SIZE.md,
    },
});
