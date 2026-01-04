import React, { useState } from 'react';
import { View, StyleSheet, TextInputProps as RNTextInputProps } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { formatters } from '@utils/validation';
import { COLORS, SPACING, FONT_SIZE } from '@presentation/theme/designTokens';

/**
 * Propriedades para o componente FormInput
 */
interface FormInputProps extends Omit<RNTextInputProps, 'onChangeText'> {
    /** Rótulo do campo */
    label: string;
    /** Valor atual do campo */
    value: string;
    /** Callback para alteração de texto */
    onChangeText: (text: string) => void;
    /** Mensagem de erro */
    error?: string | null;
    /** Indica se o campo foi tocado (interagido) */
    touched?: boolean;
    /** Callback para o evento blur */
    onBlur?: () => void;
    /** Nome do formatador a ser aplicado no texto */
    formatter?: keyof typeof formatters;
    /** Limite máximo de caracteres */
    maxLength?: number;
}

/**
 * Componente de entrada de texto padronizado para formulários com suporte a formatação e validação
 */
const FormInput: React.FC<FormInputProps> = ({
    label,
    value,
    onChangeText,
    error,
    touched,
    onBlur,
    formatter,
    maxLength,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleChangeText = (text: string) => {
        let formattedText = text;

        // Aplicar formatação se especificada
        if (formatter && formatters[formatter]) {
            formattedText = formatters[formatter](text);
        }

        // Aplicar limite de caracteres
        if (maxLength && formattedText.length > maxLength) {
            formattedText = formattedText.substring(0, maxLength);
        }

        onChangeText(formattedText);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (onBlur) onBlur();
    };

    const hasError = !!(touched && error);

    return (
        <View style={styles.container}>
            <TextInput
                label={label}
                value={value}
                onChangeText={handleChangeText}
                onFocus={handleFocus}
                onBlur={handleBlur}
                mode="outlined"
                error={hasError}
                style={[
                    styles.input,
                    hasError && styles.inputError,
                    isFocused && styles.inputFocused
                ]}
                theme={{
                    colors: {
                        primary: hasError ? COLORS.error[500] : COLORS.info[500],
                        error: COLORS.error[500]
                    }
                }}
                {...(props as any)}
            />

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
    input: {
        backgroundColor: COLORS.white,
    },
    inputError: {
        borderColor: COLORS.error[500],
    },
    inputFocused: {
        borderWidth: 2,
    },
    errorText: {
        fontSize: FONT_SIZE.sm,
        marginTop: SPACING.xs,
    },
});

export default FormInput;
