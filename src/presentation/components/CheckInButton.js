import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Card, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import locationService from '@infrastructure/services/locationService';
import { firestoreService } from '@infrastructure/services/firestoreService';
import { academyFirestoreService } from '@infrastructure/services/academyFirestoreService';
import { useAuth } from '@contexts/AuthProvider';
import { useUserProfile } from '@hooks/useUserProfile';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getString } from '@utils/theme';

const CheckInButton = ({ classId, className, onCheckInSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);
  const { user } = useAuth();
  const { userProfile } = useUserProfile();

  const handleCheckIn = async () => {
    if (!user || !classId) {
      Alert.alert(getString('error'), 'Dados de usuário ou aula não encontrados');
      return;
    }

    setLoading(true);
    setLocationStatus('Verificando localização...');

    try {
      // Validar localização
      const locationValidation = await locationService.validateCheckIn(classId);
      
      if (!locationValidation.success) {
        setLocationStatus('Localização inválida');
        Alert.alert(
          'Check-in Negado',
          locationValidation.reason,
          [{ text: getString('ok'), onPress: () => setLocationStatus(null) }]
        );
        return;
      }

      setLocationStatus('Registrando presença...');

      // Criar registro de check-in
      const checkInData = {
        studentId: user.id,
        classId: classId,
        date: new Date(),
        status: 'present',
        location: {
          latitude: locationValidation.location.latitude,
          longitude: locationValidation.location.longitude,
          accuracy: locationValidation.location.accuracy,
          distance: locationValidation.distance
        },
        timestamp: locationValidation.timestamp,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Buscar a turma do usuário para fazer check-in na subcoleção
      const studentClasses = await academyFirestoreService.getWhere(
        'classes', 
        'students', 
        'array-contains', 
        user.id, 
        userProfile.academiaId
      );
      
      if (studentClasses.length === 0) {
        throw new Error('Nenhuma turma encontrada para este usuário');
      }
      
      // Usar a primeira turma encontrada
      const classId = studentClasses[0].id;
      
      await academyFirestoreService.addSubcollectionDocument(
        'classes',
        classId,
        'checkIns',
        checkInData,
        userProfile.academiaId
      );

      setLocationStatus('Check-in realizado!');
      
      Alert.alert(
        getString('successCheck'),
        `Check-in realizado na aula de ${className}!\n\nDistância da academia: ${locationValidation.distance}m`,
        [
          {
            text: getString('ok'),
            onPress: () => {
              setLocationStatus(null);
              if (onCheckInSuccess) {
                onCheckInSuccess(checkInData);
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Erro no check-in:', error);
      setLocationStatus('Erro no check-in');
      
      Alert.alert(
        getString('error'),
        'Não foi possível realizar o check-in. Tente novamente.',
        [{ text: getString('ok'), onPress: () => setLocationStatus(null) }]
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (locationStatus?.includes('inválida')) return COLORS.error[500];
    if (locationStatus?.includes('realizado')) return COLORS.success[500];
    return COLORS.warning[500];
  };

  return (
    <Card style={styles.container}>
      <Card.Content>
        <View style={styles.header}>
          <MaterialCommunityIcons 
            name="map-marker-check" 
            size={24} 
            color={COLORS.primary[500]} 
          />
          <Text style={styles.title}>Check-in com Localização</Text>
        </View>

        {locationStatus && (
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor() + '20' }]}>
            <MaterialCommunityIcons 
              name="information" 
              size={16} 
              color={getStatusColor()} 
            />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {locationStatus}
            </Text>
          </View>
        )}

        <Text style={styles.description}>
          Você precisa estar na academia para fazer check-in
        </Text>

        <Button
          mode="contained"
          onPress={handleCheckIn}
          disabled={loading}
          style={styles.button}
          icon={loading ? undefined : "map-marker-check"}
          contentStyle={styles.buttonContent}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={COLORS.white} size="small" />
              <Text style={styles.loadingText}>Verificando...</Text>
            </View>
          ) : (
            'Fazer Check-in'
          )}
        </Button>

        <Text style={styles.hint}>
          💡 Certifique-se de estar dentro da academia
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: SPACING.base,
    elevation: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    marginLeft: 8,
    color: COLORS.text.primary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  statusText: {
    marginLeft: 8,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
  },
  description: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginVertical: 8,
    borderRadius: 25,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: SPACING.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.white,
    marginLeft: 8,
    fontSize: FONT_SIZE.md,
  },
  hint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
});

export default CheckInButton;
