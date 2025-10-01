import React, { useEffect, memo } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { Appbar, Avatar, Menu, Divider, Modal, Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { ResponsiveUtils } from '@utils/animations';
// import NotificationBell from './NotificationBell';
import { useTheme } from '@contexts/ThemeContext';
import { useCustomClaims } from '@hooks/useCustomClaims';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
// import { LinearGradient } from 'expo-linear-gradient';

const UniversalHeader = ({ 
  title, 
  subtitle, 
  navigation, 
  showBack = false,
  showMenu = true,
  backgroundColor = COLORS.primary[500]
}) => {
  const { user, userProfile, signOut } = useAuthFacade();
  const { getString, theme, updateUserTheme } = useTheme();
  const { role, getUserTypeColor: getClaimsTypeColor, getUserTypeText: getClaimsTypeText } = useCustomClaims();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);

  // Update theme when user type changes
  useEffect(() => {
    if (role) {
      updateUserTheme(role);
    }
  }, [role]); // Usando custom claims em vez de userProfile

  const openMenu = () => {
    console.log('🔐 Avatar clicado - abrindo menu');
    setMenuVisible(true);
  };
  const closeMenu = () => {
    console.log('🔐 Fechando menu');
    setMenuVisible(false);
  };

  const handleLogout = () => {
    console.log('🔐 Botão de logout clicado');
    console.log('🔐 Função signOut disponível:', typeof signOut);
    console.log('🔐 User atual:', user?.email);
    console.log('🔐 UserProfile atual:', userProfile?.name);
    
    if (!signOut) {
      console.error('🔐 Função signOut não está disponível!');
      Alert.alert(getString('error'), getString('logoutNotAvailable'));
      return;
    }
    
    // No web, usar modal personalizado; no mobile, usar Alert nativo
    if (Platform.OS === 'web') {
      setLogoutModalVisible(true);
    } else {
      Alert.alert(
        getString('confirmExit'),
        getString('sureToLogout'),
        [
          {
            text: getString('cancel'),
            style: 'cancel',
            onPress: () => console.log('🔐 Logout cancelado pelo usuário')
          },
          {
            text: getString('exit'),
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('🔐 Iniciando processo de logout...');
                closeMenu(); // Fechar menu antes do logout
                await signOut();
                console.log('🔐 Logout executado com sucesso');
              } catch (error) {
                console.error('🔐 Erro no logout:', error);
                Alert.alert(getString('error'), getString('cannotLogout'));
              }
            },
          },
        ]
      );
    }
  };

  const confirmLogout = async () => {
    try {
      console.log('🔐 Iniciando processo de logout...');
      setLogoutModalVisible(false);
      closeMenu(); // Fechar menu antes do logout
      await signOut();
      console.log('🔐 Logout executado com sucesso');
    } catch (error) {
      console.error('🔐 Erro no logout:', error);
      Alert.alert(getString('error'), getString('cannotLogout'));
    }
  };

  const cancelLogout = () => {
    console.log('🔐 Logout cancelado pelo usuário');
    setLogoutModalVisible(false);
  };

  const handleProfile = () => {
    closeMenu();
    navigation?.navigate('Profile');
  };

  const getHeaderColor = () => {
    // Use professional colors from the theme system
    if (theme?.palette) {
      return theme.palette.primary;
    }
    
    // Fallback to professional colors from custom claims
    return getClaimsTypeColor() || COLORS.primary[500]; // Default green
  };

  const getUserTypeColor = () => {
    // Legacy function - usar custom claims
    return getClaimsTypeColor();
  };

  const getUserTypeLabel = () => {
    return getClaimsTypeText();
  };

  // const getHeaderGradient = () => {
  //   if (theme?.palette?.gradient) {
  //     return theme.palette.gradient;
  //   }
  //   
  //   // Fallback gradients based on user type
  //   const userType = userProfile?.userType || userProfile?.tipo || 'student';
  //   switch (userType) {
  //     case 'admin':
  //     case 'administrador':
  //       return [COLORS.warning[500], COLORS.warning[600]];
  //     case 'instructor':
  //     case 'instrutor':
  //       return [COLORS.primary[500], COLORS.primary[700]];
  //     case 'student':
  //     case 'aluno':
  //     default:
  //       return [COLORS.info[500], COLORS.info[700]];
  //   }
  // };

  // Função legada removida - usando custom claims

  console.log('🔐 UniversalHeader renderizando - showMenu:', showMenu, 'menuVisible:', menuVisible);

  return (
    <>
      <View style={[styles.container, { backgroundColor }]}>
        <Appbar.Header style={[styles.header, styles.transparentHeader]}>
        {showBack && (
          <Appbar.BackAction 
            onPress={() => navigation?.goBack()} 
            color={COLORS.white}
          />
        )}
        
        <Appbar.Content 
          title={title || "🥋 MyGym"}
          subtitle={subtitle}
          titleStyle={styles.appName}
          subtitleStyle={styles.subtitle}
        />

        {/* {showMenu && <NotificationBell color="COLORS.white" size={24} />} */}

        {showMenu && (
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity 
                style={styles.menuAnchor}
                onPress={openMenu}
                activeOpacity={0.7}
              >
                <Avatar.Text 
                  size={ResponsiveUtils?.isTablet?.() ? 40 : 36}
                  label={userProfile?.name?.charAt(0) || 'U'}
                  style={[styles.avatar, { backgroundColor: COLORS.white + '33' }]}
                  labelStyle={styles.avatarLabel}
                />
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
              <View style={styles.menuHeader}>
                <Avatar.Text 
                  size={48}
                  label={userProfile?.name?.charAt(0) || 'U'}
                  style={[styles.menuAvatar, { backgroundColor: getUserTypeColor() }]}
                  labelStyle={styles.menuAvatarLabel}
                />
                <View style={styles.menuUserInfo}>
                  <Menu.Item
                    title={userProfile?.name || 'Usuário'}
                    titleStyle={styles.menuUserName}
                    disabled
                  />
                  <Menu.Item
                    title={getUserTypeLabel()}
                    titleStyle={styles.menuUserType}
                    disabled
                  />
                </View>
              </View>
              
              <Divider style={styles.menuDivider} />
              
              <Menu.Item
                onPress={handleProfile}
                title="Meu Perfil"
                leadingIcon={() => (
                  <MaterialCommunityIcons name="account" size={20} color={COLORS.text.secondary} />
                )}
                titleStyle={styles.menuItemTitle}
              />
              
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  // Implementar configurações se necessário
                }}
                title="Configurações"
                leadingIcon={() => (
                  <MaterialCommunityIcons name="cog" size={20} color={COLORS.text.secondary} />
                )}
                titleStyle={styles.menuItemTitle}
              />
              
              <Divider style={styles.menuDivider} />
              
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  handleLogout();
                }}
                title="Sair"
                leadingIcon={() => (
                  <MaterialCommunityIcons name="logout" size={20} color={COLORS.error[500]} />
                )}
                titleStyle={[styles.menuItemTitle, { color: COLORS.error[500] }]}
              />
            </Menu>
        )}
        </Appbar.Header>
      </View>
      
      {/* Modal de confirmação de logout para web */}
      <Modal
        visible={logoutModalVisible}
        onDismiss={cancelLogout}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirmar Saída</Text>
          <Text style={styles.modalMessage}>
            Tem certeza que deseja sair da sua conta?
          </Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={cancelLogout}
              style={styles.modalButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={confirmLogout}
              style={[styles.modalButton, styles.logoutButton]}
              buttonColor={COLORS.error[500]}
            >
              Sair
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    ...Platform.select({
      web: {
        boxShadow: '0 2px 3.84px rgba(0, 0, 0, 0.25)'
      },
      default: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }
    }),
    paddingHorizontal: ResponsiveUtils?.spacing?.xs || 4,
    minHeight: ResponsiveUtils?.isTablet?.() ? 64 : 56,
  },
  appName: {
    color: COLORS.white,
    fontSize: ResponsiveUtils?.fontSize?.large || 20,
    fontWeight: FONT_WEIGHT.bold,
  },
  subtitle: {
    color: COLORS.white + 'E6',
    fontSize: ResponsiveUtils?.fontSize?.small || 12,
  },
  menuAnchor: {
    paddingRight: ResponsiveUtils?.spacing?.sm || 8,
    paddingVertical: ResponsiveUtils?.spacing?.xs || 4,
  },
  avatar: {
    borderWidth: 2,
    borderColor: COLORS.white + '4D',
  },
  avatarLabel: {
    color: COLORS.white,
    fontSize: ResponsiveUtils?.fontSize?.medium || 16,
    fontWeight: FONT_WEIGHT.bold,
  },
  menuContent: {
    backgroundColor: COLORS.white,
    borderRadius: ResponsiveUtils?.borderRadius?.medium || 8,
    minWidth: 280,
    marginTop: SPACING.sm,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ResponsiveUtils?.spacing?.md || 16,
    backgroundColor: COLORS.background.light,
  },
  menuAvatar: {
    marginRight: ResponsiveUtils?.spacing?.md || 16,
  },
  menuAvatarLabel: {
    color: COLORS.white,
    fontSize: ResponsiveUtils?.fontSize?.medium || 16,
    fontWeight: FONT_WEIGHT.bold,
  },
  menuUserInfo: {
    flex: 1,
  },
  menuUserName: {
    fontSize: ResponsiveUtils?.fontSize?.medium || 16,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: -8,
  },
  menuUserType: {
    fontSize: ResponsiveUtils?.fontSize?.small || 12,
    color: COLORS.text.secondary,
    marginTop: -8,
  },
  menuDivider: {
    marginVertical: 4,
  },
  menuItemTitle: {
    fontSize: ResponsiveUtils?.fontSize?.medium || 16,
    color: COLORS.text.primary,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    marginHorizontal: 20,
    marginTop: 320,
    marginBottom: 160,
    borderRadius: BORDER_RADIUS.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    maxWidth: 400,
    alignSelf: 'center',
    width: '90%',
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: 16,
    color: COLORS.text.primary,
  },
  modalMessage: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: 24,
    color: COLORS.text.secondary,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SPACING.sm,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
  },
  logoutButton: {
    backgroundColor: COLORS.error[500],
  },
  gradientHeader: {
    elevation: ResponsiveUtils?.elevation?.small || 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  transparentHeader: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
});

// Memoized component for performance optimization
const MemoizedUniversalHeader = memo(UniversalHeader);

export default MemoizedUniversalHeader;
