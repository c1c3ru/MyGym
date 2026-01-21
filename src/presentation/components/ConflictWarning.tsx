import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import {
    Card,
    Text,
    Button,
    Chip,
    Divider
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@contexts/ThemeContext';
import { DAY_NAMES } from '@utils/scheduleUtils';
import { SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_WIDTH } from '@presentation/theme/designTokens';

/**
 * Interface para um dia conflitante
 */
interface DayConflict {
    day: keyof typeof DAY_NAMES;
    conflictingHours: string[];
}

/**
 * Interface para um conflito
 */
interface Conflict {
    className: string;
    modality: string;
    instructorName: string;
    conflictingDays: DayConflict[];
}

/**
 * Propriedades para o componente ConflictWarning
 */
interface ConflictWarningProps {
    /** Lista de conflitos detectados */
    conflicts?: Conflict[];
    /** Se o alerta está visível */
    visible?: boolean;
    /** Callback para fechar o alerta */
    onDismiss?: () => void;
    /** Callback para ver detalhes do conflito */
    onViewConflict?: (conflict: Conflict) => void;
    /** Estilo adicional */
    style?: StyleProp<ViewStyle>;
}

/**
 * Componente de alerta de conflito de horários
 */
const ConflictWarning: React.FC<ConflictWarningProps> = ({
    conflicts = [],
    visible = false,
    onDismiss,
    onViewConflict,
    style
}) => {
    const { colors } = useTheme() as any;

    if (!visible || conflicts.length === 0) {
        return null;
    }

    const renderConflictItem = (conflict: Conflict, index: number) => (
        <View key={index} style={styles.conflictItem}>
            <View style={styles.conflictHeader}>
                <View style={styles.conflictInfo}>
                    <Text style={[styles.conflictTitle, { color: colors.error }]}>
                        {conflict.className}
                    </Text>
                    <Text style={styles.conflictSubtitle}>
                        {conflict.modality} • {conflict.instructorName}
                    </Text>
                </View>
                {onViewConflict && (
                    <Button
                        mode="text"
                        compact
                        onPress={() => onViewConflict(conflict)}
                        textColor={colors.primary}
                    >
                        Ver Detalhes
                    </Button>
                )}
            </View>

            <View style={styles.conflictDays}>
                {conflict.conflictingDays.map((dayConflict, dayIndex) => (
                    <View key={dayIndex} style={styles.dayConflict}>
                        <Text style={styles.dayName}>
                            {DAY_NAMES[dayConflict.day]}:
                        </Text>
                        <View style={styles.hoursContainer}>
                            {dayConflict.conflictingHours.map((hour, hourIndex) => (
                                <Chip
                                    key={hourIndex}
                                    mode="flat"
                                    compact
                                    style={[styles.hourChip, { backgroundColor: colors.errorContainer }]}
                                    textStyle={{ color: colors.onErrorContainer, fontSize: FONT_SIZE.sm }}
                                >
                                    {hour}
                                </Chip>
                            ))}
                        </View>
                    </View>
                ))}
            </View>

            {index < conflicts.length - 1 && <Divider style={styles.divider} />}
        </View>
    );

    return (
        <Card style={[styles.container, { borderColor: colors.error }, style]}>
            <Card.Content>
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Ionicons
                            name="warning"
                            size={24}
                            color={colors.error}
                            style={styles.warningIcon}
                        />
                        <Text style={[styles.title, { color: colors.error }]}>
                            {conflicts.length === 1 ? 'Conflito Detectado' : `${conflicts.length} Conflitos Detectados`}
                        </Text>
                    </View>
                    {onDismiss && (
                        <Button
                            mode="text"
                            compact
                            onPress={onDismiss}
                            textColor={colors.onSurfaceVariant}
                        >
                            ✕
                        </Button>
                    )}
                </View>

                <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
                    {conflicts.length === 1
                        ? 'Existe uma turma com horário conflitante:'
                        : 'Existem turmas com horários conflitantes:'
                    }
                </Text>

                <View style={styles.conflictsList}>
                    {conflicts.map(renderConflictItem)}
                </View>

                <View style={styles.actions}>
                    <Text style={[styles.actionText, { color: colors.onSurfaceVariant }]}>
                        Ajuste os horários para evitar conflitos ou continue se for intencional.
                    </Text>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        borderWidth: BORDER_WIDTH.base,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    warningIcon: {
        marginRight: SPACING.sm,
    },
    title: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.semibold as any,
        flex: 1,
    },
    description: {
        fontSize: FONT_SIZE.base,
        marginBottom: SPACING.md,
        lineHeight: 20,
    },
    conflictsList: {
        marginBottom: SPACING.md,
    },
    conflictItem: {
        marginBottom: SPACING.sm,
    },
    conflictHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    conflictInfo: {
        flex: 1,
    },
    conflictTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.semibold as any,
        marginBottom: 2,
    },
    conflictSubtitle: {
        fontSize: FONT_SIZE.base,
        opacity: 0.7,
    },
    conflictDays: {
        marginTop: SPACING.sm,
    },
    dayConflict: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    dayName: {
        fontSize: FONT_SIZE.base,
        fontWeight: FONT_WEIGHT.medium as any,
        minWidth: 100,
    },
    hoursContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
    },
    hourChip: {
        marginRight: SPACING.xs,
        marginBottom: SPACING.xs,
        height: 24,
    },
    divider: {
        marginTop: SPACING.md,
        marginBottom: SPACING.sm,
    },
    actions: {
        marginTop: SPACING.sm,
    },
    actionText: {
        fontSize: FONT_SIZE.sm,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});

export default ConflictWarning;
