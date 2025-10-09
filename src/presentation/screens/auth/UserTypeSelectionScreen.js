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
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT , BORDER_WIDTH } from '@presentation/theme/designTokens';
import { useThemeToggle } from '@contexts/ThemeToggleContext';

const UserTypeSelectionScreen = ({ navigation, route }) => {
  const { currentTheme } = useThemeToggle();
  
  const { user, updateUserProfile, logout } = useAuth();
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);

  const userTypes = [
    {
      id: 'student',
      tipo: 'aluno',
      title: 'Aluno',
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
      title: 'Instrutor',
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
      title: 'Administrador',
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
      Alert.alert('Erro', 'Não foi possível salvar o tipo de usuário. Tente novamente.');
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
          {selectedType === userType.id ? "Selecionado" : "Selecionar"}
        </Button>
      </Card.Content>
    </Card>
  );

  const handleLogout = async () => {
    console.log('🔘 UserTypeSelection: handleLogout chamado');
    
    // Para web, usar confirm nativo do browser
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Tem certeza que deseja sair da sua conta?');
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
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('🚪 UserTypeSelection: Iniciando logout...');
              await logout();
              console.log('✅ UserTypeSelection: Logout concluído');
            } catch (error) {
              console.error('❌ UserTypeSelection: Erro ao fazer logout:', error);
              Alert.alert('Erro', `Não foi possível sair da conta: ${error.message}`);
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
          >
            Sair
          </Button>
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
          buttonColor={selectedType ? COLORS.info[500] : 'currentTheme.gray[300]CCC'}
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  logoutButton: {
    marginBottom: 10,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    marginBottom: 16,
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
    marginBottom: 16,
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
    paddingHorizontal: 16,
  },
  typeCard: {
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 16,
    padding: SPACING.lg,
    borderWidth: BORDER_WIDTH.base,
    borderColor: COLORS.gray[300],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    marginLeft: 8,
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
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: COLORS.info[500],
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 16,
    marginBottom: 16,
  },
  continueButtonDisabled: {
    backgroundColor: 'currentTheme.gray[300]CCC',
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
