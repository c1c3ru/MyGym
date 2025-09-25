import React, { memo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Text, Avatar, Chip, Divider, IconButton, Menu } from 'react-native-paper';
import ActionButton, { ActionButtonGroup } from '@components/ActionButton';

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
              <Title style={styles.studentName}>{student.name}</Title>
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
                fontSize: 12 
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
          />
          <ActionButton
            title="Editar"
            icon="pencil"
            onPress={handleEdit}
            variant="primary"
          />
          <ActionButton
            title="Desassociar"
            icon="account-remove"
            onPress={handleDelete}
            variant="danger"
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
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: '#FF9800',
  },
  studentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  studentPhone: {
    fontSize: 12,
    color: '#999',
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
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statusChip: {
    height: 24,
  },
  divider: {
    marginVertical: 12,
  },
});

export default StudentListItem;
