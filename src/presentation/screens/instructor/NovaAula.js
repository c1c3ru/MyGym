import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  TextInput,
  Button,
  Chip,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ResponsiveUtils } from '@utils/animations';
import { FONT_WEIGHT } from '@presentation/theme/designTokens';
import { useTheme } from "@contexts/ThemeContext";
import { useProfileTheme } from "../../../contexts/ProfileThemeContext";

const NovaAula = ({ navigation }) => {
  const { getString } = useTheme();
  const { theme: profileTheme } = useProfileTheme();

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
    <LinearGradient colors={profileTheme.gradients.hero} style={{
      flex: 1,
      minHeight: 0,
      height: Platform.OS === 'web' ? '100vh' : '100%',
      overflow: 'hidden'
    }}>
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent', minHeight: 0 }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ minHeight: '101%' }}
          alwaysBounceVertical={true}
        >
          <Card style={[styles.card, { backgroundColor: profileTheme.background.paper, borderColor: profileTheme.background.paper }]}>
            <Card.Content>
              <View style={styles.header}>
                <MaterialCommunityIcons name="plus-circle" size={32} color={profileTheme.primary[500]} />
                <Text style={[styles.title, { color: profileTheme.text.primary }]}>Nova Aula</Text>
              </View>

              <TextInput
                label="Nome da Aula"
                value={formData.nome}
                onChangeText={(text) => setFormData({ ...formData, nome: text })}
                style={[styles.input, { backgroundColor: profileTheme.background.default }]}
                mode="outlined"
                textColor={profileTheme.text.primary}
                theme={{ colors: { primary: profileTheme.primary[500], outline: profileTheme.text.disabled } }}
              />

              <Text style={[styles.sectionTitle, { color: profileTheme.text.primary }]}>{getString('modality')}</Text>
              <View style={styles.chipContainer}>
                {modalidades.map((modalidade) => (
                  <Chip
                    key={modalidade}
                    selected={formData.modalidade === modalidade}
                    onPress={() => setFormData({ ...formData, modalidade })}
                    style={[styles.chip, { backgroundColor: formData.modalidade === modalidade ? profileTheme.secondary[100] : profileTheme.background.default }]}
                    textStyle={{ color: formData.modalidade === modalidade ? profileTheme.secondary[900] : profileTheme.text.primary }}
                    showSelectedOverlay={true}
                  >
                    {modalidade}
                  </Chip>
                ))}
              </View>

              <TextInput
                label="Capacidade Máxima"
                value={formData.capacidade}
                onChangeText={(text) => setFormData({ ...formData, capacidade: text })}
                style={[styles.input, { backgroundColor: profileTheme.background.default }]}
                mode="outlined"
                keyboardType="numeric"
                textColor={profileTheme.text.primary}
                theme={{ colors: { primary: profileTheme.primary[500], outline: profileTheme.text.disabled } }}
              />

              <TextInput
                label="Horário"
                value={formData.horario}
                onChangeText={(text) => setFormData({ ...formData, horario: text })}
                style={[styles.input, { backgroundColor: profileTheme.background.default }]}
                mode="outlined"
                placeholder="Ex: Segunda 19:00"
                textColor={profileTheme.text.primary}
                theme={{ colors: { primary: profileTheme.primary[500], outline: profileTheme.text.disabled } }}
              />

              <TextInput
                label={getString('description')}
                value={formData.descricao}
                onChangeText={(text) => setFormData({ ...formData, descricao: text })}
                style={[styles.input, { backgroundColor: profileTheme.background.default }]}
                mode="outlined"
                multiline
                numberOfLines={3}
                textColor={profileTheme.text.primary}
                theme={{ colors: { primary: profileTheme.primary[500], outline: profileTheme.text.disabled } }}
              />

              <Divider style={[styles.divider, { backgroundColor: profileTheme.text.disabled }]} />

              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.goBack()}
                  style={[styles.cancelButton, { borderColor: profileTheme.text.disabled }]}
                  textColor={profileTheme.text.secondary}
                >{getString('cancel')}</Button>

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={[styles.submitButton, { backgroundColor: profileTheme.primary[500] }]}
                >
                  Criar Aula
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: ResponsiveUtils.spacing.md,
    borderRadius: ResponsiveUtils.borderRadius.large,
    ...ResponsiveUtils.elevation,
    borderWidth: 1,
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
  },
  input: {
    marginBottom: ResponsiveUtils.spacing.md,
  },
  sectionTitle: {
    fontSize: ResponsiveUtils.fontSize.medium,
    fontWeight: FONT_WEIGHT.bold,
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
