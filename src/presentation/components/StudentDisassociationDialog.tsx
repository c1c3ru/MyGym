import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useTheme as useThemeContext } from '@contexts/ThemeContext';
import {
    Dialog,
    Button,
    Text,
    TextInput,
    Divider,
    Chip
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { useCustomClaims } from '@hooks/useCustomClaims';
import { useNotification } from '@contexts/NotificationContext';
import { firestoreService } from '@infrastructure/services/firestoreService';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getString } from '@utils/theme';
import { Student } from '@presentation/types/student';

/**
 * Propriedades para o componente StudentDisassociationDialog
 */
interface StudentDisassociationDialogProps {
    /** Se o diálogo está visível */
    visible: boolean;
    /** Callback para fechar o diálogo */
    onDismiss: () => void;
    /** Objeto do aluno a ser desassociado */
    student: Student | null;
    /** Callback em caso de sucesso */
    onSuccess: () => void;
}

/**
 * Diálogo para confirmar e processar a desassociação de um aluno da academia
 */
const StudentDisassociationDialog: React.FC<StudentDisassociationDialogProps> = ({
    visible,
    onDismiss,
    student,
    onSuccess
}) => {
    const { user, userProfile, academia } = useAuthFacade();
    const { isAdminOrInstructor } = useCustomClaims() as any;
    const { showSuccess, showError } = useNotification() as any;
    const { getString: themeGetString } = useThemeContext() as any;
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    // Verificar se o usuário tem permissão para desassociar alunos
    const canDisassociateStudent = () => {
        return isAdminOrInstructor();
    };

    const handleDisassociation = async () => {
        if (!canDisassociateStudent()) {
            showError('Você não tem permissão para desassociar alunos');
            return;
        }

        if (!reason.trim()) {
            showError('Por favor, informe o motivo da desassociação');
            return;
        }

        if (!student) return;

        Alert.alert(
            'Confirmar Desassociação',
            `Tem certeza que deseja desassociar ${student.name} da academia?\n\nEsta ação não pode ser desfeita.`,
            [
                { text: getString('cancel'), style: 'cancel' },
                { text: getString('confirm'), style: 'destructive', onPress: performDisassociation }
            ]
        );
    };

    const performDisassociation = async () => {
        if (!student || !academia || !user) return;

        try {
            setLoading(true);

            // Atualizar status do usuário para inativo
            await (firestoreService as any).update(`gyms/${academia.id}/users`, student.id, {
                status: 'inactive',
                disassociatedAt: new Date(),
                disassociatedBy: user.id,
                disassociationReason: reason,
                updatedAt: new Date()
            });

            // Cancelar pagamentos pendentes
            const pendingPayments = await (firestoreService as any).getDocuments(
                `gyms/${academia.id}/payments`,
                [
                    { field: 'userId', operator: '==', value: student.id },
                    { field: 'status', operator: '==', value: 'pending' }
                ]
            );

            const cancelPaymentPromises = pendingPayments.map((payment: any) =>
                (firestoreService as any).update(`gyms/${academia.id}/payments`, payment.id, {
                    status: 'cancelled',
                    cancelledAt: new Date(),
                    cancelledBy: user.id,
                    cancellationReason: 'Aluno desassociado da academia'
                })
            );

            await Promise.all(cancelPaymentPromises);

            // Registrar log da desassociação
            await (firestoreService as any).create(`gyms/${academia.id}/logs`, {
                type: 'student_disassociation',
                userId: student.id,
                performedBy: user.id,
                performedByName: userProfile?.name || 'Administrador',
                studentName: student.name,
                reason: reason,
                timestamp: new Date(),
                details: {
                    cancelledPayments: pendingPayments.length,
                    academiaId: academia.id,
                    academiaName: academia.name
                }
            });

            // Notificar administradores sobre a desassociação
            await notifyAdminsAboutDisassociation(student, reason);

            showSuccess(`${student.name} foi desassociado da academia`);
            onSuccess();
            onDismiss();
            setReason('');

        } catch (error) {
            console.error('Erro ao desassociar aluno:', error);
            showError('Erro ao desassociar aluno da academia');
        } finally {
            setLoading(false);
        }
    };

    const notifyAdminsAboutDisassociation = async (student: Student, reason: string) => {
        if (!academia || !user) return;

        try {
            // Buscar todos os administradores
            const admins = await (firestoreService as any).getDocuments(
                `gyms/${academia.id}/users`,
                [{ field: 'role', operator: '==', value: 'admin' }]
            );

            // Criar notificação para cada administrador (exceto quem executou a ação)
            const notificationPromises = (admins as any[])
                .filter(admin => admin.id !== user.id)
                .map(admin =>
                    (firestoreService as any).create(`gyms/${academia.id}/notifications`, {
                        userId: admin.id,
                        type: 'student_disassociation',
                        title: 'Aluno Desassociado',
                        message: `${userProfile?.name || 'Um administrador'} desassociou ${student.name} da academia`,
                        data: {
                            studentId: student.id,
                            studentName: student.name,
                            performedBy: user.id,
                            performedByName: userProfile?.name || 'Administrador',
                            reason: reason,
                            academiaId: academia.id
                        },
                        read: false,
                        priority: 'high'
                    })
                );

            await Promise.all(notificationPromises);
        } catch (error) {
            console.error('Erro ao notificar administradores:', error);
        }
    };

    if (!canDisassociateStudent()) {
        return null;
    }

    return (
        <PortalWrapper>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>
                    <View style={styles.titleContainer}>
                        <Ionicons name="person-remove-outline" size={24} color={COLORS.error[500]} />
                        <Text style={styles.titleText}>Desassociar Aluno</Text>
                    </View>
                </Dialog.Title>

                <Dialog.Content>
                    <View style={styles.studentInfo}>
                        <Text style={styles.label}>Aluno:</Text>
                        <Chip mode="outlined" style={styles.studentChip}>
                            {student?.name}
                        </Chip>
                    </View>

                    <View style={styles.studentInfo}>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.studentEmail}>{student?.email}</Text>
                    </View>

                    <Divider style={styles.divider} />

                    <TextInput
                        label={getString('disassociationReason')}
                        value={reason}
                        onChangeText={setReason}
                        mode="outlined"
                        multiline
                        numberOfLines={3}
                        placeholder={getString('disassociationReasonPlaceholder')}
                        style={styles.reasonInput}
                    />

                    <Text style={styles.warningText}>
                        ⚠️ Esta ação irá:
                    </Text>
                    <Text style={styles.warningItem}>• Inativar o aluno na academia</Text>
                    <Text style={styles.warningItem}>• Cancelar pagamentos pendentes</Text>
                    <Text style={styles.warningItem}>• Registrar log da operação</Text>
                    <Text style={styles.warningItem}>• Notificar administradores</Text>
                </Dialog.Content>

                <Dialog.Actions>
                    <Button
                        onPress={onDismiss}
                        disabled={loading}
                    >
                        {getString('cancel')}
                    </Button>
                    <Button
                        mode="contained"
                        onPress={handleDisassociation}
                        loading={loading}
                        disabled={loading || !reason.trim()}
                        buttonColor={COLORS.error[500]}
                    >
                        {getString('delete')}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </PortalWrapper>
    );
};

// Helper para evitar erro de Portal se necessário em alguns contextos
const PortalWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Em alguns casos o Dialog precisa estar dentro de um Portal da react-native-paper
    return <>{children}</>;
};

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleText: {
        marginLeft: 8,
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold as any,
        color: COLORS.error[500],
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    label: {
        fontSize: FONT_SIZE.md,
        fontWeight: FONT_WEIGHT.bold as any,
        marginRight: 8,
        minWidth: 60,
    },
    studentChip: {
        borderColor: COLORS.info[500],
    },
    studentEmail: {
        fontSize: FONT_SIZE.md,
        color: COLORS.text.secondary,
    },
    divider: {
        marginVertical: 16,
    },
    reasonInput: {
        marginBottom: 16,
    },
    warningText: {
        fontSize: FONT_SIZE.base,
        fontWeight: FONT_WEIGHT.bold as any,
        color: COLORS.error[500],
        marginBottom: SPACING.sm,
    },
    warningItem: {
        fontSize: FONT_SIZE.base,
        color: COLORS.text.secondary,
        marginLeft: 16,
        marginBottom: SPACING.xs,
    },
});

export default StudentDisassociationDialog;
