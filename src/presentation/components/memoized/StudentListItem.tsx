import React, { memo, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar, Chip, Divider, IconButton, useTheme } from 'react-native-paper';
import ActionButton from '../ActionButton';
import { COLORS, SPACING, FONT_SIZE } from '@presentation/theme/designTokens';
import { Student } from '../../types/student';
import { GlassCard } from '../modern';

/**
 * Propriedades para o componente StudentListItem
 */
interface StudentListItemProps {
    /** Objeto do estudante */
    student: Student;
    /** Callback ao pressionar para selecionar/ver menu */
    onPress?: (student: Student) => void;
    /** Callback para editar */
    onEdit?: (student: Student) => void;
    /** Callback para deletar/desassociar */
    onDelete?: (student: Student) => void;
    /** Callback para visualizar detalhes */
    onView?: (student: Student) => void;
    /** Índice na lista para otimização */
    index?: number;
}

const StudentListItem = memo<StudentListItemProps>(({
    student,
    onPress,
    onEdit,
    onDelete,
    onView,
    index
}) => {
    const theme = useTheme();
    const { colors, getString } = theme as any; // Cast to any to access getString if not in types

    // Dynamic styles based on theme
    const dynamicStyles = useMemo(() => ({
        // Card style removed as GlassCard handles it
        title: {
            color: colors.onSurface,
            fontWeight: 'bold' as const,
            fontSize: FONT_SIZE.md
        },
        textSecondary: {
            color: colors.onSurfaceVariant || colors.backdrop
        },
        avatar: {
            backgroundColor: colors.primaryContainer,
            borderWidth: 1,
            borderColor: colors.primary
        },
        avatarText: {
            color: colors.onPrimaryContainer,
            fontWeight: 'bold' as const
        }
    }), [colors]);


    const handlePress = useCallback(() => {
        onPress?.(student);
    }, [student, onPress]);

    const handleEdit = useCallback(() => {
        onEdit?.(student);
    }, [student, onEdit]);

    const handleDelete = useCallback(() => {
        onDelete?.(student);
    }, [student, onDelete]);

    const handleView = useCallback(() => {
        onView?.(student);
    }, [student, onView]);

    // Helpers para status
    const isSuspended = student.status === 'suspended';
    const isInactive = student.status === 'inactive' || (!student.status && !student.isActive);
    const isActive = !isSuspended && !isInactive;

    const statusLabel = isSuspended ? (getString?.('suspended') || 'Suspenso') :
        isInactive ? (getString?.('inactive') || 'Inativo') :
            (getString?.('active') || 'Ativo');

    const statusColor = isSuspended ? COLORS.error[500] :
        isInactive ? COLORS.gray[500] :
            COLORS.success[500];

    const statusBg = isSuspended ? COLORS.error[50] :
        isInactive ? COLORS.gray[50] :
            COLORS.success[50];

    // Graduação
    const graduationLabel = student.currentGraduation ? (getString?.(student.currentGraduation) || student.currentGraduation) : (getString?.('beginner') || 'Iniciante');

    return (
        <GlassCard
            variant="card"
            style={styles.card}
            padding={SPACING.md}
        >
            <View>
                <View style={styles.header}>
                    <View style={styles.infoRow}>
                        <Avatar.Text
                            size={44}
                            label={student.name?.charAt(0) || 'A'}
                            style={dynamicStyles.avatar}
                            labelStyle={dynamicStyles.avatarText}
                        />
                        <View style={styles.details}>
                            <Text style={dynamicStyles.title} numberOfLines={1}>{student.name}</Text>
                            <Text style={[styles.email, { color: dynamicStyles.textSecondary.color }]} numberOfLines={1}>{student.email}</Text>
                            <Text style={[styles.phone, { color: dynamicStyles.textSecondary.color }]} numberOfLines={1}>
                                {student.phone || (getString?.('phoneNotInformed') || 'Telefone não informado')}
                            </Text>
                        </View>
                    </View>

                    <IconButton
                        icon="dots-vertical"
                        onPress={handlePress}
                        size={20}
                        iconColor={colors.onSurface}
                    />
                </View>

                {/* Stats Row Compact */}
                <View style={styles.statsRow}>
                    <Chip
                        compact
                        style={[styles.statusChip, { backgroundColor: statusBg, borderColor: statusColor }]}
                        textStyle={{ color: statusColor, fontSize: 10, fontWeight: 'bold' }}
                    >
                        {statusLabel}
                    </Chip>

                    <View style={{ width: 1, backgroundColor: colors.outlineVariant, height: 20 }} />

                    <View style={styles.miniStat}>
                        <Text style={{ fontSize: 10, color: dynamicStyles.textSecondary.color }}>Graduação</Text>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.onSurface }}>{graduationLabel}</Text>
                    </View>

                    <View style={{ width: 1, backgroundColor: colors.outlineVariant, height: 20 }} />

                    <View style={styles.miniStat}>
                        <Text style={{ fontSize: 10, color: dynamicStyles.textSecondary.color }}>Modalidades</Text>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.onSurface }}>{student.modalities?.length || 0}</Text>
                    </View>
                </View>

                {/* Info about plan (New) */}
                {student.currentPlan && (
                    <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 11, color: dynamicStyles.textSecondary.color, marginRight: 4 }}>Plano:</Text>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.primary }}>{student.currentPlan}</Text>
                    </View>
                )}


                <Divider style={{ marginVertical: 12, backgroundColor: colors.outlineVariant }} />

                <View style={styles.actionsContainer}>
                    <ActionButton
                        onPress={handleView}
                        style={styles.actionButton}
                        icon="eye"
                        variant="ghost"
                        size="small"
                    >
                        {getString?.('viewDetails') || 'Detalhes'}
                    </ActionButton>
                    <ActionButton
                        onPress={handleEdit}
                        style={styles.actionButton}
                        icon="pencil"
                        variant="ghost"
                        size="small"
                    >
                        {getString?.('edit') || 'Editar'}
                    </ActionButton>
                    <ActionButton
                        onPress={handleDelete}
                        style={styles.actionButton}
                        icon="account-remove"
                        variant="danger"
                        mode="text"
                        size="small"
                    >
                        {getString?.('disassociate') || 'Remover'}
                    </ActionButton>
                </View>
            </View>
        </GlassCard>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.student.id === nextProps.student.id &&
        prevProps.student.name === nextProps.student.name &&
        prevProps.student.email === nextProps.student.email &&
        prevProps.student.phone === nextProps.student.phone &&
        prevProps.student.isActive === nextProps.student.isActive &&
        prevProps.student.status === nextProps.student.status &&
        prevProps.student.currentPlan === nextProps.student.currentPlan &&
        prevProps.student.currentGraduation === nextProps.student.currentGraduation &&
        prevProps.student.modalities?.length === nextProps.student.modalities?.length &&
        prevProps.index === nextProps.index
    );
});

StudentListItem.displayName = 'StudentListItem';

const styles = StyleSheet.create({
    card: {
        marginVertical: 4,
        marginHorizontal: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingTop: 4
    },
    details: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    email: {
        fontSize: FONT_SIZE.sm,
        marginBottom: 2,
    },
    phone: {
        fontSize: FONT_SIZE.xs,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 12
    },
    statusChip: {
        borderWidth: 1,
        height: 24,
        alignItems: 'center'
    },
    miniStat: {
        alignItems: 'flex-start'
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8
    },
    actionButton: {
        flex: 1,
    }
});

export default StudentListItem;
