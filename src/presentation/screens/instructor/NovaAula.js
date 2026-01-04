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
import ImprovedScheduleSelector from '@components/ImprovedScheduleSelector';
import { createEmptySchedule } from '@utils/scheduleUtils';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getString } from "@utils/theme";

const NovaAula = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nome: '',
    modalidade: '',
    capacidade: '',
    horario: '',
    descricao: ''
  });

  const modalidades = [getString('karate'), getString('jiujitsu'), getString('muayThai'), getString('boxing'), getString('taekwondo'), 'Judo'];

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
              <MaterialCommunityIcons name="plus-circle" size={32} color={COLORS.primary[500]} />
              <Text style={styles.title}>Nova Aula</Text>
            </View>
            
            <TextInput
              label="Nome da Aula"
              value={formData.nome}
              onChangeText={(text) => setFormData({...formData, nome: text})}
              style={styles.input}
              mode="outlined"
            />
            
            <Text style={styles.sectionTitle}>{getString('modality')}</Text>
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
            
            <TextInput
              label="Horário"
              value={formData.horario}
              onChangeText={(text) => setFormData({...formData, horario: text})}
              style={styles.input}
              mode="outlined"
              placeholder="Ex: Segunda 19:00"
            />
            
            <TextInput
              label={getString('description')}
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
              >{getString('cancel')}</Button>
              
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                buttonColor={COLORS.primary[500]}
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
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: ResponsiveUtils.spacing.md,
    borderRadius: ResponsiveUtils.borderRadius.large,
    ...ResponsiveUtils.elevation,
    backgroundColor: COLORS.card.default.background,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils.spacing.lg,
  },
  title: {
    marginLeft: ResponsiveUtils.spacing.md,
    fontSize: ResponsiveUtils.fontSize.large,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.black,
  },
  input: {
    marginBottom: ResponsiveUtils.spacing.md,
  },
  sectionTitle: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.black,
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
    backgroundColor: COLORS.border.subtle,
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
