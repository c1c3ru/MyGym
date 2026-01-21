import React, { memo, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip, Divider, IconButton, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ActionButton from '@components/ActionButton';
import { COLORS, SPACING, FONT_SIZE } from '@presentation/theme/designTokens';
import { GlassCard } from '../modern';

const ClassListItem = memo(({
  classItem,
  onPress,
  onEdit,
  onView,
  getString,
  index
}) => {
  const theme = useTheme();
  const { colors } = theme;

  // Dynamic styles based on theme
  // removed card style override since we use GlassCard
  const dynamicStyles = useMemo(() => ({
    title: {
      color: colors.onSurface,
      fontWeight: 'bold',
      fontSize: FONT_SIZE.lg
    },
    textSecondary: {
      color: colors.onSurfaceVariant || colors.backdrop
    },
    iconColor: colors.primary
  }), [colors]);

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
        // Simple abbreviations
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
      return 'Horário a definir';
    } catch (e) {
      return 'Horário a definir';
    }
  }, []);

  const getCapacityColor = useCallback((current, max) => {
    if (!max) return colors.primary;
    const percentage = (current / max) * 100;
    if (percentage >= 90) return COLORS.error[500];
    if (percentage >= 70) return COLORS.warning[500];
    return colors.primary;
  }, [colors]);

  return (
    <GlassCard
      variant="card"
      style={styles.classCard}
      padding={16}
    >
      <View>
        <View style={styles.classHeader}>
          <View style={styles.classInfo}>
            <Text style={dynamicStyles.title} numberOfLines={1}>{classItem.name}</Text>
            <Chip
              mode="outlined"
              style={[styles.modalityChip, { borderColor: colors.primary, height: 28 }]}
              textStyle={{ color: colors.primary, fontSize: 11, marginVertical: 0, marginHorizontal: 8 }}
            >
              {classItem.modality}
            </Chip>
          </View>

          <IconButton
            icon="dots-vertical"
            onPress={handlePress}
            size={20}
            iconColor={colors.onSurface}
          />
        </View>

        <View style={styles.classDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color={dynamicStyles.textSecondary.color} />
            <Text style={[styles.detailText, { color: dynamicStyles.textSecondary.color }]} numberOfLines={1}>
              {classItem.instructorName || 'Instrutor indefinido'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={dynamicStyles.textSecondary.color} />
            <Text style={[styles.detailText, { color: dynamicStyles.textSecondary.color }]} numberOfLines={1}>
              {formatSchedule(classItem)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color={dynamicStyles.textSecondary.color} />
            <Text style={[
              styles.detailText,
              { color: getCapacityColor(classItem.currentStudents, classItem.maxCapacity), fontWeight: 'bold' }
            ]}>
              {classItem.currentStudents} / {classItem.maxCapacity || '∞'} Alunos
            </Text>
          </View>

          {classItem.location ? (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={dynamicStyles.textSecondary.color} />
              <Text style={[styles.detailText, { color: dynamicStyles.textSecondary.color }]} numberOfLines={1}>{classItem.location}</Text>
            </View>
          ) : null}
        </View>

        {/* Status in a more compact row */}
        <View style={styles.statusRow}>
          {!classItem.isActive && (
            <Chip
              compact
              style={[styles.statusChip, { backgroundColor: COLORS.error[50], borderColor: COLORS.error[500] }]}
              textStyle={{ color: COLORS.error[700], fontSize: 10 }}
            >
              Inativo
            </Chip>
          )}
          {classItem.currentStudents >= (classItem.maxCapacity || 999) && (
            <Chip
              compact
              style={[styles.statusChip, { backgroundColor: COLORS.warning[50], borderColor: COLORS.warning[500] }]}
              textStyle={{ color: COLORS.warning[700], fontSize: 10 }}
            >
              Lotado
            </Chip>
          )}
          {!classItem.instructorId && !classItem.instructorName && (
            <Chip
              compact
              style={[styles.statusChip, { backgroundColor: COLORS.info[50], borderColor: COLORS.info[500] }]}
              textStyle={{ color: COLORS.info[700], fontSize: 10 }}
            >
              Sem Instrutor
            </Chip>
          )}
        </View>

        <Divider style={{ marginVertical: 12, backgroundColor: colors.outlineVariant }} />

        <View style={styles.actionsContainer}>
          <ActionButton
            onPress={handleView}
            style={styles.actionButton}
            icon="eye"
            variant="ghost"
            size="small"
            label="Detalhes"
          />
          <ActionButton
            onPress={handleEdit}
            style={styles.actionButton}
            icon="pencil"
            variant="ghost"
            size="small"
            label="Editar"
          />
          <ActionButton
            onPress={handlePress}
            style={styles.actionButton}
            icon="account-group"
            variant="primary" // Highlight primary action
            size="small"
            label="Alunos"
          />
        </View>
      </View>
    </GlassCard>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.classItem.id === nextProps.classItem.id &&
    prevProps.classItem.name === nextProps.classItem.name &&
    prevProps.classItem.modality === nextProps.classItem.modality &&
    prevProps.classItem.instructorName === nextProps.classItem.instructorName &&
    prevProps.classItem.currentStudents === nextProps.classItem.currentStudents &&
    prevProps.classItem.maxCapacity === nextProps.classItem.maxCapacity &&
    prevProps.classItem.isActive === nextProps.classItem.isActive?.toString() &&
    prevProps.index === nextProps.index
  );
});

ClassListItem.displayName = 'ClassListItem';

const styles = StyleSheet.create({
  classCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  modalityChip: {
    marginLeft: SPACING.sm,
    backgroundColor: 'transparent',
    borderWidth: 1
  },
  classDetails: {
    marginBottom: SPACING.sm,
    paddingLeft: 2
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 8
  },
  statusChip: {
    borderWidth: 1,
    height: 24,
    alignItems: 'center'
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  actionButton: {
    flex: 1,
  },
});

export default ClassListItem;
