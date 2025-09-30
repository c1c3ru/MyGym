import React, { memo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Divider, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ActionButton, { ActionButtonGroup } from '@components/ActionButton';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';

const ClassListItem = memo(({ 
  classItem, 
  onPress, 
  onEdit, 
  onView,
  getString,
  index 
}) => {
  const handlePress = useCallback(() => {
    onPress?.(classItem);
  }, [classItem, onPress]);

  const handleEdit = useCallback(() => {
    onEdit?.(classItem);
  }, [classItem, onEdit]);

  const handleView = useCallback(() => {
    onView?.(classItem);
  }, [classItem, onView]);

  const formatSchedule = useCallback((classData) => {
    try {
      const schedule = classData?.schedule;
      if (Array.isArray(schedule) && schedule.length > 0) {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return schedule.map((s) => {
          const day = typeof s.dayOfWeek === 'number' ? days[s.dayOfWeek] : 'Dia';
          const hour = (s.hour ?? '').toString().padStart(2, '0');
          const minute = (s.minute ?? 0).toString().padStart(2, '0');
          return `${day} ${hour}:${minute}`;
        }).join(', ');
      }
      if (typeof schedule === 'string' && schedule.trim()) {
        return schedule.trim();
      }
      if (typeof classData?.scheduleText === 'string' && classData.scheduleText.trim()) {
        return classData.scheduleText.trim();
      }
      return getString('scheduleNotDefined');
    } catch (e) {
      return getString('scheduleNotDefined');
    }
  }, [getString]);

  const getCapacityColor = useCallback((current, max) => {
    if (!max) return COLORS.text.secondary;
    const percentage = (current / max) * 100;
    if (percentage >= 90) return COLORS.error[500];
    if (percentage >= 70) return COLORS.warning[500];
    return COLORS.primary[500];
  }, []);

  return (
    <Card style={styles.classCard}>
      <Card.Content>
        <View style={styles.classHeader}>
          <View style={styles.classInfo}>
            <Text style={styles.className}>{classItem.name}</Text>
            <Chip mode="outlined" style={styles.modalityChip}>
              {classItem.modality}
            </Chip>
          </View>
          
          <IconButton
            icon="dots-vertical"
            onPress={handlePress}
          />
        </View>

        <View style={styles.classDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color="COLORS.text.secondary" />
            <Text style={styles.detailText}>
              {getString('professor')}: {classItem.instructorName}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="COLORS.text.secondary" />
            <Text style={styles.detailText}>
              {formatSchedule(classItem)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color="COLORS.text.secondary" />
            <Text style={[
              styles.detailText,
              { color: getCapacityColor(classItem.currentStudents, classItem.maxCapacity) }
            ]}>
              {classItem.currentStudents}/{classItem.maxCapacity || 'N/A'} {getString('students')}
            </Text>
          </View>

          {classItem.location && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="COLORS.text.secondary" />
              <Text style={styles.detailText}>{classItem.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.statusRow}>
          <Chip 
            mode="outlined"
            style={[
              styles.statusChip,
              { borderColor: classItem.isActive !== false ? COLORS.primary[500] : COLORS.error[500] }
            ]}
            textStyle={{ 
              color: classItem.isActive !== false ? COLORS.primary[500] : COLORS.error[500],
              fontSize: FONT_SIZE.sm
            }}
          >
            {classItem.isActive !== false ? getString('active') : getString('inactive')}
          </Chip>

          {classItem.currentStudents >= (classItem.maxCapacity || 999) && (
            <Chip 
              mode="outlined"
              style={[styles.statusChip, { borderColor: COLORS.error[500] }]}
              textStyle={{ color: COLORS.error[500], fontSize: FONT_SIZE.sm }}
            >
              {getString('full')}
            </Chip>
          )}

          {!classItem.instructorId && (
            <Chip 
              mode="outlined"
              style={[styles.statusChip, { borderColor: COLORS.warning[500] }]}
              textStyle={{ color: COLORS.warning[500], fontSize: FONT_SIZE.sm }}
            >
              {getString('withoutInstructor')}
            </Chip>
          )}
        </View>

        <Divider style={styles.divider} />

        <ActionButtonGroup style={styles.classActions}>
          <ActionButton 
            mode="outlined" 
            onPress={handleView}
            style={styles.actionButton}
            icon="eye"
            variant="primary"
            size="small"
          >
            {getString('viewDetails')}
          </ActionButton>

          <ActionButton 
            mode="outlined" 
            onPress={handleEdit}
            style={styles.actionButton}
            icon="pencil"
            variant="warning"
            size="small"
          >
            {getString('edit')}
          </ActionButton>

          <ActionButton 
            mode="contained" 
            onPress={handlePress}
            style={styles.actionButton}
            icon="account"
            variant="success"
            size="small"
          >
            {getString('studentsTab')}
          </ActionButton>
        </ActionButtonGroup>
      </Card.Content>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.classItem.id === nextProps.classItem.id &&
    prevProps.classItem.name === nextProps.classItem.name &&
    prevProps.classItem.modality === nextProps.classItem.modality &&
    prevProps.classItem.instructorName === nextProps.classItem.instructorName &&
    prevProps.classItem.currentStudents === nextProps.classItem.currentStudents &&
    prevProps.classItem.maxCapacity === nextProps.classItem.maxCapacity &&
    prevProps.classItem.isActive === nextProps.classItem.isActive &&
    prevProps.classItem.instructorId === nextProps.classItem.instructorId &&
    prevProps.index === nextProps.index
  );
});

ClassListItem.displayName = 'ClassListItem';

const styles = StyleSheet.create({
  classCard: {
    margin: SPACING.base,
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  className: {
    fontSize: FONT_SIZE.lg,
    flex: 1,
  },
  modalityChip: {
    marginLeft: 8,
  },
  classDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    marginLeft: 8,
    color: COLORS.text.secondary,
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  statusChip: {
    borderWidth: 1,
    marginRight: 8,
    marginBottom: SPACING.xs,
  },
  divider: {
    marginVertical: 12,
  },
  classActions: {
    marginTop: SPACING.xs,
  },
  actionButton: {
    flex: 1,
  },
});

export default ClassListItem;
