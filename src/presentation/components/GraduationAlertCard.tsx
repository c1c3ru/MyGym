import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
    Card,
    Chip,
    Avatar,
    Text,
    Button,
    Surface
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { getBeltColor } from '@shared/constants/colors';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getString } from "@utils/theme";

/**
 * Interface para um alerta de graduação
 */
export interface GraduationAlert {
    id: string;
    studentId: string;
    studentName: string;
    modality: string;
    currentBelt: string;
    nextBelt: string;
    alertLevel: 'ready' | 'warning' | 'info';
    isEligible: boolean;
    daysUntilEligible: number;
    trainingStartDate: string | Date;
    minimumTrainingDays: number;
    classesCompleted?: number;
    minimumClasses?: number;
}

/**
 * Propriedades para o componente GraduationAlertCard
 */
interface GraduationAlertCardProps {
    /** Objeto de alerta de graduação */
    alert: GraduationAlert;
    /** Callback para visualizar detalhes */
    onViewDetails?: (alert: GraduationAlert) => void;
    /** Callback para agendar exame */
    onScheduleExam?: (alert: GraduationAlert) => void;
    /** Se deve mostrar botões de ação */
    showActions?: boolean;
    /** Modo compacto */
    compact?: boolean;
}

/**
 * Card para exibir alertas de elegibilidade para graduação de alunos
 */
const GraduationAlertCard: React.FC<GraduationAlertCardProps> = ({
    alert,
    onViewDetails,
    onScheduleExam,
    showActions = true,
    compact = false
}) => {
    const getAlertLevelColor = (level: string) => {
        switch (level) {
            case 'ready':
                return COLORS.success[500];
            case 'warning':
                return COLORS.warning[500];
            case 'info':
                return COLORS.info[500];
            default:
                return COLORS.gray[300];
        }
    };

    const getAlertLevelText = (level: string) => {
        const texts: Record<string, string> = {
            'ready': 'Pronto para Graduação',
            'warning': 'Próximo da Graduação',
            'info': 'Em Progresso'
        };
        return texts[level] || 'Status Desconhecido';
    };

    const getAlertIcon = (level: string) => {
        const icons: Record<string, string> = {
            'ready': 'trophy',
            'warning': 'time',
            'info': 'information-circle'
        };
        return (icons[level] || 'help-circle') as any;
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const getDaysText = (days: number) => {
        if (days === 0) return getString('today');
        if (days === 1) return '1 dia';
        if (days < 30) return `${days} dias`;

        const months = Math.floor(days / 30);
        const remainingDays = days % 30;

        if (months === 1 && remainingDays === 0) return '1 mês';
        if (remainingDays === 0) return `${months} meses`;
        if (months === 1) return `1 mês e ${remainingDays} dias`;

        return `${months} meses e ${remainingDays} dias`;
    };

    if (compact) {
        return (
            <Surface style={styles.compactCard}>
                <View style={styles.compactContent}>
                    <Avatar.Text
                        size={36}
                        label={alert.studentName.charAt(0)}
                        style={{ backgroundColor: getBeltColor(alert.currentBelt) }}
                    />

                    <View style={styles.compactInfo}>
                        <Text style={styles.compactName}>{alert.studentName}</Text>
                        <Text style={styles.compactModality}>{alert.modality}</Text>

                        <View style={styles.compactBelts}>
                            <Chip style={[styles.compactBelt, { backgroundColor: getBeltColor(alert.currentBelt) }]}>
                                {alert.currentBelt}
                            </Chip>
                            <Ionicons name="arrow-forward" size={12} color={COLORS.gray[600]} style={{ marginHorizontal: 4 }} />
                            <Chip style={[styles.compactBelt, { backgroundColor: getBeltColor(alert.nextBelt) }]}>
                                {alert.nextBelt}
                            </Chip>
                        </View>
                    </View>

                    <View style={styles.compactStatus}>
                        <Chip
                            icon={getAlertIcon(alert.alertLevel)}
                            style={[styles.compactStatusChip, { backgroundColor: getAlertLevelColor(alert.alertLevel) }]}
                            compact
                        >
                            {alert.isEligible ? 'Pronto' : getDaysText(alert.daysUntilEligible)}
                        </Chip>
                    </View>
                </View>
            </Surface>
        );
    }

    return (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.header}>
                    <View style={styles.studentInfo}>
                        <Avatar.Text
                            size={48}
                            label={alert.studentName.charAt(0)}
                            style={{ backgroundColor: getBeltColor(alert.currentBelt) }}
                        />

                        <View style={styles.studentDetails}>
                            <Text style={styles.studentName}>{alert.studentName}</Text>
                            <Text style={styles.modality}>{alert.modality}</Text>
                        </View>
                    </View>

                    <Chip
                        icon={getAlertIcon(alert.alertLevel)}
                        style={[styles.alertChip, { backgroundColor: getAlertLevelColor(alert.alertLevel) }]}
                    >
                        {getAlertLevelText(alert.alertLevel)}
                    </Chip>
                </View>

                <View style={styles.progression}>
                    <View style={styles.beltProgression}>
                        <View style={styles.currentBelt}>
                            <Text style={styles.beltLabel}>Atual</Text>
                            <Chip
                                style={[styles.beltChip, { backgroundColor: getBeltColor(alert.currentBelt) }]}
                            >
                                {alert.currentBelt}
                            </Chip>
                        </View>

                        <Ionicons name="arrow-forward" size={24} color={COLORS.gray[600]} style={styles.arrow} />

                        <View style={styles.nextBelt}>
                            <Text style={styles.beltLabel}>Próxima</Text>
                            <Chip
                                style={[styles.beltChip, { backgroundColor: getBeltColor(alert.nextBelt) }]}
                            >
                                {alert.nextBelt}
                            </Chip>
                        </View>
                    </View>
                </View>

                <View style={styles.details}>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar" size={16} color={COLORS.gray[600]} />
                        <Text style={styles.detailText}>
                            Início do treinamento: {formatDate(alert.trainingStartDate)}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="time" size={16} color={COLORS.gray[600]} />
                        <Text style={styles.detailText}>
                            Tempo mínimo: {Math.floor(alert.minimumTrainingDays / 30)} meses
                        </Text>
                    </View>

                    {alert.minimumClasses && (
                        <View style={styles.detailRow}>
                            <Ionicons name="library" size={16} color={COLORS.gray[600]} />
                            <Text style={styles.detailText}>
                                Aulas: {alert.classesCompleted || 0}/{alert.minimumClasses}
                            </Text>
                        </View>
                    )}

                    {!alert.isEligible && (
                        <View style={styles.detailRow}>
                            <Ionicons name="hourglass" size={16} color={COLORS.gray[600]} />
                            <Text style={styles.detailText}>
                                Elegível em: {getDaysText(alert.daysUntilEligible)}
                            </Text>
                        </View>
                    )}

                    {alert.isEligible && (
                        <View style={styles.detailRow}>
                            <Ionicons name="checkmark-circle" size={16} color={COLORS.success[500]} />
                            <Text style={[styles.detailText, { color: COLORS.success[500], fontWeight: FONT_WEIGHT.bold as any }]}>
                                Elegível para graduação!
                            </Text>
                        </View>
                    )}
                </View>

                {showActions && (
                    <View style={styles.actions}>
                        <Button
                            mode="outlined"
                            onPress={() => onViewDetails?.(alert)}
                            style={styles.actionButton}
                        >
                            Ver Detalhes
                        </Button>

                        {alert.isEligible && onScheduleExam && (
                            <Button
                                mode="contained"
                                onPress={() => onScheduleExam(alert)}
                                style={styles.actionButton}
                                icon="calendar-plus"
                            >
                                Agendar Exame
                            </Button>
                        )}
                    </View>
                )}
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: SPACING.sm,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    studentDetails: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    studentName: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold as any,
        marginBottom: SPACING.xs,
    },
    modality: {
        fontSize: FONT_SIZE.base,
        color: COLORS.gray[600],
    },
    alertChip: {
        paddingHorizontal: SPACING.sm,
    },
    progression: {
        marginBottom: SPACING.md,
    },
    beltProgression: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: COLORS.gray[50],
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    currentBelt: {
        alignItems: 'center',
    },
    nextBelt: {
        alignItems: 'center',
    },
    beltLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray[600],
        marginBottom: SPACING.sm,
    },
    beltChip: {
        paddingHorizontal: SPACING.md,
    },
    arrow: {
        marginHorizontal: SPACING.md,
    },
    details: {
        marginBottom: SPACING.md,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    detailText: {
        marginLeft: SPACING.sm,
        fontSize: FONT_SIZE.base,
        color: COLORS.black,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        marginHorizontal: SPACING.xs,
    },
    // Compact styles
    compactCard: {
        marginVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.md,
        elevation: 1,
    },
    compactContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
    },
    compactInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    compactName: {
        fontSize: FONT_SIZE.base,
        fontWeight: FONT_WEIGHT.bold as any,
    },
    compactModality: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.gray[600],
        marginBottom: SPACING.xs,
    },
    compactBelts: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    compactBelt: {
        paddingHorizontal: SPACING.xs,
    },
    compactStatus: {
        alignItems: 'center',
    },
    compactStatusChip: {
        paddingHorizontal: SPACING.sm,
    },
});

export default GraduationAlertCard;
