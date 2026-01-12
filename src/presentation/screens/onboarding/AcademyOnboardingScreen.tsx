import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import {
  Card,
  Button,
  TextInput,
  Dialog,
  Portal,
  Text,
  TouchableRipple
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@infrastructure/services/firebase';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { hexToRgba } from '@shared/utils/colorUtils';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import { getString } from "@utils/theme";

import { useNavigation } from '@react-navigation/native';

const AcademyOnboardingScreen = () => {
  const navigation = useNavigation();
  const { currentTheme } = useThemeToggle();

  const { refreshClaimsAndProfile, signOut: logout } = useAuthFacade();

  const [createAcademyVisible, setCreateAcademyVisible] = useState(false);
  const [useInviteVisible, setUseInviteVisible] = useState(false);
  const [creatingAcademy, setCreatingAcademy] = useState(false);
  const [usingInvite, setUsingInvite] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [academyData, setAcademyData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: ''
  });

  const resetCreateAcademyForm = () => {
    setAcademyData({
      name: '',
      description: '',
      address: '',
      phone: '',
      email: ''
    });
  };

  const resetInviteForm = () => {
    setInviteCode('');
  };

  const handleCreateAcademy = async () => {
    if (!academyData.name.trim()) return;

    try {
      setCreatingAcademy(true);
      const createAcademyFn = httpsCallable(functions, 'createAcademy');
      await createAcademyFn(academyData);

      Alert.alert('Sucesso', 'Academia criada com sucesso!');
      setCreateAcademyVisible(false);
      resetCreateAcademyForm();
      await refreshClaimsAndProfile();
    } catch (error) {
      console.error('Erro ao criar academia:', error);
      Alert.alert('Erro', 'Não foi possível criar a academia. Tente novamente.');
    } finally {
      setCreatingAcademy(false);
    }
  };

  const handleUseInvite = async () => {
    if (!inviteCode.trim()) return;

    try {
      setUsingInvite(true);
      const useInviteFn = httpsCallable(functions, 'useInvite');

      // Normalizar o código antes de enviar
      const normalizedCode = inviteCode.trim().toUpperCase();

      console.log('🎫 Tentando usar convite:', {
        original: inviteCode,
        normalized: normalizedCode
      });

      await useInviteFn({ inviteCode: normalizedCode });

      Alert.alert(
        '✅ Sucesso!',
        'Você se juntou à academia com sucesso!',
        [{ text: 'OK', style: 'default' }]
      );
      setUseInviteVisible(false);
      resetInviteForm();
      await refreshClaimsAndProfile();
    } catch (error: any) {
      console.error('Erro ao usar convite:', error);

      // Mensagens de erro mais específicas e amigáveis
      let errorTitle = '❌ Erro ao Usar Convite';
      let errorMessage = 'Não foi possível processar o código de convite.';
      let suggestions = '';

      // Tratar diferentes tipos de erro
      if (error.code === 'not-found' || error.code === 'functions/not-found') {
        errorTitle = '🔍 Convite Não Encontrado';
        errorMessage = 'O código de convite informado não foi encontrado ou já foi utilizado por outro usuário.';
        suggestions = '\n\n💡 Dicas:\n• Verifique se digitou o código corretamente\n• Confirme com o administrador se o convite ainda está válido\n• Solicite um novo código se necessário';
      } else if (error.code === 'failed-precondition' || error.code === 'functions/failed-precondition') {
        errorTitle = '⏰ Convite Expirado';
        errorMessage = 'Este convite expirou e não pode mais ser utilizado.';
        suggestions = '\n\n💡 Solução:\n• Entre em contato com o administrador da academia\n• Solicite um novo código de convite';
      } else if (error.code === 'invalid-argument' || error.code === 'functions/invalid-argument') {
        errorTitle = '⚠️ Código Inválido';
        errorMessage = 'O código de convite informado é inválido.';
        suggestions = '\n\n💡 Dica:\n• Verifique se o código possui 6 caracteres\n• Certifique-se de que não há espaços extras';
      } else if (error.code === 'unauthenticated' || error.code === 'functions/unauthenticated') {
        errorTitle = '🔐 Autenticação Necessária';
        errorMessage = 'Você precisa estar autenticado para usar um convite.';
        suggestions = '\n\n💡 Solução:\n• Faça logout e login novamente\n• Verifique sua conexão com a internet';
      } else if (error.message) {
        // Usar mensagem do backend se disponível
        errorMessage = error.message;
      }

      Alert.alert(
        errorTitle,
        errorMessage + suggestions,
        [{ text: 'Entendi', style: 'cancel' }]
      );
    } finally {
      setUsingInvite(false);
    }
  };

  const handleLogout = async () => {
    console.log('🔘 Botão Sair pressionado');

    if (Platform.OS === 'web') {
      const shouldLogout = window.confirm('Deseja realmente sair da conta?');
      if (shouldLogout) {
        try {
          await logout();
        } catch (error) {
          console.error('Erro ao sair:', error);
        }
      }
    } else {
      Alert.alert(
        'Sair',
        'Deseja realmente sair da conta?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: async () => {
              try {
                await logout();
              } catch (error) {
                console.error('Erro ao sair:', error);
              }
            }
          }
        ]
      );
    }
  };

  return (
    <LinearGradient
      colors={COLORS.gradients.accent}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <Button
              mode="contained"
              icon="arrow-left"
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  handleLogout();
                }
              }}
              textColor={COLORS.white}
              buttonColor={hexToRgba(COLORS.white, 0.2)}
            >
              Voltar
            </Button>
            <Button
              mode="contained"
              icon="logout"
              onPress={handleLogout}
              textColor={COLORS.white}
              buttonColor={hexToRgba(COLORS.white, 0.2)}
            >
              Sair
            </Button>
          </View>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="school" size={48} color={COLORS.primary[600]} />
            </View>
            <Text style={styles.title}>Bem-vindo ao MyGym!</Text>
            <Text style={styles.subtitle}>
              Para começar, você precisa estar associado a uma academia.
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {/* Opção 1: Criar Nova Academia */}
            <Card style={styles.glassCard} mode="elevated">
              <TouchableRipple
                onPress={() => setCreateAcademyVisible(true)}
                style={styles.touchable}
                rippleColor={hexToRgba(COLORS.black, 0.1)}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={[styles.optionIcon, { backgroundColor: COLORS.info[100] }]}>
                    <Ionicons name="add" size={32} color={COLORS.info[600]} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Criar Minha Academia</Text>
                    <Text style={styles.optionDescription}>
                      Torne-se administrador e gerencie sua própria academia.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={COLORS.gray[400]} />
                </Card.Content>
              </TouchableRipple>
            </Card>

            {/* Opção 2: Usar Código de Convite */}
            <Card style={styles.glassCard} mode="elevated">
              <TouchableRipple
                onPress={() => setUseInviteVisible(true)}
                style={styles.touchable}
                rippleColor={hexToRgba(COLORS.black, 0.1)}
              >
                <Card.Content style={styles.cardContent}>
                  <View style={[styles.optionIcon, { backgroundColor: COLORS.warning[100] }]}>
                    <Ionicons name="ticket" size={32} color={COLORS.warning[600]} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Tenho um Código</Text>
                    <Text style={styles.optionDescription}>
                      Entre como aluno ou instrutor usando um convite.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={COLORS.gray[400]} />
                </Card.Content>
              </TouchableRipple>
            </Card>
          </View>

          {/* Informações adicionais */}
          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={24} color={COLORS.white} style={{ opacity: 0.8 }} />
              <Text style={styles.featureText}>Seguro</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <Ionicons name="people" size={24} color={COLORS.white} style={{ opacity: 0.8 }} />
              <Text style={styles.featureText}>Colaborativo</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <Ionicons name="options" size={24} color={COLORS.white} style={{ opacity: 0.8 }} />
              <Text style={styles.featureText}>Flexível</Text>
            </View>
          </View>

        </ScrollView>

        {/* Dialogs */}
        <Portal>
          <Dialog visible={createAcademyVisible} onDismiss={() => setCreateAcademyVisible(false)} style={styles.dialog}>
            <Dialog.Title>Criar Nova Academia</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Nome da Academia *"
                value={academyData.name}
                onChangeText={(text) => setAcademyData(prev => ({ ...prev, name: text }))}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label={getString('description')}
                value={academyData.description}
                onChangeText={(text) => setAcademyData(prev => ({ ...prev, description: text }))}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <TextInput
                label={getString('address')}
                value={academyData.address}
                onChangeText={(text) => setAcademyData(prev => ({ ...prev, address: text }))}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label={getString('phone')}
                value={academyData.phone}
                onChangeText={(text) => setAcademyData(prev => ({ ...prev, phone: text }))}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
              />
              <TextInput
                label="Email"
                value={academyData.email}
                onChangeText={(text) => setAcademyData(prev => ({ ...prev, email: text }))}
                mode="outlined"
                keyboardType="email-address"
                style={styles.input}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setCreateAcademyVisible(false)}>{getString('cancel')}</Button>
              <Button mode="contained" onPress={handleCreateAcademy} loading={creatingAcademy} disabled={creatingAcademy}>
                Criar
              </Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog visible={useInviteVisible} onDismiss={() => setUseInviteVisible(false)} style={styles.dialog}>
            <Dialog.Title>Usar Código de Convite</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.inviteDescription}>
                Digite o código fornecido pelo administrador:
              </Text>
              <TextInput
                label="Código *"
                value={inviteCode}
                onChangeText={(text) => setInviteCode(text.toUpperCase())}
                mode="outlined"
                style={styles.input}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
                placeholder="Ex: ABC123"
              />

              {/* Info Card com dicas */}
              <Card style={styles.infoCard} mode="outlined">
                <Card.Content style={styles.infoCardContent}>
                  <Ionicons name="information-circle" size={20} color={COLORS.info[600]} style={styles.infoIcon} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoTitle}>Problemas com o código?</Text>
                    <Text style={styles.infoText}>
                      • Verifique se o código está correto{'\n'}
                      • Códigos expiram após 7 dias{'\n'}
                      • Cada código pode ser usado apenas uma vez
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setUseInviteVisible(false)}>{getString('cancel')}</Button>
              <Button mode="contained" onPress={handleUseInvite} loading={usingInvite} disabled={usingInvite}>
                Entrar
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  topBar: {
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: hexToRgba(COLORS.white, 0.9),
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: SPACING.xl,
  },
  glassCard: {
    backgroundColor: hexToRgba(COLORS.white, 0.95),
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 4,
  },
  touchable: {
    borderRadius: BORDER_RADIUS.lg,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.gray[800],
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[600],
    lineHeight: 18,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: hexToRgba(COLORS.white, 0.15),
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignSelf: 'center',
  },
  featureItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  featureText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    marginTop: 4,
  },
  featureDivider: {
    width: 1,
    height: 24,
    backgroundColor: hexToRgba(COLORS.white, 0.3),
  },
  dialog: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '90%',
    borderRadius: BORDER_RADIUS.md,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inviteDescription: {
    marginBottom: SPACING.md,
    color: COLORS.gray[500],
  },
  infoCard: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.info[50],
    borderColor: COLORS.info[200],
  },
  infoCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  infoIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.info[700],
    marginBottom: 4,
  },
  infoText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.info[600],
    lineHeight: 18,
  },
});

export default AcademyOnboardingScreen;
