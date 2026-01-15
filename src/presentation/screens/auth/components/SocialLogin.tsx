import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TouchableRipple, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZE } from '@presentation/theme/designTokens';
import { hexToRgba } from '@shared/utils/colorUtils';

interface SocialLoginProps {
    isDarkMode: boolean;
    onGoogleLogin: () => void;
    onFacebookLogin: () => void;
    onAppleLogin: () => void;
    getString: (key: string) => string;
}

export const SocialLogin = ({
    isDarkMode,
    onGoogleLogin,
    onFacebookLogin,
    onAppleLogin,
    getString
}: SocialLoginProps) => {
    return (
        <View>
            <View style={styles.dividerRow}>
                <View style={[styles.line, { backgroundColor: isDarkMode ? hexToRgba(COLORS.white, 0.1) : hexToRgba(COLORS.black, 0.1) }]} />
                <Text style={[styles.dividerText, { color: isDarkMode ? COLORS.gray[500] : COLORS.gray[400] }]}>
                    {getString('orLoginWith')}
                </Text>
                <View style={[styles.line, { backgroundColor: isDarkMode ? hexToRgba(COLORS.white, 0.1) : hexToRgba(COLORS.black, 0.1) }]} />
            </View>

            <View style={styles.socialRow}>
                <TouchableRipple
                    onPress={onGoogleLogin}
                    style={[
                        styles.socialIconBtn,
                        {
                            backgroundColor: isDarkMode ? hexToRgba(COLORS.white, 0.05) : COLORS.white,
                            borderColor: isDarkMode ? hexToRgba(COLORS.white, 0.1) : COLORS.gray[200]
                        }
                    ]}
                >
                    <MaterialCommunityIcons name="google" size={24} color={COLORS.social.google} />
                </TouchableRipple>

                <TouchableRipple
                    onPress={onFacebookLogin}
                    style={[
                        styles.socialIconBtn,
                        {
                            backgroundColor: isDarkMode ? hexToRgba(COLORS.white, 0.05) : COLORS.white,
                            borderColor: isDarkMode ? hexToRgba(COLORS.white, 0.1) : COLORS.gray[200]
                        }
                    ]}
                >
                    <MaterialCommunityIcons name="facebook" size={24} color={COLORS.social.facebook} />
                </TouchableRipple>

                <TouchableRipple
                    onPress={onAppleLogin}
                    style={[
                        styles.socialIconBtn,
                        {
                            backgroundColor: isDarkMode ? hexToRgba(COLORS.white, 0.05) : COLORS.white,
                            borderColor: isDarkMode ? hexToRgba(COLORS.white, 0.1) : COLORS.gray[200]
                        }
                    ]}
                >
                    <MaterialCommunityIcons name="apple" size={24} color={isDarkMode ? COLORS.white : COLORS.black} />
                </TouchableRipple>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
    },
    line: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: FONT_SIZE.sm,
        fontWeight: '500', // Using string literal to avoid needing import or 'as any'
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.md,
    },
    socialIconBtn: {
        width: 64,
        height: 64,
        borderRadius: BORDER_RADIUS.xs,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
});
