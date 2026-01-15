import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HelperText, TextInput, TouchableRipple, Text } from 'react-native-paper';
import ModernTextField from '@presentation/components/modern/ModernTextField';
import ModernButton from '@presentation/components/modern/ModernButton';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '@presentation/theme/designTokens';

interface LoginFormProps {
    email: string;
    setEmail: (text: string) => void;
    password: string;
    setPassword: (text: string) => void;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
    errors: any;
    loading: boolean;
    onLogin: () => void;
    onForgotPassword: () => void;
    getString: (key: string) => string;
    theme: any;
}

export const LoginForm = ({
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    errors,
    loading,
    onLogin,
    onForgotPassword,
    getString,
    theme
}: LoginFormProps) => {
    return (
        <View>
            <ModernTextField
                label={getString('email')}
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                error={!!errors.email}
                theme={theme}
            />
            {errors.email && <HelperText type="error" style={styles.errorText}>{errors.email}</HelperText>}

            <ModernTextField
                label={getString('password')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
                error={!!errors.password}
                theme={theme}
                right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
            />
            {errors.password && <HelperText type="error" style={styles.errorText}>{errors.password}</HelperText>}

            <ModernButton
                mode="contained"
                onPress={onLogin}
                style={styles.loginButton}
                loading={loading}
                disabled={loading}
                buttonColor={COLORS.primary[500]}
            >
                {getString('login')}
            </ModernButton>

            <View style={styles.forgotPasswordRow}>
                <TouchableRipple onPress={onForgotPassword}>
                    <Text style={[styles.forgotPasswordText, { color: COLORS.primary[500] }]}>
                        {getString('forgotPassword')}
                    </Text>
                </TouchableRipple>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        marginBottom: SPACING.md,
        backgroundColor: 'transparent',
    },
    errorText: {
        marginTop: -12,
        marginBottom: SPACING.md,
        marginLeft: SPACING.xs,
    },
    loginButton: {
        height: 56,
        borderRadius: BORDER_RADIUS.lg,
        marginTop: SPACING.sm,
        justifyContent: 'center',
    },
    forgotPasswordRow: {
        alignItems: 'center',
        marginTop: SPACING.md,
    },
    forgotPasswordText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '600',
    },
});
