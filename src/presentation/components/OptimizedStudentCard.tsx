import { getString } from "@utils/theme";
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
    Card,
    Avatar,
    Chip,
    Divider,
    Text,
    IconButton
} from 'react-native-paper';
import ActionButton, { ActionButtonGroup } from './ActionButton';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { Student } from '../types/student';

/**
 * Propriedades para o componente OptimizedStudentCard
 */
interface OptimizedStudentCardProps {
    /** Objeto do estudante */
    student: Student;
    /** Callback ao pressionar para ver detalhes ou menu */
    onStudentPress: (student: Student) => void;
    /** Callback para editar o estudante */
    onEditStudent: (student: Student) => void;
    /** Callback para desassociar o estudante */
    onDisassociateStudent: (student: Student) => void;
    /** Callback para navegar para pagamentos */
    onNavigateToPayments: (studentId: string) => void;
}

/**
 * Card de estudante otimizado com Actions e informações de status
 */
const OptimizedStudentCard = memo<OptimizedStudentCardProps>(({
    student,
    onStudentPress,
    onEditStudent,
    onDisassociateStudent,
    onNavigateToPayments
}) => {
    const getPaymentStatusColor = (status?: string) => {
        switch (status) {
            case 'paid': return COLORS.primary[500];
            case 'pending': return COLORS.warning[500];
            case 'overdue': return COLORS.error[500];
            default: return COLORS.gray[500];
        }
    };

    const getPaymentStatusText = (status?: string) => {
        switch (status) {
            case 'paid': return getString('paymentUpToDate');
            case 'pending': return getString('paymentPending');
            case 'overdue': return getString('overdue');
            default: return getString('notAvailable');
        }
    };

    return (
        <Card style={styles.studentCard} accessible={true} accessibilityLabel={`Aluno ${student.name}`}>
            <Card.Content>
                <View style={styles.studentHeader}>
                    <View style={styles.studentInfo}>
                        <Avatar.Text
                            size={50}
                            label={student.name?.charAt(0) || 'A'}
                            style={styles.avatar}
                            accessible={true}
                            accessibilityLabel={`Avatar de ${student.name}`}
                        />
                        <View style={styles.studentDetails}>
                            <Text style={styles.studentName} accessibilityRole="header">
                                {student.name}
                            </Text>
                            <Text style={styles.studentEmail} accessible={true}>
                                {student.email}
                            </Text>
                            <Text style={styles.studentPhone} accessible={true}>
                                {student.phone || getString('phoneNotInformed')}
                            </Text>
                        </View>
                    </View>

                    <IconButton
                        icon="dots-vertical"
                        onPress={() => onStudentPress(student)}
                        accessible={true}
                        accessibilityLabel="Mais opções para este aluno"
                        accessibilityHint="Toque para ver mais opções"
                    />
                </View>

                <View style={styles.studentStats}>
                    <View style={styles.statColumn}>
                        <Text style={styles.statLabel}>Status</Text>
                        <Chip
                            mode="outlined"
                            style={[
                                styles.statusChip,
                                { borderColor: student.isActive !== false ? COLORS.primary[500] : COLORS.error[500] }
                            ]}
                            textStyle={{
                                color: student.isActive !== false ? COLORS.primary[500] : COLORS.error[500],
                                fontSize: FONT_SIZE.sm
                            }}
                            accessible={true}
                            accessibilityLabel={`Status: ${student.isActive !== false ? getString('active') : getString('inactive')}`}
                        >
                            {student.isActive !== false ? getString('active') : getString('inactive')}
                        </Chip>
                    </View>

                    <View style={styles.statColumn}>
                        <Text style={styles.statLabel}>{getString('payment')}</Text>
                        <Chip
                            mode="outlined"
                            style={[
                                styles.statusChip,
                                { borderColor: getPaymentStatusColor(student.paymentStatus) }
                            ]}
                            textStyle={{
                                color: getPaymentStatusColor(student.paymentStatus),
                                fontSize: FONT_SIZE.sm
                            }}
                            accessible={true}
                            accessibilityLabel={`Status do pagamento: ${getPaymentStatusText(student.paymentStatus)}`}
                        >
                            {getPaymentStatusText(student.paymentStatus)}
                        </Chip>
                    </View>

                    <View style={styles.statColumn}>
                        <Text style={styles.statLabel}>{getString('graduation')}</Text>
                        <Text style={styles.graduationText} accessible={true}>
                            {student.currentGraduation || getString('beginner')}
                        </Text>
                    </View>
                </View>

                <View style={styles.additionalInfo}>
                    <Text style={styles.infoText} accessible={true}>
                        Plano: {student.currentPlan || getString('notDefined')}
                    </Text>
                    <Text style={styles.infoText} accessible={true}>
                        Total de pagamentos: {student.totalPayments}
                    </Text>
                    {student.lastPaymentDate && (
                        <Text style={styles.infoText} accessible={true}>
                            Último pagamento: {new Date(student.lastPaymentDate.seconds * 1000).toLocaleDateString('pt-BR')}
                        </Text>
                    )}
                </View>

                <Divider style={styles.divider} />

                <ActionButtonGroup style={styles.studentActions}>
                    <ActionButton
                        mode="outlined"
                        onPress={() => onStudentPress(student)}
                        style={styles.actionButton}
                        icon="eye"
                        variant="outline"
                        size="small"
                        accessible={true}
                        accessibilityLabel="Ver perfil do aluno"
                    >
                        Ver Perfil
                    </ActionButton>

                    <ActionButton
                        mode="outlined"
                        onPress={() => onEditStudent(student)}
                        style={styles.actionButton}
                        icon="pencil"
                        variant="primary"
                        size="small"
                        accessible={true}
                        accessibilityLabel="Editar dados do aluno"
                    >{getString('edit')}</ActionButton>

                    <ActionButton
                        mode="outlined"
                        onPress={() => onNavigateToPayments(student.id)}
                        style={styles.actionButton}
                        icon="cash"
                        variant="success"
                        size="small"
                        accessible={true}
                        accessibilityLabel="Ver pagamentos do aluno"
                    >{getString('payments')}</ActionButton>
                </ActionButtonGroup>

                <View style={styles.adminActions}>
                    <ActionButton
                        mode="outlined"
                        onPress={() => onDisassociateStudent(student)}
                        style={styles.actionButton}
                        icon="account-remove"
                        variant="danger"
                        size="small"
                        accessible={true}
                        accessibilityLabel="Desassociar aluno da academia"
                        accessibilityHint="Esta ação remove o aluno da academia"
                    >
                        Desassociar
                    </ActionButton>
                </View>
            </Card.Content>
        </Card>
    );
});

OptimizedStudentCard.displayName = 'OptimizedStudentCard';

const styles = StyleSheet.create({
    studentCard: {
        marginHorizontal: 16,
        marginVertical: 8,
        elevation: 2,
        borderRadius: BORDER_RADIUS.md,
    },
    studentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.base,
    },
    studentInfo: {
        flexDirection: 'row',
        flex: 1,
    },
    avatar: {
        backgroundColor: COLORS.info[500],
        marginRight: SPACING.md,
    },
    studentDetails: {
        flex: 1,
    },
    studentName: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold as any,
        marginBottom: SPACING.xs,
        color: COLORS.text.primary,
    },
    studentEmail: {
        fontSize: FONT_SIZE.base,
        color: COLORS.text.secondary,
        marginBottom: 2,
    },
    studentPhone: {
        fontSize: FONT_SIZE.base,
        color: COLORS.text.secondary,
    },
    studentStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
        backgroundColor: COLORS.background.light,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
    },
    statColumn: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text.secondary,
        marginBottom: SPACING.xs,
        fontWeight: FONT_WEIGHT.medium as any,
    },
    statusChip: {
        height: 28,
    },
    graduationText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.bold as any,
        color: COLORS.text.primary,
    },
    additionalInfo: {
        backgroundColor: COLORS.background.light,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    infoText: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text.secondary,
        marginBottom: 2,
    },
    divider: {
        marginVertical: 8,
    },
    studentActions: {
        marginBottom: SPACING.sm,
    },
    actionButton: {
        marginHorizontal: 4,
    },
    adminActions: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
});

export default OptimizedStudentCard;
