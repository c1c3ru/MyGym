import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Chip, Card, ActivityIndicator } from 'react-native-paper';
import useAuthMigration from '@hooks/useAuthMigration';
import academyCollectionsService from '@infrastructure/services/academyCollectionsService';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import { useTheme } from "@contexts/ThemeContext";

/**
 * Interface para representar uma modalidade (ex: Jiu-Jitsu, Muay Thai)
 */
interface Modality {
    id: string;
    name: string;
    description?: string;
}

/**
 * Propriedades para o componente ModalityPicker
 */
interface ModalityPickerProps {
    /** Lista de IDs de modalidades selecionadas */
    selectedModalities?: string[];
    /** Callback quando a seleção muda */
    onModalitiesChange: (modalities: string[]) => void;
    /** Rótulo para o seletor */
    label?: string;
}

/**
 * Seletor de modalidades com carregamento do Firestore e suporte a múltiplas seleções
 */
const ModalityPicker: React.FC<ModalityPickerProps> = ({
    selectedModalities = [],
    onModalitiesChange,
    label = "Modalidades Oferecidas"
}) => {
    const { getString } = useTheme();
    const { currentTheme } = useThemeToggle();
    const [availableModalities, setAvailableModalities] = useState<Modality[]>([]);
    const [loading, setLoading] = useState(true);
    const { userProfile } = useAuthMigration() as any;

    useEffect(() => {
        if (userProfile?.academiaId) {
            loadModalities();
        } else {
            // Se não tem academiaId, definir loading como false para mostrar fallback se necessário
            setLoading(false);
        }
    }, [userProfile?.academiaId]);

    const loadModalities = async () => {
        try {
            setLoading(true);

            if (!userProfile?.academiaId) {
                throw new Error(getString('userNotAssociated'));
            }

            const modalities = await (academyCollectionsService as any).getModalities(userProfile.academiaId);

            // Remover duplicatas baseado no ID e nome
            const uniqueModalities = (modalities as Modality[]).filter((modality, index, self) =>
                index === self.findIndex(m => m.id === modality.id || m.name === modality.name)
            );

            if (uniqueModalities.length === 0) {
                setDefaultModalities();
            } else {
                setAvailableModalities(uniqueModalities);
            }
        } catch (error) {
            console.error('❌ ModalityPicker: Erro ao carregar modalidades:', error);
            setDefaultModalities();
        } finally {
            setLoading(false);
        }
    };

    const setDefaultModalities = () => {
        setAvailableModalities([
            { id: 'bjj', name: 'Jiu-Jitsu Brasileiro', description: getString('brazilianMartialArt') },
            { id: 'muaythai', name: getString('muayThai'), description: getString('thaiMartialArt') },
            { id: 'boxe', name: getString('boxing'), description: 'Esporte de combate' },
            { id: 'mma', name: getString('mma'), description: 'Artes marciais mistas' },
            { id: 'judo', name: getString('judo'), description: getString('japaneseMartialArt') },
            { id: 'karate', name: getString('karate'), description: getString('japaneseMartialArt') },
            { id: 'taekwondo', name: getString('taekwondo'), description: getString('koreanMartialArt') },
            { id: 'capoeira', name: 'Capoeira', description: getString('brazilianMartialArt') }
        ]);
    };

    const handleModalityToggle = (modalityId: string) => {
        const isSelected = selectedModalities.includes(modalityId);
        let newSelection: string[];

        if (isSelected) {
            newSelection = selectedModalities.filter(id => id !== modalityId);
        } else {
            newSelection = [...selectedModalities, modalityId];
        }

        if (onModalitiesChange && typeof onModalitiesChange === 'function') {
            onModalitiesChange(newSelection);
        }
    };

    const getModalityName = (modalityId: string) => {
        const modality = availableModalities.find(m => m.id === modalityId);
        return modality ? modality.name : modalityId;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" />
                <Text style={styles.loadingText}>Carregando modalidades...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={styles.label}>
                {label}
            </Text>

            <Card style={[styles.card, { backgroundColor: currentTheme.background.paper }]}>
                <Card.Content>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={true}
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        bounces={false}
                        decelerationRate="fast"
                        snapToInterval={120}
                        snapToAlignment="start"
                    >
                        <View style={styles.chipsContainer}>
                            {availableModalities.map((modality, index) => (
                                <Chip
                                    key={modality.id}
                                    mode={selectedModalities.includes(modality.id) ? 'flat' : 'outlined'}
                                    selected={selectedModalities.includes(modality.id)}
                                    onPress={() => handleModalityToggle(modality.id)}
                                    style={[
                                        styles.chip,
                                        { backgroundColor: currentTheme.background.elevated },
                                        selectedModalities.includes(modality.id) && { backgroundColor: currentTheme.primary[500] },
                                        index === availableModalities.length - 1 && styles.lastChip
                                    ]}
                                    textStyle={[
                                        styles.chipText,
                                        selectedModalities.includes(modality.id) && styles.selectedChipText
                                    ]}
                                >
                                    {modality.name}
                                </Chip>
                            ))}
                        </View>
                    </ScrollView>

                    {selectedModalities.length > 0 && (
                        <View style={styles.selectedContainer}>
                            <Text variant="bodySmall" style={styles.selectedLabel}>
                                Selecionadas ({selectedModalities.length}):
                            </Text>
                            <View style={styles.selectedChips}>
                                {selectedModalities.map((modalityId) => (
                                    <Chip
                                        key={modalityId}
                                        mode="flat"
                                        selected
                                        onClose={() => handleModalityToggle(modalityId)}
                                    >
                                        {getModalityName(modalityId)}
                                    </Chip>
                                ))}
                            </View>
                        </View>
                    )}

                    {selectedModalities.length === 0 && (
                        <Text variant="bodySmall" style={styles.emptyText}>
                            Selecione as modalidades que sua academia oferece
                        </Text>
                    )}
                </Card.Content>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        marginBottom: SPACING.sm,
        fontWeight: FONT_WEIGHT.semibold as any,
    },
    card: {
        backgroundColor: COLORS.white,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
    },
    loadingText: {
        marginLeft: SPACING.sm,
        color: COLORS.gray[500],
    },
    scrollView: {
        marginBottom: SPACING.md,
        maxHeight: 60,
    },
    scrollContent: {
        paddingRight: 20,
        paddingLeft: SPACING.xs,
    },
    chipsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minHeight: 50,
    },
    chip: {
        marginRight: 10,
        backgroundColor: COLORS.white,
        minWidth: 100,
        justifyContent: 'center',
    },
    lastChip: {
        marginRight: 20,
    },
    selectedChip: {
        backgroundColor: COLORS.primary[500],
    },
    chipText: {
        fontSize: FONT_SIZE.base,
    },
    selectedChipText: {
        color: COLORS.white,
        fontWeight: FONT_WEIGHT.semibold as any,
    },
    selectedContainer: {
        marginTop: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray[300],
    },
    selectedLabel: {
        marginBottom: SPACING.sm,
        color: COLORS.gray[500],
        fontWeight: FONT_WEIGHT.semibold as any,
    },
    selectedChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.gray[500],
        fontStyle: 'italic',
        marginTop: SPACING.sm,
    },
});

export default ModalityPicker;
