import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Card,
  Chip,
  Avatar,
  Text,
  Button,
  Surface
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { getBeltColor, getStatusColor, APP_COLORS, STATUS_COLORS, TEXT_COLORS } from '@shared/constants/colors';

const GraduationAlertCard = ({ 
  alert, 
  onViewDetails, 
  onScheduleExam, 
  showActions = true,
  compact = false 
}) => {
  const getAlertLevelColor = (level) => {
    switch (level) {
      case 'ready':
        return getStatusColor('success');
      case 'warning':
        return getStatusColor('warning');
      case 'info':
        return getStatusColor('info');
      default:
        return APP_COLORS.gray[300];
    }
  };

  const getAlertLevelText = (level) => {
    const texts = {
      'ready': 'Pronto para Graduação',
      'warning': 'Próximo da Graduação',
      'info': 'Em Progresso'
    };
    return texts[level] || 'Status Desconhecido';
  };

  const getAlertIcon = (level) => {
    const icons = {
      'ready': 'trophy',
      'warning': 'time',
      'info': 'information-circle'
    };
    return icons[level] || 'help-circle';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getDaysText = (days) => {
    if (days === 0) return 'Hoje';
    if (days === 1) return '1 dia';
    if (days < 30) return `${days} dias`;
    
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    
    if (months === 1 && remainingDays === 0) return '1 mês';
    if (remainingDays === 0) return `${months} meses`;
    if (months === 1) return `1 mês e ${remainingDays} dias`;
    
    return `${months} meses e ${remainingDays} dias`;
  };

  if (compact) {
    return (
      <Surface style={styles.compactCard}>
        <View style={styles.compactContent}>
          <Avatar.Text 
            size={36} 
            label={alert.studentName.charAt(0)} 
            style={{ backgroundColor: getBeltColor(alert.currentBelt) }}
          />
          
          <View style={styles.compactInfo}>
            <Text style={styles.compactName}>{alert.studentName}</Text>
            <Text style={styles.compactModality}>{alert.modality}</Text>
            
            <View style={styles.compactBelts}>
              <Chip size="small" style={[styles.compactBelt, { backgroundColor: getBeltColor(alert.currentBelt) }]}>
                {alert.currentBelt}
              </Chip>
              <Ionicons name="arrow-forward" size={12} color={APP_COLORS.gray[600]} style={{ marginHorizontal: 4 }} />
              <Chip size="small" style={[styles.compactBelt, { backgroundColor: getBeltColor(alert.nextBelt) }]}>
                {alert.nextBelt}
              </Chip>
            </View>
          </View>
          
          <View style={styles.compactStatus}>
            <Chip 
              icon={getAlertIcon(alert.alertLevel)}
              style={[styles.compactStatusChip, { backgroundColor: getAlertLevelColor(alert.alertLevel) }]}
              compact
            >
              {alert.isEligible ? 'Pronto' : getDaysText(alert.daysUntilEligible)}
            </Chip>
          </View>
        </View>
      </Surface>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.studentInfo}>
            <Avatar.Text 
              size={48} 
              label={alert.studentName.charAt(0)} 
              style={{ backgroundColor: getBeltColor(alert.currentBelt) }}
            />
            
            <View style={styles.studentDetails}>
              <Text style={styles.studentName}>{alert.studentName}</Text>
              <Text style={styles.modality}>{alert.modality}</Text>
            </View>
          </View>
          
          <Chip 
            icon={getAlertIcon(alert.alertLevel)}
            style={[styles.alertChip, { backgroundColor: getAlertLevelColor(alert.alertLevel) }]}
          >
            {getAlertLevelText(alert.alertLevel)}
          </Chip>
        </View>

        <View style={styles.progression}>
          <View style={styles.beltProgression}>
            <View style={styles.currentBelt}>
              <Text style={styles.beltLabel}>Atual</Text>
              <Chip 
                style={[styles.beltChip, { backgroundColor: getBeltColor(alert.currentBelt) }]}
              >
                {alert.currentBelt}
              </Chip>
            </View>
            
            <Ionicons name="arrow-forward" size={24} color={APP_COLORS.gray[600]} style={styles.arrow} />
            
            <View style={styles.nextBelt}>
              <Text style={styles.beltLabel}>Próxima</Text>
              <Chip 
                style={[styles.beltChip, { backgroundColor: getBeltColor(alert.nextBelt) }]}
              >
                {alert.nextBelt}
              </Chip>
            </View>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={16} color={APP_COLORS.gray[600]} />
            <Text style={styles.detailText}>
              Início do treinamento: {formatDate(alert.trainingStartDate)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color={APP_COLORS.gray[600]} />
            <Text style={styles.detailText}>
              Tempo mínimo: {Math.floor(alert.minimumTrainingDays / 30)} meses
            </Text>
          </View>
          
          {alert.minimumClasses && (
            <View style={styles.detailRow}>
              <Ionicons name="library" size={16} color={APP_COLORS.gray[600]} />
              <Text style={styles.detailText}>
                Aulas: {alert.classesCompleted || 0}/{alert.minimumClasses}
              </Text>
            </View>
          )}
          
          {!alert.isEligible && (
            <View style={styles.detailRow}>
              <Ionicons name="hourglass" size={16} color={APP_COLORS.gray[600]} />
              <Text style={styles.detailText}>
                Elegível em: {getDaysText(alert.daysUntilEligible)}
              </Text>
            </View>
          )}
          
          {alert.isEligible && (
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle" size={16} color={STATUS_COLORS.success} />
              <Text style={[styles.detailText, { color: STATUS_COLORS.success, fontWeight: 'bold' }]}>
                Elegível para graduação!
              </Text>
            </View>
          )}
        </View>

        {showActions && (
          <View style={styles.actions}>
            <Button 
              mode="outlined" 
              onPress={() => onViewDetails?.(alert)}
              style={styles.actionButton}
            >
              Ver Detalhes
            </Button>
            
            {alert.isEligible && onScheduleExam && (
              <Button 
                mode="contained" 
                onPress={() => onScheduleExam(alert)}
                style={styles.actionButton}
                icon="calendar-plus"
              >
                Agendar Exame
              </Button>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modality: {
    fontSize: 14,
    color: APP_COLORS.gray[600],
  },
  alertChip: {
    paddingHorizontal: 8,
  },
  progression: {
    marginBottom: 16,
  },
  beltProgression: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: APP_COLORS.gray[50],
    padding: 16,
    borderRadius: 8,
  },
  currentBelt: {
    alignItems: 'center',
  },
  nextBelt: {
    alignItems: 'center',
  },
  beltLabel: {
    fontSize: 12,
    color: APP_COLORS.gray[600],
    marginBottom: 8,
  },
  beltChip: {
    paddingHorizontal: 16,
  },
  arrow: {
    marginHorizontal: 16,
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: TEXT_COLORS.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  // Compact styles
  compactCard: {
    marginVertical: 4,
    borderRadius: 8,
    elevation: 1,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  compactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  compactName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  compactModality: {
    fontSize: 12,
    color: APP_COLORS.gray[600],
    marginBottom: 4,
  },
  compactBelts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactBelt: {
    paddingHorizontal: 6,
  },
  compactStatus: {
    alignItems: 'center',
  },
  compactStatusChip: {
    paddingHorizontal: 8,
  },
});

export default GraduationAlertCard;