import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, Button } from 'react-native-paper';
import { countries, getStatesByCountry } from '@data/countries';
import { COLORS, SPACING, FONT_SIZE } from '@presentation/theme/designTokens';

/**
 * Interface para um estado/província
 */
interface State {
    code: string;
    name: string;
}

/**
 * Interface para um país
 */
interface Country {
    code: string;
    name: string;
    phoneCode: string;
    states: State[];
}

/**
 * Propriedades para o componente CountryStatePicker
 */
interface CountryStatePickerProps {
    /** Código do país selecionado */
    selectedCountry: string;
    /** Código do estado selecionado */
    selectedState: string;
    /** Callback quando o país muda */
    onCountryChange: (code: string, name: string) => void;
    /** Callback quando o estado muda */
    onStateChange: (code: string, name: string) => void;
    /** Rótulo para o seletor de país */
    countryLabel?: string;
    /** Rótulo para o seletor de estado */
    stateLabel?: string;
}

/**
 * Componente para seleção combinada de País e Estado
 */
const CountryStatePicker: React.FC<CountryStatePickerProps> = ({
    selectedCountry,
    selectedState,
    onCountryChange,
    onStateChange,
    countryLabel = "País",
    stateLabel = "Estado/Região"
}) => {
    const [showCountryMenu, setShowCountryMenu] = useState(false);
    const [showStateMenu, setShowStateMenu] = useState(false);
    const [availableStates, setAvailableStates] = useState<State[]>([]);

    useEffect(() => {
        if (selectedCountry) {
            const states = getStatesByCountry(selectedCountry) as State[];
            setAvailableStates(states);

            // Se o estado selecionado não existe no novo país, limpar
            if (selectedState && !states.find(state => state.code === selectedState)) {
                onStateChange('', '');
            }
        } else {
            setAvailableStates([]);
        }
    }, [selectedCountry]);

    const handleCountrySelect = (country: Country) => {
        onCountryChange(country.code, country.name);
        setShowCountryMenu(false);
    };

    const handleStateSelect = (state: State) => {
        onStateChange(state.code, state.name);
        setShowStateMenu(false);
    };

    const selectedCountryData = (countries as Country[]).find(c => c.code === selectedCountry);
    const selectedStateData = availableStates.find(s => s.code === selectedState);

    return (
        <View style={styles.container}>
            {/* Seletor de País */}
            <Menu
                visible={showCountryMenu}
                onDismiss={() => setShowCountryMenu(false)}
                anchor={
                    <Button
                        mode="outlined"
                        onPress={() => setShowCountryMenu(true)}
                        style={styles.picker}
                        contentStyle={styles.pickerContent}
                    >
                        {selectedCountryData ? selectedCountryData.name : countryLabel}
                    </Button>
                }
                contentStyle={styles.menuContent}
            >
                {(countries as Country[]).map((country) => (
                    <Menu.Item
                        key={country.code}
                        onPress={() => handleCountrySelect(country)}
                        title={`${country.name} (${country.phoneCode})`}
                        titleStyle={styles.menuItemTitle}
                    />
                ))}
            </Menu>

            {/* Seletor de Estado */}
            {availableStates.length > 0 && (
                <Menu
                    visible={showStateMenu}
                    onDismiss={() => setShowStateMenu(false)}
                    anchor={
                        <Button
                            mode="outlined"
                            onPress={() => setShowStateMenu(true)}
                            style={[styles.picker as any, styles.statePicker]}
                            contentStyle={styles.pickerContent}
                            disabled={!selectedCountry}
                        >
                            {selectedStateData ? selectedStateData.name : stateLabel}
                        </Button>
                    }
                    contentStyle={styles.menuContent}
                >
                    {availableStates.map((state) => (
                        <Menu.Item
                            key={state.code}
                            onPress={() => handleStateSelect(state)}
                            title={state.name}
                            titleStyle={styles.menuItemTitle}
                        />
                    ))}
                </Menu>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    picker: {
        marginBottom: SPACING.sm,
        justifyContent: 'flex-start',
    } as any,
    statePicker: {
        marginTop: SPACING.xs,
    },
    pickerContent: {
        justifyContent: 'flex-start',
        paddingHorizontal: SPACING.md,
        height: 48,
    },
    menuContent: {
        maxHeight: 300,
        backgroundColor: COLORS.white,
    },
    menuItemTitle: {
        fontSize: FONT_SIZE.base,
    },
});

export default CountryStatePicker;
