import React, { memo, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Card, Text, Avatar, Chip, Divider, IconButton } from 'react-native-paper';
import ActionButton, { ActionButtonGroup } from '../ActionButton';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT, GLASS } from '@presentation/theme/designTokens';
import { Student } from '../../types/student';
import { useTheme } from '@contexts/ThemeContext';

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
    const { getString } = useTheme();

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

    return (
        <View style={styles.glassCard}>
            <View style={styles.cardContent}>
                <View style={styles.studentHeader}>
                    <View style={styles.studentInfo}>
                        <Avatar.Text
                            size={50}
                            label={student.name?.charAt(0) || 'A'}
                            style={styles.avatar}
                            labelStyle={{ color: COLORS.white, fontWeight: 'bold' }}
                        />
                        <View style={styles.studentDetails}>
                            <Text style={styles.studentName}>{student.name}</Text>
                            <Text style={styles.studentEmail}>{student.email}</Text>
                            <Text style={styles.studentPhone}>
                                {student.phone || getString('phoneNotInformed')}
                            </Text>
                        </View>
                    </View>

                    <IconButton
                        icon="dots-vertical"
                        onPress={handlePress}
                        iconColor={COLORS.text.secondary}
                    />
                </View>

                <View style={styles.studentStats}>
                    <View style={styles.statColumn}>
                        <Text style={styles.statLabel}>{getString('status')}</Text>
                        <Chip
                            mode="outlined"
                            style={[
                                styles.statusChip,
                                {
                                    backgroundColor:
                                        student.status === 'suspended' ? 'rgba(211, 47, 47, 0.1)' : // Error with opacity
                                            (student.status === 'inactive' || (!student.status && !student.isActive)) ? 'rgba(117, 117, 117, 0.1)' : // Gray with opacity
                                                'rgba(76, 175, 80, 0.1)', // Success with opacity
                                    borderColor:
                                        student.status === 'suspended' ? COLORS.error[500] :
                                            (student.status === 'inactive' || (!student.status && !student.isActive)) ? COLORS.gray[500] :
                                                COLORS.success[500]
                                }
                            ]}
                            textStyle={{
                                color:
                                    student.status === 'suspended' ? COLORS.error[300] :
                                        (student.status === 'inactive' || (!student.status && !student.isActive)) ? COLORS.gray[400] :
                                            COLORS.success[300],
                                fontSize: FONT_SIZE.sm
                            }}
                        >
                            {
                                student.status === 'suspended' ? getString('suspended') :
                                    (student.status === 'inactive' || (!student.status && !student.isActive)) ? getString('inactive') :
                                        getString('active')
                            }
                        </Chip>
                    </View>

                    <View style={styles.statColumn}>
                        <Text style={styles.statLabel}>{getString('graduation')}</Text>
                        <Text style={styles.statValue}>
                            {student.currentGraduation ? getString(student.currentGraduation) : getString('beginner')}
                        </Text>
                    </View>

                    <View style={styles.statColumn}>
                        <Text style={styles.statLabel}>{getString('modalities')}</Text>
                        <Text style={styles.statValue}>
                            {student.modalities?.length || 0}
                        </Text>
                    </View>
                </View>

                <Divider style={styles.divider} />

                <ActionButtonGroup style={styles.actionButtonsContainer}>
                    <ActionButton
                        icon="eye"
                        onPress={handleView}
                        variant="outline"
                        mode="outlined"
                        size="small"
                        style={styles.actionButton}
                    >
                        {getString('viewDetails')}
                    </ActionButton>
                    <ActionButton
                        icon="pencil"
                        onPress={handleEdit}
                        variant="primary"
                        mode="outlined"
                        size="small"
                        style={styles.actionButton}
                    >
                        {getString('edit')}
                    </ActionButton>
                    <ActionButton
                        icon="account-remove"
                        onPress={handleDelete}
                        variant="danger"
                        mode="outlined"
                        size="small"
                        style={styles.actionButton}
                    >
                        {getString('disassociate')}
                    </ActionButton>
                </ActionButtonGroup>
            </View>
        </View>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function for better performance
    return (
        prevProps.student.id === nextProps.student.id &&
        prevProps.student.name === nextProps.student.name &&
        prevProps.student.email === nextProps.student.email &&
        prevProps.student.phone === nextProps.student.phone &&
        prevProps.student.isActive === nextProps.student.isActive &&
        prevProps.student.currentGraduation === nextProps.student.currentGraduation &&
        prevProps.student.modalities?.length === nextProps.student.modalities?.length &&
        prevProps.index === nextProps.index
    );
});

StudentListItem.displayName = 'StudentListItem';

const styles = StyleSheet.create({
    glassCard: {
        marginVertical: 8,
        backgroundColor: GLASS.premium.backgroundColor,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: GLASS.premium.borderColor,
        ...Platform.select({
            ios: {
                shadowColor: GLASS.premium.shadowColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: `0 8px 32px 0 ${GLASS.premium.shadowColor}`,
                backdropFilter: GLASS.premium.backdropFilter,
            },
        }),
    },
    cardContent: {
        padding: SPACING.md,
    },
    studentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        backgroundColor: COLORS.primary[700],
        borderWidth: 2,
        borderColor: COLORS.border.accent,
    },
    studentDetails: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    studentName: {
        fontSize: FONT_SIZE.md,
        marginBottom: 2,
        color: COLORS.text.primary,
        fontWeight: FONT_WEIGHT.bold as any,
    },
    studentEmail: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text.secondary,
        marginBottom: 2,
    },
    studentPhone: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text.tertiary,
    },
    studentStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 12,
    },
    statColumn: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text.tertiary,
        marginBottom: SPACING.xs,
    },
    statValue: {
        fontSize: FONT_SIZE.base,
        fontWeight: FONT_WEIGHT.bold as any,
        color: COLORS.text.primary,
    },
    statusChip: {
        height: 24,
    },
    divider: {
        marginVertical: SPACING.md,
        backgroundColor: COLORS.border.subtle,
    },
    actionButtonsContainer: {
        marginTop: SPACING.sm,
    },
    actionButton: {
        flex: 1,
        minWidth: 0,
    },
});

export default StudentListItem;
