import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import {
  Text,
  Button,
  List,
  Switch,
  Divider
} from 'react-native-paper';
import ModernCard from '@components/modern/ModernCard';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthFacade } from '@presentation/auth/AuthFacade';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, FONT_WEIGHT } from '@presentation/theme/designTokens';
import { getAuthGradient } from '@presentation/theme/authTheme';
import ThemeToggleSwitch from '@components/ThemeToggleSwitch';
import { useTheme } from '@contexts/ThemeContext';
import type { NavigationProp } from '@react-navigation/native';

interface SettingsScreenProps {
  navigation: NavigationProp<any>;
}

/**
 * Tela de configurações modernizada com glassmorphism
 * Permite ao usuário gerenciar preferências, conta e privacidade
 */
const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const { user, userProfile, logout } = useAuthFacade();
  const { isDarkMode, getString } = useTheme();
  const [notifications, setNotifications] = useState<boolean>(true);
  const [autoBackup, setAutoBackup] = useState<boolean>(true);

  const handleLogout = (): void => {
    Alert.alert(
      getString('logout'),
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
              Alert.alert(getString('error'), getString('logoutError'));
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
    Alert.alert(getString('inDevelopment'), getString('exportDataDevelopment'));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      getString('deleteAccount'),
      getString('deleteAccountWarning'),
      [
        { text: getString('cancel'), style: 'cancel' },
        {
          text: getString('delete'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(getString('inDevelopment'), getString('deleteAccountDevelopment'));
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
          <ModernCard variant="card" style={styles.card}>
            <View>
              <View style={styles.cardHeader}>
                <Ionicons name="person-circle" size={24} color={COLORS.info[500]} />
                <Text variant="headlineSmall" style={[styles.cardTitle, { color: isDarkMode ? COLORS.white : COLORS.black }]}>
                  {getString('account')}
                </Text>
              </View>

              <List.Item
                title={getString('name')}
                description={userProfile?.name || getString('notInformed')}
                left={() => <Ionicons name="person" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                titleStyle={{ color: isDarkMode ? COLORS.white : COLORS.black }}
                descriptionStyle={{ color: isDarkMode ? COLORS.gray[300] : COLORS.gray[600] }}
              />

              <List.Item
                title={getString('email')}
                description={user?.email}
                left={() => <Ionicons name="mail" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                titleStyle={{ color: isDarkMode ? COLORS.white : COLORS.black }}
                descriptionStyle={{ color: isDarkMode ? COLORS.gray[300] : COLORS.gray[600] }}
              />

              <List.Item
                title={getString('editProfile')}
                left={() => <Ionicons name="create" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                onPress={() => navigation.navigate('Profile')}
                titleStyle={{ color: isDarkMode ? COLORS.white : COLORS.black }}
              />

              <List.Item
                title={getString('changePassword')}
                left={() => <Ionicons name="lock-closed" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                onPress={handleChangePassword}
                titleStyle={{ color: isDarkMode ? COLORS.white : COLORS.black }}
              />
            </View>
          </ModernCard>

          {/* Alternância de Temas */}
          <ThemeToggleSwitch />

          {/* Botão para Ver Demonstração */}
          <ModernCard variant="card" style={styles.card}>
            <View>
              <View style={styles.cardHeader}>
                <Ionicons name="color-palette" size={24} color={COLORS.secondary[500]} />
                <Text variant="headlineSmall" style={[styles.cardTitle, { color: isDarkMode ? COLORS.white : COLORS.black }]}>
                  {getString('demonstration')}
                </Text>
              </View>

              <List.Item
                title={getString('viewThemeDemo')}
                description={getString('viewAvailableThemes')}
                left={() => <Ionicons name="eye" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                onPress={() => navigation.navigate('ThemeDemo')}
                titleStyle={{ color: isDarkMode ? COLORS.white : COLORS.black }}
                descriptionStyle={{ color: isDarkMode ? COLORS.gray[300] : COLORS.gray[600] }}
              />
            </View>
          </ModernCard>

          {/* Preferências */}
          <ModernCard variant="card" style={styles.card}>
            <View>
              <View style={styles.cardHeader}>
                <Ionicons name="settings" size={24} color={COLORS.primary[500]} />
                <Text variant="headlineSmall" style={[styles.cardTitle, { color: isDarkMode ? COLORS.white : COLORS.black }]}>
                  {getString('preferences')}
                </Text>
              </View>

              <List.Item
                title={getString('notifications')}
                description={getString('receivePushNotifications')}
                left={() => <Ionicons name="notifications" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => (
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{ false: COLORS.gray[600], true: COLORS.info[500] }}
                  />
                )}
                titleStyle={{ color: isDarkMode ? COLORS.white : COLORS.black }}
                descriptionStyle={{ color: isDarkMode ? COLORS.gray[300] : COLORS.gray[600] }}
              />

              <List.Item
                title={getString('autoBackup')}
                description={getString('autoBackupDescription')}
                left={() => <Ionicons name="cloud-upload" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => (
                  <Switch
                    value={autoBackup}
                    onValueChange={setAutoBackup}
                    trackColor={{ false: COLORS.gray[600], true: COLORS.info[500] }}
                  />
                )}
                titleStyle={{ color: isDarkMode ? COLORS.white : COLORS.black }}
                descriptionStyle={{ color: isDarkMode ? COLORS.gray[300] : COLORS.gray[600] }}
              />
            </View>
          </ModernCard>

          {/* Dados e Privacidade */}
          <ModernCard variant="card" style={styles.card}>
            <View>
              <View style={styles.cardHeader}>
                <Ionicons name="shield-checkmark" size={24} color={COLORS.warning[500]} />
                <Text variant="headlineSmall" style={[styles.cardTitle, { color: isDarkMode ? COLORS.white : COLORS.black }]}>
                  {getString('dataAndPrivacy')}
                </Text>
              </View>

              <List.Item
                title={getString('exportData')}
                description={getString('downloadDataCopy')}
                left={() => <Ionicons name="download" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                onPress={handleDataExport}
                titleStyle={{ color: isDarkMode ? COLORS.white : COLORS.black }}
                descriptionStyle={{ color: isDarkMode ? COLORS.gray[300] : COLORS.gray[600] }}
              />

              <List.Item
                title={getString('privacyPolicy')}
                left={() => <Ionicons name="document-text" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                titleStyle={{ color: isDarkMode ? COLORS.white : COLORS.black }}
              />

              <List.Item
                title={getString('termsOfUse')}
                left={() => <Ionicons name="library" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                titleStyle={{ color: isDarkMode ? COLORS.white : COLORS.black }}
              />
            </View>
          </ModernCard>

          {/* Sobre */}
          <ModernCard variant="card" style={styles.card}>
            <View>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle" size={24} color={COLORS.secondary[500]} />
                <Text variant="headlineSmall" style={[styles.cardTitle, { color: isDarkMode ? COLORS.white : COLORS.black }]}>
                  {getString('about')}
                </Text>
              </View>

              <List.Item
                title={getString('appVersion')}
                description="1.0.0"
                left={() => <Ionicons name="apps" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                titleStyle={{ color: isDarkMode ? COLORS.white : COLORS.black }}
                descriptionStyle={{ color: isDarkMode ? COLORS.gray[300] : COLORS.gray[600] }}
              />

              <List.Item
                title={getString('helpCenter')}
                left={() => <Ionicons name="help-circle" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                titleStyle={{ color: isDarkMode ? COLORS.white : COLORS.black }}
              />

              <List.Item
                title={getString('sendFeedback')}
                left={() => <Ionicons name="chatbubble-ellipses" size={20} color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                right={() => <List.Icon icon="chevron-right" color={isDarkMode ? COLORS.gray[400] : COLORS.gray[600]} />}
                titleStyle={{ color: isDarkMode ? COLORS.white : COLORS.black }}
              />
            </View>
          </ModernCard>

          {/* Ações Perigosas */}
          <ModernCard variant="card" style={styles.dangerCard}>
            <View>
              <View style={styles.cardHeader}>
                <Ionicons name="warning" size={24} color={COLORS.error[500]} />
                <Text variant="headlineSmall" style={[styles.cardTitle, styles.dangerTitle]}>
                  {getString('dangerZone')}
                </Text>
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
            </View>
          </ModernCard>
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
    paddingBottom: SPACING.xxl,
    paddingHorizontal: SPACING.md,
  },
  card: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  dangerCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error[500],
    marginBottom: SPACING.xxl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  cardTitle: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold as any,
  },
  dangerTitle: {
    color: COLORS.error[500],
  },
  dangerButton: {
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.md,
  },
});

export default SettingsScreen;
