import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import {
  Card,
  Button,
  Avatar,
  Text
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@contexts/AuthProvider';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT, BORDER_WIDTH } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';
import { getString } from '@utils/theme';

const UserTypeSelectionScreen = ({ navigation, route }: UserTypeSelectionScreenProps) => {
  const { currentTheme } = useThemeToggle();
  const { isDarkMode, getString } = useTheme();

  const { user, updateUserProfile, logout } = useAuth();
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);

  const userTypes = [
    {
      id: 'student',
      tipo: 'aluno',
      title: getString('student'),
      description: 'Sou um praticante que quer treinar e acompanhar meu progresso',
      icon: 'school',
      color: COLORS.info[500],
      features: [
        'Acompanhar treinos e frequência',
        'Ver evolução e graduações',
        'Receber notificações de aulas',
        'Gerenciar pagamentos'
      ]
    },
    {
      id: 'instructor',
      tipo: 'instrutor',
      title: getString('instructor'),
      description: 'Sou um instrutor que ministra aulas e acompanha alunos',
      icon: 'fitness-center',
      color: COLORS.warning[500],
      features: [
        'Gerenciar turmas e horários',
        'Acompanhar progresso dos alunos',
        'Aplicar graduações',
        'Enviar notificações'
      ]
    },
    {
      id: 'admin',
      tipo: 'administrador',
      title: getString('administrator'),
      description: 'Sou responsável pela gestão completa da academia',
      icon: 'business',
      color: COLORS.primary[500],
      features: [
        'Gestão completa da academia',
        'Gerenciar instrutores e alunos',
        'Controle financeiro',
        'Relatórios e estatísticas'
      ]
    }
  ];

  const handleSelectType = async () => {
    if (!selectedType) {
      Alert.alert('Seleção Obrigatória', 'Por favor, selecione o tipo de usuário.');
      return;
    }

    setLoading(true);
    try {
      const selectedUserType = userTypes.find(type => type.id === selectedType);

      await updateUserProfile({
        tipo: selectedUserType.tipo,
        userType: selectedUserType.id,
        profileCompleted: true,
        updatedAt: new Date()
      });

      // O AppNavigator irá detectar a mudança e redirecionar automaticamente
      console.log('✅ UserTypeSelection: Perfil atualizado, AppNavigator irá redirecionar');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert(getString('error'), 'Não foi possível salvar o tipo de usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderUserTypeCard = (userType) => (
    <Card
      key={userType.id}
      style={[
        styles.typeCard,
        selectedType === userType.id && {
          borderColor: userType.color,
          borderWidth: 3,
          backgroundColor: `${userType.color}10`
        }
      ]}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: userType.color }]}>
            <Ionicons
              name={userType.icon === 'school' ? 'school' : userType.icon === 'fitness-center' ? 'fitness' : 'business'}
              color={COLORS.white}
              size={32}
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.typeTitle}>{userType.title}</Text>
            <Text style={styles.typeDescription}>{userType.description}</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {userType.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons
                name="checkmark-circle"
                color={userType.color}
                size={16}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <Button
          mode={selectedType === userType.id ? "contained" : "outlined"}
          buttonColor={selectedType === userType.id ? userType.color : COLORS.gray[300]}
          textColor={selectedType === userType.id ? COLORS.white : COLORS.text.secondary}
          style={styles.selectButton}
          onPress={() => setSelectedType(userType.id)}
        >
          {selectedType === userType.id ? getString('selected') : "Selecionar"}
        </Button>
      </Card.Content>
    </Card>
  );

  const handleLogout = async () => {
    console.log('🔘 UserTypeSelection: handleLogout chamado');

    // Para web, usar confirm nativo do browser
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(getString('confirmLogout'));
      console.log('🔘 UserTypeSelection: Web confirm result:', confirmed);

      if (confirmed) {
        try {
          setLoading(true);
          console.log('🚪 UserTypeSelection: Iniciando logout...');
          await logout();
          console.log('✅ UserTypeSelection: Logout concluído');
        } catch (error) {
          console.error('❌ UserTypeSelection: Erro ao fazer logout:', error);
          window.alert(`Erro: ${error.message}`);
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    // Para mobile, usar Alert.alert
    Alert.alert(
      getString('logout'),
      getString('confirmLogout'),
      [
        {
          text: getString('cancel'),
          style: 'cancel'
        },
        {
          text: getString('logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('🚪 UserTypeSelection: Iniciando logout...');
              await logout();
              console.log('✅ UserTypeSelection: Logout concluído');
            } catch (error) {
              console.error('❌ UserTypeSelection: Erro ao fazer logout:', error);
              Alert.alert(getString('error'), `Não foi possível sair da conta: ${error.message}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Button
            mode="text"
            onPress={handleLogout}
            icon="logout"
            textColor={COLORS.text.secondary}
            style={styles.logoutButton}
          >{getString('logout')}</Button>
        </View>
        <Avatar.Text
          size={80}
          label={user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          style={styles.avatar}
        />
        <Text style={styles.welcomeText}>
          Olá, {user?.displayName || user?.email}!
        </Text>
        <Text style={styles.subtitle}>
          Para continuar, selecione como você vai usar o app:
        </Text>
      </View>

      <View style={styles.typesContainer}>
        {userTypes.map(renderUserTypeCard)}
      </View>

      <View style={styles.footer}>
        <Button
          mode="contained"
          buttonColor={selectedType ? COLORS.info[500] : COLORS.gray[300]}
          style={styles.continueButton}
          onPress={handleSelectType}
          loading={loading}
          disabled={!selectedType || loading}
        >
          Continuar
        </Button>

        <Text style={styles.footerNote}>
          Você poderá alterar essas configurações depois nas configurações do app.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  headerTop: {
    width: '100%',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
  },
  logoutButton: {
    marginBottom: 10,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.base,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px currentTheme.black + "80"',
      },
    }),
  },
  avatar: {
    marginBottom: SPACING.base,
  },
  welcomeText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  typesContainer: {
    paddingHorizontal: SPACING.base,
  },
  typeCard: {
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.base,
    padding: SPACING.lg,
    borderWidth: BORDER_WIDTH.base,
    borderColor: COLORS.gray[300],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.base,
  },
  titleContainer: {
    flex: 1,
  },
  typeTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  typeDescription: {
    fontSize: FONT_SIZE.base,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZE.base,
    color: '#555',
    marginLeft: SPACING.sm,
    flex: 1,
  },
  selectButton: {
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
  },
  selectButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  footer: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xs0,
  },
  continueButton: {
    backgroundColor: COLORS.info[500],
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.base,
    marginBottom: SPACING.base,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.gray[300],
  },
  continueButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  footerNote: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default UserTypeSelectionScreen;
