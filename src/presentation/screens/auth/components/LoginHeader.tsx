import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_WEIGHT, FONT_SIZE, BORDER_RADIUS, SPACING } from '@presentation/theme/designTokens';

interface LoginHeaderProps {
    isDarkMode: boolean;
    welcomeMessage: string;
}

export const LoginHeader = ({ isDarkMode, welcomeMessage }: LoginHeaderProps) => {
    return (
        <View style={styles.header}>
            <View style={styles.logoContainer}>
                <LinearGradient
                    colors={[COLORS.primary[500], COLORS.primary[700]]}
                    style={styles.logoGradient}
                >
                    <MaterialCommunityIcons name="dumbbell" size={40} color={COLORS.white} />
                </LinearGradient>
            </View>
            <Text style={[styles.headerTitle, { color: isDarkMode ? COLORS.white : COLORS.black }]}>
                My<Text style={{ color: COLORS.primary[500], fontWeight: 'bold' }}>Gym</Text>
            </Text>
            <Text style={[styles.headerSubtitle, { color: isDarkMode ? COLORS.gray[400] : COLORS.gray[600] }]}>
                {welcomeMessage}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 15,
    },
    logoContainer: {
        marginBottom: 20,
        elevation: 8,
        shadowColor: COLORS.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    logoGradient: {
        width: 80,
        height: 80,
        borderRadius: BORDER_RADIUS.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: FONT_WEIGHT.extrabold as any, // Keeping 'as any' for now, or remove if token fix confirmed
        marginBottom: SPACING.sm,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: FONT_SIZE.base,
        opacity: 0.8,
    },
});
