import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Switch, List, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@contexts/ThemeContext';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '@presentation/theme/designTokens';
import BaseBottomSheet from './BaseBottomSheet';

interface PreferencesModalProps {
    visible: boolean;
    onDismiss: () => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({ visible, onDismiss }) => {
    const { isDarkMode, theme, getString } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [autoBackup, setAutoBackup] = useState(true);

    const textColor = isDarkMode ? COLORS.white : COLORS.black;
    const secondaryColor = isDarkMode ? COLORS.gray[400] : COLORS.gray[600];

    return (
        <BaseBottomSheet
            visible={visible}
            onDismiss={onDismiss}
            title={getString('preferences') || 'Preferências'}
            isDarkMode={isDarkMode}
            theme={theme}
        >
            <View>
                <List.Item
                    title={getString('notifications') || 'Notificações'}
                    description={getString('receivePushNotifications') || 'Receber notificações push'}
                    titleStyle={{ color: textColor, fontWeight: FONT_WEIGHT.semibold as any }}
                    descriptionStyle={{ color: secondaryColor }}
                    left={() => <Ionicons name="notifications" size={24} color={COLORS.primary[500]} />}
                    right={() => (
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            color={COLORS.primary[500]}
                        />
                    )}
                    style={styles.listItem}
                />

                <Divider style={[styles.divider, { backgroundColor: isDarkMode ? COLORS.gray[800] : COLORS.gray[200] }]} />

                <List.Item
                    title={getString('autoBackup') || 'Backup Automático'}
                    description={getString('autoBackupDescription') || 'Manter dados sincronizados'}
                    titleStyle={{ color: textColor, fontWeight: FONT_WEIGHT.semibold as any }}
                    descriptionStyle={{ color: secondaryColor }}
                    left={() => <Ionicons name="cloud-upload" size={24} color={COLORS.info[500]} />}
                    right={() => (
                        <Switch
                            value={autoBackup}
                            onValueChange={setAutoBackup}
                            color={COLORS.primary[500]}
                        />
                    )}
                    style={styles.listItem}
                />

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.primary[500]} />
                    <Text style={[styles.infoText, { color: secondaryColor }]}>
                        {getString('preferencesInfo') || 'Suas preferências são salvas localmente.'}
                    </Text>
                </View>
            </View>
        </BaseBottomSheet>
    );
};

const styles = StyleSheet.create({
    listItem: {
        paddingHorizontal: 0,
    },
    divider: {
        marginVertical: SPACING.sm,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xl,
        padding: SPACING.md,
        backgroundColor: hexToRgba(COLORS.primary[500], 0.05),
        borderRadius: 8,
        gap: SPACING.sm,
    },
    infoText: {
        fontSize: FONT_SIZE.xs,
        flex: 1,
    },
});

function hexToRgba(hex: string, opacity: number) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default PreferencesModal;
