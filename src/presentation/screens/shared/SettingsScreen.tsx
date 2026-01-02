import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Dimensions } from 'react-native';
import {
  Card,
  Text,
  Button,
  List,
  Switch,
  Divider
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@contexts/AuthProvider';
import { ResponsiveUtils } from '@utils/animations';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT, BORDER_WIDTH } from '@presentation/theme/designTokens';
import { getAuthGradient, getAuthCardColors } from '@presentation/theme/authTheme';
import ThemeToggleSwitch from '@components/ThemeToggleSwitch';
import { getString } from '@utils/theme';
import { useTheme } from '@contexts/ThemeContext';
import type { NavigationProp } from '@react-navigation/native';


interface SettingsScreenProps {
  navigation: NavigationProp<any>;
}

/**
 * Tela de configurações
 * Permite ao usuário gerenciar preferências, conta e privacidade
 */
const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const { user, userProfile, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [autoBackup, setAutoBackup] = useState<boolean>(true);

  const handleLogout = (): void => {
    Alert.alert(
      getString('confirmLogout'),
      getString('confirmLogoutMessage'),
      [
        { text: getString('cancel'), style: 'cancel' },
        {
          text: getString('logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert(getString('error'), 'Não foi possível fazer logout');
            }
          }
        }
      ]
    );
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleDataExport = () => {
    Alert.alert('Em Desenvolvimento', 'Funcionalidade de exportação será implementada em breve');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Esta ação é irreversível. Todos os seus dados serão perdidos.',
      [
        { text: getString('cancel'), style: 'cancel' },
        {
          text: getString('delete'),
          style: 'destructive',
          onPress: () => {
            Alert.alert('Em Desenvolvimento', 'Funcionalidade será implementada em breve');
          }
        }
      ]
    );
  };

  return (
    <LinearGradient
      colors={getAuthGradient(isDarkMode) as any}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Informações da Conta */}
          <Card containerStyle={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle" size={24} color={COLORS.info[500]} />
              <Text h4 style={styles.cardTitle}>{getString('account')}</Text>
            </View>

            <List.Item
              title={getString('name')}
              description={userProfile?.name || getString('notInformed')}
              left={(props) => <Ionicons name="person" size={20} color={COLORS.text.secondary} />}
            />

            <List.Item
              title="email"
              description={user?.email}
              left={(props) => <Ionicons name="mail" size={20} color={COLORS.text.secondary} />}
            />

            <List.Item
              title={getString('editProfile')}
              left={(props) => <Ionicons name="create" size={20} color={COLORS.text.secondary} />}
              right={(props) => <List.Icon icon="chevron-right" />}
              onPress={() => navigation.navigate('Profile')}
            />

            <List.Item
              title={getString('changePassword')}
              left={(props) => <Ionicons name="lock-closed" size={20} color={COLORS.text.secondary} />}
              right={(props) => <List.Icon icon="chevron-right" />}
              onPress={handleChangePassword}
            />
          </Card>

          {/* Alternância de Temas */}
          <ThemeToggleSwitch />

          {/* Botão para Ver Demonstração */}
          <Card containerStyle={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="color-palette" size={24} color={COLORS.secondary[500]} />
              <Text h4 style={styles.cardTitle}>{getString('demonstration')}</Text>
            </View>

            <List.Item
              title={getString('viewThemeDemo')}
              description={getString('viewAvailableThemes')}
              left={(props) => <Ionicons name="eye" size={20} color={COLORS.text.secondary} />}
              right={(props) => <List.Icon icon="chevron-right" />}
              onPress={() => navigation.navigate('ThemeDemo')}
            />
          </Card>

          {/* Preferências */}
          <Card containerStyle={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="settings" size={24} color={COLORS.primary[500]} />
              <Text h4 style={styles.cardTitle}>{getString('preferences')}</Text>
            </View>

            <List.Item
              title={getString('notifications')}
              description={getString('receivePushNotifications')}
              left={(props) => <Ionicons name="notifications" size={20} color={COLORS.text.secondary} />}
              right={(props) => (
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: COLORS.gray[600], true: COLORS.info[500] }}
                />
              )}
            />

            <List.Item
              title={getString('darkMode')}
              description={getString('darkModeDescription')}
              left={(props) => <Ionicons name="moon" size={20} color={COLORS.text.secondary} />}
              right={(props) => (
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: COLORS.gray[600], true: COLORS.info[500] }}
                />
              )}
            />

            <List.Item
              title={getString('autoBackup')}
              description={getString('autoBackupDescription')}
              left={(props) => <Ionicons name="cloud-upload" size={20} color={COLORS.text.secondary} />}
              right={(props) => (
                <Switch
                  value={autoBackup}
                  onValueChange={setAutoBackup}
                  trackColor={{ false: COLORS.gray[600], true: COLORS.info[500] }}
                />
              )}
            />
          </Card>

          {/* Dados e Privacidade */}
          <Card containerStyle={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-checkmark" size={24} color={COLORS.warning[500]} />
              <Text h4 style={styles.cardTitle}>{getString('dataAndPrivacy')}</Text>
            </View>

            <List.Item
              title={getString('exportData')}
              description={getString('downloadDataCopy')}
              left={(props) => <Ionicons name="download" size={20} color={COLORS.text.secondary} />}
              right={(props) => <List.Icon icon="chevron-right" />}
              onPress={handleDataExport}
            />

            <List.Item
              title={getString('privacyPolicy')}
              left={(props) => <Ionicons name="document-text" size={20} color={COLORS.text.secondary} />}
              right={(props) => <List.Icon icon="chevron-right" />}
            />

            <List.Item
              title={getString('termsOfUse')}
              left={(props) => <Ionicons name="library" size={20} color={COLORS.text.secondary} />}
              right={(props) => <List.Icon icon="chevron-right" />}
            />
          </Card>

          {/* Sobre */}
          <Card containerStyle={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color={COLORS.secondary[500]} />
              <Text h4 style={styles.cardTitle}>{getString('about')}</Text>
            </View>

            <List.Item
              title="Versão do App"
              description="1.0.0"
              left={(props) => <Ionicons name="apps" size={20} color={COLORS.text.secondary} />}
            />

            <List.Item
              title="Central de Ajuda"
              left={(props) => <Ionicons name="help-circle" size={20} color={COLORS.text.secondary} />}
              right={(props) => <List.Icon icon="chevron-right" />}
            />

            <List.Item
              title="Enviar Feedback"
              left={(props) => <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.text.secondary} />}
              right={(props) => <List.Icon icon="chevron-right" />}
            />
          </Card>

          {/* Ações Perigosas */}
          <Card containerStyle={[styles.card, styles.dangerCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="warning" size={24} color={COLORS.error[500]} />
              <Text h4 style={[styles.cardTitle, styles.dangerTitle]}>{getString('dangerZone')}</Text>
            </View>

            <Button
              mode="contained"
              onPress={handleLogout}
              buttonColor={COLORS.warning[500]}
              textColor={COLORS.white}
              icon={() => <Ionicons name="log-out" size={20} color={COLORS.white} />}
              style={styles.dangerButton}
            >
              {getString('signOut')}
            </Button>

            <Button
              mode="contained"
              onPress={handleDeleteAccount}
              buttonColor={COLORS.error[500]}
              textColor={COLORS.white}
              icon={() => <Ionicons name="trash" size={20} color={COLORS.white} />}
              style={[styles.dangerButton, { marginTop: SPACING.md }]}
            >
              {getString('deleteAccount')}
            </Button>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: ResponsiveUtils?.spacing?.xl || 32,
  },
  card: {
    margin: ResponsiveUtils?.spacing?.md || 16,
    marginTop: ResponsiveUtils?.spacing?.sm || 8,
    maxWidth: ResponsiveUtils?.isTablet?.() ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
    backgroundColor: COLORS.card.default.background,
    borderColor: COLORS.card.default.border,
    borderWidth: BORDER_WIDTH.thin,
    ...Platform.select({
      ios: {},
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: `0 2px 4px ${COLORS.card.default.shadow}`,
      },
    }),
  },
  dangerCard: {
    backgroundColor: COLORS.card.default.background,
    borderColor: COLORS.error[500],
    borderWidth: BORDER_WIDTH.base,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error[500],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ResponsiveUtils?.spacing?.md || 16,
  },
  cardTitle: {
    marginLeft: ResponsiveUtils?.spacing?.sm || 8,
    fontSize: ResponsiveUtils?.fontSize?.large || 18,
  },
  dangerTitle: {
    color: COLORS.error[500],
  },
  dangerButton: {
    borderRadius: ResponsiveUtils?.borderRadius?.medium || 12,
    marginBottom: ResponsiveUtils?.spacing?.sm || 8,
  },
});

export default SettingsScreen;
