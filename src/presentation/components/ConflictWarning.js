import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, Chip, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@contexts/ThemeContext';
import { DAY_NAMES } from '@utils/scheduleUtils';

const ConflictWarning = ({
  conflicts = [],
  visible = false,
  onDismiss,
  onViewConflict,
  style
}) => {
  const { colors } = useTheme();

  if (!visible || conflicts.length === 0) {
    return null;
  }

  const renderConflictItem = (conflict, index) => (
    <View key={index} style={styles.conflictItem}>
      <View style={styles.conflictHeader}>
        <View style={styles.conflictInfo}>
          <Text style={[styles.conflictTitle, { color: colors.error }]}>
            {conflict.className}
          </Text>
          <Text style={styles.conflictSubtitle}>
            {conflict.modality} • {conflict.instructorName}
          </Text>
        </View>
        {onViewConflict && (
          <Button
            mode="text"
            compact
            onPress={() => onViewConflict(conflict)}
            textColor={colors.primary}
          >
            Ver Detalhes
          </Button>
        )}
      </View>
      
      <View style={styles.conflictDays}>
        {conflict.conflictingDays.map((dayConflict, dayIndex) => (
          <View key={dayIndex} style={styles.dayConflict}>
            <Text style={styles.dayName}>
              {DAY_NAMES[dayConflict.day]}:
            </Text>
            <View style={styles.hoursContainer}>
              {dayConflict.conflictingHours.map((hour, hourIndex) => (
                <Chip
                  key={hourIndex}
                  mode="flat"
                  compact
                  style={[styles.hourChip, { backgroundColor: colors.errorContainer }]}
                  textStyle={{ color: colors.onErrorContainer, fontSize: 12 }}
                >
                  {hour}
                </Chip>
              ))}
            </View>
          </View>
        ))}
      </View>
      
      {index < conflicts.length - 1 && <Divider style={styles.divider} />}
    </View>
  );

  return (
    <Card style={[styles.container, { borderColor: colors.error }, style]}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons
              name="warning"
              size={24}
              color={colors.error}
              style={styles.warningIcon}
            />
            <Text style={[styles.title, { color: colors.error }]}>
              {conflicts.length === 1 ? 'Conflito Detectado' : `${conflicts.length} Conflitos Detectados`}
            </Text>
          </View>
          {onDismiss && (
            <Button
              mode="text"
              compact
              onPress={onDismiss}
              textColor={colors.onSurfaceVariant}
            >
              ✕
            </Button>
          )}
        </View>

        <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
          {conflicts.length === 1
            ? 'Existe uma turma com horário conflitante:'
            : 'Existem turmas com horários conflitantes:'
          }
        </Text>

        <View style={styles.conflictsList}>
          {conflicts.map(renderConflictItem)}
        </View>

        <View style={styles.actions}>
          <Text style={[styles.actionText, { color: colors.onSurfaceVariant }]}>
            Ajuste os horários para evitar conflitos ou continue se for intencional.
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  warningIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  conflictsList: {
    marginBottom: 16,
  },
  conflictItem: {
    marginBottom: 8,
  },
  conflictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  conflictInfo: {
    flex: 1,
  },
  conflictTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  conflictSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  conflictDays: {
    marginTop: 8,
  },
  dayConflict: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 100,
  },
  hoursContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  hourChip: {
    marginRight: 4,
    marginBottom: 4,
    height: 24,
  },
  divider: {
    marginTop: 12,
    marginBottom: 8,
  },
  actions: {
    marginTop: 8,
  },
  actionText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default ConflictWarning;
