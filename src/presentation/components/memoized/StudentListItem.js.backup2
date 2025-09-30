import React, { memo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, Chip, Divider, IconButton, Menu } from 'react-native-paper';
import ActionButton, { ActionButtonGroup } from '@components/ActionButton';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const StudentListItem = memo(({ 
  student, 
  onPress, 
  onEdit, 
  onDelete, 
  onView,
  index 
}) => {
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
    <Card style={styles.studentCard}>
      <Card.Content>
        <View style={styles.studentHeader}>
          <View style={styles.studentInfo}>
            <Avatar.Text 
              size={50} 
              label={student.name?.charAt(0) || 'A'} 
              style={styles.avatar}
            />
            <View style={styles.studentDetails}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentEmail}>{student.email}</Text>
              <Text style={styles.studentPhone}>
                {student.phone || 'Telefone não informado'}
              </Text>
            </View>
          </View>
          
          <IconButton
            icon="dots-vertical"
            onPress={handlePress}
          />
        </View>

        <View style={styles.studentStats}>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>Status</Text>
            <Chip 
              mode="outlined"
              style={[
                styles.statusChip,
                { backgroundColor: student.isActive ? '#E8F5E8' : '#FFEBEE' }
              ]}
              textStyle={{ 
                color: student.isActive ? '#2E7D32' : '#C62828',
                fontSize: FONT_SIZE.sm 
              }}
            >
              {student.isActive ? 'Ativo' : 'Inativo'}
            </Chip>
          </View>
          
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>Graduação</Text>
            <Text style={styles.statValue}>
              {student.currentGraduation || 'Iniciante'}
            </Text>
          </View>
          
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>Modalidades</Text>
            <Text style={styles.statValue}>
              {student.modalities?.length || 0}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />
        
        <ActionButtonGroup>
          <ActionButton
            title="Ver Detalhes"
            icon="eye"
            onPress={handleView}
            variant="outline"
            size="small"
          />
          <ActionButton
            title="Editar"
            icon="pencil"
            onPress={handleEdit}
            variant="primary"
            size="small"
          />
          <ActionButton
            title="Desassociar"
            icon="account-remove"
            onPress={handleDelete}
            variant="danger"
            size="small"
          />
        </ActionButtonGroup>
      </Card.Content>
    </Card>
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
  studentCard: {
    marginVertical: 8,
    elevation: 2,
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
    backgroundColor: 'COLORS.warning[500]',
  },
  studentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: FONT_SIZE.md,
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: FONT_SIZE.sm,
    color: 'COLORS.text.secondary',
    marginBottom: 2,
  },
  studentPhone: {
    fontSize: FONT_SIZE.sm,
    color: 'COLORS.gray[500]',
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
    color: 'COLORS.text.secondary',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: 'COLORS.text.primary',
  },
  statusChip: {
    height: 24,
  },
  divider: {
    marginVertical: 12,
  },
});

export default StudentListItem;
