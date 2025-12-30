import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Menu, Button, HelperText, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';

/**
 * Interface para as opções do seletor
 */
export interface FormSelectOption {
    label: string;
    value: any;
}

/**
 * Propriedades para o componente FormSelect
 */
interface FormSelectProps {
    /** Rótulo do campo */
    label?: string;
    /** Valor atualmente selecionado */
    value: any;
    /** Callback executado ao selecionar uma opção */
    onSelect: (value: any) => void;
    /** Lista de opções disponíveis */
    options?: FormSelectOption[];
    /** Mensagem de erro */
    error?: string | null;
    /** Indica se o campo foi tocado */
    touched?: boolean;
    /** Texto a ser exibido quando nada está selecionado */
    placeholder?: string;
    /** Indica se o campo está desabilitado */
    disabled?: boolean;
    /** Estilo adicional para o container */
    style?: StyleProp<ViewStyle>;
}

/**
 * Componente de seleção customizado para formulários utilizando o Menu da react-native-paper
 */
const FormSelect: React.FC<FormSelectProps> = ({
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
    const { currentTheme } = useThemeToggle();
    const [visible, setVisible] = useState(false);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const handleSelect = (selectedValue: any) => {
        onSelect(selectedValue);
        closeMenu();
    };

    const getDisplayValue = () => {
        if (!value) return placeholder || 'Selecione uma opção'; // Fallback manual pois useTheme() retornou erro estrutural anteriormente
        const option = options.find(opt => opt.value === value);
        return option ? option.label : value;
    };

    const hasError = !!(touched && error);

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
                                color={hasError ? COLORS.error[500] : COLORS.text.secondary}
                            />
                        )}
                    >
                        {getDisplayValue()}
                    </Button>
                }
            >
                {options.map((option) => (
                    <Menu.Item
                        key={option.value.toString()}
                        onPress={() => handleSelect(option.value)}
                        title={option.label}
                        titleStyle={value === option.value ? styles.selectedOption : undefined}
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
        backgroundColor: COLORS.white,
        borderColor: COLORS.gray[300],
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
        fontWeight: 'bold',
        color: COLORS.info[500],
    },
    errorText: {
        fontSize: FONT_SIZE.sm,
        marginTop: SPACING.xs,
    },
});

export default FormSelect;
