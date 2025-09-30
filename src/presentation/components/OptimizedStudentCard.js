import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Avatar,
  Chip,
  Divider,
  Text,
  IconButton
} from 'react-native-paper';
import ActionButton, { ActionButtonGroup } from './ActionButton';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const OptimizedStudentCard = memo(({ 
  student, 
  onStudentPress, 
  onEditStudent, 
  onDisassociateStudent, 
  onNavigateToPayments 
}) => {
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'COLORS.primary[500]';
      case 'pending': return 'COLORS.warning[500]';
      case 'overdue': return 'COLORS.error[500]';
      default: return COLORS.gray[500];
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Em dia';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Atrasado';
      default: return 'N/A';
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
              <Title style={styles.studentName} accessibilityRole="header">
                {student.name}
              </Title>
              <Text style={styles.studentEmail} accessible={true}>
                {student.email}
              </Text>
              <Text style={styles.studentPhone} accessible={true}>
                {student.phone || 'Telefone não informado'}
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
                { borderColor: student.isActive !== false ? 'COLORS.primary[500]' : 'COLORS.error[500]' }
              ]}
              textStyle={{ 
                color: student.isActive !== false ? 'COLORS.primary[500]' : 'COLORS.error[500]',
                fontSize: FONT_SIZE.sm
              }}
              accessible={true}
              accessibilityLabel={`Status: ${student.isActive !== false ? 'Ativo' : 'Inativo'}`}
            >
              {student.isActive !== false ? 'Ativo' : 'Inativo'}
            </Chip>
          </View>

          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>Pagamento</Text>
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
            <Text style={styles.statLabel}>Graduação</Text>
            <Text style={styles.graduationText} accessible={true}>
              {student.currentGraduation || 'Iniciante'}
            </Text>
          </View>
        </View>

        <View style={styles.additionalInfo}>
          <Text style={styles.infoText} accessible={true}>
            Plano: {student.currentPlan || 'Não definido'}
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
            variant="primary"
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
            variant="warning"
            size="small"
            accessible={true}
            accessibilityLabel="Editar dados do aluno"
          >
            Editar
          </ActionButton>

          <ActionButton 
            mode="contained" 
            onPress={() => onNavigateToPayments(student.id)}
            style={styles.actionButton}
            icon="cash"
            variant="success"
            size="small"
            accessible={true}
            accessibilityLabel="Ver pagamentos do aluno"
          >
            Pagamentos
          </ActionButton>
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
    marginBottom: 16,
  },
  studentInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    backgroundColor: 'COLORS.info[500]',
    marginRight: 12,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.xs,
    color: 'COLORS.text.primary',
  },
  studentEmail: {
    fontSize: FONT_SIZE.base,
    color: 'COLORS.text.secondary',
    marginBottom: 2,
  },
  studentPhone: {
    fontSize: FONT_SIZE.base,
    color: 'COLORS.text.secondary',
  },
  studentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    backgroundColor: 'COLORS.background.light',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: 'COLORS.text.secondary',
    marginBottom: SPACING.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  statusChip: {
    height: 28,
  },
  graduationText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: 'COLORS.text.primary',
  },
  additionalInfo: {
    backgroundColor: 'COLORS.background.light',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  infoText: {
    fontSize: FONT_SIZE.sm,
    color: 'COLORS.text.secondary',
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