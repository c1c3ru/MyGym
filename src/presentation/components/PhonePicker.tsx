import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Menu, Button } from 'react-native-paper';
import { useTheme } from '@contexts/ThemeContext';
import { countries } from '@data/countries';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '@presentation/theme/designTokens';

/**
 * Interface para um país
 */
interface Country {
    code: string;
    name: string;
    phoneCode: string;
}

/**
 * Propriedades para o componente PhonePicker
 */
interface PhonePickerProps {
    /** Código do país selecionado (ex: 'BR') */
    selectedCountry: string;
    /** Número de telefone (sem o código do país) */
    phoneNumber: string;
    /** Callback quando o telefone ou país muda */
    onPhoneChange: (countryCode: string, phoneNumber: string) => void;
    /** Rótulo para o campo de entrada */
    label?: string;
    /** Sugestão de preenchimento */
    placeholder?: string;
}

/**
 * Seletor de telefone com escolha de código de país e máscara básica
 */
const PhonePicker: React.FC<PhonePickerProps> = ({
    selectedCountry,
    phoneNumber,
    onPhoneChange,
    label,
    placeholder
}) => {
    const [showCountryMenu, setShowCountryMenu] = useState(false);
    const { getString } = useTheme() as any;

    const selectedCountryData = (countries as Country[]).find(c => c.code === selectedCountry) || (countries[0] as Country);

    const handleCountrySelect = (country: Country) => {
        onPhoneChange(country.code, phoneNumber);
        setShowCountryMenu(false);
    };

    const handlePhoneNumberChange = (number: string) => {
        // Remover caracteres não numéricos exceto espaços e hífens
        const cleanNumber = number.replace(/[^\d\s\-\(\)]/g, '');
        onPhoneChange(selectedCountry, cleanNumber);
    };

    return (
        <View style={styles.container}>
            <View style={styles.phoneContainer}>
                {/* Seletor de código do país */}
                <Menu
                    visible={showCountryMenu}
                    onDismiss={() => setShowCountryMenu(false)}
                    anchor={
                        <Button
                            mode="outlined"
                            onPress={() => setShowCountryMenu(true)}
                            style={styles.countryButton}
                            contentStyle={styles.countryButtonContent}
                            labelStyle={styles.countryButtonLabel as any}
                        >
                            {selectedCountryData.phoneCode}
                        </Button>
                    }
                    contentStyle={styles.menuContent}
                >
                    {(countries as Country[]).map((country) => (
                        <Menu.Item
                            key={country.code}
                            onPress={() => handleCountrySelect(country)}
                            title={`${country.name} ${country.phoneCode}`}
                            titleStyle={styles.menuItemTitle}
                        />
                    ))}
                </Menu>

                {/* Campo de número */}
                <TextInput
                    label={label}
                    value={phoneNumber}
                    onChangeText={handlePhoneNumberChange}
                    mode="outlined"
                    style={styles.phoneInput}
                    placeholder={placeholder}
                    keyboardType="phone-pad"
                    maxLength={20}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    phoneContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-end',
    },
    countryButton: {
        minWidth: 80,
        height: 56,
        justifyContent: 'center',
    },
    countryButtonContent: {
        height: 56,
        justifyContent: 'center',
    },
    countryButtonLabel: {
        fontSize: FONT_SIZE.base,
        fontWeight: FONT_WEIGHT.semibold as any,
    },
    phoneInput: {
        flex: 1,
    },
    menuContent: {
        maxHeight: 300,
        backgroundColor: COLORS.white,
    },
    menuItemTitle: {
        fontSize: FONT_SIZE.base,
    },
});

export default PhonePicker;
