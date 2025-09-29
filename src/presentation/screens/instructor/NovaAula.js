import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Card, 
  Text, 
  TextInput, 
  Button, 
  Chip, 
  Surface,
  Divider 
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ResponsiveUtils } from '@utils/animations';
import ScheduleSelector from '@components/ScheduleSelector';
import { createEmptySchedule } from '@utils/scheduleUtils';

const NovaAula = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nome: '',
    modalidade: '',
    capacidade: '',
    horario: createEmptySchedule(),
    descricao: ''
  });

  const modalidades = ['Karatê', 'Jiu-Jitsu', 'Muay Thai', 'Boxe', 'Taekwondo', 'Judo'];

  const handleSubmit = () => {
    // Implementar lógica de criação da aula
    console.log('Nova aula:', formData);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons name="plus-circle" size={32} color="#4CAF50" />
              <Text style={styles.title}>Nova Aula</Text>
            </View>
            
            <TextInput
              label="Nome da Aula"
              value={formData.nome}
              onChangeText={(text) => setFormData({...formData, nome: text})}
              style={styles.input}
              mode="outlined"
            />
            
            <Text style={styles.sectionTitle}>Modalidade</Text>
            <View style={styles.chipContainer}>
              {modalidades.map((modalidade) => (
                <Chip
                  key={modalidade}
                  selected={formData.modalidade === modalidade}
                  onPress={() => setFormData({...formData, modalidade})}
                  style={styles.chip}
                >
                  {modalidade}
                </Chip>
              ))}
            </View>
            
            <TextInput
              label="Capacidade Máxima"
              value={formData.capacidade}
              onChangeText={(text) => setFormData({...formData, capacidade: text})}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
            />
            
            <ScheduleSelector
              value={formData.horario}
              onScheduleChange={(schedule) => setFormData({...formData, horario: schedule})}
              duration={60}
              timezone="America/Fortaleza"
              startHour={6}
              endHour={22}
              required={true}
              label="Horários da Aula"
              style={styles.input}
            />
            
            <TextInput
              label="Descrição"
              value={formData.descricao}
              onChangeText={(text) => setFormData({...formData, descricao: text})}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
            
            <Divider style={styles.divider} />
            
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.cancelButton}
              >
                Cancelar
              </Button>
              
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                buttonColor="#4CAF50"
              >
                Criar Aula
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: ResponsiveUtils.spacing.md,
    borderRadius: ResponsiveUtils.borderRadius.large,
    ...ResponsiveUtils.elevation,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.lg,
  },
  title: {
    marginLeft: ResponsiveUtils.spacing.md,
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    marginBottom: ResponsiveUtils.spacing.md,
  },
  sectionTitle: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: ResponsiveUtils.spacing.sm,
    marginTop: ResponsiveUtils.spacing.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: ResponsiveUtils.spacing.md,
  },
  chip: {
    marginRight: ResponsiveUtils.spacing.sm,
    marginBottom: ResponsiveUtils.spacing.xs,
  },
  divider: {
    marginVertical: ResponsiveUtils.spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 0.45,
  },
  submitButton: {
    flex: 0.45,
  },
});

export default NovaAula;
